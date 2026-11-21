"use client";

import React, { useEffect, useState, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { OrderModal } from "@/components/OrderModal";
import { ReviewModal } from "@/components/ReviewModal";
import { LoadingScreen } from "@/components/LoadingScreen";
import { toast } from "sonner";
import {
  MapPin,
  Store,
  Sparkles,
  Star,
  Heart,
  ShoppingBag,
  ArrowLeft,
  ShieldAlert,
  Flame,
  Clock,
  MessageSquarePlus,
  CheckCircle,
  Pizza,
} from "lucide-react";
import Link from "next/link";

function ItemDetailsContent({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const router = useRouter();
  const { user, isAuthenticated, role, loading: authLoading } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Modals
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(5.0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Favorites
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (item?.sizes && item.sizes.length > 0) {
      setSelectedSize(item.sizes[0].size);
    }
  }, [item]);

  const activePrice =
    item?.sizes && item.sizes.length > 0 && selectedSize
      ? item.sizes.find((s) => s.size === selectedSize)?.price || item.price
      : item?.price;

  // Redirect to sign in if not logged in (Page 3 requirement)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.info("Please sign in to view menu item details");
      router.push("/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    async function loadItemAndReviews() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await apiRequest(`/api/menu/${id}`);
        if (res.success && res.data) {
          setItem(res.data);
        } else {
          setError("Menu item not found");
        }

        // Fetch reviews
        const revRes = await apiRequest(`/api/reviews/${id}`);
        if (revRes.success) {
          setReviews(revRes.reviews || []);
          setAverageRating(revRes.averageRating || 5.0);
          setTotalReviews(revRes.totalReviews || 0);
        }
      } catch (err) {
        setError(err.message || "Invalid menu item ID");
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadItemAndReviews();
    }
  }, [id, isAuthenticated]);

  const handleFavoriteToggle = async () => {
    if (role !== "customer") {
      toast.info("Favorites are for customer accounts");
      return;
    }
    try {
      const res = await apiRequest(`/api/reviews/favorites/toggle/${id}`, {
        method: "POST",
      });
      if (res.success) {
        setIsFavorite(res.isFavorite);
        toast.success(res.message);
      }
    } catch (err) {
      toast.error(err.message || "Failed to toggle favorite");
    }
  };

  const handleOrderClick = () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to order");
      router.push("/signin");
      return;
    }

    // Admins cannot place customer orders
    if (role === "admin") {
      toast.error("Administrators cannot place food orders.");
      return;
    }

    // Vendors cannot order their own items
    if (role === "vendor" && (item.vendorId === user?.id || item.vendor?.id === user?.id)) {
      toast.error("Vendors cannot order their own menu items.");
      return;
    }

    if (role !== "customer") {
      toast.error("Only customer accounts can submit food orders.");
      return;
    }

    if (item.status !== "approved") {
      toast.error("This item is currently unavailable for ordering.");
      return;
    }

    setOrderModalOpen(true);
  };

  if (authLoading || (loading && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50/50 dark:bg-stone-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-stone-500">Loading delicious pizza details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50/50 dark:bg-stone-950 px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center space-y-4 shadow-xl">
          <ShieldAlert className="w-14 h-14 text-red-500 mx-auto" />
          <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100">
            Item Not Found
          </h2>
          <p className="text-sm text-stone-500">
            {error || "The requested menu item does not exist or has been removed."}
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  const images = item.images && item.images.length > 0 ? item.images : [
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
  ];

  const canOrder = role === "customer" && item.status === "approved";

  return (
    <div className="min-h-screen bg-stone-50/70 dark:bg-stone-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 dark:text-stone-300 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </Link>

          {role === "customer" && (
            <button
              onClick={handleFavoriteToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                isFavorite
                  ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-950/40 dark:border-red-900"
                  : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
              />
              <span>{isFavorite ? "In Favorites" : "Save to Favorites"}</span>
            </button>
          )}
        </div>

        {/* Main Item Presentation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Image Gallery (multiple images supported) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-4/3 w-full rounded-3xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-800 shadow-md">
              <img
                src={images[selectedImageIndex]}
                alt={item.itemName}
                className="w-full h-full object-cover"
              />

              {item.vendor?.isPremium && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-600 text-stone-950 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 fill-stone-950" />
                  <span>Premium Pizzeria</span>
                </div>
              )}
            </div>

            {/* Thumbnail selector if multiple images */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx
                        ? "border-red-600 ring-2 ring-red-500/30 scale-105"
                        : "border-stone-200 dark:border-stone-700 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Item Information & Ordering Form Trigger */}
          <div className="lg:col-span-5 p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
                {item.category}
              </span>
              <h1 className="text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                {item.itemName}
              </h1>
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span>{averageRating}</span>
                  <span className="text-stone-400 font-normal">({totalReviews} reviews)</span>
                </div>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Wood-Fired Fresh
                </span>
              </div>
            </div>

            {/* Price Badge */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-stone-800/60 border border-amber-200/60 dark:border-stone-700/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-500 uppercase tracking-wider font-bold">
                  {selectedSize ? `Price (${selectedSize})` : "Price Per Slice / Pie"}
                </span>
                <p className="text-3xl font-black text-red-600 dark:text-red-400">
                  {formatPrice(activePrice)}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-stone-500">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Baked to order</span>
              </div>
            </div>

            {/* Interactive Pizza Size Selector (Inches) */}
            {item.sizes && item.sizes.length > 0 && (
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                  <Pizza className="w-4 h-4 text-amber-500" />
                  Select Pizza Size (Inches)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {item.sizes.map((s) => {
                    const isSelected = selectedSize === s.size;
                    return (
                      <button
                        key={s.size}
                        type="button"
                        onClick={() => setSelectedSize(s.size)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-red-500 bg-red-50/80 dark:bg-red-950/40 ring-2 ring-red-500/30 shadow-xs"
                            : "border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-stone-700 bg-white dark:bg-stone-850"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-black ${
                              isSelected
                                ? "text-red-600 dark:text-red-400"
                                : "text-stone-800 dark:text-stone-200"
                            }`}
                          >
                            {s.size}
                          </span>
                          {isSelected && (
                            <CheckCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <p className="text-xs font-bold text-stone-500 dark:text-stone-400 mt-1">
                          {formatPrice(s.price)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                Ingredients & Description
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Location & Vendor Info */}
            <div className="space-y-3 pt-4 border-t border-stone-100 dark:border-stone-800 text-sm">
              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>
                  <strong>Location:</strong> {item.location}
                </span>
              </div>

              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <Store className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  <strong>Vendor:</strong> {item.vendor?.name || "Local Pizzeria Partner"}
                </span>
              </div>
            </div>

            {/* Ordering CTA */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
              {canOrder ? (
                <button
                  onClick={handleOrderClick}
                  className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-base shadow-lg shadow-red-500/25 hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Order Now for Delivery</span>
                </button>
              ) : role === "vendor" ? (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-center">
                  You are logged in as a Vendor. Switch to a Customer account to place orders.
                </div>
              ) : role === "admin" ? (
                <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-xs font-semibold text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900 text-center">
                  Admins manage platform operations and cannot place customer food orders.
                </div>
              ) : (
                <button
                  onClick={handleOrderClick}
                  className="w-full py-4 px-6 rounded-2xl bg-stone-300 dark:bg-stone-800 text-stone-500 font-bold text-sm cursor-not-allowed"
                  disabled
                >
                  Item Not Available for Ordering
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reviews and Ratings Section (Optional Requirement #1) */}
        <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100">
                Customer Reviews & Ratings
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Average Rating: <strong>{averageRating} / 5.0</strong> ({totalReviews} total reviews)
              </p>
            </div>

            {role === "customer" && (
              <button
                onClick={() => setReviewModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md hover:bg-red-700 transition-colors"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>Write a Review</span>
              </button>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {rev.customerImage ? (
                        <img
                          src={rev.customerImage}
                          alt={rev.customerName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                          {rev.customerName?.[0] || "C"}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          {rev.customerName || "Pizza Lover"}
                        </p>
                        <p className="text-[10px] text-stone-500">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-stone-500 text-xs">
              No reviews yet for this pizza. Be the first to leave your thoughts after ordering!
            </div>
          )}
        </div>
      </div>

      {/* Order Form Modal */}
      <OrderModal
        item={{ ...item, price: activePrice, selectedSize }}
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
      />

      {/* Review Submission Modal */}
      <ReviewModal
        itemId={item._id}
        itemName={item.itemName}
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onReviewAdded={(newRev) => {
          setReviews([newRev, ...reviews]);
          setTotalReviews((t) => t + 1);
        }}
      />
    </div>
  );
}

export default function ItemDetailsPage({ params }) {
  return (
    <Suspense fallback={<LoadingScreen message="Loading artisan pizza details..." />}>
      <ItemDetailsContent params={params} />
    </Suspense>
  );
}
