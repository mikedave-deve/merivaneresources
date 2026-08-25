import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import Badge from "../../components/ui/Badge";
import { RadialProgress, StatCard, SectionCard, ProgressBar } from "../../components/portal/PortalPrimitives";
import { EMPLOYEE, MISSIONS, MISSION_STATUS_TONE, PAYROLL_HISTORY, TIME_OFF_BALANCE, NOTIFICATIONS } from "../../data/portal";

export default function Dashboard() {
  const navigate = useNavigate();
  const activeMissions = MISSIONS.filter((m) => m.status !== "Completed");
  const weeklyHours = 8.0 + 7.9 + 8.1 + 0 + 8.0;
  const ptoAvailable = TIME_OFF_BALANCE.reduce((sum, b) => sum + (b.total - b.used), 0);
  const recentNotifications = NOTIFICATIONS.slice(0, 3);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">Welcome back, {EMPLOYEE.firstName} 👋</h1>
          <p className="text-sm text-slateSoft mt-1">{EMPLOYEE.role} · {EMPLOYEE.department}</p>
        </div>
        <Badge tone="moss">On the roster since {EMPLOYEE.startDate}</Badge>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon="compass" label="Active missions" value={activeMissions.length} />
        <StatCard icon="clock" label="Hours logged this week" value={weeklyHours} suffix="h" />
        <StatCard icon="calendar" label="PTO days available" value={ptoAvailable} />
        <div className="rounded-2xl bg-white border border-ink/8 p-5 shadow-card flex items-center gap-4">
          <RadialProgress pct={86} size={72} />
          <div>
            <div className="text-sm font-medium text-ink">Profile strength</div>
            <div className="text-xs text-slateSoft mt-1">Finish Information Setup to reach 100%</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 mt-6">
        <SectionCard
          title="Current missions"
          action={<button onClick={() => navigate("/portal/missions")} className="text-xs font-mono text-brass hover:underline">View all</button>}
        >
          <div className="divide-y divide-ink/6">
            {MISSIONS.map((m, i) => (
              <div key={i} className="py-3.5">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="text-sm font-medium text-ink truncate">{m.title}</div>
                  <Badge tone={MISSION_STATUS_TONE[m.status]}>{m.status}</Badge>
                </div>
                <ProgressBar pct={m.progress} tone={m.status === "Completed" ? "moss" : "brass"} />
                <div className="text-xs text-slateSoft font-mono mt-1.5">Due {m.dueDate}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="rounded-2xl bg-ink2 text-linen shadow-card p-6">
          <h2 className="font-display font-semibold mb-4">Up next</h2>
          <div className="space-y-4">
            <div className="rounded-xl bg-white/8 border border-white/10 p-4">
              <div className="text-sm font-medium">Next payroll deposit</div>
              <div className="flex items-center gap-2 text-xs text-brassLight mt-2 font-mono"><Icon name="card" size={12} />{PAYROLL_HISTORY[0].amount} · Sep 1, 2026</div>
            </div>
            <div className="rounded-xl bg-white/8 border border-white/10 p-4">
              <div className="text-sm font-medium">Time off request pending</div>
              <div className="flex items-center gap-2 text-xs text-linen2/70 mt-2 font-mono"><Icon name="calendar" size={12} />Sep 15 – Sep 19, 2026</div>
            </div>
          </div>
          <button onClick={() => navigate("/portal/notifications")} className="w-full mt-4 rounded-xl border border-white/15 py-2.5 text-xs font-mono uppercase tracking-wide hover:bg-white/10 transition-colors">View all notifications</button>
        </div>
      </div>

      <SectionCard
        title="Recent notifications"
        className="mt-6"
        action={<button onClick={() => navigate("/portal/notifications")} className="text-xs font-mono text-brass hover:underline">View all</button>}
      >
        <div className="divide-y divide-ink/6">
          {recentNotifications.map((n, i) => (
            <div key={i} className="flex items-start gap-3 py-3.5">
              <div className="h-9 w-9 rounded-full bg-linen2 flex items-center justify-center shrink-0"><Icon name={n.icon} size={15} className="text-ink" /></div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-ink truncate">{n.title}</div>
                <div className="text-xs text-slateSoft mt-0.5 truncate">{n.preview}</div>
              </div>
              <div className="text-[11px] text-slateSoft font-mono shrink-0">{n.time}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
