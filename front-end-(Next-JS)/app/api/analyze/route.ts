import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload an image." },
        { status: 400 },
      );
    }

    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/analyze`,
      {
        method: "POST",
        body: backendFormData,
      },
    );

    // Read as text first so we can see what the backend actually returned
    const responseText = await response.text();

    console.log("BACKEND /analyze STATUS:", response.status);
    console.log(
      "BACKEND /analyze CONTENT-TYPE:",
      response.headers.get("content-type"),
    );
    console.log("BACKEND /analyze RESPONSE:", responseText.slice(0, 1000));

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Backend /analyze failed",
          status: response.status,
          details: responseText,
        },
        { status: response.status },
      );
    }

    try {
      const data = JSON.parse(responseText);

      return NextResponse.json(data);
    } catch {
      return NextResponse.json(
        {
          error: "Backend did not return JSON",
          status: response.status,
          contentType: response.headers.get("content-type"),
          response: responseText.slice(0, 1000),
        },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("Report analysis error:", error);

    return NextResponse.json(
      {
        error: "Failed to connect to the analysis backend.",
        details: String(error),
      },
      { status: 500 },
    );
  }
}
