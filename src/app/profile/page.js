"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, refreshUser, role } = useAuth();

  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.info("Please sign in to access your profile settings");
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
    setSaving(true);
    try {
      const res = await apiRequest("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name,
          businessName: role === "vendor" ? businessName : undefined,
          address,
          phone,
          image,
        }),
      });

      if (res.success) {
        toast.success("Profile updated successfully!");
        refreshUser();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/70 dark:bg-stone-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8 bg-white dark:bg-stone-900 p-8 sm:p-10 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
            Account Profile Settings
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Update your public profile and personal delivery information.
          </p>
        </div>

        {/* User Identity Banner (Read-only Role & Subscription Display) */}
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-stone-800/60 border border-amber-200/50 dark:border-stone-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {image ? (
              <img
                src={image}
                alt={user.name}
                className="w-14 h-14 rounded-2xl object-cover border border-amber-300"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">
                {user.name?.[0] || "U"}
              </div>
            )}
            <div>
              <p className="font-bold text-stone-900 dark:text-stone-100">{user.name}</p>
              <p className="text-xs text-stone-500">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                  {role}
                </span>
                {role === "vendor" && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    <Sparkles className="w-2.5 h-2.5" /> {user.subscriptionPlan || "free"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-stone-400 text-right max-w-[140px]">
            Security Notice: Roles and Subscription plans cannot be changed via profile edits.
          </div>
        </div>

        {/* Profile Update Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Avatar Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-amber-500" />
              Update Profile Image (ImgBB)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="text-xs text-stone-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
            />
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Email (Read-Only) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-stone-400" />
              Email Address (Fixed)
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
                Restaurant / Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          {/* Default Delivery Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              Default Street / Delivery Address
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

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Save Profile Updates</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
