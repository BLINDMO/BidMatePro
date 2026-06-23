import { nanoid } from 'nanoid';

export const newId = () => nanoid(10);

export function generateJobNumber(prefix: string, counter: number): string {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(counter).padStart(4, '0')}`;
}

export function generateInvoiceNumber(prefix: string, counter: number): string {
  return `${prefix}-${String(counter).padStart(5, '0')}`;
}
