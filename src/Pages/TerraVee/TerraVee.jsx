import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import SEO from "../../Components/SEO";
import ScrollToTop from "../../utils/ScrollToTop";

const TerraVee = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Product carousel items - placeholders
  const products = [
    {
      id: 1,
      name: "TerraVee Single Pack",
      price: "GHS 50.00",
      discountedPrice: "GHS 45.00",
      image: "🥤",
      description: "Fresh TerraVee juice pack for daily wellness",
      features: [
        "100% Natural",
        "No Added Sugar",
        "Refreshing",
        "Single Bottle",
      ],
    },
    {
      id: 2,
      name: "TerraVee Bundle - Premium",
      price: "GHS 150.00",
      discountedPrice: "GHS 135.00",
      image: "📦",
      description:
        "Complete bundle with 3 different flavors - exclusive collab",
      features: [
        "3 Different Flavors",
        "Special Father's Day Packaging",
        "Mix & Match",
      ],
    },
    {
      id: 3,
      name: "TerraVee Family Pack",
      price: "GHS 280.00",
      discountedPrice: "GHS 252.00",
      image: "👨‍👩‍👧‍👦",
      description:
        "Perfect for the whole family - bulk savings for Father's Day",
      features: [
        "6 Bottles Total",
        "Best Value",
        "Family Approved",
        "Free Shipping",
      ],
    },
    {
      id: 4,
      name: "TerraVee Wellness Bundle",
      price: "GHS 200.00",
      discountedPrice: "GHS 180.00",
      image: "💚",
      description: "Curated wellness bundle with premium selection",
      features: [
        "4 Assorted Flavors",
        "Premium Packaging",
        "Health-Focused",
        "Diet with Dee Approved",
      ],
    },
  ];

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlay, products.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length);
    setIsAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
    setIsAutoPlay(false);
  };

  const handleWhatsAppOrder = (product) => {
    const message = `Hi! I'm interested in the ${product.name} (${product.discountedPrice} with 10% Diet with Dee customer discount). 

I'd like to place an order for the Father's Day collaboration. Please confirm availability and next steps.

Thanks!`;
    const whatsappURL = `https://wa.me/233545930804?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");
  };

  return (
    <>
      <SEO
        title="TerraVee Juice - Order Now"
        description="Get discounted TerraVee juice packs when you order from Diet with Dee. Fresh, natural, and delicious!"
        url="/terravee"
      />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <ScrollToTop />

        {/* Hero Section */}
        <motion.div
          className="bg-gradient-to-r from-emerald-600 to-green-600 text-white py-16 px-6 lg:px-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-6xl mb-4"
            >
              🥤
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-1 rounded-full font-bold text-sm mb-4 border border-white/30"
            >
              🎁 Father's Day Collaboration 🎁
            </motion.div>
            <h1 className="text-4xl lg:text-5xl font-black mb-4">
              TerraVee Juice x Diet with Dee
            </h1>
            <p className="text-lg lg:text-xl opacity-90 max-w-2xl mx-auto mb-6">
              Get a discounted pack of TerraVee Juice when you order from Diet
              with Dee. Fresh, natural, and delicious!
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 space-y-3"
            >
              <div className="inline-block bg-red-600 text-white px-6 py-3 rounded-full font-black text-xl shadow-lg border-2 border-white/50">
                🎉 10% OFF for Diet with Dee Customers! 🎉
              </div>
              <p className="text-base font-semibold opacity-95">
                Exclusive discount for our nutrition community
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Product Carousel */}
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-20">
          <h2 className="text-3xl font-black text-center text-green-700 mb-12">
            Our Products
          </h2>

          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
              <motion.div
                className="flex"
                animate={{ x: `-${currentSlide * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    className="min-w-full flex items-center justify-between p-8 lg:p-12 bg-gradient-to-r from-green-50 to-emerald-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Image Section */}
                    <motion.div
                      className="flex-1 flex items-center justify-center"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="text-9xl drop-shadow-lg">
                        {product.image}
                      </div>
                    </motion.div>

                    {/* Content Section */}
                    <motion.div
                      className="flex-1 ml-8"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className="text-3xl font-bold text-green-700 mb-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-3 mb-4">
                        <p className="text-lg font-bold text-gray-400 line-through">
                          {product.price}
                        </p>
                        <p className="text-2xl font-black text-red-600">
                          {product.discountedPrice}
                        </p>
                        <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                          Save 10%
                        </span>
                      </div>
                      <p className="text-gray-600 mb-6 text-lg">
                        {product.description}
                      </p>

                      {/* Features */}
                      <ul className="space-y-2 mb-8">
                        {product.features.map((feature, idx) => (
                          <motion.li
                            key={idx}
                            className="flex items-center gap-3 text-gray-700"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 + idx * 0.1 }}
                          >
                            <span className="text-2xl">✓</span>
                            <span className="font-medium">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleWhatsAppOrder(product)}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                      >
                        <MessageCircle size={24} />
                        Order via WhatsApp
                      </motion.button>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Navigation Arrows */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevSlide}
              onMouseEnter={() => setIsAutoPlay(false)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 p-3 bg-white shadow-lg rounded-full text-green-600 hover:bg-green-50 z-10 transition-all"
            >
              <ChevronLeft size={28} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextSlide}
              onMouseEnter={() => setIsAutoPlay(false)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 p-3 bg-white shadow-lg rounded-full text-green-600 hover:bg-green-50 z-10 transition-all"
            >
              <ChevronRight size={28} />
            </motion.button>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-3 mt-8">
              {products.map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => {
                    setCurrentSlide(idx);
                    setIsAutoPlay(false);
                  }}
                  className={`rounded-full transition-all ${
                    idx === currentSlide
                      ? "bg-green-600 w-8 h-3"
                      : "bg-gray-300 w-3 h-3 hover:bg-gray-400"
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Why Choose Section */}
        <motion.div
          className="bg-white py-20 px-6 lg:px-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-black text-center text-green-700 mb-12">
              Why TerraVee + Diet with Dee?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🥤",
                  title: "Quality Products",
                  description: "100% natural ingredients, no additives",
                },
                {
                  icon: "💚",
                  title: "Diet Friendly",
                  description: "Aligns with healthy nutrition goals",
                },
                {
                  icon: "🎁",
                  title: "Father's Day Special",
                  description: "Exclusive 10% discount for our customers",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200 text-center"
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.2 }}
                >
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-green-700 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16 px-6 lg:px-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-black mb-6">
              🎁 Father's Day Special - 10% OFF! 🎁
            </h2>
            <p className="text-lg mb-2 opacity-90">
              Exclusive discount for Diet with Dee customers
            </p>
            <p className="text-base mb-8 opacity-85">
              Valid for all TerraVee products during Father's Day collaboration
            </p>
            <motion.a
              href="https://wa.me/233545930804?text=Hi! I'd like to order TerraVee juice for the Father's Day collaboration. I'm a Diet with Dee customer and would like to apply the 10% discount. Please send me the available products and bundle options. Thanks!"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-white text-green-600 px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <MessageCircle size={28} />
              Chat on WhatsApp - Get Your 10% OFF
            </motion.a>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default TerraVee;
