"use client";

import { useRef } from "react";
import { Activity, ArrowRight } from "lucide-react";

import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import Footer from "@/components/home/Footer";

import UploadCard from "@/components/upload/UploadCard";
import AnalysisResults from "@/components/analysis/AnalysisResults";
import DamageReport from "@/components/analysis/DamageReport";

import { useCarAnalysis } from "@/hooks/useCarAnalysis";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
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
  } = useCarAnalysis(inputRef);

  return (
    <main className="min-h-screen bg-[#07090b]">
      {/* =========================
          HEADER
      ========================= */}
      <Header />

      {/* =========================
          MAIN CONTENT
      ========================= */}
      <section className="relative mx-auto max-w-[1450px] px-6 pb-10 pt-10 lg:px-10">
        {/* =========================
            HERO
        ========================= */}
        <Hero />

        {/* =========================
            MAIN GRID
        ========================= */}
        <div className="grid gap-5 xl:grid-cols-[.72fr_1.28fr]">
          {/* =========================
              UPLOAD
          ========================= */}
          <div>
            <UploadCard
              inputRef={inputRef}
              image={originalImage}
              fileName={fileName}
              onFileChange={handleFile}
              onRemove={removeImage}
            />

            <button
              type="button"
              onClick={analyze}
              disabled={analyzing || !originalImage}
              className="btn mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff5b45] font-semibold text-white shadow-[0_8px_30px_rgba(255,91,69,.18)] transition hover:bg-[#ff6b58] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Activity size={17} className="animate-pulse" />
                  Analyzing damage...
                </>
              ) : (
                <>
                  Analyze Damage
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>

          {/* =========================
              ANALYSIS
          ========================= */}
          <div className="space-y-5">
            <AnalysisResults
              originalImage={originalImage}
              resultImage={resultImage}
              view={view}
              setView={setView}
              analyzing={analyzing}
              detections={detections}
              copied={copiedImage}
              image={view === "detection" ? resultImage : originalImage}
              onCopyImage={copyImage}
              onDownload={downloadImage}
            />

            <DamageReport
              report={report}
              severity={severity}
              copied={copiedReport}
              onCopyReport={copyReport}
              onDownloadPdf={downloadReportPdf}
            />
          </div>
        </div>

        {/* =========================
            ERROR
        ========================= */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
      </section>

      {/* =========================
          FOOTER
      ========================= */}
      <Footer />
    </main>
  );
}
