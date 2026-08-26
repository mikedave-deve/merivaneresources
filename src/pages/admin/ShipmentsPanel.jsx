import { useEffect, useState, useCallback } from "react";
import Icon from "../../components/Icon";
import Field from "../../components/ui/Field";
import { PrimaryButton, GhostButton } from "../../components/ui/Buttons";
import { useToast } from "../../context/ToastContext";
import { openShipmentDocument } from "../../lib/shipmentDocument";
import { cx } from "../../lib/utils";

const STEPS = ["Label Created", "On the Way", "Out for Delivery", "Delivered"];

const emptyForm = {
  shipToLine1: "", shipToCityStateZip: "", shipToCountry: "US",
  service: "Ground Shipping", weight: "", referenceNumber: "", estimatedDelivery: "", cost: "",
};

function fmtDateTime(value) {
  return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function ShipmentRow({ shipment, onUpdate, busy }) {
  const [editing, setEditing] = useState(false);
  const [step, setStep] = useState(shipment.step);
  const [health, setHealth] = useState(shipment.health);
  const [reason, setReason] = useState(shipment.issueReason || "");

  const submit = async () => {
    await onUpdate(shipment.id, { step, health, issueReason: health === "red" ? reason : "" });
    setEditing(false);
  };

  return (
    <div className="rounded-2xl bg-white border border-ink/8 shadow-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <div>
          <div className="font-medium text-ink font-mono text-sm">{shipment.trackingNumber}</div>
          <div className="text-xs text-slateSoft mt-0.5">{shipment.employeeName} · {shipment.service}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cx("h-2 w-2 rounded-full", shipment.health === "red" ? "bg-red-500" : "bg-moss")} />
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-linen2 text-ink">{shipment.step}</span>
        </div>
      </div>
      {shipment.health === "red" && shipment.issueReason && (
        <p className="text-xs text-red-600 mt-2">Issue: {shipment.issueReason}</p>
      )}
      <p className="text-[11px] text-slateSoft/70 font-mono mt-2">Updated {fmtDateTime(shipment.updatedAt)}</p>
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <GhostButton icon={null} onClick={() => setEditing((e) => !e)} className="!px-4 !py-2 !text-xs">
          {editing ? "Cancel" : "Update status"}
        </GhostButton>
        <GhostButton icon={null} onClick={() => openShipmentDocument(shipment, "invoice")} className="!px-4 !py-2 !text-xs">Invoice</GhostButton>
        <GhostButton icon={null} onClick={() => openShipmentDocument(shipment, "receipt")} className="!px-4 !py-2 !text-xs">Receipt</GhostButton>
      </div>

      {editing && (
        <div className="mt-4 pt-4 border-t border-ink/8 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-wider text-slateSoft mb-1.5">Step</span>
              <select value={step} onChange={(e) => setStep(e.target.value)} className="w-full rounded-xl border border-ink/12 px-3.5 py-3 text-sm bg-white">
                {STEPS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-wider text-slateSoft mb-1.5">Health</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setHealth("green")}
                  className={cx("flex-1 rounded-xl border py-3 text-xs font-mono uppercase tracking-wide transition-colors", health === "green" ? "bg-moss text-white border-moss" : "border-ink/12 text-slateSoft")}
                >
                  On track
                </button>
                <button
                  onClick={() => setHealth("red")}
                  className={cx("flex-1 rounded-xl border py-3 text-xs font-mono uppercase tracking-wide transition-colors", health === "red" ? "bg-red-500 text-white border-red-500" : "border-ink/12 text-slateSoft")}
                >
                  Issue
                </button>
              </div>
            </label>
          </div>
          {health === "red" && (
            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-wider text-slateSoft mb-1.5">Reason (shown to employee)</span>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="2" className="w-full rounded-xl border border-ink/12 px-3.5 py-3 text-sm focus:border-brass focus:ring-1 focus:ring-brass resize-none" placeholder="e.g. Delayed at customs" />
            </label>
          )}
          <PrimaryButton icon={null} onClick={submit} className={cx("!text-xs", busy && "opacity-50 pointer-events-none")}>Save update</PrimaryButton>
        </div>
      )}
    </div>
  );
}

export default function ShipmentsPanel() {
  const { notify } = useToast();
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [shipments, setShipments] = useState([]);
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

  const load = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/portal/shipments?employeeId=${id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load shipments.");
      setShipments(data.shipments || []);
    } catch (err) {
      setError(err.message || "Failed to load shipments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (employeeId) load(employeeId); }, [employeeId, load]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canCreate = employeeId && form.shipToLine1.trim() && form.shipToCityStateZip.trim() && !creating;

  const createShipment = async () => {
    if (!canCreate) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/portal/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, ...form }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setShipments((list) => [data.shipment, ...list]);
      setForm(emptyForm);
      notify(`Shipment created — ${data.shipment.trackingNumber}`);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setCreating(false);
    }
  };

  const updateShipment = async (id, fields) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/portal/shipments?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setShipments((list) => list.map((s) => (s.id === id ? data.shipment : s)));
      notify("Shipment updated");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  if (employees.length === 0 && !loading) {
    return <div className="rounded-2xl border border-dashed border-ink/15 py-16 text-center mt-6"><p className="text-sm text-slateSoft">No approved employees yet.</p></div>;
  }

  return (
    <div className="mt-6 grid lg:grid-cols-[300px_1fr] gap-6">
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-slateSoft mb-1.5">Employee</label>
        <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full rounded-xl border border-ink/12 px-3.5 py-3 text-sm bg-white">
          {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>

        <div className="mt-6 rounded-2xl bg-white border border-ink/8 shadow-card p-5 space-y-4">
          <h3 className="font-medium text-ink text-sm">New shipment</h3>
          <Field label="Ship-to address" icon="pin" value={form.shipToLine1} onChange={update("shipToLine1")} placeholder="Street address" />
          <Field label="City, state, ZIP" value={form.shipToCityStateZip} onChange={update("shipToCityStateZip")} placeholder="City, ST 00000" />
          <Field label="Country" value={form.shipToCountry} onChange={update("shipToCountry")} placeholder="US" />
          <Field label="Service" icon="briefcase" value={form.service} onChange={update("service")} placeholder="e.g. Ground Shipping" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Weight" value={form.weight} onChange={update("weight")} placeholder="1.39 kgs" />
            <Field label="Cost" icon="card" value={form.cost} onChange={update("cost")} placeholder="0.00" />
          </div>
          <Field label="Reference number" value={form.referenceNumber} onChange={update("referenceNumber")} placeholder="Optional" />
          <Field label="Estimated delivery" icon="calendar" value={form.estimatedDelivery} onChange={update("estimatedDelivery")} placeholder="e.g. Monday, Sep 1 by 7:00 PM" />
          <PrimaryButton icon={null} onClick={createShipment} full className={cx("!text-xs", !canCreate && "opacity-50 pointer-events-none")}>
            {creating ? "Creating…" : "Create shipment"}
          </PrimaryButton>
        </div>
      </div>

      <div>
        {error && <p className="text-sm text-red-600 mb-4 flex items-center gap-1.5"><Icon name="alert" size={14} />{error}</p>}
        {loading ? (
          <p className="text-sm text-slateSoft">Loading…</p>
        ) : shipments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 py-16 text-center"><p className="text-sm text-slateSoft">No shipments for this employee yet.</p></div>
        ) : (
          <div className="space-y-3">
            {shipments.map((s) => (
              <ShipmentRow key={s.id} shipment={s} onUpdate={updateShipment} busy={busyId === s.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
