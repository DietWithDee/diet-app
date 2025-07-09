import React from 'react';
import Dee from '../../assets/images/Dee.png'
import Food from '../../assets/Food.png'

function ServicesContactSection() {
  return (
    <div className='bg-gradient-to-b from-green-50 to-white'>
      {/* Services Hero Section */}
      <div className='py-20'>
        <div className='container mx-auto px-6 lg:px-12'>
          <div className='flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20'>
            
            {/* Left Side: Image */}
            <div className='flex-1 relative max-w-lg'>
              {/* Background decorative elements */}
              <div className='absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-20 blur-3xl'></div>
              <div className='absolute -bottom-8 -left-8 w-64 h-64 bg-gradient-to-tr from-emerald-300 to-green-300 rounded-full opacity-15 blur-2xl'></div>
              
              {/* Main image container */}
              <div className='relative z-10 p-8'>
                <div className='bg-white rounded-3xl shadow-2xl p-4 hover:shadow-3xl transition-all duration-500 hover:scale-105 w-90'>
                  <img src={Food} alt="Responsive" className=' h-113 w-80'/>
                </div>
              </div>
            </div>

            
            {/* Right Side: Services Content */}
            <div className='flex-1 max-w-2xl'>
              <div className='space-y-8'>
                {/* Main Headline */}
                <div className='space-y-4'>
                  <h1 className='text-4xl lg:text-5xl font-black text-gray-900 leading-tight'>
                    Transform Your Health
                    <br />
                    <span className='text-green-700'>with Our Specialized</span>
                    <br />
                    <span className='text-emerald-700'>Services</span>
                  </h1>
                  <div className='w-20 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full'></div>
                </div>
                
                {/* Description */}
                <div className='space-y-6'>
                  <p className='text-lg text-gray-700 leading-relaxed'>
                    Experience transformative services tailored to your health goals. With personalized attention, expert guidance, and a supportive community, we're your trusted partner on the path to a vibrant, healthy life.
                  </p>
                </div>
                
                {/* CTA Button */}
                <div className='pt-6'>
                  <button className='px-8 py-4 bg-orange-400 text-white font-bold rounded-full hover:bg-green-800 transition-all duration-300 hover:shadow-lg'>
                    Book a Consultation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className='py-20 bg-white'>
        <div className='container mx-auto px-6 lg:px-12'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            
            {/* Corporate Wellness */}
            <div className='text-center space-y-4 p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:shadow-lg transition-all duration-300'>
              <div className='w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto'>
                <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                </svg>
              </div>
              <h3 className='text-xl font-bold text-gray-900'>Personalized Diet Consultations</h3>
              <p className='text-gray-600'>One-on-one consultations to understand your unique dietary needs and preferences.</p>
            </div>

            {/* Custom Made Plans */}
            <div className='text-center space-y-4 p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:shadow-lg transition-all duration-300'>
              <div className='w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto'>
                <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                </svg>
              </div>
              <h3 className='text-xl font-bold text-gray-900'>Customized Diet Plans</h3>
              <p className='text-gray-600'>Meal plans designed to meet your specific health goals.</p>
            </div>

            {/* Consultations */}
            <div className='text-center space-y-4 p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:shadow-lg transition-all duration-300'>
              <div className='w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto'>
                <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
                </svg>
              </div>
              <h3 className='text-xl font-bold text-gray-900'>Specialized Programs</h3>
              <p className='text-gray-600'>Weight loss programs, diabetes management, heart health management.</p>
            </div>

            {/* Group Program */}
            <div className='text-center space-y-4 p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:shadow-lg transition-all duration-300'>
              <div className='w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto'>
                <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                </svg>
              </div>
              <h3 className='text-xl font-bold text-gray-900'>Collaborations and Engagement </h3>
              <p className='text-gray-600'>Health talks, brand collaboration, wellness campaigns.</p>
            </div>

          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className='py-20 bg-gradient-to-br from-green-50 to-emerald-50'>
        <div className='container mx-auto px-6 lg:px-12'>
          <div className='flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20'>
            
            {/* Left Side: Contact Image */}
            <div className='flex-1 relative max-w-lg'>
              {/* Background decorative elements */}
              <div className='absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-20 blur-3xl'></div>
              <div className='absolute -bottom-8 -left-8 w-64 h-64 bg-gradient-to-tr from-emerald-300 to-green-300 rounded-full opacity-15 blur-2xl'></div>
              
              {/* Main image container */}
              <div className='relative z-10 p-8'>
                <div className='bg-white rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-500 hover:scale-105'>
                  {/* Professional woman mockup */}
                  <div className='w-full h-113 bg-gradient-to-br rounded-2xl flex items-center justify-center relative overflow-hidden'>

                    
                    {/* Person silhouette */}
                    <div className='relative z-10 flex flex-col items-center justify-center'>
                      <img src={Dee} alt="Responsive" className=' h-113 w-80'/>
                    </div>
                  </div>
                </div>
                
                <div className='absolute bottom-6 left-4 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg'>
                  Nana Ama Dwamena, L.D, R.D 
                </div>
              </div>
            </div>
            
            {/* Right Side: Contact Content */}
            <div className='flex-1 max-w-2xl'>
              <div className='space-y-8'>
                {/* Contact Header */}
                <div className='space-y-4'>
                  <h2 className='text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600 leading-tight'>
                    Contact us
                  </h2>
                  <div className='w-20 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full'></div>
                </div>
                
                {/* Contact Description */}
                <div className='space-y-6'>
                  <p className='text-lg text-gray-700 leading-relaxed'>
                    Have a question about your diet, nutrition goals, or general wellness?
                  </p>
                </div>
                
                {/* Contact Information */}
                <div className='space-y-6'>
                  <div className='space-y-4'>
                    <h3 className='text-xl font-bold text-gray-900'>EMAILS</h3>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-3'>
                        <svg className='w-5 h-5 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                          <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
                          <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
                        </svg>
                        <span className='text-gray-700'>support@dietwithdee.com</span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <svg className='w-5 h-5 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                          <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
                          <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
                        </svg>
                        <span className='text-gray-700'>dietwithdee@gmail.com</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className='space-y-4'>
                    <h3 className='text-xl font-bold text-gray-900'>PHONE</h3>
                    <div className='flex items-center gap-3'>
                      <svg className='w-5 h-5 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                        <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
                      </svg>
                      <span className='text-gray-700'>(+233) 99 917 1997</span>
                    </div>
                  </div>
                </div>
                
                {/* CTA Button */}
                <div className='pt-6'>
                  <button className='px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-400 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:from-green-700 hover:to-emerald-700'>
                    Get In Touch
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServicesContactSection;