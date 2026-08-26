const LOGO_SVG = `<svg viewBox="0 0 48 48" width="42" height="42" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="46" height="46" rx="11" fill="#16281D" />
  <path d="M13 34V14l11 12 11-12v20" stroke="#B8874C" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="24" cy="26" r="2.1" fill="#B8874C" />
</svg>`;

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(n) {
  return `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(value) {
  return new Date(value || Date.now()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function addressBlock(a) {
  if (!a) return "";
  return [esc(a.name), esc(a.line1), esc(a.cityStateZip), esc(a.country)].filter(Boolean).join("<br/>");
}

export function buildShipmentDocumentHtml(shipment, kind) {
  const isInvoice = kind === "invoice";
  const docTitle = isInvoice ? "Invoice" : "Receipt";
  const docNumber = `${isInvoice ? "INV" : "RCT"}-${(shipment.trackingNumber || "").slice(-8)}`;
  const issueDate = fmtDate(shipment.createdAt);
  const cost = Number(shipment.cost || 0);
  const tax = 0;
  const total = cost + tax;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${docTitle} ${docNumber} — Merivane Resources</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 48px;
    background: #F7F8F1;
    color: #16281D;
    font-family: 'Inter', -apple-system, Helvetica, Arial, sans-serif;
    font-size: 13px;
    line-height: 1.5;
  }
  .sheet {
    max-width: 760px;
    margin: 0 auto;
    background: #FFFFFF;
    border: 1px solid rgba(22,40,29,0.08);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 28px -10px rgba(20,26,46,0.16);
  }
  .band { background: #16281D; padding: 28px 40px; border-bottom: 3px solid #B8874C; display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand .word { font-family: 'IBM Plex Mono', ui-monospace, Consolas, monospace; letter-spacing: 0.16em; text-transform: uppercase; color: #F7F8F1; font-size: 15px; font-weight: 600; }
  .brand .tag { font-family: 'IBM Plex Mono', ui-monospace, Consolas, monospace; letter-spacing: 0.3em; text-transform: uppercase; color: #DDB37F; font-size: 9px; margin-top: 2px; }
  .doctitle { text-align: right; color: #F7F8F1; }
  .doctitle .kind { font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 700; }
  .doctitle .num { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #DDB37F; margin-top: 4px; }
  .body { padding: 36px 40px; }
  .meta { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 28px; flex-wrap: wrap; }
  .meta .block { flex: 1; min-width: 180px; }
  .label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #5B6B60; margin-bottom: 6px; }
  .value { font-size: 13.5px; color: #16281D; }
  table.details { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
  table.details td { padding: 10px 0; border-top: 1px solid #E4E4D8; font-size: 13px; }
  table.details td.k { color: #5B6B60; font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; width: 180px; }
  table.charges { width: 100%; border-collapse: collapse; margin-top: 8px; }
  table.charges th { text-align: left; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: #5B6B60; padding: 10px 0; border-bottom: 1px solid #E4E4D8; }
  table.charges td { padding: 12px 0; border-bottom: 1px solid #E4E4D8; font-size: 13.5px; }
  table.charges .amt { text-align: right; font-family: 'IBM Plex Mono', monospace; }
  .total-row td { border-bottom: none; padding-top: 16px; font-weight: 700; font-size: 15px; }
  .stamp { display: inline-block; margin-top: 18px; padding: 6px 16px; border-radius: 999px; background: rgba(63,122,86,0.1); border: 1px solid rgba(63,122,86,0.3); color: #3F7A56; font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; }
  .footer { padding: 24px 40px; border-top: 1px solid #E4E4D8; text-align: center; color: #8A9690; font-size: 11px; }
  .print-bar { max-width: 760px; margin: 0 auto 16px; text-align: right; }
  .print-btn { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 999px; background: #16281D; color: #F7F8F1; border: none; cursor: pointer; }
  @media print {
    body { background: #fff; padding: 0; }
    .sheet { border: none; box-shadow: none; border-radius: 0; }
    .print-bar { display: none; }
  }
</style>
</head>
<body>
  <div class="print-bar"><button class="print-btn" onclick="window.print()">Print / Save as PDF</button></div>
  <div class="sheet">
    <div class="band">
      <div class="brand">
        ${LOGO_SVG}
        <div>
          <div class="word">Merivane</div>
          <div class="tag">Resources</div>
        </div>
      </div>
      <div class="doctitle">
        <div class="kind">${docTitle}</div>
        <div class="num">${esc(docNumber)} · ${esc(issueDate)}</div>
      </div>
    </div>
    <div class="body">
      <div class="meta">
        <div class="block">
          <div class="label">Ship from</div>
          <div class="value">${addressBlock(shipment.shipFrom)}</div>
        </div>
        <div class="block">
          <div class="label">Ship to</div>
          <div class="value">${addressBlock(shipment.shipTo)}</div>
        </div>
        <div class="block">
          <div class="label">Billed to</div>
          <div class="value">${esc(shipment.employeeName)}<br/>${esc(shipment.employeeEmail)}</div>
        </div>
      </div>

      <table class="details">
        <tr><td class="k">Tracking number</td><td>${esc(shipment.trackingNumber)}</td></tr>
        <tr><td class="k">Service</td><td>${esc(shipment.service)}</td></tr>
        <tr><td class="k">Weight</td><td>${esc(shipment.weight) || "—"}</td></tr>
        <tr><td class="k">Reference number</td><td>${esc(shipment.referenceNumber) || "—"}</td></tr>
        <tr><td class="k">Estimated delivery</td><td>${esc(shipment.estimatedDelivery) || "—"}</td></tr>
      </table>

      <table class="charges">
        <thead><tr><th>Description</th><th class="amt">Amount</th></tr></thead>
        <tbody>
          <tr><td>Shipping — ${esc(shipment.service)}</td><td class="amt">${money(cost)}</td></tr>
          <tr><td>Tax</td><td class="amt">${money(tax)}</td></tr>
          <tr class="total-row"><td>${isInvoice ? "Amount due" : "Total paid"}</td><td class="amt">${money(total)}</td></tr>
        </tbody>
      </table>

      ${!isInvoice ? '<div class="stamp">Paid in full</div>' : ""}
    </div>
    <div class="footer">
      Merivane Resources · 9600 Great Hills Trail, Suite 300E, Austin, TX 78759 · info@merivaneresources.com · +1 (555) 018 2934
    </div>
  </div>
</body>
</html>`;
}

export function openShipmentDocument(shipment, kind) {
  const html = buildShipmentDocumentHtml(shipment, kind);
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
}
