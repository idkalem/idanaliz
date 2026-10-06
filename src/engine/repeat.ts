// Üst üste yanlışlar: bir öğrenci aynı konuyu art arda denemelerde yapamıyor mu, düzeldi mi, yeni mi bozuldu?
// Her öğrenci × konu için denemeler sırayla okunur; konu sorulmayan ya da öğrencinin girmediği denemeler atlanır.
import { ds, NE, NT, TC, PRES, QN, TOPICS, members, entKind, entI, teacherPairs, type Ent } from './core';

/** Neyin "yapamadı" sayılacağı: yanlış ve boş, yalnız yanlış, yalnız boş */
export type Miss = 'yb' | 'y' | 'b';
/** Bir denemede konunun durumu. Konudan birden çok soru çıkabildiği için çoğunluğa bakılır:
 *  d soruların yarısından fazlası doğru, h tam yarısı doğru, y ve b yarısından azı doğru (yanlış ya da boş ağır basıyor).
 *  "En az bir yanlış" ölçüsü kullanılmaz: beş soruluk konuda dördünü yapan öğrenci her denemede sorunlu görünürdü. */
export type St = 'd' | 'y' | 'b' | 'h';
/** suren: üst üste yapamıyor. duzelen: yapamıyordu, artık doğru. bozulan: doğruydu, son denemede yapamadı.
 *  dalgali: bir yapıyor bir yapamıyor. saglam: üst üste doğru. */
export type RepKind = 'suren' | 'duzelen' | 'bozulan' | 'dalgali' | 'saglam' | 'diger';
export type Kind = Exclude<RepKind, 'diger'>;
export const REP_KINDS: Kind[] = ['suren', 'duzelen', 'bozulan', 'dalgali', 'saglam'];

export interface Rep {
  s: number; t: number;
  /** her deneme için durum; null: konu sorulmadı ya da öğrenci girmedi */
  cells: (St | null)[];
  /** konuyla karşılaştığı, yapamadığı ve tam doğru yaptığı deneme sayısı */
  asked: number; miss: number; hit: number;
  /** sondan geriye: üst üste yapamadığı ve üst üste doğru yaptığı deneme sayısı */
  run: number; clean: number;
  /** son doğru serisinden önceki yapamama serisi; son yapamama serisinden önceki doğru serisi */
  prevRun: number; prevClean: number;
  /** yıl içindeki en uzun yapamama serisi ve durumun kaç kez değiştiği */
  best: number; flips: number;
  kind: RepKind;
  /** son serinin ilk ve son denemesi (çerçeve için); seri yoksa -1 */
  from: number; to: number;
}

export function cellOf(e: number, s: number, t: number): St | null {
  if (!PRES[e][s] || !QN[e][t]) return null;
  const o = (s * NT + t) * 3, tc = TC[e], d = tc[o], y = tc[o + 1], b = tc[o + 2], n = d + y + b;
  return d * 2 > n ? 'd' : d * 2 === n ? 'h' : y >= b ? 'y' : 'b';
}
/** Öğrencinin o denemede o konudaki doğru, yanlış, boş sayısı */
export function qCount(e: number, s: number, t: number): [number, number, number] {
  const o = (s * NT + t) * 3, tc = TC[e];
  return [tc[o], tc[o + 1], tc[o + 2]];
}
const isMiss = (x: St, mode: Miss) => (mode === 'yb' ? x === 'y' || x === 'b' : x === mode);
const back = (a: boolean[], from: number) => { let k = 0; for (let i = from; i >= 0 && a[i]; i--) k++; return k; };

/** `min`: kaç deneme üst üste olunca seri sayılır */
export function repOf(s: number, t: number, mode: Miss, min: number): Rep | null {
  const cells: (St | null)[] = [], seq: number[] = [];
  for (let e = 0; e < NE; e++) { const c = cellOf(e, s, t); cells.push(c); if (c) seq.push(e); }
  const n = seq.length;
  if (!n) return null;
  const ms = seq.map((e) => isMiss(cells[e]!, mode)), ok = seq.map((e) => cells[e] === 'd');
  const run = back(ms, n - 1), clean = back(ok, n - 1);
  const prevRun = clean ? back(ms, n - 1 - clean) : 0, prevClean = run ? back(ok, n - 1 - run) : 0;
  let best = 0, cur = 0, flips = 0, miss = 0;
  ms.forEach((x, i) => { cur = x ? cur + 1 : 0; if (cur > best) best = cur; if (x) miss++; if (i && x !== ms[i - 1]) flips++; });
  const kind: RepKind = run >= min ? 'suren' : clean && prevRun >= min ? 'duzelen' : run && prevClean >= min ? 'bozulan'
    : clean >= min ? 'saglam' : n >= 4 && flips >= n - 2 ? 'dalgali' : 'diger';
  const a = kind === 'suren' || kind === 'bozulan' ? n - run : kind === 'duzelen' || kind === 'saglam' ? n - clean : -1;
  return { s, t, cells, asked: n, miss, hit: ok.filter(Boolean).length, run, clean, prevRun, prevClean, best, flips, kind, from: a < 0 ? -1 : seq[a], to: seq[n - 1] };
}
/** Türe göre sıralamada ve grafiklerde kullanılan sayı (hepsi "kaç deneme"; dalgalıda kaç kez değişti) */
export const repVal = (r: Rep, k: RepKind) => (k === 'suren' ? r.run : k === 'duzelen' ? r.prevRun : k === 'bozulan' ? r.prevClean : k === 'dalgali' ? r.flips : r.clean);
const GOOD: Record<RepKind, boolean> = { suren: false, duzelen: true, bozulan: false, dalgali: false, saglam: true, diger: false };
/** En dikkat çeken üstte: seri uzunluğu, eşitlikte yıl boyunca yapamama oranı */
export const repSort = (k: RepKind) => (a: Rep, b: Rep) => repVal(b, k) - repVal(a, k) || (GOOD[k] ? a.miss / a.asked - b.miss / b.asked : b.miss / b.asked - a.miss / a.asked) || a.t - b.t;

/** Bir öğrencinin, verilen konulardaki bütün serileri */
export function repeats(s: number, mode: Miss, min: number, topics: number[]): Rep[] {
  const out: Rep[] = [];
  for (const t of topics) { const r = repOf(s, t, mode, min); if (r) out.push(r); }
  return out;
}

/** Varlığın öğrenci–konu eşleşmeleri. Öğretmende yalnız girdiği sınıf–ders çiftleri sayılır. */
function pairs(en: Ent, topics: number[]): { s: number[]; t: number[] }[] {
  if (entKind(en) !== 'teacher') return [{ s: members(en), t: topics }];
  const byJ = new Map<number, number[]>();
  for (const p of teacherPairs(entI(en))) { const l = byJ.get(p.j) ?? []; l.push(...ds.classes[p.c].students); byJ.set(p.j, l); }
  return [...byJ].map(([j, s]) => ({ s, t: topics.filter((t) => TOPICS[t].subject === j) }));
}
/** `of`: konuyla karşılaşan öğrenci sayısı. `who`: türe göre öğrencilerin serileri, en uzunu başta. */
export interface TopicRep { t: number; of: number; who: Record<RepKind, Rep[]> }
/** `of`: öğrencinin karşılaştığı konu sayısı. `n`: türe göre konu sayısı. `worst`: en uzun süren serisi. */
export interface StuRep { s: number; of: number; n: Record<RepKind, number>; worst: Rep | null }
const blank = <T,>(f: () => T): Record<RepKind, T> => ({ suren: f(), duzelen: f(), bozulan: f(), dalgali: f(), saglam: f(), diger: f() });

/** Sınıf, düzey, okul ya da öğretmen için: hangi konuda kaç öğrenci, hangi öğrencide kaç konu */
export function groupRepeats(en: Ent, mode: Miss, min: number, topics: number[]): { topics: TopicRep[]; students: StuRep[] } {
  const tm = new Map<number, TopicRep>(), sm = new Map<number, StuRep>();
  for (const p of pairs(en, topics)) {
    for (const s of p.s) {
      let sr = sm.get(s);
      if (!sr) { sr = { s, of: 0, n: blank(() => 0), worst: null }; sm.set(s, sr); }
      for (const t of p.t) {
        const r = repOf(s, t, mode, min);
        if (!r) continue;
        let tr = tm.get(t);
        if (!tr) { tr = { t, of: 0, who: blank<Rep[]>(() => []) }; tm.set(t, tr); }
        tr.of++; tr.who[r.kind].push(r);
        sr.of++; sr.n[r.kind]++;
        if (r.kind === 'suren' && (!sr.worst || r.run > sr.worst.run)) sr.worst = r;
      }
    }
  }
  for (const tr of tm.values()) for (const k of REP_KINDS) tr.who[k].sort(repSort(k));
  return { topics: [...tm.values()], students: [...sm.values()].filter((x) => x.of > 0) };
}
