import { useEffect, useState, useCallback } from "react";
import Icon from "../../components/Icon";
import { PrimaryButton, GhostButton } from "../../components/ui/Buttons";
import { useToast } from "../../context/ToastContext";
import { cx } from "../../lib/utils";

const TABS = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "denied", label: "Denied" },
  { id: "all", label: "All" },
];

const STATUS_STYLE = {
  Pending: "bg-brass/10 text-brass",
  Approved: "bg-moss/10 text-moss",
  Denied: "bg-red-50 text-red-600",
};

function RequestCard({ request, onDecision, busy }) {
  return (
    <div className="rounded-2xl bg-white border border-ink/8 shadow-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-ink">{request.employeeName}</span>
          <span className={cx("text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full", STATUS_STYLE[request.status])}>
            {request.status}
          </span>
        </div>
        <div className="text-sm text-slateSoft mt-1">{request.type} · {request.days} day{request.days > 1 ? "s" : ""} · {request.from} – {request.to}</div>
        {request.reason && <div className="text-xs text-slateSoft/80 mt-1 truncate">{request.reason}</div>}
      </div>
      {request.status === "Pending" && (
        <div className="flex gap-2 shrink-0">
          <PrimaryButton icon={null} onClick={() => onDecision(request.id, "approve")} className={cx("!px-4 !py-2 !text-xs", busy && "opacity-50 pointer-events-none")}>
            Approve
          </PrimaryButton>
          <GhostButton icon={null} onClick={() => onDecision(request.id, "deny")} className={cx("!px-4 !py-2 !text-xs !text-red-600 !border-red-200 hover:!bg-red-50", busy && "opacity-50 pointer-events-none")}>
            Deny
          </GhostButton>
        </div>
      )}
    </div>
  );
}

export default function TimeOffPanel() {
  const { notify } = useToast();
  const [tab, setTab] = useState("pending");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async (status) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/portal/timeoff?status=${status}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load time off requests.");
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message || "Failed to load time off requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  const handleDecision = async (id, action) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/portal/timeoff?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setRequests((list) => list.filter((r) => r.id !== id));
      notify(action === "approve" ? "Time off approved" : "Time off denied", action === "approve" ? "success" : "info");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
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
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 py-16 text-center">
            <p className="text-sm text-slateSoft">No {tab === "all" ? "" : tab} requests to show.</p>
          </div>
        ) : (
          requests.map((request) => (
            <RequestCard key={request.id} request={request} onDecision={handleDecision} busy={busyId === request.id} />
          ))
        )}
      </div>
    </div>
  );
}
