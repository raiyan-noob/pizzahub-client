"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import {
  Pizza,
  Menu as MenuIcon,
  X,
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  ShoppingBag,
  Store,
  ShieldCheck,
} from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated, logout, role, loading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const getDashboardLink = () => {
    if (role === "admin") return "/dashboard/admin";
    if (role === "vendor") return "/dashboard/vendor";
    return "/dashboard/customer";
  };

  const getRoleBadge = () => {
    if (role === "admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300">
          <ShieldCheck className="w-3 h-3" /> Admin
        </span>
      );
    }
    if (role === "vendor") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
          <Store className="w-3 h-3" /> Vendor
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
        <ShoppingBag className="w-3 h-3" /> Customer
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-amber-50/85 dark:bg-stone-900/90 backdrop-blur-md border-b border-amber-200/70 dark:border-stone-800 shadow-xs shadow-amber-900/5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-17">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/25 group-hover:scale-105 transition-transform border border-amber-300/30">
              <Pizza className="w-5.5 h-5.5 transform group-hover:rotate-12 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 bg-clip-text text-transparent">
                PizzaHub
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700/80 dark:text-amber-400/80 -mt-1">
                Artisan Slice
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                pathname === "/"
                  ? "text-red-600 dark:text-red-400 font-bold bg-amber-100/70 dark:bg-red-950/40 shadow-xs"
                  : "text-stone-700 dark:text-stone-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-amber-100/40 dark:hover:bg-stone-800"
              }`}
            >
              Home
            </Link>

            <Link
              href="/menu"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                pathname.startsWith("/menu")
                  ? "text-red-600 dark:text-red-400 font-bold bg-amber-100/70 dark:bg-red-950/40 shadow-xs"
                  : "text-stone-700 dark:text-stone-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-amber-100/40 dark:hover:bg-stone-800"
              }`}
            >
              Browse Menu
            </Link>

            {isAuthenticated && (
              <Link
                href={getDashboardLink()}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  pathname.startsWith("/dashboard")
                    ? "text-red-600 dark:text-red-400 font-bold bg-amber-100/70 dark:bg-red-950/40 shadow-xs"
                    : "text-stone-700 dark:text-stone-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-amber-100/40 dark:hover:bg-stone-800"
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Right Actions: Theme Toggle & User Auth */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {loading ? (
              <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
            ) : isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full border border-stone-200 dark:border-stone-700 hover:border-red-300 dark:hover:border-red-700 bg-stone-50 dark:bg-stone-800 transition-all focus:outline-hidden"
                >
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 dark:text-red-400 text-xs font-bold">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="text-sm font-medium text-stone-800 dark:text-stone-200 max-w-[120px] truncate">
                    {user?.name || "My Account"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-stone-100 dark:border-stone-800">
                      <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-stone-500 truncate mb-1.5">{user?.email}</p>
                      {getRoleBadge()}
                    </div>

                    <Link
                      href={getDashboardLink()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-red-600 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-stone-500" />
                      Dashboard
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-red-600 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-stone-500" />
                      Profile Settings
                    </Link>

                    <div className="border-t border-stone-100 dark:border-stone-800 my-1"></div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/signin"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-stone-700 dark:text-stone-200 hover:text-red-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white shadow-md shadow-red-500/20 hover:shadow-lg transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 pt-3 pb-5 space-y-2">
          {isAuthenticated && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-stone-800/60 mb-3">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 text-sm font-bold">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div className="flex-1 truncate">
                <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                <div className="mt-1">{getRoleBadge()}</div>
              </div>
            </div>
          )}

          <Link
            href="/"
            className="block px-3 py-2 rounded-lg text-base font-medium text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Home
          </Link>
          <Link
            href="/menu"
            className="block px-3 py-2 rounded-lg text-base font-medium text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Browse Menu
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                href={getDashboardLink()}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Profile Settings
              </Link>
              <button
                onClick={() => logout()}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/signin"
                className="w-full text-center py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-semibold text-stone-800 dark:text-stone-200"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-semibold shadow-md"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
