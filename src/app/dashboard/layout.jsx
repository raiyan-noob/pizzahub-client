"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Pizza,
  LayoutDashboard,
  UtensilsCrossed,
  PlusCircle,
  ShoppingBag,
  Sparkles,
  Users,
  ShieldCheck,
  Receipt,
  Settings,
  LogOut,
  Menu as MenuIcon,
  X,
  Store,
  Heart,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

export default function DashboardLayout({ children }) {
  const { user, isAuthenticated, role, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Role Protection Middleware on the Client
  // Page 3 & 4: "Users must not be able to open another role's dashboard by changing the URL manually."
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      toast.info("Please sign in to access your dashboard");
      router.push("/signin");
      return;
    }

    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      toast.error("Forbidden: You do not have permission to access the Admin Dashboard");
      router.push(role === "vendor" ? "/dashboard/vendor" : "/dashboard/customer");
    } else if (pathname.startsWith("/dashboard/vendor") && role !== "vendor" && role !== "admin") {
      toast.error("Forbidden: You do not have permission to access the Vendor Dashboard");
      router.push("/dashboard/customer");
    } else if (pathname.startsWith("/dashboard/customer") && role !== "customer" && role !== "admin") {
      if (role === "vendor") router.push("/dashboard/vendor");
    }
  }, [loading, isAuthenticated, role, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50/50 dark:bg-stone-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-stone-500">Verifying security credentials...</p>
        </div>
      </div>
    );
  }

  // Define sidebar links based strictly on current user's role
  const getNavLinks = () => {
    if (role === "admin") {
      return [
        { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
        { name: "Manage Users", href: "/dashboard/admin?tab=users", icon: Users },
        { name: "Manage Menu Items", href: "/dashboard/admin?tab=menu", icon: UtensilsCrossed },
        { name: "Transactions Ledger", href: "/dashboard/admin?tab=transactions", icon: Receipt },
        { name: "Profile Settings", href: "/profile", icon: Settings },
      ];
    }
    if (role === "vendor") {
      return [
        { name: "Overview", href: "/dashboard/vendor", icon: LayoutDashboard },
        { name: "My Menu Items", href: "/dashboard/vendor?tab=items", icon: UtensilsCrossed },
        { name: "Add Menu Item", href: "/dashboard/vendor?tab=add", icon: PlusCircle },
        { name: "Customer Orders", href: "/dashboard/vendor?tab=orders", icon: ShoppingBag },
        { name: "Subscription Plan", href: "/dashboard/vendor?tab=subscription", icon: Sparkles },
        { name: "Profile Settings", href: "/profile", icon: Settings },
      ];
    }
    // Default: Customer
    return [
      { name: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
      { name: "My Food Orders", href: "/dashboard/customer?tab=orders", icon: ShoppingBag },
      { name: "Favorites & Wishlist", href: "/dashboard/customer?tab=favorites", icon: Heart },
      { name: "Profile Settings", href: "/profile", icon: Settings },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-stone-100/70 dark:bg-stone-950">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-xs">
            <Pizza className="w-5 h-5" />
          </div>
          <span className="font-bold text-stone-900 dark:text-stone-100 capitalize">
            {role} Dashboard
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-stone-900 border-r border-stone-200/80 dark:border-stone-800 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 md:static ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          {/* Brand Header & Theme Switcher in Sidebar */}
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-stone-200/80 dark:border-stone-800">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
                <Pizza className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
                  PizzaHub
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">
                  {role} Portal
                </span>
              </div>
            </Link>
            <ThemeToggle />
          </div>

          {/* User Profile Card in Sidebar (Page 11) */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/60 dark:bg-stone-800/60 border border-amber-200/50 dark:border-stone-700/50 mb-6">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 font-bold text-sm shrink-0">
                {user?.name?.[0] || "U"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                {user?.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300">
                  {role}
                </span>
                {role === "vendor" && user?.subscriptionPlan === "premium" && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-stone-950">
                    <Sparkles className="w-2.5 h-2.5" /> PRO
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-red-600 text-white shadow-md shadow-red-500/20"
                      : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Action: Back to Site & Logout */}
        <div className="p-4 border-t border-stone-200/80 dark:border-stone-800 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-stone-400" />
            <span>Back to Main Site</span>
          </Link>
          <button
            onClick={() => {
              setMobileOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
