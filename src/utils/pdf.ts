import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Job } from '../types/job.types';
import type { CompanySettings } from '../types/settings.types';

const fmtCurrency = (n: number) =>
  '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 864e5);

/** Draw a logo fit within maxW × maxH preserving aspect ratio; returns drawn size. */
function drawLogo(
  doc: jsPDF,
  dataUrl: string,
  x: number,
  y: number,
  maxW: number,
  maxH: number,
): { w: number; h: number } | null {
  try {
    const props = doc.getImageProperties(dataUrl);
    let w = maxW;
    let h = (w * props.height) / props.width;
    if (h > maxH) {
      h = maxH;
      w = (h * props.width) / props.height;
    }
    doc.addImage(dataUrl, 'PNG', x, y, w, h);
    return { w, h };
  } catch {
    return null;
  }
}

type DocKind = 'invoice' | 'estimate';

export function generateDocPDF(job: Job, settings: CompanySettings, kind: DocKind): jsPDF {
  const doc = new jsPDF({ format: 'letter', unit: 'mm' });
  const PW = doc.internal.pageSize.getWidth();
  const M = 18;
  let y = M;

  const isInvoice = kind === 'invoice';
  const accent = '#F5A623';

  // Company header — logo (with its built-in wordmark) or company name text
  const contact = [
    settings.licenseNumber ? `Lic# ${settings.licenseNumber}` : '',
    [settings.city, settings.state, settings.zip].filter(Boolean).join(', '),
    settings.phone,
    settings.email,
  ].filter(Boolean);

  const logo = settings.logoDataUrl ? drawLogo(doc, settings.logoDataUrl, M, y, 62, 16) : null;
  if (logo) {
    const cy = y + logo.h + 5;
    doc.setFontSize(8).setFont('helvetica', 'normal').setTextColor('#6B7280');
    contact.forEach((line, i) => doc.text(line, M, cy + i * 4));
  } else {
    doc.setFontSize(16).setFont('helvetica', 'bold').setTextColor('#111827');
    doc.text(settings.companyName, M, y + 7);
    doc.setFontSize(8).setFont('helvetica', 'normal').setTextColor('#6B7280');
    contact.forEach((line, i) => doc.text(line, M, y + 13 + i * 4));
  }

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
  y += 12;

  // Change-order designation banner
  const hasChangeOrder = job.lineItems.some((i) => i.isChangeOrder);
  if (hasChangeOrder) {
    doc.setFillColor('#FEF3C7');
    doc.rect(M, y - 1, PW - 2 * M, 7, 'F');
    doc.setFontSize(8).setFont('helvetica', 'bold').setTextColor('#92400E');
    doc.text('INCLUDES CHANGE ORDER — items marked [CHANGE ORDER] below', M + 2, y + 3.5);
    y += 12;
  }

  // Line items
  autoTable(doc, {
    startY: y,
    head: [['Description', 'Qty', 'Unit', 'Rate', 'Amount']],
    body: job.lineItems.map((i) => [
      i.isChangeOrder ? `${i.description}  [CHANGE ORDER]` : i.description,
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

  // Signatures (estimate only)
  if (!isInvoice && (job.customerSignature || job.contractorSignature)) {
    drawSignatures(doc, job, M, PW);
  }

  return doc;
}

/** Render side-by-side customer/contractor signature blocks near the page bottom. */
function drawSignatures(doc: jsPDF, job: Job, M: number, PW: number): void {
  const PH = doc.internal.pageSize.getHeight();
  let y = PH - 42;
  const colW = (PW - 2 * M - 8) / 2;

  const block = (x: number, title: string, sig?: string, name?: string, at?: string) => {
    if (sig) {
      try {
        doc.addImage(sig, 'PNG', x, y - 16, 50, 16);
      } catch {
        /* ignore */
      }
    }
    doc.setDrawColor('#9CA3AF').line(x, y, x + colW, y);
    doc.setFontSize(7).setFont('helvetica', 'bold').setTextColor('#6B7280').text(title, x, y + 4);
    doc.setFont('helvetica', 'normal').setTextColor('#111827');
    if (name) doc.text(name, x, y + 8);
    if (at) doc.text(fmtDate(new Date(at)), x + colW, y + 4, { align: 'right' });
  };

  block(M, 'CUSTOMER SIGNATURE', job.customerSignature, job.customerSignedName, job.customerSignedAt);
  block(M + colW + 8, 'CONTRACTOR SIGNATURE', job.contractorSignature, job.contractorSignedName, job.contractorSignedAt);
}

/**
 * Scope-of-work package: company/client header, scope summary, full priced
 * line-item breakdown, then a gallery of every job-walk photo. Gives the
 * client a complete picture of what's being bid and what was documented.
 */
export function generateScopePackagePDF(job: Job, settings: CompanySettings): jsPDF {
  const doc = new jsPDF({ format: 'letter', unit: 'mm' });
  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  const M = 18;
  let y = M;

  // Brand header
  const logo = settings.logoDataUrl ? drawLogo(doc, settings.logoDataUrl, M, y, 58, 15) : null;
  if (logo) y += logo.h + 4;
  doc.setFontSize(18).setFont('helvetica', 'bold').setTextColor('#111827');
  doc.text('Scope of Work', M, y + 6);
  doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor('#6B7280');
  doc.text(`${settings.companyName}  ·  ${job.jobNumber}`, M, y + 12);
  // Title block (right) for the project total
  doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor('#6B7280');
  doc.text(fmtDate(new Date()), PW - M, y + 6, { align: 'right' });
  y += 22;

  doc.setFontSize(7).setFont('helvetica', 'bold').setTextColor('#9CA3AF').text('PREPARED FOR', M, y);
  y += 5;
  doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#111827').text(job.clientName || '—', M, y);
  y += 5;
  doc.setFontSize(9).setFont('helvetica', 'normal');
  doc.text([job.jobAddress, [job.jobCity, job.jobState, job.jobZip].filter(Boolean).join(', ')].filter(Boolean), M, y);
  y += 12;

  doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#111827').text(`Project: ${job.categoryName}`, M, y);
  y += 6;
  if (job.subcategories.length) {
    doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor('#374151');
    doc.text(job.subcategories.join(' · '), M, y, { maxWidth: PW - 2 * M });
    y += Math.ceil(job.subcategories.join(' · ').length / 95) * 5 + 4;
  }
  if (job.notes) {
    doc.setFontSize(9).setTextColor('#374151').text(job.notes, M, y, { maxWidth: PW - 2 * M });
    y += 10;
  }

  // Priced scope items
  autoTable(doc, {
    startY: y,
    head: [['Scope Item', 'Qty', 'Unit', 'Amount']],
    body: job.lineItems.map((i) => [
      i.isChangeOrder ? `${i.description}  [CHANGE ORDER]` : i.description,
      String(i.quantity),
      i.unit,
      fmtCurrency(i.total),
    ]),
    foot: [['', '', 'Total', fmtCurrency(job.estimateTotal)]],
    headStyles: { fillColor: '#111827', textColor: '#FFFFFF', fontStyle: 'bold', fontSize: 9 },
    footStyles: { fillColor: '#F3F4F6', textColor: '#111827', fontStyle: 'bold', fontSize: 10 },
    bodyStyles: { fontSize: 9, textColor: '#111827' },
    columnStyles: {
      0: { cellWidth: 104 },
      1: { halign: 'right', cellWidth: 16 },
      2: { cellWidth: 16 },
      3: { halign: 'right', cellWidth: 28, fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: '#F9FAFB' },
    margin: { left: M, right: M },
    theme: 'striped',
  });

  // Photo gallery
  if (job.photos.length) {
    doc.addPage();
    y = M;
    doc.setFontSize(13).setFont('helvetica', 'bold').setTextColor('#111827').text('Site Photos', M, y + 4);
    y += 12;

    const gap = 6;
    const cols = 2;
    const cellW = (PW - 2 * M - gap) / cols;
    const cellH = cellW * 0.72;
    let col = 0;

    for (const photo of job.photos) {
      if (y + cellH + 8 > PH - M) {
        doc.addPage();
        y = M;
      }
      const x = M + col * (cellW + gap);
      try {
        doc.addImage(photo.dataUrl, 'JPEG', x, y, cellW, cellH);
      } catch {
        /* skip unreadable image */
      }
      doc.setFontSize(7).setFont('helvetica', 'normal').setTextColor('#6B7280');
      const cap = `${photo.phase.toUpperCase()}${photo.caption ? ' · ' + photo.caption : ''}`;
      doc.text(cap, x, y + cellH + 4, { maxWidth: cellW });
      col += 1;
      if (col >= cols) {
        col = 0;
        y += cellH + 10;
      }
    }
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
