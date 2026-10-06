// Üst üste yanlışlar. Öğrencide: hangi konuyu art arda denemelerde yapamıyor, hangisi düzeldi, hangisi yeni bozuldu.
// Sınıf, öğretmen, düzey ve okulda: aynı durum kaç öğrencide var ve kimlerde var.
import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Repeat, Flame, Wrench, TrendingDown, Users, UserRound, Download } from 'lucide-react';
import { ds, NE, SUBJECTS, TOPICS, entKind, entI, entName, entHref, entScope, scopeTopics, status, type Ent, type Scope } from '../engine/core';
import { repeats, groupRepeats, repVal, repSort, qCount, REP_KINDS, type Kind, type Miss, type Rep, type St, type TopicRep } from '../engine/repeat';
import { fmt } from '../engine/fmt';
import { openQ } from '../store';
import { Card, Tile, Seg, ScopePicker, TopicLink, SubjDot, LBar, Empty, Tip, useQuery, downloadCsv } from '../ui';
import { niceTicks, SERIES } from '../charts';
import { type CmpRow, type CmpFmt } from '../cmpcharts';
import { CmpCard, Ctl, NameTile, EXL, EXT, okScope, type View } from '../board';

type Tone = 'bad' | 'good' | 'mid';
const MODE: Record<Miss, { label: string; adj: string; did: string; doing: string }> = {
  yb: { label: 'Yanlış ve boş', adj: 'yapamadığı', did: 'yapamadı', doing: 'yapamıyor' },
  y: { label: 'Yalnız yanlış', adj: 'yanlış yaptığı', did: 'yanlış yaptı', doing: 'yanlış yapıyor' },
  b: { label: 'Yalnız boş', adj: 'boş bıraktığı', did: 'boş bıraktı', doing: 'boş bırakıyor' },
};
type M = (typeof MODE)[Miss];
const KIND: Record<Kind, { seg: string; tone: Tone; val: string }> = {
  suren: { seg: 'Üst üste süren', tone: 'bad', val: 'Kaç denemedir sürüyor' },
  duzelen: { seg: 'Düzelen', tone: 'good', val: 'Kaç deneme sürmüştü' },
  bozulan: { seg: 'Yeni bozulan', tone: 'mid', val: 'Kaç denemedir doğruydu' },
  dalgali: { seg: 'Bir var bir yok', tone: 'mid', val: 'Kaç kez değişti' },
  saglam: { seg: 'Hep doğru', tone: 'good', val: 'Kaç denemedir doğru' },
};
const LET: Record<St, string> = { d: 'D', y: 'Y', b: 'B', h: '½' };
const CLS: Record<St, string> = { d: 'lv-good', y: 'lv-bad', b: 'rp-b', h: 'lv-mid' };
const STN: Record<St, string> = { d: 'doğru', y: 'yanlış', b: 'boş', h: 'yarısı doğru' };
const MINS = [2, 3, 4, 5];

const title = (k: Kind, m: M, group: boolean) => {
  const t = k === 'suren' ? `üst üste ${m.adj} konular` : k === 'duzelen' ? 'düzelen konular' : k === 'bozulan' ? 'yeni bozulan konular'
    : k === 'dalgali' ? `bir yapıp bir ${m.adj} konular` : 'üst üste doğru yaptığı konular';
  if (!group) return t[0].toLocaleUpperCase('tr') + t.slice(1);
  return k === 'duzelen' || k === 'bozulan' ? `En çok öğrencide ${t}` : `En çok öğrencinin ${t}`;
};
const hint = (k: Kind, m: M, min: number) => (k === 'suren' ? `Sorulduğu son ${min} denemede ya da daha fazlasında art arda ${m.adj} konular.`
  : k === 'duzelen' ? `Önce en az ${min} deneme art arda ${m.did}, son sorulduğunda doğru yaptı.`
  : k === 'bozulan' ? `En az ${min} deneme art arda doğru yapıyordu, son sorulduğunda ${m.did}.`
  : k === 'dalgali' ? 'Neredeyse her sorulduğunda durumu değişen konular.'
  : `Sorulduğu son ${min} denemede ya da daha fazlasında art arda doğru yaptığı konular.`);
const last = (n: number) => (n > 1 ? `son ${n} denemede` : 'son denemede');
const stText = (r: Rep, k: Kind, m: M) => (k === 'suren' ? `${r.run} denemedir ${m.doing}`
  : k === 'duzelen' ? `${r.prevRun} deneme ${m.did}, ${last(r.clean)} doğru`
  : k === 'bozulan' ? `${r.prevClean} deneme doğruydu, ${last(r.run)} ${m.did}`
  : k === 'dalgali' ? `${r.flips} kez değişti` : `${r.clean} denemedir doğru`);
const subText = (r: Rep, m: M) => `${r.asked} denemede soruldu, ${r.hit === 0 ? 'hiç doğru yapamadı' : r.hit === r.asked ? 'hepsinde doğru' : `${r.miss} kez ${m.did}`}`;
const topicLabel = (t: number) => <><SubjDot sc={`s:${TOPICS[t].subject}`} /><TopicLink t={t} /> <span className="dim sm">{SUBJECTS[TOPICS[t].subject].name}</span></>;
const stuHref = (s: number) => `${entHref(`s:${s}`)}?sekme=tekrar`;
/** Sayı yazan grafikler (çubuk, sütun, nokta, tablo) için ölçek: değer "kaç deneme" ya da "kaç öğrenci". */
function countFmt(rows: CmpRow[], tone: Tone): CmpFmt {
  const t = niceTicks(0, Math.max(1, ...rows.map((r) => r.vals[0] ?? 0)), 4);
  return { show: (v) => (v == null ? '–' : `${Math.round(v)}`), dig: 0, up: tone === 'good', top: t[t.length - 1], axis: true, heat: tone === 'bad' ? 'bad' : 'lv', lead: '', leadCap: '' };
}
const tonePct = (tone: Tone) => [tone === 'good' ? 100 : 50];

/* ================= Seçimler ================= */
function useRep(en: Ent) {
  const q = useQuery();
  const def = entScope(en), n = q.get('n');
  const sc: Scope = n && okScope(n) ? n : def;
  const mode = (['yb', 'y', 'b'] as Miss[]).find((x) => x === q.get('say')) ?? 'yb';
  const min = MINS.find((x) => `${x}` === q.get('ust')) ?? 3;
  const kind = REP_KINDS.find((x) => x === q.get('tur')) ?? 'suren';
  const topics = useMemo(() => scopeTopics(sc), [sc]);
  const view = (q.get('gr') || null) as View | null;
  return { q, sc, def, mode, min, kind, topics, view };
}
type RepP = ReturnType<typeof useRep>;
function Controls({ p, counts }: { p: RepP; counts?: Record<Kind, number> }) {
  const { q } = p;
  return (
    <Card className="no-print" style={{ marginBottom: 16, padding: '16px 18px' }}>
      <div className="ctls">
        <Ctl label="Hangi konular"><Seg id="rk" value={p.kind} onChange={(v) => q.put({ tur: v === 'suren' ? null : v })} options={REP_KINDS.map((k) => ({ id: k, label: counts ? `${KIND[k].seg} (${counts[k]})` : KIND[k].seg }))} /></Ctl>
        <Ctl label="Hangi ders ya da konu"><ScopePicker label="Seçili" value={p.sc} onChange={(v) => q.put({ n: v === p.def ? null : v })} /></Ctl>
        <Ctl label="Ne sayılsın"><Seg id="rm" value={p.mode} onChange={(v) => q.put({ say: v === 'yb' ? null : v })} options={(['yb', 'y', 'b'] as Miss[]).map((id) => ({ id, label: MODE[id].label }))} /></Ctl>
        <Ctl label="En az kaç deneme üst üste"><Seg id="rn" value={p.min} onChange={(v) => q.put({ ust: v === 3 ? null : `${v}` })} options={MINS.map((id) => ({ id, label: `${id}` }))} /></Ctl>
      </div>
    </Card>
  );
}
function Legend({ ring }: { ring?: boolean }) {
  return (
    <div className="legend" style={{ marginTop: 14 }}>
      <span><i className="lv-good" />D: doğru</span>
      <span><i className="lv-bad" />Y: yanlış</span>
      <span><i className="rp-b" />B: boş</span>
      <span><i className="lv-mid" />½: yarısı doğru</span>
      <span><i className="rp-n" />Konu sorulmadı ya da denemeye girmedi</span>
      {ring && <span><i className="rp-lr" />Çerçeve: art arda gelen seri</span>}
    </div>
  );
}

/* ================= Öğrenci: konu konu, deneme deneme ================= */
/** Her satır bir konu, her kutu bir deneme. Kutuya tıklayınca o denemedeki soru açılır. */
function Strips({ list, kind, mode, limit = 0 }: { list: Rep[]; kind: Kind; mode: Miss; limit?: number }) {
  const [all, setAll] = useState(false);
  const [hov, setHov] = useState<{ x: number; y: number; r: Rep; e: number } | null>(null);
  const m = MODE[mode], tone = KIND[kind].tone, shown = limit && !all ? list.slice(0, limit) : list;
  const open = (r: Rep, e: number) => {
    const Q = ds.exams[e].q.filter((x) => x.topic === r.t), q = Q.find((x) => status(e, r.s, x.i) !== 0) ?? Q[0];
    if (q) openQ({ e, q: q.i });
  };
  const c = hov ? qCount(hov.e, hov.r.s, hov.r.t) : null;
  return (
    <>
      <div className="rp" style={{ '--rp-n': NE } as CSSProperties}>
        <div className="rp-row head">
          <span>Konu</span>
          <span className="rp-cells">{EXL.map((l, e) => <span key={e} title={EXT[e]} style={{ gridColumn: e + 1 }}>{l}</span>)}</span>
          <span>Durum</span>
        </div>
        {shown.map((r) => (
          <div className="rp-row" key={r.t}>
            <span className="clip">{topicLabel(r.t)}</span>
            <span className="rp-cells">
              {r.from >= 0 && <i className={`rp-ring ${tone}`} style={{ gridColumn: `${r.from + 1} / ${r.to + 2}` }} />}
              {r.cells.map((x, e) => (x
                ? <button key={e} className={`rp-c ${CLS[x]}`} style={{ gridColumn: e + 1 }} aria-label={`${EXT[e]}: ${STN[x]}`}
                    onMouseEnter={(ev) => setHov({ x: ev.clientX, y: ev.clientY, r, e })} onMouseLeave={() => setHov(null)} onClick={() => open(r, e)}>{LET[x]}</button>
                : <span key={e} className="rp-c rp-n" style={{ gridColumn: e + 1 }} />))}
            </span>
            <span className="rp-st"><span className={`tag ${tone}`}>{stText(r, kind, m)}</span><small>{subText(r, m)}</small></span>
          </div>
        ))}
      </div>
      {limit > 0 && list.length > limit && (
        <div className="no-print" style={{ marginTop: 12 }}><button className="btn ghost" onClick={() => setAll(!all)}>{all ? 'Daralt' : `Tümünü göster (${list.length} konu)`}</button></div>
      )}
      {hov && c && (
        <Tip x={hov.x} y={hov.y}>
          <h4>{ds.exams[hov.e].name}</h4>
          <div>{TOPICS[hov.r.t].name}</div>
          <div className="dim">{c[0] + c[1] + c[2]} soru: {c[0]} doğru, {c[1]} yanlış, {c[2]} boş</div>
        </Tip>
      )}
    </>
  );
}

function StudentRepeats({ en, p }: { en: Ent; p: RepP }) {
  const s = entI(en), { mode, min, kind, topics } = p, m = MODE[mode];
  const all = useMemo(() => repeats(s, mode, min, topics), [s, mode, min, topics]);
  const by = (k: Kind) => all.filter((r) => r.kind === k).sort(repSort(k));
  const lists: Record<Kind, Rep[]> = { suren: by('suren'), duzelen: by('duzelen'), bozulan: by('bozulan'), dalgali: by('dalgali'), saglam: by('saglam') };
  const counts = Object.fromEntries(REP_KINDS.map((k) => [k, lists[k].length])) as Record<Kind, number>;
  const list = lists[kind], top = lists.suren[0], tone = KIND[kind].tone;
  const rows: CmpRow[] = list.map((r) => ({ key: `${r.t}`, name: TOPICS[r.t].name, label: topicLabel(r.t), vals: [repVal(r, kind)], pct: tonePct(tone) }));
  const csv = () => downloadCsv(`${entName(en)}-ust-uste-${kind}`, ['Konu', 'Ders', ...EXL, 'Durum', 'Sorulduğu deneme', 'Yapamadığı deneme'],
    list.map((r) => [TOPICS[r.t].name, SUBJECTS[TOPICS[r.t].subject].name, ...r.cells.map((x) => (x ? LET[x] : '')), stText(r, kind, m), r.asked, r.miss]));
  return (
    <>
      <div className="tiles">
        <Tile tone={counts.suren ? 'bad' : 'good'} icon={<Repeat size={17} />} label={`Üst üste ${m.adj}`} unit="konu" sub={`En az ${min} deneme art arda`}>{counts.suren}</Tile>
        <NameTile tone={top ? 'bad' : ''} icon={<Flame size={17} />} label="En uzun süren" name={top ? <TopicLink t={top.t} /> : '–'} sub={top ? `${top.run} denemedir ${m.doing}` : 'Süren bir seri yok'} />
        <Tile tone="good" icon={<Wrench size={17} />} label="Düzelen" unit="konu" sub={`Art arda ${m.did}, artık doğru`}>{counts.duzelen}</Tile>
        <Tile tone="mid" icon={<TrendingDown size={17} />} label="Yeni bozulan" unit="konu" sub={`Art arda doğruydu, son denemede ${m.did}`}>{counts.bozulan}</Tile>
      </div>
      <Controls p={p} counts={counts} />
      {!list.length ? (
        <Card title={title(kind, m, false)} icon={<Repeat size={16} />} k={`k-${tone}`} hint={hint(kind, m, min)}>
          <Empty title="Bu duruma uyan konu yok">{min > 2 ? 'Üstteki "en az kaç deneme" sayısını düşürerek daha kısa serilere bakabilirsiniz.' : 'Başka bir ders ya da durum seçebilirsiniz.'}</Empty>
        </Card>
      ) : (
        <CmpCard title={title(kind, m, false)} icon={<Repeat size={16} />} k={`k-${tone}`}
          hint={`${hint(kind, m, min)} Kutuya tıklayınca o denemedeki soru açılır.`}
          view={p.view} onView={(v) => p.q.put({ gr: v === 'serit' ? null : v })}
          rows={rows} names={[KIND[kind].val]} colors={[SERIES[0]]} f={countFmt(rows, tone)} head="Konu" noun="konu" at="konuda" limit={15}
          serit={<><Strips list={list} kind={kind} mode={mode} limit={15} /><Legend ring={kind !== 'dalgali'} /></>}
          footer={(
            <div className="row wrap" style={{ marginTop: 12, gap: '8px 16px' }}>
              <p className="note grow" style={{ margin: 0 }}>Konu her denemede sorulmayabilir; yalnız sorulduğu ve öğrencinin girdiği denemeler sayılır. Konudan birden çok soru çıktıysa çoğunluğa bakılır: yarısından fazlası doğruysa D, yarısından azı doğruysa Y ya da B. Grafiklerdeki sayı: {KIND[kind].val.toLocaleLowerCase('tr')}.</p>
              <button className="btn ghost no-print" onClick={csv}><Download size={15} />CSV indir</button>
            </div>
          )} />
      )}
    </>
  );
}

/* ================= Sınıf, öğretmen, düzey, okul: kaç öğrencide var ================= */
/** Her satır bir konu: çubuk kaç öğrencide olduğunu gösterir, altında o öğrencilerin adları yazar. */
function TopicRows({ list, kind, limit = 0 }: { list: TopicRep[]; kind: Kind; limit?: number }) {
  const [all, setAll] = useState(false);
  const tone = KIND[kind].tone, shown = limit && !all ? list.slice(0, limit) : list;
  return (
    <>
      <div className="rp">
        {shown.map((x) => {
          const who = x.who[kind];
          return (
            <div className="rp-g" key={x.t}>
              <div className="rp-g-top">
                <span className="clip">{topicLabel(x.t)}</span>
                <LBar v={who.length} max={x.of} k={`k-${tone}`}>{who.length} <span className="dim" style={{ fontWeight: 500 }}>/ {x.of} öğrenci</span></LBar>
              </div>
              <div className="rp-g-who">
                {who.slice(0, 8).map((r) => <Link key={r.s} className="lnk" to={stuHref(r.s)}>{ds.students[r.s].name} <b>{repVal(r, kind)}</b></Link>)}
                {who.length > 8 && <span className="dim">ve {who.length - 8} öğrenci daha</span>}
              </div>
            </div>
          );
        })}
      </div>
      {limit > 0 && list.length > limit && (
        <div className="no-print" style={{ marginTop: 12 }}><button className="btn ghost" onClick={() => setAll(!all)}>{all ? 'Daralt' : `Tümünü göster (${list.length} konu)`}</button></div>
      )}
    </>
  );
}

function GroupRepeats({ en, p }: { en: Ent; p: RepP }) {
  const { mode, min, kind, topics } = p, m = MODE[mode], tone = KIND[kind].tone;
  const g = useMemo(() => groupRepeats(en, mode, min, topics), [en, mode, min, topics]);
  const topicsOf = (k: Kind) => g.topics.filter((x) => x.who[k].length).sort((a, b) => b.who[k].length - a.who[k].length || b.who[k].length / b.of - a.who[k].length / a.of || a.t - b.t);
  const tl = topicsOf(kind), sl = g.students.filter((x) => x.n[kind] > 0).sort((a, b) => b.n[kind] - a.n[kind] || a.s - b.s);
  const worstT = topicsOf('suren')[0], fixedT = topicsOf('duzelen')[0];
  const worstS = [...g.students].sort((a, b) => b.n.suren - a.n.suren)[0];
  const avg = g.students.length ? g.students.reduce((a, x) => a + x.n.suren, 0) / g.students.length : null;
  const trows: CmpRow[] = tl.map((x) => ({ key: `${x.t}`, name: TOPICS[x.t].name, label: topicLabel(x.t), vals: [x.who[kind].length], pct: tonePct(tone) }));
  const srows: CmpRow[] = sl.map((x) => ({ key: `${x.s}`, name: ds.students[x.s].name, label: <Link className="lnk" to={stuHref(x.s)}>{ds.students[x.s].name}</Link>, vals: [x.n[kind]], pct: tonePct(tone) }));
  const csv = () => downloadCsv(`${entName(en)}-ust-uste-${kind}`, ['Konu', 'Ders', 'Öğrenci', 'Konuyla karşılaşan öğrenci', 'Kimler'],
    tl.map((x) => [TOPICS[x.t].name, SUBJECTS[TOPICS[x.t].subject].name, x.who[kind].length, x.of, x.who[kind].map((r) => `${ds.students[r.s].name} (${repVal(r, kind)})`).join('; ')]));
  return (
    <>
      <div className="tiles">
        <NameTile tone={worstT ? 'bad' : ''} icon={<Repeat size={17} />} label={`En çok öğrencinin üst üste ${m.adj} konu`} name={worstT ? <TopicLink t={worstT.t} /> : '–'}
          sub={worstT ? `${worstT.who.suren.length} / ${worstT.of} öğrenci, en az ${min} deneme art arda` : 'Süren bir seri yok'} />
        <Tile icon={<Users size={17} />} label="Öğrenci başına" unit="konu" sub={`Üst üste ${m.adj} konu sayısı, ortalama`}>{fmt(avg)}</Tile>
        <NameTile icon={<UserRound size={17} />} label="En çok konuda takılan öğrenci" name={worstS && worstS.n.suren ? <Link className="lnk" to={stuHref(worstS.s)}>{ds.students[worstS.s].name}</Link> : '–'}
          sub={worstS && worstS.n.suren ? `${worstS.n.suren} konuda üst üste ${m.doing}` : 'Süren bir seri yok'} />
        <NameTile tone={fixedT ? 'good' : ''} icon={<Wrench size={17} />} label="En çok öğrencide düzelen konu" name={fixedT ? <TopicLink t={fixedT.t} /> : '–'}
          sub={fixedT ? `${fixedT.who.duzelen.length} öğrenci art arda ${m.did}, artık doğru yapıyor` : 'Düzelen bir seri yok'} />
      </div>
      <Controls p={p} />
      {!tl.length ? (
        <Card title={title(kind, m, true)} icon={<Repeat size={16} />} k={`k-${tone}`} hint={hint(kind, m, min)}>
          <Empty title="Bu duruma uyan konu yok">{min > 2 ? 'Üstteki "en az kaç deneme" sayısını düşürerek daha kısa serilere bakabilirsiniz.' : 'Başka bir ders ya da durum seçebilirsiniz.'}</Empty>
        </Card>
      ) : (
        <div className="stack">
          <CmpCard title={title(kind, m, true)} icon={<Repeat size={16} />} k={`k-${tone}`} def="cubuk"
            hint={`${hint(kind, m, min)} Çubuk: konuyla karşılaşan öğrencilerin kaçı bu durumda. Adın yanındaki sayı: ${KIND[kind].val.toLocaleLowerCase('tr')}.`}
            view={p.view} onView={(v) => p.q.put({ gr: v === 'cubuk' ? null : v })}
            rows={trows} names={['Öğrenci sayısı']} colors={[SERIES[0]]} f={countFmt(trows, tone)} head="Konu" noun="konu" at="konuda" limit={12}
            cubuk={<TopicRows list={tl} kind={kind} limit={12} />}
            footer={(
              <div className="row wrap" style={{ marginTop: 12, gap: '8px 16px' }}>
                <p className="note grow" style={{ margin: 0 }}>Bir öğrencinin adına tıklayınca onun konu konu, deneme deneme dökümü açılır. Konudan birden çok soru çıktıysa çoğunluğa bakılır: soruların yarısından azını doğru yapan öğrenci o denemede yapamamış sayılır.</p>
                <button className="btn ghost no-print" onClick={csv}><Download size={15} />CSV indir</button>
              </div>
            )} />
          <CmpCard title="Öğrencilere göre" icon={<Users size={16} />} k={`k-${tone}`} def="cubuk"
            hint={`Her öğrencide bu durumda kaç konu var. ${hint(kind, m, min)}`}
            rows={srows} names={['Konu sayısı']} colors={[SERIES[0]]} f={countFmt(srows, tone)} head="Öğrenci" noun="öğrenci" at="öğrencide" limit={12} />
        </div>
      )}
    </>
  );
}

/** Profil sekmesi ve Konular ekranındaki görünüm */
export function Repeats({ en }: { en: Ent }) {
  const p = useRep(en);
  return entKind(en) === 'student' ? <StudentRepeats en={en} p={p} /> : <GroupRepeats en={en} p={p} />;
}

/** Genel sekmesindeki kısa özet: en uzun süren beş konu ve tümüne giden bağlantı */
export function RepeatMini({ en }: { en: Ent }) {
  const student = entKind(en) === 'student';
  const topics = useMemo(() => scopeTopics(entScope(en)), [en]);
  const list = useMemo(() => (student ? repeats(entI(en), 'yb', 3, topics).filter((r) => r.kind === 'suren').sort(repSort('suren')) : []), [en, student, topics]);
  const tl = useMemo(() => (student ? [] : groupRepeats(en, 'yb', 3, topics).topics.filter((x) => x.who.suren.length).sort((a, b) => b.who.suren.length - a.who.suren.length || a.t - b.t)), [en, student, topics]);
  const n = student ? list.length : tl.length;
  return (
    <Card title={student ? 'Üst üste yapamadığı konular' : 'En çok öğrencinin üst üste yapamadığı konular'} icon={<Repeat size={16} />} k="k-bad"
      hint="Sorulduğu son 3 denemede ya da daha fazlasında art arda yanlış yapılan ya da boş bırakılan konular."
      action={n > 0 ? <Link className="more" to={`${entHref(en)}?sekme=tekrar`}>Tümünü gör ({n} konu)</Link> : undefined}>
      {!n ? <Empty title="Üst üste yapılamayan konu yok" />
        : student ? <Strips list={list.slice(0, 5)} kind="suren" mode="yb" />
        : <TopicRows list={tl.slice(0, 5)} kind="suren" />}
    </Card>
  );
}
