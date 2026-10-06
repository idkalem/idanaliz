// Karşılaştırma grafikleri. Hepsi aynı satırları alır: satır bir alt kırılım (ders, konu, sınıf, deneme),
// satırdaki her değer bir karşılaştırılandır. Ölçü ne olursa olsun (net, doğru, yanlış, boş, oran) aynı biçimde çalışır.
import { useState, type CSSProperties, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { fmt, pct as fpct } from './engine/fmt';
import { Tip, lv } from './ui';
import { useSize, niceTicks } from './charts';

/** `vals`: yazılan değer. `fill`: çubuğun boyunu veren sayı (verilmezse `vals`). `pct`: doğru oranı, İyi / Orta / Zayıf rengi için.
 *  `color`: tek karşılaştırılan varken satırın kendi rengi (ör. dersin rengi). */
export interface CmpRow { key: string; name: string; label: ReactNode; vals: (number | null)[]; fill?: (number | null)[]; pct?: (number | null)[]; color?: string }
/** Değerlerin nasıl yazılıp ölçekleneceği. */
export interface CmpFmt {
  show: (v: number | null) => string;
  dig: number;
  /** yüksek değer mi iyi */
  up: boolean;
  /** çubukların tam dolduğu değer (`fill` biriminde) */
  top: number;
  /** `fill` yazılan değerle aynı birimdeyse eksene sayı yazılır */
  axis: boolean;
  /** tablo kutusunun rengi: durum (iyi / orta / zayıf) ya da tek rengin koyuluğu */
  heat: 'lv' | 'bad' | 'ink';
  /** "4 derste önde" ve "Önde olduğu ders sayısı" yazılarındaki söz */
  lead: string;
  leadCap: string;
}
export const PCT_FMT: CmpFmt = { show: (v) => fpct(v), dig: 0, up: true, top: 100, axis: true, heat: 'lv', lead: 'önde', leadCap: 'Önde olduğu' };

/** En iyi değerin sırası; yuvarlanınca eşit çıkıyorsa −1. `up` yanlışsa en düşük değer en iyidir. */
export function leadOf(vals: (number | null)[], dig = 0, up = true): number {
  let bi = -1, bv = 0, tie = false;
  vals.forEach((v, i) => {
    if (v == null) return;
    const r = +v.toFixed(dig) * (up ? 1 : -1);
    if (bi < 0 || r > bv) { bv = r; bi = i; tie = false; } else if (r === bv) tie = true;
  });
  return tie ? -1 : bi;
}
const LVC = { good: 'var(--good)', mid: 'var(--mid)', bad: 'var(--bad)', none: 'var(--ink3)' } as const;
const HEAT = { bad: 'var(--bad)', ink: 'var(--ink2)' } as const;
const some = (v: number | null | undefined): v is number => v != null;
const fillOf = (r: CmpRow) => r.fill ?? r.vals;
/** Çubuğun boyu, tavanın yüzdesi olarak. */
const wid = (r: CmpRow, i: number, f: CmpFmt) => { const x = fillOf(r)[i]; return x == null ? 0 : Math.max(0, Math.min(100, (x / (f.top || 1)) * 100)); };
const pctOf = (r: CmpRow, i: number) => (r.pct ? r.pct[i] : r.vals[i]);
/** İşaretin rengi. Tek karşılaştırılan varsa satırın kendi rengi, o da yoksa durumu. */
const tone = (r: CmpRow, i: number, colors: string[], f: CmpFmt) => (colors.length > 1 ? colors[i] : r.color ?? (f.heat === 'lv' ? LVC[lv(pctOf(r, i))] : HEAT[f.heat]));
/** Eksen sayısı: hepsi tam sayıysa ",0" yazılmaz. */
const tickText = (ticks: number[], f: CmpFmt) => { const whole = ticks.every(Number.isInteger); return (t: number) => (whole ? f.show(t).replace(/,0+$/, '') : f.show(t)); };
const spread = (v: number[], dig: number) => +Math.max(...v).toFixed(dig) - +Math.min(...v).toFixed(dig);
type Hov = { r: CmpRow; x: number; y: number } | null;
interface P { rows: CmpRow[]; names: string[]; colors: string[]; f?: CmpFmt }

function CmpTip({ r, x, y, names, colors, f }: { r: CmpRow; x: number; y: number; names: string[]; colors: string[]; f: CmpFmt }) {
  const list = names.map((n, i) => ({ n, i, v: r.vals[i] })).filter((t) => t.v != null).sort((a, b) => (f.up ? b.v! - a.v! : a.v! - b.v!));
  return (
    <Tip x={x} y={y}>
      <h4>{r.name}</h4>
      {list.map((t) => <div className="tr" key={t.i}><i style={{ background: tone(r, t.i, colors, f) }} />{t.n}<b>{f.show(t.v)}</b></div>)}
    </Tip>
  );
}

/** Çubuk: her satırda karşılaştırılanların çubukları alt alta; başında adı, sonunda sayısı yazar. */
export function GroupBars({ rows, names, colors, f = PCT_FMT }: P) {
  const [hov, setHov] = useState<Hov>(null);
  const reduce = useReducedMotion();
  const solo = names.length === 1;
  const nw = Math.min(15, Math.max(...names.map((n) => n.length)) + 1);
  return (
    <div className={`gb ${solo ? 'solo' : ''}`} style={{ '--nw': `${nw}ch` } as CSSProperties} onMouseLeave={() => setHov(null)}>
      {rows.map((r) => {
        const lead = solo ? 0 : leadOf(r.vals, f.dig, f.up);
        return (
          <div className="gb-row" key={r.key} onMouseMove={(e) => setHov({ r, x: e.clientX, y: e.clientY })}>
            <div className="gb-name clip">{r.label}</div>
            <div className="gb-bars">
              {r.vals.map((v, i) => (
                <div className="gb-bar" key={i}>
                  {!solo && <span className="clip">{names[i]}</span>}
                  <div className="gb-track">
                    {v != null && <motion.i style={{ background: tone(r, i, colors, f) }} initial={reduce ? false : { width: 0 }} animate={{ width: `${wid(r, i, f).toFixed(2)}%` }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />}
                  </div>
                  <b className={i === lead ? 'on' : ''}>{f.show(v)}</b>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {hov && <CmpTip r={hov.r} x={hov.x} y={hov.y} names={names} colors={colors} f={f} />}
    </div>
  );
}

/** Karşı karşıya: iki karşılaştırılan. Çubuklar ortadan iki yana uzar; önde olanın çubuğu dolu, gerideki soluktur. */
export function Butterfly({ rows, names, colors, f = PCT_FMT, wins, ties, noun }: P & { wins: number[]; ties: number; noun: string }) {
  const [hov, setHov] = useState<Hov>(null);
  const reduce = useReducedMotion();
  const fill = (r: CmpRow, i: number, lead: number) => r.vals[i] != null && (
    <motion.i style={{ background: colors[i], opacity: lead >= 0 && lead !== i ? 0.32 : 1 }} initial={reduce ? false : { width: 0 }}
      animate={{ width: `${wid(r, i, f).toFixed(2)}%` }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
  );
  return (
    <div onMouseLeave={() => setHov(null)}>
      <div className="bf-top">
        <div className="bf-side"><i style={{ background: colors[0] }} /><span className="clip">{names[0]}</span></div>
        <div className="bf-score"><b>{wins[0]}</b><span>–</span><b>{wins[1]}</b></div>
        <div className="bf-side r"><span className="clip">{names[1]}</span><i style={{ background: colors[1] }} /></div>
      </div>
      <div className="bf-cap">{f.leadCap} {noun} sayısı{ties > 0 && `, ${ties} ${noun} eşit`}</div>
      {rows.map((r) => {
        const lead = leadOf(r.vals, f.dig, f.up);
        return (
          <div className="bf-row" key={r.key} onMouseMove={(e) => setHov({ r, x: e.clientX, y: e.clientY })}>
            <b className={`bf-v l ${lead === 0 ? 'on' : ''}`}>{f.show(r.vals[0])}</b>
            <div className="bf-track l">{fill(r, 0, lead)}</div>
            <div className="bf-name clip">{r.label}</div>
            <div className="bf-track">{fill(r, 1, lead)}</div>
            <b className={`bf-v ${lead === 1 ? 'on' : ''}`}>{f.show(r.vals[1])}</b>
          </div>
        );
      })}
      {hov && <CmpTip r={hov.r} x={hov.x} y={hov.y} names={names} colors={colors} f={f} />}
    </div>
  );
}

/** Fark: iki karşılaştırılan arasındaki fark, satır satır. Çubuk, daha iyi olanın tarafına uzar ve onun rengini alır. */
export function DiffBars({ rows, names, colors, f = PCT_FMT }: P) {
  const [hov, setHov] = useState<Hov>(null);
  const reduce = useReducedMotion();
  const d = rows.map((r) => (r.vals[0] != null && r.vals[1] != null ? r.vals[0] - r.vals[1] : null));
  const max = Math.max(1e-9, ...d.map((v) => Math.abs(v ?? 0)));
  return (
    <div className="df" onMouseLeave={() => setHov(null)}>
      <div className="df-row df-head">
        <span />
        <div className="df-ends"><span><i style={{ background: colors[0] }} />{names[0]} {f.lead}</span><span>{names[1]} {f.lead}<i style={{ background: colors[1] }} /></span></div>
        <span className="right">Fark</span>
      </div>
      {rows.map((r, j) => {
        const v = d[j], zero = v == null || fmt(Math.abs(v), f.dig) === fmt(0, f.dig), a = v != null && (f.up ? v > 0 : v < 0);
        return (
          <div className="df-row" key={r.key} onMouseMove={(e) => setHov({ r, x: e.clientX, y: e.clientY })}>
            <div className="clip df-name">{r.label}</div>
            <div className="df-track">
              {!zero && <motion.i style={{ [a ? 'right' : 'left']: '50%', background: colors[a ? 0 : 1], borderRadius: a ? '4px 0 0 4px' : '0 4px 4px 0' }}
                initial={reduce ? false : { width: 0 }} animate={{ width: `${((Math.abs(v!) / max) * 50).toFixed(2)}%` }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />}
            </div>
            <div className="right df-v">{v == null ? '–' : zero ? 'eşit' : <><i style={{ background: colors[a ? 0 : 1] }} />{fmt(Math.abs(v), f.dig)}</>}</div>
          </div>
        );
      })}
      {hov && <CmpTip r={hov.r} x={hov.x} y={hov.y} names={names} colors={colors} f={f} />}
    </div>
  );
}

/** Nokta: her satırda bir çizgi, üzerinde her karşılaştırılanın noktası. Ölçek, değerlerin bulunduğu aralığa yakınlaştırılır. */
export function Dots({ rows, names, colors, f = PCT_FMT }: P) {
  const [hov, setHov] = useState<Hov>(null);
  const solo = names.length === 1;
  const all = rows.flatMap(fillOf).filter(some);
  if (!all.length) return null;
  const lo = Math.min(...all), hi = Math.max(...all), pad = (hi - lo || Math.abs(hi) || 1) * 0.1;
  const ticks = niceTicks(Math.max(0, lo - pad), hi + pad, 4), d0 = ticks[0], d1 = ticks[ticks.length - 1];
  const pos = (v: number) => `${(((v - d0) / (d1 - d0 || 1)) * 100).toFixed(2)}%`;
  const tick = tickText(ticks, f);
  return (
    <div className={`dp ${solo ? 'solo' : ''}`} onMouseLeave={() => setHov(null)}>
      {!solo && <div className="dp-row dp-head"><span /><span /><span className="right">{f.up ? 'En yüksek' : 'En düşük'}</span><span className="right">Fark</span></div>}
      {rows.map((r) => {
        const fl = fillOf(r), fv = fl.filter(some), v = r.vals.filter(some), lead = solo ? 0 : leadOf(r.vals, f.dig, f.up);
        const best = v.length ? (f.up ? Math.max(...v) : Math.min(...v)) : null;
        return (
          <div className="dp-row" key={r.key} onMouseMove={(e) => setHov({ r, x: e.clientX, y: e.clientY })}>
            <div className="clip dp-name">{r.label}</div>
            <div className="dp-track">
              {ticks.map((t) => <span key={t} className="dp-grid" style={{ left: pos(t) }} />)}
              {fv.length > 1 && <span className="dp-span" style={{ left: pos(Math.min(...fv)), width: `${(((Math.max(...fv) - Math.min(...fv)) / (d1 - d0 || 1)) * 100).toFixed(2)}%` }} />}
              {fl.map((x, i) => x != null && <i key={i} className={i === lead ? 'on' : ''} style={{ left: pos(x), background: tone(r, i, colors, f) }} />)}
            </div>
            <div className="right dp-v">{!solo && lead >= 0 && <i style={{ background: colors[lead] }} />}{f.show(solo ? r.vals[0] : best)}</div>
            {!solo && <div className="right dp-d">{v.length > 1 ? fmt(spread(v, f.dig), f.dig) : '–'}</div>}
          </div>
        );
      })}
      {f.axis && (
        <div className="dp-row dp-axis">
          <span />
          <div className="dp-track">{ticks.map((t) => <em key={t} style={{ left: pos(t) }}>{tick(t)}</em>)}</div>
          <span />{!solo && <span />}
        </div>
      )}
      {hov && <CmpTip r={hov.r} x={hov.x} y={hov.y} names={names} colors={colors} f={f} />}
    </div>
  );
}

/** Sütun: her satır bir sütun öbeği, öbekte her karşılaştırılanın bir sütunu. Satır çoksa grafik yana kayar. */
export function Columns({ rows, names, colors, f = PCT_FMT, height = 300, onPick }: P & { height?: number; onPick?: (key: string) => void }) {
  const [ref, W] = useSize();
  const [hov, setHov] = useState<{ i: number; x: number; y: number } | null>(null);
  const reduce = useReducedMotion();
  const k = names.length, n = rows.length;
  const L = f.axis ? 46 : 8, R = 8, T = 24;
  const band = Math.max(k * 13 + 14, 36, n ? (W - L - R) / n : 0);
  const width = Math.max(W, L + R + band * n), scroll = width > W + 1;
  const bw = Math.max(6, Math.min(38, (band - 14) / k - (k > 1 ? 2 : 0))), group = k * bw + (k - 1) * 2;
  const fit = Math.floor(band / 6.8), tilt = rows.some((r) => r.name.length > fit), B = tilt ? 86 : 28;
  const ticks = niceTicks(0, f.top, 4).filter((t) => t <= f.top * 1.001), tick = tickText(ticks, f);
  const y = (v: number) => T + (1 - Math.max(0, Math.min(1, v / (f.top || 1)))) * (height - T - B), y0 = y(0);
  const every = bw >= 28;
  const col = (x: number, yt: number) => { const r = Math.min(4, bw / 2, y0 - yt); return `M${x} ${y0}V${yt + r}Q${x} ${yt} ${x + r} ${yt}H${x + bw - r}Q${x + bw} ${yt} ${x + bw} ${yt + r}V${y0}Z`; };
  const cut = (s: string, m: number) => (s.length > m ? `${s.slice(0, Math.max(1, m - 1))}…` : s);
  return (
    <div className="chart" ref={ref} style={{ height: height + (scroll ? 12 : 0), overflowX: scroll ? 'auto' : undefined, overflowY: 'hidden' }}>
      {W > 0 && (
        <svg width={width} height={height} role="img" aria-label={`Sütun grafik: ${names.join(', ')}`} onMouseLeave={() => setHov(null)}>
          {ticks.map((t) => (
            <g key={t}>
              <line className="gridl" x1={L} x2={width - R} y1={y(t)} y2={y(t)} />
              {f.axis && <text x={L - 8} y={y(t) + 4} textAnchor="end">{tick(t)}</text>}
            </g>
          ))}
          {rows.map((r, i) => {
            const x0 = L + i * band, gx = x0 + (band - group) / 2, lead = k > 1 ? leadOf(r.vals, f.dig, f.up) : 0;
            return (
              <g key={r.key} onMouseMove={(e) => setHov({ i, x: e.clientX, y: e.clientY })} onClick={() => onPick?.(r.key)} style={{ cursor: onPick ? 'pointer' : undefined }}>
                <rect x={x0 + 2} y={2} width={band - 4} height={height - 4} rx={8} fill={hov?.i === i ? 'var(--hover)' : 'transparent'} />
                {r.vals.map((v, j) => {
                  if (v == null) return null;
                  const x = gx + j * (bw + 2), yt = y(fillOf(r)[j] ?? 0);
                  return (
                    <g key={j}>
                      {y0 - yt >= 1 && <motion.path d={col(x, yt)} fill={tone(r, j, colors, f)} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, delay: reduce ? 0 : Math.min(0.4, i * 0.02) }} />}
                      {(every || j === lead) && <text className={j === lead ? 'lbl' : ''} x={x + bw / 2} y={yt - 6} textAnchor="middle">{f.show(v)}</text>}
                    </g>
                  );
                })}
                {tilt
                  ? <text transform={`translate(${(x0 + band / 2 + 5).toFixed(1)} ${height - B + 15}) rotate(-36)`} textAnchor="end">{cut(r.name, 18)}</text>
                  : <text x={x0 + band / 2} y={height - 8} textAnchor="middle">{cut(r.name, fit)}</text>}
              </g>
            );
          })}
        </svg>
      )}
      {hov && rows[hov.i] && <CmpTip r={rows[hov.i]} x={hov.x} y={hov.y} names={names} colors={colors} f={f} />}
    </div>
  );
}

/** Radar: her köşe bir satır; merkez sıfırdır. En çok dört karşılaştırılan çizilir. */
export function Radar({ rows, names, colors, f = PCT_FMT, height = 440, onPick }: P & { height?: number; onPick?: (key: string) => void }) {
  const [ref, W] = useSize();
  const [hov, setHov] = useState<{ i: number; x: number; y: number } | null>(null);
  const reduce = useReducedMotion();
  const n = rows.length, cx = W / 2, cy = height / 2, R = Math.max(50, Math.min(W / 2 - 112, height / 2 - 30));
  const mx = Math.max(0, ...rows.flatMap((r) => fillOf(r).map((v) => v ?? 0))), nice = niceTicks(0, mx * 1.04 || 1, 4);
  const top = Math.min(f.top, nice[nice.length - 1]) || 1;
  const ang = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2;
  const pt = (i: number, v: number): [number, number] => { const t = Math.max(0, Math.min(1, v / top)); return [cx + Math.cos(ang(i)) * R * t, cy + Math.sin(ang(i)) * R * t]; };
  const pts = (g: (i: number) => number) => rows.map((_, i) => pt(i, g(i)).map((p) => p.toFixed(1)).join(',')).join(' ');
  const cut = (s: string) => (s.length > 17 ? `${s.slice(0, 16)}…` : s);
  const tick = tickText([top / 2, top], f);
  return (
    <div className="chart" ref={ref} style={{ height }}>
      {W > 0 && (
        <svg width={W} height={height} role="img" aria-label={`Radar grafik: ${names.join(', ')}`} onMouseLeave={() => setHov(null)}
          onMouseMove={(e) => {
            const b = e.currentTarget.getBoundingClientRect(), dx = e.clientX - b.left - cx, dy = e.clientY - b.top - cy;
            if (Math.hypot(dx, dy) > R + 80) { setHov(null); return; }
            const a = (Math.atan2(dy, dx) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
            setHov({ i: Math.round(a / ((Math.PI * 2) / n)) % n, x: e.clientX, y: e.clientY });
          }}
          onClick={() => hov && onPick?.(rows[hov.i].key)} style={{ cursor: hov && onPick ? 'pointer' : 'default' }}>
          {[0.25, 0.5, 0.75, 1].map((t) => <polygon key={t} className="gridl" points={pts(() => t * top)} fill="none" />)}
          {rows.map((_, i) => { const [x, y] = pt(i, top); return <line key={i} className="gridl" x1={cx} y1={cy} x2={x} y2={y} style={hov?.i === i ? { stroke: 'var(--ink3)' } : undefined} />; })}
          {f.axis && [0.5, 1].map((t) => <text key={t} x={cx + 5} y={cy - R * t + 13}>{tick(top * t)}</text>)}
          {names.map((_, k) => {
            const c = names.length > 1 ? colors[k] : 'var(--accent)';
            return (
              <motion.g key={k} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, delay: reduce ? 0 : k * 0.08 }}>
                <polygon points={pts((i) => fillOf(rows[i])[k] ?? 0)} fill={c} fillOpacity={0.12} stroke={c} strokeWidth={2} strokeLinejoin="round" />
                {rows.map((r, i) => { const [x, y] = pt(i, fillOf(r)[k] ?? 0); return <circle key={i} cx={x} cy={y} r={hov?.i === i ? 5 : 3.5} fill={c} stroke="var(--surface)" strokeWidth={2} />; })}
              </motion.g>
            );
          })}
          {rows.map((r, i) => {
            const c = Math.cos(ang(i)), s = Math.sin(ang(i));
            return (
              <text key={r.key} className="lbl" x={cx + c * (R + 14)} y={cy + s * (R + 14) + (s < -0.9 ? -2 : s > 0.9 ? 12 : 4)}
                textAnchor={c > 0.25 ? 'start' : c < -0.25 ? 'end' : 'middle'} style={hov?.i === i ? undefined : { fontWeight: 550 }}>{cut(r.name)}</text>
            );
          })}
        </svg>
      )}
      {hov && rows[hov.i] && <CmpTip r={rows[hov.i]} x={hov.x} y={hov.y} names={names} colors={colors} f={f} />}
    </div>
  );
}

/** Renkli tablo: satırlar alt kırılım, sütunlar karşılaştırılanlar. Çerçeveli kutu satırın en iyisidir. */
export function HeatTable({ rows, names, colors, f = PCT_FMT, head, diff = 'Fark' }: P & { head: string; diff?: string }) {
  const many = names.length > 1;
  return (
    <div className="tbl-wrap">
      <table className="ht" style={{ minWidth: 150 + names.length * 58 + (many ? 56 : 0) }}>
        <thead>
          <tr>
            <th>{head}</th>
            {names.map((n, i) => <th key={i} title={n}><span className="ht-h">{colors[i] && <i style={{ background: colors[i] }} />}<span className="clip">{n}</span></span></th>)}
            {many && <th className="r">{diff}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const lead = many ? leadOf(r.vals, f.dig, f.up) : -1, v = r.vals.filter(some);
            return (
              <tr key={r.key}>
                <td className="clip">{r.label}</td>
                {r.vals.map((x, i) => (
                  <td key={i}>
                    <span className={`ht-c ${x == null ? 'lv-none' : f.heat === 'lv' ? `lv-${lv(pctOf(r, i))}` : ''} ${i === lead ? 'best' : ''}`}
                      style={x == null || f.heat === 'lv' ? undefined : { background: `color-mix(in srgb, ${HEAT[f.heat]} ${Math.round(7 + 0.5 * wid(r, i, f))}%, transparent)` }}>{f.show(x)}</span>
                  </td>
                ))}
                {many && <td className="r">{v.length > 1 ? fmt(spread(v, f.dig), f.dig) : '–'}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
