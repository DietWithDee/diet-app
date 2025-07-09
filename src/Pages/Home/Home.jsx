import React from 'react';
import Salad from '../../assets/Salad.png'
import  LOGO from '../../assets/LOGO.png'
import { useNavigate } from 'react-router';


function Home() {
  const navigate = useNavigate();
  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50'>
      <div className='container mx-auto px-6 lg:px-12 pt-12 lg:pt-20'>
        <div className='flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20'>
          
          {/* Left Side: Text Content */}
          <div className='flex-1 max-w-2xl'>
            <div className='space-y-8'>
              {/* Main Headline */}
              <div className='space-y-4'>
                <h1 className='text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-700 leading-tight'>
                  Your Wellness
                  <br />
                  <span className='text-green-700'>Journey </span>
                  <br />
                  <span className='text-green-700'>Starts </span>
                  <span className='text-green-500'>Here</span>
                </h1>
                
                {/* Decorative accent */}
                <div className='w-24 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full '></div>
              </div>
              
              {/* Description */}
              <div className='space-y-6'>
                <p className='text-lg lg:text-xl text-gray-700 leading-relaxed font-medium'>
                  Welcome to <span className=' text-green-700 font-transcity text-3xl'>DietwithDee</span>, your ultimate destination for personalized diet plans and consultations!
                </p>
                
                <p className='text-lg text-gray-600 leading-relaxed'>
                  Whether you're aiming to lose weight, manage a health condition, or simply eat healthier, we're here to make it happen. Join us on a delicious journey to a better you!
                </p>
              </div>
              
              {/* Call-to-Action Buttons */}
              <div className='flex flex-col sm:flex-row gap-4 pt-6'>
                <button 
                          onClick={() => navigate('/diet-app/knowYourBody')}
                className='px-8 py-4 bg-gradient-to-r from-[#F6841F] to-[#F6841F] text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:from-orange-600 hover:to-orange-400'>
                  Start Your Journey
                </button>
                <button className='px-8 py-4 border-2 border-green-600 text-green-700 font-bold rounded-full hover:bg-green-50 transition-all duration-300 hover:shadow-md'>
                  Learn More
                </button>
              </div>
              {/* Trust Indicators */}
              <div className='flex items-center gap-8 pt-8 text-sm text-gray-600'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                  <span>500+ Success Stories</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 bg-emerald-500 rounded-full'></div>
                  <span>Expert Dietitians</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 bg-green-400 rounded-full'></div>
                  <span>Personalized Plans</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side: Image with Enhanced Styling */}
          <div className='flex-1 relative max-w-lg'>
            {/* Background decorative elements */}
            <div className='absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-20 blur-3xl'></div>
            <div className='absolute -bottom-8 -left-8 w-64 h-64 bg-gradient-to-tr from-emerald-300 to-green-300 rounded-full opacity-15 blur-2xl'></div>
            
            {/* Main image container */}
            <div className='relative z-10 p-8'>
              <div className='bg-white rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-500 hover:scale-105'>
                {/* Using a placeholder div since we can't import the actual image */}
                <div className='w-full h-80 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center'>
                  <div className='text-center space-y-4'>
                    <img src={Salad} alt="Responsive" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        

        <div className='py-20 bg-gradient-to-b from-white to-green-50'>
      <div className='container mx-auto px-6 lg:px-12'>
        <div className='flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20'>


          {/* Left Side: About Content */}
          <div className='flex-1 max-w-2xl'>
            <div className='space-y-8'>
              {/* Section Header */}
              <div className='space-y-4'>
                <h2 className='text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600 leading-tight '>
                  Our Story
                </h2>
                <div className='w-20 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full'></div>
              </div>
              
              {/* About Content */}
              <div className='space-y-6'>
                <p className='text-lg text-gray-700 leading-relaxed'>
                  Here at <span className=' text-green-700 font-transcity text-3xl'>DietWithDee,</span> we believe that nutrition is the cornerstone of a vibrant life, and we're here to guide you every step of the way. Our mission is to provide personalized diet plans, delicious recipes, and expert advice to help you reach your wellness goals. DietWithDee is here to support you every step of the way. Let's make healthy living enjoyable and sustainable together!
                </p>

                <div className='bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-l-4 border-green-500'>
                  <p className='text-lg font-semibold text-green-800 italic'>
                    "We strive continually to help you take control of your health in all aspects."
                  </p>
                </div>
              </div>
              
              {/* Key Features */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6'>
                <div className='flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-green-100'>
                  <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                  <span className='text-gray-700 font-medium'>Expert Professionals</span>
                </div>
                <div className='flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-emerald-100'>
                  <div className='w-3 h-3 bg-emerald-500 rounded-full'></div>
                  <span className='text-gray-700 font-medium'>Personalized Approach</span>
                </div>
                <div className='flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-green-100'>
                  <div className='w-3 h-3 bg-green-400 rounded-full'></div>
                  <span className='text-gray-700 font-medium'>Holistic Wellness</span>
                </div>
                <div className='flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-emerald-100'>
                  <div className='w-3 h-3 bg-emerald-400 rounded-full'></div>
                  <span className='text-gray-700 font-medium'>Proven Results</span>
                </div>
              </div>
              
              {/* CTA Button */}
              <div className='pt-6'>
                <button 
                className='px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-400 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:from-green-700 hover:to-emerald-700'>
                  View Plans
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Side: Logo and Tagline */}
          <div className='flex-1 relative max-w-lg pt-2'>
            {/* Background decorative elements */}
            <div className='absolute -top-5 -left-6 w-80 h-80 bg-gradient-to-br from-emerald-200 to-green-200 rounded-full opacity-20 blur-3xl'></div>
            <div className='absolute -bottom-4 -right-4 w-64 h-64 bg-gradient-to-tr from-green-300 to-emerald-300 rounded-full opacity-15 blur-2xl'></div>
            
            {/* Main logo container */}
            <div className='relative z-10 p-7'>
              <div className='bg-white rounded-3xl shadow-2xl p-12 hover:shadow-3xl transition-all duration-500 hover:scale-105'>
                <img src={LOGO} alt="Responsive" />
                
                {/* Logo placeholder - recreating the Weight Goals logo concept */}
                <div className='flex flex-col items-center text-center space-y-6'>
                  <div className='relative'>

                  </div>
                  

                </div>
              </div>
              
            </div>
          </div>
          
          
        </div>
      </div>
    </div>

        {/* Bottom stats section */}
        <div className='mt-20 pb-12'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
            <div className='space-y-2'>
              <div className='text-4xl font-bold text-green-600'>500+</div>
              <div className='text-gray-600 font-medium'>Happy Clients</div>
            </div>
            <div className='space-y-2'>
              <div className='text-4xl font-bold text-emerald-600'>10+</div>
              <div className='text-gray-600 font-medium'>Years Experience</div>
            </div>
            <div className='space-y-2'>
              <div className='text-4xl font-bold text-green-700'>95%</div>
              <div className='text-gray-600 font-medium'>Client Approval</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;