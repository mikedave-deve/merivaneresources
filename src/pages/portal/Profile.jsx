import { useState } from "react";
import Field from "../../components/ui/Field";
import Icon from "../../components/Icon";
import Badge from "../../components/ui/Badge";
import { PrimaryButton } from "../../components/ui/Buttons";
import { PageHeader, SectionCard } from "../../components/portal/PortalPrimitives";
import { useApp } from "../../context/AppContext";

function initials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function Profile() {
  const { user, refreshUser } = useApp();
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    location: user.location,
    timezone: user.timezone,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const update = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setSaved(false); };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      await refreshUser();
      setSaved(true);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="My info" title="Profile" subtitle="Your identity, role, and contact details on file with Merivane." />

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
        <SectionCard>
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-ink text-linen flex items-center justify-center text-2xl font-semibold font-mono border-4 border-linen2">
              {initials(user.name)}
            </div>
            <div className="font-display font-semibold text-ink text-lg mt-4">{user.name}</div>
            <div className="text-sm text-slateSoft mt-0.5">{user.title || "Title not set yet"}</div>
            <Badge tone="moss" className="mt-3">{user.status === "approved" ? "Active" : user.status}</Badge>
          </div>
          <div className="border-t border-ink/8 mt-6 pt-5 space-y-3.5 text-sm">
            <div className="flex justify-between"><span className="text-slateSoft">Department</span><span className="text-ink">{user.department || "—"}</span></div>
            <div className="flex justify-between"><span className="text-slateSoft">Employer</span><span className="text-ink">Merivane Resources</span></div>
          </div>
        </SectionCard>

        <SectionCard title="Contact details" subtitle="Keep this current so recruiters and admins can reach you.">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Full name" icon="user" value={form.name} onChange={update("name")} />
            <Field label="Email address" icon="mail" value={form.email} onChange={update("email")} />
            <Field label="Phone number" icon="phone" value={form.phone} onChange={update("phone")} />
            <Field label="Location" icon="pin" value={form.location} onChange={update("location")} placeholder="City, Country" />
            <Field label="Timezone" icon="globe" value={form.timezone} onChange={update("timezone")} placeholder="e.g. Central Time (UTC-5)" />
          </div>
          {error && <p className="text-sm text-red-600 mt-4 flex items-center gap-1.5"><Icon name="alert" size={14} />{error}</p>}
          <PrimaryButton onClick={save} className="mt-6" icon={saved ? "check" : "arrowRight"}>
            {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
          </PrimaryButton>
        </SectionCard>
      </div>
    </div>
  );
}
