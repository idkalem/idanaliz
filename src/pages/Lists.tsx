import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import {
  ds, LAST, TESTS, SUBJECTS, win, val, at, series, members, classesOf, rootEnt, entHref, rank, teacherScope, teacherClasses, scopeName, type Ent,
} from '../engine/core';
import { move, moveAdj, forecast } from '../engine/analysis';
import { fmt, fold } from '../engine/fmt';
import { useStore, toggleWatch } from '../store';
import { Page, Card, Delta, Spark, DataTable, Tabs, WhyBtn, Empty, useQuery, Who, LBar, SubjDot, type Col } from '../ui';

const LINE = 'var(--accent)';
/** Test sütunları: başlıkta dersin rengi */
const testCols = <T,>(get: (r: T, i: number) => number | null): Col<T>[] => TESTS.map((t, i) => ({
  id: t.id, head: t.name, hd: <><SubjDot sc={`t:${t.id}`} />{t.name}</>, right: true, cell: (r) => fmt(get(r, i)), val: (r) => get(r, i),
}));

export function Classes() {
  const st = useStore(), nav = useNavigate();
  const w = win(st.per);
  interface Row { c: number; en: Ent; cur: number | null; diff: number | null; tests: (number | null)[] }
  const rows: Row[] = classesOf(rootEnt(st.level)).map((c) => {
    const en = `c:${c}`;
    return { c, en, cur: val(en, w.cur, 'all', 'net'), diff: move(en, 'all', 'net', w)?.diff ?? null, tests: TESTS.map((t) => val(en, w.cur, `t:${t.id}`, 'net')) };
  });
  const top = Math.max(1, ...rows.map((r) => r.cur ?? 0));
  const cols: Col<Row>[] = [
    { id: 'ad', head: 'Sınıf', cell: (r) => <Who en={r.en} />, val: (r) => ds.classes[r.c].name },
    { id: 'n', head: 'Öğrenci', right: true, cell: (r) => ds.classes[r.c].students.length, val: (r) => ds.classes[r.c].students.length },
    { id: 'sp', head: 'Yıl boyunca', cell: (r) => <Spark values={series(r.en, 'all', 'net')} w={110} color={LINE} /> },
    { id: 'net', head: 'Ortalama net', cell: (r) => <LBar v={r.cur} max={top}>{fmt(r.cur)}</LBar>, val: (r) => r.cur },
    { id: 'd', head: 'Değişim', right: true, cell: (r) => <Delta v={r.diff} />, val: (r) => r.diff },
    ...testCols<Row>((r, i) => r.tests[i]),
    { id: 'w', head: '', cell: (r) => <WhyBtn en={r.en} /> },
  ];
  return (
    <Page title="Sınıflar" sub={`${w.name} ortalamaları. Değişim: ${w.desc}. Bir sınıfa tıklayınca profili açılır.`}>
      <Card flush><DataTable cols={cols} rows={rows} rowKey={(r) => r.c} onRow={(r) => nav(entHref(r.en))} sort={{ id: 'net', desc: true }} csv="siniflar" /></Card>
    </Page>
  );
}

export function Students() {
  const st = useStore(), nav = useNavigate(), q = useQuery();
  const tab = q.get('sekme', 'tumu') as 'tumu' | 'takip';
  const [text, setText] = useState('');
  const w = win(st.per), root = rootEnt(st.level);
  interface Row { s: number; en: Ent; cur: number | null; diff: number | null; last: number | null; rk: number | null; puan: number | null }
  const all: Row[] = useMemo(() => members(root).map((s) => {
    const en = `s:${s}`, lv = `l:${ds.classes[ds.students[s].cls].level}`;
    return { s, en, cur: val(en, w.cur, 'all', 'net'), diff: move(en, 'all', 'net', w)?.diff ?? null, last: at(en, LAST, 'all', 'net'), rk: rank(s, LAST, lv)?.r ?? null, puan: forecast(s)?.puan ?? null };
  }), [root, st.per]);
  const top = Math.max(1, ...all.map((r) => r.cur ?? 0));
  const f = fold(text.trim());
  const rows = all.filter((r) => (tab === 'tumu' || st.watch.includes(r.en)) && (!f || fold(`${ds.students[r.s].name} ${ds.classes[ds.students[r.s].cls].name}`).includes(f)));
  const cols: Col<Row>[] = [
    { id: 'tk', head: '', cell: (r) => { const on = st.watch.includes(r.en); return <button className="btn ghost icon" style={{ height: 28, width: 28, color: on ? 'var(--mid)' : undefined }} aria-label={on ? 'Takipten çıkar' : 'Takibe al'} onClick={(e) => { e.stopPropagation(); toggleWatch(r.en); }}><Star size={16} fill={on ? 'currentColor' : 'none'} /></button>; } },
    { id: 'ad', head: 'Öğrenci', cell: (r) => <Who en={r.en} />, val: (r) => ds.students[r.s].name },
    { id: 'sn', head: 'Sınıf', cell: (r) => <span className="tag">{ds.classes[ds.students[r.s].cls].name}</span>, val: (r) => ds.classes[ds.students[r.s].cls].name },
    { id: 'sp', head: 'Yıl boyunca', cell: (r) => <Spark values={series(r.en, 'all', 'net')} color={LINE} /> },
    { id: 'net', head: `Net (${w.name.toLocaleLowerCase('tr')})`, cell: (r) => <LBar v={r.cur} max={top}>{fmt(r.cur)}</LBar>, val: (r) => r.cur },
    { id: 'd', head: 'Değişim', right: true, cell: (r) => <Delta v={r.diff} />, val: (r) => r.diff },
    { id: 'son', head: 'Son deneme', right: true, cell: (r) => fmt(r.last, 2), val: (r) => r.last },
    { id: 'rk', head: 'Kendi düzeyinde sıra', right: true, cell: (r) => r.rk ?? '–', val: (r) => r.rk },
    { id: 'p', head: 'Bugün sınav olsa', right: true, cell: (r) => (r.puan == null ? '–' : `≈ ${fmt(r.puan, 0)} puan`), val: (r) => r.puan },
  ];
  return (
    <Page title="Öğrenciler" sub="Bir öğrenciye tıklayınca profili açılır. Yıldıza basarak takip listesine alabilirsiniz."
      actions={<input className="input" style={{ width: 230, background: 'var(--surface)', boxShadow: 'var(--card-shadow)' }} placeholder="Ad ya da sınıf ara" value={text} onChange={(e) => setText(e.target.value)} />}>
      <Tabs id="st" value={tab} onChange={(t) => q.put({ sekme: t === 'tumu' ? null : t })} tabs={[{ id: 'tumu', label: `Tümü (${all.length})` }, { id: 'takip', label: `Takip listesi (${all.filter((r) => st.watch.includes(r.en)).length})` }]} />
      <Card flush>
        {tab === 'takip' && !rows.length && !f
          ? <Empty title="Takip listesi boş">Yakından izlemek istediğiniz öğrencileri yıldızla işaretleyin; burada toplanırlar.</Empty>
          : <DataTable cols={cols} rows={rows} rowKey={(r) => r.s} onRow={(r) => nav(entHref(r.en))} sort={{ id: 'net', desc: true }} csv="ogrenciler" limit={60} />}
      </Card>
    </Page>
  );
}

export function Teachers() {
  const st = useStore(), nav = useNavigate();
  const w = win(st.per);
  interface Row { t: number; en: Ent; sc: string; cur: number | null; diff: number | null; adj: number | null; cls: number[] }
  const rows: Row[] = ds.teachers.map((t) => {
    const en = `t:${t.i}`, sc = teacherScope(t.i);
    return { t: t.i, en, sc, cur: val(en, w.cur, sc, 'net'), diff: move(en, sc, 'net', w)?.diff ?? null, adj: moveAdj(en, sc, 'net', w)?.diff ?? null, cls: teacherClasses(t.i) };
  }).filter((r) => !st.level || r.cls.some((c) => ds.classes[c].level === st.level));
  const branches = [...new Set(rows.map((r) => ds.teachers[r.t].branch))];
  const cols: Col<Row>[] = [
    { id: 'ad', head: 'Öğretmen', cell: (r) => <Who en={r.en} />, val: (r) => ds.teachers[r.t].name },
    { id: 'cls', head: 'Girdiği sınıflar', cell: (r) => <span className="row wrap" style={{ gap: 5 }}>{r.cls.map((c) => <span key={c} className="tag">{ds.classes[c].name}</span>)}{!r.cls.length && <span className="dim">Atama yok</span>}</span> },
    { id: 'sc', head: 'Ders', cell: (r) => <><SubjDot sc={r.sc} />{scopeName(r.sc)}</>, val: (r) => scopeName(r.sc) },
    { id: 'sp', head: 'Yıl boyunca', cell: (r) => <Spark values={series(r.en, r.sc, 'net')} color={LINE} /> },
    { id: 'net', head: 'Sınıflarının neti', right: true, cell: (r) => <span className="num" style={{ fontSize: 15.5 }}>{fmt(r.cur)}</span>, val: (r) => r.cur },
    { id: 'd', head: 'Değişim', right: true, cell: (r) => <Delta v={r.diff} />, val: (r) => r.diff },
    { id: 'a', head: 'Okula göre', right: true, cell: (r) => <Delta v={r.adj} />, val: (r) => r.adj },
    { id: 'w', head: '', cell: (r) => (r.cls.length ? <WhyBtn en={r.en} sc={r.sc} /> : null) },
  ];
  return (
    <Page title="Öğretmenler" sub="Her öğretmen, girdiği sınıfların kendi dersindeki sonuçlarıyla görünür. Bir öğretmene tıklayınca profili açılır.">
      <div className="stack">
        {branches.map((b) => {
          const subj = SUBJECTS.filter((s) => s.branch === b);
          return (
            <Card flush key={b} title={<>{subj[0] && <SubjDot sc={`s:${subj[0].i}`} />}{b}</>} hint={`${subj.map((s) => s.name).join(' ve ')}: ${rows.filter((r) => ds.teachers[r.t].branch === b).length} öğretmen`}>
              <DataTable cols={cols} rows={rows.filter((r) => ds.teachers[r.t].branch === b)} rowKey={(r) => r.t} onRow={(r) => nav(entHref(r.en))} sort={{ id: 'net', desc: true }} />
            </Card>
          );
        })}
      </div>
      <p className="note" style={{ marginTop: 14, maxWidth: '82ch' }}>
        “Okula göre” sütunu: aynı sürede bütün okul ne kadar değiştiyse o çıkarılır. Böylece zor ya da kolay geçen bir deneme öğretmenin hanesine yazılmaz.
        Sınıfların başlangıç düzeyi farklı olduğu için net sütunu tek başına öğretmenleri sıralamak için kullanılmamalıdır.
      </p>
    </Page>
  );
}
