import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseConfigData from '../../firebase-applet-config.json';
import { AllowedUser } from '../types';

export const ALLOWED_USERS: AllowedUser[] = [
  {
    name: 'ABISHEK',
    email: 'kcabishiekkumar@gmail.com',
    initials: 'AK',
    role: 'admin',
    defaultPasswordHint: 'Aether@Admin2026',
  },
  {
    name: 'BOTHANA',
    email: 'bothanapriyabothana@gmail.com',
    initials: 'BP',
    role: 'admin',
    defaultPasswordHint: 'Aether@Admin2026',
  },
];

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ALLOWED_USERS.some((u) => u.email.toLowerCase() === normalized);
}

export function getAllowedUser(email: string | null | undefined): AllowedUser | undefined {
  if (!email) return undefined;
  const normalized = email.trim().toLowerCase();
  return ALLOWED_USERS.find((u) => u.email.toLowerCase() === normalized);
}

const firebaseConfig = {
  projectId: firebaseConfigData.projectId,
  appId: firebaseConfigData.appId,
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);

// Use custom firestoreDatabaseId if configured in the applet config
export const db: Firestore = firebaseConfigData.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

export const storage: FirebaseStorage = getStorage(app);

export { app };
