// Küçük etkinlikler: eşleştir, iki kutuya ayır, sıraya diz. Her konuda kullanılabilir; içerik karttan gelir.
import { useMemo, useRef, useState } from 'react';
import { Check, RotateCcw, ArrowRight } from 'lucide-react';
import { M } from '../math';
import { Kutu, karistir } from './cerceve';

/** Yanlış dokunuşu kısa süre gösterir. */
function useYanlis<T>() {
  const [y, setY] = useState<T | null>(null);
  const z = useRef(0);
  const goster = (v: T) => { setY(v); clearTimeout(z.current); z.current = window.setTimeout(() => setY(null), 650); };
  return [y, goster] as const;
}
const Bitti = ({ deneme, bastan }: { deneme: number; bastan: () => void }) => (
  <div className="gv-bitti"><span className="gv-tik"><Check size={16} strokeWidth={3} /></span><b>Tamam</b><span>{deneme === 0 ? 'Hiç yanılmadın.' : `${deneme} kez yeniden denedin.`}</span><button className="btn ghost" onClick={bastan}><RotateCcw size={15} />Baştan</button></div>
);

/* ---------- Eşleştir ---------- */
export function Eslestir({ ad, cift }: { ad: string; cift: [string, string][] }) {
  const sag = useMemo(() => karistir(cift.length, 3), [cift.length]);
  const [sol, setSol] = useState<number | null>(null);
  const [tamam, setTamam] = useState<number[]>([]);
  const [hata, setHata] = useState(0);
  const [yanlis, goster] = useYanlis<number>();
  const bitti = tamam.length === cift.length;
  const dokun = (j: number) => {
    if (sol == null) return;
    if (sol === j) { setTamam([...tamam, j]); setSol(null); } else { goster(j); setHata(hata + 1); }
  };
  const bastan = () => { setTamam([]); setSol(null); setHata(0); };
  return (
    <Kutu tur="etkinlik" ad={ad} alt={bitti ? <Bitti deneme={hata} bastan={bastan} /> : sol == null ? 'Soldan birini seç, sonra sağdaki karşılığına dokun.' : 'Şimdi sağdaki karşılığına dokun.'}>
      <div className="gv-es">
        <div>{cift.map(([a], i) => <button key={i} className={`gv-oge ${tamam.includes(i) ? 'ok' : sol === i ? 'on' : ''}`} disabled={tamam.includes(i)} onClick={() => setSol(i)}><M>{a}</M></button>)}</div>
        <div>{sag.map((j) => <button key={j} className={`gv-oge ${tamam.includes(j) ? 'ok' : yanlis === j ? 'no' : ''}`} disabled={tamam.includes(j) || sol == null} onClick={() => dokun(j)}><M>{cift[j][1]}</M></button>)}</div>
      </div>
    </Kutu>
  );
}

/* ---------- İki kutuya ayır ---------- */
export function Grupla({ ad, kutu, oge }: { ad: string; kutu: [string, string]; oge: [string, 0 | 1][] }) {
  const sira = useMemo(() => karistir(oge.length, 5), [oge.length]);
  const [n, setN] = useState(0);
  const [hata, setHata] = useState(0);
  const [yanlis, goster] = useYanlis<number>();
  const bitti = n === oge.length, simdi = bitti ? null : oge[sira[n]];
  const koy = (b: 0 | 1) => { if (!simdi) return; if (simdi[1] === b) setN(n + 1); else { goster(b); setHata(hata + 1); } };
  const bastan = () => { setN(0); setHata(0); };
  return (
    <Kutu tur="etkinlik" ad={ad} alt={bitti ? <Bitti deneme={hata} bastan={bastan} /> : yanlis != null ? 'Oraya ait değil. Bir daha düşün.' : `Kart hangi kutuya ait? Kutuya dokun. (${n + 1} / ${oge.length})`}>
      <div className="gv-gr">
        {simdi && <div className="gv-oge buyuk on"><span><M>{simdi[0]}</M></span></div>}
        <div className="gv-kutular">
          {([0, 1] as const).map((b) => (
            <button key={b} className={`gv-kutu ${b ? 'iki' : ''} ${yanlis === b ? 'no' : ''}`} disabled={bitti} onClick={() => koy(b)}>
              <b>{kutu[b]}</b>
              <span className="gv-ic">{sira.slice(0, n).filter((i) => oge[i][1] === b).map((i) => <i key={i}><M>{oge[i][0]}</M></i>)}</span>
            </button>
          ))}
        </div>
      </div>
    </Kutu>
  );
}

/* ---------- Sıraya diz ---------- */
export function Sirala({ ad, oge }: { ad: string; oge: string[] }) {
  const sira = useMemo(() => karistir(oge.length, 11), [oge.length]);
  const [n, setN] = useState(0);
  const [hata, setHata] = useState(0);
  const [yanlis, goster] = useYanlis<number>();
  const bitti = n === oge.length;
  const dokun = (i: number) => { if (i === n) setN(n + 1); else { goster(i); setHata(hata + 1); } };
  const bastan = () => { setN(0); setHata(0); };
  return (
    <Kutu tur="etkinlik" ad={ad} alt={bitti ? <Bitti deneme={hata} bastan={bastan} /> : yanlis != null ? 'Sırası henüz gelmedi.' : n === 0 ? 'İlk sırada hangisi var? Dokun.' : 'Sıradaki hangisi?'}>
      <div className="gv-sr">
        <div className="gv-yol">
          {oge.map((x, i) => <span key={i} className={`gv-durak ${i < n ? 'dolu' : ''}`}>{i > 0 && <ArrowRight size={14} />}<i>{i < n ? <span><M>{x}</M></span> : i + 1}</i></span>)}
        </div>
        {!bitti && <div className="gv-havuz">{sira.filter((i) => i >= n).map((i) => <button key={i} className={`gv-oge ${yanlis === i ? 'no' : ''}`} onClick={() => dokun(i)}><M>{oge[i]}</M></button>)}</div>}
      </div>
    </Kutu>
  );
}
