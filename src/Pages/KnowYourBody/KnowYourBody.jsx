import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Calculator,
  Target,
  BookOpen,
  User,
  Activity,
  Moon,
  Heart,
  Utensils,
  Angry,
  CheckCircle2,
  Loader2,
  Mail,
  Scale,
  Ruler
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { useWebHaptics } from 'web-haptics/react';
import { logEvent } from 'firebase/analytics';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../../Components/SEO';
import HapticRulerSlider from '../../Components/HapticRulerSlider';
import { analytics, functions } from '../../firebaseConfig';
import { useAuth } from '../../AuthContext';
import { saveEmailToFirestore } from '../../firebaseUtils';
import { isValidEmail } from '../../utils/validation';
import { calculateBodyMetrics, buildKnowYourBodySnapshot, getStoredTestResults } from '../../utils/bookingProfile';
import {
  RULER_RANGES,
  formatInchesToFeetInches,
  convertHeight,
  convertWeight,
  suggestTargetWeight,
  toggleDietaryChoice,
  snapToStep
} from '../../utils/knowYourBodyFlow';

const ProgressBar = ({ step }) => {
  const progress = Math.max(8, (step / 3) * 100);
  return (
    <div className="pt-12 max-w-2xl mx-auto">
      <div className="w-full bg-stone-200/80 rounded-full h-2.5 mb-2.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#1F4E36] to-emerald-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wider text-stone-500">
        <span className={step === 0 ? 'text-emerald-800' : ''}>Start</span>
        <span className={step === 1 ? 'text-emerald-800' : ''}>Body</span>
        <span className={step === 2 ? 'text-emerald-800' : ''}>Lifestyle</span>
        <span className={step === 3 ? 'text-emerald-800' : ''}>Results</span>
      </div>
    </div>
  );
};

// Step 0: Enter Email to Get Started
const WelcomeStep = ({ user, email, setEmail, emailError, setEmailError, onNext }) => (
  <div className="max-w-2xl mx-auto text-center space-y-7 pt-6">
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-800">
        2-Minute Nutrition Check
      </p>
      <h1 className="text-3xl sm:text-5xl font-serif-cormorant font-normal text-stone-900 tracking-tight leading-[1.12]">
        Understand your body &amp; daily calorie needs.
      </h1>
      <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
        Slide to set your measurements, discover your BMI and macro targets, and receive your personalized breakdown in your inbox.
      </p>
    </div>

    <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm font-semibold text-emerald-900">
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200">
        <Calculator size={15} className="text-emerald-700" /> BMI &amp; Body Metrics
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200">
        <Target size={15} className="text-[#e07312]" /> Daily Calories &amp; Macros
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200">
        <BookOpen size={15} className="text-emerald-700" /> Dietitian Summary
      </span>
    </div>

    <form
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
      className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-6 sm:p-8 max-w-md mx-auto text-left space-y-4"
    >
      {user?.email ? (
        <div className="rounded-2xl bg-[#F4F7F4] border border-emerald-200/80 p-4 flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
          <div className="min-w-0 text-xs sm:text-sm">
            <p className="font-bold text-emerald-950">Signed in as {user.displayName?.split(' ')[0] || 'you'}</p>
            <p className="text-emerald-800 truncate">{user.email}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <label htmlFor="kyb-email" className="block text-xs font-bold uppercase tracking-wider text-stone-700">
            Enter your email address to get started
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              id="kyb-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              placeholder="you@example.com"
              className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-colors ${
                emailError
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/40'
                  : 'border-stone-200 focus:border-emerald-600 bg-white'
              }`}
            />
          </div>
          {emailError ? (
            <p className="text-xs font-semibold text-rose-600">{emailError}</p>
          ) : (
            <p className="text-[11px] text-stone-500 leading-relaxed">
              We&apos;ll send your results breakdown plus weekly DietWithDee nutrition notes (unsubscribe anytime).
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        className="w-full py-3.5 px-6 bg-[#F6841F] hover:bg-[#e07312] text-white font-bold rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer border-none"
      >
        <span>Start Assessment</span>
        <ChevronRight size={18} />
      </button>
    </form>

    <p className="text-xs text-stone-500 max-w-md mx-auto">
      By continuing, you agree to our{' '}
      <a href="/privacy" className="text-emerald-800 hover:underline font-semibold">Privacy Policy</a>{' '}
      and{' '}
      <a href="/terms" className="text-emerald-800 hover:underline font-semibold">Terms of Service</a>.
    </p>
  </div>
);

// Step 1: Gender + Horizontal Haptic Sliders
const BMIStep = ({ formData, setFormData, units, onToggleUnits, onNext, onBack }) => {
  const heightRange = units === 'imperial' ? RULER_RANGES.heightImperial : RULER_RANGES.heightMetric;
  const weightRange = units === 'imperial' ? RULER_RANGES.weightImperial : RULER_RANGES.weightMetric;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-serif-cormorant font-normal text-stone-900">
          Your Body Measurements
        </h2>
        <p className="text-stone-600 text-sm sm:text-base">
          Slide the rulers below — no tedious typing needed.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-5 sm:p-7 space-y-5">
        {/* Units Toggle */}
        <div className="flex justify-center">
          <div className="bg-stone-100 rounded-full p-1 inline-flex items-center gap-1">
            {[
              { id: 'metric', label: 'Metric (cm · kg)' },
              { id: 'imperial', label: 'Imperial (ft/in · lbs)' }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onToggleUnits(opt.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border-none ${
                  units === opt.id
                    ? 'bg-white shadow-xs text-emerald-900'
                    : 'bg-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-stone-800">Biological Sex</label>
          <div className="grid grid-cols-2 gap-3">
            {['female', 'male'].map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, gender }))}
                className={`py-3 px-4 rounded-xl border-2 font-semibold text-sm capitalize transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  formData.gender === gender
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-emerald-300'
                }`}
              >
                <User size={16} />
                <span>{gender}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Age Ruler */}
        <HapticRulerSlider
          label="Age"
          icon={<User size={16} />}
          value={Number(formData.age)}
          min={RULER_RANGES.age.min}
          max={RULER_RANGES.age.max}
          step={RULER_RANGES.age.step}
          majorEvery={RULER_RANGES.age.majorEvery}
          unit="yrs"
          onChange={(val) => setFormData((prev) => ({ ...prev, age: val }))}
        />

        {/* Height Ruler */}
        <HapticRulerSlider
          label="Height"
          icon={<Ruler size={16} />}
          value={Number(formData.height)}
          min={heightRange.min}
          max={heightRange.max}
          step={heightRange.step}
          majorEvery={heightRange.majorEvery}
          unit={heightRange.unit}
          formatDisplay={units === 'imperial' ? formatInchesToFeetInches : null}
          helperText={
            units === 'imperial'
              ? `${Math.round(Number(formData.height) * 2.54)} cm`
              : `${formatInchesToFeetInches(Number(formData.height) / 2.54)}`
          }
          onChange={(val) => setFormData((prev) => ({ ...prev, height: val }))}
        />

        {/* Weight Ruler */}
        <HapticRulerSlider
          label="Current Weight"
          icon={<Scale size={16} />}
          value={Number(formData.weight)}
          min={weightRange.min}
          max={weightRange.max}
          step={weightRange.step}
          majorEvery={weightRange.majorEvery}
          unit={weightRange.unit}
          helperText={
            units === 'imperial'
              ? `${Math.round(Number(formData.weight) * 0.453592 * 10) / 10} kg`
              : null
          }
          onChange={(val) => setFormData((prev) => ({ ...prev, weight: val }))}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3.5 rounded-2xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-sm flex items-center gap-1.5 cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!formData.gender}
          className="flex-1 py-3.5 bg-[#F6841F] hover:bg-[#e07312] text-white font-bold rounded-2xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer border-none"
        >
          <span>Next: Goal &amp; Lifestyle</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

// Step 2: Goal (with Haptic Target Weight Slider) & Lifestyle
const CalorieStep = ({ formData, setFormData, units, onNext, onBack }) => {
  const weightRange = units === 'imperial' ? RULER_RANGES.weightImperial : RULER_RANGES.weightMetric;

  const handleSelectGoal = (goalKey) => {
    setFormData((prev) => ({
      ...prev,
      goal: goalKey,
      targetWeight:
        goalKey === 'maintain'
          ? null
          : suggestTargetWeight(prev.weight, goalKey, units)
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-serif-cormorant font-normal text-stone-900">
          Your Goal &amp; Routine
        </h2>
        <p className="text-stone-600 text-sm sm:text-base">
          Tailors your calorie target, macro balance, and clinical context.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-5 sm:p-7 space-y-7">
        {/* Primary Goal */}
        <div className="space-y-3">
          <label className="text-sm sm:text-base font-bold text-stone-800 flex items-center gap-2">
            <Target size={17} className="text-[#e07312]" /> What&apos;s your main goal?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'lose', label: 'Lose Weight', icon: '📉' },
              { key: 'maintain', label: 'Maintain Weight', icon: '⚖️' },
              { key: 'gain', label: 'Gain Weight', icon: '📈' }
            ].map((goal) => (
              <button
                key={goal.key}
                type="button"
                onClick={() => handleSelectGoal(goal.key)}
                className={`py-3.5 px-4 rounded-xl border-2 font-semibold text-sm transition-all text-center cursor-pointer ${
                  formData.goal === goal.key
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-emerald-300'
                }`}
              >
                <span className="mr-1.5">{goal.icon}</span>
                {goal.label}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {(formData.goal === 'lose' || formData.goal === 'gain') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-2 overflow-hidden"
              >
                <HapticRulerSlider
                  label="Target Weight"
                  icon={<Target size={16} />}
                  value={Number(
                    formData.targetWeight || suggestTargetWeight(formData.weight, formData.goal, units)
                  )}
                  min={weightRange.min}
                  max={weightRange.max}
                  step={weightRange.step}
                  majorEvery={weightRange.majorEvery}
                  unit={weightRange.unit}
                  onChange={(val) => setFormData((prev) => ({ ...prev, targetWeight: val }))}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Activity Level */}
        <div className="space-y-3">
          <label className="text-sm sm:text-base font-bold text-stone-800 flex items-center gap-2">
            <Activity size={17} className="text-emerald-700" /> Daily activity level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { key: 'sedentary', label: 'Sedentary', desc: 'Desk work, little exercise' },
              { key: 'light', label: 'Light', desc: 'Walk or workout 1–3 days/wk' },
              { key: 'moderate', label: 'Moderate', desc: 'Active 3–5 days/wk' },
              { key: 'active', label: 'Very Active', desc: 'Intense training 6–7 days/wk' }
            ].map((act) => (
              <button
                key={act.key}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, activityLevel: act.key }))}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  formData.activityLevel === act.key
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-emerald-300'
                }`}
              >
                <div className="font-bold text-sm">{act.label}</div>
                <div className="text-xs text-stone-500 mt-0.5">{act.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sleep */}
        <div className="space-y-2.5">
          <label className="text-sm sm:text-base font-bold text-stone-800 flex items-center gap-2">
            <Moon size={17} className="text-emerald-700" /> Typical sleep per night
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {['4-5 hours', '6-7 hours', '8+ hours'].map((sleep) => (
              <button
                key={sleep}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, sleepHours: sleep }))}
                className={`py-2.5 px-3 rounded-xl border-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  formData.sleepHours === sleep
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-emerald-300'
                }`}
              >
                {sleep}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Restrictions (Multi-chip) */}
        <div className="space-y-2.5">
          <label className="text-sm sm:text-base font-bold text-stone-800 flex items-center gap-2">
            <Utensils size={17} className="text-emerald-700" /> Dietary style or preferences
          </label>
          <div className="flex flex-wrap gap-2">
            {['None', 'Low Sugar / Diabetes', 'Vegetarian', 'Vegan', 'Dairy-free', 'Gluten-free'].map((diet) => {
              const selectedList = String(formData.dietaryRestrictions || '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
              const isSelected = selectedList.includes(diet);

              return (
                <button
                  key={diet}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      dietaryRestrictions: toggleDietaryChoice(prev.dietaryRestrictions, diet)
                    }))
                  }
                  className={`py-2 px-3.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-emerald-300'
                  }`}
                >
                  {diet}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Clinical Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Heart size={14} className="text-rose-600" /> Health conditions (optional)
            </label>
            <input
              type="text"
              value={formData.healthConditions}
              onChange={(e) => setFormData((prev) => ({ ...prev, healthConditions: e.target.value }))}
              placeholder="e.g., Diabetes, High BP, PCOS"
              className="w-full py-2.5 px-3.5 border border-stone-200 rounded-xl focus:border-emerald-600 focus:outline-none text-sm text-stone-900 placeholder-stone-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Angry size={14} className="text-amber-600" /> Allergies / Dislikes (optional)
            </label>
            <input
              type="text"
              value={formData.dislikes}
              onChange={(e) => setFormData((prev) => ({ ...prev, dislikes: e.target.value }))}
              placeholder="e.g., Peanuts, seafood"
              className="w-full py-2.5 px-3.5 border border-stone-200 rounded-xl focus:border-emerald-600 focus:outline-none text-sm text-stone-900 placeholder-stone-400"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3.5 rounded-2xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-sm flex items-center gap-1.5 cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!formData.goal || !formData.activityLevel || !formData.sleepHours}
          className="flex-1 py-3.5 bg-[#F6841F] hover:bg-[#e07312] text-white font-bold rounded-2xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer border-none"
        >
          <span>See My Results</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

// Step 3: Results + Email/Portal Status + Consult CTA
const ResultsStep = ({
  results,
  snapshot,
  emailUsed,
  navigate,
  trigger,
  user,
  syncStatus,
  signingInToSave,
  onSignInToSave,
  onRetake
}) => (
  <div className="max-w-4xl mx-auto space-y-7 pt-4">
    <div className="text-center space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-800">
        Your Nutrition Snapshot
      </p>
      <h2 className="text-3xl sm:text-4xl font-serif-cormorant font-normal text-stone-900">
        Your Personalized Results
      </h2>

      {(emailUsed || user) && (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border border-stone-200 bg-white shadow-2xs">
          {syncStatus === 'saving' ? (
            <>
              <Loader2 size={13} className="animate-spin text-emerald-700" />
              <span className="text-stone-700">
                {user
                  ? `Saving & sending summary to ${emailUsed || user.email}...`
                  : `Sending summary to ${emailUsed}...`}
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span className="text-emerald-900">
                {user
                  ? `Saved to My Journey & summary sent to ${emailUsed || user.email}`
                  : `Summary emailed to ${emailUsed}`}
              </span>
            </>
          )}
        </div>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-7 text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Body Mass Index</span>
        <div className="text-5xl font-bold text-emerald-800 tabular-nums">{results.bmi}</div>
        <div>
          <span
            className={`text-sm font-bold px-4 py-1.5 rounded-full inline-block border ${
              results.bmiCategory === 'Normal Weight'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : results.bmiCategory === 'Underweight'
                ? 'bg-sky-50 text-sky-800 border-sky-200'
                : results.bmiCategory === 'Overweight'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {results.bmiCategory}
          </span>
        </div>
        <p className="text-sm text-stone-600 leading-relaxed">
          {results.bmiCategory === 'Normal Weight' && "You're in a healthy range — focus on quality, consistency, and balanced local meals."}
          {results.bmiCategory === 'Underweight' && 'A structured, nutrient-dense Ghanaian meal plan can help you build healthy weight safely.'}
          {results.bmiCategory === 'Overweight' && 'A tailored meal structure around foods you enjoy makes sustainable fat loss straightforward.'}
          {results.bmiCategory === 'Obese' && "Let's build a calm, clinical roadmap together for safe weight & metabolic health."}
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-7 text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Daily Target</span>
        <div>
          <div className="text-5xl font-bold text-[#e07312] tabular-nums">{results.tdee}</div>
          <div className="text-xs font-semibold text-stone-500 mt-1">kcal / day</div>
        </div>
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/70 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
            Daily Macro Split
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="font-bold text-emerald-800 text-lg tabular-nums">{results.macros.protein}g</div>
              <div className="text-[11px] text-stone-500 font-semibold">Protein</div>
            </div>
            <div>
              <div className="font-bold text-stone-900 text-lg tabular-nums">{results.macros.carbs}g</div>
              <div className="text-[11px] text-stone-500 font-semibold">Carbs</div>
            </div>
            <div>
              <div className="font-bold text-stone-900 text-lg tabular-nums">{results.macros.fats}g</div>
              <div className="text-[11px] text-stone-500 font-semibold">Fats</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 text-center space-y-5">
      <div className="space-y-2">
        <h3 className="text-2xl sm:text-3xl font-serif-cormorant font-semibold text-stone-900">
          Turn these numbers into a real meal plan
        </h3>
        <p className="text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
          These metrics are already attached for booking. Work 1-on-1 with Registered Dietitian Nana Ama Dwamena to tailor portions around your Ghanaian staples and schedule.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
        <button
          type="button"
          onClick={() => {
            trigger('success');
            navigate('/contactUs', { state: { userResults: snapshot } });
          }}
          className="flex-1 py-3.5 px-6 bg-[#F6841F] hover:bg-[#e07312] text-white font-bold rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer border-none"
        >
          <BookOpen size={18} />
          <span>Book a Consultation →</span>
        </button>

        {user ? (
          <button
            type="button"
            onClick={() => {
              trigger('success');
              navigate('/my-journey');
            }}
            className="flex-1 py-3.5 px-6 border-2 border-[#1F4E36] text-[#1F4E36] hover:bg-emerald-50 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer bg-white"
          >
            <span>Open My Journey</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onSignInToSave}
            disabled={signingInToSave}
            className="flex-1 py-3.5 px-6 border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer disabled:opacity-60"
          >
            {signingInToSave ? <Loader2 size={16} className="animate-spin" /> : <FcGoogle size={18} />}
            <span>{signingInToSave ? 'Saving...' : 'Save to My Journey'}</span>
          </button>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={onRetake}
          className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors cursor-pointer bg-transparent border-none"
        >
          Adjust measurements &amp; recalculate
        </button>
      </div>
    </div>
  </div>
);

function KnowYourBody() {
  const navigate = useNavigate();
  const { trigger } = useWebHaptics();
  const { user, userProfile, signInWithGoogle, saveAssessment } = useAuth();

  const [step, setStep] = useState(0);
  const [units, setUnits] = useState('metric');
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('knowyourbody_email') || '';
    } catch {
      return '';
    }
  });
  const [emailError, setEmailError] = useState('');

  const [formData, setFormData] = useState(() => {
    const cached = getStoredTestResults();
    return {
      gender: cached?.gender || 'female',
      age: snapToStep(cached?.age || RULER_RANGES.age.defaultValue, 1, RULER_RANGES.age.min, RULER_RANGES.age.max),
      height: snapToStep(
        cached?.height || RULER_RANGES.heightMetric.defaultValue,
        1,
        RULER_RANGES.heightMetric.min,
        RULER_RANGES.heightMetric.max
      ),
      weight: snapToStep(
        cached?.weight || RULER_RANGES.weightMetric.defaultValue,
        0.5,
        RULER_RANGES.weightMetric.min,
        RULER_RANGES.weightMetric.max
      ),
      goal: cached?.goal || 'lose',
      targetWeight: cached?.targetWeight || suggestTargetWeight(
        cached?.weight || RULER_RANGES.weightMetric.defaultValue,
        cached?.goal || 'lose',
        'metric'
      ),
      activityLevel: cached?.activityLevel || 'light',
      sleepHours: cached?.sleepHours || '6-7 hours',
      dietaryRestrictions: cached?.dietaryRestrictions || 'None',
      healthConditions: cached?.healthConditions || '',
      dislikes: cached?.dislikes || ''
    };
  });

  const [results, setResults] = useState({
    bmi: 0,
    bmiCategory: '',
    bmr: 0,
    tdee: 0,
    macros: { protein: 0, carbs: 0, fats: 0 }
  });
  const [syncStatus, setSyncStatus] = useState('idle');
  const [signingInToSave, setSigningInToSave] = useState(false);
  const [latestSnapshot, setLatestSnapshot] = useState(null);
  const hydratedProfileRef = useRef(false);

  // Sync defaults once from signed-in userProfile without clobbering slider edits
  useEffect(() => {
    if (user?.email) {
      setEmail((prev) => prev || user.email.trim().toLowerCase());
    }
    if (userProfile && !hydratedProfileRef.current) {
      hydratedProfileRef.current = true;
      setFormData((prev) => ({
        ...prev,
        gender: userProfile.gender || prev.gender,
        age: userProfile.age
          ? snapToStep(userProfile.age, 1, RULER_RANGES.age.min, RULER_RANGES.age.max)
          : prev.age,
        height: userProfile.height
          ? snapToStep(userProfile.height, 1, RULER_RANGES.heightMetric.min, RULER_RANGES.heightMetric.max)
          : prev.height,
        weight: userProfile.weight
          ? snapToStep(userProfile.weight, 0.5, RULER_RANGES.weightMetric.min, RULER_RANGES.weightMetric.max)
          : prev.weight,
        goal: userProfile.goal || prev.goal,
        activityLevel: userProfile.activityLevel || prev.activityLevel,
        sleepHours: userProfile.sleepHours || prev.sleepHours,
        dietaryRestrictions: userProfile.dietaryRestrictions || prev.dietaryRestrictions,
        healthConditions: userProfile.healthConditions || prev.healthConditions,
        dislikes: userProfile.dislikes || prev.dislikes
      }));
    }
  }, [user?.email, userProfile]);

  const handleToggleUnits = (nextUnits) => {
    if (nextUnits === units) return;
    setFormData((prev) => {
      const nextHeight = convertHeight(prev.height, units, nextUnits);
      const nextWeight = convertWeight(prev.weight, units, nextUnits);
      const nextTarget =
        prev.goal === 'maintain'
          ? null
          : prev.targetWeight
          ? convertWeight(prev.targetWeight, units, nextUnits)
          : suggestTargetWeight(nextWeight, prev.goal, nextUnits);

      return {
        ...prev,
        height: nextHeight,
        weight: nextWeight,
        targetWeight: nextTarget
      };
    });
    setUnits(nextUnits);
    try {
      trigger('selection');
    } catch {
      // Ignore haptics errors
    }
  };

  const scrollToTop = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 80);
  };

  const handleStartFromWelcome = async () => {
    const activeEmail = (user?.email || email || '').trim().toLowerCase();
    if (!activeEmail || !isValidEmail(activeEmail)) {
      setEmailError('Please enter a valid email address to continue.');
      try {
        trigger('warning');
      } catch {
        // Ignore
      }
      return;
    }

    setEmail(activeEmail);
    setEmailError('');

    try {
      localStorage.setItem('knowyourbody_email', activeEmail);
    } catch {
      // Ignore storage write errors
    }

    // Quietly subscribe new guests at Step 0 so drop-offs still join newsletter
    if (!user) {
      saveEmailToFirestore(activeEmail, { source: 'knowyourbody' }).catch((err) =>
        console.warn('Step 0 email capture notice:', err)
      );
    }

    trigger('success');
    setStep(1);
    scrollToTop();
  };

  const handleCompleteAssessment = () => {
    trigger('success');

    const weightKg = units === 'imperial' ? Number(formData.weight) * 0.453592 : Number(formData.weight);
    const heightCm = units === 'imperial' ? Number(formData.height) * 2.54 : Number(formData.height);
    const computed =
      calculateBodyMetrics({
        weightKg,
        heightCm,
        age: formData.age,
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        goal: formData.goal
      }) || {
        bmi: 0,
        bmiCategory: '',
        bmr: 0,
        tdee: 0,
        macros: { protein: 0, carbs: 0, fats: 0 }
      };

    setResults(computed);

    const activeEmail = (user?.email || email || '').trim().toLowerCase();
    const targetWeightKg =
      formData.goal === 'maintain' || !formData.targetWeight
        ? null
        : units === 'imperial'
        ? Math.round(Number(formData.targetWeight) * 0.453592 * 10) / 10
        : Number(formData.targetWeight);

    const testSnapshot = buildKnowYourBodySnapshot(
      {
        ...formData,
        email: activeEmail,
        targetWeight: targetWeightKg
      },
      units,
      Date.now()
    );

    if (testSnapshot) {
      setLatestSnapshot(testSnapshot);
      try {
        localStorage.setItem('diet_test_results', JSON.stringify(testSnapshot));
        if (activeEmail) {
          localStorage.setItem('knowyourbody_email', activeEmail);
        }
      } catch (e) {
        console.warn('Could not cache test results:', e);
      }

      setSyncStatus('saving');
      const tasks = [];

      if (user) {
        tasks.push(saveAssessment(testSnapshot));
      }

      if (activeEmail && functions) {
        const recordCheckFn = httpsCallable(functions, 'recordKnowYourBodyCheck');
        tasks.push(
          recordCheckFn({
            email: activeEmail,
            snapshot: testSnapshot
          })
        );
      }

      Promise.allSettled(tasks).then((settled) => {
        const anySucceeded = settled.some((s) => s.status === 'fulfilled');
        setSyncStatus(anySucceeded ? 'saved' : 'error');
      });

      logEvent(analytics, 'generate_lead', {
        goal: formData.goal,
        bmi_category: computed.bmiCategory
      });
    }

    setStep(3);
    scrollToTop();
  };

  const handleSignInToSave = async () => {
    trigger('success');
    setSigningInToSave(true);
    try {
      const signedInUser = await signInWithGoogle();
      if (signedInUser && latestSnapshot) {
        setSyncStatus('saving');
        await saveAssessment(latestSnapshot, signedInUser);
        setSyncStatus('saved');
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        console.warn('Sign-in during KnowYourBody failed:', err);
      }
    } finally {
      setSigningInToSave(false);
    }
  };

  const activeEmail = (user?.email || email || '').trim().toLowerCase();

  return (
    <>
      <SEO
        title="Know Your Body | BMI & Calorie Calculator | DietWithDee"
        description="Slide to check your BMI, daily calorie needs, and personalized Ghanaian nutrition macro breakdown with Registered Dietitian Nana Ama Dwamena."
        keywords="BMI calculator Ghana, daily calorie calculator, Ghanaian nutrition assessment, KnowYourBody DietWithDee"
        url="https://dietwithdee.org/knowYourBody"
      />

      <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-montserrat pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <ProgressBar step={step} />

          {step === 0 && (
            <WelcomeStep
              user={user}
              email={email}
              setEmail={setEmail}
              emailError={emailError}
              setEmailError={setEmailError}
              onNext={handleStartFromWelcome}
            />
          )}

          {step === 1 && (
            <BMIStep
              formData={formData}
              setFormData={setFormData}
              units={units}
              onToggleUnits={handleToggleUnits}
              onBack={() => {
                setStep(0);
                scrollToTop();
              }}
              onNext={() => {
                trigger('success');
                setStep(2);
                scrollToTop();
              }}
            />
          )}

          {step === 2 && (
            <CalorieStep
              formData={formData}
              setFormData={setFormData}
              units={units}
              onBack={() => {
                setStep(1);
                scrollToTop();
              }}
              onNext={handleCompleteAssessment}
            />
          )}

          {step === 3 && (
            <ResultsStep
              results={results}
              snapshot={latestSnapshot}
              emailUsed={activeEmail}
              navigate={navigate}
              trigger={trigger}
              user={user}
              syncStatus={syncStatus}
              signingInToSave={signingInToSave}
              onSignInToSave={handleSignInToSave}
              onRetake={() => {
                setStep(1);
                scrollToTop();
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default KnowYourBody;
