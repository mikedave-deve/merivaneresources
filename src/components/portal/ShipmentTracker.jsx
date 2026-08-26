import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "../Icon";
import Field from "../ui/Field";
import { PrimaryButton } from "../ui/Buttons";
import { cx } from "../../lib/utils";

const STEPS = ["Label Created", "On the Way", "Out for Delivery", "Delivered"];
const STEP_ICON = { "Label Created": "file", "On the Way": "truck", "Out for Delivery": "package", Delivered: "packageCheck" };

function fmtDateTime(value) {
  return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function addressLines(a) {
  if (!a) return [];
  return [a.name, a.line1, a.cityStateZip, a.country].filter(Boolean);
}

export default function ShipmentTracker() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const track = async () => {
    if (!trackingNumber.trim() || loading) return;
    setLoading(true);
    setError("");
    setShowHistory(false);
    try {
      const res = await fetch(`/api/portal/track?trackingNumber=${encodeURIComponent(trackingNumber.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = result ? STEPS.indexOf(result.step) : -1;
  const isIssue = result?.health === "red";
  const lineTone = isIssue ? "#DC2626" : "#3F7A56";

  return (
    <div className="rounded-2xl bg-white border border-ink/8 shadow-card overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="text-xs font-mono uppercase tracking-wider text-slateSoft mb-3">Track a shipment</div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Field
              icon="package"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter your tracking number"
              onKeyDown={(e) => e.key === "Enter" && track()}
            />
          </div>
          <PrimaryButton icon={null} onClick={track} className={cx("shrink-0", loading && "opacity-60 pointer-events-none")}>
            {loading ? "Tracking…" : "Track"}
          </PrimaryButton>
        </div>
        {error && <p className="text-xs text-red-600 mt-2.5 flex items-center gap-1.5"><Icon name="alert" size={12} />{error}</p>}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden">
            <div className="relative h-24 sm:h-28 bg-gradient-to-br from-ink via-ink2 to-ink3 overflow-hidden">
              <div className="absolute inset-0 grain-bg opacity-30" />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-15">
                <Icon name="package" size={88} className="text-linen" />
              </div>
              <div className="absolute inset-0 flex items-center px-6 sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                    <Icon name={STEP_ICON[result.step]} size={19} className="text-brassLight" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-linen2/60">Your shipment</div>
                    <div className="font-mono text-lg sm:text-xl font-semibold text-linen">{result.trackingNumber}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-6 sm:px-8 py-5 border-b border-ink/8">
              <span className="text-sm text-slateSoft">Estimated delivery</span>
              <span className={cx("font-display text-lg font-semibold", isIssue ? "text-red-600" : "text-moss")}>
                {result.estimatedDelivery || "Not yet scheduled"}
              </span>
            </div>

            {isIssue && result.issueReason && (
              <div className="mx-6 sm:mx-8 mt-5 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-2.5">
                <Icon name="alert" size={16} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-red-700">There's an issue with this shipment</div>
                  <p className="text-sm text-red-600 mt-0.5">{result.issueReason}</p>
                </div>
              </div>
            )}

            <div className="px-6 sm:px-8 py-8">
              <div className="flex items-start">
                {STEPS.map((step, i) => {
                  const done = i < stepIndex || (i === stepIndex && result.step === "Delivered");
                  const current = i === stepIndex && result.step !== "Delivered";
                  const filled = i <= stepIndex;
                  return (
                    <div key={step} className={cx("flex items-center", i < STEPS.length - 1 && "flex-1")}>
                      <div className="flex flex-col items-center gap-2.5 shrink-0">
                        <div
                          className={cx(
                            "h-9 w-9 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors",
                            done && "border-transparent text-white",
                            current && "bg-white",
                            !done && !current && "border-ink/15 text-slateSoft/50"
                          )}
                          style={done ? { background: lineTone } : current ? { borderColor: lineTone, color: lineTone } : undefined}
                        >
                          <Icon name={done ? "check" : current ? "arrowRight" : STEP_ICON[step]} size={15} />
                        </div>
                        <span className={cx("text-[11px] sm:text-xs font-medium text-center whitespace-nowrap", filled ? "text-ink" : "text-slateSoft/60")}>{step}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className="flex-1 h-[2px] mx-1.5 sm:mx-2 -mt-6 rounded-full bg-ink/10 overflow-hidden relative">
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: i < stepIndex ? "100%" : "0%" }}
                            transition={{ duration: 0.6, delay: 0.15 * i }}
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{ background: lineTone }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 px-6 sm:px-8 pb-8 border-b border-ink/8">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-slateSoft mb-2">Ship from</div>
                <div className="text-sm text-inkText/85 leading-relaxed">
                  {addressLines(result.shipFrom).map((l, i) => <div key={i}>{l}</div>)}
                </div>
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-slateSoft mb-2">Ship to</div>
                <div className="text-sm text-inkText/85 leading-relaxed">
                  {addressLines(result.shipTo).map((l, i) => <div key={i}>{l}</div>)}
                </div>
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-slateSoft mb-2">Service</div>
                <div className="text-sm text-inkText/85">{result.service}</div>
                {result.weight && <div className="text-xs text-slateSoft mt-1">{result.weight}</div>}
              </div>
            </div>

            <div className="px-6 sm:px-8 py-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-ink">Shipment details</h3>
                <button onClick={() => setShowHistory((s) => !s)} className="text-xs font-mono text-brass hover:underline">
                  {showHistory ? "Hide progress" : "View progress"}
                </button>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mt-4 text-sm">
                <div>
                  <div className="text-xs text-slateSoft">Reference number</div>
                  <div className="text-ink mt-0.5">{result.referenceNumber || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-slateSoft">Estimated delivery</div>
                  <div className="text-ink mt-0.5">{result.estimatedDelivery || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-slateSoft">Last updated</div>
                  <div className="text-ink mt-0.5">{fmtDateTime(result.updatedAt)}</div>
                </div>
              </div>

              <AnimatePresence>
                {showHistory && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="mt-5 pt-5 border-t border-ink/8 space-y-3.5">
                      {[...result.history].reverse().map((h, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={cx("h-2 w-2 rounded-full mt-1.5 shrink-0", h.health === "red" ? "bg-red-500" : "bg-moss")} />
                          <div>
                            <div className="text-sm text-inkText/85">{h.step}{h.reason ? ` — ${h.reason}` : ""}</div>
                            <div className="text-xs text-slateSoft font-mono mt-0.5">{fmtDateTime(h.time)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
