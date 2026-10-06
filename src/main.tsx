import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionGlobalConfig } from 'motion/react';
import './styles.css';
import App from './App';
import { ds, LAST } from './engine/core';
import { set, openWhy, openQ, openEnv, setPalette } from './store';

// Adres satırından açılış durumu: ?tema=koyu|acik temayı seçer; ?ac=neden|soru|ara ilgili pencereyi açık başlatır, ?ac=zarf son denemenin zarfını açar;
// ?anim=0 geçiş hareketlerini kapatır (ekran görüntüsü ve tanıtım çekimi için).
const p = new URLSearchParams(location.search);
const tema = p.get('tema');
if (p.get('anim') === '0') MotionGlobalConfig.skipAnimations = true;
if (tema === 'koyu' || tema === 'acik') set({ theme: tema === 'koyu' ? 'dark' : 'light' });

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

const ac = p.get('ac');
if (ac === 'neden') openWhy({ en: 'c:1', sc: 's:5', m: 'net', per: '3' });
else if (ac === 'soru') openQ({ e: LAST, q: 44 });
else if (ac === 'ara') setPalette(true);
else if (ac === 'zarf') openEnv(ds.exams[LAST].id);
