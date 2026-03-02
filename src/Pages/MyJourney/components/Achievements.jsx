import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useAuth } from '../../../AuthContext';
import { motion } from 'framer-motion';
import { FiAward, FiShare2 } from 'react-icons/fi';
import AchievementShareCard from '../../../Components/AchievementShareCard';

import { BADGE_DEFINITIONS } from '../../../constants/badges';

function Achievements() {
    const { user, userProfile } = useAuth();
    const [logCount, setLogCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sharingBadge, setSharingBadge] = useState(null);

    const handleShare = (e, badge) => {
        e.stopPropagation();
        setSharingBadge(badge);
    };

    useEffect(() => {
        if (!user) return;
        const fetchLogCount = async () => {
            try {
                const q = query(collection(db, 'users', user.uid, 'logs'), orderBy('loggedAt', 'desc'));
                const snap = await getDocs(q);
                setLogCount(snap.size);
            } catch (err) {
                console.error('Failed to fetch log count:', err);
            }
            setLoading(false);
        };
        fetchLogCount();
    }, [user]);

    const earnedBadges = BADGE_DEFINITIONS.map((badge) => ({
        ...badge,
        earned: badge.check(userProfile, logCount),
    }));

    const earnedCount = earnedBadges.filter((b) => b.earned).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto mb-12"
        >
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    <FiAward size={14} className="inline mr-1.5 -mt-0.5" />
                    Achievements
                </h3>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    {earnedCount}/{BADGE_DEFINITIONS.length} earned
                </span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                {loading
                    ? [1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 w-32 h-36 bg-gray-100 rounded-2xl animate-pulse snap-start"
                        ></div>
                    ))
                    : earnedBadges.map((badge) => (
                        <motion.div
                            key={badge.id}
                            whileHover={{ y: -4, scale: 1.03 }}
                            className={`flex-shrink-0 w-32 rounded-2xl p-4 text-center transition-all snap-start ${badge.earned
                                    ? 'bg-white shadow-lg border border-green-100'
                                    : 'bg-gray-50 border border-gray-100 opacity-50'
                                }`}
                        >
                            <div className="relative">
                                <div
                                    className={`text-3xl mb-2 ${badge.earned ? '' : 'grayscale'}`}
                                >
                                    {badge.earned ? badge.emoji : '🔒'}
                                </div>
                                {badge.earned && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                                    >
                                        <span className="text-white text-xs">✓</span>
                                    </motion.div>
                                )}
                            </div>

                            <h4
                                className={`text-xs font-bold mb-0.5 ${badge.earned ? 'text-gray-800' : 'text-gray-400'
                                    }`}
                            >
                                {badge.title}
                            </h4>
                            <p
                                className={`text-[10px] leading-tight ${badge.earned ? 'text-gray-400' : 'text-gray-300'
                                    }`}
                            >
                                {badge.description}
                            </p>

                            {/* Share Button (only if earned) */}
                            {badge.earned && (
                                <button
                                    onClick={(e) => handleShare(e, badge)}
                                    disabled={sharingBadge !== null}
                                    className="mt-3 w-full py-1.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 rounded-full transition-colors disabled:opacity-50"
                                >
                                    {sharingBadge?.id === badge.id ? (
                                        <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <FiShare2 size={12} />
                                    )}
                                    Share
                                </button>
                            )}

                        </motion.div>
                    ))}
            </div>

            {/* Invisible Share Card Generator */}
            {sharingBadge && (
                <AchievementShareCard
                    badge={sharingBadge}
                    userName={user.displayName?.split(' ')[0] || 'there'}
                    date={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    onComplete={() => setSharingBadge(null)}
                />
            )}
        </motion.div>
    );
}

export default Achievements;
