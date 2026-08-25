import { useEffect, useState, useCallback } from "react";
import Field from "../../components/ui/Field";
import { PrimaryButton } from "../../components/ui/Buttons";
import { cx } from "../../lib/utils";

const emptySettings = { balance: "", contributionRate: "", employerMatch: "" };

export default function RetirementPanel() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [settings, setSettings] = useState(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  const load = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/portal/retirement?employeeId=${id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load retirement details.");
      setSettings({ balance: data.balance ?? "", contributionRate: data.contributionRate ?? "", employerMatch: data.employerMatch || "" });
    } catch (err) {
      setError(err.message || "Failed to load retirement details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (employeeId) load(employeeId); }, [employeeId, load]);

  const update = (k) => (e) => setSettings((s) => ({ ...s, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/portal/retirement?id=${employeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          balance: settings.balance === "" ? undefined : Number(settings.balance),
          contributionRate: settings.contributionRate === "" ? undefined : Number(settings.contributionRate),
          employerMatch: settings.employerMatch,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSettings({ balance: data.retirement.balance, contributionRate: data.retirement.contributionRate, employerMatch: data.retirement.employerMatch });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (employees.length === 0 && !loading) {
    return <div className="rounded-2xl border border-dashed border-ink/15 py-16 text-center mt-6"><p className="text-sm text-slateSoft">No approved employees yet.</p></div>;
  }

  return (
    <div className="mt-6 grid lg:grid-cols-[280px_1fr] gap-6">
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-slateSoft mb-1.5">Employee</label>
        <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full rounded-xl border border-ink/12 px-3.5 py-3 text-sm bg-white">
          {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
      </div>

      <div className="rounded-2xl bg-white border border-ink/8 shadow-card p-5">
        <h3 className="font-medium text-ink text-sm mb-4">401(k) details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Current balance" icon="card" value={settings.balance} onChange={update("balance")} placeholder="e.g. 18420.60" />
          <Field label="Contribution rate (%)" icon="trend" value={settings.contributionRate} onChange={update("contributionRate")} placeholder="e.g. 6" />
          <div className="sm:col-span-2">
            <Field label="Employer match" icon="coin" value={settings.employerMatch} onChange={update("employerMatch")} placeholder="e.g. Up to 4%, dollar-for-dollar" />
          </div>
        </div>
        <PrimaryButton icon={null} onClick={save} className={cx("mt-4 !text-xs", saving && "opacity-50 pointer-events-none")}>
          {saving ? "Saving…" : "Save"}
        </PrimaryButton>
      </div>
    </div>
  );
}
