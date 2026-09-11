export default function Footer() {
  return (
    <footer className="mx-auto flex max-w-[1450px] items-center justify-between border-t border-white/[.07] px-6 py-5 text-[10px] text-white/25 lg:px-10">
      <div>
        CarDD
        <span className="mx-2">·</span>
        AI Vehicle Damage Assessment
      </div>

      <div className="hidden items-center gap-5 sm:flex">
        <span>Privacy</span>
        <span>Terms</span>
        <span>Contact</span>
        <span>Built for safer roads.</span>
      </div>
    </footer>
  );
}
