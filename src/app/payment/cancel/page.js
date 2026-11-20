"use client";

import React from "react";
import Link from "next/link";
import { XCircle, ArrowLeft, RefreshCw, Pizza } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50/70 dark:bg-stone-950 px-4 py-16">
      <div className="max-w-md w-full bg-white dark:bg-stone-900 p-8 sm:p-10 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-600 flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-stone-900 dark:text-stone-100">
            Payment Cancelled
          </h1>
          <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            The Stripe checkout process was cancelled. No charges were made to your card, and your restaurant remains on the Free tier.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Link
            href="/dashboard/vendor?tab=subscription"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Upgrading Again</span>
          </Link>

          <Link
            href="/dashboard/vendor"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-sm hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Vendor Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
