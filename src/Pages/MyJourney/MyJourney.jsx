import React, { useState } from 'react';
import SEO from '../../Components/SEO';
import { useNavigate } from 'react-router';
import { FiTrendingUp, FiSettings, FiBookOpen, FiStar, FiAward, FiEdit2, FiLogOut, FiTrash2 } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JourneyHero from '../../assets/journey_glossy.webp';
import { useAuth } from '../../AuthContext';
import OnboardingModal from '../../Components/OnboardingModal';

// Part 2 components
import ProgressChart from './components/ProgressChart';
import PlanRecommendation from './components/PlanRecommendation';
import RecommendedReads from './components/RecommendedReads';
import Achievements from './components/Achievements';


function MyJourney() {
  const navigate = useNavigate();
  const { user, userProfile, loading, signInWithGoogle, signOut, saveUserProfile } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Guest-only feature teasers
  // Guest feature highlights
  const featureHighlights = [
    {
      icon: <FiTrendingUp size={28} />,
      title: 'Progress Tracking',
      description:
        'Monitor your weight and BMI trends with interactive charts that update in real-time as you log your data.',
    },
    {
      icon: <FiStar size={28} />,
      title: 'Personalized Plans',
      description:
        'Get smart recommendations for diet plans (Weight Loss, Gain, or Reset) tailored to your specific BMI and health goals.',
    },
    {
      icon: <FiBookOpen size={28} />,
      title: 'Curated Readings',
      description:
        'Access a personal feed of hand-picked wellness articles and professional tips based on your health profile.',
    },
    {
      icon: <FiAward size={28} />,
      title: 'Milestones & Sharing',
      description:
        'Earn beautiful digital badges for your consistency and download sharable placards to celebrate your progress.',
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
        setSigningIn(false);
      } else {
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

  // Show onboarding if user is logged in, has no profile, and isn't currently loading.
  const shouldShowOnboarding = user && !userProfile && !loading;

  const handleCloseOnboarding = async () => {
    try {
      if (!userProfile) {
        await saveUserProfile({ onboardingSkipped: true });
      }
    } catch (err) {
      console.error('Failed to save skip status:', err);
    }
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

  // Determine if this is a fully onboarded user (has real profile data, not just skipped)
  const hasFullProfile = user && userProfile && !userProfile.onboardingSkipped;

  // Debugging logs requested by user
  console.log('[MyJourney Debug] User state:', { 
    isLoggedIn: !!user, 
    uid: user?.uid, 
    hasProfileDoc: !!userProfile, 
    onboardingSkipped: userProfile?.onboardingSkipped, 
    isLoading: loading, 
    hasFullProfile 
  });


  return (
    <>
      <SEO
        title="My Journey | Personal Wellness Dashboard | DietWithDee"
        description="Your personalized health and wellness dashboard. Track your diet progress, manage wellness goals, and access curated nutrition content tailored to your unique journey with DietWithDee."
        keywords="Diet Journey, Wellness Dashboard, Nutrition Progress, Personalized Diet Plan, Health Tracker, DietWithDee Ghana"
        url="https://dietwithdee.org/my-journey"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "My Journey - Wellness Dashboard",
          "description": "Personalized health tracking and wellness management dashboard by DietWithDee.",
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [{
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://dietwithdee.org"
            }, {
              "@type": "ListItem",
              "position": 2,
              "name": "My Journey",
              "item": "https://dietwithdee.org/my-journey"
            }]
          }
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 w-full overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Hero Section — only shown for guests */}
        {!user && !loading && (
          <div className="relative w-full h-[40vh] min-h-[300px] max-h-[450px] flex items-center justify-center overflow-hidden">
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
              <div className="absolute inset-0 bg-white/60"></div>
            </motion.div>

            <div className="relative z-10 text-center px-4 w-full">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="max-w-4xl mx-auto flex flex-col items-center"
              >
                <motion.h1
                  variants={fadeUp}
                  className="text-5xl md:text-6xl lg:text-7xl font-black text-green-700 tracking-tight mb-4"
                >
                  My Journey
                </motion.h1>
                <motion.div variants={fadeUp} className="w-24 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mx-auto mb-6 shadow-md"></motion.div>
                <motion.p
                  variants={fadeUp}
                  className="text-xl md:text-2xl text-gray-700 font-bold max-w-2xl px-4 drop-shadow-sm"
                >
                  Your personalized path to lasting wellness starts here.
                </motion.p>
              </motion.div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-emerald-50 via-white/80 to-transparent z-10 pointer-events-none"></div>
          </div>
        )}

        <div className="container mx-auto px-6 lg:px-12 pt-24 pb-20 relative z-20">

          {/* ===== LOGGED-IN: Full Dashboard Sections ===== */}
          {hasFullProfile && !loading && (
            <>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-1 max-w-5xl mx-auto">
                📈 Progress Tracker
              </h3>
              <div className="max-w-5xl mx-auto">
                <ProgressChart />
              </div>

              {/* Consultation Call to Action */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto text-center mt-8 mb-6"
              >
                <p className="text-gray-600 font-medium leading-relaxed">
                  Submit your latest BMI and Calorie data for a comprehensive consultation session with our experts.
                </p>
              </motion.div>

              {/* Book a Consultation — right below progress chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="max-w-3xl mx-auto mb-12 flex justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleBookConsultation}
                  className="px-8 py-4 bg-gradient-to-r from-[#F6841F] to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg"
                >
                  <Calendar size={20} /> Book a Consultation
                </motion.button>
              </motion.div>

              <PlanRecommendation />
              <RecommendedReads />
              <Achievements />

              {/* ===== ACCOUNT SETTINGS (wellness profile + actions) ===== */}
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-1 max-w-3xl mx-auto">
                ⚙️ Account Settings
              </h3>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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
                  </div>

                  {/* Wellness profile grid */}
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
                  </div>

                  {/* Action buttons */}
                  <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex flex-col gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleUpdateInfo}
                      className="w-full px-5 py-2.5 bg-white border-2 border-green-600 text-green-700 font-semibold rounded-full hover:bg-green-50 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <FiEdit2 size={16} /> Update My Info
                    </motion.button>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowLogoutConfirm(true)}
                        className="flex-1 px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-600 font-semibold rounded-full hover:border-gray-300 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <FiLogOut size={16} /> Sign Out
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex-1 px-5 py-2.5 bg-white border-2 border-red-200 text-red-500 font-semibold rounded-full hover:border-red-300 hover:bg-red-50 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <FiTrash2 size={16} /> Delete Account
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* ===== LOGGED-IN: INCOMPLETE PROFILE FALLBACK ===== */}
          {user && !hasFullProfile && !loading && (
            <motion.div
              initial="hidden"
              animate="show"
              variants={staggerContainer}
              className="text-center max-w-2xl mx-auto mt-10 mb-16 bg-white rounded-3xl shadow-xl p-10 border border-green-100"
            >
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                🚀
              </div>
              <h2 className="text-3xl font-bold text-green-800 mb-4">You're almost there!</h2>
              <p className="text-gray-600 text-lg mb-8">
                Your account is created, but we need a few more details to set up your personalized Dashboard and track your journey. 
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowOnboarding(true)}
                className="px-8 py-4 bg-gradient-to-r from-[#F6841F] to-orange-500 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Complete My Profile
              </motion.button>
              
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                 <button 
                   onClick={() => setShowLogoutConfirm(true)}
                   className="text-gray-400 hover:text-gray-600 font-medium text-sm flex items-center gap-2 transition-colors"
                 >
                   <FiLogOut size={16} /> Sign out for now
                 </button>
              </div>
            </motion.div>
          )}

          {/* ===== GUEST / NOT LOGGED IN: Teaser Content ===== */}
          {!user && !loading && (
            <>
              <motion.div
                initial="hidden"
                animate="show"
                variants={staggerContainer}
                className="text-center max-w-3xl mx-auto mb-16"
              >


                <motion.p variants={fadeUp} className="text-lg lg:text-xl text-gray-600 leading-relaxed mb-8 px-4">
                  Welcome to <span className="text-green-700 font-bold">My Journey</span>—your 
                  personal wellness mission control. Log your daily progress, earn unique rewards, 
                  and unlock professional diet plans built for your unique body type.
                </motion.p>

                {/* Get Started / Sign-in CTA */}
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
              </motion.div>

              {/* Feature teasers */}
              <div className="max-w-5xl mx-auto">
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center text-2xl lg:text-3xl font-bold text-green-800 mb-10"
                >
                  What You Get
                </motion.h3>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-50px" }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  {featureHighlights.map((feature, idx) => (
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
            </>
          )}
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

      {/* Sign-out Confirmation */}
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLogOut size={22} className="text-gray-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Sign Out?</h3>
              <p className="text-gray-500 text-sm mb-6">Your data is saved and you can sign back in anytime.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={() => { setShowLogoutConfirm(false); signOut(); }} className="flex-1 py-2.5 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors">Sign Out</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrash2 size={22} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Account?</h3>
              <p className="text-gray-500 text-sm mb-6">This will permanently delete your profile, all log history, and achievements. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200 transition-colors">Cancel</button>
                <button
                  onClick={async () => {
                    setDeleting(true);
                    try {
                      const { collection: col, getDocs: gd, deleteDoc: dd, doc: dc } = await import('firebase/firestore');
                      const { db: fireDb } = await import('../../firebaseConfig');
                      const logsSnap = await gd(col(fireDb, 'users', user.uid, 'logs'));
                      await Promise.all(logsSnap.docs.map((d) => dd(d.ref)));
                      await dd(dc(fireDb, 'users', user.uid));
                      await user.delete();
                      // Force signout on success
                      await signOut();
                    } catch (err) {
                      console.error('Delete failed:', err);
                      if (err.code === 'auth/requires-recent-login') {
                        alert('For security, please sign out and sign back in, then try deleting again.');
                      } else {
                        alert('Failed to delete account. Please try again.');
                      }
                      // Force signout on failure so they don't get stuck without a profile
                      await signOut();
                    }
                    setDeleting(false);
                    setShowDeleteConfirm(false);
                  }}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Deleting...</>
                  ) : 'Delete Forever'}
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
