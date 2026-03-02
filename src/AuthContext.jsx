import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, getDocs, setDoc, addDoc, collection, onSnapshot, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { BADGE_DEFINITIONS } from './constants/badges';
import { AnimatePresence, motion } from 'framer-motion';
import { FiAward, FiX, FiShare2 } from 'react-icons/fi';
import AchievementShareCard from './Components/AchievementShareCard';

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
  const [notification, setNotification] = useState(null);
  const [sharingBadge, setSharingBadge] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    let unsubscribeProfile = null;
    
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);
      
      // Clear existing listener if any
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        // Silent newsletter sync
        const emailSyncKey = `newsletter_synced_${firebaseUser.uid}`;
        if (!localStorage.getItem(emailSyncKey) && firebaseUser.email) {
          import('./firebaseUtils').then(({ saveEmailToFirestore }) => {
            saveEmailToFirestore(firebaseUser.email)
              .then(() => localStorage.setItem(emailSyncKey, 'true'))
              .catch(() => {});
          });
        }

        // Real-time profile listener
        unsubscribeProfile = onSnapshot(doc(db, 'users', firebaseUser.uid), (doc) => {
          setUserProfile(doc.exists() ? doc.data() : null);
          setLoading(false);
        }, (err) => {
          console.error('Profile listener error:', err);
          setLoading(false);
        });
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
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

  // Check if user has hit the daily limit of 4 logs
  const checkDailyLogLimit = async (uid) => {
    try {
      // Get the start and end of the current day
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Convert to strings if stored as ISO strings, or use Timestamp if stored as Timestamps
      // We are comparing ISO strings based on how loggedAt is saved below
      const logsRef = collection(db, 'users', uid, 'logs');
      const q = query(
        logsRef,
        where('loggedAt', '>=', startOfDay.toISOString()),
        where('loggedAt', '<=', endOfDay.toISOString())
      );

      const snapshot = await getDocs(q);
      const todaysLogCount = snapshot.size;

      if (todaysLogCount >= 4) {
        return false; // Limit reached
      }
      return true; // OK to log
    } catch (err) {
      console.error('Error checking daily log limit:', err);
      return true; // Fail open to not block users on error
    }
  };

  // Save user profile to Firestore + append a log entry for historical tracking
  const saveUserProfile = async (profileData, isManualLog = false) => {
    if (!user) return;
    const timestamp = new Date().toISOString();
    
    // Sanitize numeric inputs (ensure they are numbers or null)
    const sanitizedData = { ...profileData };
    if (sanitizedData.weight) sanitizedData.weight = parseFloat(sanitizedData.weight);
    if (sanitizedData.height) sanitizedData.height = parseFloat(sanitizedData.height);
    if (sanitizedData.age) sanitizedData.age = parseInt(sanitizedData.age, 10);

    const data = {
      ...sanitizedData,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      updatedAt: timestamp,
    };

    try {
      // Save / update the main profile document
      await setDoc(doc(db, 'users', user.uid), data, { merge: true });

      // LOG POLLUTION FIX: 
      // Only append a log entry if weight or height changed, or if explicitly requested (isManualLog)
      const weightChanged = sanitizedData.weight && sanitizedData.weight !== userProfile?.weight;
      const heightChanged = sanitizedData.height && sanitizedData.height !== userProfile?.height;
      const goalChanged = sanitizedData.goal && sanitizedData.goal !== userProfile?.goal;

      // Ensure we only check the limit if we are actually going to log something
      if (isManualLog || weightChanged || heightChanged || goalChanged) {
        const canLog = await checkDailyLogLimit(user.uid);
        
        if (!canLog) {
          throw new Error('DAILY_LOG_LIMIT_REACHED');
        }

        await addDoc(collection(db, 'users', user.uid, 'logs'), {
          weight: sanitizedData.weight || userProfile?.weight || null,
          height: sanitizedData.height || userProfile?.height || null,
          goal: sanitizedData.goal || userProfile?.goal || null,
          loggedAt: profileData.loggedAt || timestamp, // Support historical backfilling
        });
      }

      // Profile state updates via onSnapshot automatically, 
      // but we return the sanitized data for immediate UI feedback if needed
      
      // CHECK FOR NEW ACHIEVEMENTS
      try {
        const logsRef = collection(db, 'users', user.uid, 'logs');
        const logsSnap = await getDocs(logsRef);
        const logCount = logsSnap.size;
        
        const earnedIds = BADGE_DEFINITIONS
          .filter(b => b.check(data, logCount))
          .map(b => b.id);
          
        const previouslySeen = userProfile?.seenAchievements || [];
        const newlyEarned = earnedIds.filter(id => !previouslySeen.includes(id));
        
        if (newlyEarned.length > 0) {
          const latestBadge = BADGE_DEFINITIONS.find(b => b.id === newlyEarned[0]);
          setNotification({
            type: 'achievement',
            title: 'Achievement Unlocked!',
            message: latestBadge.title,
            emoji: latestBadge.emoji,
            badgeId: latestBadge.id
          });
          
          // Mark as seen in Firestore
          await updateDoc(doc(db, 'users', user.uid), {
            seenAchievements: [...previouslySeen, ...newlyEarned]
          });
        }
      } catch (achErr) {
        console.error('Achievement check failed:', achErr);
      }

      return data;
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
      setNotification,
    }}>
      {children}
      
      {/* Global Achievement Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] w-[90%] max-w-sm"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-5 border-2 border-green-500 flex items-center gap-5 relative">
               <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg flex-shrink-0">
                 {notification.emoji}
               </div>
               
               <div className="flex-1 min-w-0">
                 <h4 className="text-green-600 font-black text-sm uppercase tracking-wider mb-1">
                   {notification.title}
                 </h4>
                 <p className="text-gray-800 font-bold text-lg truncate">
                   {notification.message}
                 </p>
                 <button
                   onClick={() => {
                     const badge = BADGE_DEFINITIONS.find(b => b.id === notification.badgeId);
                     setSharingBadge(badge);
                   }}
                   className="mt-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#F6841F] hover:text-orange-600 transition-colors"
                 >
                   <FiShare2 size={12} /> Share Progress
                 </button>
               </div>
               
               <button 
                 onClick={() => setNotification(null)}
                 className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
               >
                 <FiX size={20} />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invisible Share Card Generator */}
      {sharingBadge && (
        <AchievementShareCard
          badge={sharingBadge}
          userName={user.displayName?.split(' ')[0] || 'there'}
          date={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          onComplete={() => setSharingBadge(null)}
        />
      )}
    </AuthContext.Provider>
  );
};
