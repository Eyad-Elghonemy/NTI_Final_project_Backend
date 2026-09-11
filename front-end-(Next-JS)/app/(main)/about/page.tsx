import Link from "next/link";
import { ArrowLeft, Brain, Car, ShieldCheck, Target } from "lucide-react";

export default function AboutPage() {
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

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[.025] px-6 py-14 md:px-12">
          <div className="absolute right-[-100px] top-[-100px] h-[300px] w-[300px] rounded-full bg-[#ff4d36]/10 blur-[100px]" />

          <div className="relative max-w-3xl">
            <div className="mb-4 text-[10px] font-medium tracking-[.3em] text-[#ff6b58]">
              ABOUT CARDD
            </div>

            <h1 className="text-4xl font-semibold tracking-[-.04em] md:text-5xl">
              Smarter vehicle damage assessment.
            </h1>

            <p className="mt-6 text-sm leading-7 text-white/45">
              CarDD is an AI-powered vehicle damage assessment platform designed
              to turn a vehicle image into clear, actionable repair information.
            </p>

            <p className="mt-4 text-sm leading-7 text-white/45">
              Using computer vision and AI analysis, CarDD identifies visible
              vehicle damage, assesses its severity, recommends repair steps,
              estimates repair time, and provides an estimated repair-cost
              range.
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-6">
            <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-[#ff5b45]/10 text-[#ff6b58]">
              <Brain size={18} />
            </div>

            <h2 className="font-semibold">AI Detection</h2>

            <p className="mt-2 text-xs leading-6 text-white/35">
              Computer vision detects and localizes visible vehicle damage.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-6">
            <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-[#ff5b45]/10 text-[#ff6b58]">
              <Target size={18} />
            </div>

            <h2 className="font-semibold">Clear Assessment</h2>

            <p className="mt-2 text-xs leading-6 text-white/35">
              Damage severity, repair steps, tools, and estimated repair time
              are presented in one report.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-6">
            <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-[#ff5b45]/10 text-[#ff6b58]">
              <ShieldCheck size={18} />
            </div>

            <h2 className="font-semibold">Built for Clarity</h2>

            <p className="mt-2 text-xs leading-6 text-white/35">
              Get a simple overview of what happened to the vehicle and what to
              consider next.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[.025] p-6 md:p-8">
          <div className="flex items-start gap-4">
            <Car className="mt-1 text-[#ff6b58]" size={20} />

            <div>
              <h2 className="font-semibold">How CarDD Works</h2>

              <div className="mt-5 space-y-4 text-xs leading-6 text-white/40">
                <p>
                  <span className="text-white/70">01 — Upload:</span> Upload a
                  vehicle image.
                </p>

                <p>
                  <span className="text-white/70">02 — Detect:</span> The
                  computer-vision model identifies and highlights damage.
                </p>

                <p>
                  <span className="text-white/70">03 — Assess:</span> AI
                  analyzes the detected damage and determines its severity.
                </p>

                <p>
                  <span className="text-white/70">04 — Report:</span> Receive
                  repair recommendations, equipment requirements, repair time,
                  and an estimated Egyptian Pound cost range.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
