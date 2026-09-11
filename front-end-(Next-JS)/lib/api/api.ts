export async function analyzeImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/analyze-image", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Image analysis failed: ${response.status}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // Backend did not return JSON
    }

    throw new Error(errorMessage);
  }

  const blob = await response.blob();

  if (!blob.type.startsWith("image/")) {
    throw new Error("Backend did not return an image.");
  }

  return URL.createObjectURL(blob);
}

export async function getDamageReport(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Report analysis failed: ${response.status}`;

    try {
      const errorData = await response.json();

      errorMessage = errorData.error || errorData.details || errorMessage;
    } catch {
      // Backend did not return JSON
    }

    throw new Error(errorMessage);
  }

  return response.json();
}
