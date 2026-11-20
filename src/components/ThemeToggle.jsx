"use client";

import * as React from "react";
import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ className = "" }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-16 h-8 rounded-full bg-amber-100/60 dark:bg-stone-800 border border-amber-200/80 dark:border-stone-700 animate-pulse ${className}`} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      className={`group relative inline-flex items-center w-17 h-8.5 p-1 rounded-full border transition-all duration-300 focus:outline-hidden cursor-pointer select-none ${
        isDark
          ? "bg-stone-900 border-stone-700 shadow-inner"
          : "bg-amber-100/80 border-amber-200 shadow-xs hover:border-amber-300"
      } ${className}`}
    >
      {/* Sliding Knob with Icons */}
      <span
        className={`relative z-10 w-6.5 h-6.5 rounded-full flex items-center justify-center transition-all duration-300 transform shadow-md ${
          isDark
            ? "translate-x-8.5 bg-gradient-to-tr from-indigo-600 to-purple-600 text-amber-200 shadow-indigo-900/50"
            : "translate-x-0 bg-gradient-to-tr from-amber-400 via-orange-400 to-red-500 text-white shadow-amber-500/40"
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 fill-amber-200 text-amber-200 transform group-hover:-rotate-12 transition-transform duration-300" />
        ) : (
          <Sun className="w-3.5 h-3.5 fill-white text-white transform group-hover:rotate-45 transition-transform duration-300" />
        )}
      </span>

      {/* Background Icon Track */}
      <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] pointer-events-none">
        <Sun
          className={`w-3.5 h-3.5 transition-opacity duration-300 ${
            isDark ? "text-stone-600 opacity-60" : "text-amber-600 opacity-0"
          }`}
        />
        <Moon
          className={`w-3.5 h-3.5 transition-opacity duration-300 ${
            isDark ? "text-indigo-400 opacity-0" : "text-amber-700/60 opacity-60"
          }`}
        />
      </div>
    </button>
  );
}
