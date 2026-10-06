import { useEffect, type ComponentType, type CSSProperties } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  LayoutGrid, TrendingUp, GitCompareArrows, ScanSearch, School, Users, GraduationCap, ClipboardList, BookOpen, Target, ScrollText, Database,
  Search, Sun, Moon, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { APP, ds, PERS, type Per } from './engine/core';
import { useStore, set, setPalette } from './store';
import { Seg, Sel, Page, Card, Empty } from './ui';
import { WhyDrawer, QuestionDrawer, Palette } from './overlays';
import Home from './pages/Home';
import Movers from './pages/Movers';
import Compare from './pages/Compare';
import Explore from './pages/Explore';
import { Classes, Students, Teachers } from './pages/Lists';
import { ClassProfile, StudentProfile, TeacherProfile } from './pages/Profiles';
import { Exams, ExamPage } from './pages/Exams';
import { Topics, TopicPage } from './pages/Topics';
import Forecast from './pages/Forecast';
import { Reports, ReportPage } from './pages/Reports';
import Data from './pages/Data';

type Icon = ComponentType<{ size?: number; strokeWidth?: number }>;
/** Menü: grup adı (metin) ya da sayfa. Her sayfanın kendi simge rengi vardır; renk yalnızca menüde yer bulmayı kolaylaştırır. */
const NAV: ({ to: string; label: string; icon: Icon; k: string; also?: string[] } | string)[] = [
  { to: '/', label: 'Genel bakış', icon: LayoutGrid, k: '#3478f6' },
  { to: '/hareketler', label: 'Yükselenler ve düşenler', icon: TrendingUp, k: '#2fa84f' },
  { to: '/karsilastir', label: 'Karşılaştır', icon: GitCompareArrows, k: '#6a5ae6' },
  { to: '/incele', label: 'İncele', icon: ScanSearch, k: '#0e9bb5' },
  'Kişiler',
  { to: '/siniflar', label: 'Sınıflar', icon: School, k: '#f08a24', also: ['/sinif/'] },
  { to: '/ogrenciler', label: 'Öğrenciler', icon: Users, k: '#e8518d', also: ['/ogrenci/'] },
  { to: '/ogretmenler', label: 'Öğretmenler', icon: GraduationCap, k: '#22a7a0', also: ['/ogretmen/'] },
  'Sınavlar',
  { to: '/denemeler', label: 'Denemeler', icon: ClipboardList, k: '#e5484d', also: ['/deneme/'] },
  { to: '/konular', label: 'Konular', icon: BookOpen, k: '#a45ae0', also: ['/konu/'] },
  { to: '/tahmin', label: 'Bugün sınav olsa', icon: Target, k: '#e3a008' },
  'Çıktılar',
  { to: '/raporlar', label: 'Raporlar', icon: ScrollText, k: '#7a8499', also: ['/rapor/'] },
  { to: '/veri', label: 'Veri', icon: Database, k: '#5b7fa6' },
];
const LEVELS: { id: 0 | 11 | 12; label: string }[] = [{ id: 0, label: 'Tümü' }, { id: 11, label: '11' }, { id: 12, label: '12' }];

/** Adresteki kimlik değişince sayfa baştan kurulur; önceki kaydın sekmesi ya da seçimi taşınmaz. */
function Keyed({ C }: { C: ComponentType }) {
  const { id } = useParams();
  return <C key={id} />;
}

function Shell() {
  const st = useStore(), loc = useLocation(), nav = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  const on = (to: string, also?: string[]) => loc.pathname === to || !!also?.some((p) => loc.pathname.startsWith(p));
  const mac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
  return (
    <div className="app">
      <aside className="side no-print">
        <Link to="/" className="brand" aria-label={`${APP} ana sayfa`}>
          <svg className="brand-mark" viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <linearGradient id="lg-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9a94f7" /><stop offset="0.45" stopColor="#4a3fd6" /><stop offset="0.75" stopColor="#6f7fee" /><stop offset="1" stopColor="#86a6f8" /></linearGradient>
              <linearGradient id="lg-ln" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffcf33" /><stop offset="1" stopColor="#ff5a5f" /></linearGradient>
            </defs>
            <rect width="100" height="100" rx="27" fill="url(#lg-bg)" />
            <rect x="23" y="12.5" width="16.5" height="12" rx="5" fill="#ffd43b" />
            <rect x="23" y="28" width="16.5" height="42" rx="4" fill="#fff" />
            <path fillRule="evenodd" fill="#fff" d="M46 26Q46 22 50 22H62Q88 22 88 46Q88 70 62 70H50Q46 70 46 66ZM57 32.5V59.5H62Q77 59.5 77 46Q77 32.5 62 32.5Z" />
            <polyline points="27,85 45,80 58,86 82,71" fill="none" stroke="url(#lg-ln)" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="83" cy="70.5" r="4.6" fill="#ff4d67" stroke="#fff" strokeWidth="2.2" />
          </svg>
          <div><b>{APP}</b><small>{ds.school}</small></div>
        </Link>
        <nav className="nav" aria-label="Ana menü">
          {NAV.map((n) => (typeof n === 'string' ? <div key={n} className="nav-lbl">{n}</div> : (
            <Link key={n.to} to={n.to} className={on(n.to, n.also) ? 'on' : ''} aria-current={on(n.to, n.also) ? 'page' : undefined} title={n.label}>
              <span className="ni" style={{ '--k': n.k } as CSSProperties}><n.icon size={16} strokeWidth={2.2} /></span><span>{n.label}</span>
            </Link>
          )))}
        </nav>
        <div className="side-foot"><b>Örnek veri</b>Gösterilen okul ve sonuçlar tanıtım için üretilmiştir.</div>
      </aside>
      <div className="main">
        <header className="top no-print">
          <button className="btn ghost icon hide-s" aria-label="Geri" onClick={() => nav(-1)}><ChevronLeft size={18} /></button>
          <button className="btn ghost icon hide-s" aria-label="İleri" onClick={() => nav(1)}><ChevronRight size={18} /></button>
          <button className="field" style={{ width: 'min(340px, 40vw)', justifyContent: 'flex-start', fontWeight: 500 }} onClick={() => setPalette(true)}>
            <Search size={15} /><span className="lbl grow" style={{ textAlign: 'left' }}>Ara veya sor</span><kbd className="hide-s">{mac ? '⌘K' : 'Ctrl K'}</kbd>
          </button>
          <span className="grow" />
          <Seg id="lvl" value={st.level} onChange={(level) => set({ level })} options={LEVELS} />
          <Sel label="Dönem" value={st.per} onChange={(per: Per) => set({ per })} options={PERS.map((p) => ({ id: p.id, label: p.name }))} />
          <button className="btn ghost icon" aria-label={st.theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'} onClick={() => set({ theme: st.theme === 'dark' ? 'light' : 'dark' })}>
            {st.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hareketler" element={<Movers />} />
            <Route path="/karsilastir" element={<Compare />} />
            <Route path="/incele" element={<Explore />} />
            <Route path="/siniflar" element={<Classes />} />
            <Route path="/ogrenciler" element={<Students />} />
            <Route path="/ogretmenler" element={<Teachers />} />
            <Route path="/sinif/:id" element={<Keyed C={ClassProfile} />} />
            <Route path="/ogrenci/:id" element={<Keyed C={StudentProfile} />} />
            <Route path="/ogretmen/:id" element={<Keyed C={TeacherProfile} />} />
            <Route path="/denemeler" element={<Exams />} />
            <Route path="/deneme/:id" element={<Keyed C={ExamPage} />} />
            <Route path="/konular" element={<Topics />} />
            <Route path="/konu/:id" element={<Keyed C={TopicPage} />} />
            <Route path="/tahmin" element={<Forecast />} />
            <Route path="/raporlar" element={<Reports />} />
            <Route path="/rapor/:id" element={<Keyed C={ReportPage} />} />
            <Route path="/veri" element={<Data />} />
            <Route path="*" element={<Page title="Sayfa bulunamadı"><Card><Empty title="Bu adreste bir sayfa yok">Soldaki menüden devam edebilirsiniz.</Empty></Card></Page>} />
          </Routes>
        </main>
      </div>
      <WhyDrawer />
      <QuestionDrawer />
      <Palette />
    </div>
  );
}

export default function App() {
  return <HashRouter><Shell /></HashRouter>;
}
