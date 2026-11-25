import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, addDoc, collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { shouldSyncGuestSnapshot } from './utils/bookingProfile';

const AuthContext = createContext(null);

const ADMIN_EMAILS = [
  'nanaamadwamena4@gmail.com',
  'princetetteh963@gmail.com',
  'godwinokro2020@gmail.com'
];

const parseOptionalNumber = (val, isInt = false) => {
  if (val === null || val === undefined || val === '') return null;
  const parsed = isInt ? parseInt(val, 10) : parseFloat(val);
  return Number.isFinite(parsed) ? parsed : null;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const syncingGuestRef = useRef(false);

  // Listen for auth state changes
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((err) =>
      console.error('Auth persistence error:', err)
    );

    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        try {
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const hasAdminClaim = !!idTokenResult.claims.admin;
          const isWhitelisted = ADMIN_EMAILS.includes(firebaseUser.email);
          setIsAdmin(hasAdminClaim || isWhitelisted);
        } catch (err) {
          console.error('Error fetching token claims:', err);
          setIsAdmin(ADMIN_EMAILS.includes(firebaseUser.email));
        }

        if (db) {
          unsubscribeProfile = onSnapshot(
            doc(db, 'users', firebaseUser.uid),
            (docSnap) => {
              setUserProfile(docSnap.exists() ? docSnap.data() : null);
              setLoading(false);
            },
            (err) => {
              console.error('Profile listener error:', err);
              setLoading(false);
            }
          );
        } else {
          setLoading(false);
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // Handle redirect result (for mobile/PWA sign-in fallback)
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          if (result.user.email) {
            localStorage.setItem('lastSignInEmail', result.user.email);
          }
          const redirectUrl = localStorage.getItem('authRedirect');
          if (redirectUrl) {
            localStorage.removeItem('authRedirect');
            if (window.location.pathname !== redirectUrl) {
              window.location.href = redirectUrl;
            }
          }
        }
      })
      .catch((err) => {
        if (err.code !== 'auth/redirect-cancelled-by-user') {
          console.error('Redirect sign-in error:', err);
        }
      });
  }, []);

  // Google sign-in
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    auth.useDeviceLanguage();

    const lastEmail = localStorage.getItem('lastSignInEmail');
    const customParams = {};
    if (lastEmail) {
      customParams.login_hint = lastEmail;
    }
    customParams.prompt = 'select_account';
    provider.setCustomParameters(customParams);

    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user?.email) {
        localStorage.setItem('lastSignInEmail', result.user.email);
      }
      return result.user;
    } catch (err) {
      console.error('Google popup sign-in error:', err);

      if (
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request'
      ) {
        return null;
      }

      if (err.code === 'auth/popup-blocked') {
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

  // Save/update user profile snapshot on users/{uid}
  const saveUserProfile = useCallback(async (profileData, targetUser = null) => {
    const activeUser = targetUser || user;
    if (!activeUser || !db) return null;

    const timestamp = new Date().toISOString();
    const sanitizedData = { ...profileData };

    if ('weight' in sanitizedData) sanitizedData.weight = parseOptionalNumber(sanitizedData.weight);
    if ('height' in sanitizedData) sanitizedData.height = parseOptionalNumber(sanitizedData.height);
    if ('targetWeight' in sanitizedData) sanitizedData.targetWeight = parseOptionalNumber(sanitizedData.targetWeight);
    if ('age' in sanitizedData) sanitizedData.age = parseOptionalNumber(sanitizedData.age, true);
    if ('bmi' in sanitizedData) sanitizedData.bmi = parseOptionalNumber(sanitizedData.bmi);
    if ('bmr' in sanitizedData) sanitizedData.bmr = parseOptionalNumber(sanitizedData.bmr);
    if ('dailyCalories' in sanitizedData) sanitizedData.dailyCalories = parseOptionalNumber(sanitizedData.dailyCalories, true);

    const data = {
      ...sanitizedData,
      email: activeUser.email ? activeUser.email.trim().toLowerCase() : '',
      displayName: activeUser.displayName || '',
      photoURL: activeUser.photoURL || '',
      updatedAt: timestamp
    };

    if (!userProfile?.createdAt && !sanitizedData.createdAt) {
      data.createdAt = timestamp;
    }

    await setDoc(doc(db, 'users', activeUser.uid), data, { merge: true });
    return data;
  }, [user, userProfile]);

  // Save a completed KnowYourBody assessment to users/{uid}/assessments AND update users/{uid}
  const saveAssessment = useCallback(async (snapshot, targetUser = null) => {
    const activeUser = targetUser || user;
    if (!activeUser || !db || !snapshot) return null;

    const timestamp = new Date().toISOString();
    const savedAtKey = snapshot.savedAt || timestamp;

    if (snapshot.savedAt && typeof window !== 'undefined') {
      const syncKey = `${activeUser.uid}:${snapshot.savedAt}`;
      try {
        if (localStorage.getItem('diet_test_results_synced_for') === syncKey) {
          return null;
        }
        localStorage.setItem('diet_test_results_synced_for', syncKey);
      } catch {
        // Ignore storage errors
      }
    }

    const assessmentRecord = {
      bmi: parseOptionalNumber(snapshot.bmi),
      bmiCategory: snapshot.bmiCategory || null,
      bmr: parseOptionalNumber(snapshot.bmr, true),
      dailyCalories: parseOptionalNumber(snapshot.dailyCalories, true),
      macros: snapshot.macros || null,
      weight: parseOptionalNumber(snapshot.weight),
      height: parseOptionalNumber(snapshot.height),
      targetWeight: parseOptionalNumber(snapshot.targetWeight),
      age: parseOptionalNumber(snapshot.age, true),
      gender: snapshot.gender || null,
      goal: snapshot.goal || null,
      activityLevel: snapshot.activityLevel || null,
      sleepHours: snapshot.sleepHours || null,
      dietaryRestrictions: snapshot.dietaryRestrictions || 'None',
      healthConditions: snapshot.healthConditions || '',
      dislikes: snapshot.dislikes || '',
      unitsUsed: snapshot.unitsUsed || 'metric',
      source: snapshot.source || 'knowyourbody',
      clientSavedAt: savedAtKey,
      createdAt: timestamp
    };

    const profileUpdate = {
      weight: assessmentRecord.weight,
      height: assessmentRecord.height,
      bmi: assessmentRecord.bmi,
      bmiCategory: assessmentRecord.bmiCategory,
      bmr: assessmentRecord.bmr,
      dailyCalories: assessmentRecord.dailyCalories,
      macros: assessmentRecord.macros,
      targetWeight: assessmentRecord.targetWeight,
      age: assessmentRecord.age,
      gender: assessmentRecord.gender,
      goal: assessmentRecord.goal,
      activityLevel: assessmentRecord.activityLevel,
      sleepHours: assessmentRecord.sleepHours,
      dietaryRestrictions: assessmentRecord.dietaryRestrictions,
      healthConditions: assessmentRecord.healthConditions,
      dislikes: assessmentRecord.dislikes,
      latestAssessmentAt: timestamp,
      onboardingSkipped: false
    };

    await Promise.all([
      saveUserProfile(profileUpdate, activeUser),
      addDoc(collection(db, 'users', activeUser.uid, 'assessments'), assessmentRecord)
    ]);

    return assessmentRecord;
  }, [user, saveUserProfile]);

  // Automatically sync a recent guest KnowYourBody snapshot once when the user signs in
  useEffect(() => {
    if (!user || !db || syncingGuestRef.current) return;

    try {
      const raw = localStorage.getItem('diet_test_results');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed?.bmi || !parsed?.savedAt) return;

      const syncKey = `${user.uid}:${parsed.savedAt}`;
      const syncedForKey = localStorage.getItem('diet_test_results_synced_for');

      if (!shouldSyncGuestSnapshot(parsed, user.uid, syncedForKey)) return;

      syncingGuestRef.current = true;
      localStorage.setItem('diet_test_results_synced_for', syncKey);

      saveAssessment({ ...parsed, source: 'knowyourbody_guest_sync' }, user)
        .catch((err) => {
          console.warn('Could not sync guest KnowYourBody assessment:', err);
          try {
            localStorage.removeItem('diet_test_results_synced_for');
          } catch {
            // Ignore cleanup failure
          }
        })
        .finally(() => {
          syncingGuestRef.current = false;
        });
    } catch {
      // Ignore malformed localStorage cache
    }
  }, [user, saveAssessment]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAdmin,
        signInWithGoogle,
        signOut: signOutUser,
        saveUserProfile,
        saveAssessment
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
