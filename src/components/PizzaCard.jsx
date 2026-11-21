"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import {
  MapPin,
  Sparkles,
  Star,
  Heart,
  ArrowRight,
  Store,
} from "lucide-react";

export function PizzaCard({ item, onFavoriteToggle, initialFavorite = false }) {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();
  const [isFav, setIsFav] = useState(initialFavorite);
  const [favLoading, setFavLoading] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Please sign in to save items to your favorites");
      router.push("/signin");
      return;
    }

    if (role !== "customer") {
      toast.info("Favorites are available for customer accounts");
      return;
    }

    setFavLoading(true);
    try {
      const res = await apiRequest(`/api/reviews/favorites/toggle/${item._id}`, {
        method: "POST",
      });
      if (res.success) {
        setIsFav(res.isFavorite);
        toast.success(res.message);
        if (onFavoriteToggle) onFavoriteToggle(item._id, res.isFavorite);
      }
    } catch (err) {
      toast.error(err.message || "Failed to update favorites");
    } finally {
      setFavLoading(false);
    }
  };

  const handleDetailsClick = (e) => {
    // Page 5 requirement: "If a logged-out user clicks View Details or tries to order, redirect to Sign In"
    if (!isAuthenticated) {
      e.preventDefault();
      toast.info("Please sign in to view item details and order");
      router.push("/signin");
    }
  };

  const imageUrl =
    item.images?.[0] ||
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80";

  return (
    <div className="group flex flex-col h-full bg-white dark:bg-stone-900 rounded-3xl border border-amber-200/70 dark:border-stone-800 shadow-sm hover:shadow-2xl hover:shadow-amber-500/10 hover:border-red-300 dark:hover:border-red-900/60 transition-all duration-300 overflow-hidden">
      {/* Image Container with Fixed Aspect Ratio */}
      <div className="relative w-full aspect-4/3 overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img
          src={imageUrl}
          alt={item.itemName}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-90" />

        {/* Category Pill Badge & Sizes Indicator */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-amber-500/95 text-stone-950 shadow-md backdrop-blur-md border border-amber-300/40">
            {item.category}
          </span>
          {item.sizes && item.sizes.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-stone-900/80 text-amber-300 shadow-md backdrop-blur-md border border-amber-400/30">
              {item.sizes.length} Sizes
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={favLoading}
          aria-label="Add to favorites"
          className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md flex items-center justify-center text-stone-700 dark:text-stone-300 hover:text-red-600 hover:scale-110 transition-all shadow-md"
        >
          <Heart
            className={`w-4.5 h-4.5 transition-colors ${
              isFav ? "fill-red-500 text-red-500" : ""
            }`}
          />
        </button>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3.5 left-3.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-sm px-3.5 py-1.5 rounded-xl shadow-lg border border-red-400/30">
          {item.sizes && item.sizes.length > 1 ? `From ${formatPrice(item.price)}` : formatPrice(item.price)}
        </div>

        {/* Premium Vendor Badge */}
        {item.vendor?.isPremium && (
          <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-stone-950 shadow-lg border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 fill-stone-950" />
            <span>Premium</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5.5 space-y-3">
        {/* Title */}
        <h3 className="font-black text-lg text-stone-900 dark:text-stone-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-1">
          {item.itemName}
        </h3>

        {/* Description */}
        <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed flex-1">
          {item.description}
        </p>

        {/* Location & Vendor Info */}
        <div className="space-y-2 pt-3 border-t border-amber-100 dark:border-stone-800 text-xs">
          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300 truncate">
            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate text-stone-500 dark:text-stone-400">
              <Store className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate font-semibold text-stone-700 dark:text-stone-300">
                {item.vendor?.name || "Local Pizzeria"}
              </span>
            </div>

            <div className="flex items-center gap-1 text-amber-500 font-black text-xs bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-900/40">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>4.9</span>
            </div>
          </div>
        </div>

        {/* Action Button: View Details */}
        <div className="pt-2 mt-auto">
          <Link
            href={`/menu/${item._id}`}
            onClick={handleDetailsClick}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider bg-amber-100/70 hover:bg-gradient-to-r hover:from-red-600 hover:to-amber-600 text-stone-800 hover:text-white dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-red-600 dark:hover:text-white transition-all duration-300 shadow-xs hover:shadow-md"
          >
            <span>View Details & Order</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
