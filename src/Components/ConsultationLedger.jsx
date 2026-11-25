import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  MessageCircle,
  CheckCircle2,
  ShieldCheck,
  Clock,
  X,
  ChevronDown,
  ArrowRight,
  Loader2,
  Sparkles,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { AnimatePresence, motion } from 'framer-motion';
import { isValidEmail } from '../utils/validation';
import { useToast } from '../Contexts/ToastContext';
import BookingCalendar from './BookingCalendar';
import { functions, safeLogEvent } from '../firebaseConfig';

/**
 * Shared Clinical Ledger accordion + single-step Paystack checkout + Tier 03 bespoke inquiry flow.
 * Used by both /contactUs (standard consultations) and /ontrack (diabetes consultations).
 */
export default function ConsultationLedger({
  tiers,
  bookingSettings = null,
  user = null,
  userProfile = null,
  userResults,
  hasCalculatedResults = false,
  initialTier = null,
  source = 'contact_us',
  isOntrack = false,
  inquiryAnalyticsSource = 'contact_us_tier_03',
  eyebrowText = 'Choose your care tier or plan',
  placeholders = {},
  showPreAssessmentLink = true,
  onOpenWhatsApp,
  onTierRevealed
}) {
  const { showToast } = useToast();

  const [expandedTier, setExpandedTier] = useState(initialTier);
  const [hasRevealedPricing, setHasRevealedPricing] = useState(Boolean(initialTier));
  const [showHealthDetails, setShowHealthDetails] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    scheduledDate: '',
    scheduledTime: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

  const customTopics = tiers.custom?.topics || [];
  const [inquiryTopic, setInquiryTopic] = useState(customTopics[0] || 'Custom & Specialist Care');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const tierRefs = useRef({});
  const formStartRef = useRef(null);

  // Auto-fill form from signed-in Google account when fields are still empty
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.displayName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || userProfile?.phone || ''
      }));
    }
  }, [user, userProfile]);

  const handleToggleTier = (tierId) => {
    setFieldErrors({});
    setExpandedTier((prev) => {
      const next = prev === tierId ? null : tierId;
      if (next) {
        setHasRevealedPricing(true);
        if (onTierRevealed) onTierRevealed(next);
        safeLogEvent('view_item', {
          currency: 'GHS',
          value: tiers[next]?.amountGhs || 0,
          items: [{ item_id: tiers[next]?.paystackTier || next, item_name: tiers[next]?.title }]
        });
        setTimeout(() => {
          tierRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 120);
      }
      return next;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateContactFields = ({ requireMessage = false, requireCalendar = false } = {}) => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Please enter your full name.';
    if (!formData.email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!isValidEmail(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!formData.phone.trim()) errors.phone = 'Please enter your WhatsApp or phone number.';
    if (requireMessage && !formData.message.trim()) {
      errors.message = 'Please add a short note about what you need help with.';
    }
    if (requireCalendar && bookingSettings?.enableCalendarBooking) {
      if (!formData.scheduledDate || !formData.scheduledTime) {
        errors.slot = 'Please pick an available consultation date and time slot above.';
      }
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      showToast(firstError, 'error');
      formStartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return false;
    }
    return true;
  };

  const handleCheckout = async (tierId) => {
    if (isSubmittingCheckout) return;
    if (!validateContactFields({ requireCalendar: true })) return;

    const tierConfig = tiers[tierId];
    const cleanFormData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      message: formData.message.trim(),
      scheduledDate: formData.scheduledDate || '',
      scheduledTime: formData.scheduledTime || '',
      consultationType: tierId,
      source,
      ...(isOntrack ? { isOntrack: true, amount: tierConfig.amountGhs } : {})
    };

    safeLogEvent('begin_checkout', {
      value: tierConfig.amountGhs,
      currency: 'GHS',
      items: [
        {
          item_id: tierConfig.paystackTier || tierId,
          item_name: tierConfig.analyticsItemName || tierConfig.title,
          item_category: tierConfig.analyticsCategory || 'Clinical Nutrition Consultation',
          price: tierConfig.amountGhs,
          quantity: 1
        }
      ]
    });

    try {
      localStorage.setItem('consultationFormData', JSON.stringify(cleanFormData));
      localStorage.setItem('userResults', JSON.stringify(userResults || {}));
    } catch {
      // Paystack metadata also carries the payload
    }

    setIsSubmittingCheckout(true);
    try {
      const initPaystackFn = httpsCallable(functions, 'initializePaystackTransaction');
      const result = await initPaystackFn({
        tier: tierConfig.paystackTier || tierId,
        formData: cleanFormData,
        userResults: userResults || {},
        callbackOrigin: window.location.origin
      });

      if (result.data?.success && result.data?.authorizationUrl) {
        window.location.href = result.data.authorizationUrl;
        return;
      }

      throw new Error('Paystack checkout URL was not returned.');
    } catch (err) {
      const code = err?.code || '';
      if ((code === 'functions/not-found' || code === 'functions/unimplemented') && tierConfig.fallbackUrl) {
        console.warn('initializePaystackTransaction unavailable, falling back to Paystack Shop link:', err);
        window.location.href = tierConfig.fallbackUrl;
        return;
      }

      console.error('Checkout initialization failed:', err);
      showToast(
        err?.message || 'Unable to start Paystack checkout right now. Please try again.',
        'error'
      );
      setIsSubmittingCheckout(false);
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingInquiry) return;
    if (!validateContactFields({ requireMessage: true })) return;

    setIsSubmittingInquiry(true);
    try {
      const submitInquiryFn = httpsCallable(functions, 'submitBespokeInquiry');
      const result = await submitInquiryFn({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
        inquiryTopic
      });

      if (result.data?.success) {
        safeLogEvent('generate_lead', {
          lead_source: inquiryAnalyticsSource,
          inquiry_topic: inquiryTopic
        });
        setInquirySubmitted(true);
        showToast('Care inquiry sent! We will reach out within 24 hours.', 'success');
        return;
      }

      throw new Error('Could not submit inquiry.');
    } catch (err) {
      const code = err?.code || '';
      if (code === 'functions/not-found' || code === 'functions/unimplemented') {
        const waText = `Hello Nana Ama, my name is ${formData.name.trim()} (${formData.email.trim()}). I'm inquiring about ${inquiryTopic}: ${formData.message.trim()}`;
        window.open(`https://wa.me/233592330870?text=${encodeURIComponent(waText)}`, '_blank', 'noopener,noreferrer');
        showToast('Opened WhatsApp so you can send your inquiry directly.', 'info');
      } else {
        console.error('Bespoke inquiry error:', err);
        showToast(err?.message || 'Could not send inquiry. Please try WhatsApp below.', 'error');
      }
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const getCollapsedPillLabel = (tierId) => {
    if (!hasRevealedPricing) return 'Review +';
    if (tierId === 'custom') return 'Contact +';
    return `${tiers[tierId]?.priceDisplay} +`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Attached Health Profile Strip */}
      {hasCalculatedResults ? (
        <section
          aria-label="Attached Nutrition Profile"
          className="bg-white border border-emerald-200/80 rounded-2xl shadow-2xs overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setShowHealthDetails((prev) => !prev)}
            aria-expanded={showHealthDetails}
            className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 text-left bg-emerald-50/60 hover:bg-emerald-50/90 transition-colors cursor-pointer border-none"
          >
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
              <p className="text-xs sm:text-sm text-stone-800 leading-snug">
                <span className="font-semibold text-emerald-950">Assessment attached</span>
                <span className="text-stone-500 mx-1.5">·</span>
                <span className="text-stone-700 font-medium">
                  BMI {userResults.bmi}
                  {userResults.dailyCalories ? ` · ${userResults.dailyCalories} kcal` : ''}
                </span>
              </p>
            </div>
            <ChevronDown
              size={16}
              className={`text-emerald-800 shrink-0 transition-transform duration-200 ${
                showHealthDetails ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showHealthDetails && (
            <div className="p-4 border-t border-emerald-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  BMI Status
                </span>
                <p className="text-sm font-bold text-stone-900 mt-0.5">
                  {userResults.bmi} kg/m²
                </p>
                <p className="text-emerald-700 font-medium mt-0.5">{userResults.bmiCategory}</p>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Daily Estimate
                </span>
                <p className="text-sm font-bold text-stone-900 mt-0.5">
                  {userResults.dailyCalories ? `${userResults.dailyCalories} kcal` : 'Pending'}
                </p>
                {userResults.macros?.protein > 0 && (
                  <p className="text-stone-600 mt-0.5">
                    P {userResults.macros.protein}g · C {userResults.macros.carbs}g · F{' '}
                    {userResults.macros.fats}g
                  </p>
                )}
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Goal &amp; Preferences
                </span>
                <p className="text-sm font-bold text-stone-900 mt-0.5 truncate">
                  {userResults.goal}
                </p>
                <p className="text-stone-600 mt-0.5 truncate">
                  Diet: {userResults.dietaryRestrictions || 'None'}
                </p>
              </div>
            </div>
          )}
        </section>
      ) : (
        showPreAssessmentLink && (
          <div className="text-xs text-stone-600 flex flex-wrap items-center gap-1.5 bg-white/70 border border-stone-200/80 rounded-xl px-4 py-2.5">
            <span>Want Nana Ama to review your BMI &amp; calorie profile first?</span>
            <Link
              to="/knowYourBody"
              className="font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-2 inline-flex items-center gap-1"
            >
              <span>Take the 2-min KnowYourBody check</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        )
      )}

      {/* Editorial Tap-to-Reveal Accordion */}
      <section aria-label="Consultation Care Tiers" className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-600">
            {eyebrowText}
          </p>
          {expandedTier && (
            <span className="text-[11px] text-stone-500 hidden sm:inline">
              Tap another tier anytime to switch
            </span>
          )}
        </div>

        <div className="space-y-2.5 sm:space-y-3">
          {['initial', 'followup', 'custom'].map((tierId) => {
            const tier = tiers[tierId];
            if (!tier) return null;
            const isOpen = expandedTier === tierId;
            const isPaidTier = tierId === 'initial' || tierId === 'followup';

            return (
              <div
                key={tierId}
                ref={(el) => {
                  tierRefs.current[tierId] = el;
                }}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-white ${
                  isOpen
                    ? 'border-stone-900 shadow-md ring-1 ring-stone-900/5'
                    : 'border-stone-200/90 shadow-2xs hover:border-stone-300'
                }`}
              >
                {/* Accordion Header Row */}
                <button
                  type="button"
                  onClick={() => handleToggleTier(tierId)}
                  aria-expanded={isOpen}
                  aria-controls={`tier-panel-${tierId}`}
                  className="w-full px-4 py-3.5 sm:px-6 sm:py-5 flex items-center justify-between gap-3 sm:gap-4 text-left bg-transparent border-none cursor-pointer group"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-800">
                        {tier.num} · {tier.eyebrow}
                      </span>
                      {tier.badge && !isOpen && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-[#e07312] border border-orange-200/70">
                          {tier.badge}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-serif-cormorant font-medium text-stone-900 leading-tight">
                      {tier.title}
                    </h2>
                    {!isOpen && (
                      <p className="text-xs sm:text-sm text-stone-600 font-normal">
                        {tier.shortDesc}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    {isOpen ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 group-hover:text-stone-900 px-2.5 py-1.5 rounded-lg bg-stone-100">
                        <span>Close</span>
                        <X size={13} />
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                          tierId === 'initial'
                            ? 'bg-[#F6841F] group-hover:bg-[#e07312] text-white border border-[#F6841F] group-hover:border-[#e07312] shadow-xs'
                            : 'bg-white text-[#e06512] border border-[#F6841F] group-hover:bg-orange-50/70 group-hover:border-[#e07312] group-hover:text-[#c8550d]'
                        }`}
                      >
                        <span>{getCollapsedPillLabel(tierId)}</span>
                      </span>
                    )}
                  </div>
                </button>

                {/* Expanded Tier Body */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`tier-panel-${tierId}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-6 sm:px-6 sm:pb-7 pt-2 border-t border-stone-100 space-y-6">
                        {isPaidTier ? (
                          <>
                            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 pt-2">
                              <div className="flex items-baseline gap-3">
                                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
                                  {tier.priceDisplay}
                                </span>
                                {tier.originalPriceDisplay && (
                                  <span className="text-base text-stone-400 line-through font-medium">
                                    {tier.originalPriceDisplay}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs sm:text-sm font-medium text-stone-600">
                                {tier.durationLabel}
                              </span>
                            </div>

                            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700 border-y border-stone-100 py-4">
                              {tier.inclusions.map((item) => (
                                <li key={item} className="flex items-start gap-2.5">
                                  <span
                                    className="text-emerald-700 font-bold mt-0.5"
                                    aria-hidden="true"
                                  >
                                    —
                                  </span>
                                  <span>{item}</span>
                                </li>
                              ))}
                              <li className="flex items-start gap-2.5">
                                <span
                                  className="text-emerald-700 font-bold mt-0.5"
                                  aria-hidden="true"
                                >
                                  —
                                </span>
                                <span>
                                  {bookingSettings?.enableCalendarBooking
                                    ? 'Choose your preferred consultation date & time below'
                                    : 'Personal scheduling confirmed via WhatsApp within 24 hours of payment'}
                                </span>
                              </li>
                            </ul>

                            {bookingSettings?.enableCalendarBooking ? (
                              <div className="space-y-2">
                                <BookingCalendar
                                  settings={bookingSettings}
                                  selectedDate={formData.scheduledDate}
                                  selectedTime={formData.scheduledTime}
                                  onSelectSlot={({ date, time }) => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      scheduledDate: date,
                                      scheduledTime: time
                                    }));
                                    if (fieldErrors.slot) {
                                      setFieldErrors((prev) => ({ ...prev, slot: '' }));
                                    }
                                  }}
                                />
                                {fieldErrors.slot && (
                                  <p className="text-xs font-medium text-rose-600 px-1">
                                    {fieldErrors.slot}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-start sm:items-center gap-2.5 py-3 px-4 bg-[#FAF8F5] border border-stone-200/80 rounded-xl text-xs text-stone-700">
                                <Clock
                                  size={15}
                                  className="text-[#F6841F] shrink-0 mt-0.5 sm:mt-0"
                                />
                                <p className="leading-relaxed">
                                  <strong className="font-semibold text-stone-900">
                                    Consultation Hours:
                                  </strong>{' '}
                                  Tuesday – Sunday, 10:00 AM – 3:00 PM GMT. Exact session timing is
                                  arranged personally after payment.
                                </p>
                              </div>
                            )}

                            {/* Inline Contact Form (Single-Step Booking) */}
                            <div ref={formStartRef} className="space-y-4">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-stone-700">
                                  Your Details
                                </h3>
                                <span className="text-[11px] text-stone-500">
                                  Sent straight to Paystack — no re-typing
                                </span>
                              </div>

                              <div className="space-y-3.5">
                                <div>
                                  <label
                                    htmlFor={`${source}-name-${tierId}`}
                                    className="block text-xs font-semibold text-stone-800 mb-1.5"
                                  >
                                    Full Name *
                                  </label>
                                  <div className="relative">
                                    <User
                                      size={16}
                                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                                    />
                                    <input
                                      id={`${source}-name-${tierId}`}
                                      type="text"
                                      name="name"
                                      value={formData.name}
                                      onChange={handleInputChange}
                                      placeholder={placeholders.name || 'e.g. Akosua Mensah'}
                                      className={`w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                                        fieldErrors.name
                                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                                          : 'border-stone-200 focus:border-stone-800 focus:ring-stone-900/10'
                                      }`}
                                    />
                                  </div>
                                  {fieldErrors.name && (
                                    <p className="text-xs text-rose-600 mt-1">{fieldErrors.name}</p>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                  <div>
                                    <label
                                      htmlFor={`${source}-email-${tierId}`}
                                      className="block text-xs font-semibold text-stone-800 mb-1.5"
                                    >
                                      Email Address *
                                    </label>
                                    <div className="relative">
                                      <Mail
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                                      />
                                      <input
                                        id={`${source}-email-${tierId}`}
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder={placeholders.email || 'you@example.com'}
                                        className={`w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                                          fieldErrors.email
                                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                                            : 'border-stone-200 focus:border-stone-800 focus:ring-stone-900/10'
                                        }`}
                                      />
                                    </div>
                                    {fieldErrors.email && (
                                      <p className="text-xs text-rose-600 mt-1">
                                        {fieldErrors.email}
                                      </p>
                                    )}
                                  </div>

                                  <div>
                                    <label
                                      htmlFor={`${source}-phone-${tierId}`}
                                      className="block text-xs font-semibold text-stone-800 mb-1.5"
                                    >
                                      WhatsApp / Phone *
                                    </label>
                                    <div className="relative">
                                      <Phone
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                                      />
                                      <input
                                        id={`${source}-phone-${tierId}`}
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder={placeholders.phone || '+233 24 000 0000'}
                                        className={`w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                                          fieldErrors.phone
                                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                                            : 'border-stone-200 focus:border-stone-800 focus:ring-stone-900/10'
                                        }`}
                                      />
                                    </div>
                                    {fieldErrors.phone && (
                                      <p className="text-xs text-rose-600 mt-1">
                                        {fieldErrors.phone}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <label
                                    htmlFor={`${source}-message-${tierId}`}
                                    className="block text-xs font-semibold text-stone-800 mb-1.5"
                                  >
                                    Health Notes{' '}
                                    <span className="font-normal text-stone-500">(Optional)</span>
                                  </label>
                                  <div className="relative">
                                    <MessageCircle
                                      size={16}
                                      className="absolute left-3.5 top-3.5 text-stone-400"
                                    />
                                    <textarea
                                      id={`${source}-message-${tierId}`}
                                      name="message"
                                      value={formData.message}
                                      onChange={handleInputChange}
                                      rows={2}
                                      placeholder={
                                        placeholders.message ||
                                        'Any conditions, medications, or goals Nana Ama should know...'
                                      }
                                      className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all resize-none"
                                    />
                                  </div>
                                </div>
                              </div>

                              {bookingSettings?.enableCalendarBooking &&
                                formData.scheduledDate &&
                                formData.scheduledTime && (
                                  <div className="px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                                    <span className="font-semibold text-emerald-950">
                                      Selected Slot: {formData.scheduledDate} at{' '}
                                      {formData.scheduledTime} (GMT)
                                    </span>
                                    <span className="text-[11px] font-bold text-emerald-700">
                                      Ready
                                    </span>
                                  </div>
                                )}

                              <div className="pt-1 space-y-2.5">
                                <button
                                  type="button"
                                  disabled={isSubmittingCheckout}
                                  onClick={() => handleCheckout(tierId)}
                                  className="w-full py-3.5 sm:py-4 px-5 bg-[#F6841F] hover:bg-[#e07312] active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  {isSubmittingCheckout ? (
                                    <>
                                      <Loader2 size={18} className="animate-spin" />
                                      <span>Preparing Paystack Checkout...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock size={16} />
                                      <span>Proceed to Checkout — {tier.priceDisplay}</span>
                                    </>
                                  )}
                                </button>

                                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-stone-500 font-medium">
                                  <span className="inline-flex items-center gap-1">
                                    <ShieldCheck size={13} className="text-emerald-700" />
                                    Secured by Paystack
                                  </span>
                                  <span>·</span>
                                  <span>MTN MoMo, Telecel, AT &amp; Card</span>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          /* TIER 03: BESPOKE / SPECIALIST CARE */
                          <div className="pt-2 space-y-5">
                            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                              {tier.description}
                            </p>

                            {tier.callout && (
                              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div className="flex items-start gap-2.5 text-xs">
                                  <Sparkles size={15} className="text-[#F6841F] shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-semibold text-stone-900">
                                      {tier.callout.title}
                                    </p>
                                    <p className="text-stone-600">{tier.callout.subtitle}</p>
                                  </div>
                                </div>
                                <Link
                                  to={tier.callout.to}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-[#e07312] hover:text-stone-900 whitespace-nowrap shrink-0"
                                >
                                  <span>{tier.callout.linkText}</span>
                                  <ArrowRight size={13} />
                                </Link>
                              </div>
                            )}

                            {inquirySubmitted ? (
                              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                                <CheckCircle2 size={32} className="text-emerald-700 mx-auto" />
                                <div className="space-y-1">
                                  <h3 className="text-base font-bold text-stone-900">
                                    Care Inquiry Received
                                  </h3>
                                  <p className="text-xs sm:text-sm text-stone-700 max-w-md mx-auto">
                                    We sent a confirmation to{' '}
                                    <strong className="font-semibold">{formData.email}</strong>.
                                    Nana Ama&apos;s team will reach out via WhatsApp or email within
                                    24 hours.
                                  </p>
                                </div>
                                <div className="pt-1 flex flex-wrap justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setInquirySubmitted(false)}
                                    className="px-4 py-2 text-xs font-semibold bg-white border border-stone-200 rounded-xl text-stone-700 hover:bg-stone-50 cursor-pointer"
                                  >
                                    Send Another Note
                                  </button>
                                  {onOpenWhatsApp && (
                                    <button
                                      type="button"
                                      onClick={onOpenWhatsApp}
                                      className="px-4 py-2 text-xs font-semibold bg-[#143A28] text-white rounded-xl hover:bg-[#0e2a1d] cursor-pointer border-none"
                                    >
                                      Chat on WhatsApp Now
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <form
                                ref={formStartRef}
                                onSubmit={handleInquirySubmit}
                                className="space-y-4"
                              >
                                {customTopics.length > 0 && (
                                  <div>
                                    <span className="block text-xs font-semibold text-stone-800 mb-2">
                                      Focus Area
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                      {customTopics.map((topic) => (
                                        <button
                                          key={topic}
                                          type="button"
                                          onClick={() => setInquiryTopic(topic)}
                                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                                            inquiryTopic === topic
                                              ? 'bg-stone-900 text-white border-stone-900'
                                              : 'bg-[#FAF8F5] text-stone-700 border-stone-200 hover:border-stone-300'
                                          }`}
                                        >
                                          {topic}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                  <div>
                                    <label
                                      htmlFor={`${source}-name-custom`}
                                      className="block text-xs font-semibold text-stone-800 mb-1.5"
                                    >
                                      Full Name *
                                    </label>
                                    <input
                                      id={`${source}-name-custom`}
                                      type="text"
                                      name="name"
                                      value={formData.name}
                                      onChange={handleInputChange}
                                      placeholder="Your name or organization"
                                      className="w-full px-3.5 py-3 bg-[#FAF8F5] border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:outline-none"
                                    />
                                    {fieldErrors.name && (
                                      <p className="text-xs text-rose-600 mt-1">
                                        {fieldErrors.name}
                                      </p>
                                    )}
                                  </div>

                                  <div>
                                    <label
                                      htmlFor={`${source}-phone-custom`}
                                      className="block text-xs font-semibold text-stone-800 mb-1.5"
                                    >
                                      WhatsApp / Phone *
                                    </label>
                                    <input
                                      id={`${source}-phone-custom`}
                                      type="tel"
                                      name="phone"
                                      value={formData.phone}
                                      onChange={handleInputChange}
                                      placeholder="+233 24 000 0000"
                                      className="w-full px-3.5 py-3 bg-[#FAF8F5] border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:outline-none"
                                    />
                                    {fieldErrors.phone && (
                                      <p className="text-xs text-rose-600 mt-1">
                                        {fieldErrors.phone}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <label
                                    htmlFor={`${source}-email-custom`}
                                    className="block text-xs font-semibold text-stone-800 mb-1.5"
                                  >
                                    Email Address *
                                  </label>
                                  <input
                                    id={`${source}-email-custom`}
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="you@example.com"
                                    className="w-full px-3.5 py-3 bg-[#FAF8F5] border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:outline-none"
                                  />
                                  {fieldErrors.email && (
                                    <p className="text-xs text-rose-600 mt-1">
                                      {fieldErrors.email}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label
                                    htmlFor={`${source}-message-custom`}
                                    className="block text-xs font-semibold text-stone-800 mb-1.5"
                                  >
                                    How can we help? *
                                  </label>
                                  <textarea
                                    id={`${source}-message-custom`}
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder={
                                      tier.messagePlaceholder ||
                                      'Share your clinical goals, family size, or corporate event details...'
                                    }
                                    className="w-full px-3.5 py-3 bg-[#FAF8F5] border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-stone-800 focus:outline-none resize-none"
                                  />
                                  {fieldErrors.message && (
                                    <p className="text-xs text-rose-600 mt-1">
                                      {fieldErrors.message}
                                    </p>
                                  )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                                  <button
                                    type="submit"
                                    disabled={isSubmittingInquiry}
                                    className="flex-1 py-3.5 px-5 bg-[#143A28] hover:bg-[#0e2a1d] text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-60"
                                  >
                                    {isSubmittingInquiry ? (
                                      <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Sending Inquiry...</span>
                                      </>
                                    ) : (
                                      <span>Send Care Inquiry</span>
                                    )}
                                  </button>

                                  {onOpenWhatsApp && (
                                    <button
                                      type="button"
                                      onClick={onOpenWhatsApp}
                                      className="sm:w-auto py-3.5 px-4 bg-[#FAF8F5] hover:bg-stone-100 border border-stone-200 text-stone-800 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                      <MessageCircle size={15} className="text-emerald-700" />
                                      <span>WhatsApp Instead</span>
                                    </button>
                                  )}
                                </div>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
