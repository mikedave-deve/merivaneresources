import { useState } from "react";
import Badge from "../../components/ui/Badge";
import { PrimaryButton } from "../../components/ui/Buttons";
import { PageHeader, SectionCard } from "../../components/portal/PortalPrimitives";
import { ATTENDANCE_LOG, ATTENDANCE_STATUS_TONE, WEEKLY_HOURS } from "../../data/portal";

export default function Attendance() {
  const [clockedIn, setClockedIn] = useState(false);
  const maxHours = Math.max(...WEEKLY_HOURS.map((d) => d.hours), 1);
  const totalHours = WEEKLY_HOURS.reduce((s, d) => s + d.hours, 0);

  return (
    <div>
      <PageHeader eyebrow="My work" title="Attendance" subtitle="Clock in and out, and keep track of your hours." />

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6 mb-6">
        <div className="rounded-2xl bg-ink text-linen shadow-card p-6 flex flex-col items-center text-center justify-center">
          <div className="text-xs font-mono uppercase tracking-wide text-linen2/60">Current status</div>
          <div className="font-display text-2xl font-semibold mt-2">{clockedIn ? "Clocked In" : "Clocked Out"}</div>
          <div className="text-xs text-brassLight mt-1 font-mono">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</div>
          <PrimaryButton
            onClick={() => setClockedIn((c) => !c)}
            className={clockedIn ? "mt-6 bg-brass text-ink hover:bg-brassLight" : "mt-6"}
            icon={clockedIn ? "check" : "clock"}
          >
            {clockedIn ? "Clock Out" : "Clock In"}
          </PrimaryButton>
        </div>

        <SectionCard title="This week" subtitle={`${totalHours.toFixed(1)}h logged so far`}>
          <div className="flex items-end justify-between gap-3 h-32 mt-2">
            {WEEKLY_HOURS.map((d) => (
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
        <div className="overflow-x-auto -mx-6 -mb-6">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-linen2/60 text-left text-xs font-mono uppercase tracking-wide text-slateSoft">
              <tr><th className="px-6 py-3">Date</th><th className="px-6 py-3">Clock in</th><th className="px-6 py-3">Clock out</th><th className="px-6 py-3">Hours</th><th className="px-6 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {ATTENDANCE_LOG.map((a, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 text-ink font-medium">{a.date}</td>
                  <td className="px-6 py-4 text-slateSoft font-mono">{a.clockIn}</td>
                  <td className="px-6 py-4 text-slateSoft font-mono">{a.clockOut}</td>
                  <td className="px-6 py-4 text-slateSoft font-mono">{a.hours}</td>
                  <td className="px-6 py-4"><Badge tone={ATTENDANCE_STATUS_TONE[a.status]}>{a.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
