import { useState } from "react";
import Icon from "../../components/Icon";
import Badge from "../../components/ui/Badge";
import { PageHeader, SectionCard, ProgressBar } from "../../components/portal/PortalPrimitives";
import { MISSIONS, MISSION_STATUS_TONE } from "../../data/portal";
import { cx } from "../../lib/utils";

const PRIORITY_TONE = { High: "brass", Medium: "linen", Low: "linen" };
const FILTERS = ["All", "Not Started", "In Progress", "In Review", "Completed"];

export default function Missions() {
  const [filter, setFilter] = useState("All");
  const shown = filter === "All" ? MISSIONS : MISSIONS.filter((m) => m.status === filter);

  return (
    <div>
      <PageHeader eyebrow="My work" title="Missions & Instructions" subtitle="Tasks and assignments from your recruiter and team lead, with everything you need to complete them." />

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cx(
              "rounded-full border px-3.5 py-1.5 text-xs font-mono uppercase tracking-wide transition-colors",
              filter === f ? "bg-ink text-linen border-ink" : "border-ink/12 text-slateSoft hover:border-ink/30"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {shown.map((m) => (
          <SectionCard key={m.id}>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
              <h3 className="font-display font-semibold text-ink">{m.title}</h3>
              <div className="flex items-center gap-2 shrink-0">
                <Badge tone={PRIORITY_TONE[m.priority]}>{m.priority} priority</Badge>
                <Badge tone={MISSION_STATUS_TONE[m.status]}>{m.status}</Badge>
              </div>
            </div>
            <p className="text-sm text-slateSoft leading-relaxed mb-4">{m.instructions}</p>
            <div className="flex items-center gap-4">
              <div className="flex-1"><ProgressBar pct={m.progress} tone={m.status === "Completed" ? "moss" : "brass"} /></div>
              <span className="text-xs font-mono text-slateSoft w-10 text-right shrink-0">{m.progress}%</span>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-1.5 text-xs text-slateSoft font-mono"><Icon name="calendar" size={13} />Due {m.dueDate}</div>
              <button className="text-xs font-mono text-brass hover:underline">Open mission</button>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
