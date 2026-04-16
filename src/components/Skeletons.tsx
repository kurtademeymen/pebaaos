"use client";
import { motion } from "framer-motion";

export function SkeletonPulse({ className }: { className?: string }) {
  return (
    <motion.div
      className={`bg-primary/10 rounded-md overflow-hidden relative ${className}`}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        animate={{
          translateX: ["-100%", "200%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="flex flex-col h-full border border-border/40 shadow-sm bg-card/40 backdrop-blur-sm rounded-xl p-6 gap-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 w-full">
          <SkeletonPulse className="h-6 w-3/4" />
          <div className="flex gap-2">
            <SkeletonPulse className="h-5 w-20 rounded-full" />
            <SkeletonPulse className="h-5 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div className="space-y-2 mt-2">
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-5/6" />
      </div>
      <div className="mt-4 space-y-3">
        <SkeletonPulse className="h-3 w-1/3" />
        <div className="flex gap-2">
          <SkeletonPulse className="h-6 w-16" />
          <SkeletonPulse className="h-6 w-20" />
          <SkeletonPulse className="h-6 w-14" />
        </div>
      </div>
      <div className="mt-auto pt-4 border-t border-border/40 flex justify-between">
        <SkeletonPulse className="h-4 w-32" />
        <SkeletonPulse className="h-8 w-24" />
      </div>
    </div>
  );
}
