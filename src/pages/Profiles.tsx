import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BarChart3, Trophy, Scale, Users, Globe, Target, TriangleAlert, ListChecks, LineChart as LineIcon, BookOpen, School, Dices } from 'lucide-react';
import {
  ds, LAST, NE, PRES, SUBJECTS, TOPICS, TESTS, ERRS, LETTERS, BLANK, win, val, at, agg, series, classesOf, entHref, entName, rank, attended,
  teacherScope, teacherPairs, scopeName, scopeFull, scopeN, defMetric, METRICS, type Ent, type Scope,
} from '../engine/core';
import { move, moveAdj, forecast, natPct, findings, priorities, rootChains, errAvg, errProfile, luck, topicStats, ALL, P_HARD, P_EASY } from '../engine/analysis';
import { fmt, sgn, pct, date } from '../engine/fmt';
import { useStore, openQ } from '../store';
import {
  Page, Card, Delta, Num, Stat, Spark, DataTable, Tabs, WhyBtn, WatchBtn, EntLink, TopicLink, Notes, ScopePicker, Sel, Empty, useQuery,
  Tile, Who, LBar, SubjDot, kOf, lv as level, type Col,
} from '../ui';
import { Bars, DivBars, SERIES, niceTicks } from '../charts';
import { type CmpRow, type CmpFmt } from '../cmpcharts';
import { CmpCard, TimeCard, timeSer, mkRow, fmtFor } from '../board';
import { FindingRow } from './Home';
import { Explorer } from './Explore';
import { Repeats, RepeatMini } from './Repeats';

const INK = 'var(--ink3)';
const LINE = 'var(--accent)';

function NotFound({ what }: { what: string }) {
  return <Page title={`${what} bulunamadı`}><Card><Empty title="Bu adreste bir kayıt yok">Soldaki listeden seçerek devam edebilirsiniz.</Empty></Card></Page>;
}
/** Ders hücresi: renk noktası ve ad */
const subjCell = (j: number) => <span className="ent"><SubjDot sc={`s:${j}`} />{SUBJECTS[j].name}</span>;
/** Net hücresi: dersin soru sayısına göre dolan çubuk */
const netCell = (j: number, v: number | null) => <LBar v={v} max={SUBJECTS[j].n} k={kOf(`s:${j}`)}>{fmt(v)} <span className="dim" style={{ fontWeight: 500 }}>/ {SUBJECTS[j].n}</span></LBar>;

/** En çok yapılan hatalar: türlere göre deneme başına yanlış; çizgi karşılaştırma grubunu gösterir */
function ErrCard({ en, base, baseName }: { en: Ent; base: Ent; baseName: string }) {
  const prof = errProfile(en, ALL, base).slice(0, 12), ref = errAvg(base, ALL);
  const rows: CmpRow[] = prof.map((r) => ({ key: `${r.k}`, name: ERRS[r.k].name, label: <span title={ERRS[r.k].hint}>{ERRS[r.k].name}</span>, vals: [r.n, ref[r.k]], pct: [null, null] }));
  const tk = niceTicks(0, Math.max(1e-9, ...rows.flatMap((r) => r.vals.map((v) => v ?? 0))), 4);
  const f: CmpFmt = { show: (v) => fmt(v, 2), dig: 2, up: false, top: tk[tk.length - 1], axis: true, heat: 'bad', lead: 'daha az hata', leadCap: 'Daha az hata yaptığı' };
  return (
    <CmpCard title="En çok yapılan hatalar" icon={<TriangleAlert size={16} />} k="k-bad" def="cubuk"
      hint={`İşaretlenen yanlış şıklardan anlaşılır. Sayı: her denemede öğrenci başına kaç yanlış. Kıyas: ${baseName} ortalaması (çubuklarda dikey çizgi).`}
      rows={rows} names={[entName(en), `${baseName} ortalaması`]} colors={['var(--bad)', 'var(--ink3)']} f={f} head="Hata türü" noun="hata türü" at="hata türünde"
      cubuk={<Bars dig={2} wide rows={prof.map((r) => ({
        key: `${r.k}`, k: 'k-bad', v: r.n, ref: ref[r.k],
        label: <span title={ERRS[r.k].hint}>{ERRS[r.k].name}</span>,
        right: r.lift >= 1.3 ? <span className="tag bad">ortalamanın {fmt(r.lift)} katı</span> : r.lift <= 0.75 ? <span className="tag good">ortalamadan az</span> : null,
      }))} />}
      footer={<p className="note" style={{ marginTop: 12 }}>Hata türleri bu örnekte hazır gelir; gerçek kullanımda her sorunun şıkları bir kez etiketlenir.</p>} />
  );
}
function PrioCard({ en, student }: { en: Ent; student?: boolean }) {
  const pr = priorities(en).slice(0, 10), chains = rootChains(en).slice(0, 3), ts = topicStats(en);
  return (
    <div className="grid g-main">
      <Card title="Ne yapmalı" icon={<ListChecks size={16} />} k="k-good"
        hint={student ? 'En çok net kaybettiği konular. Sayı: her denemede kaç net gidiyor.' : 'Önce çalışılması gereken konular. Sayı: konu en iyi sınıf kadar yapılsa her denemede kaç net artar.'}
        action={<Link className="more" to={`/konular?kim=${en}&gorunum=oncelik`}>Tüm konular</Link>}>
        <Bars dig={2} wide tw={78} rows={pr.map((p) => ({
          key: `${p.t}`, k: 'k-good', v: p.gain, text: `+${fmt(p.gain, 2)} net`,
          label: <><TopicLink t={p.t} /> <span className="dim sm">{pct(p.pct)}{p.ref != null && ` → ${pct(p.ref)}`}</span></>,
          right: p.root != null ? <span className="tag info" title="Bu konunun dayandığı temel konu da zayıf">önce {TOPICS[p.root].name}</span> : null,
        }))} />
      </Card>
      <Card title="Temel eksikler" icon={<TriangleAlert size={16} />} k="k-bad" hint="Eksik bu konularda başlıyor; bunlara dayanan konular da zayıf.">
        {chains.length ? chains.map((c) => (
          <div key={c.root} style={{ padding: '9px 0', borderTop: '1px solid var(--line)' }}>
            <div className="row"><TopicLink t={c.root} /><span className="grow" /><span className={`tag ${level(ts[c.root].pct)}`}>{pct(ts[c.root].pct)} doğru</span></div>
            <div className="sm mut" style={{ marginTop: 3 }}>Buna dayanan zayıf konular: {c.deps.map((d) => TOPICS[d.t].name).join(', ')}</div>
          </div>
        )) : <Empty title="Zincirleme bir eksik görünmüyor" />}
        <Link className="more" style={{ display: 'inline-block', marginTop: 10 }} to={`/konular?kim=${en}&gorunum=ag`}>Konu bağlantılarını aç</Link>
      </Card>
    </div>
  );
}

/** Öğrencinin en sık yaptığı hata türünden son örnekler */
function TopErrors({ s, base }: { s: number; base: Ent }) {
  const top = errProfile(`s:${s}`, ALL, base)[0];
  if (!top) return null;
  const list: { e: number; q: number; o: number }[] = [];
  for (let e = NE - 1; e >= 0 && list.length < 8; e--) {
    const a = ds.ans[e][s];
    if (!a) continue;
    for (const x of ds.exams[e].q) { const o = a[x.i]; if (o !== x.key && o !== BLANK && x.opts[o].err === top.k && list.length < 8) list.push({ e, q: x.i, o }); }
  }
  if (!list.length) return null;
  return (
    <Card flush title={`En sık hatası: ${ERRS[top.k].name}`} hint={`${ERRS[top.k].hint} Aşağıda bu hatayı yaptığı son sorular var.`}>
      <div className="list">
        {list.map((x) => {
          const qq = ds.exams[x.e].q[x.q];
          return (
            <div key={`${x.e}-${x.q}`} className="click" style={{ cursor: 'pointer' }} onClick={() => openQ({ e: x.e, q: x.q })}>
              <span className="grow"><b style={{ fontWeight: 600 }}>{ds.exams[x.e].name}, soru {x.q + 1}</b> <span className="mut">{SUBJECTS[qq.subject].name}, {TOPICS[qq.topic].name}</span></span>
              <span className="sm mut nowrap">{LETTERS[x.o]} işaretledi, doğrusu {LETTERS[qq.key]}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ================= Sınıf ================= */
export function ClassProfile() {
  const { id } = useParams(), st = useStore(), nav = useNavigate(), q = useQuery();
  const c = ds.classes.find((x) => x.id === id);
  const [sc, setSc] = useState<Scope>('all');
  if (!c) return <NotFound what="Sınıf" />;
  const en = `c:${c.i}`, lv = `l:${c.level}`, w = win(st.per), tab = q.get('sekme', 'genel');
  const m = defMetric(sc), mv = move(en, 'all', 'net', w);
  const peers = classesOf(lv).map((x) => val(`c:${x}`, w.cur, 'all', 'net') ?? 0), cur = val(en, w.cur, 'all', 'net');
  const lvAvg = val(lv, w.cur, 'all', 'net'), gap = cur != null && lvAvg != null ? cur - lvAvg : null;
  const part = w.cur.reduce((a, e) => a + c.students.filter((s) => PRES[e][s]).length, 0) / (w.cur.length * c.students.length);
  const fs = findings(en, st.per).filter((f) => f.tag !== 'Kapalı zarf' || f.en === en);
  const others = `Diğer ${c.level}. sınıflara göre`;

  interface SRow { j: number; cur: number | null; diff: number | null; gap: number | null }
  const subs: SRow[] = SUBJECTS.map((s) => {
    const k = `s:${s.i}`, a = val(en, w.cur, k, 'net'), b = val(lv, w.cur, k, 'net');
    return { j: s.i, cur: a, diff: move(en, k, 'net', w)?.diff ?? null, gap: a != null && b != null ? a - b : null };
  });
  const subCols: Col<SRow>[] = [
    { id: 'd', head: 'Ders', cell: (r) => subjCell(r.j), val: (r) => SUBJECTS[r.j].name },
    { id: 't', head: 'Öğretmen', cell: (r) => <EntLink en={`t:${c.teachers[r.j]}`} />, val: (r) => ds.teachers[c.teachers[r.j]].name },
    { id: 'sp', head: 'Yıl boyunca', cell: (r) => <Spark values={series(en, `s:${r.j}`, 'net')} color={LINE} /> },
    { id: 'n', head: 'Net', cell: (r) => netCell(r.j, r.cur), val: (r) => r.cur },
    { id: 'c', head: 'Değişim', right: true, cell: (r) => <Delta v={r.diff} />, val: (r) => r.diff },
    { id: 'g', head: others, right: true, cell: (r) => <Delta v={r.gap} />, val: (r) => r.gap },
    { id: 'w', head: '', cell: (r) => <WhyBtn en={en} sc={`s:${r.j}`} /> },
  ];
  interface StRow { s: number; cur: number | null; diff: number | null; last: number | null; rk: number | null }
  const stu: StRow[] = c.students.map((s) => ({ s, cur: val(`s:${s}`, w.cur, 'all', 'net'), diff: move(`s:${s}`, 'all', 'net', w)?.diff ?? null, last: at(`s:${s}`, LAST, 'all', 'net'), rk: rank(s, LAST, en)?.r ?? null }));
  const stuTop = Math.max(1, ...stu.map((r) => r.cur ?? 0));
  const stuCols: Col<StRow>[] = [
    { id: 'ad', head: 'Öğrenci', cell: (r) => <Who en={`s:${r.s}`} />, val: (r) => ds.students[r.s].name },
    { id: 'sp', head: 'Yıl boyunca', cell: (r) => <Spark values={series(`s:${r.s}`, 'all', 'net')} color={LINE} /> },
    { id: 'net', head: `Net (${w.name.toLocaleLowerCase('tr')})`, cell: (r) => <LBar v={r.cur} max={stuTop}>{fmt(r.cur)}</LBar>, val: (r) => r.cur },
    { id: 'd', head: 'Değişim', right: true, cell: (r) => <Delta v={r.diff} />, val: (r) => r.diff },
    { id: 'son', head: 'Son deneme', right: true, cell: (r) => fmt(r.last, 2), val: (r) => r.last },
    { id: 'rk', head: 'Sınıf sırası', right: true, cell: (r) => r.rk ?? '–', val: (r) => r.rk },
    { id: 'w', head: '', cell: (r) => <WhyBtn en={`s:${r.s}`} /> },
  ];

  return (
    <Page title={c.name} crumb={<Link to="/siniflar">Sınıflar</Link>} sub={`${c.level}. sınıf, ${c.students.length} öğrenci`}
      actions={<><Link className="btn" to={`/karsilastir?k=${en},l:${c.level}`}>Karşılaştır</Link><Link className="btn" to={`/tahmin?kim=${en}`}>Bugün sınav olsa</Link><WatchBtn en={en} /></>}>
      <div className="tiles">
        <Tile tone="brand" icon={<BarChart3 size={17} />} label={`${w.name} ortalaması`} unit="net" sub={mv ? <><Delta v={mv.diff} /> öncesine göre <WhyBtn en={en} /></> : '120 soruda ortalama net'}>
          <Num v={cur} />
        </Tile>
        <Tile icon={<Trophy size={17} />} label={`${c.level}. sınıflar içinde sıra`} unit={`/ ${peers.length} sınıf`} sub="Toplam nete göre">
          {1 + peers.filter((x) => x > (cur ?? 0)).length}.
        </Tile>
        <Tile tone={gap == null ? '' : gap >= 0 ? 'good' : 'bad'} icon={<Scale size={17} />} label={others} unit="net" sub={`${c.level}. sınıflar ortalaması ${fmt(lvAvg)} net`}>
          {sgn(gap)}
        </Tile>
        <Tile icon={<Users size={17} />} label="Denemelere katılım" sub={`${c.students.length} öğrenci`}>{pct(part * 100)}</Tile>
      </div>
      <Tabs id="cp" value={tab} onChange={(t) => q.put({ sekme: t === 'genel' ? null : t })} tabs={[{ id: 'genel', label: 'Genel' }, { id: 'incele', label: 'İncele' }, { id: 'tekrar', label: 'Üst üste yanlışlar' }, { id: 'ogrenciler', label: 'Öğrenciler' }, { id: 'konular', label: 'Konular' }, { id: 'hatalar', label: 'Hatalar' }, { id: 'notlar', label: 'Notlar' }]} />
      {tab === 'incele' && <Explorer en={en} />}
      {tab === 'tekrar' && <Repeats en={en} />}
      {tab === 'genel' && (
        <div className="stack">
          <TimeCard title="Denemelere göre" icon={<LineIcon size={16} />} hint={`${scopeFull(sc)}, ${METRICS[m].name.toLocaleLowerCase('tr')}`} extra={<ScopePicker label="Ders" value={sc} onChange={setSc} />}
            m={m} exams={ALL} series={[timeSer(en, sc, m, LINE, ALL), timeSer(lv, sc, m, INK, ALL, { name: `${c.level}. sınıflar ortalaması`, dash: true })]} />
          <Card flush title="Dersler" icon={<BookOpen size={16} />} hint={`${w.name}. Çubuk, dersin soru sayısına göre dolar.`}><DataTable cols={subCols} rows={subs} rowKey={(r) => r.j} csv={`${c.id}-dersler`} /></Card>
          <RepeatMini en={en} />
          {fs.length > 0 && <Card flush title="Bu sınıfta öne çıkanlar"><div className="list">{fs.slice(0, 6).map((f) => <FindingRow key={f.id} f={f} />)}</div></Card>}
        </div>
      )}
      {tab === 'ogrenciler' && <Card flush><DataTable cols={stuCols} rows={stu} rowKey={(r) => r.s} onRow={(r) => nav(entHref(`s:${r.s}`))} sort={{ id: 'net', desc: true }} csv={`${c.id}-ogrenciler`} /></Card>}
      {tab === 'konular' && <PrioCard en={en} />}
      {tab === 'hatalar' && <ErrCard en={en} base={lv} baseName={`${c.level}. sınıflar`} />}
      {tab === 'notlar' && <Notes en={en} />}
    </Page>
  );
}

/* ================= Öğrenci ================= */
export function StudentProfile() {
  const { id } = useParams(), st = useStore(), q = useQuery();
  const s = ds.students.find((x) => x.id === id);
  const [sc, setSc] = useState<Scope>('all');
  const ex = s ? attended(s.i) : [];
  const [le, setLe] = useState(ex[ex.length - 1] ?? LAST);
  if (!s) return <NotFound what="Öğrenci" />;
  const en = `s:${s.i}`, cls = ds.classes[s.cls], ce = `c:${cls.i}`, lv = `l:${cls.level}`, w = win(st.per), tab = q.get('sekme', 'genel');
  const m = defMetric(sc), mv = move(en, 'all', 'net', w), lastE = ex[ex.length - 1];
  const lastNet = lastE != null ? at(en, lastE, 'all', 'net') : null;
  const rk = lastE != null ? rank(s.i, lastE, lv) : null, fc = forecast(s.i);
  const lk = luck(le, s.i);
  const Q = ds.exams[le].q;

  interface SRow { j: number; cur: number | null; diff: number | null; cls: number | null }
  const subs: SRow[] = SUBJECTS.map((j) => ({ j: j.i, cur: val(en, w.cur, `s:${j.i}`, 'net'), diff: move(en, `s:${j.i}`, 'net', w)?.diff ?? null, cls: val(ce, w.cur, `s:${j.i}`, 'net') }));
  const subCols: Col<SRow>[] = [
    { id: 'd', head: 'Ders', cell: (r) => subjCell(r.j), val: (r) => SUBJECTS[r.j].name },
    { id: 'sp', head: 'Yıl boyunca', cell: (r) => <Spark values={series(en, `s:${r.j}`, 'net')} color={LINE} /> },
    { id: 'n', head: 'Net', cell: (r) => netCell(r.j, r.cur), val: (r) => r.cur },
    { id: 'c', head: 'Değişim', right: true, cell: (r) => <Delta v={r.diff} />, val: (r) => r.diff },
    { id: 'g', head: 'Sınıf ortalamasına göre', right: true, cell: (r) => <Delta v={r.cur != null && r.cls != null ? r.cur - r.cls : null} />, val: (r) => (r.cur != null && r.cls != null ? r.cur - r.cls : null) },
    { id: 'w', head: '', cell: (r) => <WhyBtn en={en} sc={`s:${r.j}`} /> },
  ];
  return (
    <Page title={s.name} crumb={<><Link to="/ogrenciler">Öğrenciler</Link> / <Link to={entHref(ce)}>{cls.name}</Link></>} sub={`${cls.name}, okul no ${s.no}. ${ex.length} denemeye girdi.`}
      actions={<><Link className="btn" to={`/karsilastir?k=${en},${ce}`}>Karşılaştır</Link><WatchBtn en={en} /></>}>
      <div className="tiles">
        <Tile tone="brand" icon={<BarChart3 size={17} />} label={`${w.name} ortalaması`} unit="net"
          sub={mv ? <><Delta v={mv.diff} /> öncesine göre <WhyBtn en={en} /></> : lastNet != null ? `Son denemede ${fmt(lastNet, 2)} net` : '120 soruda ortalama net'}>
          <Num v={val(en, w.cur, 'all', 'net')} />
        </Tile>
        <Tile icon={<Trophy size={17} />} label={`${cls.level}. sınıflar içinde sıra`} unit={rk ? `/ ${rk.of} öğrenci` : undefined} sub="Son denemede, toplam nete göre">
          {rk ? `${rk.r}.` : '–'}
        </Tile>
        <Tile icon={<Globe size={17} />} label="Türkiye’de ilk" sub="Son denemede, Türkiye geneline göre">
          {lastNet != null && lastE != null ? pct(Math.max(1, 100 - natPct(lastE, lastNet))) : '–'}
        </Tile>
        <Tile icon={<Target size={17} />} label="Bugün sınav olsa" unit="puan" sub={fc ? `Tahmini TYT puanı, ± ${fmt(fc.sdP, 0)} puan` : 'En az iki deneme gerekir'} to={`/tahmin?kim=${en}`}>
          {fc ? <>≈ {fmt(fc.puan, 0)}</> : '–'}
        </Tile>
      </div>
      <Tabs id="sp" value={tab} onChange={(t) => q.put({ sekme: t === 'genel' ? null : t })} tabs={[{ id: 'genel', label: 'Genel' }, { id: 'incele', label: 'İncele' }, { id: 'tekrar', label: 'Üst üste yanlışlar' }, { id: 'sinavlar', label: 'Son sınavlar' }, { id: 'konular', label: 'Konular' }, { id: 'hatalar', label: 'Hatalar' }, { id: 'sans', label: 'Şans mı, bilgi mi?' }, { id: 'notlar', label: 'Notlar' }]} />
      {tab === 'incele' && <Explorer en={en} />}
      {tab === 'tekrar' && <Repeats en={en} />}
      {tab === 'genel' && (
        <div className="stack">
          <TimeCard title="Denemelere göre" icon={<LineIcon size={16} />} hint={`${scopeFull(sc)}, ${METRICS[m].name.toLocaleLowerCase('tr')}`} extra={<ScopePicker label="Ders" value={sc} onChange={setSc} />}
            m={m} exams={ALL} series={[
              timeSer(en, sc, m, LINE, ALL),
              timeSer(ce, sc, m, 'var(--c2)', ALL, { name: `${cls.name} ortalaması` }),
              timeSer(lv, sc, m, INK, ALL, { name: `${cls.level}. sınıflar ortalaması`, dash: true }),
            ]} />
          <Card flush title="Dersler" icon={<BookOpen size={16} />} hint={`${w.name}. Çubuk, dersin soru sayısına göre dolar.`}><DataTable cols={subCols} rows={subs} rowKey={(r) => r.j} csv={`${s.name}-dersler`} /></Card>
          <RepeatMini en={en} />
        </div>
      )}
      {tab === 'sinavlar' && (
        <Card flush title="Son sınavlar" hint="Girdiği denemeler, en yenisi üstte. Her testte net ve soru sayısı.">
          <div className="list">
            {[...ex].reverse().map((e) => {
              const r1 = rank(s.i, e, ce), r2 = rank(s.i, e, lv), net = at(en, e, 'all', 'net')!;
              return (
                <Link key={e} to={`/deneme/${ds.exams[e].id}`} style={{ gap: 22 }}>
                  <span style={{ width: 140, flex: 'none' }}><b style={{ fontWeight: 600 }}>{ds.exams[e].name}</b><span className="sm dim" style={{ display: 'block' }}>{date(ds.exams[e].date, true)}</span></span>
                  <span style={{ width: 150, flex: 'none' }}><span className="num" style={{ fontSize: 21 }}>{fmt(net, 2)}</span> <span className="sm mut">net</span><span className="sm mut" style={{ display: 'block' }}>sınıfta {r1?.r}., {cls.level}’lerde {r2?.r}.</span></span>
                  <span className="grow" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
                    {TESTS.map((t) => {
                      const tsc = `t:${t.id}`, v = at(en, e, tsc, 'net'), n = scopeN(tsc, e);
                      return <span key={t.id}><span className="xs mut" style={{ display: 'block', marginBottom: 2 }}>{t.name}</span><LBar v={v} max={n} k={`k-${t.id}`}>{fmt(v)}</LBar></span>;
                    })}
                  </span>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
      {tab === 'konular' && <PrioCard en={en} student />}
      {tab === 'hatalar' && (
        <div className="stack">
          <ErrCard en={en} base={lv} baseName={`${cls.level}. sınıflar`} />
          <TopErrors s={s.i} base={lv} />
        </div>
      )}
      {tab === 'sans' && (
        <div className="stack">
          <Card title="Şans mı, bilgi mi?" icon={<Dices size={16} />} k="k-mat"
            hint="Öğrencinin diğer denemelerine bakılarak bu denemede kaç net yapması beklendiği hesaplanır. Aradaki fark, soruların ona göre zorluğuna göre üçe ayrılır."
            action={<Sel label="Deneme" value={le} onChange={setLe} options={[...ex].reverse().map((e) => ({ id: e, label: ds.exams[e].name }))} />}>
            {!lk ? <Empty title="Bu hesap için en az üç deneme gerekir" /> : (
              <>
                <div className="stats" style={{ marginBottom: 20 }}>
                  <Stat label="yaptığı net">{fmt(lk.act, 2)}</Stat>
                  <Stat label="beklenen net">{fmt(lk.exp)}</Stat>
                  <Stat label="fark"><Delta v={lk.act - lk.exp} /></Stat>
                </div>
                <DivBars wide dig={2} rows={[
                  { key: 'l', v: lk.luck, label: <span title={`Doğru yapma ihtimali %${P_HARD * 100} altında olan sorular`}>Ona zor gelen sorulardan</span> },
                  { key: 's', v: lk.slip, label: <span title={`Doğru yapma ihtimali %${P_EASY * 100} üstünde olan sorular`}>Ona kolay gelen sorulardan</span> },
                  { key: 'm', v: lk.mid, label: 'Orta zorluktaki sorulardan' },
                ]} />
                <p className="note" style={{ marginTop: 12 }}>Yeşil: beklenenden fazla net. Kırmızı: beklenenden az net. Zor sorularda fazla net çoğunlukla şanstır; kolay sorularda az net çoğunlukla dikkat hatasıdır.</p>
              </>
            )}
          </Card>
          {lk && (
            <div className="grid g2">
              {([['Zor olduğu hâlde doğru yaptıkları', lk.lucky, 'Normalde yapması beklenmeyen sorular. Bir kısmı tahminle gelmiş olabilir.'], ['Kolay olduğu hâlde kaçırdıkları', lk.slips, 'Normalde yapması beklenen sorular. Dikkat ya da süre sorununa işaret eder.']] as const).map(([title, list, hint]) => (
                <Card key={title} flush title={`${title} (${list.length})`} hint={hint}>
                  <div className="list">
                    {list.slice(0, 8).map((x) => (
                      <div key={x.q} className="click" style={{ cursor: 'pointer' }} onClick={() => openQ({ e: le, q: x.q })}>
                        <span className="grow clip"><b style={{ fontWeight: 600 }}>Soru {x.q + 1}</b> <span className="mut">{SUBJECTS[Q[x.q].subject].name}, {TOPICS[Q[x.q].topic].name}</span></span>
                        <span className="sm mut nowrap">yapma ihtimali {pct(x.p * 100)}</span>
                      </div>
                    ))}
                    {!list.length && <Empty title="Bu denemede yok" />}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      {tab === 'notlar' && <Notes en={en} />}
    </Page>
  );
}

/* ================= Öğretmen ================= */
export function TeacherProfile() {
  const { id } = useParams(), st = useStore(), q = useQuery();
  const t = ds.teachers.find((x) => x.id === id);
  if (!t) return <NotFound what="Öğretmen" />;
  const t0 = q.get('sekme'), tab = t0 === 'incele' || t0 === 'tekrar' ? t0 : 'genel';
  const en = `t:${t.i}`, sc = teacherScope(t.i), w = win(st.per), pairs = teacherPairs(t.i), cs = [...new Set(pairs.map((p) => p.c))];
  const mv = move(en, sc, 'net', w), adj = moveAdj(en, sc, 'net', w);
  interface Row { c: number; j: number; cur: number | null; diff: number | null; gap: number | null }
  const rows: Row[] = pairs.map((p) => {
    const k = `s:${p.j}`, a = val(`c:${p.c}`, w.cur, k, 'net'), b = val(`l:${ds.classes[p.c].level}`, w.cur, k, 'net');
    return { c: p.c, j: p.j, cur: a, diff: move(`c:${p.c}`, k, 'net', w)?.diff ?? null, gap: a != null && b != null ? a - b : null };
  });
  const cols: Col<Row>[] = [
    { id: 'c', head: 'Sınıf', cell: (r) => <EntLink en={`c:${r.c}`} />, val: (r) => ds.classes[r.c].name },
    { id: 'j', head: 'Ders', cell: (r) => subjCell(r.j), val: (r) => SUBJECTS[r.j].name },
    { id: 'sp', head: 'Yıl boyunca', cell: (r) => <Spark values={series(`c:${r.c}`, `s:${r.j}`, 'net')} color={LINE} /> },
    { id: 'n', head: 'Net', cell: (r) => netCell(r.j, r.cur), val: (r) => r.cur },
    { id: 'd', head: 'Değişim', right: true, cell: (r) => <Delta v={r.diff} />, val: (r) => r.diff },
    { id: 'g', head: 'Aynı düzeydeki sınıflara göre', right: true, cell: (r) => <Delta v={r.gap} />, val: (r) => r.gap },
    { id: 'w', head: '', cell: (r) => <WhyBtn en={`c:${r.c}`} sc={`s:${r.j}`} /> },
  ];
  const ts = topicStats(en);
  const own = TOPICS.filter((x) => t.subjects.includes(x.subject) && ts[x.i].pct != null).map((x) => ({ t: x.i, p: ts[x.i].pct! })).sort((a, b) => a.p - b.p);
  const show = [...own.slice(0, 5), ...own.slice(-5)].filter((x, i, a) => a.findIndex((y) => y.t === x.t) === i);
  const students = cs.reduce((a, c) => a + ds.classes[c].students.length, 0);
  const topicRows = show.map((x) => mkRow(`k:${x.t}`, TOPICS[x.t].name, <TopicLink t={x.t} />, [agg(en, ALL, `k:${x.t}`)], 'pct', true));
  return (
    <Page title={t.name} crumb={<Link to="/ogretmenler">Öğretmenler</Link>} sub={`${t.branch} öğretmeni. ${cs.length ? `${cs.map((c) => ds.classes[c].name).join(', ')} sınıflarına giriyor.` : 'Henüz sınıf ataması yok.'}`}
      actions={<><Link className="btn" to={`/karsilastir?k=${cs.map((c) => `c:${c}`).join(',')}&n=${sc}`}>Sınıflarını karşılaştır</Link><WatchBtn en={en} /></>}>
      {!cs.length ? <Card><Empty title="Atama yok">Veri ekranından bu öğretmene sınıf ve ders atayabilirsiniz.</Empty></Card> : (
        <>
          <div className="tiles n3">
            <Tile tone="brand" icon={<BarChart3 size={17} />} label={`Sınıflarının ${scopeName(sc)} ortalaması`} unit="net"
              sub={mv ? <><Delta v={mv.diff} /> öncesine göre <WhyBtn en={en} sc={sc} /></> : w.name}>
              <Num v={val(en, w.cur, sc, 'net')} />
            </Tile>
            <Tile tone={adj == null ? '' : adj.diff >= 0 ? 'good' : 'bad'} icon={<Scale size={17} />} label="Okula göre değişim" unit="net" sub="Aynı sürede bütün okulun değişimi çıkarıldı">
              {sgn(adj?.diff)}
            </Tile>
            <Tile icon={<Users size={17} />} label="Öğrenci" sub={`${cs.length} sınıf`}>{students}</Tile>
          </div>
          <Tabs id="tch" value={tab} onChange={(x) => q.put({ sekme: x === 'genel' ? null : x })} tabs={[{ id: 'genel', label: 'Genel' }, { id: 'incele', label: 'İncele' }, { id: 'tekrar', label: 'Üst üste yanlışlar' }]} />
          {tab === 'incele' ? <Explorer en={en} /> : tab === 'tekrar' ? <Repeats en={en} /> : (
          <div className="stack">
            <TimeCard title="Sınıfları, denemelere göre" icon={<LineIcon size={16} />} hint={`${scopeName(sc)} neti`} m="net" exams={ALL} strip
              series={cs.slice(0, 8).map((c, i) => timeSer(`c:${c}`, sc, 'net', SERIES[i], ALL))} />
            <Card flush title="Sınıf ve ders" icon={<School size={16} />} k="k-mid"><DataTable cols={cols} rows={rows} rowKey={(r) => `${r.c}|${r.j}`} csv={`${t.name}-siniflar`} /></Card>
            <RepeatMini en={en} />
            <CmpCard title="Konular" icon={<BookOpen size={16} />} hint="Kendi dersinde sınıflarının en zayıf ve en iyi konuları. Doğru yapanların oranı."
              rows={topicRows} names={['Doğru oranı']} colors={[SERIES[0]]} f={fmtFor('pct', topicRows, true)} head="Konu" noun="konu" at="konuda"
              cubuk={<Bars wide max={100} rows={show.map((x) => ({ key: `${x.t}`, k: `k-${level(x.p)}`, v: x.p, text: pct(x.p), label: <TopicLink t={x.t} /> }))} />} />
            <Notes en={en} />
          </div>
          )}
        </>
      )}
    </Page>
  );
}
