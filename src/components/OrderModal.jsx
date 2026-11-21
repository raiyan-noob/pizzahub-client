"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { X, Calendar, MapPin, MessageSquare, CheckCircle, AlertTriangle, Pizza } from "lucide-react";
import { useRouter } from "next/navigation";

export function OrderModal({ item, isOpen, onClose, onOrderPlaced }) {
  const { user, isAuthenticated, role } = useAuth();
  const router = useRouter();

  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedSize, setSelectedSize] = useState(
    item?.selectedSize || (item?.sizes && item.sizes.length > 0 ? item.sizes[0].size : "")
  );

  React.useEffect(() => {
    if (item?.selectedSize) {
      setSelectedSize(item.selectedSize);
    } else if (item?.sizes && item.sizes.length > 0) {
      setSelectedSize(item.sizes[0].size);
    }
  }, [item]);

  const activePrice =
    item?.sizes && item.sizes.length > 0 && selectedSize
      ? item.sizes.find((s) => s.size === selectedSize)?.price || item.price
      : item?.price;

  if (!isOpen || !item) return null;

  // Tomorrow's date formatted as minimum delivery date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info("Please sign in to place an order");
      router.push("/signin");
      return;
    }

    if (role !== "customer") {
      toast.error(`Only customers can place food orders (current role: ${role})`);
      return;
    }

    if (!deliveryDate) {
      toast.error("Please select a delivery date");
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error("Please provide a delivery address");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          itemId: item._id,
          deliveryDate,
          deliveryAddress,
          message,
          size: selectedSize || undefined,
        }),
      });

      if (res.success) {
        toast.success(res.message || "Order placed successfully!");
        if (onOrderPlaced) onOrderPlaced(res.order);
        onClose();
        router.push("/dashboard/customer");
      }
    } catch (err) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800 bg-amber-50/50 dark:bg-stone-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center">
              <Pizza className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 dark:text-stone-100">
                Confirm Pizza Order
              </h2>
              <p className="text-xs text-stone-500">
                Freshly hand-stretched by {item.vendor?.name || "our partner bakery"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item Summary Banner */}
        <div className="p-4 mx-6 mt-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 flex items-center gap-4">
          <img
            src={
              item.images?.[0] ||
              "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200"
            }
            alt={item.itemName}
            className="w-16 h-16 rounded-xl object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
              {item.itemName}
            </h4>
            <p className="text-xs text-stone-500 truncate">{item.category}</p>
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-1">
              Unit Price: {formatPrice(activePrice)} {selectedSize ? `• ${selectedSize}` : ""}
            </p>
          </div>
        </div>

        {/* Pizza Size Selection (Inches) */}
        {item.sizes && item.sizes.length > 0 && (
          <div className="px-6 pt-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2 flex items-center gap-1.5">
              <Pizza className="w-3.5 h-3.5 text-amber-500" />
              Choose Pizza Size (Inches) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {item.sizes.map((s) => {
                const isSelected = selectedSize === s.size;
                return (
                  <button
                    key={s.size}
                    type="button"
                    onClick={() => setSelectedSize(s.size)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-red-500 bg-red-50/80 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-black ring-2 ring-red-500/20"
                        : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold hover:bg-stone-50 dark:hover:bg-stone-750"
                    }`}
                  >
                    <div className="text-xs">{s.size}</div>
                    <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                      {formatPrice(s.price)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Delivery Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              Delivery Date *
            </label>
            <input
              type="date"
              required
              min={minDate}
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              Delivery Address *
            </label>
            <textarea
              required
              rows={2}
              placeholder="e.g. 42 Maple Street, Apt 3B, Downtown"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          {/* Special Instructions / Message */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
              Additional Message / Special Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Please leave at front door, extra napkins"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Automatic Detected Details info */}
          <div className="rounded-xl bg-amber-50/70 dark:bg-stone-800/40 p-3 text-xs text-stone-600 dark:text-stone-400 space-y-1 border border-amber-200/50 dark:border-stone-700/50">
            <p>
              <span className="font-semibold text-stone-800 dark:text-stone-200">Customer:</span>{" "}
              {user?.name} ({user?.email})
            </p>
            <p>
              <span className="font-semibold text-stone-800 dark:text-stone-200">Vendor:</span>{" "}
              {item.vendor?.name || "Local Pizzeria"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-red-500/20 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Submitting Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Order ({formatPrice(activePrice)})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
