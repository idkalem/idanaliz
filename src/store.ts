// Kullanıcıya ait kalıcı durum (tarayıcıda saklanır) ve geçici arayüz durumu.
import { useSyncExternalStore } from 'react';
import { ds, setAssign, type Per, type Ent, type Scope, type Metric } from './engine/core';
import { clearAnalysisCaches } from './engine/analysis';

export interface Note { id: string; en: Ent; text: string; at: string }
export interface View { id: string; name: string; q: string }
export interface State {
  theme: 'light' | 'dark';
  per: Per;
  level: 0 | 11 | 12;
  watch: Ent[];
  notes: Note[];
  envOpen: string[];
  views: View[];
  /** `${sınıf}|${ders}` → öğretmen; yalnızca okulun değiştirdikleri */
  assign: Record<string, number>;
}
const KEY = 'netlik.v1';
const prefersDark = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches;
const initial: State = { theme: prefersDark() ? 'dark' : 'light', per: '3', level: 0, watch: [], notes: [], envOpen: [], views: [], assign: {} };

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initial, ...JSON.parse(raw) };
  } catch { /* bozuk kayıt: varsayılanla devam */ }
  return initial;
}
let state = load();
for (const [k, t] of Object.entries(state.assign)) { const [c, j] = k.split('|').map(Number); if (ds.classes[c] && ds.teachers[t]) setAssign(c, j, t); }

const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const sub = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* kota dolu: oturum içinde çalışmaya devam */ }
  if (patch.theme) document.documentElement.dataset.theme = patch.theme;
  emit();
}
export const get = () => state;
export const useStore = () => useSyncExternalStore(sub, get);

export const toggleWatch = (en: Ent) => set({ watch: state.watch.includes(en) ? state.watch.filter((x) => x !== en) : [...state.watch, en] });
export const addNote = (en: Ent, text: string) => set({ notes: [{ id: `${Date.now()}`, en, text, at: new Date().toISOString() }, ...state.notes] });
export const delNote = (id: string) => set({ notes: state.notes.filter((n) => n.id !== id) });
export const openEnv = (id: string) => set({ envOpen: [...new Set([...state.envOpen, id])] });
export const saveView = (name: string, q: string) => set({ views: [{ id: `${Date.now()}`, name, q }, ...state.views] });
export const delView = (id: string) => set({ views: state.views.filter((v) => v.id !== id) });
export function assignTeacher(c: number, j: number, t: number) {
  setAssign(c, j, t);
  clearAnalysisCaches();
  set({ assign: { ...state.assign, [`${c}|${j}`]: t } });
}

/* ---------- Geçici arayüz durumu ---------- */
export interface WhyReq { en: Ent; sc: Scope; m: Metric; per: Per }
export interface QReq { e: number; q: number }
interface Ui { why: WhyReq[]; palette: boolean; q: QReq | null }
let ui: Ui = { why: [], palette: false, q: null };
const uiSubs = new Set<() => void>();
const uiSub = (f: () => void) => { uiSubs.add(f); return () => { uiSubs.delete(f); }; };
const setUi = (p: Partial<Ui>) => { ui = { ...ui, ...p }; uiSubs.forEach((f) => f()); };
export const useUi = () => useSyncExternalStore(uiSub, () => ui);
/** Neden? çekmecesi bir yığın tutar: parçaya tıklayınca bir kat derine inilir. */
export const openWhy = (r: WhyReq, push = false) => setUi({ why: push ? [...ui.why, r] : [r], q: null });
export const backWhy = () => setUi({ why: ui.why.slice(0, -1) });
export const closeWhy = () => setUi({ why: [] });
export const setPalette = (palette: boolean) => setUi({ palette });
export const openQ = (q: QReq | null) => setUi({ q, why: [] });
