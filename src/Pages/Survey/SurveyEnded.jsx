import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Mail,
  ArrowRight,
  BookOpen,
  Calendar,
  MessageCircle,
  ShieldCheck,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  Tag,
  ChevronRight,
  Heart,
  Eye,
  RefreshCw,
} from "lucide-react";
import SEO from "../../Components/SEO";
import ScrollToTop from "../../utils/ScrollToTop";
import { saveEmailToFirestore, getArticles } from "../../firebaseUtils";
import { isValidEmail } from "../../utils/validation";
import { useToast } from "../../Contexts/ToastContext";
import { plans } from "../../utils/plansData";

// Curated fallbacks in case live articles fetch is empty or loading
const FALLBACK_ARTICLES = [
  {
    id: "ghanaian-portion-guide",
    title: "How to Balance Everyday Ghanaian Meals Without Starving",
    summary:
      "A registered dietitian's guide to portioning jollof, waakye, banku, and plantain while hitting your weight and blood sugar targets.",
    tags: ["Nutrition", "Ghanaian Diet", "Weight Loss"],
    readTime: "4 min read",
    author: "Nana Ama Dwamena",
  },
  {
    id: "managing-blood-sugar",
    title: "Lowering Fasting Blood Sugar: Common Morning Mistakes to Avoid",
    summary:
      "Simple food swaps and habit shifts that prevent sharp glucose spikes before your work day starts.",
    tags: ["Blood Sugar", "Wellness"],
    readTime: "5 min read",
    author: "Nana Ama Dwamena",
  },
  {
    id: "metabolism-habits",
    title: "5 Sustainable Nutrition Habits That Outperform Crash Diets",
    summary:
      "Why restrictive detox teas fail and how gentle consistency builds lasting energy and body confidence.",
    tags: ["Healthy Habits", "Lifestyle"],
    readTime: "3 min read",
    author: "Nana Ama Dwamena",
  },
];

export default function SurveyEnded({ isPreview = false }) {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const isPreviewMode = isPreview || searchParams.get("view") === "ended" || searchParams.get("preview") === "ended";

  // In-page quick newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subStatus, setSubStatus] = useState("idle"); // idle | loading | success | already_subscribed | error
  const [subErrorMsg, setSubErrorMsg] = useState("");

  // Live articles fetching for the "Read more blogs & newsletters" section
  const [recentArticles, setRecentArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRecentArticles = async () => {
      try {
        const result = await getArticles(false);
        if (isMounted && result.success && Array.isArray(result.data) && result.data.length > 0) {
          setRecentArticles(result.data.slice(0, 3));
        } else if (isMounted) {
          setRecentArticles(FALLBACK_ARTICLES);
        }
      } catch (err) {
        console.warn("Could not fetch recent articles for survey-ended page:", err);
        if (isMounted) setRecentArticles(FALLBACK_ARTICLES);
      } finally {
        if (isMounted) setArticlesLoading(false);
      }
    };

    fetchRecentArticles();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setSubErrorMsg("");

    const cleanEmail = newsletterEmail.trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setSubStatus("error");
      setSubErrorMsg("Please enter a valid email address.");
      return;
    }

    setSubStatus("loading");
    try {
      const result = await saveEmailToFirestore(cleanEmail, {
        source: "survey_ended_page",
        subscribedVia: "DietWithDee Past-Ended Survey Page",
        notes: "Interested in upcoming community surveys and newsletters",
      });

      if (result && result.exists) {
        setSubStatus("already_subscribed");
        showToast("You're already on our newsletter list! We'll notify you when the next survey launches.", "info");
      } else {
        setSubStatus("success");
        showToast("Subscribed! You'll be first to hear about future surveys and health guides.", "success");
      }
      setNewsletterEmail("");
    } catch (err) {
      console.error("Newsletter submission error:", err);
      setSubStatus("error");
      setSubErrorMsg("Unable to save your subscription right now. Please try again or visit /subscribe.");
    }
  };

  return (
    <>
      <ScrollToTop />
      <SEO
        title="Community Survey Concluded | DietWithDee"
        description="The DietWithDee community survey has officially concluded. Subscribe to our newsletter for future survey invitations, read our latest nutrition articles, or book a 1-on-1 diet consultation."
        url="/survey-ended"
      />

      <div className="min-h-screen bg-[#f8faf9] text-gray-800 py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Optional Visual Preview Banner if viewing in preview mode */}
          {isPreviewMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-amber-900 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                <span>
                  <strong>Visualizing Past-Ended Page:</strong> This page is what visitors will see when the survey is toggled <strong>OFF</strong> in the Admin Panel.
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  to="/survey"
                  className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 font-bold rounded-lg hover:bg-amber-100 transition-colors"
                >
                  View Live Survey Form
                </Link>
                <Link
                  to="/admin"
                  className="px-3 py-1.5 bg-amber-700 text-white font-bold rounded-lg hover:bg-amber-800 transition-colors"
                >
                  Admin Panel
                </Link>
              </div>
            </div>
          )}

          {/* MAIN HERO CARD: Survey Concluded Signature Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200/80 overflow-hidden relative">
            {/* Top decorative gradient bar */}
            <div className="h-3.5 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500" />

            <div className="p-6 sm:p-10 text-center max-w-2xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200 mb-5">
                <Clock size={14} className="text-stone-600" />
                <span>Response Window Closed</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl font-serif-cormorant font-normal text-stone-900 tracking-tight mb-4 leading-tight">
                This Survey Has Now Ended
              </h1>

              {/* Message */}
              <p className="text-base sm:text-lg text-stone-700 leading-relaxed font-normal mb-6">
                Thank you warmly to everyone in our community who shared their health goals, feedback, and experiences!
                The response window has officially closed, and we are already turning your insights into better Ghanaian meal plans, free nutrition guides, and enhanced client tools.
              </p>

              {/* Did you take the survey? Note */}
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 text-xs sm:text-sm text-emerald-950 text-left flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900 mb-0.5">
                    Already submitted a response?
                  </p>
                  <p className="text-emerald-800 leading-relaxed">
                    Your 20% meal plan discount voucher was automatically emailed to the address you provided. If you can't find it in your inbox or spam folder, feel free to send Dee a message on WhatsApp and we will happily pull up your code.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3 CORE ACTION HUBS: Newsletter, Blogs, Consultation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ACTION CARD 1: SUBSCRIBE TO NEWSLETTER */}
            <div className="bg-white rounded-3xl shadow-sm border border-emerald-100/90 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-200 transition-all">
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shadow-2xs">
                    <Mail size={22} />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Stay Connected
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight mb-2">
                  Never Miss the Next Survey or Special Drop
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal mb-5">
                  Subscribe to our free weekly newsletter. Receive practical Ghanaian meal prep tips, healthy swaps, blood sugar balance advice, and priority notice whenever our next survey launches.
                </p>

                {/* Inline Email Subscription Form */}
                {subStatus === "success" ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm rounded-xl flex items-start gap-2.5 mb-4 animate-fadeIn">
                    <CheckCircle2 size={18} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">You're on the VIP list!</strong>
                      <span>Check your inbox soon for your weekly nutrition boost.</span>
                    </div>
                  </div>
                ) : subStatus === "already_subscribed" ? (
                  <div className="p-4 bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm rounded-xl flex items-start gap-2.5 mb-4 animate-fadeIn">
                    <CheckCircle2 size={18} className="text-blue-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">You're already subscribed!</strong>
                      <span>You'll be among the first to receive upcoming survey links.</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="space-y-2.5 mb-4">
                    <div className="relative">
                      <input
                        type="email"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full px-4 py-3 pl-10 bg-stone-50/70 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder:text-stone-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        disabled={subStatus === "loading"}
                      />
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    </div>

                    {subStatus === "error" && subErrorMsg && (
                      <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
                        <AlertCircle size={13} />
                        {subErrorMsg}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={subStatus === "loading"}
                      className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {subStatus === "loading" ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Saving your spot...</span>
                        </>
                      ) : (
                        <>
                          <span>Subscribe to Newsletter</span>
                          <ChevronRight size={15} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Dedicated route link to Subscribe page */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                <span>Want to gift or refer a friend?</span>
                <Link
                  to="/subscribe"
                  className="text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                >
                  Visit Newsletter Page <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* ACTION CARD 2: BOOK A 1-ON-1 CONSULTATION */}
            <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-200 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 shadow-2xs">
                    <Calendar size={22} />
                  </div>
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    Direct Care
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight mb-2">
                  Ready for 1-on-1 Dietary Guidance?
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal mb-5">
                  Skip the guesswork. Work directly with Registered Dietitian Nana Ama Dwamena for a comprehensive, medically-sound nutritional plan tailored to your health targets, schedule, and lifestyle.
                </p>

                {/* Consultation Quick Overview */}
                <div className="space-y-2.5 mb-6 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-100 text-xs text-stone-700">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">Initial Consultation (45 mins)</span>
                    <span className="font-extrabold text-emerald-800">₵800</span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Includes full health assessment, custom meal guide, and food diary setup.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-stone-200/70">
                    <span className="font-bold text-stone-900">Follow-up Consultation (25 mins)</span>
                    <span className="font-extrabold text-emerald-800">₵400</span>
                  </div>
                </div>
              </div>

              {/* Consultation CTAs */}
              <div className="space-y-2.5">
                <Link
                  to="/contactUs"
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#F6841F] to-[#ea7612] hover:from-[#ea7612] hover:to-[#db6a07] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar size={16} />
                  <span>Book Your Consultation Online</span>
                </Link>

                <a
                  href={`https://wa.me/233592330870?text=${encodeURIComponent(
                    "Hello Dee, I visited the survey page and would like to ask about booking a 1-on-1 consultation."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <MessageCircle size={15} />
                  <span>Ask a Question on WhatsApp</span>
                </a>
              </div>
            </div>

          </div>

          {/* ACTION SECTION 3: READ MORE BLOGS & PAST NEWSLETTERS */}
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200/80 p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                  <BookOpen size={15} />
                  <span>Knowledge Base & Articles</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-serif-cormorant font-normal text-stone-900 tracking-tight">
                  Read Our Latest Blogs & Past Newsletters
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 font-normal">
                  Free, evidence-based nutrition guides written specifically for Ghanaian and West African diets.
                </p>
              </div>

              <Link
                to="/blog"
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <span>Browse All Articles</span>
                <ChevronRight size={15} />
              </Link>
            </div>

            {/* Articles Grid */}
            {articlesLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-500">
                <Loader2 size={24} className="animate-spin text-emerald-600" />
                <span className="text-xs">Loading latest articles...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                {recentArticles.map((article, idx) => {
                  const articleSlugOrId = article.slug || article.id;
                  const articleUrl = `/blog/${articleSlugOrId}`;
                  const tags = article.tags || ["Nutrition"];

                  return (
                    <article
                      key={article.id || idx}
                      className="bg-stone-50/70 hover:bg-emerald-50/40 rounded-2xl p-5 border border-stone-200/70 hover:border-emerald-200 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Cover Image if available */}
                        {article.coverImage && (
                          <div className="w-full h-36 rounded-xl overflow-hidden mb-3.5 bg-stone-100">
                            <img
                              src={article.coverImage}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                        )}

                        {/* Tag & Read Time */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                            {tags[0]}
                          </span>
                          {article.readTime && (
                            <span className="text-[11px] text-stone-500 font-medium">
                              • {article.readTime}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-2 mb-2 leading-snug">
                          {article.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-4">
                          {article.summary || article.content?.replace(/<[^>]+>/g, "").slice(0, 120) + "..."}
                        </p>
                      </div>

                      <Link
                        to={articleUrl}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 group-hover:text-emerald-900 hover:underline pt-2 border-t border-stone-200/50"
                      >
                        <span>Read article</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="text-center pt-2">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 underline"
              >
                <span>Looking for a specific topic? View the full DietWithDee archive →</span>
              </Link>
            </div>
          </div>

          {/* ACTION SECTION 4: EXPLORE STRUCTURED MEAL PLANS */}
          <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-white/15 text-emerald-200 px-3 py-1 rounded-full mb-3">
                <Tag size={13} />
                Dietitian-Crafted Meal Plans
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif-cormorant font-normal text-white tracking-tight mb-3">
                Structured Ghanaian Meal Plans for Your Exact Goal
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-normal mb-6">
                Whether you want to lose weight, gain healthy muscle, manage blood pressure, or regulate blood sugar, our plans give you clear weekly meal schedules made with everyday Ghanaian market ingredients.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/plans"
                  className="px-5 py-3 bg-white text-emerald-900 hover:bg-emerald-50 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore All 5 Meal Plans</span>
                  <ArrowRight size={15} />
                </Link>
                <Link
                  to="/contactUs"
                  className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-xl text-xs sm:text-sm transition-all"
                >
                  <span>Not Sure Which to Choose? Book a Session</span>
                </Link>
              </div>
            </div>

            {/* Decorative background glow */}
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-emerald-600/30 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Footer note */}
          <div className="text-center text-xs text-stone-500 py-4">
            <p>
              DietWithDee • Personalized Ghanaian Nutrition & Wellness • Have questions?{" "}
              <a
                href="https://wa.me/233592330870"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 font-bold hover:underline"
              >
                Chat directly on WhatsApp
              </a>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
