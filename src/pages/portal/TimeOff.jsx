import { useState } from "react";
import Field from "../../components/ui/Field";
import Badge from "../../components/ui/Badge";
import { PrimaryButton } from "../../components/ui/Buttons";
import { PageHeader, SectionCard, ProgressBar } from "../../components/portal/PortalPrimitives";
import { TIME_OFF_BALANCE, TIME_OFF_REQUESTS, TIME_OFF_STATUS_TONE } from "../../data/portal";

const TYPES = ["Vacation", "Sick", "Personal"];

export default function TimeOff() {
  const [form, setForm] = useState({ type: "", from: "", to: "", reason: "" });
  const [requested, setRequested] = useState(false);
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canSubmit = form.type && form.from && form.to;

  return (
    <div>
      <PageHeader eyebrow="My work" title="Time Off" subtitle="Check your balance and request time away from work." />

      <div className="grid sm:grid-cols-3 gap-5 mb-6">
        {TIME_OFF_BALANCE.map((b) => (
          <div key={b.type} className="rounded-2xl bg-white border border-ink/8 p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-ink">{b.type}</div>
              <div className="font-mono text-sm text-slateSoft">{b.total - b.used}/{b.total} left</div>
            </div>
            <ProgressBar pct={((b.total - b.used) / b.total) * 100} tone="moss" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
        <SectionCard title="Request time off">
          {requested ? (
            <div className="text-center py-6">
              <div className="h-12 w-12 rounded-full bg-moss/10 flex items-center justify-center mx-auto mb-3"><Badge tone="moss">Submitted</Badge></div>
              <p className="text-sm text-slateSoft mt-3">Your request has been sent to your manager for approval.</p>
              <button onClick={() => { setRequested(false); setForm({ type: "", from: "", to: "", reason: "" }); }} className="text-xs font-mono text-brass hover:underline mt-4">Submit another request</button>
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Type" icon="calendar" type="select" value={form.type} onChange={update("type")} placeholder="Select a type" options={TYPES} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="From" type="date" value={form.from} onChange={update("from")} />
                <Field label="To" type="date" value={form.to} onChange={update("to")} />
              </div>
              <label className="block">
                <span className="block text-xs font-mono uppercase tracking-wider text-slateSoft mb-1.5">Reason (optional)</span>
                <textarea value={form.reason} onChange={update("reason")} rows="3" placeholder="Anything your manager should know." className="w-full rounded-xl border border-ink/12 px-3.5 py-3 text-sm focus:border-brass focus:ring-1 focus:ring-brass resize-none" />
              </label>
              <PrimaryButton onClick={() => canSubmit && setRequested(true)} full className={!canSubmit ? "opacity-50 pointer-events-none" : ""}>Submit request</PrimaryButton>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Request history">
          <div className="divide-y divide-ink/6">
            {TIME_OFF_REQUESTS.map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-3.5">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink">{r.type} · {r.days} day{r.days > 1 ? "s" : ""}</div>
                  <div className="text-xs text-slateSoft mt-0.5">{r.from === r.to ? r.from : `${r.from} – ${r.to}`}</div>
                  <div className="text-xs text-slateSoft/80 mt-0.5 truncate">{r.reason}</div>
                </div>
                <Badge tone={TIME_OFF_STATUS_TONE[r.status]}>{r.status}</Badge>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
