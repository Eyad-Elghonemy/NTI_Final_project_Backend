"use client";
import { useState } from "react";

import {
  Activity,
  Copy,
  Download,
  Maximize2,
  ShieldCheck,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface Detection {
  type?: string;
  location?: string;
  percentage?: number;
  level?: string;
  tone?: string;
}

interface AnalysisResultsProps {
  originalImage: string | null;
  resultImage: string | null;
  view: "original" | "detection";
  setView: (view: "original" | "detection") => void;
  analyzing: boolean;
  detections: Detection[];
  copied: boolean;
  image: string | null;
  onCopyImage: () => void;
  onDownload: () => void;
}

export default function AnalysisResults({
  originalImage,
  resultImage,
  view,
  setView,
  analyzing,
  detections,
  copied,
  image,
  onCopyImage,
  onDownload,
}: AnalysisResultsProps) {
  const [zoomed, setZoomed] = useState(false);

  const displayedImage = view === "detection" ? resultImage : originalImage;

  return (
    <section className="card rounded-2xl p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ff5b45] font-bold">
            2
          </span>

          <div>
            <h2 className="font-semibold">Analysis Results</h2>

            <p className="text-xs text-white/35">
              AI detection and assessment results
            </p>
          </div>
        </div>

        <div className="hidden text-right sm:block">
          <div className="text-[10px] text-white/30">
            MODEL · <span className="text-white/65">CarDD-Vision 1.0</span>
          </div>

          {/* <div className="mt-1 text-[10px] text-emerald-400">
            ⚡ Processed in 15-20s
          </div> */}
        </div>
      </div>

      {/* Controls */}
      <div className="mb-3 flex flex-wrap gap-2">
        <div className="flex overflow-hidden rounded-lg border border-white/10">
          <button
            type="button"
            onClick={() => setView("detection")}
            disabled={!resultImage}
            className={`px-4 py-2 text-xs ${
              view === "detection"
                ? "bg-[#ff5b45]/15 text-[#ff765f]"
                : "text-white/45 hover:text-white"
            } disabled:cursor-not-allowed disabled:opacity-30`}
          >
            AI Detection
          </button>

          <button
            type="button"
            onClick={() => setView("original")}
            disabled={!originalImage}
            className={`border-l border-white/10 px-4 py-2 text-xs ${
              view === "original"
                ? "bg-white/[.06] text-white"
                : "text-white/45 hover:text-white"
            } disabled:cursor-not-allowed disabled:opacity-30`}
          >
            Original Image
          </button>
        </div>

        <div className="ml-auto flex gap-2">
          <button
            type="button"
            title={zoomed ? "Zoom out" : "Zoom in"}
            onClick={() => setZoomed(!zoomed)}
            disabled={!displayedImage}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/55 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            {zoomed ? <ZoomOut size={15} /> : <ZoomIn size={15} />}
          </button>

          <button
            type="button"
            onClick={onCopyImage}
            disabled={!image}
            className="flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs text-white/55 hover:text-white disabled:opacity-30"
          >
            <Copy size={14} />

            {copied ? "Copied" : "Copy Image"}
          </button>

          <button
            type="button"
            onClick={onDownload}
            disabled={!resultImage}
            className="flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs text-white/55 hover:text-white disabled:opacity-30"
          >
            <Download size={14} />
            Download
          </button>

          <button
            type="button"
            title="Fullscreen"
            onClick={() => {
              const imageContainer = document.getElementById(
                "analysis-image-container",
              );

              if (imageContainer) {
                imageContainer.requestFullscreen();
              }
            }}
            disabled={!displayedImage}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/55 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* Image + detections */}
      <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
        {/* Image */}
        <div
          id="analysis-image-container"
          className="relative overflow-hidden rounded-xl border border-white/10 bg-black"
        >
          {displayedImage ? (
            <img
              src={displayedImage}
              alt={
                view === "detection"
                  ? "AI detection result"
                  : "Original vehicle"
              }
              className={`block w-full object-contain transition-transform duration-300 ${
                zoomed
                  ? "scale-150 cursor-zoom-out"
                  : "max-h-[520px] cursor-zoom-in"
              }`}
            />
          ) : (
            <div className="flex min-h-[400px] items-center justify-center text-white/30">
              {view === "detection"
                ? "AI detection will appear here after analysis"
                : "Upload an image to begin"}
            </div>
          )}

          {analyzing && (
            <div className="absolute inset-x-0 top-1/2 h-px scanline" />
          )}
        </div>

        {/* Detection list */}
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Detected Damage</h3>

            <span className="text-[10px] text-white/30">
              {detections.length} REGIONS FOUND
            </span>
          </div>

          {detections.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center text-center text-xs text-white/25">
              No damage detected yet
            </div>
          ) : (
            detections.map((d, i) => (
              <div
                key={`${d.type}-${i}`}
                className="flex items-center gap-3 border-t border-white/[.07] py-3"
              >
                <div
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                    d.tone === "red"
                      ? "bg-red-500/10 text-red-400"
                      : d.tone === "orange"
                        ? "bg-orange-500/10 text-orange-400"
                        : "bg-yellow-500/10 text-yellow-400"
                  }`}
                >
                  {i === 0 ? (
                    <ShieldCheck size={16} />
                  ) : i === 1 ? (
                    <Activity size={16} />
                  ) : (
                    <Sparkles size={16} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium">
                    {d.type || "Unknown damage"}
                  </div>

                  <div className="mt-1 text-[10px] text-white/30">
                    {d.location || "Location unavailable"}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold">
                    {d.percentage != null
                      ? `${d.percentage.toFixed(1)}%`
                      : "--"}
                  </div>

                  <div
                    className={`mt-1 text-[9px] ${
                      d.level === "High"
                        ? "text-red-400"
                        : d.level === "Medium"
                          ? "text-orange-400"
                          : "text-yellow-400"
                    }`}
                  >
                    {d.level || "--"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
