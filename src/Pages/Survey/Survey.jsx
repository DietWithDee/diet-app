import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Share2,
  Copy,
  Check,
  Gift,
  HelpCircle,
  Flame,
  ArrowRight,
} from "lucide-react";
import SEO from "../../Components/SEO";
import ScrollToTop from "../../utils/ScrollToTop";
import { db, safeLogEvent } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const QUESTIONS = [
  {
    id: "goal",
    type: "radio",
    required: true,
    title: "1. What is your primary health or wellness goal right now?",
    subtitle: "Select the option that best describes what brought you here.",
    options: [
      { id: "weight-loss", label: "Lose weight & get toned" },
      { id: "diabetes", label: "Manage blood sugar, pre-diabetes, or diabetes" },
      { id: "hypertension", label: "Manage high blood pressure / cardiovascular health" },
      { id: "weight-gain", label: "Healthy weight gain & muscle building" },
      { id: "healthy-habits", label: "Eat healthier meals using everyday Ghanaian foods" },
      { id: "exploring", label: "Just exploring & learning nutrition tips" },
    ],
  },
  {
    id: "plan_awareness",
    type: "radio",
    required: true,
    title: "2. Have you ever considered purchasing a Meal Plan or booking a 1-on-1 Consultation with Dee?",
    subtitle: "We offer tailored meal plans and direct dietary consultations.",
    options: [
      { id: "already-bought", label: "Yes, I have already purchased a plan or booked a session" },
      { id: "considered", label: "I looked into it, but haven't made a decision yet" },
      { id: "didnt-know", label: "I didn't know DietWithDee offers custom meal plans and consultations!" },
      { id: "free-only", label: "I only use the free blog posts, tips, and tools" },
    ],
  },
  {
    id: "plan_hesitation",
    type: "radio",
    required: true,
    title: "3. If you haven't booked a consultation or bought a plan yet, what held you back most?",
    subtitle: "Be as candid as possible — this helps us fix barriers.",
    options: [
      { id: "price", label: "Price / Current budget constraints" },
      { id: "plan-fit", label: "Not sure which specific plan or service fits my body and routine" },
      { id: "unclear-value", label: "Unsure what actually happens or what is included in a consultation" },
      { id: "try-free-first", label: "Prefer to try on my own first with free website articles and tips" },
      { id: "payment-method", label: "Payment method wasn't convenient or straightforward" },
      { id: "procrastination", label: "I definitely plan to, just haven't had the time yet" },
      { id: "other", label: "Other / Not looking for guided nutrition right now" },
    ],
  },
  {
    id: "plan_catalyst",
    type: "checkbox",
    required: true,
    maxSelect: 2,
    title: "4. What would make you most confident to book a consultation or start a plan?",
    subtitle: "Choose up to 2 options that would help you take the leap.",
    options: [
      { id: "free-chat", label: "A quick, free 5-minute WhatsApp discovery chat before paying" },
      { id: "sample-preview", label: "Seeing a 1-day sample meal plan preview before buying" },
      { id: "installments", label: "Flexible installment or split-payment options" },
      { id: "testimonials", label: "More real client before-and-after stories & testimonials" },
      { id: "quiz", label: "A quick 1-minute quiz that tells me exactly which plan to buy" },
      { id: "whatsapp-support", label: "A plan tier with weekly WhatsApp check-in accountability" },
    ],
  },
  {
    id: "newsletter_readership",
    type: "radio",
    required: true,
    title: "5. Do you receive and read our email newsletters?",
    subtitle: "We send weekly nutritional guidance, recipes, and practical advice.",
    options: [
      { id: "reads-regularly", label: "Yes, I read almost every edition!" },
      { id: "reads-sometimes", label: "Occasionally, when the email subject catches my eye" },
      { id: "subscribed-rarely-opens", label: "I am subscribed, but rarely get around to opening them" },
      { id: "not-subscribed", label: "I haven't subscribed to the newsletter yet" },
    ],
  },
  {
    id: "sharing_habits",
    type: "radio",
    required: true,
    title: "6. Have you ever shared a DietWithDee article, newsletter, or tip with a friend or family member?",
    subtitle: "We would love to know how our community spreads the word.",
    options: [
      { id: "shares-often", label: "Yes, frequently via WhatsApp, social media, or in person!" },
      { id: "shares-once-twice", label: "Once or twice when it was specifically relevant to someone" },
      { id: "wants-to-share", label: "Not yet, but I'd happily share something useful" },
      { id: "no-sharing", label: "No, I mostly read quietly for myself" },
    ],
  },
  {
    id: "my_journey_usage",
    type: "radio",
    required: true,
    title: "7. Have you used the \"My Journey\" feature on our website (BMI calculator & progress dashboard)?",
    subtitle: "The tool at dietwithdee.org/my-journey that calculates your metrics.",
    options: [
      { id: "regular-user", label: "Yes, I created an account and track my progress regularly" },
      { id: "guest-used", label: "I used the BMI/calorie calculator once or twice as a guest" },
      { id: "seen-not-used", label: "I saw the feature, but wasn't sure how to use it or haven't tried" },
      { id: "never-heard", label: "I didn't know this feature existed on the website" },
    ],
  },
];

export default function Survey() {
  const [answers, setAnswers] = useState({
    goal: "",
    plan_awareness: "",
    plan_hesitation: "",
    plan_catalyst: [],
    newsletter_readership: "",
    sharing_habits: "",
    my_journey_usage: "",
    feedback: "",
    contact: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    safeLogEvent("survey_viewed", { page: "/survey" });
  }, []);

  const handleRadioChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    setErrorMessage("");
  };

  const handleCheckboxChange = (questionId, optionId, maxSelect = 2) => {
    setAnswers((prev) => {
      const currentList = prev[questionId] || [];
      let updated;
      if (currentList.includes(optionId)) {
        updated = currentList.filter((item) => item !== optionId);
      } else {
        if (currentList.length >= maxSelect) {
          // Replace the first selected or ignore
          updated = [...currentList.slice(1), optionId];
        } else {
          updated = [...currentList, optionId];
        }
      }
      return { ...prev, [questionId]: updated };
    });
    setErrorMessage("");
  };

  const handleTextChange = (field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Calculate progress
  const requiredQuestions = QUESTIONS.filter((q) => q.required);
  const answeredCount = requiredQuestions.filter((q) => {
    const val = answers[q.id];
    if (Array.isArray(val)) return val.length > 0;
    return Boolean(val);
  }).length;

  const progressPercent = Math.round((answeredCount / requiredQuestions.length) * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate required questions
    for (const q of requiredQuestions) {
      const val = answers[q.id];
      if (!val || (Array.isArray(val) && val.length === 0)) {
        setErrorMessage(`Please answer question: "${q.title.split(".")[1]?.trim() || q.title}" before submitting.`);
        const element = document.getElementById(`q-${q.id}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }
    }

    setIsSubmitting(true);
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);

    try {
      const surveyPayload = {
        answers: {
          goal: answers.goal,
          plan_awareness: answers.plan_awareness,
          plan_hesitation: answers.plan_hesitation,
          plan_catalyst: answers.plan_catalyst,
          newsletter_readership: answers.newsletter_readership,
          sharing_habits: answers.sharing_habits,
          my_journey_usage: answers.my_journey_usage,
          feedback: answers.feedback.trim() || null,
          contact: answers.contact.trim() || null,
        },
        durationSeconds,
        submittedAt: serverTimestamp(),
        screenSize: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "unknown",
        referrer: typeof document !== "undefined" ? document.referrer || "direct" : "direct",
      };

      if (db) {
        await addDoc(collection(db, "surveys"), surveyPayload);
      }

      safeLogEvent("survey_completed", { durationSeconds });
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Survey submission error:", err);
      // Fallback: If network/rules issue, gracefully accept so user has great experience
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPromoCode = () => {
    navigator.clipboard.writeText("SURVEY15");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <>
      <ScrollToTop />
      <SEO
        title="Community Survey & Feedback | DietWithDee"
        description="Help us improve DietWithDee services. Answer a quick 2-minute survey and get an exclusive 15% discount on our meal plans and consultations."
        url="/survey"
      />

      <div className="min-h-screen bg-[#f8faf9] text-gray-800 py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar (Sticky Top) */}
          {!isSubmitted && (
            <div className="sticky top-20 z-20 bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-emerald-100 p-3 mb-6 transition-all">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-1.5 px-1">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <Clock size={14} className="text-emerald-600 animate-pulse" />
                  <span>~2 min survey</span>
                </span>
                <span className="text-emerald-700">
                  {answeredCount} of {requiredQuestions.length} answered ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Submission Success View */}
          {isSubmitted ? (
            <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden text-center p-8 sm:p-12 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 size={36} />
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
                <Sparkles size={13} />
                Thank you so much!
              </span>

              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
                Your feedback was received!
              </h1>
              <p className="text-gray-600 max-w-lg mx-auto text-sm sm:text-base leading-relaxed mb-8">
                Your answers give us direct insight into what works and what we need to improve. Nana Ama and the DietWithDee team truly appreciate your time!
              </p>

              {/* Thank you bonus card */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50/50 rounded-2xl border-2 border-dashed border-emerald-300 p-6 sm:p-7 max-w-md mx-auto mb-8 text-left relative overflow-hidden">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
                  <Gift size={18} className="text-emerald-600" />
                  <span>Your 15% Thank-You Gift Voucher</span>
                </div>
                <p className="text-xs text-emerald-700 mb-4">
                  Use this coupon code on checkout for 15% off any personalized Meal Plan or Consultation:
                </p>

                <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-emerald-200 shadow-sm">
                  <span className="font-mono font-black text-lg tracking-widest text-emerald-800">
                    SURVEY15
                  </span>
                  <button
                    onClick={copyPromoCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check size={14} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/plans"
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                >
                  Explore Meal Plans <ArrowRight size={16} />
                </Link>
                <a
                  href="https://wa.me/233592330870?text=Hello%20Dee%2C%20I%20just%20completed%20the%20survey%20and%20would%20like%20to%20ask%20about%20a%20consultation!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 bg-white text-emerald-700 font-bold border border-emerald-300 rounded-xl hover:bg-emerald-50 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  Chat with Dee on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Header Card (Google Forms Minimal Signature) */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-3 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500" />
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
                    <Sparkles size={14} />
                    <span>DietWithDee Community Survey</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-4">
                    Help Us Improve DietWithDee
                  </h1>

                  {/* Exactly requested text */}
                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 sm:p-5 text-gray-700 text-sm sm:text-base leading-relaxed">
                    <p className="font-medium text-emerald-950">
                      "We would like you to help us improve our services. Please answer the questions as honestly and as carefully as you can. It should take less than two minutes to finish."
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      Anonymous & Confidential
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-emerald-600" />
                      Less than 2 minutes
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <Gift size={14} />
                      Includes 15% discount bonus at the end
                    </span>
                  </div>
                </div>
              </div>

              {/* Questions Loop */}
              {QUESTIONS.map((q) => {
                const currentVal = answers[q.id];
                const isAnswered = Array.isArray(currentVal) ? currentVal.length > 0 : Boolean(currentVal);

                return (
                  <div
                    key={q.id}
                    id={`q-${q.id}`}
                    className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 p-6 sm:p-7 ${
                      isAnswered ? "border-emerald-200/80 bg-white" : "border-gray-100"
                    }`}
                  >
                    <div className="mb-4">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                        {q.title}
                        {q.required && <span className="text-red-500 ml-1 font-bold">*</span>}
                      </h2>
                      {q.subtitle && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">{q.subtitle}</p>
                      )}
                    </div>

                    {/* Radio Options */}
                    {q.type === "radio" && (
                      <div className="space-y-2.5">
                        {q.options.map((option) => {
                          const isSelected = currentVal === option.id;
                          return (
                            <label
                              key={option.id}
                              onClick={() => handleRadioChange(q.id, option.id)}
                              className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-emerald-50/80 border-emerald-500 text-emerald-950 font-medium shadow-sm ring-1 ring-emerald-500/20"
                                  : "border-gray-200/80 hover:bg-gray-50/80 text-gray-700"
                              }`}
                            >
                              <div className="pt-0.5">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    isSelected
                                      ? "border-emerald-600 bg-emerald-600"
                                      : "border-gray-300 bg-white"
                                  }`}
                                >
                                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                              </div>
                              <span className="text-sm leading-relaxed select-none">
                                {option.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Checkbox Options */}
                    {q.type === "checkbox" && (
                      <div className="space-y-2.5">
                        {q.options.map((option) => {
                          const isChecked = (currentVal || []).includes(option.id);
                          return (
                            <label
                              key={option.id}
                              onClick={() => handleCheckboxChange(q.id, option.id, q.maxSelect)}
                              className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                                isChecked
                                  ? "bg-emerald-50/80 border-emerald-500 text-emerald-950 font-medium shadow-sm ring-1 ring-emerald-500/20"
                                  : "border-gray-200/80 hover:bg-gray-50/80 text-gray-700"
                              }`}
                            >
                              <div className="pt-0.5">
                                <div
                                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                                    isChecked
                                      ? "border-emerald-600 bg-emerald-600 text-white"
                                      : "border-gray-300 bg-white"
                                  }`}
                                >
                                  {isChecked && <Check size={14} strokeWidth={3} />}
                                </div>
                              </div>
                              <span className="text-sm leading-relaxed select-none">
                                {option.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Single Optional Open Textarea (Question 8) */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7">
                <div className="mb-3">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                    8. What is one thing we could do or improve to make DietWithDee better for you?
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Completely optional — any feedback or idea is welcome!
                  </p>
                </div>
                <textarea
                  rows={3}
                  value={answers.feedback}
                  onChange={(e) => handleTextChange("feedback", e.target.value)}
                  placeholder="e.g., more student-friendly Ghanaian meal ideas, faster WhatsApp booking, weekly video tips..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Optional Contact / Promo Lead Capture (Question 9) */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7">
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                    <Gift size={14} />
                    <span>Special 15% Discount Bonus</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                    9. Want an exclusive 15% discount code sent to you? (Optional)
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Leave your WhatsApp number or email if you'd like the discount coupon code and early access to new plans.
                  </p>
                </div>
                <input
                  type="text"
                  value={answers.contact}
                  onChange={(e) => handleTextChange("contact", e.target.value)}
                  placeholder="e.g. 054 123 4567 or yourname@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2 animate-fadeIn">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 pb-12">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-8 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Submitting your answers...
                    </>
                  ) : (
                    <>
                      <span>Submit Survey</span>
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  DietWithDee values your privacy. Your answers will only be used to improve our services.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
