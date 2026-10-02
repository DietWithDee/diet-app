import React, { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import {
  Loader2,
  Trash2,
  FileSpreadsheet,
  Clock,
  Sparkles,
  BarChart3,
  MessageSquare,
  Gift,
  CheckCircle,
  Mail,
  Send,
  Search,
  ExternalLink,
  Flame,
  Lightbulb,
  Target,
  Users,
  Copy,
  Check,
  TrendingUp,
  AlertTriangle,
  HeartHandshake,
  Share2,
  Star,
} from "lucide-react";

export default function SurveysPanel() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("leads"); // "leads" | "analytics" | "feedback" | "log"
  const [searchQuery, setSearchQuery] = useState("");
  const [goalFilter, setGoalFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, "surveys"), orderBy("submittedAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setSurveys(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching surveys:", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this survey submission?")) {
      try {
        await deleteDoc(doc(db, "surveys", id));
      } catch (err) {
        console.error("Failed to delete survey:", err);
      }
    }
  };

  const handleCopyEmail = (email, id) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Helper for computing breakdown percentages
  const computeBreakdown = (fieldKey) => {
    const counts = {};
    surveys.forEach((s) => {
      const val = s.answers?.[fieldKey];
      if (Array.isArray(val)) {
        val.forEach((item) => {
          counts[item] = (counts[item] || 0) + 1;
        });
      } else if (val) {
        counts[val] = (counts[val] || 0) + 1;
      }
    });
    return counts;
  };

  const goalCounts = useMemo(() => computeBreakdown("goal"), [surveys]);
  const planAwarenessCounts = useMemo(() => computeBreakdown("plan_awareness"), [surveys]);
  const planHesitationCounts = useMemo(() => computeBreakdown("plan_hesitation"), [surveys]);
  const planCatalystCounts = useMemo(() => computeBreakdown("plan_catalyst"), [surveys]);
  const newsletterCounts = useMemo(() => computeBreakdown("newsletter_readership"), [surveys]);
  const sharingCounts = useMemo(() => computeBreakdown("sharing_habits"), [surveys]);
  const myJourneyCounts = useMemo(() => computeBreakdown("my_journey_usage"), [surveys]);

  // Usability score (1 to 5 scale)
  const websiteEaseStats = useMemo(() => {
    let totalScore = 0;
    let ratedCount = 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    surveys.forEach((s) => {
      const val = Number(s.answers?.website_ease);
      if (val >= 1 && val <= 5) {
        totalScore += val;
        ratedCount += 1;
        distribution[val] = (distribution[val] || 0) + 1;
      }
    });

    const average = ratedCount > 0 ? (totalScore / ratedCount).toFixed(1) : "N/A";
    return { average, ratedCount, distribution };
  }, [surveys]);

  const totalCount = surveys.length;
  const withFeedbackCount = surveys.filter((s) => s.answers?.feedback).length;

  // Active newsletter readers (% who read regularly or sometimes)
  const activeReadersCount =
    (newsletterCounts["reads-regularly"] || 0) + (newsletterCounts["reads-sometimes"] || 0);
  const activeReaderPct = totalCount ? Math.round((activeReadersCount / totalCount) * 100) : 0;

  // People sharing (% who share often or once/twice)
  const sharingPeopleCount =
    (sharingCounts["shares-often"] || 0) + (sharingCounts["shares-once-twice"] || 0);
  const sharingPct = totalCount ? Math.round((sharingPeopleCount / totalCount) * 100) : 0;

  // Unaware of plans / consultations
  const unawareCount = planAwarenessCounts["didnt-know"] || 0;
  const unawarePct = totalCount ? Math.round((unawareCount / totalCount) * 100) : 0;

  // Find top hesitation
  const topHesitationEntry = Object.entries(planHesitationCounts).sort((a, b) => b[1] - a[1])[0];
  const topGoalEntry = Object.entries(goalCounts).sort((a, b) => b[1] - a[1])[0];
  const topCatalystEntry = Object.entries(planCatalystCounts).sort((a, b) => b[1] - a[1])[0];

  // Dynamic Actionable Recommendations
  const actionableRecommendations = useMemo(() => {
    if (!totalCount) return [];
    const list = [];

    // Usability Recommendation
    if (websiteEaseStats.ratedCount > 0 && websiteEaseStats.average !== "N/A") {
      const avg = parseFloat(websiteEaseStats.average);
      if (avg < 3.8) {
        list.push({
          type: "usability",
          title: `Website Ease Rating is Low (${avg} / 5.0)`,
          action: "Visitors are experiencing friction or confusion navigating the site. Prioritize simplifying the mobile menu and making Meal Plan and WhatsApp booking buttons larger and more prominent.",
          badge: "UX Friction Alert",
          color: "rose",
        });
      } else if (avg >= 4.5) {
        list.push({
          type: "usability",
          title: `High Website Usability (${avg} / 5.0 ⭐)`,
          action: "Visitors find the website smooth and effortless. Sales bottlenecks are not due to site navigation, so focus on pricing tiers, sample plan previews, and WhatsApp direct consultation links.",
          badge: "UX Strength",
          color: "emerald",
        });
      }
    }

    // 1. Sales barrier recommendation
    if (topHesitationEntry) {
      const [barrier, count] = topHesitationEntry;
      const pct = Math.round((count / totalCount) * 100);
      if (barrier === "price") {
        list.push({
          type: "sales",
          title: `Price is the #1 Barrier (${pct}% of visitors)`,
          action: "Consider launching a ₵99 introductory starter meal guide, or offering a 2-part split payment on 1-on-1 consultations to capture budget-sensitive buyers.",
          badge: "Revenue Boost",
          color: "amber",
        });
      } else if (barrier === "plan-fit") {
        list.push({
          type: "sales",
          title: `Visitors can't figure out which plan fits them (${pct}%)`,
          action: "Add a quick 3-question 'Find My Plan' quiz on the /plans page or invite them to a free 5-minute WhatsApp matching chat.",
          badge: "Conversion Fix",
          color: "blue",
        });
      } else if (barrier === "unclear-value") {
        list.push({
          type: "sales",
          title: `Unclear on what happens in a consultation (${pct}%)`,
          action: "Add a 3-step 'What happens in your consultation' visual breakdown or a 60-second video with Nana Ama explaining the session.",
          badge: "Clarity Fix",
          color: "purple",
        });
      } else if (barrier === "try-free-first") {
        list.push({
          type: "sales",
          title: `Trying free tips first (${pct}%)`,
          action: "Embed subtle plan upgrade links at the end of every blog post (e.g. 'Love this recipe? Get the full 14-day customized meal plan here').",
          badge: "Content Sales",
          color: "emerald",
        });
      }
    }

    // 2. Catalysts recommendation
    if (topCatalystEntry) {
      const [catalyst, count] = topCatalystEntry;
      const pct = Math.round((count / totalCount) * 100);
      if (catalyst === "sample-preview") {
        list.push({
          type: "preview",
          title: `${pct}% want to see a 1-day sample meal plan before buying`,
          action: "Put a 1-day downloadable sample PDF preview on the /plans page for each plan. It proves value and builds trust instantly.",
          badge: "High Impact",
          color: "emerald",
        });
      } else if (catalyst === "free-chat") {
        list.push({
          type: "chat",
          title: `${pct}% want a free 5-min WhatsApp discovery chat`,
          action: "Add a prominent button on the plans page: 'Not sure which plan to choose? Tap for a 5-min WhatsApp guidance chat with Dee'.",
          badge: "Lead Closer",
          color: "green",
        });
      }
    }

    // 3. Goal content alignment
    if (topGoalEntry) {
      const [goal, count] = topGoalEntry;
      const pct = Math.round((count / totalCount) * 100);
      const goalLabels = {
        "weight-loss": "Weight Loss & Toning",
        "diabetes": "Blood Sugar & Diabetes Management",
        "hypertension": "High Blood Pressure Management",
        "weight-gain": "Healthy Weight Gain",
        "healthy-habits": "Healthy Ghanaian Meal Ideas",
      };
      list.push({
        type: "content",
        title: `Primary Audience Goal: ${goalLabels[goal] || goal} (${pct}%)`,
        action: `Focus your upcoming 2 newsletter issues and social media reels specifically on ${goalLabels[goal] || goal}. It matches what the majority is looking for right now.`,
        badge: "Content Alignment",
        color: "teal",
      });
    }

    // 4. Awareness recommendation
    if (unawarePct >= 20) {
      list.push({
        type: "awareness",
        title: `${unawarePct}% of visitors didn't know you offer custom plans & consultations`,
        action: "Add a clear announcement banner in your newsletter header and link to /plans at the top of every blog article.",
        badge: "Awareness Gap",
        color: "rose",
      });
    }

    // 5. My Journey adoption
    const neverUsedJourney = (myJourneyCounts["never-heard"] || 0) + (myJourneyCounts["seen-not-used"] || 0);
    const journeyGapPct = totalCount ? Math.round((neverUsedJourney / totalCount) * 100) : 0;
    if (journeyGapPct >= 35) {
      list.push({
        type: "journey",
        title: `${journeyGapPct}% have never used the 'My Journey' BMI tool`,
        action: "Promote 'My Journey' with a dedicated email: 'Calculate your BMI & caloric needs in 60 seconds with our free tool'.",
        badge: "Engagement",
        color: "indigo",
      });
    }

    return list;
  }, [totalCount, topHesitationEntry, topCatalystEntry, topGoalEntry, unawarePct, myJourneyCounts]);

  // Filtered Leads
  const filteredSurveys = useMemo(() => {
    return surveys.filter((s) => {
      const email = s.email || s.answers?.contact || "";
      const matchesSearch =
        searchQuery === "" ||
        email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.answers?.feedback || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGoal = goalFilter === "all" || s.answers?.goal === goalFilter;
      return matchesSearch && matchesGoal;
    });
  }, [surveys, searchQuery, goalFilter]);

  // Export CSV
  const exportCSV = () => {
    if (!surveys.length) return;
    const headers = [
      "Submission ID",
      "Date",
      "Email (Subscriber)",
      "Goal",
      "Plan Awareness",
      "Hesitation Reason",
      "Buying Catalysts",
      "Website Ease (1-5)",
      "Newsletter Readership",
      "Sharing Habits",
      "My Journey Usage",
      "Feedback Text",
    ];

    const rows = surveys.map((s) => [
      s.id,
      s.submittedAt?.toDate?.()?.toISOString() || "N/A",
      `"${s.email || s.answers?.contact || ""}"`,
      `"${s.answers?.goal || ""}"`,
      `"${s.answers?.plan_awareness || ""}"`,
      `"${s.answers?.plan_hesitation || ""}"`,
      `"${(s.answers?.plan_catalyst || []).join(", ")}"`,
      `"${s.answers?.website_ease || "N/A"}"`,
      `"${s.answers?.newsletter_readership || ""}"`,
      `"${s.answers?.sharing_habits || ""}"`,
      `"${s.answers?.my_journey_usage || ""}"`,
      `"${(s.answers?.feedback || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dietwithdee-survey-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate Personalized Outreach Mailto link
  const generateMailto = (survey) => {
    const email = survey.email || survey.answers?.contact || "";
    if (!email) return "#";

    const goalName =
      survey.answers?.goal === "weight-loss"
        ? "weight loss & toning"
        : survey.answers?.goal === "diabetes"
        ? "managing blood sugar / diabetes"
        : survey.answers?.goal === "hypertension"
        ? "managing blood pressure"
        : survey.answers?.goal === "weight-gain"
        ? "healthy weight gain"
        : "healthy eating with Ghanaian foods";

    const subject = encodeURIComponent("Thank you for your DietWithDee feedback — quick note from Dee!");
    const body = encodeURIComponent(
      `Hi there,\n\nThank you so much for taking a moment to complete our DietWithDee survey! I noticed your main health goal is ${goalName}.\n\nI saw your note regarding our meal plans and consultations. If you ever have any questions about which plan fits your daily routine best, or if you'd like a quick 5-minute chat to get clear guidance, please feel free to reply to this email or reach out on WhatsApp at +233 59 233 0870.\n\nAlso, don't forget you can use code SURVEY15 for 15% off any plan or consultation at checkout!\n\nWarm regards,\nNana Ama Dwamena (Dee)\nRegistered Dietitian, DietWithDee`
    );

    return `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const getGoalBadgeColor = (goal) => {
    switch (goal) {
      case "weight-loss":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "diabetes":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "hypertension":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "weight-gain":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <BarChart3 size={20} />
              </span>
              <h2 className="text-xl font-black text-gray-900">Survey Results & Action Center</h2>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {totalCount} Responses
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Direct insights and warm leads to increase meal plan sales and consultation bookings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={() => setActiveTab("leads")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "leads"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Users size={14} />
              Hot Leads ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <BarChart3 size={14} />
              Visual Breakdown
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "feedback"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <MessageSquare size={14} />
              Suggestions ({withFeedbackCount})
            </button>
            {totalCount > 0 && (
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <FileSpreadsheet size={14} />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* 5 Quick Stat KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-6">
          <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              <span>Submissions</span>
              <Users size={16} />
            </div>
            <p className="text-2xl font-black text-emerald-950">{totalCount}</p>
            <p className="text-xs text-emerald-700/80 mt-1">Auto-subscribed</p>
          </div>

          <div className="bg-amber-50/60 border border-amber-100/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
              <span>Top Barrier</span>
              <AlertTriangle size={16} />
            </div>
            <p className="text-lg font-black text-amber-950 capitalize truncate">
              {topHesitationEntry ? topHesitationEntry[0].replace(/-/g, " ") : "N/A"}
            </p>
            <p className="text-xs text-amber-700/80 mt-1">
              {topHesitationEntry
                ? `${Math.round((topHesitationEntry[1] / totalCount) * 100)}% of visitors`
                : "No data"}
            </p>
          </div>

          <div className="bg-blue-50/60 border border-blue-100/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
              <span>Website Ease</span>
              <Star size={16} />
            </div>
            <p className="text-2xl font-black text-blue-950 flex items-baseline gap-1">
              <span>{websiteEaseStats.average}</span>
              <span className="text-xs text-blue-600 font-bold">/ 5.0</span>
            </p>
            <p className="text-xs text-blue-700/80 mt-1">
              {websiteEaseStats.ratedCount} ratings recorded
            </p>
          </div>

          <div className="bg-teal-50/60 border border-teal-100/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
              <span>Newsletter Read</span>
              <Mail size={16} />
            </div>
            <p className="text-2xl font-black text-teal-950">{activeReaderPct}%</p>
            <p className="text-xs text-teal-700/80 mt-1">Regular or casual</p>
          </div>

          <div className="bg-purple-50/60 border border-purple-100/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">
              <span>Sharing Rate</span>
              <Share2 size={16} />
            </div>
            <p className="text-2xl font-black text-purple-950">{sharingPct}%</p>
            <p className="text-xs text-purple-700/80 mt-1">Share with friends</p>
          </div>
        </div>
      </div>

      {/* Actionable Recommendations Engine */}
      {actionableRecommendations.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={20} className="text-yellow-400 animate-pulse" />
            <h3 className="text-base font-black tracking-wide text-white uppercase">
              Action Steps for Dee & Team (Based on Results)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {actionableRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-4 hover:bg-white/15 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    {rec.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{rec.title}</h4>
                <p className="text-xs text-emerald-100/90 leading-relaxed">{rec.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl p-16 flex flex-col items-center justify-center text-gray-400 shadow-sm border">
          <Loader2 size={32} className="animate-spin text-emerald-600 mb-2" />
          <span className="text-sm">Loading survey responses...</span>
        </div>
      ) : totalCount === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center text-gray-500 shadow-sm border">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-bold text-gray-800 text-lg">No survey submissions yet</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto mt-1 mb-5">
            Share <span className="font-mono text-emerald-600 font-bold">dietwithdee.org/survey</span> in your newsletters, WhatsApp status, or Instagram bio to start getting responses!
          </p>
          <a
            href="/survey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-sm hover:bg-emerald-700"
          >
            Preview Survey Page <ExternalLink size={14} />
          </a>
        </div>
      ) : (
        <>
          {/* TAB 1: ACTIONABLE LEADS */}
          {activeTab === "leads" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              {/* Search & Filter bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by email or note..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-gray-500 font-medium">Filter Goal:</span>
                  <select
                    value={goalFilter}
                    onChange={(e) => setGoalFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="all">All Health Goals</option>
                    <option value="weight-loss">Weight Loss</option>
                    <option value="diabetes">Diabetes / Blood Sugar</option>
                    <option value="hypertension">High Blood Pressure</option>
                    <option value="weight-gain">Weight Gain</option>
                    <option value="healthy-habits">Healthy Ghanaian Meals</option>
                  </select>
                </div>
              </div>

              {/* Leads Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 pr-4">Lead Email</th>
                      <th className="pb-3 px-3">Primary Goal</th>
                      <th className="pb-3 px-3">Main Hesitation</th>
                      <th className="pb-3 px-3">What They Want</th>
                      <th className="pb-3 px-3">Ease (1-5)</th>
                      <th className="pb-3 px-3">Feedback</th>
                      <th className="pb-3 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSurveys.map((s) => {
                      const email = s.email || s.answers?.contact || "Anonymous";
                      return (
                        <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3.5 pr-4 font-mono font-medium text-gray-800">
                            <div className="flex items-center gap-1.5">
                              <Mail size={13} className="text-emerald-600 flex-shrink-0" />
                              <span className="truncate max-w-[160px] sm:max-w-none">{email}</span>
                            </div>
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              {s.submittedAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getGoalBadgeColor(
                                s.answers?.goal
                              )}`}
                            >
                              {s.answers?.goal ? s.answers.goal.replace(/-/g, " ") : "Not set"}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 font-medium text-gray-700 capitalize">
                            {s.answers?.plan_hesitation ? s.answers.plan_hesitation.replace(/-/g, " ") : "N/A"}
                          </td>

                          <td className="py-3.5 px-3 text-gray-600">
                            {s.answers?.plan_catalyst && s.answers.plan_catalyst.length > 0 ? (
                              <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-medium text-gray-700">
                                {s.answers.plan_catalyst.join(", ").replace(/-/g, " ")}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-3">
                            {s.answers?.website_ease ? (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                                  s.answers.website_ease >= 4
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : s.answers.website_ease === 3
                                    ? "bg-gray-100 text-gray-700 border-gray-200"
                                    : "bg-rose-50 text-rose-800 border-rose-200 font-black"
                                }`}
                              >
                                ⭐ {s.answers.website_ease}/5
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-3 max-w-[200px]">
                            {s.answers?.feedback ? (
                              <span className="text-gray-700 italic truncate block" title={s.answers.feedback}>
                                "{s.answers.feedback}"
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          <td className="py-3.5 pl-4 text-right space-x-1 whitespace-nowrap">
                            {email !== "Anonymous" && (
                              <a
                                href={generateMailto(s)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                                title="Send personalized email"
                              >
                                <Send size={11} />
                                Outreach
                              </a>
                            )}
                            <button
                              onClick={() => handleCopyEmail(email, s.id)}
                              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Copy email"
                            >
                              {copiedId === s.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                            </button>
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete submission"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: VISUAL ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Question 1: Health Goals */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-sm">Primary Health Goals</h3>
                  <Target size={16} className="text-emerald-600" />
                </div>
                <div className="space-y-3">
                  {Object.entries(goalCounts).map(([key, count]) => {
                    const pct = Math.round((count / totalCount) * 100);
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-gray-700">
                          <span className="capitalize">{key.replace(/-/g, " ")}</span>
                          <span className="text-emerald-700">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Question 3: Plan Hesitation (The Obstacle) */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-sm">Why People Haven't Bought Plans</h3>
                  <AlertTriangle size={16} className="text-amber-500" />
                </div>
                <div className="space-y-3">
                  {Object.entries(planHesitationCounts).map(([key, count]) => {
                    const pct = Math.round((count / totalCount) * 100);
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-gray-700">
                          <span className="capitalize">{key.replace(/-/g, " ")}</span>
                          <span className="text-amber-700">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Question 4: Buying Catalysts */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-sm">What Would Win Them Over (Catalysts)</h3>
                  <Sparkles size={16} className="text-purple-600" />
                </div>
                <div className="space-y-3">
                  {Object.entries(planCatalystCounts).map(([key, count]) => {
                    const pct = Math.round((count / totalCount) * 100);
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-gray-700">
                          <span className="capitalize">{key.replace(/-/g, " ")}</span>
                          <span className="text-purple-700">{count} votes ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Question 2: Awareness */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-sm">Awareness of Plans & Consultations</h3>
                  <Users size={16} className="text-blue-600" />
                </div>
                <div className="space-y-3">
                  {Object.entries(planAwarenessCounts).map(([key, count]) => {
                    const pct = Math.round((count / totalCount) * 100);
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-gray-700">
                          <span className="capitalize">{key.replace(/-/g, " ")}</span>
                          <span className="text-blue-700">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Question 5: Newsletter Readership */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-sm">Newsletter Readership</h3>
                  <Mail size={16} className="text-teal-600" />
                </div>
                <div className="space-y-3">
                  {Object.entries(newsletterCounts).map(([key, count]) => {
                    const pct = Math.round((count / totalCount) * 100);
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-gray-700">
                          <span className="capitalize">{key.replace(/-/g, " ")}</span>
                          <span className="text-teal-700">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-teal-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Question 7: My Journey Adoption */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-sm">"My Journey" Tracker Usage</h3>
                  <TrendingUp size={16} className="text-green-600" />
                </div>
                <div className="space-y-3">
                  {Object.entries(myJourneyCounts).map(([key, count]) => {
                    const pct = Math.round((count / totalCount) * 100);
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-gray-700">
                          <span className="capitalize">{key.replace(/-/g, " ")}</span>
                          <span className="text-green-700">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-green-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Question 8: Website Usability (1-5 Scale) */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Website Usability (1 to 5 Scale)</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Average Score: <strong className="text-blue-700">{websiteEaseStats.average} / 5.0 ⭐</strong> ({websiteEaseStats.ratedCount} ratings)</p>
                  </div>
                  <Star size={16} className="text-blue-600" />
                </div>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = websiteEaseStats.distribution[rating] || 0;
                    const pct = websiteEaseStats.ratedCount ? Math.round((count / websiteEaseStats.ratedCount) * 100) : 0;
                    const label =
                      rating === 5
                        ? "5 Stars - Very Easy"
                        : rating === 4
                        ? "4 Stars - Easy"
                        : rating === 3
                        ? "3 Stars - Okay / Average"
                        : rating === 2
                        ? "2 Stars - Difficult"
                        : "1 Star - Very Difficult";
                    return (
                      <div key={rating} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-gray-700">
                          <span>{label}</span>
                          <span className="text-blue-700">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              rating >= 4 ? "bg-emerald-500" : rating === 3 ? "bg-blue-500" : "bg-rose-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER FEEDBACK QUOTES */}
          {activeTab === "feedback" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {surveys
                  .filter((s) => s.answers?.feedback)
                  .map((s) => (
                    <div
                      key={s.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-emerald-200 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-3 pb-2 border-b border-gray-50">
                          <span className="font-bold text-gray-600">{s.email || "Subscriber"}</span>
                          <span>{s.submittedAt?.toDate?.()?.toLocaleDateString() || "Recently"}</span>
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed italic mb-4">
                          "{s.answers.feedback}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getGoalBadgeColor(s.answers?.goal)}`}>
                          Goal: {s.answers?.goal?.replace(/-/g, " ") || "General"}
                        </span>
                        {s.email && (
                          <a
                            href={generateMailto(s)}
                            className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                          >
                            <Mail size={12} />
                            Reply to Idea
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              {surveys.filter((s) => s.answers?.feedback).length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border">
                  <MessageSquare size={36} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm">No written suggestions submitted yet.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
