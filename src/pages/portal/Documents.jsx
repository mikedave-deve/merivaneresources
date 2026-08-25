import Icon from "../../components/Icon";
import { PageHeader, SectionCard } from "../../components/portal/PortalPrimitives";
import { DOCUMENTS } from "../../data/portal";

export default function Documents() {
  return (
    <div>
      <PageHeader eyebrow="My info" title="Documents" subtitle="Resumes, offers, contracts, and tax forms on file." />
      <SectionCard>
        <div className="divide-y divide-ink/6">
          {DOCUMENTS.map((d, i) => (
            <div key={i} className="flex items-center justify-between gap-3 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-linen2 flex items-center justify-center shrink-0"><Icon name="file" size={16} className="text-ink" /></div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink truncate">{d.name}</div>
                  <div className="text-xs text-slateSoft">{d.type} · updated {d.updated}</div>
                </div>
              </div>
              <button className="h-9 w-9 rounded-full border border-ink/12 flex items-center justify-center hover:bg-ink hover:text-linen transition-colors shrink-0"><Icon name="download" size={14} /></button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
