import { cx } from "../../lib/utils";

const TONES = {
  ink: "bg-ink text-linen",
  brass: "bg-brass/15 text-brass border border-brass/30",
  moss: "bg-moss/10 text-moss border border-moss/25",
  linen: "bg-linen2 text-slateSoft",
};

export default function Badge({ children, tone = "ink", className = "" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
