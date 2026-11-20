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
    <div className="group flex flex-col h-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-xl hover:border-red-200 dark:hover:border-red-900/50 transition-all duration-300 overflow-hidden">
      {/* Image Container with Fixed Aspect Ratio */}
      <div className="relative w-full aspect-4/3 overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img
          src={imageUrl}
          alt={item.itemName}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-500/90 text-stone-950 backdrop-blur-md shadow-sm">
            {item.category}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={favLoading}
          aria-label="Add to favorites"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md flex items-center justify-center text-stone-700 dark:text-stone-300 hover:text-red-500 hover:scale-110 transition-all shadow-md"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFav ? "fill-red-500 text-red-500" : ""
            }`}
          />
        </button>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 left-3 bg-red-600/95 text-white font-black text-sm px-3 py-1 rounded-xl shadow-md">
          {formatPrice(item.price)}
        </div>

        {/* Premium Vendor Badge */}
        {item.vendor?.isPremium && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-400 to-amber-600 text-stone-950 shadow-md">
            <Sparkles className="w-3 h-3 fill-stone-950" />
            <span>Premium</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Title */}
        <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-1 mb-1">
          {item.itemName}
        </h3>

        {/* Description */}
        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed mb-4 flex-1">
          {item.description}
        </p>

        {/* Location & Vendor Info */}
        <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate text-stone-500 dark:text-stone-400">
              <Store className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate font-medium">
                {item.vendor?.name || "Local Pizzeria"}
              </span>
            </div>

            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span>4.9</span>
            </div>
          </div>
        </div>

        {/* Action Button: View Details */}
        <div className="pt-4 mt-auto">
          <Link
            href={`/menu/${item._id}`}
            onClick={handleDetailsClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold bg-amber-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 group-hover:bg-red-600 group-hover:text-white dark:group-hover:bg-red-600 transition-all duration-200 shadow-xs"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
