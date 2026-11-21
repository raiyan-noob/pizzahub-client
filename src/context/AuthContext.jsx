"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authClient, useSession, signIn, signUp, signOut } from "@/lib/auth-client";
import { setAuthToken, syncUserToken, apiRequest, getAuthToken } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { data: session, isPending: sessionLoading } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await apiRequest("/api/auth/me");
      if (res.success && res.user) {
        if (res.user.isBlocked) {
          toast.error("Your account has been blocked by an administrator.");
          await signOut();
          setAuthToken(null);
          setUser(null);
          router.push("/signin");
          return;
        }
        setUser(res.user);
      }
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        setAuthToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (sessionLoading) return;

      if (session?.user) {
        try {
          const preferredRole = typeof window !== "undefined" ? localStorage.getItem("pizzahub_oauth_preferred_role") : null;
          const syncRes = await syncUserToken({
            ...session.user,
            role: session.user.role || preferredRole || "customer",
          });
          if (syncRes?.success && mounted) {
            if (syncRes.user.isBlocked) {
              toast.error("Your account has been blocked.");
              await signOut();
              setAuthToken(null);
              setUser(null);
              setLoading(false);
              return;
            }
            setUser(syncRes.user);
            if (typeof window !== "undefined") {
              localStorage.removeItem("pizzahub_oauth_preferred_role");
            }
            // Fetch fresh profile with delivery address & phone from database
            try {
              const meRes = await apiRequest("/api/auth/me");
              if (meRes?.success && meRes?.user && mounted) {
                setUser(meRes.user);
              }
            } catch {
              // Non-blocking
            }
          } else if (mounted) {
            setUser({
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              role: session.user.role || preferredRole || "customer",
              image: session.user.image,
              businessName: session.user.businessName,
              subscriptionPlan: session.user.subscriptionPlan || "free",
              address: session.user.address || "",
              phone: session.user.phone || "",
            });
            // Background retry in case the backend server was starting up
            setTimeout(async () => {
              if (mounted && !getAuthToken()) {
                const retrySync = await syncUserToken(session.user);
                if (retrySync?.user && mounted) {
                  setUser(retrySync.user);
                }
              }
            }, 1500);
          }
        } catch (e) {
          console.error("Auth init error:", e);
        }
      } else {
        // If Better Auth session is not present or pending, check localStorage JWT token
        const token = getAuthToken();
        if (token) {
          try {
            const meRes = await apiRequest("/api/auth/me");
            if (meRes?.success && meRes?.user && mounted) {
              if (meRes.user.isBlocked) {
                toast.error("Your account has been blocked.");
                setAuthToken(null);
                setUser(null);
                setLoading(false);
                return;
              }
              setUser(meRes.user);
              if (mounted) setLoading(false);
              return;
            }
          } catch {
            if (mounted) {
              setUser(null);
              setAuthToken(null);
            }
          }
        } else if (mounted) {
          setUser(null);
          setAuthToken(null);
        }
      }

      if (mounted) setLoading(false);
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, [session, sessionLoading]);

  useEffect(() => {
    const handleFocus = async () => {
      if (session?.user && !getAuthToken()) {
        const syncRes = await syncUserToken(session.user);
        if (syncRes?.user) setUser(syncRes.user);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleFocus);
      return () => window.removeEventListener("focus", handleFocus);
    }
  }, [session]);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await signIn.email({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message || "Failed to sign in");
      }

      // Sync JWT with server
      const syncRes = await syncUserToken(data?.user || { email });
      if (syncRes?.user) {
        if (syncRes.user.isBlocked) {
          await signOut();
          setAuthToken(null);
          setUser(null);
          throw new Error("Your account has been blocked by an administrator.");
        }
        setUser(syncRes.user);
        toast.success(`Welcome back, ${syncRes.user.name || "Foodie"}!`);
        return syncRes.user;
      }

      return data?.user;
    } catch (err) {
      toast.error(err.message || "Invalid credentials");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async ({ name, email, password, role, image, businessName }) => {
    setLoading(true);
    try {
      // Password validation check
      // Page 3: minimum 6 characters, one uppercase letter, one lowercase letter
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }
      if (!/[A-Z]/.test(password)) {
        throw new Error("Password must contain at least one uppercase letter");
      }
      if (!/[a-z]/.test(password)) {
        throw new Error("Password must contain at least one lowercase letter");
      }

      // Security: Prevent public registration as admin
      const assignedRole = role === "vendor" ? "vendor" : "customer";

      const { data, error } = await signUp.email({
        name,
        email,
        password,
        role: assignedRole,
        image: image || "",
        businessName: assignedRole === "vendor" ? businessName || `${name}'s Pizzeria` : undefined,
      });

      if (error) {
        throw new Error(error.message || "Sign up failed");
      }

      const syncRes = await syncUserToken({ email, id: data?.user?.id });
      if (syncRes?.user) {
        setUser(syncRes.user);
      }

      toast.success("Account created successfully!");
      return data?.user;
    } catch (err) {
      toast.error(err.message || "Failed to create account");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (role = "customer") => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("pizzahub_oauth_preferred_role", role);
      }
      const res = await signIn.social({
        provider: "google",
        callbackURL: typeof window !== "undefined" ? window.location.origin : "/",
      });
      if (res?.error) {
        throw new Error(res.error.message || "Google sign in failed");
      }
      return res;
    } catch (err) {
      console.error("Google sign in error:", err);
      toast.error(err?.message || "Google sign in failed");
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setAuthToken(null);
      setUser(null);
      toast.success("Signed out successfully");
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
      setAuthToken(null);
      setUser(null);
      router.push("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading: loading || sessionLoading,
        isAuthenticated: !!user,
        role: user?.role || "customer",
        isBlocked: !!user?.isBlocked,
        login: handleLogin,
        signup: handleSignUp,
        loginWithGoogle: handleGoogleLogin,
        logout: handleLogout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
