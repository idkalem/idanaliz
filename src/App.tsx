import { useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { House, BookOpen, RotateCcw, ChartColumn, UserRound, ArrowLeft, ArrowRight, Sun, Moon, Flame, Zap, type LucideIcon } from 'lucide-react';
import { APP } from './content';
import { useStore, useUi, set } from './store';
import { bekleyenler, seri } from './engine';
import { Logo, Avatar, Page, Card, Empty } from './ui';
import Bugun from './pages/Bugun';
import { Dersler, DersSayfa, KonuSayfa } from './pages/Dersler';
import Anlatim from './pages/Anlatim';
import { TestSayfa, TekrarSayfa } from './pages/Oturum';
import Yanlislar from './pages/Yanlislar';
import Rapor from './pages/Rapor';
import Profil from './pages/Profil';

const NAV: { to: string; label: string; icon: LucideIcon; k: string; also?: string[] }[] = [
  { to: '/', label: 'Bugün', icon: House, k: '#2b6fe8' },
  { to: '/dersler', label: 'Dersler', icon: BookOpen, k: '#6a4fe0', also: ['/ders/', '/konu/'] },
  { to: '/tekrar', label: 'Yanlışlarım', icon: RotateCcw, k: '#e5484d' },
  { to: '/rapor', label: 'Rapor', icon: ChartColumn, k: '#1baf7a' },
  { to: '/profil', label: 'Profil', icon: UserRound, k: '#f0772b' },
];

function Shell() {
  const st = useStore();
  const loc = useLocation(), nav = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  const bek = bekleyenler(st).length;
  return (
    <div className="app">
      <aside className="side no-print">
        <Link to="/" className="brand"><Logo /><div><b>{APP}</b><small>TYT çalışma portalı</small></div></Link>
        <nav className="nav">
          {NAV.map((n) => {
            const on = n.to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(n.to) || !!n.also?.some((a) => loc.pathname.startsWith(a));
            return (
              <NavLink key={n.to} to={n.to} className={on ? 'on' : ''} title={n.label}>
                <span className="ni" style={{ ['--k' as string]: n.k }}><n.icon size={16} /></span>
                <span>{n.label}</span>
                {n.to === '/tekrar' && bek > 0 && <span className="cnt">{bek}</span>}
              </NavLink>
            );
          })}
        </nav>
        <div className="side-foot"><b>Kayıt bu cihazda</b>Çalışman yalnızca bu tarayıcıda saklanır.</div>
      </aside>
      <div className="main">
        <header className="top no-print">
          <button className="btn ghost icon" aria-label="Geri" onClick={() => nav(-1)}><ArrowLeft size={18} /></button>
          <button className="btn ghost icon hide-s" aria-label="İleri" onClick={() => nav(1)}><ArrowRight size={18} /></button>
          <span className="grow" />
          <span className="say seri" title="Art arda çalıştığın gün"><Flame size={17} />{seri(st.gun)}<small>gün</small></span>
          <span className="say xp" title="Toplam puan"><Zap size={17} />{st.xp}<small>XP</small></span>
          <button className="btn ghost icon" aria-label={st.theme === 'dark' ? 'Açık tema' : 'Koyu tema'} onClick={() => set({ theme: st.theme === 'dark' ? 'light' : 'dark' })}>{st.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <Link to="/profil" className="av-btn" aria-label="Profil"><Avatar a={st.avatar} size={34} /></Link>
        </header>
        <Routes>
          <Route path="/" element={<Bugun />} />
          <Route path="/dersler" element={<Dersler />} />
          <Route path="/ders/:id" element={<DersSayfa />} />
          <Route path="/konu/:id" element={<KonuSayfa />} />
          <Route path="/konu/:id/anlatim" element={<Anlatim />} />
          <Route path="/konu/:id/test" element={<TestSayfa />} />
          <Route path="/tekrar" element={<Yanlislar />} />
          <Route path="/tekrar/coz" element={<TekrarSayfa key={loc.search} />} />
          <Route path="/rapor" element={<Rapor />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="*" element={<Page title="Sayfa bulunamadı"><Card><Empty title="Aradığın sayfa yok"><Link className="btn pri" to="/" style={{ marginTop: 12 }}>Bugün'e dön</Link></Empty></Card></Page>} />
        </Routes>
      </div>
      <Toast />
    </div>
  );
}

function Toast() {
  const { toast } = useUi();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div key={toast.id} className="toast" style={{ x: '-50%' }} initial={{ opacity: 0, y: 18, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12 }} transition={{ type: 'spring', stiffness: 480, damping: 30 }}>
          <Zap size={17} />{toast.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return <HashRouter><Shell /></HashRouter>;
}
