import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Lock, BarChart3, Globe, Users, CircleX, BookOpen, School, LayoutGrid, Crosshair, CircleCheck, Gauge, ThumbsUp, TriangleAlert, Check, GitCompareArrows, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';
import {
  ds, NE, PRES, SUBJECTS, TOPICS, TESTS, ERRS, LETTERS, METRICS, METRIC_IDS, at, cnt, members, classesOf, rootEnt, entHref, entName, scopeName, type Ent, type Metric,
} from '../engine/core';
import { envelope, qStats, natPct, ENV_MIN, ALL, type QStat, type EnvRow } from '../engine/analysis';
import { fmt, sgn, pct, date } from '../engine/fmt';
import { useStore, openQ, openEnv } from '../store';
import { Page, Card, Delta, Num, DataTable, Tabs, Sel, Seg, EntLink, TopicLink, Empty, useQuery, Tile, Who, LBar, PctBar, SubjDot, LevelLegend, kOf, LV_LO, type Col } from '../ui';
import { LineChart, Bars, Scatter, QGrid, SERIES } from '../charts';
import { type CmpRow } from '../cmpcharts';
import { CmpCard, TimeCard, timeSer, mkRow, fmtFor, scColor, kidScopes, MetricSeg, Ctl, BRK } from '../board';
import { EXAM_LABELS, EXAM_TITLES } from './Home';

/* ================= Deneme listesi ================= */
/** Liste başlıklarında testlerin kısa adı; tam ad üzerine gelince görünür. */
const TSHORT: Record<string, string> = { tr: 'Türkçe', sos: 'Sosyal', mat: 'Matematik', fen: 'Fen' };
export function Exams() {
  const st = useStore(), nav = useNavigate();
  const [sel, setSel] = useState<number[]>([]);
  const root = rootEnt(st.level), mem = members(root);
  interface Row { e: number; n: number; net: number | null; nat: number; tests: (number | null)[] }
  const rows: Row[] = ds.exams.map((x) => ({
    e: x.i, n: mem.filter((s) => PRES[x.i][s]).length, net: at(root, x.i, 'all', 'net'), nat: x.nat.mean, tests: TESTS.map((t) => at(root, x.i, `t:${t.id}`, 'net')),
  }));
  const top = Math.max(...rows.map((r) => r.net ?? 0));
  const cols: Col<Row>[] = [
    {
      id: 'sec', head: 'Seç', cell: (r) => {
        const on = sel.includes(r.e);
        return (
          <button className="chk-b" aria-pressed={on} title={on ? 'Karşılaştırmadan çıkar' : 'Karşılaştırmaya ekle'} aria-label={`${ds.exams[r.e].name}: karşılaştırmaya ekle`}
            onClick={(ev) => { ev.stopPropagation(); setSel(on ? sel.filter((i) => i !== r.e) : [...sel, r.e]); }}>
            <span className={`chk ${on ? 'on' : ''}`}>{on && <Check size={12} strokeWidth={3.2} />}</span>
          </button>
        );
      },
    },
    { id: 'ad', head: 'Deneme', cell: (r) => <span className="ent nowrap">{ds.exams[r.e].name}</span>, val: (r) => ds.exams[r.e].name },
    { id: 'tarih', head: 'Tarih', cell: (r) => <span className="nowrap">{date(ds.exams[r.e].date, true)}</span>, val: (r) => ds.exams[r.e].date },
    { id: 'n', head: 'Giren öğrenci', right: true, cell: (r) => <>{r.n} <span className="dim">/ {mem.length}</span></>, val: (r) => r.n },
    { id: 'net', head: 'Ortalama net', cell: (r) => <LBar v={r.net} max={top}>{fmt(r.net)}</LBar>, val: (r) => r.net },
    { id: 'nat', head: 'Türkiye ortalaması', hd: <span title="Türkiye ortalaması">Türkiye ort.</span>, right: true, cell: (r) => fmt(r.nat), val: (r) => r.nat },
    { id: 'fark', head: 'Fark', right: true, cell: (r) => <Delta v={r.net != null ? r.net - r.nat : null} />, val: (r) => (r.net != null ? r.net - r.nat : null) },
    ...TESTS.map((t, i): Col<Row> => ({ id: t.id, head: t.name, hd: <span title={t.name}>{TSHORT[t.id] ?? t.name}</span>, right: true, cell: (r) => fmt(r.tests[i]), val: (r) => r.tests[i] })),
    { id: 'zarf', head: 'Tahmin zarfı', cell: (r) => (r.e < ENV_MIN ? <span className="dim">–</span> : st.envOpen.includes(ds.exams[r.e].id) ? <span className="tag good">Açıldı</span> : <span className="tag info">Kapalı</span>) },
  ];
  return (
    <Page title="Denemeler" sub={`${NE} deneme yüklü. Bir denemeye tıklayınca sonuçları açılır.`}
      actions={<Link className="btn" to="/karsilastir?mod=deneme"><GitCompareArrows size={15} />Son 3 denemeyi karşılaştır</Link>}>
      <div className="stack">
        <TimeCard title={`${entName(root)} ve Türkiye ortalaması`} icon={<BarChart3 size={16} />} hint="Her denemedeki ortalama net. Mavi çizgi gri çizginin ne kadar üstündeyse okul o kadar iyi."
          m="net" exams={ALL} series={[timeSer(root, 'all', 'net', 'var(--accent)', ALL), { name: 'Türkiye ortalaması', color: 'var(--ink3)', values: rows.map((r) => r.nat), dash: true }]} />
        <Card flush title="Bütün denemeler" icon={<ClipboardList size={16} />} hint="Karşılaştırmak istediğiniz denemelerin kutusunu işaretleyin. Satıra tıklayınca o denemenin sonuçları açılır."
          action={sel.length >= 2
            ? <Link className="btn pri" to={`/karsilastir?mod=deneme&d=${[...sel].sort((a, b) => a - b).map((i) => i + 1).join(',')}`}><GitCompareArrows size={15} />Seçilen {sel.length} denemeyi karşılaştır</Link>
            : <button className="btn" disabled><GitCompareArrows size={15} />{sel.length ? 'Bir deneme daha seçin' : 'Karşılaştırmak için deneme seçin'}</button>}>
          <DataTable cols={cols} rows={rows} rowKey={(r) => r.e} onRow={(r) => nav(`/deneme/${ds.exams[r.e].id}`)} sort={{ id: 'tarih', desc: true }} csv="denemeler" />
        </Card>
        <p className="note" style={{ maxWidth: '82ch' }}>Türkiye ortalamaları bu örnekte üretilmiş değerlerdir; gerçek kullanımda yayınevinin açıkladığı Türkiye geneli sonuçlar girilir.</p>
      </div>
    </Page>
  );
}

/* ================= Tek deneme ================= */
export function ExamPage() {
  const { id } = useParams();
  const x = ds.exams.find((e) => e.id === id);
  if (!x) return <Page title="Deneme bulunamadı"><Card><Empty title="Bu adreste bir deneme yok">Denemeler listesinden seçerek devam edebilirsiniz.</Empty></Card></Page>;
  return <ExamView e={x.i} />;
}

const TABS = [{ id: 'ozet', label: 'Özet' }, { id: 'sorular', label: 'Sorular' }, { id: 'sonuclar', label: 'Öğrenciler' }, { id: 'zarf', label: 'Tahmin zarfı' }];

function ExamView({ e }: { e: number }) {
  const st = useStore(), q = useQuery();
  const x = ds.exams[e], root = rootEnt(st.level);
  const t0 = q.get('sekme', 'ozet'), tab = TABS.some((t) => t.id === t0) ? t0 : 'ozet';
  const kim = q.get('kim'), grp: Ent = /^c:\d+$/.test(kim) && ds.classes[+kim.slice(2)] ? kim : root;
  const all = members(root), n = all.filter((s) => PRES[e][s]).length, net = at(root, e, 'all', 'net');
  const gap = net != null ? net - x.nat.mean : null;
  const hard = qStats(e, root).filter((r) => r.p * 100 < LV_LO).length;
  const groups = [{ id: root, label: entName(root) }, ...classesOf(root).map((c) => ({ id: `c:${c}`, label: ds.classes[c].name }))];
  const pick = <Sel label="Kimin sonucu" value={grp} onChange={(g) => q.put({ kim: g === root ? null : g })} options={groups.some((g) => g.id === grp) ? groups : [...groups, { id: grp, label: entName(grp) }]} />;
  const side = (i: number) => `/deneme/${ds.exams[i].id}${tab !== 'ozet' ? `?sekme=${tab}` : ''}`;
  return (
    <Page title={x.name} crumb={<Link to="/denemeler">Denemeler</Link>} sub={`${date(x.date, true)}, ${x.publisher}. ${x.q.length} soru.`}
      actions={<>
        {e > 0 ? <Link className="btn icon" aria-label="Önceki deneme" to={side(e - 1)}><ChevronLeft size={17} /></Link> : <button className="btn icon" disabled aria-label="Önceki deneme"><ChevronLeft size={17} /></button>}
        {e < NE - 1 ? <Link className="btn icon" aria-label="Sonraki deneme" to={side(e + 1)}><ChevronRight size={17} /></Link> : <button className="btn icon" disabled aria-label="Sonraki deneme"><ChevronRight size={17} /></button>}
      </>}>
      <div className="tiles">
        <Tile tone="brand" icon={<BarChart3 size={17} />} label={`${entName(root)} ortalaması`} unit="net"
          sub={e > 0 ? <><Delta v={net != null ? net - (at(root, e - 1, 'all', 'net') ?? net) : null} /> bir önceki denemeye göre</> : `${x.q.length} soruda ortalama net`}>
          <Num v={net} />
        </Tile>
        <Tile tone={gap == null ? '' : gap >= 0 ? 'good' : 'bad'} icon={<Globe size={17} />} label="Türkiye ortalamasına göre" unit="net" sub={`Türkiye ortalaması ${fmt(x.nat.mean)} net`}>
          {sgn(gap)}
        </Tile>
        <Tile icon={<Users size={17} />} label="Denemeye giren" unit={`/ ${all.length} öğrenci`} sub={n === all.length ? 'Herkes girdi' : `${all.length - n} öğrenci girmedi`}>{n}</Tile>
        <Tile tone="bad" icon={<CircleX size={17} />} label="Zor gelen soru" unit={`/ ${x.q.length} soru`} sub={`Öğrencilerin %${LV_LO}'ından azı doğru yaptı`}>{hard}</Tile>
      </div>
      <Tabs id="ex" value={tab} onChange={(t) => q.put({ sekme: t === 'ozet' ? null : t })} tabs={TABS} />
      {tab === 'ozet' && <SummaryTab e={e} grp={grp} pick={pick} />}
      {tab === 'sorular' && <QuestionsTab e={e} grp={grp} pick={pick} />}
      {tab === 'sonuclar' && <ResultsTab e={e} grp={grp} pick={pick} />}
      {tab === 'zarf' && <EnvelopeTab e={e} />}
    </Page>
  );
}

/* ---------- Özet ---------- */
type SBrk = 'test' | 'ders' | 'konu';
function SummaryTab({ e, grp, pick }: { e: number; grp: Ent; pick: ReactNode }) {
  const st = useStore(), q = useQuery();
  const [brk, setBrk] = useState<SBrk>('ders');
  const x = ds.exams[e], root = rootEnt(st.level);
  const m0 = q.get('m', 'net') as Metric, m: Metric = METRIC_IDS.includes(m0) ? m0 : 'net', M = METRICS[m];
  const subj = SUBJECTS.map((j) => ({ j, sc: `s:${j.i}`, v: at(grp, e, `s:${j.i}`, 'net') ?? 0 }));
  const cls = classesOf(root).map((c) => ({ c, v: at(`c:${c}`, e, 'all', 'net') })).filter((r): r is { c: number; v: number } => r.v != null).sort((a, b) => b.v - a.v);
  const any = members(grp).some((s) => PRES[e][s]);
  if (!any) return <Card><Empty title="Bu denemeye giren öğrenci yok" /></Card>;
  const solo = grp === root, who: Ent[] = solo ? [grp] : [grp, root];
  const partRows = kidScopes('all', brk).map((k) => mkRow(k, scopeName(k), brk === 'konu' ? <TopicLink t={+k.slice(2)} /> : <><SubjDot sc={k} />{scopeName(k)}</>,
    who.map((w) => cnt(w, e, k)), m, true, brk === 'konu' ? undefined : scColor(k))).filter((r) => r.vals[0] != null);
  if (brk === 'konu') partRows.sort((a, b) => ((a.fill?.[0] ?? 0) - (b.fill?.[0] ?? 0)) * (M.up ? 1 : -1));
  const natRow: CmpRow = { key: 'tr', name: 'Türkiye ortalaması', label: 'Türkiye ortalaması', vals: [x.nat.mean], pct: [null], color: 'var(--ink3)' };
  const clsRows = [...classesOf(root).map((c) => mkRow(`c:${c}`, ds.classes[c].name, <EntLink en={`c:${c}`} />, [cnt(`c:${c}`, e, 'all')], m, false)).filter((r) => r.vals[0] != null), ...(m === 'net' ? [natRow] : [])]
    .sort((a, b) => (b.vals[0] ?? 0) - (a.vals[0] ?? 0));
  const mName = M.name.toLocaleLowerCase('tr');
  return (
    <div className="stack">
      <div className="ctls no-print">
        <Ctl label="Kimin sonucu">{pick}</Ctl>
        <Ctl label="Neye bakılsın"><MetricSeg id="sm" value={m} onChange={(v) => q.put({ m: v === 'net' ? null : v })} /></Ctl>
        <Ctl label="Neye göre ayrılsın"><Seg id="sb" value={brk} onChange={setBrk} options={(['test', 'ders', 'konu'] as SBrk[]).map((id) => ({ id, label: BRK[id].many }))} /></Ctl>
      </div>
      <div className="grid g2">
        <CmpCard compact def="cubuk" title={BRK[brk].many} icon={<BookOpen size={16} />}
          hint={`${entName(grp)}${solo ? '' : ` ve ${entName(root).toLocaleLowerCase('tr')}`}: ${mName}${brk === 'konu' ? (M.up ? ', en zayıf konu üstte' : `, en çok ${M.short} üstte`) : ''}.`}
          rows={partRows} names={who.map(entName)} colors={solo ? [SERIES[0]] : [SERIES[0], 'var(--ink3)']} f={fmtFor(m, partRows, true)}
          head={BRK[brk].head} noun={BRK[brk].one} at={BRK[brk].at} limit={15}
          cubuk={solo && m === 'net' && brk === 'ders' ? <Bars dig={1} tw={84} rows={subj.map((r) => ({
            key: `${r.j.i}`, k: kOf(r.sc), label: <><SubjDot sc={r.sc} />{r.j.name}</>, v: r.v, of: r.j.n, text: `${fmt(r.v)} / ${r.j.n}`,
          }))} /> : undefined} />
        <CmpCard compact def="cubuk" title="Sınıflar" icon={<School size={16} />} k="k-mid"
          hint={m === 'net' ? 'Toplam net, en yüksekten en düşüğe. Türkiye ortalaması çubuklarda dikey çizgi, diğer görünümlerde gri satırdır.' : `Toplamda ${mName}, en yüksekten en düşüğe.`}
          rows={clsRows} names={[M.name]} colors={[SERIES[0]]} f={fmtFor(m, clsRows, false)} head="Sınıf" noun="sınıf" at="sınıfta"
          cubuk={m === 'net' ? <Bars dig={1} max={Math.max(x.nat.mean, ...cls.map((r) => r.v)) * 1.06} rows={cls.map((r) => ({ key: `${r.c}`, label: <EntLink en={`c:${r.c}`} />, v: r.v, ref: x.nat.mean }))} /> : undefined} />
      </div>
      <Card title="Soru soru sonuç" icon={<LayoutGrid size={16} />} k="k-fen" action={<LevelLegend />}
        hint="Her kutu bir soru; içindeki sayı soru numarası. Yeşil: çoğu öğrenci doğru yaptı. Kırmızı: çoğu yapamadı. Kutuya tıklayınca soru açılır.">
        <QGrid e={e} stats={qStats(e, grp)} onPick={(k) => openQ({ e, q: k })} />
      </Card>
    </div>
  );
}

/* ---------- Sorular ---------- */
function QuestionsTab({ e, grp, pick }: { e: number; grp: Ent; pick: ReactNode }) {
  const x = ds.exams[e], rows = qStats(e, grp);
  const trap = rows.filter((r) => r.topShare > r.p).length;
  const cols: Col<QStat>[] = [
    { id: 'no', head: 'Soru', cell: (r) => <span className="ent">{r.i + 1}</span>, val: (r) => r.i + 1 },
    { id: 'ders', head: 'Ders', cell: (r) => <><SubjDot sc={`s:${x.q[r.i].subject}`} />{SUBJECTS[x.q[r.i].subject].name}</>, val: (r) => SUBJECTS[x.q[r.i].subject].name },
    { id: 'konu', head: 'Konu', cell: (r) => <TopicLink t={x.q[r.i].topic} />, val: (r) => TOPICS[x.q[r.i].topic].name },
    { id: 'p', head: 'Doğru yapan', cell: (r) => <PctBar p={r.p * 100} />, val: (r) => r.p * 100 },
    { id: 'b', head: 'Boş bırakan', right: true, cell: (r) => pct(r.blank * 100), val: (r) => r.blank * 100 },
    {
      id: 'top', head: 'En çok işaretlenen yanlış şık', val: (r) => r.topShare * 100,
      cell: (r) => (
        <span className="row" style={{ gap: 8 }}>
          <b style={{ fontWeight: 650 }}>{LETTERS[r.top]}</b><span className="mut">{pct(r.topShare * 100)}</span>
          <span className="dim sm clip" style={{ maxWidth: 220 }}>{ERRS[x.q[r.i].opts[r.top].err]?.name}</span>
          {r.topShare > r.p && <span className="tag bad">doğru cevaptan çok işaretlendi</span>}
        </span>
      ),
    },
  ];
  return (
    <div className="stack">
      <div className="row wrap no-print">
        {pick}
        <span className="sm mut">En az yapılan soru en üstte.{trap > 0 && ` ${trap} soruda yanlış bir şık, doğru cevaptan daha çok işaretlendi.`}</span>
      </div>
      <Card flush>
        <DataTable cols={cols} rows={rows} rowKey={(r) => r.i} onRow={(r) => openQ({ e, q: r.i })} sort={{ id: 'p', desc: false }} csv={`${x.id}-sorular`} limit={40} />
      </Card>
    </div>
  );
}

/* ---------- Öğrenciler ---------- */
function ResultsTab({ e, grp, pick }: { e: number; grp: Ent; pick: ReactNode }) {
  const nav = useNavigate();
  const x = ds.exams[e];
  interface Row { s: number; net: number; d: number; y: number; b: number; pos: number; tests: (number | null)[]; nat: number }
  const rows: Row[] = members(grp).filter((s) => PRES[e][s]).map((s) => {
    const c = cnt(`s:${s}`, e, 'all')!, net = at(`s:${s}`, e, 'all', 'net')!;
    return { s, net, d: c.d, y: c.y, b: c.b, pos: 0, tests: TESTS.map((t) => at(`s:${s}`, e, `t:${t.id}`, 'net')), nat: natPct(e, net) };
  });
  // Gösterilen grup içindeki sıra; eşit netler aynı sırayı paylaşır.
  for (const r of rows) r.pos = 1 + rows.filter((o) => o.net > r.net).length;
  const top = Math.max(1, ...rows.map((r) => r.net));
  const cols: Col<Row>[] = [
    { id: 'pos', head: 'Sıra', cell: (r) => <span className="num">{r.pos}</span>, val: (r) => r.pos },
    { id: 'ad', head: 'Öğrenci', cell: (r) => <Who en={`s:${r.s}`} sub={ds.classes[ds.students[r.s].cls].name} />, val: (r) => ds.students[r.s].name },
    { id: 'net', head: 'Net', cell: (r) => <LBar v={r.net} max={top}>{fmt(r.net, 2)}</LBar>, val: (r) => r.net },
    { id: 'd', head: 'Doğru', right: true, cell: (r) => r.d, val: (r) => r.d },
    { id: 'y', head: 'Yanlış', right: true, cell: (r) => r.y, val: (r) => r.y },
    { id: 'b', head: 'Boş', right: true, cell: (r) => r.b, val: (r) => r.b },
    ...TESTS.map((t, i): Col<Row> => ({ id: t.id, head: t.name, right: true, cell: (r) => fmt(r.tests[i], 2), val: (r) => r.tests[i] })),
    { id: 'nat', head: 'Türkiye’de ilk', right: true, cell: (r) => pct(Math.max(1, 100 - r.nat)), val: (r) => 100 - r.nat },
  ];
  return (
    <div className="stack">
      <div className="row wrap no-print">{pick}<span className="sm mut">Bir öğrenciye tıklayınca profili açılır.</span></div>
      <Card flush>
        <DataTable cols={cols} rows={rows} rowKey={(r) => r.s} onRow={(r) => nav(entHref(`s:${r.s}`))} sort={{ id: 'net', desc: true }} csv={`${x.id}-sonuclar`} limit={40} />
      </Card>
    </div>
  );
}

/* ---------- Tahmin zarfı ---------- */
function EnvelopeTab({ e }: { e: number }) {
  const st = useStore(), nav = useNavigate();
  const x = ds.exams[e], env = envelope(e), open = st.envOpen.includes(x.id);
  if (!env) {
    return <Card><Empty title="Bu deneme için tahmin hazırlanmaz">Tahmin üretebilmek için öncesinde en az {ENV_MIN} deneme gerekir. Zarf, {ENV_MIN + 1}. denemeden itibaren hazırlanır.</Empty></Card>;
  }
  if (!open) {
    return (
      <Card>
        <div className="env">
          <div className="env-ic"><span className="env-seal"><Lock size={13} strokeWidth={2.6} /></span></div>
          <h2>Zarf kapalı</h2>
          <p>
            Program, bu deneme yapılmadan önce {env.rows.length} öğrencinin her biri için kaç net yapacağını tahmin etti.
            Tahminler yalnızca önceki {e} denemeye bakılarak hazırlandı. Zarfı açınca tahmin ile gerçek sonuç yan yana gelir.
          </p>
          <button className="btn pri lg" style={{ marginTop: 14 }} onClick={() => openEnv(x.id)}>Zarfı aç</button>
        </div>
      </Card>
    );
  }
  const got = env.rows.filter((r): r is EnvRow & { act: number; z: number } => r.act != null && r.z != null);
  const up = [...got].sort((a, b) => b.z - a.z).slice(0, 6), down = [...got].sort((a, b) => a.z - b.z).slice(0, 6);
  const easy = env.shift > 0, level = Math.abs(env.shift) < 0.5;
  const clsCols: Col<Env['cls'][number]>[] = [
    { id: 'c', head: 'Sınıf', cell: (r) => <EntLink en={`c:${r.c}`} />, val: (r) => ds.classes[r.c].name },
    { id: 'p', head: 'Tahmin', right: true, cell: (r) => fmt(r.pred), val: (r) => r.pred },
    { id: 'a', head: 'Gerçek', right: true, cell: (r) => fmt(r.act), val: (r) => r.act },
    { id: 'd', head: 'Fark', right: true, cell: (r) => <Delta v={r.diff} />, val: (r) => r.diff },
  ];
  const who = (r: EnvRow & { act: number }) => (
    <div key={r.s} className="click" style={{ cursor: 'pointer' }} onClick={() => nav(entHref(`s:${r.s}`))}>
      <span className="grow clip"><Who en={`s:${r.s}`} sub={ds.classes[ds.students[r.s].cls].name} /></span>
      <span className="sm mut nowrap">tahmin {fmt(r.pred)}, gerçek {fmt(r.act)}</span>
      <span style={{ width: 62, textAlign: 'right' }}><Delta v={r.act - r.pred - env.shift} /></span>
    </div>
  );
  return (
    <motion.div className="stack" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
      <div className="tiles n3" style={{ marginBottom: 0 }}>
        <Tile icon={<Crosshair size={17} />} label="Tahmin ortalama ne kadar şaştı" unit="net" sub={`${env.n} öğrencinin tahmini ile gerçek neti arasındaki ortalama fark`}>
          ± <Num v={env.mae} />
        </Tile>
        <Tile tone="good" icon={<CircleCheck size={17} />} label="Tutan tahmin" sub="Gerçek net, tahminin en çok 5 net uzağında">
          {pct(env.hit * 100)}
        </Tile>
        <Tile tone={level ? '' : 'mid'} icon={<Gauge size={17} />} label="Denemenin zorluğu" unit={level ? undefined : 'net'}
          sub={level ? 'Netler tahmin edilen düzeyde çıktı' : `Herkes ortalama bu kadar ${easy ? 'fazla' : 'az'} net yaptı`}>
          {level ? 'Beklendiği gibi' : <>{fmt(Math.abs(env.shift))}</>}
        </Tile>
      </div>
      {!level && (
        <p className="mut" style={{ maxWidth: '86ch' }}>
          Deneme beklenenden {easy ? 'kolay' : 'zor'} çıktı. Bu ortak fark çıkarılınca tahminler ortalama {fmt(env.maeAdj)} net şaşıyor
          ve {pct(env.hitAdj * 100)} kadarı 5 net içinde tutuyor. Aşağıdaki farklar bu ortak fark çıkarılarak verilmiştir.
        </p>
      )}
      <div className="grid g-main">
        <Card title="Tahmin ve gerçek" icon={<Crosshair size={16} />} hint="Her nokta bir öğrenci. Çizginin üstündekiler tahminden iyi, altındakiler tahminden kötü yaptı. Turuncu noktalar en çok şaşırtanlar.">
          <Scatter height={410} xName="Tahmin edilen net" yName="Gerçek net" onPick={(p) => nav(entHref(`s:${p.key}`))}
            pts={got.map((r) => ({ key: r.s, x: r.pred, y: r.act, label: ds.students[r.s].name, sub: ds.classes[ds.students[r.s].cls].name, hi: Math.abs(r.z) >= 2 }))} />
        </Card>
        <Card flush title="Sınıflar" icon={<School size={16} />} k="k-mid" hint="Sınıf ortalaması için tahmin ve gerçek sonuç">
          <DataTable cols={clsCols} rows={env.cls} rowKey={(r) => r.c} sort={{ id: 'd', desc: false }} />
        </Card>
      </div>
      <div className="grid g2">
        <Card flush title="Beklenenden çok daha iyi yapanlar" icon={<ThumbsUp size={16} />} k="k-good"><div className="list">{up.map(who)}</div></Card>
        <Card flush title="Beklenenden çok daha kötü yapanlar" icon={<TriangleAlert size={16} />} k="k-bad"><div className="list">{down.map(who)}</div></Card>
      </div>
      <p className="note" style={{ maxWidth: '86ch' }}>
        Tahminlerde yapay zekâ kullanılmaz; tamamı okulun kendi cevap verisinden, bu deneme yapılmadan önceki denemelere bakılarak hesaplanır.
      </p>
    </motion.div>
  );
}
type Env = NonNullable<ReturnType<typeof envelope>>;
