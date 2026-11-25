import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Activity, Calendar, ChevronDown, ArrowRight, Flame, Scale, Calculator } from 'lucide-react';
import { db } from '../../../firebaseConfig';
import { useAuth } from '../../../AuthContext';
import { computeResultsFromProfile } from '../../../utils/bookingProfile';

const GOAL_LABELS = {
  lose: 'Lose Weight',
  maintain: 'Maintain Weight',
  gain: 'Gain Weight',
  'Weight Loss': 'Lose Weight',
  'Weight Maintenance': 'Maintain Weight',
  'Muscle Gain': 'Gain Weight'
};

const ACTIVITY_LABELS = {
  sedentary: 'Sedentary',
  light: 'Light Exercise',
  moderate: 'Moderate',
  active: 'Very Active'
};

const formatDate = (iso) => {
  if (!iso) return 'Saved';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return 'Saved';
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const AssessmentsSection = ({ onRunAssessment, onBookWithLatest }) => {
  const { user, userProfile } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!user || !db) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'assessments'),
      orderBy('createdAt', 'desc'),
      limit(15)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setAssessments(rows);
        setLoading(false);
      },
      (err) => {
        console.warn('Could not load assessments subcollection:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const fallbackFromProfile = computeResultsFromProfile(userProfile);
  const latest = assessments[0] || (fallbackFromProfile
    ? {
        ...fallbackFromProfile,
        goal: userProfile?.goal || fallbackFromProfile.goal,
        createdAt: userProfile?.latestAssessmentAt || userProfile?.updatedAt || null
      }
    : null);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 animate-pulse space-y-4">
        <div className="h-4 w-48 bg-stone-200 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="h-20 bg-stone-100 rounded-xl" />
          <div className="h-20 bg-stone-100 rounded-xl" />
          <div className="h-20 bg-stone-100 rounded-xl" />
          <div className="h-20 bg-stone-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-7 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <Calculator size={14} className="text-emerald-700" />
            <span>KnowYourBody Snapshot</span>
          </div>
          <h3 className="text-xl font-serif-cormorant font-semibold text-stone-900">
            No saved health assessment yet
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Take our 2-minute BMI &amp; calorie assessment while signed in — every check auto-saves here and attaches to your consultations with Dee.
          </p>
        </div>

        <button
          type="button"
          onClick={onRunAssessment}
          className="shrink-0 px-5 py-3 rounded-xl bg-[#F6841F] hover:bg-[#e07312] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border-none"
        >
          <span>Run Assessment</span>
          <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <Activity size={14} className="text-emerald-700" />
            <span>Latest KnowYourBody Snapshot</span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Auto-saved {latest.createdAt ? `on ${formatDate(latest.createdAt)}` : 'to your profile'} · automatically attached when booking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRunAssessment}
            className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            New KnowYourBody Test
          </button>
          <button
            type="button"
            onClick={onBookWithLatest}
            className="px-3.5 py-2 rounded-xl bg-[#F6841F] hover:bg-[#e07312] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border-none"
          >
            <span>Book with These Metrics</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-[#F7F9F7] border border-emerald-100 p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            <Scale size={12} className="text-emerald-700" />
            <span>BMI</span>
          </div>
          <p className="text-xl font-bold text-stone-900 mt-1">{latest.bmi || '—'}</p>
          <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">
            {latest.bmiCategory || 'Recorded'}
          </p>
        </div>

        <div className="rounded-xl bg-[#F7F9F7] border border-emerald-100 p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            <Flame size={12} className="text-[#e07312]" />
            <span>Daily Target</span>
          </div>
          <p className="text-xl font-bold text-stone-900 mt-1">
            {latest.dailyCalories ? `${latest.dailyCalories}` : '—'}
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5">kcal / day</p>
        </div>

        <div className="rounded-xl bg-stone-50 border border-stone-200/70 p-3.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
            Measurements
          </span>
          <p className="text-base font-bold text-stone-900 mt-1">
            {latest.weight ? `${latest.weight} kg` : '—'}
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5">
            {latest.height ? `${latest.height} cm` : 'Height not set'}
          </p>
        </div>

        <div className="rounded-xl bg-stone-50 border border-stone-200/70 p-3.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
            Focus Goal
          </span>
          <p className="text-base font-bold text-stone-900 mt-1">
            {GOAL_LABELS[latest.goal] || latest.goal || 'General'}
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5">
            {ACTIVITY_LABELS[latest.activityLevel] || latest.dietaryRestrictions || 'Personalized'}
          </p>
        </div>
      </div>

      {/* Macros + Conditions Tags */}
      {(latest.macros || latest.healthConditions || latest.dislikes || latest.dietaryRestrictions) && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {latest.macros?.protein > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 font-medium">
              Macros: {latest.macros.protein}g P · {latest.macros.carbs}g C · {latest.macros.fats}g F
            </span>
          )}
          {latest.dietaryRestrictions && latest.dietaryRestrictions !== 'None' && (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-medium">
              Diet: {latest.dietaryRestrictions}
            </span>
          )}
          {latest.healthConditions && (
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200/70 font-medium">
              Condition: {latest.healthConditions}
            </span>
          )}
          {latest.dislikes && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/70 font-medium">
              Allergies/Dislikes: {latest.dislikes}
            </span>
          )}
        </div>
      )}

      {/* Past Assessment History Toggle (only when >1 test exists) */}
      {assessments.length > 1 && (
        <div className="border-t border-stone-100 pt-3">
          <button
            type="button"
            onClick={() => setShowHistory((prev) => !prev)}
            className="flex items-center justify-between w-full text-left text-xs font-bold text-stone-700 hover:text-stone-950 cursor-pointer bg-transparent border-none py-1"
          >
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-stone-400" />
              Previous Assessments ({assessments.length})
            </span>
            <ChevronDown
              size={15}
              className={`text-stone-400 transition-transform ${showHistory ? 'rotate-180' : ''}`}
            />
          </button>

          {showHistory && (
            <div className="mt-3 overflow-x-auto border border-stone-100 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-3.5 py-2">Date</th>
                    <th className="px-3.5 py-2">Weight</th>
                    <th className="px-3.5 py-2">BMI</th>
                    <th className="px-3.5 py-2">Calories</th>
                    <th className="px-3.5 py-2">Goal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {assessments.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/70">
                      <td className="px-3.5 py-2.5 text-stone-600">{formatDate(item.createdAt)}</td>
                      <td className="px-3.5 py-2.5 font-semibold text-stone-900">
                        {item.weight ? `${item.weight} kg` : '—'}
                      </td>
                      <td className="px-3.5 py-2.5 text-stone-700">
                        {item.bmi ? `${item.bmi} (${item.bmiCategory || ''})` : '—'}
                      </td>
                      <td className="px-3.5 py-2.5 text-stone-700">
                        {item.dailyCalories ? `${item.dailyCalories} kcal` : '—'}
                      </td>
                      <td className="px-3.5 py-2.5 text-stone-700">
                        {GOAL_LABELS[item.goal] || item.goal || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssessmentsSection;
