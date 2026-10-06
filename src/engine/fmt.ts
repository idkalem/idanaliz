// Sayı ve tarih biçimleri (tr-TR). Eksi işareti gerçek "−" ile yazılır.
const nf: Intl.NumberFormat[] = [0, 1, 2, 3].map((d) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d }));

export function fmt(x: number | null | undefined, dig = 1): string {
  if (x == null || !isFinite(x)) return '–';
  const r = Math.abs(x) < 0.5 * 10 ** -dig ? 0 : x;
  return nf[dig].format(r).replace('-', '−');
}
/** İşaretli: +2,4 / −1,0 / 0,0 */
export function sgn(x: number | null | undefined, dig = 1): string {
  if (x == null || !isFinite(x)) return '–';
  const s = fmt(x, dig);
  return x > 0 && s !== fmt(0, dig) ? `+${s}` : s;
}
export const pct = (x: number | null | undefined, dig = 0) => (x == null || !isFinite(x) ? '–' : `%${fmt(x, dig)}`);
export const int = (x: number) => nf[0].format(x);

const AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
/** '2026-03-07' → '7 Mart' (yıl istenirse '7 Mart 2026') */
export function date(iso: string, year = false): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${AY[m - 1]}${year ? ` ${y}` : ''}`;
}
export const dateShort = (iso: string) => { const [, m, d] = iso.split('-').map(Number); return `${d} ${AY[m - 1].slice(0, 3)}`; };

/** Türkçe büyük/küçük harf duyarsız arama anahtarı */
export const fold = (s: string) => s.toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/â/g, 'a');
