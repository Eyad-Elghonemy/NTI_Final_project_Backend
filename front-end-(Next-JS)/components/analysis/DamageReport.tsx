"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Copy,
  DollarSign,
  FileText,
  Wrench,
} from "lucide-react";

type DamageReportProps = {
  report: any;
  severity: string;
  copied: boolean;
  onCopyReport: () => void;
  onDownloadPdf: () => void;
};

export default function DamageReport({
  report,
  severity,
  copied,
  onCopyReport,
  onDownloadPdf,
}: DamageReportProps) {
  if (!report) {
    return (
      <section className="card rounded-2xl p-5">
        <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
          <FileText size={28} className="mb-3 text-white/20" />

          <h2 className="text-sm font-semibold text-white/60">
            AI Damage Report
          </h2>

          <p className="mt-1 text-xs text-white/30">
            Analyze a vehicle to generate the damage report.
          </p>
        </div>
      </section>
    );
  }

  const damageCount = report.damage_assessment?.length || 0;

  const severeCount =
    report.damage_assessment?.filter(
      (damage: any) => damage.severity?.toLowerCase() === "severe",
    ).length || 0;

  const moderateCount =
    report.damage_assessment?.filter(
      (damage: any) => damage.severity?.toLowerCase() === "moderate",
    ).length || 0;

  const getSeverityStyle = (value: string) => {
    switch (value?.toLowerCase()) {
      case "severe":
        return {
          badge: "bg-red-500/10 text-red-400 border-red-500/20",
          dot: "bg-red-400",
        };

      case "moderate":
        return {
          badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
          dot: "bg-orange-400",
        };

      case "minor":
        return {
          badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
          dot: "bg-yellow-400",
        };

      default:
        return {
          badge: "bg-white/5 text-white/50 border-white/10",
          dot: "bg-white/40",
        };
    }
  };

  const overallStyle = getSeverityStyle(severity);

  return (
    <section className="card overflow-hidden rounded-2xl">
      {/* =========================
          HEADER
      ========================= */}
      <div className="flex items-center justify-between border-b border-white/[.07] p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[.03]">
            <FileText size={17} className="text-[#ff6b58]" />
          </div>

          <div>
            <h2 className="font-semibold text-white">AI Damage Report</h2>

            <p className="mt-1 text-[11px] text-white/30">
              AI-generated vehicle assessment
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCopyReport}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-[11px] text-white/55 transition hover:border-white/20 hover:bg-white/[.04] hover:text-white"
          >
            <Copy size={13} />

            {copied ? "Copied" : "Copy"}
          </button>

          <button
            type="button"
            onClick={onDownloadPdf}
            className="rounded-lg bg-[#ff5b45] px-3 py-2 text-[11px] font-medium text-white transition hover:bg-[#ff6b58]"
          >
            PDF
          </button>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {/* =========================
            SUMMARY
        ========================= */}
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Severity */}
          <div className="rounded-xl border border-white/10 bg-white/[.025] p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/30">
              <AlertTriangle size={12} />
              Overall Severity
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${overallStyle.dot}`} />

              <span
                className={`rounded-md border px-2 py-1 text-xs font-semibold capitalize ${overallStyle.badge}`}
              >
                {severity || "Unknown"}
              </span>
            </div>
          </div>

          {/* Findings */}
          <div className="rounded-xl border border-white/10 bg-white/[.025] p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/30">
              <AlertTriangle size={12} />
              Damage Found
            </div>

            <div className="mt-2 text-2xl font-semibold text-white">
              {damageCount}
            </div>

            <p className="mt-1 text-[10px] text-white/30">
              {severeCount} severe · {moderateCount} moderate
            </p>
          </div>

          {/* Repair time */}
          <div className="rounded-xl border border-white/10 bg-white/[.025] p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/30">
              <Clock3 size={12} />
              Repair Time
            </div>

            <div className="mt-2 text-2xl font-semibold text-white">
              {" "}
              {typeof report.estimated_repair_time_hours === "number"
                ? report.estimated_repair_time_hours
                : "2"}{" "}
              <span className="ml-1 text-sm font-normal text-white/30">
                {" "}
                hrs{" "}
              </span>{" "}
            </div>
          </div>
        </div>

        {/* =========================
            DAMAGE ASSESSMENT
        ========================= */}
        <div className="rounded-xl border border-white/10 bg-white/[.025]">
          <div className="border-b border-white/[.07] px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Damage Assessment
                </h3>

                <p className="mt-1 text-[10px] text-white/30">
                  Detected damage and vehicle locations
                </p>
              </div>

              <span className="text-[10px] text-white/25">
                {damageCount} FINDINGS
              </span>
            </div>
          </div>

          <div className="divide-y divide-white/[.06]">
            {report.damage_assessment?.map((damage: any, index: number) => {
              const style = getSeverityStyle(damage.severity);

              return (
                <div
                  key={index}
                  className="p-4 transition hover:bg-white/[.015]"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                      <span className="h-2 w-2 rounded-full bg-red-400" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-semibold capitalize text-white">
                          {damage.damage_type}
                        </h4>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[9px] capitalize ${style.badge}`}
                        >
                          {damage.severity}
                        </span>
                      </div>

                      <p className="mt-1 text-[10px] text-[#ff6b58]">
                        {damage.location_on_vehicle}
                      </p>

                      <p className="mt-2 max-w-3xl text-[11px] leading-5 text-white/40">
                        {damage.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================
            REPAIR + TOOLS
        ========================= */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Repair */}
          <div className="rounded-xl border border-white/10 bg-white/[.025] p-4">
            <div className="mb-4 flex items-center gap-2">
              <Wrench size={14} className="text-[#ff6b58]" />

              <h3 className="text-sm font-semibold text-white">Repair Plan</h3>
            </div>

            <div className="space-y-3">
              {report.repair_steps?.map((step: string, index: number) => (
                <div key={index} className="flex gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[.03] text-[9px] text-white/40">
                    {index + 1}
                  </div>

                  <p className="text-[11px] leading-5 text-white/45">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="rounded-xl border border-white/10 bg-white/[.025] p-4">
            <div className="mb-4 flex items-center gap-2">
              <Wrench size={14} className="text-[#ff6b58]" />

              <h3 className="text-sm font-semibold text-white">
                Tools & Equipment
              </h3>
            </div>

            <div className="space-y-2">
              {report.tools_and_equipment_needed?.map(
                (tool: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-[11px] text-white/45"
                  >
                    <CheckCircle2
                      size={12}
                      className="shrink-0 text-emerald-400"
                    />

                    {tool}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* =========================
            COST
        ========================= */}
        <div className="rounded-xl border border-white/10 bg-white/[.025] p-4">
          {" "}
          <div className="mb-4 flex items-center gap-2">
            {" "}
            <DollarSign size={14} className="text-[#ff6b58]" />{" "}
            <h3 className="text-sm font-semibold text-white">
              {" "}
              Estimated Repair Cost{" "}
            </h3>{" "}
          </div>{" "}
          <div className="grid gap-3 sm:grid-cols-3">
            {" "}
            {/* Technician */}{" "}
            <div>
              {" "}
              <p className="text-[10px] text-white/30"> Technician </p>{" "}
              <p className="mt-1 text-sm font-medium text-white">
                {" "}
                {report.technician_service_cost_egp
                  ? `${report.technician_service_cost_egp.min?.toLocaleString()} – ${report.technician_service_cost_egp.max?.toLocaleString()} EGP`
                  : "—"}{" "}
              </p>{" "}
            </div>{" "}
            {/* Parts & Equipment */}{" "}
            <div>
              {" "}
              <p className="text-[10px] text-white/30">
                {" "}
                Parts & Equipment{" "}
              </p>{" "}
              <p className="mt-1 text-sm font-medium text-white">
                {" "}
                {report.equipment_and_parts_cost_egp
                  ? `${report.equipment_and_parts_cost_egp.min?.toLocaleString()} – ${report.equipment_and_parts_cost_egp.max?.toLocaleString()} EGP`
                  : "—"}{" "}
              </p>{" "}
            </div>{" "}
            {/* Total */}{" "}
            <div className="rounded-lg border border-[#ff5b45]/20 bg-[#ff5b45]/[.05] p-3 sm:-my-1">
              {" "}
              <p className="text-[10px] text-[#ff8a78]">
                {" "}
                Total Estimated Cost{" "}
              </p>{" "}
              <p className="mt-1 text-lg font-bold text-[#ff6b58]">
                {" "}
                {report.total_estimated_cost_egp
                  ? `${report.total_estimated_cost_egp.min?.toLocaleString()} – ${report.total_estimated_cost_egp.max?.toLocaleString()} EGP`
                  : "—"}{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>

        {/* =========================
            NOTES
        ========================= */}
        {report.notes && (
          <div className="rounded-xl border border-white/10 bg-white/[.02] p-4">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/30">
              AI Assessment Notes
            </p>

            <p className="text-[11px] leading-5 text-white/40">
              {report.notes}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
