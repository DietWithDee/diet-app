import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <footer className="bg-green-800 text-white py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-8 mb-8">

          {/* Newsletter Section */}
          <div className="sm:col-span-2 lg:col-span-1 ">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Subscribe to Our Newsletter</h3>
            <p className="text-green-100 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed">
              Want to stay up to date with the latest nutrition tips, healthy recipes, 
              and wellness insights? Subscribe to our newsletter and join our 
              community of individuals committed to nourishing their bodies and 
              living their best lives.
            </p>
            <div className="space-y-3 sm:space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-green-700 border border-green-400 text-white placeholder-green-200 rounded text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent"
              />
              <button
                onClick={handleSubmit}
                className="w-full bg-orange-500 hover:bg-yellow-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded transition-colors duration-200 text-sm sm:text-base"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-green-500 pt-4 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            {/* Legal Links */}
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <a href="#" className="text-green-100 hover:text-white transition-colors text-xs sm:text-sm">Privacy Policy</a>
              <span className="text-green-300 text-xs sm:text-sm">•</span>
              <a href="#" className="text-green-100 hover:text-white transition-colors text-xs sm:text-sm">Terms and Conditions</a>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <a href="#" className="text-green-100 hover:text-white transition-colors text-xs sm:text-sm">Instagram</a>
              <span className="text-green-300 text-xs sm:text-sm">•</span>
              <a href="#" className="text-green-100 hover:text-white transition-colors text-xs sm:text-sm">LinkedIn</a>
              <span className="text-green-300 text-xs sm:text-sm">•</span>
              <a href="#" className="text-green-100 hover:text-white transition-colors text-xs sm:text-sm">TikTok</a>
                            <a href="#" className="text-green-100 hover:text-white transition-colors text-xs sm:text-sm pl-10"> Powered by FlyWheelTechnologies</a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
        <button className="bg-green-500 hover:bg-green-600 text-white p-2 sm:p-3 rounded-full shadow-lg transition-colors duration-200 flex items-center gap-1 sm:gap-2">
          <MessageCircle size={16} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline text-xs sm:text-sm font-medium">Talk to Dee</span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;