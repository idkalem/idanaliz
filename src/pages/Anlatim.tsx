// Konu anlatımı: kartlar birer birer gelir, her kartın sonunda bir "Anladın mı?" sorusu vardır.
// Kişiselleştirme açıksa kartın düzeni öğrencinin tercihlerine göre değişir; üstteki şeritten herkesin gördüğü hâle dönülebilir.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Volume2, Square, Shuffle, Check, ListChecks, Sparkles, SlidersHorizontal, Target, Coffee, PencilLine } from 'lucide-react';
import { konuBul, type Konu } from '../content';
import { useStore, set, kartBitir, toast, type Geri } from '../store';
import { uyarla, DUZ, type Uyarlama } from '../kisi';
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
  /** herkesin gördüğü anlatıma geçici dönüş: karşılaştırmak için */
  const [herkes, setHerkes] = useState(sp.get('duz') === '1');
  const benim = uyarla(st), plan = herkes ? DUZ : benim;
  useTitle(`${konu.ad}: anlatım`);
  useEffect(() => { window.scrollTo(0, 0); }, [i]);
  const k = kOf(konu.id);
  const git = (j: number) => { if (plan.kucukAdim && j > i && j % 2 === 0 && j < n) toast('Küçük hedef tamam'); setI(j); };
  return (
    <div className={`sahne ${k}`}>
      <div className="sahne-ust">
        <Link className="btn ghost icon" to={`/konu/${konu.id}`} aria-label="Anlatımı kapat"><X size={19} /></Link>
        <span className="ad">{konu.ad}</span>
        <div className="ilerle" role="progressbar" aria-valuenow={i} aria-valuemax={n}><i style={{ width: `${(i / n) * 100}%` }} /></div>
        {plan.kucukAdim && i < n && <span className="hedef-cip"><Target size={14} />Küçük hedef: {(i % 2) + 1} / 2</span>}
        <span className="ad num">{Math.min(i + 1, n)} / {n}</span>
      </div>
      {benim.acik && i < n && (
        <div className="sana no-print">
          <span className="sana-l"><SlidersHorizontal size={15} />{herkes ? 'Herkesin gördüğü anlatım' : 'Sana göre'}</span>
          {!herkes && benim.neden.map((x) => <span key={x.kisa} className="tag kisi" title={x.neden}>{x.kisa}</span>)}
          <span className="grow" />
          <button className="btn" onClick={() => setHerkes(!herkes)}>{herkes ? 'Bana göre göster' : 'Herkesle aynı göster'}</button>
          <Link className="btn ghost" to="/bana-gore">Neden böyle?</Link>
        </div>
      )}
      {i < n ? <KartEkrani key={`${i}-${herkes}`} konu={konu} i={i} git={git} plan={plan} /> : <Bitis konu={konu} git={setI} plan={benim} />}
    </div>
  );
}

const HAZIRLIK = ['Telefonum sessizde ve uzanamayacağım bir yerde', 'Masamda yalnızca defter ve kalem var', 'Bu konuya ayıracak yarım saatim var'];
/** Dikkatini ortamı düzenleyerek toplayanlar için: anlatım başlamadan kısa bir hazırlık. */
function Hazirlik() {
  const [ok, setOk] = useState<boolean[]>([false, false, false]);
  return (
    <div className="hazirlik">
      <div className="o-l">Başlamadan önce<span className="tag kisi">Sana göre</span></div>
      {HAZIRLIK.map((x, i) => <label key={x}><input type="checkbox" checked={ok[i]} onChange={() => setOk(ok.map((v, j) => (j === i ? !v : v)))} /><span>{x}</span></label>)}
    </div>
  );
}
/** Dikkatini kısa molayla toplayanlar için: anlatımın ortasında mola önerisi. */
function Mola() {
  const [sn, setSn] = useState<number | null>(null);
  useEffect(() => {
    if (sn == null || sn <= 0) return;
    const t = setTimeout(() => setSn(sn - 1), 1000);
    return () => clearTimeout(t);
  }, [sn]);
  return (
    <div className="mola">
      <span className="m-ic"><Coffee size={18} /></span>
      <div className="grow"><b>Yarıya geldin<span className="tag kisi">Sana göre</span></b><small>{sn == null ? 'İstersen iki dakika mola ver. Döndüğünde buradan devam edersin.' : sn > 0 ? `Mola: ${Math.floor(sn / 60)}:${String(sn % 60).padStart(2, '0')}` : 'Mola bitti. Devam edelim.'}</small></div>
      {sn == null && <button className="btn" onClick={() => setSn(120)}>2 dakika say</button>}
    </div>
  );
}
/** Karta yazılan not: "kendi cümlenle anlat" ya da "sen üret". Hesapta saklanır. */
function NotKutu({ id, baslik, ne, ai }: { id: string; baslik: string; ne: string; ai?: () => void }) {
  const st = useStore();
  const eski = st.notlar?.[id] ?? '';
  const [v, setV] = useState(eski);
  const kayitli = eski !== '' && eski === v.trim();
  return (
    <div className="not-kutu">
      <div className="o-l"><PencilLine size={15} />{baslik}<span className="tag kisi">Sana göre</span></div>
      <p>{ne}</p>
      <textarea value={v} rows={2} onChange={(e) => setV(e.target.value)} placeholder="Buraya yaz" aria-label={baslik} />
      <div className="row wrap" style={{ marginTop: 8 }}>
        <button className="btn" disabled={kayitli || !v.trim()} onClick={() => set({ notlar: { ...st.notlar, [id]: v.trim() } })}>{kayitli ? <><Check size={15} />Kaydedildi</> : 'Kaydet'}</button>
        {ai && <button className="btn ghost" onClick={ai}><Sparkles size={15} />Yapay zekâ öğretmene anlat</button>}
      </div>
    </div>
  );
}

function KartEkrani({ konu, i, git, plan }: { konu: Konu; i: number; git: (i: number) => void; plan: Uyarlama }) {
  const st = useStore();
  const kart = konu.kartlar[i], soru = kart.soru, n = konu.kartlar.length;
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
    else if (plan.dikkat === 'C') setBaska(true);
  };
  const yan = sec != null && !dogru ? konu.yan[soru.y?.[sec] ?? ''] : undefined;
  const onceDene = plan.anlam === 'D';
  const soruKutusu = (
    <div className={`anla ${onceDene ? 'once' : ''}`}>
      <h2>{onceDene ? 'Önce dene' : 'Anladın mı?'}{onceDene && <span className="tag kisi">Sana göre</span>}</h2>
      {onceDene && sec == null && <p className="note" style={{ marginBottom: 8 }}>Bilmiyorsan sorun değil. Bir tahmin yap; sonra aşağıyı okuyup yeniden dene.</p>}
      <div className="q"><M>{soru.s}</M></div>
      <Secenekler o={soru.o} sec={sec} dogru={soru.d} durum={dogru ? 'goster' : sec != null ? 'dene' : 'sec'} onSec={isaretle} />
      {dogru && <div className="fb good"><span className="f-ic"><Check size={19} strokeWidth={3} /></span><div><b>Doğru</b><p><M>{soru.neden}</M></p></div></div>}
      {sec != null && !dogru && (
        <>
          {yan
            ? <Takil yan={yan} baslik={plan.hataVeri ? 'Bu yanlış işe yarar: nerede takıldığını gösteriyor' : 'Şuna dikkat'} />
            : <div className="fb bad"><span className="f-ic"><X size={19} strokeWidth={3} /></span><div><b>{plan.hataVeri ? 'Henüz değil' : 'Olmadı'}</b><p>{plan.hataVeri ? 'Yanlış cevap bir bilgidir: hangi parçanın oturmadığını gösterir. Karta bir daha bak, sonra başka bir seçenek dene.' : 'Karta bir daha bak, sonra başka bir seçenek dene.'}</p></div></div>}
          <p className="note" style={{ marginTop: 10 }}>{plan.dikkat === 'C' ? 'Konu, kartın altında başka bir yoldan anlatıldı. Okuyup yeniden dene.' : 'Başka bir seçeneğe dokunarak yeniden deneyebilirsin.'}</p>
        </>
      )}
    </div>
  );
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      <article className="ders-kart">
        <div className="kacinci">{i + 1}. kart</div>
        <h1>{kart.baslik}</h1>
        {plan.dikkat === 'A' && i === 0 && <Hazirlik />}
        {plan.dikkat === 'B' && i === Math.floor(n / 2) && <Mola />}
        {onceDene && soruKutusu}
        <KartGovde kart={kart} plan={plan} baska={baska} />
        {plan.anlat && <NotKutu id={`${konu.id}/${kart.id}/a`} baslik="Kendi cümlenle anlat" ne="Bu karttaki fikri bir iki cümleyle yaz. Yazarken takıldığın yer, henüz oturmamış yerdir." ai={() => setAiAcik(true)} />}
        {plan.anlam === 'C' && <NotKutu id={`${konu.id}/${kart.id}/u`} baslik="Sen üret" ne="Bu kart için kendi örneğini ya da kendi sorunu yaz." />}
        <div className="sahne-alt no-print">
          {!baska && <button className="btn" onClick={() => setBaska(true)}><Shuffle size={15} />Anlamadım, başka türlü anlat</button>}
          {sesVar && (ses.okuyor
            ? <button className="btn on" onClick={ses.sus}><Square size={14} />Durdur</button>
            : <button className="btn" onClick={() => ses.oku(kartMetni(kart))}><Volume2 size={15} />Dinle</button>)}
          <button className="btn" onClick={() => setAiAcik(true)}><Sparkles size={15} />Yapay zekâya sor</button>
        </div>
        {!onceDene && soruKutusu}
      </article>
      <div className="sahne-alt no-print">
        <button className="btn lg" disabled={i === 0} onClick={() => git(i - 1)}><ChevronLeft size={18} />Geri</button>
        <span className="grow" />
        {!dogru && !bitmis && <span className="note">Devam etmek için soruyu doğru cevapla.</span>}
        <button className="btn lg pri" disabled={!dogru && !bitmis} onClick={() => git(i + 1)}>
          {i + 1 < n ? 'Sonraki kart' : 'Özete geç'}<ChevronRight size={18} />
        </button>
      </div>
      <Drawer open={aiAcik} onClose={() => setAiAcik(false)} label={`${kart.baslik}: yapay zekâ öğretmen`}>
        <Sohbet sistem={sistem(kartBaglami(konu, kart), 'Öğrenci bu anlatım kartını okuyor. Karttaki "Anladın mı?" sorusunun cevabını söyleme.')} oneriler={['Bunu günlük hayattan bir örnekle anlat', 'Daha basit anlat', 'Bana bu karttan bir soru sor']} />
      </Drawer>
    </motion.div>
  );
}

const GERI: { id: Geri; ad: string }[] = [{ id: 'evet', ad: 'Evet' }, { id: 'kismen', ad: 'Kısmen' }, { id: 'hayir', ad: 'Hayır' }];
function Bitis({ konu, git, plan }: { konu: Konu; git: (i: number) => void; plan: Uyarlama }) {
  const nav = useNavigate();
  const st = useStore();
  const g = st.geri?.[konu.id];
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      <article className="ders-kart">
        <div className="kacinci">Anlatım bitti</div>
        <h1>{konu.ad}: tek sayfa özet</h1>
        <ul className="ozet-l">{konu.ozet.map((o, j) => <li key={j}><Check size={18} strokeWidth={2.8} /><span><M>{o}</M></span></li>)}</ul>
        {plan.acik && (
          <div className="geri no-print">
            <b>Bu anlatım biçimi işine yaradı mı?</b>
            <div className="row wrap">{GERI.map((x) => <button key={x.id} className={`btn ${g === x.id ? 'on' : ''}`} aria-pressed={g === x.id} onClick={() => set({ geri: { ...st.geri, [konu.id]: x.id } })}>{x.ad}</button>)}</div>
            {g && <p className="note">{g === 'evet' ? 'Kaydedildi. Sonraki konu da bu biçimde gelecek.' : <>Kaydedildi. Tercih bir denemedir: işe yaramadıysa değiştir, yeniden dene. <Link to="/bana-gore">Tercihlerimi değiştir</Link></>}</p>}
          </div>
        )}
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
