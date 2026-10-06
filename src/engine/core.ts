// Analiz motorunun çekirdeği: kapsam (neyi), varlık (kimi), ölçü (nasıl) ve dönem (ne zaman).
// Her şey yalnızca işaretlenen şıklardan hesaplanır.
import { generate, BLANK, type Dataset } from '../data/generate';
import { SUBJECTS, TOPICS, TESTS, ERRS } from '../data/curriculum';

/** Çalışma adı. Tek yerden değişir. */
export const APP = 'İD Analiz';

export const ds: Dataset = generate();
export const NE = ds.exams.length;
export const NS = ds.students.length;
export const NT = TOPICS.length;
export const LAST = NE - 1;

// TC[e][(s*NT + t)*3 + k]  k: 0 doğru, 1 yanlış, 2 boş
export const TC: Uint8Array[] = [];
export const PRES: Uint8Array[] = [];
/** QN[e][t]: denemede o konudan kaç soru var */
export const QN: Uint8Array[] = [];
for (let e = 0; e < NE; e++) {
  const tc = new Uint8Array(NS * NT * 3), pr = new Uint8Array(NS), qn = new Uint8Array(NT);
  const Q = ds.exams[e].q;
  for (const q of Q) qn[q.topic]++;
  for (let s = 0; s < NS; s++) {
    const a = ds.ans[e][s];
    if (!a) continue;
    pr[s] = 1;
    for (const q of Q) { const o = a[q.i]; tc[(s * NT + q.topic) * 3 + (o === q.key ? 0 : o === BLANK ? 2 : 1)]++; }
  }
  TC.push(tc); PRES.push(pr); QN.push(qn);
}

/* ---------- Kapsam: 'all' | 't:mat' (test) | 's:5' (ders) | 'k:17' (konu) ---------- */
export type Scope = string;
const topicsOf = new Map<Scope, number[]>();
export function scopeTopics(sc: Scope): number[] {
  let r = topicsOf.get(sc);
  if (!r) {
    const [k, v] = sc.split(':');
    r = k === 'all' ? TOPICS.map((t) => t.i)
      : k === 't' ? TOPICS.filter((t) => SUBJECTS[t.subject].test === v).map((t) => t.i)
      : k === 's' ? TOPICS.filter((t) => t.subject === +v).map((t) => t.i)
      : [+v];
    topicsOf.set(sc, r);
  }
  return r;
}
export const scopeKind = (sc: Scope) => (sc === 'all' ? 'all' : sc[0] === 't' ? 'test' : sc[0] === 's' ? 'subject' : 'topic');
export function scopeName(sc: Scope): string {
  const [k, v] = sc.split(':');
  return k === 'all' ? 'Toplam' : k === 't' ? TESTS.find((t) => t.id === v)!.name : k === 's' ? SUBJECTS[+v].name : TOPICS[+v].name;
}
/** Konu için "Matematik, Üslü Sayılar" gibi tam ad */
export function scopeFull(sc: Scope): string {
  return sc[0] === 'k' ? `${SUBJECTS[TOPICS[+sc.slice(2)].subject].name}, ${TOPICS[+sc.slice(2)].name}` : scopeName(sc);
}
export function scopeChildren(sc: Scope): Scope[] {
  const [k, v] = sc.split(':');
  if (k === 'all') return TESTS.map((t) => `t:${t.id}`);
  if (k === 't') { const ss = SUBJECTS.filter((s) => s.test === v); return ss.length === 1 ? scopeChildren(`s:${ss[0].i}`) : ss.map((s) => `s:${s.i}`); }
  if (k === 's') return TOPICS.filter((t) => t.subject === +v).map((t) => `k:${t.i}`);
  return [];
}
export function scopeParent(sc: Scope): Scope | null {
  const [k, v] = sc.split(':');
  if (k === 'all') return null;
  if (k === 't') return 'all';
  if (k === 's') return `t:${SUBJECTS[+v].test}`;
  return `s:${TOPICS[+v].subject}`;
}
export function scopeN(sc: Scope, e: number): number { let n = 0; for (const t of scopeTopics(sc)) n += QN[e][t]; return n; }
export const SUBJECT_SCOPES: Scope[] = SUBJECTS.map((s) => `s:${s.i}`);
export const TEST_SCOPES: Scope[] = TESTS.map((t) => `t:${t.id}`);
export const TOPIC_SCOPES: Scope[] = TOPICS.map((t) => `k:${t.i}`);
export const scopeHref = (sc: Scope) => (sc[0] === 'k' ? `/konu/${TOPICS[+sc.slice(2)].id}` : `/konular`);

/* ---------- Varlık: 'o' okul | 'l:11' düzey | 'c:3' sınıf | 's:17' öğrenci | 't:4' öğretmen ---------- */
export type Ent = string;
export type EntKind = 'school' | 'level' | 'class' | 'student' | 'teacher';
export const entKind = (en: Ent): EntKind => (en === 'o' ? 'school' : en[0] === 'l' ? 'level' : en[0] === 'c' ? 'class' : en[0] === 's' ? 'student' : 'teacher');
export const entI = (en: Ent) => +en.slice(2);
export function entName(en: Ent): string {
  const k = entKind(en);
  return k === 'school' ? 'Okul geneli' : k === 'level' ? `${entI(en)}. sınıflar` : k === 'class' ? ds.classes[entI(en)].name : k === 'student' ? ds.students[entI(en)].name : ds.teachers[entI(en)].name;
}
export function entSub(en: Ent): string {
  const k = entKind(en);
  if (k === 'student') { const s = ds.students[entI(en)]; return `${ds.classes[s.cls].name}, no ${s.no}`; }
  if (k === 'class') return `${ds.classes[entI(en)].students.length} öğrenci`;
  if (k === 'teacher') return ds.teachers[entI(en)].branch;
  if (k === 'level') return `${members(en).length} öğrenci`;
  return ds.school;
}
export function entHref(en: Ent): string {
  const k = entKind(en);
  return k === 'class' ? `/sinif/${ds.classes[entI(en)].id}` : k === 'student' ? `/ogrenci/${ds.students[entI(en)].id}` : k === 'teacher' ? `/ogretmen/${ds.teachers[entI(en)].id}` : '/siniflar';
}
const memCache = new Map<Ent, number[]>();
/** Varlığa bağlı öğrenciler (öğretmen için: girdiği sınıfların öğrencileri) */
export function members(en: Ent): number[] {
  let r = memCache.get(en);
  if (!r) {
    const k = entKind(en);
    r = k === 'school' ? ds.students.map((s) => s.i)
      : k === 'level' ? ds.students.filter((s) => ds.classes[s.cls].level === entI(en)).map((s) => s.i)
      : k === 'class' ? ds.classes[entI(en)].students
      : k === 'student' ? [entI(en)]
      : teacherClasses(entI(en)).flatMap((c) => ds.classes[c].students);
    memCache.set(en, r);
  }
  return r;
}
/** Kök varlığın altındaki sınıflar */
export function classesOf(root: Ent): number[] {
  const k = entKind(root);
  return k === 'school' ? ds.classes.map((c) => c.i) : k === 'level' ? ds.classes.filter((c) => c.level === entI(root)).map((c) => c.i)
    : k === 'class' ? [entI(root)] : k === 'teacher' ? teacherClasses(entI(root)) : [ds.students[entI(root)].cls];
}
export const rootEnt = (level: number): Ent => (level ? `l:${level}` : 'o');
export const classEnt = (s: number): Ent => `c:${ds.students[s].cls}`;

/* ---------- Öğretmen atamaları (okul girer; /veri ekranından değişir) ---------- */
export function teacherPairs(t: number): { c: number; j: number }[] {
  const out: { c: number; j: number }[] = [];
  for (const c of ds.classes) c.teachers.forEach((x, j) => { if (x === t) out.push({ c: c.i, j }); });
  return out;
}
export function teacherClasses(t: number): number[] { return [...new Set(teacherPairs(t).map((p) => p.c))]; }
/** Öğretmenin varsayılan kapsamı: tek dersi varsa o ders, birden çoksa dersin testi */
export function teacherScope(t: number): Scope {
  const js = [...new Set(teacherPairs(t).map((p) => p.j))];
  const own = js.length ? js : ds.teachers[t].subjects;
  return own.length === 1 ? `s:${own[0]}` : `t:${SUBJECTS[own[0]].test}`;
}
export function entScope(en: Ent): Scope { return entKind(en) === 'teacher' ? teacherScope(entI(en)) : 'all'; }
let version = 0;
export const dataVersion = () => version;
export function setAssign(c: number, j: number, t: number) {
  ds.classes[c].teachers[j] = t;
  version++; memCache.clear(); cntCache.clear(); rankCache.clear();
}

/* ---------- Sayımlar ---------- */
/** d, y, b: katılan başına toplam; n: soru sayısı; k: veri olan deneme sayısı */
export interface Cnt { d: number; y: number; b: number; n: number; k: number }
function sumStudents(list: number[], e: number, topics: number[], out: Cnt): boolean {
  const tc = TC[e], pr = PRES[e];
  let d = 0, y = 0, b = 0, p = 0;
  for (const s of list) {
    if (!pr[s]) continue;
    p++;
    const base = s * NT * 3;
    for (const t of topics) { const o = base + t * 3; d += tc[o]; y += tc[o + 1]; b += tc[o + 2]; }
  }
  if (!p) return false;
  let n = 0; for (const t of topics) n += QN[e][t];
  out.d += d / p; out.y += y / p; out.b += b / p; out.n += n;
  return true;
}
const cntCache = new Map<string, Cnt | null>();
/** Tek deneme için sayım. Öğretmende yalnızca kendi girdiği sınıf–ders çiftleri sayılır. */
export function cnt(en: Ent, e: number, sc: Scope): Cnt | null {
  const student = en[0] === 's';
  const key = student ? '' : `${en}|${e}|${sc}`;
  if (!student) { const c = cntCache.get(key); if (c !== undefined) return c; }
  const out: Cnt = { d: 0, y: 0, b: 0, n: 0, k: 1 };
  let ok = false;
  if (en[0] === 't') {
    const byJ = new Map<number, number[]>();
    for (const p of teacherPairs(entI(en))) { const l = byJ.get(p.j) ?? []; l.push(...ds.classes[p.c].students); byJ.set(p.j, l); }
    const want = scopeTopics(sc);
    for (const [j, list] of byJ) {
      const ts = want.filter((t) => TOPICS[t].subject === j);
      if (ts.length && sumStudents(list, e, ts, out)) ok = true;
    }
  } else ok = sumStudents(members(en), e, scopeTopics(sc), out);
  const r = ok ? out : null;
  if (!student) cntCache.set(key, r);
  return r;
}
/** Birden çok denemeyi birleştirir (havuzlar). */
export function agg(en: Ent, exams: number[], sc: Scope): Cnt | null {
  const out: Cnt = { d: 0, y: 0, b: 0, n: 0, k: 0 };
  for (const e of exams) { const c = cnt(en, e, sc); if (c) { out.d += c.d; out.y += c.y; out.b += c.b; out.n += c.n; out.k++; } }
  return out.k ? out : null;
}

/* ---------- Ölçüler ---------- */
export type Metric = 'net' | 'pct' | 'd' | 'y' | 'b';
export const METRICS: Record<Metric, { name: string; short: string; up: boolean; dig: number; unit: string }> = {
  net: { name: 'Net', short: 'net', up: true, dig: 1, unit: ' net' },
  pct: { name: 'Doğru oranı', short: 'doğru %', up: true, dig: 0, unit: ' puan' },
  d: { name: 'Doğru sayısı', short: 'doğru', up: true, dig: 1, unit: ' doğru' },
  y: { name: 'Yanlış sayısı', short: 'yanlış', up: false, dig: 1, unit: ' yanlış' },
  b: { name: 'Boş sayısı', short: 'boş', up: false, dig: 1, unit: ' boş' },
};
export const METRIC_IDS = Object.keys(METRICS) as Metric[];
export function mval(c: Cnt | null, m: Metric): number | null {
  if (!c) return null;
  return m === 'net' ? (c.d - c.y / 4) / c.k : m === 'pct' ? (c.n ? (100 * c.d) / c.n : null) : c[m] / c.k;
}
export const val = (en: Ent, exams: number[], sc: Scope, m: Metric) => mval(agg(en, exams, sc), m);
export const at = (en: Ent, e: number, sc: Scope, m: Metric) => mval(cnt(en, e, sc), m);
export function series(en: Ent, sc: Scope, m: Metric): (number | null)[] { return ds.exams.map((x) => at(en, x.i, sc, m)); }
/** Konu kapsamında soru sayısı denemeden denemeye değiştiği için net yerine oran anlamlıdır. */
export const defMetric = (sc: Scope): Metric => (sc[0] === 'k' ? 'pct' : 'net');

/* ---------- Dönem ---------- */
export type Per = '1' | '3' | 'donem' | 'yil';
export const PERS: { id: Per; name: string; desc: string }[] = [
  { id: '1', name: 'Son deneme', desc: 'son deneme, bir önceki denemeye göre' },
  { id: '3', name: 'Son 3 deneme', desc: 'son 3 deneme, önceki 3 denemeye göre' },
  { id: 'donem', name: 'Bu dönem', desc: 'dönemin ilk denemeleri ile son denemeleri' },
  { id: 'yil', name: 'Bu yıl', desc: 'yılın ilk 3 denemesi ile son 3 denemesi' },
];
export const SEMESTER2 = '2026-02-01';
export interface Win { cur: number[]; prev: number[]; desc: string; name: string }
const range = (a: number, b: number) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);
export function win(per: Per, upto = LAST): Win {
  const p = PERS.find((x) => x.id === per)!;
  let cur: number[], prev: number[];
  if (per === '1') { cur = [upto]; prev = upto > 0 ? [upto - 1] : []; }
  else if (per === '3') { cur = range(Math.max(0, upto - 2), upto); prev = range(Math.max(0, upto - 5), upto - 3); }
  else {
    const w = per === 'donem' ? range(0, upto).filter((e) => ds.exams[e].date >= SEMESTER2) : range(0, upto);
    const k = Math.min(3, Math.floor(w.length / 2));
    prev = w.slice(0, k); cur = w.slice(w.length - k);
  }
  return { cur, prev, desc: p.desc, name: p.name };
}

/* ---------- Sıralama ---------- */
const rankCache = new Map<string, Map<number, number>>();
/** Öğrencinin o denemede toplam nete göre sırası (grup: sınıfı, düzeyi ya da okul) */
export function rank(s: number, e: number, group: Ent): { r: number; of: number } | null {
  const key = `${group}|${e}`;
  let m = rankCache.get(key);
  if (!m) {
    const list = members(group).filter((x) => PRES[e][x]).map((x) => [x, at(`s:${x}`, e, 'all', 'net')!] as const).sort((a, b) => b[1] - a[1]);
    m = new Map();
    list.forEach(([x, v], i) => m!.set(x, i > 0 && list[i - 1][1] === v ? m!.get(list[i - 1][0])! : i + 1));
    m.set(-1, list.length);
    rankCache.set(key, m);
  }
  const r = m.get(s);
  return r ? { r, of: m.get(-1)! } : null;
}

/* ---------- Soru düzeyi ---------- */
/** Öğrencinin bir sorudaki durumu: 0 doğru, 1 yanlış, 2 boş, -1 girmedi */
export function status(e: number, s: number, q: number): number {
  const a = ds.ans[e][s];
  if (!a) return -1;
  const o = a[q];
  return o === ds.exams[e].q[q].key ? 0 : o === BLANK ? 2 : 1;
}
export const present = (e: number, s: number) => PRES[e][s] === 1;
export const attended = (s: number) => range(0, LAST).filter((e) => PRES[e][s]);
export const LETTERS = 'ABCDE';
export { SUBJECTS, TOPICS, TESTS, ERRS, BLANK };
