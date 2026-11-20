"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PizzaCard } from "@/components/PizzaCard";
import { apiRequest } from "@/lib/api";
import {
  Search,
  Filter,
  ArrowUpDown,
  MapPin,
  Pizza,
  RotateCcw,
  Sparkles,
} from "lucide-react";

function BrowseMenuContent() {
  const searchParams = useSearchParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
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

  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (category && category !== "All") params.set("category", category);
      if (location.trim()) params.set("location", location.trim());
      if (sort) params.set("sort", sort);
      params.set("page", page.toString());
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
  }, [search, category, location, sort, page]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const handleResetFilters = () => {
    setSearch("");
    setCategory("All");
    setLocation("");
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-stone-50/70 dark:bg-stone-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Title */}
        <div className="text-center sm:text-left border-b border-stone-200 dark:border-stone-800 pb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
            <Pizza className="w-3.5 h-3.5" /> Artisan Pizza Catalog
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
            Browse Our Full Menu
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Explore authentic hand-tossed pizzas, crispy sides, and fresh Italian refreshments.
          </p>
        </div>

        {/* Filter & Search Bar Controls (Challenge 1) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search pizzas or toppings..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Location Filter */}
            <div className="relative">
              <MapPin className="w-4 h-4 text-red-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by city / area..."
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Price Sorting Selector (Challenge 1 Requirement) */}
            <div className="relative">
              <ArrowUpDown className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="price_asc">Sort: Price: Low to High</option>
                <option value="price_desc">Sort: Price: High to Low</option>
              </select>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetFilters}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-stone-500" />
              <span>Reset Filters</span>
            </button>
          </div>

          {/* Category Tabs Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2 border-t border-stone-100 dark:border-stone-800">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  category === cat
                    ? "bg-red-600 text-white shadow-sm shadow-red-500/20"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-stone-500 px-1">
          <span>
            Showing <strong className="text-stone-900 dark:text-stone-100">{items.length}</strong> of {totalCount} approved menu items
          </span>
          {category !== "All" && (
            <span className="font-semibold text-red-600 dark:text-red-400">
              Filtered by: {category}
            </span>
          )}
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse"
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
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-sm font-semibold text-stone-700 dark:text-stone-300 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm font-bold text-stone-800 dark:text-stone-200 px-4">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-sm font-semibold text-stone-700 dark:text-stone-300 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-16 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <Pizza className="w-16 h-16 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              No matching pizza items
            </h3>
            <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
              We couldn't find any slices matching your search criteria. Try modifying your search or resetting filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-6 px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md"
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
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BrowseMenuContent />
    </Suspense>
  );
}
