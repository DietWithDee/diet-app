import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react'; // Using RefreshCw instead of Loader for better semantic meaning

const ScrollHideRefreshButton = ({ loadArticles, isLoading = false }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let scrollTimeout;

    const handleScroll = () => {
      // Hide button immediately when scrolling starts
      if (!isScrolling) {
        setIsScrolling(true);
        setIsVisible(false);
      }

      // Clear existing timeout
      clearTimeout(scrollTimeout);

      // Set timeout to show button after scrolling stops
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
        setIsVisible(true);
      }, 150); // Show button 150ms after scrolling stops
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isScrolling]);

  return (
    <div 
      className={`fixed bottom-20 right-4 z-50 transition-all duration-300 ease-in-out ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-4 scale-90 pointer-events-none'
      }`}
    >
      <button
        onClick={loadArticles}
        disabled={isLoading}
        className={`
          group relative p-4 bg-gradient-to-r from-green-600 to-emerald-600 
          text-white rounded-full shadow-lg hover:shadow-xl
          transform hover:scale-105 active:scale-95
          transition-all duration-200 ease-in-out
          disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
          backdrop-blur-sm border border-green-500/20
        `}
        title={isLoading ? "Loading..." : "Refresh Articles"}
        aria-label={isLoading ? "Loading articles" : "Refresh articles"}
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        
        {/* Icon */}
        <RefreshCw 
          size={20} 
          className={`relative z-10 ${
            isLoading 
              ? 'animate-spin text-white/80' 
              : 'group-hover:rotate-180 transition-transform duration-500'
          }`} 
        />
        
        {/* Ripple effect on click */}
        <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-active:scale-110 transition-transform duration-150" />
      </button>
      
      {/* Optional: Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        {isLoading ? 'Loading...' : 'Refresh Articles'}
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
};

export default ScrollHideRefreshButton;

