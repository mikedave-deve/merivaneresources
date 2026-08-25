import { useState } from "react";
import Icon from "../../components/Icon";
import Field from "../../components/ui/Field";
import { PrimaryButton, GhostButton } from "../../components/ui/Buttons";
import { PageHeader, SectionCard } from "../../components/portal/PortalPrimitives";
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

export default function Settings() {
  const [prefs, setPrefs] = useState({ email: true, sms: false, digest: true });
  const [saved, setSaved] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div>
      <PageHeader eyebrow="Account" title="Settings & Support" subtitle="Manage your account preferences and get help when you need it." />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <SectionCard title="Password">
            <div className="space-y-4">
              <Field label="Current password" icon="lock" type="password" value="" onChange={() => {}} placeholder="••••••••" />
              <Field label="New password" icon="lock" type="password" value="" onChange={() => {}} placeholder="Create a new password" />
            </div>
            <PrimaryButton className="mt-6" icon={saved ? "check" : "arrowRight"} onClick={() => setSaved(true)}>{saved ? "Updated" : "Update password"}</PrimaryButton>
          </SectionCard>

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
          <SectionCard title="Contact support">
            <p className="text-sm text-slateSoft leading-relaxed mb-5">Can't find what you need? The Merivane support team responds within one business day.</p>
            <div className="space-y-3">
              <GhostButton full icon="mail">Email support@merivaneresources.com</GhostButton>
              <GhostButton full icon="message">Start a live chat</GhostButton>
            </div>
          </SectionCard>

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
