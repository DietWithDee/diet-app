import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Fuse from "fuse.js";
import {
  Share2,
  Check,
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
import ontrackImg from "../../assets/OntrackIMG.jpg";
import appleIcon from "../../assets/apple.webp";
import { useClientCount } from "../../utils/clientStats";
import playstoreIcon from "../../assets/playstore.webp";
import ScrollToTop from "../../utils/ScrollToTop";
import TestimonialsCarousel from "../../Components/TestimonialsCarousel";
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
  const clientCount = useClientCount();
  const navigate = useNavigate();
  const location = useLocation();
  const [shareToast, setShareToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnTrackModal, setShowOnTrackModal] = useState(false);
  const [loadedPlanImages, setLoadedPlanImages] = useState({});

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
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif-cormorant font-normal text-stone-900 tracking-tight leading-[1.12]">
            Diet Plans
          </h1>
          <p className="text-stone-700 text-base sm:text-lg font-normal max-w-xl mx-auto leading-relaxed">
            Tailored nutrition solutions for every lifestyle and goal. Pick a
            plan and begin your transformation.
          </p>
          <div className="w-16 h-0.5 bg-[#F6841F] mx-auto rounded-full"></div>
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
                      onClick={() => navigate(`/plans/${plan.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/plans/${plan.id}`);
                        }
                      }}
                      className={`group/card cursor-pointer bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border flex flex-col justify-between relative shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 scroll-mt-24 ${
                        isTopSearchMatch
                          ? "border-emerald-500 ring-2 ring-emerald-400/60 shadow-emerald-100/80"
                          : isSecondarySearchMatch
                          ? "border-emerald-300 ring-1 ring-emerald-200 shadow-emerald-50"
                          : plan.isNew
                          ? "border-teal-300/90 ring-1 ring-teal-200/60 shadow-teal-50"
                          : "border-emerald-100/80 hover:border-emerald-300"
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
                        ) : plan.isComingSoon ? (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm tracking-wider">
                            COMING SOON
                          </span>
                        ) : plan.isNew ? (
                          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm tracking-wider">
                            NEW RELEASE
                          </span>
                        ) : plan.isPopular ? (
                          <span className="bg-orange-50 text-orange-600 border border-orange-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            🔥 POPULAR GUIDE
                          </span>
                        ) : (
                          <span className="text-xs text-stone-500 font-bold uppercase tracking-widest">
                            Diet Plan
                          </span>
                        )}

                        <div className="text-right">
                          <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                            {plan.price}
                          </div>
                        </div>
                      </div>

                      {/* Title & Subtitle */}
                      <h3 className="text-xl sm:text-[22px] font-bold text-stone-900 group-hover/card:text-emerald-700 transition-colors mb-1 leading-tight tracking-tight">
                        {plan.title}
                      </h3>
                      <p className="text-sm text-stone-700 font-normal mb-3.5 leading-normal">
                        {plan.Subtitle}
                      </p>

                      {/* Visual Asset Container - Zoomed to fit container completely with Shimmer Skeleton */}
                      <div className="w-full h-44 sm:h-48 bg-stone-100 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100/60 overflow-hidden relative">
                        {!loadedPlanImages[plan.id] && (
                          <div className="absolute inset-0 bg-stone-200/85 animate-shimmer z-10" />
                        )}
                        <img
                          src={plan.img}
                          alt={plan.title}
                          onLoad={() =>
                            setLoadedPlanImages((prev) => ({
                              ...prev,
                              [plan.id]: true,
                            }))
                          }
                          className={`w-full h-full object-cover object-center group-hover/card:scale-105 transition-all duration-500 ${
                            loadedPlanImages[plan.id] ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        {plan.isComingSoon ? (
                          <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-[10px] font-black tracking-widest px-2.5 py-1 rounded-lg shadow-md border border-white/20 uppercase z-20">
                            COMING SOON
                          </div>
                        ) : plan.isNew ? (
                          <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-[10px] font-black tracking-widest px-2.5 py-1 rounded-lg shadow-md border border-white/20 uppercase z-20">
                            NEW
                          </div>
                        ) : null}
                      </div>

                      {/* Tag Chips */}
                      {plan.tags && plan.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap mb-3.5">
                          {plan.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-emerald-50/80 text-emerald-800 px-2.5 py-0.5 rounded-md font-medium border border-emerald-100/60"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Feature Checklist */}
                      <ul className="space-y-2 text-sm text-stone-700 mb-6 font-normal">
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

                    {/* Action Row */}
                    <div className="flex gap-2.5 pt-3 border-t border-gray-100">
                      {plan.isComingSoon ? (
                        <button
                          type="button"
                          disabled
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 py-3 px-4 bg-stone-100 border border-stone-200 text-stone-500 font-bold text-sm rounded-2xl cursor-not-allowed text-center"
                        >
                          Coming Soon
                        </button>
                      ) : (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuyClick(plan);
                          }}
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
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(plan);
                        }}
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

                    {/* Secondary Plan Preview Button - Frosted Glass, Black Text, No Emoji */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/plans/${plan.id}`);
                      }}
                      className="w-full mt-2.5 py-2.5 px-4 bg-white/75 hover:bg-white/95 backdrop-blur-md border border-stone-200/90 hover:border-stone-300 text-stone-900 font-semibold text-xs sm:text-sm rounded-2xl transition-all shadow-sm hover:shadow active:scale-98 text-center cursor-pointer"
                    >
                      Preview Plan
                    </button>
                  </motion.div>
                </React.Fragment>
              );
            })}
          </motion.div>
          </>
        )}

        {/* Trust Indicator Section */}
        <div className="mt-20 text-center space-y-4">
          <h2 className="text-2xl sm:text-4xl font-serif-cormorant font-normal text-stone-900 tracking-tight">
            Why Choose DietWithDee?
          </h2>
          <div className="flex justify-center flex-wrap gap-8 mt-6 text-stone-800 font-semibold">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Certified Experts
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              {clientCount}+ Success Stories
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              Custom Nutrition Plans
            </div>
          </div>
        </div>

        {/* Did You Know? CTA Section moved up */}
        <div className="text-center mt-20 mb-8">
          <div className="text-center mb-6 space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-cormorant font-normal text-stone-900 tracking-tight">
              Did you Know?
            </h2>
          </div>
          <p className="text-stone-700 text-base sm:text-lg font-normal max-w-2xl mx-auto leading-relaxed mb-6">
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

        {/* Shared Swiping Testimonials Carousel */}
        <TestimonialsCarousel id="success-stories" className="max-w-4xl mx-auto mt-16" />

        {/* Call to Action */}
        <div className="text-center mt-12 mb-12">
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
