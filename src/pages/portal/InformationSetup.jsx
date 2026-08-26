import { useEffect, useState } from "react";
import Field from "../../components/ui/Field";
import Icon from "../../components/Icon";
import Badge from "../../components/ui/Badge";
import { PrimaryButton } from "../../components/ui/Buttons";
import { PageHeader, SectionCard, ProgressBar } from "../../components/portal/PortalPrimitives";

const emptyForm = {
  fullName: "", phone: "", email: "", mailingAddress: "",
  accountHolderName: "", bankName: "", accountNumber: "", routingNumber: "",
};

export default function InformationSetup() {
  const [form, setForm] = useState(emptyForm);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/portal/information-setup")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setComplete(!!data.complete);
        if (data.data) {
          setForm((f) => ({
            ...f,
            fullName: data.data.fullName || "",
            phone: data.data.phone || "",
            email: data.data.email || "",
            mailingAddress: data.data.mailingAddress || "",
            accountHolderName: data.data.accountHolderName || "",
            bankName: data.data.bankName || "",
          }));
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const filledCount = Object.values(form).filter((v) => v.trim()).length;
  const pct = Math.round((filledCount / Object.keys(form).length) * 100);
  const canSubmit = Object.values(form).every((v) => v.trim()) && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/portal/information-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setComplete(true);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div>
      <PageHeader eyebrow="My info" title="Information Setup" subtitle="Complete these steps so payroll, tax, and compliance teams have what they need." />

      <SectionCard
        title="Setup progress"
        action={complete ? <Badge tone="moss">Complete</Badge> : <span className="font-mono text-sm text-ink">{filledCount}/{Object.keys(form).length} fields</span>}
        className="mb-6"
      >
        <ProgressBar pct={pct} tone="moss" />
      </SectionCard>

      {submitted && (
        <div className="mb-6 rounded-xl bg-moss/10 border border-moss/25 p-4 flex items-center gap-2 text-moss text-sm font-medium">
          <Icon name="check" size={16} />Submitted — the company has been notified.
        </div>
      )}

      <SectionCard title="Personal information" className="mb-6">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Full name" icon="user" value={form.fullName} onChange={update("fullName")} placeholder="Jordan Blake" />
          <Field label="Phone number" icon="phone" value={form.phone} onChange={update("phone")} placeholder="+1 (000) 000 0000" />
          <Field label="Email" icon="mail" value={form.email} onChange={update("email")} placeholder="you@email.com" />
          <Field label="Mailing address" icon="pin" value={form.mailingAddress} onChange={update("mailingAddress")} placeholder="Street, City, Country" />
        </div>
      </SectionCard>

      <SectionCard title="Payment information" subtitle="Account number and routing number are masked as you type.">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Account holder name" icon="user" value={form.accountHolderName} onChange={update("accountHolderName")} placeholder="As shown on the account" autoComplete="off" />
          <Field label="Bank name" icon="building" value={form.bankName} onChange={update("bankName")} placeholder="e.g. Chase" autoComplete="off" />
          <Field label="Account number" icon="lock" type="password" value={form.accountNumber} onChange={update("accountNumber")} placeholder="Account number" autoComplete="new-password" />
          <Field label="Routing number" icon="lock" type="password" value={form.routingNumber} onChange={update("routingNumber")} placeholder="Routing number" autoComplete="new-password" />
        </div>
        {error && <p className="text-sm text-red-600 mt-4 flex items-center gap-1.5"><Icon name="alert" size={14} />{error}</p>}
        <PrimaryButton onClick={submit} className={`mt-6 ${!canSubmit ? "opacity-50 pointer-events-none" : ""}`}>
          {submitting ? "Submitting…" : "Submit"}
        </PrimaryButton>
      </SectionCard>
    </div>
  );
}
