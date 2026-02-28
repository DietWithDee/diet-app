import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

const AuthContext = createContext(null);

const ADMIN_EMAILS = [
  'nanaamadwamena4@gmail.com',
  'princetetteh963@gmail.com',
  'godwinokro2020@gmail.com'
];

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Try to load existing profile from Firestore
        try {
          const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileDoc.exists()) {
            setUserProfile(profileDoc.data());
          } else {
            setUserProfile(null);
          }
        } catch (err) {
          console.error('Error loading user profile:', err);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle redirect result (for mobile sign-in)
  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      if (err.code !== 'auth/redirect-cancelled-by-user') {
        console.error('Redirect sign-in error:', err);
      }
    });
  }, []);

  // Google sign-in
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    auth.useDeviceLanguage();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      // Direct redirect is the most bulletproof method across all mobile browsers
      await signInWithRedirect(auth, provider);
      return null;
    } catch (err) {
      console.error('Google sign-in error:', err);
      throw err;
    }
  };

  // Sign out
  const signOutUser = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  // Save user profile to Firestore + append a log entry for historical tracking
  const saveUserProfile = async (profileData) => {
    if (!user) return;
    const timestamp = new Date().toISOString();
    const data = {
      ...profileData,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      updatedAt: timestamp,
    };
    try {
      // Save / update the main profile document
      await setDoc(doc(db, 'users', user.uid), data, { merge: true });
      setUserProfile(data);

      // Also append a timestamped log entry for charting history
      await addDoc(collection(db, 'users', user.uid, 'logs'), {
        weight: profileData.weight || null,
        height: profileData.height || null,
        goal: profileData.goal || null,
        loggedAt: timestamp,
      });
    } catch (err) {
      console.error('Error saving profile:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      isAdmin: user ? ADMIN_EMAILS.includes(user.email) : false,
      signInWithGoogle,
      signOut: signOutUser,
      saveUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
