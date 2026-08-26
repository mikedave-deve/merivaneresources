import { useState } from "react";
import Icon from "../../components/Icon";
import Field from "../../components/ui/Field";
import { PrimaryButton, GhostButton } from "../../components/ui/Buttons";
import { PageHeader, SectionCard } from "../../components/portal/PortalPrimitives";
import { useApp } from "../../context/AppContext";
import { cx } from "../../lib/utils";

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cx("h-6 w-11 rounded-full transition-colors relative shrink-0", checked ? "bg-moss" : "bg-linen2")}
    >
      <span className={cx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );
}

const FAQS = [
  { q: "How do I update my direct deposit information?", a: "Head to Information Setup and update your banking details — changes take effect on the next pay cycle." },
  { q: "Who do I contact about a missing payment?", a: "Reach out to payroll@merivaneresources.com with your employee ID and the pay period in question." },
  { q: "How long does identity re-verification take?", a: "Most re-verifications are reviewed within one business day." },
];

function PasswordCard() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const update = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setSaved(false); };
  const passwordsMatch = !form.confirmPassword || form.newPassword === form.confirmPassword;
  const canSubmit = form.currentPassword && form.newPassword.length >= 8 && form.newPassword === form.confirmPassword && !saving;

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change-password", currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSaved(true);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Password">
      <div className="space-y-4">
        <Field label="Current password" icon="lock" type="password" value={form.currentPassword} onChange={update("currentPassword")} placeholder="••••••••" />
        <Field label="New password" icon="lock" type="password" value={form.newPassword} onChange={update("newPassword")} placeholder="At least 8 characters" />
        <div>
          <Field label="Confirm new password" icon="lock" type="password" value={form.confirmPassword} onChange={update("confirmPassword")} placeholder="Re-enter your new password" onKeyDown={(e) => e.key === "Enter" && submit()} />
          {!passwordsMatch && <p className="text-xs text-red-500 mt-1.5">Passwords don't match.</p>}
        </div>
      </div>
      {error && <p className="text-sm text-red-600 mt-4 flex items-center gap-1.5"><Icon name="alert" size={14} />{error}</p>}
      <PrimaryButton className={cx("mt-6", !canSubmit && !saved && "opacity-50 pointer-events-none")} icon={saved ? "check" : "arrowRight"} onClick={submit}>
        {saving ? "Updating…" : saved ? "Updated" : "Update password"}
      </PrimaryButton>
    </SectionCard>
  );
}

function SupportCard() {
  const { user } = useApp();
  const [email, setEmail] = useState(user.email);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = email.includes("@") && message.trim() && !sending;

  const submit = async () => {
    if (!canSubmit) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/portal/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setMessage("");
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  return (
    <SectionCard title="Contact support">
      <p className="text-sm text-slateSoft leading-relaxed mb-5">Can't find what you need? The Merivane support team responds within one business day.</p>
      <GhostButton full icon="mail" className="mb-5">Email support@merivaneresources.com</GhostButton>

      {sent ? (
        <div className="rounded-xl bg-moss/10 border border-moss/25 p-4 flex items-center gap-2 text-moss text-sm font-medium">
          <Icon name="check" size={16} />Message sent — we'll reply to {email}.
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="Your email" icon="mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          <label className="block">
            <span className="block text-xs font-mono uppercase tracking-wider text-slateSoft mb-1.5">Message</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows="4" placeholder="What do you need help with?" className="w-full rounded-xl border border-ink/12 px-3.5 py-3 text-sm focus:border-brass focus:ring-1 focus:ring-brass resize-none" />
          </label>
          {error && <p className="text-sm text-red-600 flex items-center gap-1.5"><Icon name="alert" size={14} />{error}</p>}
          <PrimaryButton full onClick={submit} className={!canSubmit ? "opacity-50 pointer-events-none" : ""}>
            {sending ? "Sending…" : "Send message"}
          </PrimaryButton>
        </div>
      )}
    </SectionCard>
  );
}

export default function Settings() {
  const [prefs, setPrefs] = useState({ email: true, sms: false, digest: true });
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div>
      <PageHeader eyebrow="Account" title="Settings & Support" subtitle="Manage your account preferences and get help when you need it." />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <PasswordCard />

          <SectionCard title="Notification preferences">
            <div className="divide-y divide-ink/6">
              <div className="flex items-center justify-between py-3.5">
                <div><div className="text-sm text-ink">Email notifications</div><div className="text-xs text-slateSoft mt-0.5">Payroll, missions, and account activity</div></div>
                <Toggle checked={prefs.email} onChange={(v) => setPrefs((p) => ({ ...p, email: v }))} />
              </div>
              <div className="flex items-center justify-between py-3.5">
                <div><div className="text-sm text-ink">SMS alerts</div><div className="text-xs text-slateSoft mt-0.5">Time-sensitive updates only</div></div>
                <Toggle checked={prefs.sms} onChange={(v) => setPrefs((p) => ({ ...p, sms: v }))} />
              </div>
              <div className="flex items-center justify-between py-3.5">
                <div><div className="text-sm text-ink">Weekly digest</div><div className="text-xs text-slateSoft mt-0.5">A Friday summary of your week</div></div>
                <Toggle checked={prefs.digest} onChange={(v) => setPrefs((p) => ({ ...p, digest: v }))} />
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SupportCard />

          <SectionCard title="Frequently asked questions">
            <div className="divide-y divide-ink/6">
              {FAQS.map((f, i) => (
                <div key={i}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between gap-3 py-3.5 text-left">
                    <span className="text-sm font-medium text-ink">{f.q}</span>
                    <Icon name="chevronDown" size={15} className={cx("text-slateSoft transition-transform shrink-0", openFaq === i && "rotate-180")} />
                  </button>
                  {openFaq === i && <p className="text-sm text-slateSoft leading-relaxed pb-3.5">{f.a}</p>}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
