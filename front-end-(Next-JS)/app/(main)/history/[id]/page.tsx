"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Car,
  Clock3,
  Download,
  Wrench,
} from "lucide-react";
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
export default function HistoryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [item, setItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cardd-history");
      if (!saved) {
        setLoading(false);
        return;
      }
      const history: HistoryItem[] = JSON.parse(saved);
      const found = history.find((historyItem) => historyItem.id === id);
      setItem(found || null);
    } catch (error) {
      console.error("HISTORY DETAIL ERROR:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);
  if (loading) {
    return (
      <main className="min-h-screen bg-[#07090b] text-white">
        {" "}
        <div className="mx-auto max-w-[1200px] px-6 py-10 lg:px-10">
          {" "}
          <p className="text-sm text-white/40"> Loading analysis... </p>{" "}
        </div>{" "}
      </main>
    );
  }
  if (!item) {
    return (
      <main className="min-h-screen bg-[#07090b] text-white">
        {" "}
        <div className="mx-auto max-w-[1200px] px-6 py-10 lg:px-10">
          {" "}
          <Link
            href="/history"
            className="mb-10 inline-flex items-center gap-2 text-xs text-white/45 transition hover:text-white"
          >
            {" "}
            <ArrowLeft size={15} /> Back to History{" "}
          </Link>{" "}
          <div className="rounded-2xl border border-white/10 bg-white/[.025] py-20 text-center">
            {" "}
            <Car className="mx-auto mb-4 text-white/20" size={32} />{" "}
            <h1 className="text-lg font-semibold"> Analysis not found </h1>{" "}
            <p className="mt-2 text-sm text-white/35">
              {" "}
              This analysis may have been deleted or is not available in this
              browser.{" "}
            </p>{" "}
            <Link
              href="/history"
              className="mt-6 inline-flex rounded-lg bg-[#ff5b45] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#ff6b58]"
            >
              {" "}
              Back to History{" "}
            </Link>{" "}
          </div>{" "}
        </div>{" "}
      </main>
    );
  }
  const report = item.report;
  const damageAssessment = report?.damage_assessment || [];
  return (
    <main className="min-h-screen bg-[#07090b] text-white">
      {" "}
      <div className="mx-auto max-w-[1200px] px-6 py-8 lg:px-10">
        {" "}
        <Link
          href="/history"
          className="mb-10 inline-flex items-center gap-2 text-xs text-white/45 transition hover:text-white"
        >
          {" "}
          <ArrowLeft size={15} /> Back to History{" "}
        </Link>{" "}
        {/* Header */}{" "}
        <div className="mb-8">
          {" "}
          <div className="mb-3 text-[10px] font-medium tracking-[.3em] text-white/40">
            {" "}
            CARDD / HISTORY{" "}
          </div>{" "}
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            {" "}
            <div>
              {" "}
              <h1 className="text-4xl font-semibold tracking-[-.04em]">
                {" "}
                {item.vehicle}{" "}
              </h1>{" "}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/40">
                {" "}
                <span className="flex items-center gap-1.5">
                  {" "}
                  <CalendarDays size={13} /> {item.date}{" "}
                </span>{" "}
                <span className="flex items-center gap-1.5">
                  {" "}
                  <Car size={13} /> {item.damage}{" "}
                </span>{" "}
              </div>{" "}
            </div>{" "}
            <span className="w-fit rounded-full bg-orange-500/10 px-3 py-1.5 text-xs text-orange-400">
              {" "}
              {item.severity}{" "}
            </span>{" "}
          </div>{" "}
        </div>{" "}
        {/* Images */}{" "}
        <div className="grid gap-5 lg:grid-cols-2">
          {" "}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.025]">
            {" "}
            <div className="border-b border-white/10 px-5 py-4">
              {" "}
              <div className="text-[9px] uppercase tracking-[.2em] text-white/30">
                {" "}
                Original Image{" "}
              </div>{" "}
            </div>{" "}
            <div className="aspect-video bg-black">
              {" "}
              {item.originalImage ? (
                <img
                  src={item.originalImage}
                  alt="Original vehicle"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="grid h-full place-items-center text-sm text-white/20">
                  {" "}
                  No image available{" "}
                </div>
              )}{" "}
            </div>{" "}
          </div>{" "}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.025]">
            {" "}
            <div className="border-b border-white/10 px-5 py-4">
              {" "}
              <div className="text-[9px] uppercase tracking-[.2em] text-white/30">
                {" "}
                CarDD Detection{" "}
              </div>{" "}
            </div>{" "}
            <div className="aspect-video bg-black">
              {" "}
              {item.resultImage ? (
                <img
                  src={item.resultImage}
                  alt="CarDD damage detection"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="grid h-full place-items-center text-sm text-white/20">
                  {" "}
                  No result image available{" "}
                </div>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Summary */}{" "}
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {" "}
          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
            {" "}
            <div className="flex items-center gap-2 text-white/30">
              {" "}
              <Wrench size={14} />{" "}
              <span className="text-[9px] uppercase tracking-wider">
                {" "}
                Estimated Cost{" "}
              </span>{" "}
            </div>{" "}
            <div className="mt-2 text-lg font-semibold text-[#ff6b58]">
              {" "}
              {item.cost}{" "}
            </div>{" "}
          </div>{" "}
          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
            {" "}
            <div className="flex items-center gap-2 text-white/30">
              {" "}
              <Clock3 size={14} />{" "}
              <span className="text-[9px] uppercase tracking-wider">
                {" "}
                Repair Time{" "}
              </span>{" "}
            </div>{" "}
            <div className="mt-2 text-lg font-semibold">
              {" "}
              {report?.estimated_repair_time_hours ?? "--"}{" "}
              <span className="text-sm font-normal text-white/30">
                {" "}
                hours{" "}
              </span>{" "}
            </div>{" "}
          </div>{" "}
          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
            {" "}
            <div className="flex items-center gap-2 text-white/30">
              {" "}
              <Car size={14} />{" "}
              <span className="text-[9px] uppercase tracking-wider">
                {" "}
                Damage Types{" "}
              </span>{" "}
            </div>{" "}
            <div className="mt-2 text-lg font-semibold">
              {" "}
              {damageAssessment.length}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Damage Assessment */}{" "}
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.025] p-5">
          {" "}
          <div className="mb-5">
            {" "}
            <div className="text-[9px] uppercase tracking-[.2em] text-white/30">
              {" "}
              Damage Assessment{" "}
            </div>{" "}
            <h2 className="mt-2 text-xl font-semibold">
              {" "}
              Detected Damage{" "}
            </h2>{" "}
          </div>{" "}
          {damageAssessment.length > 0 ? (
            <div className="space-y-3">
              {" "}
              {damageAssessment.map((damage: any, index: number) => (
                <div
                  key={`${damage.damage_type}-${index}`}
                  className="rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  {" "}
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    {" "}
                    <div>
                      {" "}
                      <h3 className="text-sm font-semibold">
                        {" "}
                        {damage.damage_type}{" "}
                      </h3>{" "}
                      <p className="mt-1 text-xs text-white/35">
                        {" "}
                        {damage.location_on_vehicle}{" "}
                      </p>{" "}
                    </div>{" "}
                    <span className="w-fit rounded-full bg-orange-500/10 px-2.5 py-1 text-[9px] capitalize text-orange-400">
                      {" "}
                      {damage.severity}{" "}
                    </span>{" "}
                  </div>{" "}
                  {damage.description && (
                    <p className="mt-3 text-xs leading-5 text-white/40">
                      {" "}
                      {damage.description}{" "}
                    </p>
                  )}{" "}
                </div>
              ))}{" "}
            </div>
          ) : (
            <p className="text-sm text-white/35">
              {" "}
              No damage assessment available.{" "}
            </p>
          )}{" "}
        </div>{" "}
        {/* Repair Steps */}{" "}
        {report?.repair_steps?.length > 0 && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.025] p-5">
            {" "}
            <div className="text-[9px] uppercase tracking-[.2em] text-white/30">
              {" "}
              Recommended Repairs{" "}
            </div>{" "}
            <div className="mt-5 space-y-3">
              {" "}
              {report.repair_steps.map((step: string, index: number) => (
                <div key={index} className="flex gap-3 text-sm text-white/60">
                  {" "}
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#ff5b45]/10 text-[10px] text-[#ff6b58]">
                    {" "}
                    {index + 1}{" "}
                  </span>{" "}
                  <span className="pt-1"> {step} </span>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>
        )}{" "}
        {/* Notes */}{" "}
        {report?.notes && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.025] p-5">
            {" "}
            <div className="text-[9px] uppercase tracking-[.2em] text-white/30">
              {" "}
              Technician Notes{" "}
            </div>{" "}
            <p className="mt-3 text-sm leading-6 text-white/45">
              {" "}
              {report.notes}{" "}
            </p>{" "}
          </div>
        )}{" "}
        {/* Back */}{" "}
        <div className="mt-8">
          {" "}
          <Link
            href="/history"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs text-white/50 transition hover:border-white/20 hover:text-white"
          >
            {" "}
            <ArrowLeft size={14} /> Back to History{" "}
          </Link>{" "}
        </div>{" "}
      </div>{" "}
    </main>
  );
}
