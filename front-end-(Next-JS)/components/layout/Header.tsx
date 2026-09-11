"use client";

import { Car } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-white/[.07] bg-[#090b0d]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[70px] max-w-[1450px] items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#ff5b45]/70 bg-[#ff5b45]/10 text-[#ff654f]">
            <Car size={21} />
          </div>

          <div>
            <div className="text-lg font-bold tracking-tight">CarDD</div>

            <div className="text-[9px] tracking-[.22em] text-white/35">
              AI VEHICLE DAMAGE ASSESSMENT
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 text-sm text-white/45 md:flex">
          <Link
            href="/"
            className="border-b-2 border-[#ff5b45] pb-[22px] pt-[24px] text-white"
          >
            Analyze
          </Link>

          <Link
            href="/history"
            className="pb-[22px] pt-[24px] hover:text-white"
          >
            History
          </Link>

          <Link href="/about" className="pb-[22px] pt-[24px] hover:text-white">
            About
          </Link>
        </nav>

        {/* System Status */}
        <div className="flex items-center gap-3 text-xs text-white/55">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
          System Operational
          {/* <div className="ml-2 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[10px]">
            JD
          </div> */}
        </div>
      </div>
    </header>
  );
}
