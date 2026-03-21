import React, { useState, useEffect, useRef } from 'react';
import SEO from '../../Components/SEO';
import { ArrowLeft, User, Mail, Calculator, Target, Heart, Utensils, MessageCircle, Phone, CheckCircle, CreditCard, Lock, Shield, Calendar, Clock, Banknote } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import FullyBooked from '../FullyBooked/FullyBooked';
import { getBookingStatus } from '../../firebaseBookingUtils';
import { isValidEmail } from '../../utils/validation';
import { useAuth } from '../../AuthContext';
import WhatsAppPopup from '../../Components/WhatsAppPopup';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../../firebaseConfig';

// Compute BMI/calories from a stored profile (reusable helper)
const computeResultsFromProfile = (profile) => {
  if (!profile?.height || !profile?.weight) return null;
  const h = parseFloat(profile.height) / 100;
  const w = parseFloat(profile.weight);
  const age = parseFloat(profile.age) || 25;
  const bmi = Math.round((w / (h * h)) * 10) / 10;
  let bmiCategory = '';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi < 25) bmiCategory = 'Normal Weight';
  else if (bmi < 30) bmiCategory = 'Overweight';
  else bmiCategory = 'Obese';

  const genderFactor = profile.gender === 'male' ? 5 : -161;
  const bmr = 10 * w + 6.25 * parseFloat(profile.height) - 5 * age + genderFactor;
  const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
  const tdee = bmr * (activityMultipliers[profile.activityLevel] || 1.2);
  let goalCalories = tdee;
  if (profile.goal === 'lose') goalCalories = tdee - 500;
  else if (profile.goal === 'gain') goalCalories = tdee + 500;
  const goalLabels = { lose: 'Lose Weight', maintain: 'Maintain Weight', gain: 'Gain Weight' };
  return {
    bmi,
    bmiCategory,
    dailyCalories: Math.round(goalCalories),
    goal: goalLabels[profile.goal] || profile.goal || 'Not specified',
    dietaryRestrictions: profile.dietaryRestrictions || 'None',
    macros: {
      protein: Math.round((goalCalories * 0.3) / 4),
      carbs: Math.round((goalCalories * 0.4) / 4),
      fats: Math.round((goalCalories * 0.3) / 9),
    },
  };
};

function ContactUs() {
  const [isFullyBooked, setIsFullyBooked] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(true);
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);

  const { user, userProfile } = useAuth();

  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [selectedType, setSelectedType] = useState('initial');
  const [paymentStep, setPaymentStep] = useState('form'); // 'form' or 'payment'

  const handleProceedToPayment = (type) => {
    setSelectedType(type);
    setPaymentStep('payment');
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };
  // Use router state first, then Firestore profile as fallback, then defaults
  const location = useLocation();
  const userResults = location.state?.userResults
    || computeResultsFromProfile(userProfile)
    || {
      bmi: 0,
      bmiCategory: 'Normal Weight',
      dailyCalories: 0,
      goal: 'Weight Loss',
      dietaryRestrictions: 'No restrictions',
      macros: { protein: 0, carbs: 0, fats: 0 }
    };

  // Auto-fill form from Google account if logged in and form is empty
  useEffect(() => {
    if (user && !formData.name && !formData.email) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
        phone: prev.phone || userProfile?.phone || '',
      }));
    }
  }, [user, userProfile]);

  // Check booking status on mount to prevent async blocking later
  useEffect(() => {
    const checkAvailability = async () => {
      logEvent(analytics, 'add_shipping_info', {
      value: 800,
      currency: 'GHS'
    });

    try {
        const result = await getBookingStatus();
        if (!result.success || !result.isOpen) {
          setIsFullyBooked(true);
        }
      } catch (error) {
        console.error("Error checking booking status:", error);
        // Optional: Default to open or closed on error depending on preference
      }
    };
    checkAvailability();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentRedirect = (type = 'initial') => {
    // Sync state in case this was called from the top cards
    setSelectedType(type);

    // 1. Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields (Name, Email and Phone Number) before proceeding to payment');
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (!isValidEmail(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // 2. Store form data and consultation type in localStorage
    localStorage.setItem('consultationFormData', JSON.stringify({ ...formData, consultationType: type }));
    localStorage.setItem('userResults', JSON.stringify(userResults));

    // 3. Redirect to the correct Paystack link based on type
    const paymentUrl = type === 'followup'
      ? 'https://paystack.shop/pay/follow-up'
      : 'https://paystack.shop/pay/bookdee';
    
    // Use the same tab for seamless redirection back to /paymentSuccess
    window.location.href = paymentUrl;
  };

  if (isFullyBooked) {
    return <FullyBooked />;
  }

  const hasCalculatedResults = !!(location.state?.userResults || computeResultsFromProfile(userProfile));

  // Main booking form
  return (
    <>
      <SEO
        title="Contact DietWithDee | Book a Consultation with Nana Ama Dwamena"
        description="Book your personalized diet consultation with Nana Ama Dwamena, Ghana's leading dietitian. Get expert nutrition advice and start your wellness journey today."
        keywords="Contact DietWithDee, Book Consultation, Ghana Dietitian, Nana Ama Dwamena, Nutrition Advice"
        image="https://dietwithdee.org/LOGO.webp"
        url="https://dietwithdee.org/contactUs"
      />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20">
        <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
          {/* Header */}
          <div className="text-center space-y-6 mb-16">
            <div className="space-y-6">
              <div className="text-5xl animate-bounce">🌟</div>
              <h1 className="text-4xl md:text-5xl font-bold text-green-800 leading-tight">
                Ready to Start Your Nutrition Journey?
              </h1>
              {!hasCalculatedResults ? (
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Complete the <a href='/KnowYourBody' className='text-green-800 font-bold underline hover:text-green-600 transition-colors'>KnowYourBody</a> Test in <a href='/my-journey' className='text-green-800 font-bold underline hover:text-green-600 transition-colors'>My Journey</a> and fill in the information so we have your latest data for your consultation.
                </p>
              ) : (
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Based on your latest assessment, we've prepared a summary of your nutrition profile. Review your metrics below and book your consultation to get started!
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-16">
            {/* Results Summary Section - Horizontal Row */}
            {hasCalculatedResults && (
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-green-800 whitespace-nowrap">Your Results Summary</h2>
                  <div className="h-px bg-gradient-to-r from-green-200 to-transparent w-full"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* BMI Card */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-green-200 transition-all duration-300">
                    <h3 className="text-xl font-bold text-[#002B49] mb-6">BMI Analysis</h3>
                    <div className="space-y-6">
                      <div>
                        <div className="text-3xl font-bold text-[#4CAF50]">
                          {userResults.bmi} <span className="text-lg text-gray-700 font-normal">kg/m²</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className={`text-lg font-bold ${
                          userResults.bmiCategory === 'Normal Weight' ? 'text-green-600' :
                          userResults.bmiCategory === 'Underweight' ? 'text-blue-600' :
                          userResults.bmiCategory === 'Overweight' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {userResults.bmiCategory}
                        </p>
                        <p className="text-sm text-gray-700 font-medium">Weight Status</p>
                      </div>
                    </div>
                  </div>

                  {/* Calorie Card */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-green-200 transition-all duration-300">
                    <h3 className="text-xl font-bold text-[#002B49] mb-6">Daily Calorie Estimate</h3>
                    <div className="space-y-4">
                      <div className="mb-4">
                        <div className="text-3xl font-bold text-[#4CAF50]">
                          {userResults.dailyCalories} <span className="text-lg text-gray-700 font-normal">calories</span>
                        </div>
                      </div>
                      <div className="flex items-start space-x-6 pt-2">
                         <div className="space-y-0.5">
                            <p className="text-lg font-bold text-[#002B49]">{userResults.macros.protein}g</p>
                            <p className="text-sm text-gray-700 font-medium">Protein</p>
                         </div>
                         <div className="w-px h-10 bg-gray-100 self-center"></div>
                         <div className="space-y-0.5">
                            <p className="text-lg font-bold text-[#002B49]">{userResults.macros.carbs}g</p>
                            <p className="text-sm text-gray-700 font-medium">Carbs</p>
                         </div>
                         <div className="w-px h-10 bg-gray-100 self-center"></div>
                         <div className="space-y-0.5">
                            <p className="text-lg font-bold text-[#002B49]">{userResults.macros.fats}g</p>
                            <p className="text-sm text-gray-700 font-medium">Fats</p>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Goals & Preferences */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-green-200 transition-all duration-300">
                    <h3 className="text-xl font-bold text-[#002B49] mb-6">Your Goals & Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Heart className="text-[#FF4D4D]" size={22} strokeWidth={2} />
                        <div className="text-lg">
                          <span className="font-bold text-[#002B49]">Goal:</span>
                          <span className="ml-2 text-gray-600 font-medium">{userResults.goal}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Utensils className="text-[#4CAF50]" size={22} strokeWidth={2} />
                        <div className="text-lg">
                          <span className="font-bold text-[#002B49]">Diet:</span>
                          <span className="ml-2 text-gray-600 font-medium">{userResults.dietaryRestrictions || 'No restrictions'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Booking Section - Centered and Wider */}
            <div className="max-w-4xl mx-auto w-full px-4 sm:px-0 space-y-6">

              {/* Two Consultation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Initial Consultation Card */}
                <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-3xl p-7 text-white shadow-2xl shadow-green-500/30 border border-green-400/20 flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-white/20 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase">Most Popular</span>
                    </div>
                    <h2 className="text-xl font-bold mt-3 mb-1">Initial Consultation</h2>
                    <p className="text-white/90 text-sm mb-4">45 mins</p>
                    <p className="text-4xl font-extrabold text-white tracking-tight mb-5">₵800</p>
                    <div className="space-y-2.5 text-sm">
                      {['Full assessment of your health goals', 'Personalised diet plan', 'Food diary setup'].map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <CheckCircle size={16} className="text-white mt-0.5 shrink-0" />
                          <span className="text-white/100">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handlePaymentRedirect('initial')}
                    className="mt-6 w-full py-3.5 bg-white text-green-700 font-bold rounded-xl shadow hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Banknote size={16} />
                    Pay now — ₵800
                  </button>
                </div>

                {/* Follow-up Consultation Card */}
                <div className="bg-white rounded-3xl p-7 shadow-xl border border-gray-100 flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase">Returning Clients</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mt-3 mb-1">Follow Up Consultation</h2>
                    <p className="text-gray-600 text-sm mb-4">25 mins</p>
                    <p className="text-4xl font-extrabold text-green-600 tracking-tight mb-5">₵400</p>
                    <div className="space-y-2.5 text-sm">
                      {['Progress review', 'Plan adjustments', 'Personalised counselling'].map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                          <span className="text-gray-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handlePaymentRedirect('followup')}
                    className="mt-6 w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Banknote size={16} />
                    Pay now — ₵400
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-4 px-6 bg-blue-50/50 border border-blue-100 rounded-2xl text-blue-800 text-sm font-medium">
                <Clock size={20} className="text-blue-600 shrink-0 animate-pulse" />
                <p className="text-center md:text-left">
                  <span className="font-bold underline decoration-blue-200 decoration-2 underline-offset-4">Consultation Hours:</span> Tuesday – Sunday, 10:00 AM – 3:00 PM. 
                  <span className="hidden md:inline mx-2 text-blue-300">|</span>
                  <span className="block md:inline mt-1 md:mt-0 opacity-80 italic">Actual session times will be arranged personally after payment is confirmed.</span>
                </p>
              </div>

              {/* Form Card */}
              <div ref={formRef} className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
                <div>

                  {/* Right Side: Form */}
                  <div className="p-8 lg:p-10">
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-gray-800">Your Information</h2>
                      <p className="text-sm text-gray-600 mt-1">Complete your details to book</p>
                    </div>
                    
                    <div className="space-y-5">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 tracking-wider">Full Name *</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-green-600 transition-colors" size={18} />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all outline-none text-sm"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Email */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-gray-700 tracking-wider">Email Address *</label>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-green-600 transition-colors" size={18} />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all outline-none text-sm"
                              placeholder="johndoe@gmail.com"
                            />
                          </div>
                        </div>

                        {/* Consultation Type Selector */}
                        <div className="space-y-3 pt-2">
                          <label className="block text-xs font-bold text-gray-700 tracking-wider">Select Consultation Type *</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => handleTypeSelect('initial')}
                              className={`py-3 px-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                                selectedType === 'initial'
                                  ? 'border-green-500 bg-green-50 text-green-700'
                                  : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                              }`}
                            >
                              <span className="font-bold text-sm text-center">Initial</span>
                              <span className="text-[10px] opacity-80 italic">₵800</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTypeSelect('followup')}
                              className={`py-3 px-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                                selectedType === 'followup'
                                  ? 'border-green-500 bg-green-50 text-green-700'
                                  : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                              }`}
                            >
                              <span className="font-bold text-sm text-center">Follow-up</span>
                              <span className="text-[10px] opacity-80 italic">₵400</span>
                            </button>
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-gray-700 tracking-wider">Phone Number *</label>
                          <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-green-600 transition-colors" size={18} />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              required
                              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all outline-none text-sm"
                              placeholder="+233..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 tracking-wider">Additional Info</label>
                        <div className="relative group">
                          <MessageCircle className="absolute left-4 top-4 text-gray-600 group-focus-within:text-green-600 transition-colors" size={18} />
                          <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all outline-none resize-none text-sm"
                            placeholder="Any health concerns..."
                          />
                        </div>
                      </div>

                      {/* Pay Now Button */}
                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={() => handlePaymentRedirect(selectedType)}
                          className="w-full py-4 bg-gradient-to-r from-[#F6841F] to-[#F6841F] text-white font-black rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                          <Banknote size={22} className="relative z-10" />
                          <span className="relative z-10 uppercase tracking-wider">
                            Pay now — ₵{selectedType === 'followup' ? '400' : '800'}
                          </span>
                        </button>
                      </div>

                      {/* Booking Note */}
                      <div className="pt-2">
                        <div className="flex items-center justify-center space-x-4 text-[10px] text-gray-400 font-bold tracking-widest">
                          <div className="flex items-center space-x-1.5">
                            <Shield size={12} className="text-gray-400" />
                            <span>Secured by Paystack</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <CheckCircle size={12} className="text-gray-400" />
                            <span>Instant Confirmation</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Contact Methods */}
          <div className="py-12 sm:py-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl mx-4 sm:mx-0 mt-16">
            <div className="container mx-auto px-6 sm:px-10">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-20">

                {/* Left decorative blobs */}
                <div className="flex-1 relative max-w-xs hidden lg:block">
                  <div className="absolute -top-4 -right-4 w-64 h-64 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-20 blur-3xl"></div>
                  <div className="absolute -bottom-6 -left-6 w-56 h-56 bg-gradient-to-tr from-emerald-300 to-green-300 rounded-full opacity-15 blur-2xl"></div>
                </div>

                {/* Contact Content */}
                <div className="flex-1 max-w-full lg:max-w-xl text-center lg:text-left">
                  <div className="space-y-6 sm:space-y-8">
                    {/* Header */}
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600 leading-tight">
                        Still have questions?
                      </h3>
                      <div className="w-16 sm:w-20 h-1.5 sm:h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto lg:mx-0"></div>
                    </div>

                    <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                      Have a question about your diet, nutrition goals, or general wellness?
                    </p>

                    {/* Contact Info */}
                    <div className="space-y-4 sm:space-y-6">
                      <div className="space-y-3">
                        <h4 className="text-lg font-bold text-gray-900">EMAIL</h4>
                        <div className="flex items-center justify-center lg:justify-start gap-3">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          <span className="text-sm sm:text-base text-gray-700">dietwdee@gmail.com</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-lg font-bold text-gray-900">PHONE</h4>
                        <div className="flex items-center justify-center lg:justify-start gap-3">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          <span className="text-sm sm:text-base text-gray-700">(+233) 59 233 0870</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="pt-2 sm:pt-4">
                      <button
                        onClick={() => setShowWhatsAppPopup(true)}
                        className="inline-block w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-orange-400 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-green-700 text-sm sm:text-base"
                      >
                        Get In Touch
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Popup */}
      <WhatsAppPopup
        isOpen={showWhatsAppPopup}
        onClose={() => setShowWhatsAppPopup(false)}
        onConfirm={() => {
          logEvent(analytics, 'contact', { method: 'WhatsApp' });
          window.open('https://wa.me/233592330870?text=Hello%2C%20I%E2%80%99d%20like%20to%20book%20a%20session%20with%20Diet%20with%20Dee', '_blank', 'noopener,noreferrer');
          setShowWhatsAppPopup(false);
        }}
      />
    </>
  );
}

export default ContactUs;