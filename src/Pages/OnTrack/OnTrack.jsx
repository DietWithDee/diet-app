import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../Components/SEO';
import { 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  Clock, 
  ChevronDown, 
  Video, 
  Activity, 
  HeartHandshake, 
  UtensilsCrossed, 
  Check, 
  Calendar,
  Lock,
  ArrowRight,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { isValidEmail } from '../../utils/validation';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../../firebaseConfig';
import diabetesPromo from '../../assets/diabetes.jpg';
import homeHeroImg from '../../assets/images/homeimg1.jpg';

// Configurable Paystack checkout links for OnTrack consultations
export const PAYSTACK_ONTRACK_INITIAL_URL = 'https://paystack.shop/pay/ontrackbook';
export const PAYSTACK_ONTRACK_FOLLOWUP_URL = 'https://paystack.shop/pay/ontrackfollow';

// Clean Editorial Accordion FAQ item
const FaqItem = ({ question, answer, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-stone-200/90 bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 shadow-xs hover:border-stone-300">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between p-5 text-left cursor-pointer bg-transparent border-none font-montserrat"
      >
        <span className="text-sm sm:text-base font-semibold text-stone-900 pr-4">
          {question}
        </span>
        <div className={`w-7 h-7 shrink-0 rounded-full border border-stone-200 flex items-center justify-center text-xs transition-transform duration-300 ${
          open ? 'bg-[#F6841F] text-white rotate-180 border-[#F6841F]' : 'bg-stone-50 text-stone-600'
        }`}>
          <ChevronDown size={15} />
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 text-xs sm:text-sm text-stone-600 font-light leading-relaxed border-t border-stone-100 pt-3">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

const OnTrack = () => {
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
      if (analytics) {
        logEvent(analytics, 'view_promotion', {
          promotion_id: 'ontrack_diabetes_consultation',
          promotion_name: 'OnTrack Brand Diabetes Consultation Page',
          location_id: 'ontrack_page'
        });
      }
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

  const scrollToBooking = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      alert('Please fill in your name, email, and WhatsApp number to proceed.');
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
      if (analytics) {
        logEvent(analytics, 'begin_checkout', {
          value: amount,
          currency: 'GHS',
          items: [{
            item_name: selectedType === 'followup' 
              ? "OnTrack Diabetes Follow-Up Consultation" 
              : "OnTrack Diabetes Initial Consultation",
            item_category: "Diabetes Medical Nutrition Therapy",
            price: amount,
            quantity: 1
          }]
        });
      }
    } catch (err) {
      console.warn('Analytics logging failed:', err);
    }

    const bookingPayload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      message: formData.message.trim(),
      consultationType: selectedType,
      amount: amount,
      isOntrack: true,
      source: 'ontrack_diabetes'
    };

    localStorage.setItem('consultationFormData', JSON.stringify(bookingPayload));
    localStorage.setItem('userResults', JSON.stringify({}));

    const targetUrl = selectedType === 'followup' 
      ? PAYSTACK_ONTRACK_FOLLOWUP_URL 
      : PAYSTACK_ONTRACK_INITIAL_URL;

    window.location.href = targetUrl;
  };

  return (
    <>
      <SEO
        title="OnTrack Diabetes Nutrition Consultation | DietWithDee"
        description="Stabilize blood sugar and lower A1c without giving up local foods. 1-on-1 Clinical Dietitian consultations with Nana Ama Dwamena for Type 2 diabetes & pre-diabetes."
        keywords="Diabetes Dietitian Ghana, Lower Blood Sugar, Type 2 Diabetes Meal Plan, Nana Ama Dwamena, OnTrack Consultation, A1c Reduction Ghana"
        image="https://dietwithdee.org/LOGO.webp"
        url="https://dietwithdee.org/ontrack"
      />

      <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-montserrat selection:bg-[#F6841F] selection:text-white pt-20 sm:pt-24 pb-20">
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 md:space-y-24">
          
          {/* ============================================================== */}
          {/* 1. HERO SECTION (DietWithDee Redesign Aesthetic)              */}
          {/* ============================================================== */}
          <section className="pt-2 sm:pt-4 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Brand Typography & Primary CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif-cormorant font-normal text-stone-900 tracking-tight leading-[1.12]">
                  Blood sugar on track. <br className="hidden sm:inline" />
                  <span className="text-[#F6841F] font-medium">Without starving.</span>
                </h1>
                
                <div className="w-16 h-1 bg-[#F6841F] mt-2"></div>
                
                <p className="text-stone-700 font-light text-base sm:text-lg leading-relaxed max-w-xl pt-2">
                  Stop fearing every meal or surviving on plain cabbage. Work 1-on-1 with Registered Dietitian <strong className="font-medium text-stone-900">Nana Ama Dwamena</strong> to stabilize your glucose spikes and lower your A1c—without giving up the Ghanaian dishes you love.
                </p>
              </div>

              {/* Symmetrical CTA Cluster with Glassmorphic Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  type="button"
                  onClick={scrollToBooking}
                  className="px-8 sm:px-9 py-3.5 sm:py-4 rounded-full bg-[#F6841F] hover:bg-[#e07312] text-white font-montserrat text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Book Consultation</span>
                  <ChevronRight size={16} />
                </button>

                <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/80 backdrop-blur-md border border-stone-200/80 shadow-xs">
                  <div className="flex text-amber-500 text-sm">
                    {'★'.repeat(5)}
                  </div>
                  <span className="text-xs font-semibold text-stone-700">
                    5.0 Rating • 500+ Clients Guided
                  </span>
                </div>
              </div>

              {/* High-Trust Value Markers */}
              <div className="pt-2 flex flex-wrap gap-y-2 gap-x-6 text-xs text-stone-600 font-light">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  100% Real Ghanaian Meals
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  Synced with the App
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  Direct WhatsApp Mentorship
                </span>
              </div>

            </div>

            {/* Right Column: Natural Warm Portrait in Editorial Glass Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm sm:max-w-md relative">
                
                {/* Soft ambient radial glow */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-orange-200/40 via-amber-100/30 to-emerald-100/30 rounded-3xl blur-xl -z-10"></div>

                <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-200/90 bg-white shadow-xl">
                  <img
                    src={homeHeroImg}
                    alt="Nana Ama Dwamena - Registered Clinical Dietitian"
                    className="w-full h-auto object-contain block mx-auto transition-transform duration-500"
                  />
                  
                  <div className="p-5 bg-white/95 backdrop-blur-md border-t border-stone-100 text-center space-y-1">
                    <p className="font-bold text-stone-900 text-lg font-montserrat">
                      Nana Ama Dwamena, RD.
                    </p>
                    <p className="text-xs text-stone-500 font-light tracking-wide">
                      Founder, DietWithDee • Licensed Clinical Dietitian
                    </p>
                  </div>
                </div>




              </div>
            </div>

          </section>

          {/* ============================================================== */}
          {/* 2. STATS SECTION (Clean Balanced Cards from Redesign Home)     */}
          {/* ============================================================== */}
          <section className="bg-white/80 backdrop-blur-md border border-stone-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
              
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-bold font-montserrat text-[#F6841F]">
                  94%
                </div>
                <div className="text-xs sm:text-sm font-semibold text-stone-800">
                  Lower Fasting Glucose
                </div>
                <div className="text-[11px] text-stone-500 font-light hidden sm:block">
                  Within 4 weeks of protocol
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-bold font-montserrat text-emerald-700">
                  1-on-1
                </div>
                <div className="text-xs sm:text-sm font-semibold text-stone-800">
                  Private Dietitian Care
                </div>
                <div className="text-[11px] text-stone-500 font-light hidden sm:block">
                  Direct virtual consultation
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-bold font-montserrat text-stone-900">
                  0
                </div>
                <div className="text-xs sm:text-sm font-semibold text-stone-800">
                  Starvation Diets
                </div>
                <div className="text-[11px] text-stone-500 font-light hidden sm:block">
                  No restrictive food guilt
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-bold font-montserrat text-[#F6841F]">
                  35+
                </div>
                <div className="text-xs sm:text-sm font-semibold text-stone-800">
                  Ghanaian Meal Guides
                </div>
                <div className="text-[11px] text-stone-500 font-light hidden sm:block">
                  Adapted to your kitchen
                </div>
              </div>

            </div>
          </section>

          {/* ============================================================== */}
          {/* 3. "WHAT WE DO" (The 4 Clinical Pillars in Editorial Cards)   */}
          {/* ============================================================== */}
          <section className="space-y-8">
            
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-4xl font-serif-cormorant font-normal text-stone-900 tracking-tight">
                How We Get Your Blood Sugar On Track
              </h2>
              <div className="w-12 h-0.5 bg-[#F6841F] mx-auto"></div>
              <p className="text-xs sm:text-sm text-stone-600 font-light pt-1">
                Clinical science translated into your everyday kitchen and daily routine.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Pillar 1 */}
              <div className="bg-white/90 backdrop-blur-sm border border-stone-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F6841F]">
                    <Activity size={22} />
                  </div>
                  <h3 className="text-lg font-bold font-montserrat text-stone-900">Smart Carb Mapping</h3>
                  <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                    Learn the exact starch portions (plantain, yam, brown rice, banku) and food pairings that prevent rapid post-meal sugar spikes.
                  </p>
                </div>
                <div className="text-xs font-semibold text-[#F6841F] flex items-center gap-1 pt-2 border-t border-stone-100">
                  <span>No Guesswork</span>
                  <ArrowRight size={13} />
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="bg-white/90 backdrop-blur-sm border border-stone-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                    <ShieldCheck size={22} />
                  </div>
                  <h3 className="text-lg font-bold font-montserrat text-stone-900">Synced with the App</h3>
                  <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                    Log your meals, blood glucose readings, and medications inside the OnTrack app. Your dietitian reviews your trends in real time to provide timely adjustments and keep your sugars stable.
                  </p>
                </div>
                <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1 pt-2 border-t border-stone-100">
                  <span>Continuous Tracking</span>
                  <ArrowRight size={13} />
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="bg-white/90 backdrop-blur-sm border border-stone-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
                    <UtensilsCrossed size={22} />
                  </div>
                  <h3 className="text-lg font-bold font-montserrat text-stone-900">The Local Plate Method</h3>
                  <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                    No expensive foreign foods. Master mouthwatering Ghanaian dishes with fiber-rich greens, healthy fats, and high-satiety proteins.
                  </p>
                </div>
                <div className="text-xs font-semibold text-amber-700 flex items-center gap-1 pt-2 border-t border-stone-100">
                  <span>100% Real Food</span>
                  <ArrowRight size={13} />
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="bg-white/90 backdrop-blur-sm border border-stone-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F6841F]">
                    <HeartHandshake size={22} />
                  </div>
                  <h3 className="text-lg font-bold font-montserrat text-stone-900">WhatsApp Guidance</h3>
                  <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                    Direct access to Nana Ama. Snap photos of your plate, log your readings inside OnTrack, and get timely feedback when cravings hit.
                  </p>
                </div>
                <div className="text-xs font-semibold text-[#F6841F] flex items-center gap-1 pt-2 border-t border-stone-100">
                  <span>Continuous Care</span>
                  <ArrowRight size={13} />
                </div>
              </div>

            </div>

          </section>

          {/* ============================================================== */}
          {/* 4. DIABETES PLAN CALLOUT                                       */}
          {/* ============================================================== */}
          <section className="bg-white/80 backdrop-blur-md border border-stone-200/90 rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-center shadow-xs">
            <div className="max-w-xl mx-auto space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200/70 text-[#F6841F] rounded-full text-xs font-semibold uppercase tracking-wider">
                Self-Guided Option
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif-cormorant font-normal text-stone-900 leading-snug">
                Prefer a self-guided meal guide?
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Explore our comprehensive <strong className="font-semibold text-stone-800">Blood Sugar Balance Plan</strong> crafted specifically for Type 2 diabetes management with local Ghanaian staples.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://paystack.com/buy/blood-sugar-balance-plan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#F6841F] hover:bg-[#e07312] text-white font-montserrat text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Blood Sugar Balance Plan (GH₵ 299)</span>
                  <ExternalLink size={15} />
                </a>
                <Link
                  to="/plans"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-montserrat text-xs sm:text-sm font-medium transition-all duration-300 inline-flex items-center justify-center"
                >
                  View All Plans
                </Link>
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* 5. CONSULTATION BOOKING ENGINE (Glassmorphic & Brand Aligned)   */}
          {/* ============================================================== */}
          <section ref={formRef} id="booking-section" className="scroll-mt-8">
            <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-xl border border-stone-200/90 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
              
              {/* Header Banner */}
              <div className="bg-stone-900 text-white p-6 sm:p-10 text-center space-y-2 border-b border-stone-800">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F6841F] text-white rounded-full text-xs font-semibold uppercase tracking-wider">
                  <Calendar size={13} />
                  Reserve Your Session
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif-cormorant font-normal text-white tracking-tight">
                  1-on-1 Clinical Consultation Booking
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 font-light max-w-lg mx-auto">
                  Select your package, fill your details, and proceed to instant secure Paystack checkout.
                </p>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
                
                {/* STEP 1: Symmetrical Package Selector */}
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wider font-semibold text-stone-500">
                    Step 1: Choose Your Consultation Package
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Initial Comprehensive Option */}
                    <button
                      type="button"
                      onClick={() => handleSelectPackage('initial')}
                      className={`p-5 text-left rounded-2xl border transition-all duration-300 cursor-pointer relative ${
                        selectedType === 'initial'
                          ? 'border-[#F6841F] bg-orange-50/40 shadow-sm ring-1 ring-[#F6841F]'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="px-2.5 py-0.5 bg-[#F6841F] text-white text-[10px] font-semibold uppercase tracking-wider rounded-full">
                          Recommended for New Clients
                        </span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedType === 'initial' ? 'bg-[#F6841F] border-[#F6841F] text-white' : 'border-stone-300 bg-white'
                        }`}>
                          {selectedType === 'initial' && <Check size={12} strokeWidth={2.5} />}
                        </div>
                      </div>

                      <div className="mt-3">
                        <h3 className="text-base sm:text-lg font-bold text-stone-900 font-montserrat">
                          Initial Deep-Dive Assessment
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5 font-light">
                          45 Minutes • Medical & Diet History, Custom Meal Blueprint
                        </p>
                      </div>

                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-bold font-montserrat text-stone-900">
                          GH₵ 600
                        </span>
                        <span className="text-xs text-stone-400 line-through">GH₵ 800</span>
                      </div>

                      <ul className="mt-3 space-y-1.5 border-t border-stone-100 pt-3 text-xs text-stone-600 font-light">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-[#F6841F] shrink-0" />
                          <span>Detailed A1c & medication examination</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-[#F6841F] shrink-0" />
                          <span>Tailored Ghanaian meal plan & recipes</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-[#F6841F] shrink-0" />
                          <span>Direct OnTrack app target calibration</span>
                        </li>
                      </ul>
                    </button>

                    {/* Follow-Up Option */}
                    <button
                      type="button"
                      onClick={() => handleSelectPackage('followup')}
                      className={`p-5 text-left rounded-2xl border transition-all duration-300 cursor-pointer relative ${
                        selectedType === 'followup'
                          ? 'border-[#F6841F] bg-orange-50/40 shadow-sm ring-1 ring-[#F6841F]'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="px-2.5 py-0.5 bg-stone-800 text-white text-[10px] font-semibold uppercase tracking-wider rounded-full">
                          Existing Clients
                        </span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedType === 'followup' ? 'bg-[#F6841F] border-[#F6841F] text-white' : 'border-stone-300 bg-white'
                        }`}>
                          {selectedType === 'followup' && <Check size={12} strokeWidth={2.5} />}
                        </div>
                      </div>

                      <div className="mt-3">
                        <h3 className="text-base sm:text-lg font-bold text-stone-900 font-montserrat">
                          Follow-Up Accountability
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5 font-light">
                          25 Minutes • Progress Review & Target Adjustments
                        </p>
                      </div>

                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-bold font-montserrat text-stone-900">
                          GH₵ 300
                        </span>
                        <span className="text-xs text-stone-400 line-through">GH₵ 400</span>
                      </div>

                      <ul className="mt-3 space-y-1.5 border-t border-stone-100 pt-3 text-xs text-stone-600 font-light">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-[#F6841F] shrink-0" />
                          <span>Fasting sugar logs & trend analysis</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-[#F6841F] shrink-0" />
                          <span>Portion adjustments & craving fixes</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-[#F6841F] shrink-0" />
                          <span>Ongoing WhatsApp motivation</span>
                        </li>
                      </ul>
                    </button>

                  </div>
                </div>

                {/* Consultation Hours Box */}
                <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl text-xs text-stone-700 flex items-center gap-2.5">
                  <Clock size={16} className="text-[#F6841F] shrink-0" />
                  <span className="font-light">
                    <strong className="font-semibold text-stone-900">Consultation Hours:</strong> Tuesday – Sunday, 10:00 AM – 3:00 PM GMT. We reach out directly on WhatsApp within 24 hours of payment to coordinate your meeting slot.
                  </span>
                </div>

                {/* STEP 2: Clean Symmetrical Inputs */}
                <div className="space-y-4">
                  <div className="text-xs uppercase tracking-wider font-semibold text-stone-500">
                    Step 2: Your Contact Details
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Kwame Mensah"
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#F6841F] focus:ring-1 focus:ring-[#F6841F] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                        WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. +233 24 123 4567"
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#F6841F] focus:ring-1 focus:ring-[#F6841F] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="you@example.com"
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#F6841F] focus:ring-1 focus:ring-[#F6841F] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                        Health Notes (Optional)
                      </label>
                      <input
                        type="text"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Current readings, medications (e.g. Metformin)..."
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#F6841F] focus:ring-1 focus:ring-[#F6841F] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* STEP 3: Submit Action */}
                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-full bg-[#F6841F] hover:bg-[#e07312] text-white font-montserrat text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Connecting to Paystack...
                      </span>
                    ) : (
                      <>
                        <CreditCard size={18} />
                        <span>Proceed to Pay GH₵ {selectedType === 'followup' ? '300' : '600'}</span>
                        <ChevronRight size={16} />
                      </>
                    )}
                  </button>

                  <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-stone-500 font-light pt-1">
                    <div className="flex items-center gap-1">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>Paystack SSL Secured</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Video size={14} />
                      <span>Google Meet / WhatsApp Video</span>
                    </div>
                    <span>•</span>
                    <div>
                      <span>Instant Booking Confirmation</span>
                    </div>
                  </div>
                </div>

              </form>

            </div>
          </section>

          {/* ============================================================== */}
          {/* 6. SOCIAL PROOF & FAQ (Symmetrical 2-Column Grid)              */}
          {/* ============================================================== */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Testimonial Card */}
            <div className="lg:col-span-5 bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-orange-50 text-[#F6841F] text-[11px] font-semibold uppercase tracking-wider rounded-full">
                  Client Story
                </span>
                <div className="flex text-amber-500 text-sm">★★★★★</div>
              </div>

              <blockquote className="text-base sm:text-lg font-serif-cormorant font-normal text-stone-900 leading-snug italic">
                “My doctor was surprised at my last quarterly review. My fasting sugar dropped from 11.2 to 6.1 mmol/L. Nana Ama taught me how to enjoy banku and kontomire without spikes. I don’t feel deprived at all.”
              </blockquote>

              <div className="pt-2 border-t border-stone-100">
                <p className="font-bold text-stone-900 text-sm font-montserrat">Kwame A., 54</p>
                <p className="text-[11px] text-stone-500 font-light">
                  Accra • Type 2 Diabetes Management
                </p>
              </div>
            </div>

            {/* Right Column: Clean Accordion Stack */}
            <div className="lg:col-span-7 space-y-3">
              {[
                {
                  q: 'Do I have to stop eating Ghanaian meals like yam or banku?',
                  a: 'No! We believe eliminating cultural staples is unsustainable. You will learn the exact portion ratios and vegetable pairings that allow you to enjoy local meals while keeping blood sugar flat.'
                },
                {
                  q: 'What happens immediately after I pay?',
                  a: 'You receive an instant confirmation receipt. Within 24 hours, our DietWithDee team will reach out directly via WhatsApp to agree on the date and time that fits your schedule.'
                },
                {
                  q: 'Can I book on behalf of an aging parent or spouse?',
                  a: 'Yes! Enter their details in the form. You are very welcome to join the video session alongside them to assist with meal prep planning.'
                }
              ].map((faq, i) => (
                <FaqItem key={i} question={faq.q} answer={faq.a} defaultOpen={i === 0} />
              ))}
            </div>

          </section>

          {/* ============================================================== */}
          {/* 7. DIABETES PROGRAM VISUAL SHOWCASE (Natural Scale, Bright)   */}
          {/* ============================================================== */}
          <section className="pt-2 sm:pt-4 flex flex-col items-center">
            <div className="w-full max-w-4xl bg-white border border-stone-200/90 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm overflow-hidden">
              <img
                src={diabetesPromo}
                alt="OnTrack Diabetes Nutrition Support Program"
                className="w-full h-auto object-contain rounded-xl sm:rounded-2xl block mx-auto"
              />
            </div>
          </section>

        </div>

      </div>
    </>
  );
};

export default OnTrack;
