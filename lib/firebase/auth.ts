import { auth } from '@/lib/firebase/config';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { User, Role } from '@/types';

export const DEMO_USERS: Record<string, { name: string; role: Role; password: string }> = {
  'admin@gmail.com': {
    name: 'Admin',
    role: 'admin',
    password: 'admin123',
  },
  'manager@gajagamini.com': {
    name: 'Tenzin Norgay (Manager)',
    role: 'manager',
    password: 'demo1234',
  },
};

const isRealFirebaseAuth = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'demo-api-key'
  );
};

export const signInUser = async (email: string, pass: string): Promise<User> => {
  const cleanEmail = email.toLowerCase().trim();
  
  // First check if it's one of the built-in demo accounts
  if (DEMO_USERS[cleanEmail]) {
    const demo = DEMO_USERS[cleanEmail];
    if (pass === demo.password || !isRealFirebaseAuth()) {
      const user: User = {
        id: `demo-${demo.role}`,
        name: demo.name,
        email: cleanEmail,
        role: demo.role,
      };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('hfm-auth-session', JSON.stringify(user));
      }
      return user;
    }
  }

  // Attempt real Firebase Authentication if configured
  if (isRealFirebaseAuth() && auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const role: Role = cleanEmail.includes('admin') ? 'admin' : 'manager';
      const user: User = {
        id: cred.user.uid,
        name: cred.user.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        role,
      };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('hfm-auth-session', JSON.stringify(user));
      }
      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Authentication failed. Check your email and password.');
    }
  }

  // Fallback if demo password didn't match and real auth not enabled
  throw new Error('Invalid email or password. Use admin credentials: admin@gmail.com / admin123');
};

export const signOutUser = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('hfm-auth-session');
  }
  if (isRealFirebaseAuth() && auth) {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase sign out error:', e);
    }
  }
};

export const getStoredSession = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem('hfm-auth-session');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse stored session:', e);
  }
  // Default to null if not logged in
  return null;
};

export const updateCredentials = async (email: string, currentPass: string, newPass?: string): Promise<void> => {
  if (isRealFirebaseAuth() && auth?.currentUser) {
    const { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } = await import('firebase/auth');
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email || '', currentPass);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      if (email && email !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, email);
      }
      
      if (newPass) {
        await updatePassword(auth.currentUser, newPass);
      }
      
      const session = getStoredSession();
      if (session && typeof window !== 'undefined') {
        window.localStorage.setItem('hfm-auth-session', JSON.stringify({ ...session, email }));
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update credentials. Please verify your current password.');
    }
  } else {
    // Mock update for demo users
    const session = getStoredSession();
    if (session && typeof window !== 'undefined') {
      window.localStorage.setItem('hfm-auth-session', JSON.stringify({ ...session, email }));
    }
  }
};
