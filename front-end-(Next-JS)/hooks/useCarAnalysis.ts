"use client";

import { ChangeEvent, RefObject, useState } from "react";
import { generateDamageReportPdf } from "@/lib/utils/pdf";
import { analyzeImage, getDamageReport } from "@/lib/api/api";
import {
  DEMO_IMAGE,
  DEMO_RESULT_IMAGE,
  DEMO_FILE_NAME,
  DEMO_DETECTIONS,
  DEMO_REPORT,
  DEMO_SEVERITY,
} from "@/lib/demo/data";
export function useCarAnalysis(inputRef: RefObject<HTMLInputElement | null>) {
  const [image, setImage] = useState<string | null>(DEMO_IMAGE);

  const [originalImage, setOriginalImage] = useState<string | null>(DEMO_IMAGE);

  const [fileName, setFileName] = useState(DEMO_FILE_NAME);

  const [view, setView] = useState<"original" | "detection">("detection");

  const [analyzing, setAnalyzing] = useState(false);

  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  const [resultImage, setResultImage] = useState<string | null>(
    DEMO_RESULT_IMAGE,
  );

  const [detections, setDetections] = useState<any[]>(DEMO_DETECTIONS);

  const [report, setReport] = useState<any>(DEMO_REPORT);

  const [severity, setSeverity] = useState(DEMO_SEVERITY);
  const [error, setError] = useState("");

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setImage(imageUrl);
    setOriginalImage(imageUrl);
    setFileName(file.name);

    setResultImage(null);
    setDetections([]);
    setReport(null);
    setSeverity("");
    setError("");

    setCopiedImage(false);
    setCopiedReport(false);

    setView("original");
  }

  function removeImage() {
    setImage(null);
    setOriginalImage(null);
    setResultImage(null);
    setFileName("");
    setDetections([]);
    setReport(null);
    setSeverity("");
    setError("");

    setCopiedImage(false);
    setCopiedReport(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const downloadReportPdf = async () => {
    if (!report) {
      setError("Analyze the image first.");
      return;
    }

    try {
      await generateDamageReportPdf({
        report,
        resultImage,
        severity,
        fileName,
      });
    } catch (error) {
      console.error("PDF ERROR:", error);
      setError("Could not generate the PDF report.");
    }
  };

  // Compare the original image with CarDD's returned image.
  // If CarDD added annotations, enough pixels should change.
  const imagesAreDifferent = async (
    original: string,
    result: string,
  ): Promise<boolean> => {
    const loadImage = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    try {
      const [img1, img2] = await Promise.all([
        loadImage(original),
        loadImage(result),
      ]);

      // Use a fixed comparison size.
      const width = 500;

      const height = Math.round(
        (img1.naturalHeight / img1.naturalWidth) * width,
      );

      const canvas1 = document.createElement("canvas");
      const canvas2 = document.createElement("canvas");

      canvas1.width = width;
      canvas1.height = height;

      canvas2.width = width;
      canvas2.height = height;

      const ctx1 = canvas1.getContext("2d");
      const ctx2 = canvas2.getContext("2d");

      if (!ctx1 || !ctx2) {
        return true;
      }

      ctx1.drawImage(img1, 0, 0, width, height);
      ctx2.drawImage(img2, 0, 0, width, height);

      const data1 = ctx1.getImageData(0, 0, width, height).data;

      const data2 = ctx2.getImageData(0, 0, width, height).data;

      let changedPixels = 0;
      let totalPixels = 0;

      // Sample every 4 pixels.
      for (let i = 0; i < data1.length; i += 16) {
        const difference =
          Math.abs(data1[i] - data2[i]) +
          Math.abs(data1[i + 1] - data2[i + 1]) +
          Math.abs(data1[i + 2] - data2[i + 2]);

        if (difference > 100) {
          changedPixels++;
        }

        totalPixels++;
      }

      const changeRatio = changedPixels / totalPixels;

      console.log("CARDD IMAGE CHANGE RATIO:", changeRatio);

      /*
       * Small differences can happen because of JPEG compression.
       * 0.5% changed pixels is treated as a meaningful change.
       */
      return changeRatio > 0.005;
    } catch (error) {
      console.error("IMAGE COMPARISON ERROR:", error);

      // If comparison fails, allow the normal analysis flow.
      return true;
    }
  };

  const analyze = async () => {
    const file = inputRef.current?.files?.[0];

    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    setAnalyzing(true);
    setError("");

    try {
      // ================================
      // 1. GET ANNOTATED IMAGE FROM CARDD
      // ================================

      const resultImageUrl = await analyzeImage(file);

      setResultImage(resultImageUrl);
      setView("detection");

      // ================================
      // 2. COMPARE ORIGINAL VS CARDD
      // ================================

      const originalUrl = URL.createObjectURL(file);

      const damageDetected = await imagesAreDifferent(
        originalUrl,
        resultImageUrl,
      );

      URL.revokeObjectURL(originalUrl);

      console.log("CARDD DAMAGE DETECTED:", damageDetected);

      // ================================
      // 3. NO DAMAGE → STOP
      // ================================

      if (!damageDetected) {
        setReport(null);
        setDetections([]);
        setSeverity("");
        setError("No vehicle damage detected.");

        return;
      }

      // ================================
      // 4. DAMAGE DETECTED
      // NOW CALL THE LLM
      // ================================

      const data = await getDamageReport(file);

      console.log("CARDD ANALYSIS DATA:", JSON.stringify(data, null, 2));

      // ================================
      // 5. SET REPORT
      // ================================

      setReport(data.report);

      // ================================
      // 6. SET SEVERITY
      // ================================

      const severities =
        data.report?.damage_assessment?.map((item: any) => item.severity) || [];

      const overallSeverity = severities.includes("severe")
        ? "Severe"
        : severities.includes("moderate")
          ? "Moderate"
          : severities.includes("minor")
            ? "Minor"
            : "Unknown";

      setSeverity(overallSeverity);

      // ================================
      // 7. SET DETECTIONS
      // ================================

      setDetections(
        (data.findings || []).map((finding: any) => {
          const assessment = data.report?.damage_assessment?.find(
            (item: any) => item.damage_type === finding.damage_type,
          );

          return {
            type: finding.damage_type,
            location: assessment?.location_on_vehicle || "Detected area",
            percentage: finding.area_pct_of_image,
            level: assessment?.severity || "Detected",
            tone: "red",
            bbox: finding.bbox,
          };
        }),
      );
      // ================================
      // 8. SAVE TO HISTORY
      // ================================

      const findings = data.findings || [];

      const damageNames = findings
        .map((finding: any) => finding.damage_type)
        .filter(Boolean);

      const totalCost = data.report?.total_estimated_cost_egp;

      const historyItem = {
        id: Date.now().toString(),

        timestamp: Date.now(),

        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),

        vehicle: "Vehicle",

        damage:
          damageNames.length > 0
            ? damageNames.join(", ")
            : "No damage detected",

        severity: overallSeverity,

        cost: totalCost
          ? `${totalCost.min?.toLocaleString()} – ${totalCost.max?.toLocaleString()} EGP`
          : "--",

        originalImage,

        resultImage: resultImageUrl,

        report: data.report,

        detections: findings,
      };

      try {
        const existingHistory = JSON.parse(
          localStorage.getItem("cardd-history") || "[]",
        );

        const updatedHistory = [historyItem, ...existingHistory];

        localStorage.setItem("cardd-history", JSON.stringify(updatedHistory));

        console.log("CARDD HISTORY SAVED:", historyItem);
      } catch (error) {
        console.error("HISTORY SAVE ERROR:", error);
      }
    } catch (error) {
      console.error("ANALYSIS ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Could not connect to the AI backend.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const copyImage = async () => {
    if (!resultImage) {
      setError("Analyze the image first.");
      return;
    }

    const img = new Image();

    img.onload = async () => {
      const canvas = document.createElement("canvas");

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ]);

          setCopiedImage(true);

          setTimeout(() => {
            setCopiedImage(false);
          }, 1600);
        } catch (error) {
          console.error("COPY IMAGE ERROR:", error);

          setError("Could not copy the image.");
        }
      }, "image/png");
    };

    img.onerror = () => {
      setError("Could not load the image.");
    };

    img.src = resultImage;
  };

  const copyReport = async () => {
    if (!report) return;

    const reportText = `
Vehicle Damage Assessment

Overall Severity: ${severity || "Unknown"}

Detailed Findings
${(report.damage_assessment || [])
  .map(
    (damage: any) =>
      `• ${damage.damage_type}
  Location: ${damage.location_on_vehicle}
  Severity: ${damage.severity}
  ${damage.description}`,
  )
  .join("\n\n")}

Recommended Repair Steps
${(report.repair_steps || [])
  .map((step: string, index: number) => `${index + 1}. ${step}`)
  .join("\n")}

Repair Time:
${report.estimated_repair_time_hours ?? "--"} hours

Estimated Cost:
Technician Service: ${
      report.technician_service_cost_egp
        ? `${report.technician_service_cost_egp.min?.toLocaleString()} – ${report.technician_service_cost_egp.max?.toLocaleString()}`
        : "--"
    } EGP

Parts & Equipment: ${
      report.equipment_and_parts_cost_egp
        ? `${report.equipment_and_parts_cost_egp.min?.toLocaleString()} – ${report.equipment_and_parts_cost_egp.max?.toLocaleString()}`
        : "--"
    } EGP

Total Estimated Cost: ${
      report.total_estimated_cost_egp
        ? `${report.total_estimated_cost_egp.min?.toLocaleString()} – ${report.total_estimated_cost_egp.max?.toLocaleString()}`
        : "--"
    } EGP

Notes:
${report.notes || "No additional notes."}
`;

    try {
      await navigator.clipboard.writeText(reportText);

      setCopiedReport(true);

      setTimeout(() => {
        setCopiedReport(false);
      }, 1600);
    } catch (error) {
      console.error("COPY REPORT ERROR:", error);

      setError("Could not copy the report.");
    }
  };

  const downloadImage = () => {
    if (!resultImage) {
      setError("Analyze the image first.");
      return;
    }

    const a = document.createElement("a");

    a.href = resultImage;

    a.download = `cardd-${fileName || "annotated-image"}`;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);
  };

  return {
    image,
    originalImage,
    resultImage,
    fileName,

    view,
    setView,

    analyzing,
    detections,

    report,
    severity,
    error,

    copiedImage,
    copiedReport,

    handleFile,
    removeImage,
    analyze,

    copyImage,
    copyReport,
    downloadImage,
    downloadReportPdf,

    setCopiedImage,
    setCopiedReport,
    setError,
  };
}
