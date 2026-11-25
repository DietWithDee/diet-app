import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import SEO from '../../Components/SEO';
import { useTestimonials } from '../../hooks/useTestimonials';
import { useAuth } from '../../AuthContext';
import ScrollToTop from '../../utils/ScrollToTop';
import { TESTIMONIAL_PLANS } from '../../utils/testimonialHelpers';

function SubmitTestimonial() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { submitTestimonial } = useTestimonials();
  const prefill = location.state?.prefill || {};

  const [formData, setFormData] = useState({
    name: prefill.name || '',
    email: prefill.email || '',
    location: '',
    profession: '',
    plan: prefill.plan || 'consultation',
    rating: 5,
    content: ''
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.displayName || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus(null);

    const result = await submitTestimonial(formData);

    if (result.success) {
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        location: '',
        profession: '',
        plan: 'consultation',
        rating: 5,
        content: ''
      });
      setTimeout(() => navigate('/success-stories'), 2200);
    } else {
      setSubmitStatus('error');
    }
    setLoading(false);
  };

  return (
    <>
      <ScrollToTop />
      <SEO
        title="Share Your Success Story | DietWithDee"
        description="Submit your testimonial and inspire others on their wellness journey."
      />

      <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-montserrat pt-[84px] sm:pt-28 pb-24 px-4 sm:px-6 selection:bg-[#F6841F] selection:text-white">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-4">
            <Link
              to="/success-stories"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Success Stories</span>
            </Link>

            <header className="space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-800">
                Client Review
              </p>
              <h1 className="text-3xl sm:text-5xl font-serif-cormorant font-normal text-stone-900 tracking-tight leading-[1.08]">
                Share Your Success Story
              </h1>
              <p className="text-sm sm:text-base text-stone-600 font-normal leading-relaxed">
                Your experience helps others take their first step with confidence.
              </p>
              <div className="w-14 h-0.5 bg-[#F6841F] rounded-full pt-0.5" />
            </header>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xs border border-stone-200/90 p-6 sm:p-8">
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <CheckCircle className="text-emerald-700 shrink-0 mt-0.5" size={18} />
                <div>
                  <h3 className="font-bold text-emerald-950 text-sm">Thank you for sharing!</h3>
                  <p className="text-emerald-800 text-xs sm:text-sm font-medium mt-0.5">
                    Your story has been sent for review and will appear on Success Stories once approved.
                  </p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-red-700 shrink-0 mt-0.5" size={18} />
                <div>
                  <h3 className="font-bold text-red-950 text-sm">Submission Failed</h3>
                  <p className="text-red-800 text-xs sm:text-sm font-medium mt-0.5">
                    Please try again or reach out if the problem continues.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-stone-50/50 focus:bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm text-stone-900 placeholder:text-stone-400 transition-colors"
                    placeholder="Kwame Mensah"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-stone-50/50 focus:bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm text-stone-900 placeholder:text-stone-400 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-stone-50/50 focus:bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm text-stone-900 placeholder:text-stone-400 transition-colors"
                    placeholder="Accra, Ghana"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Profession
                  </label>
                  <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-stone-50/50 focus:bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm text-stone-900 placeholder:text-stone-400 transition-colors"
                    placeholder="Engineer, Teacher, etc."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Session or Plan Used *
                </label>
                <select
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-stone-50/50 focus:bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm text-stone-900 font-medium transition-colors"
                >
                  {TESTIMONIAL_PLANS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Rating *
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                      aria-label={`Rate ${star} out of 5 stars`}
                      className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                    >
                      <svg
                        className={`w-7 h-7 ${star <= formData.rating ? 'text-amber-500' : 'text-stone-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Your Story *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  maxLength={1000}
                  rows={5}
                  className="w-full px-4 py-3 bg-stone-50/50 focus:bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 resize-none text-sm text-stone-900 placeholder:text-stone-400 leading-relaxed transition-colors"
                  placeholder="Share what changed for you, what meals or advice stood out, and how you feel now..."
                />
                <p className="text-xs text-stone-500 mt-1.5 text-right">
                  {formData.content.length} / 1000
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3.5 rounded-full bg-[#1F4E36] hover:bg-[#173c29] text-white text-sm font-semibold tracking-wide transition-colors shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Your Story</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="text-xs text-stone-500 text-center">
                Required fields marked with *. Your email stays private and is never shown publicly.
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default SubmitTestimonial;
