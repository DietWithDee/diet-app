import React from "react";
import { Search, X, Sparkles } from "lucide-react";

export default function PlanSearchBar({
  searchQuery,
  setSearchQuery,
  suggestions = [
    "Weight Loss",
    "Diabetes",
    "Hypertension",
    "Weight Gain",
    "5-Day Reset",
    "Blood Sugar",
    "Heart Health",
    "Clean Eating"
  ],
  resultsCount = 0,
  totalCount = 0,
}) {
  const hasQuery = searchQuery.trim().length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto mb-10 px-2 sm:px-0">
      {/* Search Input Box */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-emerald-600">
          <Search className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-focus-within:scale-110 duration-200" />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by goal or condition (e.g. Weight loss, Diabetes, Hypertension)..."
          className="w-full pl-12 sm:pl-14 pr-12 py-3.5 sm:py-4 bg-white/90 backdrop-blur-sm border-2 border-emerald-100/90 rounded-2xl shadow-sm hover:shadow-md focus:shadow-lg focus:border-emerald-500 focus:outline-none text-gray-800 placeholder-gray-400 text-sm sm:text-base font-medium transition-all duration-200"
          aria-label="Search diet plans"
        />

        {hasQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-700 transition-colors"
            title="Clear search"
          >
            <span className="p-1 rounded-full hover:bg-gray-100">
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          </button>
        )}
      </div>

      {/* Suggested Search Chips */}
      <div className="mt-3 flex items-center flex-wrap gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-800/70 mr-1 select-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Suggestions:</span>
        </div>

        {suggestions.map((suggestion) => {
          const isSelected =
            searchQuery.trim().toLowerCase() === suggestion.toLowerCase();

          return (
            <button
              key={suggestion}
              type="button"
              onClick={() =>
                setSearchQuery(isSelected ? "" : suggestion)
              }
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer select-none border ${
                isSelected
                  ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white border-emerald-600 shadow-sm scale-105"
                  : "bg-white/80 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 border-emerald-100/80 hover:border-emerald-300"
              }`}
            >
              {suggestion}
            </button>
          );
        })}
      </div>

      {/* Live Result Feedback Banner */}
      {hasQuery && (
        <div className="mt-3 flex items-center justify-between text-xs sm:text-sm px-2 text-gray-600 transition-all duration-200">
          {resultsCount > 0 ? (
            <span>
              Found <strong className="text-emerald-700 font-bold">{resultsCount}</strong> match{resultsCount > 1 ? "es" : ""} for &ldquo;<span className="text-emerald-800 font-semibold">{searchQuery}</span>&rdquo; &mdash; top matches shown first ({totalCount} total plans)
            </span>
          ) : (
            <span className="text-amber-700">
              No exact matches for &ldquo;<span className="font-semibold">{searchQuery}</span>&rdquo; &mdash; showing all {totalCount} plans below
            </span>
          )}
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-xs text-emerald-600 hover:text-emerald-800 font-bold hover:underline cursor-pointer ml-2 shrink-0"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

