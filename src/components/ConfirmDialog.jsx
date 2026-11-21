"use client";

import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // "danger" | "warning" | "primary"
  isLoading = false,
}) {
  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    if (variant === "danger") {
      return {
        iconBg: "bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400",
        confirmBtn: "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20",
      };
    }
    if (variant === "warning") {
      return {
        iconBg: "bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400",
        confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/20",
      };
    }
    return {
      iconBg: "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300",
      confirmBtn: "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800",
    };
  };

  const styles = getVariantStyles();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full border border-stone-200/90 dark:border-stone-800 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${styles.iconBg}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3
                id="confirm-dialog-title"
                className="text-lg font-black text-stone-900 dark:text-stone-100 tracking-tight"
              >
                {title}
              </h3>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                Action Required
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          {description}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-100 dark:hover:bg-stone-750 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-50 cursor-pointer ${styles.confirmBtn}`}
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
