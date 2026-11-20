"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import confetti from "canvas-confetti";
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const router = useRouter();
  const { refreshUser, user } = useAuth();

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function verifyPayment() {
      if (!sessionId) {
        setVerifying(false);
        setError("No checkout session found");
        return;
      }

      try {
        const res = await apiRequest("/api/payment/verify-session", {
          method: "POST",
          body: JSON.stringify({ sessionId }),
        });

        if (res.success) {
          setSuccess(true);
          // Shoot confetti!
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
          refreshUser();
        } else {
          setError(res.message || "Failed to verify payment session");
        }
      } catch (err) {
        setError(err.message || "Payment verification error");
      } finally {
        setVerifying(false);
      }
    }

    verifyPayment();
  }, [sessionId, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50/70 dark:bg-stone-950 px-4 py-16">
      <div className="max-w-md w-full bg-white dark:bg-stone-900 p-8 sm:p-10 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-2xl text-center space-y-6">
        {verifying ? (
          <div className="py-12 space-y-4">
            <div className="w-14 h-14 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto" />
            <h2 className="text-xl font-black text-stone-900 dark:text-stone-100">
              Verifying Stripe Payment...
            </h2>
            <p className="text-xs text-stone-500">
              Confirming transaction ledger and upgrading your vendor tier...
            </p>
          </div>
        ) : success ? (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                <Sparkles className="w-3.5 h-3.5" /> Premium Vendor Activated
              </span>
              <h1 className="text-3xl font-black text-stone-900 dark:text-stone-100">
                Payment Successful!
              </h1>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Welcome to PizzaHub Premium! You now have unlimited menu item listings, the Gold verified badge, and featured homepage spotlight.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-stone-800/60 border border-amber-200/50 dark:border-stone-700/50 text-xs text-left space-y-2">
              <p className="flex items-center justify-between">
                <span className="text-stone-500">Plan:</span>
                <strong className="text-stone-800 dark:text-stone-200 capitalize">Vendor Premium ($19.99/mo)</strong>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-stone-500">Status:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">Verified & Active</strong>
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard/vendor"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-red-500/20 hover:shadow-xl transition-all"
              >
                <span>Go to Vendor Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-red-600">Verification Issue</h2>
            <p className="text-xs text-stone-500">{error || "Could not verify payment session"}</p>
            <Link
              href="/dashboard/vendor"
              className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-stone-800 text-white text-xs font-bold"
            >
              Return to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
