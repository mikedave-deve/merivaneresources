import Icon from "../../components/Icon";
import Badge from "../../components/ui/Badge";
import { GhostButton } from "../../components/ui/Buttons";
import { PageHeader, SectionCard, TimelineItem } from "../../components/portal/PortalPrimitives";
import { IDENTITY_VERIFICATION } from "../../data/portal";

const STATUS_TONE = { Verified: "moss", Pending: "brass", "Not Started": "linen", Rejected: "linen" };

export default function IdentityVerification() {
  const v = IDENTITY_VERIFICATION;

  return (
    <div>
      <PageHeader eyebrow="My info" title="Identity Verification" subtitle="Required for compliance across the 38 countries Merivane operates in." />

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
        <SectionCard>
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-moss/10 flex items-center justify-center mb-4"><Icon name="shield" size={26} className="text-moss" /></div>
            <Badge tone={STATUS_TONE[v.status]}>{v.status}</Badge>
            <div className="text-sm text-slateSoft mt-4 space-y-1.5 w-full text-left">
              <div className="flex justify-between"><span>Method</span><span className="text-ink text-right">{v.method}</span></div>
              <div className="flex justify-between"><span>Document type</span><span className="text-ink">{v.documentType}</span></div>
              <div className="flex justify-between"><span>Verified on</span><span className="text-ink font-mono">{v.verifiedOn}</span></div>
            </div>
            <GhostButton className="mt-6 w-full">Re-verify identity</GhostButton>
          </div>
        </SectionCard>

        <SectionCard title="Verification history">
          {v.history.map((h, i) => (
            <TimelineItem key={i} icon="check" label={h.label} time={h.time} last={i === v.history.length - 1} />
          ))}
        </SectionCard>
      </div>
    </div>
  );
}
