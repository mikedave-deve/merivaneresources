import { cx } from "../lib/utils";

export default function Logo({ variant = "dark", showTag = true, size = "md" }) {
  const isDark = variant === "dark"; // dark => sits on a light background, text reads ink
  const mark = isDark ? "#16281D" : "#F7F8F1";
  const markAccent = "#B8874C";
  const text = isDark ? "text-ink" : "text-paper";
  const sub = isDark ? "text-slateSoft" : "text-linen2";
  const dims = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <div className="flex items-center gap-3 select-none">
      <svg viewBox="0 0 48 48" className={dims} aria-hidden="true">
        <rect x="1" y="1" width="46" height="46" rx="11" fill={mark} />
        <path
          d="M13 34V14l11 12 11-12v20"
          stroke={markAccent}
          strokeWidth="3.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="26" r="2.1" fill={markAccent} />
      </svg>
      <div className="leading-none">
        <div className={cx("font-mono tracking-[0.16em] text-[13px] sm:text-sm font-semibold uppercase", text)}>
          Merivane
        </div>
        {showTag && (
          <div className={cx("font-mono tracking-[0.3em] text-[9px] uppercase mt-0.5", sub)}>Resources</div>
        )}
      </div>
    </div>
  );
}
