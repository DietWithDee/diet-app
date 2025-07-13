import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Calculator, Target, Heart, Utensils, MessageCircle, Phone, Send, CheckCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';


function ConsultationBooking() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Mock data from previous steps - in real app, this would come from props or context
  const location = useLocation();
  const userResults = location.state?.userResults || {
    // Default values as fallback
    bmi: 0,
    bmiCategory: 'Unknown',
    dailyCalories: 0,
    goal: 'Not specified',
    dietaryRestrictions: 'None',
    macros: { protein: 0, carbs: 0, fats: 0 }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Consultation booking submitted:', { ...formData, userResults });
    setIsSubmitted(true);
  };


  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12">
        <div className="container mx-auto px-6 lg:px-12 max-w-2xl">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-green-600" size={48} />
              </div>
              <h1 className="text-3xl font-bold text-green-800">
                Thank You for Your Interest!
              </h1>
              <p className="text-lg text-gray-600">
                We've received your consultation request and will contact you within 24 hours to schedule your personalized nutrition session.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-semibold text-green-800 mb-4">What's Next?</h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm font-bold">1</span>
                  </div>
                  <p className="text-gray-700">Our nutritionist will review your results and goals</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm font-bold">2</span>
                  </div>
                  <p className="text-gray-700">We'll contact you to schedule a convenient time</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm font-bold">3</span>
                  </div>
                  <p className="text-gray-700">Receive your personalized nutrition plan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="space-y-4">
            <div className="text-5xl">🌟</div>
            <h1 className="text-4xl font-bold text-green-800">
              Ready to Start Your Nutrition Journey?
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've reviewed your results. Let's talk about what they mean and how we can help you achieve your goals.
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
                <div className="flex items-center space-x-3">
                  <Utensils className="text-green-500" size={20} />
                  <span className="text-gray-700"><strong>Dislikes</strong> {userResults.dietaryRestrictions}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-green-800 mb-6">Book Your Consultation</h2>
            
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
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700" size={20} />
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

              {/* Readonly Fields */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-gray-700">Your Assessment Results</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">BMI:</span>
                    <span className="ml-2 font-semibold text-gray-500">{userResults.bmi} ({userResults.bmiCategory})</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Daily Calories:</span>
                    <span className="ml-2 font-semibold text-gray-500">{userResults.dailyCalories}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Goal:</span>
                    <span className="ml-2 font-semibold text-gray-500">{userResults.goal}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Diet:</span>
                    <span className="ml-2 font-semibold text-gray-500">{userResults.dietaryRestrictions}</span>
                  </div>
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

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-orange-400 to-orange-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Send size={20} />
                <span>Book Consultation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Or contact us directly</h3>
          <div className="flex justify-center items-center space-x-8">
            <a 
              href="mailto:nutrition@example.com"
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <Mail size={20} />
              <span>dietwithdee@gmail</span>
            </a>
            <a 
              href="https://wa.me/1234567890"
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
  );
}

export default ConsultationBooking;