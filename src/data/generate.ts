// Demo okul üreticisi. Gerçek bir okulun yüklediği veriyle aynı biçimde çıktı verir:
// öğrenciler, sınıflar, öğretmen atamaları, denemeler ve soru soru işaretlenen şıklar.
// Üretimde kullanılan gizli yetenek değerleri dışarı verilmez; analiz motoru her şeyi
// yalnızca cevaplardan çıkarır.
import { SUBJECTS, TOPICS, ERRS } from './curriculum';

export interface QOpt { err: number; pull: number }
export interface Question { i: number; subject: number; topic: number; key: number; opts: QOpt[]; est: number }
export interface Exam {
  i: number; id: string; no: number; name: string; date: string; publisher: string; q: Question[];
  nat: { mean: number; sd: number; n: number; test: number[] };
}
export interface Student { i: number; id: string; name: string; no: string; cls: number }
export interface Cls { i: number; id: string; name: string; level: number; students: number[]; teachers: number[] }
export interface Teacher { i: number; id: string; name: string; branch: string; subjects: number[] }
export interface Dataset {
  school: string; year: string;
  students: Student[]; classes: Cls[]; teachers: Teacher[]; exams: Exam[];
  /** ans[deneme][öğrenci] → 120 soruluk dizi (0–4 şık, 5 boş); girmediyse null */
  ans: (Uint8Array | null)[][];
}

export const BLANK = 5;

const FIRST = ['Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hüseyin', 'Emre', 'Burak', 'Can', 'Deniz', 'Efe', 'Eren', 'Kerem', 'Mert', 'Onur', 'Ozan', 'Serkan', 'Tolga', 'Umut', 'Yusuf', 'Kaan', 'Berk', 'Arda', 'Barış', 'Cem', 'Doruk', 'Ege', 'Furkan', 'Görkem', 'Hakan', 'İlker', 'Koray', 'Levent', 'Melih', 'Oğuz', 'Rüzgar', 'Selim', 'Tuna', 'Utku', 'Volkan', 'Yiğit', 'Ayşe', 'Fatma', 'Zeynep', 'Elif', 'Merve', 'Büşra', 'Esra', 'Selin', 'Derya', 'Ceren', 'Ece', 'Defne', 'Nehir', 'İrem', 'Gizem', 'Hande', 'İpek', 'Melis', 'Naz', 'Öykü', 'Pınar', 'Rana', 'Sena', 'Tuğçe', 'Yağmur', 'Zehra', 'Aslı', 'Cansu', 'Damla', 'Ebru', 'Feyza', 'Hilal', 'Işıl', 'Nil', 'Simge', 'Şevval', 'Beril', 'Duru', 'Ela', 'Azra', 'Asya', 'Mira', 'Ada', 'Eylül', 'Ilgın'];
const LAST = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek', 'Polat', 'Korkmaz', 'Aksoy', 'Güneş', 'Bulut', 'Taş', 'Tekin', 'Ateş', 'Avcı', 'Bozkurt', 'Duman', 'Ekinci', 'Güler', 'Işık', 'Karaca', 'Keskin', 'Özer', 'Sezer', 'Tuncer', 'Uçar', 'Ünal', 'Yavuz', 'Zengin', 'Akın', 'Başaran', 'Coşkun', 'Dinç', 'Erdem', 'Gündüz', 'Kaplan', 'Toprak', 'Uysal', 'Vural', 'Yalçın', 'Acar', 'Bayram', 'Candan'];

function rng(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const sig = (x: number) => 1 / (1 + Math.exp(-x));

export function generate(seed = 20251): Dataset {
  const r = rng(seed);
  const N = () => { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const nSub = SUBJECTS.length, nTop = TOPICS.length, nErr = ERRS.length;
  const subIdx = (id: string) => SUBJECTS.findIndex((s) => s.id === id);
  const topIdx = (id: string) => TOPICS.findIndex((t) => t.id === id);
  const errIdx = (id: string) => ERRS.findIndex((t) => t.id === id);

  const used = new Set<string>();
  const person = () => { for (;;) { const n = `${pick(FIRST)} ${pick(LAST)}`; if (!used.has(n)) { used.add(n); return n; } } };

  // Öğretmenler
  const teachers: Teacher[] = [];
  const BR: [string, number][] = [['Türk Dili ve Edebiyatı', 3], ['Matematik', 3], ['Fizik', 2], ['Kimya', 2], ['Biyoloji', 2], ['Tarih', 2], ['Coğrafya', 2], ['Felsefe', 1], ['Din Kültürü', 1]];
  for (const [branch, k] of BR) for (let j = 0; j < k; j++) {
    teachers.push({ i: teachers.length, id: `t${teachers.length + 1}`, name: person(), branch, subjects: SUBJECTS.filter((s) => s.branch === branch).map((s) => s.i) });
  }

  // Sınıflar ve öğrenciler
  const classes: Cls[] = [], students: Student[] = [];
  [11, 12].forEach((level, li) => 'ABCDE'.split('').forEach((sec, si) => {
    const c: Cls = { i: classes.length, id: `${level}-${sec}`, name: `${level}-${sec}`, level, students: [], teachers: [] };
    c.teachers = SUBJECTS.map((s) => { const tb = teachers.filter((t) => t.branch === s.branch); return tb[(si + li * 2) % tb.length].i; });
    const names = Array.from({ length: 26 + Math.floor(r() * 5) }, person).sort((a, b) => a.localeCompare(b, 'tr'));
    for (const name of names) {
      const i = students.length;
      students.push({ i, id: `s${i + 1}`, name, no: String(100 + ((i * 37) % 900)), cls: c.i });
      c.students.push(i);
    }
    classes.push(c);
  }));
  const nS = students.length, nC = classes.length;
  const C = (id: string) => classes.findIndex((c) => c.id === id);

  // Gizli parametreler
  const OFF: Record<string, number> = { '11-A': 0.16, '11-B': 0.02, '11-C': -0.1, '11-D': 0.08, '11-E': -0.3, '12-A': 0.45, '12-B': -0.16, '12-C': 0, '12-D': -0.06, '12-E': 0.1 };
  const clsBase = classes.map((c) => (c.level === 12 ? 0.3 : -0.3) + OFF[c.id]);
  const clsSub = classes.map(() => SUBJECTS.map(() => N() * 0.13));
  const drift = classes.map(() => SUBJECTS.map(() => N() * 0.012));
  const clsErr = classes.map(() => ERRS.map(() => Math.exp(N() * 0.15)));
  const clsTop = classes.map(() => new Float32Array(nTop));
  const gTop = new Float32Array(nTop);

  const TUR = subIdx('tur'), MAT = subIdx('mat'), GEO = subIdx('geo'), FIZ = subIdx('fiz');
  const c11B = C('11-B'), c11D = C('11-D'), c12C = C('12-C');
  clsSub[C('12-A')][TUR] += 0.35;
  clsSub[c12C][MAT] = -0.5; drift[c12C][MAT] = 0.115;
  clsSub[c12C][GEO] = -0.25; drift[c12C][GEO] = 0.06;
  clsSub[c11B][FIZ] = 0.85;
  clsErr[c11B][errIdx('mat.isaret')] = 3.8;
  clsErr[C('12-D')][errIdx('fen.birim')] = 3.6;
  clsErr[C('11-A')][errIdx('tr.olumsuz')] = 3.4;
  // Kök zayıflıklar: önkoşul konudan bağımlı konulara yayılır.
  const rootC = new Float32Array(nTop * nC);
  rootC[topIdx('mat.uslu') * nC + c11B] = -1.05;
  rootC[topIdx('geo.aci') * nC + C('12-E')] = -0.85;
  const rootG = new Float32Array(nTop);
  rootG[topIdx('mat.permutasyon')] = -0.95;
  rootG[topIdx('kim.atom')] = -0.45;
  for (const t of TOPICS) {
    let g = rootG[t.i];
    if (t.pre.length) g += 0.75 * t.pre.reduce((a, p) => a + gTop[p], 0) / t.pre.length;
    gTop[t.i] = g;
    for (let c = 0; c < nC; c++) {
      let v = rootC[t.i * nC + c];
      if (t.pre.length) v += 0.72 * t.pre.reduce((a, p) => a + clsTop[c][p], 0) / t.pre.length;
      clsTop[c][t.i] = v;
    }
  }
  const T_ELEK = topIdx('fiz.elektrik'), T_HAR = topIdx('fiz.hareket');
  const story = (c: number, j: number, t: number, e: number) => {
    let v = 0;
    if (c === c11B && j === FIZ && e >= 7) v -= 0.45 * (e - 6) * (t === T_ELEK ? 1.6 : t === T_HAR ? 1.3 : 0.7);
    if (c === c11D && e >= 8) v -= 0.21 * (e - 7);
    return v;
  };

  const g = new Float32Array(nS), growth = new Float32Array(nS), vol = new Float32Array(nS), blank = new Float32Array(nS);
  const absent = new Float32Array(nS), decline = new Uint8Array(nS);
  const sub: Float32Array[] = [], top: Float32Array[] = [], errP: Float32Array[] = [];
  for (const s of students) {
    g[s.i] = clsBase[s.cls] + N() * 0.72;
    growth[s.i] = 0.03 + N() * 0.03;
    vol[s.i] = Math.abs(0.13 + N() * 0.05);
    blank[s.i] = 0.3 + r() * 0.55;
    absent[s.i] = r() < 0.08 ? 0.2 : 0.025;
    const lean = N() * 0.45; // sayısal–sözel eğilimi
    sub.push(Float32Array.from(SUBJECTS, (x) => N() * 0.38 + (x.fam === 'mat' || x.fam === 'fen' ? lean : -0.6 * lean)));
    const tp = new Float32Array(nTop);
    for (const t of TOPICS) tp[t.i] = N() * 0.3 + (t.pre.length ? 0.45 * t.pre.reduce((a, p) => a + tp[p], 0) / t.pre.length : 0);
    top.push(tp);
    errP.push(Float32Array.from(ERRS, (_, k) => Math.exp(N() * 0.45) * clsErr[s.cls][k]));
  }
  for (let k = 0; k < 7; k++) growth[Math.floor(r() * nS)] += 0.075;
  for (let k = 0; k < 6; k++) decline[Math.floor(r() * nS)] = 1;
  for (let k = 0; k < 7; k++) vol[Math.floor(r() * nS)] = 0.3;

  // Denemeler
  const dates = ['2025-09-27', '2025-10-18', '2025-11-15', '2025-12-13', '2026-01-10', '2026-02-14', '2026-03-07', '2026-03-28', '2026-04-18', '2026-05-09'];
  const pubs = ['Atlas', 'Pusula', 'Mercek'];
  const nE = dates.length;
  const shift = dates.map(() => N() * 0.05); shift[5] = 0.3; shift[2] = -0.17;
  const exams: Exam[] = [], qb: Float32Array[] = [], qa: Float32Array[] = [];
  for (let e = 0; e < nE; e++) {
    const q: Question[] = [], B: number[] = [], A: number[] = [];
    for (const s of SUBJECTS) {
      const ts = TOPICS.filter((t) => t.subject === s.i);
      const raw = ts.map((t) => t.w * (0.7 + r() * 0.6));
      const tot = raw.reduce((a, b) => a + b, 0);
      const exp = raw.map((x) => (x * s.n) / tot);
      const cnt = exp.map(Math.floor);
      let left = s.n - cnt.reduce((a, b) => a + b, 0);
      const order = exp.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0]);
      for (let k = 0; left > 0; k++, left--) cnt[order[k % order.length][1]]++;
      const errs = ERRS.filter((x) => x.fam === s.fam);
      ts.forEach((t, ti) => {
        for (let k = 0; k < cnt[ti]; k++) {
          const key = Math.floor(r() * 5), trap = (key + 1 + Math.floor(r() * 4)) % 5;
          const b = s.base + N() * 0.85 + shift[e];
          q.push({
            i: q.length, subject: s.i, topic: t.i, key, est: b + N() * 0.45,
            opts: Array.from({ length: 5 }, (_, o) => (o === key ? { err: -1, pull: 0 } : { err: pick(errs).i, pull: o === trap ? 2 + r() * 4 : 0.4 + r() * 0.8 })),
          });
          B.push(b); A.push(0.9 + r() * 0.9);
        }
      });
    }
    qb.push(Float32Array.from(B)); qa.push(Float32Array.from(A));
    // Yayın geneli: denemenin gerçekleşen zorluğunu izler (sentetik).
    const NAT = [17.5, 9.2, 11.5, 5.8];
    const test = ['tr', 'sos', 'mat', 'fen'].map((id, k) => {
      const qs = q.filter((x) => SUBJECTS[x.subject].test === id);
      const off = qs.reduce((a, x) => a + B[x.i] - SUBJECTS[x.subject].base, 0) / qs.length;
      return Math.max(1, NAT[k] - qs.length * 0.27 * off + N() * 0.25);
    });
    exams.push({
      i: e, id: `d${e + 1}`, no: e + 1, name: `TYT Deneme ${e + 1}`, date: dates[e], publisher: `${pubs[e % 3]} Yayınları`, q,
      nat: { mean: test.reduce((a, b) => a + b, 0), sd: 21.5, n: 18000 + Math.floor(r() * 24000), test },
    });
  }

  // Cevaplar
  const ans: (Uint8Array | null)[][] = [];
  const w = new Float32Array(5);
  for (let e = 0; e < nE; e++) {
    const row: (Uint8Array | null)[] = [];
    const Q = exams[e].q;
    for (const s of students) {
      if (r() < absent[s.i]) { row.push(null); continue; }
      const out = new Uint8Array(Q.length);
      const form = N() * vol[s.i];
      const sn = SUBJECTS.map(() => N() * 0.12);
      const c = s.cls;
      for (const q of Q) {
        const j = q.subject, t = q.topic;
        const th = g[s.i] + sub[s.i][j] + top[s.i][t] + clsSub[c][j] + drift[c][j] * e + growth[s.i] * e + clsTop[c][t] + gTop[t]
          + story(c, j, t, e) - (decline[s.i] ? 0.075 * Math.max(0, e - 4) : 0) + form + sn[j];
        const b = qb[e][q.i];
        if (r() < sig(qa[e][q.i] * (th - b))) { out[q.i] = q.key; continue; }
        if (r() < blank[s.i] * (0.55 + 0.45 * sig(b - th))) { out[q.i] = BLANK; continue; }
        let tot = 0;
        for (let o = 0; o < 5; o++) { w[o] = o === q.key ? 0.9 : q.opts[o].pull * errP[s.i][q.opts[o].err]; tot += w[o]; }
        let x = r() * tot, o = 0;
        while (o < 4 && x > w[o]) { x -= w[o]; o++; }
        out[q.i] = o;
      }
      row.push(out);
    }
    ans.push(row);
  }

  return { school: 'Demo Anadolu Lisesi', year: '2025–2026', students, classes, teachers, exams, ans };
}
