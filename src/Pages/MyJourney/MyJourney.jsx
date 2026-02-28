import React from 'react';
import SEO from '../../Components/SEO';
import { useNavigate } from 'react-router';
import { FiTrendingUp, FiSettings, FiBookOpen, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import JourneyHero from '../../assets/journey_glossy.webp';

function MyJourney() {
    const navigate = useNavigate();

    const upcomingFeatures = [
        {
            icon: <FiTrendingUp size={28} />,
            title: 'Track Your Progress',
            description:
                'Monitor your wellness milestones, weight goals, and daily nutrition intake with beautiful charts and insights.',
        },
        {
            icon: <FiSettings size={28} />,
            title: 'Manage Your Settings',
            description:
                'Customize your dietary preferences, notification schedules, and personal profile all in one place.',
        },
        {
            icon: <FiBookOpen size={28} />,
            title: 'Curated Content',
            description:
                'Access hand-picked articles, meal plans, and expert tips tailored to your unique health goals.',
        },
        {
            icon: <FiStar size={28} />,
            title: 'Achievements & Rewards',
            description:
                'Earn badges and celebrate milestones as you stay consistent on your wellness journey.',
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

    return (
        <>
            <SEO
                title="My Journey | DietWithDee"
                description="Your personal wellness dashboard — coming soon. Track progress, manage settings, and access curated content with DietWithDee."
                keywords="Diet Journey, Progress Tracking, Wellness Dashboard, DietWithDee"
                url="https://dietwithdee.org/my-journey"
            />

            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 w-full overflow-hidden">
                
                {/* Hero Section Container */}
                <div className="relative w-full h-[40vh] min-h-[300px] max-h-[450px] flex items-center justify-center overflow-hidden">
                    
                    {/* Background Image with slight zoom animation */}
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
                        {/* Dark overlay specifically for text contrast if needed, subtle */}
                        <div className="absolute inset-0 bg-black/10"></div>
                    </motion.div>

                    {/* Content Overlay */}
                    <div className="relative z-10 text-center px-4 w-full">
                        <motion.div 
                            variants={staggerContainer}
                            initial="hidden"
                            animate="show"
                            className="max-w-4xl mx-auto flex flex-col items-center"
                        >
                            <motion.h1 
                                variants={fadeUp}
                                className="text-5xl md:text-7xl lg:text-8xl font-black text-white drop-shadow-xl tracking-tight mb-4"
                            >
                                My Journey
                            </motion.h1>
                            <motion.div variants={fadeUp} className="w-24 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mx-auto mb-6 shadow-md"></motion.div>
                            <motion.p 
                                variants={fadeUp}
                                className="text-xl md:text-2xl text-white font-medium drop-shadow-md max-w-2xl px-4"
                            >
                                Your personalized path to lasting wellness starts here.
                            </motion.p>
                        </motion.div>
                    </div>

                    {/* Essential Bottom Gradient - Blends the image seamlessly back into the page */}
                    <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-emerald-50 via-white/80 to-transparent z-10 pointer-events-none"></div>
                </div>

                <div className="container mx-auto px-6 lg:px-12 pt-12 pb-20 relative z-20">
                    {/* Header Details */}
                    <motion.div 
                        initial="hidden"
                        animate="show"
                        variants={staggerContainer}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        {/* Badge */}
                        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-600 font-semibold text-sm px-5 py-2 rounded-full mb-8 shadow-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                            </span>
                            Coming Soon
                        </motion.div>

                        <motion.p variants={fadeUp} className="text-lg lg:text-xl text-gray-600 leading-relaxed mb-8">
                            We're building something special just for you.{' '}
                            <span className="text-green-700 font-bold">My Journey</span> will
                            be your personalised wellness hub...a place to track your
                            progress, manage your preferences, and discover content curated
                            for your goals.
                        </motion.p>

                        <motion.div variants={fadeUp} className="bg-orange-50 rounded-2xl p-6 border border-orange-100 inline-block max-w-lg shadow-sm w-full mx-4 sm:w-auto sm:mx-0">
                            <p className="text-orange-900 font-medium mb-4">
                                Create an account with us to be notified when this is available!
                            </p>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-10 py-3 bg-[#F6841F] text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-orange-600 w-full sm:w-auto"
                            >
                                Get started
                            </motion.button>
                        </motion.div>
                    </motion.div>

                    {/* Under construction illustration */}
                    <motion.div 
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={fadeUp}
                        className="relative max-w-md mx-auto mb-16"
                    >
                        <div className="absolute -top-6 -left-6 w-48 h-48 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-30 blur-3xl"></div>
                        <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-tr from-orange-200 to-yellow-200 rounded-full opacity-30 blur-3xl"></div>

                        <div className="relative bg-white rounded-3xl shadow-xl p-10 text-center border border-green-100">
                            <div className="text-6xl mb-4">🚧</div>
                            <h2 className="text-2xl font-bold text-green-800 mb-2">
                                Page Under Development
                            </h2>
                            <p className="text-gray-500">
                               We are hard at work crafting this experience. Let Us cook!
                            </p>
                        </div>
                    </motion.div>

                    {/* Feature teasers */}
                    <div className="max-w-5xl mx-auto">
                        <motion.h3 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center text-2xl lg:text-3xl font-bold text-green-800 mb-10"
                        >
                            What to Expect
                        </motion.h3>

                        <motion.div 
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, margin: "-50px" }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                        >
                            {upcomingFeatures.map((feature, idx) => (
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
                </div>
            </div>
        </>
    );
}

export default MyJourney;

