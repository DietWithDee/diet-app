import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTestimonials } from '../hooks/useTestimonials';
import B2B from '../assets/images/B2B.webp';
import Gain from '../assets/images/Gain.webp';
import Weightloss from '../assets/images/Weightloss.webp';
import Diabetes from '../assets/images/Diabetes.webp';
import Pressure from '../assets/images/Pressure.webp';

const DEFAULT_TESTIMONIALS = [
  {
    name: 'Michael Asare',
    img: Gain,
    content:
      "Nana Ama's Weight Gain guide helped me go from 56kg to 78kg in just 5 months. Before that her 5 week follow up period psyched my mind for the task ahead. Her encouragement, step-by-step approach, and constant motivation made all the difference. I feel healthier, more confident, and energized than ever before. I couldn't have done it without her support.",
    stars: 5,
    profession: 'Structural Engineer',
    plan: 'The Weight Gain',
    location: 'Accra, Ghana'
  },
  {
    name: 'Grace Blankson',
    img: Pressure,
    content:
      "I've struggled with hypertension for well over 2 years. Thanks to Dee's Pressure No Dey Catch Me Plan, I now have a trusted source of meals that actually work for me. Her warm demeanor and constant willingness to listen made all the difference. I definitely recommend her to anyone managing hypertension.",
    stars: 5,
    profession: 'Retail Trader',
    plan: 'Pressure No Dey Catch Me',
    location: 'Takoradi, Ghana'
  },
  {
    name: 'Kobby Breeze',
    img: Diabetes,
    content:
      'When I was diagnosed with diabetes in October 2024, it felt like a death sentence. I was scared and overwhelmed. But with the guidance of my Doctor and my Dietician, Nana Ama Dwamena, I learned that with the right lifestyle changes, exercise and a proper diet, I could live a normal life. For six weeks, I committed to the plan, not just for myself, but for my daughter Nicole. Through the Blood Sugar Balancing plan, today, I feel healthier, stronger, and more hopeful than ever. Glory be to God!',
    stars: 5,
    profession: 'Software Developer',
    plan: 'Blood Sugar Balance',
    location: 'Accra, Ghana'
  },
  {
    name: 'Lawrencia Kwakye',
    img: B2B,
    content:
      "Before I started Diet with Dee's 5-Day Reset, my body felt totally out of sync and sluggish. Seriously, I was dragging myself through the day! But after just five days, it's like my body hit the reset button – pun totally intended. My system feels cleaner, and I'm pretty sure my skin is glowing. Dee, you've worked some kind of magic! This isn't just a diet; it's a total life upgrade.",
    stars: 5,
    profession: 'High School Teacher',
    plan: 'Back to Basics',
    location: 'Accra, Ghana'
  },
  {
    name: 'Richard Oti',
    img: Weightloss,
    content:
      "This was my very first encounter with a dietitian, and the objective of my visit was to lose weight. I must say, the results over the past few weeks have been amazing! She gave me a personalized meal plan with familiar foods that are protein-rich, low in carbs, and full of healthy fats. Since following it, my digestion has improved, my bloating has reduced, I wake up more energized, and I've been able to cut out late-night snacking and junk food. I feel healthier and more active than ever!",
    stars: 5,
    profession: 'Senior Accountant',
    plan: 'Snatched & Nourished',
    location: 'Tema, Ghana'
  }
];

const formatPlanLabel = (plan) => {
  if (!plan) return 'Client Consultation';
  if (plan.includes('-') && !plan.includes(' ')) {
    return plan
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return plan;
};

const StarRating = ({ rating = 5 }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-3.5 h-3.5 ${i < rating ? 'text-amber-500' : 'text-stone-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

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
            {testimonials.map((testimonial, index) => {
              const planLabel = formatPlanLabel(testimonial.plan);
              const metaParts = [testimonial.profession, testimonial.location].filter(Boolean);

              return (
                <div key={testimonial.id || index} className="min-w-full flex">
                  <article className="w-full bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-2xs p-5 sm:p-8 flex flex-col justify-between select-none">
                    {/* Top Meta Strip */}
                    <div className="flex items-center justify-between gap-3 pb-4 border-b border-stone-100">
                      <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                        <StarRating rating={testimonial.stars} />
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70 truncate max-w-[210px] sm:max-w-xs">
                          {planLabel}
                        </span>
                      </div>
                      <Quote size={18} className="text-stone-300 shrink-0" aria-hidden="true" />
                    </div>

                    {/* Quote Body */}
                    <div className="py-5 sm:py-6 flex-1 flex items-center">
                      <blockquote className="font-serif-cormorant italic text-lg sm:text-[22px] text-stone-900 leading-[1.48] font-normal">
                        &ldquo;{testimonial.content}&rdquo;
                      </blockquote>
                    </div>

                    {/* Anchored Author Strip */}
                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          {testimonial.img ? (
                            <img
                              src={testimonial.img}
                              alt={testimonial.name}
                              draggable={false}
                              className="w-11 h-11 sm:w-12 sm:h-12 object-cover rounded-full border border-stone-200 bg-stone-100"
                            />
                          ) : (
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-stone-200 bg-[#1F4E36] flex items-center justify-center text-white font-semibold text-base select-none">
                              {(testimonial.name || 'A').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span
                            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center"
                            title="Verified Client"
                          >
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-bold text-stone-900 text-sm sm:text-base truncate">
                            {testimonial.name}
                          </h4>
                          {metaParts.length > 0 && (
                            <p className="text-xs text-stone-500 font-medium truncate mt-0.5">
                              {metaParts.join(' · ')}
                            </p>
                          )}
                        </div>
                      </div>

                      {testimonials.length > 1 && (
                        <span className="text-[11px] font-mono text-stone-400 shrink-0 hidden sm:inline">
                          {String(index + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  </article>
                </div>
              );
            })}
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
