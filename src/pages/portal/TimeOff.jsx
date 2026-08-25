import { useEffect, useState } from "react";
import Field from "../../components/ui/Field";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/Icon";
import { PrimaryButton } from "../../components/ui/Buttons";
import { PageHeader, SectionCard, ProgressBar } from "../../components/portal/PortalPrimitives";
import { TIME_OFF_STATUS_TONE } from "../../data/portal";

const TYPES = ["Vacation", "Sick", "Personal"];

export default function TimeOff() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ type: "", from: "", to: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState("");

  const load = () => fetch("/api/portal/timeoff").then((res) => res.json());

  useEffect(() => {
    let cancelled = false;
    load().then((d) => { if (!cancelled) { setData(d); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canSubmit = form.type && form.from && form.to && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/portal/timeoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Something went wrong.");
      const fresh = await load();
      setData(fresh);
      setRequested(true);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data) return null;

  const balanceEntries = Object.entries(data.balance).map(([key, b]) => ({
    type: key[0].toUpperCase() + key.slice(1),
    ...b,
  }));

  return (
    <div>
      <PageHeader eyebrow="My work" title="Time Off" subtitle="Check your balance and request time away from work." />

      <div className="grid sm:grid-cols-3 gap-5 mb-6">
        {balanceEntries.map((b) => (
          <div key={b.type} className="rounded-2xl bg-white border border-ink/8 p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-ink">{b.type}</div>
              <div className="font-mono text-sm text-slateSoft">{Math.max(0, b.total - b.used)}/{b.total} left</div>
            </div>
            <ProgressBar pct={Math.max(0, ((b.total - b.used) / b.total) * 100)} tone="moss" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
        <SectionCard title="Request time off">
          {requested ? (
            <div className="text-center py-6">
              <div className="h-12 w-12 rounded-full bg-moss/10 flex items-center justify-center mx-auto mb-3"><Badge tone="moss">Submitted</Badge></div>
              <p className="text-sm text-slateSoft mt-3">Your request has been sent to your admin for approval.</p>
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
                <textarea value={form.reason} onChange={update("reason")} rows="3" placeholder="Anything your admin should know." className="w-full rounded-xl border border-ink/12 px-3.5 py-3 text-sm focus:border-brass focus:ring-1 focus:ring-brass resize-none" />
              </label>
              {error && <p className="text-sm text-red-600 flex items-center gap-1.5"><Icon name="alert" size={14} />{error}</p>}
              <PrimaryButton onClick={submit} full className={!canSubmit ? "opacity-50 pointer-events-none" : ""}>{submitting ? "Submitting…" : "Submit request"}</PrimaryButton>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Request history">
          {data.requests.length === 0 ? (
            <p className="text-sm text-slateSoft py-4">No requests yet.</p>
          ) : (
            <div className="divide-y divide-ink/6">
              {data.requests.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 py-3.5">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink">{r.type} · {r.days} day{r.days > 1 ? "s" : ""}</div>
                    <div className="text-xs text-slateSoft mt-0.5">{r.from === r.to ? r.from : `${r.from} – ${r.to}`}</div>
                    {r.reason && <div className="text-xs text-slateSoft/80 mt-0.5 truncate">{r.reason}</div>}
                  </div>
                  <Badge tone={TIME_OFF_STATUS_TONE[r.status]}>{r.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
