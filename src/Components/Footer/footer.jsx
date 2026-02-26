import React, { useState, useEffect } from 'react';
import { MessageCircle, CheckCircle, AlertCircle, Loader, Instagram, Linkedin, Music2 } from 'lucide-react';
import { saveEmailToFirestore } from '../../firebaseUtils';
import { Link } from 'react-router-dom';
import { isValidEmail } from '../../utils/validation';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [timer, setTimer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const Url = "https://wa.me/233592330870?text=Hello%2C%20I%E2%80%99d%20like%20to%20book%20a%20session%20with%20Diet%20with%20Dee";

  const clearMessage = () => {
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleSubmit = async () => {
    setMessage({ type: '', text: '' });

    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      clearMessage();
      return;
    }

    if (!isValidEmail(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      clearMessage();
      return;
    }

    setIsLoading(true);
    try {
      const result = await saveEmailToFirestore(email.trim().toLowerCase());
      if (result && result.exists) {
        setMessage({ type: 'warning', text: 'This email is already subscribed!' });
      } else {
        setMessage({ type: 'success', text: 'Successfully subscribed to our newsletter!' });
        setEmail('');
      }
    } catch (error) {
      console.error("Error saving email:", error);
      if (error.code === 'permission-denied') {
        setMessage({ type: 'error', text: 'Permission denied. Please try again.' });
      } else if (error.code === 'unavailable') {
        setMessage({ type: 'error', text: 'Service temporarily unavailable. Please try again later.' });
      } else {
        setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
      }
    } finally {
      setIsLoading(false);
      clearMessage();
    }
  };

  const handleKeyPress = (e) => e.key === 'Enter' && handleSubmit();

  const startCollapseTimer = () => {
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => setIsExpanded(false), 10000);
    setTimer(newTimer);
  };

  useEffect(() => {
    startCollapseTimer();
    return () => timer && clearTimeout(timer);
  }, []);

  const handleMouseEnter = () => {
    setIsExpanded(true);
    startCollapseTimer();
  };

  const getMessageIcon = () => {
    switch (message.type) {
      case 'success': return <CheckCircle size={16} className="text-green-500" />;
      case 'error': return <AlertCircle size={16} className="text-red-500" />;
      case 'warning': return <AlertCircle size={16} className="text-yellow-500" />;
      default: return null;
    }
  };

  return (
    <footer className="bg-green-800 text-white py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8 sm:mb-12">

          {/* Newsletter Section */}
          <div className="lg:col-span-2">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Subscribe to Our Newsletter</h3>
            <p className="text-green-100 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed">
              Want to stay up to date with the latest nutrition tips, healthy recipes,
              and wellness insights? Subscribe to our newsletter and join our
              community of individuals committed to nourishing their bodies and
              living their best lives.
            </p>
            <div className="space-y-3 sm:space-y-4 max-w-md">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className={`
                    w-full px-3 sm:px-4 py-2 sm:py-3 bg-green-700 border text-white placeholder-green-200 rounded text-sm sm:text-base focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200
                    ${message.type === 'error' ? 'border-red-400 focus:ring-red-300' : 'border-green-400 focus:ring-green-300'}
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading || !email.trim()}
                className={`
                  w-full font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2
                  ${isLoading || !email.trim()
                    ? 'bg-gray-500 cursor-not-allowed opacity-50'
                    : 'bg-orange-500 hover:bg-yellow-700 text-white hover:scale-105 transform'
                  }
                `}
              >
                {isLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>

              {message.text && (
                <div className={`
                  flex items-center gap-2 p-3 rounded-md text-sm transition-all duration-300
                  ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : ''}
                  ${message.type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' : ''}
                  ${message.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : ''}
                `}>
                  {getMessageIcon()}
                  <span>{message.text}</span>
                </div>
              )}
            </div>
          </div>

          {/* Wrapper for side-by-side links on mobile */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4 sm:gap-8">
            {/* Quick Links Section */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-green-100 hover:text-white transition-colors text-sm">Home</Link></li>
                <li><Link to="/about" className="text-green-100 hover:text-white transition-colors text-sm">About Us</Link></li>
                <li><Link to="/services" className="text-green-100 hover:text-white transition-colors text-sm">Our Services</Link></li>
                <li><Link to="/plans" className="text-green-100 hover:text-white transition-colors text-sm">Diet Plans</Link></li>
                <li><Link to="/blog" className="text-green-100 hover:text-white transition-colors text-sm">Blog</Link></li>
                <li><Link to="/knowYourBody" className="text-green-100 hover:text-white transition-colors text-sm">Know Your Body</Link></li>
              </ul>
            </div>

            {/* Explore Section */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Explore</h3>
              <ul className="space-y-3">
                <li><Link to="/services#events-gallery" className="text-green-100 hover:text-white transition-colors text-sm">Events Gallery</Link></li>
                <li><Link to="/plans#success-stories" className="text-green-100 hover:text-white transition-colors text-sm">Success Stories</Link></li>
                <li><Link to="/contactUs" className="text-green-100 hover:text-white transition-colors text-sm">Contact Us</Link></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-green-500 pt-4 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-6 sm:space-y-0 text-center sm:text-left">

            {/* Legal Links & Copyright */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                <Link to="/privacy" className="text-green-100 hover:text-white transition-colors text-xs sm:text-sm">Privacy Policy</Link>
                <span className="text-green-300 text-xs sm:text-sm">•</span>
                <Link to="/terms" className="text-green-100 hover:text-white transition-colors text-xs sm:text-sm">Terms and Conditions</Link>
              </div>
              <span className="hidden sm:block text-green-300 text-xs sm:text-sm">•</span>
              <p className="text-green-200 text-xs sm:text-sm opacity-80">
                © {new Date().getFullYear()} DietWithDee. All Rights Reserved.
              </p>
            </div>

            {/* Social Links and Power By */}
            <div className="flex flex-col items-center sm:flex-row gap-4 sm:gap-8">
              {/* Social Icons */}
              <div className="flex items-center gap-6">
                <a
                  href="https://www.instagram.com/diet.withdee?igsh=MW03bXpwMjhyZWEyNA%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-100 hover:text-pink-400 transition-colors hover:scale-110 transform"
                >
                  <Instagram size={20} />
                </a>

                <a
                  href="https://www.linkedin.com/company/dietwithdee/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-100 hover:text-blue-400 transition-colors hover:scale-110 transform"
                >
                  <Linkedin size={20} />
                </a>

                <a
                  href="https://www.tiktok.com/@dietwithdee?_t=ZM-8yWNZKQGM8G&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-100 hover:text-gray-200 transition-colors hover:scale-110 transform"
                >
                  <Music2 size={20} />
                </a>
              </div>

              {/* Powered By */}
              <a
                href="https://www.bookflywheel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-white text-xs sm:text-sm font-medium border-t sm:border-t-0 border-green-500/30 pt-4 sm:pt-0 w-full sm:w-auto mt-2 sm:mt-0"
              >
                Powered by Flywheel Technologies
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
        <div
          onMouseEnter={handleMouseEnter}
          className="relative"
        >
          <a
            href={Url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg 
              transition-all duration-500 ease-in-out transform hover:scale-105
              flex items-center gap-2 overflow-hidden relative z-10
              ${isExpanded ? 'px-4 py-3' : 'p-3 w-12 h-12 justify-center'}
            `}
          >
            <MessageCircle
              size={20}
              className={`
                flex-shrink-0 transition-all duration-300 z-10
                ${isExpanded ? 'animate-pulse' : 'animate-bounce'}
              `}
            />
            <span
              className={`
                font-medium text-sm whitespace-nowrap transition-all duration-500
                ${isExpanded ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'}
              `}
            >
              Talk to Dee
            </span>
          </a>

          {!isExpanded && (
            <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-ping pointer-events-none"></div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
