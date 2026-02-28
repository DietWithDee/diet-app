import React from 'react';
import LOGO from '../../assets/LOGO.webp'
import SEO from '../../Components/SEO';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function AboutUsSection() {
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
      y: [0, -10, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <>
      <SEO
        title="About DietWithDee | Nana Ama Dwamena, Your Favourite Dietitian"
        description="Learn about DietWithDee, founded by Nana Ama Dwamena, a registered dietitian in Ghana. Discover our mission to make expert nutrition accessible to all."
        keywords="About DietWithDee, Nana Ama Dwamena, Registered Dietitian, Ghana, Nutrition, Wellness"
        image="/LOGO.webp"          // we’ll coerce to absolute: https://dietwithdee.org/LOGO.webp
        url="/about"               // we’ll coerce to absolute canonical
        ogType="article"
        lang="en"
      />
      <div className='py-20 bg-gradient-to-b from-white to-green-50 overflow-hidden'>
        <div className='container mx-auto px-6 lg:px-12'>
          <div className='flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20'>

            {/* Left Side: About Content */}
            <div className='flex-1 max-w-2xl'>
              <motion.div 
                className='space-y-5'
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {/* Section Header */}
                <div className='space-y-4'>
                  <motion.h1 
                    variants={fadeUp}
                    className='text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600 leading-tight font-black'
                  >
                    Our Story
                  </motion.h1>
                  <motion.div variants={scaleRight} className='w-20 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full'></motion.div>
                </div>

                {/* About Content */}
                <motion.div variants={fadeUp} className='space-y-6'>
                  <div className='text-lg text-gray-700 leading-relaxed'>
                    <p>
                      In Ghana, access to professional nutrition advice is often limited, and many people struggle with health conditions that could be better managed with the right support. <span className='italic font-semibold text-green-700'>DietWithDee</span> was born to bridge that gap.
                    </p>
                    <p className='mt-4'>
                      Founded by <span className='italic font-semibold text-green-700'>Registered Dietitian Nana Ama Dwamena</span>, this initiative was created to make expert diet consultations more accessible, especially for Ghanaians who may not have easy access to in-person services.
                    </p>
                    <p className='mt-4'>
                      <span className='italic font-semibold text-green-700'>DietWithDee</span> nutrition brings guidance right to your phone, your home, and your everyday life.
                    </p>
                    <p className='mt-4'>
                      While our journey began with the goal of supporting Ghanaians, our vision is global. Diet with Dee is for anyone anywhere who wants practical, culturally aware, and evidence-based nutrition support. We believe that food is deeply personal, and nutrition should be too. That's why we're committed to helping people eat better, feel stronger, and thrive—no matter where they are in the world.
                    </p>
                    <p className='mt-4'>
                      Here, we don't just give advice—we walk the journey with you, one simple and sustainable change at a time.
                    </p>
                  </div>

                  <motion.div 
                    variants={fadeUp}
                    className='bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-l-4 border-green-500 relative overflow-hidden group'
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-200 rounded-full opacity-20 -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
                    <blockquote className='text-lg font-semibold text-green-800 italic relative z-10'>
                      "Our vision is to be a top online platform that transforms how people view nutrition and wellness."
                    </blockquote>
                  </motion.div>
                </motion.div>


                {/* CTA Button */}
                <motion.div variants={fadeUp} className='pt-6'>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/knowyourbody')}
                    className='px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:from-green-700 hover:to-emerald-700'
                    aria-label="Start your nutrition transformation journey"
                  >
                    Start Your Transformation
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>

            {/* Right Side: Logo and Tagline */}
            <div className='flex-1 relative max-w-lg pt-2'>
              {/* Background decorative elements */}
              <div className='absolute -top-5 -left-6 w-80 h-80 bg-gradient-to-br from-emerald-200 to-green-200 rounded-full opacity-20 blur-3xl' aria-hidden="true"></div>
              <div className='absolute -bottom-4 -right-4 w-64 h-64 bg-gradient-to-tr from-green-300 to-emerald-300 rounded-full opacity-15 blur-2xl' aria-hidden="true"></div>

              {/* Main logo container */}
              <motion.div 
                className='relative z-10 p-7'
                variants={floatingImage}
                initial="hidden"
                animate={["show", "float"]}
              >
                <div className='bg-white rounded-3xl shadow-2xl p-12 transition-all duration-500 hover:scale-[1.02]'>
                  <img
                    src={LOGO}
                    alt="DietWithDee Logo - Registered Dietitian Services in Ghana"
                    className='w-full h-auto'
                    loading="lazy"
                  />
                </div>

                {/* Floating elements */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className='absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg'
                >
                  Expert Care
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      <div id="community-impact" className='py-16 bg-white'>
        <div className='container mx-auto px-6 lg:px-12'>
          <div className='max-w-4xl mx-auto'>
            <motion.div 
              className='space-y-8'
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <div className='space-y-4'>
                <motion.h2 
                  variants={fadeUp}
                  className='text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600'
                >
                  Community & Impact
                </motion.h2>
                <motion.div variants={scaleRight} className='w-16 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full'></motion.div>
              </div>
              <motion.div variants={fadeUp} className='space-y-6 text-lg text-gray-700 leading-relaxed max-w-3xl'>
                <p>
                  Beyond individual consultations, we believe in the power of collective change. <span className='italic font-semibold text-green-700'>DietWithDee</span> is actively involved in community programs, health outreaches, and educational initiatives across Ghana.
                </p>
                <p>
                  Our mission is to take nutrition education out of the clinic and into the heart of communities; from schools and religious organizations, to corporate spaces making health guidance practical, inclusive, and fun.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className='pt-6'>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/services#events-gallery')}
                  className='group flex items-center gap-3 bg-green-50 text-green-700 px-8 py-4 rounded-full font-bold hover:bg-green-700 hover:text-white transition-all duration-300 shadow-md transform hover:-translate-y-1'
                >
                  <span>Explore our Outreach Events</span>
                  <svg className='w-5 h-5 group-hover:translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
                  </svg>
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AboutUsSection;
