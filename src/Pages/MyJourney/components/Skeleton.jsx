import React from 'react';
import { motion } from 'framer-motion';

const SkeletonPulse = ({ className }) => (
  <motion.div
    className={`bg-gray-200 rounded-lg ${className}`}
    animate={{
      opacity: [1, 0.5, 1],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const MyJourneySkeleton = () => {
  return (
    <div className="container mx-auto px-6 lg:px-12 pt-4 pb-12 relative z-20 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="max-w-5xl mx-auto mb-8 space-y-3">
        <SkeletonPulse className="w-32 h-3" />
        <SkeletonPulse className="w-64 h-10" />
        <SkeletonPulse className="w-16 h-1 rounded-full" />
      </div>

      {/* Progress Chart Skeleton */}
      <div className="max-w-5xl mx-auto space-y-2">
        <SkeletonPulse className="w-40 h-3" />
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-64 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <SkeletonPulse className="w-32 h-6" />
            <SkeletonPulse className="w-24 h-8 rounded-full" />
          </div>
          <div className="flex-1 flex items-end gap-3 px-4 pt-8">
            {[...Array(7)].map((_, i) => (
              <SkeletonPulse 
                key={i} 
                className="flex-1 rounded-t-xl" 
                style={{ height: `${20 + Math.random() * 60}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Button Skeleton */}
      <div className="flex justify-center py-4">
        <SkeletonPulse className="w-56 h-12 rounded-full" />
      </div>

      {/* Plan Recommendation Skeleton */}
      <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <SkeletonPulse className="w-12 h-12 rounded-2xl" />
          <div className="space-y-2">
            <SkeletonPulse className="w-48 h-6" />
            <SkeletonPulse className="w-32 h-3" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <SkeletonPulse className="h-32 rounded-2xl" />
          <SkeletonPulse className="h-32 rounded-2xl" />
        </div>
      </div>

      {/* Section Row Skeletons */}
      {[...Array(2)].map((_, idx) => (
        <div key={idx} className="max-w-5xl mx-auto space-y-4">
          <SkeletonPulse className="w-40 h-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
                <SkeletonPulse className="w-full aspect-video rounded-xl" />
                <SkeletonPulse className="w-3/4 h-4" />
                <SkeletonPulse className="w-1/2 h-3" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyJourneySkeleton;
