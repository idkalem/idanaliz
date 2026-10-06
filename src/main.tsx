import { createRoot } from 'react-dom/client';
import { MotionGlobalConfig } from 'motion/react';
import './styles.css';
import App from './App';
import { getKok, setKok } from './store';
import { demoYukle } from './demo';

// Adres çubuğu kancaları (tanıtım çekimi için): ?tema=koyu|acik, ?anim=0 (hareketsiz),
// ?demo=1 (örnek sınıf yüklenir, örnek öğrenciyle girilir), ?demo=ogretmen (örnek öğretmenle girilir), ?demo=giris (örnek sınıf yüklenir, giriş ekranında kalınır).
const p = new URLSearchParams(location.search);
const tema = p.get('tema');
if (tema === 'koyu' || tema === 'acik') setKok({ tema: tema === 'koyu' ? 'dark' : 'light' });
if (p.get('anim') === '0') MotionGlobalConfig.skipAnimations = true;
const demo = p.get('demo');
if (demo === '1') demoYukle('demo-deniz');
else if (demo === 'ogretmen') demoYukle('demo-ogretmen');
else if (demo === 'giris') { demoYukle(); setKok({ aktif: null }); }
document.documentElement.dataset.theme = getKok().tema;

createRoot(document.getElementById('root')!).render(<App />);
