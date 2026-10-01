import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, getAllowedUser, isAllowedEmail, ALLOWED_USERS } from '../services/firebase';
import { UserProfile, AllowedUser } from '../types';
import { logoutUser, getClientInfo, logActivity } from '../services/authService';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  allowedUser: AllowedUser | null;
  isLoading: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  isAuthorizedAdmin: boolean;
  isLocked: boolean;
  lockSession: () => void;
  unlockSession: (password: string) => Promise<boolean>;
  timeoutMinutes: number;
  setTimeoutMinutes: (min: number) => void;
  showTimeoutWarning: boolean;
  extendSession: () => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  unauthorizedAttempt: string | null;
  clearUnauthorizedAttempt: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [timeoutMinutes, setTimeoutMinutesState] = useState<number>(30);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState<boolean>(false);
  const [unauthorizedAttempt, setUnauthorizedAttempt] = useState<string | null>(null);

  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  const allowedUser = user?.email ? getAllowedUser(user.email) || null : null;

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) {
      setProfile(null);
      return;
    }
    const currentEmail = auth.currentUser.email || '';
    if (!isAllowedEmail(currentEmail)) {
      setUnauthorizedAttempt(currentEmail);
      await logoutUser();
      setUser(null);
      setProfile(null);
      return;
    }

    const matchedAllowed = getAllowedUser(currentEmail);
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      setProfile(data);
      if (data.preferredTimeoutMinutes !== undefined) {
        setTimeoutMinutesState(data.preferredTimeoutMinutes);
      }
    } else if (matchedAllowed) {
      const newProf: UserProfile = {
        uid: auth.currentUser.uid,
        email: currentEmail,
        name: matchedAllowed.name,
        initials: matchedAllowed.initials,
        role: 'admin',
        createdAt: Date.now(),
        lastLogin: Date.now(),
        status: 'active',
        preferredTimeoutMinutes: 30,
      };
      await setDoc(userRef, newProf);
      setProfile(newProf);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser && firebaseUser.email) {
        if (!isAllowedEmail(firebaseUser.email)) {
          setUnauthorizedAttempt(firebaseUser.email);
          await logoutUser();
          setUser(null);
          setProfile(null);
        } else {
          setUser(firebaseUser);
          await refreshProfile();
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [refreshProfile]);

  const setTimeoutMinutes = (min: number) => {
    setTimeoutMinutesState(min);
    if (user && profile) {
      updateDoc(doc(db, 'users', user.uid), { preferredTimeoutMinutes: min }).catch(console.error);
    }
  };

  const lockSession = useCallback(() => {
    setIsLocked(true);
    setShowTimeoutWarning(false);
    if (user?.email) {
      logActivity(
        'SESSION_LOCKED',
        'AetherDrive Screen Locked',
        'Security lock initiated by administrator or timeout',
        user.email,
        profile?.name || 'Admin',
        'security'
      );
    }
  }, [user, profile]);

  const unlockSession = async (password: string): Promise<boolean> => {
    if (!user?.email) return false;
    try {
      await signInWithEmailAndPassword(auth, user.email, password);
      setIsLocked(false);
      lastActivityRef.current = Date.now();
      setShowTimeoutWarning(false);
      logActivity(
        'SESSION_UNLOCKED',
        'AetherDrive Screen Unlocked',
        'Administrator successfully re-authenticated',
        user.email,
        profile?.name || 'Admin',
        'security'
      );
      return true;
    } catch {
      return false;
    }
  };

  const extendSession = () => {
    lastActivityRef.current = Date.now();
    setShowTimeoutWarning(false);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
    setIsLocked(false);
    setShowTimeoutWarning(false);
  };

  const clearUnauthorizedAttempt = () => {
    setUnauthorizedAttempt(null);
  };

  // Activity tracking for automatic session timeout
  const recordUserInteraction = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    const handleEvents = () => recordUserInteraction();
    window.addEventListener('mousemove', handleEvents, { passive: true });
    window.addEventListener('keydown', handleEvents, { passive: true });
    window.addEventListener('click', handleEvents, { passive: true });
    window.addEventListener('touchstart', handleEvents, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleEvents);
      window.removeEventListener('keydown', handleEvents);
      window.removeEventListener('click', handleEvents);
      window.removeEventListener('touchstart', handleEvents);
    };
  }, [recordUserInteraction]);

  // Session timeout interval checker
  useEffect(() => {
    if (!user || timeoutMinutes === 0 || isLocked) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      const elapsedMs = Date.now() - lastActivityRef.current;
      const timeoutMs = timeoutMinutes * 60 * 1000;
      const warningThresholdMs = timeoutMs - 60 * 1000; // 1 min before

      if (elapsedMs >= timeoutMs) {
        lockSession();
      } else if (elapsedMs >= warningThresholdMs && timeoutMinutes > 1) {
        setShowTimeoutWarning(true);
      } else {
        setShowTimeoutWarning(false);
      }
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user, timeoutMinutes, isLocked, lockSession]);

  const isAuthenticated = !!user && !!profile;
  const isAuthorizedAdmin = !!user?.email && isAllowedEmail(user.email);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        allowedUser,
        isLoading,
        loading: isLoading,
        isAuthenticated,
        isAuthorizedAdmin,
        isLocked,
        lockSession,
        unlockSession,
        timeoutMinutes,
        setTimeoutMinutes,
        showTimeoutWarning,
        extendSession,
        logout,
        refreshProfile,
        unauthorizedAttempt,
        clearUnauthorizedAttempt,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
