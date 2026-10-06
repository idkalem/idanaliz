// Çekirdeğin üstündeki analizler: hareketler, "neden?" ayrıştırması, bulgular,
// kapalı zarf, şans neti, projeksiyon, konu öncelikleri, kök konu, hata profili, rapor.
import {
  ds, NE, NS, NT, LAST, TC, PRES, QN, SUBJECTS, TOPICS, TESTS, ERRS, BLANK,
  type Ent, type Scope, type Metric, type Win, type Per,
  METRICS, val, at, agg, mval, cnt, members, classesOf, entKind, entI, entName, entHref, win,
  scopeTopics, scopeChildren, scopeName, SUBJECT_SCOPES, TEST_SCOPES, series,
} from './core';
import { fmt, sgn } from './fmt';

const sig = (x: number) => 1 / (1 + Math.exp(-x));
const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const sdev = (a: number[]) => { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1)); };
export function phi(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

/* ================= Hareketler ================= */
export interface Move { en: Ent; sc: Scope; cur: number; prev: number; diff: number; rel: number | null }
export function move(en: Ent, sc: Scope, m: Metric, w: Win): Move | null {
  const cur = val(en, w.cur, sc, m), prev = val(en, w.prev, sc, m);
  if (cur == null || prev == null) return null;
  return { en, sc, cur, prev, diff: cur - prev, rel: Math.abs(prev) > 0.05 ? (100 * (cur - prev)) / Math.abs(prev) : null };
}
export function movers(ents: Ent[], scopes: Scope[], m: Metric, w: Win): Move[] {
  const out: Move[] = [];
  for (const en of ents) for (const sc of scopes) { const x = move(en, sc, m, w); if (x) out.push(x); }
  return out;
}
/** Deneme zorluğunu ayırır: aynı dönemde düzeyin (öğretmende okulun) değişimi çıkarılır. */
export function baseOf(en: Ent): Ent {
  const k = entKind(en);
  return k === 'class' ? `l:${ds.classes[entI(en)].level}` : k === 'student' ? `l:${ds.classes[ds.students[entI(en)].cls].level}` : 'o';
}
export function moveAdj(en: Ent, sc: Scope, m: Metric, w: Win): Move | null {
  const a = move(en, sc, m, w), b = move(baseOf(en), sc, m, w);
  if (!a || !b) return null;
  return { ...a, diff: a.diff - b.diff, rel: a.rel != null && b.rel != null ? a.rel - b.rel : null };
}
/** Ölçünün yönüne göre "iyiye mi gitti": yanlış ve boşta azalış iyidir. */
export const better = (diff: number, m: Metric) => (METRICS[m].up ? diff : -diff);

/** Art arda kaç denemedir yükseliyor (+) ya da düşüyor (−). Girilmeyen denemeler atlanır. */
export function streak(xs: (number | null)[]): number {
  const v = xs.filter((x): x is number => x != null);
  let k = 0;
  for (let i = v.length - 1; i > 0; i--) {
    const d = Math.sign(v[i] - v[i - 1]);
    if (!d || (k && Math.sign(k) !== d)) break;
    k += d;
  }
  return k;
}
/** Denemeden denemeye oynaklık: ardışık farkların standart sapması */
export function volatility(xs: (number | null)[]): number | null {
  const v = xs.filter((x): x is number => x != null);
  if (v.length < 4) return null;
  return sdev(v.slice(1).map((x, i) => x - v[i]));
}
/** Düzey ortalamasına göre fark serisi: deneme zorluğunun etkisini ayırır. */
export function relSeries(s: number, sc: Scope = 'all', m: Metric = 'net'): (number | null)[] {
  const lv = `l:${ds.classes[ds.students[s].cls].level}`;
  return ds.exams.map((x) => { const a = at(`s:${s}`, x.i, sc, m), b = at(lv, x.i, sc, m); return a == null || b == null ? null : a - b; });
}
/** 10'luk net basamağı geçişi */
export function crossing(prev: number, cur: number, step = 10): { dir: 1 | -1; line: number } | null {
  const a = Math.floor(prev / step), b = Math.floor(cur / step);
  if (a === b) return null;
  return b > a ? { dir: 1, line: b * step } : { dir: -1, line: a * step };
}

/* ================= Neden? ================= */
export interface WhyPart { label: string; en?: Ent; sc?: Scope; v: number; cur: number | null; prev: number | null }
export interface Why {
  total: number; cur: number; prev: number;
  byScope: WhyPart[]; byMember: WhyPart[]; memberKind: string; rest: number; byErr: WhyPart[];
}
/** Değişimi parçalarına ayırır. Kapsam parçaları toplamı tam verir; üye parçalarında kalan "katılım farkı"dır. */
export function why(en: Ent, sc: Scope, m: Metric, w: Win): Why | null {
  const mv = move(en, sc, m, w);
  if (!mv) return null;
  const A = agg(en, w.cur, sc)!, B = agg(en, w.prev, sc)!;
  const byScope: WhyPart[] = [];
  for (const ch of scopeChildren(sc)) {
    const a = agg(en, w.cur, ch), b = agg(en, w.prev, ch);
    let v: number;
    if (m === 'pct') v = 100 * ((a?.d ?? 0) / (A.n || 1) - (b?.d ?? 0) / (B.n || 1));
    else {
      const f = (c: typeof a, k: number) => (c ? (m === 'net' ? c.d - c.y / 4 : c[m]) / k : 0);
      v = f(a, A.k) - f(b, B.k);
    }
    byScope.push({ label: scopeName(ch), sc: ch, en, v, cur: mval(a, m === 'pct' ? 'pct' : m), prev: mval(b, m === 'pct' ? 'pct' : m) });
  }
  byScope.sort((x, y) => x.v - y.v);

  const kind = entKind(en);
  const byMember: WhyPart[] = [];
  let memberKind = '';
  if (kind === 'class') {
    memberKind = 'Öğrenciler';
    const rows = members(en).map((s) => ({ s, x: move(`s:${s}`, sc, m, w) })).filter((r) => r.x);
    for (const r of rows) byMember.push({ label: ds.students[r.s].name, en: `s:${r.s}`, sc, v: r.x!.diff / rows.length, cur: r.x!.cur, prev: r.x!.prev });
  } else if (kind !== 'student') {
    memberKind = 'Sınıflar';
    const cs = classesOf(en), tot = cs.reduce((a, c) => a + ds.classes[c].students.length, 0);
    for (const c of cs) {
      const x = move(`c:${c}`, sc, m, w);
      if (x) byMember.push({ label: ds.classes[c].name, en: `c:${c}`, sc, v: (x.diff * ds.classes[c].students.length) / tot, cur: x.cur, prev: x.prev });
    }
  }
  byMember.sort((x, y) => x.v - y.v);
  const rest = byMember.length ? mv.diff - byMember.reduce((a, p) => a + p.v, 0) : 0;

  const ea = errAvg(en, w.cur, sc), eb = errAvg(en, w.prev, sc);
  const byErr: WhyPart[] = ERRS.map((x) => ({ label: x.name, v: ea[x.i] - eb[x.i], cur: ea[x.i], prev: eb[x.i] }))
    .filter((p) => Math.abs(p.v) >= 0.02).sort((x, y) => y.v - x.v);
  return { total: mv.diff, cur: mv.cur, prev: mv.prev, byScope, byMember, memberKind, rest, byErr };
}

/* ================= Hata teşhisi ================= */
/** Katılan başına, deneme başına ortalama yanlış sayısı; hata türüne göre */
export function errAvg(en: Ent, exams: number[], sc: Scope = 'all'): Float32Array {
  const out = new Float32Array(ERRS.length);
  const want = new Set(scopeTopics(sc));
  const own = entKind(en) === 'teacher' ? new Set(ds.teachers[entI(en)].subjects) : null;
  const mem = members(en);
  let k = 0;
  for (const e of exams) {
    const Q = ds.exams[e].q.filter((q) => want.has(q.topic) && (!own || own.has(q.subject)));
    const tmp = new Float32Array(ERRS.length);
    let p = 0;
    for (const s of mem) {
      const a = ds.ans[e][s];
      if (!a) continue;
      p++;
      for (const q of Q) { const o = a[q.i]; if (o !== q.key && o !== BLANK) tmp[q.opts[o].err]++; }
    }
    if (p) { k++; for (let i = 0; i < out.length; i++) out[i] += tmp[i] / p; }
  }
  if (k) for (let i = 0; i < out.length; i++) out[i] /= k;
  return out;
}
export interface ErrRow { k: number; n: number; share: number; base: number; lift: number }
/** Hata profili: her türün kendi ailesi içindeki payı, karşılaştırma grubuna (base) göre */
export function errProfile(en: Ent, exams: number[], base: Ent = 'o', sc: Scope = 'all'): ErrRow[] {
  const a = errAvg(en, exams, sc), b = errAvg(base, exams, sc);
  const famA: Record<string, number> = {}, famB: Record<string, number> = {};
  for (const x of ERRS) { famA[x.fam] = (famA[x.fam] ?? 0) + a[x.i]; famB[x.fam] = (famB[x.fam] ?? 0) + b[x.i]; }
  return ERRS.map((x) => {
    const share = famA[x.fam] ? a[x.i] / famA[x.fam] : 0, bs = famB[x.fam] ? b[x.i] / famB[x.fam] : 0;
    return { k: x.i, n: a[x.i], share, base: bs, lift: bs ? share / bs : 1 };
  }).filter((r) => r.n > 0).sort((x, y) => y.n - x.n);
}
/** Bir soruda şıkların dağılımı */
export function optionDist(e: number, q: number, en: Ent = 'o'): { counts: number[]; n: number } {
  const counts = [0, 0, 0, 0, 0, 0];
  let n = 0;
  for (const s of members(en)) { const a = ds.ans[e][s]; if (a) { counts[a[q]]++; n++; } }
  return { counts, n };
}
export interface QStat { i: number; p: number; blank: number; top: number; topShare: number; disc: number }
const qsCache = new Map<string, QStat[]>();
/** Soru istatistikleri: doğru oranı, boş oranı, en çok seçilen yanlış şık, ayırt edicilik (üst %27 − alt %27) */
export function qStats(e: number, en: Ent = 'o'): QStat[] {
  const key = `${en}|${e}`;
  let r = qsCache.get(key);
  if (r) return r;
  const mem = members(en).filter((s) => PRES[e][s]);
  const tot = mem.map((s) => [s, at(`s:${s}`, e, 'all', 'net')!] as const).sort((a, b) => b[1] - a[1]);
  const k = Math.max(1, Math.round(tot.length * 0.27));
  const hi = new Set(tot.slice(0, k).map((x) => x[0])), lo = new Set(tot.slice(-k).map((x) => x[0]));
  r = ds.exams[e].q.map((q) => {
    const c = [0, 0, 0, 0, 0, 0];
    let h = 0, l = 0;
    for (const s of mem) { const o = ds.ans[e][s]![q.i]; c[o]++; if (o === q.key) { if (hi.has(s)) h++; if (lo.has(s)) l++; } }
    let top = -1;
    for (let o = 0; o < 5; o++) if (o !== q.key && (top < 0 || c[o] > c[top])) top = o;
    const n = mem.length || 1;
    return { i: q.i, p: c[q.key] / n, blank: c[BLANK] / n, top, topShare: c[top] / n, disc: (h - l) / k };
  });
  qsCache.set(key, r);
  return r;
}

/* ================= Yetenek modeli (1PL) ================= */
const bqCache: Float32Array[] = [];
/** Sorunun okul cevaplarından ölçülen zorluğu (logit ölçeği; yüksek = zor) */
export function bq(e: number): Float32Array {
  if (bqCache[e]) return bqCache[e];
  const Q = ds.exams[e].q, c = new Float32Array(Q.length);
  let n = 0;
  for (let s = 0; s < NS; s++) { const a = ds.ans[e][s]; if (!a) continue; n++; for (const q of Q) if (a[q.i] === q.key) c[q.i]++; }
  const out = Float32Array.from(c, (x) => { const p = (x + 0.5) / (n + 1); return Math.log((1 - p) / p); });
  return (bqCache[e] = out);
}
/** Öğrencinin ders bazında yeteneği; verilen denemelerden, ağırlıklı MAP kestirimi */
export function ability(s: number, exams: number[], weight: (e: number) => number): { g: number; th: Float32Array } | null {
  const B: number[][] = SUBJECTS.map(() => []), X: number[][] = SUBJECTS.map(() => []), W: number[][] = SUBJECTS.map(() => []);
  let any = false;
  for (const e of exams) {
    const a = ds.ans[e][s];
    if (!a) continue;
    any = true;
    const b = bq(e), w = weight(e);
    for (const q of ds.exams[e].q) { B[q.subject].push(b[q.i]); X[q.subject].push(a[q.i] === q.key ? 1 : 0); W[q.subject].push(w); }
  }
  if (!any) return null;
  const newton = (js: number[], mu: number, s2: number) => {
    let th = mu;
    for (let it = 0; it < 7; it++) {
      let g = -(th - mu) / s2, h = 1 / s2;
      for (const j of js) for (let i = 0; i < B[j].length; i++) { const p = sig(th - B[j][i]); g += W[j][i] * (X[j][i] - p); h += W[j][i] * p * (1 - p); }
      th += Math.max(-1.5, Math.min(1.5, g / h));
    }
    return th;
  };
  const g = newton(SUBJECTS.map((x) => x.i), 0, 2.25);
  return { g, th: Float32Array.from(SUBJECTS, (x) => newton([x.i], g, 0.5)) };
}
/** Yanlışın (boşa karşı) payı: doğru yapamadığı sorularda işaretleme eğilimi */
function wrongShare(s: number, exams: number[]): number {
  let y = 0, b = 0;
  for (const e of exams) { if (!PRES[e][s]) continue; const c = cnt(`s:${s}`, e, 'all')!; y += c.y; b += c.b; }
  return (y + 1) / (y + b + 2);
}

/* ================= Kapalı zarf ================= */
export interface EnvRow { s: number; pred: number; band: number; act: number | null; test: number[]; z: number | null }
export interface Env {
  e: number; rows: EnvRow[]; n: number;
  /** gerçek − tahmin ortalaması: denemenin beklenenden kolay (+) ya da zor (−) çıkması */
  shift: number;
  mae: number; maeAdj: number; hit: number; hitAdj: number; inBand: number; r: number; sd: number;
  cls: { c: number; pred: number; act: number; diff: number }[];
  /** sınıf ortalamalarında ortalama sapma (ham ve deneme etkisi ayrılmış) */
  clsMae: number; clsMaeAdj: number;
  q: { i: number; pred: number; act: number }[];
  qMae: number;
}
const envCache: (Env | null)[] = [];
export const ENV_MIN = 3;
/** Deneme e için, yalnızca önceki denemelerden üretilen tahmin. Sorular için de yalnızca
 *  önceki denemelerde aynı konudan çıkan soruların zorluğu kullanılır. */
export function envelope(e: number): Env | null {
  if (e < ENV_MIN) return null;
  if (envCache[e] !== undefined) return envCache[e];
  const prior = Array.from({ length: e }, (_, i) => i);
  // Konu bazında beklenen zorluk (ders ortalamasına doğru büzülmüş)
  const tS = new Float32Array(NT), tN = new Float32Array(NT), jS = new Float32Array(SUBJECTS.length), jN = new Float32Array(SUBJECTS.length);
  for (const p of prior) { const b = bq(p); for (const q of ds.exams[p].q) { tS[q.topic] += b[q.i]; tN[q.topic]++; jS[q.subject] += b[q.i]; jN[q.subject]++; } }
  const Q = ds.exams[e].q;
  const bHat = Q.map((q) => (tS[q.topic] + 2 * (jS[q.subject] / jN[q.subject])) / (tN[q.topic] + 2));
  const rows: EnvRow[] = [];
  const qPred = new Float32Array(Q.length);
  let nPred = 0;
  for (let s = 0; s < NS; s++) {
    if (prior.filter((p) => PRES[p][s]).length < 2) continue;
    const ab = ability(s, prior, (p) => 0.8 ** (e - 1 - p))!;
    const ws = wrongShare(s, prior);
    const test = TESTS.map(() => 0);
    let pred = 0, v = 0;
    for (const q of Q) {
      const p = sig(ab.th[q.subject] - bHat[q.i]);
      qPred[q.i] += p;
      const x = p - ((1 - p) * ws) / 4;
      pred += x; v += p * (1 - p) * (1 + ws / 4) ** 2;
      test[TESTS.findIndex((t) => t.id === SUBJECTS[q.subject].test)] += x;
    }
    nPred++;
    rows.push({ s, pred, band: 1.28 * Math.sqrt(v * 2.1), act: at(`s:${s}`, e, 'all', 'net'), test, z: null });
  }
  const got = rows.filter((r) => r.act != null);
  const errs = got.map((r) => r.act! - r.pred);
  const shift = mean(errs), sd = sdev(errs) || 1;
  for (const r of got) r.z = (r.act! - r.pred - shift) / sd;
  const mp = mean(got.map((r) => r.pred)), ma = mean(got.map((r) => r.act!));
  const cov = mean(got.map((r) => (r.pred - mp) * (r.act! - ma)));
  const cls = ds.classes.map((c) => {
    const g = got.filter((r) => ds.students[r.s].cls === c.i);
    const pred = mean(g.map((r) => r.pred)), act = mean(g.map((r) => r.act!));
    return { c: c.i, pred, act, diff: act - pred - shift };
  });
  const b = bq(e);
  const q = Q.map((x) => ({ i: x.i, pred: qPred[x.i] / (nPred || 1), act: sig(-b[x.i]) }));
  const env: Env = {
    e, rows, n: got.length, shift, sd,
    mae: mean(errs.map(Math.abs)), maeAdj: mean(errs.map((x) => Math.abs(x - shift))),
    hit: mean(errs.map((x) => (Math.abs(x) <= 5 ? 1 : 0))), hitAdj: mean(errs.map((x) => (Math.abs(x - shift) <= 5 ? 1 : 0))),
    inBand: mean(got.map((r) => (Math.abs(r.act! - r.pred) <= r.band ? 1 : 0))),
    r: cov / (sdev(got.map((r) => r.pred)) * sdev(got.map((r) => r.act!)) || 1) * (got.length / (got.length - 1 || 1)),
    cls, q, qMae: mean(q.map((x) => Math.abs(x.act - x.pred))),
    clsMae: mean(cls.map((c) => Math.abs(c.act - c.pred))), clsMaeAdj: mean(cls.map((c) => Math.abs(c.diff))),
  };
  return (envCache[e] = env);
}

/* ================= Şans neti ================= */
export interface LuckQ { q: number; p: number }
export interface Luck {
  act: number; exp: number;
  /** Bilmesi beklenmeyen sorulardan gelen fazla (şans payı), bilmesi beklenen sorulardaki kayıp (dikkat), kalan */
  luck: number; slip: number; mid: number;
  lucky: LuckQ[]; slips: LuckQ[];
}
const luckCache = new Map<string, Luck | null>();
export const P_HARD = 0.3, P_EASY = 0.75;
/** Öğrencinin o denemedeki netini, diğer denemelerdeki yeteneğine göre beklenenle karşılaştırır. */
export function luck(e: number, s: number): Luck | null {
  const key = `${e}|${s}`;
  const c = luckCache.get(key);
  if (c !== undefined) return c;
  let out: Luck | null = null;
  const a = ds.ans[e][s];
  const others = Array.from({ length: NE }, (_, i) => i).filter((x) => x !== e && PRES[x][s]);
  if (a && others.length >= 2) {
    const ab = ability(s, others, (x) => 0.8 ** Math.abs(e - x))!;
    const ws = wrongShare(s, others), b = bq(e);
    out = { act: 0, exp: 0, luck: 0, slip: 0, mid: 0, lucky: [], slips: [] };
    for (const q of ds.exams[e].q) {
      const p = sig(ab.th[q.subject] - b[q.i]);
      const o = a[q.i];
      const got = o === q.key ? 1 : o === BLANK ? 0 : -0.25, ex = p - ((1 - p) * ws) / 4;
      out.act += got; out.exp += ex;
      if (p < P_HARD) { out.luck += got - ex; if (got === 1) out.lucky.push({ q: q.i, p }); }
      else if (p > P_EASY) { out.slip += got - ex; if (got !== 1) out.slips.push({ q: q.i, p }); }
      else out.mid += got - ex;
    }
    out.lucky.sort((x, y) => x.p - y.p); out.slips.sort((x, y) => y.p - x.p);
  }
  luckCache.set(key, out);
  return out;
}

/* ================= Bugün sınav olsa ================= */
export interface Fc { net: number; sd: number; test: number[]; puan: number; sdP: number; k: number }
const fcCache: (Fc | null | undefined)[] = [];
const natAvg = TESTS.map((_, i) => mean(ds.exams.map((x) => x.nat.test[i])));
/** Son denemelere ağırlık veren projeksiyon. Deneme zorlukları yayın geneli ortalamasıyla dengelenir. */
export function forecast(s: number): Fc | null {
  if (fcCache[s] !== undefined) return fcCache[s]!;
  const ex = ds.exams.filter((x) => PRES[x.i][s]).map((x) => x.i);
  let out: Fc | null = null;
  if (ex.length >= 2) {
    const test = TESTS.map(() => 0), tot: number[] = [], ws: number[] = [];
    let W = 0;
    ex.forEach((e, i) => {
      const w = 0.62 ** (ex.length - 1 - i);
      W += w; ws.push(w);
      let t = 0;
      TESTS.forEach((T, k) => { const v = at(`s:${s}`, e, `t:${T.id}`, 'net')! - (ds.exams[e].nat.test[k] - natAvg[k]); test[k] += w * v; t += v; });
      tot.push(t);
    });
    for (let k = 0; k < test.length; k++) test[k] = Math.max(0, test[k] / W);
    const net = test.reduce((a, b) => a + b, 0);
    const v = tot.reduce((a, t, i) => a + ws[i] * (t - net) ** 2, 0) / W;
    const sd = Math.max(2.5, Math.sqrt(v)) * Math.sqrt(1 + 1 / ex.length);
    const puan = 100 + test.reduce((a, x, k) => a + x * TESTS[k].coef, 0);
    out = { net, sd, test, puan, sdP: sd * 3.35, k: ex.length };
  }
  fcCache[s] = out;
  return out;
}
export const pAbove = (f: Fc, puan: number) => 1 - phi((puan - f.puan) / f.sdP);
/** Yayın geneline göre yüzdelik (0–100, yüksek = iyi). Yayın geneli demo verisinde sentetiktir. */
export const natPct = (e: number, net: number) => 100 * phi((net - ds.exams[e].nat.mean) / ds.exams[e].nat.sd);

/* ================= Konular ================= */
export const ALL = Array.from({ length: NE }, (_, i) => i);
/** Konunun deneme başına ortalama soru sayısı */
export const topicW: number[] = TOPICS.map((t) => mean(QN.map((q) => q[t.i])));
export interface TopicStat { t: number; pct: number | null; w: number; d: number; y: number; b: number; n: number }
export function topicStats(en: Ent, exams: number[] = ALL): TopicStat[] {
  return TOPICS.map((t) => {
    const c = agg(en, exams, `k:${t.i}`);
    return { t: t.i, pct: mval(c, 'pct'), w: topicW[t.i], d: c?.d ?? 0, y: c?.y ?? 0, b: c?.b ?? 0, n: c?.n ?? 0 };
  });
}
/** Konuya özgü açık (puan). Okul/düzey için: konunun, dersin kendi ortalamasına göre farkı.
 *  Sınıf/öğrenci/öğretmen için: aynı sorularda düzeyle (öğretmende okulla) arasındaki farkın,
 *  o dersteki genel farkından ne kadar kötü olduğu. Böylece sınıfın genel seviyesi ayrılır. */
export function topicDeficit(en: Ent, exams: number[] = ALL): (number | null)[] {
  const k = entKind(en), st = topicStats(en, exams);
  const subj = (e: Ent) => SUBJECTS.map((s) => val(e, exams, `s:${s.i}`, 'pct'));
  const own = subj(en);
  if (k === 'school' || k === 'level') return st.map((x) => { const a = own[TOPICS[x.t].subject]; return x.pct == null || a == null ? null : x.pct - a; });
  const be: Ent = k === 'teacher' ? 'o' : `l:${k === 'class' ? ds.classes[entI(en)].level : ds.classes[ds.students[entI(en)].cls].level}`;
  const base = topicStats(be, exams), bs = subj(be);
  return st.map((x, i) => {
    const j = TOPICS[x.t].subject;
    return x.pct == null || base[i].pct == null || own[j] == null || bs[j] == null ? null : x.pct - base[i].pct! - (own[j]! - bs[j]!);
  });
}
export const dependents: number[][] = TOPICS.map((t) => TOPICS.filter((x) => x.pre.includes(t.i)).map((x) => x.i));
export interface Chain { root: number; def: number; deps: { t: number; def: number }[] }
/** Kök konular: kendisi açık veren, önkoşulu sağlam olan ve kendisine bağlı konularda da açık görülen konular */
export function rootChains(en: Ent, exams: number[] = ALL): Chain[] {
  const def = topicDeficit(en, exams);
  const out: Chain[] = [];
  for (const t of TOPICS) {
    const d = def[t.i];
    if (d == null || d > -8) continue;
    if (t.pre.some((p) => (def[p] ?? 0) <= -8)) continue;
    const deps: { t: number; def: number }[] = [];
    const walk = (x: number) => { for (const y of dependents[x]) { const v = def[y]; if (v != null && v <= -5 && !deps.some((z) => z.t === y)) { deps.push({ t: y, def: v }); walk(y); } } };
    walk(t.i);
    if (deps.length) out.push({ root: t.i, def: d, deps });
  }
  return out.sort((a, b) => a.def * topicW[a.root] - b.def * topicW[b.root]);
}
/** Bir konunun (varsa) zayıf kök önkoşulu */
export function rootOf(en: Ent, t: number, exams: number[] = ALL): number | null {
  for (const c of rootChains(en, exams)) if (c.deps.some((d) => d.t === t)) return c.root;
  return null;
}
export interface Prio { t: number; pct: number; ref: number | null; refEn: Ent | null; gain: number; w: number; root: number | null }
/** Ne yapmalı: erişilebilir kazanca göre sıralı konular.
 *  Sınıf/okul için ölçüt aynı düzeydeki en iyi sınıftır; öğrenci için kaçan netin tamamı. */
export function priorities(en: Ent, exams: number[] = ALL): Prio[] {
  const k = entKind(en), st = topicStats(en, exams);
  const peers = k === 'student' ? [] : k === 'class' ? classesOf(`l:${ds.classes[entI(en)].level}`) : classesOf(en);
  const peerStats = peers.map((c) => ({ c, st: topicStats(`c:${c}`, exams) }));
  const chains = rootChains(en, exams);
  const out: Prio[] = [];
  for (const x of st) {
    if (x.pct == null || x.w < 0.15) continue;
    let ref: number | null = null, refEn: Ent | null = null;
    for (const p of peerStats) { const v = p.st[x.t].pct; if (v != null && (ref == null || v > ref)) { ref = v; refEn = `c:${p.c}`; } }
    const target = k === 'student' ? 100 : ref ?? x.pct;
    const mix = 1 + 0.25 * (x.y + x.b ? x.y / (x.y + x.b) : 0);
    const gain = (x.w * Math.max(0, target - x.pct) * mix) / 100;
    if (gain < 0.05) continue;
    out.push({ t: x.t, pct: x.pct, ref: k === 'student' ? null : ref, refEn: k === 'student' ? null : refEn, gain, w: x.w, root: chains.find((c) => c.deps.some((d) => d.t === x.t))?.root ?? null });
  }
  return out.sort((a, b) => b.gain - a.gain);
}

/* ================= Bulgular ================= */
export interface Finding {
  id: string; tone: 'bad' | 'good' | 'info'; tag: string; title: string; text: string; to: string;
  en?: Ent; sc?: Scope; m?: Metric; score: number;
}
const median = (a: number[]) => { const s = [...a].sort((x, y) => x - y); return s.length ? (s[(s.length - 1) >> 1] + s[s.length >> 1]) / 2 : 0; };
const fCache = new Map<string, Finding[]>();
/** Veriyi tarar; alışılmışın dışında kalan hareketleri sıralar. */
export function findings(root: Ent, per: Per): Finding[] {
  const key = `${root}|${per}`;
  const cached = fCache.get(key);
  if (cached) return cached;
  const w = win(per), out: Finding[] = [];
  const cs = classesOf(root);
  const dn = w.name.toLocaleLowerCase('tr');

  // 1. Sınıf × ders: diğer sınıflara göre alışılmadık değişim
  for (const sc of SUBJECT_SCOPES) {
    const all = ds.classes.map((c) => move(`c:${c.i}`, sc, 'net', w)).filter((x): x is Move => !!x);
    if (all.length < 4) continue;
    const med = median(all.map((x) => x.diff));
    const mad = Math.max(0.22, 1.4826 * median(all.map((x) => Math.abs(x.diff - med))));
    for (const x of all) {
      if (!cs.includes(entI(x.en))) continue;
      const z = (x.diff - med) / mad;
      if (Math.abs(z) < 2.4 || Math.abs(x.diff) < 0.45) continue;
      const others = mean(all.filter((y) => y.en !== x.en).map((y) => y.diff));
      out.push({
        id: `m|${x.en}|${sc}`, tone: x.diff < 0 ? 'bad' : 'good', tag: x.diff < 0 ? 'Düşüş' : 'Yükseliş', en: x.en, sc, m: 'net',
        title: `${entName(x.en)} sınıfında ${scopeName(sc)} neti ${fmt(Math.abs(x.diff))} ${x.diff < 0 ? 'düştü' : 'arttı'}`,
        text: `${fmt(x.prev)} netten ${fmt(x.cur)} nete (${w.desc}). Aynı sürede diğer sınıfların ${scopeName(sc)} ortalaması ${sgn(others)} net değişti.`,
        to: `/karsilastir?k=${x.en}&n=${sc}`, score: Math.abs(z),
      });
    }
  }

  // 2. Öğrenciler: düzey ortalamasına göre art arda gerileme / ilerleme
  const st: Finding[] = [];
  for (const s of members(root)) {
    const rel = relSeries(s);
    const k = streak(rel), v = rel.filter((x): x is number => x != null);
    if (Math.abs(k) < 3) continue;
    const a = v[v.length - 1 - Math.abs(k)], b = v[v.length - 1];
    if (Math.abs(b - a) < 7) continue;
    const pos = (x: number) => `${fmt(Math.abs(x))} net ${x >= 0 ? 'üstünde' : 'altında'}`;
    st.push({
      id: `s|${s}`, tone: k < 0 ? 'bad' : 'good', tag: k < 0 ? 'Gerileyen öğrenci' : 'Yükselen öğrenci', en: `s:${s}`, sc: 'all', m: 'net',
      title: `${ds.students[s].name} ${Math.abs(k)} denemedir ${k < 0 ? 'geriliyor' : 'yükseliyor'}`,
      text: `${ds.classes[ds.students[s].cls].name}. ${ds.classes[ds.students[s].cls].level}. sınıfların ortalamasının ${pos(a)} idi, şimdi ${pos(b)}.`,
      to: entHref(`s:${s}`), score: 1.6 + Math.abs(b - a) / 9,
    });
  }
  st.sort((a, b) => b.score - a.score);
  out.push(...st.filter((f) => f.tone === 'bad').slice(0, 3), ...st.filter((f) => f.tone === 'good').slice(0, 3));

  // 3. Hata türü yoğunlaşması
  for (const c of cs) {
    const pr = errProfile(`c:${c}`, ALL, `l:${ds.classes[c].level}`);
    for (const r of pr) {
      if (r.lift < 1.45 || r.n < 0.5) continue;
      out.push({
        id: `e|${c}|${r.k}`, tone: 'info', tag: 'Hata türü', en: `c:${c}`,
        title: `${ds.classes[c].name} sınıfı “${ERRS[r.k].name}” hatasını diğer ${ds.classes[c].level}. sınıfların ${fmt(r.lift)} katı yapıyor`,
        text: `Her denemede öğrenci başına ortalama ${fmt(r.n)} yanlış bu hatadan geliyor. ${ERRS[r.k].hint}`,
        to: `${entHref(`c:${c}`)}?sekme=hatalar`, score: 1.2 + r.lift,
      });
    }
  }

  // 4. Kök konu zincirleri
  for (const c of cs) {
    const ch = rootChains(`c:${c}`)[0];
    if (!ch || ch.def > -12) continue;
    out.push({
      id: `r|${c}|${ch.root}`, tone: 'info', tag: 'Kök konu', en: `c:${c}`, sc: `k:${ch.root}`,
      title: `${ds.classes[c].name} sınıfında sorun ${TOPICS[ch.root].name} konusunda başlıyor`,
      text: `Bu temel konuda diğer ${ds.classes[c].level}. sınıfların ${fmt(-ch.def, 0)} puan gerisinde. Bu konuya dayanan ${ch.deps.map((d) => TOPICS[d.t].name).slice(0, 3).join(', ')} konuları da zayıf.`,
      to: `/konular?kim=c:${c}&gorunum=ag`, score: 1.5 + -ch.def / 8,
    });
  }
  const sch = rootChains(root)[0];
  if (sch) out.push({
    id: `r|${root}|${sch.root}`, tone: 'info', tag: 'Kök konu', en: root, sc: `k:${sch.root}`,
    title: `${TOPICS[sch.root].name} konusu zayıf, bu konuya dayanan konular da zayıf`,
    text: `${entName(root)}, ${SUBJECTS[TOPICS[sch.root].subject].name}. Dersin ortalamasından ${fmt(-sch.def, 0)} puan düşük. Buna dayanan konular: ${sch.deps.map((d) => TOPICS[d.t].name).slice(0, 3).join(', ')}.`,
    to: `/konular?gorunum=ag`, score: 2.2 + -sch.def / 10,
  });

  // 5. Kapalı zarf: son denemede tahminden sapan sınıflar
  const env = envelope(LAST);
  if (env) for (const c of env.cls) {
    if (!cs.includes(c.c) || Math.abs(c.diff) < 2.5) continue;
    out.push({
      id: `z|${c.c}`, tone: c.diff < 0 ? 'bad' : 'good', tag: 'Kapalı zarf', en: `c:${c.c}`,
      title: `${ds.classes[c.c].name} son denemede beklenenden ${fmt(Math.abs(c.diff))} net ${c.diff < 0 ? 'az' : 'fazla'} yaptı`,
      text: `Beklenti, sınıfın önceki denemelerinden hesaplanan tahmindir. Denemenin kolay ya da zor çıkması hesaba katıldı.`,
      to: `/deneme/${ds.exams[LAST].id}?sekme=zarf`, score: 1.3 + Math.abs(c.diff) / 2,
    });
  }
  void dn;
  out.sort((a, b) => b.score - a.score);
  fCache.set(key, out);
  return out;
}
export const clearAnalysisCaches = () => { fCache.clear(); };

/* ================= Düzenli rapor (2 denemede bir) ================= */
export const REPORTS = Math.floor(NE / 2);
export const reportWin = (no: number): Win => ({
  cur: [2 * no - 2, 2 * no - 1], prev: no > 1 ? [2 * no - 4, 2 * no - 3] : [],
  name: `Rapor ${no}`, desc: 'bu rapordaki 2 deneme, önceki rapordaki 2 denemeye göre',
});
export interface Flag { en: Ent; sc: Scope; diff: number }
/** Bir raporda işaretlenen düşüşler; sonraki raporda akıbetleri izlenir ("rapor hafızası"). */
export function reportFlags(no: number, root: Ent): Flag[] {
  if (no < 2) return [];
  const w = reportWin(no);
  return movers(classesOf(root).map((c) => `c:${c}`), SUBJECT_SCOPES, 'net', w)
    .filter((x) => x.diff <= -0.5).sort((a, b) => a.diff - b.diff).slice(0, 4).map((x) => ({ en: x.en, sc: x.sc, diff: x.diff }));
}
export function reportMemory(no: number, root: Ent): { flag: Flag; now: number | null; state: 'toparladı' | 'sürüyor' | 'değişmedi' }[] {
  return reportFlags(no - 1, root).map((flag) => {
    const now = move(flag.en, flag.sc, 'net', reportWin(no))?.diff ?? null;
    return { flag, now, state: now == null ? 'değişmedi' : now >= 0.3 ? 'toparladı' : now <= -0.3 ? 'sürüyor' : 'değişmedi' };
  });
}

export { TEST_SCOPES, series };
