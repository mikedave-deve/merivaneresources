import { useEffect, useState, useCallback } from "react";
import Icon from "../../components/Icon";
import Field from "../../components/ui/Field";
import { PrimaryButton, GhostButton } from "../../components/ui/Buttons";
import { useToast } from "../../context/ToastContext";
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

function EmployeeCard({ employee, onDecision, onSaveProfile, busy }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(employee.title || "");
  const [department, setDepartment] = useState(employee.department || "");

  const save = async () => {
    await onSaveProfile(employee.id, { title, department });
    setEditing(false);
  };

  return (
    <div className="rounded-2xl bg-white border border-ink/8 shadow-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
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
            {employee.status === "approved" && (
              <span>{[employee.title, employee.department].filter(Boolean).join(" · ") || "No title set"}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {employee.status === "pending" && (
            <>
              <PrimaryButton icon={null} onClick={() => onDecision(employee.id, "approve")} className={cx("!px-4 !py-2 !text-xs", busy && "opacity-50 pointer-events-none")}>
                Approve
              </PrimaryButton>
              <GhostButton icon={null} onClick={() => onDecision(employee.id, "reject")} className={cx("!px-4 !py-2 !text-xs !text-red-600 !border-red-200 hover:!bg-red-50", busy && "opacity-50 pointer-events-none")}>
                Reject
              </GhostButton>
            </>
          )}
          {employee.status === "approved" && (
            <GhostButton icon={null} onClick={() => setEditing((e) => !e)} className="!px-4 !py-2 !text-xs">
              {editing ? "Cancel" : "Edit title"}
            </GhostButton>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-4 pt-4 border-t border-ink/8 grid sm:grid-cols-2 gap-4">
          <Field label="Job title" icon="briefcase" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Content Strategist" />
          <Field label="Department" icon="grid" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Content & Writing" />
          <div className="sm:col-span-2">
            <PrimaryButton icon={null} onClick={save} className={cx("!px-4 !py-2 !text-xs", busy && "opacity-50 pointer-events-none")}>
              Save
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmployeesPanel() {
  const { notify } = useToast();
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

  useEffect(() => { load(tab); }, [tab, load]);

  const handleDecision = async (id, action) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/employees?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setEmployees((list) => list.filter((e) => e.id !== id));
      notify(action === "approve" ? "Employee approved" : "Employee rejected", action === "approve" ? "success" : "info");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  const handleSaveProfile = async (id, fields) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/employees?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-profile", ...fields }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setEmployees((list) => list.map((e) => (e.id === id ? data.employee : e)));
      notify("Employee title updated");
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
        ) : employees.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 py-16 text-center">
            <p className="text-sm text-slateSoft">No {tab === "all" ? "" : tab} employees to show.</p>
          </div>
        ) : (
          employees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} onDecision={handleDecision} onSaveProfile={handleSaveProfile} busy={busyId === employee.id} />
          ))
        )}
      </div>
    </div>
  );
}
