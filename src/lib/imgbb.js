export async function uploadToImgBB(file) {
  if (!file) {
    throw new Error("No file provided for upload");
  }

  const apiKey =
    process.env.NEXT_PUBLIC_IMAGEBB_API ||
    process.env.IMAGEBB_API ||
    "17df13f4618f60acf3c266a57ee7a110";

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error?.message || "Failed to upload image to ImgBB");
    }

    return data.data.url || data.data.display_url;
  } catch (error) {
    console.error("ImgBB upload error:", error);
    throw error;
  }
}
