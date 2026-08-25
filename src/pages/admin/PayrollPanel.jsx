import { useEffect, useState, useCallback } from "react";
import Field from "../../components/ui/Field";
import { PrimaryButton } from "../../components/ui/Buttons";
import { cx } from "../../lib/utils";

const emptySettings = { balance: "", nextPaymentAmount: "", nextPaymentDate: "", schedule: "Monthly" };
const emptySlip = { period: "", amount: "", status: "Paid" };

export default function PayrollPanel() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(emptySettings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [slip, setSlip] = useState(emptySlip);
  const [addingSlip, setAddingSlip] = useState(false);
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
      const res = await fetch(`/api/admin/portal/payroll?employeeId=${id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load payroll.");
      setPayroll(data);
      setSettings({
        balance: data.payroll.balance ?? "",
        nextPaymentAmount: data.payroll.nextPaymentAmount ?? "",
        nextPaymentDate: data.payroll.nextPaymentDate || "",
        schedule: data.payroll.schedule || "Monthly",
      });
    } catch (err) {
      setError(err.message || "Failed to load payroll.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (employeeId) load(employeeId); }, [employeeId, load]);

  const updateSettings = (k) => (e) => setSettings((s) => ({ ...s, [k]: e.target.value }));

  const saveSettings = async () => {
    setSavingSettings(true);
    setError("");
    try {
      const body = {};
      if (settings.balance !== "") body.balance = Number(settings.balance);
      if (settings.nextPaymentAmount !== "") body.nextPaymentAmount = Number(settings.nextPaymentAmount);
      if (settings.nextPaymentDate !== "") body.nextPaymentDate = settings.nextPaymentDate;
      if (settings.schedule !== "") body.schedule = settings.schedule;

      const res = await fetch(`/api/admin/portal/payroll?id=${employeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      await load(employeeId);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSavingSettings(false);
    }
  };

  const updateSlip = (k) => (e) => setSlip((s) => ({ ...s, [k]: e.target.value }));
  const canAddSlip = slip.period.trim() && slip.amount.trim() && !addingSlip;

  const addSlip = async () => {
    if (!canAddSlip) return;
    setAddingSlip(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/portal/payroll?id=${employeeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slip),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSlip(emptySlip);
      await load(employeeId);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setAddingSlip(false);
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

      <div className="space-y-6">
        <div className="rounded-2xl bg-white border border-ink/8 shadow-card p-5">
          <h3 className="font-medium text-ink text-sm mb-4">Balance & schedule</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Payroll balance" icon="card" value={settings.balance} onChange={updateSettings("balance")} placeholder="e.g. 5240" />
            <Field label="Next payment amount" icon="card" value={settings.nextPaymentAmount} onChange={updateSettings("nextPaymentAmount")} placeholder="e.g. 5240" />
            <Field label="Next payment date" type="date" value={settings.nextPaymentDate} onChange={updateSettings("nextPaymentDate")} />
            <Field label="Pay schedule" icon="calendar" value={settings.schedule} onChange={updateSettings("schedule")} placeholder="e.g. Monthly" />
          </div>
          <PrimaryButton icon={null} onClick={saveSettings} className={cx("mt-4 !text-xs", savingSettings && "opacity-50 pointer-events-none")}>
            {savingSettings ? "Saving…" : "Save"}
          </PrimaryButton>
        </div>

        <div className="rounded-2xl bg-white border border-ink/8 shadow-card p-5">
          <h3 className="font-medium text-ink text-sm mb-4">Add payslip</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Period" icon="calendar" value={slip.period} onChange={updateSlip("period")} placeholder="e.g. August 2026" />
            <Field label="Amount" icon="card" value={slip.amount} onChange={updateSlip("amount")} placeholder="e.g. $5,240.00" />
            <Field label="Status" type="select" value={slip.status} onChange={updateSlip("status")} options={["Paid", "Processing"]} />
          </div>
          <PrimaryButton icon={null} onClick={addSlip} className={cx("mt-4 !text-xs", !canAddSlip && "opacity-50 pointer-events-none")}>
            {addingSlip ? "Adding…" : "Add payslip"}
          </PrimaryButton>
        </div>

        {payroll && payroll.history.length > 0 && (
          <div className="rounded-2xl bg-white border border-ink/8 shadow-card p-5">
            <h3 className="font-medium text-ink text-sm mb-4">Payment history</h3>
            <div className="divide-y divide-ink/6">
              {payroll.history.map((h) => (
                <div key={h.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-ink">{h.period}</span>
                  <span className="font-mono text-slateSoft">{h.amount}</span>
                  <span className="text-xs text-slateSoft">{h.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
