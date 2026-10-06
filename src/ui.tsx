// Ortak arayüz parçaları.
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, animate, useReducedMotion } from 'motion/react';
import { ArrowUp, ArrowDown, ChevronDown, Star, Download, Trash2 } from 'lucide-react';
import {
  APP, ds, METRICS, SUBJECTS, TOPICS, TEST_SCOPES, SUBJECT_SCOPES,
  entName, entHref, entSub, entKind, entI, teacherScope, scopeName, scopeFull, type Ent, type Scope, type Metric, type Per,
} from './engine/core';
import { better } from './engine/analysis';
import { fmt, sgn, fold, date, pct as fpct } from './engine/fmt';
import { useStore, openWhy, toggleWatch, addNote, delNote } from './store';

/* ---------- Renk: ders grubu ve durum ---------- */
/** Kapsamın ders grubu rengi (CSS sınıfı). Türkçe mavi, Sosyal turuncu, Matematik mor, Fen yeşil-mavi; toplam marka rengi. */
export function kOf(sc: Scope): string {
  const [k, v] = sc.split(':');
  const test = k === 't' ? v : k === 's' ? SUBJECTS[+v].test : k === 'k' ? SUBJECTS[TOPICS[+v].subject].test : '';
  return test ? `k-${test}` : 'k-brand';
}
/** Doğru oranı eşikleri: %60 ve üstü iyi, %40 altı zayıf. Bütün ekranlarda aynıdır. */
export const LV_LO = 40, LV_HI = 60;
export type Lv = 'good' | 'mid' | 'bad' | 'none';
export const lv = (p: number | null | undefined): Lv => (p == null || !isFinite(p) ? 'none' : p >= LV_HI ? 'good' : p >= LV_LO ? 'mid' : 'bad');
export const LV_NAME: Record<Lv, string> = { good: 'İyi', mid: 'Orta', bad: 'Zayıf', none: 'Veri yok' };
export function LevelLegend() {
  return (
    <div className="legend">
      <span><i className="lv-good" />İyi: %{LV_HI} ve üstü doğru</span>
      <span><i className="lv-mid" />Orta</span>
      <span><i className="lv-bad" />Zayıf: %{LV_LO} altı doğru</span>
    </div>
  );
}
export function LevelTag({ p }: { p: number | null | undefined }) {
  const l = lv(p);
  return <span className={`tag ${l === 'none' ? '' : l}`}>{LV_NAME[l]}</span>;
}
/** Hücre içi çubuk; sayı her zaman yanında yazılır. */
export function LBar({ v, max = 100, k = 'k-brand', children }: { v: number | null | undefined; max?: number; k?: string; children: ReactNode }) {
  return (
    <span className={`lbar ${k}`}>
      <span className="trk"><i style={{ width: `${Math.max(0, Math.min(100, ((v ?? 0) / (max || 1)) * 100))}%` }} /></span>
      <b>{children}</b>
    </span>
  );
}
/** Doğru oranı çubuğu: renk iyi / orta / zayıf durumunu gösterir. */
export function PctBar({ p }: { p: number | null | undefined }) {
  return <LBar v={p} k={`k-${lv(p)}`}>{fpct(p)}</LBar>;
}
export function SubjDot({ sc }: { sc: Scope }) {
  return <i className={`sdot ${kOf(sc)}`} aria-hidden />;
}

/* ---------- Kişi ve sınıf rozetleri ---------- */
const initials = (name: string) => name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toLocaleUpperCase('tr');
export function Ava({ en }: { en: Ent }) {
  const k = entKind(en);
  if (k === 'class') return <span className="ava cls">{entName(en)}</span>;
  return <span className={`ava ${k === 'teacher' ? kOf(teacherScope(entI(en))) : ''}`} aria-hidden>{initials(entName(en))}</span>;
}
export function Who({ en, sub }: { en: Ent; sub?: ReactNode }) {
  const cls = entKind(en) === 'class';
  return (
    <span className="who">
      <Ava en={en} />
      {(!cls || sub) && <span className="clip">{!cls && entName(en)}{sub && <small>{sub}</small>}</span>}
    </span>
  );
}

/* ---------- Özet kutusu ---------- */
export function Tile({ label, icon, children, unit, sub, tone = '', to }: { label: ReactNode; icon?: ReactNode; children: ReactNode; unit?: ReactNode; sub?: ReactNode; tone?: '' | 'brand' | 'good' | 'mid' | 'bad'; to?: string }) {
  const body = (
    <>
      <div className="t-l">{icon && <span className="t-ic">{icon}</span>}<span>{label}</span></div>
      <div className="t-v">{children}{unit && <small>{unit}</small>}</div>
      {sub && <div className="t-s">{sub}</div>}
    </>
  );
  return to ? <Link className={`tile ${tone}`} to={to}>{body}</Link> : <div className={`tile ${tone}`}>{body}</div>;
}

/* ---------- Sayılar ---------- */
export function Delta({ v, m = 'net', dig, pct }: { v: number | null | undefined; m?: Metric; dig?: number; pct?: boolean }) {
  if (v == null || !isFinite(v)) return <span className="delta flat">–</span>;
  const d = dig ?? METRICS[m].dig;
  const zero = sgn(v, d) === fmt(0, d);
  const cls = zero ? 'flat' : better(v, m) > 0 ? 'up' : 'dn';
  return (
    <span className={`delta ${cls}`} title={v > 0 ? 'artış' : v < 0 ? 'azalış' : 'değişim yok'}>
      {!zero && (v > 0 ? <ArrowUp size={13} strokeWidth={2.7} /> : <ArrowDown size={13} strokeWidth={2.7} />)}
      {pct ? '%' : ''}{fmt(Math.abs(v), d)}
    </span>
  );
}
/** Sayıyı ilk görünüşte sayarak yazar. */
export function Num({ v, dig = 1 }: { v: number | null; dig?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (v == null || !ref.current) return;
    if (reduce) { ref.current.textContent = fmt(v, dig); return; }
    const c = animate(from.current, v, { duration: 0.75, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => { if (ref.current) ref.current.textContent = fmt(x, dig); } });
    from.current = v;
    return () => c.stop();
  }, [v, dig, reduce]);
  return <span ref={ref}>{fmt(v == null ? null : reduce ? v : from.current, dig)}</span>;
}
export function Stat({ label, children, unit }: { label: string; children: ReactNode; unit?: string }) {
  return (
    <div className="stat">
      <div className="v">{children}{unit && <small>{unit}</small>}</div>
      <div className="l">{label}</div>
    </div>
  );
}

/* ---------- Bağlantılar ---------- */
export function WhyBtn({ en, sc = 'all', m = 'net', per, push }: { en: Ent; sc?: Scope; m?: Metric; per?: Per; push?: boolean }) {
  const st = useStore();
  return (
    <button className="why no-print" onClick={(e) => { e.stopPropagation(); e.preventDefault(); openWhy({ en, sc, m, per: per ?? st.per }, push); }}>
      Neden?
    </button>
  );
}
export function EntLink({ en, sub }: { en: Ent; sub?: boolean }) {
  return (
    <span className="ent">
      <Link to={entHref(en)} onClick={(e) => e.stopPropagation()}>{entName(en)}</Link>
      {sub && <span className="dim sm" style={{ fontWeight: 400 }}> {entSub(en)}</span>}
    </span>
  );
}
export function TopicLink({ t }: { t: number }) {
  return <Link className="lnk" to={`/konu/${TOPICS[t].id}`} onClick={(e) => e.stopPropagation()}>{TOPICS[t].name}</Link>;
}
export function WatchBtn({ en }: { en: Ent }) {
  const on = useStore().watch.includes(en);
  return (
    <button className={`btn ${on ? 'on' : ''}`} onClick={() => toggleWatch(en)} aria-pressed={on}>
      <Star size={15} fill={on ? 'currentColor' : 'none'} />{on ? 'Takipte' : 'Takibe al'}
    </button>
  );
}

/* ---------- Seçiciler ---------- */
export function Seg<T extends string | number>({ value, onChange, options, id }: { value: T; onChange: (v: T) => void; options: { id: T; label: string }[]; id: string }) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button key={o.id} className={o.id === value ? 'on' : ''} aria-pressed={o.id === value} onClick={() => onChange(o.id)}>
          {o.id === value && <motion.span layoutId={`seg-${id}`} className="pill" transition={{ type: 'spring', stiffness: 520, damping: 40 }} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}
export function Sel<T extends string | number>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { id: T; label: string }[]; label: string }) {
  return (
    <select className="field" aria-label={label} value={String(value)} onChange={(e) => onChange(options.find((o) => String(o.id) === e.target.value)!.id)}>
      {options.map((o) => <option key={o.id} value={String(o.id)}>{o.label}</option>)}
    </select>
  );
}
export function Tabs<T extends string>({ value, onChange, tabs, id }: { value: T; onChange: (v: T) => void; tabs: { id: T; label: string }[]; id: string }) {
  return (
    <div className="tabs no-print">
      {tabs.map((t) => (
        <button key={t.id} className={t.id === value ? 'on' : ''} onClick={() => onChange(t.id)}>
          {t.label}
          {t.id === value && <motion.span layoutId={`tab-${id}`} className="bar" transition={{ type: 'spring', stiffness: 520, damping: 42 }} />}
        </button>
      ))}
    </div>
  );
}
export function Pop({ button, children, right }: { button: ReactNode; children: (close: () => void) => ReactNode; right?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', h); document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k); };
  }, [open]);
  return (
    <div className="pop-wrap" ref={ref}>
      <span style={{ display: 'contents' }} onClick={() => setOpen((o) => !o)}>{button}</span>
      <AnimatePresence>
        {open && (
          <motion.div className={`pop ${right ? 'rt' : ''}`} initial={{ opacity: 0, y: -4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.13 }}>
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
interface PickGroup { g: string; items: { id: string; label: string; hint?: string }[] }
function PickList({ groups, value, onPick, placeholder, cap = 400 }: { groups: PickGroup[]; value?: string | string[]; onPick: (id: string) => void; placeholder: string; cap?: number }) {
  const [q, setQ] = useState('');
  const f = fold(q.trim());
  let left = cap;
  const shown = groups.map((g) => ({ g: g.g, items: g.items.filter((i) => !f || fold(`${i.label} ${i.hint ?? ''}`).includes(f)) })).filter((g) => g.items.length)
    .map((g) => { const items = g.items.slice(0, Math.max(0, left)); left -= items.length; return { g: g.g, items, more: g.items.length - items.length }; });
  const isOn = (id: string) => (Array.isArray(value) ? value.includes(id) : value === id);
  return (
    <>
      <div className="pop-search"><input className="input" autoFocus placeholder={placeholder} value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="pop-list">
        {shown.map((g) => (
          <div key={g.g}>
            {g.g && <div className="pop-group">{g.g}</div>}
            {g.items.map((i) => (
              <button key={i.id} className={`pop-item ${isOn(i.id) ? 'on' : ''}`} onClick={() => onPick(i.id)}>
                <span className="clip">{i.label}</span>{i.hint && <small>{i.hint}</small>}
              </button>
            ))}
            {g.more > 0 && <div className="pop-group" style={{ fontWeight: 400 }}>{g.more} kişi daha var; aramayı daraltın.</div>}
          </div>
        ))}
        {!shown.length && <div className="empty sm">Eşleşen yok.</div>}
      </div>
    </>
  );
}
const SCOPE_GROUPS: PickGroup[] = [
  { g: '', items: [{ id: 'all', label: 'Toplam (120 soru)' }] },
  { g: 'Testler', items: TEST_SCOPES.map((s) => ({ id: s, label: scopeName(s) })) },
  { g: 'Dersler', items: SUBJECT_SCOPES.map((s) => ({ id: s, label: scopeName(s), hint: `${SUBJECTS[+s.slice(2)].n} soru` })) },
  ...SUBJECTS.map((s) => ({ g: `${s.name} konuları`, items: TOPICS.filter((t) => t.subject === s.i).map((t) => ({ id: `k:${t.i}`, label: t.name, hint: s.name })) })),
];
export function ScopePicker({ value, onChange, label = 'Neyi' }: { value: Scope; onChange: (s: Scope) => void; label?: string }) {
  return (
    <Pop button={<button className="field"><span className="lbl">{label}</span><span className="clip">{scopeFull(value)}</span><ChevronDown size={14} /></button>}>
      {(close) => <PickList groups={SCOPE_GROUPS} value={value} placeholder="Ders ya da konu ara" onPick={(id) => { onChange(id); close(); }} />}
    </Pop>
  );
}
export type EntKinds = ('top' | 'class' | 'teacher' | 'student')[];
export function entGroups(kinds: EntKinds): PickGroup[] {
  const out: PickGroup[] = [];
  if (kinds.includes('top')) out.push({ g: 'Genel', items: [{ id: 'o', label: 'Okul geneli' }, { id: 'l:11', label: '11. sınıflar' }, { id: 'l:12', label: '12. sınıflar' }] });
  if (kinds.includes('class')) out.push({ g: 'Sınıflar', items: ds.classes.map((c) => ({ id: `c:${c.i}`, label: c.name, hint: `${c.students.length} öğrenci` })) });
  if (kinds.includes('teacher')) out.push({ g: 'Öğretmenler', items: ds.teachers.map((t) => ({ id: `t:${t.i}`, label: t.name, hint: t.branch })) });
  if (kinds.includes('student')) out.push({ g: 'Öğrenciler', items: ds.students.map((s) => ({ id: `s:${s.i}`, label: s.name, hint: ds.classes[s.cls].name })) });
  return out;
}
export function EntPicker({ value, onPick, kinds, button, keepOpen }: { value?: Ent | Ent[]; onPick: (e: Ent) => void; kinds: EntKinds; button: ReactNode; keepOpen?: boolean }) {
  const groups = useMemo(() => entGroups(kinds), [kinds.join()]);
  return (
    <Pop button={button}>
      {(close) => <PickList groups={groups} value={value} cap={60} placeholder="Sınıf, öğrenci ya da öğretmen ara" onPick={(id) => { onPick(id); if (!keepOpen) close(); }} />}
    </Pop>
  );
}
export function EntField({ value, onChange, kinds, label = 'Kim' }: { value: Ent; onChange: (e: Ent) => void; kinds: EntKinds; label?: string }) {
  return <EntPicker value={value} onPick={onChange} kinds={kinds} button={<button className="field"><span className="lbl">{label}</span><span className="clip">{entName(value)}</span><ChevronDown size={14} /></button>} />;
}

/* ---------- Yüzeyler ---------- */
export function Card({ title, hint, action, children, flush, className = '', style, icon, k = '' }: { title?: ReactNode; hint?: ReactNode; action?: ReactNode; children: ReactNode; flush?: boolean; className?: string; style?: CSSProperties; icon?: ReactNode; k?: string }) {
  return (
    <section className={`card ${flush ? 'flush' : ''} ${className}`} style={style}>
      {(title || action) && (
        <div className="card-head">
          {icon && <span className={`ch-ic ${k}`}>{icon}</span>}
          <div className="grow">
            {title && <h2>{title}</h2>}
            {hint && <div className="hint">{hint}</div>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Page({ title, sub, crumb, actions, children }: { title: ReactNode; sub?: ReactNode; crumb?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  useEffect(() => { if (typeof title === 'string') document.title = `${title} – ${APP}`; }, [title]);
  return (
    <motion.div className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <div className="page-head">
        <div className="grow">
          {crumb && <div className="crumb">{crumb}</div>}
          <h1>{title}</h1>
          {sub && <p className="sub">{sub}</p>}
        </div>
        {actions && <div className="row wrap no-print">{actions}</div>}
      </div>
      {children}
    </motion.div>
  );
}
export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="empty"><b>{title}</b>{children}</div>;
}

/* ---------- Mini çizgi ---------- */
export function Spark({ values, w = 84, h = 26, color = 'var(--ink2)' }: { values: (number | null)[]; w?: number; h?: number; color?: string }) {
  const pts = values.map((v, i) => [i, v] as const).filter((p): p is readonly [number, number] => p[1] != null);
  if (pts.length < 2) return <svg width={w} height={h} />;
  const lo = Math.min(...pts.map((p) => p[1])), hi = Math.max(...pts.map((p) => p[1]));
  const x = (i: number) => 3 + (i / (values.length - 1)) * (w - 6), y = (v: number) => h - 4 - ((v - lo) / (hi - lo || 1)) * (h - 8);
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden>
      <path d={pts.map((p, i) => `${i ? 'L' : 'M'}${x(p[0]).toFixed(1)} ${y(p[1]).toFixed(1)}`).join('')} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(last[0])} cy={y(last[1])} r={2.6} fill={color} />
    </svg>
  );
}

/* ---------- İpucu kutusu ---------- */
export function Tip({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ l: x + 14, t: y + 14 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth, h = el.offsetHeight;
    setPos({ l: x + 14 + w > innerWidth - 8 ? Math.max(8, x - w - 14) : x + 14, t: Math.max(8, Math.min(y + 14, innerHeight - h - 8)) });
  }, [x, y]);
  return createPortal(<div ref={ref} className="tip" style={{ left: pos.l, top: pos.t }}>{children}</div>, document.body);
}

/* ---------- Tablo ---------- */
export interface Col<T> {
  id: string; head: string; cell: (r: T) => ReactNode; right?: boolean;
  /** başlıkta gösterilecek içerik (ör. ders rengi noktası); verilmezse `head` yazılır */
  hd?: ReactNode;
  /** sıralama ve dışa aktarım değeri */
  val?: (r: T) => number | string | null;
  noCsv?: boolean;
}
export function downloadCsv(name: string, head: string[], rows: (string | number | null)[][]) {
  const esc = (v: string | number | null) => {
    if (v == null) return '';
    const s = typeof v === 'number' ? String(Math.round(v * 1000) / 1000).replace('.', ',') : v;
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const text = '﻿' + [head, ...rows].map((r) => r.map(esc).join(';')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  a.download = `${name}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
export function DataTable<T>({ cols, rows, rowKey, onRow, sort, csv, limit }: {
  cols: Col<T>[]; rows: T[]; rowKey: (r: T) => string | number; onRow?: (r: T) => void;
  sort?: { id: string; desc?: boolean }; csv?: string; limit?: number;
}) {
  const [s, setS] = useState(sort ?? null);
  const [all, setAll] = useState(false);
  const sorted = useMemo(() => {
    const c = s && cols.find((x) => x.id === s.id);
    if (!c?.val) return rows;
    const v = c.val, dir = s!.desc ? -1 : 1;
    return [...rows].sort((a, b) => {
      const x = v(a), y = v(b);
      if (x == null) return y == null ? 0 : 1;
      if (y == null) return -1;
      return (typeof x === 'string' ? x.localeCompare(String(y), 'tr') : x - (y as number)) * dir;
    });
  }, [rows, s, cols]);
  const shown = limit && !all ? sorted.slice(0, limit) : sorted;
  return (
    <>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c.id} className={`${c.right ? 'r' : ''} ${c.val ? 's' : ''}`} aria-sort={s?.id === c.id ? (s.desc ? 'descending' : 'ascending') : undefined}
                  onClick={c.val ? () => setS(s?.id === c.id ? { id: c.id, desc: !s.desc } : { id: c.id, desc: !rows.length || typeof c.val!(rows[0]) !== 'string' }) : undefined}>
                  {c.hd ?? c.head}{s?.id === c.id && <span aria-hidden>{s.desc ? ' ↓' : ' ↑'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={rowKey(r)} className={onRow ? 'click' : ''} onClick={onRow ? () => onRow(r) : undefined}>
                {cols.map((c) => <td key={c.id} className={c.right ? 'r n' : ''}>{c.cell(r)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <Empty title="Gösterilecek satır yok" />}
      {(csv || (limit && rows.length > limit)) && (
        <div className="tbl-foot no-print">
          <span>{rows.length} satır</span>
          {limit && rows.length > limit && <button className="btn ghost" onClick={() => setAll(!all)}>{all ? 'Daralt' : 'Tümünü göster'}</button>}
          <span className="grow" />
          {csv && (
            <button className="btn ghost" onClick={() => { const cs = cols.filter((c) => c.val && !c.noCsv); downloadCsv(csv, cs.map((c) => c.head), sorted.map((r) => cs.map((c) => c.val!(r)))); }}>
              <Download size={14} />CSV indir
            </button>
          )}
        </div>
      )}
    </>
  );
}

/* ---------- Notlar ---------- */
export function Notes({ en }: { en: Ent }) {
  const st = useStore();
  const [text, setText] = useState('');
  const mine = st.notes.filter((n) => n.en === en);
  return (
    <Card title="Notlar" hint="Yalnızca bu tarayıcıda saklanır.">
      <form className="col" style={{ gap: 8 }} onSubmit={(e) => { e.preventDefault(); if (text.trim()) { addNote(en, text.trim()); setText(''); } }}>
        <textarea className="input" rows={3} placeholder={`${entName(en)} için not yazın`} value={text} onChange={(e) => setText(e.target.value)} />
        <div><button className="btn pri" disabled={!text.trim()}>Not ekle</button></div>
      </form>
      {mine.map((n) => (
        <div key={n.id} className="row" style={{ alignItems: 'flex-start', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
          <div className="grow">
            <div style={{ whiteSpace: 'pre-wrap' }}>{n.text}</div>
            <div className="xs dim" style={{ marginTop: 3 }}>{date(n.at.slice(0, 10), true)}</div>
          </div>
          <button className="btn ghost icon" aria-label="Notu sil" onClick={() => delNote(n.id)}><Trash2 size={15} /></button>
        </div>
      ))}
    </Card>
  );
}

/* ---------- URL durumu ---------- */
export function useQuery() {
  const [sp, setSp] = useSearchParams();
  return {
    get: (k: string, d = '') => sp.get(k) ?? d,
    put: (patch: Record<string, string | null>) => {
      const n = new URLSearchParams(sp);
      for (const [k, v] of Object.entries(patch)) { if (v == null || v === '') n.delete(k); else n.set(k, v); }
      setSp(n, { replace: true });
    },
    str: sp.toString(),
  };
}
export { fmt, sgn };
