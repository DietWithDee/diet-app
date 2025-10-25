import React, { useState } from 'react';
import SEO from '../../Components/SEO';
import { ArrowLeft, User, Mail, Calculator, Target, Heart, Utensils, MessageCircle, Phone, CheckCircle, CreditCard, Lock, Shield, Calendar, Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import FullyBooked from '../FullyBooked/FullyBooked'; // Import the FullyBooked component

function ContactUs() {
  // 🎯Change this to control bookings
  // true = bookings open (normal form shows)
  // false = bookings closed (fully booked screen shows)
  const isBookingOpen = false; // ← CHANGE THIS TO false TO CLOSE BOOKINGS
  console.log('ContactUs loaded, isBookingOpen:', isBookingOpen)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'payment', 'completed'
  
  // Mock data from previous steps - in real app, this would come from props or context
  const location = useLocation();
  const userResults = location.state?.userResults || {
    // Default values as fallback
    bmi: 0,
    bmiCategory: 'Normal Weight',
    dailyCalories: 0,
    goal: 'Weight Loss',
    dietaryRestrictions: 'No restrictions',
    macros: { protein: 0, carbs: 0, fats: 0 }
  };

  // Check if bookings are closed BEFORE anything else
  if (!isBookingOpen) {
    return <FullyBooked />; // Show fully booked page and STOP here
  }

  //  if isBookingOpen = true

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentRedirect = () => {
    // Validate required fields before payment
    if (!formData.name || !formData.email) {
      alert('Please fill in all required fields (Name and Email) before proceeding to payment');
      return;
    }
    
    // Store form data in localStorage for retrieval after payment
    localStorage.setItem('consultationFormData', JSON.stringify(formData));
    localStorage.setItem('userResults', JSON.stringify(userResults));
    
    // Redirect to Paystack payment page
    window.open('https://paystack.shop/pay/bookdee', '_blank');
    
    // Show payment instructions
    setPaymentStep('payment');
  };

  const handlePaymentCompleted = () => {
    setPaymentStep('completed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Payment Instructions Screen
  if (paymentStep === 'payment') {
    return (
      <>
        <SEO
          title="Contact DietWithDee | Book a Consultation with Nana Ama Dwamena"
          description="Book your personalized diet consultation with Nana Ama Dwamena, Ghana's leading dietitian. Get expert nutrition advice and start your wellness journey today."
          keywords="Contact DietWithDee, Book Consultation, Ghana Dietitian, Nana Ama Dwamena, Nutrition Advice"
          image="https://dietwithdee.org/src/assets/LOGO.png"
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
          image="https://dietwithdee.org/src/assets/LOGO.png"
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

  // Main booking form (before payment)
  return (
    <>
      <SEO
        title="Contact DietWithDee | Book a Consultation with Nana Ama Dwamena"
        description="Book your personalized diet consultation with Nana Ama Dwamena, Ghana's leading dietitian. Get expert nutrition advice and start your wellness journey today."
        keywords="Contact DietWithDee, Book Consultation, Ghana Dietitian, Nana Ama Dwamena, Nutrition Advice"
        image="https://dietwithdee.org/LOGO.png"
        url="https://dietwithdee.org/contactUs"
      />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
          {/* Header */}
          <div className="text-center space-y-6 mb-12">
            <div className="space-y-6">
              <div className="text-5xl">🌟</div>
              <h1 className="text-4xl font-bold text-green-800">
                Ready to Start Your Nutrition Journey?
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto ">
                Complete the <a href='/KnowYourBody' className='text-green-800 font-bold'>KnowYourBody</a> Test and fill in the information below to secure your consultation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Results Summary */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-800 mb-6">Your Results Summary</h2>
              
              {/* BMI Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Calculator className="text-green-600" size={24} />
                  <h3 className="text-lg font-semibold text-gray-800">BMI Result</h3>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold text-green-600">{userResults.bmi}</div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    userResults.bmiCategory === 'Normal Weight' ? 'bg-green-100 text-green-700' :
                    userResults.bmiCategory === 'Underweight' ? 'bg-blue-100 text-blue-700' :
                    userResults.bmiCategory === 'Overweight' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {userResults.bmiCategory}
                  </div>
                </div>
              </div>

              {/* Calorie Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="text-emerald-600" size={24} />
                  <h3 className="text-lg font-semibold text-gray-800">Daily Calorie Estimate</h3>
                </div>
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-emerald-600">{userResults.dailyCalories} calories</div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="font-bold text-green-600">{userResults.macros.protein}g</div>
                        <div className="text-xs text-gray-600">Protein</div>
                      </div>
                      <div>
                        <div className="font-bold text-emerald-600">{userResults.macros.carbs}g</div>
                        <div className="text-xs text-gray-600">Carbs</div>
                      </div>
                      <div>
                        <div className="font-bold text-green-700">{userResults.macros.fats}g</div>
                        <div className="text-xs text-gray-600">Fats</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Goals & Preferences */}
              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Goals & Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Heart className="text-red-500" size={20} />
                    <span className="text-gray-700"><strong>Goal:</strong> {userResults.goal}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Utensils className="text-green-500" size={20} />
                    <span className="text-gray-700"><strong>Diet:</strong> {userResults.dietaryRestrictions}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-green-800 mb-6">Book Your Consultation</h2>
              
              {/* Pricing Info */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-6 mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <CreditCard size={24} />
                  <h3 className="text-xl font-bold">Complete Package - ₵800</h3>
                </div>
                <div className="space-y-2 text-green-100">
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} />
                    <span className="text-sm">Professional nutrition consultation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} />
                    <span className="text-sm">Personalized meal plan</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} />
                    <span className="text-sm">Ongoing support</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none placeholder-gray-400 text-gray-900"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none placeholder-gray-400 text-gray-900"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none placeholder-gray-400 text-gray-900"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Tell us anything else you'd like us to know
                  </label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-3 text-gray-400" size={20} />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none resize-none placeholder-gray-400 text-gray-900"
                      placeholder="Any specific health concerns, preferences, or questions..."
                    />
                  </div>
                </div>

                {/* Payment Button */}
                <div className="space-y-3">
                  <button
                    onClick={handlePaymentRedirect}
                    className="w-full py-4 bg-gradient-to-r from-[#F6841F] to-[#F6841F] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Lock size={20} />
                    <span>Secure Payment - ₵800</span>
                  </button>
                  
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Shield size={16} />
                    <span>Secured by Paystack</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p>1. Complete your information above</p>
                    <p>2. Click "Secure Payment" to pay ₵800</p>
                    <p>3. Return here to schedule your consultation</p>
                    <p>4. Receive your personalized plan</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200 mt-6">
                <p className="text-lg font-semibold text-gray-800 mb-1">Hours Available:</p>
                <p className="text-sm text-gray-500">Fridays-10am-1pm</p>
                <p className="text-sm text-gray-500">Saturdays-2-6pm</p>
              </div>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Questions? Contact us directly</h3>
            <div className="flex justify-center items-center space-x-8">
              <a 
                href="mailto:dietwdee@gmail.com"
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <Mail size={20} />
                <span>dietwdee@gmail.com</span>
              </a>
              <a 
                href="https://wa.me/233592330870?text=Hello%2C%20I%E2%80%99d%20like%20to%20book%20a%20session%20with%20Diet%20with%20Dee"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <MessageCircle size={20} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ContactUs;