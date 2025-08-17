// PaymentSuccess.jsx
import React, { useMemo, useState } from 'react';
import { CheckCircle, Send, Copy, ExternalLink, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function PaymentSuccess() {
  const navigate = useNavigate();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // Pull saved data from localStorage (set on the booking page before Paystack)
  const formData = useMemo(
    () =>
      JSON.parse(
        localStorage.getItem('consultationFormData') ||
          JSON.stringify({ name: '', email: '', phone: '', message: '' })
      ),
    []
  );

  const userResults = useMemo(
    () =>
      JSON.parse(
        localStorage.getItem('userResults') ||
          JSON.stringify({
            bmi: 0,
            bmiCategory: 'Unknown',
            dailyCalories: 0,
            goal: 'Not specified',
            dietaryRestrictions: 'None',
            macros: { protein: 0, carbs: 0, fats: 0 }
          })
      ),
    []
  );

  const safePct = (grams = 0, kcalPerGram = 0, total = 0) => {
    if (!total) return 0;
    const kcal = Number(grams || 0) * kcalPerGram;
    return Math.round((kcal / total) * 100);
  };

  const generateEmailContent = () => {
    const subject = `Professional Nutrition Consultation Request - ${formData.name || 'Client'} [PAID]`;

    const body = `Dear Diet with Dee Team,

I hope this email finds you well. I have completed payment for a professional nutrition consultation and am writing to schedule my session based on my recent comprehensive health assessment.

💳 PAYMENT STATUS: COMPLETED ✅
💰 Amount Paid: ₵800 (Consultation + Custom Plan)

═══════════════════════════════════════════════════════════════════════════════════════
📋 CLIENT INFORMATION
═══════════════════════════════════════════════════════════════════════════════════════

👤 Full Name: ${formData.name || '-'}
📧 Email Address: ${formData.email || '-'}
📞 Phone Number: ${formData.phone || 'Not provided'}

═══════════════════════════════════════════════════════════════════════════════════════
📊 HEALTH ASSESSMENT RESULTS
═══════════════════════════════════════════════════════════════════════════════════════

🏥 Body Mass Index (BMI): ${userResults.bmi ?? '-'} - ${userResults.bmiCategory ?? '-'}
🔥 Daily Caloric Requirement: ${userResults.dailyCalories ?? 0} calories per day

📈 MACRONUTRIENT BREAKDOWN:
    • Protein: ${userResults?.macros?.protein ?? 0}g daily (${safePct(userResults?.macros?.protein, 4, userResults?.dailyCalories)}% of total calories)
    • Carbohydrates: ${userResults?.macros?.carbs ?? 0}g daily (${safePct(userResults?.macros?.carbs, 4, userResults?.dailyCalories)}% of total calories)
    • Fats: ${userResults?.macros?.fats ?? 0}g daily (${safePct(userResults?.macros?.fats, 9, userResults?.dailyCalories)}% of total calories)

═══════════════════════════════════════════════════════════════════════════════════════
🎯 PERSONAL GOALS & PREFERENCES
═══════════════════════════════════════════════════════════════════════════════════════

🎯 Primary Health Goal: ${userResults.goal ?? '-'}
🍽️ Dietary Restrictions/Preferences: ${userResults.dietaryRestrictions ?? '-'}

═══════════════════════════════════════════════════════════════════════════════════════
💬 ADDITIONAL INFORMATION
═══════════════════════════════════════════════════════════════════════════════════════

${formData.message ? `"${formData.message}"` : 'No additional information provided at this time.'}
${formData.name || ''}
📧 ${formData.email || ''}
${formData.phone ? `📞 ${formData.phone}` : ''}

---
This email was generated through the Diet with Dee Assessment Portal
Payment completed via Paystack
Date: ${new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}`;

    return { subject, body };
  };

  const handleMailtoSubmit = () => {
    // Validate minimal required fields before opening mail client
    if (!formData?.name || !formData?.email) {
      alert('Please ensure your Name and Email are available.');
      return;
    }

    const { subject, body } = generateEmailContent();
    // NOTE: per your requirement, we send to dietwdee@gmail.com
    const mailtoLink = `mailto:princetetteh963@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    try {
      window.location.href = mailtoLink;
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error opening email client:', error);
      setShowEmailPreview(true);
    }
  };

  const handleCopyEmail = async () => {
    const { subject, body } = generateEmailContent();
    const emailText = `To: princetetteh963@gmail.com\nSubject: ${subject}\n\n${body}`;

    try {
      await navigator.clipboard.writeText(emailText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
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

  const handleOpenWebmail = (provider) => {
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

  // Email preview UI
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
                <span className="text-gray-900">dietwdee@gmail.com</span>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleCopyEmail}
                  className="flex items-center justify-center space-x-2 p-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Copy size={20} />
                  <span>{copied ? 'Copied!' : 'Copy Email Text'}</span>
                </button>

                <button
                  onClick={() => handleOpenWebmail('gmail')}
                  className="flex items-center justify-center space-x-2 p-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <ExternalLink size={20} />
                  <span>Open in Gmail</span>
                </button>

                <button
                  onClick={() => handleOpenWebmail('outlook')}
                  className="flex items-center justify-center space-x-2 p-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <ExternalLink size={20} />
                  <span>Open in Outlook</span>
                </button>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleMailtoSubmit}
                  className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                >
                  Try Email Client Again
                </button>

                <button
                  onClick={() => setShowEmailPreview(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state after email client opened
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12">
        <div className="container mx-auto px-6 lg:px-12 max-w-2xl">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-green-600" size={48} />
              </div>
              <h1 className="text-3xl font-bold text-green-800">Email Ready to Send</h1>
              <p className="text-lg text-gray-600">
                Your email client opened with your consultation request. Please click **Send** in your email app to complete your booking.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-semibold text-green-800 mb-4">What's Next?</h3>
              <div className="space-y-4 text-left">
                <p className="text-gray-700">• Send the email from your mail app</p>
                <p className="text-gray-700">• We’ll review your information</p>
                <p className="text-gray-700">• You’ll receive a response within 24 hours to schedule</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowEmailPreview(true)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
              >
                Preview Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Payment Success screen with "Send Email" button
  return (
    <><SEO title="Payment Successful" description="Thank you!" url="/paymentSuccess" noindex /><div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12">
      <div className="container mx-auto px-6 lg:px-12 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center space-y-6 mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h2 className="text-3xl font-bold text-green-800">Payment Confirmed!</h2>
            <p className="text-lg text-gray-600">
              Thanks for your payment. Please send your consultation request so we can schedule your session.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleMailtoSubmit}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Send size={20} />
              <span>Send Consultation Request</span>
            </button>

            <button
              onClick={() => setShowEmailPreview(true)}
              className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
            >
              Preview Email / Other Options
            </button>

            <div className="pt-4 border-t border-gray-200 mt-4 text-sm text-gray-600 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>Recipient: <strong>princetetteh963@gmail.com</strong></span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
            >
              Back to Home
            </button>
          </div>

          {/* Optional tiny recap */}
          <div className="mt-8 text-sm text-gray-600 space-y-1">
            <div><strong>Name:</strong> {formData?.name || '-'}</div>
            <div><strong>Email:</strong> {formData?.email || '-'}</div>
            <div><strong>Phone:</strong> {formData?.phone || '-'}</div>
          </div>
        </div>
      </div>
    </div></>
  );
}

export default PaymentSuccess;
