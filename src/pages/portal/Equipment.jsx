import { PageHeader } from "../../components/portal/PortalPrimitives";
import ShipmentTracker from "../../components/portal/ShipmentTracker";

export default function Equipment() {
  return (
    <div>
      <PageHeader
        eyebrow="Company"
        title="Equipment & Logistics"
        subtitle="Hardware assigned to you, and where it's headed."
      />

      <ShipmentTracker />
    </div>
  );
}
