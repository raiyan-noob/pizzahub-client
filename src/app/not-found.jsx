"use client";

import React from "react";
import Link from "next/link";
import { Pizza, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-stone-50/70 dark:bg-stone-950 px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative w-28 h-28 mx-auto">
          <div className="w-full h-full rounded-3xl bg-red-100 dark:bg-red-950/70 flex items-center justify-center text-red-600 shadow-xl">
            <Pizza className="w-16 h-16 animate-bounce" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-amber-500 text-stone-950 font-black text-sm shadow-md">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
            Slice Not Found!
          </h1>
          <p className="text-sm text-stone-500 leading-relaxed max-w-sm mx-auto">
            Looks like someone ate the last slice of this page! The link you clicked might be broken, or the recipe was moved.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/menu"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-sm hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <Pizza className="w-4 h-4" />
            <span>Browse Pizza Menu</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
