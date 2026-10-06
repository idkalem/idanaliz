import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ThumbsUp, TriangleAlert, CircleCheck, CircleMinus, CircleX, Percent, Scale, Eraser, Hash, LineChart as LineIcon, School, ListChecks } from 'lucide-react';
import {
  ds, NE, SUBJECTS, TOPICS, ERRS, QN, val, agg, series, classesOf, members, rootEnt, entKind, entI, entName, entHref, type Ent,
} from '../engine/core';
import { ALL, topicStats, topicDeficit, rootChains, priorities, errProfile, errAvg, qStats, dependents, topicW, type Prio, type TopicStat } from '../engine/analysis';
import { fmt, sgn, pct } from '../engine/fmt';
import { useStore, openQ } from '../store';
import {
  Page, Card, Num, DataTable, Tabs, Seg, Sel, EntField, EntLink, TopicLink, WhyBtn, Empty, useQuery, Tile, Who, PctBar, LevelTag, LevelLegend, SubjDot, lv, LV_LO, LV_HI, type Col,
} from '../ui';
import { Bars, TopicGrid, TopicDag, SERIES, niceTicks } from '../charts';
import { PCT_FMT, type CmpRow, type CmpFmt } from '../cmpcharts';
import { CmpCard, TimeCard, timeSer, mkRow } from '../board';
import { Repeats } from './Repeats';

const valid = (en: string) => /^(o|l:1[12]|[cst]:\d+)$/.test(en) && (en === 'o' || en[0] === 'l' || (en[0] === 'c' ? !!ds.classes[+en.slice(2)] : en[0] === 's' ? !!ds.students[+en.slice(2)] : !!ds.teachers[+en.slice(2)]));
const RANGES = [{ id: 'yil', label: 'Tüm yıl' }, { id: '3', label: 'Son 3 deneme' }];
/** Karşılaştırma tabanı: sınıf ve öğrenci için kendi sınıf düzeyi, öğretmen için okul */
const baseOf = (en: Ent): Ent => { const k = entKind(en); return k === 'class' ? `l:${ds.classes[entI(en)].level}` : k === 'student' ? `l:${ds.classes[ds.students[entI(en)].cls].level}` : 'o'; };
const VIEWS = [{ id: 'durum', label: 'Durum' }, { id: 'oncelik', label: 'Ne yapmalı' }, { id: 'harita', label: 'Harita' }, { id: 'ag', label: 'Konu bağlantıları' }, { id: 'tekrar', label: 'Üst üste yanlışlar' }];
const subjOf = (t: number) => TOPICS[t].subject;

/* ================= Konular ================= */
export function Topics() {
  const st = useStore(), q = useQuery(), nav = useNavigate();
  const root = rootEnt(st.level), kim = q.get('kim'), en: Ent = valid(kim) ? kim : root;
  const v0 = q.get('gorunum', 'durum'), view = VIEWS.some((v) => v.id === v0) ? v0 : 'durum', r = q.get('aralik', 'yil');
  const exams = useMemo(() => (r === '3' ? [NE - 3, NE - 2, NE - 1] : ALL), [r]);
  const stats = useMemo(() => topicStats(en, exams), [en, exams]);
  const chains = useMemo(() => rootChains(en, exams), [en, exams]);
  const only = entKind(en) === 'teacher' ? ds.teachers[entI(en)].subjects : undefined;
  const go = (t: number) => nav(`/konu/${TOPICS[t].id}${en !== root ? `?kim=${en}` : ''}`);
  const subj = +q.get('ders', `${chains[0] ? subjOf(chains[0].root) : only?.[0] ?? SUBJECTS.find((s) => s.id === 'mat')?.i ?? 0}`);
  const pr = useMemo(() => (view === 'oncelik' ? priorities(en, exams) : []), [view, en, exams]);
  const student = entKind(en) === 'student';
  const top5 = pr.slice(0, 5).reduce((a, p) => a + p.gain, 0);

  // Durum sekmesi
  const filt = q.get('f', 'hepsi');
  const seen = stats.filter((x) => x.pct != null && (!only || only.includes(subjOf(x.t))));
  const count = (l: string) => seen.filter((x) => lv(x.pct) === l).length;
  const sorted = [...seen].sort((a, b) => a.pct! - b.pct!);
  const topicRow = (x: TopicStat) => ({
    key: `${x.t}`, k: `k-${lv(x.pct)}`, v: x.pct!, text: pct(x.pct),
    label: <><TopicLink t={x.t} /> <span className="dim sm">{SUBJECTS[subjOf(x.t)].name}</span></>,
  });
  // Sınıf, öğrenci ve öğretmende yanına kendi düzeyinin (öğretmende okulun) ortalaması konur
  const cb = baseOf(en), duo = en !== cb;
  const cmpRow = (x: TopicStat): CmpRow => {
    const b = duo ? val(cb, exams, `k:${x.t}`, 'pct') : null;
    return { key: `${x.t}`, name: TOPICS[x.t].name, label: <><TopicLink t={x.t} /> <span className="dim sm">{SUBJECTS[subjOf(x.t)].name}</span></>, vals: duo ? [x.pct, b] : [x.pct], pct: duo ? [x.pct, b] : [x.pct] };
  };
  const cmpNames = duo ? [entName(en), `${entName(cb)} ortalaması`] : ['Doğru oranı'], cmpColors = duo ? [SERIES[0], 'var(--ink3)'] : [SERIES[0]];
  const allCols: Col<TopicStat>[] = [
    { id: 'k', head: 'Konu', cell: (x) => <TopicLink t={x.t} />, val: (x) => TOPICS[x.t].name },
    { id: 'd', head: 'Ders', cell: (x) => <><SubjDot sc={`s:${subjOf(x.t)}`} />{SUBJECTS[subjOf(x.t)].name}</>, val: (x) => SUBJECTS[subjOf(x.t)].name },
    { id: 'p', head: 'Doğru yapan', cell: (x) => <PctBar p={x.pct} />, val: (x) => x.pct },
    { id: 's', head: 'Durum', cell: (x) => <LevelTag p={x.pct} />, val: (x) => x.pct },
    { id: 'b', head: 'Boş bırakılan', right: true, cell: (x) => pct(x.n ? (100 * x.b) / x.n : null), val: (x) => (x.n ? (100 * x.b) / x.n : null) },
    { id: 'w', head: 'Her denemede soru', right: true, cell: (x) => fmt(x.w), val: (x) => x.w },
  ];

  const prCols: Col<Prio>[] = [
    { id: 'k', head: 'Konu', cell: (p) => <TopicLink t={p.t} />, val: (p) => TOPICS[p.t].name },
    { id: 'd', head: 'Ders', cell: (p) => <><SubjDot sc={`s:${subjOf(p.t)}`} />{SUBJECTS[subjOf(p.t)].name}</>, val: (p) => SUBJECTS[subjOf(p.t)].name },
    { id: 'p', head: 'Doğru yapan', cell: (p) => <PctBar p={p.pct} />, val: (p) => p.pct },
    ...(student ? [] : [{ id: 'r', head: 'En iyi sınıf', right: true, cell: (p: Prio) => (p.ref == null ? '–' : <>{pct(p.ref)} <span className="dim">{p.refEn ? entName(p.refEn) : ''}</span></>), val: (p: Prio) => p.ref } as Col<Prio>]),
    { id: 'w', head: 'Her denemede soru', right: true, cell: (p) => fmt(p.w), val: (p) => p.w },
    { id: 'g', head: student ? 'Kaybedilen net' : 'Kazanılabilecek net', right: true, cell: (p) => <span className="tag good" style={{ fontSize: 14 }}>+{fmt(p.gain, 2)} net</span>, val: (p) => p.gain },
    { id: 'kok', head: 'Önce bunu çalış', cell: (p) => (p.root != null ? <span className="tag info">{TOPICS[p.root].name}</span> : <span className="dim">–</span>), val: (p) => (p.root != null ? TOPICS[p.root].name : null) },
  ];

  return (
    <Page title="Konular" sub={`${entName(en)}: hangi konu iyi, hangi konu zayıf ve önce hangisine çalışılmalı.`}
      actions={<>
        <EntField value={en} onChange={(e) => q.put({ kim: e === root ? null : e, ders: null })} kinds={['top', 'class', 'teacher', 'student']} />
        {view !== 'tekrar' && <Seg id="tr" value={r} onChange={(x) => q.put({ aralik: x === 'yil' ? null : x })} options={RANGES} />}
      </>}>
      <Tabs id="tp" value={view} onChange={(v) => q.put({ gorunum: v === 'durum' ? null : v })} tabs={VIEWS} />

      {view === 'durum' && (
        <>
          <div className="tiles n3">
            <Tile tone="good" icon={<CircleCheck size={17} />} label="İyi konular" unit="konu" sub={`Soruların %${LV_HI} ve üstü doğru yapılıyor`}>{count('good')}</Tile>
            <Tile tone="mid" icon={<CircleMinus size={17} />} label="Orta konular" unit="konu" sub={`Doğru oranı %${LV_LO} ile %${LV_HI} arasında`}>{count('mid')}</Tile>
            <Tile tone="bad" icon={<CircleX size={17} />} label="Zayıf konular" unit="konu" sub={`Soruların %${LV_LO}'ından azı doğru yapılıyor`}>{count('bad')}</Tile>
          </div>
          <div className="stack">
            <div className="grid g2">
              <CmpCard compact def="cubuk" title="En zayıf konular" icon={<TriangleAlert size={16} />} k="k-bad" hint="Doğru yapanların oranı en düşük 8 konu"
                rows={sorted.slice(0, 8).map(cmpRow)} names={cmpNames} colors={cmpColors} f={PCT_FMT} head="Konu" noun="konu" at="konuda" onPick={(k) => go(+k)}
                cubuk={duo ? undefined : <Bars wide max={100} rows={sorted.slice(0, 8).map(topicRow)} />} />
              <CmpCard compact def="cubuk" title="En iyi konular" icon={<ThumbsUp size={16} />} k="k-good" hint="Doğru yapanların oranı en yüksek 8 konu"
                rows={sorted.slice(-8).reverse().map(cmpRow)} names={cmpNames} colors={cmpColors} f={PCT_FMT} head="Konu" noun="konu" at="konuda" onPick={(k) => go(+k)}
                cubuk={duo ? undefined : <Bars wide max={100} rows={sorted.slice(-8).reverse().map(topicRow)} />} />
            </div>
            <Card flush title="Bütün konular" icon={<ListChecks size={16} />} hint="Bir konuya tıklayınca ayrıntısı açılır."
              action={<Sel label="Ders" value={filt} onChange={(v) => q.put({ f: v === 'hepsi' ? null : v })}
                options={[{ id: 'hepsi', label: 'Tüm dersler' }, ...SUBJECTS.filter((s) => !only || only.includes(s.i)).map((s) => ({ id: `${s.i}`, label: s.name }))]} />}>
              <DataTable key={filt} cols={allCols} rows={filt === 'hepsi' ? seen : seen.filter((x) => subjOf(x.t) === +filt)} rowKey={(x) => x.t} onRow={(x) => go(x.t)} sort={{ id: 'p', desc: false }} csv="konular" limit={20} />
            </Card>
          </div>
        </>
      )}

      {view === 'oncelik' && (
        <div className="stack">
          {pr.length > 0 && (
            <p className="lead-line" style={{ marginBottom: 4 }}>
              {student
                ? <>En çok net kaybedilen beş konu, her denemede <b className="num">{fmt(top5)}</b> net götürüyor.</>
                : <>Önce ilk beş konuya çalışılırsa her denemede yaklaşık <b className="num">+{fmt(top5)}</b> net kazanılır.</>}
            </p>
          )}
          <Card flush>
            <DataTable cols={prCols} rows={pr} rowKey={(p) => p.t} onRow={(p) => go(p.t)} sort={{ id: 'g', desc: true }} csv="ne-yapmali" limit={25} />
          </Card>
          <p className="note" style={{ maxWidth: '86ch' }}>
            {student
              ? 'Kaybedilen net: bu konuda kaçan soruların her denemedeki net karşılığı.'
              : 'Kazanılabilecek net: bu konu, aynı sınıf düzeyindeki en iyi sınıf kadar iyi yapılsaydı her denemede kaç net artardı.'}
            {' '}“Önce bunu çalış” sütunu, konunun dayandığı temel konu da zayıfsa o temel konuyu gösterir.
          </p>
        </div>
      )}

      {view === 'tekrar' && <Repeats en={en} />}

      {view === 'harita' && (
        <Card title={`${entName(en)}: konu haritası`} action={<LevelLegend />}
          hint="Her kutu bir konu; yanındaki sayı o konuyu doğru yapanların oranı. Her derste en zayıf konu başta. Kutuya tıklayınca konu açılır.">
          <TopicGrid stats={stats} onPick={go} only={only} />
        </Card>
      )}

      {view === 'ag' && (
        <div className="stack">
          <Card title="Konu bağlantıları" hint="Soldaki konu bilinmeden sağdaki konu yapılamaz; çizgiler bu bağı gösterir. Kalın çerçeveli kutu: eksik asıl burada başlıyor."
            action={<Sel label="Ders" value={subj} onChange={(j) => q.put({ ders: `${j}` })} options={SUBJECTS.filter((s) => !only || only.includes(s.i)).map((s) => ({ id: s.i, label: s.name }))} />}>
            <TopicDag subject={subj} stats={stats} roots={chains.map((c) => c.root)} onPick={go} />
            <div style={{ marginTop: 10 }}><LevelLegend /></div>
          </Card>
          <Card flush title="Temel eksikler" icon={<TriangleAlert size={16} />} k="k-bad" hint={chains.length ? 'Önce temel konu kapatılırsa ona dayanan konular da düzelir.' : undefined}>
            {chains.length ? (
              <div className="list">
                {chains.map((c) => (
                  <div key={c.root} className="click" style={{ cursor: 'pointer', alignItems: 'flex-start' }} onClick={() => { q.put({ ders: `${subjOf(c.root)}` }); scrollTo({ top: 0, behavior: 'smooth' }); }}>
                    <span style={{ width: 240, flex: 'none' }}><TopicLink t={c.root} /><span className="sm dim" style={{ display: 'block' }}><SubjDot sc={`s:${subjOf(c.root)}`} />{SUBJECTS[subjOf(c.root)].name}</span></span>
                    <span className={`tag ${lv(stats[c.root].pct)}`}>{pct(stats[c.root].pct)} doğru</span>
                    <span className="grow sm mut">Buna dayanan zayıf konular: {c.deps.map((d) => `${TOPICS[d.t].name} (${pct(stats[d.t].pct)})`).join(', ')}</span>
                  </div>
                ))}
              </div>
            ) : <Empty title="Zincirleme bir eksik görünmüyor">Bu seçimde hiçbir temel konunun eksiği, ona dayanan konulara yayılmış değil.</Empty>}
          </Card>
        </div>
      )}
    </Page>
  );
}

/* ================= Tek konu ================= */
export function TopicPage() {
  const { id } = useParams(), st = useStore(), q = useQuery();
  const t = TOPICS.find((x) => x.id === id);
  if (!t) return <Page title="Konu bulunamadı"><Card><Empty title="Bu adreste bir konu yok">Konular ekranından seçerek devam edebilirsiniz.</Empty></Card></Page>;
  const root = rootEnt(st.level), kim = q.get('kim'), en: Ent = valid(kim) ? kim : root, base = baseOf(en), sc = `k:${t.i}`;
  const all = topicStats(en), stats = all[t.i], cmp = en !== base;
  const basePct = val(base, ALL, sc, 'pct');
  const diff = cmp ? (stats.pct != null && basePct != null ? stats.pct - basePct : null) : topicDeficit(en)[t.i];
  const rows = classesOf(root).map((c) => ({ c, v: val(`c:${c}`, ALL, sc, 'pct') })).filter((r): r is { c: number; v: number } => r.v != null).sort((a, b) => b.v - a.v);
  const ref = val(root, ALL, sc, 'pct');
  const errs = errProfile(en, ALL, base, sc).slice(0, 6);
  const qs = ds.exams.flatMap((x) => { const s = qStats(x.i, en); return x.q.filter((k) => k.topic === t.i).map((k) => ({ e: x.i, q: k.i, p: s[k.i].p })); }).reverse();
  const weak = entKind(en) === 'student' ? [] : members(en).map((s) => ({ s, c: val(`s:${s}`, ALL, sc, 'pct'), n: ds.exams.reduce((a, x) => a + (ds.ans[x.i][s] ? QN[x.i][t.i] : 0), 0) }))
    .filter((r) => r.c != null && r.n >= 4).sort((a, b) => a.c! - b.c!).slice(0, 8);
  const rel = (list: number[], empty: string) => (list.length ? list.map((p) => (
    <div key={p} className="row" style={{ padding: '6px 0' }}>
      <span className="grow clip"><TopicLink t={p} /> <span className="dim sm">{SUBJECTS[subjOf(p)].name}</span></span>
      <span className="n" style={{ fontWeight: 650 }}>{pct(all[p].pct)}</span>
      <span style={{ width: 62, textAlign: 'right' }}><LevelTag p={all[p].pct} /></span>
    </div>
  )) : <p className="mut sm">{empty}</p>);
  const l = lv(stats.pct);
  const clsRows: CmpRow[] = [
    ...rows.map((r) => mkRow(`c:${r.c}`, ds.classes[r.c].name, <EntLink en={`c:${r.c}`} />, [agg(`c:${r.c}`, ALL, sc)], 'pct', false)),
    ...(ref != null ? [{ key: 'ort', name: `${entName(root)} ortalaması`, label: `${entName(root)} ortalaması`, vals: [ref], pct: [null], color: 'var(--ink3)' } as CmpRow] : []),
  ].sort((a, b) => (b.vals[0] ?? 0) - (a.vals[0] ?? 0));
  const errRef = errAvg(base, ALL, sc);
  const errRows: CmpRow[] = errs.map((r) => ({ key: `${r.k}`, name: ERRS[r.k].name, label: <span title={ERRS[r.k].hint}>{ERRS[r.k].name}</span>, vals: cmp ? [r.n, errRef[r.k]] : [r.n], pct: cmp ? [null, null] : [null], color: 'var(--bad)' }));
  const etk = niceTicks(0, Math.max(1e-9, ...errRows.flatMap((r) => r.vals.map((v) => v ?? 0))), 4);
  const errF: CmpFmt = { show: (v) => fmt(v, 2), dig: 2, up: false, top: etk[etk.length - 1], axis: true, heat: 'bad', lead: 'daha az hata', leadCap: 'Daha az hata yaptığı' };

  return (
    <Page title={t.name} crumb={<><Link to="/konular">Konular</Link> / {SUBJECTS[t.subject].name}</>} sub={`${entName(en)}, tüm yıl.`}
      actions={<>
        <EntField value={en} onChange={(e) => q.put({ kim: e === root ? null : e })} kinds={['top', 'class', 'teacher', 'student']} />
        <Link className="btn" to={`/karsilastir?n=${sc}`}>Karşılaştır</Link>
      </>}>
      <div className="tiles">
        <Tile tone={l === 'none' ? '' : l} icon={<Percent size={17} />} label="Doğru yapanlar" sub={<><LevelTag p={stats.pct} /> {stats.n} soru üzerinden <WhyBtn en={en} sc={sc} m="pct" /></>}>
          <span>%<Num v={stats.pct} dig={0} /></span>
        </Tile>
        <Tile icon={<Scale size={17} />} label={cmp ? `${entName(base)} ortalamasına göre` : `${SUBJECTS[t.subject].name} ortalamasına göre`} unit="puan"
          sub={cmp ? `${entName(base)} ortalaması ${pct(basePct)}` : 'Dersin diğer konularına göre'}>
          {sgn(diff, 0)}
        </Tile>
        <Tile icon={<Eraser size={17} />} label="Boş bırakılan" sub="Bu konudaki soruların boş bırakılma oranı">{pct(stats.n ? (100 * stats.b) / stats.n : null)}</Tile>
        <Tile icon={<Hash size={17} />} label="Her denemede" unit="soru" sub="Bu konudan çıkan ortalama soru sayısı">{fmt(topicW[t.i])}</Tile>
      </div>
      <div className="stack">
        <TimeCard title="Denemelere göre doğru oranı" icon={<LineIcon size={16} />} hint="Konudan soru çıkmayan denemeler atlanır." m="pct" exams={ALL}
          series={[timeSer(en, sc, 'pct', 'var(--accent)', ALL), ...(cmp ? [timeSer(base, sc, 'pct', 'var(--ink3)', ALL, { name: `${entName(base)} ortalaması`, dash: true })] : [])]} />
        <div className="grid g2">
          <CmpCard compact def="cubuk" title="Sınıflar" icon={<School size={16} />} k="k-mid"
            hint={`Doğru yapanların oranı. ${entName(root)} ortalaması çubuklarda dikey çizgi, diğer görünümlerde gri satırdır.`}
            rows={clsRows} names={['Doğru oranı']} colors={[SERIES[0]]} f={PCT_FMT} head="Sınıf" noun="sınıf" at="sınıfta"
            cubuk={<Bars max={100} unit="%" rows={rows.map((r) => ({ key: `${r.c}`, k: `k-${lv(r.v)}`, label: <EntLink en={`c:${r.c}`} />, v: r.v, ref, right: <WhyBtn en={`c:${r.c}`} sc={sc} m="pct" /> }))} />} />
          <div className="stack">
            <Card title="Önce bilinmesi gereken konular" hint="Bu konu, aşağıdaki konuların üzerine kurulur.">{rel(t.pre, 'Bu konu başka bir konuya dayanmıyor.')}</Card>
            <Card title="Bu konuya dayanan konular" hint="Bu konudaki eksik, aşağıdaki konuları da zorlaştırır.">{rel(dependents[t.i], 'Bu konuya dayanan başka bir konu yok.')}</Card>
          </div>
        </div>
        <div className="grid g2">
          {errs.length ? (
            <CmpCard compact def="cubuk" title="Bu konuda en çok yapılan hatalar" icon={<TriangleAlert size={16} />} k="k-bad" hint="İşaretlenen yanlış şıklardan anlaşılır. Sayı: her denemede öğrenci başına kaç yanlış."
              rows={errRows} names={cmp ? [entName(en), `${entName(base)} ortalaması`] : ['Yanlış sayısı']} colors={cmp ? ['var(--bad)', 'var(--ink3)'] : ['var(--bad)']} f={errF}
              head="Hata türü" noun="hata türü" at="hata türünde"
              cubuk={cmp ? undefined : <Bars dig={2} wide rows={errs.map((r) => ({ key: `${r.k}`, k: 'k-bad', v: r.n, label: <span title={ERRS[r.k].hint}>{ERRS[r.k].name}</span> }))} />} />
          ) : (
            <Card title="Bu konuda en çok yapılan hatalar" icon={<TriangleAlert size={16} />} k="k-bad"><Empty title="Bu konuda kayıtlı yanlış yok" /></Card>
          )}
          {weak.length > 0 && (
            <Card flush title="En çok zorlanan öğrenciler" hint="Bu konudan en az dört soru görmüş öğrenciler arasında, en az doğru yapanlar.">
              <div className="list">
                {weak.map((r) => (
                  <Link key={r.s} to={entHref(`s:${r.s}`)}>
                    <span className="grow clip"><Who en={`s:${r.s}`} sub={ds.classes[ds.students[r.s].cls].name} /></span>
                    <span className="sm mut">{r.n} soru</span>
                    <span style={{ width: 150 }}><PctBar p={r.c} /></span>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
        <Card flush title="Bu konudan çıkan sorular" hint={`${qs.length} soru. Bir satıra tıklayınca soru açılır.`}>
          <div className="list">
            {qs.slice(0, 12).map((r) => (
              <div key={`${r.e}-${r.q}`} className="click" style={{ cursor: 'pointer' }} onClick={() => openQ({ e: r.e, q: r.q })}>
                <span className="grow"><b style={{ fontWeight: 600 }}>{ds.exams[r.e].name}</b> <span className="mut">soru {r.q + 1}</span></span>
                <span style={{ width: 190 }}><PctBar p={r.p * 100} /></span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Page>
  );
}
