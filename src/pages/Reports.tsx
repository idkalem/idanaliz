import { Link, useParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import {
  APP, ds, SUBJECTS, TOPICS, SUBJECT_SCOPES, SEMESTER2, val, at, classesOf, members, rootEnt, entKind, entI, entName, scopeName, type Ent, type Win,
} from '../engine/core';
import { REPORTS, reportWin, reportFlags, reportMemory, move, movers, priorities, type Move } from '../engine/analysis';
import { fmt, pct, date } from '../engine/fmt';
import { useStore } from '../store';
import { Page, Card, Delta, EntField, EntLink, TopicLink, Empty, useQuery, SubjDot } from '../ui';
import { LineChart, SERIES } from '../charts';
import { EXAM_LABELS, EXAM_TITLES } from './Home';

const TERMS = [ds.exams.filter((x) => x.date < SEMESTER2).map((x) => x.i), ds.exams.filter((x) => x.date >= SEMESTER2).map((x) => x.i)];
interface Doc { id: string; title: string; w: Win; span: number[]; no: number | null }
function docOf(id: string | undefined): Doc | null {
  const m = /^donem([12])$/.exec(id ?? '');
  if (m) {
    const L = TERMS[+m[1] - 1], k = Math.min(2, Math.floor(L.length / 2));
    if (!L.length) return null;
    return { id: id!, title: `${m[1]}. dönem özeti`, span: L, no: null, w: { cur: L.slice(L.length - k), prev: L.slice(0, k), name: `${m[1]}. dönem`, desc: `dönemin son ${k} denemesi, ilk ${k} denemesine göre` } };
  }
  const no = +(id ?? '');
  if (!Number.isInteger(no) || no < 1 || no > REPORTS) return null;
  const w = reportWin(no);
  return { id: `${no}`, title: `Rapor ${no}`, w, span: w.cur, no };
}
const span = (L: number[]) => (L.length === 1 ? ds.exams[L[0]].name : `${ds.exams[L[0]].name} – ${ds.exams[L[L.length - 1]].name}`);
const valid = (en: string) => en === 'o' || /^l:1[12]$/.test(en) || (/^c:\d+$/.test(en) && !!ds.classes[+en.slice(2)]);

/* ================= Rapor listesi ================= */
export function Reports() {
  const st = useStore(), root = rootEnt(st.level);
  const list = Array.from({ length: REPORTS }, (_, i) => docOf(`${REPORTS - i}`)!);
  const row = (d: Doc) => {
    const cur = val(root, d.span, 'all', 'net'), mv = move(root, 'all', 'net', d.w), flags = d.no ? reportFlags(d.no, root).length : 0;
    return (
      <Link key={d.id} to={`/rapor/${d.id}`} style={{ padding: '14px 22px' }}>
        <span style={{ width: 190, flex: 'none' }}><b style={{ fontWeight: 650, fontSize: 15.5 }}>{d.title}</b><span className="sm dim" style={{ display: 'block' }}>{date(ds.exams[d.span[d.span.length - 1]].date, true)}</span></span>
        <span className="grow mut">{span(d.span)}</span>
        {flags > 0 && <span className="tag bad">{flags} düşüş işaretlendi</span>}
        <span className="num" style={{ fontSize: 17, width: 54, textAlign: 'right' }}>{fmt(cur)}</span>
        <span style={{ width: 58, textAlign: 'right' }}><Delta v={mv?.diff} /></span>
      </Link>
    );
  };
  return (
    <Page title="Raporlar" sub="Her iki denemede bir yeni rapor hazırlanır. Raporu açıp okul, sınıf düzeyi ya da tek bir sınıf için yazdırabilirsiniz.">
      <div className="stack">
        <Card flush title="Düzenli raporlar" hint={`${entName(root)} için ortalama net ve önceki rapora göre değişim`}>
          <div className="list">{list.map(row)}</div>
        </Card>
        <Card flush title="Dönem özetleri" hint="Dönemin tamamı: başlangıç ile bitiş arasındaki fark">
          <div className="list">{[2, 1].map((k) => docOf(`donem${k}`)).filter((d): d is Doc => !!d).map(row)}</div>
        </Card>
      </div>
    </Page>
  );
}

/* ================= Tek rapor ================= */
const line = (x: Move) => <li key={`${x.en}${x.sc}`}><b>{entName(x.en)}{x.sc !== 'all' && `, ${scopeName(x.sc)}`}</b>: {fmt(x.prev)} netten {fmt(x.cur)} nete <Delta v={x.diff} /></li>;

export function ReportPage() {
  const { id } = useParams(), st = useStore(), q = useQuery();
  const d = docOf(id);
  if (!d) return <Page title="Rapor bulunamadı"><Card><Empty title="Bu adreste bir rapor yok">Raporlar listesinden seçerek devam edebilirsiniz.</Empty></Card></Page>;
  const root = rootEnt(st.level), kim = q.get('kim'), en: Ent = valid(kim) ? kim : root, isClass = entKind(en) === 'class';
  const base: Ent = isClass ? `l:${ds.classes[entI(en)].level}` : en;
  const last = d.span[d.span.length - 1], w = d.w, hasPrev = w.prev.length > 0;
  const cur = val(en, d.span, 'all', 'net'), mv = hasPrev ? move(en, 'all', 'net', w) : null;
  const nat = d.span.reduce((a, e) => a + ds.exams[e].nat.mean, 0) / d.span.length;
  const part = d.span.reduce((a, e) => a + members(en).filter((s) => ds.ans[e][s]).length, 0) / (d.span.length * members(en).length);

  const subj = SUBJECTS.map((s) => {
    const sc = `s:${s.i}`, a = val(en, d.span, sc, 'net'), b = isClass ? val(base, d.span, sc, 'net') : null;
    return { s, cur: a, diff: hasPrev ? move(en, sc, 'net', w)?.diff ?? null : null, gap: a != null && b != null ? a - b : null };
  });
  const cm = hasPrev && !isClass ? movers(classesOf(en).map((c) => `c:${c}`), SUBJECT_SCOPES, 'net', w).sort((a, b) => b.diff - a.diff) : [];
  const sm = hasPrev ? movers(members(en).map((s) => `s:${s}`), ['all'], 'net', w).sort((a, b) => b.diff - a.diff) : [];
  const mem = d.no ? reportMemory(d.no, en) : [], flags = d.no ? reportFlags(d.no, en) : [];
  const pr = priorities(en, d.span).slice(0, 5);
  const upto = (v: (number | null)[]) => v.slice(0, last + 1);

  return (
    <Page title={d.title} crumb={<Link to="/raporlar">Raporlar</Link>}
      actions={<>
        <EntField label="Kimin için" value={en} onChange={(e) => q.put({ kim: e === root ? null : e })} kinds={['top', 'class']} />
        <button className="btn pri" onClick={() => print()}><Printer size={15} />Yazdır</button>
      </>}>
      <article className="doc">
        <p className="mut sm">{ds.school}, {ds.year} eğitim yılı</p>
        <h1 style={{ marginTop: 6 }}>{d.title}: {entName(en)}</h1>
        <p className="mut" style={{ marginTop: 8 }}>{d.span.map((e) => `${ds.exams[e].name} (${date(ds.exams[e].date)})`).join(', ')}</p>
        <p className="lead">
          {entName(en)} bu {d.span.length} denemede ortalama <b className="num">{fmt(cur)}</b> net yaptı
          {mv ? <>; {d.no ? 'önceki rapora' : 'dönemin başına'} göre <Delta v={mv.diff} />.</> : '.'}
          {' '}Türkiye ortalaması {fmt(nat)} net; bunun {fmt(Math.abs((cur ?? nat) - nat))} net {cur != null && cur >= nat ? 'üstünde' : 'altında'}.
          {' '}Denemelere katılım {pct(part * 100)}.
        </p>

        <h2>Denemelere göre</h2>
        <LineChart labels={EXAM_LABELS.slice(0, last + 1)} titles={EXAM_TITLES.slice(0, last + 1)} height={220} series={[
          { name: entName(en), color: SERIES[0], values: upto(ds.exams.map((x) => at(en, x.i, 'all', 'net'))) },
          ...(isClass ? [{ name: `${entName(base)} ortalaması`, color: SERIES[1], values: upto(ds.exams.map((x) => at(base, x.i, 'all', 'net'))) }] : []),
          { name: 'Türkiye ortalaması', color: 'var(--ink3)', values: upto(ds.exams.map((x) => x.nat.mean)), dash: true },
        ]} />

        <h2>Dersler</h2>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Ders</th><th className="r">Net</th><th className="r">Soru</th>{hasPrev && <th className="r">Değişim</th>}{isClass && <th className="r">{`Diğer ${ds.classes[entI(en)].level}. sınıflara göre`}</th>}</tr></thead>
            <tbody>
              {subj.map((r) => (
                <tr key={r.s.i}><td className="ent"><SubjDot sc={`s:${r.s.i}`} />{r.s.name}</td><td className="r n">{fmt(r.cur)}</td><td className="r n dim">{r.s.n}</td>{hasPrev && <td className="r n"><Delta v={r.diff} /></td>}{isClass && <td className="r n"><Delta v={r.gap} /></td>}</tr>
              ))}
            </tbody>
          </table>
        </div>

        {cm.length > 0 && (
          <>
            <h2>En çok yükselen sınıf ve dersler</h2>
            <ul>{cm.filter((x) => x.diff > 0).slice(0, 4).map(line)}</ul>
            <h2>En çok düşen sınıf ve dersler</h2>
            <ul>{cm.filter((x) => x.diff < 0).slice(-4).reverse().map(line)}</ul>
          </>
        )}

        {d.no != null && d.no >= 3 && (
          <>
            <h2>Önceki rapordan bu yana</h2>
            {mem.length ? (
              <ul>
                {mem.map((x) => (
                  <li key={`${x.flag.en}${x.flag.sc}`}>
                    <b>{entName(x.flag.en)}, {scopeName(x.flag.sc)}</b>: önceki raporda {fmt(Math.abs(x.flag.diff))} net düşmüştü.{' '}
                    {x.state === 'toparladı' ? <>Bu raporda toparladı <Delta v={x.now} />.</> : x.state === 'sürüyor' ? <>Düşüş sürüyor <Delta v={x.now} />.</> : <>Belirgin bir değişim yok <Delta v={x.now} />.</>}
                  </li>
                ))}
              </ul>
            ) : <p className="mut">Önceki raporda işaretlenen bir düşüş yoktu.</p>}
          </>
        )}
        {flags.length > 0 && (
          <>
            <h2>Bu raporda işaretlenenler</h2>
            <p className="mut" style={{ marginBottom: 8 }}>Yarım netten fazla düşen sınıf ve dersler. Bir sonraki raporda ne oldukları yazılır.</p>
            <ul>{flags.map((f) => <li key={`${f.en}${f.sc}`}><b>{entName(f.en)}, {scopeName(f.sc)}</b> <Delta v={f.diff} /></li>)}</ul>
          </>
        )}

        {pr.length > 0 && (
          <>
            <h2>Ne yapmalı</h2>
            <p className="mut" style={{ marginBottom: 8 }}>Önce çalışılması gereken konular. Sayı: konu en iyi sınıf kadar yapılsa her denemede kaç net artar.</p>
            <ul>
              {pr.map((p) => (
                <li key={p.t}>
                  <b><TopicLink t={p.t} /></b> <span className="mut">({SUBJECTS[TOPICS[p.t].subject].name})</span>: doğru yapanlar {pct(p.pct)}{p.ref != null && <>, en iyi sınıfta {pct(p.ref)}</>}; her denemede +{fmt(p.gain, 2)} net.
                  {p.root != null && <> Önce {TOPICS[p.root].name} konusuna bakılmalı.</>}
                </li>
              ))}
            </ul>
          </>
        )}

        {sm.length > 0 && (
          <>
            <h2>Yakından bakılacak öğrenciler</h2>
            <div className="grid g2" style={{ gap: 28 }}>
              <div>
                <p className="mut sm" style={{ marginBottom: 6 }}>En çok düşenler</p>
                {sm.slice(-5).reverse().map((x) => <div key={x.en} className="row" style={{ padding: '4px 0' }}><span className="grow clip"><EntLink en={x.en} sub /></span><Delta v={x.diff} /></div>)}
              </div>
              <div>
                <p className="mut sm" style={{ marginBottom: 6 }}>En çok yükselenler</p>
                {sm.slice(0, 5).map((x) => <div key={x.en} className="row" style={{ padding: '4px 0' }}><span className="grow clip"><EntLink en={x.en} sub /></span><Delta v={x.diff} /></div>)}
              </div>
            </div>
          </>
        )}

        <p className="note" style={{ marginTop: 36 }}>Bu rapor, yüklü deneme sonuçlarından {APP} tarafından otomatik derlenmiştir. Değişimler: {w.desc}.</p>
      </article>
    </Page>
  );
}
