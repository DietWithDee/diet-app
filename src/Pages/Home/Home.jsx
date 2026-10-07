import React, { useState, useEffect, useRef } from 'react';
import SEO from '../../Components/SEO';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../../firebaseConfig';
import Dee from '../../assets/images/Dee1.webp';
import heroBg from '../../assets/images/homeimg1.jpg';
import fathersDayPromo from '../../assets/fathers_day_promo.png';
import { X, Gift, ChevronRight, CheckCircle2 } from 'lucide-react';
import carousel1 from '../../assets/carousel/1.jpg?url';
import carousel2 from '../../assets/carousel/2.jpg?url';
import carousel3 from '../../assets/carousel/3.jpg?url';
import carousel4 from '../../assets/carousel/4.jpg?url';
import carousel5 from '../../assets/carousel/5.jpg?url';
import carousel6 from '../../assets/carousel/6.jpg?url';

const CAROUSEL_IMAGES = [
  carousel1,
  carousel2,
  carousel3,
  carousel4,
  carousel5,
  carousel6,
];

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
  const videoRef = useRef(null);
  const [showFathersDayPopup, setShowFathersDayPopup] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /* Commented out Father's Day popup automatic trigger
  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('hasSeenFathersDayPopup');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setShowFathersDayPopup(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);
  */

  useEffect(() => {
    if (showFathersDayPopup) {
      try {
        logEvent(analytics, 'view_promotion', {
          promotion_id: 'fathers_day_popup',
          promotion_name: 'Father\'s Day Special Gift Popup',
          creative_name: 'Honor His Health Promo Popup',
          location_id: 'homepage_popup'
        });
      } catch (err) {
        console.warn('Analytics logging failed:', err);
      }
    }
  }, [showFathersDayPopup]);

  const handleClosePopup = () => {
    sessionStorage.setItem('hasSeenFathersDayPopup', 'true');
    setShowFathersDayPopup(false);
  };

  const handleNavigateToPromo = () => {
    try {
      logEvent(analytics, 'select_promotion', {
        promotion_id: 'fathers_day_popup',
        promotion_name: 'Father\'s Day Special Gift Popup',
        creative_name: 'Honor His Health Promo Popup',
        location_id: 'homepage_popup'
      });
    } catch (err) {
      console.warn('Analytics logging failed:', err);
    }
    sessionStorage.setItem('hasSeenFathersDayPopup', 'true');
    setShowFathersDayPopup(false);
    navigate('/fathersday');
  };

  const handleNavigateToFathersDayCard = () => {
    try {
      logEvent(analytics, 'select_promotion', {
        promotion_id: 'fathers_day_ad_card',
        promotion_name: 'Father\'s Day Gift Consultation Banner',
        creative_name: 'Honor His Health Promo Card',
        location_id: 'homepage_right_card'
      });
    } catch (err) {
      console.warn('Analytics logging failed:', err);
    }
    navigate('/fathersday');
  };

  const handleNavigateToTerraVee = () => {
    try {
      logEvent(analytics, 'select_promotion', {
        promotion_id: 'terravee_carousel_card',
        promotion_name: 'TerraVee Carousel',
        creative_name: 'TerraVee Juice Slide Showcase',
        location_id: 'homepage_right_carousel'
      });
    } catch (err) {
      console.warn('Analytics logging failed:', err);
    }
    navigate('/terravee');
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const setPlaybackSpeed = () => {
      if (videoElement) {
        videoElement.playbackRate = 1.75;
      }
    };

    videoElement.playbackRate = 1.75;
    videoElement.addEventListener('play', setPlaybackSpeed);
    videoElement.addEventListener('loadedmetadata', setPlaybackSpeed);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoElement.playbackRate = 1.75;
          videoElement.play().catch(err => {
            console.log("Autoplay was prevented by browser:", err);
          });
        } else {
          videoElement.pause();
        }
      },
      { threshold: 0.15 } // Trigger when 15% visible
    );

    observer.observe(videoElement);

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('play', setPlaybackSpeed);
        videoElement.removeEventListener('loadedmetadata', setPlaybackSpeed);
        observer.unobserve(videoElement);
      }
    };
  }, []);

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

      <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-montserrat selection:bg-[#F6841F] selection:text-white overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 pt-16 lg:pt-20">
          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
            {/* Left: Text Content */}
            <div className="flex-1 max-w-2xl text-left">
              <motion.div
                className="space-y-6"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                <div className="space-y-3">
                  <motion.h1
                    variants={fadeUp}
                    className="text-4xl sm:text-5xl lg:text-6xl font-serif-cormorant font-semibold text-stone-900 tracking-tight leading-[1.12]"
                  >
                    Your Wellness Journey <br className="hidden sm:inline" />
                    <span className="text-[#F6841F] font-bold">Starts Here</span>
                  </motion.h1>
                  <motion.div variants={scaleRight} className="w-16 h-1 bg-[#F6841F] mt-2"></motion.div>
                </div>

                <motion.div variants={fadeUp} className="space-y-3 pt-1">
                  <p className="text-lg sm:text-xl text-stone-700 leading-relaxed font-light">
                    Welcome to <strong className="font-semibold text-stone-900">DietWithDee</strong>, your premier destination for personalized Ghanaian meal guides and 1-on-1 clinical nutrition consultations with Nana Ama Dwamena.
                  </p>
                  <p className="text-sm sm:text-lg text-stone-600 font-light leading-relaxed">
                    Whether you're aiming to manage blood sugar, lower blood pressure, lose weight sustainably, or eat healthier—we guide you every step of the way without starving.
                  </p>
                </motion.div>

                {/* Symmetrical Brand CTAs */}
                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      try {
                        logEvent(analytics, 'select_content', {
                          content_type: 'Button',
                          item_id: 'hero_know_your_body'
                        });
                      } catch (err) {}
                      navigate('/knowYourBody');
                    }}
                    className="px-8 sm:px-9 py-3.5 sm:py-4 rounded-full bg-[#F6841F] hover:bg-[#e07312] text-white font-montserrat text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Know your body</span>
                    <ChevronRight size={16} />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      try {
                        logEvent(analytics, 'select_content', {
                          content_type: 'Button',
                          item_id: 'hero_book_a_session'
                        });
                      } catch (err) {}
                      navigate('/contactus');
                    }}
                    className="px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white/90 hover:bg-white text-stone-800 border border-stone-200/90 font-montserrat text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-300 shadow-xs hover:shadow-md hover:border-stone-300 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Book a session</span>
                  </motion.button>
                </motion.div>

                {/* Trust Indicators (Desktop & Tablet) */}
                <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 pt-3">
                  <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-stone-200/80 shadow-xs">
                    <div className="flex text-amber-500 text-sm">
                      {'★'.repeat(5)}
                    </div>
                    <span className="text-xs font-semibold text-stone-700 font-montserrat">
                      5.0 Rating • 500+ Clients Guided
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-stone-600 font-light">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      Licensed Dietitian Care
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      100% Real Local Food
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Right: Sped-up Looping Video Animation */}
            <div className="flex-1 relative max-w-lg w-full mx-auto">
              <motion.div
                className="relative z-10 p-2 sm:p-4"
                variants={floatingImage}
                initial="hidden"
                animate="show"
              >
                <div className="bg-transparent rounded-3xl transition-all duration-500 hover:scale-[1.02]">
                  <div className="w-full flex items-center justify-center relative">
                    <video
                      ref={videoRef}
                      src="/Hero_animation.mp4"
                      className="object-contain w-full max-w-md relative z-10 mix-blend-multiply"
                      style={{ mixBlendMode: 'multiply' }}
                      playsInline
                      muted
                      autoPlay
                      loop
                      controls={false}
                      preload="auto"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Commented out Campaign / Carousel Updates for Reusability
            <div className="flex-1 relative max-w-lg w-full flex flex-col gap-6">
              <motion.div
                variants={floatingImage}
                initial="hidden"
                animate="show"
                className="bg-white border border-zinc-200 p-6 shadow-sm rounded-none text-left relative z-10 space-y-4"
              >
                <div 
                  onClick={handleNavigateToFathersDayCard} 
                  className="w-full overflow-hidden bg-zinc-100 border border-zinc-200 cursor-pointer group"
                >
                  <img
                    src={fathersDayPromo}
                    alt="Father's Day Special Gift"
                    className="w-full object-cover md:auto"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[10px] uppercase tracking-wider">
                    <span className="inline-block w-1.5 h-1.5 bg-amber-500 animate-ping rounded-full"></span>
                    <span>Temporary Campaign Ad</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-zinc-950 font-serif">
                    Gift Wellness this Father's Day
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Honor your father or a father figure with a premium consultation and custom nutritional roadmap. Make health his best gift.
                  </p>
                  <div className="flex justify-between items-baseline pt-2">
                    <span className="text-3xl font-extrabold text-zinc-950">₵600</span>
                    <span className="text-xs text-zinc-400 line-through">₵1000 original value</span>
                  </div>
                </div>

                <button
                  onClick={handleNavigateToFathersDayCard}
                  className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 text-zinc-50 font-bold text-xs rounded-none transition-colors tracking-wide cursor-pointer flex items-center justify-center border-none"
                >
                  Book Father's Day Gift
                </button>
              </motion.div>

              <div className="relative overflow-hidden w-full bg-white border border-zinc-200 p-2 shadow-sm">
                <div className="relative overflow-hidden cursor-pointer" onClick={handleNavigateToTerraVee}>
                  <motion.div
                    className="flex animate-none"
                    animate={{ x: `-${carouselIndex * 100}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    {CAROUSEL_IMAGES.map((image, index) => (
                      <div key={index} className="min-w-full">
                        <img
                          src={image}
                          alt={`TerraVee slide ${index + 1}`}
                          className="w-full h-auto object-cover hover:opacity-95 transition-opacity"
                        />
                      </div>
                    ))}
                  </motion.div>
                  
                  <div className="flex justify-center gap-1.5 mt-2">
                    {CAROUSEL_IMAGES.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCarouselIndex(idx);
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 border-none outline-none cursor-pointer ${
                          idx === carouselIndex
                            ? "bg-green-600 w-5"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            */}

          </div>

          {/* About Section */}
          <div className="py-16 mt-12 bg-white/70 border border-stone-200/80 rounded-3xl mb-8">
            <div className="container mx-auto px-4 lg:px-10">
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-y-12 lg:gap-x-20 items-center"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
              >
                {/* Block 1: Our Story Intro (Mobile Order 1, Desktop Top Right) */}
                <motion.div variants={fadeUp} className="order-1 lg:col-start-2 lg:row-start-1 space-y-6 text-left">
                  <div className="space-y-2">
                    <p className="font-script text-3xl sm:text-4xl text-[#F6841F] mb-1">Our Story</p>
                    <h2 className="text-3xl sm:text-4xl font-serif-cormorant font-normal text-stone-900 leading-snug">
                      Nutrition is the cornerstone of a vibrant life
                    </h2>
                    <motion.div variants={scaleRight} className="w-16 h-1 bg-[#F6841F] mt-2"></motion.div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-base sm:text-lg text-stone-700 leading-relaxed font-light">
                      At <strong className="font-semibold text-stone-900">DietWithDee</strong>, we believe that nutrition is about empowerment and joy, not restriction. Our mission is to provide personalized diet plans, delicious recipes, and expert advice to help you reach your wellness goals sustainably.
                    </p>

                    <blockquote className="border-l-3 border-[#F6841F] pl-4 py-2 italic font-serif-cormorant text-stone-800 text-lg sm:text-xl bg-orange-50/50 rounded-r-lg">
                      "We strive continually to help you take control of your health in all aspects."
                    </blockquote>
                  </div>

                  <p className="text-sm sm:text-base text-stone-600 font-light leading-relaxed">
                    Our expert-crafted plans are tailored to your unique lifestyle and cultural staples. Whether you're looking to lose weight, manage a health condition, or eat healthier, join us on a delicious journey to a better you!
                  </p>
                </motion.div>

                {/* Block 2: Image (Mobile Order 2, Desktop Left Side) */}
                <motion.div
                  className="order-2 lg:order-1 lg:col-start-1 lg:row-start-1 lg:row-span-2 relative max-w-sm sm:max-w-md mx-auto lg:mx-0 w-full"
                  variants={fadeUp}
                >
                  <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-200/90 bg-white shadow-xl">
                    <img
                      className="w-full h-auto object-cover object-top transition-transform duration-700 hover:scale-101"
                      src={Dee}
                      alt="Dee - Professional Nutritionist"
                    />
                    <div className="p-5 text-center bg-white/95 backdrop-blur-md border-t border-stone-100 space-y-1">
                      <p className="font-bold text-stone-900 text-lg font-montserrat">Nana Ama Dwamena, RD.</p>
                      <p className="text-xs text-stone-500 font-light tracking-wide font-montserrat">Founder, DietWithDee • Clinical Dietitian</p>
                    </div>
                  </div>
                </motion.div>

                {/* Block 3: Impact and Buttons (Mobile Order 3, Desktop Bottom Right) */}
                <motion.div variants={fadeUp} className="order-3 lg:col-start-2 lg:row-start-2 space-y-6 text-left">
                  {/* Community Impact Integrated */}
                  <div className="space-y-2">
                    <p className="text-stone-700 leading-relaxed font-light text-sm sm:text-base">
                      Beyond individual consultations, we believe in the power of collective change. We are actively involved in community programs and health outreaches across Ghana to make nutrition education practical and fun.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-1">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/plans')}
                      className="px-7 sm:px-8 py-3.5 bg-[#F6841F] hover:bg-[#e07312] text-white font-montserrat text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-full transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      View Our Plans
                    </motion.button>
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/services#events-gallery')}
                      className="px-7 sm:px-8 py-3.5 bg-white/90 hover:bg-white text-stone-800 border border-stone-200/90 font-montserrat text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-full transition-all duration-300 shadow-xs hover:shadow-md hover:border-stone-300 cursor-pointer"
                    >
                      See events
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
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
                  <AnimatedCounter target={500} suffix="+" />
                </div>
                <div className="text-gray-600 font-medium">Happy Clients</div>
              </div>

              <div className="hidden md:block w-px h-16 bg-gray-200 mx-auto mt-2"></div>

              <div className="space-y-2">
                <div className="text-emerald-600">
                  <AnimatedCounter target={5} suffix="+" />
                </div>
                <div className="text-gray-600 font-medium">Years of Experience</div>
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
        </div>
      </div>      {/* Commented out Father's Day popup modal for future reusability
      <AnimatePresence>
        {showFathersDayPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
            <div className="absolute inset-0 animate-fade-in" onClick={handleClosePopup}></div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative z-10 bg-white border border-zinc-200 rounded-none shadow-xl max-w-lg w-full flex flex-col md:flex-row overflow-hidden"
            >
              <button
                onClick={handleClosePopup}
                className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-950 transition-colors p-1 cursor-pointer z-20"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <div className="w-full md:w-5/12 bg-zinc-100 flex items-center justify-center border-b md:border-b-0 md:border-r border-zinc-200">
                <img
                  src={fathersDayPromo}
                  alt="Father's Day Special Gift"
                  className="w-full h-48 md:h-full object-cover"
                />
              </div>

              <div className="w-full md:w-7/12 p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[10px] uppercase tracking-wider">
                    <Gift size={12} />
                    <span>Father's Day Offer</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-zinc-950 font-serif">
                    Honor His Health
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Gift the father in your life a personalized initial consultation with Registered Dietitian Nana Ama Dwamena. Keep him healthy and strong.
                  </p>
                  <div className="bg-zinc-50 border border-zinc-150 p-2.5 flex items-center justify-between text-xs font-semibold text-zinc-800">
                    <span>Special Package</span>
                    <span className="text-amber-600">GH₵ 600 <span className="text-[10px] text-zinc-400 line-through">₵1000</span></span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleNavigateToPromo}
                    className="w-full h-9 bg-zinc-900 hover:bg-zinc-900/90 text-zinc-50 font-bold text-xs rounded-none transition-colors tracking-wide cursor-pointer flex items-center justify-center gap-1.5 border-none"
                  >
                    <span>Gift Consultation</span>
                  </button>
                  <button
                    onClick={handleClosePopup}
                    className="w-full h-9 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 text-xs rounded-none transition-colors cursor-pointer"
                  >
                    No thanks, maybe later
                  </button>
                </div>
              </div>
          </div>
        )}
      </AnimatePresence>
      */}
    </>
  );
}

export default Home;
