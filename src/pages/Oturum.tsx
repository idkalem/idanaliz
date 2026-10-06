// Soru oturumu: kavrama testi ve yanlışların tekrarı aynı ekranı kullanır.
// Yanlış yapılan soru: yanılgısı anlatılır, çözümü adım adım açılır, oturumun sonunda yeniden sorulur ve Yanlışlarım'a girer.
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { X, Check, ChevronRight, Lightbulb, BookOpen, RotateCcw, Zap } from 'lucide-react';
import { konuBul, type Konu, type Soru } from '../content';
import { useStore, cevapla, toast, get, bugun, OGRENILDI } from '../store';
import { defter, bekleyenler, neZaman } from '../engine';
import { M } from '../math';
import { kOf, useTitle, Card, Empty, Drawer, Avatar, Tile } from '../ui';
import { Secenekler, Cozum, Takil, KartGovde, HARF } from '../parca';

interface Madde { konu: Konu; soru: Soru; yeniden?: boolean }
interface Kayit { m: Madde; ok: boolean; xp: number; y?: string }

export function TestSayfa() {
  const { id } = useParams();
  const konu = konuBul(id ?? '');
  if (!konu) return <div className="page"><Card><Empty title="Bu konunun testi henüz hazır değil" /></Card></div>;
  return <Oturum key={konu.id} maddeler={konu.sorular.map((soru) => ({ konu, soru }))} mod="test" baslik={`${konu.ad}: kavrama testi`} geri={`/konu/${konu.id}`} />;
}

export function TekrarSayfa() {
  const [sp] = useSearchParams();
  const q = sp.get('q'), k = sp.get('k'), hepsi = sp.get('hepsi') === '1';
  // Liste oturum başında bir kez kurulur; cevaplar geldikçe değişmez.
  const maddeler = useMemo(() => {
    const st = get();
    const liste = q ? defter(st).filter((x) => x.id === q) : hepsi || k ? defter(st).filter((x) => x.t.kutu < OGRENILDI && (!k || x.konu.id === k)) : bekleyenler(st);
    return liste.map((x) => ({ konu: x.konu, soru: x.soru }));
  }, [q, k, hepsi]);
  if (!maddeler.length) return <div className="page"><Card><Empty title="Şu an tekrar bekleyen soru yok">Yeni bir konu çalışabilir ya da defterindeki soruları erkenden çözebilirsin.<div className="row" style={{ justifyContent: 'center', marginTop: 14 }}><Link className="btn pri" to="/dersler">Derslere git</Link><Link className="btn" to="/tekrar">Yanlışlarım</Link></div></Empty></Card></div>;
  return <Oturum maddeler={maddeler} mod="tekrar" baslik="Yanlışların tekrarı" geri="/tekrar" />;
}

function Oturum({ maddeler, mod, baslik, geri }: { maddeler: Madde[]; mod: 'test' | 'tekrar'; baslik: string; geri: string }) {
  const [kuyruk, setKuyruk] = useState(maddeler);
  const [i, setI] = useState(0);
  const [sec, setSec] = useState<number | null>(null);
  const [emin, setEmin] = useState(false);
  const [ipucu, setIpucu] = useState(false);
  const [sonuc, setSonuc] = useState<{ ok: boolean; xp: number; ilerledi: boolean } | null>(null);
  const [kayit, setKayit] = useState<Kayit[]>([]);
  const [kartAcik, setKartAcik] = useState(false);
  const st = useStore();
  useTitle(baslik);
  const m = kuyruk[i] as Madde | undefined;

  const kontrol = () => {
    if (!m || sec == null || sonuc) return;
    const r = cevapla(m.konu.id, m.soru.id, sec, emin, mod === 'tekrar');
    setSonuc(r);
    toast(`+${r.xp} XP`);
    setKayit((x) => [...x, { m, ok: r.ok, xp: r.xp, y: m.soru.y[sec] ?? undefined }]);
    if (!r.ok && !m.yeniden) setKuyruk((x) => [...x, { ...m, yeniden: true }]);
  };
  const sonraki = () => { setI(i + 1); setSec(null); setEmin(false); setIpucu(false); setSonuc(null); setKartAcik(false); window.scrollTo(0, 0); };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!m || kartAcik || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') { e.preventDefault(); if (sonuc) sonraki(); else kontrol(); return; }
      if (sonuc) return;
      const j = '12345'.indexOf(e.key) >= 0 ? '12345'.indexOf(e.key) : 'abcde'.indexOf(e.key.toLowerCase());
      if (j >= 0 && j < m.soru.o.length) setSec(j);
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  });

  if (!m) return <Bitis kayit={kayit} mod={mod} geri={geri} baslik={baslik} />;

  const k = kOf(m.konu.id), yan = sonuc && !sonuc.ok && sec != null ? m.konu.yan[m.soru.y[sec] ?? ''] : undefined;
  const kart = m.konu.kartlar.find((c) => c.id === m.soru.kart);
  const t = st.tekrar[`${m.konu.id}/${m.soru.id}`];
  return (
    <div className={`sahne ${k}`}>
      <div className="sahne-ust">
        <Link className="btn ghost icon" to={geri} aria-label="Oturumu kapat"><X size={19} /></Link>
        <span className="ad">{baslik}</span>
        <div className="ilerle" role="progressbar" aria-valuenow={i} aria-valuemax={kuyruk.length}><i style={{ width: `${((i + (sonuc ? 1 : 0)) / kuyruk.length) * 100}%` }} /></div>
        <span className="ad num">{i + 1} / {kuyruk.length}</span>
      </div>
      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <article className="ders-kart">
          <div className="row wrap">
            {mod === 'tekrar' && <span className="tag info">{m.konu.ad}</span>}
            {m.yeniden && <span className="tag mid"><RotateCcw size={12} />Az önce yanlış yaptığın soru</span>}
            <span className="zor" title={['Kolay', 'Orta', 'Zor'][m.soru.z - 1]}>{[1, 2, 3].map((z) => <i key={z} className={z <= m.soru.z ? 'on' : ''} />)}</span>
            <span className="xs dim">{['Kolay', 'Orta', 'Zor'][m.soru.z - 1]}</span>
          </div>
          <div className="soru-kok"><M>{m.soru.s}</M></div>
          <Secenekler o={m.soru.o} sec={sec} dogru={m.soru.d} durum={sonuc ? 'goster' : 'sec'} onSec={setSec} />

          {!sonuc && ipucu && <div className="fb info"><span className="f-ic"><Lightbulb size={18} /></span><div><b>İpucu</b><p><M>{m.soru.c[0]}</M></p></div></div>}
          {!sonuc && (
            <div className="sahne-alt">
              {!ipucu && <button className="btn lg ghost" onClick={() => { setIpucu(true); setEmin(false); }}><Lightbulb size={17} />İpucu</button>}
              <span className="grow" />
              {!ipucu && (
                <button className={`emin ${emin ? 'on' : ''}`} aria-pressed={emin} onClick={() => setEmin(!emin)} title="Emin olduğun doğrular 5 XP fazla kazandırır">
                  <span className="kutu">{emin && <Check size={15} strokeWidth={3.2} />}</span>Eminim
                </button>
              )}
              <button className="btn lg pri" disabled={sec == null} onClick={kontrol}>Kontrol et</button>
            </div>
          )}

          {sonuc?.ok && (
            <div className="fb good">
              <span className="f-ic"><Check size={19} strokeWidth={3} /></span>
              <div>
                <b>Doğru</b>
                <p>
                  {emin ? 'Emin olduğunu söyledin ve doğru çıktı.' : ipucu ? 'İpucuyla doğru yaptın.' : 'Emin değildin ama doğru yaptın; çözüme bir göz at.'}
                  {sonuc.ilerledi && t && (t.kutu >= OGRENILDI ? ' Bu soruyu dört tekrarda da doğru yaptın: öğrenildi.' : ` Bu soru bir basamak ilerledi; ${neZaman(t.son)} yeniden sorulacak.`)}
                </p>
              </div>
            </div>
          )}
          {sonuc && !sonuc.ok && (
            <div className="fb bad">
              <span className="f-ic"><X size={19} strokeWidth={3} /></span>
              <div>
                <b>Yanlış. Doğru cevap {HARF[m.soru.d]}.</b>
                <p>{emin ? 'Emin olduğunu söylemiştin. En çok şey öğreten yanlışlar bunlardır; aşağıyı dikkatle oku.' : m.yeniden ? 'Bu soru Yanlışlarım\'da duruyor; yarın yeniden sorulacak.' : 'Bu soru oturumun sonunda yeniden gelecek ve Yanlışlarım\'a eklendi.'}</p>
              </div>
            </div>
          )}
        </article>

        {sonuc && !sonuc.ok && yan && <Takil yan={yan} />}
        {sonuc && <Cozum key={`c${i}`} adimlar={m.soru.c} tek={!sonuc.ok} baslik={sonuc.ok ? 'Çözüm' : 'Adım adım çözüm'} />}
        {sonuc && (
          <div className="sahne-alt">
            {kart && !sonuc.ok && <button className="btn lg" onClick={() => setKartAcik(true)}><BookOpen size={17} />Bu kısmı anlatımdan tekrar oku</button>}
            <span className="grow" />
            <button className="btn lg pri" onClick={sonraki}>{i + 1 < kuyruk.length ? 'Sonraki soru' : 'Sonucu gör'}<ChevronRight size={18} /></button>
          </div>
        )}
      </motion.div>
      <Drawer open={kartAcik && !!kart} onClose={() => setKartAcik(false)} label={`${m.konu.ad}: anlatım`}>
        {kart && <div className={k}><h1>{kart.baslik}</h1><KartGovde kart={kart} kisisel={st.kisisel} baska /></div>}
      </Drawer>
    </div>
  );
}

function Bitis({ kayit, mod, geri, baslik }: { kayit: Kayit[]; mod: 'test' | 'tekrar'; geri: string; baslik: string }) {
  const st = useStore();
  const ilk = kayit.filter((x) => !x.m.yeniden);
  const dogru = ilk.filter((x) => x.ok).length, yanlis = ilk.length - dogru;
  const xp = kayit.reduce((a, x) => a + x.xp, 0);
  const oran = ilk.length ? (dogru / ilk.length) * 100 : 0;
  // Bu oturumda hangi yanılgılara düşüldü
  const takilan = new Map<string, { ad: string; n: number }>();
  for (const x of kayit) if (!x.ok && x.y && x.m.konu.yan[x.y]) { const key = `${x.m.konu.id}:${x.y}`; takilan.set(key, { ad: x.m.konu.yan[x.y].ad, n: (takilan.get(key)?.n ?? 0) + 1 }); }
  const yarin = Object.values(st.tekrar).filter((t) => t.kutu < OGRENILDI && t.son === bugun() + 1).length;
  return (
    <div className="sahne">
      <motion.article className="ders-kart son" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 26 }}>
        <motion.div style={{ display: 'inline-block' }} initial={{ y: 12 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 9 }}><Avatar a={st.avatar} size={104} /></motion.div>
        <h1>{oran >= 80 ? 'Çok iyi gitti' : oran >= 50 ? 'Güzel çalışma' : 'Zor bir oturumdu, iyi ki çözdün'}</h1>
        <p>
          {baslik}. {ilk.length} sorunun {dogru} tanesini ilk denemede doğru yaptın.
          {yanlis > 0 && ` Yanlış yaptıkların Yanlışlarım'da; ${yarin ? `${yarin} soru yarın` : 'zamanı gelince'} yeniden sorulacak.`}
        </p>
        <div className="tiles n3">
          <Tile label="İlk denemede doğru" icon={<Check size={17} strokeWidth={2.8} />} tone="good" unit={`/ ${ilk.length}`}>{dogru}</Tile>
          <Tile label="Yanlış" icon={<X size={17} strokeWidth={2.8} />} tone={yanlis ? 'bad' : ''}>{yanlis}</Tile>
          <Tile label="Kazandığın" icon={<Zap size={17} />} unit="XP">{xp}</Tile>
        </div>
        {takilan.size > 0 && (
          <div className="takil" style={{ textAlign: 'left', marginTop: 0 }}>
            <div className="o-l">Bu oturumda takıldığın yerler</div>
            {[...takilan.values()].map((x) => <p key={x.ad} style={{ marginTop: 6 }}><b><M>{x.ad}</M></b>{x.n > 1 && ` (${x.n} kez)`}</p>)}
          </div>
        )}
        <div className="row wrap" style={{ justifyContent: 'center', marginTop: 22 }}>
          <Link className="btn lg" to={geri}>{mod === 'test' ? 'Konuya dön' : 'Yanlışlarım'}</Link>
          {mod === 'test' && yanlis > 0 && <Link className="btn lg" to="/tekrar">Yanlışlarımı gör</Link>}
          <Link className="btn lg pri" to="/rapor">Raporumu gör</Link>
        </div>
      </motion.article>
    </div>
  );
}
