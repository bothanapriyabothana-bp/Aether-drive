import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db, ALLOWED_USERS, isAllowedEmail, getAllowedUser } from './firebase';
import { UserProfile, SecuritySession, ActivityAction } from '../types';

export function getClientInfo() {
  const ua = navigator.userAgent;
  let browser = 'Unknown Browser';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';

  let os = 'Unknown OS';
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  const device = `${browser} on ${os}`;
  return { browser, os, device, ip: '127.0.0.1 (Local Verified)' };
}

export async function logActivity(
  action: ActivityAction,
  title: string,
  details: string,
  userEmail: string,
  userName: string,
  category: 'auth' | 'file' | 'security' | 'user' | 'admin' = 'auth',
  status: 'success' | 'warning' | 'error' = 'success',
  meta?: { fileId?: string; fileName?: string }
) {
  try {
    const client = getClientInfo();
    await addDoc(collection(db, 'activityLogs'), {
      action,
      title,
      details,
      userEmail,
      userName,
      timestamp: Date.now(),
      ipOrDevice: client.device,
      category,
      status,
      fileId: meta?.fileId || null,
      fileName: meta?.fileName || null,
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

export async function loginWithEmail(email: string, pass: string, rememberMe: boolean = true) {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Strict Allowlist Check
  if (!isAllowedEmail(cleanEmail)) {
    // Log unauthorized attempt if possible
    logActivity(
      'LOGIN',
      'Unauthorized Login Blocked',
      `Denied attempt for unauthorized email: ${cleanEmail}`,
      cleanEmail,
      'Unauthorized Entity',
      'security',
      'error'
    );
    throw new Error('Access denied. This account is not authorized to use AetherDrive.');
  }

  const allowedUser = getAllowedUser(cleanEmail)!;
  let userCredential;

  try {
    userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
  } catch (err: any) {
    // If account doesn't exist yet in Firebase Auth, create it for the allowed administrator
    if (
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/invalid-login-credentials'
    ) {
      try {
        userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      } catch (createErr: any) {
        // If create failed with email already in use, then it was a wrong password
        if (createErr.code === 'auth/email-already-in-use') {
          throw new Error('Incorrect password. Please verify and try again.');
        }
        throw new Error(createErr.message || 'Authentication failed.');
      }
    } else if (err.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else {
      throw new Error(err.message || 'Failed to sign in.');
    }
  }

  const user = userCredential.user;
  const client = getClientInfo();

  // 2. Fetch or initialize Firestore user profile
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  let profile: UserProfile;
  if (!userSnap.exists()) {
    profile = {
      uid: user.uid,
      email: cleanEmail,
      name: allowedUser.name,
      initials: allowedUser.initials,
      role: 'admin',
      createdAt: Date.now(),
      lastLogin: Date.now(),
      status: 'active',
      preferredTimeoutMinutes: 30,
    };
    await setDoc(userRef, profile);
  } else {
    profile = userSnap.data() as UserProfile;
    // Enforce name & initials
    profile.name = allowedUser.name;
    profile.initials = allowedUser.initials;
    profile.role = 'admin';
    profile.lastLogin = Date.now();
    await updateDoc(userRef, {
      lastLogin: Date.now(),
      name: allowedUser.name,
      initials: allowedUser.initials,
      role: 'admin',
    });
  }

  // 3. Register Session in Firestore
  const sessionData = {
    userEmail: cleanEmail,
    userName: allowedUser.name,
    device: client.device,
    browser: client.browser,
    os: client.os,
    ip: client.ip,
    loginTime: Date.now(),
    lastActiveTime: Date.now(),
    isCurrent: true,
    status: 'active',
  };
  await addDoc(collection(db, 'sessions'), sessionData);

  // 4. Log activity
  await logActivity(
    'LOGIN',
    'Administrator Signed In',
    `Authenticated session initialized for ${allowedUser.name} (${cleanEmail})`,
    cleanEmail,
    allowedUser.name,
    'auth',
    'success'
  );

  return { user, profile };
}

export async function switchUserAccount(targetEmail: string, targetPassword: string) {
  const cleanTarget = targetEmail.trim().toLowerCase();
  if (!isAllowedEmail(cleanTarget)) {
    throw new Error('Access denied. Target account is not authorized to use AetherDrive.');
  }

  // Current session logout
  const currentUser = auth.currentUser;
  if (currentUser) {
    await logActivity(
      'USER_SWITCHED',
      'Session Switched Out',
      `Switched away from ${currentUser.email} to ${cleanTarget}`,
      currentUser.email || '',
      currentUser.displayName || 'Administrator',
      'auth'
    );
  }

  // Authenticate the target account with credentials
  return await loginWithEmail(cleanTarget, targetPassword);
}

export async function logoutUser() {
  const currentUser = auth.currentUser;
  if (currentUser) {
    await logActivity(
      'LOGOUT',
      'Administrator Signed Out',
      `Session ended for ${currentUser.email}`,
      currentUser.email || '',
      currentUser.displayName || 'Admin',
      'auth'
    );
  }
  await signOut(auth);
}

export async function requestPasswordReset(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (!isAllowedEmail(cleanEmail)) {
    throw new Error('Access denied. This email is not authorized for AetherDrive.');
  }
  await sendPasswordResetEmail(auth, cleanEmail);
  await logActivity(
    'PASSWORD_CHANGED',
    'Password Reset Requested',
    `Password reset link dispatched to ${cleanEmail}`,
    cleanEmail,
    getAllowedUser(cleanEmail)?.name || 'Admin',
    'security'
  );
}

export async function deleteUserAccount(
  targetEmail: string,
  reauthPassword?: string
) {
  const cleanEmail = targetEmail.trim().toLowerCase();

  // 1. Enforce Last Remaining Admin Rule
  // Check active users in Firestore or allowed list
  const usersSnap = await getDocs(collection(db, 'users'));
  const activeProfiles = usersSnap.docs
    .map((d) => d.data() as UserProfile)
    .filter((u) => u.status === 'active');

  // If there is only 1 active administrator left, prevent deletion!
  if (activeProfiles.length <= 1) {
    throw new Error(
      'Cannot delete the final administrator. At least one administrator must remain active.'
    );
  }

  // Re-authenticate if deleting self
  const currentUser = auth.currentUser;
  if (currentUser && currentUser.email?.toLowerCase() === cleanEmail && reauthPassword) {
    const cred = EmailAuthProvider.credential(cleanEmail, reauthPassword);
    await reauthenticateWithCredential(currentUser, cred);
  }

  // Find doc ID for target user
  const userQuery = query(collection(db, 'users'), where('email', '==', cleanEmail));
  const userDocs = await getDocs(userQuery);

  for (const uDoc of userDocs.docs) {
    await deleteDoc(doc(db, 'users', uDoc.id));
  }

  // Delete user's sessions
  const sessionsQuery = query(collection(db, 'sessions'), where('userEmail', '==', cleanEmail));
  const sessionDocs = await getDocs(sessionsQuery);
  for (const sDoc of sessionDocs.docs) {
    await deleteDoc(doc(db, 'sessions', sDoc.id));
  }

  // Delete user's files and versions metadata
  const filesQuery = query(collection(db, 'files'), where('ownerEmail', '==', cleanEmail));
  const fileDocs = await getDocs(filesQuery);
  for (const fDoc of fileDocs.docs) {
    await deleteDoc(doc(db, 'files', fDoc.id));
  }

  await logActivity(
    'USER_DELETED',
    'Administrator Account Removed',
    `Account ${cleanEmail} and all personal data records were purged.`,
    currentUser?.email || 'System',
    currentUser?.displayName || 'System Admin',
    'admin',
    'warning'
  );

  // If current logged-in user was deleted, sign out
  if (currentUser && currentUser.email?.toLowerCase() === cleanEmail) {
    try {
      await currentUser.delete();
    } catch {
      await signOut(auth);
    }
  }
}
