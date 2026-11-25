import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { FcGoogle } from 'react-icons/fc';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  FileText,
  ArrowRight,
  LogOut,
  Trash2,
  RefreshCw,
  Link2,
  ShieldCheck,
  Clock,
  Activity,
  CheckCircle2,
  Loader2,
  MessageSquarePlus,
  Star
} from 'lucide-react';
import SEO from '../../Components/SEO';
import SafeImage from '../../Components/SafeImage';
import MyJourneySkeleton from './components/Skeleton';
import SessionCard from './components/SessionCard';
import AssessmentsSection from './components/AssessmentsSection';
import PortalArticlesSection from './components/PortalArticlesSection';
import { useAuth } from '../../AuthContext';
import { useWebHaptics } from 'web-haptics/react';
import { functions, safeLogEvent } from '../../firebaseConfig';
import { deleteOwnAccount } from '../../firebaseUtils';
import {
  computeResultsFromProfile,
  getStoredTestResults,
  DEFAULT_USER_RESULTS
} from '../../utils/bookingProfile';

const formatInquiryDate = (iso) => {
  if (!iso) return 'Recently';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return 'Recently';
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

function MyJourney() {
  const navigate = useNavigate();
  const { user, userProfile, loading, signInWithGoogle, signOut } = useAuth();
  const { trigger } = useWebHaptics();

  const [signingIn, setSigningIn] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [emailAssessments, setEmailAssessments] = useState([]);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState('');

  // Link booking made with another email
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkRef, setLinkRef] = useState('');
  const [linkPhoneLast4, setLinkPhoneLast4] = useState('');
  const [linkingBooking, setLinkingBooking] = useState(false);
  const [linkFeedback, setLinkFeedback] = useState(null);

  // Account actions
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadCarePortal = useCallback(async () => {
    if (!user || !functions) return;
    setPortalLoading(true);
    setPortalError('');
    try {
      const getCarePortalFn = httpsCallable(functions, 'getMyCarePortal');
      const result = await getCarePortalFn();
      if (result.data?.success) {
        setBookings(result.data.bookings || []);
        setInquiries(result.data.inquiries || []);
        setEmailAssessments(result.data.emailAssessments || []);
      }
    } catch (err) {
      console.error('Failed to load consultation portal:', err);
      setPortalError('Unable to load your consultations right now. Please tap refresh or try again shortly.');
    } finally {
      setPortalLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadCarePortal();
    } else {
      setBookings([]);
      setInquiries([]);
      setEmailAssessments([]);
      setPortalError('');
    }
  }, [user, loadCarePortal]);

  const handleGoogleSignIn = async () => {
    trigger('success');
    setSigningIn(true);
    try {
      const signedInUser = await signInWithGoogle();
      if (signedInUser) {
        safeLogEvent('login', { method: 'Google' });
      }
    } catch (err) {
      console.error('Sign-in failed:', err);
      if (err.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        alert(`Security Block: The domain "${domain}" is not authorized for sign-in yet.`);
      } else if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        alert(`Sign in unavailable: ${err.message || 'Please try again later.'}`);
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleLinkBooking = async (e) => {
    e.preventDefault();
    if (!linkRef.trim() || linkPhoneLast4.replace(/\D/g, '').length < 4) {
      setLinkFeedback({
        type: 'error',
        text: 'Enter your Paystack reference and the last 4 digits of your booking phone number.'
      });
      return;
    }

    setLinkingBooking(true);
    setLinkFeedback(null);
    try {
      const linkFn = httpsCallable(functions, 'linkBookingByReference');
      const res = await linkFn({
        reference: linkRef.trim(),
        phoneLast4: linkPhoneLast4.trim()
      });

      if (res.data?.success && res.data.booking) {
        setBookings((prev) => {
          const exists = prev.some((b) => b.id === res.data.booking.id);
          return exists ? prev : [res.data.booking, ...prev];
        });
        setLinkFeedback({
          type: 'success',
          text: 'Booking linked to your account.'
        });
        setLinkRef('');
        setLinkPhoneLast4('');
      } else {
        setLinkFeedback({
          type: 'error',
          text: res.data?.message || 'Could not match that booking reference.'
        });
      }
    } catch (err) {
      setLinkFeedback({
        type: 'error',
        text: err.message || 'Could not link booking right now.'
      });
    } finally {
      setLinkingBooking(false);
    }
  };

  const bookingProfilePayload = useMemo(() => {
    return computeResultsFromProfile(userProfile) || getStoredTestResults() || DEFAULT_USER_RESULTS;
  }, [userProfile]);

  const navigateToBooking = (targetPath = '/contactUs') => {
    trigger('success');
    navigate(targetPath, {
      state: {
        userResults: bookingProfilePayload
      }
    });
  };

  const activeBookings = useMemo(
    () => bookings.filter((b) => b.status !== 'completed' && b.status !== 'cancelled'),
    [bookings]
  );

  const pastBookings = useMemo(
    () => bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled'),
    [bookings]
  );

  const firstName = user?.displayName?.split(' ')[0] || 'there';

  return (
    <>
      <SEO
        title="My Journey | Client Care Portal | DietWithDee"
        description="Track your 1-on-1 nutrition consultations with Nana Ama Dwamena, view scheduled dates and care summaries, and review your auto-saved KnowYourBody assessments."
        keywords="DietWithDee Client Portal, Track Nutrition Session, My Journey Ghana, Nana Ama Dwamena Consultations"
        url="https://dietwithdee.org/my-journey"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'My Journey - Client Care Portal',
          description: 'Track consultations with DietWithDee and view saved health assessments.',
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://dietwithdee.org' },
              { '@type': 'ListItem', position: 2, name: 'My Journey', item: 'https://dietwithdee.org/my-journey' }
            ]
          }
        }}
      />

      <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-montserrat pt-[84px] sm:pt-28 pb-20">
        {loading && <MyJourneySkeleton />}

        {/* ===== GUEST VIEW ===== */}
        {!user && !loading && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10">
            <div className="text-center space-y-3 pt-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-800">
                Client Care Portal
              </p>
              <h1 className="text-3xl sm:text-5xl font-serif-cormorant font-normal text-stone-900 tracking-tight">
                Your sessions &amp; care history, in one place.
              </h1>
              <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
                Follow your 1-on-1 consultations with Registered Dietitian Nana Ama Dwamena, view confirmed times and care notes, and keep every KnowYourBody assessment saved automatically.
              </p>
            </div>

            {/* Google Sign-In Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm max-w-md mx-auto text-center space-y-5">
              <div className="space-y-1.5">
                <h2 className="text-xl font-serif-cormorant font-semibold text-stone-900">
                  Sign in to My Journey
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Use the Google email you used when booking so your consultations load automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={signingIn || loading}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#F6841F] hover:bg-[#e07312] text-white font-bold text-sm sm:text-base shadow-sm transition-colors flex items-center justify-center gap-3 cursor-pointer border-none disabled:opacity-60"
              >
                {signingIn ? (
                  <Loader2 size={18} className="animate-spin text-white" />
                ) : (
                  <FcGoogle size={22} className="bg-white rounded-full p-0.5 shrink-0" />
                )}
                <span>{signingIn ? 'Signing in...' : 'Continue with Google'}</span>
              </button>

              <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs font-semibold text-stone-600">
                <button
                  type="button"
                  onClick={() => navigate('/knowyourbody')}
                  className="hover:text-emerald-800 transition-colors cursor-pointer bg-transparent border-none"
                >
                  Take KnowYourBody Test →
                </button>
                <span className="hidden sm:inline text-stone-300">·</span>
                <button
                  type="button"
                  onClick={() => navigate('/contactUs')}
                  className="hover:text-emerald-800 transition-colors cursor-pointer bg-transparent border-none"
                >
                  Book a Consultation →
                </button>
              </div>
            </div>

            {/* Accurate 3-pillar Value Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: <Calendar size={18} className="text-emerald-700" />,
                  title: 'Track Session Status',
                  desc: 'See when payment is confirmed, when your session date is locked in, and when follow-ups are due.'
                },
                {
                  icon: <FileText size={18} className="text-[#e07312]" />,
                  title: 'Care Notes & Guides',
                  desc: 'Review consultation summaries, meal plan links, and what metrics you shared for each appointment.'
                },
                {
                  icon: <Activity size={18} className="text-emerald-700" />,
                  title: 'Auto-Saved Assessments',
                  desc: 'Every KnowYourBody test you run while signed in saves automatically and attaches to new bookings.'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/90 rounded-2xl p-5 border border-stone-200/80 space-y-2"
                >
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <h3 className="text-sm font-bold text-stone-900">{item.title}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== AUTHENTICATED CLIENT CARE PORTAL ===== */}
        {user && !loading && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
            {/* Portal Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-800">
                  Client Care Portal
                </p>
                <h1 className="text-3xl sm:text-4xl font-serif-cormorant font-normal text-stone-900 tracking-tight">
                  Welcome back, {firstName}
                </h1>
                <p className="text-xs sm:text-sm text-stone-600">
                  Signed in as <span className="font-semibold text-stone-800">{user.email}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={loadCarePortal}
                  disabled={portalLoading}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw size={13} className={portalLoading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateToBooking('/contactUs')}
                  className="px-4 py-2.5 rounded-xl bg-[#F6841F] hover:bg-[#e07312] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer border-none"
                >
                  <Calendar size={14} />
                  <span>Book Consultation</span>
                </button>
              </div>
            </div>

            {/* SECTION 1: SESSIONS WITH DEE */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-serif-cormorant font-semibold text-stone-900">
                    Your Sessions with Dee
                  </h2>
                  <p className="text-xs text-stone-500">
                    Live consultation status, confirmed session dates, and follow-up actions.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowLinkForm((prev) => !prev);
                    setLinkFeedback(null);
                  }}
                  className="self-start sm:self-auto text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 bg-transparent border-none cursor-pointer"
                >
                  <Link2 size={13} />
                  <span>Booked with another email?</span>
                </button>
              </div>

              {/* Link Booking Helper */}
              {showLinkForm && (
                <form
                  onSubmit={handleLinkBooking}
                  className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 space-y-3 shadow-2xs"
                >
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      Link a Booking by Paystack Reference
                    </h3>
                    <p className="text-xs text-stone-600">
                      If you checked out with a different email, enter your Paystack reference (from your receipt email) and the last 4 digits of your booking phone number.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      value={linkRef}
                      onChange={(e) => setLinkRef(e.target.value)}
                      placeholder="Paystack reference (e.g. T123...)"
                      className="px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-emerald-600"
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={linkPhoneLast4}
                      onChange={(e) => setLinkPhoneLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="Last 4 digits of phone"
                      className="px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="submit"
                      disabled={linkingBooking}
                      className="px-4 py-2.5 rounded-xl bg-[#1F4E36] hover:bg-[#173c29] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer border-none disabled:opacity-60"
                    >
                      {linkingBooking ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      <span>{linkingBooking ? 'Checking...' : 'Link Session'}</span>
                    </button>
                  </div>
                  {linkFeedback && (
                    <p
                      className={`text-xs font-medium ${
                        linkFeedback.type === 'success' ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {linkFeedback.text}
                    </p>
                  )}
                </form>
              )}

              {portalError && (
                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs sm:text-sm text-rose-800 flex items-center justify-between gap-3">
                  <span>{portalError}</span>
                  <button
                    type="button"
                    onClick={loadCarePortal}
                    className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 font-semibold text-xs text-rose-700 cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {portalLoading && bookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200/80 p-6 animate-pulse space-y-4">
                  <div className="h-5 w-48 bg-stone-200 rounded" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="h-16 bg-stone-100 rounded-xl" />
                    <div className="h-16 bg-stone-100 rounded-xl" />
                    <div className="h-16 bg-stone-100 rounded-xl" />
                  </div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 text-center space-y-4 shadow-2xs">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Calendar size={20} />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h3 className="text-lg sm:text-xl font-serif-cormorant font-semibold text-stone-900">
                      No sessions found under {user.email}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      When you book a 1-on-1 session using this email (or link an existing booking with your reference above), it will appear here with live scheduling updates.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => navigateToBooking('/contactUs')}
                      className="px-5 py-2.5 rounded-xl bg-[#F6841F] hover:bg-[#e07312] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer border-none"
                    >
                      <span>Book Initial Consultation</span>
                      <ArrowRight size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateToBooking('/ontrack')}
                      className="px-5 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Diabetes / OnTrack Care
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Active / Upcoming Sessions first */}
                  {activeBookings.map((booking, idx) => (
                    <SessionCard
                      key={booking.id}
                      booking={booking}
                      isFeatured={idx === 0}
                      onBookFollowUp={(path) => navigateToBooking(path)}
                      onUpdateAssessment={() => navigate('/knowyourbody')}
                    />
                  ))}

                  {/* Completed / Past Sessions */}
                  {pastBookings.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {activeBookings.length > 0 && (
                        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                          Past Sessions ({pastBookings.length})
                        </p>
                      )}
                      {pastBookings.map((booking, idx) => (
                        <SessionCard
                          key={booking.id}
                          booking={booking}
                          isFeatured={activeBookings.length === 0 && idx === 0}
                          onBookFollowUp={(path) => navigateToBooking(path)}
                          onUpdateAssessment={() => navigate('/knowyourbody')}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tier 03 Custom & Specialist Care Inquiries */}
              {inquiries.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Custom Care Inquiries ({inquiries.length})
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {inquiries.map((inq) => (
                      <div
                        key={inq.id}
                        className="bg-white rounded-2xl border border-stone-200/90 p-4 space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-stone-900">
                            {inq.inquiryTopic || 'Custom & Specialist Care'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                              inq.status === 'resolved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : inq.status === 'contacted'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-stone-100 text-stone-700 border-stone-200'
                            }`}
                          >
                            {inq.status || 'new'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                          {inq.message}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                          <Clock size={11} />
                          <span>Submitted {formatInquiryDate(inq.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* SECTION 2: AUTO-SAVED KNOWYOURBODY ASSESSMENTS */}
            <section className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-serif-cormorant font-semibold text-stone-900">
                  Saved Health Assessments
                </h2>
                <p className="text-xs text-stone-500">
                  Every KnowYourBody check you complete while signed in saves here automatically.
                </p>
              </div>
              <AssessmentsSection
                extraAssessments={emailAssessments}
                onRunAssessment={() => navigate('/knowyourbody')}
                onBookWithLatest={() => navigateToBooking('/contactUs')}
              />
            </section>

            {/* SECTION 3: CURATED NUTRITION ARTICLES */}
            <section>
              <PortalArticlesSection userProfile={userProfile} bookings={bookings} />
            </section>

            {/* SECTION 4: CLIENT TESTIMONIAL / REVIEW */}
            <section className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c96209]">
                  <Star size={14} className="text-[#F6841F] fill-[#F6841F]" />
                  <span>Share Your Experience</span>
                </div>
                <h2 className="text-lg sm:text-xl font-serif-cormorant font-semibold text-stone-900">
                  Leave a Client Testimonial
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Worked with Nana Ama Dwamena or tried a meal guide? Share how your consultations or KnowYourBody check helped — your story encourages others across Ghana.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const hasOntrack = bookings.some((b) => b.isOntrack);
                    const hasConsult = bookings.length > 0;
                    navigate('/submit-testimonial', {
                      state: {
                        prefill: {
                          name: user?.displayName || '',
                          email: user?.email || '',
                          plan: hasOntrack
                            ? 'ontrack-care'
                            : hasConsult
                            ? 'consultation'
                            : 'consultation'
                        }
                      }
                    });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#F6841F] hover:bg-[#e07312] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-none"
                >
                  <MessageSquarePlus size={15} />
                  <span>Add Your Testimonial</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/success-stories')}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Read Stories
                </button>
              </div>
            </section>

            {/* SECTION 5: ACCOUNT & PRIVACY */}
            <section className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                {user.photoURL ? (
                  <SafeImage
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-11 h-11 rounded-full border border-stone-200 object-cover shrink-0"
                    wrapperClassName="w-11 h-11 shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-stone-900 truncate">
                      {user.displayName || 'Client Account'}
                    </p>
                    <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-xs text-stone-500 truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    trigger('light');
                    setShowLogoutConfirm(true);
                  }}
                  className="px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    trigger('error');
                    setShowDeleteConfirm(true);
                  }}
                  className="px-4 py-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete Account</span>
                </button>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Sign-out Confirmation */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-11 h-11 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={20} className="text-stone-600" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-1.5">Sign Out?</h3>
              <p className="text-stone-600 text-xs sm:text-sm mb-6">
                Your sessions and saved assessments stay safely linked to your Google account.
              </p>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 bg-stone-100 text-stone-700 font-semibold rounded-xl hover:bg-stone-200 text-xs sm:text-sm cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    trigger('success');
                    setShowLogoutConfirm(false);
                    signOut();
                  }}
                  className="flex-1 py-2.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 text-xs sm:text-sm cursor-pointer border-none"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-11 h-11 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={20} className="text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-1.5">Delete Account?</h3>
              <p className="text-stone-600 text-xs sm:text-sm mb-6">
                This permanently deletes your profile and saved KnowYourBody assessments. Paid booking receipts remain archived for clinical records.
              </p>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 bg-stone-100 text-stone-700 font-semibold rounded-xl hover:bg-stone-200 text-xs sm:text-sm cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setDeleting(true);
                    try {
                      const result = await deleteOwnAccount();
                      if (result.success) {
                        localStorage.removeItem('pendingDeletion');
                        await signOut();
                      } else {
                        alert(result.error || 'Failed to delete account. Please try again.');
                      }
                    } catch (err) {
                      console.error('Delete failed:', err);
                      alert('Failed to delete account. Please try again.');
                      await signOut();
                    }
                    setDeleting(false);
                    setShowDeleteConfirm(false);
                  }}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 text-xs sm:text-sm cursor-pointer border-none disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    'Delete Forever'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MyJourney;
