export default function Hero() {
  return (
    <div className="relative overflow-hidden pb-10">
      {/* Car background */}
      <div
        className="pointer-events-none absolute right-0 top-[-20px] h-[280px] w-[60%] bg-cover bg-center opacity-50"
        style={{
          backgroundImage: "url('/images/car-hero.png')",
        }}
      />

      {/* Gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#07090b] via-[#07090b]/90 to-transparent" />

      {/* Red glow */}
      <div className="absolute right-[15%] top-10 h-[220px] w-[500px] rounded-full bg-[#ff4d36]/[.06] blur-[100px]" />

      <div className="relative z-10">
        <div className="mb-3 text-[10px] font-medium tracking-[.3em] text-white/60">
          TURN IMAGES INTO INSIGHTS
        </div>

        <h1 className="max-w-[700px] text-5xl font-semibold leading-[.98] tracking-[-.045em] md:text-6xl">
          See the damage.
          <br />
          <span className="text-[#ff5d48]">Know what&apos;s next.</span>
        </h1>

        <p className="mt-5 max-w-[660px] text-sm leading-6 text-white/45">
          Advanced computer vision for faster, clearer, and more accurate
          vehicle damage assessment.
        </p>
      </div>
    </div>
  );
}
