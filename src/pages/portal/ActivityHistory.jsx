import { useEffect, useState } from "react";
import { PageHeader, SectionCard, TimelineItem, EmptyState } from "../../components/portal/PortalPrimitives";

function fmtTime(value) {
  return new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function ActivityHistory() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/portal/activity")
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setActivity(data.activity || []); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <PageHeader eyebrow="My work" title="Activity History" subtitle="A running log of what's happened on your account." />
      {loading ? (
        <p className="text-sm text-slateSoft">Loading…</p>
      ) : activity.length === 0 ? (
        <EmptyState icon="clock" title="No activity yet" subtitle="Things you do in the portal will show up here." />
      ) : (
        <SectionCard>
          {activity.map((a, i) => (
            <TimelineItem key={i} icon={a.icon} label={a.label} time={fmtTime(a.time)} last={i === activity.length - 1} />
          ))}
        </SectionCard>
      )}
    </div>
  );
}
