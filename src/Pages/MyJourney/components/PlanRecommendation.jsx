import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '../../../AuthContext';
import { FiArrowRight, FiTarget } from 'react-icons/fi';

// Import plan images
import B2B from '../../../assets/images/B2B.webp';
import Gain from '../../../assets/images/Gain.webp';
import Weightloss from '../../../assets/images/Weightloss.webp';
import Diabetes from '../../../assets/images/Diabetes.webp';
import Pressure from '../../../assets/images/Pressure.webp';

const PLANS = [
    {
        id: 'b2b',
        title: 'Back to Basics',
        subtitle: 'A 5-Day Healthy Eating Reset',
        price: '₵349',
        img: B2B,
        url: 'https://paystack.shop/pay/backtobasics',
        tags: ['maintain'],
    },
    {
        id: 'weightloss',
        title: 'Snatched & Nourished',
        subtitle: 'Gentle Weight Loss Guide',
        price: '₵249',
        img: Weightloss,
        url: 'https://paystack.shop/pay/gentleweightloss',
        tags: ['lose'],
    },
    {
        id: 'diabetes',
        title: 'Blood Sugar Balance',
        subtitle: 'A Type 2 Diabetes-Friendly Guide',
        price: '₵299',
        img: Diabetes,
        url: 'https://paystack.shop/pay/bloodsugar',
        tags: ['diabetes'],
    },
    {
        id: 'pressure',
        title: 'Pressure No Dey Catch Me',
        subtitle: 'A Hypertension-Friendly Plan',
        price: '₵299',
        img: Pressure,
        url: 'https://paystack.shop/pay/pressurenodey',
        tags: ['hypertension', 'pressure'],
    },
    {
        id: 'gain',
        title: 'The Weight Gain',
        subtitle: 'Wahala-Free Plan',
        price: '₵249',
        img: Gain,
        url: 'https://paystack.shop/pay/weightgain',
        tags: ['gain'],
    },
];

const conditionLabels = {
    diabetes: 'blood sugar management',
    hypertension: 'blood pressure management',
    pressure: 'blood pressure management',
    default: 'wellness',
};

function getRecommendedPlan(userProfile) {
    if (!userProfile) return PLANS[0];

    const conditions = (userProfile.healthConditions || '').toLowerCase();

    // Health condition takes priority
    if (conditions.includes('diabet')) {
        return PLANS.find((p) => p.id === 'diabetes');
    }
    if (conditions.includes('hypertension') || conditions.includes('pressure') || conditions.includes('bp')) {
        return PLANS.find((p) => p.id === 'pressure');
    }

    // BMI calculation
    const w = parseFloat(userProfile.weight);
    const h = parseFloat(userProfile.height) / 100;
    const bmi = h > 0 ? (w / (h * h)) : 0;

    // Recommendation by BMI category
    if (bmi > 0) {
        if (bmi >= 25) return PLANS.find((p) => p.id === 'weightloss');
        if (bmi < 18.5) return PLANS.find((p) => p.id === 'gain');
    }

    // Fallback default plan
    return PLANS[0];
}

function PlanRecommendation() {
    const navigate = useNavigate();
    const { userProfile } = useAuth();

    const plan = getRecommendedPlan(userProfile);
    if (!plan) return null;


    const conditionKey = (userProfile?.healthConditions || '').toLowerCase().includes('diabet') ? 'diabetes' : (userProfile?.healthConditions || '').toLowerCase().includes('hypertension') || (userProfile?.healthConditions || '').toLowerCase().includes('pressure') ? 'hypertension' : 'default';
    const conditionText = conditionLabels[conditionKey];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl mx-auto mb-12"
        >
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-1">
                <FiTarget size={14} className="inline mr-1.5 -mt-0.5" />
                Recommended for You
            </h3>

            <motion.div
                whileHover={{ y: -3 }}
                className="bg-white rounded-3xl shadow-xl border border-green-100 overflow-hidden cursor-pointer group"
                onClick={() => navigate('/plans')}
            >
                <div className="flex flex-col sm:flex-row">
                    {/* Plan image */}
                    <div className="sm:w-48 h-40 sm:h-auto bg-gradient-to-br from-green-50 to-emerald-50 flex-shrink-0 flex items-center justify-center p-4 overflow-hidden">
                        <img
                            src={plan.img}
                            alt={plan.title}
                            className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>

                    {/* Plan details */}
                    <div className="flex-1 px-6 py-5 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full w-fit mb-3">
                            ✨ Recommended based on your {conditionText}
                        </div>
                        <h4 className="text-xl font-bold text-gray-800 mb-1">{plan.title}</h4>
                        <p className="text-gray-500 text-sm mb-3">{plan.subtitle}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-black text-green-700">{plan.price}</span>
                            <div className="flex items-center gap-3">
                                <a
                                    href={plan.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-5 py-2 bg-gradient-to-r from-[#F6841F] to-orange-500 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all"
                                >
                                    Buy Now
                                </a>
                                <span className="text-green-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                                    View all <FiArrowRight size={14} />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default PlanRecommendation;
