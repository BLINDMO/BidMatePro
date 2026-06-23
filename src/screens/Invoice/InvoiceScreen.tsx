import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Share2, Download, SearchX, PenLine, Images } from 'lucide-react';
import { useJobStore } from '../../stores/jobStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';
import { generateDocPDF, generateScopePackagePDF, sharePDF } from '../../utils/pdf';
import { fmtCurrencyFull, fmtDate } from '../../utils/format';
import ScreenHeader from '../../components/layout/ScreenHeader';
import Tabs from '../../components/ui/Tabs';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import BottomSheet from '../../components/ui/BottomSheet';
import SignaturePad from '../../components/ui/SignaturePad';

export default function InvoiceScreen() {
  const { id = '' } = useParams();
  const job = useJobStore((s) => s.jobs.find((j) => j.id === id));
  const updateJob = useJobStore((s) => s.updateJob);
  const settings = useSettingsStore((s) => s.settings);
  const showToast = useUIStore((s) => s.showToast);
  const [kind, setKind] = useState<'invoice' | 'estimate'>('invoice');
  const [signParty, setSignParty] = useState<'customer' | 'contractor' | null>(null);

  if (!job || !settings) {
    return (
      <div>
        <ScreenHeader title="Invoice" back />
        <EmptyState icon={<SearchX size={36} strokeWidth={1.5} />} title="Job not found" />
      </div>
    );
  }

  const makeDoc = () => generateDocPDF(job, settings, kind);
  const filename = `${kind === 'invoice' ? 'Invoice' : 'Estimate'}-${job.jobNumber}.pdf`;

  const onShare = async () => {
    try {
      await sharePDF(makeDoc(), filename);
    } catch {
      showToast('Share canceled', 'info');
    }
  };
  const onDownload = () => {
    makeDoc().save(filename);
    showToast('PDF downloaded');
  };

  const onScopePackage = async () => {
    const doc = generateScopePackagePDF(job, settings);
    try {
      await sharePDF(doc, `ScopeOfWork-${job.jobNumber}.pdf`);
    } catch {
      doc.save(`ScopeOfWork-${job.jobNumber}.pdf`);
    }
  };

  const saveSignature = async (dataUrl: string, name: string) => {
    const now = new Date().toISOString();
    if (signParty === 'customer') {
      await updateJob(job.id, { customerSignature: dataUrl, customerSignedName: name, customerSignedAt: now });
    } else if (signParty === 'contractor') {
      await updateJob(job.id, { contractorSignature: dataUrl, contractorSignedName: name, contractorSignedAt: now });
    }
    setSignParty(null);
    showToast('Signature saved');
  };

  const isInvoice = kind === 'invoice';
  const hasChangeOrder = job.lineItems.some((i) => i.isChangeOrder);
  const totalLabel = isInvoice ? 'Balance Due' : 'Estimate Total';
  const totalVal = isInvoice ? job.balanceDue : job.estimateTotal;

  return (
    <div className="pb-10">
      <ScreenHeader
        title={isInvoice ? 'Invoice' : 'Estimate'}
        back
        right={
          <div className="flex gap-1">
            <button onClick={onShare} className="flex h-9 w-9 items-center justify-center rounded-full active:bg-elev" aria-label="Share">
              <Share2 size={19} className="text-ink-1" />
            </button>
            <button onClick={onDownload} className="flex h-9 w-9 items-center justify-center rounded-full active:bg-elev" aria-label="Download">
              <Download size={19} className="text-ink-1" />
            </button>
          </div>
        }
      />

      <div className="px-5 py-3">
        <Tabs
          tabs={[
            { id: 'invoice', label: 'Invoice' },
            { id: 'estimate', label: 'Estimate' },
          ]}
          active={kind}
          onChange={(k) => setKind(k as 'invoice' | 'estimate')}
        />
      </div>

      {/* Paper preview */}
      <div className="mx-5 rounded-2xl bg-white p-5 text-[#111827] shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            {settings.logoDataUrl ? (
              <img src={settings.logoDataUrl} alt={settings.companyName} className="mb-1.5 h-9 w-auto object-contain" />
            ) : (
              <p className="text-base font-bold">{settings.companyName}</p>
            )}
            <p className="text-[11px] text-gray-500">
              {settings.licenseNumber && `Lic# ${settings.licenseNumber}`}
            </p>
            <p className="text-[11px] text-gray-500">
              {[settings.city, settings.state, settings.zip].filter(Boolean).join(', ')}
            </p>
            <p className="text-[11px] text-gray-500">{settings.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-extrabold text-amber">{isInvoice ? 'INVOICE' : 'ESTIMATE'}</p>
            <p className="text-[11px] text-gray-500">{job.jobNumber}</p>
            <p className="text-[11px] text-gray-500">{fmtDate(new Date())}</p>
          </div>
        </div>

        <div className="my-4 border-t border-gray-200" />

        <p className="text-[10px] font-bold text-gray-400">BILL TO</p>
        <p className="text-sm font-bold">{job.clientName}</p>
        <p className="text-[12px] text-gray-600">{job.jobAddress}</p>
        <p className="text-[12px] text-gray-600">
          {[job.jobCity, job.jobState, job.jobZip].filter(Boolean).join(', ')}
        </p>

        {hasChangeOrder && (
          <div className="mt-3 rounded-md bg-[#FEF3C7] px-2.5 py-1.5 text-[11px] font-semibold text-[#92400E]">
            Includes Change Order — items marked below
          </div>
        )}

        <table className="mt-4 w-full text-[12px]">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="p-1.5 text-left font-semibold">Description</th>
              <th className="p-1.5 text-right font-semibold">Qty</th>
              <th className="p-1.5 text-right font-semibold">Rate</th>
              <th className="p-1.5 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {job.lineItems.map((i, idx) => (
              <tr key={i.id} className={idx % 2 ? 'bg-gray-50' : ''}>
                <td className="p-1.5">
                  {i.description}
                  {i.isChangeOrder && (
                    <span className="ml-1 rounded bg-[#FEF3C7] px-1 text-[9px] font-bold text-[#92400E]">
                      CHANGE ORDER
                    </span>
                  )}
                </td>
                <td className="p-1.5 text-right">
                  {i.quantity} {i.unit}
                </td>
                <td className="p-1.5 text-right">{fmtCurrencyFull(i.unitPrice)}</td>
                <td className="p-1.5 text-right font-semibold">{fmtCurrencyFull(i.total)}</td>
              </tr>
            ))}
            {job.lineItems.length === 0 && (
              <tr>
                <td colSpan={4} className="p-3 text-center text-gray-400">
                  No line items
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-4 ml-auto w-1/2 space-y-1 text-[12px]">
          <Row label="Subtotal" value={fmtCurrencyFull(job.subtotal)} />
          {job.overheadMarkupAmt > 0 && (
            <Row label={`Markup (${job.overheadMarkupPct}%)`} value={fmtCurrencyFull(job.overheadMarkupAmt)} />
          )}
          {job.taxAmt > 0 && <Row label={`Tax (${job.taxPct}%)`} value={fmtCurrencyFull(job.taxAmt)} />}
          {isInvoice && job.totalPaid > 0 && (
            <Row label="Payments" value={`-${fmtCurrencyFull(job.totalPaid)}`} green />
          )}
          <div className="mt-1 flex justify-between border-t border-gray-300 pt-1.5 text-sm font-bold">
            <span>{totalLabel}</span>
            <span className={isInvoice && job.balanceDue > 0 ? 'text-rose' : 'text-jade'}>
              {fmtCurrencyFull(totalVal)}
            </span>
          </div>
        </div>

        <p className="mt-5 text-[10px] text-gray-500">
          {isInvoice ? settings.invoiceFooter : settings.estimateDisclaimer}
        </p>

        {!isInvoice && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <SignatureSlot label="Customer" sig={job.customerSignature} name={job.customerSignedName} />
            <SignatureSlot label="Contractor" sig={job.contractorSignature} name={job.contractorSignedName} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 space-y-2.5 px-5">
        {!isInvoice && (
          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="secondary" onClick={() => setSignParty('customer')}>
              <PenLine size={16} /> Customer Sign
            </Button>
            <Button variant="secondary" onClick={() => setSignParty('contractor')}>
              <PenLine size={16} /> I Sign
            </Button>
          </div>
        )}
        <Button variant="secondary" full onClick={onScopePackage}>
          <Images size={16} /> Scope of Work + Photos PDF
        </Button>
      </div>

      <BottomSheet
        open={signParty !== null}
        onClose={() => setSignParty(null)}
        title={signParty === 'customer' ? 'Customer Signature' : 'Your Signature'}
      >
        <SignaturePad
          onSave={saveSignature}
          onCancel={() => setSignParty(null)}
          initialName={
            signParty === 'customer' ? job.clientName : settings.ownerName || settings.companyName
          }
        />
      </BottomSheet>
    </div>
  );
}

function SignatureSlot({ label, sig, name }: { label: string; sig?: string; name?: string }) {
  return (
    <div>
      <div className="flex h-14 items-end border-b border-gray-400">
        {sig && <img src={sig} alt={`${label} signature`} className="max-h-14 object-contain" />}
      </div>
      <p className="mt-1 text-[9px] font-bold uppercase text-gray-400">{label} Signature</p>
      {name && <p className="text-[11px] text-gray-700">{name}</p>}
    </div>
  );
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={green ? 'text-jade' : ''}>{value}</span>
    </div>
  );
}
