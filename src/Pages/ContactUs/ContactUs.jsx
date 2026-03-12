import React, { useState, useEffect } from 'react';
import SEO from '../../Components/SEO';
import { ArrowLeft, User, Mail, Calculator, Target, Heart, Utensils, MessageCircle, Phone, CheckCircle, CreditCard, Lock, Shield, Calendar, Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import FullyBooked from '../FullyBooked/FullyBooked';
import { getBookingStatus } from '../../firebaseBookingUtils';
import { isValidEmail } from '../../utils/validation';
import { useAuth } from '../../AuthContext';
import WhatsAppPopup from '../../Components/WhatsAppPopup';

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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [paymentStep, setPaymentStep] = useState('form');

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
      }));
    }
  }, [user]);

  // Check booking status on mount to prevent async blocking later
  useEffect(() => {
    const checkAvailability = async () => {
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

  const handlePaymentRedirect = () => {
    // 1. Validate required fields
    if (!formData.name || !formData.email) {
      alert('Please fill in all required fields (Name and Email) before proceeding to payment');
      return;
    }

    if (!isValidEmail(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Note: We removed the async getBookingStatus check here. 
    // Since we checked on mount, if the user is still on this screen, 
    // we assume bookings are open. This ensures window.open fires synchronously.

    // 2. Store form data in localStorage
    localStorage.setItem('consultationFormData', JSON.stringify(formData));
    localStorage.setItem('userResults', JSON.stringify(userResults));

    // 3. Redirect to Paystack (Now Synchronous - Browser will allow this)
    window.open('https://paystack.shop/pay/bookdee', '_blank');

    // 4. Show payment instructions
    setPaymentStep('payment');
  };

  const handlePaymentCompleted = () => {
    setPaymentStep('completed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isFullyBooked) {
    return <FullyBooked />;
  }

  // Payment Instructions Screen
  if (paymentStep === 'payment') {
    return (
      <>
        <SEO
          title="Contact DietWithDee | Book a Consultation with Nana Ama Dwamena"
          description="Book your personalized diet consultation with Nana Ama Dwamena, Ghana's leading dietitian. Get expert nutrition advice and start your wellness journey today."
          keywords="Contact DietWithDee, Book Consultation, Ghana Dietitian, Nana Ama Dwamena, Nutrition Advice"
          image="https://dietwithdee.org/src/assets/LOGO.webp"
          url="https://dietwithdee.org/contactUs"
        />
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12">
          <div className="container mx-auto px-6 lg:px-12 max-w-2xl">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="text-blue-600" size={48} />
                </div>
                
                <h2 className="text-3xl font-bold text-green-800">Complete Your Payment</h2>
                
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">What's Included in Your ₵800 Package:</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="text-green-600" size={20} />
                      <span className="text-gray-700">One-on-one nutrition consultation (45-60 minutes)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="text-green-600" size={20} />
                      <span className="text-gray-700">Personalized meal plan based on your assessment</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="text-green-600" size={20} />
                      <span className="text-gray-700">Custom macronutrient breakdown</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="text-green-600" size={20} />
                      <span className="text-gray-700">Goal-specific dietary recommendations</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="text-green-600" size={20} />
                      <span className="text-gray-700">Follow-up support and guidance</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Shield className="text-blue-600" size={24} />
                    <h3 className="text-lg font-semibold text-blue-800">Secure Payment with Paystack</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Your payment is processed securely through Paystack. We don't store your payment information.
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600">
                    A new tab has opened with the payment page. Complete your payment and return here to schedule your consultation.
                  </p>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={handlePaymentCompleted}
                      className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                    >
                      I've Completed Payment
                    </button>
                    
                    <button
                      onClick={() => window.open('https://paystack.shop/pay/bookdee', '_blank')}
                      className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Open Payment Page Again
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setPaymentStep('form')}
                    className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Back to Form
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Payment Completed - Confirmation (email sending removed)
  if (paymentStep === 'completed') {
    return (
      <>
        <SEO
          title="Contact DietWithDee | Book a Consultation with Nana Ama Dwamena"
          description="Book your personalized diet consultation with Nana Ama Dwamena, Ghana's leading dietitian. Get expert nutrition advice and start your wellness journey today."
          keywords="Contact DietWithDee, Book Consultation, Ghana Dietitian, Nana Ama Dwamena, Nutrition Advice"
          image="https://dietwithdee.org/src/assets/LOGO.webp"
          url="https://dietwithdee.org/contactUs"
        />
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12">
          <div className="container mx-auto px-6 lg:px-12 max-w-2xl">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center space-y-6 mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="text-green-600" size={48} />
                </div>
                <h2 className="text-3xl font-bold text-green-800">Payment Confirmed!</h2>
                <p className="text-lg text-gray-600">
                  Thank you for your payment. We've saved your details. You'll receive follow-up to schedule your consultation.
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-800 font-medium">✅ Payment Status: Completed</p>
                  <p className="text-green-700">Amount: ₵800 (Consultation + Custom Plan)</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">What happens next?</h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <p>• We'll review your information and results</p>
                    <p>• You'll get a response within 24 hours to schedule</p>
                    <p>• Your consultation session will be booked</p>
                  </div>
                </div>

                <button
                  onClick={() => setPaymentStep('form')}
                  className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Back to Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const hasCalculatedResults = !!(location.state?.userResults || computeResultsFromProfile(userProfile));

  // Main booking form (before payment)
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
                          {userResults.bmi} <span className="text-lg text-gray-500 font-normal">kg/m²</span>
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
                        <p className="text-sm text-gray-500 font-medium">Weight Status</p>
                      </div>
                    </div>
                  </div>

                  {/* Calorie Card */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-green-200 transition-all duration-300">
                    <h3 className="text-xl font-bold text-[#002B49] mb-6">Daily Calorie Estimate</h3>
                    <div className="space-y-4">
                      <div className="mb-4">
                        <div className="text-3xl font-bold text-[#4CAF50]">
                          {userResults.dailyCalories} <span className="text-lg text-gray-500 font-normal">calories</span>
                        </div>
                      </div>
                      <div className="flex items-start space-x-6 pt-2">
                         <div className="space-y-0.5">
                            <p className="text-lg font-bold text-[#002B49]">{userResults.macros.protein}g</p>
                            <p className="text-sm text-gray-500 font-medium">Protein</p>
                         </div>
                         <div className="w-px h-10 bg-gray-100 self-center"></div>
                         <div className="space-y-0.5">
                            <p className="text-lg font-bold text-[#002B49]">{userResults.macros.carbs}g</p>
                            <p className="text-sm text-gray-500 font-medium">Carbs</p>
                         </div>
                         <div className="w-px h-10 bg-gray-100 self-center"></div>
                         <div className="space-y-0.5">
                            <p className="text-lg font-bold text-[#002B49]">{userResults.macros.fats}g</p>
                            <p className="text-sm text-gray-500 font-medium">Fats</p>
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

              {/* Standalone Green Pricing Card */}
              <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-2xl shadow-green-500/30 border border-green-400/20">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                  {/* What's Included */}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-5 text-white">What's Included</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { icon: Calendar, title: 'Professional Session', desc: 'One-on-one consultation with Nana Ama.' },
                        { icon: Calculator, title: 'Custom Meal Plan', desc: 'Based on your unique body metrics.' },
                        { icon: CheckCircle, title: 'Ongoing Support', desc: 'Optional follow-up guidance to stay on track.' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                          <div className="bg-white/15 p-2 rounded-xl mt-0.5 shrink-0">
                            <item.icon size={18} className="text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-sm leading-tight mb-0.5">{item.title}</p>
                            <p className="text-green-100/70 text-xs leading-tight">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block w-px h-24 bg-white/20 self-center"></div>

                  {/* Fee + Schedule */}
                  <div className="md:text-right shrink-0">
                    <p className="text-green-200 text-xs font-semibold uppercase tracking-widest mb-1">Consultation Fee</p>
                    <p className="text-4xl font-extrabold text-white tracking-tight mb-2">₵800</p>
                    <div className="flex items-center md:justify-end space-x-2 text-xs text-green-100/60 mb-1">
                      <Clock size={12} />
                      <span>Tue – Sun, 10 am – 3 pm</span>
                    </div>
                    <p className="text-[10px] text-green-200/50 italic max-w-[180px] md:ml-auto">
                      * Times arranged after payment confirmation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Card */}
              <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
                <div>

                  {/* Right Side: Form */}
                  <div className="p-8 lg:p-10">
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-gray-800">Your Information</h2>
                      <p className="text-sm text-gray-500 mt-1">Complete your details to book</p>
                    </div>
                    
                    <div className="space-y-5">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 tracking-wider">Full Name *</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={18} />
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
                          <label className="block text-xs font-bold text-gray-500 tracking-wider">Email Address *</label>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={18} />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all outline-none text-sm"
                              placeholder="john@example.com"
                            />
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-gray-500 tracking-wider">Phone Number</label>
                          <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={18} />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all outline-none text-sm"
                              placeholder="+233..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 tracking-wider">Additional Info</label>
                        <div className="relative group">
                          <MessageCircle className="absolute left-4 top-4 text-gray-400 group-focus-within:text-green-600 transition-colors" size={18} />
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

                      {/* Payment Button */}
                      <div className="pt-3 space-y-4">
                        <button
                          onClick={handlePaymentRedirect}
                          className="w-full py-4 bg-[#F6841F] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[0px] transition-all duration-200 flex items-center justify-center gap-2 tracking-wide"
                        >
                          <Lock size={18} />
                          <span>Secure Payment — ₵800</span>
                        </button>
                        
                        <div className="flex items-center justify-center space-x-4 text-[10px] text-gray-400 font-bold tracking-widest">
                          <div className="flex items-center space-x-1.5">
                            <Shield size={12} className="text-green-600" />
                            <span>Secured by Paystack</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <CheckCircle size={12} className="text-green-600" />
                            <span>Instant Booking</span>
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
          window.open('https://wa.me/233592330870?text=Hello%2C%20I%E2%80%99d%20like%20to%20book%20a%20session%20with%20Diet%20with%20Dee', '_blank', 'noopener,noreferrer');
          setShowWhatsAppPopup(false);
        }}
      />
    </>
  );
}

export default ContactUs;