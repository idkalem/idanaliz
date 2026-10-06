import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingDown, TrendingUp, Info, Lock, LineChart as LineIcon, BarChart3, Globe, Target, Users, BookOpen, School, ThumbsUp, TriangleAlert } from 'lucide-react';
import { ds, LAST, PRES, TESTS, win, val, agg, scopeN, members, classesOf, rootEnt, entName, PERS } from '../engine/core';
import { findings, move, envelope, forecast, ALL, type Finding } from '../engine/analysis';
import { fmt, sgn, pct, date } from '../engine/fmt';
import { useStore } from '../store';
import { Page, Card, Delta, Num, WhyBtn, EntLink, Tile, SubjDot } from '../ui';
import { Bars, SERIES } from '../charts';
import { type CmpRow } from '../cmpcharts';
import { CmpCard, TimeCard, timeSer, mkRow, fmtFor, scColor, EXL, EXT } from '../board';

export const EXAM_LABELS = EXL;
export const EXAM_TITLES = EXT;

export function FindingRow({ f }: { f: Finding }) {
  const I = f.tone === 'bad' ? TrendingDown : f.tone === 'good' ? TrendingUp : Info;
  return (
    <Link to={f.to} className="find">
      <span className={`find-ic ${f.tone}`}><I size={15} strokeWidth={2.4} /></span>
      <span className="grow">
        <b>{f.title}</b>
        <p>{f.text}</p>
      </span>
      {f.en && f.sc && f.m && f.tag !== 'Kök konu' && <WhyBtn en={f.en} sc={f.sc} m={f.m} />}
    </Link>
  );
}

/** Aynı türden bulgular listeyi doldurmasın: her türden en çok iki tane, önem sırası korunur */
function varied(list: Finding[], n: number): Finding[] {
  const used = new Map<string, number>(), out: Finding[] = [];
  for (const f of list) {
    const k = f.tag.includes('öğrenci') ? 'öğrenci' : f.tag, c = used.get(k) ?? 0;
    if (c < 2) { out.push(f); used.set(k, c + 1); }
    if (out.length === n) break;
  }
  return out;
}

export default function Home() {
  const st = useStore();
  const nav = useNavigate();
  const root = rootEnt(st.level), w = win(st.per);
  const mv = move(root, 'all', 'net', w);
  const cur = val(root, w.cur, 'all', 'net');
  const nat = w.cur.reduce((a, e) => a + ds.exams[e].nat.mean, 0) / w.cur.length;
  const gap = cur != null ? cur - nat : null;
  const mem = members(root);
  const part = w.cur.reduce((a, e) => a + mem.filter((s) => PRES[e][s]).length, 0) / (w.cur.length * mem.length);
  const last = ds.exams[LAST], lastN = mem.filter((s) => PRES[LAST][s]).length;
  const puan = useMemo(() => {
    const f = mem.map((s) => forecast(s)).filter((x) => x != null);
    return f.length ? f.reduce((a, x) => a + x.puan, 0) / f.length : null;
  }, [root]);
  const { good, care } = useMemo(() => {
    const all = findings(root, st.per);
    return { good: varied(all.filter((f) => f.tone === 'good'), 5), care: varied(all.filter((f) => f.tone !== 'good'), 5) };
  }, [root, st.per]);
  const tests = TESTS.map((t) => {
    const sc = `t:${t.id}`;
    return { t, sc, v: val(root, w.cur, sc, 'net') ?? 0, n: scopeN(sc, LAST), m: move(root, sc, 'net', w) };
  });
  const classes = classesOf(root).map((c) => ({ c, en: `c:${c}`, m: move(`c:${c}`, 'all', 'net', w), cur: val(`c:${c}`, w.cur, 'all', 'net') ?? 0 })).sort((a, b) => b.cur - a.cur);
  const testRows = tests.map((r) => mkRow(r.sc, r.t.name, <><SubjDot sc={r.sc} />{r.t.name}</>, [agg(root, w.cur, r.sc)], 'net', true, scColor(r.sc)));
  const natRow: CmpRow = { key: 'tr', name: 'Türkiye ortalaması', label: 'Türkiye ortalaması', vals: [nat], pct: [null], color: 'var(--ink3)' };
  const classRows = [...classes.map((r) => mkRow(r.en, entName(r.en), <EntLink en={r.en} />, [agg(r.en, w.cur, 'all')], 'net', false)), natRow].sort((a, b) => (b.vals[0] ?? 0) - (a.vals[0] ?? 0));
  const env = envelope(LAST), open = st.envOpen.includes(last.id);
  const perName = PERS.find((p) => p.id === st.per)!.name.toLocaleLowerCase('tr');
  const before = w.prev.length === 1 ? 'bir önceki denemeye göre' : 'önceki denemelere göre';

  return (
    <Page title="Genel bakış" sub={`${ds.school}, ${ds.year} eğitim yılı. ${ds.exams.length} deneme, ${mem.length} öğrenci. Sayılar: ${perName}.`}>
      <div className="tiles">
        <Tile tone="brand" icon={<BarChart3 size={17} />} label={`${entName(root)} ortalaması`} unit="net"
          sub={mv ? <><Delta v={mv.diff} /> {before} <WhyBtn en={root} /></> : '120 soruda ortalama net'}>
          <Num v={cur} />
        </Tile>
        <Tile tone={gap == null ? '' : gap >= 0 ? 'good' : 'bad'} icon={<Globe size={17} />} label="Türkiye ortalamasına göre" unit="net"
          sub={`Türkiye ortalaması ${fmt(nat)} net`}>
          {sgn(gap)}
        </Tile>
        <Tile icon={<Target size={17} />} label="Bugün sınav olsa" unit="puan" sub="Tahmini TYT puanı ortalaması" to="/tahmin">
          {puan == null ? '–' : <>≈ {fmt(puan, 0)}</>}
        </Tile>
        <Tile icon={<Users size={17} />} label="Denemelere katılım" sub={`Son denemeye ${lastN} / ${mem.length} öğrenci girdi`}>
          {pct(part * 100)}
        </Tile>
      </div>

      <div className="grid g2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
        <CmpCard compact title="Dersler" icon={<BookOpen size={16} />} hint="Her testte ortalama net ve soru sayısı. Dolu kısım ne kadar büyükse o kadar iyi."
          extra={<Link className="more" to="/konular">Konulara bak</Link>}
          rows={testRows} names={[entName(root)]} colors={[SERIES[0]]} f={fmtFor('net', testRows, true)} head="Test" noun="test" at="testte"
          cubuk={<Bars dig={1} tw={92} rows={tests.map((r) => ({
            key: r.t.id, k: `k-${r.t.id}`, label: <><SubjDot sc={r.sc} />{r.t.name}</>, v: r.v, of: r.n, text: `${fmt(r.v)} / ${r.n}`, right: <Delta v={r.m?.diff} />,
          }))} />} />
        <TimeCard compact title="Denemelere göre" icon={<LineIcon size={16} />} style={{ flex: 1 }} hint="Her denemede ortalama net. Kesikli çizgi Türkiye ortalaması."
          extra={<Link className="more" to="/denemeler">Tüm denemeler</Link>} m="net" exams={ALL} height={196}
          series={[timeSer(root, 'all', 'net', 'var(--accent)', ALL), { name: 'Türkiye ortalaması', color: 'var(--ink3)', values: ds.exams.map((x) => x.nat.mean), dash: true }]} />
        </div>
        <CmpCard compact title="Sınıflar" icon={<School size={16} />} k="k-mid" hint="Toplam net, en yüksekten en düşüğe. Türkiye ortalaması çubuklarda dikey çizgi, diğer görünümlerde gri satırdır."
          extra={<Link className="more" to="/siniflar">Tüm sınıflar</Link>}
          rows={classRows} names={['Toplam net']} colors={[SERIES[0]]} f={fmtFor('net', classRows, false)} head="Sınıf" noun="sınıf" at="sınıfta"
          cubuk={<Bars dig={1} max={Math.max(nat, ...classes.map((r) => r.cur)) * 1.06} rows={classes.map((r) => ({
            key: `${r.c}`, label: <EntLink en={r.en} />, v: r.cur, ref: nat, right: <Delta v={r.m?.diff} />,
          }))} />} />
      </div>

      <div className="grid g2" style={{ marginTop: 16 }}>
        <Card flush title="İyi giden" icon={<ThumbsUp size={16} />} k="k-good" hint="Yükselen sınıflar ve öğrenciler">
          <div className="list">
            {good.map((f) => <FindingRow key={f.id} f={f} />)}
            {!good.length && <div className="empty"><b>Bu dönemde öne çıkan bir yükseliş yok</b>Yukarıdan dönemi değiştirerek daha geniş bir aralığa bakabilirsiniz.</div>}
          </div>
        </Card>
        <Card flush title="Dikkat isteyen" icon={<TriangleAlert size={16} />} k="k-bad" hint="Düşüşler, sık yapılan hatalar ve zayıf konular"
          action={<Link className="more" to="/hareketler">Tüm yükselen ve düşenler</Link>}>
          <div className="list">
            {care.map((f) => <FindingRow key={f.id} f={f} />)}
            {!care.length && <div className="empty"><b>Bu dönemde dikkat isteyen bir şey görünmüyor</b>Yukarıdan dönemi değiştirerek daha geniş bir aralığa bakabilirsiniz.</div>}
          </div>
        </Card>
      </div>

      {env && (
        <Card style={{ marginTop: 16 }}>
          <div className="row wrap" style={{ gap: 16 }}>
            <span className="ch-ic" style={{ width: 42, height: 42, borderRadius: 13, alignSelf: 'center' }}><Lock size={20} /></span>
            <div className="grow" style={{ minWidth: 240 }}>
              <h2 style={{ fontSize: 17, fontWeight: 680 }}>{open ? `${last.name} için tahmin zarfı açıldı` : `${last.name} için tahmin zarfı kapalı duruyor`}</h2>
              <p className="mut sm" style={{ marginTop: 3, maxWidth: '76ch' }}>
                {open
                  ? `Deneme yapılmadan önce hazırlanan net tahmini, ${env.n} öğrencinin ${pct(env.hit * 100)} kadarında gerçek netin 5 net yakınına düştü.`
                  : 'Program, her öğrencinin netini deneme yapılmadan önce tahmin etti. Zarfı açınca tahmin ile gerçek sonuç yan yana gelir.'}
              </p>
            </div>
            <button className="btn pri lg" onClick={() => nav(`/deneme/${last.id}?sekme=zarf`)}>{open ? 'Zarfı gör' : 'Zarfı aç'}</button>
          </div>
        </Card>
      )}
    </Page>
  );
}
export { EntLink };
