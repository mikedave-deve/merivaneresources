import { useEffect, useState } from "react";
import Icon from "../../components/Icon";
import Field from "../../components/ui/Field";
import Badge from "../../components/ui/Badge";
import { PrimaryButton, GhostButton } from "../../components/ui/Buttons";
import { PageHeader, SectionCard } from "../../components/portal/PortalPrimitives";
import { cx } from "../../lib/utils";

const emptyDeposit = { bankName: "", accountHolderName: "", accountNumber: "", routingNumber: "" };

function money(n) {
  return `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(value) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Payroll() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [depositForm, setDepositForm] = useState(emptyDeposit);
  const [editingDeposit, setEditingDeposit] = useState(false);
  const [savingDeposit, setSavingDeposit] = useState(false);
  const [depositError, setDepositError] = useState("");

  const [transferAmount, setTransferAmount] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState("");
  const [pendingTransfer, setPendingTransfer] = useState(null);
  const [code, setCode] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [transferDone, setTransferDone] = useState(false);

  const load = () => fetch("/api/portal/payroll").then((res) => res.json());

  useEffect(() => {
    let cancelled = false;
    load().then((d) => { if (!cancelled) { setData(d); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const updateDeposit = (k) => (e) => setDepositForm((f) => ({ ...f, [k]: e.target.value }));
  const canSaveDeposit = Object.values(depositForm).every((v) => v.trim()) && !savingDeposit;

  const saveDeposit = async () => {
    if (!canSaveDeposit) return;
    setSavingDeposit(true);
    setDepositError("");
    try {
      const res = await fetch("/api/portal/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set-direct-deposit", ...depositForm }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Something went wrong.");
      setData(body);
      setEditingDeposit(false);
      setDepositForm(emptyDeposit);
    } catch (err) {
      setDepositError(err.message || "Something went wrong.");
    } finally {
      setSavingDeposit(false);
    }
  };

  const startTransfer = async () => {
    const amount = Number(transferAmount);
    if (!Number.isFinite(amount) || amount <= 0 || transferring) return;
    setTransferring(true);
    setTransferError("");
    try {
      const res = await fetch("/api/portal/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "transfer", amount }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Something went wrong.");
      setPendingTransfer({ id: body.transferId, amount });
      setCode("");
      setConfirmError("");
    } catch (err) {
      setTransferError(err.message || "Something went wrong.");
    } finally {
      setTransferring(false);
    }
  };

  const confirmTransfer = async () => {
    if (!code.trim() || confirming) return;
    setConfirming(true);
    setConfirmError("");
    try {
      const res = await fetch("/api/portal/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm-transfer", transferId: pendingTransfer.id, code }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Something went wrong.");
      setData(body);
      setPendingTransfer(null);
      setTransferAmount("");
      setTransferDone(true);
    } catch (err) {
      setConfirmError(err.message || "Something went wrong.");
    } finally {
      setConfirming(false);
    }
  };

  if (loading || !data) return null;

  return (
    <div>
      <PageHeader eyebrow="Pay & benefits" title="Payroll" subtitle="Your pay schedule, method, and deposit history." />

      {transferDone && (
        <div className="mb-6 rounded-xl bg-moss/10 border border-moss/25 p-4 flex items-center gap-2 text-moss text-sm font-medium">
          <Icon name="check" size={16} />Transfer complete — funds are on their way to your direct deposit account.
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="rounded-2xl bg-ink text-linen p-5 shadow-card">
          <div className="text-xs font-mono uppercase tracking-wide text-linen2/60">Payroll balance</div>
          <div className="font-display text-2xl font-semibold mt-2">{money(data.balance)}</div>
          <div className="text-xs text-brassLight mt-1">Available to transfer</div>
        </div>
        <div className="rounded-2xl bg-white border border-ink/8 p-5 shadow-card">
          <div className="text-xs font-mono uppercase tracking-wide text-slateSoft">Next payment</div>
          <div className="font-display text-lg font-semibold mt-2 text-ink">{money(data.nextPaymentAmount)}</div>
          <div className="text-xs text-slateSoft mt-1">{fmtDate(data.nextPaymentDate)}</div>
        </div>
        <div className="rounded-2xl bg-white border border-ink/8 p-5 shadow-card">
          <div className="text-xs font-mono uppercase tracking-wide text-slateSoft">Pay schedule</div>
          <div className="font-display text-lg font-semibold mt-2 text-ink">{data.schedule}</div>
        </div>
        <div className="rounded-2xl bg-white border border-ink/8 p-5 shadow-card">
          <div className="text-xs font-mono uppercase tracking-wide text-slateSoft">Payment method</div>
          {data.directDeposit ? (
            <>
              <div className="font-display text-lg font-semibold mt-2 text-ink">Direct deposit</div>
              <div className="text-xs text-slateSoft mt-1">{data.directDeposit.bankName} ending •••• {data.directDeposit.accountNumberLast4}</div>
            </>
          ) : (
            <>
              <div className="font-display text-lg font-semibold mt-2 text-ink">Not set up</div>
              <button onClick={() => setEditingDeposit(true)} className="text-xs font-mono text-brass hover:underline mt-1">Add account</button>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6 mb-6">
        <SectionCard title="Direct deposit" action={data.directDeposit && !editingDeposit && <button onClick={() => setEditingDeposit(true)} className="text-xs font-mono text-brass hover:underline">Edit</button>}>
          {!editingDeposit ? (
            data.directDeposit ? (
              <div className="text-sm space-y-2">
                <div className="flex justify-between"><span className="text-slateSoft">Bank</span><span className="text-ink">{data.directDeposit.bankName}</span></div>
                <div className="flex justify-between"><span className="text-slateSoft">Account holder</span><span className="text-ink">{data.directDeposit.accountHolderName}</span></div>
                <div className="flex justify-between"><span className="text-slateSoft">Account</span><span className="text-ink font-mono">•••• {data.directDeposit.accountNumberLast4}</span></div>
                <div className="flex justify-between"><span className="text-slateSoft">Routing</span><span className="text-ink font-mono">•••• {data.directDeposit.routingNumberLast4}</span></div>
              </div>
            ) : (
              <p className="text-sm text-slateSoft">Add your bank details to enable direct deposit and balance transfers.</p>
            )
          ) : (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Bank name" icon="building" value={depositForm.bankName} onChange={updateDeposit("bankName")} placeholder="e.g. Chase" />
                <Field label="Account holder" icon="user" value={depositForm.accountHolderName} onChange={updateDeposit("accountHolderName")} placeholder="As shown on the account" />
                <Field label="Account number" icon="lock" type="password" value={depositForm.accountNumber} onChange={updateDeposit("accountNumber")} placeholder="Account number" />
                <Field label="Routing number" icon="lock" type="password" value={depositForm.routingNumber} onChange={updateDeposit("routingNumber")} placeholder="Routing number" />
              </div>
              {depositError && <p className="text-xs text-red-600">{depositError}</p>}
              <div className="flex gap-2">
                <PrimaryButton icon={null} onClick={saveDeposit} className={cx("!text-xs", !canSaveDeposit && "opacity-50 pointer-events-none")}>{savingDeposit ? "Saving…" : "Save"}</PrimaryButton>
                <GhostButton icon={null} onClick={() => { setEditingDeposit(false); setDepositForm(emptyDeposit); }} className="!text-xs">Cancel</GhostButton>
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Transfer to direct deposit" subtitle="Move funds from your payroll balance to your bank on file.">
          {!data.directDeposit ? (
            <p className="text-sm text-slateSoft">Add a direct deposit account first.</p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex-1 w-full">
                <Field label={`Amount (max ${money(data.balance)})`} icon="card" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} placeholder="0.00" />
              </div>
              <PrimaryButton icon={null} onClick={startTransfer} className={cx("!text-xs shrink-0", (!transferAmount || transferring) && "opacity-50 pointer-events-none")}>
                {transferring ? "Sending code…" : "Transfer"}
              </PrimaryButton>
            </div>
          )}
          {transferError && <p className="text-xs text-red-600 mt-3">{transferError}</p>}
        </SectionCard>
      </div>

      <SectionCard title="Payment history">
        {data.history.length === 0 ? (
          <p className="text-sm text-slateSoft py-4">No payslips on file yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-6 -mb-6">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="bg-linen2/60 text-left text-xs font-mono uppercase tracking-wide text-slateSoft">
                <tr><th className="px-6 py-3">Period</th><th className="px-6 py-3">Amount</th><th className="px-6 py-3">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {data.history.map((h) => (
                  <tr key={h.id}>
                    <td className="px-6 py-4 text-ink font-medium">{h.period}</td>
                    <td className="px-6 py-4 font-mono text-slateSoft">{h.amount}</td>
                    <td className="px-6 py-4"><Badge tone="moss">{h.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {pendingTransfer && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-2xl shadow-panel max-w-sm w-full p-6">
            <div className="h-12 w-12 rounded-full bg-brass/10 flex items-center justify-center mb-4"><Icon name="lock" size={20} className="text-brass" /></div>
            <h3 className="font-display text-lg font-semibold text-ink">Enter confirmation code</h3>
            <p className="text-sm text-slateSoft mt-2">We emailed a 6-digit code to confirm your {money(pendingTransfer.amount)} transfer. Text your admin if you don't receive it.</p>
            <div className="mt-4">
              <Field label="Code" icon="lock" value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" onKeyDown={(e) => e.key === "Enter" && confirmTransfer()} />
            </div>
            {confirmError && <p className="text-xs text-red-600 mt-2">{confirmError}</p>}
            <div className="flex gap-2 mt-5">
              <PrimaryButton icon={null} onClick={confirmTransfer} className={cx("flex-1 !text-xs", (!code.trim() || confirming) && "opacity-50 pointer-events-none")}>
                {confirming ? "Confirming…" : "Confirm transfer"}
              </PrimaryButton>
              <GhostButton icon={null} onClick={() => setPendingTransfer(null)} className="!text-xs">Cancel</GhostButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
