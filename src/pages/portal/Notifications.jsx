import { useState } from "react";
import Icon from "../../components/Icon";
import Badge from "../../components/ui/Badge";
import { PageHeader, SectionCard, EmptyState } from "../../components/portal/PortalPrimitives";
import { NOTIFICATIONS, NOTIFICATION_TONE } from "../../data/portal";
import { cx } from "../../lib/utils";

export default function Notifications() {
  const [items, setItems] = useState(NOTIFICATIONS);
  const unreadCount = items.filter((n) => n.unread).length;

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, unread: false })));

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}
        action={unreadCount > 0 && <button onClick={markAllRead} className="text-xs font-mono text-brass hover:underline">Mark all as read</button>}
      />

      {items.length === 0 ? (
        <EmptyState icon="bell" title="No notifications yet" />
      ) : (
        <SectionCard>
          <div className="divide-y divide-ink/6">
            {items.map((n, i) => (
              <div key={i} className={cx("flex items-start gap-3 py-4", n.unread && "bg-brass/5 -mx-6 px-6")}>
                <div className="h-9 w-9 rounded-full bg-linen2 flex items-center justify-center shrink-0"><Icon name={n.icon} size={15} className="text-ink" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cx("text-sm truncate", n.unread ? "font-semibold text-ink" : "text-ink/80")}>{n.title}</span>
                    {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-brass shrink-0" />}
                  </div>
                  <div className="text-xs text-slateSoft mt-0.5">{n.preview}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge tone={NOTIFICATION_TONE[n.type]}>{n.type}</Badge>
                  <span className="text-[11px] text-slateSoft font-mono">{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
