import { useEffect, useState } from "react";
import { PageHeader, PersonalConfirmCard } from "../../components/portal/PortalPrimitives";

export default function Retirement() {
  const [r, setR] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/portal/retirement")
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setR(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading || !r) return null;

  return (
    <div>
      <PageHeader eyebrow="Pay & benefits" title="401(k) & Retirement" subtitle="Your retirement account balance and contributions." />

      <div className="grid sm:grid-cols-3 gap-5 mb-6">
        <div className="rounded-2xl bg-ink text-linen p-5 shadow-card">
          <div className="text-xs font-mono uppercase tracking-wide text-linen2/60">Current balance</div>
          <div className="font-display text-2xl font-semibold mt-2">${Number(r.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="rounded-2xl bg-white border border-ink/8 p-5 shadow-card">
          <div className="text-xs font-mono uppercase tracking-wide text-slateSoft">Your contribution</div>
          <div className="font-display text-2xl font-semibold mt-2 text-ink">{r.contributionRate}%</div>
          <div className="text-xs text-slateSoft mt-1">of each paycheck</div>
        </div>
        <div className="rounded-2xl bg-white border border-ink/8 p-5 shadow-card">
          <div className="text-xs font-mono uppercase tracking-wide text-slateSoft">Employer match</div>
          <div className="font-display text-lg font-semibold mt-2 text-ink">{r.employerMatch || "Not set yet"}</div>
        </div>
      </div>

      <PersonalConfirmCard source="401(k) & Retirement" />
    </div>
  );
}
