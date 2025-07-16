import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Calculator, Target, Heart, Utensils, MessageCircle, Phone, Send, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { useLocation } from 'react-router-dom';


function ConsultationBooking() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  
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
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const generateEmailContent = () => {
    const subject = `Professional Nutrition Consultation Request - ${formData.name}`;
    
    const body = `Dear Diet with Dee Team,

I hope this email finds you well. I am writing to request a professional nutrition consultation based on my recent comprehensive health assessment.


📋 CLIENT INFORMATION
══════════════════════

👤 Full Name: ${formData.name}
📧 Email Address: ${formData.email}
📞 Phone Number: ${formData.phone || 'Not provided'}


📊 HEALTH ASSESSMENT RESULTS
═══════════════════════════════


🏥 Body Mass Index (BMI): ${userResults.bmi} - ${userResults.bmiCategory}
🔥 Daily Caloric Requirement: ${userResults.dailyCalories} calories per day

📈 MACRONUTRIENT BREAKDOWN:
    • Protein: ${userResults.macros.protein}g daily (${Math.round((userResults.macros.protein * 4 / userResults.dailyCalories) * 100)}% of total calories)
    • Carbohydrates: ${userResults.macros.carbs}g daily (${Math.round((userResults.macros.carbs * 4 / userResults.dailyCalories) * 100)}% of total calories)
    • Fats: ${userResults.macros.fats}g daily (${Math.round((userResults.macros.fats * 9 / userResults.dailyCalories) * 100)}% of total calories)


🎯 PERSONAL GOALS & PREFERENCES
═══════════════════════════════


🎯 Primary Health Goal: ${userResults.goal}
🍽️ Dietary Restrictions/Preferences: ${userResults.dietaryRestrictions}


💬 ADDITIONAL INFORMATION
════════════════════════════


${formData.message ? `"${formData.message}"` : 'No additional information provided at this time.'}


I am eager to begin my nutrition journey with your professional guidance and would appreciate the opportunity to discuss these results in detail during a consultation. Please let me know your availability for the upcoming weeks.

I look forward to hearing from you soon and am excited about the possibility of working together to achieve my health and wellness goals.

Thank you for your time and consideration.

Warm regards,

${formData.name}
📧 ${formData.email}
${formData.phone ? `📞 ${formData.phone}` : ''}

---
This email was generated through the Diet with Dee Assessment Portal
Date: ${new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}`;

    return { subject, body };
  };

  const handleMailtoSubmit = () => {
    // Validate required fields
    if (!formData.name || !formData.email) {
      alert('Please fill in all required fields (Name and Email)');

      return;
    }
    
    const { subject, body } = generateEmailContent();
    
    // Create mailto link
    const mailtoLink = `mailto:dietwdee@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      // Try to open email client
      window.location.href = mailtoLink;
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error opening email client:', error);
      // Fallback to showing email preview
      setShowEmailPreview(true);
    }
  };

  const handleCopyEmail = async () => {
    const { subject, body } = generateEmailContent();
    const emailText = `To: dietwdee@gmail.com\nSubject: ${subject}\n\n${body}`;
    
    try {
      await navigator.clipboard.writeText(emailText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = emailText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWebMailLinks = (provider) => {
    const { subject, body } = generateEmailContent();
    const to = 'dietwdee@gmail.com';
    
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const encodedTo = encodeURIComponent(to);
    
    let webmailUrl = '';
    
    switch (provider) {
      case 'gmail':
        webmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedTo}&su=${encodedSubject}&body=${encodedBody}`;
        break;
      case 'outlook':
        webmailUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`;
        break;
      case 'yahoo':
        webmailUrl = `https://compose.mail.yahoo.com/?to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`;
        break;
      default:
        return;
    }
    
    window.open(webmailUrl, '_blank');
    setIsSubmitted(true);
  };

  if (showEmailPreview) {
    const { subject, body } = generateEmailContent();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-green-800 mb-6">Email Preview</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <strong className="text-gray-700">To:</strong>
                <span className="text-gray-900">princetetteh963@gmail.com</span>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <strong className="text-gray-700">Subject:</strong>
                <span className="text-gray-900">{subject}</span>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <strong className="text-gray-700 block mb-2">Message:</strong>
                <pre className="text-gray-900 whitespace-pre-wrap font-sans text-sm">{body}</pre>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Send this email using:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleCopyEmail}
                  className="flex items-center justify-center space-x-2 p-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Copy size={20} />
                  <span>{copied ? 'Copied!' : 'Copy Email Text'}</span>
                </button>
                
                <button
                  onClick={() => handleWebMailLinks('gmail')}
                  className="flex items-center justify-center space-x-2 p-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <ExternalLink size={20} />
                  <span>Open in Gmail</span>
                </button>              
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleMailtoSubmit}
                  className="flex-1 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors"
                >
                  Try Email Client Again
                </button>
                
                <button
                  onClick={() => setShowEmailPreview(false)}
                  className="flex-1 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Back to Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                Email Sent Successfully!
              </h1>
              <p className="text-lg text-gray-600">
                Your email client has opened with your consultation request. Please send the email to complete your booking.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-semibold text-green-800 mb-4">What's Next?</h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm font-bold">1</span>
                  </div>
                  <p className="text-gray-700">Send the email from your email client</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm font-bold">2</span>
                  </div>
                  <p className="text-gray-700">Diet with Dee will review your results and goals</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm font-bold">3</span>
                  </div>
                  <p className="text-gray-700">You'll receive a response within 24 hours to schedule your consultation</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setIsSubmitted(false)}
                className="flex-1 px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
              >
                Back to Form
              </button>
              
              <button
                onClick={() => setShowEmailPreview(true)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
              >
                Try Another Method
              </button>
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

              {/* Submit Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    handleMailtoSubmit();
                    // ✅ Scroll to top on step change
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100); // Delay slightly to ensure DOM has updated
                  }}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Send size={20} />
                  <span>Send Email</span>
                </button>
                <button
                  onClick={() => setShowEmailPreview(true)}
                  className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Preview Email / Other Options
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Or contact us directly</h3>
          <div className="flex justify-center items-center space-x-8">
            <a 
              href="mailto:dietwithdee@gmail.com"
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <Mail size={20} />
              <span>dietwithdee@gmail.com</span>
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
  );
}

export default ConsultationBooking;