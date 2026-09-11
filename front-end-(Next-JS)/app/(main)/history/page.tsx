"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Car, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type HistoryItem = {
  id: string;
  date: string;
  timestamp: number;
  vehicle: string;
  damage: string;
  severity: string;
  cost: string;
  originalImage?: string;
  resultImage?: string;
  report?: any;
  detections?: any[];
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cardd-history");

      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error("HISTORY LOAD ERROR:", error);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#07090b] text-white">
      <div className="mx-auto max-w-[1200px] px-6 py-8 lg:px-10">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-xs text-white/45 transition hover:text-white"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <div className="mb-3 text-[10px] font-medium tracking-[.3em] text-white/40">
            CARDD
          </div>

          <h1 className="text-4xl font-semibold tracking-[-.04em]">
            Analysis History
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/40">
            Review your previous vehicle damage assessments and estimated repair
            costs.
          </p>
        </div>

        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-white/[.025] p-5 transition hover:border-white/15 hover:bg-white/[.04]"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#ff5b45]/10 text-[#ff6b58]">
                  <Car size={19} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold">{item.vehicle}</h2>

                    <span className="rounded-full bg-orange-500/10 px-2 py-1 text-[9px] text-orange-400">
                      {item.severity}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-white/35">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={12} />
                      {item.date}
                    </span>

                    <span>{item.damage || "No damage detected"}</span>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <div className="text-[9px] uppercase tracking-wider text-white/25">
                    Estimated Cost
                  </div>

                  <div className="mt-1 text-sm font-semibold text-[#ff6b58]">
                    {item.cost}
                  </div>
                </div>

                <Link
                  href={`/history/${item.id}`}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-white/40 transition hover:border-white/20 hover:text-white"
                >
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {history.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[.025] py-20 text-center">
            <Car className="mx-auto mb-4 text-white/20" size={30} />

            <p className="text-sm text-white/35">No analysis history yet.</p>

            <Link
              href="/"
              className="mt-5 inline-flex rounded-lg bg-[#ff5b45] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#ff6b58]"
            >
              Analyze a vehicle
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
