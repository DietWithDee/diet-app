import React, { useState, useEffect, useRef } from 'react';
import SEO from '../../Components/SEO';
import { useNavigate } from 'react-router';
import Salad from '../../assets/Salad.png'; // Placeholder image
import Logo from '../../assets/LOGO.png'; // Placeholder logo
import Dee from '../../assets/images/Dee1.png'

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

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
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

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(startCount + (target - startCount) * easeOutQuart);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, target, duration]);

  return (
    <div ref={counterRef} className='text-4xl font-bold'>
      {count}{suffix}
    </div>
  );
};

function Home() {
  const navigate = useNavigate();
  
  return (
    <>
      <SEO
        title="Best Dietitian in Ghana | Nana Ama Dwamena"
        description="Welcome to DietWithDee, your ultimate destination for personalized diet plans and expert nutrition advice in Ghana. Start your wellness journey with Nana Ama Dwamena."
        keywords="Dietitian, Nutritionist, Ghana, Nana Ama Dwamena, Weight Loss, Wellness, Healthy Eating, Diet With Dee"
        image="https://dietwithdee.com/LOGO.png"
        url="https://dietwithdee.com/"
      />
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50'>
      <div className='container mx-auto px-6 lg:px-12 pt-20 lg:pt-20'>
        <div className='flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20'>
          
          {/* Left Side: Text Content */}
          <div className='flex-1 max-w-2xl'>
            <div className='space-y-8'>
              {/* Main Headline */}
              <div className='space-y-4'>
                <h1 className='text-4xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-700 leading-tight'>
                  Your Wellness
                  <br />
                  <span className='text-green-700'>Journey </span>
                  <br />
                  <span className='text-green-700'>Starts </span>
                  <span className='text-green-700'>Here</span>
                </h1>
                
                {/* Decorative accent */}
                <div className='w-18 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full '></div>
              </div>
              
              {/* Description */}
              <div className='space-y-6'>
                <p className='text-lg lg:text-xl text-gray-700 leading-relaxed font-medium pt-3'>
                  Welcome to <span className=' text-green-700 font-black text-xl'>DietWithDee</span>, your ultimate destination for personalized diet plans and consultations!
                </p>
                
                <p className='text-lg text-gray-600 leading-relaxed'>
                  Whether you're aiming to lose weight, manage a health condition, or simply eat healthier, we're here to make it happen. Join us on a delicious journey to a better you!
                </p>
              </div>
              
              {/* Call-to-Action Buttons */}
              <div className='flex flex-col sm:flex-row gap-4 pt-6'>
                <button 
                  onClick={() => navigate('/knowyourbody')}
                  className='px-8 py-4 bg-gradient-to-r from-[#F6841F] to-[#F6841F] text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:from-orange-600 hover:to-orange-400'>
                  Start Your Journey
                </button>
                <button onClick={() => navigate('/about')}
                className='px-8 py-4 border-2 border-green-600 text-green-700 font-bold rounded-full hover:bg-green-50 transition-all duration-300 hover:shadow-md'>
                  Learn More
                </button>
              </div>
              {/* Trust Indicators */}
              <div className='flex items-center gap-8 pt-8 text-sm text-gray-600'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                  <span>300+ Success Stories</span>
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
            <div className='absolute -top-4 -right-4 w-72 h-62 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-20 blur-3xl'></div>
            <div className='absolute -bottom-8 -left-8 w-64 h-54 bg-gradient-to-tr from-emerald-300 to-green-300 rounded-full opacity-15 blur-2xl'></div>
            
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
        
        {/* About Section */}
        <div className='py-9 bg-gradient-to-b from-white to-green-50'>
          <div className='container mx-auto px-6 lg:px-12'>
            <div className='flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20'>
              
              {/* Left Side: Professional Dee Image - Desktop / After content on Mobile */}
              <div className='flex-1 relative max-w-lg order-2 lg:order-1'>
                {/* Background decorative elements */}
                <div className='absolute -top-6 -left-6 w-72 h-72 bg-gradient-to-br from-emerald-200 to-green-200 rounded-full opacity-20 blur-3xl'></div>
                <div className='absolute -bottom-4 -right-4 w-64 h-64 bg-gradient-to-tr from-green-300 to-emerald-300 rounded-full opacity-15 blur-2xl'></div>
                
                {/* Main image container */}
                <div className='relative z-10 p-1 lg:p-3'>
                  <div className='bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 hover:scale-105'>
                    {/* Professional image container */}
                    <div className='relative'>
                      {/* Gradient overlay for professional look */}
                      <div className='absolute inset-0 bg-gradient-to-t from-green-900/20 via-transparent to-transparent z-10'></div>
                      
                      {/* Image */}
                      <div className='aspect-square w-full overflow-hidden'>
                        <img 
                          className='w-full h-full object-cover object-center transition-transform duration-500 hover:scale-110'
                          src={Dee} 
                          alt="Dee - Professional Nutritionist and Wellness Expert" 
                        />
                      </div>
                      
                      {/* Professional info overlay */}
                      <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent p-7 z-20'>
                        <div className='text-center'>
                          <div className='justify-center items-center gap-1'>
                            <p className='text-base text-gray-800 font-medium'>
                             Nana Ama Dwamena, RD.
                          </p>
                          <div className='flex items-center justify-center gap-3 pt-2'>
                            <span className='text-sm text-gray-600'>
                                Founder, DietWithDee
                            </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: About Content - Desktop / First on Mobile */}
              <div className='flex-1 max-w-2xl order-1 lg:order-2'>
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
                      Here at <span className=' text-green-700 font-black text-xl'>DietWithDee,</span> we believe that nutrition is the cornerstone of a vibrant life, and we're here to guide you every step of the way. Our mission is to provide personalized diet plans, delicious recipes, and expert advice to help you reach your wellness goals. DietWithDee is here to support you every step of the way. Let's make healthy living enjoyable and sustainable together!
                    </p>

                    <div className='bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-l-4 border-green-500'>
                      <p className='text-lg font-semibold text-green-800 italic'>
                        "We strive continually to help you take control of your health in all aspects."
                      </p>
                    </div>
                  </div>
                  
                  {/* Key Features */}
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6'>
                    <div className='flex items-center gap-3 p-4 bg-white rounded-xl '>
                      <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                      <span className='text-gray-700 font-medium'>Expert Professionals</span>
                    </div>
                    <div className='flex items-center gap-3 p-4 bg-white rounded-xl'>
                      <div className='w-3 h-3 bg-emerald-500 rounded-full'></div>
                      <span className='text-gray-700 font-medium'>Personalized Approach</span>
                    </div>
                    <div className='flex items-center gap-3 p-4 bg-white rounded-xl '>
                      <div className='w-3 h-3 bg-green-400 rounded-full'></div>
                      <span className='text-gray-700 font-medium'>Evidence-based care</span>
                    </div>
                    <div className='flex items-center gap-3 p-4 bg-white rounded-xl'>
                      <div className='w-3 h-3 bg-emerald-400 rounded-full'></div>
                      <span className='text-gray-700 font-medium'>Proven Results</span>
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <div className='pt-6'>
                    <button onClick={() => navigate('/plans')}
                    className='px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-400 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:from-green-700 hover:to-emerald-700'>
                      View Plans
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stats section with animated counters */}
        <div className='mt-10 pb-12'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
            <div className='space-y-2'>
              <div className='text-green-600'>
                <AnimatedCounter target={300} suffix="+" />
              </div>
              <div className='text-gray-600 font-medium'>Happy Clients</div>
            </div>
            <div className='space-y-2'>
              <div className='text-emerald-600'>
                <AnimatedCounter target={6} suffix="+" />
              </div>
              <div className='text-gray-600 font-medium'>Years Experience</div>
            </div>
            <div className='space-y-2'>
              <div className='text-green-700'>
                <AnimatedCounter target={95} suffix="%" />
              </div>
              <div className='text-gray-600 font-medium'>Client Approval</div>
            </div>
          </div>
        </div>
      </div>
      <InstallPrompt />
    </div>
  </>
  );
}

export default Home;