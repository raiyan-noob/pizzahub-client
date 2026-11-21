"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { uploadToImgBB } from "@/lib/imgbb";
import { toast } from "sonner";
import {
  User,
  Mail,
  Store,
  MapPin,
  Phone,
  Upload,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  Edit3,
  X,
  ArrowLeft,
  Calendar,
  Lock,
  ShoppingBag,
} from "lucide-react";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, refreshUser, role } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.info("Please sign in to access your profile");
      router.push("/signin");
      return;
    }

    if (user) {
      setName(user.name || "");
      setBusinessName(user.businessName || "");
      setAddress(user.address || "");
      setPhone(user.phone || "");
      setImage(user.image || "");
    }
  }, [authLoading, isAuthenticated, user, router]);

  const resetFormToUser = () => {
    if (user) {
      setName(user.name || "");
      setBusinessName(user.businessName || "");
      setAddress(user.address || "");
      setPhone(user.phone || "");
      setImage(user.image || "");
    }
    setIsEditing(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      toast.loading("Uploading photo to ImgBB...", { id: "profile-upload" });
      const url = await uploadToImgBB(file);
      setImage(url);
      toast.success("Profile photo uploaded!", { id: "profile-upload" });
    } catch (err) {
      toast.error(err.message || "Upload failed", { id: "profile-upload" });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please provide your full name");
      return;
    }

    setSaving(true);
    try {
      const res = await apiRequest("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim(),
          businessName: role === "vendor" ? businessName.trim() : undefined,
          address: address.trim(),
          phone: phone.trim(),
          image,
        }),
      });

      if (res.success) {
        toast.success("Profile updated successfully!");
        await refreshUser();
        setIsEditing(false);
      }
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50/70 dark:bg-stone-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-stone-500">Loading profile details...</p>
        </div>
      </div>
    );
  }

  const getDashboardPath = () => {
    if (role === "admin") return "/dashboard/admin";
    if (role === "vendor") return "/dashboard/vendor";
    return "/dashboard/customer";
  };

  return (
    <div className="min-h-screen bg-stone-50/70 dark:bg-stone-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href={getDashboardPath()}
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* Profile Details Container */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xl overflow-hidden">
          {/* Cover / Header Banner */}
          <div className="h-32 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 relative p-6 flex items-end">
            <span className="text-white/80 text-xs font-black uppercase tracking-widest">
              PizzaHub User Account
            </span>
          </div>

          <div className="p-6 sm:p-8 -mt-16 space-y-8">
            {/* Avatar & User Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                <div className="relative">
                  {image || user.image ? (
                    <img
                      src={image || user.image}
                      alt={user.name}
                      className="w-24 h-24 rounded-3xl object-cover border-4 border-white dark:border-stone-900 shadow-xl bg-white dark:bg-stone-800"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center font-black text-3xl border-4 border-white dark:border-stone-900 shadow-xl">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                    {user.name}
                  </h1>
                  <p className="text-xs text-stone-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>{user.email}</span>
                  </p>
                </div>
              </div>

              {/* Role & Plan Badges */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    role === "admin"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                      : role === "vendor"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  }`}
                >
                  {role === "admin" && <ShieldCheck className="w-3.5 h-3.5" />}
                  {role === "vendor" && <Store className="w-3.5 h-3.5" />}
                  {role === "customer" && <ShoppingBag className="w-3.5 h-3.5" />}
                  <span>{role}</span>
                </span>

                {role === "vendor" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-stone-950 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{user.subscriptionPlan === "premium" ? "Premium Plan" : "Free Plan"}</span>
                  </span>
                )}
              </div>
            </div>

            {/* VIEW MODE */}
            {!isEditing ? (
              <div className="space-y-6 pt-2">
                <div className="border-t border-stone-100 dark:border-stone-800 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">
                      Profile Information
                    </h2>
                    <span className="text-xs text-stone-400">Click Edit Profile to make changes</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-amber-500" /> Full Name
                      </span>
                      <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {user.name || "Not provided"}
                      </p>
                    </div>

                    {/* Email */}
                    <div className="p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-amber-500" /> Email Address
                      </span>
                      <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {user.email}
                      </p>
                    </div>

                    {/* If Vendor: Restaurant Name */}
                    {role === "vendor" && (
                      <div className="p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-amber-500" /> Restaurant / Bakery Name
                        </span>
                        <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          {user.businessName || "Not set yet"}
                        </p>
                      </div>
                    )}

                    {/* Phone Number */}
                    <div className="p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" /> Contact Phone
                      </span>
                      <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {user.phone || (
                          <span className="text-stone-400 font-normal italic">No phone added</span>
                        )}
                      </p>
                    </div>

                    {/* Delivery Address */}
                    <div className={`p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 space-y-1 ${role !== "vendor" ? "md:col-span-2" : ""}`}>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-500" /> Default Delivery Address
                      </span>
                      <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {user.address || (
                          <span className="text-stone-400 font-normal italic">No delivery address set</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Role Protection Security Banner (Page 8) */}
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-stone-800/60 border border-amber-200/50 dark:border-stone-700/50 flex items-center gap-3 text-xs text-stone-600 dark:text-stone-300">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Security Notice:</strong> Account roles and subscription tiers cannot be altered through profile updates per platform security guidelines.
                  </span>
                </div>
              </div>
            ) : (
              /* EDIT MODE */
              <form onSubmit={handleSaveProfile} className="space-y-5 pt-2">
                <div className="border-t border-stone-100 dark:border-stone-800 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                      Editing Profile Details
                    </h2>
                    <span className="text-xs text-stone-400">Make your updates and save</span>
                  </div>

                  <div className="space-y-4">
                    {/* Profile Image Upload (ImgBB) */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-amber-500" />
                        Update Profile Image (ImgBB)
                      </label>
                      <div className="flex items-center gap-3">
                        {image ? (
                          <img
                            src={image}
                            alt="Preview"
                            className="w-12 h-12 rounded-xl object-cover border border-amber-300"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-400 text-xs">
                            Avatar
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage || saving}
                          className="text-xs text-stone-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-amber-500" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    {/* Email (Read-Only) */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-stone-400" />
                        Email Address (Read-Only)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={user.email}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-850 text-stone-500 text-sm cursor-not-allowed"
                      />
                    </div>

                    {/* If Vendor: Business Name */}
                    {role === "vendor" && (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-amber-500" />
                          Restaurant / Bakery Name *
                        </label>
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. Tony's Brick Oven Pizzeria"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    )}

                    {/* Default Delivery Address */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        Default Delivery Address
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 742 Evergreen Terrace, Apt 4"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        Contact Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. +1 (555) 019-2834"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={resetFormToUser}
                    disabled={saving || uploadingImage}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>

                  <button
                    type="submit"
                    disabled={saving || uploadingImage}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-red-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
