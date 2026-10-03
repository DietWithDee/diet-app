import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Fuse from "fuse.js";
import {
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Sparkles,
  Gift,
  ShoppingCart,
  Copy,
  CheckCheck,
  Smartphone,
  ExternalLink,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "../../Components/SEO";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../firebaseConfig";
import PlanImg from "../../assets/Salad.webp"; // you can replace this with actual plan images
import B2B from "../../assets/images/B2B.webp"; // example image for Back to Basics plan
import Gain from "../../assets/images/Gain.webp"; // example image for Weight Gain plan
import Weightloss from "../../assets/images/Weightloss.webp"; // example image for Weight Loss plan
import Diabetes from "../../assets/images/Diabetes.webp"; // example image for Diabetes plan
import Pressure from "../../assets/images/Pressure.webp"; // example image for Hypertension plan
import ontrackImg from "../../assets/OntrackIMG.jpg";
import appleIcon from "../../assets/apple.webp";
import playstoreIcon from "../../assets/playstore.webp";
import ScrollToTop from "../../utils/ScrollToTop";
import { useTestimonials } from "../../hooks/useTestimonials";
import { plans } from "../../utils/plansData";
import { useToast } from "../../Contexts/ToastContext";
import PlanSearchBar from "./components/PlanSearchBar";
import PlanCardSkeleton from "./components/PlanCardSkeleton";
import carousel1 from "../../assets/carousel/1.jpg?url";
import carousel2 from "../../assets/carousel/2.jpg?url";
import carousel3 from "../../assets/carousel/3.jpg?url";
import carousel4 from "../../assets/carousel/4.jpg?url";
import carousel5 from "../../assets/carousel/5.jpg?url";
import carousel6 from "../../assets/carousel/6.jpg?url";

const PROMO_CODES = {
  "back-to-basics": "BASICS10",
  "snatched-nourished": "SNATCH10",
  "blood-sugar-balance": "SUGAR10",
  "pressure-no-dey-catch-me": "PRESSURE10",
  "weight-gain": "WEIGHT10",
};

const ONTRACK_ANDROID_URL =
  "https://play.google.com/store/apps/details?id=com.ontrack.app";
const ONTRACK_IOS_URL =
  "https://apps.apple.com/us/app/ontrack-ai-diabetes-manager/id6797802105";

const CAROUSEL_IMAGES = [
  carousel1,
  carousel2,
  carousel3,
  carousel4,
  carousel5,
  carousel6,
];

function Plans() {
  const navigate = useNavigate();
  const location = useLocation();
  const { testimonials: firestoreTestimonials, fetchApprovedTestimonials } =
    useTestimonials();
  const [shareToast, setShareToast] = useState(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnTrackModal, setShowOnTrackModal] = useState(false);

  const fuse = useMemo(() => {
    return new Fuse(plans, {
      keys: [
        { name: "title", weight: 0.4 },
        { name: "tags", weight: 0.35 },
        { name: "Subtitle", weight: 0.15 },
        { name: "features", weight: 0.1 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
      includeScore: true,
      minMatchCharLength: 1,
    });
  }, []);

  const { orderedPlans, matchCount, hasQuery, hasDirectMatch } = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) {
      return {
        orderedPlans: plans,
        matchCount: 0,
        hasQuery: false,
        hasDirectMatch: true,
      };
    }

    // 1. Prefix match boost (single letter or prefix words)
    const prefixMatched = [];
    const prefixMatchedIds = new Set();

    plans.forEach((plan) => {
      const words = [
        plan.title,
        plan.Subtitle,
        ...(plan.tags || []),
      ]
        .join(" ")
        .toLowerCase()
        .split(/[\s,()&/'-]+/);

      const isPrefix = words.some((w) => w.startsWith(trimmed));
      if (isPrefix) {
        prefixMatched.push(plan);
        prefixMatchedIds.add(plan.id);
      }
    });

    // 2. Fuzzy match via Fuse.js for remaining plans
    const fuseResults = fuse.search(trimmed);
    const fuseMatched = fuseResults
      .map((r) => r.item)
      .filter((plan) => !prefixMatchedIds.has(plan.id));

    const matchedPlans = [...prefixMatched, ...fuseMatched];
    const matchedIdSet = new Set(matchedPlans.map((p) => p.id));
    const nonMatchedPlans = plans.filter((p) => !matchedIdSet.has(p.id));

    // Combine: matched plans first, followed by all remaining plans
    const allOrderedPlans = [...matchedPlans, ...nonMatchedPlans];

    return {
      orderedPlans: allOrderedPlans,
      matchCount: matchedPlans.length,
      hasQuery: true,
      hasDirectMatch: matchedPlans.length > 0,
    };
  }, [searchQuery, fuse]);

  // Click-to-copy promo code helper for mobile
  const [copiedCode, setCopiedCode] = useState(null);
  const handleCopyCode = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopiedCode(code);
        try {
          logEvent(analytics, 'use_promotion', {
            promotion_id: 'fathers_day_promo_code',
            promotion_name: 'Father\'s Day Discount Code',
            coupon: code
          });
        } catch (err) {
          console.warn('Analytics logging failed:', err);
        }
        showToast("Promo code copied successfully!", "success");
        setTimeout(() => setCopiedCode(null), 1500);
      })
      .catch((err) => {
        console.error("Failed to copy code:", err);
        showToast("Failed to copy promo code.", "error");
      });
  };

  const handleGiftConsultationClick = () => {
    try {
      logEvent(analytics, 'select_promotion', {
        promotion_id: 'fathers_day_plans_banner',
        promotion_name: 'Father\'s Day Special Banner',
        creative_name: 'Gift a Consultation Button',
        location_id: 'plans_page_header'
      });
    } catch (err) {
      console.warn('Analytics logging failed:', err);
    }
    navigate("/fathersday");
  };

  const handleBuyClick = (plan) => {
    try {
      logEvent(analytics, 'begin_checkout', {
        value: parseFloat(plan.price.replace(/[^0-9.]/g, '')),
        currency: 'GHS',
        items: [{
          item_id: plan.id,
          item_name: plan.title,
          item_category: "Diet Plan",
          price: parseFloat(plan.price.replace(/[^0-9.]/g, '')),
          quantity: 1
        }]
      });
    } catch (err) {
      console.warn('Analytics logging failed:', err);
    }
    window.open(plan.Url, "_blank", "noopener,noreferrer");
    navigate(`/checkout-success?plan=${plan.id}`);
  };

  const scrollUp = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100); // Delay slightly to ensure DOM has updated
  };

  // Default testimonials (fallback - corrected AI layout mixups)
  const defaultTestimonials = [
    {
      name: "Michael Asare",
      img: Gain,
      content:
        "Nana Ama's Weight Gain guide helped me go from 56kg to 78kg in just 5 months. Before that her 5 week follow up period psyched my mind for the task ahead. Her encouragement, step-by-step approach, and constant motivation made all the difference. I feel healthier, more confident, and energized than ever before. I couldn't have done it without her support.",
      stars: 5,
      profession: "Structural Engineer",
      plan: "The Weight Gain",
      location: "Accra, Ghana",
    },
    {
      name: "Grace Blankson",
      img: Pressure,
      content:
        "I've struggled with hypertension for well over 2 years. Thanks to Dee's Pressure No Dey Catch Me Plan, I now have a trusted source of meals that actually work for me. Her warm demeanor and constant willingness to listen made all the difference. I definitely recommend her to anyone managing hypertension.",
      stars: 5,
      profession: "Retail Trader",
      plan: "Pressure No Dey Catch Me",
      location: "Takoradi, Ghana",
    },
    {
      name: "Kobby Breeze",
      img: Diabetes,
      content:
        "When I was diagnosed with diabetes in October 2024, it felt like a death sentence. I was scared and overwhelmed. But with the guidance of my Doctor and my Dietician, Nana Ama Dwamena, I learned that with the right lifestyle changes, exercise and a proper diet, I could live a normal life. For six weeks, I committed to the plan, not just for myself, but for my daughter Nicole. Through the Blood Sugar Balancing plan, today, I feel healthier, stronger, and more hopeful than ever. Glory be to God!",
      stars: 5,
      profession: "Software Developer",
      plan: "Blood Sugar Balance",
      location: "Accra, Ghana",
    },
    {
      name: "Lawrencia Kwakye",
      img: B2B,
      content:
        "Before I started Diet with Dee's 5-Day Reset, my body felt totally out of sync and sluggish. Seriously, I was dragging myself through the day! But after just five days, it's like my body hit the reset button – pun totally intended. My system feels cleaner, and I'm pretty sure my skin is glowing. Dee, you've worked some kind of magic! This isn't just a diet; it's a total life upgrade.",
      stars: 5,
      profession: "High School Teacher",
      plan: "Back to Basics",
      location: "Accra, Ghana",
    },
    {
      name: "Richard Oti",
      img: Weightloss,
      content:
        "This was my very first encounter with a dietitian, and the objective of my visit was to lose weight. I must say, the results over the past few weeks have been amazing! She gave me a personalized meal plan with familiar foods that are protein-rich, low in carbs, and full of healthy fats. Since following it, my digestion has improved, my bloating has reduced, I wake up more energized, and I've been able to cut out late-night snacking and junk food. I feel healthier and more active than ever!",
      stars: 5,
      profession: "Senior Accountant",
      plan: "Snatched & Nourished",
      location: "Tema, Ghana",
    },
  ];

  const liveFeatured = firestoreTestimonials
    .filter((t) => t.isFeatured)
    .map((t) => ({
      ...t,
      stars: t.rating,
    }));

  const testimonials =
    liveFeatured.length >= 5
      ? liveFeatured
      : [...liveFeatured, ...defaultTestimonials].slice(0, 5);

  const nextTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  }, [testimonials.length]);

  // Fetch featured testimonials from Firestore
  useEffect(() => {
    fetchApprovedTestimonials();
  }, [fetchApprovedTestimonials]);

  useEffect(() => {
    let interval;
    if (isAutoPlaying && !loading && testimonials.length > 1) {
      interval = setInterval(nextTestimonial, 3500); // Change testimonial every 3.5 seconds
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, loading, nextTestimonial, testimonials.length]);

  // Featured carousel auto-rotate - 3 second interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Star rating component
  const StarRating = ({ rating }) => {
    return (
      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Handle hash scrolling on initial load
  useEffect(() => {
    if (!loading && location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }
    }
  }, [loading, location.hash]);

  const handleShare = async (plan) => {
    const shareUrl = `${window.location.origin}/plans#${plan.id}`;
    const shareData = {
      title: `Diet Plan: ${plan.title}`,
      text: `Check out the ${plan.title} plan on DietWithDee! ${plan.Subtitle}`,
      url: shareUrl,
    };

    try {
      logEvent(analytics, "share_plan", {
        plan_id: plan.id,
        plan_title: plan.title,
      });
    } catch (err) {
      console.warn("Analytics logging failed:", err);
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") {
          // Fallback to clipboard if native share fails
          try {
            await navigator.clipboard.writeText(shareUrl);
            setShareToast(plan.id);
            showToast("Plan link copied to clipboard!", "success");
            setTimeout(() => setShareToast(null), 3000);
          } catch (clipErr) {
            console.error("Clipboard copy failed:", clipErr);
          }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareToast(plan.id);
        showToast("Plan link copied to clipboard!", "success");
        setTimeout(() => setShareToast(null), 3000);
      } catch (err) {
        console.error("Error copying to clipboard:", err);
        showToast("Failed to copy plan link.", "error");
      }
    }
  };

  const activePlan = location.hash
    ? plans.find((p) => p.id === location.hash.replace("#", ""))
    : null;

  return (
    <>
      <SEO
        title={activePlan ? activePlan.title : "Diet Plans"}
        description={
          activePlan
            ? activePlan.Subtitle
            : "Tailored nutrition solutions for every lifestyle and goal."
        }
        image={activePlan ? activePlan.img : undefined}
        url={activePlan ? `/plans#${activePlan.id}` : "/plans"}
      />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20 px-6 lg:px-12">
        {/* Commented out Featured Image Carousel for future campaigns
        <div className="max-w-6xl mx-auto mb-4">
          <div className="relative overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: `-${(currentTestimonial % 6) * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {CAROUSEL_IMAGES.map((image, index) => (
                <motion.div
                  key={index}
                  className="min-w-full"
                  // onClick={() => navigate("/terravee")}
                  // whileHover={{ scale: 1.02 }}
                >
                  <img
                    src={image}
                    alt={`Carousel ${index + 1}`}
                    className="w-full h-auto object-cover"
                  />
                </motion.div>
              ))}
            </motion.div>

            <div className="flex justify-center gap-2 mt-4">
              {CAROUSEL_IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonial(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentTestimonial % 6 ? "bg-green-600 w-8" : "bg-gray-300 hover:bg-gray-400"}`}
                />
              ))}
            </div>
          </div>
        </div>
        */}

        <div className="text-center space-y-4 max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600">
            Diet Plans
          </h1>
          <p className="text-gray-700 text-sm sm:text-base max-w-xl mx-auto">
            Tailored nutrition solutions for every lifestyle and goal. Pick a
            plan and begin your transformation.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto rounded-full"></div>
        </div>

        {/* Plan Search & Filter Bar */}
        <PlanSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          resultsCount={matchCount}
          totalCount={plans.length}
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[...Array(plans.length)].map((_, index) => (
              <PlanCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <>
            {hasQuery && !hasDirectMatch && (
              <div className="max-w-2xl mx-auto mb-8 p-4 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex items-center justify-between text-sm text-amber-800 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    No exact match for <strong>&ldquo;{searchQuery}&rdquo;</strong>. Showing all available diet plans below:
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-bold text-amber-700 hover:text-amber-900 underline ml-3 shrink-0 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}

            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
            >
              {orderedPlans.map((plan, index) => {
                const isTopSearchMatch =
                  hasQuery && hasDirectMatch && index === 0;
                const isSecondarySearchMatch =
                  hasQuery && hasDirectMatch && index > 0 && index < matchCount;
                const showOtherPlansHeader =
                  hasQuery &&
                  hasDirectMatch &&
                  matchCount < orderedPlans.length &&
                  index === matchCount;

                return (
                  <React.Fragment key={plan.id || index}>
                    {/* "Other Available Plans" Minimal Divider */}
                    {showOtherPlansHeader && (
                      <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-1 sm:col-span-2 lg:col-span-3 pt-6 pb-2"
                      >
                        <div className="flex items-center gap-3">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                            Other Available Plans
                          </h4>
                          <div className="h-px bg-gray-200/80 flex-1" />
                        </div>
                      </motion.div>
                    )}

                    <motion.div
                      layout
                      id={plan.id}
                      transition={{
                        layout: { duration: 0.35, ease: "easeOut" },
                      }}
                      className={`bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border flex flex-col justify-between relative shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 scroll-mt-24 ${
                        isTopSearchMatch
                          ? "border-emerald-500 ring-2 ring-emerald-400/60 shadow-emerald-100/80"
                          : isSecondarySearchMatch
                          ? "border-emerald-300 ring-1 ring-emerald-200 shadow-emerald-50"
                          : "border-emerald-100/80"
                      }`}
                    >
                    <div>
                      {/* Top Header: Badge & Price */}
                      <div className="flex items-center justify-between mb-2">
                        {isTopSearchMatch ? (
                          <span className="bg-gradient-to-r from-emerald-600 to-green-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
                            🎯 BEST MATCH
                          </span>
                        ) : isSecondarySearchMatch ? (
                          <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            ✨ MATCH
                          </span>
                        ) : plan.isPopular ? (
                          <span className="bg-orange-50 text-orange-600 border border-orange-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            🔥 POPULAR GUIDE
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            Diet Plan
                          </span>
                        )}

                        <div className="text-right">
                          <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                            {plan.price}
                          </div>
                        </div>
                      </div>

                      {/* Title & Subtitle - Option 4 Minimalist Emerald Sheen */}
                      <h3 className="text-xl sm:text-[22px] font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-950 via-green-900 to-teal-950 mb-1 leading-tight tracking-tight">
                        {plan.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium mb-3.5 leading-normal">
                        {plan.Subtitle}
                      </p>

                      {/* Visual Asset Container - Zoomed to fit container completely */}
                      <div className="w-full h-44 sm:h-48 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100/60 overflow-hidden group relative">
                        <img
                          src={plan.img}
                          alt={plan.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Tag Chips */}
                      {plan.tags && plan.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap mb-3.5">
                          {plan.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-emerald-50/80 text-emerald-700 px-2 py-0.5 rounded-md font-medium border border-emerald-100/60"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Feature Checklist */}
                      <ul className="space-y-2 text-xs sm:text-sm text-gray-600 mb-6">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                            <span className="leading-snug">
                              {typeof feat === "string" && feat.includes("OnTrack") ? (
                                <>
                                  Use with{" "}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowOnTrackModal(true);
                                    }}
                                    className="font-bold underline text-slate-900 hover:text-emerald-700 transition-colors inline cursor-pointer text-left decoration-emerald-500 decoration-1.5 underline-offset-2"
                                    title="Learn more about OnTrack App"
                                  >
                                    OnTrack App
                                  </button>{" "}
                                  for best results
                                </>
                              ) : (
                                feat
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Row - Orange Gradient CTA with In-View Shimmer on Scroll */}
                    <div className="flex gap-2.5 pt-3 border-t border-gray-100">
                      <motion.button
                        onClick={() => handleBuyClick(plan)}
                        initial="initial"
                        whileInView="shimmer"
                        viewport={{ once: false, amount: 0.25 }}
                        className={`flex-1 py-3 px-4 bg-gradient-to-r ${plan.gradient || "from-orange-400 to-orange-500"} hover:brightness-105 text-white font-bold text-sm rounded-2xl transition-all shadow-md hover:shadow-orange-200 hover:shadow-lg active:scale-95 text-center cursor-pointer relative overflow-hidden group/btn`}
                      >
                        <span className="relative z-10">Buy Now →</span>
                        {/* Recurring Light-Sweep Shimmer on scroll into view */}
                        <motion.div
                          variants={{
                            initial: { x: "-130%" },
                            shimmer: {
                              x: "230%",
                              transition: {
                                duration: 1.1,
                                ease: "easeInOut",
                                delay: 0.15 + (index % 3) * 0.1,
                              },
                            },
                          }}
                          className="absolute inset-0 w-3/4 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 pointer-events-none z-0"
                        />
                      </motion.button>
                      <button
                        onClick={() => handleShare(plan)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl border border-gray-200 transition-all cursor-pointer relative group"
                        title="Share this plan"
                      >
                        {shareToast === plan.id ? (
                          <Check size={18} className="text-green-600" />
                        ) : (
                          <Share2
                            size={18}
                            className="group-hover:scale-110 transition-transform"
                          />
                        )}
                        {shareToast === plan.id && (
                          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap animate-bounce">
                            Link Copied!
                          </span>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </React.Fragment>
              );
            })}
          </motion.div>
          </>
        )}

        {/* Trust Indicator Section */}
        <div className="mt-20 text-center space-y-4">
          <h2 className="text-3xl font-bold text-green-700">
            Why Choose DietWithDee?
          </h2>
          <div className="flex justify-center flex-wrap gap-8 mt-6 text-gray-700 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Certified Experts
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              300+ Success Stories
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              Custom Nutrition Plans
            </div>
          </div>
        </div>

        {/* Did You Know? CTA Section moved up */}
        <div className="text-center mt-20 mb-8">
          <div className="text-center mb-8 lg:mb-12 space-y-8 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600">
              Did you Know?
            </h1>
          </div>
          <p className="text-gray-600 text-lg mb-6">
            You can Book a Consultation session that comes with a free, custom
            Diet Plan from our Dietitian. Book a session to start now!
          </p>
          <button
            onClick={() => navigate("/contactus")}
            className="px-8 py-3 bg-gradient-to-r from-[#F6841F] to-[#F6841F] text-white font-bold rounded-full hover:shadow-lg transition-all hover:scale-105"
          >
            Book a Session
          </button>
        </div>

        {/* Improved Testimonials Section */}
        <div id="success-stories" className="mt-12 mb-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600">
              Success Stories
            </h2>
            <p className="text-gray-600 text-lg">
              Real people, real results. Swipe to see what our clients have to
              say about their transformation journey.
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto rounded-full"></div>
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-12">
            {/* Carousel Container */}
            <div className="overflow-hidden py-10">
              <motion.div
                className={`flex ${testimonials.length > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
                animate={{ x: `-${currentTestimonial * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag={testimonials.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragStart={() => setIsAutoPlaying(false)}
                onDragEnd={(e, { offset }) => {
                  if (testimonials.length <= 1) return;
                  const swipe = offset.x;
                  if (swipe < -50) nextTestimonial();
                  else if (swipe > 50) prevTestimonial();
                }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="min-w-full px-0">
                    <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 relative border border-green-50 group max-w-4xl mx-auto">
                      {/* Quote Icon */}
                      <div className="absolute top-6 right-6 text-green-200 group-hover:text-green-300 transition-colors">
                        <svg
                          className="w-8 h-8"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                        </svg>
                      </div>

                      {/* Profile Section */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                          {testimonial.img ? (
                            <img
                              src={testimonial.img}
                              alt={testimonial.name}
                              className="h-16 w-16 object-cover rounded-full border-4 border-emerald-100 shadow-md"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-full border-4 border-emerald-100 shadow-md bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-black text-xl select-none">
                              {(testimonial.name || "A")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-xl">
                            {testimonial.name}
                          </h4>
                          <p className="text-green-600 text-base font-semibold">
                            {testimonial.plan}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {testimonial.location}
                          </p>
                        </div>
                      </div>

                      <StarRating rating={testimonial.stars} />
                      <p className="text-gray-700 text-base leading-relaxed mb-4 italic">
                        "{testimonial.content}"
                      </p>
                      <div className="w-12 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Testimonials Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto mb-6 px-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  scrollUp();
                  navigate("/submit-testimonial");
                }}
                className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-700 via-emerald-600 to-green-600 text-white px-8 py-4 rounded-full font-bold shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto text-center text-sm sm:text-base cursor-pointer"
              >
                <span>Share Your Success Story</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  scrollUp();
                  navigate("/success-stories");
                }}
                className="group inline-flex items-center justify-center gap-3 bg-green-50 text-green-700 px-8 py-4 rounded-full font-bold hover:bg-green-700 hover:text-white transition-all duration-300 shadow-md hover:-translate-y-0.5 w-full sm:w-auto text-center text-sm sm:text-base cursor-pointer"
              >
                <span>View Success Stories</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </motion.button>
            </div>

            {/* Navigation Arrows */}
            {testimonials.length > 1 && (
              <>
                <button
                  onClick={() => {
                    setIsAutoPlaying(false);
                    prevTestimonial();
                  }}
                  className="absolute left-1 sm:left-0 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white shadow-md sm:shadow-lg rounded-full text-green-600 hover:bg-green-50 z-10 transition-all focus:outline-none"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={() => {
                    setIsAutoPlaying(false);
                    nextTestimonial();
                  }}
                  className="absolute right-1 sm:right-0 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white shadow-md sm:shadow-lg rounded-full text-green-600 hover:bg-green-50 z-10 transition-all focus:outline-none"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}

            {/* Pagination Dots */}
            {testimonials.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentTestimonial(idx);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentTestimonial ? "bg-green-600 w-8" : "bg-gray-300 hover:bg-gray-400"}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <p className="text-gray-600 text-lg mb-6">
              Ready to start your transformation?
            </p>
            <button
              onClick={() => {
                scrollUp();
              }}
              className="px-8 py-3 bg-gradient-to-r from-[#F6841F] to-[#F6841F] text-white font-bold rounded-full hover:shadow-lg transition-all hover:scale-105"
            >
              Choose Your Plan
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/*  ONTRACK APP INFO & DOWNLOAD MODAL             */}
      {/* ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showOnTrackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOnTrackModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-xl border border-emerald-100/80 overflow-hidden"
            >
              {/* Thin accent */}
              <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />

              {/* Header */}
              <div className="px-6 pt-7 pb-2 text-center relative">
                <button
                  type="button"
                  onClick={() => setShowOnTrackModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={16} />
                </button>

                <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-3 border border-emerald-100/80 shadow-sm bg-white p-0.5">
                  <img
                    src={ontrackImg}
                    alt="OnTrack App"
                    className="w-full h-full object-cover object-center rounded-xl"
                  />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  OnTrack App
                </h3>
                <p className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider mt-0.5">
                  Official Diabetes Tracking Partner
                </p>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-xs mx-auto">
                  Log blood sugar levels, track low-glycemic meals, and pair with DietWithDee’s guide for the best diabetes health transformation.
                </p>
              </div>

              {/* Options */}
              <div className="px-6 pt-3 pb-6 space-y-3">
                {/* Android — active */}
                <a
                  href={ONTRACK_ANDROID_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 transition-all shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform p-2">
                    <img
                      src={playstoreIcon}
                      alt="Google Play Store"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Available Now
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      Download for Android
                    </h4>
                  </div>
                  <ExternalLink
                    size={15}
                    className="text-emerald-500 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all shrink-0"
                  />
                </a>

                {/* iPhone — active link */}
                <a
                  href={ONTRACK_IOS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 transition-all shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform p-1.5">
                    <img
                      src={appleIcon}
                      alt="Apple App Store"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Available on App Store
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      Download for iPhone
                    </h4>
                  </div>
                  <ExternalLink
                    size={15}
                    className="text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0"
                  />
                </a>

                {/* Dismiss */}
                <button
                  type="button"
                  onClick={() => setShowOnTrackModal(false)}
                  className="w-full pt-1 text-xs text-gray-400 font-medium hover:text-gray-600 transition-colors cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Plans;
