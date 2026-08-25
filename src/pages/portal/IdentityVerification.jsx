import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import Icon from "../../components/Icon";
import Field from "../../components/ui/Field";
import Badge from "../../components/ui/Badge";
import { PrimaryButton, GhostButton } from "../../components/ui/Buttons";
import { PageHeader, SectionCard, TimelineItem } from "../../components/portal/PortalPrimitives";
import { cx } from "../../lib/utils";

const STATUS_TONE = { Verified: "moss", Unverified: "brass" };

function fmtDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function IdentityVerification() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flowOpen, setFlowOpen] = useState(false);
  const [selfie1, setSelfie1] = useState(null);
  const [selfie2, setSelfie2] = useState(null);
  const [number, setNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const load = () => fetch("/api/portal/identity").then((res) => res.json());

  useEffect(() => {
    let cancelled = false;
    load().then((d) => { if (!cancelled) { setData(d); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const resetFlow = () => {
    setFlowOpen(false);
    setSelfie1(null);
    setSelfie2(null);
    setNumber("");
    setError("");
  };

  const submit = async () => {
    if (!selfie1 || !selfie2 || !number.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const [blob1, blob2] = await Promise.all([
        upload(selfie1.name, selfie1, { access: "public", handleUploadUrl: "/api/resume-upload" }),
        upload(selfie2.name, selfie2, { access: "public", handleUploadUrl: "/api/resume-upload" }),
      ]);
      const res = await fetch("/api/portal/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selfie1Url: blob1.url, selfie2Url: blob2.url, number }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Something went wrong.");
      setSuccess(true);
      resetFlow();
      const fresh = await load();
      setData(fresh);
    } catch (err) {
      setError(err.message || "Something went wrong submitting your verification.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data) return null;

  return (
    <div>
      <PageHeader eyebrow="My info" title="Identity Verification" subtitle="Required for compliance across the 38 countries Merivane operates in." />

      {success && (
        <div className="mb-6 rounded-xl bg-moss/10 border border-moss/25 p-4 flex items-center gap-2 text-moss text-sm font-medium">
          <Icon name="check" size={16} />Verification submitted — the company has been notified and will review it shortly.
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
        <SectionCard>
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-moss/10 flex items-center justify-center mb-4"><Icon name="shield" size={26} className="text-moss" /></div>
            <Badge tone={STATUS_TONE[data.status] || "linen"}>{data.status}</Badge>
            <div className="text-sm text-slateSoft mt-4 space-y-1.5 w-full text-left">
              <div className="flex justify-between"><span>Method</span><span className="text-ink text-right">{data.method}</span></div>
              <div className="flex justify-between"><span>Document type</span><span className="text-ink">{data.documentType}</span></div>
              <div className="flex justify-between"><span>Verified on</span><span className="text-ink font-mono">{fmtDate(data.verifiedOn)}</span></div>
            </div>
            {data.hasPendingSubmission && data.status !== "Verified" && (
              <p className="text-xs text-brass mt-4">Your submission is awaiting review.</p>
            )}

            {!flowOpen ? (
              <GhostButton onClick={() => setFlowOpen(true)} className="mt-6 w-full">Verify Identity</GhostButton>
            ) : (
              <div className="w-full mt-6 text-left space-y-4">
                <div>
                  <span className="block text-xs font-mono uppercase tracking-wider text-slateSoft mb-1.5">1 · Front selfie</span>
                  <label className={cx("flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 text-sm cursor-pointer transition-colors", selfie1 ? "border-moss/40 bg-mossLight/20 text-ink" : "border-ink/15 hover:border-brass text-slateSoft")}>
                    <Icon name={selfie1 ? "check" : "upload"} size={16} className={selfie1 ? "text-moss" : ""} />
                    {selfie1 ? selfie1.name : "Upload a selfie"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setSelfie1(e.target.files?.[0] || null)} />
                  </label>
                </div>

                {selfie1 && (
                  <div>
                    <span className="block text-xs font-mono uppercase tracking-wider text-slateSoft mb-1.5">2 · Second selfie</span>
                    <label className={cx("flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 text-sm cursor-pointer transition-colors", selfie2 ? "border-moss/40 bg-mossLight/20 text-ink" : "border-ink/15 hover:border-brass text-slateSoft")}>
                      <Icon name={selfie2 ? "check" : "upload"} size={16} className={selfie2 ? "text-moss" : ""} />
                      {selfie2 ? selfie2.name : "Upload a second selfie"}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => setSelfie2(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                )}

                {selfie1 && selfie2 && (
                  <Field label="Number" icon="lock" type="password" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="ID number" />
                )}

                {error && <p className="text-xs text-red-600 flex items-center gap-1.5"><Icon name="alert" size={12} />{error}</p>}

                <div className="flex gap-2">
                  <PrimaryButton
                    onClick={submit}
                    icon={null}
                    className={cx("flex-1 !text-xs", (!selfie1 || !selfie2 || !number.trim() || submitting) && "opacity-50 pointer-events-none")}
                  >
                    {submitting ? "Verifying…" : "Verify"}
                  </PrimaryButton>
                  <GhostButton onClick={resetFlow} icon={null} className="!text-xs">Cancel</GhostButton>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Verification history">
          {data.history.length === 0 ? (
            <p className="text-sm text-slateSoft py-4">No verification activity yet.</p>
          ) : (
            data.history.map((h, i) => (
              <TimelineItem key={i} icon="check" label={h.label} time={h.time} last={i === data.history.length - 1} />
            ))
          )}
        </SectionCard>
      </div>

      <div className="mt-6 rounded-2xl bg-linen2/60 border border-ink/8 p-5 flex items-start gap-3">
        <Icon name="shield" size={18} className="text-moss shrink-0 mt-0.5" />
        <p className="text-xs text-slateSoft leading-relaxed">
          Your selfies are used only to confirm your identity for compliance purposes and are never shared outside Merivane's
          verification review. You can upload any image type.
        </p>
      </div>
    </div>
  );
}
