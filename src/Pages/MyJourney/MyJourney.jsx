import React, { useState } from 'react';
import SEO from '../../Components/SEO';
import { useNavigate } from 'react-router';
import { FiTrendingUp, FiSettings, FiBookOpen, FiStar, FiLogOut, FiEdit2 } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JourneyHero from '../../assets/journey_glossy.webp';
import { useAuth } from '../../AuthContext';
import OnboardingModal from '../../Components/OnboardingModal';

/*
 * ========================================================================
 *  MY JOURNEY — FUTURE PAGE LAYOUT (once fully built)
 * ========================================================================
 *  1. BMI / Weight Progress Chart  (first thing the user sees)
 *  2. Plan Recommendations
 *  3. Recommended Reads  (curated blog articles)
 *  4. Achievements & Badges
 *  5. Account Settings
 * ========================================================================
 */

function MyJourney() {
  const navigate = useNavigate();
  const { user, userProfile, loading, signInWithGoogle, signOut, saveUserProfile } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const upcomingFeatures = [
    {
      icon: <FiTrendingUp size={28} />,
      title: 'Track Your Progress',
      description:
        'Monitor your wellness milestones, weight goals, and daily nutrition intake with beautiful charts and insights.',
    },
    {
      icon: <FiSettings size={28} />,
      title: 'Manage Your Settings',
      description:
        'Customize your dietary preferences, notification schedules, and personal profile all in one place.',
    },
    {
      icon: <FiBookOpen size={28} />,
      title: 'Curated Content',
      description:
        'Access hand-picked articles, meal plans, and expert tips tailored to your unique health goals.',
    },
    {
      icon: <FiStar size={28} />,
      title: 'Achievements & Rewards',
      description:
        'Earn badges and celebrate milestones as you stay consistent on your wellness journey.',
    },
  ];

  // Animation Variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 50, damping: 15 }
    }
  };

  const subtleZoom = {
    hidden: { scale: 1, opacity: 0 },
    show: {
      scale: 1,
      opacity: 1,
      transition: { duration: 1.5, ease: "easeOut" }
    }
  };

  const handleGetStarted = async () => {
    setSigningIn(true);
    try {
      const userResult = await signInWithGoogle();
      if (userResult) {
        // Popup succeeded — show onboarding after state settles
        setTimeout(() => {
          setShowOnboarding(true);
          setSigningIn(false);
        }, 500);
      }
      // If null, redirect might be happening, or user closed popup.
      if (!userResult) {
        setSigningIn(false);
      }
    } catch (err) {
      console.error('Sign-in failed:', err);
      setSigningIn(false);
      if (err.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        alert(`Security Block: The domain "${domain}" is not authorized for Google Sign-In yet.\n\nPlease add "${domain}" to your Firebase Console -> Authentication -> Settings -> Authorized Domains.`);
      } else if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        alert(`Sign in unavailable: ${err.message || 'Please try again later.'}`);
      }
    }
  };

  const handleOnboardingSave = async (formData) => {
    try {
      await saveUserProfile(formData);
      setShowOnboarding(false);
      setEditMode(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  // Open edit mode (reopen onboarding with existing data)
  const handleUpdateInfo = () => {
    setEditMode(true);
    setShowOnboarding(true);
  };

  // Calculate BMI & calories from stored profile, then navigate to booking
  const handleBookConsultation = () => {
    if (!userProfile) return;
    const h = parseFloat(userProfile.height) / 100; // cm → m
    const w = parseFloat(userProfile.weight);
    const age = parseFloat(userProfile.age);
    const bmi = Math.round((w / (h * h)) * 10) / 10;
    let bmiCategory = '';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi < 25) bmiCategory = 'Normal Weight';
    else if (bmi < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';

    const genderFactor = userProfile.gender === 'male' ? 5 : -161;
    const bmr = 10 * w + 6.25 * parseFloat(userProfile.height) - 5 * age + genderFactor;
    const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
    const tdee = bmr * (activityMultipliers[userProfile.activityLevel] || 1.2);
    let goalCalories = tdee;
    if (userProfile.goal === 'lose') goalCalories = tdee - 500;
    else if (userProfile.goal === 'gain') goalCalories = tdee + 500;
    const macros = {
      protein: Math.round((goalCalories * 0.3) / 4),
      carbs: Math.round((goalCalories * 0.4) / 4),
      fats: Math.round((goalCalories * 0.3) / 9),
    };

    navigate('/contactUs', {
      state: {
        userResults: {
          bmi,
          bmiCategory,
          dailyCalories: Math.round(goalCalories),
          goal: goalLabel(userProfile.goal),
          dietaryRestrictions: userProfile.dietaryRestrictions,
          macros,
          activityLevel: userProfile.activityLevel,
          sleepHours: userProfile.sleepHours,
          healthConditions: userProfile.healthConditions,
          dislikes: userProfile.dislikes,
        },
      },
    });
  };

  // Show onboarding if user is logged in, has no profile, and hasn't explicitly dismissed it this session
  const hasDismissedOnboarding = localStorage.getItem('onboardingDismissed') === 'true';
  const shouldShowOnboarding = user && !userProfile && !loading && !hasDismissedOnboarding;

  const handleCloseOnboarding = () => {
    localStorage.setItem('onboardingDismissed', 'true');
    setShowOnboarding(false);
    setEditMode(false);
  };

  // Goal label mapper
  const goalLabel = (g) => {
    if (g === 'lose') return 'Lose Weight';
    if (g === 'maintain') return 'Maintain Weight';
    if (g === 'gain') return 'Gain Weight';
    return g;
  };

  const activityLabel = (a) => {
    if (a === 'sedentary') return 'Sedentary';
    if (a === 'light') return 'Light Exercise';
    if (a === 'moderate') return 'Moderate';
    if (a === 'active') return 'Very Active';
    return a;
  };

  return (
    <>
      <SEO
        title="My Journey | DietWithDee"
        description="Your personal wellness dashboard — coming soon. Track progress, manage settings, and access curated content with DietWithDee."
        keywords="Diet Journey, Progress Tracking, Wellness Dashboard, DietWithDee"
        url="https://dietwithdee.org/my-journey"
      />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 w-full overflow-hidden">

        {/* Hero Section Container */}
        <div className="relative w-full h-[40vh] min-h-[300px] max-h-[450px] flex items-center justify-center overflow-hidden">

          {/* Background Image with slight zoom animation */}
          <motion.div
            variants={subtleZoom}
            initial="hidden"
            animate="show"
            className="absolute inset-0 w-full h-full"
          >
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${JourneyHero})` }}
              role="img"
              aria-label="My Journey 3D Hero Background"
            ></div>
            {/* Dark overlay specifically for text contrast if needed, subtle */}
            <div className="absolute inset-0 bg-black/10"></div>
          </motion.div>

          {/* Content Overlay */}
          <div className="relative z-10 text-center px-4 w-full">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="max-w-4xl mx-auto flex flex-col items-center"
            >
              <motion.h1
                variants={fadeUp}
                className="text-5xl md:text-7xl lg:text-8xl font-black text-white drop-shadow-xl tracking-tight mb-4"
              >
                My Journey
              </motion.h1>
              <motion.div variants={fadeUp} className="w-24 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mx-auto mb-6 shadow-md"></motion.div>
              <motion.p
                variants={fadeUp}
                className="text-xl md:text-2xl text-white font-medium drop-shadow-md max-w-2xl px-4"
              >
                Your personalized path to lasting wellness starts here.
              </motion.p>
            </motion.div>
          </div>

          {/* Essential Bottom Gradient - Blends the image seamlessly back into the page */}
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-emerald-50 via-white/80 to-transparent z-10 pointer-events-none"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-12 pt-12 pb-20 relative z-20">

          {/* ===== PROFILE CARD (logged-in users with profile) ===== */}
          <AnimatePresence>
            {user && userProfile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-3xl mx-auto mb-12"
              >
                <div className="bg-white rounded-3xl shadow-xl border border-green-100 overflow-hidden">
                  {/* Profile header */}
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 flex items-center gap-5">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-16 h-16 rounded-full border-3 border-white shadow-lg object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                        {user.displayName?.[0] || '?'}
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-white text-xl font-bold">{user.displayName}</h2>
                      <p className="text-green-100 text-sm">{user.email}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowLogoutConfirm(true)}
                      className="px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white text-sm font-semibold rounded-full transition-all flex items-center gap-2"
                    >
                      <FiLogOut size={16} /> Sign Out
                    </motion.button>
                  </div>

                  {/* Profile data grid */}
                  <div className="px-8 py-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Wellness Profile</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: 'Gender', value: userProfile.gender, capitalize: true },
                        { label: 'Age', value: `${userProfile.age} yrs` },
                        { label: 'Height', value: `${userProfile.height} cm` },
                        { label: 'Weight', value: `${userProfile.weight} kg` },
                        { label: 'Goal', value: goalLabel(userProfile.goal) },
                        { label: 'Activity', value: activityLabel(userProfile.activityLevel) },
                        { label: 'Sleep', value: userProfile.sleepHours },
                        { label: 'Diet', value: userProfile.dietaryRestrictions },
                      ].map((item, i) => (
                        <div key={i} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3">
                          <div className="text-xs text-gray-400 font-medium mb-1">{item.label}</div>
                          <div className={`text-sm font-bold text-gray-800 ${item.capitalize ? 'capitalize' : ''}`}>
                            {item.value || '—'}
                          </div>
                        </div>
                      ))}
                    </div>

                    {(userProfile.healthConditions || userProfile.dislikes) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        {userProfile.healthConditions && (
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3">
                            <div className="text-xs text-gray-400 font-medium mb-1">Health Conditions</div>
                            <div className="text-sm font-bold text-gray-800">{userProfile.healthConditions}</div>
                          </div>
                        )}
                        {userProfile.dislikes && (
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3">
                            <div className="text-xs text-gray-400 font-medium mb-1">Allergies / Dislikes</div>
                            <div className="text-sm font-bold text-gray-800">{userProfile.dislikes}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-green-100">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleBookConsultation}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#F6841F] to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Calendar size={18} /> Book a Consultation
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleUpdateInfo}
                        className="flex-1 px-6 py-3 border-2 border-green-600 text-green-700 font-bold rounded-full hover:bg-green-50 transition-all flex items-center justify-center gap-2"
                      >
                        <FiEdit2 size={16} /> Update My Info
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header Details */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-600 font-semibold text-sm px-5 py-2 rounded-full mb-8 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
              </span>
              Coming Soon
            </motion.div>

            <motion.p variants={fadeUp} className="text-lg lg:text-xl text-gray-600 leading-relaxed mb-8">
              We're building something special just for you.{' '}
              <span className="text-green-700 font-bold">My Journey</span> will
              be your personalised wellness hub...a place to track your
              progress, manage your preferences, and discover content curated
              for your goals.
            </motion.p>

            {/* Get Started / Sign-in CTA - only show when NOT logged in */}
            {!user && (
              <motion.div variants={fadeUp} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg max-w-lg w-full mx-auto">
                <div className="text-center space-y-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                    <span className="text-2xl">🌿</span>
                  </div>
                  <h3 className="text-xl font-bold text-green-800">Start Your Wellness Journey</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Sign up to save your progress, get personalized recommendations, and be first to access new features.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleGetStarted}
                    disabled={signingIn || loading}
                    className="w-full py-3.5 bg-[#F6841F] text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:bg-orange-600 flex items-center justify-center gap-3 disabled:opacity-60"
                  >
                    {signingIn ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <FcGoogle size={22} className="bg-white rounded-full p-0.5" />
                        Get Started with Google
                      </>
                    )}
                  </motion.button>
                  <button
                    onClick={() => navigate('/knowyourbody')}
                    className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
                  >
                    Continue as guest →
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Under construction illustration */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            className="relative max-w-md mx-auto mb-16"
          >
            <div className="absolute -top-6 -left-6 w-48 h-48 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-30 blur-3xl"></div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-tr from-orange-200 to-yellow-200 rounded-full opacity-30 blur-3xl"></div>

            <div className="relative bg-white rounded-3xl shadow-xl p-10 text-center border border-green-100">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                Page Under Development
              </h2>
              <p className="text-gray-500">
                We are hard at work crafting this experience. Let Us cook!
              </p>
            </div>
          </motion.div>

          {/* Feature teasers */}
          <div className="max-w-5xl mx-auto">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center text-2xl lg:text-3xl font-bold text-green-800 mb-10"
            >
              What to Expect
            </motion.h3>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {upcomingFeatures.map((feature, idx) => (
                <motion.div
                  variants={fadeUp}
                  key={idx}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group bg-white rounded-2xl p-6 shadow-md border border-green-50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-green-600 group-hover:from-green-500 group-hover:to-emerald-500 group-hover:text-white transition-all duration-300">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center mt-16"
          >
            <p className="text-gray-600 mb-6 font-medium">
              In the meantime, explore our plans or check out the blog for tips
              and inspiration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/plans')}
                className="px-8 py-4 bg-gradient-to-r from-[#F6841F] to-[#F6841F] text-white font-bold rounded-full shadow-lg transition-all duration-300 hover:from-orange-600 hover:to-orange-400"
              >
                Explore Plans
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/blog')}
                className="px-8 py-4 border-2 border-green-600 text-green-700 font-bold rounded-full hover:bg-green-50 transition-all duration-300 hover:shadow-md"
              >
                Read the Blog
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {(showOnboarding || shouldShowOnboarding) && user && (
          <OnboardingModal
            userName={user.displayName}
            onSave={handleOnboardingSave}
            onClose={handleCloseOnboarding}
            initialData={editMode ? userProfile : null}
          />
        )}
      </AnimatePresence>

      {/* Sign-out Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLogOut size={22} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Sign Out?</h3>
              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to sign out? Your data is saved and you can sign back in anytime.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowLogoutConfirm(false); signOut(); }}
                  className="flex-1 py-2.5 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MyJourney;
