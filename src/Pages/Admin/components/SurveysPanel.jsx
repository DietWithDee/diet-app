import React, { useState, useEffect } from "react";
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
  HelpCircle,
  MessageSquare,
  Gift,
  CheckCircle,
  UserCheck,
} from "lucide-react";

export default function SurveysPanel() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("analytics"); // "analytics" | "responses"

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

  const exportCSV = () => {
    if (!surveys.length) return;
    const headers = [
      "Submission ID",
      "Date",
      "Goal",
      "Plan Awareness",
      "Hesitation Reason",
      "Catalysts",
      "Newsletter Readership",
      "Sharing Habits",
      "My Journey Usage",
      "Feedback Text",
      "Contact Info",
    ];

    const rows = surveys.map((s) => [
      s.id,
      s.submittedAt?.toDate?.()?.toISOString() || "N/A",
      `"${s.answers?.goal || ""}"`,
      `"${s.answers?.plan_awareness || ""}"`,
      `"${s.answers?.plan_hesitation || ""}"`,
      `"${(s.answers?.plan_catalyst || []).join(", ")}"`,
      `"${s.answers?.newsletter_readership || ""}"`,
      `"${s.answers?.sharing_habits || ""}"`,
      `"${s.answers?.my_journey_usage || ""}"`,
      `"${(s.answers?.feedback || "").replace(/"/g, '""')}"`,
      `"${(s.answers?.contact || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dietwithdee-survey-responses-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metric summaries
  const totalCount = surveys.length;
  const withFeedback = surveys.filter((s) => s.answers?.feedback).length;
  const withContactLeads = surveys.filter((s) => s.answers?.contact).length;

  // Compute breakdown helper
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

  const planHesitationCounts = computeBreakdown("plan_hesitation");
  const planAwarenessCounts = computeBreakdown("plan_awareness");
  const newsletterCounts = computeBreakdown("newsletter_readership");
  const sharingCounts = computeBreakdown("sharing_habits");
  const myJourneyCounts = computeBreakdown("my_journey_usage");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-gray-900">Survey Responses</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {totalCount} Total
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Real-time customer feedback on plans, consultations, newsletters, and My Journey.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "analytics"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Analytics View
          </button>
          <button
            onClick={() => setActiveTab("responses")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "responses"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Submissions ({totalCount})
          </button>
          {totalCount > 0 && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm transition-colors ml-auto sm:ml-2"
            >
              <FileSpreadsheet size={14} />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
          <Loader2 size={32} className="animate-spin text-emerald-600 mb-2" />
          <span className="text-sm">Loading responses...</span>
        </div>
      ) : totalCount === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-bold text-gray-700 text-base">No responses yet</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto mt-1">
            Share <span className="font-mono text-emerald-600">/survey</span> in your newsletters, social media, or WhatsApp status to start collecting insights!
          </p>
        </div>
      ) : (
        <div className="mt-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Total Responses</span>
              <p className="text-2xl font-black text-emerald-950 mt-1">{totalCount}</p>
            </div>
            <div className="bg-green-50/50 border border-green-100 rounded-xl p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-green-700">Detailed Feedback Left</span>
              <p className="text-2xl font-black text-green-950 mt-1">{withFeedback}</p>
            </div>
            <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">New Contact Leads (15% Code)</span>
              <p className="text-2xl font-black text-teal-950 mt-1">{withContactLeads}</p>
            </div>
          </div>

          {activeTab === "analytics" ? (
            <div className="space-y-6">
              {/* Question 3: Plan Hesitation Breakdown */}
              <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/40">
                <h3 className="font-bold text-gray-900 text-sm mb-3">
                  Why People Haven't Bought Plans / Consultations
                </h3>
                <div className="space-y-2">
                  {Object.entries(planHesitationCounts).map(([key, count]) => {
                    const pct = Math.round((count / totalCount) * 100);
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-gray-700">
                          <span className="capitalize">{key.replace(/-/g, " ")}</span>
                          <span className="font-bold">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Newsletter & Journey Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/40">
                  <h3 className="font-bold text-gray-900 text-sm mb-3">Newsletter Readership</h3>
                  <div className="space-y-2">
                    {Object.entries(newsletterCounts).map(([key, count]) => {
                      const pct = Math.round((count / totalCount) * 100);
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium text-gray-700">
                            <span className="capitalize">{key.replace(/-/g, " ")}</span>
                            <span className="font-bold">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-teal-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/40">
                  <h3 className="font-bold text-gray-900 text-sm mb-3">"My Journey" Usage</h3>
                  <div className="space-y-2">
                    {Object.entries(myJourneyCounts).map(([key, count]) => {
                      const pct = Math.round((count / totalCount) * 100);
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium text-gray-700">
                            <span className="capitalize">{key.replace(/-/g, " ")}</span>
                            <span className="font-bold">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-green-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Submissions list */
            <div className="space-y-4">
              {surveys.map((s, idx) => (
                <div
                  key={s.id}
                  className="border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-all bg-white"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs text-gray-500 mb-3">
                    <span className="font-bold text-gray-700">Response #{totalCount - idx}</span>
                    <div className="flex items-center gap-3">
                      <span>{s.submittedAt?.toDate?.()?.toLocaleDateString() || "Recently"}</span>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete response"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
                    <div>
                      <span className="text-gray-400 block">Goal:</span>
                      <span className="font-semibold text-gray-800">{s.answers?.goal || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Plan Awareness:</span>
                      <span className="font-semibold text-gray-800">{s.answers?.plan_awareness || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Plan Hesitation:</span>
                      <span className="font-semibold text-emerald-800">{s.answers?.plan_hesitation || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Newsletter:</span>
                      <span className="font-semibold text-gray-800">{s.answers?.newsletter_readership || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Shared with Others:</span>
                      <span className="font-semibold text-gray-800">{s.answers?.sharing_habits || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">My Journey Used:</span>
                      <span className="font-semibold text-gray-800">{s.answers?.my_journey_usage || "N/A"}</span>
                    </div>
                  </div>

                  {s.answers?.feedback && (
                    <div className="bg-amber-50/60 border border-amber-200/60 rounded-lg p-3 text-xs text-amber-950 mb-2">
                      <span className="font-bold block mb-0.5 text-amber-900">Feedback suggestion:</span>
                      "{s.answers.feedback}"
                    </div>
                  )}

                  {s.answers?.contact && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-950 flex items-center justify-between">
                      <div>
                        <span className="font-bold block text-emerald-900">Contact Lead:</span>
                        <span className="font-mono">{s.answers.contact}</span>
                      </div>
                      <a
                        href={
                          s.answers.contact.includes("@")
                            ? `mailto:${s.answers.contact}`
                            : `https://wa.me/${s.answers.contact.replace(/[^0-9]/g, "")}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold"
                      >
                        Follow Up
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
