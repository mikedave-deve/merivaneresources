import { useEffect, useState, useCallback } from "react";
import Icon from "../../components/Icon";
import { PrimaryButton, GhostButton } from "../../components/ui/Buttons";
import { cx } from "../../lib/utils";

const TABS = [
  { id: "all", label: "All" },
  { id: "unverified", label: "Unverified" },
  { id: "verified", label: "Verified" },
];

function fmtDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function IdentityPanel() {
  const [tab, setTab] = useState("unverified");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async (status) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/portal/identity?status=${status}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load submissions.");
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err.message || "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  const decide = async (employeeId, action) => {
    setBusyId(employeeId);
    try {
      const res = await fetch(`/api/admin/portal/identity?id=${employeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      await load(tab);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex gap-2 border-b border-ink/8">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cx(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.id ? "border-brass text-ink" : "border-transparent text-slateSoft hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 mt-6 flex items-center gap-1.5"><Icon name="alert" size={14} />{error}</p>}

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-sm text-slateSoft">Loading…</p>
        ) : submissions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 py-16 text-center"><p className="text-sm text-slateSoft">No submissions to show.</p></div>
        ) : (
          submissions.map((s) => (
            <div key={s.employeeId} className="rounded-2xl bg-white border border-ink/8 shadow-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <div className="font-medium text-ink">{s.employeeName}</div>
                  <div className="text-sm text-slateSoft">{s.employeeEmail}</div>
                </div>
                <span className={cx("text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full", s.status === "Verified" ? "bg-moss/10 text-moss" : "bg-brass/10 text-brass")}>
                  {s.status}
                </span>
              </div>
              {s.submission && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-slateSoft mb-4">
                  <a href={s.submission.selfie1Url} target="_blank" rel="noreferrer" className="text-brass hover:underline">Selfie 1</a>
                  <a href={s.submission.selfie2Url} target="_blank" rel="noreferrer" className="text-brass hover:underline">Selfie 2</a>
                  <span>ID ending •••• {s.submission.numberLast4}</span>
                  <span>Submitted {fmtDate(s.submission.submittedAt)}</span>
                </div>
              )}
              {s.status === "Verified" && <div className="text-xs text-slateSoft mb-4">Verified on {fmtDate(s.verifiedOn)}</div>}
              <div className="flex gap-2">
                {s.status !== "Verified" ? (
                  <PrimaryButton icon={null} onClick={() => decide(s.employeeId, "verify")} className={cx("!px-4 !py-2 !text-xs", busyId === s.employeeId && "opacity-50 pointer-events-none")}>Mark verified</PrimaryButton>
                ) : (
                  <GhostButton icon={null} onClick={() => decide(s.employeeId, "unverify")} className={cx("!px-4 !py-2 !text-xs", busyId === s.employeeId && "opacity-50 pointer-events-none")}>Mark unverified</GhostButton>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
