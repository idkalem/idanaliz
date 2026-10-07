// Çalışma parçaları: seçenekler, soru metni (bağlam, tablo, kök), adım adım çözüm, yanılgı kutusu, anlatım kartının gövdesi, sesli okuma.
import { useCallback, useEffect, useState } from 'react';
import { Check, X, Lightbulb, Sparkles, TriangleAlert, Shuffle, MapPin } from 'lucide-react';
import { M, duz } from './math';
import type { Kart, Yanilgi, Tablo, Tur } from './content';
import { DUZ, ILGI_AD, type Uyarlama } from './kisi';
import { GorselKutu, etkinlikMi } from './gorsel';

export const HARF = ['A', 'B', 'C', 'D', 'E'];

/** Soru türünün adı. */
export const TUR: Record<Tur, string> = { islem: 'İşlem', baglam: 'Bağlam temelli', muhakeme: 'Muhakeme' };

/** Veri tablosu: bağlam temelli sorularda ve anlatımdaki keşif tablolarında. */
export function TabloKutu({ t }: { t: Tablo }) {
  return (
    <div className="tablo-kap">
      {t.ad && <div className="t-ad">{t.ad}</div>}
      <table className="tablo">
        <thead><tr>{t.bas.map((h, i) => <th key={i}><M>{h}</M></th>)}</tr></thead>
        <tbody>{t.sat.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}><M>{c}</M></td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

/** Sorunun okunacak kısmı: önce bağlam ve tablosu, sonra soru kökü. */
export function SoruMetni({ soru }: { soru: { s: string; b?: string[]; t?: Tablo } }) {
  return (
    <>
      {(soru.b || soru.t) && (
        <div className="baglam">
          {soru.b?.map((p, i) => <p key={i}><M>{p}</M></p>)}
          {soru.t && <TabloKutu t={soru.t} />}
        </div>
      )}
      <div className="soru-kok"><M>{soru.s}</M></div>
    </>
  );
}

/** Seçenekler. durum: 'sec' seçim yapılıyor; 'goster' doğru cevap açıklandı; 'dene' yanlış seçenek işaretlendi ama yeniden denenebilir. */
export function Secenekler({ o, sec, dogru, durum, onSec }: { o: string[]; sec: number | null; dogru: number; durum: 'sec' | 'goster' | 'dene'; onSec?: (i: number) => void }) {
  return (
    <div className="secs" role="radiogroup">
      {o.map((x, i) => {
        const cls = durum === 'goster' ? (i === dogru ? 'ok' : i === sec ? 'no' : 'sol') : durum === 'dene' ? (i === sec ? 'no' : '') : i === sec ? 'on' : '';
        return (
          <button key={i} className={`sec ${cls}`} role="radio" aria-checked={i === sec} disabled={durum === 'goster' || !onSec} onClick={() => onSec?.(i)}>
            <span className="h">{HARF[i]}</span>
            <span><M>{x}</M></span>
            {cls === 'ok' ? <Check className="i-ok" size={20} strokeWidth={2.8} /> : cls === 'no' ? <X className="i-no" size={20} strokeWidth={2.8} /> : <span />}
          </button>
        );
      })}
    </div>
  );
}

/** Adım adım çözüm. `tek` verilirse adımlar birer birer açılır. */
export function Cozum({ adimlar, tek, baslik = 'Adım adım çözüm' }: { adimlar: string[]; tek?: boolean; baslik?: string }) {
  const [n, setN] = useState(tek ? 1 : adimlar.length);
  return (
    <div className="cozum">
      <div className="o-l">{baslik}</div>
      <ol className="adimlar">{adimlar.slice(0, n).map((a, i) => <li key={i}><span><M>{a}</M></span></li>)}</ol>
      {n < adimlar.length && (
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn pri" onClick={() => setN(n + 1)}>Sonraki adım</button>
          <button className="btn ghost" onClick={() => setN(adimlar.length)}>Hepsini göster</button>
        </div>
      )}
    </div>
  );
}

/** Yanlış seçeneğin arkasındaki yanılgı ve kısa anlatımı. */
export function Takil({ yan, baslik = 'Büyük olasılıkla burada takıldın' }: { yan: Yanilgi; baslik?: string }) {
  return (
    <div className="takil">
      <div className="o-l"><TriangleAlert size={15} />{baslik}</div>
      <h3><M>{yan.ad}</M></h3>
      <p><M>{yan.anlat}</M></p>
      {yan.ornek && <p className="orn"><M>{yan.ornek}</M></p>}
    </div>
  );
}

/** Çözümlü örnek. `tek` verilirse adımlar birer birer açılır. */
function Ornek({ o, tek }: { o: { s: string; a: string[] }; tek: boolean }) {
  const [n, setN] = useState(tek ? 1 : o.a.length);
  return (
    <div className="ornek">
      <div className="o-l">Örnek</div>
      <div className="o-s"><M>{o.s}</M></div>
      <ol className="adimlar">{o.a.slice(0, n).map((a, i) => <li key={i}><span><M>{a}</M></span></li>)}</ol>
      {n < o.a.length && <button className="btn pri" style={{ marginTop: 12 }} onClick={() => setN(n + 1)}>Sonraki adım</button>}
    </div>
  );
}

/** Anlatım kartının gövdesi. `plan` verilirse parçaların sırası ve açılışı öğrencinin tercihine göre düzenlenir (bkz. kisi.ts). */
export function KartGovde({ kart, plan = DUZ, baska }: { kart: Kart; plan?: Uyarlama; baska: boolean }) {
  const [kuralAcik, setKuralAcik] = useState(false);
  const g = plan.giris, ilgiMetni = plan.ilgi ? kart.ilgi?.[plan.ilgi] : undefined;
  // İlgi alanına göre yazılmış örnek asıl durumun yerine geçmez, yanına eklenir: metin ve örnek asıl duruma gönderme yapar.
  const durum = kart.giris && (
    <div className="durum" key="durum">
      <span className="d-ic"><MapPin size={17} /></span>
      <div>
        <div className="d-l">Bir durum</div><M>{kart.giris}</M>
        {ilgiMetni && plan.ilgi && <div className="d-ilgi"><span className="tag kisi">{ILGI_AD[plan.ilgi]}</span><span><M>{ilgiMetni}</M></span></div>}
      </div>
    </div>
  );
  const paragraflar = kart.metin.map((p, i) => <p key={i}><M>{p}</M></p>);
  const metin = g === 'D'
    ? <details className="katli" key="metin"><summary>Açıklamayı oku</summary><div className="metin">{paragraflar}</div></details>
    : <div className="metin" key="metin">{paragraflar}</div>;
  const gorsel = kart.gorsel && !etkinlikMi(kart.gorsel) && <GorselKutu g={kart.gorsel} key="gorsel" />;
  const etkinlik = kart.gorsel && etkinlikMi(kart.gorsel) && <GorselKutu g={kart.gorsel} key="etkinlik" />;
  const tablo = kart.tablo && <TabloKutu t={kart.tablo} key="tablo" />;
  const kural = kart.kural && (g === 'A' && !kuralAcik
    ? <button className="kural gizli" key="kural" onClick={() => setKuralAcik(true)}><span className="k-ic"><Sparkles size={18} /></span><div><div className="k-l">Kural</div><div className="k-s">Önce kendin söylemeyi dene. Sonra dokun, karşılaştır.</div></div></button>
    : <div className="kural" key="kural"><span className="k-ic"><Sparkles size={18} /></span><div><div className="k-l">Kural</div><div className="k-s">{kart.kural.map((x, i) => <div key={i}><M>{x}</M></div>)}</div></div></div>);
  const ornek = kart.ornek && <Ornek o={kart.ornek} tek={g === 'B'} key="ornek" />;
  const sira = g === 'A' ? [durum, gorsel, tablo, metin, kural, ornek, etkinlik]
    : g === 'B' ? [durum, metin, kural, gorsel, tablo, ornek, etkinlik]
    : g === 'D' ? [durum, ornek, gorsel, kural, metin, tablo, etkinlik]
    : [durum, gorsel, metin, tablo, kural, ornek, etkinlik];
  const ikinci = !baska && plan.anlam === 'B';
  return (
    <>
      {sira}
      {(baska || ikinci) && <div className="baska"><div className="o-l"><Shuffle size={15} />{ikinci ? 'Bir de şöyle düşün' : 'Başka bir yoldan'}</div><M>{kart.baska}</M></div>}
    </>
  );
}
export { Lightbulb };

/* ---------- Sesli okuma (tarayıcının kendi sesi) ---------- */
export const sesVar = typeof window !== 'undefined' && 'speechSynthesis' in window;
export const kartMetni = (c: Kart) => duz([c.baslik, ...(c.giris ? [c.giris] : []), ...c.metin, ...(c.kural ? ['Kural', ...c.kural] : []), ...(c.ornek ? ['Örnek', c.ornek.s, ...c.ornek.a] : [])].join('. '));
export function useSes() {
  const [okuyor, setOkuyor] = useState(false);
  const sus = useCallback(() => { if (sesVar) speechSynthesis.cancel(); setOkuyor(false); }, []);
  const oku = useCallback((metin: string) => {
    if (!sesVar) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(metin);
    u.lang = 'tr-TR'; u.rate = 0.98;
    const v = speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith('tr'));
    if (v) u.voice = v;
    u.onend = u.onerror = () => setOkuyor(false);
    setOkuyor(true);
    speechSynthesis.speak(u);
  }, []);
  useEffect(() => sus, [sus]);
  return { okuyor, oku, sus };
}
