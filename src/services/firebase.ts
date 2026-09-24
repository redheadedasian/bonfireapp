import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { BonfireUser, FirebaseConfigCustom } from '../types/auth';

const FIREBASE_CONFIG_KEY = 'bonfire_firebase_custom_config';

export function getCustomFirebaseConfig(): FirebaseConfigCustom | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCustomFirebaseConfig(config: FirebaseConfigCustom | null): void {
  if (typeof window === 'undefined') return;
  if (config) {
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
  } else {
    localStorage.removeItem(FIREBASE_CONFIG_KEY);
  }
}

export function getEffectiveFirebaseConfig(): FirebaseConfigCustom | null {
  const custom = getCustomFirebaseConfig();
  if (custom && custom.apiKey && custom.projectId) {
    return custom;
  }

  const env = (import.meta as any).env || {};
  if (env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || `${env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: env.VITE_FIREBASE_APP_ID || ''
    };
  }

  return null;
}

export function isFirebaseConfigured(): boolean {
  return Boolean(getEffectiveFirebaseConfig());
}

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firestoreDb: Firestore | null = null;

export function getFirebaseAppInstance(): FirebaseApp | null {
  if (firebaseApp) return firebaseApp;
  const config = getEffectiveFirebaseConfig();
  if (!config) return null;

  try {
    if (getApps().length > 0) {
      firebaseApp = getApp();
    } else {
      firebaseApp = initializeApp(config);
    }
    return firebaseApp;
  } catch (err) {
    console.error('[Bonfire Firebase] Initialization error:', err);
    return null;
  }
}

export function getFirebaseAuth(): Auth | null {
  if (firebaseAuth) return firebaseAuth;
  const app = getFirebaseAppInstance();
  if (!app) return null;
  try {
    firebaseAuth = getAuth(app);
    return firebaseAuth;
  } catch (err) {
    console.error('[Bonfire Firebase] Auth initialization error:', err);
    return null;
  }
}

export function getFirebaseFirestore(): Firestore | null {
  if (firestoreDb) return firestoreDb;
  const app = getFirebaseAppInstance();
  if (!app) return null;
  try {
    firestoreDb = getFirestore(app);
    return firestoreDb;
  } catch (err) {
    console.error('[Bonfire Firebase] Firestore initialization error:', err);
    return null;
  }
}

export function mapFirebaseUser(user: User | null): BonfireUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Hero'),
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
    providerId: user.providerData?.[0]?.providerId || 'password'
  };
}

export async function loginWithGoogle(): Promise<BonfireUser> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase is not configured. Please enter your Firebase configuration in Settings.');
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const user = mapFirebaseUser(result.user);
  if (!user) throw new Error('Failed to retrieve user profile from Google sign-in.');
  return user;
}

export async function loginWithEmail(email: string, pass: string): Promise<BonfireUser> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase is not configured. Please enter your Firebase configuration in Settings.');
  }
  const result = await signInWithEmailAndPassword(auth, email, pass);
  const user = mapFirebaseUser(result.user);
  if (!user) throw new Error('Failed to retrieve user profile.');
  return user;
}

export async function registerWithEmail(email: string, pass: string): Promise<BonfireUser> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase is not configured. Please enter your Firebase configuration in Settings.');
  }
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  const user = mapFirebaseUser(result.user);
  if (!user) throw new Error('Failed to create account.');
  return user;
}

export async function logoutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) {
    await fbSignOut(auth);
  }
}

export function subscribeToAuthChanges(callback: (user: BonfireUser | null) => void): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return fbOnAuthStateChanged(auth, (fbUser) => {
    callback(mapFirebaseUser(fbUser));
  });
}
