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
      // Ensure we are in a loading state while fetching user profile
      setLoading(true);
      setUser(firebaseUser);
      if (firebaseUser) {
        // Automatically add every signed-in user to the newsletter list (silent fire-and-forget)
        try {
          // Prevent hitting the database on every single page refresh using standard local caching
          const emailSyncKey = `newsletter_synced_${firebaseUser.uid}`;
          if (!localStorage.getItem(emailSyncKey) && firebaseUser.email) {
            import('./firebaseUtils').then(({ saveEmailToFirestore }) => {
              saveEmailToFirestore(firebaseUser.email)
                .then(() => localStorage.setItem(emailSyncKey, 'true'))
                .catch((e) => console.warn('Silent newsletter sync skipped:', e));
            });
          }
        } catch (e) {
          console.warn('Silent newsletter sync error', e);
        }

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
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          const redirectUrl = localStorage.getItem('authRedirect');
          if (redirectUrl) {
            localStorage.removeItem('authRedirect');
            // If the redirectUrl is not the current page, redirect
            if (window.location.pathname !== redirectUrl) {
              window.location.href = redirectUrl;
            }
          }
        }
      })
      .catch((err) => {
        if (err.code !== 'auth/redirect-cancelled-by-user') {
          console.error('Redirect sign-in error:', err);
          // Alert the error so mobile users can see it
          alert(`Redirect Error: ${err.message || err.code}`);
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
      // First try popup - it generally works better without leaving the page
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (err) {
      console.error('Google popup sign-in error:', err);

      // If popup is blocked by mobile browser, fallback smoothly to redirect
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        if (typeof window !== 'undefined') {
          localStorage.setItem('authRedirect', window.location.pathname + window.location.search);
        }
        await signInWithRedirect(auth, provider);
        return null;
      }

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
