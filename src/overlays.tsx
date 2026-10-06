// Her sayfadan açılan katmanlar: Neden? çekmecesi, soru çekmecesi, ara/sor paleti.
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, Search, LayoutGrid, Users, GraduationCap, UserRound, Network, ClipboardList, Sparkles } from 'lucide-react';
import {
  ds, METRICS, SUBJECTS, TOPICS, ERRS, LETTERS, BLANK, win, entName, entHref, entKind, scopeFull, scopeKind, scopeChildren,
  type Ent, type Scope,
} from './engine/core';
import { why, optionDist, qStats, better, type WhyPart } from './engine/analysis';
import { search, EXAMPLES, PAGES, type Hit, type HitIcon } from './engine/ask';
import { fmt, sgn, pct } from './engine/fmt';
import { useUi, useStore, closeWhy, backWhy, openWhy, openQ, setPalette } from './store';
import { Delta, EntLink, TopicLink, lv } from './ui';
import { Bars } from './charts';

function Drawer({ onClose, onBack, children, k }: { onClose: () => void; onBack?: () => void; children: ReactNode; k: string }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <>
      <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={onClose} />
      <motion.aside className="drawer" role="dialog" aria-modal initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 38 }}>
        <div className="drawer-head">
          {onBack && <button className="btn ghost" onClick={onBack}><ChevronLeft size={16} />Geri</button>}
          <span className="grow" />
          <button className="btn ghost icon" aria-label="Kapat" onClick={onClose}><X size={17} /></button>
        </div>
        <motion.div className="drawer-body" key={k} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.18 }}>{children}</motion.div>
      </motion.aside>
    </>
  );
}

function WhyRows({ parts, dig, good, onPick, limit = 12 }: { parts: WhyPart[]; dig: number; good: (v: number) => boolean; onPick?: (p: WhyPart) => void; limit?: number }) {
  const m = Math.max(1e-9, ...parts.map((p) => Math.abs(p.v)));
  // Toplam değişimle aynı yöndeki parçalar üstte: artışta en çok artıran, düşüşte en çok düşüren ilk satırdır.
  const up = parts.reduce((a, p) => a + p.v, 0) >= 0;
  const top = [...parts].sort((a, b) => Math.abs(b.v) - Math.abs(a.v)).slice(0, limit).sort((a, b) => (up ? b.v - a.v : a.v - b.v));
  return (
    <div>
      {top.map((p, i) => {
        const pos = p.v >= 0, body = (
          <>
            <span className="clip">{p.label}</span>
            <span className="bar-track">
              <span className="axis" style={{ left: '50%' }} />
              <span className={`bar-fill ${good(p.v) ? 'pos' : 'neg'}`} style={{ [pos ? 'left' : 'right']: '50%', width: `${(Math.abs(p.v) / m) * 50}%`, borderRadius: pos ? '0 4px 4px 0' : '4px 0 0 4px' }} />
            </span>
            <span className="right" style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{sgn(p.v, dig)}</span>
          </>
        );
        return onPick ? <button key={i} className="why-row" onClick={() => onPick(p)}>{body}</button> : <div key={i} className="why-row">{body}</div>;
      })}
      {parts.length > limit && <p className="note" style={{ marginTop: 4 }}>En büyük {limit} parça gösteriliyor ({parts.length} parça var).</p>}
    </div>
  );
}

export function WhyDrawer() {
  const { why: stack } = useUi();
  const req = stack[stack.length - 1];
  const data = useMemo(() => (req ? why(req.en, req.sc, req.m, win(req.per)) : null), [req]);
  return (
    <AnimatePresence>
      {req && (
        <Drawer k={`${req.en}|${req.sc}|${stack.length}`} onClose={closeWhy} onBack={stack.length > 1 ? backWhy : undefined}>
          {(() => {
            const M = METRICS[req.m], w = win(req.per), dig = req.m === 'pct' ? 1 : 2;
            const good = (v: number) => better(v, req.m) > 0;
            if (!data) return <><h2>{entName(req.en)}, {scopeFull(req.sc)}</h2><p className="lead">Bu dönem için karşılaştırılacak iki ayrı veri yok.</p></>;
            const childKind = scopeKind(scopeChildren(req.sc)[0] ?? '');
            return (
              <>
                <div className="sm mut">{scopeFull(req.sc)}, {M.name.toLocaleLowerCase('tr')}</div>
                <h2>{entName(req.en)} neden {Math.abs(data.total) < 0.05 ? 'değişmedi' : data.total > 0 ? 'arttı' : 'azaldı'}?</h2>
                <div className="row" style={{ marginTop: 14, gap: 14, alignItems: 'baseline' }}>
                  <span className="num" style={{ fontSize: 34 }}>{fmt(data.prev, M.dig)} → {fmt(data.cur, M.dig)}</span>
                  <span style={{ fontSize: 17 }}><Delta v={data.total} m={req.m} /></span>
                </div>
                <p className="lead sm">Karşılaştırma: {w.desc}.</p>

                {data.byScope.length > 0 && (
                  <>
                    <h3>{childKind === 'test' ? 'Testlere göre' : childKind === 'subject' ? 'Derslere göre' : 'Konulara göre'}</h3>
                    <WhyRows parts={data.byScope} dig={dig} good={good} onPick={(p) => openWhy({ ...req, sc: p.sc! }, true)} />
                    <p className="note" style={{ marginTop: 6 }}>Satırların toplamı değişimin tamamını verir ({sgn(data.byScope.reduce((a, p) => a + p.v, 0), dig)}). Bir satıra tıklayınca onun nedenine inilir.</p>
                  </>
                )}
                {data.byMember.length > 0 && (
                  <>
                    <h3>{data.memberKind === 'Öğrenciler' ? 'Öğrencilere göre' : 'Sınıflara göre'}</h3>
                    <WhyRows parts={data.byMember} dig={dig} good={good} limit={10} onPick={(p) => openWhy({ ...req, en: p.en! }, true)} />
                    {Math.abs(data.rest) >= 0.05 && <p className="note" style={{ marginTop: 6 }}>Kalan {sgn(data.rest, dig)}: iki dönemde denemeye giren öğrenciler aynı değildi.</p>}
                  </>
                )}
                {data.byErr.length > 0 && req.m !== 'b' && (
                  <>
                    <h3>Hata türlerine göre</h3>
                    <WhyRows parts={data.byErr} dig={2} good={(v) => v < 0} limit={6} />
                    <p className="note" style={{ marginTop: 6 }}>Her denemede öğrenci başına yanlış sayısı ne kadar değişti. Artan hata sağa, azalan sola uzar.</p>
                  </>
                )}
                <div className="row wrap" style={{ marginTop: 26 }}>
                  <Link className="btn" to={`/karsilastir?k=${req.en}&n=${req.sc}`} onClick={closeWhy}>Grafiğini aç</Link>
                  {entKind(req.en) !== 'school' && entKind(req.en) !== 'level' && <Link className="btn" to={entHref(req.en)} onClick={closeWhy}>{entName(req.en)} profili</Link>}
                </div>
              </>
            );
          })()}
        </Drawer>
      )}
    </AnimatePresence>
  );
}

export function QuestionDrawer() {
  const { q: req } = useUi();
  return (
    <AnimatePresence>
      {req && (
        <Drawer k={`${req.e}|${req.q}`} onClose={() => openQ(null)}>
          {(() => {
            const ex = ds.exams[req.e], q = ex.q[req.q], st = qStats(req.e)[req.q], dist = optionDist(req.e, req.q);
            const byClass = ds.classes.map((c) => { const d = optionDist(req.e, req.q, `c:${c.i}`); return { c, p: d.n ? (100 * d.counts[q.key]) / d.n : 0 }; });
            return (
              <>
                <div className="sm mut">{ex.name}, {SUBJECTS[q.subject].name}</div>
                <h2>Soru {req.q + 1}</h2>
                <p className="lead sm">Konu: <span onClick={() => openQ(null)}><TopicLink t={q.topic} /></span></p>
                <div className="stats" style={{ marginTop: 18, gap: 26 }}>
                  <div className="stat"><div className="v">{pct(st.p * 100)}</div><div className="l">doğru yapan</div></div>
                  <div className="stat"><div className="v">{pct(st.blank * 100)}</div><div className="l">boş bırakan</div></div>
                  
                </div>
                <h3>Kim hangi şıkkı işaretledi</h3>
                {[0, 1, 2, 3, 4].map((o) => {
                  const share = dist.n ? dist.counts[o] / dist.n : 0, key = o === q.key;
                  return (
                    <div key={o} className={`opt ${key ? 'key' : ''}`}>
                      <span className="k">{LETTERS[o]}</span>
                      <div>
                        <div className="b" style={{ width: `${share * 100}%` }} />
                        {key ? <p>Doğru cevap</p> : <p><b style={{ color: 'var(--ink)', fontWeight: 600 }}>{ERRS[q.opts[o].err].name}.</b> {ERRS[q.opts[o].err].hint}</p>}
                      </div>
                      <span className="right" style={{ fontWeight: 600 }}>{pct(share * 100)}</span>
                    </div>
                  );
                })}
                <div className="opt blank">
                  <span className="k">–</span>
                  <div><div className="b" style={{ width: `${(dist.counts[BLANK] / (dist.n || 1)) * 100}%` }} /><p>Boş bırakanlar</p></div>
                  <span className="right" style={{ fontWeight: 600 }}>{pct((dist.counts[BLANK] / (dist.n || 1)) * 100)}</span>
                </div>
                <h3>Sınıflara göre doğru yapanlar</h3>
                <Bars max={100} unit="%" rows={byClass.sort((a, b) => b.p - a.p).map((r) => ({ key: r.c.id, k: `k-${lv(r.p)}`, label: <span onClick={() => openQ(null)}><EntLink en={`c:${r.c.i}`} /></span>, v: r.p }))} />
                <p className="note" style={{ marginTop: 14 }}>Her yanlış şıkkın altında, o şıkkı işaretleyenin büyük olasılıkla hangi hatayı yaptığı yazar. Bu eşleme bu örnekte hazır gelir.</p>
              </>
            );
          })()}
        </Drawer>
      )}
    </AnimatePresence>
  );
}

const ICONS: Record<HitIcon, typeof Search> = { page: LayoutGrid, class: Users, student: GraduationCap, teacher: UserRound, topic: Network, exam: ClipboardList, ask: Sparkles };
export function Palette() {
  const { palette } = useUi();
  const st = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [act, setAct] = useState(0);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(true); }
      if (e.key === 'Escape') setPalette(false);
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);
  useEffect(() => { if (palette) { setQ(''); setAct(0); } }, [palette]);
  const hits: Hit[] = useMemo(() => (q.trim() ? search(q, st.per) : PAGES.map((p) => ({ id: p.to, icon: 'page' as const, label: p.label, hint: 'Sayfa', to: p.to }))), [q, st.per]);
  const go = (h: Hit) => { setPalette(false); if (h.why) openWhy(h.why); else if (h.to) nav(h.to); };
  return (
    <AnimatePresence>
      {palette && (
        <>
          <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.14 }} onClick={() => setPalette(false)} />
          <motion.div className="pal" role="dialog" aria-modal aria-label="Ara veya sor" initial={{ opacity: 0, y: -10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }}>
            <div className="pal-in">
              <Search size={18} className="dim" />
              <input autoFocus placeholder="Sınıf, öğrenci, konu arayın ya da bir soru yazın" value={q}
                onChange={(e) => { setQ(e.target.value); setAct(0); }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') { e.preventDefault(); setAct((a) => Math.min(hits.length - 1, a + 1)); }
                  if (e.key === 'ArrowUp') { e.preventDefault(); setAct((a) => Math.max(0, a - 1)); }
                  if (e.key === 'Enter' && hits[act]) go(hits[act]);
                }} />
              <kbd>Esc</kbd>
            </div>
            <div className="pal-list">
              {!q.trim() && (
                <div style={{ padding: '6px 12px 10px' }}>
                  <div className="xs dim" style={{ marginBottom: 6 }}>Örnek sorular</div>
                  <div className="row wrap" style={{ gap: 6 }}>{EXAMPLES.map((x) => <button key={x} className="tag" style={{ height: 26 }} onClick={() => { setQ(x); setAct(0); }}>{x}</button>)}</div>
                </div>
              )}
              {hits.map((h, i) => {
                const I = ICONS[h.icon];
                return (
                  <button key={h.id} className={`pal-item ${i === act ? 'act' : ''}`} onMouseEnter={() => setAct(i)} onClick={() => go(h)}>
                    <I size={16} /><span className="clip">{h.label}</span><small>{h.hint}</small>
                  </button>
                );
              })}
              {q.trim() && !hits.length && <div className="empty">Eşleşen bir şey bulunamadı. Sınıf adı (11-B), kişi adı, ders ya da konu yazmayı deneyin.</div>}
            </div>
            <div className="pal-foot">Arama ve hazır sorular bu cihazda çalışır. Yapay zekâya serbest soru sorma bu sürümde bağlı değil.</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
export type { Ent, Scope };
