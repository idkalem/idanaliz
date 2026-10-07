// Görsellerin ortak çerçevesi ve küçük yardımcılar.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MotionGlobalConfig } from 'motion/react';
import { Hand, Puzzle } from 'lucide-react';

/** Tanıtım çekiminde (?anim=0) canlandırmalar atlanır: doğrudan son kareye gidilir. */
export const hareketsiz = () => !!MotionGlobalConfig.skipAnimations;

/** Görselin çerçevesi: başlık, sahne ve o anki durumu anlatan alt yazı. */
export function Kutu({ ad, ne, tur = 'dene', children, alt }: { ad: string; ne?: string; tur?: 'dene' | 'etkinlik'; children: ReactNode; alt?: ReactNode }) {
  return (
    <figure className={`gv ${tur} ${hareketsiz() ? 'durgun' : ''}`}>
      <figcaption>
        <span className="gv-et">{tur === 'dene' ? <Hand size={13} /> : <Puzzle size={13} />}{tur === 'dene' ? 'Dene' : 'Etkinlik'}</span>
        <b>{ad}</b>
        {ne && <small>{ne}</small>}
      </figcaption>
      {children}
      {alt && <div className="gv-alt" aria-live="polite">{alt}</div>}
    </figure>
  );
}

/** 0'dan 1'e ilerleyen canlandırma: `baslat` çağrılınca `sure` milisaniyede tamamlanır. */
export function useOynat(sure: number) {
  const [t, setT] = useState(0);
  const [oynuyor, setOynuyor] = useState(false);
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const baslat = () => {
    cancelAnimationFrame(raf.current);
    if (hareketsiz()) { setT(1); setOynuyor(false); return; }
    const t0 = performance.now();
    setOynuyor(true);
    const adim = (simdi: number) => {
      const x = Math.min(1, Math.max(0, (simdi - t0) / sure));
      setT(x);
      if (x < 1) raf.current = requestAnimationFrame(adim); else setOynuyor(false);
    };
    raf.current = requestAnimationFrame(adim);
  };
  const sifirla = () => { cancelAnimationFrame(raf.current); setT(0); setOynuyor(false); };
  return { t, oynuyor, baslat, sifirla };
}

/** Her açılışta aynı çıkan karıştırma: n ögenin yeni sırası. Asıl sırayla aynı çıkmaz. */
export function karistir(n: number, tohum = 7): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  let s = tohum * 9301 + n * 49297;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (n > 1 && a.every((x, i) => x === i)) a.push(a.shift()!);
  return a;
}

/** Sayıyı Türkçe ondalık virgülle yazar. */
export const tr = (x: number, hane = 2) => (+x.toFixed(hane)).toString().replace('.', ',');
/** Üssü eksi işaretiyle yazar. */
export const us = (n: number) => String(n).replace('-', '−');
