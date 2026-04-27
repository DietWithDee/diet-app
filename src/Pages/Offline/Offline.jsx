import React, { useState, useEffect } from 'react';
import SEO from '../../Components/SEO';
import { WifiOff, RefreshCw, ArrowLeft, MessageCircle } from 'lucide-react';

function Offline({ onRetry }) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Listen for online/offline events to auto-retry
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-retry when connection is restored
      if (onRetry) {
        setIsRetrying(true);
        onRetry();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onRetry]);

  const handleRetry = async () => {
    setIsRetrying(true);
    if (onRetry) {
      await onRetry();
    }
    // Give a small delay so the spinner is visible
    setTimeout(() => setIsRetrying(false), 1500);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEO
        title="You're Offline | DietWithDee"
        description="It looks like you're offline. Please check your internet connection and try again."
        keywords="DietWithDee, Offline, Connection Error"
        image="https://dietwithdee.org/src/assets/LOGO.webp"
        url="https://dietwithdee.org/contactUs"
      />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20 flex items-center justify-center">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden">
            {/* Decorative background pulse rings */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-orange-100 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-green-100 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

            {/* Icon */}
            <div className="text-center space-y-6 mb-8 relative z-10">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mx-auto">
                  <WifiOff className="text-[#F6841F]" size={48} />
                </div>
                {/* Animated signal rings */}
                <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-2 border-orange-200 animate-ping opacity-20"></div>
              </div>

              {/* Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-green-800">
                  You're Offline
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  We couldn't check our booking availability because your device appears to be offline. Please check your internet connection and try again.
                </p>
              </div>
            </div>

            {/* Connection Status Indicator */}
            <div className={`flex items-center justify-center space-x-3 py-4 px-6 rounded-xl mb-8 transition-all duration-500 ${
              isOnline
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-orange-50 border-2 border-orange-200'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                isOnline
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-orange-400'
              }`}></div>
              <span className={`font-semibold ${
                isOnline ? 'text-green-700' : 'text-orange-700'
              }`}>
                {isOnline ? 'Connection restored! Retrying...' : 'No internet connection detected'}
              </span>
            </div>

            {/* Retry Button */}
            <div className="text-center space-y-4 mb-8">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                <RefreshCw
                  size={22}
                  className={isRetrying ? 'animate-spin' : ''}
                />
                <span>{isRetrying ? 'Checking...' : 'Try Again'}</span>
              </button>
            </div>

            {/* Tips Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                Troubleshooting Tips
              </h3>
              <div className="space-y-3 text-blue-700">
                <div className="flex items-start space-x-3">
                  <span className="text-xl">📶</span>
                  <p>Check your Wi-Fi or mobile data connection</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">🔄</span>
                  <p>Try turning your Wi-Fi off and back on</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">✈️</span>
                  <p>Make sure Airplane Mode is turned off</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">🌐</span>
                  <p>Try loading another website to confirm your connection</p>
                </div>
              </div>
            </div>

            {/* Alternative Contact */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                Need to book urgently?
              </h3>
              <p className="text-gray-700 mb-4">
                If you need immediate assistance, you can reach us directly via WhatsApp — it works even on slower connections.
              </p>
              <a
                href="https://wa.me/233592330870?text=Hello%2C%20I%E2%80%99d%20like%20to%20book%20a%20session%20with%20Diet%20with%20Dee"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                <MessageCircle size={20} />
                <span>WhatsApp Us</span>
              </a>
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
              Don't worry — your nutrition journey is just a reconnection away! 🌟
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Offline;
