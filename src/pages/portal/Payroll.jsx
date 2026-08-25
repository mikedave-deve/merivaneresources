import Badge from "../../components/ui/Badge";
import { PageHeader, SectionCard } from "../../components/portal/PortalPrimitives";
import { PAYROLL_HISTORY } from "../../data/portal";

export default function Payroll() {
  return (
    <div>
      <PageHeader eyebrow="Pay & benefits" title="Payroll" subtitle="Your pay schedule, method, and deposit history." />
      <div className="grid sm:grid-cols-3 gap-5 mb-6">
        <div className="rounded-2xl bg-ink text-linen p-5 shadow-card">
          <div className="text-xs font-mono uppercase tracking-wide text-linen2/60">Next payment</div>
          <div className="font-display text-2xl font-semibold mt-2">$5,240.00</div>
          <div className="text-xs text-brassLight mt-1">Sep 1, 2026</div>
        </div>
        <div className="rounded-2xl bg-white border border-ink/8 p-5 shadow-card">
          <div className="text-xs font-mono uppercase tracking-wide text-slateSoft">Pay schedule</div>
          <div className="font-display text-lg font-semibold mt-2 text-ink">Monthly</div>
          <div className="text-xs text-slateSoft mt-1">1st of each month</div>
        </div>
        <div className="rounded-2xl bg-white border border-ink/8 p-5 shadow-card">
          <div className="text-xs font-mono uppercase tracking-wide text-slateSoft">Payment method</div>
          <div className="font-display text-lg font-semibold mt-2 text-ink">Direct deposit</div>
          <div className="text-xs text-slateSoft mt-1">Ending •••• 4821</div>
        </div>
      </div>
      <SectionCard title="Payment history">
        <div className="overflow-x-auto -mx-6 -mb-6">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="bg-linen2/60 text-left text-xs font-mono uppercase tracking-wide text-slateSoft">
              <tr><th className="px-6 py-3">Period</th><th className="px-6 py-3">Amount</th><th className="px-6 py-3">Status</th><th className="px-6 py-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {PAYROLL_HISTORY.map((h, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 text-ink font-medium">{h.period}</td>
                  <td className="px-6 py-4 font-mono text-slateSoft">{h.amount}</td>
                  <td className="px-6 py-4"><Badge tone="moss">{h.status}</Badge></td>
                  <td className="px-6 py-4 text-right"><button className="text-brass text-xs font-mono hover:underline">Download</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
