import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updateProfile, 
  User as FirebaseUser 
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { PlayerState, LeaderboardEntry } from './types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore (handling custom databaseId if configured)
const configObj = firebaseConfig as Record<string, string>;
export const db = configObj.firestoreDatabaseId
  ? getFirestore(app, configObj.firestoreDatabaseId)
  : getFirestore(app);

// Ensure anonymous authentication for seamless cloud database storage
export const initAuth = (onUserAuthenticated?: (user: FirebaseUser) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (onUserAuthenticated) onUserAuthenticated(user);
    } else {
      try {
        const cred = await signInAnonymously(auth);
        if (onUserAuthenticated && cred.user) {
          onUserAuthenticated(cred.user);
        }
      } catch (err) {
        console.warn('Firebase anonymous auth warning:', err);
      }
    }
  });
};

// Sign up new user with Email and Password
export const signUpUser = async (
  email: string, 
  pass: string, 
  displayName: string,
  currentState?: PlayerState
): Promise<{ user: FirebaseUser; state: PlayerState | null }> => {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && cred.user) {
    await updateProfile(cred.user, { displayName });
  }

  let finalState: PlayerState | null = null;
  if (currentState) {
    finalState = { ...currentState, name: displayName || currentState.name };
    await savePlayerStateToCloud(cred.user.uid, finalState);
  } else {
    finalState = await loadPlayerStateFromCloud(cred.user.uid);
  }

  return { user: cred.user, state: finalState };
};

// Sign in existing user
export const signInUser = async (
  email: string, 
  pass: string
): Promise<{ user: FirebaseUser; state: PlayerState | null }> => {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  const cloudState = await loadPlayerStateFromCloud(cred.user.uid);
  return { user: cred.user, state: cloudState };
};

// Sign out user and revert back to anonymous
export const signOutUser = async () => {
  await signOut(auth);
  // Re-authenticate anonymously so Firestore database ops keep working
  try {
    await signInAnonymously(auth);
  } catch (err) {
    console.warn('Post-logout anonymous auth error:', err);
  }
};

// Send password reset email
export const resetUserPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

// Cloud Firestore Sync: Player State
export const savePlayerStateToCloud = async (userId: string, state: PlayerState) => {
  if (!userId) return;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...state,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving player state to Firestore:', err);
  }
};

export const loadPlayerStateFromCloud = async (userId: string): Promise<PlayerState | null> => {
  if (!userId) return null;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as PlayerState;
    }
  } catch (err) {
    console.warn('Error loading player state from Firestore:', err);
  }
  return null;
};

// Cloud Firestore Sync: Global Leaderboard
export const saveScoreToCloudLeaderboard = async (
  userId: string,
  entry: LeaderboardEntry
) => {
  if (!userId) return;
  try {
    const entryRef = doc(db, 'leaderboard', userId);
    await setDoc(entryRef, {
      userId,
      name: entry.name,
      score: entry.score,
      level: entry.level,
      avatar: entry.avatar,
      flag: entry.flag,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving score to cloud leaderboard:', err);
  }
};

export const subscribeCloudLeaderboard = (
  onUpdate: (entries: LeaderboardEntry[]) => void
) => {
  try {
    const leaderboardRef = collection(db, 'leaderboard');
    const q = query(leaderboardRef, orderBy('score', 'desc'), limit(25));
    return onSnapshot(q, (snapshot) => {
      const currentUserId = auth.currentUser?.uid;
      const cloudEntries: LeaderboardEntry[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || 'Jugador',
          score: data.score || 0,
          level: data.level || 1,
          avatar: data.avatar || '⭐',
          flag: data.flag || '🌐',
          date: 'Hoy',
          isUser: docSnap.id === currentUserId
        };
      });
      if (cloudEntries.length > 0) {
        onUpdate(cloudEntries);
      }
    }, (err) => {
      console.warn('Error reading cloud leaderboard:', err);
    });
  } catch (err) {
    console.warn('Leaderboard subscription error:', err);
    return () => {};
  }
};
