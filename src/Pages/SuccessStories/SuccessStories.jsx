import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Filter, ArrowRight, MessageSquarePlus } from 'lucide-react';
import SEO from '../../Components/SEO';
import TestimonialCard from '../../Components/TestimonialCard';
import { useTestimonials } from '../../hooks/useTestimonials';
import { DEFAULT_TESTIMONIALS } from '../../utils/testimonialsData';
import { TESTIMONIAL_PLANS, matchesPlanFilter } from '../../utils/testimonialHelpers';

function SuccessStories() {
  const { testimonials, loading, fetchApprovedTestimonials } = useTestimonials();
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [page, setPage] = useState(1);

  const itemsPerPage = 9;

  useEffect(() => {
    const unsubscribe = fetchApprovedTestimonials();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [fetchApprovedTestimonials]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filterOptions = useMemo(
    () => [{ id: 'all', label: 'All Stories' }, ...TESTIMONIAL_PLANS],
    []
  );

  const combinedTestimonials = useMemo(() => {
    const seen = new Set();
    return [...testimonials, ...DEFAULT_TESTIMONIALS].filter((item) => {
      const key = (item.id || `${item.name}-${item.content?.slice(0, 32)}`).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [testimonials]);

  const filtered = useMemo(
    () => combinedTestimonials.filter((item) => matchesPlanFilter(item, selectedPlan)),
    [combinedTestimonials, selectedPlan]
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIdx = (page - 1) * itemsPerPage;
  const displayedTestimonials = filtered.slice(startIdx, startIdx + itemsPerPage);

  return (
    <>
      <SEO
        title="Success Stories - DietWithDee"
        description="Read inspiring testimonials from our clients who transformed their health with DietWithDee consultations and Ghanaian meal plans."
      />

      <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-montserrat pt-[84px] sm:pt-28 pb-24 px-4 sm:px-6 lg:px-12 selection:bg-[#F6841F] selection:text-white">
        <div className="max-w-5xl mx-auto">
          {/* Editorial Header */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-stone-200/80 pb-8 mb-8">
            <div className="space-y-2.5 max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-800">
                Client Stories
              </p>
              <h1 className="text-3xl sm:text-5xl font-serif-cormorant font-normal text-stone-900 tracking-tight leading-[1.08]">
                Success Stories
              </h1>
              <p className="text-sm sm:text-base text-stone-600 font-normal leading-relaxed">
                Real people, real results. Explore how clients built lasting habits across
                consultations and personalized Ghanaian meal guides.
              </p>
              <div className="w-14 h-0.5 bg-[#F6841F] rounded-full pt-0.5" />
            </div>

            <Link
              to="/submit-testimonial"
              className="px-6 py-3 rounded-full bg-[#1F4E36] hover:bg-[#173c29] text-white text-xs sm:text-sm font-semibold tracking-wide transition-colors shadow-2xs inline-flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <MessageSquarePlus size={15} />
              <span>Share Your Story</span>
            </Link>
          </header>

          {/* Filter Section */}
          <section className="mb-8 space-y-3" aria-label="Filter stories by consultation or plan">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-stone-800">
                <Filter size={15} className="text-emerald-800" />
                <span className="text-xs font-bold uppercase tracking-[0.14em]">
                  Filter by Program
                </span>
              </div>
              <span className="text-xs font-medium text-stone-500">
                Showing {filtered.length} {filtered.length === 1 ? 'story' : 'stories'}
              </span>
            </div>

            <div className="flex gap-2 flex-wrap">
              {filterOptions.map((plan) => {
                const isActive = selectedPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      setPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-stone-900 text-white border border-stone-900 shadow-2xs'
                        : 'bg-white text-stone-700 border border-stone-200/90 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    {plan.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Testimonials Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {[0, 1, 2].map((skeletonIdx) => (
                <div
                  key={skeletonIdx}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/80 p-6 h-64 animate-pulse flex flex-col justify-between"
                >
                  <div className="h-4 bg-stone-200 rounded w-1/2" />
                  <div className="space-y-2.5">
                    <div className="h-4 bg-stone-200 rounded w-full" />
                    <div className="h-4 bg-stone-200 rounded w-5/6" />
                    <div className="h-4 bg-stone-200 rounded w-2/3" />
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                    <div className="w-10 h-10 rounded-full bg-stone-200" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-stone-200 rounded w-1/3" />
                      <div className="h-3 bg-stone-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayedTestimonials.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 p-10 sm:p-12 text-center space-y-4">
              <p className="text-stone-700 text-base font-medium">
                No verified stories are listed for this filter yet.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan('all');
                    setPage(1);
                  }}
                  className="px-5 py-2.5 rounded-full bg-white border border-stone-200/90 hover:border-stone-300 text-stone-800 text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  Show All Stories
                </button>
                <Link
                  to="/submit-testimonial"
                  className="px-5 py-2.5 rounded-full bg-[#1F4E36] hover:bg-[#173c29] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5"
                >
                  <span>Be the First to Share</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
                {displayedTestimonials.map((testimonial, idx) => (
                  <TestimonialCard
                    key={testimonial.id || `${testimonial.name}-${idx}`}
                    testimonial={testimonial}
                    compact
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2.5 mt-10">
                  <button
                    type="button"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                    className="w-9 h-9 rounded-full bg-white border border-stone-200/90 hover:border-stone-300 text-stone-700 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        type="button"
                        onClick={() => setPage(i + 1)}
                        className={`min-w-[36px] h-9 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          page === i + 1
                            ? 'bg-stone-900 text-white border border-stone-900'
                            : 'bg-white text-stone-700 border border-stone-200/90 hover:border-stone-300'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    aria-label="Next page"
                    className="w-9 h-9 rounded-full bg-white border border-stone-200/90 hover:border-stone-300 text-stone-700 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Editorial Bottom CTA Card */}
          <div className="mt-14 bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-2xs p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-800">
                Your Experience Matters
              </p>
              <h2 className="text-2xl sm:text-3xl font-serif-cormorant font-normal text-stone-900 tracking-tight">
                Ready to write your own story?
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Have you worked with Nana Ama Dwamena or completed one of our meal guides? Share how
                it helped, or book a session to start yours.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                to="/submit-testimonial"
                className="px-6 py-3 rounded-full bg-[#1F4E36] hover:bg-[#173c29] text-white text-xs sm:text-sm font-semibold tracking-wide transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>Share Your Story</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/contactUs"
                className="px-6 py-3 rounded-full bg-[#F6841F] hover:bg-[#e07312] text-white text-xs sm:text-sm font-semibold tracking-wide transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>Book a Session</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SuccessStories;
