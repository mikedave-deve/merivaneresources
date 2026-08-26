import { useEffect, useState, useCallback } from "react";
import Icon from "../../components/Icon";
import Field from "../../components/ui/Field";
import { PrimaryButton } from "../../components/ui/Buttons";
import { useToast } from "../../context/ToastContext";
import { cx } from "../../lib/utils";

const PRIORITIES = ["High", "Medium", "Low"];
const STATUSES = ["Not Started", "In Progress", "In Review", "Completed"];

const emptyForm = { title: "", instructions: "", dueDate: "", priority: "Medium" };

function MissionRow({ mission, onUpdate, busy }) {
  return (
    <div className="rounded-2xl bg-white border border-ink/8 shadow-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <h3 className="font-medium text-ink">{mission.title}</h3>
        <span className="text-xs font-mono text-slateSoft">Due {mission.dueDate || "—"}</span>
      </div>
      <p className="text-sm text-slateSoft leading-relaxed mb-4">{mission.instructions}</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-slateSoft">
          Priority
          <select
            value={mission.priority}
            disabled={busy}
            onChange={(e) => onUpdate(mission.id, { priority: e.target.value })}
            className="rounded-lg border border-ink/12 px-2 py-1 text-xs"
          >
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-slateSoft">
          Status
          <select
            value={mission.status}
            disabled={busy}
            onChange={(e) => onUpdate(mission.id, { status: e.target.value })}
            className="rounded-lg border border-ink/12 px-2 py-1 text-xs"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <span className="text-xs font-mono text-slateSoft ml-auto">{mission.progress}% complete</span>
      </div>
    </div>
  );
}

export default function MissionsPanel() {
  const { notify } = useToast();
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/admin/employees?status=approved")
      .then((res) => res.json())
      .then((data) => {
        const list = data.employees || [];
        setEmployees(list);
        if (list.length > 0) setEmployeeId(list[0].id);
        else setLoading(false);
      });
  }, []);

  const loadMissions = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/portal/missions?employeeId=${id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load missions.");
      setMissions(data.missions || []);
    } catch (err) {
      setError(err.message || "Failed to load missions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (employeeId) loadMissions(employeeId); }, [employeeId, loadMissions]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canCreate = employeeId && form.title.trim() && form.instructions.trim() && !creating;

  const createMission = async () => {
    if (!canCreate) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/portal/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, ...form }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setMissions((list) => [data.mission, ...list]);
      setForm(emptyForm);
      notify("Mission sent to employee");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setCreating(false);
    }
  };

  const updateMission = async (id, fields) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/portal/missions?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setMissions((list) => list.map((m) => (m.id === id ? data.mission : m)));
      notify("Mission updated");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  if (employees.length === 0 && !loading) {
    return <div className="rounded-2xl border border-dashed border-ink/15 py-16 text-center mt-6"><p className="text-sm text-slateSoft">No approved employees yet — approve someone first to assign missions.</p></div>;
  }

  return (
    <div className="mt-6 grid lg:grid-cols-[280px_1fr] gap-6">
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-slateSoft mb-1.5">Employee</label>
        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="w-full rounded-xl border border-ink/12 px-3.5 py-3 text-sm bg-white"
        >
          {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>

        <div className="mt-6 rounded-2xl bg-white border border-ink/8 shadow-card p-5 space-y-4">
          <h3 className="font-medium text-ink text-sm">New mission</h3>
          <Field label="Title" icon="briefcase" value={form.title} onChange={update("title")} placeholder="e.g. Draft Q4 content calendar" />
          <label className="block">
            <span className="block text-xs font-mono uppercase tracking-wider text-slateSoft mb-1.5">Instructions</span>
            <textarea value={form.instructions} onChange={update("instructions")} rows="4" placeholder="What does this employee need to do?" className="w-full rounded-xl border border-ink/12 px-3.5 py-3 text-sm focus:border-brass focus:ring-1 focus:ring-brass resize-none" />
          </label>
          <Field label="Due date" type="date" value={form.dueDate} onChange={update("dueDate")} />
          <Field label="Priority" type="select" value={form.priority} onChange={update("priority")} options={PRIORITIES} />
          <PrimaryButton icon={null} onClick={createMission} full className={cx("!text-xs", !canCreate && "opacity-50 pointer-events-none")}>
            {creating ? "Sending…" : "Send mission"}
          </PrimaryButton>
        </div>
      </div>

      <div>
        {error && <p className="text-sm text-red-600 mb-4 flex items-center gap-1.5"><Icon name="alert" size={14} />{error}</p>}
        {loading ? (
          <p className="text-sm text-slateSoft">Loading…</p>
        ) : missions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 py-16 text-center"><p className="text-sm text-slateSoft">No missions assigned to this employee yet.</p></div>
        ) : (
          <div className="space-y-3">
            {missions.map((m) => (
              <MissionRow key={m.id} mission={m} onUpdate={updateMission} busy={busyId === m.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
