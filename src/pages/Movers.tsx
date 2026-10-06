import { useMemo, useState, type ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  ds, METRICS, SUBJECT_SCOPES, win, val, series, classesOf, members, rootEnt, entName, entI, scopeName, teacherScope, defMetric,
  type Ent, type Scope, type Metric,
} from '../engine/core';
import { move, moveAdj, baseOf, better, streak, volatility, crossing, type Move } from '../engine/analysis';
import { fmt, sgn } from '../engine/fmt';
import { useStore } from '../store';
import { Page, Card, Seg, Sel, ScopePicker, EntLink, WhyBtn, Delta, Tabs, Empty, useQuery } from '../ui';
import { Bars, SERIES } from '../charts';
import { type CmpRow } from '../cmpcharts';
import { CmpCard, fmtFor } from '../board';

type Kind = 'sinif' | 'ogrenci' | 'ogretmen';
const KINDS: { id: Kind; label: string }[] = [{ id: 'sinif', label: 'Sınıflar' }, { id: 'ogrenci', label: 'Öğrenciler' }, { id: 'ogretmen', label: 'Öğretmenler' }];
type Sub = 'seri' | 'sabit' | 'dalga' | 'basamak';

export default function Movers() {
  const st = useStore(), q = useQuery();
  const kind = q.get('kim', 'sinif') as Kind, defSc = kind === 'sinif' ? 'ders' : 'all', sc = q.get('n', defSc), each = sc === 'ders';
  const m = (q.get('m') || (each ? 'net' : defMetric(sc))) as Metric, rel = q.get('bicim') === 'yuzde', adj = q.get('duz') === '1';
  const [tab, setTab] = useState<Sub>('seri');
  const root = rootEnt(st.level), w = win(st.per);

  const ents: Ent[] = useMemo(() => (kind === 'sinif' ? classesOf(root).map((c) => `c:${c}`) : kind === 'ogrenci' ? members(root).map((s) => `s:${s}`)
    : ds.teachers.filter((t) => !st.level || classesOf(`t:${t.i}`).some((c) => ds.classes[c].level === st.level)).map((t) => `t:${t.i}`)), [kind, root, st.level]);
  const scopeOf = (en: Ent): Scope[] => (each ? SUBJECT_SCOPES : [kind === 'ogretmen' && sc === 'all' ? teacherScope(entI(en)) : sc]);
  const all = useMemo(() => {
    const out: Move[] = [];
    for (const en of ents) for (const s of scopeOf(en)) { const x = (adj ? moveAdj : move)(en, s, m, w); if (x) out.push(x); }
    return out;
  }, [ents, sc, m, adj, st.per]);
  const v = (x: Move) => (rel ? x.rel : x.diff);
  const ranked = all.filter((x) => v(x) != null).sort((a, b) => better(v(b)!, m) - better(v(a)!, m));
  const up = ranked.filter((x) => better(v(x)!, m) > 0).slice(0, 8), down = ranked.filter((x) => better(v(x)!, m) < 0).slice(-8).reverse();
  const max = Math.max(1e-9, ...[...up, ...down].map((x) => Math.abs(v(x)!)));
  const dig = METRICS[m].dig;
  const lab = (x: Move) => <><EntLink en={x.en} />{(each || kind === 'ogretmen') && <span className="mut"> {scopeName(x.sc)}</span>}</>;
  const rows = (list: Move[], k: string) => list.map((x) => ({
    key: `${x.en}|${x.sc}`, k, label: lab(x), v: Math.abs(v(x)!), text: rel ? `${v(x)! > 0 ? '+' : '−'}%${fmt(Math.abs(v(x)!), 0)}` : sgn(v(x)!, dig),
    right: <span className="row" style={{ gap: 8 }}><span className="mut sm nowrap hide-s">{fmt(x.prev, dig)} → {fmt(x.cur, dig)}</span><WhyBtn en={x.en} sc={x.sc} m={m} /></span>,
  }));
  const good = (x: number) => better(x, m) > 0;
  const lower = m === 'y' || m === 'b';
  const top = ranked[0], bot = ranked[ranked.length - 1];
  const what = (x: Move) => `${entName(x.en)}${each || kind === 'ogretmen' ? `, ${scopeName(x.sc)}` : ''}`;
  // Diğer görünümler için: bu dönem ile önceki dönem yan yana
  const cmpRows = (list: Move[]): CmpRow[] => list.map((x) => ({
    key: `${x.en}|${x.sc}`, name: what(x), label: lab(x), vals: [x.cur, x.prev], pct: [val(x.en, w.cur, x.sc, 'pct'), val(x.en, w.prev, x.sc, 'pct')],
  }));
  const moverCard = (title: string, icon: ReactNode, k: string, hint: string, list: Move[], none: string) => {
    if (!list.length) return <Card title={title} icon={icon} k={k} hint={hint}><Empty title={none} /></Card>;
    const cr = cmpRows(list);
    return (
      <CmpCard compact def="cubuk" title={title} icon={icon} k={k} hint={hint} rows={cr} names={['Bu dönem', 'Önceki dönem']} colors={[SERIES[0], 'var(--ink3)']}
        f={fmtFor(m, cr, false)} head={KINDS.find((x) => x.id === kind)?.label ?? 'Kim'} noun="satır" at="satırda"
        cubuk={<Bars rows={rows(list, k)} max={max} wide={each} />} />
    );
  };

  // Alt sekmeler. "Zor deneme etkisi" çıkarılıyorsa seriler de aynı denemedeki ortalamaya göre ölçülür.
  const ser = (en: Ent, s: Scope) => {
    const a = series(en, s, m);
    if (!adj) return a;
    const b = series(baseOf(en), s, m);
    return a.map((x, i) => (x == null || b[i] == null ? null : x - b[i]!));
  };
  const flat = [...all].sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff)).slice(0, 10);
  const wav = useMemo(() => ents.flatMap((en) => scopeOf(en).map((s) => ({ en, sc: s, v: volatility(ser(en, s)) }))).filter((x) => x.v != null).sort((a, b) => b.v! - a.v!).slice(0, 10), [ents, sc, m, adj]);
  const runs = useMemo(() => ents.flatMap((en) => scopeOf(en).map((s) => ({ en, sc: s, k: streak(ser(en, s)) }))).filter((x) => Math.abs(x.k) >= 3).sort((a, b) => Math.abs(b.k) - Math.abs(a.k)).slice(0, 14), [ents, sc, m, adj]);
  const steps = useMemo(() => (kind !== 'ogrenci' ? [] : all.map((x) => ({ x, c: crossing(x.prev, x.cur) })).filter((r) => r.c && m === 'net' && !adj).sort((a, b) => b.x.diff - a.x.diff)), [all, kind]);
  const tabs: { id: Sub; label: string }[] = [
    { id: 'seri', label: 'Üst üste artanlar ve azalanlar' }, { id: 'sabit', label: 'Yerinde sayanlar' }, { id: 'dalga', label: 'İnişli çıkışlılar' },
    ...(kind === 'ogrenci' ? [{ id: 'basamak' as const, label: '10 net sınırını geçenler' }] : []),
  ];
  const shown = tabs.some((t) => t.id === tab) ? tab : 'seri';

  return (
    <Page title="Yükselenler ve düşenler" sub={`${w.desc[0].toLocaleUpperCase('tr')}${w.desc.slice(1)}. Dönemi sağ üstten değiştirebilirsiniz.`}
      actions={<Seg id="mk" value={kind} onChange={(k) => q.put({ kim: k === 'sinif' ? null : k, n: null, m: null })} options={KINDS} />}>
      <div className="row wrap no-print" style={{ marginBottom: 18 }}>
        <Seg id="ms" value={each ? 'ders' : 'tek'} onChange={(x) => { const n = x === 'ders' ? 'ders' : 'all'; q.put({ n: n === defSc ? null : n, m: null }); }}
          options={[{ id: 'ders', label: 'Her ders ayrı' }, { id: 'tek', label: 'Toplam ya da tek konu' }]} />
        {!each && <ScopePicker label="Neyde" value={sc} onChange={(s) => q.put({ n: s === defSc ? null : s, m: null })} />}
        <Sel label="Neye bakılsın" value={m} onChange={(x) => q.put({ m: x })} options={(['net', 'pct', 'd', 'y', 'b'] as Metric[]).map((id) => ({ id, label: METRICS[id].name }))} />
        <Seg id="mb" value={rel ? 'yuzde' : 'fark'} onChange={(x) => q.put({ bicim: x === 'yuzde' ? 'yuzde' : null })} options={[{ id: 'fark', label: 'Kaç net' }, { id: 'yuzde', label: 'Yüzde kaç' }]} />
        <button className={`btn ${adj ? 'on' : ''}`} aria-pressed={adj} onClick={() => q.put({ duz: adj ? null : '1' })}>Zor deneme etkisini çıkar</button>
      </div>
      {adj && (
        <p className="note" style={{ margin: '-8px 0 16px', maxWidth: '86ch' }}>
          Deneme zor ya da kolay çıkınca herkesin neti birlikte oynar. Bu seçenek açıkken {kind === 'ogretmen' ? 'okulun' : 'aynı sınıf düzeyinin'} ortak değişimi çıkarılır; kalan fark gösterilir.
        </p>
      )}

      {top && bot && (
        <p className="lead-line">
          {better(v(top)!, m) > 0 && <>En çok yükselen: {what(top)} <Delta v={top.diff} m={m} />. </>}
          {better(v(bot)!, m) < 0 && <>En çok düşen: {what(bot)} <Delta v={bot.diff} m={m} />.</>}
        </p>
      )}

      <div className="grid g2">
        {moverCard('En çok yükselenler', <TrendingUp size={16} />, 'k-good', lower ? `${METRICS[m].name} en çok azalanlar` : `${METRICS[m].name}: önceki → şimdi`, up, 'Bu dönemde yükselen yok')}
        {moverCard('En çok düşenler', <TrendingDown size={16} />, 'k-bad', lower ? `${METRICS[m].name} en çok artanlar` : `${METRICS[m].name}: önceki → şimdi`, down, 'Bu dönemde düşen yok')}
      </div>

      <Card style={{ marginTop: 16 }}>
        <Tabs id="mt" value={shown} onChange={setTab} tabs={tabs} />
        {shown === 'seri' && (runs.length ? (
          <div className="grid g2" style={{ gap: '2px 40px' }}>
            {runs.map((r) => (
              <div key={`${r.en}${r.sc}`} className="row" style={{ padding: '7px 0' }}>
                <span className="grow clip"><EntLink en={r.en} /><span className="mut"> {scopeName(r.sc)}</span></span>
                <span className={`tag ${good(r.k) ? 'good' : 'bad'}`}>{Math.abs(r.k)} denemedir {r.k > 0 ? 'artıyor' : 'azalıyor'}</span>
              </div>
            ))}
          </div>
        ) : <Empty title="Üst üste 3 denemedir aynı yönde giden yok" />)}
        {shown === 'sabit' && (
          <>
            <div className="grid g2" style={{ gap: '2px 40px' }}>
              {flat.map((x) => (
                <div key={`${x.en}${x.sc}`} className="row" style={{ padding: '7px 0' }}>
                  <span className="grow clip">{lab(x)}</span>
                  <span className="mut sm nowrap">{fmt(x.prev, dig)} → {fmt(x.cur, dig)}</span>
                  <span style={{ width: 62, textAlign: 'right' }}><Delta v={x.diff} m={m} /></span>
                </div>
              ))}
            </div>
            <p className="note" style={{ marginTop: 10 }}>Bu dönemde neredeyse hiç değişmeyenler.</p>
          </>
        )}
        {shown === 'dalga' && (
          <>
            <div className="grid g2" style={{ gap: '2px 40px' }}>
              {wav.map((x) => (
                <div key={`${x.en}${x.sc}`} className="row" style={{ padding: '7px 0' }}>
                  <span className="grow clip"><EntLink en={x.en} /><span className="mut"> {scopeName(x.sc)}</span></span>
                  <span className="tag mid">± {fmt(x.v, dig)}</span>
                </div>
              ))}
            </div>
            <p className="note" style={{ marginTop: 10 }}>Sayı, bir denemeden ötekine sonucun genelde ne kadar oynadığını gösterir. Büyük sayı: bir iyi bir kötü.</p>
          </>
        )}
        {shown === 'basamak' && (steps.length ? (
          <div className="grid g2" style={{ gap: '2px 40px' }}>
            {steps.slice(0, 24).map(({ x, c }) => (
              <div key={x.en} className="row" style={{ padding: '7px 0' }}>
                <span className="grow clip"><EntLink en={x.en} sub /></span>
                <span className={`tag ${c!.dir > 0 ? 'good' : 'bad'}`}>{c!.line} netin {c!.dir > 0 ? 'üstüne çıktı' : 'altına indi'}</span>
              </div>
            ))}
          </div>
        ) : <Empty title="Sınır geçen yok">Sınırlar toplam nette 10'ar net aralıklarla sayılır (40, 50, 60…). “Net” ve “Toplam” seçiliyken gösterilir.</Empty>)}
      </Card>
    </Page>
  );
}
