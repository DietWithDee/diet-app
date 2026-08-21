import React from "react";

export default function PlanCardSkeleton() {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-emerald-100/80 flex flex-col justify-between relative shadow-lg animate-pulse overflow-hidden">
      <div>
        {/* Top Header: Badge & Price Skeleton */}
        <div className="flex items-center justify-between mb-2">
          <div className="w-24 h-5 bg-emerald-100 rounded-full"></div>
          <div className="w-16 h-6 bg-gray-200 rounded-md"></div>
        </div>

        {/* Title & Subtitle Skeleton */}
        <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-1.5"></div>
        <div className="h-4 bg-emerald-100/70 rounded-md w-1/2 mb-3.5"></div>

        {/* Visual Asset Container Skeleton */}
        <div className="w-full h-44 sm:h-48 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100/60 overflow-hidden">
          <div className="w-20 h-20 bg-emerald-100/50 rounded-full"></div>
        </div>

        {/* Tag Pills Skeleton */}
        <div className="flex items-center gap-1.5 mb-3.5">
          <div className="w-14 h-4 bg-emerald-50 rounded-md"></div>
          <div className="w-16 h-4 bg-emerald-50 rounded-md"></div>
          <div className="w-12 h-4 bg-emerald-50 rounded-md"></div>
        </div>

        {/* Feature Checklist Skeleton */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-100 shrink-0"></div>
            <div className="h-3.5 bg-gray-100 rounded w-5/6"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-100 shrink-0"></div>
            <div className="h-3.5 bg-gray-100 rounded w-4/6"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-100 shrink-0"></div>
            <div className="h-3.5 bg-gray-100 rounded w-3/4"></div>
          </div>
        </div>
      </div>

      {/* Action Row Skeleton */}
      <div className="flex gap-2.5 pt-3 border-t border-gray-100">
        <div className="flex-1 h-12 bg-gradient-to-r from-orange-300 to-orange-400 rounded-2xl"></div>
        <div className="w-12 h-12 bg-gray-100 rounded-2xl shrink-0"></div>
      </div>
    </div>
  );
}
