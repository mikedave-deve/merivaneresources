import { PageHeader, SectionCard, ChecklistRow, ProgressBar } from "../../components/portal/PortalPrimitives";
import { INFO_SETUP } from "../../data/portal";

export default function InformationSetup() {
  const done = INFO_SETUP.filter((s) => s.done).length;
  const pct = Math.round((done / INFO_SETUP.length) * 100);

  return (
    <div>
      <PageHeader eyebrow="My info" title="Information Setup" subtitle="Complete these steps so payroll, tax, and compliance teams have what they need." />

      <SectionCard
        title="Setup progress"
        action={<span className="font-mono text-sm text-ink">{done}/{INFO_SETUP.length} complete</span>}
        className="mb-6"
      >
        <ProgressBar pct={pct} tone="moss" />
      </SectionCard>

      <SectionCard>
        <div className="divide-y divide-ink/6">
          {INFO_SETUP.map((s) => (
            <ChecklistRow key={s.id} label={s.label} detail={s.detail} done={s.done} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
