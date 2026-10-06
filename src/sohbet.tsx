// Yapay zekâ öğretmenle konuşma kutusu ve anahtar ayarı.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Send, Sparkles, ImagePlus, X, KeyRound, Square, Trash2 } from 'lucide-react';
import { M } from './math';
import { useKok, setKok, getKok } from './store';
import { sor, MODELLER, type Mesaj } from './ai';
import { Seg } from './ui';

/** Yapay zekânın yazdığı metni paragraf ve maddelere böler; matematik yazımını dizer. */
export function Yazi({ children }: { children: string }) {
  const bloklar: ReactNode[] = [];
  let madde: string[] = [];
  const bosalt = () => { if (madde.length) { const ms = madde; bloklar.push(<ul key={bloklar.length}>{ms.map((x, i) => <li key={i}><M>{x}</M></li>)}</ul>); madde = []; } };
  for (const ham of children.split('\n')) {
    const s = ham.trim().replace(/^#+\s*/, '');
    if (!s) { bosalt(); continue; }
    const m = /^(?:[-•*]|\d+[.)])\s+(.*)$/.exec(s);
    if (m) madde.push(m[1]);
    else { bosalt(); bloklar.push(<p key={bloklar.length}><M>{s}</M></p>); }
  }
  bosalt();
  return <div className="yazi">{bloklar}</div>;
}

/** Fotoğrafı gönderilecek boyuta küçültür. */
async function kucult(f: File): Promise<{ tur: string; veri: string }> {
  const bmp = await createImageBitmap(f);
  const o = Math.min(1, 1568 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * o); c.height = Math.round(bmp.height * o);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  return { tur: 'image/jpeg', veri: c.toDataURL('image/jpeg', 0.85).split(',')[1] };
}

/** Anahtar girilmemişse konuşma kutusunun yerinde görünen açıklama. */
export function AnahtarYok() {
  return (
    <div className="empty">
      <span className="ai-ic"><KeyRound size={22} /></span>
      <b>Yapay zekâ öğretmen bu cihazda henüz açık değil</b>
      Bir kez anahtar girilince herkes kullanabilir. Anahtarı öğretmenin ya da sen girebilirsin.
      <div><Link className="btn pri" to="/profil?ai=1" style={{ marginTop: 12 }}>Anahtar gir</Link></div>
    </div>
  );
}

/**
 * Konuşma kutusu. `sistem` yapay zekâya verilen yönerge; `ilk` verilirse kutu açılır açılmaz öğrencinin ağzından gönderilir;
 * `oneriler` boş kutuda dokunulacak hazır sorulardır.
 */
export function Sohbet({ sistem: yonerge, ilk, oneriler = [], resim = false, yer = 'Sorunu yaz' }: { sistem: string; ilk?: string; oneriler?: string[]; resim?: boolean; yer?: string }) {
  const kok = useKok();
  const [ms, setMs] = useState<Mesaj[]>([]);
  const [yaz, setYaz] = useState('');
  const [akis, setAkis] = useState<string | null>(null);
  const [hata, setHata] = useState('');
  const [ek, setEk] = useState<{ tur: string; veri: string } | null>(null);
  const kes = useRef<AbortController | null>(null);
  const liste = useRef<HTMLDivElement>(null);
  const dosya = useRef<HTMLInputElement>(null);
  const basladi = useRef(false);
  const acik = !!kok.ai.anahtar.trim();

  const gonder = async (metin: string, eklenti = ek) => {
    if (akis != null || (!metin.trim() && !eklenti)) return;
    const yeni: Mesaj[] = [...ms, { rol: 'user', metin: metin.trim(), ...(eklenti ? { resim: eklenti } : {}) }];
    setMs(yeni); setYaz(''); setEk(null); setHata(''); setAkis('');
    kes.current = new AbortController();
    try {
      const tum = await sor({ sistem: yonerge, mesajlar: yeni, onParca: setAkis, signal: kes.current.signal });
      setMs([...yeni, { rol: 'assistant', metin: tum }]);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setHata((e as Error).message);
    } finally { setAkis(null); }
  };
  useEffect(() => { if (ilk && acik && !basladi.current) { basladi.current = true; void gonder(ilk, null); } }, [acik]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => kes.current?.abort(), []);
  useEffect(() => { const el = liste.current; if (el) el.scrollTop = el.scrollHeight; }, [ms, akis]);

  if (!acik) return <AnahtarYok />;
  return (
    <div className="sohbet">
      <div className="sb-liste" ref={liste}>
        {!ms.length && akis == null && (
          <div className="sb-bos">
            <span className="ai-ic"><Sparkles size={22} /></span>
            <p>Takıldığın yeri yaz. Cevabı doğrudan söylemem; birlikte buluruz.</p>
            {oneriler.length > 0 && <div className="sb-oneri">{oneriler.map((o) => <button key={o} onClick={() => void gonder(o, null)}><M>{o}</M></button>)}</div>}
          </div>
        )}
        {ms.map((m, i) => (
          <div key={i} className={`balon ${m.rol === 'user' ? 'ben' : 'ai'}`}>
            {m.resim && <img src={`data:${m.resim.tur};base64,${m.resim.veri}`} alt="Gönderdiğin fotoğraf" />}
            {m.rol === 'user' ? m.metin && <p><M>{m.metin}</M></p> : <Yazi>{m.metin}</Yazi>}
          </div>
        ))}
        {akis != null && <div className="balon ai">{akis ? <Yazi>{akis}</Yazi> : <span className="yaziyor"><i /><i /><i /></span>}</div>}
        {hata && <div className="fb bad" style={{ marginTop: 0 }}><span className="f-ic"><X size={18} strokeWidth={3} /></span><div><b>Yanıt alınamadı</b><p>{hata}</p></div></div>}
      </div>
      {ek && <div className="sb-ek"><img src={`data:${ek.tur};base64,${ek.veri}`} alt="Eklenecek fotoğraf" /><span className="grow sm mut">Fotoğraf eklendi</span><button className="btn ghost icon" aria-label="Fotoğrafı kaldır" onClick={() => setEk(null)}><X size={16} /></button></div>}
      <form className="sb-yaz" onSubmit={(e) => { e.preventDefault(); void gonder(yaz); }}>
        {resim && <>
          <input ref={dosya} type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) { try { setEk(await kucult(f)); } catch { setHata('Bu dosya açılamadı. Bir fotoğraf seç.'); } } }} />
          <button type="button" className="btn lg icon" aria-label="Soru fotoğrafı ekle" title="Soru fotoğrafı ekle" onClick={() => dosya.current?.click()}><ImagePlus size={19} /></button>
        </>}
        <input className="input grow" placeholder={yer} value={yaz} onChange={(e) => setYaz(e.target.value)} aria-label="Mesajın" />
        {akis != null
          ? <button type="button" className="btn lg icon" aria-label="Durdur" onClick={() => kes.current?.abort()}><Square size={16} /></button>
          : <button className="btn lg pri icon" aria-label="Gönder" disabled={!yaz.trim() && !ek}><Send size={18} /></button>}
      </form>
    </div>
  );
}

/** Anahtar ve model ayarı. Anahtar yalnızca bu cihazda durur. */
export function AnahtarKutusu() {
  const kok = useKok();
  const [yaz, setYaz] = useState('');
  const [durum, setDurum] = useState<{ tur: 'good' | 'bad' | 'info'; yazi: string } | null>(null);
  const var_ = !!kok.ai.anahtar;
  const ai = (p: Partial<typeof kok.ai>) => setKok({ ai: { ...getKok().ai, ...p } });
  const dene = async () => {
    setDurum({ tur: 'info', yazi: 'Deneniyor…' });
    try { await sor({ sistem: 'Yalnızca "hazır" yaz.', mesajlar: [{ rol: 'user', metin: 'Hazır mısın?' }], enCok: 20 }); setDurum({ tur: 'good', yazi: 'Bağlantı çalışıyor.' }); }
    catch (e) { setDurum({ tur: 'bad', yazi: (e as Error).message }); }
  };
  return (
    <>
      <div className="ayar">
        <div className="grow"><b>Anahtar</b><small>{var_ ? `Kayıtlı: ${kok.ai.anahtar.slice(0, 10)}…${kok.ai.anahtar.slice(-4)}` : 'Claude API anahtarı (sk-ant-… ile başlar).'}</small></div>
        {var_ ? <><button className="btn" onClick={() => void dene()}>Dene</button><button className="btn" onClick={() => { ai({ anahtar: '' }); setDurum(null); }}><Trash2 size={15} />Sil</button></>
          : <form className="row" onSubmit={(e) => { e.preventDefault(); if (yaz.trim()) { ai({ anahtar: yaz.trim() }); setYaz(''); setDurum(null); } }}>
            <input className="input" type="password" autoComplete="off" style={{ width: 190 }} placeholder="sk-ant-…" value={yaz} onChange={(e) => setYaz(e.target.value)} aria-label="Claude API anahtarı" />
            <button className="btn pri" disabled={!yaz.trim()}>Kaydet</button>
          </form>}
      </div>
      {durum && <p className={`note ai-durum ${durum.tur}`}>{durum.yazi}</p>}
      <div className="ayar"><div className="grow"><b>Model</b><small>{MODELLER.find((m) => m.id === kok.ai.model)?.ne ?? 'Özel model'}. Güçlü model daha iyi anlatır, hızlı model daha ucuzdur.</small></div><Seg id="model" value={kok.ai.model} onChange={(v) => ai({ model: v })} options={MODELLER.map((m) => ({ id: m.id, label: m.ad }))} /></div>
      <p className="note" style={{ marginTop: 10 }}>Anahtar yalnızca bu cihazda saklanır ve yalnızca Anthropic'e gönderilir; öğrencinin adı gönderilmez. Kullanım ücretlidir: anahtarı platform.claude.com adresinden alırken harcama sınırı koy. Ortak bir tahtada iş bitince anahtarı sil.</p>
    </>
  );
}
