"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";
import { StatusTimeline } from "@/components/StatusTimeline";
import { PizzaCard } from "@/components/PizzaCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LoadingScreen } from "@/components/LoadingScreen";
import { toast } from "sonner";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Calendar,
  MapPin,
  Heart,
  Store,
  ChevronRight,
  Pizza,
} from "lucide-react";
import Link from "next/link";

function CustomerDashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCustomerData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, favsRes] = await Promise.all([
        apiRequest("/api/orders/customer"),
        apiRequest("/api/reviews/favorites/all"),
      ]);

      if (ordersRes.success) setOrders(ordersRes.data || []);
      if (favsRes.success) setFavorites(favsRes.data || []);
    } catch (err) {
      console.error("Load customer data error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  // Statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const acceptedOrders = orders.filter((o) => o.status === "accepted").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const rejectedOrders = orders.filter((o) => o.status === "rejected").length;
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;

  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Cancel Pending Order via Confirmation Dialog (Page 6: "Customer can view order details and cancel pending orders")
  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    setCancelling(true);
    try {
      const res = await apiRequest(`/api/orders/${orderToCancel._id}/cancel`, {
        method: "PATCH",
      });
      if (res.success) {
        toast.success(res.message || "Order cancelled successfully");
        setOrderToCancel(null);
        loadCustomerData();
      }
    } catch (err) {
      toast.error(err.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
              Customer Food Dashboard
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Welcome back, {user?.name}! Track your piping-hot pizza deliveries and favorites.
            </p>
          </div>

          {/* 5 Required Overview Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="text-xs uppercase font-bold text-stone-400">Total Orders</span>
              <p className="text-3xl font-black text-stone-900 dark:text-stone-100 mt-1">
                {totalOrders}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="text-xs uppercase font-bold text-amber-500">Pending</span>
              <p className="text-3xl font-black text-amber-500 mt-1">{pendingOrders}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="text-xs uppercase font-bold text-blue-500">Accepted & Baking</span>
              <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {acceptedOrders}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400">Delivered</span>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {deliveredOrders}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="text-xs uppercase font-bold text-red-500">Rejected / Cancelled</span>
              <p className="text-3xl font-black text-red-500 mt-1">
                {rejectedOrders + cancelledOrders}
              </p>
            </div>
          </div>

          {/* Recent Orders Snippet */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                Recent Pizza Deliveries
              </h3>
              <Link
                href="/dashboard/customer?tab=orders"
                className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
              >
                <span>View All Orders</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div
                    key={order._id}
                    className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={order.item?.images?.[0] || order.itemImage || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200"}
                        alt={order.itemName}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                          <span>{order.itemName}</span>
                          {order.selectedSize && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40">
                              {order.selectedSize}
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-stone-500">
                          Delivery: {order.deliveryDate} • {formatPrice(order.totalPrice)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        order.status === "delivered"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/40"
                          : order.status === "accepted"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-300/40"
                          : order.status === "pending"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/40"
                          : "bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 border border-red-300/40"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-stone-400">
                You haven't ordered any pizzas yet!
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Food Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100">
                My Pizza Orders
              </h1>
              <p className="text-xs text-stone-500">
                Check live order timeline progress, details, and cancel pending orders before baking begins.
              </p>
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All", count: orders.length },
                { id: "pending", label: "Pending", count: pendingOrders },
                { id: "accepted", label: "Baking", count: acceptedOrders },
                { id: "delivered", label: "Delivered", count: deliveredOrders },
                { id: "cancelled", label: "Cancelled / Rejected", count: rejectedOrders + cancelledOrders },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setOrderStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    orderStatusFilter === tab.id
                      ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs"
                      : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      orderStatusFilter === tab.id
                        ? "bg-white/20 text-white dark:bg-stone-900/20 dark:text-stone-900"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-6">
              {orders
                .filter((order) => {
                  if (orderStatusFilter === "all") return true;
                  if (orderStatusFilter === "cancelled") {
                    return order.status === "cancelled" || order.status === "rejected";
                  }
                  return order.status === orderStatusFilter;
                })
                .map((order) => (
                <div
                  key={order._id}
                  className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-4">
                      <img
                        src={order.item?.images?.[0] || order.itemImage || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200"}
                        alt={order.itemName}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                          <span>{order.itemName}</span>
                          {order.selectedSize && (
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40">
                              {order.selectedSize}
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-stone-500">
                          Placed on: {formatDate(order.createdAt)}
                        </p>
                        <p className="text-sm font-black text-red-600 dark:text-red-400 mt-1">
                          {formatPrice(order.totalPrice)}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill & Cancel Action */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          order.status === "delivered"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/40"
                            : order.status === "accepted"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-300/40"
                            : order.status === "pending"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/40"
                            : "bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 border border-red-300/40"
                        }`}
                      >
                        {order.status}
                      </span>

                      {/* Cancel pending order (Page 6 requirement) */}
                      {order.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => setOrderToCancel(order)}
                          className="px-3.5 py-1.5 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Order Details Details info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-600 dark:text-stone-300">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>
                        <strong>Pizzeria:</strong> {order.vendor?.name || "Local Pizzeria"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>
                        <strong>Delivery Date:</strong> {order.deliveryDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="truncate">
                        <strong>Address:</strong> {order.deliveryAddress}
                      </span>
                    </div>
                  </div>

                  {order.message && (
                    <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-stone-800/40 text-xs text-stone-600 dark:text-stone-300">
                      <strong>Special Instructions:</strong> "{order.message}"
                    </div>
                  )}

                  {/* Order Status Timeline Stepper (Optional Requirement #3) */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2 block">
                      Live Delivery Progress
                    </span>
                    <StatusTimeline status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <ShoppingBag className="w-14 h-14 text-stone-400 mx-auto mb-3" />
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">
                No orders placed yet
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Discover artisan pizzas and order freshly baked pies for dinner tonight.
              </p>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 mt-5 px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md"
              >
                <Pizza className="w-4 h-4" />
                <span>Explore Menu Catalog</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Favorites / Wishlist Tab (Optional Requirement #4) */}
      {activeTab === "favorites" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100">
              My Saved Favorites
            </h1>
            <p className="text-xs text-stone-500">
              Your bookmarked pizzas for quick one-click re-ordering.
            </p>
          </div>

          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((item) => (
                <PizzaCard
                  key={item._id}
                  item={item}
                  initialFavorite={true}
                  onFavoriteToggle={(id, isFav) => {
                    if (!isFav) {
                      setFavorites(favorites.filter((f) => f._id !== id));
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="p-16 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <Heart className="w-14 h-14 text-stone-400 mx-auto mb-3" />
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">
                Your Wishlist is Empty
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Browse pizzas and click the heart icon to save your favorite slices here.
              </p>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 mt-5 px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md"
              >
                <span>Browse Menu</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Cancel Order Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!orderToCancel}
        onClose={() => {
          if (!cancelling) setOrderToCancel(null);
        }}
        onConfirm={handleConfirmCancel}
        isLoading={cancelling}
        title="Cancel Pizza Order?"
        description={
          orderToCancel ? (
            <span>
              Are you sure you want to cancel your order for{" "}
              <strong className="text-stone-900 dark:text-stone-100">{orderToCancel.itemName}</strong> scheduled for delivery on{" "}
              <strong className="text-stone-900 dark:text-stone-100">{orderToCancel.deliveryDate}</strong>? This action cannot be undone.
            </span>
          ) : ""
        }
        confirmText="Yes, Cancel Order"
        cancelText="Nevermind, Keep Order"
        variant="danger"
      />
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading your orders & slices..." />}>
      <CustomerDashboardContent />
    </Suspense>
  );
}
