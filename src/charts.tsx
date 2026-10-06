// Grafikler. Renkler tasarım değişkenlerinden gelir; her grafikte üzerine gelince değer okunur.
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ds, SUBJECTS, TOPICS, TESTS, type Ent, entName } from './engine/core';
import { dependents, type TopicStat, type QStat } from './engine/analysis';
import { fmt, sgn, pct as fpct } from './engine/fmt';
import { Tip, kOf, lv, LV_LO } from './ui';

export const SERIES = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)', 'var(--c7)', 'var(--c8)'];
export const MAX_SERIES = SERIES.length;
export function useSize(): [RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.clientWidth);
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}
export function niceTicks(lo: number, hi: number, count = 4): number[] {
  if (lo === hi) { lo -= 1; hi += 1; }
  const raw = (hi - lo) / count, mag = 10 ** Math.floor(Math.log10(raw)), n = raw / mag;
  const step = (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
  const out: number[] = [];
  for (let v = Math.floor(lo / step) * step; v < hi + step * 0.999; v += step) out.push(Math.round(v / step) * step);
  return out;
}

export function Legend({ items }: { items: { name: string; color: string; line?: boolean }[] }) {
  return <div className="legend">{items.map((s) => <span key={s.name}><i className={s.line ? 'ln' : ''} style={{ background: s.color }} />{s.name}</span>)}</div>;
}

/* ================= Çizgi ================= */
export interface Ser { name: string; color: string; values: (number | null)[]; dash?: boolean }
export function LineChart({ series, labels, titles, height = 250, dig = 1, legend = true, zero }: { series: Ser[]; labels: string[]; titles?: string[]; height?: number; dig?: number; legend?: boolean; zero?: boolean }) {
  const [ref, W] = useSize();
  const [hov, setHov] = useState<{ i: number; x: number; y: number } | null>(null);
  const reduce = useReducedMotion();
  const vals = series.flatMap((s) => s.values).filter((v): v is number => v != null);
  const lo = zero ? Math.min(0, ...vals) : Math.min(...vals), hi = Math.max(...vals);
  const ticks = vals.length ? niceTicks(lo - (hi - lo) * 0.06, hi + (hi - lo) * 0.06, 4) : [0, 1];
  const d0 = ticks[0], d1 = ticks[ticks.length - 1];
  const L = 40, R = 14, T = 8, B = 26, n = labels.length;
  const x = (i: number) => L + (n > 1 ? i / (n - 1) : 0.5) * Math.max(0, W - L - R);
  const y = (v: number) => T + (1 - (v - d0) / (d1 - d0 || 1)) * (height - T - B);
  const path = (v: (number | null)[]) => {
    let d = '', pen = false;
    v.forEach((p, i) => { if (p == null) { pen = false; return; } d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p).toFixed(1)}`; pen = true; });
    return d;
  };
  const every = n > 0 && (W - L - R) / n < 52 ? 2 : 1;
  const dots = series.length <= 3 && n <= 12;
  return (
    <div>
      {legend && series.length > 1 && <div style={{ marginBottom: 10 }}><Legend items={series.map((s) => ({ ...s, line: true }))} /></div>}
      <div className="chart" ref={ref} style={{ height }}>
        {W > 0 && (
          <svg width={W} height={height} role="img" aria-label={`Çizgi grafik: ${series.map((s) => s.name).join(', ')}`}
            onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const i = Math.max(0, Math.min(n - 1, Math.round(((e.clientX - r.left - L) / Math.max(1, W - L - R)) * (n - 1)))); setHov({ i, x: e.clientX, y: e.clientY }); }}
            onMouseLeave={() => setHov(null)}>
            {ticks.map((t) => <g key={t}><line className="gridl" x1={L} x2={W - R} y1={y(t)} y2={y(t)} /><text x={L - 8} y={y(t) + 4} textAnchor="end">{fmt(t, Math.abs(d1 - d0) < 4 ? 1 : 0)}</text></g>)}
            {labels.map((l, i) => (i % every === 0 || i === n - 1) && (i === n - 1 || n - 1 - i >= every || every === 1) && <text key={i} x={x(i)} y={height - 6} textAnchor="middle">{l}</text>)}
            {hov && <line x1={x(hov.i)} x2={x(hov.i)} y1={T} y2={height - B} stroke="var(--line2)" strokeWidth={1} />}
            {series.map((s) => s.dash || reduce
              ? <path key={s.name} d={path(s.values)} fill="none" stroke={s.color} strokeWidth={2} strokeDasharray={s.dash ? '2 5' : undefined} strokeLinecap="round" strokeLinejoin="round" />
              : <motion.path key={s.name} d={path(s.values)} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: [0.3, 0, 0.1, 1] }} />)}
            {series.map((s) => s.values.map((v, i) => v != null && ((dots && !s.dash) || hov?.i === i) && <circle key={`${s.name}${i}`} cx={x(i)} cy={y(v)} r={hov?.i === i ? 5 : 4} fill={s.color} stroke="var(--surface)" strokeWidth={2} />))}
          </svg>
        )}
        {hov && (
          <Tip x={hov.x} y={hov.y}>
            <h4>{titles?.[hov.i] ?? labels[hov.i]}</h4>
            {series.map((s) => ({ s, v: s.values[hov.i] })).filter((r) => r.v != null).sort((a, b) => b.v! - a.v!).map(({ s, v }) => (
              <div className="tr" key={s.name}><i style={{ background: s.color }} />{s.name}<b>{fmt(v, dig)}</b></div>
            ))}
          </Tip>
        )}
      </div>
    </div>
  );
}

/* ================= Ayrışan / düz çubuk satırları ================= */
export interface BarRow { key: string; label: ReactNode; v: number; right?: ReactNode; text?: string }
/** Sıfır ekseninden iki yana uzayan çubuklar (artış sağa, azalış sola) */
/** Sıfırdan iki yana açılan çubuklar. `edge`: bütün satırlar aynı yöndeyse eksen kenara alınır, çubuklar tüm genişliği kullanır. */
export function DivBars({ rows, dig = 1, max, wide, good, edge }: { rows: BarRow[]; dig?: number; max?: number; wide?: boolean; good?: (v: number) => boolean; edge?: boolean }) {
  const m = max ?? Math.max(1e-9, ...rows.map((r) => Math.abs(r.v)));
  const reduce = useReducedMotion();
  const ax = !edge ? 50 : rows.every((r) => r.v >= 0) ? 0 : rows.every((r) => r.v <= 0) ? 100 : 50;
  return (
    <div className="bars">
      {rows.map((r) => {
        const w = (Math.min(1, Math.abs(r.v) / m) * (ax === 50 ? 50 : 100)).toFixed(2), pos = r.v >= 0;
        const ok = good ? good(r.v) : pos;
        return (
          <div className={`bar-row ${wide ? 'wide' : ''}`} key={r.key}>
            <div className="clip">{r.label}</div>
            <div className="bar-track">
              <div className="axis" style={{ left: `${ax}%` }} />
              <motion.div className={`bar-fill ${ok ? 'pos' : 'neg'}`} style={{ [pos ? 'left' : 'right']: `${pos ? ax : 100 - ax}%`, borderRadius: pos ? '0 4px 4px 0' : '4px 0 0 4px' }}
                initial={reduce ? false : { width: 0 }} animate={{ width: `${w}%` }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} />
            </div>
            <div className="right n" style={{ fontWeight: 650, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{r.text ?? sgn(r.v, dig)}</div>
            <div>{r.right}</div>
          </div>
        );
      })}
    </div>
  );
}
/** 0'dan başlayan çubuklar. `k`: satırın rengi (ders grubu ya da durum). `of`: satırın kendi tavanı (ör. 40 soruda 25 net);
 *  verilirse çubuk gri bir zemin üzerinde bu tavana göre dolar. `ref`: kıyas çizgisi. */
export function Bars({ rows, max, dig = 0, unit = '', wide, tw }: { rows: (BarRow & { ref?: number | null; k?: string; of?: number })[]; max?: number; dig?: number; unit?: string; wide?: boolean; tw?: number }) {
  const m = max ?? Math.max(1e-9, ...rows.map((r) => Math.max(r.v, r.ref ?? 0)));
  const reduce = useReducedMotion();
  return (
    <div className="bars" style={tw ? ({ '--tw': `${tw}px` } as CSSProperties) : undefined}>
      {rows.map((r) => {
        const d = r.of ?? m;
        return (
          <div className={`bar-row ${wide ? 'wide' : ''} ${r.k ?? ''}`} key={r.key}>
            <div className="clip">{r.label}</div>
            <div className={`bar-track ${r.of ? 'of' : ''}`}>
              <motion.div className="bar-fill plain" style={{ left: 0 }} initial={reduce ? false : { width: 0 }} animate={{ width: `${(Math.max(0, Math.min(1, r.v / d)) * 100).toFixed(2)}%` }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} />
              {r.ref != null && <div className="axis ref" style={{ left: `${Math.min(1, r.ref / d) * 100}%` }} />}
            </div>
            <div className="right" style={{ fontWeight: 650, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{r.text ?? `${unit}${fmt(r.v, dig)}`}</div>
            <div>{r.right}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ================= Denemeden denemeye ================= */
/** Fark grafiği: her denemede iki karşılaştırılan arasındaki fark. Yukarı uzayan çubukta birinci, aşağı uzayanda ikinci daha yüksektir. */
export function GapChart({ a, b, names, colors, labels, titles, dig = 1, height = 300 }: { a: (number | null)[]; b: (number | null)[]; names: string[]; colors: string[]; labels: string[]; titles?: string[]; dig?: number; height?: number }) {
  const [ref, W] = useSize();
  const [hov, setHov] = useState<{ i: number; x: number; y: number } | null>(null);
  const reduce = useReducedMotion();
  const d = a.map((v, i) => (v != null && b[i] != null ? v - b[i]! : null));
  const vs = d.filter((v): v is number => v != null);
  const lo = Math.min(0, ...vs), hi = Math.max(0, ...vs), pad = (hi - lo || 1) * 0.16;
  const ticks = niceTicks(lo < 0 ? lo - pad : 0, hi > 0 ? hi + pad : 0, 4), d0 = ticks[0], d1 = ticks[ticks.length - 1];
  const L = 40, R = 14, T = 8, B = 26, n = labels.length, band = Math.max(1, (W - L - R) / n), bw = Math.min(40, band * 0.56);
  const y = (v: number) => T + (1 - (v - d0) / (d1 - d0 || 1)) * (height - T - B);
  const bar = (x: number, y0: number, y1: number) => {
    const s = y1 < y0 ? 1 : -1, r = Math.min(4, bw / 2, Math.abs(y1 - y0));
    return `M${x} ${y0}V${y1 + s * r}Q${x} ${y1} ${x + r} ${y1}H${x + bw - r}Q${x + bw} ${y1} ${x + bw} ${y1 + s * r}V${y0}Z`;
  };
  return (
    <div className="chart" ref={ref} style={{ height }}>
      {W > 0 && (
        <svg width={W} height={height} role="img" aria-label={`Fark grafiği: ${names[0]} ve ${names[1]}`} onMouseLeave={() => setHov(null)}>
          {ticks.map((t) => (
            <g key={t}>
              <line className="gridl" x1={L} x2={W - R} y1={y(t)} y2={y(t)} style={t === 0 ? { stroke: 'var(--line2)' } : undefined} />
              <text x={L - 8} y={y(t) + 4} textAnchor="end">{fmt(Math.abs(t), Math.abs(d1 - d0) < 4 ? 1 : 0)}</text>
            </g>
          ))}
          {d.map((v, i) => {
            const x0 = L + i * band, mid = x0 + band / 2;
            return (
              <g key={i} onMouseMove={(e) => setHov({ i, x: e.clientX, y: e.clientY })}>
                <rect x={x0} y={0} width={band} height={height} fill="transparent" />
                {v != null && Math.abs(y(v) - y(0)) >= 1 && <motion.path d={bar(mid - bw / 2, y(0), y(v))} fill={colors[v > 0 ? 0 : 1]} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, delay: reduce ? 0 : i * 0.03 }} />}
                {v != null && <text className="lbl" x={mid} y={v >= 0 ? y(v) - 6 : y(v) + 15} textAnchor="middle">{fmt(Math.abs(v), dig)}</text>}
                <text x={mid} y={height - 6} textAnchor="middle">{labels[i]}</text>
              </g>
            );
          })}
        </svg>
      )}
      {hov && (
        <Tip x={hov.x} y={hov.y}>
          <h4>{titles?.[hov.i] ?? labels[hov.i]}</h4>
          {[0, 1].map((k) => <div className="tr" key={k}><i style={{ background: colors[k] }} />{names[k]}<b>{fmt(k ? b[hov.i] : a[hov.i], dig)}</b></div>)}
          <div className="tr">Fark<b>{fmt(d[hov.i] == null ? null : Math.abs(d[hov.i]!), dig)}</b></div>
        </Tip>
      )}
    </div>
  );
}

/** İlk ve son: içi boş nokta ilk denemeyi, dolu nokta son denemeyi gösterir; aradaki çizgi değişimdir. */
export interface DbRow { key: string; label: ReactNode; color: string; a: number | null; b: number | null; right?: ReactNode }
export function Dumbbell({ rows, show }: { rows: DbRow[]; show: (v: number | null) => string }) {
  const all = rows.flatMap((r) => [r.a, r.b]).filter((v): v is number => v != null);
  if (!all.length) return null;
  const lo = Math.min(...all), hi = Math.max(...all), pad = (hi - lo || 1) * 0.08;
  const ticks = niceTicks(lo - pad, hi + pad, 4), d0 = ticks[0], d1 = ticks[ticks.length - 1];
  const pos = (v: number) => `${(((v - d0) / (d1 - d0 || 1)) * 100).toFixed(2)}%`;
  const whole = ticks.every(Number.isInteger), tick = (t: number) => (whole ? show(t).replace(/,0+$/, '') : show(t));
  return (
    <div className="db">
      {rows.map((r) => {
        const up = r.a == null || r.b == null || r.b >= r.a;
        return (
          <div className="db-row" key={r.key}>
            <div className="clip">{r.label}</div>
            <div className="db-track">
              {ticks.map((t) => <span key={t} className="db-grid" style={{ left: pos(t) }} />)}
              {r.a != null && r.b != null && <span className="db-line" style={{ left: pos(Math.min(r.a, r.b)), width: `${((Math.abs(r.b - r.a) / (d1 - d0 || 1)) * 100).toFixed(2)}%`, background: r.color }} />}
              {r.a != null && <i className="a" style={{ left: pos(r.a), borderColor: r.color }} />}
              {r.b != null && <i style={{ left: pos(r.b), background: r.color }} />}
              {r.a != null && <em className={up ? 'l' : 'r'} style={{ left: pos(r.a) }}>{show(r.a)}</em>}
              {r.b != null && <em className={`on ${up ? 'r' : 'l'}`} style={{ left: pos(r.b) }}>{show(r.b)}</em>}
            </div>
            <div className="right">{r.right}</div>
          </div>
        );
      })}
      <div className="db-row db-axis">
        <span />
        <div className="db-track">{ticks.map((t) => <em key={t} style={{ left: pos(t) }}>{tick(t)}</em>)}</div>
        <span />
      </div>
    </div>
  );
}

/* ================= Dağılım (histogram) ================= */
export function Histogram({ values, step, height = 210, mark, label }: { values: number[]; step: number; height?: number; mark?: number; label: (lo: number, hi: number) => string }) {
  const [ref, W] = useSize();
  const [hov, setHov] = useState<{ i: number; x: number; y: number } | null>(null);
  const reduce = useReducedMotion();
  if (!values.length) return <div ref={ref} />;
  const lo = Math.floor(Math.min(...values) / step) * step, hi = Math.ceil((Math.max(...values) + 1e-9) / step) * step;
  const bins = Array.from({ length: Math.round((hi - lo) / step) }, (_, i) => ({ a: lo + i * step, n: 0 }));
  for (const v of values) bins[Math.min(bins.length - 1, Math.floor((v - lo) / step))].n++;
  const max = Math.max(...bins.map((b) => b.n)), L = 8, B = 24, T = 8;
  const bw = (W - L * 2) / bins.length, y = (n: number) => T + (1 - n / max) * (height - T - B);
  const every = Math.ceil(46 / Math.max(1, bw));
  return (
    <div className="chart" ref={ref} style={{ height }}>
      {W > 0 && (
        <svg width={W} height={height} role="img" aria-label="Dağılım grafiği" onMouseLeave={() => setHov(null)}>
          <line className="gridl" x1={L} x2={W - L} y1={height - B} y2={height - B} />
          {bins.map((b, i) => {
            const w = Math.min(24, Math.max(2, bw - 2)), cx = L + i * bw + bw / 2, top = y(b.n), on = mark == null || b.a + step / 2 >= mark;
            return (
              <g key={i} onMouseMove={(e) => setHov({ i, x: e.clientX, y: e.clientY })}>
                <rect x={L + i * bw} y={T} width={bw} height={height - T - B} fill="transparent" />
                {b.n > 0 && <motion.rect x={cx - w / 2} width={w} rx={Math.min(4, w / 2)} fill={mark == null ? 'var(--accent)' : on ? 'var(--good)' : 'var(--ink3)'} opacity={on ? 1 : 0.4}
                  initial={reduce ? false : { y: height - B, height: 0 }} animate={{ y: top, height: height - B - top }} transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.012, ease: [0.16, 1, 0.3, 1] }} />}
                {i % every === 0 && <text x={L + i * bw} y={height - 6} textAnchor="middle">{fmt(b.a, 0)}</text>}
              </g>
            );
          })}
          {mark != null && mark >= lo && mark <= hi && <line x1={L + ((mark - lo) / step) * bw} x2={L + ((mark - lo) / step) * bw} y1={0} y2={height - B} stroke="var(--ink)" strokeWidth={1.5} />}
        </svg>
      )}
      {hov && <Tip x={hov.x} y={hov.y}><h4>{label(bins[hov.i].a, bins[hov.i].a + step)}</h4><div className="tr">Öğrenci<b>{bins[hov.i].n}</b></div></Tip>}
    </div>
  );
}

/* ================= Saçılım ================= */
export interface Pt { x: number; y: number; label: string; sub?: string; hi?: boolean; key: string | number }
export function Scatter({ pts, height = 340, xName, yName, shift = 0, onPick }: { pts: Pt[]; height?: number; xName: string; yName: string; shift?: number; onPick?: (p: Pt) => void }) {
  const [ref, W] = useSize();
  const [hov, setHov] = useState<{ p: Pt; x: number; y: number } | null>(null);
  const all = pts.flatMap((p) => [p.x, p.y]);
  const ticks = niceTicks(Math.min(...all), Math.max(...all), 5), d0 = ticks[0], d1 = ticks[ticks.length - 1];
  const L = 40, R = 12, T = 10, B = 40;
  const x = (v: number) => L + ((v - d0) / (d1 - d0)) * (W - L - R), y = (v: number) => T + (1 - (v - d0) / (d1 - d0)) * (height - T - B);
  return (
    <div className="chart" ref={ref} style={{ height }}>
      {W > 0 && (
        <svg width={W} height={height} role="img" aria-label={`Saçılım grafiği: ${xName} ve ${yName}`} onMouseLeave={() => setHov(null)}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
            let best: Pt | null = null, bd = 18 * 18;
            for (const p of pts) { const d = (x(p.x) - mx) ** 2 + (y(p.y) - my) ** 2; if (d < bd) { bd = d; best = p; } }
            setHov(best ? { p: best, x: e.clientX, y: e.clientY } : null);
          }}
          onClick={() => hov && onPick?.(hov.p)} style={{ cursor: hov && onPick ? 'pointer' : 'default' }}>
          {ticks.map((t) => <g key={t}><line className="gridl" x1={L} x2={W - R} y1={y(t)} y2={y(t)} /><text x={L - 8} y={y(t) + 4} textAnchor="end">{fmt(t, 0)}</text><text x={x(t)} y={height - B + 16} textAnchor="middle">{fmt(t, 0)}</text></g>)}
          <line x1={x(d0)} y1={y(d0)} x2={x(d1)} y2={y(d1)} stroke="var(--ink3)" strokeWidth={1} />
          {Math.abs(shift) > 0.3 && <line x1={x(d0)} y1={y(d0 + shift)} x2={x(d1)} y2={y(d1 + shift)} stroke="var(--ink3)" strokeWidth={1} strokeDasharray="3 4" />}
          {pts.map((p) => <circle key={p.key} cx={x(p.x)} cy={y(p.y)} r={hov?.p === p ? 6 : 4} fill={p.hi ? 'var(--c2)' : 'var(--c1)'} fillOpacity={p.hi ? 1 : 0.55} stroke="var(--surface)" strokeWidth={hov?.p === p ? 2 : 1} />)}
          <text x={(L + W - R) / 2} y={height - 4} textAnchor="middle">{xName}</text>
          <text transform={`translate(11 ${(T + height - B) / 2}) rotate(-90)`} textAnchor="middle">{yName}</text>
        </svg>
      )}
      {hov && <Tip x={hov.x} y={hov.y}><h4>{hov.p.label}</h4>{hov.p.sub && <div className="mut">{hov.p.sub}</div>}<div className="tr">{xName}<b>{fmt(hov.p.x)}</b></div><div className="tr">{yName}<b>{fmt(hov.p.y)}</b></div></Tip>}
    </div>
  );
}

/* ================= Sıra değişimi ================= */
export function Bump({ rows, labels, height = 220 }: { rows: { name: string; color: string; ranks: (number | null)[] }[]; labels: string[]; height?: number }) {
  const [ref, W] = useSize();
  const [hov, setHov] = useState<{ i: number; x: number; y: number } | null>(null);
  const n = labels.length, k = rows.length, L = 22, R = 58, T = 10, B = 24;
  const x = (i: number) => L + (n > 1 ? i / (n - 1) : 0.5) * Math.max(0, W - L - R), y = (r: number) => T + ((r - 1) / Math.max(1, k - 1)) * (height - T - B);
  return (
    <div className="chart" ref={ref} style={{ height }}>
      {W > 0 && (
        <svg width={W} height={height} role="img" aria-label="Sıra değişimi grafiği" onMouseLeave={() => setHov(null)}
          onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setHov({ i: Math.max(0, Math.min(n - 1, Math.round(((e.clientX - r.left - L) / Math.max(1, W - L - R)) * (n - 1)))), x: e.clientX, y: e.clientY }); }}>
          {Array.from({ length: k }, (_, i) => <text key={i} x={L - 10} y={y(i + 1) + 4} textAnchor="end">{i + 1}</text>)}
          {labels.map((l, i) => <text key={i} x={x(i)} y={height - 6} textAnchor="middle">{l}</text>)}
          {hov && <line x1={x(hov.i)} x2={x(hov.i)} y1={T - 4} y2={height - B} stroke="var(--line2)" />}
          {rows.map((s) => {
            let d = '', pen = false;
            s.ranks.forEach((r, i) => { if (r == null) { pen = false; return; } d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)} ${y(r).toFixed(1)}`; pen = true; });
            const last = s.ranks[n - 1];
            return (
              <g key={s.name}>
                <path d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                {s.ranks.map((r, i) => r != null && <circle key={i} cx={x(i)} cy={y(r)} r={hov?.i === i ? 5 : 4} fill={s.color} stroke="var(--surface)" strokeWidth={2} />)}
                {last != null && <text className="lbl" x={x(n - 1) + 10} y={y(last) + 4}>{s.name}</text>}
              </g>
            );
          })}
        </svg>
      )}
      {hov && <Tip x={hov.x} y={hov.y}><h4>{labels[hov.i]}</h4>{rows.filter((r) => r.ranks[hov.i] != null).sort((a, b) => a.ranks[hov.i]! - b.ranks[hov.i]!).map((r) => <div className="tr" key={r.name}><i style={{ background: r.color }} />{r.name}<b>{r.ranks[hov.i]}.</b></div>)}</Tip>}
    </div>
  );
}

/* ================= Konu kutuları ================= */
/** Her kutu bir konu: adı ve doğru yapanların oranı. Dersler satır satır; her derste en zayıf konu başta. */
export function TopicGrid({ stats, onPick, only }: { stats: TopicStat[]; onPick: (t: number) => void; only?: number[] }) {
  const [hov, setHov] = useState<{ t: number; x: number; y: number } | null>(null);
  return (
    <div className="qg" onMouseLeave={() => setHov(null)}>
      {SUBJECTS.filter((s) => !only || only.includes(s.i)).map((s) => {
        const ts = TOPICS.filter((t) => t.subject === s.i && stats[t.i].pct != null).sort((a, b) => stats[a.i].pct! - stats[b.i].pct!);
        if (!ts.length) return null;
        return (
          <div className="qg-row" key={s.i}>
            <div className="qg-name"><i className={`sdot ${kOf(`s:${s.i}`)}`} />{s.name}</div>
            <div className="tg-cells">
              {ts.map((t) => (
                <button key={t.i} className={`lv-${lv(stats[t.i].pct)}`} onClick={() => onPick(t.i)} onMouseMove={(e) => setHov({ t: t.i, x: e.clientX, y: e.clientY })}>
                  {t.name}<b>{fpct(stats[t.i].pct)}</b>
                </button>
              ))}
            </div>
          </div>
        );
      })}
      {hov && (
        <Tip x={hov.x} y={hov.y}>
          <h4>{TOPICS[hov.t].name}</h4>
          <div className="mut">{SUBJECTS[TOPICS[hov.t].subject].name}</div>
          <div className="tr">Doğru yapanlar<b>{fpct(stats[hov.t].pct)}</b></div>
          <div className="tr">Her denemede çıkan soru<b>{fmt(stats[hov.t].w)}</b></div>
        </Tip>
      )}
    </div>
  );
}
/* ================= Konu bağlantıları ================= */
export function TopicDag({ subject, stats, roots, onPick }: { subject: number; stats: TopicStat[]; roots: number[]; onPick: (t: number) => void }) {
  const [ref, W] = useSize();
  const lay = useMemo(() => {
    const ts = TOPICS.filter((t) => t.subject === subject);
    const depth = new Map<number, number>();
    for (const t of ts) depth.set(t.i, Math.max(0, ...t.pre.filter((p) => TOPICS[p].subject === subject).map((p) => (depth.get(p) ?? 0) + 1)));
    const cols: number[][] = [];
    for (const t of ts) (cols[depth.get(t.i)!] ??= []).push(t.i);
    // Sıra: önkoşulun bulunduğu satıra yakın dursun
    const row = new Map<number, number>();
    cols.forEach((c, d) => {
      if (d) c.sort((a, b) => mean(TOPICS[a].pre.map((p) => row.get(p) ?? 0)) - mean(TOPICS[b].pre.map((p) => row.get(p) ?? 0)));
      c.forEach((t, i) => row.set(t, i + (Math.max(...cols.map((x) => x.length)) - c.length) / 2));
    });
    const NH = 40, GX = 40, GY = 12;
    const NW = Math.max(132, Math.min(200, Math.floor(((W || 900) - 8 - (cols.length - 1) * GX) / cols.length)));
    const pos = new Map<number, { x: number; y: number }>();
    for (const t of ts) pos.set(t.i, { x: depth.get(t.i)! * (NW + GX), y: row.get(t.i)! * (NH + GY) });
    const edges = ts.flatMap((t) => t.pre.filter((p) => pos.has(p)).map((p) => ({ a: p, b: t.i })));
    const ext = ts.filter((t) => t.pre.some((p) => !pos.has(p))).map((t) => ({ t: t.i, pre: t.pre.filter((p) => !pos.has(p)) }));
    return { ts, pos, edges, ext, NW, NH, w: cols.length * (NW + GX) - GX, h: Math.max(...cols.map((c) => c.length)) * (NH + GY) - GY };
  }, [subject, W]);
  const weak = (t: number) => (stats[t].pct ?? 100) < LV_LO;
  return (
    <div className="dag" ref={ref}>
      <div style={{ position: 'relative', width: lay.w, height: lay.h, margin: '6px 4px 10px' }}>
        <svg width={lay.w} height={lay.h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }} aria-hidden>
          {lay.edges.map((e) => {
            const a = lay.pos.get(e.a)!, b = lay.pos.get(e.b)!, x1 = a.x + lay.NW, y1 = a.y + lay.NH / 2, x2 = b.x, y2 = b.y + lay.NH / 2, mx = (x1 + x2) / 2;
            const hot = weak(e.a) && weak(e.b);
            return <path key={`${e.a}-${e.b}`} d={`M${x1} ${y1}C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`} fill="none" stroke={hot ? 'var(--bad)' : 'var(--line2)'} strokeWidth={hot ? 2 : 1.25} />;
          })}
        </svg>
        {lay.ts.map((t) => {
          const p = lay.pos.get(t.i)!;
          return (
            <div key={t.i} className={`dag-node lv-${lv(stats[t.i].pct)} ${roots.includes(t.i) ? 'root' : ''}`} style={{ left: p.x, top: p.y, width: lay.NW }} onClick={() => onPick(t.i)}
              title={`${t.name}: ${fpct(stats[t.i].pct)} doğru${dependents[t.i].length ? `, ${dependents[t.i].length} konu buna dayanıyor` : ''}`}>
              <span>{t.name}</span><small>{fpct(stats[t.i].pct)} doğru{dependents[t.i].length > 0 && `, ${dependents[t.i].length} konu bağlı`}</small>
            </div>
          );
        })}
      </div>
      {lay.ext.length > 0 && <p className="note">Başka dersten gelen bağlantı: {lay.ext.map((x) => `${TOPICS[x.t].name} ← ${x.pre.map((p) => `${SUBJECTS[TOPICS[p].subject].name}, ${TOPICS[p].name}`).join('; ')}`).join(' / ')}</p>}
    </div>
  );
}
const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

/* ================= Soru kutuları ================= */
/** Her kutu bir soru. Renk, soruyu doğru yapanların oranını gösterir (iyi / orta / zayıf); sayı soru numarasıdır. */
export function QGrid({ e, stats, onPick }: { e: number; stats: QStat[]; onPick: (q: number) => void }) {
  const [hov, setHov] = useState<{ q: number; x: number; y: number } | null>(null);
  const Q = ds.exams[e].q;
  return (
    <div className="qg" onMouseLeave={() => setHov(null)}>
      {TESTS.map((t) => (
        <div className="qg-row" key={t.id}>
          <div className="qg-name"><i className={`sdot k-${t.id}`} />{t.name}</div>
          <div className="qg-cells">
            {Q.filter((q) => SUBJECTS[q.subject].test === t.id).map((q) => (
              <button key={q.i} className={`lv-${lv(stats[q.i].p * 100)}`} aria-label={`Soru ${q.i + 1}: ${fpct(stats[q.i].p * 100)} doğru`}
                onClick={() => onPick(q.i)} onMouseMove={(ev) => setHov({ q: q.i, x: ev.clientX, y: ev.clientY })}>{q.i + 1}</button>
            ))}
          </div>
        </div>
      ))}
      {hov && (
        <Tip x={hov.x} y={hov.y}>
          <h4>Soru {hov.q + 1}</h4>
          <div className="mut">{SUBJECTS[Q[hov.q].subject].name}, {TOPICS[Q[hov.q].topic].name}</div>
          <div className="tr">Doğru yapan<b>{fpct(stats[hov.q].p * 100)}</b></div>
          <div className="tr">Boş bırakan<b>{fpct(stats[hov.q].blank * 100)}</b></div>
        </Tip>
      )}
    </div>
  );
}
export const seriesFor = (ents: Ent[]) => ents.map((en, i) => ({ en, name: entName(en), color: SERIES[i % MAX_SERIES] }));
