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
      name: "Beetropine",
      image: "/terravee-variants/15.png",
      bgGradient: "from-[#310207] via-[#5c0612] to-[#1e0104]",
      accentColor: "from-[#780216] to-[#b30c1b]",
      whatsappText:
        "Hi! I'm interested in ordering TerraVee Beetropine variant. Please send me details.",
    },
    {
      id: 2,
      name: "Caropine",
      image: "/terravee-variants/16.png",
      bgGradient: "from-[#451a03] via-[#7c2d12] to-[#2c0a00]",
      accentColor: "from-[#ea580c] to-[#f97316]",
      whatsappText:
        "Hi! I'm interested in ordering TerraVee Caropine variant. Please send me details.",
    },
    {
      id: 3,
      name: "Tigernut",
      image: "/terravee-variants/17.png",
      bgGradient: "from-[#29170c] via-[#4a2e1b] to-[#1f0f06]",
      accentColor: "from-[#8c6239] to-[#a67b56]",
      whatsappText:
        "Hi! I'm interested in ordering TerraVee Tigernut variant. Please send me details.",
    },
    {
      id: 4,
      name: "Mintypine",
      image: "/terravee-variants/18.png",
      bgGradient: "from-[#022c22] via-[#065f46] to-[#011c15]",
      accentColor: "from-[#047857] to-[#10b981]",
      whatsappText:
        "Hi! I'm interested in ordering TerraVee Mintypine variant. Please send me details.",
    },
    {
      id: 5,
      name: "Mintyberry",
      image: "/terravee-variants/19.png",
      bgGradient: "from-[#2e0817] via-[#5c0d2b] to-[#1c030d]",
      accentColor: "from-[#db2777] to-[#ec4899]",
      whatsappText:
        "Hi! I'm interested in ordering TerraVee Mintyberry variant. Please send me details.",
    },
    {
      id: 6,
      name: "Father's Day Packs",
      isSpecialPack: true,
      image: "",
      bgGradient: "from-zinc-950 via-[#1f1a14] to-zinc-950",
      accentColor: "from-amber-600 to-amber-500",
      whatsappText:
        "Hi! I'm interested in ordering a TerraVee Father's Day pack. Please send me options and details.",
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
        description="Discover our beautiful collection of TerraVee Juice variants. Beetropine, Caropine, Tigernut, Mintypine, Mintyberry, and Father's Day Specials."
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
          <AnimatePresence>
            {variants.map(
              (variant, index) =>
                index === currentSlide && (
                  <motion.div
                    key={variant.id}
                    className={`absolute inset-0 bg-gradient-to-b ${variant.bgGradient}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    {/* Center Gradient Overlay - White gradient in center */}
                    <div className="absolute inset-0 bg-gradient-radial from-white via-transparent to-transparent opacity-40"></div>

                    {/* Content Container */}
                    <div className="relative w-full h-full">
                      {variant.isSpecialPack ? (
                        /* Father's Day Pack Slide Layout — bottles fill available height */
                        <div className="w-full h-full flex flex-col items-center justify-between py-10 px-4">
                          {/* Bottles fill the top portion */}
                          <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-6 w-full flex-1 px-2 pb-4">
                            {variants.slice(0, 5).map((v, i) => (
                              <motion.div
                                key={v.id}
                                initial={{ y: 60, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
                                whileHover={{ y: -24, scale: 1.1 }}
                                className="flex-1 flex items-end justify-center h-[55vh] max-h-[520px]"
                              >
                                <img
                                  src={v.image}
                                  alt={v.name}
                                  className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.7)]"
                                />
                              </motion.div>
                            ))}
                          </div>

                          {/* Heading and Pack pricing info */}
                          <div className="text-center shrink-0 pb-2">
                            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-2 tracking-wide drop-shadow-lg">
                              {variant.name}
                            </h2>
                            <p className="text-base sm:text-2xl lg:text-3xl font-bold text-amber-400 drop-shadow-md">
                              Available from GHS 120.00 to GHS 300.00
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* Standard Single Variant: Full-screen hero bottle with overlay text */
                        <div className="w-full h-full relative flex items-center justify-center">
                          {/* Bottle — fills the entire slide */}
                          <motion.img
                            key={variant.image}
                            src={variant.image}
                            alt={variant.name}
                            initial={{ scale: 0.2, opacity: 0, y: 80 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.2, opacity: 0, y: -80 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="h-[78vh] sm:h-[82vh] md:h-[88vh] w-auto max-w-[90vw] object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.8)] z-10"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />

                          {/* Product name — bottom left overlay */}
                          <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="absolute bottom-16 left-6 md:left-12 z-20"
                          >
                            <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white drop-shadow-lg tracking-tight leading-none">
                              {variant.name}
                            </h2>
                          </motion.div>

                          {/* Buy button — bottom right overlay */}
                          <motion.button
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            whileHover={{ scale: 1.05, y: -4 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleBuyNow(variant)}
                            className={`absolute bottom-16 right-6 md:right-12 z-20 px-8 py-4 md:px-12 md:py-5 rounded-full font-bold text-lg md:text-xl text-white
                            bg-gradient-to-r ${variant.accentColor}
                            backdrop-blur-md border border-white/40
                            shadow-2xl flex items-center gap-3 group overflow-hidden`}
                          >
                            <span className="relative z-10 flex items-center gap-2">
                              <ShoppingBag size={22} />
                              Buy Now
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </motion.button>
                        </div>
                      )}

                      {/* Render Order Now Button for Father's Day pack */}
                      {variant.isSpecialPack && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleBuyNow(variant)}
                          className={`absolute bottom-6 right-6 z-20 px-10 py-4 lg:px-14 lg:py-5 rounded-full font-bold text-lg lg:text-xl text-white 
                          bg-gradient-to-r ${variant.accentColor}
                          border border-white/40
                          shadow-2xl flex items-center gap-3 group overflow-hidden`}
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            <ShoppingBag size={24} />
                            Order Now
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ),
            )}
          </AnimatePresence>

          {/* Navigation - Next Button (Right) - Hidden on Father's Day Pack slide */}
          {currentSlide !== variants.length - 1 && (
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
          )}

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {variants.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`rounded-full transition-all ${
                  idx === currentSlide
                    ? "bg-white w-2 h-2"
                    : "bg-white/40 w-1.5 h-1.5 hover:bg-white/60"
                }`}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>

          {/* Info Text - Left bottom - Hidden on Father's Day Pack slide */}
          {currentSlide !== variants.length - 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute bottom-8 left-8 z-20 text-white/70 max-w-xs"
            >
              <p className="text-sm font-semibold">
                Slide right to explore all variants →
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default TerraVee;
