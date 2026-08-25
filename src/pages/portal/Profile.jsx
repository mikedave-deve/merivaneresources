import { useState } from "react";
import Field from "../../components/ui/Field";
import Badge from "../../components/ui/Badge";
import { PrimaryButton } from "../../components/ui/Buttons";
import { PageHeader, SectionCard } from "../../components/portal/PortalPrimitives";
import { EMPLOYEE } from "../../data/portal";

export default function Profile() {
  const [form, setForm] = useState({
    name: EMPLOYEE.name,
    email: EMPLOYEE.email,
    phone: EMPLOYEE.phone,
    location: EMPLOYEE.location,
    timezone: EMPLOYEE.timezone,
  });
  const [saved, setSaved] = useState(false);

  const update = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setSaved(false); };

  return (
    <div>
      <PageHeader eyebrow="My info" title="Profile" subtitle="Your identity, role, and contact details on file with Merivane." />

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
        <SectionCard>
          <div className="flex flex-col items-center text-center">
            <img src={EMPLOYEE.avatar} alt={EMPLOYEE.name} className="h-24 w-24 rounded-full object-cover border-4 border-linen2" />
            <button className="text-xs font-mono text-brass hover:underline mt-3">Change photo</button>
            <div className="font-display font-semibold text-ink text-lg mt-4">{EMPLOYEE.name}</div>
            <div className="text-sm text-slateSoft mt-0.5">{EMPLOYEE.role}</div>
            <Badge tone="moss" className="mt-3">{EMPLOYEE.status}</Badge>
          </div>
          <div className="border-t border-ink/8 mt-6 pt-5 space-y-3.5 text-sm">
            <div className="flex justify-between"><span className="text-slateSoft">Employee ID</span><span className="text-ink font-mono">{EMPLOYEE.employeeId}</span></div>
            <div className="flex justify-between"><span className="text-slateSoft">Department</span><span className="text-ink">{EMPLOYEE.department}</span></div>
            <div className="flex justify-between"><span className="text-slateSoft">Manager</span><span className="text-ink">{EMPLOYEE.manager}</span></div>
            <div className="flex justify-between"><span className="text-slateSoft">Start date</span><span className="text-ink font-mono">{EMPLOYEE.startDate}</span></div>
            <div className="flex justify-between"><span className="text-slateSoft">Employer</span><span className="text-ink">{EMPLOYEE.employer}</span></div>
          </div>
        </SectionCard>

        <SectionCard title="Contact details" subtitle="Keep this current so recruiters and payroll can reach you.">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Full name" icon="user" value={form.name} onChange={update("name")} />
            <Field label="Email address" icon="mail" value={form.email} onChange={update("email")} />
            <Field label="Phone number" icon="phone" value={form.phone} onChange={update("phone")} />
            <Field label="Location" icon="pin" value={form.location} onChange={update("location")} />
            <Field label="Timezone" icon="globe" value={form.timezone} onChange={update("timezone")} />
          </div>
          <PrimaryButton onClick={() => setSaved(true)} className="mt-6" icon={saved ? "check" : "arrowRight"}>
            {saved ? "Saved" : "Save changes"}
          </PrimaryButton>
        </SectionCard>
      </div>
    </div>
  );
}
