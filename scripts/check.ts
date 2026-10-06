// Üretilen demo verinin ve analiz motorunun hızlı sağlaması: npx tsx scripts/check.ts
import { ds, NE, NS, LAST, at, val, win, series, SUBJECTS, TESTS, ALL_OK } from './shim.ts';
import { envelope, findings, luck, forecast, priorities, rootChains, errProfile, movers, why, ALL } from '../src/engine/analysis.ts';
import { fmt, sgn } from '../src/engine/fmt.ts';
import { ERRS, TOPICS } from '../src/data/curriculum.ts';

void ALL_OK;
const f = (x: number | null) => fmt(x, 1).padStart(6);
console.log(`${ds.school}: ${NS} öğrenci, ${ds.classes.length} sınıf, ${ds.teachers.length} öğretmen, ${NE} deneme`);
console.log('\nToplam net (deneme sırasıyla)');
for (const en of ['o', 'l:11', 'l:12', ...ds.classes.map((c) => `c:${c.i}`)]) {
  const name = en === 'o' ? 'Okul' : en[0] === 'l' ? en : ds.classes[+en.slice(2)].name;
  console.log(name.padEnd(6), series(en, 'all', 'net').map(f).join(''));
}
console.log('Yayın '.padEnd(6), ds.exams.map((x) => f(x.nat.mean)).join(''));
console.log('\nTest netleri (okul, tüm denemeler):', TESTS.map((t) => `${t.name} ${fmt(val('o', ALL, `t:${t.id}`, 'net'))}`).join(' | '));
console.log('Katılım:', ds.exams.map((x) => ds.ans[x.i].filter(Boolean).length).join(' '));
const one = (c: string, j: string) => series(`c:${ds.classes.findIndex((x) => x.id === c)}`, `s:${SUBJECTS.findIndex((s) => s.id === j)}`, 'net').map(f).join('');
console.log('\n11-B Fizik ', one('11-B', 'fiz'));
console.log('11-C Fizik ', one('11-C', 'fiz'));
console.log('12-C Mat   ', one('12-C', 'mat'));
console.log('12-B Mat   ', one('12-B', 'mat'));
console.log('12-A Türkçe', one('12-A', 'tur'));
console.log('12-B Türkçe', one('12-B', 'tur'));

console.log('\nBulgular (son 3 deneme):');
for (const x of findings('o', '3').slice(0, 16)) console.log(` [${x.tone}] ${fmt(x.score)} ${x.title}\n      ${x.text}`);

console.log('\nKapalı zarf:');
for (let e = 3; e < NE; e++) {
  const v = envelope(e)!;
  console.log(` d${e + 1}: n=${v.n} kayma=${sgn(v.shift)} MAE=${fmt(v.mae)} (düzeltilmiş ${fmt(v.maeAdj)}) ±5 isabet=%${fmt(v.hit * 100, 0)} (düz. %${fmt(v.hitAdj * 100, 0)}) bant içi=%${fmt(v.inBand * 100, 0)} r=${fmt(v.r, 2)} soru MAE=${fmt(v.qMae * 100, 0)} puan`);
}
const s0 = ds.classes[1].students[3];
console.log('\nŞans neti örneği:', ds.students[s0].name, JSON.stringify(luck(LAST, s0), (k, v) => (typeof v === 'number' ? +v.toFixed(2) : Array.isArray(v) ? v.length : v)));
console.log('Projeksiyon:', JSON.stringify(forecast(s0), (k, v) => (typeof v === 'number' ? +v.toFixed(1) : v)));
console.log('\n11-B öncelikler:', priorities('c:1').slice(0, 6).map((p) => `${TOPICS[p.t].name} %${fmt(p.pct, 0)}→%${fmt(p.ref, 0)} +${fmt(p.gain, 2)}${p.root != null ? ` (kök: ${TOPICS[p.root].name})` : ''}`).join(' | '));
console.log('11-B kök:', rootChains('c:1').map((c) => `${TOPICS[c.root].name} ${fmt(c.def, 0)} → ${c.deps.map((d) => TOPICS[d.t].name).join(', ')}`).join(' || '));
console.log('Okul kök:', rootChains('o').slice(0, 4).map((c) => `${TOPICS[c.root].name} ${fmt(c.def, 0)} → ${c.deps.map((d) => TOPICS[d.t].name).join(', ')}`).join(' || '));
console.log('11-B hata:', errProfile('c:1', ALL, 'l:11').slice(0, 5).map((r) => `${ERRS[r.k].name} ${fmt(r.n, 2)} x${fmt(r.lift, 2)}`).join(' | '));
const w = win('3');
const mv = movers(ds.classes.map((c) => `c:${c.i}`), SUBJECTS.map((s) => `s:${s.i}`), 'net', w).sort((a, b) => a.diff - b.diff);
console.log('\nEn çok düşen sınıf×ders:', mv.slice(0, 4).map((m) => `${ds.classes[+m.en.slice(2)].name} ${SUBJECTS[+m.sc.slice(2)].name} ${sgn(m.diff)}`).join(' | '));
console.log('En çok artan sınıf×ders:', mv.slice(-4).map((m) => `${ds.classes[+m.en.slice(2)].name} ${SUBJECTS[+m.sc.slice(2)].name} ${sgn(m.diff)}`).join(' | '));
const y = why('c:1', 's:7', 'net', w)!;
console.log('\nNeden? 11-B Fizik:', sgn(y.total), '| konu:', y.byScope.map((p) => `${p.label} ${sgn(p.v, 2)}`).join(', '));
console.log(' konu toplamı:', sgn(y.byScope.reduce((a, p) => a + p.v, 0), 3), '| öğrenci toplamı + kalan:', sgn(y.byMember.reduce((a, p) => a + p.v, 0) + y.rest, 3), '| kalan:', sgn(y.rest, 2));
console.log(' hata türleri:', y.byErr.slice(0, 4).map((p) => `${p.label} ${sgn(p.v, 2)}`).join(', '));
console.log('\nÖrnek öğrenci netleri:', [0, 40, 100, 200, 270].map((s) => `${ds.students[s].name}: ${fmt(at(`s:${s}`, LAST, 'all', 'net'))}`).join(' | '));
