import React from 'react';

const SkeletonPulse = ({ className }) => (
  <div className={`bg-stone-200/80 animate-pulse rounded-xl ${className}`} />
);

const MyJourneySkeleton = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      <div className="space-y-3">
        <SkeletonPulse className="w-28 h-3" />
        <SkeletonPulse className="w-64 h-9" />
        <SkeletonPulse className="w-48 h-4" />
      </div>

      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <SkeletonPulse className="w-36 h-3" />
            <SkeletonPulse className="w-56 h-6" />
          </div>
          <SkeletonPulse className="w-24 h-7 rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <SkeletonPulse className="h-14" />
          <SkeletonPulse className="h-14" />
          <SkeletonPulse className="h-14" />
        </div>
        <SkeletonPulse className="h-20" />
      </div>

      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
        <SkeletonPulse className="w-44 h-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SkeletonPulse className="h-20" />
          <SkeletonPulse className="h-20" />
          <SkeletonPulse className="h-20" />
          <SkeletonPulse className="h-20" />
        </div>
      </div>
    </div>
  );
};

export default MyJourneySkeleton;
