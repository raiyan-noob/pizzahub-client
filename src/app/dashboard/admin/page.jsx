"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LoadingScreen } from "@/components/LoadingScreen";
import {
  Users,
  UtensilsCrossed,
  Receipt,
  LayoutDashboard,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  Lock,
  Unlock,
  Store,
  TrendingUp,
  ShoppingBag,
  Calendar,
  MapPin,
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

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Manage Users state
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");

  // Manage Menu Items state
  const [menuItemsList, setMenuItemsList] = useState([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [menuStatusFilter, setMenuStatusFilter] = useState("");

  // Transactions state
  const [transactionsList, setTransactionsList] = useState([]);

  // Platform Orders state
  const [ordersList, setOrdersList] = useState([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Fetch Stats
  const loadStats = useCallback(async () => {
    try {
      const res = await apiRequest("/api/admin/stats");
      if (res.success) setStats(res.stats);
    } catch (err) {
      console.error("Fetch admin stats error:", err);
    }
  }, []);

  // Fetch Orders
  const loadOrders = useCallback(async () => {
    try {
      const res = await apiRequest("/api/orders/admin");
      if (res.success) setOrdersList(res.data || []);
    } catch (err) {
      console.error("Fetch admin orders error:", err);
    }
  }, []);

  // Fetch Users
  const loadUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (userSearch) params.set("search", userSearch);
      if (userRoleFilter) params.set("role", userRoleFilter);
      const res = await apiRequest(`/api/users?${params.toString()}`);
      if (res.success) setUsersList(res.data || []);
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  }, [userSearch, userRoleFilter]);

  // Fetch Menu Items
  const loadMenuItems = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (menuSearch) params.set("search", menuSearch);
      if (menuStatusFilter) params.set("status", menuStatusFilter);
      const res = await apiRequest(`/api/admin/menu-items?${params.toString()}`);
      if (res.success) setMenuItemsList(res.data || []);
    } catch (err) {
      console.error("Fetch admin menu items error:", err);
    }
  }, [menuSearch, menuStatusFilter]);

  // Fetch Transactions
  const loadTransactions = useCallback(async () => {
    try {
      const res = await apiRequest("/api/transactions");
      if (res.success) setTransactionsList(res.data || []);
    } catch (err) {
      console.error("Fetch transactions error:", err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      loadStats(),
      loadUsers(),
      loadMenuItems(),
      loadTransactions(),
      loadOrders(),
    ]).finally(() => {
      setLoading(false);
    });
  }, [loadStats, loadUsers, loadMenuItems, loadTransactions, loadOrders]);

  const [userToBlock, setUserToBlock] = useState(null);
  const [blockingUser, setBlockingUser] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deletingItem, setDeletingItem] = useState(false);

  // Block or Unblock user via ConfirmDialog (Admin action)
  const handleConfirmToggleBlock = async () => {
    if (!userToBlock) return;
    const newBlockedState = !userToBlock.isBlocked;
    const actionText = newBlockedState ? "block" : "unblock";
    setBlockingUser(true);
    try {
      const res = await apiRequest(`/api/users/${userToBlock.id || userToBlock._id}/block`, {
        method: "PATCH",
        body: JSON.stringify({ isBlocked: newBlockedState }),
      });
      if (res.success) {
        toast.success(res.message);
        setUserToBlock(null);
        loadUsers();
      }
    } catch (err) {
      toast.error(err.message || `Failed to ${actionText} user`);
    } finally {
      setBlockingUser(false);
    }
  };

  // Change menu item status (approve or reject)
  const handleUpdateItemStatus = async (itemId, newStatus) => {
    try {
      const res = await apiRequest(`/api/admin/menu-items/${itemId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        toast.success(res.message);
        loadMenuItems();
        loadStats();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update item status");
    }
  };

  // Delete inappropriate menu item via ConfirmDialog
  const handleConfirmDeleteItem = async () => {
    if (!itemToDelete) return;
    setDeletingItem(true);
    try {
      const res = await apiRequest(`/api/menu/${itemToDelete._id}`, { method: "DELETE" });
      if (res.success) {
        toast.success("Item removed from platform");
        setItemToDelete(null);
        loadMenuItems();
        loadStats();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete item");
    } finally {
      setDeletingItem(false);
    }
  };

  // Chart data
  const chartData = [
    { name: "Total Users", count: stats?.totalUsers || 0, fill: "#8b5cf6" },
    { name: "Vendors", count: stats?.totalVendors || 0, fill: "#f59e0b" },
    { name: "Customers", count: stats?.totalCustomers || 0, fill: "#10b981" },
    { name: "Menu Items", count: stats?.totalMenuItems || 0, fill: "#dc2626" },
    { name: "Pending Approval", count: stats?.pendingMenuItems || 0, fill: "#ec4899" },
    { name: "Delivered Orders", count: stats?.orderStatusCounts?.delivered || 0, fill: "#059669" },
  ];

  if (loading) {
    return <LoadingScreen message="Loading administrative portal & statistics..." />;
  }

  return (
    <div className="space-y-8">
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
              Master Administrator Overview
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Live statistics, platform transactions, moderation queues, and user activity.
            </p>
          </div>

          {/* 6 Required Overview Stats Cards (Page 7) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="text-xs uppercase font-bold text-stone-400">Total Users</span>
              <p className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
                {stats?.totalUsers || 0}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="text-xs uppercase font-bold text-amber-500">Total Vendors</span>
              <p className="text-2xl font-black text-amber-500 mt-1">{stats?.totalVendors || 0}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="text-xs uppercase font-bold text-emerald-500">Customers</span>
              <p className="text-2xl font-black text-emerald-500 mt-1">
                {stats?.totalCustomers || 0}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="text-xs uppercase font-bold text-stone-400">Total Menu Items</span>
              <p className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
                {stats?.totalMenuItems || 0}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="text-xs uppercase font-bold text-red-500">Pending Approvals</span>
              <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
                {stats?.pendingMenuItems || 0}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 dark:from-stone-900 dark:to-stone-850 border border-emerald-300 dark:border-emerald-800 shadow-xs">
              <span className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400">
                Total Transactions
              </span>
              <p className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
                {stats?.totalTransactions || 0}
              </p>
              <span className="text-xs text-stone-400 font-semibold">
                Revenue: {formatPrice(stats?.totalRevenue || 0)}
              </span>
            </div>
          </div>

          {/* Platform Order Fulfillment Live Metrics */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-red-500" />
                  <span>Platform Order Fulfillment Status</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Real-time status tracking of all customer pizza orders across registered restaurants.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40">
                <span className="text-[11px] font-bold uppercase text-amber-700 dark:text-amber-400">
                  Pending Review
                </span>
                <p className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-1">
                  {stats?.orderStatusCounts?.pending || 0}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40">
                <span className="text-[11px] font-bold uppercase text-blue-700 dark:text-blue-400">
                  Accepted & Baking
                </span>
                <p className="text-2xl font-black text-blue-800 dark:text-blue-300 mt-1">
                  {stats?.orderStatusCounts?.accepted || 0}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40">
                <span className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
                  Delivered Orders
                </span>
                <p className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1">
                  {stats?.orderStatusCounts?.delivered || 0}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                <span className="text-[11px] font-bold uppercase text-stone-600 dark:text-stone-400">
                  Cancelled / Rejected
                </span>
                <p className="text-2xl font-black text-stone-700 dark:text-stone-300 mt-1">
                  {(stats?.orderStatusCounts?.cancelled || 0) + (stats?.orderStatusCounts?.rejected || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Platform Visualization Chart (Page 11) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-4">
              Platform Distribution Metrics
            </h3>
            <div className="h-72 w-full">
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

      {/* Platform Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100">
                Platform Customer Orders
              </h1>
              <p className="text-xs text-stone-500">
                Live oversight of all artisan pizza orders across all restaurants and customers.
              </p>
            </div>

            {/* Quick Status Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All Orders", count: ordersList.length },
                { id: "pending", label: "Pending", count: ordersList.filter((o) => o.status === "pending").length },
                { id: "accepted", label: "Baking", count: ordersList.filter((o) => o.status === "accepted").length },
                { id: "delivered", label: "Delivered", count: ordersList.filter((o) => o.status === "delivered").length },
                { id: "rejected", label: "Rejected", count: ordersList.filter((o) => o.status === "rejected").length },
                { id: "cancelled", label: "Cancelled", count: ordersList.filter((o) => o.status === "cancelled").length },
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

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by pizza name, customer name, email, or pizzeria..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden"
            />
          </div>

          {/* Orders Table */}
          <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800/60 uppercase tracking-wider text-stone-500 font-bold border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="p-4">Pizza Item</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Pizzeria / Vendor</th>
                    <th className="p-4">Delivery Info</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {ordersList.filter((o) => {
                    if (orderStatusFilter !== "all" && o.status !== orderStatusFilter) return false;
                    if (!orderSearch.trim()) return true;
                    const q = orderSearch.toLowerCase();
                    return (
                      o.itemName?.toLowerCase().includes(q) ||
                      o.customer?.name?.toLowerCase().includes(q) ||
                      o.customer?.email?.toLowerCase().includes(q) ||
                      o.vendor?.name?.toLowerCase().includes(q)
                    );
                  }).length > 0 ? (
                    ordersList
                      .filter((o) => {
                        if (orderStatusFilter !== "all" && o.status !== orderStatusFilter) return false;
                        if (!orderSearch.trim()) return true;
                        const q = orderSearch.toLowerCase();
                        return (
                          o.itemName?.toLowerCase().includes(q) ||
                          o.customer?.name?.toLowerCase().includes(q) ||
                          o.customer?.email?.toLowerCase().includes(q) ||
                          o.vendor?.name?.toLowerCase().includes(q)
                        );
                      })
                      .map((o) => (
                        <tr key={o._id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={o.item?.images?.[0] || o.itemImage || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200"}
                                alt={o.itemName}
                                className="w-10 h-10 rounded-xl object-cover"
                              />
                              <div>
                                <p className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                                  <span>{o.itemName}</span>
                                  {o.selectedSize && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                      {o.selectedSize}
                                    </span>
                                  )}
                                </p>
                                <p className="text-stone-400 text-[11px]">{formatDate(o.createdAt)}</p>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <p className="font-bold text-stone-900 dark:text-stone-100">{o.customer?.name || "Customer"}</p>
                            <p className="text-stone-500 text-[11px]">{o.customer?.email}</p>
                          </td>

                          <td className="p-4">
                            <p className="font-bold text-stone-900 dark:text-stone-100">{o.vendor?.name || "Local Pizzeria"}</p>
                            <p className="text-stone-500 text-[11px]">{o.vendor?.email}</p>
                          </td>

                          <td className="p-4 text-stone-600 dark:text-stone-300">
                            <p className="font-semibold">{o.deliveryDate}</p>
                            <p className="text-stone-400 text-[11px] max-w-[180px] truncate">{o.deliveryAddress}</p>
                          </td>

                          <td className="p-4 font-black text-red-600 dark:text-red-400">
                            {formatPrice(o.totalPrice)}
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                o.status === "delivered"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/40"
                                  : o.status === "accepted"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-300/40"
                                  : o.status === "pending"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/40"
                                  : "bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 border border-red-300/40"
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-400">
                        No orders match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manage Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100">
              Manage Registered Users
            </h1>
            <p className="text-xs text-stone-500">
              Search by name/email, filter by role, and manage platform access permissions.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative col-span-2">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden"
              />
            </div>

            <div>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden"
              >
                <option value="">All Roles</option>
                <option value="customer">Customers Only</option>
                <option value="vendor">Vendors Only</option>
                <option value="admin">Administrators</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800/60 uppercase tracking-wider text-stone-500 font-bold border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Subscription</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {usersList.map((u) => (
                    <tr key={u._id || u.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                      <td className="p-4 flex items-center gap-3">
                        {u.image ? (
                          <img
                            src={u.image}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {u.name?.[0] || "U"}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-stone-900 dark:text-stone-100">
                            {u.name || "User"}
                          </p>
                          <p className="text-stone-500">{u.email}</p>
                          {u.businessName && (
                            <p className="text-[11px] text-amber-600">Bakery: {u.businessName}</p>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="capitalize font-semibold">{u.role}</span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.subscriptionPlan === "premium"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"
                              : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                          }`}
                        >
                          {u.subscriptionPlan || "free"}
                        </span>
                      </td>

                      <td className="p-4">
                        {u.isBlocked ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                            Blocked
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            Active
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {u.role !== "admin" ? (
                          <button
                            type="button"
                            onClick={() => setUserToBlock(u)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                              u.isBlocked
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-red-600 hover:bg-red-700 text-white"
                            }`}
                          >
                            {u.isBlocked ? (
                              <>
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Unblock</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>Block User</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-stone-400 italic">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manage Menu Items Tab */}
      {activeTab === "menu" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100">
              Manage Platform Menu Items
            </h1>
            <p className="text-xs text-stone-500">
              Review pending pizzas, approve or reject submissions, or delete inappropriate items.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative col-span-2">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden"
              />
            </div>

            <div>
              <select
                value={menuStatusFilter}
                onChange={(e) => setMenuStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved & Active</option>
                <option value="rejected">Rejected</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItemsList.map((item) => (
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
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        item.status === "approved"
                          ? "bg-emerald-500 text-white"
                          : item.status === "pending"
                          ? "bg-amber-500 text-stone-950"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-base text-stone-900 dark:text-stone-100">
                      {item.itemName}
                    </h4>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1">{item.description}</p>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="font-bold text-red-600 dark:text-red-400">
                        {formatPrice(item.price)}
                      </span>
                      <span className="text-stone-500">
                        By: {item.vendor?.name || "Vendor"}
                      </span>
                    </div>
                  </div>

                  {/* Admin Actions: Approve, Reject, Delete */}
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {item.status !== "approved" && (
                        <button
                          onClick={() => handleUpdateItemStatus(item._id, "approved")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                        >
                          Approve
                        </button>
                      )}
                      {item.status !== "rejected" && (
                        <button
                          onClick={() => handleUpdateItemStatus(item._id, "rejected")}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs"
                        >
                          Reject
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      aria-label="Delete item"
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions Ledger Tab */}
      {activeTab === "transactions" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100">
              Platform Transaction Audit Ledger
            </h1>
            <p className="text-xs text-stone-500">
              Read-only ledger of vendor Stripe subscription payments. Strictly tamper-proof.
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800/60 uppercase tracking-wider text-stone-500 font-bold border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="p-4">Vendor</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Stripe Session ID</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Transaction Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {transactionsList.length > 0 ? (
                    transactionsList.map((t) => (
                      <tr key={t._id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                        <td className="p-4">
                          <p className="font-bold text-stone-900 dark:text-stone-100">
                            {t.vendor?.name || "Vendor"}
                          </p>
                          <p className="text-stone-500">{t.vendor?.email}</p>
                        </td>

                        <td className="p-4">
                          <span className="capitalize font-semibold">{t.plan}</span>
                        </td>

                        <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {formatPrice(t.amount)}
                        </td>

                        <td className="p-4 text-stone-500 font-mono text-[11px] max-w-[150px] truncate">
                          {t.stripeSessionId}
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 uppercase">
                            {t.status}
                          </span>
                        </td>

                        <td className="p-4 text-stone-500">
                          {formatDate(t.createdAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-400">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Block / Unblock User Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!userToBlock}
        onClose={() => {
          if (!blockingUser) setUserToBlock(null);
        }}
        onConfirm={handleConfirmToggleBlock}
        isLoading={blockingUser}
        title={userToBlock?.isBlocked ? "Unblock User Account?" : "Block User Account?"}
        description={
          userToBlock ? (
            <span>
              Are you sure you want to {userToBlock.isBlocked ? "unblock" : "block"}{" "}
              <strong className="text-stone-900 dark:text-stone-100">{userToBlock.name || userToBlock.email}</strong>?{" "}
              {!userToBlock.isBlocked && "Blocked users cannot place orders, publish items, or access dashboards."}
            </span>
          ) : ""
        }
        confirmText={userToBlock?.isBlocked ? "Yes, Unblock" : "Yes, Block User"}
        cancelText="Cancel"
        variant={userToBlock?.isBlocked ? "primary" : "danger"}
      />

      {/* Delete Item Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => {
          if (!deletingItem) setItemToDelete(null);
        }}
        onConfirm={handleConfirmDeleteItem}
        isLoading={deletingItem}
        title="Permanently Delete Menu Item?"
        description={
          itemToDelete ? (
            <span>
              Are you sure you want to permanently delete{" "}
              <strong className="text-stone-900 dark:text-stone-100">{itemToDelete.itemName}</strong>? This item will be removed from the platform entirely.
            </span>
          ) : ""
        }
        confirmText="Yes, Delete Permanently"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading administrative portal..." />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
