// Tanıtım filmi için veriden doğrulanan sayılar: npx tsx scripts/facts.ts
import { ds, NE, LAST, at, val, win, series, SUBJECTS, PERS, members, type Ent } from './shim.ts';
import { move, topicStats, rootOf, ALL } from '../src/engine/analysis.ts';
import { groupRepeats } from '../src/engine/repeat.ts';
import { TOPICS } from '../src/data/curriculum.ts';

const r1 = (x: number | null) => (x == null ? '–' : x.toFixed(1));
console.log('SUBJECTS', SUBJECTS.map((s) => `${s.i}:${s.name}(${s.test})`).join(' '));
console.log('CLASSES', ds.classes.map((c, i) => `${i}:${c.name}`).join(' '));
console.log('PERS', PERS.map((p) => p.id).join(' '), 'NE', NE);
for (const p of PERS) {
  const w = win(p.id);
  console.log('per', p.id, ds.classes.map((c, i) => { const m = move(`c:${i}`, 'all', 'net', w); return `${c.name} ${r1(val(`c:${i}`, w.cur, 'all', 'net'))} d=${r1(m?.diff ?? null)} ${m && (m as any).pct != null ? 'pct=' + r1((m as any).pct) : ''}`; }).join(' | '));
}
console.log('move keys', Object.keys(move('c:5', 'all', 'net', win(PERS[0].id)) ?? {}));
// Fizik konuları: okul ve 11-A/B/C için yüzde serileri
const fiz = SUBJECTS.find((s) => s.name === 'Fizik')!;
for (const t of TOPICS.filter((t) => t.subject === fiz.i)) {
  const row = (['o', 'l:11', 'c:0', 'c:1', 'c:2'] as Ent[]).map((en) => { const s = series(en, `k:${t.i}`, 'pct'); const v = s.filter((x): x is number => x != null); return `${en} ${r1(v[0])}→${r1(v[v.length - 1])}`; }).join('  ');
  console.log('FIZ', t.i, t.name, '|', row, '| okul:', series('o', `k:${t.i}`, 'pct').map((x) => (x == null ? '–' : Math.round(x))).join(' '));
}
// Esra Bulut
const es = ds.students.findIndex((s) => s.name === 'Esra Bulut');
if (es >= 0) {
  const c = ds.students[es].cls, lv = `l:${ds.classes[c].level}` as Ent;
  console.log('ESRA s:' + es, ds.classes[c].name, 'net', series(`s:${es}`, 'all', 'net').map(r1).join(' '));
  console.log('  sinif', series(`c:${c}`, 'all', 'net').map(r1).join(' '));
  console.log('  duzey', series(lv, 'all', 'net').map(r1).join(' '));
  for (const p of PERS) console.log('  per', p.id, r1(move(`s:${es}`, 'all', 'net', win(p.id))?.diff ?? null));
}
// en çok düşen öğrenciler
for (const p of PERS) {
  const w = win(p.id);
  const l = members('o').map((s) => ({ s, d: move(`s:${s}`, 'all', 'net', w)?.diff ?? 0 })).sort((a, b) => a.d - b.d).slice(0, 3);
  console.log('dusen', p.id, l.map((x) => `${ds.students[x.s].name}(s:${x.s}) ${r1(x.d)}`).join(', '));
}
// 12-C üst üste yanlışlar
const c12 = ds.classes.findIndex((c) => c.name === '12-C');
const g = groupRepeats(`c:${c12}`, 'yb', 3, TOPICS.map((t) => t.i));
console.log('12-C tekrar', g.topics.sort((a, b) => b.who.suren.length - a.who.suren.length).slice(0, 6).map((t) => `${TOPICS[t.t].name} ${t.who.suren.length}/${t.of}`).join(' | '));
// Konular: okul geneli en zayıflar ve Olasılık'ın kökü
const ts = topicStats('o', ALL);
console.log('topicStat keys', Object.keys(ts[0]));
const pk = (x: any) => x.pct ?? x.p ?? x.v;
console.log('zayif', [...ts].sort((a: any, b: any) => pk(a) - pk(b)).slice(0, 6).map((x: any) => `${TOPICS[x.t].name} ${r1(pk(x))}`).join(' | '));
const ol = TOPICS.find((t) => t.name.startsWith('Olasılık'));
if (ol) console.log('OLASILIK', ol.i, 'pre', ol.pre.map((i) => TOPICS[i].name).join(','), 'root', (() => { const r = rootOf('o', ol.i); return r == null ? '–' : TOPICS[r].name; })());
console.log('LAST', LAST, at('o', LAST, 'all', 'net'));
