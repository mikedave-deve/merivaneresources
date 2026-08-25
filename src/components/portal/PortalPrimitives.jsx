import Icon from "../Icon";
import CountUp from "../ui/CountUp";
import { cx } from "../../lib/utils";

export function RadialProgress({ pct, size = 108 }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#B8874C ${pct * 3.6}deg, #DFE4D2 0deg)` }} />
      <div className="absolute inset-2 rounded-full bg-white flex flex-col items-center justify-center">
        <span className="font-mono text-xl font-semibold text-ink">{pct}%</span>
        <span className="text-[10px] text-slateSoft uppercase tracking-wide">complete</span>
      </div>
    </div>
  );
}

export function StatCard({ icon, label, value, suffix = "" }) {
  return (
    <div className="rounded-2xl bg-white border border-ink/8 p-5 shadow-card">
      <div className="h-10 w-10 rounded-lg bg-linen2 flex items-center justify-center mb-4"><Icon name={icon} size={17} className="text-ink" /></div>
      <div className="font-mono text-2xl font-semibold text-ink"><CountUp value={value} suffix={suffix} /></div>
      <div className="text-xs text-slateSoft mt-1">{label}</div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
      <div>
        {eyebrow && <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass mb-2">{eyebrow}</div>}
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-slateSoft mt-1.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionCard({ title, subtitle, action, children, className = "" }) {
  return (
    <div className={cx("rounded-2xl bg-white border border-ink/8 shadow-card p-6", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            {title && <h2 className="font-display font-semibold text-ink">{title}</h2>}
            {subtitle && <p className="text-xs text-slateSoft mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function ProgressBar({ pct, tone = "brass" }) {
  const bar = tone === "moss" ? "bg-moss" : tone === "ink" ? "bg-ink" : "bg-brass";
  return (
    <div className="h-1.5 w-full rounded-full bg-linen2 overflow-hidden">
      <div className={cx("h-full rounded-full transition-all", bar)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function TimelineItem({ icon, label, time, last = false }) {
  return (
    <div className="flex gap-3.5">
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 rounded-full bg-linen2 flex items-center justify-center shrink-0"><Icon name={icon} size={14} className="text-ink" /></div>
        {!last && <div className="w-px flex-1 bg-ink/8 my-1" />}
      </div>
      <div className={cx("min-w-0", !last && "pb-5")}>
        <div className="text-sm text-inkText/85 leading-snug">{label}</div>
        <div className="text-xs text-slateSoft font-mono mt-1">{time}</div>
      </div>
    </div>
  );
}

export function ChecklistRow({ label, detail, done }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className={cx("h-8 w-8 rounded-full flex items-center justify-center shrink-0", done ? "bg-moss/10 text-moss" : "bg-linen2 text-slateSoft")}>
          <Icon name={done ? "check" : "clock"} size={14} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-ink">{label}</div>
          <div className="text-xs text-slateSoft mt-0.5 truncate">{detail}</div>
        </div>
      </div>
      <button className="text-xs font-mono text-brass hover:underline shrink-0">{done ? "Update" : "Complete"}</button>
    </div>
  );
}

export function EmptyState({ icon = "search", title, subtitle }) {
  return (
    <div className="text-center py-16">
      <Icon name={icon} size={26} className="mx-auto text-slateSoft mb-3" />
      <div className="font-display text-lg text-ink">{title}</div>
      {subtitle && <p className="text-sm text-slateSoft mt-1">{subtitle}</p>}
    </div>
  );
}
