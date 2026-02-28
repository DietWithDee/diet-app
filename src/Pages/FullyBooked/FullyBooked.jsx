import React, { useEffect } from 'react';
import SEO from '../../Components/SEO';
import { Calendar, MessageCircle, Mail, Clock, ArrowLeft } from 'lucide-react';

function FullyBooked() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEO
        title="Fully Booked | DietWithDee - Check Back Soon"
        description="Our consultation slots are currently fully booked. Check back later or reach out via WhatsApp for updates on availability."
        keywords="DietWithDee, Consultation Booking, Ghana Dietitian, Nana Ama Dwamena"
        image="https://dietwithdee.org/src/assets/LOGO.webp"
        url="https://dietwithdee.org/fullyBooked"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {/* Icon */}
            <div className="text-center space-y-6 mb-8">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="text-[#F6841F]" size={48} />
              </div>
              
              {/* Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-green-800">
                  Oops! We're Currently Fully Booked
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Thank you for your interest in working with us! Our consultation slots are currently full, but we'd love to help you soon.
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-8">
              <div className="flex items-start space-x-3">
                <Clock className="text-green-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    When Can You Book?
                  </h3>
                  <p className="text-gray-700">
                    We open new consultation slots regularly. Please check back in a few days or reach out to us directly for the latest availability updates.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Options */}
            <div className="space-y-6 mb-8">
              <h3 className="text-2xl font-bold text-green-800 text-center">
                Get in Touch for Updates
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* WhatsApp Card */}
                <a 
                  href="https://wa.me/233592330870?text=Hello%2C%20I%E2%80%99d%20like%20to%20know%20when%20consultation%20slots%20are%20available"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-6 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <MessageCircle size={28} />
                    <h4 className="text-xl font-bold">WhatsApp Us</h4>
                  </div>
                  <p className="text-green-50 text-sm mb-3">
                    Get instant updates on availability and ask any questions you have
                  </p>
                  <div className="text-sm font-semibold">
                    Click to chat →
                  </div>
                </a>

                {/* Email Card */}
                <a 
                  href="mailto:dietwdee@gmail.com?subject=Consultation Availability Inquiry"
                  className="block bg-gradient-to-r from-[#F6841F] to-[#F6841F] text-white rounded-xl p-6 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Mail size={28} />
                    <h4 className="text-xl font-bold">Email Us</h4>
                  </div>
                  <p className="text-orange-50 text-sm mb-3">
                    Send us an email and we'll notify you when slots open up
                  </p>
                  <div className="text-sm font-semibold">
                    dietwdee@gmail.com
                  </div>
                </a>
              </div>
            </div>

            {/* What You Can Do Meanwhile */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                What You Can Do in the Meantime
              </h3>
              <div className="space-y-3 text-blue-700">
                <div className="flex items-start space-x-3">
                  <span className="text-xl">✓</span>
                  <p>Visit <a href="/my-journey" className="font-semibold underline hover:text-green-600">My Journey</a> to get the most out of our platform</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">✓</span>
                  <p>Explore our <a href="/plans" className="font-semibold underline hover:text-green-600">Plans</a> and <a href="/blog" className="font-semibold underline hover:text-green-600">blog posts</a> for nutrition tips</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">✓</span>
                  <p>Follow us on social media for daily wellness inspiration</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">✓</span>
                  <p>Join our waiting list by contacting us via WhatsApp</p>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="text-center">
              <a
                href="/"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Home</span>
              </a>
            </div>
          </div>

          {/* Footer Message */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-lg">
              We appreciate your patience and look forward to supporting your nutrition journey! 🌟
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default FullyBooked;