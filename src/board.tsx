// Karşılaştırma panosu. Aynı satırları seçilen görünümde çizer (çubuk, sütun, nokta, renkli tablo, karşı karşıya, fark, radar)
// ve bu görünümleri kullanan ortak kutuları, seçicileri ve "özellikler" tablosunu barındırır.
import { useState, type ComponentType, type CSSProperties, type ReactNode } from 'react';
import { ChartBar, ChartColumn, ChartScatter, Table2, ArrowLeftRight, Radar as RadarIcon, Diff, ChartLine, MoveHorizontal, ListFilter, Check, Download, ArrowUp, ArrowDown, LayoutGrid } from 'lucide-react';
import { ds, NE, METRICS, METRIC_IDS, SUBJECTS, TOPICS, cnt, mval, entName, scopeKind, scopeName, scopeTopics, type Cnt, type Ent, type Metric, type Scope } from './engine/core';
import { fmt, pct as fpct, date } from './engine/fmt';
import { Card, Seg, Pop, LevelLegend, Delta, Empty, downloadCsv, kOf, useQuery } from './ui';
import { LineChart, GapChart, Dumbbell, Legend, niceTicks, type Ser } from './charts';
import { GroupBars, Butterfly, DiffBars, Dots, Columns, Radar, HeatTable, leadOf, type CmpRow, type CmpFmt } from './cmpcharts';

type Q = ReturnType<typeof useQuery>;
const some = (v: number | null | undefined): v is number => v != null;
/** Deneme etiketleri (D1, D2…) ve uzun adları. */
export const EXL = ds.exams.map((e) => `D${e.no}`);
export const EXT = ds.exams.map((e) => `${e.name}, ${date(e.date)}`);

/* ================= Görünüm seçici ================= */
export type View = 'cubuk' | 'sutun' | 'nokta' | 'tablo' | 'karsi' | 'fark' | 'radar' | 'serit';
export type TView = 'cizgi' | 'sutun' | 'ilkson' | 'tablo' | 'fark';
type Icon = ComponentType<{ size?: number | string; strokeWidth?: number | string }>;
const VIEW: Record<View | TView, { label: string; icon: Icon }> = {
  cubuk: { label: 'Çubuk', icon: ChartBar },
  sutun: { label: 'Sütun', icon: ChartColumn },
  nokta: { label: 'Nokta', icon: ChartScatter },
  tablo: { label: 'Renkli tablo', icon: Table2 },
  karsi: { label: 'Karşı karşıya', icon: ArrowLeftRight },
  fark: { label: 'Fark', icon: Diff },
  radar: { label: 'Radar', icon: RadarIcon },
  serit: { label: 'Deneme deneme', icon: LayoutGrid },
  cizgi: { label: 'Çizgi', icon: ChartLine },
  ilkson: { label: 'İlk ve son', icon: MoveHorizontal },
};
/** `mini`: kutu başlığına sığan dar biçim; yalnız seçili görünümün adı yazar, diğerleri simgedir. */
export function ViewSeg<T extends View | TView>({ value, onChange, views, mini }: { value: T; onChange: (v: T) => void; views: T[]; mini?: boolean }) {
  if (views.length < 2) return null;
  return (
    <div className={`vseg no-print ${mini ? 'mini' : ''}`} role="group" aria-label="Grafik türü">
      {views.map((id) => {
        const I = VIEW[id].icon;
        return <button key={id} className={id === value ? 'on' : ''} aria-pressed={id === value} title={VIEW[id].label} onClick={() => onChange(id)}><I size={15} /><span>{VIEW[id].label}</span></button>;
      })}
    </div>
  );
}
/** Karşılaştırılan sayısına ve satırlara göre kullanılabilen görünümler. Her durumda en az dördü vardır. */
export function viewsFor(k: number, rows: CmpRow[]): View[] {
  const full = rows.filter((r) => r.vals.every(some)).length;
  return [k === 2 && 'karsi', 'cubuk', 'sutun', 'nokta', k === 2 && 'fark', k <= 4 && full >= 3 && full <= 12 && 'radar', 'tablo'].filter(Boolean) as View[];
}
export const defView = (k: number): View => (k === 2 ? 'karsi' : k > 4 ? 'tablo' : 'cubuk');
export const timeViews = (k: number): TView[] => ['cizgi', 'sutun', 'ilkson', 'tablo', k === 2 && 'fark'].filter(Boolean) as TView[];

/* ================= Satır ve ölçek ================= */
/** Sayımlardan bir karşılaştırma satırı. `share`: satırların soru sayısı farklıysa çubuk boyu soru sayısına oranlanır. */
export function mkRow(key: string, name: string, label: ReactNode, cs: (Cnt | null)[], m: Metric, share: boolean, color?: string): CmpRow {
  const ok = cs.map((c) => (c && c.n ? c : null));
  const vals = ok.map((c) => mval(c, m));
  const fill = m === 'pct' || !share ? vals.map((v) => (v == null ? null : Math.max(0, v))) : ok.map((c, i) => (c && vals[i] != null ? Math.max(0, (100 * vals[i]! * c.k) / c.n) : null));
  return { key, name, label, vals, fill, pct: ok.map((c) => mval(c, 'pct')), color };
}
const niceTop = (x: number) => { const t = niceTicks(0, x || 1, 4); return t[t.length - 1]; };
export const showM = (m: Metric) => (v: number | null) => (m === 'pct' ? fpct(v) : fmt(v, METRICS[m].dig));
export function fmtFor(m: Metric, rows: CmpRow[], share: boolean): CmpFmt {
  const M = METRICS[m];
  const mx = Math.max(0, ...rows.flatMap((r) => (r.fill ?? r.vals).map((v) => v ?? 0)));
  const vmax = Math.max(0, ...rows.flatMap((r) => r.vals.map((v) => Math.abs(v ?? 0))));
  const dig = m !== 'pct' && vmax > 0 && vmax < 2 ? 2 : M.dig;
  return {
    show: (v) => (m === 'pct' ? fpct(v) : fmt(v, dig)), dig, up: M.up,
    top: m === 'pct' ? 100 : share ? (M.up ? 100 : Math.min(100, niceTop(mx))) : niceTop(mx),
    axis: m === 'pct' || !share,
    heat: m === 'y' ? 'bad' : m === 'b' ? 'ink' : 'lv',
    lead: m === 'y' ? 'daha az yanlış' : m === 'b' ? 'daha az boş' : 'önde',
    leadCap: m === 'y' ? 'Daha az yanlış yaptığı' : m === 'b' ? 'Daha az boş bıraktığı' : 'Önde olduğu',
  };
}
const spreadOf = (r: CmpRow) => { const v = (r.fill ?? r.vals).filter(some); return v.length > 1 ? Math.max(...v) - Math.min(...v) : -1; };

/* ================= Pano ================= */
interface BoardP {
  rows: CmpRow[]; names: string[]; colors: string[]; f: CmpFmt; view: View;
  /** tablo başlığı ("Ders"), sayım sözü ("ders") ve "4 derste önde" yazısındaki biçimi ("derste") */
  head: string; noun: string; at: string;
  onPick?: (key: string) => void;
  /** liste görünümlerinde ilk kaç satır gösterilsin */
  limit?: number;
  /** aradaki farkı en büyük olan satır üstte */
  sorted?: boolean;
}
export function Board({ rows, names, colors, f, view, head, noun, at, onPick, limit = 0, sorted }: BoardP) {
  const [all, setAll] = useState(false);
  const many = names.length > 1;
  const wins = names.map((_, i) => rows.filter((r) => leadOf(r.vals, f.dig, f.up) === i).length);
  const ties = rows.filter((r) => r.vals.filter(some).length > 1 && leadOf(r.vals, f.dig, f.up) < 0).length;
  const full = rows.filter((r) => r.vals.every(some));
  const lead01 = (r: CmpRow) => ((r.vals[0] ?? 0) - (r.vals[1] ?? 0)) * (f.up ? 1 : -1);
  const list = view === 'karsi' || view === 'fark' ? [...rows.filter((r) => r.vals[0] != null && r.vals[1] != null)].sort((a, b) => lead01(b) - lead01(a))
    : sorted && many ? [...rows].sort((a, b) => spreadOf(b) - spreadOf(a)) : rows;
  const cut = limit > 0 && list.length > limit, shown = cut && !all ? list.slice(0, limit) : list;
  const p = { names, colors, f };
  return (
    <>
      {many && view !== 'karsi' && (
        <div className="legend" style={{ marginBottom: 14 }}>
          {names.map((n, i) => <span key={i}><i style={{ background: colors[i] }} />{n}{rows.length > 1 && `: ${wins[i]} ${at} ${f.lead}`}</span>)}
        </div>
      )}
      {view === 'karsi' ? <Butterfly rows={shown} {...p} wins={wins} ties={ties} noun={noun} />
        : view === 'fark' ? <DiffBars rows={shown} {...p} />
        : view === 'sutun' ? <Columns rows={shown} {...p} onPick={onPick} />
        : view === 'nokta' ? <Dots rows={shown} {...p} />
        : view === 'radar' ? (
          <div className="grid g2" style={{ alignItems: 'center' }}>
            <Radar rows={full} {...p} onPick={onPick} />
            <HeatTable rows={full} {...p} head={head} />
          </div>
        ) : view === 'tablo' ? <HeatTable rows={shown} {...p} head={head} />
        : <GroupBars rows={shown} {...p} />}
      {(view === 'tablo' || view === 'radar') && (
        <div className="row wrap" style={{ marginTop: 12, gap: '6px 20px' }}>
          {f.heat === 'lv' ? <LevelLegend /> : <span className="sm dim">Kutu koyulaştıkça {f.heat === 'bad' ? 'yanlış' : 'boş'} artar.</span>}
          {many && <span className="sm dim">Çerçeveli kutu, satırın en iyisidir.</span>}
        </div>
      )}
      {!f.axis && view !== 'tablo' && <p className="sm dim" style={{ margin: '12px 0 0' }}>Yazan sayı değerin kendisidir. Çubuğun boyu soru sayısına oranlıdır: 40 soruda 20 ile 10 soruda 5 aynı boydadır.</p>}
      {cut && view !== 'radar' && (
        <div className="no-print" style={{ marginTop: 12 }}>
          <button className="btn ghost" onClick={() => setAll(!all)}>{all ? 'Daralt' : `Tümünü göster (${list.length} ${noun})`}</button>
        </div>
      )}
    </>
  );
}

interface CmpCardP extends Omit<BoardP, 'view'> {
  title: ReactNode; hint?: ReactNode; icon?: ReactNode; k?: string; style?: CSSProperties;
  /** başlığın sağındaki ek seçiciler */
  extra?: ReactNode;
  def?: View;
  /** verilirse görünüm dışarıdan yönetilir (ör. adres çubuğunda saklanır) */
  view?: View | null; onView?: (v: View) => void;
  /** çubuk görünümü için hazır içerik (kıyas çizgisi, değişim oku gibi ekleri olan çubuklar) */
  cubuk?: ReactNode;
  /** verilirse ilk görünüm olur: her satırın deneme deneme durumunu gösteren hazır şerit */
  serit?: ReactNode;
  footer?: ReactNode;
  /** görünüm seçici başlığın sağında, dar biçimde durur (yarım genişlikteki kutular için) */
  compact?: boolean;
}
/** Karşılaştırma kutusu: üstte görünüm seçici, altında seçilen grafik. */
export function CmpCard({ title, hint, icon, k, style, extra, def, view, onView, cubuk, serit, footer, compact, ...b }: CmpCardP) {
  const [own, setOwn] = useState<View | null>(null);
  const views: View[] = [...(serit ? ['serit' as View] : []), ...viewsFor(b.names.length, b.rows)];
  const want = view ?? own ?? def ?? (serit ? 'serit' : defView(b.names.length)), v = views.includes(want) ? want : serit ? 'serit' : 'cubuk';
  const seg = b.rows.length > 0 && <ViewSeg mini={compact} value={v} onChange={(x) => (onView ?? setOwn)(x)} views={views} />;
  return (
    <Card className="cmp-card" title={title} hint={hint} icon={icon} k={k} style={style} action={compact ? <div className="row wrap" style={{ justifyContent: 'flex-end', gap: '8px 12px' }}>{extra}{seg}</div> : extra}>
      {!b.rows.length ? <Empty title="Gösterilecek veri yok">Seçilen denemelerde bu kapsamda soru bulunmuyor.</Empty> : (
        <>
          {!compact && seg}
          {v === 'serit' ? serit : v === 'cubuk' && cubuk ? cubuk : <Board {...b} view={v} />}
        </>
      )}
      {footer}
    </Card>
  );
}

/* ================= Denemeden denemeye ================= */
export interface TSer extends Ser { pct?: (number | null)[] }
/** Bir varlığın seçili denemelerdeki değerleri. Kapsamda soru olmayan deneme boş bırakılır. */
export function timeSer(en: Ent, sc: Scope, m: Metric, color: string, exams: number[], extra: Partial<Ser> = {}): TSer {
  const cs = exams.map((e) => { const c = cnt(en, e, sc); return c && c.n ? c : null; });
  return { name: entName(en), color, values: cs.map((c) => mval(c, m)), pct: cs.map((c) => mval(c, 'pct')), ...extra };
}
export function TimeBoard({ series, m, view, exams, height = 280, strip }: { series: TSer[]; m: Metric; view: TView; exams: number[]; height?: number; strip?: boolean }) {
  const M = METRICS[m], show = showM(m), many = series.length > 1;
  const labels = exams.map((e) => EXL[e]), titles = exams.map((e) => EXT[e]);
  const names = series.map((s) => s.name), colors = series.map((s) => s.color);
  const rows: CmpRow[] = exams.map((e, j) => ({ key: `${e}`, name: EXL[e], label: <span title={EXT[e]}>{EXL[e]} <small className="dim">{date(ds.exams[e].date)}</small></span>, vals: series.map((s) => s.values[j]), pct: series.map((s) => s.pct?.[j] ?? null), color: many ? undefined : series[0].color }));
  const f: CmpFmt = { ...fmtFor(m, rows, false), top: m === 'pct' ? 100 : niceTop(Math.max(0, ...series.flatMap((s) => s.values.map((v) => v ?? 0)))) };
  const ends = (s: TSer) => { const v = s.values.filter(some); return { a: v.length > 1 ? v[0] : null, b: v[v.length - 1] ?? null }; };
  const lead = exams.map((_, j) => leadOf(series.map((s) => s.values[j]), M.dig, M.up));
  const led = series.map((_, i) => lead.filter((x) => x === i).length);
  const legend = many && <div style={{ marginBottom: 10 }}><Legend items={series.map((s) => ({ name: s.name, color: s.color }))} /></div>;
  if (view === 'fark' && series.length === 2) return (
    <>
      <div style={{ marginBottom: 10 }}><Legend items={[0, 1].map((i) => ({ name: `${names[i]} ${M.up ? 'önde' : 'daha yüksek'}: çubuk ${i ? 'aşağı' : 'yukarı'}`, color: colors[i] }))} /></div>
      <GapChart a={series[0].values} b={series[1].values} names={names} colors={colors} labels={labels} titles={titles} dig={M.dig} height={height} />
    </>
  );
  if (view === 'ilkson') return (
    <>
      <div className="legend" style={{ marginBottom: 8 }}>
        <span><i className="db-lg a" />İlk deneme ({labels[0]})</span>
        <span><i className="db-lg" />Son deneme ({labels[labels.length - 1]})</span>
      </div>
      <Dumbbell show={show} rows={series.map((s) => { const { a, b } = ends(s); return { key: s.name, label: <span className="row" style={{ gap: 8 }}><i className="cmp-sq" style={{ background: s.color }} />{s.name}</span>, color: s.color, a, b, right: <Delta v={a != null && b != null ? b - a : null} m={m} /> }; })} />
    </>
  );
  if (view === 'sutun') return <>{legend}<Columns rows={rows} names={names} colors={colors} f={f} height={height} /></>;
  if (view === 'tablo') return (
    <>
      <HeatTable rows={rows} names={names} colors={many ? colors : []} f={f} head="Deneme" />
      <div className="row wrap" style={{ marginTop: 12, gap: '6px 20px' }}>
        {f.heat === 'lv' ? <LevelLegend /> : <span className="sm dim">Kutu koyulaştıkça {f.heat === 'bad' ? 'yanlış' : 'boş'} artar.</span>}
      </div>
    </>
  );
  return (
    <>
      <LineChart series={series} labels={labels} titles={titles} dig={M.dig} height={height} />
      {strip && many && (
        <div className="ls">
          <span className="ls-t">{M.up ? 'Her denemede kim önde' : `Her denemede en az ${M.short} kimde`}</span>
          <div className="ls-cells">
            {lead.map((li, j) => <span key={j} title={`${titles[j]}: ${li >= 0 ? names[li] : 'eşit'}`}><i style={{ background: li >= 0 ? colors[li] : 'var(--sunken)' }} />{labels[j]}</span>)}
          </div>
          <div className="legend">{series.map((s, i) => led[i] > 0 && <span key={s.name}><i style={{ background: s.color }} />{s.name}: {led[i]} deneme</span>)}</div>
        </div>
      )}
    </>
  );
}
export function TimeCard({ title = 'Denemelere göre', hint, icon, k, style, extra, series, m, exams, def = 'cizgi', view, onView, height, strip, compact }: {
  title?: ReactNode; hint?: ReactNode; icon?: ReactNode; k?: string; style?: CSSProperties; extra?: ReactNode;
  series: TSer[]; m: Metric; exams: number[]; def?: TView; view?: TView | null; onView?: (v: TView) => void; height?: number; strip?: boolean; compact?: boolean;
}) {
  const [own, setOwn] = useState<TView | null>(null);
  const views = timeViews(series.length), want = view ?? own ?? def, v = views.includes(want) ? want : 'cizgi';
  const seg = <ViewSeg mini={compact} value={v} onChange={(x) => (onView ?? setOwn)(x)} views={views} />;
  return (
    <Card className="cmp-card" title={title} hint={hint} icon={icon} k={k} style={style} action={compact ? <div className="row wrap" style={{ justifyContent: 'flex-end', gap: '8px 12px' }}>{extra}{seg}</div> : extra}>
      {!compact && seg}
      <TimeBoard series={series} m={m} view={v} exams={exams} height={height} strip={strip} />
    </Card>
  );
}

/* ================= Seçiciler ================= */
/** Adresteki deneme seçimi: `d` tek tek seçilenler (1'den başlar), `r` son kaç deneme. */
export function examSel(q: Q, defR = 'hepsi'): { exams: number[]; label: string; r: string; custom: boolean } {
  const list = [...new Set(q.get('d').split(',').map((x) => +x - 1).filter((e) => Number.isInteger(e) && e >= 0 && e < NE))].sort((a, b) => a - b);
  if (list.length) return { exams: list, label: list.length === 1 ? EXL[list[0]] : `seçilen ${list.length} deneme`, r: '', custom: true };
  const r = ['3', '5', 'hepsi'].includes(q.get('r')) ? q.get('r') : defR, n = r === 'hepsi' ? NE : Math.min(NE, +r);
  return { exams: Array.from({ length: n }, (_, i) => NE - n + i), label: r === 'hepsi' ? `${NE} deneme` : `son ${n} deneme`, r, custom: false };
}
export function ExamPick({ q, id, defR = 'hepsi' }: { q: Q; id: string; defR?: string }) {
  const sel = examSel(q, defR);
  const toggle = (e: number) => {
    const s = new Set(sel.custom ? sel.exams : []);
    if (s.has(e)) s.delete(e); else s.add(e);
    q.put({ d: [...s].sort((a, b) => a - b).map((x) => x + 1).join(',') || null, r: null });
  };
  return (
    <div className="row" style={{ gap: 6 }}>
      <Seg id={id} value={sel.r} onChange={(x) => q.put({ r: x === defR ? null : x, d: null })} options={[{ id: '3', label: 'Son 3' }, { id: '5', label: 'Son 5' }, { id: 'hepsi', label: 'Tümü' }]} />
      <Pop right button={<button className={`btn ${sel.custom ? 'on' : ''}`}><ListFilter size={15} />{sel.custom ? `${sel.exams.length} deneme seçili` : 'Tek tek seç'}</button>}>
        {() => (
          <div className="pop-list">
            <div className="pop-group">Karşılaştırılacak denemeleri işaretleyin</div>
            {ds.exams.map((x) => {
              const on = sel.custom && sel.exams.includes(x.i);
              return (
                <button key={x.i} className={`pop-item ${on ? 'on' : ''}`} onClick={() => toggle(x.i)}>
                  <span className={`chk ${on ? 'on' : ''}`}>{on && <Check size={12} strokeWidth={3.2} />}</span>
                  <span className="clip">{x.name}</span><small>{date(x.date)}</small>
                </button>
              );
            })}
          </div>
        )}
      </Pop>
    </div>
  );
}
const MNAME: Record<Metric, string> = { net: 'Net', pct: 'Doğru oranı', d: 'Doğru', y: 'Yanlış', b: 'Boş' };
export function MetricSeg({ value, onChange, id }: { value: Metric; onChange: (m: Metric) => void; id: string }) {
  return <Seg id={id} value={value} onChange={onChange} options={METRIC_IDS.map((x) => ({ id: x, label: MNAME[x] }))} />;
}
/** Üstünde ne olduğu yazan seçici. */
export function Ctl({ label, children }: { label: string; children: ReactNode }) {
  return <div className="ctl"><span className="ctl-l">{label}</span>{children}</div>;
}
/** Değeri bir ad olan özet kutusu ("En zayıf konu: Üslü Sayılar"). */
export function NameTile({ label, name, sub, tone = '', icon }: { label: ReactNode; name: ReactNode; sub?: ReactNode; tone?: '' | 'good' | 'mid' | 'bad' | 'brand'; icon?: ReactNode }) {
  return (
    <div className={`tile ${tone}`}>
      <div className="t-l">{icon && <span className="t-ic">{icon}</span>}<span>{label}</span></div>
      <div className="t-v txt">{name}</div>
      {sub && <div className="t-s">{sub}</div>}
    </div>
  );
}

/* ================= Kapsam ve kırılım yardımcıları ================= */
export const validEnt = (en: string) => { try { return /^(o|l:(11|12)|[cst]:\d+)$/.test(en) && !!entName(en); } catch { return false; } };
export const okScope = (sc: string) => { try { return !!sc && !!scopeName(sc) && scopeTopics(sc).length > 0; } catch { return false; } };
/** Kapsamın ders grubu rengi. */
export const scColor = (sc: Scope) => { const k = kOf(sc); return k === 'k-brand' ? 'var(--accent)' : `var(--s-${k.slice(2)})`; };
export type Brk = 'test' | 'ders' | 'konu' | 'sinif' | 'ogrenci' | 'deneme';
export const BRK: Record<Brk, { many: string; one: string; at: string; head: string }> = {
  test: { many: 'Testler', one: 'test', at: 'testte', head: 'Test' },
  ders: { many: 'Dersler', one: 'ders', at: 'derste', head: 'Ders' },
  konu: { many: 'Konular', one: 'konu', at: 'konuda', head: 'Konu' },
  sinif: { many: 'Sınıflar', one: 'sınıf', at: 'sınıfta', head: 'Sınıf' },
  ogrenci: { many: 'Öğrenciler', one: 'öğrenci', at: 'öğrencide', head: 'Öğrenci' },
  deneme: { many: 'Denemeler', one: 'deneme', at: 'denemede', head: 'Deneme' },
};
/** Kapsamın açılabileceği kırılımlar: toplamda test, ders ve konu; derste yalnız konu. */
export function kidKinds(sc: Scope): Brk[] {
  const k = scopeKind(sc);
  if (k === 'all') return ['test', 'ders', 'konu'];
  if (k === 'test') return new Set(scopeTopics(sc).map((t) => TOPICS[t].subject)).size > 1 ? ['ders', 'konu'] : ['konu'];
  return k === 'subject' ? ['konu'] : [];
}
export function kidScopes(sc: Scope, b: Brk): Scope[] {
  const ts = scopeTopics(sc);
  if (b === 'konu') return ts.map((t) => `k:${t}`);
  if (b === 'ders') return [...new Set(ts.map((t) => TOPICS[t].subject))].map((j) => `s:${j}`);
  if (b === 'test') return [...new Set(ts.map((t) => SUBJECTS[TOPICS[t].subject].test))].map((id) => `t:${id}`);
  return [];
}

/* ================= Özellikler tablosu ================= */
export interface FeatRow { key: string; name: string; label?: ReactNode; vals: (number | null)[]; show: (v: number | null) => string; dig?: number; up?: boolean; group?: string }
/** Özellikler alt alta, karşılaştırılanlar yan yana. Her satırda en iyi değer yeşil, en kötü kırmızı işaretlenir.
 *  `diff`: 'degisim' ilk sütundan son sütuna değişimi (denemeler), 'fark' en yüksek ile en düşük arasını (kişiler) yazar. */
export function FeatTable({ cols, rows, csv, first = 'Özellik', diff }: { cols: { name: string; sub?: string; color?: string }[]; rows: FeatRow[]; csv?: string; first?: string; diff: 'degisim' | 'fark' }) {
  const dv = (r: FeatRow) => {
    const v = r.vals.filter(some).map((x) => +x.toFixed(r.dig ?? 1));
    if (v.length < 2) return null;
    return diff === 'degisim' ? v[v.length - 1] - v[0] : Math.max(...v) - Math.min(...v);
  };
  const dh = diff === 'degisim' ? 'Değişim' : 'Fark';
  let last = '';
  return (
    <>
      <div className="tbl-wrap">
        <table className="ft" style={{ minWidth: 220 + cols.length * 92 }}>
          <thead>
            <tr>
              <th>{first}</th>
              {cols.map((c, i) => <th key={i} className="r" title={c.sub}><span className="ft-h">{c.color && <i style={{ background: c.color }} />}<span className="clip">{c.name}</span></span>{c.sub && <small>{c.sub}</small>}</th>)}
              {cols.length > 1 && <th className="r">{dh}</th>}
            </tr>
          </thead>
          <tbody>
            {rows.flatMap((r) => {
              const dig = r.dig ?? 1, v = r.vals.filter(some).map((x) => +x.toFixed(dig));
              const hi = v.length ? Math.max(...v) : null, lo = v.length ? Math.min(...v) : null, mark = r.up != null && v.length > 1 && hi !== lo;
              const best = r.up ? hi : lo, worst = r.up ? lo : hi, d = dv(r);
              const zero = d == null || fmt(Math.abs(d), dig) === fmt(0, dig);
              const out = [
                <tr key={r.key}>
                  <td>{r.label ?? r.name}</td>
                  {r.vals.map((x, i) => {
                    const y = x == null ? null : +x.toFixed(dig);
                    return <td key={i} className="r"><span className={mark && y === best ? 'best' : mark && cols.length > 2 && y === worst ? 'worst' : ''}>{r.show(x)}</span></td>;
                  })}
                  {cols.length > 1 && (
                    <td className="r">
                      {d == null ? '–' : diff === 'fark' ? fmt(d, dig) : (
                        <span className={`delta ${zero || r.up == null ? 'flat' : (r.up ? d > 0 : d < 0) ? 'up' : 'dn'}`}>
                          {!zero && (d > 0 ? <ArrowUp size={13} strokeWidth={2.7} /> : <ArrowDown size={13} strokeWidth={2.7} />)}{fmt(Math.abs(d), dig)}
                        </span>
                      )}
                    </td>
                  )}
                </tr>,
              ];
              if (r.group && r.group !== last) { last = r.group; out.unshift(<tr key={`g-${r.group}`} className="ft-g"><td colSpan={cols.length + 2}>{r.group}</td></tr>); }
              return out;
            })}
          </tbody>
        </table>
      </div>
      <div className="tbl-foot no-print">
        <span className="row" style={{ gap: 14 }}>
          <span><i className="ft-key best" />En iyi</span>
          {cols.length > 2 && <span><i className="ft-key worst" />En kötü</span>}
        </span>
        <span className="grow" />
        {csv && (
          <button className="btn ghost" onClick={() => downloadCsv(csv, [first, ...cols.map((c) => c.name), ...(cols.length > 1 ? [dh] : [])], rows.map((r) => [r.group ? `${r.group}: ${r.name}` : r.name, ...r.vals, ...(cols.length > 1 ? [dv(r)] : [])]))}>
            <Download size={14} />CSV indir
          </button>
        )}
      </div>
    </>
  );
}
