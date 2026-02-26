import React from 'react';
import SEO from '../../Components/SEO';
import { useNavigate } from 'react-router';
import { FiTrendingUp, FiSettings, FiBookOpen, FiStar } from 'react-icons/fi';

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

    return (
        <>
            <SEO
                title="My Journey | DietWithDee"
                description="Your personal wellness dashboard — coming soon. Track progress, manage settings, and access curated content with DietWithDee."
                keywords="Diet Journey, Progress Tracking, Wellness Dashboard, DietWithDee"
                url="https://dietwithdee.org/my-journey"
            />

            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                <div className="container mx-auto px-6 lg:px-12 pt-28 pb-20">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-600 font-semibold text-sm px-5 py-2 rounded-full mb-6 shadow-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                            </span>
                            Coming Soon
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600 leading-tight mb-6">
                            My Journey
                        </h1>
                        <div className="w-20 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-8"></div>

                        <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                            We're building something special just for you.{' '}
                            <span className="text-green-700 font-bold">My Journey</span> will
                            be your personalised wellness hub...a place to track your
                            progress, manage your preferences, and discover content curated
                            for your goals.
                        </p>
                    </div>

                    {/* Under construction illustration */}
                    <div className="relative max-w-md mx-auto mb-16">
                        <div className="absolute -top-6 -left-6 w-48 h-48 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-30 blur-3xl"></div>
                        <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-tr from-orange-200 to-yellow-200 rounded-full opacity-30 blur-3xl"></div>

                        <div className="relative bg-white rounded-3xl shadow-xl p-10 text-center border border-green-100">
                            <div className="text-6xl mb-4">🚧</div>
                            <h2 className="text-2xl font-bold text-green-800 mb-2">
                                Page Under Development
                            </h2>
                            <p className="text-gray-500">
                               Godwin and Prince are hard at work crafting this experience. Let Us cook!
                            </p>
                        </div>
                    </div>

                    {/* Feature teasers */}
                    <div className="max-w-5xl mx-auto">
                        <h3 className="text-center text-2xl lg:text-3xl font-bold text-green-800 mb-10">
                            What to Expect
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {upcomingFeatures.map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="group bg-white rounded-2xl p-6 shadow-md border border-green-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
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
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-16">
                        <p className="text-gray-600 mb-6">
                            In the meantime, explore our plans or check out the blog for tips
                            and inspiration.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/plans')}
                                className="px-8 py-4 bg-gradient-to-r from-[#F6841F] to-[#F6841F] text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:from-orange-600 hover:to-orange-400"
                            >
                                Explore Plans
                            </button>
                            <button
                                onClick={() => navigate('/blog')}
                                className="px-8 py-4 border-2 border-green-600 text-green-700 font-bold rounded-full hover:bg-green-50 transition-all duration-300 hover:shadow-md"
                            >
                                Read the Blog
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MyJourney;
