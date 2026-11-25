import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTestimonials } from '../hooks/useTestimonials';
import { DEFAULT_TESTIMONIALS } from '../utils/testimonialsData';
import TestimonialCard from './TestimonialCard';

/**
 * Reusable swiping Success Stories / Testimonials carousel.
 * Styled to match DietWithDee's warm stone, forest green, and orange editorial aesthetic.
 */
const TestimonialsCarousel = ({
  id = 'success-stories',
  compact = false,
  className = ''
}) => {
  const navigate = useNavigate();
  const { testimonials: firestoreTestimonials, fetchApprovedTestimonials } = useTestimonials();

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const liveFeatured = firestoreTestimonials
    .filter((t) => t.isFeatured)
    .map((t) => ({
      ...t,
      stars: t.rating || 5
    }));

  const testimonials =
    liveFeatured.length >= 5
      ? liveFeatured
      : [...liveFeatured, ...DEFAULT_TESTIMONIALS].slice(0, 5);

  const nextTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    const unsubscribe = fetchApprovedTestimonials();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [fetchApprovedTestimonials]);

  useEffect(() => {
    let interval;
    if (isAutoPlaying && !isHovered && testimonials.length > 1) {
      interval = setInterval(nextTestimonial, 7000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered, nextTestimonial, testimonials.length]);

  const scrollUp = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <section id={id} className={className} aria-label="Client Success Stories">
      {/* Section Heading */}
      <div className={compact ? 'space-y-2 mb-5 text-left' : 'text-center space-y-3 max-w-2xl mx-auto mb-8 px-2'}>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-800">
          Client Stories
        </p>
        <h2
          className={
            compact
              ? 'text-2xl sm:text-3xl font-serif-cormorant font-normal text-stone-900 tracking-tight'
              : 'text-3xl sm:text-4xl lg:text-5xl font-serif-cormorant font-normal text-stone-900 tracking-tight'
          }
        >
          Success Stories
        </h2>
        <p
          className={
            compact
              ? 'text-xs sm:text-sm text-stone-600 font-normal leading-relaxed max-w-xl'
              : 'text-stone-700 text-sm sm:text-base font-normal max-w-xl mx-auto leading-relaxed'
          }
        >
          Real people, real results. Swipe to read how clients built lasting habits without giving
          up their favourite meals.
        </p>
        <div
          className={`w-14 h-0.5 bg-[#F6841F] rounded-full ${compact ? 'mt-2' : 'mx-auto mt-2'}`}
        />
      </div>

      {/* Swipeable Carousel Viewport */}
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="overflow-hidden rounded-2xl sm:rounded-3xl">
          <motion.div
            className={`flex items-stretch ${
              testimonials.length > 1 ? 'cursor-grab active:cursor-grabbing' : ''
            }`}
            animate={{ x: `-${currentTestimonial * 100}%` }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            drag={testimonials.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.14}
            onDragStart={() => setIsAutoPlaying(false)}
            onDragEnd={(e, { offset }) => {
              if (testimonials.length <= 1) return;
              if (offset.x < -45) nextTestimonial();
              else if (offset.x > 45) prevTestimonial();
            }}
          >
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id || index} className="min-w-full flex">
                <TestimonialCard
                  testimonial={testimonial}
                  slideIndex={index}
                  totalSlides={testimonials.length}
                  className="select-none"
                />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Clean Carousel Navigation Bar (Prev · Dots · Next) */}
        {testimonials.length > 1 && (
          <div className="flex items-center justify-between gap-4 mt-4 px-1">
            <button
              type="button"
              onClick={() => {
                setIsAutoPlaying(false);
                prevTestimonial();
              }}
              aria-label="Previous testimonial"
              className="w-9 h-9 rounded-full bg-white border border-stone-200/90 hover:border-stone-300 hover:bg-stone-50 text-stone-700 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`View testimonial ${idx + 1}`}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentTestimonial(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 border-none cursor-pointer ${
                    idx === currentTestimonial
                      ? 'bg-[#F6841F] w-6'
                      : 'bg-stone-300 hover:bg-stone-400 w-1.5'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsAutoPlaying(false);
                nextTestimonial();
              }}
              aria-label="Next testimonial"
              className="w-9 h-9 rounded-full bg-white border border-stone-200/90 hover:border-stone-300 hover:bg-stone-50 text-stone-700 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons matching DietWithDee UI button styling */}
      <div
        className={`mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 ${
          compact ? 'justify-start' : 'justify-center'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            scrollUp();
            navigate('/submit-testimonial');
          }}
          className="px-6 py-3 rounded-full bg-[#1F4E36] hover:bg-[#173c29] text-white text-xs sm:text-sm font-semibold tracking-wide transition-colors shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer border-none"
        >
          <span>Share Your Story</span>
          <ArrowRight size={15} />
        </button>

        <button
          type="button"
          onClick={() => {
            scrollUp();
            navigate('/success-stories');
          }}
          className="px-6 py-3 rounded-full bg-white hover:bg-stone-50 text-stone-800 border border-stone-200/90 hover:border-stone-300 text-xs sm:text-sm font-semibold tracking-wide transition-colors shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>View All Stories</span>
          <ArrowRight size={15} className="text-stone-500" />
        </button>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
