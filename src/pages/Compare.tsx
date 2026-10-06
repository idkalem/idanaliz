import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, Bookmark, Users, ClipboardList } from 'lucide-react';
import {
  ds, NE, PRES, METRICS, METRIC_IDS, agg, cnt, mval, rank, members, entName, entKind, entI, entScope, scopeFull, scopeName, scopeN, scopeTopics, classesOf, rootEnt, defMetric,
  type Cnt, type Ent, type Metric, type Scope,
} from '../engine/core';
import { qStats, natPct, ALL, baseOf } from '../engine/analysis';
import { fmt, pct as fpct, date } from '../engine/fmt';
import { useStore, saveView, delView } from '../store';
import { Page, Card, Seg, ScopePicker, EntPicker, EntField, EntLink, Delta, Pop, Empty, Tile, useQuery, LV_LO, LV_HI } from '../ui';
import { SERIES, MAX_SERIES } from '../charts';
import {
  CmpCard, TimeCard, FeatTable, ExamPick, MetricSeg, Ctl, examSel, timeSer, mkRow, fmtFor, showM, kidKinds, kidScopes, scColor, okScope, validEnt, BRK, EXL, EXT,
  type Brk, type FeatRow, type TView, type View,
} from '../board';

const some = (v: number | null | undefined): v is number => v != null;
const ok = (c: Cnt | null) => (c && c.n ? c : null);
const f1 = (v: number | null) => fmt(v, 1), f0 = (v: number | null) => fmt(v, 0);
/** Seçili ölçünün, özellikler tablosunda satır satır yazılacak alt kırılımları: testler, dersler ve (çok değilse) konular. */
function kidGroups(sc: Scope): { b: Brk; kids: Scope[] }[] {
  return kidKinds(sc).map((b) => ({ b, kids: kidScopes(sc, b) })).filter((g) => g.b !== 'konu' || g.kids.length <= 24);
}
const GEN: { m: Metric; name: string }[] = [
  { m: 'net', name: 'Net' }, { m: 'pct', name: 'Doğru oranı (%)' }, { m: 'd', name: 'Doğru sayısı' }, { m: 'y', name: 'Yanlış sayısı' }, { m: 'b', name: 'Boş sayısı' },
];
/** Bir deneme kümesinde katılım oranı (%). */
function attend(en: Ent, exams: number[]): number | null {
  const mem = members(en);
  if (!mem.length || !exams.length) return null;
  let p = 0;
  for (const e of exams) for (const s of mem) p += PRES[e][s];
  return (100 * p) / (mem.length * exams.length);
}

/* ================= Sınıflar ve kişiler ================= */
function People() {
  const st = useStore(), q = useQuery();
  const def = useMemo(() => classesOf(rootEnt(st.level)).slice(0, 2).map((c) => `c:${c}`), [st.level]);
  const ents: Ent[] = q.get('k') ? q.get('k').split(',').filter(validEnt) : def;
  const sc: Scope = okScope(q.get('n')) ? q.get('n') : 'all';
  const m: Metric = METRIC_IDS.includes(q.get('m') as Metric) ? (q.get('m') as Metric) : defMetric(sc);
  const sel = examSel(q), exams = sel.exams;
  const M = METRICS[m], many = ents.length > 1, show = showM(m), unit = m === 'pct' ? '' : M.unit.trim();
  const setEnts = (list: Ent[]) => q.put({ k: list.join(',') });
  const colors = ents.map((_, i) => SERIES[i % MAX_SERIES]);
  const ser = ents.map((en, i) => timeSer(en, sc, m, colors[i], exams));
  const names = ents.map(entName);

  /* ---- Kim önde: seçili denemelerin ortalaması ---- */
  interface Row { en: Ent; color: string; c: Cnt | null; avg: number | null; first: number | null; last: number | null; best: number | null; worst: number | null }
  const rows: Row[] = ser.map((s, i) => {
    const v = s.values.filter(some), c = ok(agg(ents[i], exams, sc));
    const pick = M.up ? Math.max : Math.min, anti = M.up ? Math.min : Math.max;
    return { en: ents[i], color: s.color, c, avg: mval(c, m), first: v[0] ?? null, last: v[v.length - 1] ?? null, best: v.length ? pick(...v) : null, worst: v.length ? anti(...v) : null };
  });
  const ranked = [...rows].sort((a, b) => (a.avg == null ? 1 : b.avg == null ? -1 : M.up ? b.avg - a.avg : a.avg - b.avg));
  const top = ranked[0]?.avg ?? null, peak = Math.max(1e-9, ...rows.map((x) => x.avg ?? 0));
  const place = (x: Row, i: number) => {
    const tie = ranked[1]?.avg != null && top != null && fmt(Math.abs(ranked[1].avg - top), M.dig) === fmt(0, M.dig);
    if (i === 0) return tie ? <span className="tag">Başa baş</span> : <span className="tag good">{M.up ? 'Önde' : `En az ${M.short}`}</span>;
    if (x.avg == null || top == null) return <span className="tag">Veri yok</span>;
    const gap = fmt(Math.abs(x.avg - top), M.dig);
    return <span className="tag">{gap === fmt(0, M.dig) ? 'Başa baş' : `${gap}${M.unit} ${M.up ? 'geride' : 'fazla'}`}</span>;
  };
  const who = (x: Row) => <span className="row" style={{ gap: 8 }}><i className="cmp-sq" style={{ background: x.color }} /><EntLink en={x.en} sub={entKind(x.en) === 'student' || entKind(x.en) === 'teacher'} /></span>;

  /* ---- Hangi derste / konuda kim önde ---- */
  const kinds = kidKinds(sc), bDef: Brk | undefined = kinds.includes('ders') ? 'ders' : kinds[0];
  const b = kinds.includes(q.get('b') as Brk) ? (q.get('b') as Brk) : bDef, B = b ? BRK[b] : null;
  const drill = (k: Scope) => q.put({ n: k, b: null, m: null });
  const base = b ? kidScopes(sc, b).map((k) => mkRow(k, scopeName(k), <button className="lnk" title={scopeFull(k)} onClick={() => drill(k)}>{scopeName(k)}</button>, ents.map((en) => agg(en, exams, k)), m, true, b === 'konu' ? undefined : scColor(k)))
    .filter((r) => r.vals.some(some)) : [];

  /* ---- Özellikler: satırlar özellik, sütunlar karşılaştırılanlar ---- */
  const feats: FeatRow[] = [
    ...GEN.map((g) => ({ key: `g-${g.m}`, name: g.name, group: 'Seçili denemelerin ortalaması', vals: rows.map((x) => mval(x.c, g.m)), show: g.m === 'pct' ? f0 : f1, dig: g.m === 'pct' ? 0 : 1, up: METRICS[g.m].up })),
    ...kidGroups(sc).flatMap((g) => g.kids.map((k) => ({
      key: `k-${k}`, name: scopeName(k), group: `${BRK[g.b].many}: ${M.name.toLocaleLowerCase('tr')}`, vals: ents.map((en) => mval(ok(agg(en, exams, k)), m)), show: m === 'pct' ? f0 : f1, dig: M.dig, up: M.up,
      label: <button className="lnk" onClick={() => drill(k)}>{scopeName(k)}</button>,
    })).filter((r) => r.vals.some(some))),
    ...(exams.length > 1 ? [
      { key: 't-first', name: `İlk deneme (${EXL[exams[0]]})`, vals: rows.map((x) => x.first), up: M.up },
      { key: 't-last', name: `Son deneme (${EXL[exams[exams.length - 1]]})`, vals: rows.map((x) => x.last), up: M.up },
      { key: 't-ch', name: 'İlkten sona değişim', vals: rows.map((x) => (x.first != null && x.last != null ? x.last - x.first : null)), up: M.up },
      { key: 't-best', name: 'En iyi denemesi', vals: rows.map((x) => x.best), up: M.up },
      { key: 't-worst', name: 'En kötü denemesi', vals: rows.map((x) => x.worst), up: M.up },
      { key: 't-osc', name: 'En iyi ile en kötü arası', vals: rows.map((x) => (x.best != null && x.worst != null ? Math.abs(x.best - x.worst) : null)), up: false },
    ].map((r) => ({ ...r, group: `Denemeden denemeye: ${M.name.toLocaleLowerCase('tr')}`, show: m === 'pct' ? f0 : f1, dig: M.dig })) : []),
    { key: 'p-n', name: 'Öğrenci sayısı', group: 'Kişiler', vals: ents.map((en) => members(en).length), show: f0, dig: 0 },
    { key: 'p-att', name: 'Katılım oranı (%)', group: 'Kişiler', vals: ents.map((en) => attend(en, exams)), show: f0, dig: 0, up: true },
  ];

  return (
    <>
      <Card className="no-print" style={{ marginBottom: 16, padding: '16px 18px' }}>
        <div className="ctls">
          <Ctl label="Kimler karşılaştırılsın">
            <div className="row wrap" style={{ gap: 6 }}>
              {ents.map((en, i) => (
                <span key={en} className="chip"><i style={{ background: colors[i] }} />{entName(en)}<button aria-label={`${entName(en)} çıkar`} onClick={() => setEnts(ents.filter((x) => x !== en))}><X size={12} /></button></span>
              ))}
              {ents.length < MAX_SERIES
                ? <EntPicker keepOpen value={ents} kinds={['top', 'class', 'teacher', 'student']} onPick={(e) => setEnts(ents.includes(e) ? ents.filter((x) => x !== e) : ents.length < MAX_SERIES ? [...ents, e] : ents)} button={<button className="btn"><Plus size={15} />Ekle</button>} />
                : <span className="sm dim">En çok {MAX_SERIES} kişi ya da grup.</span>}
            </div>
          </Ctl>
          <Ctl label="Hangi ders ya da konu"><ScopePicker label="Seçili" value={sc} onChange={(s) => q.put({ n: s === 'all' ? null : s, m: null, b: null })} /></Ctl>
          <Ctl label="Hangi sayıya bakılsın"><MetricSeg id="cm" value={m} onChange={(x) => q.put({ m: x })} /></Ctl>
          <Ctl label="Hangi denemeler"><ExamPick q={q} id="cr" /></Ctl>
        </div>
      </Card>

      {!ents.length ? <Card><Empty title="Karşılaştırılacak kimse seçilmedi">Yukarıdaki Ekle düğmesiyle sınıf, öğrenci ya da öğretmen seçin.</Empty></Card> : (
        <>
          <p className="cmp-what">{scopeFull(sc)}: {sel.label}, {M.name.toLocaleLowerCase('tr')} ortalaması</p>
          {!many ? (
            <div className="tiles">
              <Tile label={<span className="row" style={{ gap: 9 }}><i className="cmp-sq" style={{ background: rows[0].color }} /><EntLink en={rows[0].en} /></span>} unit={unit} sub="Seçili denemelerin ortalaması">{show(rows[0].avg)}</Tile>
              <Tile label="Son deneme" unit={unit} sub={<><Delta v={rows[0].first != null && rows[0].last != null ? rows[0].last - rows[0].first : null} m={m} />ilk denemeye göre</>}>{show(rows[0].last)}</Tile>
              <Tile label="En iyi denemesi" unit={unit}>{show(rows[0].best)}</Tile>
              <Tile label="En kötü denemesi" unit={unit}>{show(rows[0].worst)}</Tile>
            </div>
          ) : ents.length <= 4 ? (
            <div className={`tiles n${ents.length}`}>
              {ranked.map((x, i) => (
                <div className="tile" key={x.en}>
                  <div className="t-l"><i className="cmp-sq" style={{ background: x.color }} /><EntLink en={x.en} /></div>
                  <div className="t-v">{show(x.avg)}{unit && <small>{unit}</small>}</div>
                  <div className="t-s">{place(x, i)}{i + 1}. sırada</div>
                </div>
              ))}
            </div>
          ) : (
            <Card title={M.up ? 'Kim önde?' : `En az ${M.short} kimde?`} style={{ marginBottom: 16 }}>
              {ranked.map((x, i) => (
                <div className="rk-row" key={x.en}>
                  <span className="dim">{i + 1}.</span>
                  <span className="clip">{who(x)}</span>
                  <div className="trk"><i style={{ background: x.color, width: `${Math.max(0, ((x.avg ?? 0) / peak) * 100).toFixed(2)}%` }} /></div>
                  <b className="right" style={{ fontVariantNumeric: 'tabular-nums' }}>{show(x.avg)}</b>
                  <span>{place(x, i)}</span>
                </div>
              ))}
            </Card>
          )}

          <div className="stack">
            {b && B && base.length > 0 && (
              <CmpCard title={!many ? B.many : M.up ? `Hangi ${B.at} kim önde?` : `Hangi ${B.at} kim daha az ${M.short} yaptı?`}
                hint={<>{M.name}, {sel.label} ortalaması.{b !== 'konu' && ` ${B.head} adına tıklayınca içi açılır.`}{sc !== 'all' && <> <button className="lnk" onClick={() => q.put({ n: null, m: null, b: null })}>Tüm derslere dön</button></>}</>}
                extra={kinds.length > 1 && <div className="no-print"><Seg id="cb" value={b} onChange={(x) => q.put({ b: x === bDef ? null : x })} options={kinds.map((id) => ({ id, label: BRK[id].many }))} /></div>}
                rows={base} names={names} colors={colors} f={fmtFor(m, base, true)} head={B.head} noun={B.one} at={B.at} limit={15} sorted
                view={(q.get('g') as View) || null} onView={(x) => q.put({ g: x })} onPick={drill} />
            )}

            {exams.length > 1 && (
              <TimeCard title="Denemeden denemeye" series={ser} m={m} exams={exams} height={300} strip
                hint={`${scopeFull(sc)}, ${M.name.toLocaleLowerCase('tr')}; ${sel.label}.${sc[0] === 'k' && m !== 'pct' ? ' Konuda soru sayısı denemeden denemeye değişir; doğru oranı daha güvenilir bir ölçüdür.' : ''}`}
                view={(q.get('z') as TView) || null} onView={(x) => q.put({ z: x === 'cizgi' ? null : x })} />
            )}

            <Card flush title="Özellikler" hint="Özellikler alt alta, karşılaştırılanlar yan yana.">
              <FeatTable diff="fark" csv="karsilastirma" cols={rows.map((x) => ({ name: entName(x.en), color: x.color }))} rows={feats.filter((r) => r.vals.some(some))} />
            </Card>
          </div>
        </>
      )}
    </>
  );
}

/* ================= Denemeler ================= */
function ExamCmp() {
  const st = useStore(), q = useQuery();
  const root = rootEnt(st.level), en: Ent = validEnt(q.get('kim')) ? q.get('kim') : root, kind = entKind(en);
  const sc: Scope = okScope(q.get('n')) ? q.get('n') : entScope(en);
  const m: Metric = METRIC_IDS.includes(q.get('m') as Metric) ? (q.get('m') as Metric) : defMetric(sc);
  const sel = examSel(q, '3'), exams = sel.exams, n = exams.length;
  const M = METRICS[m], show = showM(m), unit = m === 'pct' ? '' : M.unit.trim();
  // Az denemede her denemeye ayrı renk; sekizden çoksa açıktan koyuya tek renk (koyu = daha yeni).
  const colors = n <= MAX_SERIES ? exams.map((_, i) => SERIES[i]) : exams.map((_, i) => `color-mix(in oklab, var(--accent) ${Math.round(26 + (74 * i) / (n - 1))}%, var(--surface))`);
  const names = exams.map((e) => EXL[e]);
  const cs = exams.map((e) => ok(cnt(en, e, sc))), vals = cs.map((c) => mval(c, m));
  const mem = members(en);

  /* ---- Hangi deneme önde ---- */
  const order = exams.map((e, i) => ({ e, i, v: vals[i] })).sort((a, b) => (a.v == null ? 1 : b.v == null ? -1 : M.up ? b.v - a.v : a.v - b.v));
  const peak = Math.max(1e-9, ...vals.map((v) => v ?? 0));
  const exLink = (e: number, i: number) => <span className="row" style={{ gap: 8 }}><i className="cmp-sq" style={{ background: colors[i] }} /><Link className="lnk" to={`/deneme/${ds.exams[e].id}`}>{ds.exams[e].name}</Link></span>;

  /* ---- Kırılım: ders, konu, sınıf, öğrenci ---- */
  const content = kidKinds(sc), group: Brk[] = kind === 'class' ? ['ogrenci'] : kind === 'student' ? [] : ['sinif'];
  const kinds: Brk[] = [...content, ...group], bDef: Brk | undefined = content.includes('ders') ? 'ders' : kinds[0];
  const b = kinds.includes(q.get('b') as Brk) ? (q.get('b') as Brk) : bDef, B = b ? BRK[b] : null;
  const drill = (k: Scope) => q.put({ n: k, b: null, m: null });
  const base = !b ? []
    : b === 'sinif' ? classesOf(en).map((c) => mkRow(`c:${c}`, ds.classes[c].name, <EntLink en={`c:${c}`} />, exams.map((e) => cnt(`c:${c}`, e, sc)), m, false))
    : b === 'ogrenci' ? mem.map((s) => mkRow(`s:${s}`, ds.students[s].name, <EntLink en={`s:${s}`} />, exams.map((e) => cnt(`s:${s}`, e, sc)), m, false))
    : kidScopes(sc, b).map((k) => mkRow(k, scopeName(k), <button className="lnk" title={scopeFull(k)} onClick={() => drill(k)}>{scopeName(k)}</button>, exams.map((e) => cnt(en, e, k)), m, true, b === 'konu' ? undefined : scColor(k)));
  const rowsB = base.filter((r) => r.vals.some(some)), share = !!b && content.includes(b);

  /* ---- Özellikler: satırlar özellik, sütunlar denemeler ---- */
  const inScope = new Set(scopeTopics(sc));
  const qs = exams.map((e) => (kind === 'student' ? [] : qStats(e, en).filter((x) => inScope.has(ds.exams[e].q[x.i].topic))));
  const nets = exams.map((e) => (kind === 'student' ? [] : mem.filter((s) => PRES[e][s]).map((s) => mval(ok(cnt(`s:${s}`, e, sc)), 'net')).filter(some)));
  const stu = kind === 'student' ? entI(en) : -1, cls = stu >= 0 ? ds.students[stu].cls : -1;
  const netAll = exams.map((e) => mval(cnt(en, e, 'all'), 'net'));
  const G1 = 'Genel', G3 = 'Katılım', G4 = 'Türkiye geneli (toplam net)', G5 = 'Öğrenciler', G6 = 'Sorular', G7 = 'Sıralama';
  const feats: FeatRow[] = [
    { key: 'g-n', name: 'Soru sayısı', group: G1, vals: exams.map((e) => scopeN(sc, e)), show: f0, dig: 0 },
    ...GEN.map((g) => ({ key: `g-${g.m}`, name: g.name, group: G1, vals: cs.map((c) => mval(c, g.m)), show: g.m === 'pct' ? f0 : f1, dig: g.m === 'pct' ? 0 : 1, up: METRICS[g.m].up })),
    ...kidGroups(sc).flatMap((g) => g.kids.map((k) => ({
      key: `k-${k}`, name: scopeName(k), group: `${BRK[g.b].many}: ${M.name.toLocaleLowerCase('tr')}`, vals: exams.map((e) => mval(ok(cnt(en, e, k)), m)), show: m === 'pct' ? f0 : f1, dig: M.dig, up: M.up,
      label: <button className="lnk" onClick={() => drill(k)}>{scopeName(k)}</button>,
    })).filter((r) => r.vals.some(some))),
    ...(kind === 'student' ? [] : [
      { key: 'a-n', name: 'Giren öğrenci', group: G3, vals: exams.map((e) => mem.filter((s) => PRES[e][s]).length), show: f0, dig: 0, up: true },
      { key: 'a-p', name: 'Katılım oranı (%)', group: G3, vals: exams.map((e) => attend(en, [e])), show: f0, dig: 0, up: true },
    ]),
    ...(kind === 'teacher' ? [] : [
      { key: 'n-en', name: `${entName(en)}`, group: G4, vals: netAll, show: f1, dig: 1, up: true },
      { key: 'n-tr', name: 'Türkiye ortalaması', group: G4, vals: exams.map((e) => ds.exams[e].nat.mean), show: f1, dig: 1 },
      { key: 'n-df', name: 'Türkiye ortalamasından fark', group: G4, vals: exams.map((e, i) => (netAll[i] == null ? null : netAll[i]! - ds.exams[e].nat.mean)), show: f1, dig: 1, up: true },
      { key: 'n-pc', name: 'Türkiye genelinde geride bıraktığı (%)', group: G4, vals: exams.map((e, i) => (netAll[i] == null ? null : natPct(e, netAll[i]!))), show: f0, dig: 0, up: true },
    ]),
    ...(kind === 'student' ? [
      { key: 'r-c', name: `Sınıf sırası (${ds.classes[cls].name})`, group: G7, vals: exams.map((e) => rank(stu, e, `c:${cls}`)?.r ?? null), show: f0, dig: 0, up: false },
      { key: 'r-l', name: `${ds.classes[cls].level}. sınıflar içinde sırası`, group: G7, vals: exams.map((e) => rank(stu, e, `l:${ds.classes[cls].level}`)?.r ?? null), show: f0, dig: 0, up: false },
      { key: 'r-o', name: 'Okul sırası', group: G7, vals: exams.map((e) => rank(stu, e, 'o')?.r ?? null), show: f0, dig: 0, up: false },
    ] : [
      { key: 's-hi', name: 'En yüksek net', group: G5, vals: nets.map((v) => (v.length ? Math.max(...v) : null)), show: f1, dig: 1, up: true },
      { key: 's-lo', name: 'En düşük net', group: G5, vals: nets.map((v) => (v.length ? Math.min(...v) : null)), show: f1, dig: 1, up: true },
      { key: 's-gap', name: 'En yüksek ile en düşük arası', group: G5, vals: nets.map((v) => (v.length ? Math.max(...v) - Math.min(...v) : null)), show: f1, dig: 1, up: false },
      { key: 'q-hard', name: `Zor gelen soru (doğru oranı %${LV_LO} altı)`, group: G6, vals: qs.map((l) => (l.length ? l.filter((x) => x.p * 100 < LV_LO).length : null)), show: f0, dig: 0, up: false },
      { key: 'q-easy', name: `Kolay gelen soru (doğru oranı %${LV_HI} ve üstü)`, group: G6, vals: qs.map((l) => (l.length ? l.filter((x) => x.p * 100 >= LV_HI).length : null)), show: f0, dig: 0, up: true },
      { key: 'q-blank', name: 'En çok boş bırakılan sorunun boş oranı (%)', group: G6, vals: qs.map((l) => (l.length ? 100 * Math.max(...l.map((x) => x.blank)) : null)), show: f0, dig: 0, up: false },
    ]),
  ];

  return (
    <>
      <Card className="no-print" style={{ marginBottom: 16, padding: '16px 18px' }}>
        <div className="ctls">
          <Ctl label="Kimin sonuçları"><EntField label="Seçili" value={en} onChange={(e) => q.put({ kim: e === root ? null : e, n: null, b: null })} kinds={['top', 'class', 'teacher', 'student']} /></Ctl>
          <Ctl label="Hangi denemeler"><ExamPick q={q} id="er" defR="3" /></Ctl>
          <Ctl label="Hangi ders ya da konu"><ScopePicker label="Seçili" value={sc} onChange={(s) => q.put({ n: s, m: null, b: null })} /></Ctl>
          <Ctl label="Hangi sayıya bakılsın"><MetricSeg id="em" value={m} onChange={(x) => q.put({ m: x })} /></Ctl>
        </div>
      </Card>

      <p className="cmp-what">{entName(en)}, {scopeFull(sc)}: {M.name.toLocaleLowerCase('tr')}, {sel.label}</p>
      {n <= 4 ? (
        <div className={`tiles n${Math.max(2, n)}`}>
          {exams.map((e, i) => (
            <div className="tile" key={e}>
              <div className="t-l">{exLink(e, i)}</div>
              <div className="t-v">{show(vals[i])}{unit && <small>{unit}</small>}</div>
              <div className="t-s">{i > 0 ? <><Delta v={vals[i] != null && vals[i - 1] != null ? vals[i]! - vals[i - 1]! : null} m={m} />{names[i - 1]} denemesine göre</> : date(ds.exams[e].date)}</div>
            </div>
          ))}
        </div>
      ) : (
        <Card title={M.up ? 'En iyi deneme hangisi?' : `En az ${M.short} hangi denemede?`} style={{ marginBottom: 16 }}>
          {order.map((x, j) => (
            <div className="rk-row" key={x.e}>
              <span className="dim">{j + 1}.</span>
              <span className="clip">{exLink(x.e, x.i)}</span>
              <div className="trk"><i style={{ background: colors[x.i], width: `${Math.max(0, ((x.v ?? 0) / peak) * 100).toFixed(2)}%` }} /></div>
              <b className="right" style={{ fontVariantNumeric: 'tabular-nums' }}>{show(x.v)}</b>
              <span className="dim sm">{date(ds.exams[x.e].date)}</span>
            </div>
          ))}
        </Card>
      )}

      <div className="stack">
        <Card flush title="Özellikler" hint="Özellikler alt alta, denemeler yan yana. Son sütun, ilk seçilen denemeden son seçilene değişimi gösterir.">
          <FeatTable diff="degisim" csv="deneme-karsilastirma" cols={exams.map((e, i) => ({ name: EXL[e], sub: date(ds.exams[e].date), color: colors[i] }))} rows={feats.filter((r) => r.vals.some(some))} />
        </Card>

        {b && B && rowsB.length > 0 && (
          <CmpCard title={`${B.many}, deneme deneme`}
            hint={<>{M.name}. Denemeler arasında en çok değişen {B.one} üstte.{content.includes(b) && b !== 'konu' && ` ${B.head} adına tıklayınca içi açılır.`}</>}
            extra={kinds.length > 1 && <div className="no-print"><Seg id="eb" value={b} onChange={(x) => q.put({ b: x === bDef ? null : x })} options={kinds.map((id) => ({ id, label: BRK[id].many }))} /></div>}
            rows={rowsB} names={names} colors={colors} f={fmtFor(m, rowsB, share)} head={B.head} noun={B.one} at={B.at} limit={15} sorted
            view={(q.get('g') as View) || null} onView={(x) => q.put({ g: x })} onPick={content.includes(b) ? drill : undefined} />
        )}

        <TimeCard title="Bütün denemeler" hint={`${entName(en)}, ${scopeFull(sc)}: ${M.name.toLocaleLowerCase('tr')}. Seçtiğiniz denemeleri diğerlerinin arasında görün.`}
          series={[timeSer(en, sc, m, 'var(--accent)', ALL), ...(kind === 'school' ? [] : [timeSer(baseOf(en), sc, m, 'var(--ink3)', ALL, { dash: true })])]} m={m} exams={ALL}
          view={(q.get('z') as TView) || null} onView={(x) => q.put({ z: x === 'cizgi' ? null : x })} />
      </div>
    </>
  );
}

export default function Compare() {
  const st = useStore(), q = useQuery();
  const mod = q.get('mod') === 'deneme' ? 'deneme' : 'kisi';
  const [name, setName] = useState('');
  const MODES: { id: 'kisi' | 'deneme'; title: string; text: string; icon: ReactNode }[] = [
    { id: 'kisi', title: 'Sınıfları ve kişileri karşılaştır', text: 'Sınıf, öğrenci, öğretmen ya da okul geneli yan yana', icon: <Users size={18} /> },
    { id: 'deneme', title: 'Denemeleri karşılaştır', text: 'Seçtiğiniz denemeler, özellik özellik yan yana', icon: <ClipboardList size={18} /> },
  ];
  return (
    <Page title="Karşılaştır" sub="Kimi ya da hangi denemeleri, neye göre karşılaştıracağınızı seçin. Her kutuda grafiğin türünü değiştirebilirsiniz."
      actions={
        <Pop right button={<button className="btn"><Bookmark size={15} />Görünümü kaydet</button>}>
          {(close) => (
            <form style={{ padding: 12 }} className="col" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { saveView(name.trim(), q.str); setName(''); close(); } }}>
              <input className="input" autoFocus placeholder="Görünüme bir ad verin" value={name} onChange={(e) => setName(e.target.value)} />
              <button className="btn pri" style={{ marginTop: 8, justifyContent: 'center' }} disabled={!name.trim()}>Kaydet</button>
            </form>
          )}
        </Pop>
      }>
      {st.views.length > 0 && (
        <div className="row wrap no-print" style={{ marginBottom: 14, gap: 6 }}>
          <span className="sm dim">Kayıtlı görünümler</span>
          {st.views.map((v) => (
            <span key={v.id} className="chip"><Link to={`/karsilastir?${v.q}`}>{v.name}</Link><button aria-label={`${v.name} görünümünü sil`} onClick={() => delView(v.id)}><X size={12} /></button></span>
          ))}
        </div>
      )}
      <div className="mode no-print">
        {MODES.map((x) => (
          <button key={x.id} className={x.id === mod ? 'on' : ''} aria-pressed={x.id === mod} onClick={() => q.put({ mod: x.id === 'kisi' ? null : x.id, g: null, z: null, b: null, d: null, r: null })}>
            <span className="m-ic">{x.icon}</span>
            <span className="clip"><b>{x.title}</b><small className="clip">{x.text}</small></span>
          </button>
        ))}
      </div>
      {mod === 'kisi' ? <People /> : <ExamCmp />}
    </Page>
  );
}
