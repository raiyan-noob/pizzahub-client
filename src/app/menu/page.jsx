"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PizzaCard } from "@/components/PizzaCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { apiRequest } from "@/lib/api";
import {
  Search,
  Filter,
  ArrowUpDown,
  MapPin,
  Pizza,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";

function BrowseMenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read current parameters directly from the URL (Single Source of Truth)
  const currentCategory = searchParams.get("category") || "All";
  const currentSearch = searchParams.get("search") || "";
  const currentLocation = searchParams.get("location") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  // Local state for live typing in input boxes
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [locationInput, setLocationInput] = useState(currentLocation);

  // Sync local inputs when URL searchParams change
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    setLocationInput(currentLocation);
  }, [currentLocation]);

  // Live debounced search as user types (no Enter key required)
  useEffect(() => {
    if (searchInput.trim() === currentSearch.trim()) return;

    const timer = setTimeout(() => {
      updateUrlParams({ search: searchInput.trim(), page: "1" });
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, currentSearch, updateUrlParams]);

  // Live debounced location filter as user types
  useEffect(() => {
    if (locationInput.trim() === currentLocation.trim()) return;

    const timer = setTimeout(() => {
      updateUrlParams({ location: locationInput.trim(), page: "1" });
    }, 350);

    return () => clearTimeout(timer);
  }, [locationInput, currentLocation, updateUrlParams]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const categories = [
    "All",
    "Classic Pizzas",
    "Vegetarian Pizzas",
    "Meat Lovers",
    "Specialty / Gourmet Pizzas",
    "Sides & Appetizers",
    "Beverages & Desserts",
  ];

  // Helper to synchronize all filter states into URL SearchParams
  const updateUrlParams = useCallback(
    (newParams) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, val]) => {
        if (val === undefined || val === null || val === "" || val === "All") {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });
      const queryString = params.toString();
      router.replace(queryString ? `/menu?${queryString}` : "/menu", { scroll: false });
    },
    [searchParams, router]
  );

  // Fetch Menu Items from API whenever searchParams change
  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentSearch.trim()) params.set("search", currentSearch.trim());
      if (currentCategory && currentCategory !== "All") params.set("category", currentCategory);
      if (currentLocation.trim()) params.set("location", currentLocation.trim());
      if (currentSort) params.set("sort", currentSort);
      params.set("page", currentPage.toString());
      params.set("limit", "12");

      const res = await apiRequest(`/api/menu/public?${params.toString()}`);
      if (res.success) {
        setItems(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Fetch menu items error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentSearch, currentCategory, currentLocation, currentSort, currentPage]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  // Handlers for instant category switching
  const handleCategoryClick = (cat) => {
    updateUrlParams({ category: cat, page: "1" });
  };

  // Handlers for search & location form submissions
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrlParams({ search: searchInput.trim(), page: "1" });
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    updateUrlParams({ location: locationInput.trim(), page: "1" });
  };

  const handleSortChange = (e) => {
    updateUrlParams({ sort: e.target.value, page: "1" });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setLocationInput("");
    router.replace("/menu", { scroll: false });
  };

  return (
    <div className="min-h-screen bg-stone-50/70 dark:bg-stone-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Title */}
        <div className="text-center sm:text-left border-b border-amber-200/60 dark:border-stone-800 pb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
            <Pizza className="w-3.5 h-3.5" /> Artisan Pizza Catalog
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
            Browse Our Full Menu
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Explore authentic hand-tossed pizzas, crispy sides, and fresh Italian refreshments.
          </p>
        </div>

        {/* Filter & Search Bar Controls (Challenge 1 - Synced with URL) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/70 dark:border-stone-800 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input (Live auto-search + clear button) */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search pizzas by name, crust, topping..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-amber-200/80 dark:border-stone-700 bg-amber-50/40 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    updateUrlParams({ search: "", page: "1" });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer p-0.5"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Location Filter (Live auto-filter + clear button) */}
            <form onSubmit={handleLocationSubmit} className="relative">
              <MapPin className="w-4 h-4 text-red-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by city / area..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-amber-200/80 dark:border-stone-700 bg-amber-50/40 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium"
              />
              {locationInput && (
                <button
                  type="button"
                  onClick={() => {
                    setLocationInput("");
                    updateUrlParams({ location: "", page: "1" });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer p-0.5"
                  aria-label="Clear location filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Price Sorting Selector (Challenge 1 Requirement) */}
            <div className="relative">
              <ArrowUpDown className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={currentSort}
                onChange={handleSortChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-amber-200/80 dark:border-stone-700 bg-amber-50/40 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer font-bold"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="price_asc">Sort: Price: Low to High</option>
                <option value="price_desc">Sort: Price: High to Low</option>
              </select>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetFilters}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-amber-200/80 dark:border-stone-700 text-sm font-bold text-stone-700 dark:text-stone-300 hover:bg-amber-100/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-stone-500" />
              <span>Reset Filters</span>
            </button>
          </div>

          {/* Category Tabs Scroll (Synchronized with URL query param) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2 border-t border-amber-100 dark:border-stone-800">
            {categories.map((cat) => {
              const isActive =
                (currentCategory === "All" && cat === "All") ||
                currentCategory.toLowerCase() === cat.toLowerCase();

              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-black tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-md shadow-red-500/20"
                      : "bg-amber-100/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-200/60 dark:hover:bg-stone-700"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter & Current Filter Banner */}
        <div className="flex items-center justify-between text-xs text-stone-500 px-1">
          <span>
            Showing <strong className="text-stone-900 dark:text-stone-100">{items.length}</strong> of {totalCount} approved menu items
          </span>
          {currentCategory !== "All" && (
            <span className="font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-full border border-red-200 dark:border-red-900/40">
              Filtered by: {currentCategory}
            </span>
          )}
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-84 rounded-3xl bg-amber-100/40 dark:bg-stone-800 animate-pulse border border-amber-200/40"
              />
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <PizzaCard key={item._id} item={item} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => updateUrlParams({ page: (currentPage - 1).toString() })}
                  className="px-4 py-2 rounded-xl border border-amber-200 dark:border-stone-700 text-sm font-bold text-stone-700 dark:text-stone-300 disabled:opacity-40 hover:bg-amber-100/50"
                >
                  Previous
                </button>
                <span className="text-sm font-black text-stone-800 dark:text-stone-200 px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => updateUrlParams({ page: (currentPage + 1).toString() })}
                  className="px-4 py-2 rounded-xl border border-amber-200 dark:border-stone-700 text-sm font-bold text-stone-700 dark:text-stone-300 disabled:opacity-40 hover:bg-amber-100/50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-16 text-center rounded-3xl bg-white dark:bg-stone-900 border border-amber-200/70 dark:border-stone-800 shadow-sm">
            <Pizza className="w-16 h-16 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              No matching pizza items found
            </h3>
            <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
              We couldn't find any slices in category "<strong>{currentCategory}</strong>".
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-6 px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md hover:bg-red-700 cursor-pointer"
            >
              Show All Menu Items
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrowseMenuPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading wood-fired menu..." />}>
      <BrowseMenuContent />
    </Suspense>
  );
}
