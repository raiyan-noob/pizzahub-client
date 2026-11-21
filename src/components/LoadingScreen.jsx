"use client";

import React from "react";
import { Pizza } from "lucide-react";

export function LoadingScreen({ message = "Firing up the wood ovens...", fullScreen = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-4 select-none ${
        fullScreen ? "fixed inset-0 z-50 bg-[#faf7f2]/90 dark:bg-stone-950/90 backdrop-blur-md" : "min-h-[65vh] w-full"
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Ambient Warm Glow */}
        <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-red-600/20 via-amber-500/20 to-orange-500/20 blur-2xl absolute -top-4 animate-pulse pointer-events-none" />

        {/* Animated Brand Badge */}
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-red-500/30">
          {/* Dashed Spinning Outer Ring */}
          <div className="absolute -inset-1.5 rounded-3xl border-2 border-dashed border-amber-400/60 animate-spin" style={{ animationDuration: "12s" }} />

          {/* Pizza Icon with Pulse */}
          <Pizza className="w-10 h-10 text-white animate-pulse" />
        </div>

        {/* Brand Name & Loading Message */}
        <div className="mt-6 space-y-2">
          <h3 className="text-xl font-black tracking-tight text-stone-900 dark:text-stone-100">
            <span className="bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
              PizzaHub
            </span>
          </h3>
          <p className="text-sm font-medium text-stone-600 dark:text-stone-400 max-w-xs mx-auto">
            {message}
          </p>
        </div>

        {/* Staggered Dough Dots */}
        <div className="flex items-center gap-1.5 mt-4">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
