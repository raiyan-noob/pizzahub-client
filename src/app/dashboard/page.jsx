"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function DashboardIndexPage() {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (role === "admin") router.replace("/dashboard/admin");
      else if (role === "vendor") router.replace("/dashboard/vendor");
      else router.replace("/dashboard/customer");
    }
  }, [role, loading, router]);

  return <LoadingScreen message="Redirecting to your dashboard..." />;
}
