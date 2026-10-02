import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Copy,
  Check,
  Gift,
  Mail,
  ArrowRight,
  Star,
  ExternalLink,
  MessageCircle,
  Tag,
  ChevronDown,
} from "lucide-react";
import SEO from "../../Components/SEO";
import ScrollToTop from "../../utils/ScrollToTop";
import InAppBrowserNotice from "../../Components/InAppBrowserNotice";
import { db, safeLogEvent } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { saveEmailToFirestore } from "../../firebaseUtils";
import { plans } from "../../utils/plansData";
import { useToast } from "../../Contexts/ToastContext";

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
  {
    id: "website_ease",
    type: "slider",
    required: true,
    title: "8. How easy is it to navigate and use the DietWithDee website?",
    subtitle: "Drag the slider from 1 (Difficult) to 5 (Effortless).",
    min: 1,
    max: 5,
  },
];

const getEaseDescription = (val) => {
  switch (Number(val)) {
    case 1:
      return "Very difficult — had a hard time finding things 😕";
    case 2:
      return "A bit tricky — navigation could be simpler 🙁";
    case 3:
      return "Okay / Average — standard experience 😐";
    case 4:
      return "Easy to use — smooth and clear 🙂";
    case 5:
      return "Super easy & effortless — loved the experience! 🤩";
    default:
      return "Drag slider to rate your experience";
  }
};

export const DISCOUNT_PLANS = {
  "weight-loss": {
    id: "weight-loss",
    dropdownLabel: "Weight Loss",
    planTitle: "Snatched & Nourished",
    subtitle: "Gentle Weight Loss Guide with Familiar Ghanaian Meals",
    code: "SNATCHED20",
    normalPrice: "₵249",
    discountPrice: "₵199.20",
    savings: "₵49.80",
    paystackUrl: "https://paystack.com/buy/snatched-and-nourished",
    planId: "snatched-nourished",
  },
  "diabetes": {
    id: "diabetes",
    dropdownLabel: "Blood Sugar",
    planTitle: "Blood Sugar Balance",
    subtitle: "A Type 2 Diabetes & Pre-Diabetes Friendly Guide",
    code: "SUGAR20",
    normalPrice: "₵299",
    discountPrice: "₵239.20",
    savings: "₵59.80",
    paystackUrl: "https://paystack.com/buy/blood-sugar-balance-plan",
    planId: "blood-sugar-balance",
  },
  "hypertension": {
    id: "hypertension",
    dropdownLabel: "Hypertension Plan",
    planTitle: "Pressure No Dey Catch Me",
    subtitle: "A Hypertension-Friendly Plan & Heart-Smart Habits",
    code: "PRESSURE20",
    normalPrice: "₵299",
    discountPrice: "₵239.20",
    savings: "₵59.80",
    paystackUrl: "https://paystack.com/buy/pressure-no-dey",
    planId: "pressure-no-dey-catch-me",
  },
  "weight-gain": {
    id: "weight-gain",
    dropdownLabel: "Weight Gain",
    planTitle: "The Weight Gain",
    subtitle: "Wahala-Free High-Calorie Meal Plan",
    code: "WEIGHT20",
    normalPrice: "₵249",
    discountPrice: "₵199.20",
    savings: "₵49.80",
    paystackUrl: "https://paystack.com/buy/the-weight-gain",
    planId: "weight-gain",
  },
  "healthy-eating": {
    id: "healthy-eating",
    dropdownLabel: "Healthy Eating",
    planTitle: "Back to Basics",
    subtitle: "A 5-Day Healthy Eating Reset",
    code: "HEALTHY20",
    normalPrice: "₵349",
    discountPrice: "₵279.20",
    savings: "₵69.80",
    paystackUrl: "https://paystack.com/buy/back-to-basics",
    planId: "back-to-basics",
  },
};

export default function Survey() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [answers, setAnswers] = useState({
    goal: "",
    plan_awareness: "",
    plan_hesitation: "",
    plan_catalyst: [],
    newsletter_readership: "",
    sharing_habits: "",
    my_journey_usage: "",
    website_ease: 4,
    feedback: "",
    selected_plan: "",
    email: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    safeLogEvent("survey_viewed", { page: "/survey" });
  }, []);

  const getPlanConfig = (key) => {
    return DISCOUNT_PLANS[key] || DISCOUNT_PLANS["healthy-eating"];
  };

  const handleRadioChange = (questionId, value) => {
    setAnswers((prev) => {
      const updated = {
        ...prev,
        [questionId]: value,
      };
      // If user selected Question 1 goal and hasn't picked a discount plan yet,
      // intelligently pre-select the matching plan in the dropdown
      if (questionId === "goal" && !prev.selected_plan) {
        if (value === "weight-loss") updated.selected_plan = "weight-loss";
        else if (value === "diabetes") updated.selected_plan = "diabetes";
        else if (value === "hypertension") updated.selected_plan = "hypertension";
        else if (value === "weight-gain") updated.selected_plan = "weight-gain";
        else if (value === "healthy-habits" || value === "exploring") updated.selected_plan = "healthy-eating";
      }
      return updated;
    });
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
    setErrorMessage("");
  };

  // 7 survey questions + 1 plan selection + 1 email question = 9 required fields
  const requiredQuestions = QUESTIONS.filter((q) => q.required);
  const totalRequired = requiredQuestions.length + 2; // +1 plan dropdown + 1 required email

  const answeredSurveyCount = requiredQuestions.filter((q) => {
    const val = answers[q.id];
    if (Array.isArray(val)) return val.length > 0;
    return Boolean(val);
  }).length;

  const isPlanSelected = Boolean(answers.selected_plan);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = answers.email && emailRegex.test(answers.email.trim());
  const answeredTotalCount = answeredSurveyCount + (isPlanSelected ? 1 : 0) + (isEmailValid ? 1 : 0);
  const progressPercent = Math.round((answeredTotalCount / totalRequired) * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate required questions 1-7
    for (const q of requiredQuestions) {
      const val = answers[q.id];
      if (!val || (Array.isArray(val) && val.length === 0)) {
        setErrorMessage(`Please answer: "${q.title.split(".")[1]?.trim() || q.title}" before submitting.`);
        const element = document.getElementById(`q-${q.id}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }
    }

    // Validate Selected Plan for 20% discount
    if (!answers.selected_plan) {
      setErrorMessage("Please select a plan you would be most interested in for your 20% discount.");
      const planElem = document.getElementById("q-plan-dropdown");
      if (planElem) {
        planElem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // Validate Email Address
    const cleanEmail = answers.email.trim().toLowerCase();
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address to complete the survey and claim your discount.");
      const emailElem = document.getElementById("q-email");
      if (emailElem) {
        emailElem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    const chosenPlanConfig = getPlanConfig(answers.selected_plan);

    try {
      // 1. Auto-subscribe email to newsletter collection with selected plan & 20% code
      await saveEmailToFirestore(cleanEmail, {
        source: "survey",
        selectedPlan: chosenPlanConfig.id,
        planTitle: chosenPlanConfig.planTitle,
        discountCode: chosenPlanConfig.code,
        discountPercent: 20,
        paystackUrl: chosenPlanConfig.paystackUrl,
        primaryGoal: answers.goal || "not-specified",
        planHesitation: answers.plan_hesitation || "not-specified",
        subscribedVia: "DietWithDee Community Survey",
      });

      // 2. Save full survey payload into surveys collection
      const surveyPayload = {
        email: cleanEmail,
        selectedPlan: chosenPlanConfig.id,
        discountCode: chosenPlanConfig.code,
        answers: {
          goal: answers.goal,
          plan_awareness: answers.plan_awareness,
          plan_hesitation: answers.plan_hesitation,
          plan_catalyst: answers.plan_catalyst,
          newsletter_readership: answers.newsletter_readership,
          sharing_habits: answers.sharing_habits,
          my_journey_usage: answers.my_journey_usage,
          website_ease: answers.website_ease,
          feedback: answers.feedback.trim() || null,
          selected_plan: chosenPlanConfig.id,
        },
        durationSeconds,
        submittedAt: serverTimestamp(),
        screenSize: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "unknown",
        referrer: typeof document !== "undefined" ? document.referrer || "direct" : "direct",
      };

      if (db) {
        await addDoc(collection(db, "surveys"), surveyPayload);
      }

      safeLogEvent("survey_completed", { durationSeconds, email: cleanEmail, plan: chosenPlanConfig.id });
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Survey submission error:", err);
      // Graceful fallback so respondent still gets their discount voucher
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPromoCode = (code, withToast = true) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    if (withToast) {
      showToast(`Code ${code} copied! Paste under 'Have a discount code?' on Paystack.`, "success");
    }
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <>
      <ScrollToTop />
      <SEO
        title="Community Survey & Feedback | DietWithDee"
        description="Help us improve DietWithDee services. Answer a quick 2-minute survey and get an exclusive 20% discount on your chosen meal plan."
        url="/survey"
      />
      <InAppBrowserNotice />

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
                  {answeredTotalCount} of {totalRequired} completed ({progressPercent}%)
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
            (() => {
              const chosenPlanConfig = getPlanConfig(answers.selected_plan);
              const matchedPlanObject = plans.find((p) => p.id === chosenPlanConfig.planId) || plans[0];

              return (
                <div className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden text-center p-6 sm:p-10 animate-fadeIn">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <CheckCircle2 size={36} />
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 mb-3">
                    <Sparkles size={13} />
                    Thank you so much!
                  </span>

                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
                    Your feedback has been saved!
                  </h1>
                  <p className="text-gray-600 max-w-lg mx-auto text-sm sm:text-base leading-relaxed mb-4">
                    You're now subscribed to our weekly newsletter. Nana Ama and the DietWithDee team truly appreciate your thoughts!
                  </p>

                  {/* Email backup confirmation chip */}
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 max-w-lg mx-auto mb-6 text-left">
                    <Mail size={16} className="text-blue-600 flex-shrink-0" />
                    <span>
                      We have sent your <strong>20% discount code ({chosenPlanConfig.code})</strong> and direct Paystack link to <strong className="text-blue-950 font-bold">{answers.email}</strong>.
                    </span>
                  </div>

                  {/* 20% Voucher Box */}
                  <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50/40 rounded-2xl border-2 border-dashed border-blue-300 p-5 sm:p-6 max-w-lg mx-auto mb-6 text-left relative overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wider">
                        <Gift size={16} className="text-blue-600" />
                        <span>Your 20% Discount Code</span>
                      </div>
                      <span className="bg-blue-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        20% OFF
                      </span>
                    </div>
                    <p className="text-xs text-blue-800 mb-3">
                      Valid on your selected plan: <strong>{chosenPlanConfig.planTitle}</strong>
                    </p>

                    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-blue-200 shadow-sm">
                      <span className="font-mono font-black text-xl tracking-widest text-blue-900">
                        {chosenPlanConfig.code}
                      </span>
                      <button
                        onClick={() => copyPromoCode(chosenPlanConfig.code, true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
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

                  {/* Selected Plan Card with BLUE BUTTON to Paystack */}
                  <div className="bg-white rounded-2xl border-2 border-blue-200 p-5 sm:p-6 max-w-lg mx-auto mb-6 text-left shadow-md relative overflow-hidden">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1">
                        🎯 Selected: {chosenPlanConfig.dropdownLabel}
                      </span>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        Save {chosenPlanConfig.savings} (20%)
                      </span>
                    </div>

                    <div className="flex gap-4 items-start mb-4">
                      {matchedPlanObject.img && (
                        <img
                          src={matchedPlanObject.img}
                          alt={chosenPlanConfig.planTitle}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-blue-100 flex-shrink-0 shadow-sm"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-snug">
                          {chosenPlanConfig.planTitle}
                        </h2>
                        <p className="text-xs text-gray-500 mb-2">
                          {chosenPlanConfig.subtitle}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-gray-400 line-through text-sm font-semibold">
                            {chosenPlanConfig.normalPrice}
                          </span>
                          <span className="text-xl sm:text-2xl font-black text-blue-700">
                            {chosenPlanConfig.discountPrice}
                          </span>
                          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">
                            (With {chosenPlanConfig.code})
                          </span>
                        </div>
                      </div>
                    </div>

                    {matchedPlanObject.features && (
                      <ul className="text-xs text-gray-600 space-y-1.5 mb-5 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                        {matchedPlanObject.features.slice(0, 3).map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 size={13} className="text-blue-600 flex-shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* BLUE BUTTON directly linked to Paystack */}
                    <a
                      href={chosenPlanConfig.paystackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        navigator.clipboard.writeText(chosenPlanConfig.code);
                        showToast(`Code ${chosenPlanConfig.code} copied! Opening Paystack...`, "success");
                      }}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                    >
                      <span>Claim 20% Off & Pay on Paystack</span>
                      <ExternalLink size={16} />
                    </a>
                  </div>

                  {/* Clear Paystack Checkout Instructions */}
                  <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 max-w-lg mx-auto mb-6 text-left text-xs text-blue-900 leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5 mb-2 text-blue-950 text-sm">
                      <Tag size={15} className="text-blue-700" />
                      Clear Instructions: How to use your code on Paystack
                    </p>
                    <ol className="list-decimal pl-4 space-y-1.5 text-blue-900 font-medium">
                      <li>Click the <strong>blue button above</strong> to open your Paystack payment page.</li>
                      <li>On Paystack, tap <strong className="underline">"Have a discount code?"</strong> right below the plan price.</li>
                      <li>Paste your code <code className="bg-white border border-blue-300 font-bold px-1.5 py-0.5 rounded text-blue-800">{chosenPlanConfig.code}</code> and tap Apply.</li>
                      <li>Your price will drop to <strong>{chosenPlanConfig.discountPrice}</strong> (saving 20%). Pay via Mobile Money (MTN / Telecel) or Bank Card to receive your plan!</li>
                    </ol>
                  </div>

                  {/* Consultation & Browse All Plans Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
                    <a
                      href={`https://wa.me/233592330870?text=${encodeURIComponent(
                        `Hello Dee, I just completed your survey and got discount code ${chosenPlanConfig.code}! I'd like to ask about booking a 1-on-1 consultation.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-1/2 px-4 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-xl shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle size={15} />
                      <span>1-on-1 Consultation (WhatsApp)</span>
                    </a>
                    <Link
                      to="/plans"
                      className="w-full sm:w-1/2 px-4 py-3 bg-white text-gray-800 font-bold border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Browse All 5 Plans</span>
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              );
            })()
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
                      Confidential & Secure
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-emerald-600" />
                      Less than 2 minutes
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <Gift size={14} />
                      Includes 20% discount bonus
                    </span>
                  </div>
                </div>
              </div>

              {/* Questions Loop 1-7 */}
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
                    {/* Slider (1 to 5) Options */}
                    {(q.type === "slider" || q.type === "scale") && (
                      <div className="pt-2 pb-2">
                        {/* Live Score Display Card */}
                        <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-emerald-50/90 to-green-50/60 border border-emerald-100 rounded-2xl mb-5 shadow-sm text-center">
                          <div className="flex items-center gap-1.5 text-2xl sm:text-3xl font-black text-emerald-800">
                            <Star className="fill-emerald-500 text-emerald-600" size={26} />
                            <span>{currentVal || 4}</span>
                            <span className="text-base text-emerald-600/70 font-bold">/ 5</span>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-emerald-950 mt-1">
                            {getEaseDescription(currentVal || 4)}
                          </p>
                        </div>

                        {/* Interactive Range Slider */}
                        <div className="relative px-2 sm:px-4">
                          <input
                            type="range"
                            min={q.min || 1}
                            max={q.max || 5}
                            step={1}
                            value={currentVal || 4}
                            onChange={(e) => handleRadioChange(q.id, Number(e.target.value))}
                            className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
                          />

                          {/* Clickable Number Ticks */}
                          <div className="flex justify-between items-center text-xs font-bold text-gray-500 px-1 mt-3">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => handleRadioChange(q.id, num)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                                  (currentVal || 4) === num
                                    ? "bg-emerald-600 text-white shadow-md scale-110 ring-2 ring-emerald-300"
                                    : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 bg-gray-100 sm:bg-transparent"
                                }`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>

                          <div className="flex justify-between items-center text-xs text-gray-400 font-semibold px-1 mt-2">
                            <span>1 — Very Difficult</span>
                            <span className="hidden sm:inline">3 — Average</span>
                            <span>5 — Super Smooth</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Single Optional Open Textarea (Question 9) */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7">
                <div className="mb-3">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                    9. What is one thing we could do or improve to make DietWithDee better for you?
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Completely optional — any suggestion or idea is welcome!
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

              {/* Plan Dropdown & Email Submission Card (Question 10) */}
              <div
                id="q-plan-dropdown"
                className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 p-6 sm:p-7 ${
                  isPlanSelected && isEmailValid ? "border-emerald-200/80 bg-white ring-1 ring-emerald-100" : "border-gray-100"
                }`}
              >
                <div className="mb-5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
                    <Gift size={15} />
                    <span>Final Step & 20% Discount Reward</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                    10. Claim Your 20% Discount Voucher <span className="text-red-500">*</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
                    Choose the plan you want 20% off on, then enter your email. We'll instantly generate your code and email your voucher with a direct link to Paystack!
                  </p>
                </div>

                {/* Prompt & Dropdown as requested */}
                <div className="space-y-2 mb-5">
                  <label
                    htmlFor="survey-plan-select"
                    className="block text-xs sm:text-sm font-bold text-gray-800"
                  >
                    Select a plan you would be most interested in for a 20% discount:{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="survey-plan-select"
                      required
                      value={answers.selected_plan}
                      onChange={(e) => handleTextChange("selected_plan", e.target.value)}
                      className={`w-full px-4 py-3.5 pr-10 rounded-xl border text-sm font-medium appearance-none transition-all cursor-pointer ${
                        answers.selected_plan
                          ? "border-blue-300 bg-blue-50/30 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                          : "border-gray-200 bg-gray-50/50 text-gray-500 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      }`}
                    >
                      <option value="" disabled>
                        -- Select a plan for 20% discount --
                      </option>
                      <option value="weight-loss">Weight Loss (Snatched & Nourished)</option>
                      <option value="diabetes">Blood Sugar (Diabetes Management)</option>
                      <option value="hypertension">Hypertension Plan (Blood Pressure)</option>
                      <option value="weight-gain">Weight Gain (The Weight Gain)</option>
                      <option value="healthy-eating">Healthy Eating (Back to Basics)</option>
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>

                  {/* Selected Plan 20% Preview Pill */}
                  {answers.selected_plan && DISCOUNT_PLANS[answers.selected_plan] && (
                    <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs animate-fadeIn mt-2.5">
                      <div className="flex items-center gap-2">
                        <Tag size={15} className="text-blue-600 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-blue-950">
                            {DISCOUNT_PLANS[answers.selected_plan].planTitle}
                          </span>
                          <span className="text-blue-700 ml-1.5 font-medium">
                            • Code: <strong className="font-mono font-bold text-blue-900 bg-white px-1.5 py-0.5 rounded border border-blue-200">{DISCOUNT_PLANS[answers.selected_plan].code}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-gray-400 line-through text-[11px] mr-1">
                          {DISCOUNT_PLANS[answers.selected_plan].normalPrice}
                        </span>
                        <span className="text-blue-800 font-extrabold text-xs">
                          {DISCOUNT_PLANS[answers.selected_plan].discountPrice}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Email Input Field */}
                <div id="q-email" className="space-y-2">
                  <label
                    htmlFor="survey-email-input"
                    className="block text-xs sm:text-sm font-bold text-gray-800"
                  >
                    Enter your email address: <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="survey-email-input"
                      type="email"
                      required
                      value={answers.email}
                      onChange={(e) => handleTextChange("email", e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full px-4 py-3.5 pl-11 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400 bg-gray-50/50 focus:bg-white"
                    />
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                    <span>
                      We'll send your 20% coupon & Paystack link to this email • Free weekly newsletter • No spam
                    </span>
                  </div>
                </div>
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
                      Submitting & Subscribing...
                    </>
                  ) : (
                    <>
                      <span>Submit Survey & Claim 20% Code</span>
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  DietWithDee values your privacy. Your email will be kept secure.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
