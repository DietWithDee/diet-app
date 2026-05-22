import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import SEO from '../../Components/SEO';
import { useTestimonials } from '../../hooks/useTestimonials';
const defaultTestimonials = [
  {
    id: 'default-1',
    name: 'Michael Asare',
    content: "Nana Ama's Weight Gain guide helped me go from 56kg to 78kg in just 5 months. Before that her 5 week follow up period psyched my mind for the task ahead. Her encouragement, step-by-step approach, and constant motivation made all the difference. I feel healthier, more confident, and energized than ever before. I couldn't have done it without her support.",
    rating: 5,
    stars: 5,
    profession: 'Professional Engineer',
    plan: 'weight-gain',
    location: 'Accra, Ghana'
  },
  {
    id: 'default-2',
    name: 'Grace Blankson',
    content: "I've struggled with hypertension for well over 2 years. Thanks to Dee's Pressure No Dey Catch Me Plan, I now have a trusted source of meals that actually work for me. Her warm demeanor and constant willingness to listen made all the difference. I definitely recommend her to anyone managing hypertension.",
    rating: 5,
    stars: 5,
    profession: 'Trader',
    plan: 'pressure-no-dey-catch-me',
    location: 'Takoradi, Ghana'
  },
  {
    id: 'default-3',
    name: 'Kobby Breeze',
    content: "When I was diagnosed with diabetes in October 2024, it felt like a death sentence. I was scared and overwhelmed. But with the guidance of my Doctor and my Dietician, Nana Ama Dwamena, I learned that with the right lifestyle changes, exercise and a proper diet, I could live a normal life. For six weeks, I committed to the plan, not just for myself, but for my daughter Nicole. Through the Blood Sugar Balancing plan, today, I feel healthier, stronger, and more hopeful than ever. Glory be to God!",
    rating: 5,
    stars: 5,
    profession: 'Professional Engineer',
    plan: 'blood-sugar-balance',
    location: 'Accra, Ghana'
  },
  {
    id: 'default-4',
    name: 'Lawrencia Kwakye',
    content: "Before I started Diet with Dee's 5-Day Reset, my body felt totally out of sync and sluggish. Seriously, I was dragging myself through the day! But after just five days, it's like my body hit the reset button – pun totally intended. My system feels cleaner, and I'm pretty sure my skin is glowing. Dee, you've worked some kind of magic! This isn't just a diet; it's a total life upgrade.",
    rating: 5,
    stars: 5,
    profession: 'Teacher',
    plan: 'back-to-basics',
    location: 'Accra, Ghana'
  },
  {
    id: 'default-5',
    name: 'Richard Oti',
    content: "This was my very first encounter with a dietitian, and the objective of my visit was to lose weight. I must say, the results over the past few weeks have been amazing! She gave me a personalized meal plan with familiar foods that are protein-rich, low in carbs, and full of healthy fats. Since following it, my digestion has improved, my bloating has reduced, I wake up more energized, and I've been able to cut out late-night snacking and junk food. I feel healthier and more active than ever!",
    rating: 5,
    stars: 5,
    profession: 'Teacher',
    plan: 'snatched-nourished',
    location: 'Tema, Ghana'
  }
];

function SuccessStories() {
  const { testimonials, loading, fetchApprovedTestimonials } = useTestimonials();
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [page, setPage] = useState(1);
  
  const itemsPerPage = 9;

  useEffect(() => {
    fetchApprovedTestimonials();
  }, [fetchApprovedTestimonials]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const plans = [
    { id: 'all', label: 'All Plans' },
    { id: 'back-to-basics', label: 'Back to Basics' },
    { id: 'snatched-nourished', label: 'Snatched & Nourished' },
    { id: 'blood-sugar-balance', label: 'Blood Sugar Balance' },
    { id: 'pressure-no-dey-catch-me', label: 'Pressure No Dey Catch Me' },
    { id: 'weight-gain', label: 'The Weight Gain' },
    { id: 'custom-plan', label: 'Custom Plan' },
  ];

  const combinedTestimonials = [...testimonials, ...defaultTestimonials];

  const filtered = selectedPlan === 'all' 
    ? combinedTestimonials 
    : combinedTestimonials.filter(t => t.plan === selectedPlan);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIdx = (page - 1) * itemsPerPage;
  const displayedTestimonials = filtered.slice(startIdx, startIdx + itemsPerPage);

  return (
    <>
      <SEO
        title="Success Stories - DietWithDee"
        description="Read inspiring testimonials from our clients who transformed their lives with our nutrition plans."
      />
      
      <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20 px-6 lg:px-12'>
        {/* Hero Section */}
        <div className='text-center space-y-4 max-w-3xl mx-auto mb-16'>
          <h1 className='text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600'>
            Success Stories
          </h1>
          <p className='text-gray-600 text-lg'>
            Hundreds of transformations. Real people, real results. Be inspired and start your journey today.
          </p>
          <div className='w-20 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto rounded-full'></div>
        </div>

        {/* Filter Section */}
        <div className='max-w-6xl mx-auto mb-12'>
          <div className='flex items-center gap-3 mb-4'>
            <Filter size={20} className='text-green-600' />
            <span className='font-bold text-gray-700'>Filter by Plan</span>
          </div>
          <div className='flex gap-2 flex-wrap'>
            {plans.map(plan => (
              <button
                key={plan.id}
                onClick={() => { setSelectedPlan(plan.id); setPage(1); }}
                className={`px-4 py-2 rounded-full font-semibold transition-all ${
                  selectedPlan === plan.id
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-400'
                }`}
              >
                {plan.label}
              </button>
            ))}
          </div>
          <p className='text-sm text-gray-600 mt-4'>{filtered.length} stories found</p>
        </div>

        {/* Testimonials Grid */}
        <div className='max-w-6xl mx-auto'>
          {loading ? (
            <div className='text-center py-12'>
              <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600'></div>
            </div>
          ) : displayedTestimonials.length === 0 ? (
            <div className='bg-white rounded-2xl p-12 text-center border border-gray-100'>
              <p className='text-gray-600 text-lg'>No stories found for this filter.</p>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {displayedTestimonials.map((testimonial) => (
                  <div key={testimonial.id} className='bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-100 flex flex-col'>
                    {/* Profile */}
                    <div className='flex items-center gap-4 mb-4'>
                      <div className='relative'>
                        <div className='h-14 w-14 rounded-full object-cover border-3 border-green-100 bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg select-none'>
                          {(testimonial.name || 'Anonymous').charAt(0).toUpperCase()}
                        </div>
                        <div className='absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1'>
                          <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                            <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className='font-bold text-gray-800'>{testimonial.name}</h3>
                        <p className='text-xs text-green-600 font-semibold'>{(testimonial.plan || '').replace(/-/g, ' ')}</p>
                        <p className='text-xs text-gray-500'>{testimonial.location}</p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className='flex gap-1 mb-4'>
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill='currentColor' viewBox='0 0 20 20'>
                          <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                        </svg>
                      ))}
                    </div>

                    {/* Content */}
                    <p className='text-gray-700 text-sm leading-relaxed mb-4 flex-grow italic'>
                      "{testimonial.content}"
                    </p>

                    <div className='w-12 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full'></div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='flex justify-center items-center gap-4 mt-12'>
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className='p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className='flex gap-2'>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          page === i + 1
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className='p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* CTA Section */}
        <div className='mt-20 text-center max-w-2xl mx-auto'>
          <h2 className='text-3xl font-bold text-gray-800 mb-4'>Ready to write your own story?</h2>
          <p className='text-gray-600 mb-6'>Share your transformation with our community and inspire others.</p>
          <a href='/submit-testimonial' className='inline-block px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-full hover:shadow-lg transition-all hover:scale-105'>
            Share Your Success
          </a>
        </div>
      </div>
    </>
  );
}

export default SuccessStories;
