import React from "react";

export default function PlanCardSkeleton() {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-emerald-100/80 flex flex-col justify-between relative shadow-lg animate-shimmer overflow-hidden">
      <div>
        {/* Top Header: Badge & Price Skeleton */}
        <div className="flex items-center justify-between mb-2">
          <div className="w-24 h-5 bg-emerald-100/80 rounded-full animate-shimmer"></div>
          <div className="w-16 h-6 bg-stone-200 rounded-md animate-shimmer"></div>
        </div>

        {/* Title & Subtitle Skeleton */}
        <div className="h-6 bg-stone-200 rounded-lg w-3/4 mb-1.5 animate-shimmer"></div>
        <div className="h-4 bg-emerald-100/70 rounded-md w-1/2 mb-3.5 animate-shimmer"></div>

        {/* Visual Asset Container Skeleton */}
        <div className="w-full h-44 sm:h-48 bg-stone-200/70 rounded-2xl flex items-center justify-center mb-4 border border-stone-200/60 overflow-hidden animate-shimmer">
          <div className="w-16 h-16 bg-white/40 rounded-full"></div>
        </div>

        {/* Tag Pills Skeleton */}
        <div className="flex items-center gap-1.5 mb-3.5">
          <div className="w-14 h-4 bg-emerald-50 rounded-md animate-shimmer"></div>
          <div className="w-16 h-4 bg-emerald-50 rounded-md animate-shimmer"></div>
          <div className="w-12 h-4 bg-emerald-50 rounded-md animate-shimmer"></div>
        </div>

        {/* Feature Checklist Skeleton */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-100 shrink-0"></div>
            <div className="h-3.5 bg-stone-100 rounded w-5/6 animate-shimmer"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-100 shrink-0"></div>
            <div className="h-3.5 bg-stone-100 rounded w-4/6 animate-shimmer"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-100 shrink-0"></div>
            <div className="h-3.5 bg-stone-100 rounded w-3/4 animate-shimmer"></div>
          </div>
        </div>
      </div>

      {/* Action Row Skeleton */}
      <div className="flex gap-2.5 pt-3 border-t border-gray-100">
        <div className="flex-1 h-12 bg-gradient-to-r from-orange-300/80 to-orange-400/80 rounded-2xl animate-shimmer"></div>
        <div className="w-12 h-12 bg-stone-100 rounded-2xl shrink-0 animate-shimmer"></div>
      </div>
    </div>
  );
}
