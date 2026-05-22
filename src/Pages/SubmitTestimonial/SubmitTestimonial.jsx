import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import SEO from '../../Components/SEO';
import { useTestimonials } from '../../hooks/useTestimonials';
import ScrollToTop from "../../utils/ScrollToTop";

function SubmitTestimonial() {
  const navigate = useNavigate();
  const { submitTestimonial } = useTestimonials();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    profession: '',
    plan: 'snatched-nourished',
    rating: 5,
    content: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const plans = [
    { id: 'back-to-basics', label: 'Back to Basics' },
    { id: 'snatched-nourished', label: 'Snatched & Nourished' },
    { id: 'blood-sugar-balance', label: 'Blood Sugar Balance' },
    { id: 'pressure-no-dey-catch-me', label: 'Pressure No Dey Catch Me' },
    { id: 'weight-gain', label: 'The Weight Gain' },
    { id: 'custom-plan', label: 'Custom Plan' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await submitTestimonial(formData);
    
    if (result.success) {
      setSubmitStatus('success');
      setFormData({ name: '', email: '', location: '', profession: '', plan: 'snatched-nourished', rating: 5, content: '' });
      setTimeout(() => navigate('/plans'), 2000);
    } else {
      setSubmitStatus('error');
    }
    setLoading(false);
  };

  return (
    <>
      <ScrollToTop />
      <SEO 
        title="Share Your Success Story"
        description="Submit your testimonial and inspire others on their wellness journey."
      />
      <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20 px-6'>
        <div className='max-w-2xl mx-auto'>
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600 mb-4'>
              Share Your Success Story
            </h1>
            <p className='text-gray-600 text-lg'>
              Your story matters! Help others discover their transformation by sharing your experience with DietWithDee.
            </p>
          </div>

          <div className='bg-white rounded-3xl shadow-xl p-8 border border-gray-100'>
            {submitStatus === 'success' && (
              <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex gap-3'>
                <CheckCircle className='text-green-600 flex-shrink-0' />
                <div>
                  <h3 className='font-bold text-green-900'>Thank you!</h3>
                  <p className='text-green-700 text-sm'>Your story has been submitted for review. We'll feature it soon!</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3'>
                <AlertCircle className='text-red-600 flex-shrink-0' />
                <div>
                  <h3 className='font-bold text-red-900'>Submission Failed</h3>
                  <p className='text-red-700 text-sm'>Please try again or contact support.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Name */}
              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>Full Name *</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500'
                  placeholder='Michael Asare'
                />
              </div>

              {/* Email */}
              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>Email *</label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500'
                  placeholder='michael@example.com'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                {/* Location */}
                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-2'>Location *</label>
                  <input
                    type='text'
                    name='location'
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500'
                    placeholder='Accra, Ghana'
                  />
                </div>

                {/* Profession */}
                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-2'>Profession</label>
                  <input
                    type='text'
                    name='profession'
                    value={formData.profession}
                    onChange={handleChange}
                    className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500'
                    placeholder='Engineer, Teacher, etc.'
                  />
                </div>
              </div>

              {/* Plan */}
              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>Which plan did you use? *</label>
                <select
                  name='plan'
                  value={formData.plan}
                  onChange={handleChange}
                  required
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500'
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>Rating *</label>
                <div className='flex gap-2'>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type='button'
                      onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                      className='focus:outline-none transition-transform hover:scale-110'
                    >
                      <svg
                        className={`w-8 h-8 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Testimonial Content */}
              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>Your Story *</label>
                <textarea
                  name='content'
                  value={formData.content}
                  onChange={handleChange}
                  required
                  maxLength={1000}
                  rows={6}
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none'
                  placeholder='Share your transformation journey, results, and how DietWithDee helped you...'
                />
                <p className='text-xs text-gray-500 mt-2'>{formData.content.length}/1000 characters</p>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                disabled={loading}
                className='w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className='animate-spin' />
                    Submitting...
                  </>
                ) : (
                  'Submit Your Story'
                )}
              </button>

              <p className='text-xs text-gray-600 text-center'>
                *Required fields. Your email won't be displayed publicly.
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default SubmitTestimonial;
