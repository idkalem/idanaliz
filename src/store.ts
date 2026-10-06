// Öğrencinin kalıcı durumu (yalnızca bu tarayıcıda saklanır) ve geçici arayüz durumu.
import { useSyncExternalStore } from 'react';
import { konuBul } from './content';

export interface Avatar { renk: number; goz: number; aks: number }
/** Çözülen her soru bir kayıt bırakır. */
export interface Cevap {
  k: string; q: string; ok: boolean; sec: number; emin: boolean;
  /** gün numarası */
  g: number;
  /** yanlışsa, seçilen seçeneğin yanılgısı */
  y?: string;
  /** tekrar oturumunda çözüldüyse 1 */
  tk?: 1;
}
/** Yanlış defterindeki bir soru. kutu 0–3: tekrar aralığı basamağı; 4: öğrenildi. */
export interface Tekrar { k: string; q: string; kutu: number; son: number; y?: string; n: number; sec: number }
export interface Kisisel { acik: boolean; tempo: 'kisa' | 'tam'; once: 'kural' | 'ornek'; dinle: boolean }
export interface State {
  theme: 'light' | 'dark';
  ad: string;
  avatar: Avatar;
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
}

/** Tekrar aralıkları (gün): yanlıştan sonra 1, sonra her doğruda 3, 7, 16. */
export const ARALIK = [1, 3, 7, 16];
export const OGRENILDI = 4;
/** Bugünün gün numarası (yerel saatle). */
export const bugun = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5);

const KEY = 'idcalis.v1';
const prefersDark = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches;
export const bos = (): State => ({
  theme: prefersDark() ? 'dark' : 'light', ad: '', avatar: { renk: 0, goz: 0, aks: 0 },
  kart: {}, cevap: [], tekrar: {}, xp: 0, gun: {}, hedef: 50,
  kisisel: { acik: false, tempo: 'tam', once: 'kural', dinle: false }, son: '',
});

function load(): State {
  const ilk = bos();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const p = JSON.parse(raw); return { ...ilk, ...p, kisisel: { ...ilk.kisisel, ...p.kisisel }, avatar: { ...ilk.avatar, ...p.avatar } }; }
  } catch { /* bozuk kayıt: varsayılanla devam */ }
  return ilk;
}
let state = load();

const subs = new Set<() => void>();
const sub = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* kota dolu: oturum içinde çalışmaya devam */ }
  if (patch.theme) document.documentElement.dataset.theme = patch.theme;
  subs.forEach((f) => f());
}
export const get = () => state;
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

/* ---------- Eylemler ---------- */
function puan(n: number, patch: Partial<State> = {}) {
  const d = bugun();
  set({ ...patch, xp: state.xp + n, gun: { ...state.gun, [d]: (state.gun[d] ?? 0) + n } });
}
/** Anlatım kartı bitirildi. İlk bitirişte puan verir. */
export function kartBitir(konu: string, kart: string): number {
  const id = `${konu}/${kart}`;
  if (state.kart[id] != null) { set({ son: konu }); return 0; }
  puan(10, { kart: { ...state.kart, [id]: bugun() }, son: konu });
  return 10;
}
/** Bir soru cevaplandı: kayda geçer, yanlışsa deftere girer, tekrar zamanı gelmiş bir soru doğruysa bir basamak ilerler. */
export function cevapla(konu: string, q: string, sec: number, emin: boolean, tk: boolean): { ok: boolean; xp: number; ilerledi: boolean } {
  const soru = konuBul(konu)!.sorular.find((s) => s.id === q)!;
  const ok = sec === soru.d, d = bugun(), id = `${konu}/${q}`;
  const y = ok ? undefined : soru.y[sec] ?? undefined;
  const tekrar = { ...state.tekrar }, eski = tekrar[id];
  let xp = ok ? 10 + (emin ? 5 : 0) : 2, ilerledi = false;
  if (!ok) tekrar[id] = { k: konu, q, kutu: 0, son: d + ARALIK[0], y: y ?? eski?.y, n: (eski?.n ?? 0) + 1, sec };
  else if (eski && eski.kutu < OGRENILDI && eski.son <= d) {
    const kutu = eski.kutu + 1;
    tekrar[id] = { ...eski, kutu, son: d + (ARALIK[kutu] ?? 0) };
    xp += 5; ilerledi = true;
  }
  const kayit: Cevap = { k: konu, q, ok, sec, emin, g: d, ...(y ? { y } : {}), ...(tk ? { tk: 1 as const } : {}) };
  puan(xp, { cevap: [...state.cevap, kayit], tekrar, son: konu });
  return { ok, xp, ilerledi };
}
export const puanVer = (n: number) => puan(n);
export const sifirla = () => set({ ...bos(), theme: state.theme });
