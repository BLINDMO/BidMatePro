export const fmtCurrency = (n: number): string =>
  '$' + Math.round(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export const fmtCurrencyFull = (n: number): string =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtDate = (d: Date | string): string =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const fmtDateShort = (d: Date | string): string =>
  new Date(d).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });

export const fmtPhone = (p: string): string => {
  const digits = p.replace(/\D/g, '');
  const m = digits.match(/^(\d{3})(\d{3})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : p;
};

export const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
