import React, { useState, useEffect, useRef } from 'react';
import SEO from '../../Components/SEO';
import { ArrowLeft, Send, Shield, CheckCircle, CreditCard, HelpCircle, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router';
import fathersDayPromo from '../../assets/fathers_day_promo.png';
import { isValidEmail } from '../../utils/validation';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../../firebaseConfig';

// Collapsible FAQ item
const FaqItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-zinc-200 bg-white rounded-none">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer bg-transparent border-none"
      >
        <span className="text-sm font-semibold text-zinc-800">{question}</span>
        <ChevronDown
          size={16}
          className={`text-zinc-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-3 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100">
          <p className="pt-2">{answer}</p>
        </div>
      )}
    </div>
  );
};

const FathersDay = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    fatherName: '',
    fatherPhone: '',
    message: '',
    isSurprise: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      logEvent(analytics, 'view_promotion', {
        promotion_id: 'fathers_day_campaign',
        promotion_name: 'Father\'s Day Gift Consultation',
        creative_name: 'Honor His Health Promo Card',
        location_id: 'fathers_day_page'
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Validate fields
    if (!formData.buyerName || !formData.buyerEmail || !formData.buyerPhone || !formData.fatherName || !formData.fatherPhone) {
      alert('Please fill in all required fields marked with an asterisk (*).');
      return;
    }

    if (!isValidEmail(formData.buyerEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      logEvent(analytics, 'begin_checkout', {
        value: 600,
        currency: 'GHS',
        items: [{
          item_name: "Father's Day Special Gift Consultation",
          item_category: "Campaign",
          price: 600,
          quantity: 1
        }]
      });
    } catch (err) {
      console.warn('Analytics logging failed:', err);
    }

    // 2. Format custom payload for local storage (used in PaymentSuccess.jsx)
    const fathersDayData = {
      name: formData.buyerName, // client confirmation emails default to name
      email: formData.buyerEmail,
      phone: formData.buyerPhone,
      message: formData.message,
      consultationType: 'initial', // resolves to standard GHS 800 transaction
      isFathersDayBooking: true,
      buyerName: formData.buyerName,
      buyerEmail: formData.buyerEmail,
      buyerPhone: formData.buyerPhone,
      fatherName: formData.fatherName,
      fatherPhone: formData.fatherPhone,
      fatherMessage: formData.message,
      isSurprise: formData.isSurprise
    };

    localStorage.setItem('consultationFormData', JSON.stringify(fathersDayData));
    localStorage.setItem('userResults', JSON.stringify({})); // Father's Day gifts don't require pre-computed user results

    // 3. Redirect to secure Paystack page (Father's Day Campaign - dee-campaign)
    window.location.href = 'https://paystack.shop/pay/dee-campaign';
  };

  return (
    <>
      <SEO
        title="Father's Day Special Gift Consultation | DietWithDee"
        description="Gift a personalized diet & wellness consultation to a special father in your life this Father's Day. Special GH₵ 600 promo package by Registered Dietitian Nana Ama Dwamena."
        keywords="Fathers Day, Gift Consultation, Dietitian Ghana, DietWithDee, Nana Ama Dwamena, Healthy Gift"
        image="https://dietwithdee.org/LOGO.webp"
        url="https://dietwithdee.org/fathersday"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Father's Day Special Gift Consultation Package",
          "image": "https://dietwithdee.org/LOGO.webp",
          "description": "Gift the father figure in your life a comprehensive 45-minute nutrition assessment, custom personal meal plan, and downloadable gift voucher card with Registered Dietitian Nana Ama Dwamena.",
          "brand": {
            "@type": "Brand",
            "name": "DietWithDee"
          },
          "offers": {
            "@type": "Offer",
            "price": "600",
            "priceCurrency": "GHS",
            "availability": "https://schema.org/InStock",
            "url": "https://dietwithdee.org/fathersday"
          }
        }}
      />

      <div className="min-h-screen bg-zinc-50 py-16 px-4 md:px-8 border-t border-zinc-200">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Back Button & Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-zinc-600 hover:text-zinc-950 font-medium text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </button>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-none">
              Special Event Campaign
            </div>
          </div>

          {/* Main Content Grid split into Promo banner and Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-zinc-200 bg-white rounded-none shadow-sm overflow-hidden">
            
            {/* Left Column: Promo Visuals */}
            <div className="lg:col-span-5 bg-zinc-950 text-white p-8 flex flex-col justify-between border-r border-zinc-200">
              <div className="space-y-6">
                <div className="border border-zinc-800 bg-zinc-900/50 p-2 inline-block">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">Limited Offer</span>
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight font-serif text-amber-100">
                    Honor His Health
                  </h1>
                  <p className="text-sm text-zinc-400">
                    This Father's Day, give the father in your life the gift of wellness, vitality, and longevity.
                  </p>
                </div>

                <div className="gold-shimmer-card p-4 space-y-4 text-white">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Promo Price</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-amber-400">₵600</span>
                      <span className="text-sm text-zinc-500 line-through">₵1000</span>
                    </div>
                  </div>
                  <div className="border-t border-zinc-800 pt-3 space-y-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">What's Included</span>
                    {[
                      '45-min comprehensive assessment',
                      'Custom personal meal plan',
                      'Downloadable gift voucher card',
                      'WhatsApp scheduling & support'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-amber-500 shrink-0" />
                        <span className="text-[12px] text-zinc-200 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promo Image */}
                <div className="border border-zinc-800 overflow-hidden bg-zinc-900 p-1 flex items-center justify-center">
                  <img
                    src={fathersDayPromo}
                    alt="Father and Son gifting"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

              {/* Guarantees */}
              <div className="pt-8 border-t border-zinc-900 space-y-3 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-amber-500" />
                  <span>Scheduled directly via WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-amber-500" />
                  <span>Secured by Paystack payments</span>
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-7 p-8 lg:p-10 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-zinc-950 tracking-tight">Gift Booking Information</h2>
                <p className="text-xs text-zinc-500 mt-1">Please enter details for both yourself and the father receiving the gift.</p>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                
                {/* Section 1: Giver */}
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-2">
                    1. Your Details (The Giver)
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wide">Your Name *</label>
                      <input
                        type="text"
                        name="buyerName"
                        value={formData.buyerName}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-950 transition-shadow outline-none placeholder:text-zinc-400"
                        placeholder="Sender Full Name"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wide">Your Email *</label>
                      <input
                        type="email"
                        name="buyerEmail"
                        value={formData.buyerEmail}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-950 transition-shadow outline-none placeholder:text-zinc-400"
                        placeholder="yourname@gmail.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wide">Your WhatsApp Number *</label>
                    <input
                      type="tel"
                      name="buyerPhone"
                      value={formData.buyerPhone}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-950 transition-shadow outline-none placeholder:text-zinc-400"
                      placeholder="e.g. +233..."
                    />
                  </div>
                </div>

                {/* Section 2: Recipient Father */}
                <div className="space-y-4 pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-2">
                    2. Recipient Details (The Father)
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wide">Father's Name *</label>
                      <input
                        type="text"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-950 transition-shadow outline-none placeholder:text-zinc-400"
                        placeholder="Father's Full Name"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wide">Father's WhatsApp Number *</label>
                      <input
                        type="tel"
                        name="fatherPhone"
                        value={formData.fatherPhone}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-950 transition-shadow outline-none placeholder:text-zinc-400"
                        placeholder="e.g. +233..."
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wide">Personal Message or Health Concerns</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-950 transition-shadow outline-none resize-none placeholder:text-zinc-400"
                      placeholder="Add a sweet message or list any chronic health issues (diabetes, hypertension, weight concerns)..."
                    />
                  </div>

                  {/* Surprise Toggle Checkbox */}
                  <div className="flex items-center gap-2 pt-2 text-left">
                    <input
                      type="checkbox"
                      name="isSurprise"
                      id="isSurprise"
                      checked={formData.isSurprise}
                      onChange={(e) => setFormData(prev => ({ ...prev, isSurprise: e.target.checked }))}
                      className="h-4 w-4 rounded-none border border-zinc-200 text-zinc-950 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <label htmlFor="isSurprise" className="text-xs font-semibold text-zinc-700 select-none cursor-pointer">
                      Keep this booking a surprise until Father's Day 🤫
                    </label>
                  </div>
                </div>

                {/* Submit / Pay Button */}
                <div className="pt-4 border-t border-zinc-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 text-sm font-semibold rounded-none transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Connecting...</span>
                    ) : (
                      <>
                        <CreditCard size={16} />
                        <span>Proceed to Pay GH₵ 600</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Secure payment banner */}
              <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-400 font-bold uppercase tracking-wider pt-2">
                <div className="flex items-center gap-1">
                  <Shield size={12} />
                  <span>Secured by Paystack</span>
                </div>
                <span>•</span>
                <div>
                  <span>Instant Gift Confirmation</span>
                </div>
              </div>
            </div>

          </div>

          {/* FAQ Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-800 tracking-tight">Frequently Asked Questions</h3>
            {[
              {
                q: 'What happens after I pay?',
                a: 'You\'ll receive a confirmation email and a downloadable gift voucher card instantly. Our team will then reach out via WhatsApp within 24 hours to schedule the consultation.'
              },
              {
                q: 'Can I choose the exact consultation date?',
                a: 'Yes! After payment, our team coordinates directly with you (and the father, unless it\'s a surprise) to pick a date and time that works best. Consultations run Tuesday–Sunday, 10 AM – 3 PM.'
              },
              {
                q: 'What if my father has a specific health condition?',
                a: 'That\'s exactly what this consultation is for. You can mention any conditions (diabetes, hypertension, etc.) in the message field, and Nana Ama will tailor the entire session and meal plan accordingly.'
              },
              {
                q: 'Is the surprise option really secret?',
                a: 'Absolutely. If you check the surprise box, we will not contact the father until Father\'s Day morning. We\'ll coordinate everything through you first.'
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

export default FathersDay;
