import Icon from "../../components/Icon";
import Badge from "../../components/ui/Badge";
import { GhostButton } from "../../components/ui/Buttons";
import { PageHeader, SectionCard } from "../../components/portal/PortalPrimitives";
import ShipmentTracker from "../../components/portal/ShipmentTracker";
import { EQUIPMENT, EQUIPMENT_STATUS_TONE } from "../../data/portal";
import { useApp } from "../../context/AppContext";

export default function Equipment() {
  const { user } = useApp();

  return (
    <div>
      <PageHeader
        eyebrow="Company"
        title="Equipment & Logistics"
        subtitle="Hardware assigned to you, and where it's headed."
        action={<GhostButton icon="upload">Request equipment</GhostButton>}
      />

      <div className="mb-6">
        <ShipmentTracker />
      </div>

      <SectionCard title="Shipping address on file" className="mb-6">
        <div className="flex items-center gap-3 text-sm text-inkText/85">
          <Icon name="pin" size={16} className="text-brass" />
          {user.location || "Not set yet"}
        </div>
      </SectionCard>

      <SectionCard>
        <div className="divide-y divide-ink/6">
          {EQUIPMENT.map((e, i) => (
            <div key={i} className="flex items-center justify-between gap-3 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-linen2 flex items-center justify-center shrink-0"><Icon name="briefcase" size={16} className="text-ink" /></div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink truncate">{e.item}</div>
                  <div className="text-xs text-slateSoft font-mono">{e.serial} · assigned {e.assignedOn}</div>
                </div>
              </div>
              <Badge tone={EQUIPMENT_STATUS_TONE[e.status]}>{e.status}</Badge>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
