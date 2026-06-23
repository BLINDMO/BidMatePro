import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Job } from '../types/job.types';
import type { CompanySettings } from '../types/settings.types';

const fmtCurrency = (n: number) =>
  '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 864e5);

type DocKind = 'invoice' | 'estimate';

export function generateDocPDF(job: Job, settings: CompanySettings, kind: DocKind): jsPDF {
  const doc = new jsPDF({ format: 'letter', unit: 'mm' });
  const PW = doc.internal.pageSize.getWidth();
  const M = 18;
  let y = M;

  const isInvoice = kind === 'invoice';
  const accent = '#F5A623';

  // Company header
  if (settings.logoDataUrl) {
    try {
      doc.addImage(settings.logoDataUrl, 'PNG', M, y, 28, 14);
    } catch {
      /* ignore bad logo */
    }
  }
  const textX = settings.logoDataUrl ? M + 32 : M;
  doc.setFontSize(16).setFont('helvetica', 'bold').setTextColor('#111827');
  doc.text(settings.companyName, textX, y + 7);
  doc.setFontSize(8).setFont('helvetica', 'normal').setTextColor('#6B7280');
  [
    settings.licenseNumber ? `Lic# ${settings.licenseNumber}` : '',
    [settings.city, settings.state, settings.zip].filter(Boolean).join(', '),
    settings.phone,
    settings.email,
  ]
    .filter(Boolean)
    .forEach((line, i) => doc.text(line, textX, y + 13 + i * 4));

  // Title (right)
  doc.setFontSize(24).setFont('helvetica', 'bold').setTextColor(accent);
  doc.text(isInvoice ? 'INVOICE' : 'ESTIMATE', PW - M, y + 7, { align: 'right' });
  doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor('#111827');
  const tail = job.jobNumber.split('-').pop() ?? '0';
  const num = isInvoice
    ? `${settings.invoiceNumberPrefix}-${tail}`
    : `${settings.estimateNumberPrefix}-${tail}`;
  const headerLines = [`#${num}`, `Date: ${fmtDate(new Date())}`];
  if (isInvoice) headerLines.push(`Due: ${fmtDate(addDays(new Date(), 15))}`);
  else headerLines.push(`Valid Until: ${fmtDate(addDays(new Date(), settings.estimateValidityDays))}`);
  doc.text(headerLines, PW - M, y + 15, { align: 'right' });

  y += 44;
  doc.setDrawColor('#E5E7EB').line(M, y, PW - M, y);
  y += 6;

  // Bill To
  doc.setFontSize(7).setFont('helvetica', 'bold').setTextColor('#9CA3AF').text('BILL TO', M, y);
  y += 5;
  doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#111827').text(job.clientName || '—', M, y);
  y += 5;
  doc.setFontSize(9).setFont('helvetica', 'normal');
  doc.text(
    [job.jobAddress, [job.jobCity, job.jobState, job.jobZip].filter(Boolean).join(', ')].filter(Boolean),
    M,
    y,
  );
  y += 14;

  // Line items
  autoTable(doc, {
    startY: y,
    head: [['Description', 'Qty', 'Unit', 'Rate', 'Amount']],
    body: job.lineItems.map((i) => [
      i.description,
      String(i.quantity),
      i.unit,
      fmtCurrency(i.unitPrice),
      fmtCurrency(i.total),
    ]),
    headStyles: { fillColor: '#111827', textColor: '#FFFFFF', fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: '#111827' },
    columnStyles: {
      0: { cellWidth: 78 },
      1: { halign: 'right', cellWidth: 14 },
      2: { cellWidth: 14 },
      3: { halign: 'right', cellWidth: 24 },
      4: { halign: 'right', cellWidth: 28, fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: '#F9FAFB' },
    margin: { left: M, right: M },
    theme: 'striped',
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // Totals
  const TX = PW - M - 68;
  const RX = PW - M;
  const rows: { label: string; val: number; color: string }[] = [
    { label: 'Subtotal', val: job.subtotal, color: '#374151' },
  ];
  if (job.overheadMarkupAmt > 0)
    rows.push({ label: `Material Markup (${job.overheadMarkupPct}%)`, val: job.overheadMarkupAmt, color: '#6B7280' });
  if (job.taxAmt > 0) rows.push({ label: `Tax (${job.taxPct}%)`, val: job.taxAmt, color: '#6B7280' });
  if (isInvoice && job.totalPaid > 0)
    rows.push({ label: 'Payments Received', val: -job.totalPaid, color: '#16A34A' });

  rows.forEach((row) => {
    doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor(row.color);
    doc.text(row.label, TX, y);
    doc.text(row.val < 0 ? `-${fmtCurrency(row.val)}` : fmtCurrency(row.val), RX, y, { align: 'right' });
    y += 6;
  });

  doc.setDrawColor('#E5E7EB').line(TX, y, RX, y);
  y += 5;
  doc.setFontSize(13).setFont('helvetica', 'bold').setTextColor('#111827');
  const totalLabel = isInvoice ? 'Balance Due' : 'Estimate Total';
  const totalVal = isInvoice ? job.balanceDue : job.estimateTotal;
  doc.text(totalLabel, TX, y);
  doc.setTextColor(isInvoice && job.balanceDue > 0 ? '#EF4444' : '#16A34A');
  doc.text(fmtCurrency(totalVal), RX, y, { align: 'right' });
  y += 14;

  // Footer
  doc.setFontSize(8).setFont('helvetica', 'normal').setTextColor('#6B7280');
  if (isInvoice) {
    if (settings.invoicePaymentTerms) {
      doc.text(`Payment Terms: ${settings.invoicePaymentTerms}`, M, y, { maxWidth: PW - 2 * M });
      y += 5;
    }
    if (settings.invoiceFooter) doc.text(settings.invoiceFooter, M, y, { maxWidth: PW - 2 * M });
  } else {
    if (settings.estimateDisclaimer)
      doc.text(settings.estimateDisclaimer, M, y, { maxWidth: PW - 2 * M });
  }

  return doc;
}

export async function sharePDF(doc: jsPDF, filename: string): Promise<void> {
  const blob = doc.output('blob');
  const file = new File([blob], filename, { type: 'application/pdf' });
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: filename });
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
