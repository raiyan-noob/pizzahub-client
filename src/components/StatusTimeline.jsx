"use client";

import React from "react";
import { CheckCircle2, Clock, XCircle, Ban, Truck } from "lucide-react";

export function StatusTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold">
        <Ban className="w-4 h-4 text-stone-500" />
        <span>This order was cancelled by customer.</span>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-900/40">
        <XCircle className="w-4 h-4 text-red-500" />
        <span>This order was rejected by the restaurant.</span>
      </div>
    );
  }

  const steps = [
    { id: "pending", label: "Order Placed", desc: "Awaiting restaurant confirmation" },
    { id: "accepted", label: "Accepted & Baking", desc: "Artisan pizza in the wood oven" },
    { id: "delivered", label: "Delivered & Enjoyed", desc: "Hot pizza arrived at your door" },
  ];

  const isDelivered = status === "delivered";
  const currentStepIndex = isDelivered ? 2 : status === "accepted" ? 1 : 0;

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-1 bg-stone-200 dark:bg-stone-700 -z-0">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: isDelivered ? "100%" : currentStepIndex === 1 ? "50%" : "0%" }}
          />
        </div>

        {steps.map((step, idx) => {
          const isCompleted = isDelivered ? true : idx < currentStepIndex;
          const isCurrent = !isDelivered && idx === currentStepIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : isCurrent
                    ? "bg-amber-500 text-white ring-4 ring-amber-100 dark:ring-amber-950/60 shadow-md"
                    : "bg-stone-200 dark:bg-stone-700 text-stone-400"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 animate-spin-slow" />
                ) : (
                  <Truck className="w-4 h-4" />
                )}
              </div>
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-2">
                {step.label}
              </span>
              <span className="text-[10px] text-stone-500 max-w-[90px] hidden sm:block">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
