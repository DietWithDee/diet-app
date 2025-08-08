import React from 'react';
import  LOGO from '../../assets/LOGO.png'
import { useNavigate } from 'react-router';

function AboutUsSection() {
  const navigate = useNavigate();
  return (
    <div className='py-20 bg-gradient-to-b from-white to-green-50'>
          <div className='container mx-auto px-6 lg:px-12'>
            <div className='flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20'>
    
    
              {/* Left Side: About Content */}
              <div className='flex-1 max-w-2xl'>
                <div className='space-y-5'>
                  {/* Section Header */}
                  <div className='space-y-4'>
                    <h2 className='text-4xl lg:text-5xl  text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600 leading-tight font-black'>
                      Our Story
                    </h2>
                    <div className='w-20 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full'></div>
                  </div>


                  
                  {/* About Content */}
                  <div className='space-y-6'>
                    <p className='text-lg text-gray-700 leading-relaxed'> In Ghana, access to professional nutrition advice is often limited—and many people struggle with health conditions that could be better managed with the right support. <span className=' text-green-700 font-black text-xl'>DietWithDee</span> was born to bridge that gap.
Founded by Registered Dietitian Nana Ama Dwamena, this initiative was created to make expert diet consultations more accessible, especially for Ghanaians who may not have easy access to in-person services.<p className='pt-7'><span className=' text-green-700 font-black text-xl'>DietWithDee</span> nutrition brings guidance right to your phone, your home, and your everyday life.

While our journey began with the goal of supporting Ghanaians, our vision is global. 
</p>Diet with Dee is for anyone anywhere who wants practical, culturally aware, and evidence-based nutrition support. We believe that food is deeply personal, and nutrition should be too. That’s why we’re committed to helping people eat better, feel stronger, and thrive—no matter where they are in the world.

<p className='pt-7'> Here, we don’t just give advice—we walk the journey with you, one simple and sustainable change at a time.</p>

                    </p>
    
                                {/* why we are here */}
                  <div className='text-lg text-gray-600 leading-relaxed'>
                                  
                  </div>
                    <div className='bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-l-4 border-green-500'>
                      <p className='text-lg font-semibold text-green-800 italic'>
                        "Our vision is to be a top online platform 
              that transforms how people view nutrition 
              and wellness."
                      </p>
                    </div>
                  </div>
                  
                  {/* Key Features */}
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6'>
                    <div className='flex items-center gap-3 p-4 bg-white rounded-xl '>
                      <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                      <span className='text-gray-700 font-medium'>Expert Professionals</span>
                    </div>
                    <div className='flex items-center gap-3 p-4 bg-white rounded-xl '>
                      <div className='w-3 h-3 bg-emerald-500 rounded-full'></div>
                      <span className='text-gray-700 font-medium'>Personalized Approach</span>
                    </div>
                    <div className='flex items-center gap-3 p-4 bg-white rounded-xl '>
                      <div className='w-3 h-3 bg-green-400 rounded-full'></div>
                      <span className='text-gray-700 font-medium'>Evidence-based care</span>
                    </div>
                    <div className='flex items-center gap-3 p-4 bg-white rounded-xl '>
                      <div className='w-3 h-3 bg-emerald-400 rounded-full'></div>
                      <span className='text-gray-700 font-medium'>Proven Results</span>
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <div className='pt-6'>
                    <button 
                    onClick={() => navigate('/diet-app/knowyourbody')}
                    className='px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-400 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:from-green-700 hover:to-emerald-700'>
                      Start Your Transformation
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
                  
                  {/* Floating elements */}
                  <div className='absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg'>
                    Expert Care
                  </div>
                </div>
              </div>
              
              
            </div>
          </div>
        </div>
  );
}

export default AboutUsSection;