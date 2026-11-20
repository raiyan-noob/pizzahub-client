"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ className = "" }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className={`w-9 h-9 rounded-full flex items-center justify-center border border-amber-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 ${className}`}
      >
        <span className="w-4 h-4" />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle dark/light theme"
      className={`w-9 h-9 rounded-full flex items-center justify-center border border-amber-200/80 dark:border-stone-700/80 bg-amber-50/50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-200 hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-xs ${className}`}
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
    </button>
  );
}
