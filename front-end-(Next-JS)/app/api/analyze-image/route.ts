export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return Response.json(
        {
          success: false,
          error: "Please upload an image.",
        },
        { status: 400 },
      );
    }

    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/analyze-image`,
      {
        method: "POST",
        body: backendFormData,
      },
    );

    console.log("========== CARDD BACKEND ==========");
    console.log("STATUS:", response.status);
    console.log("CONTENT-TYPE:", response.headers.get("content-type"));
    console.log("===================================");

    // Backend failed
    if (!response.ok) {
      const errorText = await response.text();

      console.error("BACKEND ERROR:", errorText.slice(0, 2000));

      return Response.json(
        {
          success: false,
          error: "CarDD backend failed.",
          backendStatus: response.status,
          backendContentType: response.headers.get("content-type"),
          backendResponse: errorText.slice(0, 2000),
        },
        { status: response.status },
      );
    }

    // Backend returns JPEG, so keep it as binary
    const imageBuffer = await response.arrayBuffer();

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("CarDD proxy error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to connect to CarDD backend.",
        details: String(error),
      },
      { status: 500 },
    );
  }
}
