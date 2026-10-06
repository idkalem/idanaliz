// İncele: bir sınıfın, öğrencinin, öğretmenin ya da okulun sonuçlarını istenen kırılıma göre döker.
// "11-A'nın Matematik konularında en çok yanlış nerede?" sorusu burada üç seçimle yanıtlanır.
import { Fragment, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ThumbsUp, TriangleAlert, TrendingUp, TrendingDown } from 'lucide-react';
import {
  ds, METRICS, METRIC_IDS, agg, cnt, mval, entKind, entI, entName, entScope, members, classesOf, rootEnt, scopeName, scopeFull, scopeParent,
  type Cnt, type Ent, type Metric, type Scope,
} from '../engine/core';
import { better } from '../engine/analysis';
import { fmt, pct as fpct, date } from '../engine/fmt';
import { useStore } from '../store';
import { Page, Card, Seg, Sel, ScopePicker, EntField, EntLink, Delta, DataTable, PctBar, LevelLegend, useQuery, type Col } from '../ui';
import { LineChart, Dumbbell, Legend, SERIES } from '../charts';
import { Columns, HeatTable, type CmpRow } from '../cmpcharts';
import {
  CmpCard, ViewSeg, ExamPick, MetricSeg, Ctl, NameTile, examSel, mkRow, fmtFor, showM, kidKinds, kidScopes, scColor, okScope, validEnt, BRK, EXL, EXT,
  type Brk, type TView, type View,
} from '../board';

type Sort = 'kotu' | 'iyi' | 'artan' | 'azalan' | 'sira';
const SORTS: Sort[] = ['kotu', 'iyi', 'artan', 'azalan', 'sira'];
const some = (v: number | null | undefined): v is number => v != null;
interface Item {
  key: string; name: string; label: ReactNode; color?: string;
  /** seçili denemelerin toplamı (ilk karşılaştırılan için) */
  c: Cnt | null;
  /** seçili denemelerin ilk yarısından ikinci yarısına değişim */
  ch: number | null;
  row: CmpRow;
  /** tek deneme için sayım */
  at: (e: number) => Cnt | null;
}

export function Explorer({ en }: { en: Ent }) {
  const q = useQuery();
  const [all, setAll] = useState(false);
  const kind = entKind(en);
  const sc: Scope = okScope(q.get('n')) ? q.get('n') : entScope(en);
  const content = kidKinds(sc);
  const group: Brk[] = kind === 'class' ? ['ogrenci'] : kind === 'student' ? [] : ['sinif'];
  const brks: Brk[] = [...content, ...group, 'deneme'];
  const bDef: Brk = content.includes('ders') ? 'ders' : content[0] ?? 'deneme';
  const b = brks.includes(q.get('b') as Brk) ? (q.get('b') as Brk) : bDef, B = BRK[b];
  const m: Metric = METRIC_IDS.includes(q.get('m') as Metric) ? (q.get('m') as Metric) : b === 'konu' || sc[0] === 'k' ? 'pct' : 'net';
  const M = METRICS[m], unit = m === 'pct' ? '' : M.unit;
  const sel = examSel(q), exams = sel.exams;
  // Konular birbirine yakın büyüklükte: çubuk ve sıralama yazan sayının kendisine göre. Test ve derste soru sayısına oranlanır.
  const isEnt = b === 'sinif' || b === 'ogrenci', share = !isEnt && b !== 'deneme' && b !== 'konu';

  /* ---- Yanına konacak kıyas ---- */
  const cls = kind === 'student' ? ds.students[entI(en)].cls : kind === 'class' ? entI(en) : -1;
  const bases: Ent[] = kind === 'student' ? [`c:${cls}`, `l:${ds.classes[cls].level}`, 'o'] : kind === 'class' ? [`l:${ds.classes[cls].level}`, 'o'] : kind === 'school' ? [] : ['o'];
  const ky = !isEnt && bases.includes(q.get('ky')) ? q.get('ky') : '';
  const who: Ent[] = ky ? [en, ky] : [en];
  const names = who.map(entName), colors = ky ? [SERIES[0], 'var(--ink3)'] : [SERIES[0]];

  /* ---- Satırlar ---- */
  const h = Math.floor(exams.length / 2), early = exams.slice(0, h), late = exams.slice(exams.length - h);
  const ok = (c: Cnt | null) => (c && c.n ? c : null);
  const chOf = (a: Cnt | null, z: Cnt | null) => { const x = mval(ok(a), m), y = mval(ok(z), m); return x != null && y != null ? y - x : null; };
  const drill = (k: Scope) => q.put({ n: k, b: null });
  const raw: { key: string; name: string; label: ReactNode; color?: string; get: (x: Ent, ex: number[]) => Cnt | null; at: (e: number) => Cnt | null }[] =
    b === 'deneme' ? exams.map((e) => ({
      key: `e${e}`, name: EXL[e], get: (x) => cnt(x, e, sc), at: () => null,
      label: <Link className="lnk" to={`/deneme/${ds.exams[e].id}`} title={EXT[e]}>{EXL[e]} <small className="dim">{date(ds.exams[e].date)}</small></Link>,
    }))
    : b === 'sinif' ? classesOf(en).map((c) => ({ key: `c:${c}`, name: ds.classes[c].name, label: <EntLink en={`c:${c}`} />, get: (_x, ex) => agg(`c:${c}`, ex, sc), at: (e) => cnt(`c:${c}`, e, sc) }))
    : b === 'ogrenci' ? members(en).map((s) => ({ key: `s:${s}`, name: ds.students[s].name, label: <EntLink en={`s:${s}`} />, get: (_x, ex) => agg(`s:${s}`, ex, sc), at: (e) => cnt(`s:${s}`, e, sc) }))
    : kidScopes(sc, b).map((k) => ({
      key: k, name: scopeName(k), color: b === 'konu' ? undefined : scColor(k), get: (x, ex) => agg(x, ex, k), at: (e) => cnt(en, e, k),
      label: <button className="lnk" title={`${scopeFull(k)}: ayrıntısını aç`} onClick={() => drill(k)}>{scopeName(k)}</button>,
    }));
  const items: Item[] = raw.map((r, i) => {
    const cs = who.map((x) => r.get(x, exams));
    return {
      key: r.key, name: r.name, label: r.label, at: r.at, c: ok(cs[0]),
      row: mkRow(r.key, r.name, r.label, cs, m, share, r.color),
      ch: b === 'deneme' ? (i > 0 ? chOf(raw[i - 1].get(en, exams), cs[0]) : null) : h ? chOf(r.get(en, early), r.get(en, late)) : null,
    };
  }).filter((x) => x.row.vals[0] != null);
  const fAll = fmtFor(m, items.map((x) => x.row), share), show = fAll.show, dg = fAll.dig;

  /* ---- Sıralama ---- */
  const sDef: Sort = b === 'deneme' ? 'sira' : 'kotu';
  const s = SORTS.includes(q.get('s') as Sort) ? (q.get('s') as Sort) : sDef;
  const fv = (x: Item) => (x.row.fill ?? x.row.vals)[0];
  const cmp = (a: number | null, z: number | null, dir: number) => (a == null ? (z == null ? 0 : 1) : z == null ? -1 : (a - z) * dir);
  const sorted = s === 'sira' ? items : [...items].sort((a, z) => (s === 'artan' ? cmp(a.ch, z.ch, -1) : s === 'azalan' ? cmp(a.ch, z.ch, 1) : cmp(fv(a), fv(z), (s === 'kotu') === M.up ? 1 : -1)));
  const SNAME: Record<Sort, string> = {
    kotu: M.up ? 'En zayıf üstte' : `En çok ${M.short} üstte`, iyi: M.up ? 'En iyi üstte' : `En az ${M.short} üstte`,
    artan: 'En çok artan üstte', azalan: 'En çok azalan üstte', sira: b === 'deneme' ? 'Tarih sırasıyla' : 'Olduğu sırayla',
  };

  /* ---- Özet kutuları ---- */
  const byV = items.filter((x) => fv(x) != null).sort((a, z) => (fv(a)! - fv(z)!) * (M.up ? -1 : 1));
  const best = byV[0], worst = byV.length > 1 ? byV[byV.length - 1] : undefined;
  const byC = items.filter((x) => x.ch != null && fmt(Math.abs(x.ch), dg) !== fmt(0, dg)).sort((a, z) => z.ch! - a.ch!);
  const inc = byC[0]?.ch! > 0 ? byC[0] : undefined, dec = byC.length && byC[byC.length - 1].ch! < 0 ? byC[byC.length - 1] : undefined;
  const chNote = b === 'deneme' ? 'bir önceki denemeye göre' : h ? `son ${h} deneme, ilk ${h} denemeye göre` : '';
  const valSub = (x: Item) => <span><b>{show(x.row.vals[0])}</b>{unit}{m !== 'pct' && x.row.pct?.[0] != null && `, soruların ${fpct(x.row.pct[0])} kadarı doğru`}</span>;
  const moveTile = (x: Item | undefined, up: boolean) => (
    <NameTile label={up ? 'En çok artan' : 'En çok azalan'} icon={up ? <TrendingUp size={17} /> : <TrendingDown size={17} />}
      tone={x ? (better(x.ch!, m) > 0 ? 'good' : 'bad') : ''} name={x ? x.label : up ? 'Artan yok' : 'Azalan yok'}
      sub={x ? <><Delta v={x.ch} m={m} dig={dg} />{chNote}</> : chNote ? `${M.name}, ${chNote}` : 'Değişim için en az 2 deneme seçin'} />
  );

  /* ---- Denemeden denemeye ---- */
  const zs: TView[] = ['tablo', 'cizgi', 'ilkson', 'sutun'];
  const z = zs.includes(q.get('z') as TView) ? (q.get('z') as TView) : 'tablo';
  const matrix = b !== 'deneme' && exams.length > 1;
  const LIM = 15, cut = sorted.length > LIM, shown = cut && !all ? sorted.slice(0, LIM) : sorted;
  const mrow = (x: Item) => mkRow(x.key, x.name, x.label, exams.map(x.at), m, share);
  const mrows = matrix ? shown.map(mrow) : [], fm = fmtFor(m, mrows, share);
  const top = mrows.slice(0, 6), exl = exams.map((e) => EXL[e]);

  /* ---- Ayrıntı tablosu ---- */
  const per = (x: Item, k: 'd' | 'y' | 'b') => (x.c ? (100 * x.c[k]) / x.c.n : null);
  const cols: Col<Item>[] = [
    { id: 'ad', head: B.head, cell: (x) => x.label, val: (x) => x.name },
    { id: 'n', head: 'Soru', right: true, cell: (x) => fmt(x.c ? x.c.n / x.c.k : null, 1), val: (x) => (x.c ? x.c.n / x.c.k : null) },
    { id: 'net', head: 'Net', right: true, cell: (x) => fmt(mval(x.c, 'net'), dg), val: (x) => mval(x.c, 'net') },
    { id: 'd', head: 'Doğru', right: true, cell: (x) => fmt(mval(x.c, 'd'), dg), val: (x) => mval(x.c, 'd') },
    { id: 'y', head: 'Yanlış', right: true, cell: (x) => fmt(mval(x.c, 'y'), dg), val: (x) => mval(x.c, 'y') },
    { id: 'b', head: 'Boş', right: true, cell: (x) => fmt(mval(x.c, 'b'), dg), val: (x) => mval(x.c, 'b') },
    { id: 'pd', head: 'Doğru oranı', cell: (x) => <PctBar p={per(x, 'd')} />, val: (x) => per(x, 'd') },
    { id: 'py', head: 'Yanlış oranı', right: true, cell: (x) => fpct(per(x, 'y')), val: (x) => per(x, 'y') },
    { id: 'pb', head: 'Boş oranı', right: true, cell: (x) => fpct(per(x, 'b')), val: (x) => per(x, 'b') },
    { id: 'ch', head: `Değişim (${M.short})`, right: true, cell: (x) => <Delta v={x.ch} m={m} dig={dg} />, val: (x) => x.ch },
  ];

  const path: Scope[] = [];
  for (let x: Scope | null = sc; x; x = scopeParent(x)) path.unshift(x);

  return (
    <>
      <Card className="no-print" style={{ marginBottom: 16, padding: '16px 18px' }}>
        <div className="ctls">
          <Ctl label="Hangi ders ya da konu"><ScopePicker label="Seçili" value={sc} onChange={(x) => q.put({ n: x, b: null, m: null })} /></Ctl>
          <Ctl label="Neye göre dökülsün"><Seg id="xb" value={b} onChange={(x) => q.put({ b: x === bDef ? null : x, s: null, m: null })} options={brks.map((id) => ({ id, label: BRK[id].many }))} /></Ctl>
          <Ctl label="Hangi sayıya bakılsın"><MetricSeg id="xm" value={m} onChange={(x) => q.put({ m: x })} /></Ctl>
          <Ctl label="Hangi denemeler"><ExamPick q={q} id="xr" /></Ctl>
          <Ctl label="Sıralama"><Sel label="Sıralama" value={s} onChange={(x) => q.put({ s: x === sDef ? null : x })} options={SORTS.map((id) => ({ id, label: SNAME[id] }))} /></Ctl>
          {bases.length > 0 && !isEnt && (
            <Ctl label="Yanına koy"><Sel label="Yanına koy" value={ky} onChange={(x) => q.put({ ky: x || null, g: null })} options={[{ id: '', label: 'Kıyas yok' }, ...bases.map((e) => ({ id: e, label: entName(e) }))]} /></Ctl>
          )}
        </div>
      </Card>

      <div className="xpath">
        <span>{entName(en)}</span>
        {path.map((p) => (
          <Fragment key={p}>
            <ChevronRight size={15} />
            {p === sc ? <b>{scopeName(p)}</b> : <button className="lnk" onClick={() => q.put({ n: p, b: null })}>{scopeName(p)}</button>}
          </Fragment>
        ))}
        <ChevronRight size={15} /><span>{B.many}, {M.name.toLocaleLowerCase('tr')}, {sel.label}</span>
      </div>

      {!items.length ? <Card><Empty0 /></Card> : (
        <>
          <div className="tiles">
            <NameTile label={M.up ? `En iyi ${B.one}` : `En az ${M.short}`} tone="good" icon={<ThumbsUp size={17} />} name={best.label} sub={valSub(best)} />
            {worst
              ? <NameTile label={M.up ? `En zayıf ${B.one}` : `En çok ${M.short}`} tone="bad" icon={<TriangleAlert size={17} />} name={worst.label} sub={valSub(worst)} />
              : <NameTile label={M.up ? `En zayıf ${B.one}` : `En çok ${M.short}`} name="Tek satır var" />}
            {moveTile(inc, true)}
            {moveTile(dec, false)}
          </div>

          <div className="stack">
            <CmpCard title={`${B.many}: ${SNAME[s].toLocaleLowerCase('tr')}`}
              hint={<>{scopeFull(sc)}, {M.name.toLocaleLowerCase('tr')}, {sel.label} ortalaması.{content.includes(b) && b !== 'konu' && ` ${B.head} adına tıklayınca içi açılır.`}</>}
              rows={sorted.map((x) => x.row)} names={names} colors={colors} f={fAll}
              head={B.head} noun={B.one} at={B.at} limit={LIM} def={ky ? 'karsi' : 'cubuk'}
              view={(q.get('g') as View) || null} onView={(x) => q.put({ g: x })}
              onPick={content.includes(b) ? drill : undefined} />

            {matrix && (
              <Card className="cmp-card" title="Denemeden denemeye" hint={`Her ${B.one} için ${M.name.toLocaleLowerCase('tr')}, deneme deneme. Boş kutu, o denemede soru çıkmadığını gösterir.`}>
                <ViewSeg value={z} onChange={(x) => q.put({ z: x === 'tablo' ? null : x })} views={zs} />
                {z === 'tablo' ? (
                  <>
                    <HeatTable rows={mrows} names={exl} colors={[]} f={fm} head={B.head} />
                    <div className="row wrap" style={{ marginTop: 12, gap: '6px 20px' }}>
                      {fm.heat === 'lv' ? <LevelLegend /> : <span className="sm dim">Kutu koyulaştıkça {fm.heat === 'bad' ? 'yanlış' : 'boş'} artar.</span>}
                      <span className="sm dim">Çerçeveli kutu, satırın en iyi denemesidir.</span>
                    </div>
                  </>
                ) : z === 'ilkson' ? (
                  <>
                    <div className="legend" style={{ marginBottom: 8 }}>
                      <span><i className="db-lg a" />İlk deneme</span><span><i className="db-lg" />Son deneme</span>
                    </div>
                    <Dumbbell show={fm.show} rows={mrows.map((r) => {
                      const v = r.vals.filter(some), a = v.length > 1 ? v[0] : null, z2 = v[v.length - 1] ?? null;
                      return { key: r.key, label: r.label, color: 'var(--accent)', a, b: z2, right: <Delta v={a != null && z2 != null ? z2 - a : null} m={m} dig={fm.dig} /> };
                    })} />
                  </>
                ) : (
                  <>
                    <div style={{ marginBottom: 10 }}><Legend items={top.map((r, i) => ({ name: r.name, color: SERIES[i], line: z === 'cizgi' }))} /></div>
                    {z === 'cizgi'
                      ? <LineChart legend={false} series={top.map((r, i) => ({ name: r.name, color: SERIES[i], values: r.vals }))} labels={exl} titles={exams.map((e) => EXT[e])} dig={fm.dig} height={300} />
                      : <Columns names={top.map((r) => r.name)} colors={top.map((_, i) => SERIES[i])} f={{ ...fm, top: m === 'pct' ? 100 : Math.max(1e-9, ...top.flatMap((r) => r.vals.map((v) => v ?? 0))) * 1.08, axis: true }}
                        rows={exams.map((e, j) => ({ key: `${e}`, name: EXL[e], label: EXL[e], vals: top.map((r) => r.vals[j]), pct: top.map((r) => r.pct?.[j] ?? null) }))} />}
                    {mrows.length > top.length && <p className="sm dim" style={{ margin: '10px 0 0' }}>Sıralamadaki ilk {top.length} {B.one} çizilir. Başkalarını görmek için sıralamayı değiştirin ya da tabloya geçin.</p>}
                  </>
                )}
                {cut && (z === 'tablo' || z === 'ilkson') && (
                  <div className="no-print" style={{ marginTop: 12 }}>
                    <button className="btn ghost" onClick={() => setAll(!all)}>{all ? 'Daralt' : `Tümünü göster (${sorted.length} ${B.one})`}</button>
                  </div>
                )}
              </Card>
            )}

            <Card flush title="Bütün sayılar" hint="Deneme başına ortalama. Başlığa tıklayarak istediğiniz sütuna göre sıralayın.">
              <DataTable cols={cols} rows={sorted} rowKey={(x) => x.key} csv="incele" limit={25} />
            </Card>
          </div>
        </>
      )}
    </>
  );
}
function Empty0() {
  return <div className="empty"><b>Bu seçimde gösterilecek veri yok</b>Seçilen denemelerde bu ders ya da konudan soru çıkmamış olabilir. Başka denemeler ya da daha geniş bir kapsam seçin.</div>;
}

export default function Explore() {
  const st = useStore(), q = useQuery();
  const root = rootEnt(st.level), en: Ent = validEnt(q.get('kim')) ? q.get('kim') : root;
  return (
    <Page title="İncele" sub="Kimi inceleyeceğinizi seçin; ders, konu, sınıf ya da deneme deneme dökümünü, istediğiniz sayıya göre görün."
      actions={<EntField value={en} onChange={(e) => q.put({ kim: e === root ? null : e, n: null, b: null, ky: null, g: null })} kinds={['top', 'class', 'teacher', 'student']} />}>
      <Explorer key={en} en={en} />
    </Page>
  );
}
