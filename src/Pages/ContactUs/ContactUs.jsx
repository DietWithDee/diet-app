import React, { useState, useEffect } from 'react';
import SEO from '../../Components/SEO';
import { Mail, Phone, MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import FullyBooked from '../FullyBooked/FullyBooked';
import Offline from '../Offline/Offline';
import { getBookingSettings } from '../../firebaseBookingUtils';
import { useAuth } from '../../AuthContext';
import WhatsAppPopup from '../../Components/WhatsAppPopup';
import ConsultationLedger from '../../Components/ConsultationLedger';
import TestimonialsCarousel from '../../Components/TestimonialsCarousel';
import {
  computeResultsFromProfile,
  getStoredTestResults,
  DEFAULT_USER_RESULTS
} from '../../utils/bookingProfile';
import { safeLogEvent } from '../../firebaseConfig';

const CONTACT_CARE_TIERS = {
  initial: {
    id: 'initial',
    paystackTier: 'initial',
    amountGhs: 800,
    num: '01',
    eyebrow: 'NEW CLIENTS',
    badge: 'Most Popular',
    title: 'Initial Consultation',
    shortDesc: 'Full assessment & tailored Ghanaian meal plan',
    priceDisplay: 'GH₵ 800',
    originalPriceDisplay: 'GH₵ 1,000',
    durationLabel: '45-min 1-on-1 · One-time',
    analyticsItemName: 'Initial Consultation',
    analyticsCategory: 'Clinical Nutrition Consultation',
    fallbackUrl: 'https://paystack.shop/pay/bookdee',
    inclusions: [
      'Comprehensive clinical & dietary assessment',
      'Personalized Ghanaian meal plan & portions',
      'Food diary setup & written care summary'
    ]
  },
  followup: {
    id: 'followup',
    paystackTier: 'followup',
    amountGhs: 400,
    num: '02',
    eyebrow: 'RETURNING CLIENTS',
    title: 'Follow-Up Session',
    shortDesc: 'Progress check-in & meal plan adjustments',
    priceDisplay: 'GH₵ 400',
    originalPriceDisplay: null,
    durationLabel: '25-min 1-on-1 · Returning clients',
    analyticsItemName: 'Follow-Up Session',
    analyticsCategory: 'Clinical Nutrition Consultation',
    fallbackUrl: 'https://paystack.shop/pay/follow-up',
    inclusions: [
      'Progress, weight & symptom review',
      'Meal plan & portion adjustments',
      '1-on-1 personalized nutrition counselling'
    ]
  },
  custom: {
    id: 'custom',
    num: '03',
    eyebrow: 'BESPOKE CARE',
    title: 'Custom & Specialist Care',
    shortDesc: 'Clinical conditions, families, or corporate',
    description:
      'Need ongoing clinical nutrition care, family/couples coaching, or corporate wellness? Tell us what you need and our team will reply with a recommended structure and fee.',
    topics: [
      'Clinical / Medical Nutrition',
      'Family / Couples Plan',
      'Corporate Wellness',
      'Ongoing Care Bundle'
    ],
    messagePlaceholder: 'Share your clinical goals, family size, or corporate event details...',
    callout: {
      title: 'Managing Type 2 diabetes or blood sugar?',
      subtitle: 'Explore our specialized OnTrack Diabetes Care package (GH₵ 600 initial).',
      linkText: 'View OnTrack',
      to: '/ontrack'
    }
  }
};

const ContactUs = () => {
  const location = useLocation();
  const { user, userProfile } = useAuth();

  const [isFullyBooked, setIsFullyBooked] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [bookingSettings, setBookingSettings] = useState(null);
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);
  const [hasRevealedPricing, setHasRevealedPricing] = useState(() => {
    const tierParam = new URLSearchParams(location.search).get('tier');
    return Boolean(tierParam && ['initial', 'followup', 'custom'].includes(tierParam));
  });

  const initialTier = (() => {
    const tierParam = new URLSearchParams(location.search).get('tier');
    return tierParam && ['initial', 'followup', 'custom'].includes(tierParam) ? tierParam : null;
  })();

  const storedTestResults = getStoredTestResults();
  const profileComputed = computeResultsFromProfile(userProfile);
  const userResults =
    location.state?.userResults || profileComputed || storedTestResults || DEFAULT_USER_RESULTS;

  const hasCalculatedResults = !!(
    location.state?.userResults ||
    profileComputed ||
    (storedTestResults?.bmi && storedTestResults.bmi !== 0)
  );

  const checkAvailability = async () => {
    safeLogEvent('add_shipping_info', {
      value: 800,
      currency: 'GHS'
    });

    try {
      const result = await getBookingSettings();
      if (result.success) {
        setIsOffline(false);
        setBookingSettings(result.settings);
        setIsFullyBooked(!result.settings.isOpen);
      } else {
        console.warn('Booking check failed:', result.error);
        setIsOffline(true);
      }
    } catch (error) {
      console.error('Error checking booking status:', error);
      setIsOffline(true);
    }
  };

  useEffect(() => {
    checkAvailability();
  }, []);

  if (isOffline) {
    return <Offline onRetry={checkAvailability} />;
  }

  if (isFullyBooked) {
    return <FullyBooked />;
  }

  return (
    <>
      <SEO
        title="Book a Consultation | DietWithDee Clinical Nutrition"
        description="Book your private 1-on-1 clinical nutrition consultation with Registered Dietitian Nana Ama Dwamena. Tailored Ghanaian meal plans and secure Paystack checkout."
        keywords="Contact DietWithDee, Book Consultation, Ghana Dietitian, Nana Ama Dwamena, Nutrition Advice"
        image="https://dietwithdee.org/LOGO.webp"
        url="https://dietwithdee.org/contactUs"
      />

      <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-montserrat pt-[76px] sm:pt-28 pb-28 selection:bg-[#F6841F] selection:text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-8">
          {/* 1. PRE-PRICING EDITORIAL WRITE-UP */}
          <header className="space-y-2.5 sm:space-y-4">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
              1-ON-1 CLINICAL NUTRITION
            </p>

            <h1 className="text-[28px] sm:text-5xl font-serif-cormorant font-normal text-stone-900 leading-[1.08] tracking-tight">
              Evidence-based care, built around your real life.
            </h1>

            <p className="text-sm sm:text-base text-stone-700 font-normal leading-relaxed max-w-2xl">
              Every consultation is led by yours truly,{' '}
              <strong className="font-semibold text-stone-900">Nana Ama Dwamena, RD</strong>. Rather
              than generic templates, we review your health history, daily routine, and meals to
              build a practical, sustainable plan.
            </p>
          </header>

          {/* 2. ATTACHED PROFILE + CLINICAL LEDGER ACCORDION */}
          <ConsultationLedger
            tiers={CONTACT_CARE_TIERS}
            bookingSettings={bookingSettings}
            user={user}
            userProfile={userProfile}
            userResults={userResults}
            hasCalculatedResults={hasCalculatedResults}
            initialTier={initialTier}
            source="contact_us"
            inquiryAnalyticsSource="contact_us_tier_03"
            onOpenWhatsApp={() => setShowWhatsAppPopup(true)}
            onTierRevealed={() => setHasRevealedPricing(true)}
          />

          {/* 3. HOW BOOKING WORKS + QUIET DIRECT CONTACT FOOTER */}
          <footer className="space-y-6 pt-2">
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-200/80 pt-5">
              {!hasRevealedPricing ? (
                <>
                  <strong className="font-semibold text-stone-800">How booking works:</strong> Tap a
                  tier, fill your contact details once, pay securely via Paystack (MTN MoMo,
                  Telecel, AT, or Card), and receive instant email confirmation plus personal
                  scheduling.
                </>
              ) : (
                <>
                  Not sure which tier fits? Review{' '}
                  <strong className="font-semibold text-emerald-800">Tier 03</strong> above to send
                  a quick note and we will guide you.
                </>
              )}
            </p>

            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <h2 className="text-lg sm:text-xl font-serif-cormorant font-medium text-stone-900">
                  Prefer to ask a quick question first?
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-stone-600">
                  <a
                    href="mailto:dietwdee@gmail.com"
                    className="inline-flex items-center gap-1.5 hover:text-stone-900 transition-colors"
                  >
                    <Mail size={14} className="text-emerald-700" />
                    <span>dietwdee@gmail.com</span>
                  </a>
                  <a
                    href="tel:+233592330870"
                    className="inline-flex items-center gap-1.5 hover:text-stone-900 transition-colors"
                  >
                    <Phone size={14} className="text-emerald-700" />
                    <span>(+233) 59 233 0870</span>
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowWhatsAppPopup(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border-none shrink-0"
              >
                <MessageCircle size={15} />
                <span>Chat on WhatsApp</span>
              </button>
            </div>
          </footer>

          {/* 4. SWIPING CLIENT TESTIMONIALS (aligned cleanly inside Book a Session ledger container) */}
          <TestimonialsCarousel
            id="consultation-testimonials"
            compact
            className="pt-8 border-t border-stone-200/80"
          />
        </div>
      </div>

      <WhatsAppPopup
        isOpen={showWhatsAppPopup}
        onClose={() => setShowWhatsAppPopup(false)}
        onConfirm={() => {
          safeLogEvent('contact', { method: 'WhatsApp' });
          window.open(
            'https://wa.me/233592330870?text=Hello%2C%20I%E2%80%99d%20like%20to%20book%20a%20session%20with%20Diet%20with%20Dee',
            '_blank',
            'noopener,noreferrer'
          );
          setShowWhatsAppPopup(false);
        }}
      />
    </>
  );
};

export default ContactUs;
