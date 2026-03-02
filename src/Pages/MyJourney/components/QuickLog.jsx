import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiCalendar, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../../AuthContext';

const QuickLog = ({ onComplete }) => {
  const { userProfile, saveUserProfile } = useAuth();
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Use the new historical logging support in saveUserProfile
      const logDate = new Date(date).toISOString();
      await saveUserProfile({ 
        weight: parseFloat(weight),
        loggedAt: logDate 
      }, true); // force log entry

      setShowSuccess(true);
      setWeight('');
      
      setTimeout(() => {
        setShowSuccess(false);
        if (onComplete) onComplete();
      }, 2000);
    } catch (err) {
      console.error('Failed to log weight:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
          <FiPlus size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">Quick Log</h3>
          <p className="text-xs text-gray-400">Track your progress in seconds</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 tracking-wider">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              min="20"
              max="500"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={userProfile?.weight ? `${userProfile.weight} kg` : "Enter weight"}
              className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-orange-200 transition-all font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 tracking-wider">Date</label>
            <div className="relative">
              <input
                type="date"
                value={date}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-orange-200 transition-all font-semibold appearance-none"
              />
              <FiCalendar className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!weight || isSubmitting || showSuccess}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
            showSuccess 
              ? 'bg-green-500 text-white' 
              : 'bg-gradient-to-r from-[#F6841F] to-orange-500 text-white hover:shadow-orange-200 hover:scale-[1.02] active:scale-[0.98]'
          } disabled:opacity-50 disabled:scale-100 disabled:shadow-none`}
        >
          {showSuccess ? (
            <>
              <FiCheck size={18} /> Logged!
            </>
          ) : isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>Log Progress</>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default QuickLog;
