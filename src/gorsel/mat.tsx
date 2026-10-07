// Matematik görselleri: üsler ve kökler. Her biri dokunarak denenir; alt yazı o an ekranda olanı söyler.
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, Check } from 'lucide-react';
import { M } from '../math';
import { Seg } from '../ui';
import { Kutu, tr, us } from './cerceve';

/* ---------- 2'nin kuvvetleri: her adımda ikiye katla, ikiye böl ---------- */
const KUVVET = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6];
const iki = (n: number) => (n >= 0 ? String(2 ** n) : `{1//${2 ** -n}}`);
export function UsKatla() {
  const [n, setN] = useState(3);
  const adet = n >= 0 ? 2 ** n : 1, dilim = 2 ** Math.max(0, -n);
  const sutun = [1, 2, 2, 4, 4, 8, 8][Math.max(0, n)], satir = adet / sutun;
  const kutu = Math.min(34, 236 / sutun - 4, 136 / satir - 4);
  const gen = sutun * (kutu + 4) - 4, yuk = satir * (kutu + 4) - 4;
  const alt = n > 0 ? `${n} tane 2 çarpılıyor. Üs bir artınca sonuç ikiye katlanır.`
    : n === 0 ? '2^1 = 2 idi; bir adım geri gelince yarısı kalır. Bu yüzden 2^0 = 1.'
    : `Üs negatif olunca sayı negatif olmaz, küçülür: 2^{${us(n)}} = {1//2^${-n}}, yani bir bütünün ${dilim}'${dilim === 4 ? 'te' : 'de'} biri.`;
  return (
    <Kutu ad="2'nin kuvvetleri" ne="Sağa gidince ikiye katlanır, sola gidince ikiye bölünür. Sıfırı geçince ne oluyor?" alt={<M>{alt}</M>}>
      <div className="gv-sahne">
        <svg viewBox="0 0 260 150" className="gv-svg" role="img" aria-label={n >= 0 ? `${adet} kutu` : `Bir bütünün ${dilim} parçasından biri`}>
          {n >= 0
            ? Array.from({ length: adet }, (_, i) => <rect key={i} x={130 - gen / 2 + (i % sutun) * (kutu + 4)} y={75 - yuk / 2 + Math.floor(i / sutun) * (kutu + 4)} width={kutu} height={kutu} rx={Math.min(6, kutu / 4)} className="gv-dolu" />)
            : Array.from({ length: dilim }, (_, i) => <rect key={i} x={65 + i * (130 / dilim)} y={10} width={130 / dilim} height={130} className={i === 0 ? 'gv-dolu' : 'gv-dilim'} />)}
        </svg>
        <div className="gv-buyuk"><M>{`2^{${us(n)}} = ${iki(n)}`}</M></div>
      </div>
      <div className="gv-serit">
        <button className="btn icon" disabled={n <= -3} onClick={() => setN(n - 1)} aria-label="İkiye böl"><ChevronLeft size={18} /></button>
        <div className="gv-hucreler">
          {KUVVET.map((k) => <button key={k} className={`gv-hucre ${k === n ? 'on' : ''}`} aria-pressed={k === n} onClick={() => setN(k)}><small><M>{`2^{${us(k)}}`}</M></small><b><M>{iki(k)}</M></b></button>)}
        </div>
        <button className="btn icon" disabled={n >= 6} onClick={() => setN(n + 1)} aria-label="İkiye katla"><ChevronRight size={18} /></button>
      </div>
    </Kutu>
  );
}

/* ---------- Tabanı aynı kuvvetleri çarpma ve bölme: çarpan kutuları ---------- */
function Sayac({ ad, v, set }: { ad: string; v: number; set: (v: number) => void }) {
  return (
    <div className="gv-sayac">
      <span>{ad}</span>
      <button className="btn icon" disabled={v <= 1} onClick={() => set(v - 1)} aria-label={`${ad} azalt`}><Minus size={15} /></button>
      <b>{v}</b>
      <button className="btn icon" disabled={v >= 5} onClick={() => set(v + 1)} aria-label={`${ad} artır`}><Plus size={15} /></button>
    </div>
  );
}
const carpanlar = (adet: number, silik = 0, cls = '') => Array.from({ length: adet }, (_, i) => <i key={i} className={`gv-carpan ${cls} ${i < silik ? 'silik' : ''}`}>2</i>);
export function UsBirlestir() {
  const [m, setM] = useState(3), [n, setN] = useState(2), [islem, setIslem] = useState<'carp' | 'bol'>('carp');
  const bol = islem === 'bol', fark = m - n, giden = Math.min(m, n);
  const sonuc = bol ? `{2^${m}//2^${n}} = 2^{${m}−${n}} = 2^{${us(fark)}}` : `2^${m}·2^${n} = 2^{${m}+${n}} = 2^${m + n}`;
  const alt = !bol ? `${m} tane 2 ile ${n} tane 2 yan yana geldi: toplam ${m + n} tane 2. Çarparken üsler toplanır.`
    : fark > 0 ? `${giden} çift birbirini götürdü, üstte ${fark} tane 2 kaldı. Bölerken üsler çıkarılır.`
    : fark === 0 ? 'Hepsi birbirini götürdü, geriye 1 kaldı: 2^0 = 1.'
    : `Üsttekilerin hepsi gitti, altta ${-fark} tane 2 kaldı: sonuç {1//2^${-fark}}, yani 2^{${us(fark)}}.`;
  return (
    <Kutu ad="Aynı tabanı çarp, böl" ne="Kutuları say: çarparken yan yana gelirler, bölerken birbirini götürürler." alt={<M>{alt}</M>}>
      <div className="gv-ust">
        <Seg id="us-islem" value={islem} onChange={setIslem} options={[{ id: 'carp', label: 'Çarp' }, { id: 'bol', label: 'Böl' }]} />
        <Sayac ad={bol ? 'Üstteki üs' : 'Birinci üs'} v={m} set={setM} />
        <Sayac ad={bol ? 'Alttaki üs' : 'İkinci üs'} v={n} set={setN} />
      </div>
      <div className="gv-sahne">
        {bol ? (
          <div className="gv-kesir">
            <div className="gv-dizi">{carpanlar(m, giden)}</div>
            <div className="gv-cizgi" />
            <div className="gv-dizi">{carpanlar(n, giden, 'b')}</div>
          </div>
        ) : (
          <div className="gv-dizi">{carpanlar(m)}{carpanlar(n, 0, 'b')}</div>
        )}
        <div className="gv-buyuk"><M>{sonuc}</M></div>
      </div>
    </Kutu>
  );
}

/* ---------- Bilimsel gösterim: virgülü kaydır ---------- */
/** "0,00025" → anlamlı rakamlar "25" ve onun üssü −5 (25·10^−5). */
function ayir(sayi: string): { D: string; e0: number } {
  const [tam, kes = ''] = sayi.replace(/\s/g, '').split(',');
  let hepsi = (tam + kes).replace(/^0+/, ''), e0 = -kes.length;
  const son = /0+$/.exec(hepsi)?.[0].length ?? 0;
  hepsi = hepsi.slice(0, hepsi.length - son); e0 += son;
  return { D: hepsi || '0', e0 };
}
/** Rakamları, virgül p. rakamdan sonra gelecek biçimde yazar. */
const yaz = (D: string, p: number) => (p <= 0 ? `0,${'0'.repeat(-p)}${D}` : p >= D.length ? D + '0'.repeat(p - D.length) : `${D.slice(0, p)},${D.slice(p)}`);
export function Virgul({ sayilar }: { sayilar: string[] }) {
  const [hangi, setHangi] = useState(0);
  const { D, e0 } = ayir(sayilar[hangi]);
  const ilk = D.length + e0;
  const [p, setP] = useState(ilk);
  const sec = (i: number) => { const a = ayir(sayilar[i]); setHangi(i); setP(a.D.length + a.e0); };
  const k = e0 + D.length - p, bilimsel = p === 1, kayma = p - ilk;
  const a = yaz(D, p);
  const alt = bilimsel
    ? `Katsayı ${a}: 1 ile 10 arasında. Bilimsel gösterim bu.`
    : `${kayma === 0 ? 'Sayı olduğu gibi duruyor.' : `Virgül ${Math.abs(kayma)} basamak ${kayma < 0 ? 'sola' : 'sağa'} kaydı, üs ${us(k)} oldu.`} Katsayı 1 ile 10 arasına gelene kadar kaydır.`;
  return (
    <Kutu ad="Virgülü kaydır" ne="Virgül sola kayınca sayı küçülür; dengelemek için üs büyür. Sağa kayınca tersi olur." alt={alt}>
      <div className="gv-ust">
        {sayilar.map((s, i) => <button key={s} className={`gv-cip ${i === hangi ? 'on' : ''}`} aria-pressed={i === hangi} onClick={() => sec(i)}>{s}</button>)}
      </div>
      <div className="gv-sahne">
        <div className={`gv-sayi ${bilimsel ? 'tamam' : ''}`}>
          <span className="gv-rakamlar">
            {[...a].map((c, i) => (c === ',' ? <i key={i} className="gv-virgul">,</i> : <span key={i}>{c}</span>))}
            {!a.includes(',') && <i className="gv-virgul silik">,</i>}
          </span>
          <span className="gv-on"><M>{`·10^{${us(k)}}`}</M></span>
          {bilimsel && <span className="gv-tik"><Check size={18} strokeWidth={3} /></span>}
        </div>
      </div>
      <div className="gv-serit orta">
        <button className="btn" disabled={p <= -3} onClick={() => setP(p - 1)}><ChevronLeft size={16} />Virgülü sola</button>
        <button className="btn" disabled={p >= D.length + Math.max(0, e0)} onClick={() => setP(p + 1)}>Virgülü sağa<ChevronRight size={16} /></button>
      </div>
    </Kutu>
  );
}

/* ---------- Alanı bilinen karenin kenarı ---------- */
export function Kare({ alan }: { alan: number }) {
  const [a, setA] = useState(alan);
  const kenar = Math.sqrt(a), alt = Math.floor(kenar + 1e-9), tam = alt * alt === a;
  const B = 26, x0 = 22, y0 = 222;
  return (
    <Kutu
      ad="Alanı bilinen karenin kenarı" ne="Alanı kaydır. Kenar hangi iki tam sayının arasında kalıyor?"
      alt={<M>{tam ? `√${a} = ${alt}: ${a} bir tam karedir.` : `${alt}·${alt} = ${alt * alt} az gelir, ${alt + 1}·${alt + 1} = ${(alt + 1) ** 2} fazla. Demek ki ${alt} < √${a} < ${alt + 1}; yaklaşık ${tr(kenar)}.`}</M>}
    >
      <div className="gv-sahne">
        <svg viewBox="0 0 250 240" className="gv-svg dar" role="img" aria-label={`Alanı ${a} metrekare olan kare; kenarı yaklaşık ${tr(kenar)} metre`}>
          {Array.from({ length: 9 }, (_, i) => (
            <g key={i} className="gv-izgara">
              <line x1={x0 + i * B} y1={y0} x2={x0 + i * B} y2={y0 - 8 * B} />
              <line x1={x0} y1={y0 - i * B} x2={x0 + 8 * B} y2={y0 - i * B} />
              <text x={x0 + i * B} y={y0 + 13} textAnchor="middle">{i}</text>
            </g>
          ))}
          {!tam && <rect x={x0} y={y0 - (alt + 1) * B} width={(alt + 1) * B} height={(alt + 1) * B} className="gv-kesik" />}
          <rect x={x0} y={y0 - kenar * B} width={kenar * B} height={kenar * B} rx={3} className="gv-dolu yumusak" />
          {!tam && alt > 0 && <rect x={x0} y={y0 - alt * B} width={alt * B} height={alt * B} className="gv-kesik" />}
          <text x={x0 + (kenar * B) / 2} y={y0 - (kenar * B) / 2 + 5} textAnchor="middle" className="gv-yazi kalin">{a} m²</text>
        </svg>
        <div className="gv-buyuk"><M>{tam ? `√${a} = ${alt}` : `√${a} ≈ ${tr(kenar)}`}</M><small>kenar, metre</small></div>
      </div>
      <label className="gv-kay"><span>Alan: {a} m²</span><input type="range" min={1} max={50} value={a} onChange={(e) => setA(+e.target.value)} aria-label="Karenin alanı" /></label>
    </Kutu>
  );
}

/* ---------- Kök dışına çıkarma: asal çarpan çiftleri ---------- */
const asal = (n: number) => { const c: number[] = []; for (let p = 2; n > 1; p++) while (n % p === 0) { c.push(p); n /= p; } return c; };
export function KokCikar({ sayilar }: { sayilar: number[] }) {
  const [n, setN] = useState(sayilar[0]);
  /** dışarı çıkan çarpanlar: her çift için bir tane */
  const [cikan, setCikan] = useState<number[]>([]);
  const [tek, setTek] = useState<number | null>(null);
  const icerde = asal(n);
  for (const p of cikan) { icerde.splice(icerde.indexOf(p), 1); icerde.splice(icerde.indexOf(p), 1); }
  const ciftVar = (p: number) => icerde.filter((x) => x === p).length >= 2;
  const dis = cikan.reduce((x, y) => x * y, 1), ic = icerde.reduce((x, y) => x * y, 1);
  const bitti = !icerde.some(ciftVar);
  const sec = (v: number) => { setN(v); setCikan([]); setTek(null); };
  const dokun = (p: number) => { if (ciftVar(p)) { setCikan([...cikan, p]); setTek(null); } else setTek(p); };
  const sag = `${dis > 1 ? dis : ''}${ic > 1 || dis === 1 ? `√${ic}` : ''}`;
  const alt = bitti
    ? (dis === 1 ? `Hiçbir çarpanın eşi yok: √${n} olduğu gibi kalır.` : ic === 1 ? `Bütün çarpanlar çift çift çıktı: √${n} = ${dis}.` : `Eşi olan kalmadı. ${n} = ${dis}^2·${ic} olduğundan √${n} = ${dis}√${ic}.`)
    : tek != null ? `Bu ${tek} çarpanının eşi yok; kökün içinde kalır. Eşi olan bir çarpana dokun.`
    : 'Kökün içinde aynı çarpandan iki tane varsa birine dokun: çift olarak dışarı bir tane çıkar.';
  return (
    <Kutu ad="Çiftleri kökten çıkar" ne="Sayı asal çarpanlarına ayrıldı. Karekökten yalnızca çiftler çıkabilir." alt={<M>{alt}</M>}>
      <div className="gv-ust">
        {sayilar.map((s) => <button key={s} className={`gv-cip ${s === n ? 'on' : ''}`} aria-pressed={s === n} onClick={() => sec(s)}><M>{`√${s}`}</M></button>)}
        <span className="grow" />
        <button className="btn ghost" disabled={!cikan.length} onClick={() => sec(n)}><RotateCcw size={15} />Baştan</button>
      </div>
      <div className="gv-sahne">
        <div className="gv-kok">
          <div className="gv-dizi dis">{cikan.map((p, i) => <i key={i} className="gv-carpan ok">{p}</i>)}</div>
          <span className="gv-kok-im">√</span>
          <div className="gv-dizi ic">{icerde.map((p, i) => <button key={`${p}-${i}`} className={`gv-carpan ${ciftVar(p) ? 'cift' : 'b'}`} onClick={() => dokun(p)} aria-label={`${p} çarpanı`}>{p}</button>)}{!icerde.length && <i className="gv-carpan bos">1</i>}</div>
        </div>
        <div className="gv-buyuk"><M>{`√${n} = ${sag}`}</M></div>
      </div>
    </Kutu>
  );
}

/* ---------- Karesi n eden sayıyı deneyerek ara ---------- */
export function KareAra({ n }: { n: number }) {
  const alt = Math.floor(Math.sqrt(n));
  const [x, setX] = useState(alt + 0.5);
  const kare = x * x, fark = kare - n, yakin = Math.abs(fark) < 0.03;
  const X = (v: number) => 20 + (v - alt) * 280, K = (v: number) => 20 + ((v - alt * alt) / ((alt + 1) ** 2 - alt * alt)) * 280;
  const yazi = yakin ? `Çok yaklaştın: √${n} ≈ ${tr(x)}. Tam ${n} etmez; √${n} sayısının ondalık kısmı hiç bitmez. Bu yüzden yaklaşık değerle çalışırız.`
    : fark > 0 ? `Fazla geldi: ${tr(kare, 4)} > ${n}. Sayıyı küçült.` : `Az geldi: ${tr(kare, 4)} < ${n}. Sayıyı büyüt.`;
  return (
    <Kutu ad={`Karesi ${n} eden sayıyı ara`} ne={`Sayıyı kaydır, karesine bak. ${n} sayısına ne kadar yaklaşabilirsin?`} alt={<M>{yazi}</M>}>
      <div className="gv-sahne">
        <div className={`gv-buyuk ${yakin ? 'iyi' : ''}`}><M>{`${tr(x)}^2 = ${tr(kare, 4)}`}</M></div>
        <svg viewBox="0 0 320 96" className="gv-svg" role="img" aria-label={`${tr(x)} sayısının karesi ${tr(kare, 4)}`}>
          <text x={20} y={14} className="gv-yazi">sayı</text>
          <line x1={20} y1={30} x2={300} y2={30} className="gv-eksen" />
          {Array.from({ length: 11 }, (_, i) => <g key={i}><line x1={20 + i * 28} y1={i % 5 ? 26 : 22} x2={20 + i * 28} y2={34} className="gv-eksen" />{i % 5 === 0 && <text x={20 + i * 28} y={48} textAnchor="middle" className="gv-yazi">{tr(alt + i / 10, 1)}</text>}</g>)}
          <circle cx={X(x)} cy={30} r={7} className="gv-nokta" />
          <text x={20} y={66} className="gv-yazi">karesi</text>
          <rect x={20} y={74} width={280} height={10} rx={5} className="gv-ray" />
          <rect x={20} y={74} width={Math.max(0, K(kare) - 20)} height={10} rx={5} className={yakin ? 'gv-dolu iyi' : 'gv-dolu'} />
          <line x1={K(n)} y1={68} x2={K(n)} y2={90} className="gv-hedef" />
          <text x={K(n)} y={64} textAnchor="middle" className="gv-yazi kalin">{n}</text>
        </svg>
      </div>
      <label className="gv-kay"><span>Sayı: {tr(x)}</span><input type="range" min={alt} max={alt + 1} step={0.01} value={x} onChange={(e) => setX(+e.target.value)} aria-label="Denenen sayı" /></label>
    </Kutu>
  );
}
