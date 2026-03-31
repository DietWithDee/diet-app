import React, { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, query, orderBy, updateDoc, doc, onSnapshot, getDocs, limit, startAfter } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useAuth } from '../../../AuthContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiActivity, FiTrendingUp } from 'react-icons/fi';
import { Scale, Activity, Target, Flame, CheckCircle, Info, ChevronRight, TrendingDown, TrendingUp } from 'lucide-react';

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

const ProgressChart = React.memo(() => {
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

    // Calculate Trends
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const logsLastWeek = logs.filter(l => new Date(l.loggedAt) >= oneWeekAgo);
    const logsLastMonth = logs.filter(l => new Date(l.loggedAt) >= oneMonthAgo);
    
    let weeklyTrend = 0;
    if (logsLastWeek.length >= 2) {
      weeklyTrend = parseFloat(logsLastWeek[logsLastWeek.length - 1].weight) - parseFloat(logsLastWeek[0].weight);
    }
    
    let monthlyTrend = 0;
    if (logsLastMonth.length >= 2) {
      monthlyTrend = parseFloat(logsLastMonth[logsLastMonth.length - 1].weight) - parseFloat(logsLastMonth[0].weight);
    }

    // Goal Progress Logic
    const initialWeight = logs.length > 0 ? parseFloat(logs[0].weight) : w;
    const targetWeight = userProfile.targetWeight ? parseFloat(userProfile.targetWeight) : (userProfile.goal === 'lose' ? initialWeight - 5 : userProfile.goal === 'gain' ? initialWeight + 5 : initialWeight);
    
    let progress = 0;
    if (userProfile.goal === 'lose') {
      const needed = initialWeight - targetWeight;
      const lost = initialWeight - w;
      progress = needed > 0 ? (lost / needed) * 100 : 0;
    } else if (userProfile.goal === 'gain') {
      const needed = targetWeight - initialWeight;
      const gained = w - initialWeight;
      progress = needed > 0 ? (gained / needed) * 100 : 0;
    } else {
      // Maintain Logic: Percentage based on staying within a 2kg tolerance
      const diff = Math.abs(w - targetWeight);
      progress = Math.max(0, 100 - (diff / 2 * 100));
    }
    
    // Bounds for display
    progress = Math.max(0, Math.min(100, Math.round(progress)));

    return { 
      weight: w, 
      bmi, 
      bmiCategory, 
      calories: Math.round(goalCalories),
      weeklyTrend: Math.round(weeklyTrend * 10) / 10,
      monthlyTrend: Math.round(monthlyTrend * 10) / 10,
      logCountMonth: logsLastMonth.length,
      progress: Math.round(progress)
    };
  }, [userProfile, logs]);

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
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 sm:px-8 py-5 sm:py-6 flex items-center gap-4 sm:gap-6 relative overflow-hidden">

          <div className="relative flex-shrink-0 group">
            {/* Progress Ring */}
            <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] -rotate-90 pointer-events-none">
              <circle
                cx="50%"
                cy="50%"
                r="48%"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="3"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="48%"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 1000" }}
                animate={{ strokeDasharray: `${(stats?.progress / 100) * 251} 1000` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white shadow-xl object-cover relative z-10"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold border-2 border-white relative z-10">
                {user?.displayName?.[0] || '?'}
              </div>
            )}
            
            {/* Progress Badge */}
            <div className="absolute -bottom-1 -right-1 bg-white text-green-700 text-[10px] font-black px-1.5 py-0.5 rounded-lg shadow-lg z-20 border border-green-100">
              {stats?.progress}%
            </div>
          </div>

          <div className="flex-1 min-w-0 relative z-10">
            <h2 className="text-white text-lg sm:text-xl font-bold tracking-tight leading-tight">
              {user?.displayName 
                ? `${user.displayName.split(' ')[0]}${user.displayName.split(' ')[0].endsWith('s') ? "'" : "'s"} Journey`
                : 'Your Journey'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-green-50 text-xs sm:text-sm font-medium opacity-90">Track your wellness progress</p>
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-8 py-5 sm:py-6">


          {/* Headline stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
              {[
                { 
                  label: 'Current Weight', 
                  value: stats.weight, 
                  unit: 'kg', 
                  icon: <Scale size={16} />, 
                  color: 'text-emerald-700',
                  bg: 'from-emerald-50 to-green-50',
                  context: stats.weeklyTrend !== 0 ? `${stats.weeklyTrend > 0 ? '+' : ''}${stats.weeklyTrend} kg this week` : null
                },
                { 
                  label: 'Latest BMI', 
                  value: stats.bmi, 
                  unit: '', 
                  icon: <Activity size={16} />, 
                  color: 'text-emerald-700',
                  bg: 'from-emerald-50 to-green-50',
                  context: <span className={bmiColor(stats.bmiCategory)}>{stats.bmiCategory}</span>
                },
                { 
                  label: 'Journey Goal', 
                  value: userProfile?.goal === 'lose' ? 'Lose Weight' : userProfile?.goal === 'gain' ? 'Gain Weight' : 'Maintain', 
                  unit: '', 
                  icon: <Target size={16} />, 
                  color: 'text-emerald-700',
                  bg: 'from-emerald-50 to-green-50',
                  context: `${stats.progress}% of goal`
                },
                { 
                  label: 'Daily Target', 
                  value: stats.calories, 
                  unit: 'kcal', 
                  icon: <Flame size={16} />, 
                  color: 'text-emerald-700',
                  bg: 'from-emerald-50 to-green-50',
                  context: `${stats.logCountMonth} logs this month`
                },
              ].map((item, idx) => (
                <div key={idx} className={`bg-gradient-to-br ${item.bg} rounded-2xl p-3 border border-white shadow-sm flex flex-col items-center text-center transition-transform hover:scale-[1.02]`}>
                  <div className={`w-7 h-7 rounded-lg bg-white/80 flex items-center justify-center mb-1.5 shadow-sm ${item.color}`}>
                    {React.cloneElement(item.icon, { size: 14 })}
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{item.label}</div>
                  <div className={`text-base sm:text-lg font-black ${item.color}`}>
                    {item.value}
                    {item.unit && <span className="text-[10px] ml-1 opacity-60 font-medium">{item.unit}</span>}
                  </div>
                  {item.context && (
                    <div className="mt-1.5 text-[9px] font-bold py-0.5 px-2 bg-white/60 rounded-full text-gray-500">
                      {item.context}
                    </div>
                  )}
                </div>
              ))}
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
            <div className="h-48 flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100 mb-4 px-6">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                <FiActivity size={24} className="text-green-400" />
              </div>
              <h4 className="text-sm font-bold text-gray-700 mb-1">No weight logs yet</h4>
              <p className="text-gray-400 text-xs max-w-[200px] mb-4">Add your first entry to see your wellness trends and progress.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLogForm(true)}
                className="px-6 py-2 bg-green-500 text-white text-xs font-bold rounded-full shadow-md hover:bg-green-600 shadow-green-100 transition-all flex items-center gap-2"
              >
                <FiPlus size={14} /> Add Your First Entry
              </motion.button>
            </div>
          ) : (
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
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
                    strokeWidth={3}
                    dot={{ r: 3, fill: metric.color, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0, fill: metric.color }}
                  />
                </LineChart>
              </ResponsiveContainer>
              
              {/* Primary CTA below chart */}
              <div className="mt-4 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowLogForm(!showLogForm)}
                  className={`px-8 py-3 rounded-full font-black text-sm shadow-lg transition-all flex items-center gap-2 ${
                    showLogForm 
                      ? 'bg-gray-100 text-gray-500 shadow-none' 
                      : 'bg-green-500 text-white hover:bg-green-600 shadow-green-100'
                  }`}
                >
                  {showLogForm ? <FiX size={18} /> : <FiPlus size={18} />}
                  {showLogForm ? 'Cancel Entry' : 'Add New Entry'}
                </motion.button>
              </div>
            </div>
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

          {/* Inline log form - Moved to bottom */}
          <AnimatePresence>
            {showLogForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmitLog}
                className="mt-6 mb-2 overflow-hidden"
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
});

export default ProgressChart;
