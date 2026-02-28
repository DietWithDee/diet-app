import React, { useState, useEffect, useRef } from 'react';
import SEO from '../../Components/SEO';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import Avocado from '../../assets/avocado_journey.webp';
import Dee from '../../assets/images/Dee1.webp';
import InstallPrompt from '../../Components/InstallPrompt';

// Animated Counter Component
const AnimatedCounter = ({ target, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) observer.observe(counterRef.current);

    return () => {
      if (counterRef.current) observer.unobserve(counterRef.current);
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime = null;
    const startCount = 0;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(startCount + (target - startCount) * easeOutQuart);
      setCount(currentCount);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isVisible, target, duration]);

  return (
    <div ref={counterRef} className="text-4xl font-bold">
      {count}
      {suffix}
    </div>
  );
};

function Home() {
  const navigate = useNavigate();

  // Animation variants
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

  const scaleRight = {
    hidden: { scaleX: 0, originX: 0 },
    show: { 
      scaleX: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const floatingImage = {
    hidden: { opacity: 0, x: 50 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 40, damping: 20 }
    },
    float: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <>
      <SEO
        title="Your Favourite Dietitian | Nana Ama Dwamena"
        description="Welcome to DietWithDee, your ultimate destination for personalized diet plans and expert nutrition advice in Ghana. Start your wellness journey with Nana Ama Dwamena."
        keywords="Dietitian, Nutritionist, Ghana, Nana Ama Dwamena, Weight Loss, Wellness, Healthy Eating, Diet With Dee"
        image="https://dietwithdee.org/LOGO.webp"
        url="https://dietwithdee.org/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "DietWithDee",
          url: "https://dietwithdee.org",
          logo: "https://dietwithdee.org/LOGO.webp",
          sameAs: [
            "https://www.tiktok.com/@dietwithdee?_t=ZM-8yWNZKQGM8G&_r=1",
            "https://www.instagram.com/diet.withdee?igsh=MW03bXpwMjhyZWEyNA%3D%3D&utm_source=qr",
            "https://www.linkedin.com/company/dietwithdee/"
          ]
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 pt-20 lg:pt-20">
          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
            {/* Left: Text Content */}
            <div className="flex-1 max-w-2xl">
              <motion.div 
                className="space-y-8"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                <div className="space-y-4">
                  <motion.h1 
                    variants={fadeUp}
                    className="text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-700 leading-tight"
                  >
                    Your Wellness
                    <br />
                    <span className="text-green-700">Journey </span>
                    <br />
                    <span className="text-green-700">Starts </span>
                    <span className="text-green-700">Here</span>
                  </motion.h1>
                  <motion.div variants={scaleRight} className="w-18 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></motion.div>
                </div>

                <motion.div variants={fadeUp} className="space-y-6">
                  <p className="text-lg lg:text-xl text-gray-700 leading-relaxed font-medium pt-3">
                    Welcome to <span className="italic font-semibold text-green-700">DietWithDee</span>,
                    your ultimate destination for personalized diet plans and consultations!
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Whether you're aiming to lose weight, manage a health condition, or simply eat healthier, we're here to make it happen. Join us on a delicious journey to a better you!
                  </p>
                </motion.div>

                {/* Buttons */}
                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 pt-6">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/knowyourbody')}
                    className="px-8 py-4 bg-gradient-to-r from-[#F6841F] to-[#F6841F] text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:from-orange-600 hover:to-orange-400"
                  >
                    Start Your Journey
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/about')}
                    className="px-8 py-4 border-2 border-green-600 text-green-700 font-bold rounded-full hover:bg-green-50 transition-all duration-300 hover:shadow-md"
                  >
                    Learn More
                  </motion.button>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div variants={fadeUp} className="flex flex-row items-start gap-4 sm:gap-8 pt-8 text-xs text-gray-600">
                  <div className="flex items-start gap-2 max-w-[90px]">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-0.5 flex-shrink-0"></div>
                    <span className="leading-tight">300+ Success Stories</span>
                  </div>
                  <div className="flex items-start gap-2 max-w-[90px]">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full mt-0.5 flex-shrink-0"></div>
                    <span className="leading-tight">Expert Dietitians</span>
                  </div>
                  <div className="flex items-start gap-2 max-w-[90px]">
                    <div className="w-3 h-3 bg-green-400 rounded-full mt-0.5 flex-shrink-0"></div>
                    <span className="leading-tight">Personalized Plans</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Right: Image */}
            <div className="flex-1 relative max-w-lg w-full">
              <div className="absolute -top-4 -right-4 w-72 h-62 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-54 bg-gradient-to-tr from-emerald-300 to-green-300 rounded-full opacity-15 blur-2xl"></div>

              <motion.div 
                className="relative z-10 p-4 lg:p-8"
                variants={floatingImage}
                initial="hidden"
                animate={["show", "float"]}
              >
                <div className="bg-transparent rounded-3xl transition-all duration-500 hover:scale-[1.02]">
                  <div className="w-full flex items-center justify-center relative">
                    {/* Glowing effect behind image */}
                    <div className="absolute inset-0 bg-green-300/20 rounded-full blur-3xl filter transform scale-75"></div>
                    <img src={Avocado} alt="Journey to a Healthier You" className="object-contain w-[120%] max-w-none relative z-10 drop-shadow-2xl" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* About Section */}
          <div className="py-16 mt-12 bg-gradient-to-b from-transparent to-green-50 rounded-3xl mb-8">
            <div className="container mx-auto px-2 lg:px-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
                {/* Left: Image */}
                <motion.div 
                  className="flex-1 relative max-w-lg order-2 lg:order-1"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                >
                  <div className="absolute -top-6 -left-6 w-72 h-72 bg-gradient-to-br from-emerald-200 to-green-200 rounded-full opacity-20 blur-3xl"></div>
                  <div className="absolute -bottom-4 -right-4 w-64 h-64 bg-gradient-to-tr from-green-300 to-emerald-300 rounded-full opacity-15 blur-2xl"></div>

                  <div className="relative z-10 p-1 lg:p-3">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 hover:scale-105">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 via-transparent to-transparent z-10"></div>
                        <div className="aspect-square w-full overflow-hidden">
                          <img
                            className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-110"
                            src={Dee}
                            alt="Dee - Professional Nutritionist"
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent p-7 z-20">
                          <div className="text-center">
                            <p className="text-base text-gray-800 font-medium">Nana Ama Dwamena, RD.</p>
                            <div className="flex items-center justify-center gap-3 pt-2">
                              <span className="text-sm text-gray-600">Founder, DietWithDee</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Right: Text */}
                <div className="flex-1 max-w-2xl order-1 lg:order-2">
                  <motion.div 
                    className="space-y-8"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                  >
                    <div className="space-y-4">
                      <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600 leading-tight">
                        Our Story
                      </motion.h2>
                      <motion.div variants={scaleRight} className="w-20 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></motion.div>
                    </div>

                    <div className="space-y-6">
                      <motion.p variants={fadeUp} className="text-lg text-gray-700 leading-relaxed">
                        Here at <span className="italic font-semibold text-green-700">DietWithDee</span>, we believe that nutrition is the cornerstone of a vibrant life, and we're here to guide you every step of the way. Our mission is to provide personalized diet plans, delicious recipes, and expert advice to help you reach your wellness goals. DietWithDee is here to support you every step of the way. Let's make healthy living enjoyable and sustainable together!
                      </motion.p>

                      <motion.div 
                        variants={fadeUp}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-l-4 border-green-500 relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-200 rounded-full opacity-20 -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
                        <p className="text-lg font-semibold text-green-800 italic relative z-10">
                          "We strive continually to help you take control of your health in all aspects."
                        </p>
                      </motion.div>
                    </div>

                    <div className="space-y-6">
                      <motion.p variants={fadeUp} className="text-lg text-gray-700 leading-relaxed">
                        Our expert made plans are tailored to your unique needs, preferences, and lifestyle. Whether you're looking to lose weight, manage a health condition, or simply eat healthier, we've got you covered. Join us on a delicious journey to a better you!
                      </motion.p>
                    </div>

                    <motion.div variants={fadeUp} className="pt-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/plans')}
                        className="px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-400 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:from-green-700 hover:to-emerald-700"
                      >
                        View Our Plans
                      </motion.button>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <motion.div 
            className="mt-10 pb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center bg-white shadow-xl shadow-green-900/5 rounded-3xl p-8 lg:p-12 mx-auto max-w-5xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600"></div>
              
              <div className="space-y-2">
                <div className="text-green-600">
                  <AnimatedCounter target={300} suffix="+" />
                </div>
                <div className="text-gray-600 font-medium">Happy Clients</div>
              </div>
              
              <div className="hidden md:block w-px h-16 bg-gray-200 mx-auto mt-2"></div>
              
              <div className="space-y-2">
                <div className="text-emerald-600">
                  <AnimatedCounter target={6} suffix="+" />
                </div>
                <div className="text-gray-600 font-medium">Years Experience</div>
              </div>
              
              <div className="hidden md:block w-px h-16 bg-gray-200 mx-auto mt-2"></div>
              
              <div className="space-y-2">
                <div className="text-green-700">
                  <AnimatedCounter target={95} suffix="%" />
                </div>
                <div className="text-gray-600 font-medium">Client Approval</div>
              </div>
            </div>
          </motion.div>

          <InstallPrompt />
        </div>
      </div>
    </>
  );
}

export default Home;
