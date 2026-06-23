import type { LineItem, LineItemType, Payment } from '../types/job.types';

const r2 = (n: number) => Math.round(n * 100) / 100;

export interface JobTotals {
  laborTotal: number;
  materialsTotal: number;
  subsTotal: number;
  permitsTotal: number;
  equipmentTotal: number;
  allowancesTotal: number;
  creditsTotal: number;
  subtotal: number;
  overheadMarkupAmt: number;
  taxAmt: number;
  estimateTotal: number;
}

export function calcJobTotals(items: LineItem[], markupPct: number, taxPct: number): JobTotals {
  const sum = (type: LineItemType) =>
    items.filter((i) => i.type === type).reduce((s, i) => s + i.total, 0);

  const laborTotal = r2(sum('labor'));
  const materialsTotal = r2(sum('material'));
  const subsTotal = r2(sum('subcontractor'));
  const permitsTotal = r2(sum('permit'));
  const equipmentTotal = r2(sum('equipment'));
  const allowancesTotal = r2(sum('allowance'));
  const creditsTotal = r2(sum('credit'));

  const subtotal = r2(
    laborTotal +
      materialsTotal +
      subsTotal +
      permitsTotal +
      equipmentTotal +
      allowancesTotal -
      creditsTotal,
  );

  const overheadMarkupAmt = r2(materialsTotal * (markupPct / 100));
  const preTax = r2(subtotal + overheadMarkupAmt);
  const taxAmt = r2(preTax * (taxPct / 100));
  const estimateTotal = r2(preTax + taxAmt);

  return {
    laborTotal,
    materialsTotal,
    subsTotal,
    permitsTotal,
    equipmentTotal,
    allowancesTotal,
    creditsTotal,
    subtotal,
    overheadMarkupAmt,
    taxAmt,
    estimateTotal,
  };
}

export const calcItemTotal = (qty: number, price: number) => r2(qty * price);

export const calcBalance = (estimateTotal: number, payments: Payment[]) =>
  r2(estimateTotal - payments.reduce((s, p) => s + p.amount, 0));

export interface RoomDims {
  length: number;
  width: number;
  height?: number;
}

export function calcRoomMeasurements(d: RoomDims) {
  const floorArea = r2(d.length * d.width);
  const perimeter = r2(2 * (d.length + d.width));
  const wallArea = d.height ? r2(perimeter * d.height) : null;
  const volume = d.height ? r2(floorArea * d.height) : null;

  return {
    floorArea,
    floorArea10: r2(floorArea * 1.1),
    floorArea15: r2(floorArea * 1.15),
    perimeter,
    wallArea,
    wallArea10: wallArea ? r2(wallArea * 1.1) : null,
    volume,
    paintGallons: wallArea ? Math.ceil((wallArea * 2) / 400) : null,
  };
}

export const inToFt = (inches: number) => r2(inches / 12);
