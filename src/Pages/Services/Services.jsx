import React, { useState, useEffect, useRef } from 'react';
import SEO from '../../Components/SEO';
import Food from '../../assets/Woman.png'
import { useNavigate } from 'react-router';
import Event1 from '../../assets/images/Events/Event1.webp';
import Event2 from '../../assets/images/Events/Event2.webp';
import Event3 from '../../assets/images/Events/Event3.webp';
import Event4 from '../../assets/images/Events/Event4.webp';
import Event5 from '../../assets/images/Events/Event5.webp';
import Event5_5 from '../../assets/images/Events/Event5.5.webp';
import Event6 from '../../assets/images/Events/Event6.webp';
import Event7 from '../../assets/images/Events/Event7.webp';
import Event8 from '../../assets/images/Events/Event8.webp';
import Event9 from '../../assets/images/Events/Event9.webp';

function ServicesContactSection() {
  const navigate = useNavigate();
  const Url = "https://wa.me/233592330870?text=Hello%2C%20I%E2%80%99d%20like%20to%20book%20a%20session%20with%20Diet%20with%20Dee"

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [slideDirection, setSlideDirection] = useState('right');
  const [isPaused, setIsPaused] = useState(false);

  const minSwipeDistance = 50;

  const lightboxRef = useRef(null);

  const eventImages = [
    { src: Event1, alt: "Event Landscape 1" },
    { src: Event2, alt: "Event Portrait 1" },
    { src: Event3, alt: "Event Portrait 2" },
    { src: Event4, alt: "Event Landscape 2" },
    { src: Event5, alt: "Event Landscape 3" },
    { src: Event5_5, alt: "Event Portrait 3" },
    { src: Event6, alt: "Event Landscape 4" },
    { src: Event7, alt: "Event Portrait 4" },
    { src: Event8, alt: "Event Landscape 5" },
    { src: Event9, alt: "Event Portrait 5" },
  ];

  const goToNextImage = React.useCallback((isManual = false) => {
    setSlideDirection('right');
    setCurrentImageIndex((prevIndex) =>
      prevIndex === eventImages.length - 1 ? 0 : prevIndex + 1
    );
    if (isManual) {
      setIsPaused(true);
    }
  }, [eventImages.length]);

  const goToPreviousImage = React.useCallback(() => {
    setSlideDirection('left');
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? eventImages.length - 1 : prevIndex - 1
    );
    setIsPaused(true);
  }, [eventImages.length]);

  const openLightbox = React.useCallback((index) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  }, []);

  const closeLightbox = React.useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const handleTouchStart = React.useCallback((e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = React.useCallback((e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = React.useCallback(() => {
    if (touchStartX === 0 || touchEndX === 0) return;

    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextImage(true);
    } else if (isRightSwipe) {
      goToPreviousImage();
    }

    setTouchStartX(0);
    setTouchEndX(0);
  }, [touchStartX, touchEndX, goToNextImage, goToPreviousImage, minSwipeDistance]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeLightbox();
      }
    };

    if (isLightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      if (lightboxRef.current) {
        lightboxRef.current.focus();
      }
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, closeLightbox]);

  useEffect(() => {
    let slideInterval;
    if (!isLightboxOpen && !isPaused) {
      slideInterval = setInterval(() => {
        goToNextImage(false);
      }, 3000);
    }
    return () => {
      clearInterval(slideInterval);
    };
  }, [isLightboxOpen, isPaused, goToNextImage]);

  // Resume auto-slide after 6 seconds of manual navigation
  useEffect(() => {
    let resumeTimeout;
    if (isPaused) {
      resumeTimeout = setTimeout(() => {
        setIsPaused(false);
      }, 6000);
    }
    return () => {
      clearTimeout(resumeTimeout);
    };
  }, [isPaused]);

  return (
    <>
      <SEO
        title="Our Services | DietWithDee Nutrition & Wellness Programs"
        description="Explore DietWithDee's nutrition and wellness services, including personalized meal plans, weight management, and health coaching by Nana Ama Dwamena."
        keywords="DietWithDee Services, Nutrition Programs, Wellness, Meal Plans, Ghana Dietitian, Nana Ama Dwamena"
        image="https://dietwithdee.org/LOGO.png"
        url="https://dietwithdee.org/services"
      />
      <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50'>
        {/* Services Hero Section */}
        <div className='py-20 sm:py-16 lg:py-20'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-12'>
            <div className='flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 lg:gap-20'>

              {/* Left Side: Image */}
              <div className='flex-1 relative max-w-sm sm:max-w-md lg:max-w-lg w-full'>
                {/* Background decorative elements */}
                <div className='absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-20 blur-3xl'></div>
                <div className='absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 lg:-bottom-8 lg:-left-8 w-40 h-40 sm:w-56 sm:h-56 lg:w-64 lg:h-64 bg-gradient-to-tr from-emerald-300 to-green-300 rounded-full opacity-15 blur-2xl'></div>

                {/* Main image container */}
                <div className='relative z-10 p-3 sm:p-6 lg:p-7'>
                  <div className='bg-white rounded-2xl sm:rounded-3xl shadow-xl lg:shadow-2xl p-3 sm:p-4 hover:shadow-2xl lg:hover:shadow-3xl transition-all duration-500 hover:scale-105'>
                    <img
                      src={Food}
                      alt="Health and nutrition consultation"
                      className='h-115 w-90 max-h-74 sm:max-h-80 lg:max-h-96 object-cover rounded-xl'
                    />
                  </div>
                </div>
              </div>

              {/* Right Side: Services Content */}
              <div className='flex-1 max-w-full lg:max-w-2xl  lg:text-left'>
                <div className='space-y-6 sm:space-y-8'>
                  {/* Main Headline */}
                  <div className='space-y-3 sm:space-y-4'>
                    <h1 className='text-3xl sm:text-4xl lg:text-5xl font-black text-green-700 leading-tight'>
                      Transform Your Health
                      <br />
                      <span className='text-green-700'>with Our Specialized</span>
                      <br />
                      <span className='text-green-700'>Services</span>
                    </h1>
                    <div className='w-20 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full'></div>
                  </div>

                  {/* Description */}
                  <div className='space-y-4 sm:space-y-6'>
                    <p className='text-base sm:text-lg text-gray-700 leading-relaxed px-2 sm:px-0'>
                      Health is personal, but creating impact can also be collective. We support individuals on their nutrition journey while partnering with brands, teams, and organizations to spread practical, culturally relevant wellness. Whether it's one-on-one or on a bigger stage, we're here to make nutrition accessible and meaningful.
                    </p>
                  </div>

                  {/* CTA Button */}
                  <div className='pt-4 sm:pt-6'>
                    <button onClick={() => navigate('/contactus')}
                      className='px-8 py-4 bg-orange-400 text-white font-bold rounded-full hover:bg-green-800 transition-all duration-300 hover:shadow-lg'>
                      Book a Consultation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className='py-12 sm:py-16 lg:py-20 bg-white'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-12'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'>

              {/* Corporate Wellness */}
              <div className='text-center space-y-3 sm:space-y-4 p-6 sm:p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300'>
                <div className='w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto '>
                  <svg className='w-6 h-6 sm:w-8 sm:h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                  </svg>
                </div>
                <h3 className='text-lg sm:text-xl font-bold text-gray-900'>Personalized Diet Consultations</h3>
                <p className='text-sm sm:text-base text-gray-600'>One-on-one consultations to understand your unique dietary needs and preferences.</p>
              </div>

              {/* Custom Made Plans */}
              <div className='text-center space-y-3 sm:space-y-4 p-6 sm:p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300'>
                <div className='w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto'>
                  <svg className='w-6 h-6 sm:w-8 sm:h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                </div>
                <h3 className='text-lg sm:text-xl font-bold text-gray-900'>Customized Diet Plans</h3>
                <p className='text-sm sm:text-base text-gray-600'>Meal plans designed to meet your specific health goals.</p>
              </div>

              {/* Consultations */}
              <div className='text-center space-y-3 sm:space-y-4 p-6 sm:p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300'>
                <div className='w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto'>
                  <svg className='w-6 h-6 sm:w-8 sm:h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
                  </svg>
                </div>
                <h3 className='text-lg sm:text-xl font-bold text-gray-900'>Specialized Programs</h3>
                <p className='text-sm sm:text-base text-gray-600'>Weight loss programs, diabetes management, heart health management.</p>
              </div>

              {/* Group Program - spans full width on mobile, normal on larger screens */}
              <div className='text-center space-y-3 sm:space-y-4 p-6 sm:p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300 sm:col-span-2 lg:col-span-1'>
                <div className='w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto'>
                  <svg className='w-6 h-6 sm:w-8 sm:h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                  </svg>
                </div>
                <h3 className='text-lg sm:text-xl font-bold text-gray-900'>Brand collaborations</h3>
                <p className='text-sm sm:text-base text-gray-600'>Health talks, brand collaboration, wellness campaigns.</p>
              </div>

              {/* Professional Booking */}
              <div className='text-center space-y-3 sm:space-y-4 p-6 sm:p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300'>
                <div className='w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto'>
                  <svg className='w-6 h-6 sm:w-8 sm:h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
                  </svg>
                </div>
                <h3 className='text-lg sm:text-xl font-bold text-gray-900'>Professional Bookings</h3>
                <p className='text-sm sm:text-base text-gray-600'>Elevate your team's wellbeing with our corporate wellness services</p>
              </div>
            </div>
          </div>
        </div>

        {/* Events Gallery */}
        <div id="events-gallery" className='py-12 sm:py-16 lg:py-20 bg-white'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-12'>
            <h2 className='text-3xl sm:text-4xl lg:text-5xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600 leading-tight mb-12'>
              Events Gallery
            </h2>
            <p className='text-center text-gray-600 mb-12'>Browse through our various community engagement and outreach programs</p>
            <div
              className="relative w-full max-w-lg mx-auto h-80 cursor-grab"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              role="group"
              aria-roledescription="carousel"
            >
              <div
                key={currentImageIndex}
                className="absolute inset-0 w-full h-full overflow-hidden shadow-lg transform transition-transform duration-300 rounded-2xl"
                style={{ backgroundImage: `url(${eventImages[currentImageIndex].src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                aria-label={`Image ${currentImageIndex + 1} of ${eventImages.length}`}
              >

              </div>
              <button
                onClick={() => openLightbox(currentImageIndex)}
                className="absolute bottom-4 right-4 z-50 bg-green-600 text-white rounded-full px-4 py-2 text-sm font-semibold shadow-md"
              >
                {currentImageIndex + 1} / {eventImages.length} Photos
              </button>
              <button
                onClick={() => goToPreviousImage()}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-5xl z-40"
                aria-label="Previous image"
              >
                &lsaquo;
              </button>
              <button
                onClick={() => goToNextImage(true)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-5xl z-40"
                aria-label="Next image"
              >
                &rsaquo;
              </button>
            </div>
          </div>
        </div>

        {/* Lightbox Modal */}
        {isLightboxOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Image gallery lightbox"
            ref={lightboxRef}
            tabIndex={-1}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white text-3xl font-bold"
              aria-label="Close image gallery"
            >
              &times;
            </button>
            <div
              className="relative max-w-4xl max-h-full"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={eventImages[currentImageIndex].src}
                alt={eventImages[currentImageIndex].alt}
                className={`max-w-full max-h-full object-contain ${slideDirection === 'right' ? 'slide-in-right' : 'slide-in-left'}`}
                aria-label={`Image ${currentImageIndex + 1} of ${eventImages.length}`}
              />
              <button
                onClick={goToPreviousImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-5xl"
                aria-label="Previous image"
              >
                &lsaquo;
              </button>
              <button
                onClick={() => goToNextImage(true)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-5xl"
                aria-label="Next image"
              >
                &rsaquo;
              </button>
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className='py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-green-50 to-emerald-50'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-12'>
            <div className='flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 lg:gap-20'>

              {/* Left Side: Contact Image */}
              <div className='flex-1 relative max-w-sm sm:max-w-md lg:max-w-lg w-full order-2 lg:order-1'>
                {/* Background decorative elements */}
                <div className='absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-20 blur-3xl'></div>
                <div className='absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 lg:-bottom-8 lg:-left-8 w-40 h-40 sm:w-56 sm:h-56 lg:w-64 lg:h-64 bg-gradient-to-tr from-emerald-300 to-green-300 rounded-full opacity-15 blur-2xl'></div>

              </div>

              {/* Right Side: Contact Content */}
              <div className='flex-1 max-w-full lg:max-w-2xl text-center lg:text-left order-1 lg:order-2'>
                <div className='space-y-6 sm:space-y-8'>
                  {/* Contact Header */}
                  <div className='space-y-3 sm:space-y-4'>
                    <h2 className='text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600 leading-tight'>
                      Contact us
                    </h2>
                    <div className='w-16 sm:w-20 h-1.5 sm:h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto lg:mx-0'></div>
                  </div>

                  {/* Contact Description */}
                  <div className='space-y-4 sm:space-y-6'>
                    <p className='text-base sm:text-lg text-gray-700 leading-relaxed px-2 sm:px-0'>
                      Have a question about your diet, nutrition goals, or general wellness?
                    </p>
                  </div>

                  {/* Contact Information */}
                  <div className='space-y-4 sm:space-y-6'>
                    <div className='space-y-3 sm:space-y-4'>
                      <h3 className='text-lg sm:text-xl font-bold text-gray-900'>EMAIL</h3>
                      <div className='space-y-2'>
                        <div className='flex items-center justify-center lg:justify-start gap-3'>
                          <svg className='w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                            <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
                            <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
                          </svg>
                          <span className='text-sm sm:text-base text-gray-700 break-all'>dietwdee@gmail.com</span>
                        </div>
                      </div>
                    </div>

                    <div className='space-y-3 sm:space-y-4'>
                      <h3 className='text-lg sm:text-xl font-bold text-gray-900'>PHONE</h3>
                      <div className='flex items-center justify-center lg:justify-start gap-3'>
                        <svg className='w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                          <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
                        </svg>
                        <span className='text-sm sm:text-base text-gray-700'>(+233) 59 233 0870</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className='pt-4 sm:pt-6'>
                    <a
                      href={Url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className='inline-block w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-400 to-orange-400 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:from-green-700 hover:to-emerald-700 text-sm sm:text-base'>
                      Get In Touch
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ServicesContactSection;