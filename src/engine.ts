// Durumdan türetilen her şey: konu durumu, tekrar listesi, rapor, seviye, seri, rozetler, haftalık sıralama.
import { DERSLER, HAZIR, KONULAR, dersOf, type Konu, type Soru, type Yanilgi, type Ders } from './content';
import { bugun, OGRENILDI, type State, type Tekrar, type Avatar } from './store';

/* ---------- Tarih ---------- */
const gunTarih = (g: number) => new Date(g * 864e5);
export const gunAd = (g: number) => gunTarih(g).toLocaleDateString('tr-TR', { timeZone: 'UTC', weekday: 'short' });
export const tarih = (g: number) => gunTarih(g).toLocaleDateString('tr-TR', { timeZone: 'UTC', day: 'numeric', month: 'long' });
/** Haftanın pazartesisi. */
export const haftaBasi = (g: number) => g - ((g + 3) % 7);
export function neZaman(son: number, d = bugun()): string {
  const f = son - d;
  return f <= 0 ? 'bugün' : f === 1 ? 'yarın' : `${f} gün sonra`;
}

/* ---------- Seviye ve seri ---------- */
export const SEVIYE_XP = 250;
export const seviye = (xp: number) => ({ no: Math.floor(xp / SEVIYE_XP) + 1, ic: xp % SEVIYE_XP, gerek: SEVIYE_XP });
/** Art arda çalışılan gün sayısı. Bugün henüz çalışılmadıysa seri dünden sayılır. */
export function seri(gun: Record<number, number>, d = bugun()): number {
  let g = gun[d] ? d : d - 1, n = 0;
  while (gun[g]) { n++; g--; }
  return n;
}
export const haftaXp = (st: State, d = bugun()) => { let t = 0; for (let g = haftaBasi(d); g <= d; g++) t += st.gun[g] ?? 0; return t; };

/* ---------- Konu durumu ---------- */
/** Doğru oranı eşikleri: %60 ve üstü iyi, %40 altı zayıf. Bütün ekranlarda aynıdır. */
export const LV_LO = 40, LV_HI = 60;
export type Lv = 'good' | 'mid' | 'bad' | 'none';
export const lv = (p: number | null | undefined): Lv => (p == null || !isFinite(p) ? 'none' : p >= LV_HI ? 'good' : p >= LV_LO ? 'mid' : 'bad');
export const LV_NAME: Record<Lv, string> = { good: 'İyi', mid: 'Orta', bad: 'Zayıf', none: 'Başlanmadı' };

export interface KDurum {
  kart: number; kartTop: number;
  /** çözülen farklı soru sayısı ve bunlardan son denemesi doğru olanlar */
  coz: number; dogru: number; top: number;
  /** son denemelere göre doğru yüzdesi; hiç soru çözülmediyse null */
  oran: number | null;
  /** bugün tekrarı gelen ve defterde bekleyen soru sayısı */
  bekleyen: number; defter: number;
  basladi: boolean;
}
export function konuDurum(st: State, k: Konu, d = bugun()): KDurum {
  const son = new Map<string, boolean>();
  for (const c of st.cevap) if (c.k === k.id) son.set(c.q, c.ok);
  let dogru = 0;
  for (const v of son.values()) if (v) dogru++;
  let bekleyen = 0, defter = 0;
  for (const t of Object.values(st.tekrar)) if (t.k === k.id && t.kutu < OGRENILDI) { defter++; if (t.son <= d) bekleyen++; }
  const kart = k.kartlar.filter((c) => st.kart[`${k.id}/${c.id}`] != null).length;
  return { kart, kartTop: k.kartlar.length, coz: son.size, dogru, top: k.sorular.length, oran: son.size ? (dogru / son.size) * 100 : null, bekleyen, defter, basladi: kart > 0 || son.size > 0 };
}
export function dersDurum(st: State, ders: Ders) {
  const hazir = ders.konular.filter((k) => KONULAR[k.id]).map((k) => KONULAR[k.id]);
  let coz = 0, dogru = 0, kart = 0, kartTop = 0;
  for (const k of hazir) { const x = konuDurum(st, k); coz += x.coz; dogru += x.dogru; kart += x.kart; kartTop += x.kartTop; }
  return { hazir: hazir.length, top: ders.konular.length, oran: coz ? (dogru / coz) * 100 : null, coz, kart, kartTop };
}

/* ---------- Yanlış defteri ---------- */
export interface Bekleyen { id: string; t: Tekrar; konu: Konu; soru: Soru }
const cozumle = (id: string, t: Tekrar): Bekleyen | null => {
  const konu = KONULAR[t.k], soru = konu?.sorular.find((s) => s.id === t.q);
  return konu && soru ? { id, t, konu, soru } : null;
};
/** Defterdeki bütün sorular (öğrenilenler dahil), tekrar günü yakın olan önce. */
export function defter(st: State): Bekleyen[] {
  return Object.entries(st.tekrar).map(([id, t]) => cozumle(id, t)).filter((x): x is Bekleyen => !!x).sort((a, b) => a.t.kutu - b.t.kutu || a.t.son - b.t.son);
}
/** Tekrar günü gelmiş sorular. */
export const bekleyenler = (st: State, d = bugun()) => defter(st).filter((x) => x.t.kutu < OGRENILDI && x.t.son <= d).sort((a, b) => a.t.son - b.t.son);

/* ---------- Kaldığın yer ---------- */
export interface Devam { konu: Konu; tur: 'anlatim' | 'test'; kart?: number; yazi: string }
function devamKonu(st: State, k: Konu): Devam | null {
  const x = konuDurum(st, k);
  if (x.kart < x.kartTop) {
    const i = k.kartlar.findIndex((c) => st.kart[`${k.id}/${c.id}`] == null);
    return { konu: k, tur: 'anlatim', kart: i, yazi: `Anlatım, ${i + 1}. kart: ${k.kartlar[i].baslik}` };
  }
  if (x.coz < x.top) return { konu: k, tur: 'test', yazi: x.coz ? `Kavrama testi: ${x.top - x.coz} soru kaldı` : `Kavrama testi: ${x.top} soru` };
  return null;
}
export function devamEt(st: State): Devam | null {
  const sira = [KONULAR[st.son], ...HAZIR.filter((k) => konuDurum(st, k).basladi)].filter(Boolean);
  for (const k of sira) { const dv = devamKonu(st, k); if (dv) return dv; }
  return null;
}

/* ---------- Rapor ---------- */
export interface Hata { konu: Konu; id: string; yan: Yanilgi; n: number; sorular: string[] }
/** Yanlış cevapların arkasındaki yanılgılar, en sık yapılan önce. `since` verilirse o günden sonrası. */
export function hatalar(st: State, since = 0): Hata[] {
  const m = new Map<string, Hata>();
  for (const c of st.cevap) {
    if (c.ok || !c.y || c.g < since) continue;
    const konu = KONULAR[c.k], yan = konu?.yan[c.y];
    if (!yan) continue;
    const key = `${c.k}:${c.y}`, h = m.get(key) ?? { konu, id: c.y, yan, n: 0, sorular: [] };
    h.n++; if (!h.sorular.includes(c.q)) h.sorular.push(c.q);
    m.set(key, h);
  }
  return [...m.values()].sort((a, b) => b.n - a.n);
}
export interface Bak { konu: Konu; d: KDurum; neden: string[]; skor: number; hata?: Hata }
/** Tekrar bakılması gereken konular: doğru oranı düşük olan ya da defterinde soru bekleyenler. */
export function tekrarBak(st: State): Bak[] {
  const hs = hatalar(st);
  const out: Bak[] = [];
  for (const k of HAZIR) {
    const d = konuDurum(st, k);
    if (d.oran == null || (d.oran >= 70 && !d.defter)) continue;
    const hata = hs.find((h) => h.konu.id === k.id && st.cevap.some((c) => c.k === k.id && c.y === h.id && !sonDogru(st, k.id, c.q)));
    const neden: string[] = [];
    if (d.oran < 70) neden.push(`Soruların %${Math.round(d.oran)}'i doğru`);
    if (d.bekleyen) neden.push(`${d.bekleyen} soru bugün tekrar bekliyor`);
    else if (d.defter) neden.push(`${d.defter} soru yanlış defterinde`);
    out.push({ konu: k, d, neden, hata, skor: Math.max(0, 70 - d.oran) + d.bekleyen * 8 + d.defter * 3 });
  }
  return out.sort((a, b) => b.skor - a.skor);
}
function sonDogru(st: State, k: string, q: string): boolean {
  for (let i = st.cevap.length - 1; i >= 0; i--) if (st.cevap[i].k === k && st.cevap[i].q === q) return st.cevap[i].ok;
  return false;
}
export interface Ozet { soru: number; dogru: number; oran: number | null; gunSay: number; xp: number; eminYanlis: number; kart: number }
/** Son `n` günün özeti (n = 0: baştan beri). */
export function ozet(st: State, n: number, d = bugun()): Ozet {
  const since = n ? d - n + 1 : 0;
  const cs = st.cevap.filter((c) => c.g >= since);
  const dogru = cs.filter((c) => c.ok).length;
  let gunSay = 0, xp = 0;
  for (const [g, v] of Object.entries(st.gun)) if (+g >= since && v) { gunSay++; xp += v; }
  return { soru: cs.length, dogru, oran: cs.length ? (dogru / cs.length) * 100 : null, gunSay, xp, eminYanlis: cs.filter((c) => !c.ok && c.emin).length, kart: Object.values(st.kart).filter((g) => g >= since).length };
}
/** Raporun başındaki tek cümlelik özet. */
export function ozetCumle(st: State, n: number): string {
  const o = ozet(st, n), ne = n === 7 ? 'Son 7 günde' : n === 30 ? 'Son 30 günde' : 'Bugüne kadar';
  if (!o.soru && !o.kart) return `${ne} kayıtlı bir çalışma yok. Bir konu seçip anlatımıyla başlayabilirsin.`;
  const bak = tekrarBak(st)[0];
  const p1 = o.soru ? `${ne} ${o.gunSay} gün çalıştın, ${o.soru} soru çözdün ve %${Math.round(o.oran!)}'ini doğru yaptın.` : `${ne} ${o.gunSay} gün çalıştın ve ${o.kart} anlatım kartı bitirdin.`;
  const p2 = bak ? ` En çok ${bak.konu.ad} konusunda zorlandın${bak.hata ? `; en sık yaptığın hata: ${bak.hata.yan.ad.toLocaleLowerCase('tr')}.` : '.'}` : ' Tekrar bakman gereken bir konu görünmüyor.';
  return p1 + p2;
}

/* ---------- Rozetler ---------- */
export interface Rozet { id: string; ad: string; ne: string; var: number; gerek: number; ok: boolean }
export function rozetler(st: State): Rozet[] {
  const kart = Object.keys(st.kart).length;
  let enSeri = 0, run = 0, once = -9;
  for (const g of Object.keys(st.gun).map(Number).filter((g) => st.gun[g]).sort((a, b) => a - b)) { run = g === once + 1 ? run + 1 : 1; once = g; enSeri = Math.max(enSeri, run); }
  const tamam = HAZIR.filter((k) => { const d = konuDurum(st, k); return d.kart === d.kartTop && d.coz === d.top && (d.oran ?? 0) >= 80; }).length;
  const dersler = new Set([...st.cevap.map((c) => dersOf(c.k).id), ...Object.keys(st.kart).map((id) => dersOf(id.split('/')[0]).id)]).size;
  const r = (id: string, ad: string, ne: string, v: number, gerek: number): Rozet => ({ id, ad, ne, var: Math.min(v, gerek), gerek, ok: v >= gerek });
  return [
    r('ilk', 'İlk adım', 'İlk anlatım kartını bitir', kart, 1),
    r('seri3', 'Üç gün üst üste', '3 gün art arda çalış', enSeri, 3),
    r('seri7', 'Tam bir hafta', '7 gün art arda çalış', enSeri, 7),
    r('soru50', 'Elli soru', '50 soru çöz', st.cevap.length, 50),
    r('konu', 'Konu tamam', 'Bir konunun anlatımını bitir, testinde %80 yap', tamam, 1),
    r('avci', 'Yanlış avcısı', 'Yanlış yaptığın 5 soruyu tekrarda doğru çöz', st.cevap.filter((c) => c.tk && c.ok).length, 5),
    r('emin', 'Emin ve doğru', '10 soruyu "eminim" deyip doğru çöz', st.cevap.filter((c) => c.emin && c.ok).length, 10),
    r('uc', 'Üç ders', '3 farklı derste çalış', dersler, 3),
  ];
}

/* ---------- Haftalık sıralama (örnek sınıf) ---------- */
const SINIF = ['Elif K.', 'Mert A.', 'Zeynep D.', 'Arda Y.', 'Defne S.', 'Kerem T.', 'Nisa B.', 'Emir Ö.', 'İrem Ç.', 'Baran G.', 'Azra M.'];
const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export interface LigSatir { ad: string; xp: number; av: Avatar; ben: boolean }
/** Bu haftanın çalışma puanına göre sıralama. Sınıf arkadaşları tanıtım için üretilmiş örnek veridir; puan doğru sayısını değil, çalışmayı ölçer. */
export function lig(st: State, d = bugun()): LigSatir[] {
  const hb = haftaBasi(d), hafta = Math.floor(hb / 7), gecen = (d - hb + 1) / 7;
  const rows: LigSatir[] = SINIF.map((ad, i) => ({ ad, xp: Math.round(((90 + rnd(hafta * 31 + i) * 520) * gecen) / 5) * 5, av: { renk: (i * 3 + 1) % 8, goz: i % 3, aks: (i * 2) % 5 }, ben: false }));
  rows.push({ ad: st.ad || 'Sen', xp: haftaXp(st, d), av: st.avatar, ben: true });
  return rows.sort((a, b) => b.xp - a.xp);
}

export { DERSLER, HAZIR, KONULAR, dersOf };
