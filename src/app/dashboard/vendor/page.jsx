"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiRequest, getAuthToken, syncUserToken } from "@/lib/api";
import { uploadToImgBB } from "@/lib/imgbb";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  UtensilsCrossed,
  PlusCircle,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Edit3,
  Upload,
  Calendar,
  MapPin,
  Check,
  X,
  CreditCard,
  AlertTriangle,
  Eye,
  Store,
  Pizza,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function VendorDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "overview";

  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [myItems, setMyItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [submittingItem, setSubmittingItem] = useState(false);
  const [upgradingStripe, setUpgradingStripe] = useState(false);

  // Form states for Add Menu Item
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Classic Pizzas");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [itemImages, setItemImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [useSizes, setUseSizes] = useState(true);
  const [pizzaSizes, setPizzaSizes] = useState([
    { size: "6 inch", price: "450" },
    { size: "8 inch", price: "650" },
    { size: "12 inch", price: "950" },
    { size: "15 inch", price: "1350" },
  ]);

  // Edit item state
  const [editingItem, setEditingItem] = useState(null);

  const categories = [
    "Classic Pizzas",
    "Vegetarian Pizzas",
    "Meat Lovers",
    "Specialty / Gourmet Pizzas",
    "Sides & Appetizers",
    "Beverages & Desserts",
  ];

  const loadVendorData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, ordersRes] = await Promise.all([
        apiRequest("/api/menu/vendor/my-items"),
        apiRequest("/api/orders/vendor"),
      ]);

      if (itemsRes.success) setMyItems(itemsRes.data || []);
      if (ordersRes.success) setOrders(ordersRes.data || []);
    } catch (err) {
      console.error("Load vendor data error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadVendorData();
    }
  }, [user, loadVendorData]);

  // Statistics Computations
  const totalMenuItems = myItems.length;
  const activeMenuItems = myItems.filter(
    (item) => item.status === "approved" || item.status === "pending"
  ).length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const acceptedOrders = orders.filter((o) => o.status === "accepted").length;
  const rejectedOrders = orders.filter((o) => o.status === "rejected").length;
  const isPremium = user?.subscriptionPlan === "premium";

  // Chart Data
  const chartData = [
    { name: "Pending", count: pendingOrders, fill: "#f59e0b" },
    { name: "Accepted", count: acceptedOrders, fill: "#10b981" },
    { name: "Rejected", count: rejectedOrders, fill: "#ef4444" },
    { name: "Active Items", count: activeMenuItems, fill: "#dc2626" },
  ];

  // Image Upload handler for Add Menu Item
  const handleItemImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      toast.loading("Uploading image...", { id: "menu-item-upload" });
      const url = await uploadToImgBB(file);
      setItemImages([...itemImages, url]);
      toast.success("Image uploaded successfully!", { id: "menu-item-upload" });
    } catch (err) {
      toast.error(err.message || "Failed to upload image", { id: "menu-item-upload" });
    } finally {
      setUploadingImage(false);
    }
  };

  // Create Menu Item
  const handleCreateMenuItem = async (e) => {
    e.preventDefault();

    if (itemImages.length === 0) {
      toast.error("At least one menu item image is required");
      return;
    }

    // Check Free plan limitation (max 3 active items)
    if (!isPremium && activeMenuItems >= 3) {
      toast.error(
        "Free plan limit reached: You can have at most 3 active items. Upgrade to Premium for unlimited items!"
      );
      router.push("/dashboard/vendor?tab=subscription");
      return;
    }

    const activeSizes = useSizes
      ? pizzaSizes
          .filter((s) => s.size && Number(s.price) > 0)
          .map((s) => ({ size: s.size.trim(), price: Number(s.price) }))
      : [];

    const computedBasePrice =
      activeSizes.length > 0 ? activeSizes[0].price : parseFloat(price);

    if (isNaN(computedBasePrice) || computedBasePrice <= 0) {
      toast.error("Please provide a valid price or add at least one pizza size");
      return;
    }

    setSubmittingItem(true);
    try {
      if (!getAuthToken() && user) {
        await syncUserToken(user);
      }

      const res = await apiRequest("/api/menu", {
        method: "POST",
        body: JSON.stringify({
          itemName,
          category,
          description,
          price: computedBasePrice,
          sizes: activeSizes.length > 0 ? activeSizes : undefined,
          location,
          images: itemImages,
        }),
      });

      if (res.success) {
        toast.success(res.message);
        // Reset form
        setItemName("");
        setDescription("");
        setPrice("");
        setLocation("");
        setItemImages([]);
        setPizzaSizes([
          { size: "6 inch", price: "450" },
          { size: "8 inch", price: "650" },
          { size: "12 inch", price: "950" },
          { size: "15 inch", price: "1350" },
        ]);
        loadVendorData();
        router.push("/dashboard/vendor?tab=items");
      }
    } catch (err) {
      toast.error(err.message || "Failed to create menu item");
    } finally {
      setSubmittingItem(false);
    }
  };

  // Toggle item availability
  const handleToggleAvailability = async (item) => {
    const newStatus = item.status === "inactive" ? "approved" : "inactive";
    try {
      const res = await apiRequest(`/api/menu/${item._id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        toast.success(`Item set to ${newStatus}`);
        loadVendorData();
      }
    } catch (err) {
      toast.error(err.message || "Failed to toggle status");
    }
  };

  const [itemToDelete, setItemToDelete] = useState(null);
  const [deletingItem, setDeletingItem] = useState(false);

  // Delete item via ConfirmDialog
  const handleConfirmDeleteItem = async () => {
    if (!itemToDelete) return;
    setDeletingItem(true);
    try {
      const res = await apiRequest(`/api/menu/${itemToDelete._id}`, { method: "DELETE" });
      if (res.success) {
        toast.success("Menu item removed");
        setItemToDelete(null);
        loadVendorData();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete item");
    } finally {
      setDeletingItem(false);
    }
  };

  // Accept or Reject Customer Order (Vendor action)
  const handleOrderAction = async (orderId, action) => {
    try {
      const res = await apiRequest(`/api/orders/${orderId}/vendor-action`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      if (res.success) {
        toast.success(res.message);
        loadVendorData();
      }
    } catch (err) {
      toast.error(err.message || `Failed to ${action} order`);
    }
  };

  // Initiate Stripe Checkout for Premium Upgrade
  const handleUpgradeToPremium = async () => {
    setUpgradingStripe(true);
    try {
      const res = await apiRequest("/api/payment/create-checkout-session", {
        method: "POST",
      });
      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        throw new Error(res.message || "Could not generate checkout session");
      }
    } catch (err) {
      toast.error(err.message || "Stripe checkout failed");
      setUpgradingStripe(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
              Restaurant Vendor Dashboard
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Welcome back, {user?.businessName || user?.name}! Here is your current pizzeria performance.
            </p>
          </div>

          {/* 5 Required Overview Stats Cards (Page 5) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="text-xs uppercase font-bold text-stone-400">Total Menu Items</span>
              <p className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
                {totalMenuItems}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="text-xs uppercase font-bold text-stone-400">Active Items</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {activeMenuItems}
              </p>
              <span className="text-[11px] text-stone-400">
                {isPremium ? "Unlimited plan" : "Max 3 on Free"}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="text-xs uppercase font-bold text-stone-400">Pending Orders</span>
              <p className="text-2xl font-black text-amber-500 mt-1">{pendingOrders}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="text-xs uppercase font-bold text-stone-400">Accepted Orders</span>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {acceptedOrders}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-tr from-amber-500/10 to-red-500/10 dark:from-stone-900 dark:to-stone-850 border border-amber-200 dark:border-amber-900/40 shadow-xs">
              <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">
                Current Plan
              </span>
              <p className="text-xl font-black text-stone-900 dark:text-stone-100 mt-1 capitalize flex items-center gap-1.5">
                {user?.subscriptionPlan || "free"}
                {isPremium && <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />}
              </p>
              {!isPremium && (
                <button
                  onClick={() => router.push("/dashboard/vendor?tab=subscription")}
                  className="mt-2 text-xs font-bold text-red-600 hover:underline"
                >
                  Upgrade to Pro →
                </button>
              )}
            </div>
          </div>

          {/* Quick Chart Visualization */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-4">
              Pizzeria Orders & Menu Overview
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* My Menu Items Tab */}
      {activeTab === "items" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100">
                My Menu Items
              </h1>
              <p className="text-xs text-stone-500">
                Manage your published pizzas, check admin approval status, and toggle availability.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/vendor?tab=add")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md hover:bg-red-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Item</span>
            </button>
          </div>

          {myItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myItems.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div className="relative aspect-16/9 w-full bg-stone-100 dark:bg-stone-800">
                    <img
                      src={item.images?.[0] || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400"}
                      alt={item.itemName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                          item.status === "approved"
                            ? "bg-emerald-500 text-white"
                            : item.status === "pending"
                            ? "bg-amber-500 text-stone-950"
                            : item.status === "rejected"
                            ? "bg-red-600 text-white"
                            : "bg-stone-500 text-white"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-base text-stone-900 dark:text-stone-100">
                        {item.itemName}
                      </h4>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2">{item.description}</p>
                      <div className="flex items-center flex-wrap gap-2 mt-2">
                        <p className="text-sm font-black text-red-600 dark:text-red-400">
                          {item.sizes && item.sizes.length > 1 ? `From ${formatPrice(item.price)}` : formatPrice(item.price)}
                        </p>
                        {item.sizes && item.sizes.length > 0 && (
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300/40">
                            {item.sizes.length} sizes ({item.sizes.map((s) => s.size).join(", ")})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className="text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-amber-600"
                      >
                        {item.status === "inactive" ? "Set Active" : "Set Inactive"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setItemToDelete(item)}
                        aria-label="Delete item"
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <UtensilsCrossed className="w-12 h-12 text-stone-400 mx-auto mb-3" />
              <h3 className="font-bold text-base">No Menu Items Created Yet</h3>
              <p className="text-xs text-stone-500 mt-1">
                Start by adding your first wood-fired pizza to your restaurant's digital catalog.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Menu Item Tab */}
      {activeTab === "add" && (
        <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6">
          <div>
            <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100">
              Publish New Menu Item
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              {isPremium ? (
                <span className="text-amber-600 font-bold">Premium Vendor: Unlimited Items</span>
              ) : (
                <span>
                  Free Plan: Max 3 active items (Currently: <strong>{activeMenuItems} / 3</strong>)
                </span>
              )}
            </p>
          </div>

          <form onSubmit={handleCreateMenuItem} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Quattro Stagioni Wood-Fired"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                  {useSizes ? "Starting / Base Price (BDT)" : "Price (BDT) *"}
                </label>
                <input
                  type="number"
                  step="1"
                  required={!useSizes}
                  placeholder="500"
                  value={useSizes && pizzaSizes[0]?.price ? pizzaSizes[0].price : price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={useSizes}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 disabled:opacity-75 disabled:bg-stone-100 dark:disabled:bg-stone-850"
                />
              </div>
            </div>

            {/* Pizza Inch Sizes & Pricing Config */}
            <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-stone-850 border border-amber-200/70 dark:border-stone-700/60 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Pizza className="w-4 h-4 text-amber-500" />
                    Pizza Size Variations (Inches) & Pricing
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Configure standard inch sizes (5", 6", 8", 9", 12", 15") with custom prices in BDT
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-600 dark:text-stone-400">
                  <input
                    type="checkbox"
                    checked={useSizes}
                    onChange={(e) => setUseSizes(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 accent-red-600 cursor-pointer"
                  />
                  <span>Enable Sizes</span>
                </label>
              </div>

              {useSizes && (
                <div className="space-y-3 pt-1">
                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-stone-400 font-semibold mr-1">Quick Add Inch:</span>
                    {["5 inch", "6 inch", "8 inch", "9 inch", "12 inch", "15 inch"].map((preset) => {
                      const exists = pizzaSizes.some((s) => s.size === preset);
                      return (
                        <button
                          key={preset}
                          type="button"
                          disabled={exists}
                          onClick={() => {
                            if (!exists) {
                              setPizzaSizes([...pizzaSizes, { size: preset, price: "" }]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            exists
                              ? "bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed"
                              : "bg-white dark:bg-stone-800 border border-amber-300 dark:border-stone-600 text-stone-800 dark:text-stone-200 hover:bg-amber-100 dark:hover:bg-stone-700 cursor-pointer"
                          }`}
                        >
                          +{preset}
                        </button>
                      );
                    })}
                  </div>

                  {/* Size Tiers Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {pizzaSizes.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                      >
                        <input
                          type="text"
                          value={s.size}
                          onChange={(e) => {
                            const updated = [...pizzaSizes];
                            updated[idx].size = e.target.value;
                            setPizzaSizes(updated);
                          }}
                          placeholder="e.g. 8 inch"
                          className="w-24 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100"
                        />
                        <div className="flex-1 relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                            BDT
                          </span>
                          <input
                            type="number"
                            value={s.price}
                            onChange={(e) => {
                              const updated = [...pizzaSizes];
                              updated[idx].price = e.target.value;
                              setPizzaSizes(updated);
                            }}
                            placeholder="Price"
                            className="w-full pl-11 pr-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100"
                          />
                        </div>
                        {pizzaSizes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setPizzaSizes(pizzaSizes.filter((_, i) => i !== idx));
                            }}
                            className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                Location (Area / City) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Downtown Core, Little Italy"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                Description & Toppings *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe crust fermentation, sauce, cheeses, and seasoning..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            {/* Required Image Upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-amber-500" />
                Upload Item Image *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleItemImageUpload}
                disabled={uploadingImage}
                className="text-xs text-stone-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
              />

              {itemImages.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {itemImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="Uploaded"
                      className="w-16 h-16 rounded-xl object-cover border border-amber-300"
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submittingItem || uploadingImage}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {submittingItem ? "Submitting for Admin Approval..." : "Submit Menu Item"}
            </button>
          </form>
        </div>
      )}

      {/* Customer Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100">
              Customer Orders
            </h1>
            <p className="text-xs text-stone-500">
              Incoming food orders submitted by customers. Review and accept or reject pending orders.
            </p>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={order.item?.images?.[0] || order.itemImage || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200"}
                      alt={order.itemName}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                          <span>{order.itemName}</span>
                          {order.selectedSize && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40">
                              {order.selectedSize}
                            </span>
                          )}
                        </h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            order.status === "accepted"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                              : order.status === "pending"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-300">
                        <strong>Customer:</strong> {order.customer?.name || "Customer"} (
                        {order.customer?.email})
                      </p>
                      <p className="text-xs text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        <span>{order.deliveryAddress}</span>
                      </p>
                      <p className="text-xs text-stone-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span>Delivery Date: <strong>{order.deliveryDate}</strong></span>
                      </p>
                      {order.message && (
                        <p className="text-xs text-stone-500 italic">
                          "{order.message}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions (Only pending orders can be accepted/rejected, and only once!) */}
                  {order.status === "pending" ? (
                    <div className="flex items-center gap-2.5 w-full lg:w-auto">
                      <button
                        onClick={() => handleOrderAction(order._id, "accepted")}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept Order</span>
                      </button>
                      <button
                        onClick={() => handleOrderAction(order._id, "rejected")}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject Order</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-stone-400 capitalize">
                      Order {order.status}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <ShoppingBag className="w-12 h-12 text-stone-400 mx-auto mb-3" />
              <h3 className="font-bold text-base">No Customer Orders Yet</h3>
              <p className="text-xs text-stone-500 mt-1">
                Customer orders will appear here as soon as orders are submitted.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Subscription Plan Tab (Stripe Integration) */}
      {activeTab === "subscription" && (
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100">
              Vendor Membership Plans
            </h1>
            <p className="text-xs text-stone-500">
              Upgrade to Premium for unlimited pizza listings, Gold badges, and homepage spotlight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            {/* Free Plan */}
            <div
              className={`p-8 rounded-3xl bg-white dark:bg-stone-900 border ${
                !isPremium
                  ? "border-amber-400 ring-2 ring-amber-400/20"
                  : "border-stone-200 dark:border-stone-800"
              } shadow-sm space-y-6 flex flex-col justify-between`}
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Starter Plan
                </span>
                <h3 className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
                  Free Vendor
                </h3>
                <p className="text-3xl font-black text-stone-900 dark:text-stone-100 mt-4">BDT 0 / mo</p>

                <ul className="space-y-3 pt-6 text-xs text-stone-600 dark:text-stone-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Max 3 active menu items</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Basic vendor dashboard & analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Customer order accept / reject workflow</span>
                  </li>
                </ul>
              </div>

              {!isPremium && (
                <div className="p-3 text-center rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-bold text-stone-600 dark:text-stone-400">
                  Current Active Plan
                </div>
              )}
            </div>

            {/* Premium Plan (Stripe Checkout) */}
            <div
              className={`p-8 rounded-3xl bg-white dark:bg-stone-900 border ${
                isPremium
                  ? "border-amber-500 ring-4 ring-amber-400/30"
                  : "border-amber-300 dark:border-amber-900/60"
              } shadow-xl space-y-6 flex flex-col justify-between relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-red-500 text-white font-black text-[10px] uppercase tracking-widest px-4 py-1 rounded-bl-xl shadow-xs">
                Recommended
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> High Volume Bakery
                </span>
                <h3 className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
                  Premium Vendor
                </h3>
                <p className="text-3xl font-black text-red-600 dark:text-red-400 mt-4">
                  BDT 2,000 <span className="text-xs font-normal text-stone-500">/ month</span>
                </p>

                <ul className="space-y-3 pt-6 text-xs text-stone-600 dark:text-stone-300">
                  <li className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Unlimited active menu items</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Verified "Premium" vendor badge on all slices</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Featured placement on homepage sections</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>All Free plan features included</span>
                  </li>
                </ul>
              </div>

              {isPremium ? (
                <div className="p-3 text-center rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-xs font-bold text-amber-800 dark:text-amber-300">
                  Active Premium Member (Unlimited Items Unlocked)
                </div>
              ) : (
                <button
                  onClick={handleUpgradeToPremium}
                  disabled={upgradingStripe}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-sm shadow-lg shadow-red-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {upgradingStripe ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Upgrade to Premium (Stripe)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => {
          if (!deletingItem) setItemToDelete(null);
        }}
        onConfirm={handleConfirmDeleteItem}
        isLoading={deletingItem}
        title="Delete Menu Item?"
        description={
          itemToDelete ? (
            <span>
              Are you sure you want to permanently delete{" "}
              <strong className="text-stone-900 dark:text-stone-100">{itemToDelete.itemName}</strong>? This item will no longer appear on your restaurant menu.
            </span>
          ) : ""
        }
        confirmText="Yes, Delete Item"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

export default function VendorDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VendorDashboardContent />
    </Suspense>
  );
}
