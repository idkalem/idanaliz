// Ortak arayüz parçaları.
import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { APP, dersOf, type Ders } from './content';
import { lv, LV_NAME } from './engine';
import type { Avatar as Av } from './store';

/* ---------- Renk: ders grubu ve durum ---------- */
/** Dersin ya da konunun grup rengi (CSS sınıfı): Türkçe mavi, Sosyal turuncu, Matematik mor, Fen yeşil. */
export const kOf = (x: Ders | string): string => `k-${(typeof x === 'string' ? dersOf(x) : x).grup}`;
export const pct = (p: number | null | undefined) => (p == null || !isFinite(p) ? '–' : `%${Math.round(p)}`);
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
  return <LBar v={p} k={`k-${lv(p)}`}>{pct(p)}</LBar>;
}
export function Meter({ v, max, k = '' }: { v: number; max: number; k?: string }) {
  return <div className={`meter ${k}`}><i style={{ width: `${Math.max(0, Math.min(100, (v / (max || 1)) * 100))}%` }} /></div>;
}

/* ---------- Özet kutusu ---------- */
export function Tile({ label, icon, children, unit, sub, tone = '', to }: { label: ReactNode; icon?: ReactNode; children: ReactNode; unit?: ReactNode; sub?: ReactNode; tone?: '' | 'brand' | 'good' | 'mid' | 'bad' | 'seri'; to?: string }) {
  const body = (
    <>
      <div className="t-l">{icon && <span className="t-ic">{icon}</span>}<span>{label}</span></div>
      <div className="t-v">{children}{unit && <small>{unit}</small>}</div>
      {sub && <div className="t-s">{sub}</div>}
    </>
  );
  return to ? <Link className={`tile ${tone}`} to={to}>{body}</Link> : <div className={`tile ${tone}`}>{body}</div>;
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
export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button className={`sw ${on ? 'on' : ''}`} role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} />;
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
export function useTitle(title: string) {
  useEffect(() => { document.title = `${title} – ${APP}`; }, [title]);
}
export function Page({ title, sub, crumb, actions, children }: { title: string; sub?: ReactNode; crumb?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  useTitle(title);
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

/* ---------- Çekmece ---------- */
export function Drawer({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} />
          <motion.aside className="drawer" role="dialog" aria-label={label} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 38 }}>
            <div className="drawer-head"><b className="grow">{label}</b><button className="btn ghost icon" aria-label="Kapat" onClick={onClose}><X size={18} /></button></div>
            <div className="drawer-body">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------- Marka işareti ---------- */
export function Logo({ className = 'brand-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="lg-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9a94f7" /><stop offset="0.45" stopColor="#4a3fd6" /><stop offset="0.75" stopColor="#6f7fee" /><stop offset="1" stopColor="#86a6f8" /></linearGradient>
        <linearGradient id="lg-ln" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffcf33" /><stop offset="1" stopColor="#ff5a5f" /></linearGradient>
      </defs>
      <rect width="100" height="100" rx="27" fill="url(#lg-bg)" />
      <rect x="23" y="12.5" width="16.5" height="12" rx="5" fill="#ffd43b" />
      <rect x="23" y="28" width="16.5" height="42" rx="4" fill="#fff" />
      <path fillRule="evenodd" fill="#fff" d="M46 26Q46 22 50 22H62Q88 22 88 46Q88 70 62 70H50Q46 70 46 66ZM57 32.5V59.5H62Q77 59.5 77 46Q77 32.5 62 32.5Z" />
      {/* İD Analiz'deki grafik çizgisinin yerinde bir "tamam" işareti */}
      <polyline points="26,80 42,89 82,74" fill="none" stroke="url(#lg-ln)" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="83" cy="73.5" r="4.6" fill="#ff4d67" stroke="#fff" strokeWidth="2.2" />
    </svg>
  );
}

/* ---------- Avatar ---------- */
export const AV_RENK = ['#4a7df0', '#7a5be8', '#e8518d', '#f0772b', '#1baf7a', '#0e9bb5', '#e3a008', '#5b6b8c'];
export const AV_GOZ = ['Yuvarlak', 'Gülen', 'Meraklı'];
/** Aksesuarlar seviye ile açılır. */
export const AV_AKS: { ad: string; lv: number }[] = [{ ad: 'Yok', lv: 1 }, { ad: 'Gözlük', lv: 2 }, { ad: 'Kulaklık', lv: 3 }, { ad: 'Bere', lv: 4 }, { ad: 'Taç', lv: 6 }];
export function Avatar({ a, size = 40 }: { a: Av; size?: number }) {
  const c = AV_RENK[a.renk % AV_RENK.length], ink = '#1b1f33';
  return (
    <svg className="av" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="50" fill={c} opacity="0.2" />
      <path d="M50 22c19 0 31 13 31 33 0 20-12 32-31 32S19 75 19 55c0-20 12-33 31-33z" fill={c} />
      <ellipse cx="50" cy="70" rx="17" ry="11" fill="#fff" opacity="0.22" />
      <circle cx="31" cy="62" r="5.5" fill="#ff7b9c" opacity="0.5" /><circle cx="69" cy="62" r="5.5" fill="#ff7b9c" opacity="0.5" />
      {a.goz === 1 ? (
        <g fill="none" stroke={ink} strokeWidth="3.4" strokeLinecap="round"><path d="M33 52q6-8 12 0" /><path d="M55 52q6-8 12 0" /></g>
      ) : a.goz === 2 ? (
        <g><circle cx="39" cy="50" r="10" fill="#fff" /><circle cx="61" cy="50" r="10" fill="#fff" /><circle cx="41.5" cy="47.5" r="5" fill={ink} /><circle cx="63.5" cy="47.5" r="5" fill={ink} /><circle cx="43" cy="45.5" r="1.7" fill="#fff" /><circle cx="65" cy="45.5" r="1.7" fill="#fff" /></g>
      ) : (
        <g><circle cx="39" cy="50" r="7.5" fill="#fff" /><circle cx="61" cy="50" r="7.5" fill="#fff" /><circle cx="39.5" cy="50.5" r="3.8" fill={ink} /><circle cx="61.5" cy="50.5" r="3.8" fill={ink} /></g>
      )}
      <path d="M42 66q8 7 16 0" fill="none" stroke={ink} strokeWidth="3.2" strokeLinecap="round" />
      {a.aks === 1 && <g fill="none" stroke={ink} strokeWidth="3"><circle cx="39" cy="50" r="11" /><circle cx="61" cy="50" r="11" /><path d="M50 50h0M28 49l-6-3M72 49l6-3" strokeLinecap="round" /></g>}
      {a.aks === 2 && <g><path d="M21 54a29 29 0 0 1 58 0" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" /><rect x="13" y="46" width="12" height="20" rx="6" fill={ink} /><rect x="75" y="46" width="12" height="20" rx="6" fill={ink} /></g>}
      {a.aks === 3 && <g><path d="M24 38c2-22 50-22 52 0z" fill="#e5484d" /><rect x="22" y="34" width="56" height="9" rx="4.5" fill="#fff" /><circle cx="50" cy="17" r="6.5" fill="#fff" /></g>}
      {a.aks === 4 && <path d="M30 32l4-18 9 10 7-14 7 14 9-10 4 18z" fill="#ffd43b" stroke="#d68a00" strokeWidth="2.4" strokeLinejoin="round" />}
    </svg>
  );
}
