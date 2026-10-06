import { createRoot } from 'react-dom/client';
import { MotionGlobalConfig } from 'motion/react';
import './styles.css';
import App from './App';
import { get, set } from './store';
import { demo } from './demo';

// Adres çubuğu kancaları: ?tema=koyu|acik, ?anim=0 (hareketsiz), ?demo=1 (örnek çalışma geçmişi; tanıtım çekimi için).
const p = new URLSearchParams(location.search);
const tema = p.get('tema');
if (tema === 'koyu' || tema === 'acik') set({ theme: tema === 'koyu' ? 'dark' : 'light' });
if (p.get('anim') === '0') MotionGlobalConfig.skipAnimations = true;
if (p.get('demo') === '1') set(demo(get().theme));
document.documentElement.dataset.theme = get().theme;

createRoot(document.getElementById('root')!).render(<App />);
