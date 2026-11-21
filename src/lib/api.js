const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let cachedToken = null;

export function setAuthToken(token) {
  cachedToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("pizzahub_jwt", token);
    } else {
      localStorage.removeItem("pizzahub_jwt");
    }
  }
}

export function getAuthToken() {
  if (cachedToken) return cachedToken;
  if (typeof window !== "undefined") {
    cachedToken = localStorage.getItem("pizzahub_jwt");
  }
  return cachedToken;
}

export async function syncUserToken(user) {
  if (!user || (!user.email && !user.id)) return null;

  try {
    // Avoid sending huge base64 profile image in token request
    const imageToSend =
      user.image && !user.image.startsWith("data:") ? user.image : undefined;

    const res = await fetch(`${API_BASE_URL}/api/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        id: user.id || user._id,
        name: user.name,
        image: imageToSend,
        role: user.role,
        businessName: user.businessName,
      }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data.success && data.token) {
      setAuthToken(data.token);
      return data;
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Backend API not reachable at", API_BASE_URL);
    }
  }
  return null;
}

export async function apiRequest(endpoint, options = {}) {
  let token = getAuthToken();

  // 1. Auto-recover token if missing on client side
  if (!token && typeof window !== "undefined") {
    try {
      const { authClient } = await import("@/lib/auth-client");
      const sessionRes = await authClient.getSession();
      if (sessionRes?.data?.user) {
        const syncRes = await syncUserToken(sessionRes.data.user);
        if (syncRes?.token) {
          token = syncRes.token;
        }
      }
    } catch {
      // Non-blocking auto-recovery
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // 2. Auto-retry once on 401 Unauthorized if token was invalid/expired
  if (response.status === 401 && typeof window !== "undefined" && !options._retried) {
    try {
      const { authClient } = await import("@/lib/auth-client");
      const sessionRes = await authClient.getSession();
      if (sessionRes?.data?.user) {
        const syncRes = await syncUserToken(sessionRes.data.user);
        if (syncRes?.token) {
          return await apiRequest(endpoint, {
            ...options,
            _retried: true,
          });
        }
      }
    } catch {
      // Retry failed
    }
  }

  const data = await response.json().catch(() => ({
    success: false,
    message: "Failed to parse server response",
  }));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
