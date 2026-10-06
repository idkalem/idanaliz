// Kalıcı durum. Bu cihazdaki bütün hesaplar tek bir kayıtta durur; `get()` ve `set()` giriş yapmış hesabı okur ve yazar.
// Hesaplar şimdilik yalnızca bu tarayıcıda saklanır; şifre bir kilit değil, hesapların karışmaması için bir işarettir.
import { useSyncExternalStore } from 'react';
import { konuBul } from './content';

export interface Avatar { renk: number; desen: number; goz: number; agiz: number; bas: number; gozluk: number; boyun: number; zemin: number }
/** Çözülen her soru bir kayıt bırakır. */
export interface Cevap {
  k: string; q: string; ok: boolean; sec: number; emin: boolean;
  /** gün numarası */
  g: number;
  /** yanlışsa, seçilen seçeneğin yanılgısı */
  y?: string;
  /** yanlış defterindeki bir soru yeniden çözüldüyse 1 */
  tk?: 1;
}
/** Yanlış defterindeki bir soru. kutu 0–3: tekrar aralığı basamağı; 4: öğrenildi. */
export interface Tekrar { k: string; q: string; kutu: number; son: number; y?: string; n: number; sec: number }
export interface Kisisel { acik: boolean; tempo: 'kisa' | 'tam'; once: 'kural' | 'ornek'; dinle: boolean }
/** Çalışma programının ayarları. gunler: pazartesiden pazara hangi günler çalışılacak. */
export interface Plan { kuruldu: boolean; sinav: number; gunler: boolean[]; dk: number }
export interface State {
  id: string; rol: 'ogrenci' | 'ogretmen'; ad: string; sinif: string; pin: string;
  avatar: Avatar; jeton: number;
  /** satın alınan ya da kazanılan avatar parçaları: `${tür}:${sıra}` */
  sahip: string[];
  /** `${konu}/${kart}` → bitirildiği gün */
  kart: Record<string, number>;
  cevap: Cevap[];
  /** `${konu}/${soru}` → yanlış defteri kaydı */
  tekrar: Record<string, Tekrar>;
  xp: number;
  /** gün → o gün kazanılan puan */
  gun: Record<number, number>;
  hedef: number;
  kisisel: Kisisel;
  /** en son çalışılan konu */
  son: string;
  plan: Plan;
  /** günlük sandığın en son açıldığı gün */
  sandik: number;
  /** eldeki seri dondurma hakkı ve dondurulmuş günler */
  don: number; donGun: number[];
  /** seviye taraması yapıldı mı */
  tarama: boolean;
}
/** Öğretmenin verdiği ödev: bir konunun kavrama testi, son günüyle. */
export interface Odev { id: string; konu: string; verildi: number; son: number }
export interface Kok {
  aktif: string | null;
  tema: 'light' | 'dark';
  /** Yapay zekâ öğretmen için bu cihaza girilen anahtar ve model. */
  ai: { anahtar: string; model: string };
  hesap: Record<string, State>;
  odev: Odev[];
}

/** Tekrar aralıkları (gün): yanlıştan sonra 1, sonra her doğruda 3, 7, 16. */
export const ARALIK = [1, 3, 7, 16];
export const OGRENILDI = 4;
export const AI_MODEL = 'claude-opus-5-5';
/** Bugünün gün numarası (yerel saatle). */
export const bugun = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5);
/** Gün numarası ↔ tarih alanı (yyyy-aa-gg). */
export const gunYaz = (g: number) => new Date(g * 864e5).toISOString().slice(0, 10);
export const gunOku = (s: string) => Math.floor(Date.parse(`${s}T00:00:00Z`) / 864e5);

const KEY = 'idokul.v2';
const prefersDark = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches;
/** Bir sonraki haziranın ortası: sınav tarihi için başlangıç değeri. Öğrenci kendi tarihini girer. */
const varsayilanSinav = () => { const t = new Date(); const y = t.getMonth() >= 5 ? t.getFullYear() + 1 : t.getFullYear(); return Math.floor(Date.UTC(y, 5, 15) / 864e5); };
export const bos = (id = ''): State => ({
  id, rol: 'ogrenci', ad: '', sinif: '', pin: '',
  avatar: { renk: 0, desen: 0, goz: 0, agiz: 0, bas: 0, gozluk: 0, boyun: 0, zemin: 0 }, jeton: 0, sahip: [],
  kart: {}, cevap: [], tekrar: {}, xp: 0, gun: {}, hedef: 50,
  kisisel: { acik: false, tempo: 'tam', once: 'kural', dinle: false }, son: '',
  plan: { kuruldu: false, sinav: varsayilanSinav(), gunler: [true, true, true, true, true, true, false], dk: 40 },
  sandik: 0, don: 0, donGun: [], tarama: false,
});
const bosKok = (): Kok => ({ aktif: null, tema: prefersDark() ? 'dark' : 'light', ai: { anahtar: '', model: AI_MODEL }, hesap: {}, odev: [] });

function load(): Kok {
  const ilk = bosKok();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Kok>;
      const hesap: Record<string, State> = {};
      for (const [id, h] of Object.entries(p.hesap ?? {})) { const b = bos(id); hesap[id] = { ...b, ...h, kisisel: { ...b.kisisel, ...h.kisisel }, avatar: { ...b.avatar, ...h.avatar }, plan: { ...b.plan, ...h.plan } }; }
      return { ...ilk, ...p, ai: { ...ilk.ai, ...p.ai }, hesap, odev: p.odev ?? [], aktif: p.aktif && hesap[p.aktif] ? p.aktif : null };
    }
  } catch { /* bozuk kayıt: varsayılanla devam */ }
  return ilk;
}
let kok = load();
const BOS = bos();

const subs = new Set<() => void>();
const sub = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export function setKok(patch: Partial<Kok>) {
  kok = { ...kok, ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(kok)); } catch { /* kota dolu: oturum içinde çalışmaya devam */ }
  if (patch.tema) document.documentElement.dataset.theme = patch.tema;
  subs.forEach((f) => f());
}
export const getKok = () => kok;
export const useKok = () => useSyncExternalStore(sub, getKok);
/** Giriş yapmış hesap. Kimse giriş yapmadıysa boş bir hesap döner. */
export const get = (): State => (kok.aktif ? kok.hesap[kok.aktif] : undefined) ?? BOS;
export function set(patch: Partial<State>) {
  if (!kok.aktif) return;
  setKok({ hesap: { ...kok.hesap, [kok.aktif]: { ...get(), ...patch } } });
}
export const useStore = () => useSyncExternalStore(sub, get);

/* ---------- Geçici arayüz durumu: puan bildirimi ---------- */
interface Ui { toast: { id: number; text: string } | null }
let ui: Ui = { toast: null };
const uiSubs = new Set<() => void>();
const uiSub = (f: () => void) => { uiSubs.add(f); return () => { uiSubs.delete(f); }; };
export const useUi = () => useSyncExternalStore(uiSub, () => ui);
let toastN = 0;
export function toast(text: string) {
  const id = ++toastN;
  ui = { toast: { id, text } };
  uiSubs.forEach((f) => f());
  setTimeout(() => { if (ui.toast?.id === id) { ui = { toast: null }; uiSubs.forEach((f) => f()); } }, 1700);
}

/* ---------- Hesaplar ---------- */
export const pinOzet = (id: string, pin: string) => { let h = 5381; for (const c of `${id}:${pin}`) h = ((h << 5) + h + c.charCodeAt(0)) | 0; return (h >>> 0).toString(36); };
export function hesapAc(v: { ad: string; sinif: string; pin: string; rol: State['rol']; renk: number }): string {
  const id = `h${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
  const st: State = { ...bos(id), ad: v.ad.trim(), sinif: v.sinif.trim(), rol: v.rol, pin: pinOzet(id, v.pin) };
  st.avatar = { ...st.avatar, renk: v.renk };
  setKok({ hesap: { ...kok.hesap, [id]: st }, aktif: id });
  return id;
}
/** Bir gün kaçırıldıysa ve elde dondurma hakkı varsa seriyi korur. */
function seriKoru() {
  const st = get(), d = bugun();
  const dolu = (g: number) => !!st.gun[g] || st.donGun.includes(g);
  if (st.don > 0 && !dolu(d) && !dolu(d - 1) && dolu(d - 2)) set({ don: st.don - 1, donGun: [...st.donGun, d - 1] });
}
export function girisYap(id: string, pin: string): boolean {
  const h = kok.hesap[id];
  if (!h || h.pin !== pinOzet(id, pin)) return false;
  setKok({ aktif: id });
  seriKoru();
  return true;
}
export const cikis = () => setKok({ aktif: null });
export function hesapSil(id: string) {
  const hesap = { ...kok.hesap };
  delete hesap[id];
  setKok({ hesap, aktif: kok.aktif === id ? null : kok.aktif });
}
/** Hesabın çalışma kaydını siler; ad, şifre ve avatar kalır. */
export function sifirla() {
  const st = get();
  set({ ...bos(st.id), ad: st.ad, sinif: st.sinif, pin: st.pin, rol: st.rol, avatar: st.avatar, sahip: st.sahip });
}

/* ---------- Çalışma eylemleri ---------- */
/** Puan verir. Her 5 puan bir jeton kazandırır. */
function puan(n: number, patch: Partial<State> = {}) {
  const st = get(), d = bugun();
  set({ ...patch, xp: st.xp + n, jeton: st.jeton + Math.floor(n / 5), gun: { ...st.gun, [d]: (st.gun[d] ?? 0) + n } });
}
/** Anlatım kartı bitirildi. İlk bitirişte puan verir. */
export function kartBitir(konu: string, kart: string): number {
  const st = get(), id = `${konu}/${kart}`;
  if (st.kart[id] != null) { set({ son: konu }); return 0; }
  puan(10, { kart: { ...st.kart, [id]: bugun() }, son: konu });
  return 10;
}
/** Bir soru cevaplandı: kayda geçer, yanlışsa deftere girer, tekrar zamanı gelmiş bir soru doğruysa bir basamak ilerler. */
export function cevapla(konu: string, q: string, sec: number, emin: boolean, tk: boolean): { ok: boolean; xp: number; ilerledi: boolean } {
  const st = get(), soru = konuBul(konu)!.sorular.find((s) => s.id === q)!;
  const ok = sec === soru.d, d = bugun(), id = `${konu}/${q}`;
  const y = ok ? undefined : soru.y[sec] ?? undefined;
  const tekrar = { ...st.tekrar }, eski = tekrar[id];
  let xp = ok ? 10 + (emin ? 5 : 0) : 2, ilerledi = false;
  if (!ok) tekrar[id] = { k: konu, q, kutu: 0, son: d + ARALIK[0], y: y ?? eski?.y, n: (eski?.n ?? 0) + 1, sec };
  else if (eski && eski.kutu < OGRENILDI && eski.son <= d) {
    const kutu = eski.kutu + 1;
    tekrar[id] = { ...eski, kutu, son: d + (ARALIK[kutu] ?? 0) };
    xp += 5; ilerledi = true;
  }
  const kayit: Cevap = { k: konu, q, ok, sec, emin, g: d, ...(y ? { y } : {}), ...(tk ? { tk: 1 as const } : {}) };
  puan(xp, { cevap: [...st.cevap, kayit], tekrar, son: konu });
  return { ok, xp, ilerledi };
}

/* ---------- Jeton: avatar parçası, sandık, seri dondurma ---------- */
export function satinAl(urun: string, fiyat: number): boolean {
  const st = get();
  if (st.sahip.includes(urun)) return true;
  if (st.jeton < fiyat) return false;
  set({ jeton: st.jeton - fiyat, sahip: [...st.sahip, urun] });
  return true;
}
export const SANDIK_ODUL = 25, DON_FIYAT = 60, DON_EN_COK = 2;
export function sandikAc() { const st = get(); if (st.sandik !== bugun()) set({ sandik: bugun(), jeton: st.jeton + SANDIK_ODUL }); }
export function donAl(): boolean {
  const st = get();
  if (st.jeton < DON_FIYAT || st.don >= DON_EN_COK) return false;
  set({ jeton: st.jeton - DON_FIYAT, don: st.don + 1 });
  return true;
}

/* ---------- Ödev ---------- */
export function odevVer(konu: string, gun: number) { const d = bugun(); setKok({ odev: [...kok.odev, { id: `o${Date.now().toString(36)}`, konu, verildi: d, son: d + gun }] }); }
export const odevSil = (id: string) => setKok({ odev: kok.odev.filter((o) => o.id !== id) });
