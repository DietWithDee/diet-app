import React, { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, query, orderBy, updateDoc, doc, onSnapshot, getDocs, limit, startAfter } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useAuth } from '../../../AuthContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiActivity } from 'react-icons/fi';

const FILTERS = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '3M', days: 90 },
  { label: 'All', days: null },
];

const METRICS = [
  { key: 'weight', label: 'Weight', unit: 'kg', color: '#16a34a' },
  { key: 'bmi', label: 'BMI', unit: '', color: '#f59e0b' },
];

function ProgressChart() {
  const { user, userProfile, saveUserProfile } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeMetric, setActiveMetric] = useState('weight');
  const [showLogForm, setShowLogForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newLog, setNewLog] = useState({ weight: '', height: '' });
  
  // Pagination & Limits state
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMoreLogs, setHasMoreLogs] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const LOGS_PER_PAGE = 30;

  // Initial load
  useEffect(() => {
    if (!user) return;
    
    setLoadingLogs(true);
    const q = query(
      collection(db, 'users', user.uid, 'logs'),
      orderBy('loggedAt', 'desc'), // Fetch newest first
      limit(LOGS_PER_PAGE)
    );

    // We keep onSnapshot for the first page so new entries appear immediately
    const unsubscribe = onSnapshot(q, (snap) => {
      const newLogs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Reverse to chronological for the chart (oldest to newest)
      setLogs(newLogs.reverse());
      
      if (snap.docs.length > 0) {
        // Since we fetched desc, the last doc in snap is the oldest of this batch
        setLastVisible(snap.docs[snap.docs.length - 1]);
      }
      setHasMoreLogs(snap.docs.length === LOGS_PER_PAGE);
      setLoadingLogs(false);
    }, (err) => {
      console.error('Logs listener error:', err);
      setLoadingLogs(false);
    });

    return () => unsubscribe();
  }, [user]);

  const loadMoreLogs = async () => {
    if (!user || !lastVisible || !hasMoreLogs) return;
    setLoadingMore(true);

    try {
      const q = query(
        collection(db, 'users', user.uid, 'logs'),
        orderBy('loggedAt', 'desc'),
        startAfter(lastVisible),
        limit(LOGS_PER_PAGE)
      );

      const snap = await getDocs(q);
      const olderLogs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (olderLogs.length > 0) {
        // Prepend older logs (already reversed during map conceptually, but we need them in chronological order)
        // olderLogs are desc (newest of the old -> oldest of the old)
        // We want oldest -> newest
        const chronologicalOlder = olderLogs.reverse();
        setLogs((prev) => [...chronologicalOlder, ...prev]);
        setLastVisible(snap.docs[snap.docs.length - 1]);
      }
      
      setHasMoreLogs(snap.docs.length === LOGS_PER_PAGE);
    } catch (err) {
      console.error('Failed to load more logs:', err);
    }
    setLoadingMore(false);
  };

  const chartData = useMemo(() => {
    const filter = FILTERS.find((f) => f.label === activeFilter);
    let filtered = logs;
    if (filter?.days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - filter.days);
      filtered = logs.filter((l) => new Date(l.loggedAt) >= cutoff);
    }
    return filtered.map((l) => {
      const w = parseFloat(l.weight);
      const h = parseFloat(l.height) / 100;
      const bmi = h > 0 ? Math.round((w / (h * h)) * 10) / 10 : null;
      const date = new Date(l.loggedAt);
      return {
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        fullDate: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        weight: w || null,
        bmi,
      };
    });
  }, [logs, activeFilter]);

  const stats = useMemo(() => {
    if (!userProfile) return null;
    const w = parseFloat(userProfile.weight);
    const h = parseFloat(userProfile.height) / 100;
    const age = parseFloat(userProfile.age);
    const bmi = h > 0 ? Math.round((w / (h * h)) * 10) / 10 : 0;
    let bmiCategory = '';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi < 25) bmiCategory = 'Normal';
    else if (bmi < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';
    const genderFactor = userProfile.gender === 'male' ? 5 : -161;
    const bmr = 10 * w + 6.25 * parseFloat(userProfile.height) - 5 * age + genderFactor;
    const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
    const tdee = bmr * (multipliers[userProfile.activityLevel] || 1.2);
    let goalCalories = tdee;
    if (userProfile.goal === 'lose') goalCalories = tdee - 500;
    else if (userProfile.goal === 'gain') goalCalories = tdee + 500;
    return { weight: w, bmi, bmiCategory, calories: Math.round(goalCalories) };
  }, [userProfile]);

  const handleSubmitLog = async (e) => {
    e.preventDefault();
    if (!newLog.weight || !user) return;
    setSaving(true);
    try {
      // Create the log object
      const logData = {
        weight: newLog.weight,
        height: newLog.height || userProfile?.height || '',
        goal: userProfile?.goal || '',
        loggedAt: new Date().toISOString(),
      };

      // Update local profile representation
      const profileUpdate = { weight: logData.weight };
      if (newLog.height) profileUpdate.height = newLog.height;
      if (logData.goal) profileUpdate.goal = logData.goal;

      await saveUserProfile(profileUpdate, true); // true = isManualLog

      setNewLog({ weight: '', height: '' });
      setShowLogForm(false);
    } catch (err) {
      if (err.message === 'DAILY_LOG_LIMIT_REACHED') {
        setShowLimitModal(true);
        setShowLogForm(false);
      } else {
        console.error('Failed to save log:', err);
        alert('Failed to save entry. Please try again.');
      }
    }
    setSaving(false);
  };

  const bmiColor = (cat) => {
    if (cat === 'Normal') return 'text-green-600';
    if (cat === 'Underweight') return 'text-blue-500';
    if (cat === 'Overweight') return 'text-orange-500';
    return 'text-red-500';
  };

  const metric = METRICS.find((m) => m.key === activeMetric);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-100 px-3 py-2 text-xs">
        <p className="text-gray-500 mb-0.5">{d.payload.fullDate}</p>
        <p className="font-bold" style={{ color: metric.color }}>
          {d.value} {metric.unit}
        </p>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto mb-12"
    >
      <div className="bg-white rounded-3xl shadow-xl border border-green-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-5">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white shadow-lg object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
              {user?.displayName?.[0] || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-white text-base sm:text-lg font-bold truncate">
              {user?.displayName?.split(' ')[0]}'s Journey
            </h2>
            <p className="text-green-100 text-xs sm:text-sm">Track your progress</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLogForm(!showLogForm)}
            className="px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-semibold rounded-full transition-all flex items-center gap-1.5 backdrop-blur-sm flex-shrink-0"
          >
            {showLogForm ? <FiX size={14} /> : <FiPlus size={14} />}
            {showLogForm ? 'Cancel' : 'Log Data'}
          </motion.button>
        </div>

        <div className="px-5 sm:px-8 py-5 sm:py-6">
          {/* Inline log form */}
          <AnimatePresence>
            {showLogForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmitLog}
                className="mb-5 overflow-hidden"
              >
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newLog.weight}
                        onChange={(e) => setNewLog((p) => ({ ...p, weight: e.target.value }))}
                        placeholder={userProfile?.weight || '70'}
                        className="w-full px-3 py-2 rounded-xl border border-green-200 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none text-sm bg-white text-black font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Height (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newLog.height}
                        onChange={(e) => setNewLog((p) => ({ ...p, height: e.target.value }))}
                        placeholder={userProfile?.height || '170'}
                        className="w-full px-3 py-2 rounded-xl border border-green-200 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none text-sm bg-white text-black font-medium"
                      />
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={saving}
                    className="mt-3 w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-full text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiPlus size={14} /> Save Entry
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Headline stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-2.5 sm:p-3 text-center">
                <div className="text-[10px] sm:text-xs text-gray-400 font-medium tracking-tight">Current Weight</div>
                <div className="text-sm sm:text-lg font-bold text-gray-800">{stats.weight}<span className="text-[10px] sm:text-xs text-gray-400 ml-0.5">kg</span></div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-2.5 sm:p-3 text-center">
                <div className="text-[10px] sm:text-xs text-gray-400 font-medium tracking-tight">Latest BMI</div>
                <div className="text-sm sm:text-lg font-bold text-gray-800">{stats.bmi}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-2.5 sm:p-3 text-center">
                <div className="text-[10px] sm:text-xs text-gray-400 font-medium tracking-tight">Status</div>
                <div className={`text-sm sm:text-lg font-bold ${bmiColor(stats.bmiCategory)}`}>{stats.bmiCategory}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-2.5 sm:p-3 text-center">
                <div className="text-[10px] sm:text-xs text-gray-400 font-medium tracking-tight">Daily Target</div>
                <div className="text-sm sm:text-lg font-bold text-gray-800">{stats.calories} <span className="text-[10px] sm:text-xs text-gray-400">kcal</span></div>
              </div>
            </div>
          )}

          {/* Metric toggle + Filter controls */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-0.5 bg-gray-100 rounded-full p-0.5">
              {METRICS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setActiveMetric(m.key)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                    activeMetric === m.key
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {FILTERS.map((f) => (
                <button
                  key={f.label}
                  onClick={() => setActiveFilter(f.label)}
                  className={`px-2.5 py-1 text-[10px] sm:text-xs font-semibold rounded-full transition-all ${
                    activeFilter === f.label
                      ? 'bg-green-600 text-white'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Single-line chart */}
          {loadingLogs ? (
            <div className="h-40 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : chartData.length < 2 ? (
            <div className="h-32 flex flex-col items-center justify-center text-center">
              <FiActivity size={22} className="text-green-300 mb-2" />
              <p className="text-gray-400 text-sm">Log your weight to see your trend here.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey={activeMetric}
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={{ r: 2, fill: metric.color, strokeWidth: 0 }}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {/* Load More Button */}
          {hasMoreLogs && !loadingLogs && logs.length >= LOGS_PER_PAGE && (
            <div className="mt-4 text-center">
              <button
                onClick={loadMoreLogs}
                disabled={loadingMore}
                className="px-4 py-1.5 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 text-xs font-semibold rounded-full transition-colors inline-flex items-center gap-2"
              >
                {loadingMore ? (
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiPlus size={12} />
                )}
                Load More History
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Limit Modal */}
      <AnimatePresence>
        {showLimitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => setShowLimitModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-orange-50 p-6 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
                  <span className="text-3xl">🛑</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Take a breather!</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  You've reached your limit of <strong>4 logs per day</strong>. Consistency is key, but tracking too often can be stressful. We'll see you tomorrow!
                </p>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ProgressChart;
