// "Ara veya sor": yerel arama ve hazır soru kalıpları. Yapay zekâ çağrısı yapmaz;
// yazılan metinde sınıf, kişi, ders ve konu adlarını bulur, niyeti anahtar sözcüklerden çıkarır.
import { ds, SUBJECTS, TOPICS, TESTS, entName, entHref, entSub, scopeFull, defMetric, type Ent, type Scope, type Per, type Metric } from './core';
import { fold } from './fmt';

export type HitIcon = 'page' | 'class' | 'student' | 'teacher' | 'topic' | 'exam' | 'ask';
export interface Hit { id: string; label: string; hint: string; icon: HitIcon; to?: string; why?: { en: Ent; sc: Scope; m: Metric; per: Per } }

export const PAGES: { label: string; to: string; keys: string }[] = [
  { label: 'Genel bakış', to: '/', keys: 'ana sayfa ozet' },
  { label: 'Yükselenler ve düşenler', to: '/hareketler', keys: 'artan azalan hareket cikis dusus' },
  { label: 'Karşılaştır', to: '/karsilastir', keys: 'kiyas filtre' },
  { label: 'Sınıflar', to: '/siniflar', keys: 'sube' },
  { label: 'Öğrenciler', to: '/ogrenciler', keys: 'takip listesi' },
  { label: 'Öğretmenler', to: '/ogretmenler', keys: 'brans' },
  { label: 'Denemeler', to: '/denemeler', keys: 'sinav soru turkiye ortalamasi tahmin zarfi' },
  { label: 'Konular', to: '/konular', keys: 'harita baglanti temel eksik ne yapmali oncelik' },
  { label: 'Bugün sınav olsa', to: '/tahmin', keys: 'tahmin puan tyt' },
  { label: 'Raporlar', to: '/raporlar', keys: 'donem ozeti cikti yazdir' },
  { label: 'Veri', to: '/veri', keys: 'ogretmen atama disa aktar csv' },
];
export const EXAMPLES = ['11-B fizik neden düştü', '12-C ile 12-B matematik karşılaştır', 'en çok yükselen öğrenciler', '11-B ne yapmalı', 'son denemenin tahmin zarfı'];

const idx = {
  subjects: SUBJECTS.map((s) => ({ sc: `s:${s.i}`, f: fold(s.name) })),
  tests: TESTS.map((t) => ({ sc: `t:${t.id}`, f: fold(t.name) })),
  topics: TOPICS.map((t) => ({ sc: `k:${t.i}`, f: fold(t.name), sub: SUBJECTS[t.subject].name })),
  students: ds.students.map((s) => ({ en: `s:${s.i}`, f: fold(s.name) })),
  teachers: ds.teachers.map((t) => ({ en: `t:${t.i}`, f: fold(t.name) })),
};
const has = (f: string, ...words: string[]) => words.some((w) => f.includes(w));

export function search(text: string, per: Per): Hit[] {
  const f = fold(text.trim());
  if (!f) return [];
  const out: Hit[] = [];
  // --- Metindeki varlıklar ve kapsamlar
  const ents: Ent[] = [];
  for (const m of f.matchAll(/\b(11|12)\s*[-/. ]?\s*([a-e])\b/g)) { const c = ds.classes.find((x) => x.id === `${m[1]}-${m[2].toUpperCase()}`); if (c && !ents.includes(`c:${c.i}`)) ents.push(`c:${c.i}`); }
  for (const p of [...idx.students, ...idx.teachers]) if (f.includes(p.f)) ents.push(p.en);
  if (has(f, 'okul')) ents.push('o');
  const scopes: Scope[] = [];
  for (const t of idx.topics) if (t.f.length > 4 && f.includes(t.f)) scopes.push(t.sc);
  if (!scopes.length) for (const s of idx.subjects) if (f.includes(s.f)) scopes.push(s.sc);
  if (!scopes.length) for (const t of idx.tests) if (f.includes(t.f)) scopes.push(t.sc);
  const sc = scopes[0] ?? 'all';
  const who = ents.map(entName).join(' ve ');

  // --- Niyet
  if (ents.length && has(f, 'neden', 'niye', 'niçin', 'nicin')) {
    out.push({ id: 'a-why', icon: 'ask', label: `${who}, ${scopeFull(sc)}: neden değişti?`, hint: 'Neden?', why: { en: ents[0], sc, m: defMetric(sc), per } });
  }
  if (ents.length >= 2 || (ents.length && has(f, 'karsilastir', 'kiyas', ' vs '))) {
    out.push({ id: 'a-cmp', icon: 'ask', label: `Karşılaştır: ${who}, ${scopeFull(sc)}`, hint: 'Karşılaştır', to: `/karsilastir?k=${ents.join(',')}&n=${sc}` });
  }
  if (ents.length === 1 && has(f, 'ne yapmali', 'oncelik', 'eksik', 'zayif')) {
    out.push({ id: 'a-prio', icon: 'ask', label: `${who}: ne yapmalı?`, hint: 'Konular', to: `/konular?kim=${ents[0]}&gorunum=oncelik` });
  }
  if (has(f, 'yuksel', 'artan', 'artis', 'cikis', 'dusen', 'dusus', 'azal', 'gerile')) {
    const kind = has(f, 'ogrenci') ? 'ogrenci' : has(f, 'ogretmen') ? 'ogretmen' : 'sinif';
    out.push({ id: 'a-mov', icon: 'ask', label: `Yükselenler ve düşenler: ${kind === 'ogrenci' ? 'öğrenciler' : kind === 'ogretmen' ? 'öğretmenler' : 'sınıflar'}, ${scopeFull(sc)}`, hint: 'Hareketler', to: `/hareketler?kim=${kind}&n=${sc}` });
  }
  if (has(f, 'zarf')) out.push({ id: 'a-env', icon: 'ask', label: `${ds.exams[ds.exams.length - 1].name}: tahmin zarfı`, hint: 'Deneme', to: `/deneme/${ds.exams[ds.exams.length - 1].id}?sekme=zarf` });
  if (has(f, 'bugun sinav', 'tahmin', 'projeksiyon')) out.push({ id: 'a-fc', icon: 'ask', label: `Bugün sınav olsa${ents.length ? `: ${entName(ents[0])}` : ''}`, hint: 'Tahmin', to: `/tahmin${ents.length ? `?kim=${ents[0]}` : ''}` });
  if (ents.length === 1 && scopes.length && !out.length) out.push({ id: 'a-cmp1', icon: 'ask', label: `${who}, ${scopeFull(sc)}: grafiğini aç`, hint: 'Karşılaştır', to: `/karsilastir?k=${ents[0]}&n=${sc}` });

  // --- Düz arama
  const words = f.split(/\s+/);
  const match = (s: string) => words.every((w) => s.includes(w));
  for (const p of PAGES) if (match(fold(p.label) + ' ' + p.keys)) out.push({ id: `p${p.to}`, icon: 'page', label: p.label, hint: 'Sayfa', to: p.to });
  for (const c of ds.classes) if (match(fold(c.name)) || ents.includes(`c:${c.i}`)) out.push({ id: `c${c.i}`, icon: 'class', label: c.name, hint: entSub(`c:${c.i}`), to: entHref(`c:${c.i}`) });
  for (const t of idx.teachers) if (match(t.f)) out.push({ id: t.en, icon: 'teacher', label: entName(t.en), hint: entSub(t.en), to: entHref(t.en) });
  let n = 0;
  for (const s of idx.students) if (match(s.f) && n++ < 12) out.push({ id: s.en, icon: 'student', label: entName(s.en), hint: entSub(s.en), to: entHref(s.en) });
  n = 0;
  for (const t of idx.topics) if ((match(t.f) || scopes.includes(t.sc)) && n++ < 10) out.push({ id: t.sc, icon: 'topic', label: scopeFull(t.sc), hint: 'Konu', to: `/konu/${TOPICS[+t.sc.slice(2)].id}` });
  for (const e of ds.exams) if (match(fold(e.name))) out.push({ id: e.id, icon: 'exam', label: e.name, hint: e.publisher, to: `/deneme/${e.id}` });
  return out.slice(0, 40);
}
