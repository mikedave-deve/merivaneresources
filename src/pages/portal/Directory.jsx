import { useState } from "react";
import Icon from "../../components/Icon";
import { PageHeader, EmptyState } from "../../components/portal/PortalPrimitives";
import { TEAM } from "../../data/team";

export default function Directory() {
  const [q, setQ] = useState("");
  const shown = TEAM.filter((m) => (m.name + m.role).toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader eyebrow="Company" title="Company Directory" subtitle="Find and reach out to anyone on the Merivane team." />

      <div className="relative mb-6 max-w-sm">
        <Icon name="search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slateSoft" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or role" className="w-full rounded-xl border border-ink/12 bg-white pl-10 pr-3.5 py-3 text-sm focus:border-brass focus:ring-1 focus:ring-brass" />
      </div>

      {shown.length === 0 ? (
        <EmptyState title="No one matches that search" subtitle="Try a different name or role." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((m) => (
            <div key={m.name} className="rounded-2xl bg-white border border-ink/8 p-4 shadow-card flex items-center gap-3">
              <img src={m.img} alt={m.name} className="h-12 w-12 rounded-full object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-ink truncate">{m.name}</div>
                <div className="text-xs text-slateSoft truncate">{m.role}</div>
              </div>
              <button className="h-8 w-8 rounded-full bg-linen2 flex items-center justify-center hover:bg-ink hover:text-linen transition-colors shrink-0"><Icon name="mail" size={13} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
