import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEO from '../../Components/SEO';
import {
  ShieldCheck,
  ChevronDown,
  Activity,
  HeartHandshake,
  UtensilsCrossed,
  ArrowRight,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { safeLogEvent } from '../../firebaseConfig';
import { getBookingSettings, DEFAULT_BOOKING_SETTINGS } from '../../firebaseBookingUtils';
import diabetesPromo from '../../assets/diabetes.jpg';
import homeHeroImg from '../../assets/images/homeimg1.jpg';
import OnTrackModal from '../../Components/OnTrackModal';
import WhatsAppPopup from '../../Components/WhatsAppPopup';
import ConsultationLedger from '../../Components/ConsultationLedger';
import FullyBooked from '../FullyBooked/FullyBooked';
import {
  computeResultsFromProfile,
  getStoredTestResults,
  DEFAULT_USER_RESULTS
} from '../../utils/bookingProfile';
import { useClientCount } from '../../utils/clientStats';

// Configurable Paystack checkout fallback links for OnTrack consultations
export const PAYSTACK_ONTRACK_INITIAL_URL = 'https://paystack.shop/pay/ontrackbook';
export const PAYSTACK_ONTRACK_FOLLOWUP_URL = 'https://paystack.shop/pay/ontrackfollow';

const ONTRACK_CARE_TIERS = {
  initial: {
    id: 'initial',
    paystackTier: 'ontrack_initial',
    amountGhs: 600,
    num: '01',
    eyebrow: 'NEW CLIENTS',
    badge: 'Most Popular',
    title: 'Initial Deep-Dive Assessment',
    shortDesc: 'Medical & diet history, A1c review, and custom Ghanaian meal plan',
    priceDisplay: 'GH₵ 600',
    originalPriceDisplay: 'GH₵ 800',
    durationLabel: '45-min 1-on-1 · One-time',
    analyticsItemName: 'OnTrack Diabetes Initial Consultation',
    analyticsCategory: 'Diabetes Medical Nutrition Therapy',
    fallbackUrl: PAYSTACK_ONTRACK_INITIAL_URL,
    inclusions: [
      'Detailed A1c & medication examination',
      'Tailored Ghanaian meal plan & carb portions',
      'Direct OnTrack app target calibration'
    ]
  },
  followup: {
    id: 'followup',
    paystackTier: 'ontrack_followup',
    amountGhs: 300,
    num: '02',
    eyebrow: 'RETURNING CLIENTS',
    title: 'Follow-Up Accountability',
    shortDesc: 'Fasting sugar logs review, portion tweaks & craving fixes',
    priceDisplay: 'GH₵ 300',
    originalPriceDisplay: 'GH₵ 400',
    durationLabel: '25-min 1-on-1 · Returning clients',
    analyticsItemName: 'OnTrack Diabetes Follow-Up Consultation',
    analyticsCategory: 'Diabetes Medical Nutrition Therapy',
    fallbackUrl: PAYSTACK_ONTRACK_FOLLOWUP_URL,
    inclusions: [
      'Fasting sugar logs & glucose trend analysis',
      'Portion adjustments & craving fixes',
      'Ongoing WhatsApp support & check-in'
    ]
  },
  custom: {
    id: 'custom',
    num: '03',
    eyebrow: 'BESPOKE CARE',
    title: 'Custom & Family Diabetes Care',
    shortDesc: 'Senior parents, Type 1 care, gestational diabetes, or bundles',
    description:
      'Booking on behalf of an aging parent, managing gestational or Type 1 diabetes, or looking for a multi-session glycemic care bundle? Send a quick note and we will recommend the right care plan.',
    topics: [
      'Type 2 & A1c Care',
      'Senior / Aging Parent',
      'Type 1 / Child & Teen',
      'Gestational Diabetes'
    ],
    messagePlaceholder:
      'Share current blood sugar readings, medications (e.g. Metformin/insulin), or who you are booking for...',
    callout: {
      title: 'Looking for general wellness or weight consultations?',
      subtitle: 'Book our standard 1-on-1 clinical nutrition consultations instead.',
      linkText: 'View Standard Care',
      to: '/contactUs'
    }
  }
};

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
        <div
          className={`w-7 h-7 shrink-0 rounded-full border border-stone-200 flex items-center justify-center text-xs transition-transform duration-300 ${
            open ? 'bg-[#F6841F] text-white rotate-180 border-[#F6841F]' : 'bg-stone-50 text-stone-600'
          }`}
        >
          <ChevronDown size={15} />
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm sm:text-base text-stone-700 font-normal leading-relaxed border-t border-stone-100 pt-3">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

const OnTrack = () => {
  const clientCount = useClientCount();
  const location = useLocation();
  const { user, userProfile } = useAuth();
  const bookingSectionRef = useRef(null);

  const [bookingSettings, setBookingSettings] = useState(DEFAULT_BOOKING_SETTINGS);
  const [isFullyBooked, setIsFullyBooked] = useState(false);
  const [showOnTrackModal, setShowOnTrackModal] = useState(false);
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);

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

  // Log page view analytics & fetch live booking/calendar availability
  useEffect(() => {
    safeLogEvent('view_promotion', {
      promotion_id: 'ontrack_diabetes_consultation',
      promotion_name: 'OnTrack Brand Diabetes Consultation Page',
      location_id: 'ontrack_page'
    });

    const loadBookingSettings = async () => {
      try {
        const result = await getBookingSettings();
        if (result.success) {
          setBookingSettings(result.settings);
          setIsFullyBooked(!result.settings.isOpen);
        }
      } catch (err) {
        console.warn('Could not fetch booking settings on OnTrack page:', err);
      }
    };
    loadBookingSettings();
  }, []);

  const scrollToBooking = () => {
    bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isFullyBooked) {
    return <FullyBooked />;
  }

  return (
    <>
      <SEO
        title="OnTrack Diabetes Nutrition Consultation | DietWithDee"
        description="Stabilize blood sugar and lower A1c without giving up local foods. 1-on-1 Clinical Dietitian consultations with Nana Ama Dwamena for Type 2 diabetes & pre-diabetes."
        keywords="Diabetes Dietitian Ghana, Lower Blood Sugar, Type 2 Diabetes Meal Plan, Nana Ama Dwamena, OnTrack Consultation, A1c Reduction Ghana"
        image="https://dietwithdee.org/LOGO.webp"
        url="https://dietwithdee.org/ontrack"
      />

      <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-montserrat selection:bg-[#F6841F] selection:text-white pt-[76px] sm:pt-24 pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 md:space-y-20">
          {/* ============================================================== */}
          {/* 1. HERO SECTION                                                */}
          {/* ============================================================== */}
          <section className="pt-2 sm:pt-4 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Column: Brand Typography & Primary CTAs */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif-cormorant font-normal text-stone-900 tracking-tight leading-[1.12]">
                  Blood sugar on track. <br className="hidden sm:inline" />
                  <span className="text-[#F6841F] font-medium">Without starving.</span>
                </h1>

                <div className="w-16 h-1 bg-[#F6841F] mt-2"></div>

                <p className="text-stone-800 font-normal text-base sm:text-lg leading-relaxed max-w-xl pt-1">
                  Stop fearing every meal or surviving on plain cabbage. Work 1-on-1 with Registered
                  Dietitian <strong className="font-semibold text-stone-900">Nana Ama Dwamena</strong>{' '}
                  to stabilize your glucose spikes and lower your A1c—without giving up the Ghanaian
                  dishes you love.
                </p>
              </div>

              {/* Symmetrical CTA Cluster */}
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
                <button
                  type="button"
                  onClick={scrollToBooking}
                  className="px-8 sm:px-9 py-3.5 sm:py-4 rounded-full bg-[#F6841F] hover:bg-[#e07312] text-white font-montserrat text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center justify-center gap-2 border-none"
                >
                  <span>Book Consultation</span>
                  <ChevronRight size={16} />
                </button>

                <div className="flex items-center justify-center sm:justify-start gap-3 px-5 py-3 rounded-full bg-white/80 backdrop-blur-md border border-stone-200/80 shadow-xs">
                  <div className="flex text-amber-500 text-sm">{'★'.repeat(5)}</div>
                  <span className="text-xs sm:text-sm font-semibold text-stone-800">
                    5.0 Rating • {clientCount}+ Clients Guided
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Natural Warm Portrait Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm sm:max-w-md relative">
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
                    <p className="text-xs sm:text-sm text-stone-600 font-normal tracking-wide">
                      Founder, DietWithDee • Licensed Clinical Dietitian
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* 2. STATS SECTION                                               */}
          {/* ============================================================== */}
          <section className="bg-white/80 backdrop-blur-md border border-stone-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-bold font-montserrat text-[#F6841F]">
                  94%
                </div>
                <div className="text-xs sm:text-sm font-semibold text-stone-900">
                  Lower Fasting Glucose
                </div>
                <div className="text-xs text-stone-600 font-normal hidden sm:block">
                  Within 4 weeks of protocol
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-bold font-montserrat text-emerald-700">
                  1-on-1
                </div>
                <div className="text-xs sm:text-sm font-semibold text-stone-900">
                  Private Dietitian Care
                </div>
                <div className="text-xs text-stone-600 font-normal hidden sm:block">
                  Direct virtual consultation
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-bold font-montserrat text-stone-900">
                  0
                </div>
                <div className="text-xs sm:text-sm font-semibold text-stone-900">
                  Starvation Diets
                </div>
                <div className="text-xs text-stone-600 font-normal hidden sm:block">
                  No restrictive food guilt
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-bold font-montserrat text-[#F6841F]">
                  35+
                </div>
                <div className="text-xs sm:text-sm font-semibold text-stone-900">
                  Ghanaian Meal Guides
                </div>
                <div className="text-xs text-stone-600 font-normal hidden sm:block">
                  Adapted to your kitchen
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* 3. HOW WE GET YOUR BLOOD SUGAR ON TRACK                        */}
          {/* ============================================================== */}
          <section className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-4xl font-serif-cormorant font-normal text-stone-900 tracking-tight">
                How We Get Your Blood Sugar On Track
              </h2>
              <div className="w-12 h-0.5 bg-[#F6841F] mx-auto"></div>
              <p className="text-sm sm:text-base text-stone-700 font-normal pt-1">
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
                  <h3 className="text-lg font-bold font-montserrat text-stone-900">
                    Smart Carb Mapping
                  </h3>
                  <p className="text-sm text-stone-700 font-normal leading-relaxed">
                    Learn the exact starch portions (plantain, yam, brown rice, banku) and food
                    pairings that prevent rapid post-meal sugar spikes.
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
                  <h3 className="text-lg font-bold font-montserrat text-stone-900">
                    Synced with the{' '}
                    <button
                      type="button"
                      onClick={() => setShowOnTrackModal(true)}
                      className="font-bold underline text-stone-900 hover:text-emerald-700 transition-colors inline cursor-pointer text-left decoration-emerald-500 decoration-2 underline-offset-2 bg-transparent border-none p-0"
                      title="Learn more about OnTrack App"
                    >
                      OnTrack App
                    </button>
                  </h3>
                  <p className="text-sm text-stone-700 font-normal leading-relaxed">
                    Log your meals, blood glucose readings, and medications inside the{' '}
                    <button
                      type="button"
                      onClick={() => setShowOnTrackModal(true)}
                      className="font-bold underline text-stone-900 hover:text-emerald-700 transition-colors inline cursor-pointer text-left decoration-emerald-500 decoration-1.5 underline-offset-2 bg-transparent border-none p-0"
                      title="Learn more about OnTrack App"
                    >
                      OnTrack app
                    </button>
                    . Your dietitian reviews your trends in real time to provide timely adjustments
                    and keep your sugars stable.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOnTrackModal(true)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center justify-between pt-2 border-t border-stone-100 w-full text-left cursor-pointer group bg-transparent border-x-0 border-b-0"
                >
                  <span>Continuous Tracking with OnTrack</span>
                  <ArrowRight
                    size={13}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </div>

              {/* Pillar 3 */}
              <div className="bg-white/90 backdrop-blur-sm border border-stone-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
                    <UtensilsCrossed size={22} />
                  </div>
                  <h3 className="text-lg font-bold font-montserrat text-stone-900">
                    The Local Plate Method
                  </h3>
                  <p className="text-sm text-stone-700 font-normal leading-relaxed">
                    No expensive foreign foods. Master mouthwatering Ghanaian dishes with fiber-rich
                    greens, healthy fats, and high-satiety proteins.
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
                  <h3 className="text-lg font-bold font-montserrat text-stone-900">
                    WhatsApp Guidance
                  </h3>
                  <p className="text-sm text-stone-700 font-normal leading-relaxed">
                    Direct access to Nana Ama. Snap photos of your plate, log your readings inside
                    OnTrack, and get timely feedback when cravings hit.
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
          {/* 4. CLINICAL LEDGER BOOKING FLOW (Single-Step Paystack)          */}
          {/* ============================================================== */}
          <section ref={bookingSectionRef} id="booking-section" className="scroll-mt-24">
            <div className="max-w-3xl mx-auto space-y-5 sm:space-y-7">
              <header className="space-y-2.5 sm:space-y-3">
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
                  1-ON-1 DIABETES NUTRITION
                </p>
                <h2 className="text-[28px] sm:text-4xl font-serif-cormorant font-normal text-stone-900 leading-[1.08] tracking-tight">
                  Book your OnTrack clinical consultation.
                </h2>
                <p className="text-sm sm:text-base text-stone-700 font-normal leading-relaxed">
                  Every consultation is led by yours truly,{' '}
                  <strong className="font-semibold text-stone-900">Nana Ama Dwamena, RD</strong>. We
                  review your glucose trends, medications, and everyday Ghanaian meals to stabilize
                  blood sugar sustainably.
                </p>
              </header>

              <ConsultationLedger
                tiers={ONTRACK_CARE_TIERS}
                bookingSettings={bookingSettings}
                user={user}
                userProfile={userProfile}
                userResults={userResults}
                hasCalculatedResults={hasCalculatedResults}
                initialTier={initialTier}
                source="ontrack"
                isOntrack
                inquiryAnalyticsSource="ontrack_tier_03"
                placeholders={{
                  name: 'e.g. Kwame Mensah',
                  message: 'Current readings, medications (e.g. Metformin), or goals...'
                }}
                onOpenWhatsApp={() => setShowWhatsAppPopup(true)}
              />
            </div>
          </section>

          {/* ============================================================== */}
          {/* 5. SELF-GUIDED OPTION                                          */}
          {/* ============================================================== */}
          <section className="bg-white/80 backdrop-blur-md border border-stone-200/90 rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-center shadow-xs">
            <div className="max-w-xl mx-auto space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200/70 text-[#F6841F] rounded-full text-xs font-semibold uppercase tracking-wider">
                Self-Guided Option
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif-cormorant font-normal text-stone-900 leading-snug">
                Prefer a self-guided meal guide?
              </h3>
              <p className="text-sm sm:text-base text-stone-700 font-normal leading-relaxed">
                Explore our comprehensive{' '}
                <strong className="font-semibold text-stone-900">Blood Sugar Balance Plan</strong>{' '}
                crafted specifically for Type 2 diabetes management with local Ghanaian staples.
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
          {/* 6. SOCIAL PROOF & FAQ                                          */}
          {/* ============================================================== */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-orange-50 text-[#F6841F] text-[11px] font-semibold uppercase tracking-wider rounded-full">
                  Client Story
                </span>
                <div className="flex text-amber-500 text-sm">★★★★★</div>
              </div>

              <blockquote className="text-base sm:text-lg font-serif-cormorant font-normal text-stone-900 leading-snug italic">
                “My doctor was surprised at my last quarterly review. My fasting sugar dropped from
                11.2 to 6.1 mmol/L. Nana Ama taught me how to enjoy banku and kontomire without
                spikes. I don’t feel deprived at all.”
              </blockquote>

              <div className="pt-2 border-t border-stone-100">
                <p className="font-bold text-stone-900 text-sm font-montserrat">Kwame A., 54</p>
                <p className="text-xs sm:text-sm text-stone-600 font-normal">
                  Accra • Type 2 Diabetes Management
                </p>
              </div>
            </div>

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
          {/* 7. DIABETES PROGRAM VISUAL SHOWCASE                            */}
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

      <OnTrackModal isOpen={showOnTrackModal} onClose={() => setShowOnTrackModal(false)} />

      <WhatsAppPopup
        isOpen={showWhatsAppPopup}
        onClose={() => setShowWhatsAppPopup(false)}
        onConfirm={() => {
          safeLogEvent('contact', { method: 'WhatsApp', source: 'ontrack' });
          window.open(
            'https://wa.me/233592330870?text=Hello%2C%20I%E2%80%99d%20like%20to%20inquire%20about%20OnTrack%20Diabetes%20Care%20with%20Diet%20with%20Dee',
            '_blank',
            'noopener,noreferrer'
          );
          setShowWhatsAppPopup(false);
        }}
      />
    </>
  );
};

export default OnTrack;
