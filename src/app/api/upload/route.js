import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No image file provided" },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.IMAGEBB_API ||
      process.env.NEXT_PUBLIC_IMAGEBB_API ||
      "17df13f4618f60acf3c266a57ee7a110";

    // Attempt ImgBB upload from server-side Node environment (no browser CORS / Cloudflare block)
    try {
      const imgbbForm = new FormData();
      imgbbForm.append("image", file);

      const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: imgbbForm,
      });

      if (imgbbRes.ok) {
        const data = await imgbbRes.json();
        if (data && data.success && data.data) {
          return NextResponse.json({
            success: true,
            url: data.data.url || data.data.display_url,
          });
        }
      }
    } catch (apiErr) {
      console.warn("Server-side ImgBB upload attempt failed, switching to resilient fallback:", apiErr.message);
    }

    // Resilient fallback: Convert to Data URI so the user is never blocked
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "image/jpeg";
    const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;

    return NextResponse.json({
      success: true,
      url: dataUri,
      fallback: true,
    });
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process image upload" },
      { status: 500 }
    );
  }
}
