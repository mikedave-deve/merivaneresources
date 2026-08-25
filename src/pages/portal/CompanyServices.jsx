import Icon from "../../components/Icon";
import { PageHeader, PersonalConfirmCard } from "../../components/portal/PortalPrimitives";
import { COMPANY_SERVICES } from "../../data/portal";

export default function CompanyServices() {
  return (
    <div>
      <PageHeader eyebrow="Pay & benefits" title="Company Services" subtitle="Perks and support available to you as part of the Merivane team." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {COMPANY_SERVICES.map((s) => (
          <div key={s.title} className="rounded-2xl bg-white border border-ink/8 p-5 shadow-card flex flex-col">
            <div className="h-10 w-10 rounded-lg bg-moss/10 flex items-center justify-center mb-4"><Icon name={s.icon} size={18} className="text-moss" /></div>
            <div className="font-display font-semibold text-ink text-sm">{s.title}</div>
            <p className="text-xs text-slateSoft mt-1.5 leading-relaxed flex-1">{s.desc}</p>
          </div>
        ))}
      </div>

      <PersonalConfirmCard source="Company Services" />
    </div>
  );
}
