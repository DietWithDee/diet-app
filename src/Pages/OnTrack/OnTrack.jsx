import React, { useState, useEffect, useRef } from 'react';
import SEO from '../../Components/SEO';
import { 
  ArrowLeft, 
  CheckCircle, 
  Shield, 
  CreditCard, 
  Clock, 
  ChevronDown, 
  Sparkles,
  Phone,
  Mail,
  User,
  MessageCircle,
  Video
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../AuthContext';
import { isValidEmail } from '../../utils/validation';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../../firebaseConfig';
import diabetesPromo from '../../assets/diabetes.jpg';

// Configurable Paystack checkout links for OnTrack consultations
export const PAYSTACK_ONTRACK_INITIAL_URL = 'https://paystack.shop/pay/bookdee';
export const PAYSTACK_ONTRACK_FOLLOWUP_URL = 'https://paystack.shop/pay/follow-up';

// Collapsible FAQ item matching the Father's Day editorial style with slightly larger text
const FaqItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-zinc-200 bg-white rounded-none">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer bg-transparent border-none"
      >
        <span className="text-base font-bold text-zinc-900">{question}</span>
        <ChevronDown
          size={18}
          className={`text-zinc-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-zinc-950' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm sm:text-base text-zinc-700 leading-relaxed border-t border-zinc-100">
          <p className="pt-2">{answer}</p>
        </div>
      )}
    </div>
  );
};

const OnTrack = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [selectedType, setSelectedType] = useState('initial'); // 'initial' or 'followup'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form if user is signed in
  useEffect(() => {
    if (user && !formData.name && !formData.email) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
        phone: prev.phone || userProfile?.phone || ''
      }));
    }
  }, [user, userProfile]);

  // Log page view analytics
  useEffect(() => {
    try {
      logEvent(analytics, 'view_promotion', {
        promotion_id: 'ontrack_consultation',
        promotion_name: 'OnTrack App Consultation Page',
        location_id: 'ontrack_page'
      });
    } catch (err) {
      console.warn('Analytics logging failed:', err);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectPackage = (type) => {
    setSelectedType(type);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      alert('Please fill in all required fields marked with an asterisk (*).');
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (!isValidEmail(formData.email.trim())) {
      alert('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    const amount = selectedType === 'followup' ? 300 : 600;

    try {
      logEvent(analytics, 'begin_checkout', {
        value: amount,
        currency: 'GHS',
        items: [{
          item_name: selectedType === 'followup' ? "OnTrack Follow-Up Consultation" : "OnTrack Initial Consultation",
          item_category: "OnTrack Consultation",
          price: amount,
          quantity: 1
        }]
      });
    } catch (err) {
      console.warn('Analytics logging failed:', err);
    }

    // 2. Prepare payload for local storage (used in PaymentSuccess.jsx)
    const bookingPayload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      message: formData.message.trim(),
      consultationType: selectedType,
      amount: amount,
      isOntrack: true,
      source: 'ontrack'
    };

    localStorage.setItem('consultationFormData', JSON.stringify(bookingPayload));
    localStorage.setItem('userResults', JSON.stringify({}));

    // 3. Redirect to the designated Paystack checkout URL
    const targetUrl = selectedType === 'followup' 
      ? PAYSTACK_ONTRACK_FOLLOWUP_URL 
      : PAYSTACK_ONTRACK_INITIAL_URL;

    window.location.href = targetUrl;
  };

  return (
    <>
      <SEO
        title="Exclusive OnTrack Consultation | DietWithDee"
        description="Exclusive personalized diet & wellness consultation for OnTrack app members by Registered Dietitian Nana Ama Dwamena. Customized meal plan and ongoing guidance."
        keywords="OnTrack Consultation, DietWithDee, Nana Ama Dwamena, Dietitian Ghana, Weight Loss, Personalized Diet"
        image="https://dietwithdee.org/LOGO.webp"
        url="https://dietwithdee.org/ontrack"
      />

      <div className="min-h-screen bg-zinc-50 py-12 px-4 md:px-8 border-t border-zinc-200">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Top Bar / Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-zinc-600 hover:text-zinc-950 font-medium text-base transition-colors cursor-pointer bg-transparent border-none"
            >
              <ArrowLeft size={18} />
              <span>Back to Home</span>
            </button>
          </div>

          {/* Main Content Grid: Split into Left Promo Column & Right Booking Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-zinc-200 bg-white rounded-none shadow-sm overflow-hidden">
            
            {/* Left Column: Promo Visuals (Styled after Father's Day aesthetic) */}
            <div className="lg:col-span-5 bg-zinc-950 text-white p-8 flex flex-col justify-between border-r border-zinc-200">
              <div className="space-y-6">
                
                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-serif text-zinc-100">
                    Accelerate Your Health
                  </h1>
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                    Work 1-on-1 with Registered Dietitian Nana Ama Dwamena to personalize your nutrition roadmap directly calibrated to your OnTrack goals.
                  </p>
                </div>

                {/* Shimmer Pricing & Feature Card */}
                <div className="gold-shimmer-card p-5 space-y-4 text-white">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
                      {selectedType === 'followup' ? 'Follow-Up Rate' : 'Initial Rate'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-extrabold text-amber-400">
                        GH₵ {selectedType === 'followup' ? '300' : '600'}
                      </span>
                      <span className="text-base text-zinc-400 line-through">
                        GH₵ {selectedType === 'followup' ? '400' : '800'}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-800 pt-3.5 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                      {selectedType === 'followup' ? "What's Included (25 Mins)" : "What's Included (45 Mins)"}
                    </span>
                    {(selectedType === 'followup' ? [
                      '25-minute follow-up session',
                      'Progress review & weight trends',
                      'Meal plan & calorie adjustments',
                      'Habit coaching & ongoing WhatsApp coordination'
                    ] : [
                      '45-minute comprehensive assessment',
                      'Custom personalized meal plan & recipes',
                      'Direct OnTrack calorie & macro calibration',
                      'Food diary setup & WhatsApp scheduling'
                    ]).map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <CheckCircle size={16} className="text-amber-400 shrink-0" />
                        <span className="text-sm text-zinc-100 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Editorial Promo Image Frame */}
                <div className="border border-zinc-800 overflow-hidden bg-zinc-900 p-1 flex items-center justify-center">
                  <img
                    src={diabetesPromo}
                    alt="Dietitian Virtual Consultation"
                    className="w-full h-auto object-cover max-h-60"
                  />
                </div>

              </div>

              {/* Guarantees at Bottom of Left Column */}
              <div className="pt-8 border-t border-zinc-900 space-y-3 text-sm text-zinc-300">
                <div className="flex items-center gap-2.5">
                  <Video size={16} className="text-emerald-400 shrink-0" />
                  <span>Virtual 1-on-1 via Google Meet / WhatsApp Video</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                  <span>Coordinated directly via WhatsApp within 24 hours</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Shield size={16} className="text-emerald-400 shrink-0" />
                  <span>Secured by Paystack payments</span>
                </div>
              </div>

            </div>

            {/* Right Column: Clean Booking Information Form */}
            <div className="lg:col-span-7 p-8 lg:p-10 space-y-6">
              
              <div>
                <h2 className="text-2xl font-black text-zinc-950 tracking-tight">
                  Consultation Booking Information
                </h2>
                <p className="text-sm text-zinc-600 mt-1">
                  Choose your consultation package and complete your details to proceed to secure checkout.
                </p>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">

                {/* Package Selector Cards (Without Save badges) */}
                <div className="space-y-2.5">
                  <div className="text-sm font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-2">
                    1. Select Consultation Package
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    
                    {/* Initial Option */}
                    <button
                      type="button"
                      onClick={() => handleSelectPackage('initial')}
                      className={`p-4.5 border text-left rounded-none transition-all cursor-pointer relative ${
                        selectedType === 'initial'
                          ? 'border-zinc-950 bg-zinc-900 text-white shadow-sm'
                          : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-bold uppercase tracking-wider">Initial Session</span>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-black">GH₵ 600</div>
                        <div className={`text-sm mt-1 ${selectedType === 'initial' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                          45 mins • Deep assessment & meal plan
                        </div>
                      </div>
                    </button>

                    {/* Follow-Up Option */}
                    <button
                      type="button"
                      onClick={() => handleSelectPackage('followup')}
                      className={`p-4.5 border text-left rounded-none transition-all cursor-pointer relative ${
                        selectedType === 'followup'
                          ? 'border-zinc-950 bg-zinc-900 text-white shadow-sm'
                          : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-bold uppercase tracking-wider">Follow-Up Session</span>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-black">GH₵ 300</div>
                        <div className={`text-sm mt-1 ${selectedType === 'followup' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                          25 mins • Progress review & tune-up
                        </div>
                      </div>
                    </button>

                  </div>
                </div>

                {/* Consultation Hours Alert Box */}
                <div className="flex items-center gap-3 p-3.5 bg-zinc-100 border border-zinc-200 text-sm text-zinc-700">
                  <Clock size={18} className="text-zinc-800 shrink-0" />
                  <span>
                    <strong>Hours:</strong> Tuesday – Sunday, 10:00 AM – 3:00 PM. Session slots are arranged personally via WhatsApp after payment.
                  </span>
                </div>

                {/* Client Contact Details */}
                <div className="space-y-4 pt-1">
                  <div className="text-sm font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-2">
                    2. Your Contact Information
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-zinc-800 uppercase tracking-wide">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Abena Mensah"
                      className="w-full border border-zinc-300 bg-white px-3.5 py-3 text-base rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-950 transition-shadow outline-none placeholder:text-zinc-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-bold text-zinc-800 uppercase tracking-wide">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="you@example.com"
                        className="w-full border border-zinc-300 bg-white px-3.5 py-3 text-base rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-950 transition-shadow outline-none placeholder:text-zinc-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-bold text-zinc-800 uppercase tracking-wide">
                        WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. +233..."
                        className="w-full border border-zinc-300 bg-white px-3.5 py-3 text-base rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-950 transition-shadow outline-none placeholder:text-zinc-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Health Concerns & Goals */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-sm font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-2">
                    3. Goals & Medical Notes (Optional)
                  </div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Describe your current diet challenges, health conditions (e.g. diabetes, PCOS, hypertension), or specific goals..."
                    className="w-full border border-zinc-300 bg-white px-3.5 py-3 text-base rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-950 transition-shadow outline-none resize-none placeholder:text-zinc-400 mt-2"
                  />
                </div>

                {/* Submit / Pay Button */}
                <div className="pt-2 border-t border-zinc-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-13 bg-zinc-900 text-zinc-50 hover:bg-zinc-950 text-base font-bold rounded-none transition-colors shadow-sm flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 border-none"
                  >
                    {isSubmitting ? (
                      <span>Connecting to Paystack...</span>
                    ) : (
                      <>
                        <CreditCard size={18} />
                        <span>Proceed to Pay GH₵ {selectedType === 'followup' ? '300' : '600'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Secure payment banner */}
                <div className="flex items-center justify-center gap-4 text-xs text-zinc-500 font-bold uppercase tracking-wider pt-1">
                  <div className="flex items-center gap-1.5">
                    <Shield size={14} />
                    <span>Secured by Paystack</span>
                  </div>
                  <span>•</span>
                  <div>
                    <span>Instant Booking Confirmation</span>
                  </div>
                </div>

              </form>

            </div>

          </div>

          {/* Frequently Asked Questions Section */}
          <div className="space-y-4 pt-4">
            <h3 className="text-xl font-bold text-zinc-900 tracking-tight">
              Frequently Asked Questions
            </h3>
            {[
              {
                q: 'What happens after I pay?',
                a: 'You will receive an instant confirmation screen and email. Our DietWithDee team will reach out directly via WhatsApp within 24 hours to coordinate the date and time that suits your schedule best.'
              },
              {
                q: 'How does this consultation connect with my OnTrack app?',
                a: 'Nana Ama Dwamena will assess your dietary history, set personalized calorie and macro targets, and align your custom meal plan directly with your OnTrack app daily tracking.'
              },
              {
                q: 'How are the consultation sessions held?',
                a: 'Sessions are conducted virtually via Google Meet or WhatsApp Video Call, allowing you to connect easily from the comfort of your home or office.'
              },
              {
                q: 'Can I choose my consultation date and time?',
                a: 'Yes! Consultations run Tuesday through Sunday between 10:00 AM and 3:00 PM. Our team will coordinate directly with you to pick a time slot that is convenient.'
              },
              {
                q: 'What if I have a specific health condition (diabetes, hypertension, PCOS)?',
                a: 'That is exactly what this consultation is designed for. Nana Ama Dwamena is a licensed clinical dietitian. You can mention any conditions in the notes field, and your session and meal plan will be tailored accordingly.'
              }
            ].map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default OnTrack;
