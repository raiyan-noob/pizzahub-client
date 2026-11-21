export async function uploadToImgBB(file) {
  if (!file) {
    throw new Error("No file provided for upload");
  }

  // 1. Primary: Server-side API route (/api/upload) to avoid browser Origin/CORS Cloudflare blocks
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.url) {
        return data.url;
      }
    }
  } catch (proxyError) {
    console.warn("Server proxy upload attempt failed, trying direct / fallback:", proxyError);
  }

  // 2. Secondary: Direct ImgBB API attempt (if network allows)
  try {
    const apiKey =
      process.env.NEXT_PUBLIC_IMAGEBB_API ||
      process.env.IMAGEBB_API ||
      "17df13f4618f60acf3c266a57ee7a110";

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.success && data.data) {
        return data.data.url || data.data.display_url;
      }
    }
  } catch (directError) {
    console.warn("Direct ImgBB call failed:", directError);
  }

  // 3. Client-side resilient fallback: Read as Data URL so sign up and menu creation NEVER fail
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to process image file"));
      reader.readAsDataURL(file);
    } catch (err) {
      reject(err);
    }
  });
}
