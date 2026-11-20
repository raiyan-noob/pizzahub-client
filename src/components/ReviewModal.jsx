"use client";

import React, { useState } from "react";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { Star, X, MessageSquare, Send } from "lucide-react";

export function ReviewModal({ itemId, itemName, isOpen, onClose, onReviewAdded }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please enter a short review");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest(`/api/reviews/${itemId}`, {
        method: "POST",
        body: JSON.stringify({ rating, comment }),
      });

      if (res.success) {
        toast.success(res.message);
        if (onReviewAdded) onReviewAdded(res.review);
        onClose();
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">
              Leave a Slice Review
            </h3>
            <p className="text-xs text-stone-500 truncate max-w-[280px]">{itemName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Star Rating Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
              Your Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-amber-400 hover:scale-125 transition-transform focus:outline-hidden"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-stone-300 dark:text-stone-600"
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-stone-700 dark:text-stone-300 ml-2">
                {rating} / 5
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
              Your Review / Feedback
            </label>
            <textarea
              rows={3}
              required
              placeholder="Tell others how crust, sauce, and toppings tasted..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-sm font-semibold text-stone-700 dark:text-stone-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
