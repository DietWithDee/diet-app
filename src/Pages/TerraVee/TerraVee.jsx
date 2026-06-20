import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronRight } from "lucide-react";
import SEO from "../../Components/SEO";
import ScrollToTop from "../../utils/ScrollToTop";

const TerraVee = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dragStart, setDragStart] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Product variants with different colors and images
  const variants = [
    {
      id: 1,
      name: "Tropical Mango",
      price: "GHS 45.00",
      image: "/terravee-variants/15.png",
      bgGradient: "from-orange-400 via-orange-300 to-yellow-200",
      accentColor: "from-orange-500 to-orange-300",
      whatsappText:
        "Hi! I'm interested in ordering TerraVee Tropical Mango variant. Please send me pricing and details.",
    },
    {
      id: 2,
      name: "Berry Blast",
      price: "GHS 45.00",
      image: "/terravee-variants/16.png",
      bgGradient: "from-pink-400 via-purple-300 to-purple-200",
      accentColor: "from-pink-500 to-purple-400",
      whatsappText:
        "Hi! I'm interested in ordering TerraVee Berry Blast variant. Please send me pricing and details.",
    },
    {
      id: 3,
      name: "Citrus Fresh",
      price: "GHS 45.00",
      image: "/terravee-variants/17.png",
      bgGradient: "from-yellow-400 via-lime-300 to-green-200",
      accentColor: "from-yellow-500 to-lime-400",
      whatsappText:
        "Hi! I'm interested in ordering TerraVee Citrus Fresh variant. Please send me pricing and details.",
    },
    {
      id: 4,
      name: "Mint Cool",
      price: "GHS 45.00",
      image: "/terravee-variants/18.png",
      bgGradient: "from-cyan-400 via-teal-300 to-emerald-200",
      accentColor: "from-cyan-500 to-teal-400",
      whatsappText:
        "Hi! I'm interested in ordering TerraVee Mint Cool variant. Please send me pricing and details.",
    },
    {
      id: 5,
      name: "Passion Paradise",
      price: "GHS 45.00",
      image: "/terravee-variants/19.png",
      bgGradient: "from-red-400 via-pink-300 to-rose-200",
      accentColor: "from-red-500 to-pink-400",
      whatsappText:
        "Hi! I'm interested in ordering TerraVee Passion Paradise variant. Please send me pricing and details.",
    },
  ];

  // Handle touch/drag for slider
  const handleDragStart = (e) => {
    setDragStart(e.clientX || e.touches?.[0]?.clientX || 0);
    setIsDragging(true);
  };

  const handleDragEnd = (e) => {
    const dragEnd = e.clientX || e.changedTouches?.[0]?.clientX || 0;
    const diff = dragStart - dragEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped left, go to next
        setCurrentSlide((prev) => (prev + 1) % variants.length);
      } else {
        // Swiped right, go to prev
        setCurrentSlide(
          (prev) => (prev - 1 + variants.length) % variants.length,
        );
      }
    }
    setIsDragging(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % variants.length);
  };

  const handleBuyNow = (variant) => {
    const whatsappURL = `https://wa.me/233545930804?text=${encodeURIComponent(variant.whatsappText)}`;
    window.open(whatsappURL, "_blank");
  };

  return (
    <>
      <SEO
        title="TerraVee Juice Variants - Order Now"
        description="Discover our beautiful collection of TerraVee Juice variants. Tropical Mango, Berry Blast, Citrus Fresh, Mint Cool, and Passion Paradise."
        url="/terravee"
      />
      <div className="min-h-screen bg-black overflow-hidden">
        <ScrollToTop />

        {/* Main Slider Container */}
        <div
          className="relative w-full h-screen flex items-center justify-center overflow-hidden"
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
        >
          {/* Slides */}
          <AnimatePresence mode="wait">
            {variants.map(
              (variant, index) =>
                index === currentSlide && (
                  <motion.div
                    key={variant.id}
                    className={`absolute inset-0 bg-gradient-to-b ${variant.bgGradient}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Center Gradient Overlay - White gradient in center */}
                    <div className="absolute inset-0 bg-gradient-radial from-white via-transparent to-transparent opacity-40"></div>

                    {/* Content Container */}
                    <div className="relative w-full h-full flex flex-col items-center justify-center px-6">
                      {/* Product Image */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: -30 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex items-center justify-center mb-12"
                      >
                        <div className="relative w-64 h-64 lg:w-96 lg:h-96 flex items-center justify-center">
                          <img
                            src={variant.image}
                            alt={variant.name}
                            className="w-full h-full object-contain drop-shadow-2xl"
                            onError={(e) => {
                              // Fallback if image doesn't exist
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      </motion.div>

                      {/* Product Info */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-center mb-8"
                      >
                        <h2 className="text-5xl lg:text-6xl font-black text-white mb-4 drop-shadow-lg">
                          {variant.name}
                        </h2>
                        <p className="text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
                          {variant.price}
                        </p>
                      </motion.div>

                      {/* Glass Effect Buy Button */}
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleBuyNow(variant)}
                        className={`relative px-10 py-4 lg:px-14 lg:py-5 rounded-full font-bold text-lg lg:text-xl text-white 
                        bg-gradient-to-r ${variant.accentColor}
                        backdrop-blur-md bg-opacity-30 border border-white border-opacity-50
                        shadow-lg hover:shadow-2xl transition-all duration-300
                        flex items-center gap-3 group overflow-hidden`}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <ShoppingBag size={24} />
                          Buy Now
                        </span>
                        {/* Glass shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </motion.button>
                    </div>
                  </motion.div>
                ),
            )}
          </AnimatePresence>

          {/* Navigation - Next Button (Right) */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextSlide}
            className="absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 z-20 
              p-4 rounded-full bg-white/20 backdrop-blur-md border border-white/50 
              text-white hover:bg-white/30 transition-all shadow-lg group"
          >
            <ChevronRight
              size={32}
              className="group-hover:translate-x-1 transition-transform"
            />
          </motion.button>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {variants.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`rounded-full transition-all ${
                  idx === currentSlide
                    ? "bg-white w-8 h-3"
                    : "bg-white/40 w-3 h-3 hover:bg-white/60"
                }`}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>

          {/* Info Text - Left bottom */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-8 left-8 z-20 text-white/70 max-w-xs"
          >
            <p className="text-sm font-semibold">
              Slide right to explore all variants →
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default TerraVee;
