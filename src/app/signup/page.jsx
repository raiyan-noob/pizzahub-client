"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { uploadToImgBB } from "@/lib/imgbb";
import { toast } from "sonner";

import {
  Pizza,
  User,
  Mail,
  Lock,
  Store,
  ShoppingBag,
  Upload,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { signup, loginWithGoogle, isAuthenticated, role } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accountRole, setAccountRole] = useState("customer"); // 'customer' or 'vendor'
  const [businessName, setBusinessName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Auto redirect if already logged in (Vendor redirects to home "/")
  React.useEffect(() => {
    if (isAuthenticated) {
      if (role === "admin") router.push("/dashboard/admin");
      else if (role === "vendor") router.push("/");
      else router.push("/dashboard/customer");
    }
  }, [isAuthenticated, role, router]);

  // Password rule checks (Page 3 requirement)
  const isMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const isPasswordValid = isMinLength && hasUppercase && hasLowercase;

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      toast.loading("Uploading image...", { id: "image-upload" });
      const imageUrl = await uploadToImgBB(file);
      setProfileImage(imageUrl);
      toast.success("Image uploaded successfully!", { id: "image-upload" });
    } catch (err) {
      toast.error(err.message || "Failed to upload image", { id: "image-upload" });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error(
        "Password must be at least 6 characters and contain both uppercase and lowercase letters"
      );
      return;
    }

    // Role security: Admin cannot be chosen (Page 3)
    if (accountRole !== "customer" && accountRole !== "vendor") {
      toast.error("Invalid role selected");
      return;
    }

    setSubmitting(true);
    try {
      const newUser = await signup({
        name,
        email,
        password,
        role: accountRole,
        image: profileImage,
        businessName: accountRole === "vendor" ? businessName : undefined,
      });

      // Redirect according to role (Vendor redirects to home "/")
      if (accountRole === "vendor") {
        router.push("/");
      } else {
        router.push("/dashboard/customer");
      }
    } catch {
      // Handled in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSubmit = async () => {
    setGoogleLoading(true);
    try {
      toast.loading(`Signing up with Google as ${accountRole === "vendor" ? "Vendor" : "Customer"}...`, { id: "google-auth" });
      await loginWithGoogle(accountRole);
    } catch (err) {
      toast.error(err?.message || "Google registration failed", { id: "google-auth" });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-amber-50/40 dark:bg-stone-950">
      <div className="max-w-lg w-full space-y-8 bg-white dark:bg-stone-900 p-8 sm:p-10 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/20">
              <Pizza className="w-7 h-7" />
            </div>
          </Link>
          <h2 className="text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs text-stone-500">
            Join PizzaHub to order piping-hot slices or manage your artisan bakery.
          </p>
        </div>

        {/* Google Authentication */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSubmit}
            disabled={submitting || uploadingImage || googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-sm font-bold hover:bg-stone-50 dark:hover:bg-stone-750 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {googleLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>
              {googleLoading
                ? "Connecting to Google..."
                : `Sign up with Google as ${accountRole === "vendor" ? "Vendor" : "Customer"}`}
            </span>
          </button>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200 dark:border-stone-800" />
            </div>
            <span className="relative px-3 bg-white dark:bg-stone-900 text-xs text-stone-400 uppercase font-semibold">
              Or register with email
            </span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection (Vendor or Customer) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
              Select Account Role *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountRole("customer")}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border-2 font-bold text-xs transition-all ${
                  accountRole === "customer"
                    ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 shadow-xs"
                    : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400"
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Customer (Foodie)</span>
              </button>

              <button
                type="button"
                onClick={() => setAccountRole("vendor")}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border-2 font-bold text-xs transition-all ${
                  accountRole === "vendor"
                    ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 shadow-xs"
                    : "border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400"
                }`}
              >
                <Store className="w-4 h-4 text-amber-600" />
                <span>Vendor (Restaurant)</span>
              </button>
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
              placeholder="e.g. Leonardo da Vinci"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* If Vendor: Business / Restaurant Name */}
          {accountRole === "vendor" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-amber-500" />
                Restaurant / Business Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tony's Brick Oven Pizzeria"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-500" />
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Password with rules validation */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Minimum 6 characters..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Validation Indicators (Page 3) */}
            <div className="mt-2 grid grid-cols-3 gap-1 text-[11px]">
              <span
                className={`flex items-center gap-1 ${
                  isMinLength ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-stone-400"
                }`}
              >
                <CheckCircle2 className="w-3 h-3" /> Min 6 chars
              </span>
              <span
                className={`flex items-center gap-1 ${
                  hasUppercase ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-stone-400"
                }`}
              >
                <CheckCircle2 className="w-3 h-3" /> 1 Uppercase
              </span>
              <span
                className={`flex items-center gap-1 ${
                  hasLowercase ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-stone-400"
                }`}
              >
                <CheckCircle2 className="w-3 h-3" /> 1 Lowercase
              </span>
            </div>
          </div>

          {/* Optional Profile Image (Upload with ImgBB or skip) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-amber-500" />
                Profile Image (Optional)
              </label>
              <span className="text-[11px] text-stone-400">Can be skipped</span>
            </div>

            <div className="flex items-center gap-3">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Uploaded preview"
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
                onChange={handleImageFileChange}
                disabled={uploadingImage}
                className="text-xs text-stone-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || uploadingImage || !isPasswordValid}
            className="w-full mt-4 py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-red-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Bottom Switcher */}
        <div className="text-center text-xs text-stone-500 pt-2">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-bold text-red-600 dark:text-red-400 hover:underline"
          >
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
