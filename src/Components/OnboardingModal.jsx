import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronRight, FiChevronLeft, FiCheck, FiEdit2 } from 'react-icons/fi';
import { User, Activity, Moon, Heart, Utensils, Target } from 'lucide-react';

const OnboardingModal = ({ userName, onSave, onClose, initialData = null }) => {
  const isEditing = !!initialData;
  const [step, setStep] = useState(isEditing ? 1 : 0);
  const [formData, setFormData] = useState({
    gender: initialData?.gender || '',
    age: initialData?.age || '',
    height: initialData?.height || '',
    weight: initialData?.weight || '',
    goal: initialData?.goal || '',
    activityLevel: initialData?.activityLevel || '',
    sleepHours: initialData?.sleepHours || '',
    healthConditions: initialData?.healthConditions || '',
    dislikes: initialData?.dislikes || '',
    dietaryRestrictions: initialData?.dietaryRestrictions || '',
  });

  const firstName = userName?.split(' ')[0] || 'there';

  // Step validation
  const isStep1Valid = formData.gender && formData.age && formData.height && formData.weight;
  const isStep2Valid = formData.goal && formData.activityLevel && formData.sleepHours && formData.dietaryRestrictions;

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);

  const goNext = () => { setDirection(1); setStep(s => s + 1); };
  const goBack = () => { setDirection(-1); setStep(s => s - 1); };
  const goToStep = (s) => { setDirection(s > step ? 1 : -1); setStep(s); };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
      >
        {/* Progress bar */}
        <div className="sticky top-0 z-20 bg-white rounded-t-3xl px-8 pt-6 pb-2">
          <div className="flex items-center gap-2 mb-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 h-2 rounded-full overflow-hidden bg-gray-100">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: step >= i ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 font-medium">
            <span>Welcome</span>
            <span>Your Info</span>
            <span>Confirm</span>
          </div>
        </div>

        <div className="px-8 pb-8 pt-4 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {/* Step 0: Welcome */}
            {step === 0 && (
              <motion.div
                key="welcome"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-8 text-center"
              >
                <div className="space-y-4">
                  <div className="text-6xl">👋</div>
                  <h2 className="text-3xl font-bold text-green-800">
                    Welcome, <span className="text-[#F6841F]">{firstName}</span>!
                  </h2>
                  <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                    Let's get you set up. We'll collect some basic info to personalize your wellness journey.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                    <User size={16} className="text-green-600" />
                    <span>Basic Measurements</span>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
                    <Target size={16} className="text-emerald-600" />
                    <span>Your Goals</span>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full">
                    <Activity size={16} className="text-orange-600" />
                    <span>Lifestyle</span>
                  </div>
                </div>

                <p className="text-sm text-gray-400">This takes less than 2 minutes ⏱️</p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goNext}
                  className="px-10 py-4 bg-gradient-to-r from-[#F6841F] to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto text-lg"
                >
                  Let's Go <FiChevronRight size={20} />
                </motion.button>
              </motion.div>
            )}

            {/* Step 1: Personal Info (measurements + goals + lifestyle) */}
            {step === 1 && (
              <motion.div
                key="info"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-green-800">Tell us about yourself</h2>
                  <p className="text-gray-500">We'll use this to personalize your experience</p>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User size={16} className="text-green-600" /> Gender
                  </label>
                  <div className="flex gap-3">
                    {['male', 'female'].map(g => (
                      <button
                        key={g}
                        onClick={() => setFormData(p => ({ ...p, gender: g }))}
                        className={`flex-1 py-3 rounded-xl border-2 font-medium capitalize transition-all ${
                          formData.gender === g
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-green-300 text-gray-600'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Age (years)</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => setFormData(p => ({ ...p, age: e.target.value }))}
                    className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-900 placeholder-gray-400"
                    placeholder="Enter your age"
                  />
                </div>

                {/* Height & Weight - side by side */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={e => setFormData(p => ({ ...p, height: e.target.value }))}
                      className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-900 placeholder-gray-400"
                      placeholder="cm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={e => setFormData(p => ({ ...p, weight: e.target.value }))}
                      className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-900 placeholder-gray-400"
                      placeholder="kg"
                    />
                  </div>
                </div>

                {/* Goal */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Target size={16} className="text-emerald-600" /> What's your goal?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'lose', label: 'Lose Weight', icon: '📉' },
                      { key: 'maintain', label: 'Maintain', icon: '⚖️' },
                      { key: 'gain', label: 'Gain Weight', icon: '📈' },
                    ].map(goal => (
                      <button
                        key={goal.key}
                        onClick={() => setFormData(p => ({ ...p, goal: goal.key }))}
                        className={`py-3 px-3 rounded-xl border-2 font-medium transition-all text-center text-sm ${
                          formData.goal === goal.key
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-green-300 text-gray-600'
                        }`}
                      >
                        <div className="text-xl mb-1">{goal.icon}</div>
                        {goal.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity Level */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Activity size={16} className="text-green-600" /> Activity Level
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
                      { key: 'light', label: 'Light', desc: '1-3 days/week' },
                      { key: 'moderate', label: 'Moderate', desc: '3-5 days/week' },
                      { key: 'active', label: 'Very Active', desc: '6-7 days/week' },
                    ].map(a => (
                      <button
                        key={a.key}
                        onClick={() => setFormData(p => ({ ...p, activityLevel: a.key }))}
                        className={`py-3 px-3 rounded-xl border-2 font-medium transition-all text-left ${
                          formData.activityLevel === a.key
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-green-300 text-gray-600'
                        }`}
                      >
                        <div className="font-semibold text-sm">{a.label}</div>
                        <div className="text-xs text-gray-500">{a.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sleep */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Moon size={16} className="text-green-600" /> Sleep Hours
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['4-5 hours', '6-7 hours', '8+ hours'].map(s => (
                      <button
                        key={s}
                        onClick={() => setFormData(p => ({ ...p, sleepHours: s }))}
                        className={`py-3 rounded-xl border-2 font-medium transition-all text-sm ${
                          formData.sleepHours === s
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-green-300 text-gray-600'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Health Conditions */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Heart size={16} className="text-green-600" /> Health Conditions <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.healthConditions}
                    onChange={e => setFormData(p => ({ ...p, healthConditions: e.target.value }))}
                    className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-900 placeholder-gray-400"
                    placeholder="e.g., Diabetes, High blood pressure..."
                  />
                </div>

                {/* Food Allergies */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    🤧 Food Allergies / Dislikes <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.dislikes}
                    onChange={e => setFormData(p => ({ ...p, dislikes: e.target.value }))}
                    className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-900 placeholder-gray-400"
                    placeholder="e.g., Lactose Intolerance, Gluten..."
                  />
                </div>

                {/* Dietary Restrictions */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Utensils size={16} className="text-green-600" /> Dietary Restrictions
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Vegan', 'Vegetarian', 'Gluten-free', 'None'].map(d => (
                      <button
                        key={d}
                        onClick={() => setFormData(p => ({ ...p, dietaryRestrictions: d }))}
                        className={`py-3 rounded-xl border-2 font-medium transition-all text-sm ${
                          formData.dietaryRestrictions === d
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-green-300 text-gray-600'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goBack}
                    className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-full hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <FiChevronLeft size={18} /> Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goNext}
                    disabled={!isStep1Valid || !isStep2Valid}
                    className="px-8 py-3 bg-gradient-to-r from-[#F6841F] to-orange-500 text-white font-bold rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    Review <FiChevronRight size={18} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Confirm */}
            {step === 2 && (
              <motion.div
                key="confirm"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="text-5xl">✅</div>
                  <h2 className="text-2xl font-bold text-green-800">Review Your Info</h2>
                  <p className="text-gray-500">Make sure everything looks right</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-green-800 text-lg">Your Profile</h3>
                    <button
                      onClick={() => goToStep(1)}
                      className="text-sm text-[#F6841F] font-semibold flex items-center gap-1 hover:underline"
                    >
                      <FiEdit2 size={14} /> Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Gender', value: formData.gender, capitalize: true },
                      { label: 'Age', value: `${formData.age} years` },
                      { label: 'Height', value: `${formData.height} cm` },
                      { label: 'Weight', value: `${formData.weight} kg` },
                      { label: 'Goal', value: formData.goal === 'lose' ? 'Lose Weight' : formData.goal === 'maintain' ? 'Maintain Weight' : 'Gain Weight' },
                      { label: 'Activity', value: formData.activityLevel === 'sedentary' ? 'Sedentary' : formData.activityLevel === 'light' ? 'Light' : formData.activityLevel === 'moderate' ? 'Moderate' : 'Very Active' },
                      { label: 'Sleep', value: formData.sleepHours },
                      { label: 'Diet', value: formData.dietaryRestrictions },
                    ].map((item, i) => (
                      <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
                        <div className="text-xs text-gray-400 font-medium mb-1">{item.label}</div>
                        <div className={`text-sm font-semibold text-gray-800 ${item.capitalize ? 'capitalize' : ''}`}>
                          {item.value || '—'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {(formData.healthConditions || formData.dislikes) && (
                    <div className="space-y-2 pt-2">
                      {formData.healthConditions && (
                        <div className="bg-white rounded-xl p-3 shadow-sm">
                          <div className="text-xs text-gray-400 font-medium mb-1">Health Conditions</div>
                          <div className="text-sm font-semibold text-gray-800">{formData.healthConditions}</div>
                        </div>
                      )}
                      {formData.dislikes && (
                        <div className="bg-white rounded-xl p-3 shadow-sm">
                          <div className="text-xs text-gray-400 font-medium mb-1">Allergies / Dislikes</div>
                          <div className="text-sm font-semibold text-gray-800">{formData.dislikes}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goBack}
                    className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-full hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <FiChevronLeft size={18} /> Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-full shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2"
                  >
                    <FiCheck size={18} /> Save & Continue
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingModal;
