import React from 'react';
import LOGO from '../../assets/LOGO.png'
import SEO from '../../Components/SEO';
import { useNavigate } from 'react-router-dom';

function AboutUsSection() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="About DietWithDee | Nana Ama Dwamena, Your Favourite Dietitian"
        description="Learn about DietWithDee, founded by Nana Ama Dwamena, a registered dietitian in Ghana. Discover our mission to make expert nutrition accessible to all."
        keywords="About DietWithDee, Nana Ama Dwamena, Registered Dietitian, Ghana, Nutrition, Wellness"
        image="/LOGO.png"          // we’ll coerce to absolute: https://dietwithdee.org/LOGO.png
        url="/about"               // we’ll coerce to absolute canonical
        ogType="article"
        lang="en"
      />
      <div className='py-20 bg-gradient-to-b from-white to-green-50'>
        <div className='container mx-auto px-6 lg:px-12'>
          <div className='flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20'>

            {/* Left Side: About Content */}
            <div className='flex-1 max-w-2xl'>
              <div className='space-y-5'>
                {/* Section Header */}
                <div className='space-y-4'>
                  <h1 className='text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600 leading-tight font-black'>
                    Our Story
                  </h1>
                  <div className='w-20 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full'></div>
                </div>

                {/* About Content */}
                <div className='space-y-6'>
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

                  <div className='bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-l-4 border-green-500'>
                    <blockquote className='text-lg font-semibold text-green-800 italic'>
                      "Our vision is to be a top online platform that transforms how people view nutrition and wellness."
                    </blockquote>
                  </div>
                </div>


                {/* CTA Button */}
                <div className='pt-6'>
                  <button
                    onClick={() => navigate('/knowyourbody')}
                    className='px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:from-green-700 hover:to-emerald-700'
                    aria-label="Start your nutrition transformation journey"
                  >
                    Start Your Transformation
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side: Logo and Tagline */}
            <div className='flex-1 relative max-w-lg pt-2'>
              {/* Background decorative elements */}
              <div className='absolute -top-5 -left-6 w-80 h-80 bg-gradient-to-br from-emerald-200 to-green-200 rounded-full opacity-20 blur-3xl' aria-hidden="true"></div>
              <div className='absolute -bottom-4 -right-4 w-64 h-64 bg-gradient-to-tr from-green-300 to-emerald-300 rounded-full opacity-15 blur-2xl' aria-hidden="true"></div>

              {/* Main logo container */}
              <div className='relative z-10 p-7'>
                <div className='bg-white rounded-3xl shadow-2xl p-12 hover:shadow-3xl transition-all duration-500 hover:scale-105'>
                  <img
                    src={LOGO}
                    alt="DietWithDee Logo - Registered Dietitian Services in Ghana"
                    className='w-full h-auto'
                    loading="lazy"
                  />
                </div>

                {/* Floating elements */}
                <div className='absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg'>
                  Expert Care
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="community-impact" className='py-10 bg-white'>
        <div className='container mx-auto px-6 lg:px-12'>
          <div className='max-w-4xl mx-auto'>
            <div className='space-y-8'>
              <div className='space-y-4'>
                <h2 className='text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600'>
                  Community & Impact
                </h2>
                <div className='w-16 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full'></div>
              </div>
              <div className='space-y-6 text-lg text-gray-700 leading-relaxed max-w-3xl'>
                <p>
                  Beyond individual consultations, we believe in the power of collective change. <span className='italic font-semibold text-green-700'>DietWithDee</span> is actively involved in community programs, health outreaches, and educational initiatives across Ghana.
                </p>
                <p>
                  Our mission is to take nutrition education out of the clinic and into the heart of communities; from schools and religious organizations, to corporate spaces making health guidance practical, inclusive, and fun.
                </p>
              </div>

              <div className='pt-6'>
                <button
                  onClick={() => navigate('/services#events-gallery')}
                  className='group flex items-center gap-3 bg-green-50 text-green-700 px-8 py-4 rounded-full font-bold hover:bg-green-700 hover:text-white transition-all duration-300 shadow-md transform hover:-translate-y-1'
                >
                  <span>Explore our Outreach Events</span>
                  <svg className='w-5 h-5 group-hover:translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AboutUsSection;
