import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import Icon from "../../components/Icon";
import { PrimaryButton, GhostButton } from "../../components/ui/Buttons";
import { useApp } from "../../context/AppContext";
import { cx } from "../../lib/utils";

const TABS = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];

const STATUS_STYLE = {
  pending: "bg-brass/10 text-brass",
  approved: "bg-moss/10 text-moss",
  rejected: "bg-red-50 text-red-600",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function EmployeeCard({ employee, onDecision, busy }) {
  return (
    <div className="rounded-2xl bg-white border border-ink/8 shadow-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-ink">{employee.name}</span>
          <span className={cx("text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full", STATUS_STYLE[employee.status])}>
            {employee.status}
          </span>
        </div>
        <div className="text-sm text-slateSoft mt-1 truncate">{employee.email}</div>
        <div className="text-xs text-slateSoft/80 mt-1 flex flex-wrap gap-x-4 gap-y-1">
          <span>{employee.phone || "No phone"}</span>
          <span>Registered {formatDate(employee.createdAt)}</span>
        </div>
      </div>
      {employee.status === "pending" && (
        <div className="flex gap-2 shrink-0">
          <PrimaryButton icon={null} onClick={() => onDecision(employee.id, "approve")} className={cx("!px-4 !py-2 !text-xs", busy && "opacity-50 pointer-events-none")}>
            Approve
          </PrimaryButton>
          <GhostButton icon={null} onClick={() => onDecision(employee.id, "reject")} className={cx("!px-4 !py-2 !text-xs !text-red-600 !border-red-200 hover:!bg-red-50", busy && "opacity-50 pointer-events-none")}>
            Reject
          </GhostButton>
        </div>
      )}
    </div>
  );
}

export default function AdminEmployees() {
  const navigate = useNavigate();
  const { user, isAdmin, authLoading, logout } = useApp();
  const [tab, setTab] = useState("pending");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async (status) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/employees?status=${status}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load employees.");
      setEmployees(data.employees || []);
    } catch (err) {
      setError(err.message || "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load(tab);
  }, [isAdmin, tab, load]);

  const handleDecision = async (id, action) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setEmployees((list) => list.filter((e) => e.id !== id));
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-lg mx-auto px-5 py-28 text-center">
          <div className="h-14 w-14 rounded-full bg-linen2 flex items-center justify-center mx-auto mb-6"><Icon name="lock" size={22} className="text-ink" /></div>
          <h1 className="font-display text-3xl font-semibold text-ink">Admin sign-in required</h1>
          <p className="text-slateSoft mt-3 leading-relaxed">Sign in with an admin account to review employee registrations.</p>
          <PrimaryButton onClick={() => navigate("/login")} className="mt-8">Sign In</PrimaryButton>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-lg mx-auto px-5 py-28 text-center">
          <div className="h-14 w-14 rounded-full bg-linen2 flex items-center justify-center mx-auto mb-6"><Icon name="shield" size={22} className="text-ink" /></div>
          <h1 className="font-display text-3xl font-semibold text-ink">Admins only</h1>
          <p className="text-slateSoft mt-3 leading-relaxed">Your account doesn't have admin access.</p>
          <PrimaryButton onClick={() => navigate("/portal")} className="mt-8">Go to your portal</PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linen">
      <div className="sticky top-0 z-10 bg-linen/90 backdrop-blur border-b border-ink/8">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-slateSoft hidden sm:block">{user.name}</span>
            <GhostButton icon={null} onClick={() => { logout(); navigate("/"); }} className="!px-4 !py-2 !text-xs">
              Log out
            </GhostButton>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-brass mb-2">Admin</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight">Employee approvals</h1>
        <p className="text-slateSoft mt-3 leading-relaxed max-w-xl">Review new employee registrations before they can sign in to the portal.</p>

        <div className="flex gap-2 mt-8 border-b border-ink/8">
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
          ) : employees.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink/15 py-16 text-center">
              <p className="text-sm text-slateSoft">No {tab === "all" ? "" : tab} employees to show.</p>
            </div>
          ) : (
            employees.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} onDecision={handleDecision} busy={busyId === employee.id} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
