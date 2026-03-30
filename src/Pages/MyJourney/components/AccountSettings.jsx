import React, { useState } from 'react';
import { doc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useAuth } from '../../../AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings, FiLogOut, FiTrash2, FiEdit2, FiBell, FiShield } from 'react-icons/fi';
import OnboardingModal from '../../../Components/OnboardingModal';
import { deleteOwnAccount } from '../../../firebaseUtils';

function AccountSettings() {

    const { user, userProfile, signOut, saveUserProfile } = useAuth();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        if (!user) return;
        setDeleting(true);
        try {
            const result = await deleteOwnAccount();
            if (result.success) {
                // Cloud function handled cleanup, now just sign out
                await signOut();
            } else {
                alert(result.error || 'Failed to delete account. Please try again.');
                // Fallback sign out if it was a permissions issue but data was mostly cleared
                if (result.error?.includes('permission-denied')) {
                    await signOut();
                }
            }
        } catch (err) {
            console.error('Failed to delete account:', err);
            alert('Failed to delete account. Please try again.');
            await signOut();
        }
        setDeleting(false);
        setShowDeleteConfirm(false);
    };


    const handleOnboardingSave = async (formData) => {
        try {
            await saveUserProfile(formData);
            setShowOnboarding(false);
        } catch (err) {
            if (err.message === 'DAILY_LOG_LIMIT_REACHED') {
                alert("You've reached your limit of 4 profile/log updates for today. Please try again tomorrow!");
                setShowOnboarding(false);
            } else {
                console.error('Failed to update profile:', err);
                alert('Failed to update profile. Please try again.');
            }
        }
    };

    const settingsItems = [
        {
            icon: <FiEdit2 size={18} />,
            title: 'Update Profile Info',
            description: 'Edit your health data, goals, and preferences',
            action: () => setShowOnboarding(true),
            enabled: true,
        },
        {
            icon: <FiBell size={18} />,
            title: 'Notification Preferences',
            description: 'Manage push notifications and reminders',
            action: null,
            enabled: false,
            comingSoon: true,
        },
        {
            icon: <FiShield size={18} />,
            title: 'Privacy & Data',
            description: 'Control your data and privacy settings',
            action: null,
            enabled: false,
            comingSoon: true,
        },
    ];

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-3xl mx-auto mb-12"
            >
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-1">
                    <FiSettings size={14} className="inline mr-1.5 -mt-0.5" />
                    Account Settings
                </h3>

                <div className="bg-white rounded-3xl shadow-xl border border-green-100 overflow-hidden">
                    {/* Profile summary */}
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-4">
                        {user?.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt={user.displayName}
                                className="w-12 h-12 rounded-full border-2 border-green-200 object-cover"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-lg font-bold">
                                {user?.displayName?.[0] || '?'}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-base font-bold text-gray-800 truncate">{user?.displayName}</h4>
                            <p className="text-sm text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>

                    {/* Settings items */}
                    <div className="divide-y divide-gray-50">
                        {settingsItems.map((item, i) => (
                            <button
                                key={i}
                                onClick={item.action}
                                disabled={!item.enabled}
                                className={`w-full px-6 py-4 flex items-center gap-4 text-left transition-colors ${item.enabled
                                        ? 'hover:bg-green-50 cursor-pointer'
                                        : 'opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.enabled
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-gray-100 text-gray-400'
                                        }`}
                                >
                                    {item.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h5 className="text-sm font-semibold text-gray-700">{item.title}</h5>
                                        {item.comingSoon && (
                                            <span className="text-[10px] font-semibold bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full">
                                                Coming Soon
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                                </div>
                                {item.enabled && (
                                    <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Danger zone */}
                    <div className="px-6 py-5 bg-gray-50 border-t border-gray-100">
                        <div className="flex flex-col sm:flex-row gap-3">
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
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiLogOut size={22} className="text-gray-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Sign Out?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Your data is saved and you can sign back in anytime.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowLogoutConfirm(false);
                                        signOut();
                                    }}
                                    className="flex-1 py-2.5 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
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
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiTrash2 size={22} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Account?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                This will permanently delete your profile, all log history, and achievements. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleting}
                                    className="flex-1 py-2.5 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {deleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete Forever'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Onboarding Modal for editing profile */}
            <AnimatePresence>
                {showOnboarding && user && (
                    <OnboardingModal
                        userName={user.displayName}
                        onSave={handleOnboardingSave}
                        onClose={() => setShowOnboarding(false)}
                        initialData={userProfile}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

export default AccountSettings;
