import { PageHeader, SectionCard, TimelineItem } from "../../components/portal/PortalPrimitives";
import { ACTIVITY_HISTORY } from "../../data/portal";

export default function ActivityHistory() {
  return (
    <div>
      <PageHeader eyebrow="My work" title="Activity History" subtitle="A running log of what's happened on your account." />
      <SectionCard>
        {ACTIVITY_HISTORY.map((a, i) => (
          <TimelineItem key={i} icon={a.icon} label={a.label} time={a.time} last={i === ACTIVITY_HISTORY.length - 1} />
        ))}
      </SectionCard>
    </div>
  );
}
