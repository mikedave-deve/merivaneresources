import { PageHeader, SectionCard, ProgressBar } from "../../components/portal/PortalPrimitives";
import { RETIREMENT } from "../../data/portal";

export default function Retirement() {
  const r = RETIREMENT;

  return (
    <div>
      <PageHeader eyebrow="Pay & benefits" title="401(k) & Retirement" subtitle="Your retirement account balance, contributions, and fund allocation." />

      <div className="grid sm:grid-cols-3 gap-5 mb-6">
        <div className="rounded-2xl bg-ink text-linen p-5 shadow-card">
          <div className="text-xs font-mono uppercase tracking-wide text-linen2/60">Current balance</div>
          <div className="font-display text-2xl font-semibold mt-2">{r.balance}</div>
          <div className="text-xs text-brassLight mt-1">{r.vested} vested</div>
        </div>
        <div className="rounded-2xl bg-white border border-ink/8 p-5 shadow-card">
          <div className="text-xs font-mono uppercase tracking-wide text-slateSoft">Your contribution</div>
          <div className="font-display text-2xl font-semibold mt-2 text-ink">{r.contributionRate}%</div>
          <div className="text-xs text-slateSoft mt-1">of each paycheck</div>
        </div>
        <div className="rounded-2xl bg-white border border-ink/8 p-5 shadow-card">
          <div className="text-xs font-mono uppercase tracking-wide text-slateSoft">Employer match</div>
          <div className="font-display text-lg font-semibold mt-2 text-ink">{r.employerMatch}</div>
          <div className="text-xs text-slateSoft mt-1">YTD contributions {r.ytdContribution}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
        <SectionCard title="Fund allocation">
          <div className="space-y-5">
            {r.allocations.map((a) => (
              <div key={a.fund}>
                <div className="flex items-center justify-between mb-1.5 text-sm">
                  <span className="text-ink">{a.fund}</span>
                  <span className="font-mono text-slateSoft">{a.pct}%</span>
                </div>
                <ProgressBar pct={a.pct} tone="brass" />
              </div>
            ))}
          </div>
          <button className="text-xs font-mono text-brass hover:underline mt-6">Change contribution rate</button>
        </SectionCard>

        <SectionCard title="Statements">
          <div className="divide-y divide-ink/6">
            {r.statements.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-3.5">
                <div>
                  <div className="text-sm font-medium text-ink">{s.period}</div>
                  <div className="text-xs text-slateSoft mt-0.5">Updated {s.updated}</div>
                </div>
                <button className="text-xs font-mono text-brass hover:underline">Download</button>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
