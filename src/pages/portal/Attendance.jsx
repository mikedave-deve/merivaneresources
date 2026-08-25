import { useEffect, useState } from "react";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/Icon";
import { PrimaryButton } from "../../components/ui/Buttons";
import { PageHeader, SectionCard } from "../../components/portal/PortalPrimitives";
import { ATTENDANCE_STATUS_TONE } from "../../data/portal";
import { cx } from "../../lib/utils";

function fmtTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function Attendance() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = () => fetch("/api/portal/attendance").then((res) => res.json());

  useEffect(() => {
    let cancelled = false;
    load().then((data) => { if (!cancelled) { setState(data); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const toggleClock = async () => {
    if (busy || !state) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/portal/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: state.clockedIn ? "clock-out" : "clock-in" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setState(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !state) return null;

  const maxHours = Math.max(...state.weeklyHours.map((d) => d.hours), 1);
  const totalHours = Math.round(state.weeklyHours.reduce((s, d) => s + d.hours, 0) * 10) / 10;

  return (
    <div>
      <PageHeader eyebrow="My work" title="Attendance" subtitle="Clock in and out, and keep track of your hours." />

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6 mb-6">
        <div className="rounded-2xl bg-ink text-linen shadow-card p-6 flex flex-col items-center text-center justify-center">
          <div className="text-xs font-mono uppercase tracking-wide text-linen2/60">Current status</div>
          <div className="font-display text-2xl font-semibold mt-2">{state.clockedIn ? "Clocked In" : "Clocked Out"}</div>
          <div className="text-xs text-brassLight mt-1 font-mono">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</div>
          {state.today?.clockIn && (
            <div className="text-[11px] text-linen2/60 mt-1 font-mono">Since {fmtTime(state.today.clockIn)}</div>
          )}
          {error && <p className="text-xs text-red-300 mt-3 flex items-center gap-1"><Icon name="alert" size={12} />{error}</p>}
          <PrimaryButton
            onClick={toggleClock}
            className={cx(state.clockedIn ? "mt-6 bg-brass text-ink hover:bg-brassLight" : "mt-6", busy && "opacity-60 pointer-events-none")}
            icon={state.clockedIn ? "check" : "clock"}
          >
            {busy ? "Working…" : state.clockedIn ? "Clock Out" : "Clock In"}
          </PrimaryButton>
        </div>

        <SectionCard title="This week" subtitle={`${totalHours.toFixed(1)}h logged so far`}>
          <div className="flex items-end justify-between gap-3 h-32 mt-2">
            {state.weeklyHours.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-md bg-brass/80"
                    style={{ height: `${Math.max((d.hours / maxHours) * 100, 4)}%` }}
                  />
                </div>
                <span className="text-[11px] text-slateSoft font-mono">{d.day}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Attendance log">
        {state.log.length === 0 ? (
          <p className="text-sm text-slateSoft py-4">No attendance recorded yet — clock in to start your log.</p>
        ) : (
          <div className="overflow-x-auto -mx-6 -mb-6">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-linen2/60 text-left text-xs font-mono uppercase tracking-wide text-slateSoft">
                <tr><th className="px-6 py-3">Date</th><th className="px-6 py-3">Clock in</th><th className="px-6 py-3">Clock out</th><th className="px-6 py-3">Hours</th><th className="px-6 py-3">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {state.log.map((a) => (
                  <tr key={a.date}>
                    <td className="px-6 py-4 text-ink font-medium">{a.date}</td>
                    <td className="px-6 py-4 text-slateSoft font-mono">{fmtTime(a.clockIn)}</td>
                    <td className="px-6 py-4 text-slateSoft font-mono">{fmtTime(a.clockOut)}</td>
                    <td className="px-6 py-4 text-slateSoft font-mono">{a.hours}</td>
                    <td className="px-6 py-4"><Badge tone={ATTENDANCE_STATUS_TONE[a.status] || "linen"}>{a.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
