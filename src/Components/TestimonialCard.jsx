import React from 'react';
import { Quote } from 'lucide-react';
import { formatPlanLabel } from '../utils/testimonialHelpers';

export const StarRating = ({ rating = 5 }) => (
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
 * Shared editorial testimonial card used across TestimonialsCarousel and SuccessStories.
 */
const TestimonialCard = ({
  testimonial,
  slideIndex = null,
  totalSlides = null,
  compact = false,
  className = ''
}) => {
  const planLabel = formatPlanLabel(testimonial.planId || testimonial.plan);
  const metaParts = [testimonial.profession, testimonial.location].filter(Boolean);
  const starCount = testimonial.stars ?? testimonial.rating ?? 5;

  return (
    <article
      className={`w-full bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-2xs flex flex-col justify-between ${
        compact ? 'p-5 sm:p-6' : 'p-5 sm:p-8'
      } ${className}`}
    >
      {/* Top Meta Strip */}
      <div className="flex items-center justify-between gap-2.5 pb-3.5 border-b border-stone-100">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <StarRating rating={starCount} />
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70 truncate max-w-[200px] sm:max-w-[240px]">
            {planLabel}
          </span>
        </div>
        <Quote size={17} className="text-stone-300 shrink-0" aria-hidden="true" />
      </div>

      {/* Editorial Quote */}
      <div className={compact ? 'py-4 sm:py-5 flex-1 flex items-center' : 'py-5 sm:py-6 flex-1 flex items-center'}>
        <blockquote
          className={`font-serif-cormorant italic text-stone-900 leading-[1.48] font-normal ${
            compact ? 'text-lg sm:text-[20px]' : 'text-lg sm:text-[22px]'
          }`}
        >
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
                className="w-10 h-10 sm:w-11 sm:h-11 object-cover rounded-full border border-stone-200 bg-stone-100"
              />
            ) : (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-stone-200 bg-[#1F4E36] flex items-center justify-center text-white font-semibold text-sm sm:text-base select-none">
                {(testimonial.name || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center"
              title="Verified Client"
            >
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>

          <div className="min-w-0">
            <h4 className="font-bold text-stone-900 text-sm sm:text-[15px] truncate">
              {testimonial.name}
            </h4>
            {metaParts.length > 0 && (
              <p className="text-xs text-stone-500 font-medium truncate mt-0.5">
                {metaParts.join(' · ')}
              </p>
            )}
          </div>
        </div>

        {slideIndex !== null && totalSlides > 1 && (
          <span className="text-[11px] font-mono text-stone-400 shrink-0 hidden sm:inline">
            {String(slideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
          </span>
        )}
      </div>
    </article>
  );
};

export default TestimonialCard;
