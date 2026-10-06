// Konu anlatımı: kartlar birer birer gelir, her kartın sonunda bir "Anladın mı?" sorusu vardır.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Volume2, Square, Shuffle, Check, ListChecks, Sparkles } from 'lucide-react';
import { konuBul, type Konu } from '../content';
import { useStore, kartBitir, toast } from '../store';
import { M } from '../math';
import { kOf, useTitle, Card, Empty, Drawer } from '../ui';
import { Secenekler, KartGovde, Takil, useSes, sesVar, kartMetni } from '../parca';
import { Sohbet } from '../sohbet';
import { sistem, kartBaglami } from '../ai';

export default function Anlatim() {
  const { id } = useParams();
  const konu = konuBul(id ?? '');
  if (!konu) return <div className="page"><Card><Empty title="Bu konunun anlatımı henüz hazır değil"><Link className="btn" to="/dersler" style={{ marginTop: 12 }}>Derslere dön</Link></Empty></Card></div>;
  return <Ic konu={konu} key={konu.id} />;
}

function Ic({ konu }: { konu: Konu }) {
  const st = useStore();
  const [sp] = useSearchParams();
  const n = konu.kartlar.length;
  const [i, setI] = useState(() => {
    const p = sp.get('kart');
    if (p != null && +p >= 0 && +p <= n) return +p;
    const ilk = konu.kartlar.findIndex((c) => st.kart[`${konu.id}/${c.id}`] == null);
    return ilk < 0 ? 0 : ilk;
  });
  useTitle(`${konu.ad}: anlatım`);
  useEffect(() => { window.scrollTo(0, 0); }, [i]);
  const k = kOf(konu.id);
  return (
    <div className={`sahne ${k}`}>
      <div className="sahne-ust">
        <Link className="btn ghost icon" to={`/konu/${konu.id}`} aria-label="Anlatımı kapat"><X size={19} /></Link>
        <span className="ad">{konu.ad}</span>
        <div className="ilerle" role="progressbar" aria-valuenow={i} aria-valuemax={n}><i style={{ width: `${(i / n) * 100}%` }} /></div>
        <span className="ad num">{Math.min(i + 1, n)} / {n}</span>
      </div>
      {i < n ? <KartEkrani key={i} konu={konu} i={i} git={setI} /> : <Bitis konu={konu} git={setI} />}
    </div>
  );
}

function KartEkrani({ konu, i, git }: { konu: Konu; i: number; git: (i: number) => void }) {
  const st = useStore();
  const kart = konu.kartlar[i], soru = kart.soru;
  const bitmis = st.kart[`${konu.id}/${kart.id}`] != null;
  const [sec, setSec] = useState<number | null>(null);
  const [baska, setBaska] = useState(false);
  const [aiAcik, setAiAcik] = useState(false);
  const ses = useSes();
  const dogru = sec === soru.d;
  useEffect(() => { if (st.kisisel.acik && st.kisisel.dinle) ses.oku(kartMetni(kart)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const isaretle = (j: number) => {
    setSec(j);
    if (j === soru.d) { const xp = kartBitir(konu.id, kart.id); if (xp) toast(`+${xp} XP`); }
  };
  const yan = sec != null && !dogru ? konu.yan[soru.y?.[sec] ?? ''] : undefined;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      <article className="ders-kart">
        <div className="kacinci">{i + 1}. kart</div>
        <h1>{kart.baslik}</h1>
        <KartGovde kart={kart} kisisel={st.kisisel} baska={baska} />
        <div className="sahne-alt no-print">
          {!baska && <button className="btn" onClick={() => setBaska(true)}><Shuffle size={15} />Anlamadım, başka türlü anlat</button>}
          {sesVar && (ses.okuyor
            ? <button className="btn on" onClick={ses.sus}><Square size={14} />Durdur</button>
            : <button className="btn" onClick={() => ses.oku(kartMetni(kart))}><Volume2 size={15} />Dinle</button>)}
          <button className="btn" onClick={() => setAiAcik(true)}><Sparkles size={15} />Yapay zekâya sor</button>
        </div>
        <div className="anla">
          <h2>Anladın mı?</h2>
          <div className="q"><M>{soru.s}</M></div>
          <Secenekler o={soru.o} sec={sec} dogru={soru.d} durum={dogru ? 'goster' : sec != null ? 'dene' : 'sec'} onSec={isaretle} />
          {dogru && <div className="fb good"><span className="f-ic"><Check size={19} strokeWidth={3} /></span><div><b>Doğru</b><p><M>{soru.neden}</M></p></div></div>}
          {sec != null && !dogru && (
            <>
              {yan ? <Takil yan={yan} baslik="Şuna dikkat" /> : <div className="fb bad"><span className="f-ic"><X size={19} strokeWidth={3} /></span><div><b>Olmadı</b><p>Kurala ve örneğe bir daha bak, sonra başka bir seçenek dene.</p></div></div>}
              <p className="note" style={{ marginTop: 10 }}>Başka bir seçeneğe dokunarak yeniden deneyebilirsin.</p>
            </>
          )}
        </div>
      </article>
      <div className="sahne-alt no-print">
        <button className="btn lg" disabled={i === 0} onClick={() => git(i - 1)}><ChevronLeft size={18} />Geri</button>
        <span className="grow" />
        {!dogru && !bitmis && <span className="note">Devam etmek için soruyu doğru cevapla.</span>}
        <button className="btn lg pri" disabled={!dogru && !bitmis} onClick={() => git(i + 1)}>
          {i + 1 < konu.kartlar.length ? 'Sonraki kart' : 'Özete geç'}<ChevronRight size={18} />
        </button>
      </div>
      <Drawer open={aiAcik} onClose={() => setAiAcik(false)} label={`${kart.baslik}: yapay zekâ öğretmen`}>
        <Sohbet sistem={sistem(kartBaglami(konu, kart), 'Öğrenci bu anlatım kartını okuyor. Karttaki "Anladın mı?" sorusunun cevabını söyleme.')} oneriler={['Bunu günlük hayattan bir örnekle anlat', 'Daha basit anlat', 'Bana bu karttan bir soru sor']} />
      </Drawer>
    </motion.div>
  );
}

function Bitis({ konu, git }: { konu: Konu; git: (i: number) => void }) {
  const nav = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      <article className="ders-kart">
        <div className="kacinci">Anlatım bitti</div>
        <h1>{konu.ad}: tek sayfa özet</h1>
        <ul className="ozet-l">{konu.ozet.map((o, j) => <li key={j}><Check size={18} strokeWidth={2.8} /><span><M>{o}</M></span></li>)}</ul>
      </article>
      <div className="sahne-alt no-print">
        <button className="btn lg" onClick={() => git(konu.kartlar.length - 1)}><ChevronLeft size={18} />Geri</button>
        <span className="grow" />
        <Link className="btn lg" to={`/konu/${konu.id}`}>Konuya dön</Link>
        <button className="btn lg pri" onClick={() => nav(`/konu/${konu.id}/test`)}><ListChecks size={18} />Kavrama testine başla</button>
      </div>
    </motion.div>
  );
}
