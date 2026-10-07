import { useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { House, BookOpen, RotateCcw, ChartColumn, UserRound, ArrowLeft, ArrowRight, Sun, Moon, Flame, Zap, Coins, CalendarRange, Sparkles, Users, LogOut, Landmark, type LucideIcon } from 'lucide-react';
import { APP } from './content';
import { useStore, useKok, useUi, setKok, cikis } from './store';
import { bekleyenler, seri } from './engine';
import { Logo, Page, Card, Empty } from './ui';
import { Avatar } from './avatar';
import Giris from './pages/Giris';
import Bugun from './pages/Bugun';
import { Dersler, DersSayfa, KonuSayfa } from './pages/Dersler';
import Anlatim from './pages/Anlatim';
import { TestSayfa, TekrarSayfa, TaramaSayfa } from './pages/Oturum';
import Yanlislar from './pages/Yanlislar';
import Program from './pages/Program';
import Zeka from './pages/Zeka';
import Rapor from './pages/Rapor';
import Profil from './pages/Profil';
import Sinif from './pages/Sinif';
import Mufredat from './pages/Mufredat';
import Yazili from './pages/Yazili';
import Kaynaklar from './pages/Kaynaklar';

interface Nav { to: string; label: string; icon: LucideIcon; k: string; also?: string[] }
const DERSLER_NAV: Nav = { to: '/dersler', label: 'Dersler', icon: BookOpen, k: '#6a4fe0', also: ['/ders/', '/konu/', '/mufredat/'] };
const KAYNAK_NAV: Nav = { to: '/kaynaklar', label: 'Kaynaklar', icon: Landmark, k: '#7a5af0' };
const PROFIL_NAV: Nav = { to: '/profil', label: 'Profil', icon: UserRound, k: '#f0772b' };
const NAV_OGRENCI: Nav[] = [
  { to: '/', label: 'Bugün', icon: House, k: '#2b6fe8' },
  DERSLER_NAV,
  { to: '/program', label: 'Program', icon: CalendarRange, k: '#0e9bb5', also: ['/tarama'] },
  { to: '/tekrar', label: 'Yanlışlarım', icon: RotateCcw, k: '#e5484d' },
  { to: '/ai', label: 'Yapay zekâ', icon: Sparkles, k: '#c2409a' },
  { to: '/rapor', label: 'Rapor', icon: ChartColumn, k: '#1baf7a' },
  KAYNAK_NAV,
  PROFIL_NAV,
];
const NAV_OGRETMEN: Nav[] = [{ to: '/', label: 'Sınıf', icon: Users, k: '#2b6fe8' }, DERSLER_NAV, { to: '/ai', label: 'Yapay zekâ', icon: Sparkles, k: '#c2409a' }, KAYNAK_NAV, PROFIL_NAV];

function Shell() {
  const st = useStore(), kok = useKok();
  const loc = useLocation(), nav = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  if (!kok.aktif) return <><Giris /><Toast /></>;
  const ogretmen = st.rol === 'ogretmen', NAV = ogretmen ? NAV_OGRETMEN : NAV_OGRENCI;
  const bek = bekleyenler(st).length;
  return (
    <div className="app">
      <aside className="side no-print">
        <Link to="/" className="brand"><Logo /><div><b>{APP}</b><small>{ogretmen ? 'Öğretmen ekranı' : 'Ders çalışma portalı'}</small></div></Link>
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
        <div className="side-foot">
          <button className="side-cik" onClick={() => { cikis(); nav('/'); }}><LogOut size={15} />Çıkış yap</button>
          <b>Kayıt bu cihazda</b>Hesaplar yalnızca bu tarayıcıda saklanır.
        </div>
      </aside>
      <div className="main">
        <header className="top no-print">
          <button className="btn ghost icon" aria-label="Geri" onClick={() => nav(-1)}><ArrowLeft size={18} /></button>
          <button className="btn ghost icon hide-s" aria-label="İleri" onClick={() => nav(1)}><ArrowRight size={18} /></button>
          <span className="grow" />
          {!ogretmen && <>
            <span className="say seri" title="Art arda çalıştığın gün"><Flame size={17} />{seri(st)}<small>gün</small></span>
            <span className="say xp hide-s" title="Toplam puan"><Zap size={17} />{st.xp}<small>XP</small></span>
            <Link to="/profil" className="say jeton" title="Jetonların"><Coins size={17} />{st.jeton}</Link>
          </>}
          <button className="btn ghost icon" aria-label={kok.tema === 'dark' ? 'Açık tema' : 'Koyu tema'} onClick={() => setKok({ tema: kok.tema === 'dark' ? 'light' : 'dark' })}>{kok.tema === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <Link to="/profil" className="av-btn" aria-label={`${st.ad}: profil`} title={st.ad}><Avatar a={st.avatar} size={34} /></Link>
        </header>
        <Routes>
          <Route path="/" element={ogretmen ? <Sinif /> : <Bugun />} />
          <Route path="/dersler" element={<Dersler />} />
          <Route path="/ders/:id" element={<DersSayfa />} />
          <Route path="/konu/:id" element={<KonuSayfa />} />
          <Route path="/konu/:id/anlatim" element={<Anlatim />} />
          <Route path="/konu/:id/test" element={<TestSayfa />} />
          <Route path="/konu/:id/yazili" element={<Yazili />} />
          <Route path="/mufredat/:sinif/:ders" element={<Mufredat />} />
          <Route path="/kaynaklar" element={<Kaynaklar />} />
          <Route path="/tekrar" element={<Yanlislar />} />
          <Route path="/tekrar/coz" element={<TekrarSayfa key={loc.search} />} />
          <Route path="/tarama" element={<TaramaSayfa />} />
          <Route path="/program" element={<Program />} />
          <Route path="/ai" element={<Zeka />} />
          <Route path="/rapor" element={<Rapor />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/sinif" element={<Sinif />} />
          <Route path="*" element={<Page title="Sayfa bulunamadı"><Card><Empty title="Aradığın sayfa yok"><Link className="btn pri" to="/" style={{ marginTop: 12 }}>Ana ekrana dön</Link></Empty></Card></Page>} />
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
