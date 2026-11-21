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
    const res = await fetch(`${API_BASE_URL}/api/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        id: user.id || user._id,
        name: user.name,
        image: user.image,
        role: user.role,
        businessName: user.businessName,
      }),
    });

    const data = await res.json();
    if (data.success && data.token) {
      setAuthToken(data.token);
      return data;
    }
  } catch (err) {
    console.error("Token sync error:", err);
  }
  return null;
}

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

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
