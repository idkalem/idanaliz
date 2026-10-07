// Biyoloji görselleri: nöron, uyartının oluşması ve iletimi, sinaps; bitkide ışığa yönelme, tepe tomurcuğu, hareket adları.
// Şekillerdeki bilgiler ders notundaki kadardır; sayı, hız ya da birim uydurulmaz.
import { useState, type CSSProperties } from 'react';
import { Play, RotateCcw, Scissors, Lightbulb, ChevronRight, Undo2 } from 'lucide-react';
import { Seg } from '../ui';
import { Kutu, useOynat } from './cerceve';

/* ---------- Nöronun parçaları ve uyartının yönü ---------- */
type ParcaId = 'dendrit' | 'govde' | 'akson' | 'miyelin' | 'ranvier' | 'uc' | 'sinaps';
const PARCA: { id: ParcaId; ad: string; ne: string }[] = [
  { id: 'dendrit', ad: 'Dendrit', ne: 'Girişteki antenler. Uyartıyı alır.' },
  { id: 'govde', ad: 'Hücre gövdesi', ne: 'Merkez. Çekirdek burada.' },
  { id: 'akson', ad: 'Akson', ne: 'Uzun kablo. Uyartıyı iletir.' },
  { id: 'miyelin', ad: 'Miyelin kılıf', ne: 'Kablonun üstündeki kaplama. Yalıtır, iletimi hızlandırır.' },
  { id: 'ranvier', ad: 'Ranvier boğumu', ne: 'Kaplamanın kesildiği boşluk. Uyartı boğumdan boğuma atlayarak geçer.' },
  { id: 'uc', ad: 'Akson ucu', ne: 'Bilgiyi sonraki hücreye verir. Nörotransmitter salar.' },
  { id: 'sinaps', ad: 'Sinaps', ne: 'İki nöron arasındaki boşluk. Burada iletim kimyasaldır.' },
];
const KILIF = [160, 250, 340, 430];
export function Noron() {
  const [sec, setSec] = useState<ParcaId | null>(null);
  const o = useOynat(2800);
  const x = 30 + o.t * 550;
  const yer: ParcaId = x < 80 ? 'dendrit' : x < 140 ? 'govde' : x < 540 ? 'akson' : 'uc';
  const aktif = o.oynuyor ? yer : sec;
  const c = (id: ParcaId) => `np ${aktif === id ? 'on' : ''}`;
  const p = PARCA.find((q) => q.id === aktif);
  const alt = o.oynuyor ? `Uyartı şu an burada: ${p?.ad}.`
    : p ? `${p.ad}: ${p.ne}`
    : o.t === 1 ? 'Uyartı akson ucuna ulaştı. Bilgi hep aynı yönde akar: dendrit → gövde → akson → akson ucu.'
    : 'Bir parçaya dokun, ne işe yaradığını gör. Sonra uyartıyı gönder.';
  const etiket = (id: ParcaId, tx: number, ty: number, x1: number, y1: number, x2: number, y2: number) => (
    <g className={`n-et ${aktif === id ? 'on' : ''}`} onClick={() => setSec(id)}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <text x={tx} y={ty} textAnchor="middle">{PARCA.find((q) => q.id === id)!.ad}</text>
    </g>
  );
  return (
    <Kutu ad="Nöronun parçaları" ne="Parçalara dokun. Sonra uyartıyı gönder ve hangi yoldan gittiğine bak." alt={alt}>
      <div className="gv-sahne">
        <svg viewBox="0 0 680 250" className="gv-svg genis" role="img" aria-label="Nöron şeması: dendrit, hücre gövdesi, miyelin kılıflı akson, Ranvier boğumları, akson ucu ve sinaps">
          <g className={c('dendrit')} onClick={() => setSec('dendrit')}>
            <path className="n-dal" d="M86 107L46 72M60 84L34 92M60 84L56 54M80 125L30 125M48 125L28 108M48 125L30 142M86 143L50 176M62 165L40 158M62 165L58 190" />
          </g>
          <g className={c('akson')} onClick={() => setSec('akson')}><line className="n-akson" x1={138} y1={125} x2={540} y2={125} /></g>
          <g className={c('miyelin')} onClick={() => setSec('miyelin')}>{KILIF.map((kx) => <rect key={kx} className="n-miyelin" x={kx} y={112} width={78} height={26} rx={13} />)}</g>
          <g className={c('ranvier')} onClick={() => setSec('ranvier')}>{KILIF.slice(1).map((kx) => <circle key={kx} className="n-bogum" cx={kx - 6} cy={125} r={10} />)}</g>
          <g className={c('uc')} onClick={() => setSec('uc')}>
            <path className="n-dal" d="M540 125L574 97M540 125L580 125M540 125L574 153" />
            {[[578, 94], [585, 125], [578, 156]].map(([ux, uy]) => <circle key={uy} className="n-dugme" cx={ux} cy={uy} r={7} />)}
          </g>
          <g className={c('sinaps')} onClick={() => setSec('sinaps')}><rect className="n-bosluk" x={590} y={82} width={12} height={86} rx={6} /></g>
          <rect className="n-sonraki" x={606} y={78} width={58} height={94} rx={16} />
          <text className="gv-yazi" x={635} y={190} textAnchor="middle">Sonraki nöron</text>
          <g className={c('govde')} onClick={() => setSec('govde')}><circle className="n-govde" cx={110} cy={125} r={30} /><circle className="n-cekirdek" cx={110} cy={125} r={11} /></g>
          {etiket('govde', 110, 24, 110, 93, 110, 32)}
          {etiket('ranvier', 334, 24, 334, 113, 334, 32)}
          {etiket('sinaps', 600, 24, 596, 80, 598, 32)}
          {etiket('dendrit', 46, 236, 44, 180, 46, 220)}
          {etiket('miyelin', 199, 236, 199, 140, 199, 220)}
          {etiket('akson', 470, 236, 524, 130, 478, 220)}
          {etiket('uc', 580, 236, 578, 165, 580, 220)}
          {o.t > 0 && <circle className="gv-uyarti" cx={x} cy={125} r={10} />}
        </svg>
      </div>
      <div className="gv-serit orta sar">
        {PARCA.map((q) => <button key={q.id} className={`gv-cip ${aktif === q.id ? 'on' : ''}`} aria-pressed={aktif === q.id} onClick={() => setSec(q.id)}>{q.ad}</button>)}
        <button className="btn pri" disabled={o.oynuyor} onClick={() => { setSec(null); o.baslat(); }}><Play size={15} />Uyartıyı gönder</button>
      </div>
    </Kutu>
  );
}

/* ---------- Uyartı nasıl oluşur: zarın iki yanındaki iyonlar ---------- */
const ASAMA = [
  { ad: 'Bekleme', uzun: 'Bekleme (polarizasyon): dışarıda çok Na⁺ var; dışı +, içi −. Pil dolu bekliyor.' },
  { ad: 'Uyarı geldi', uzun: 'Uyarı geldi (depolarizasyon): kapılar açıldı, Na⁺ içeri daldı, içerisi + oldu. Uyartı tam olarak bu.' },
  { ad: 'Eski hâle dönüş', uzun: 'Eski hâle dönüş (repolarizasyon): K⁺ dışarı çıktı, içerisi yine − oldu.' },
  { ad: 'Toparlanma', uzun: 'Hücre enerji (ATP) harcayarak iyonları eski yerlerine taşıdı. Nöron yeni uyarıya hazır.' },
];
const SEKIZ = [0, 1, 2, 3, 4, 5, 6, 7];
export function Aksiyon() {
  const [a, setA] = useState(0);
  const naIcerde = a === 1 || a === 2, kDisarda = a === 2;
  const na = (i: number) => (naIcerde && i < 6 ? [86 + i * 66, 152] : [140 + i * 50, i % 2 ? 58 : 32]);
  const k = (i: number) => (kDisarda && i < 6 ? [110 + i * 58, 66] : [50 + i * 48, i % 2 ? 204 : 180]);
  const arti = a === 1;
  return (
    <Kutu ad="Uyartı nasıl oluşur?" ne="Aşamaları sırayla geç. Hangi iyon nereye gidiyor, hücrenin içi artı mı eksi mi?" alt={ASAMA[a].uzun}>
      <div className="gv-ust">
        <Seg id="aksiyon" value={a} onChange={setA} options={ASAMA.map((x, i) => ({ id: i, label: `${i + 1}. ${x.ad}` }))} />
      </div>
      <div className="gv-sahne">
        <svg viewBox="0 0 520 250" className="gv-svg genis" role="img" aria-label={ASAMA[a].uzun}>
          <rect className="n-ic" x={16} y={128} width={488} height={114} rx={10} />
          <text className="gv-yazi" x={24} y={22}>Hücrenin dışı</text>
          <text className="gv-yazi" x={24} y={236}>Hücrenin içi</text>
          {[[16, 134], [196, 150], [376, 128]].map(([zx, zw]) => <rect key={zx} className="n-zar" x={zx} y={100} width={zw} height={28} rx={6} />)}
          <rect className={`n-kapi ${a === 1 ? 'acik' : ''}`} x={152} y={110} width={42} height={8} rx={4} />
          <rect className={`n-kapi ${a === 2 ? 'acik' : ''}`} x={348} y={110} width={26} height={8} rx={4} />
          <text className="gv-yazi kucuk" x={173} y={96} textAnchor="middle">Na⁺ kapısı</text>
          <text className="gv-yazi kucuk" x={361} y={96} textAnchor="middle">K⁺ kapısı</text>
          {a === 3 && <g className="n-pompa"><rect x={236} y={98} width={50} height={32} rx={8} /><text x={261} y={119} textAnchor="middle">ATP</text></g>}
          {SEKIZ.map((i) => { const [px, py] = na(i); return <g key={`n${i}`} className="iyon na" style={{ transform: `translate(${px}px, ${py}px)` }}><circle r={12} /><text y={4} textAnchor="middle">Na⁺</text></g>; })}
          {SEKIZ.map((i) => { const [px, py] = k(i); return <g key={`k${i}`} className="iyon k" style={{ transform: `translate(${px}px, ${py}px)` }}><circle r={12} /><text y={4} textAnchor="middle">K⁺</text></g>; })}
          <g className={`n-yuk ${arti ? 'arti' : ''}`}><rect x={414} y={206} width={84} height={30} rx={15} /><text x={456} y={226} textAnchor="middle">İçi {arti ? '+' : '−'}</text></g>
        </svg>
      </div>
      <div className="gv-serit orta">
        <span className="gv-akil">Kısa yol: <b>Na girer, bozulur; K çıkar, düzelir.</b></span>
        <button className="btn pri" onClick={() => setA((a + 1) % 4)}>{a === 3 ? 'Baştan' : 'Sıradaki aşama'}<ChevronRight size={16} /></button>
      </div>
    </Kutu>
  );
}

/* ---------- Aksonda ilerleme: miyelinli ve miyelinsiz ---------- */
const BOGUM = [46, 136, 226, 316, 406, 496];
export function Iletim() {
  const o = useOynat(3400);
  const duz = 46 + o.t * 450;
  const kac = Math.min(5, Math.floor((o.t / 0.3) * 5));
  const alt = o.t === 0 ? 'İki aksona aynı anda uyartı ver. Hangisi önce bitirecek?'
    : o.oynuyor ? 'Miyelinsiz aksonda her nokta sırayla uyarılıyor: stadyum dalgası gibi. Miyelinli aksonda uyartı boğumdan boğuma atlıyor.'
    : 'Miyelinli akson çok önce bitirdi. Kaplamalı yerlerden iyon geçemez; olay yalnızca Ranvier boğumlarında olur, uyartı boğumdan boğuma atlar.';
  return (
    <Kutu ad="Hangisi daha hızlı?" ne="Üstte miyelinsiz, altta miyelinli akson. Yarışı başlat." alt={alt}>
      <div className="gv-sahne">
        <svg viewBox="0 0 560 190" className="gv-svg genis" role="img" aria-label="Miyelinsiz ve miyelinli aksonda uyartının ilerleyişi">
          <text className="gv-yazi" x={46} y={26}>Miyelinsiz akson</text>
          <line className="n-akson" x1={46} y1={52} x2={496} y2={52} />
          {o.t > 0 && <line className="n-dalga" x1={Math.max(46, duz - 44)} y1={52} x2={duz} y2={52} />}
          {o.t > 0 && <circle className="gv-uyarti" cx={duz} cy={52} r={9} />}
          <text className="gv-yazi" x={46} y={104}>Miyelinli akson</text>
          <line className="n-akson" x1={46} y1={152} x2={496} y2={152} />
          {BOGUM.slice(0, 5).map((bx) => <rect key={bx} className="n-miyelin" x={bx + 6} y={139} width={78} height={26} rx={13} />)}
          {BOGUM.map((bx, i) => <circle key={bx} className={`n-bogum ${o.t > 0 && i <= kac ? 'yandi' : ''}`} cx={bx} cy={152} r={8} />)}
          {o.t > 0 && BOGUM.slice(0, kac).map((bx) => <path key={bx} className="n-atla" d={`M${bx} 142 Q${bx + 45} 112 ${bx + 90} 142`} />)}
          {o.t > 0 && <circle className="gv-uyarti" cx={BOGUM[kac]} cy={152} r={9} />}
          {[52, 152].map((by) => <g key={by} className="n-bitis"><line x1={520} y1={by - 22} x2={520} y2={by + 14} /><path d={`M520 ${by - 22}h22l-6 7 6 7h-22z`} /></g>)}
        </svg>
      </div>
      <div className="gv-serit orta">
        <button className="btn pri" disabled={o.oynuyor} onClick={o.baslat}><Play size={15} />{o.t === 1 ? 'Yeniden yarıştır' : 'Yarışı başlat'}</button>
      </div>
    </Kutu>
  );
}

/* ---------- Ya hep ya hiç ---------- */
const ESIK = 55;
export function Esik() {
  const [v, setV] = useState(30);
  const gecti = v >= ESIK;
  const alt = !gecti ? 'Uyarı eşik değeri geçmedi: uyartı hiç oluşmaz. Uyarıyı güçlendir.'
    : v < 85 ? 'Eşik geçildi: uyartı tam oluştu. Uyarıyı daha da güçlendir; uyartı büyüyecek mi?'
    : 'Uyarı çok daha güçlü ama uyartının boyu aynı. Işık düğmesi gibi: ya hep ya hiç.';
  return (
    <Kutu ad="Ya hep ya hiç" ne="Uyarının şiddetini kaydır. Uyartı ne zaman oluşuyor, boyu değişiyor mu?" alt={alt}>
      <div className="gv-sahne">
        <svg viewBox="0 0 460 200" className="gv-svg genis" role="img" aria-label={gecti ? 'Uyarı eşiği geçti, uyartı tam oluştu' : 'Uyarı eşiğin altında, uyartı oluşmadı'}>
          <rect className="gv-ray" x={64} y={30} width={56} height={136} rx={8} />
          <rect className={gecti ? 'gv-dolu' : 'gv-dolu soluk'} x={64} y={166 - v * 1.36} width={56} height={v * 1.36} rx={8} />
          <line className="gv-hedef" x1={44} y1={166 - ESIK * 1.36} x2={140} y2={166 - ESIK * 1.36} />
          <text className="gv-yazi kalin" x={146} y={170 - ESIK * 1.36}>eşik</text>
          <text className="gv-yazi" x={92} y={186} textAnchor="middle">Uyarının şiddeti</text>
          <line className="gv-eksen" x1={230} y1={166} x2={420} y2={166} />
          <path className={`n-uyarti-egri ${gecti ? 'var' : ''}`} d={gecti ? 'M230 166H300L322 44L344 166H420' : 'M230 166H420'} />
          <text className="gv-yazi" x={325} y={186} textAnchor="middle">Oluşan uyartı</text>
          <g className={`n-lamba ${gecti ? 'yandi' : ''}`} transform="translate(392 22)"><circle r={18} cx={12} cy={12} /><Lightbulb x={0} y={0} size={24} /></g>
        </svg>
      </div>
      <label className="gv-kay"><span>Uyarı: {gecti ? 'eşiğin üstünde' : 'eşiğin altında'}</span><input type="range" min={0} max={100} value={v} onChange={(e) => setV(+e.target.value)} aria-label="Uyarının şiddeti" /></label>
    </Kutu>
  );
}

/* ---------- Sinaps: boşluğu kimyasal geçer, tek yönde ---------- */
const NT = [0, 1, 2, 3, 4, 5, 6, 7];
export function Sinaps() {
  const o = useOynat(3000);
  const [yon, setYon] = useState<'ileri' | 'ters'>('ileri');
  const ileri = yon === 'ileri', t = o.t;
  const gec = ileri ? Math.min(1, Math.max(0, (t - 0.25) / 0.5)) : 0;
  const yeni = ileri && t >= 0.75;
  const alt = t === 0 ? 'Elektrik bu boşluktan atlayamaz. Uyartıyı gönder, boşluğu neyin geçtiğine bak.'
    : !ileri ? (t < 0.5 ? 'Uyartı bu kez dendrit tarafından geliyor.' : 'Dendritte kesecik yok; boşluğa salınacak madde de yok. İleti bu yönde geçemez: sinapsta iletim tek yönlüdür.')
    : t < 0.25 ? '1. Uyartı akson ucuna ulaşıyor.'
    : t < 0.75 ? '2. Akson ucundaki keseciklerden nörotransmitter boşluğa salındı.'
    : '3. Madde sonraki nöronun reseptörlerine bağlandı, orada yeni uyartı başladı. Nöronun içinde iletim elektriksel, sinapsta kimyasal.';
  const git = (y: 'ileri' | 'ters') => { setYon(y); o.baslat(); };
  return (
    <Kutu ad="Sinapsta ne oluyor?" ne="İki nöron birbirine değmez. Uyartıyı gönder; sonra ters yönden dene." alt={alt}>
      <div className="gv-sahne">
        <svg viewBox="0 0 520 220" className="gv-svg genis" role="img" aria-label="Akson ucu, sinaps boşluğu ve sonraki nöronun dendriti">
          <text className="gv-yazi kalin" x={110} y={26} textAnchor="middle">Akson ucu</text>
          <text className="gv-yazi kalin" x={408} y={26} textAnchor="middle">Sonraki nöronun dendriti</text>
          <text className="gv-yazi kucuk" x={258} y={206} textAnchor="middle">Sinaps boşluğu</text>
          <path className={`n-uc-govde ${ileri && t > 0 && t < 0.75 ? 'on' : ''}`} d="M0 78H130Q214 78 214 116Q214 154 130 154H0Z" />
          <path className={`n-uc-govde dendrit ${yeni || (!ileri && t > 0) ? 'on' : ''}`} d="M520 62H326Q302 62 302 86V146Q302 170 326 170H520Z" />
          {[[112, 98], [156, 116], [112, 136], [70, 116]].map(([vx, vy], i) => (
            <g key={i} className={`n-kesecik ${gec > 0 ? 'bos' : ''}`}><circle cx={vx} cy={vy} r={15} />{[[-5, -3], [5, -3], [0, 5]].map(([dx, dy], j) => <circle key={j} className="n-nt" cx={vx + dx} cy={vy + dy} r={3} />)}</g>
          ))}
          {[82, 104, 128, 150].map((ry) => <path key={ry} className={`n-reseptor ${yeni ? 'dolu' : ''}`} d={`M302 ${ry - 8}h-11v16h11`} />)}
          {gec > 0 && NT.map((i) => <circle key={i} className="n-nt" cx={216 + gec * 79} cy={82 + (i >> 1) * 23 - 3 + (i % 2) * 6 + Math.sin(gec * 3.14) * (i % 2 ? 6 : -6)} r={3.4} />)}
          {ileri && t > 0 && t < 0.3 && <circle className="gv-uyarti" cx={20 + (t / 0.25) * 150} cy={116} r={10} />}
          {yeni && <circle className="gv-uyarti" cx={330 + ((t - 0.75) / 0.25) * 160} cy={116} r={10} />}
          {!ileri && t > 0 && <circle className="gv-uyarti" cx={500 - Math.min(1, t / 0.5) * 170} cy={116} r={10} />}
          {!ileri && t >= 0.5 && <g className="n-yok"><path d="M246 104l24 24m0-24l-24 24" /></g>}
        </svg>
      </div>
      <div className="gv-serit orta">
        <button className="btn pri" disabled={o.oynuyor} onClick={() => git('ileri')}><Play size={15} />Uyartıyı gönder</button>
        <button className="btn" disabled={o.oynuyor} onClick={() => git('ters')}><Undo2 size={15} />Ters yönden dene</button>
      </div>
    </Kutu>
  );
}

/* ---------- Işığa yönelme: oksin gölgede kalan tarafa geçer ---------- */
function Saksi({ x, y }: { x: number; y: number }) {
  return <g><path className="b-saksi" d={`M${x - 30} ${y}h60l-7 30h-46z`} /><rect className="b-toprak" x={x - 33} y={y - 6} width={66} height={9} rx={4} /></g>;
}
function Gunes({ x, y }: { x: number; y: number }) {
  return (
    <g className="b-gunes" style={{ transform: `translate(${x}px, ${y}px)` }}>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => <line key={d} x1={0} y1={-22} x2={0} y2={-29} transform={`rotate(${d})`} />)}
      <circle r={16} />
    </g>
  );
}
export function Isik({ deney }: { deney?: boolean }) {
  return deney ? <Koleoptil /> : <Yonelme />;
}
function Yonelme() {
  const [yon, setYon] = useState<-1 | 0 | 1>(0);
  const ucX = 180 + yon * 62, ucY = 62 + Math.abs(yon) * 16;
  /** gövdenin orta çizgisi üzerinde bir nokta (0: dip, 1: uç) */
  const orta = (s: number): [number, number] => {
    const u = 1 - s, bx = [180, 180, 180 + yon * 8, ucX], by = [192, 140, 96, ucY];
    return [0, 1].map((e) => { const p = e ? by : bx; return u * u * u * p[0] + 3 * u * u * s * p[1] + 3 * u * s * s * p[2] + s * s * s * p[3]; }) as [number, number];
  };
  const taraf = (i: number) => (yon === 0 ? (i % 2 ? 1 : -1) : -yon);
  const alt = yon === 0 ? 'Işık her yandan eşit geliyor: oksin iki tarafa eşit dağılıyor, gövde dik büyüyor.'
    : `Işık ${yon < 0 ? 'soldan' : 'sağdan'} geliyor: oksin gölgede kalan ${yon < 0 ? 'sağ' : 'sol'} tarafa geçti. O taraf daha çok uzadı, gövde ışığa doğru eğildi. Buna fototropizma denir.`;
  return (
    <Kutu ad="Işık nereden gelirse" ne="Işığın yerini değiştir. Mor noktalar oksin: hangi tarafta toplanıyor?" alt={alt}>
      <div className="gv-ust">
        <Seg id="isik" value={yon} onChange={setYon} options={[{ id: -1, label: 'Işık soldan' }, { id: 0, label: 'Tepeden' }, { id: 1, label: 'Işık sağdan' }]} />
        <span className="gv-lejant"><i className="b-oksin-n" />oksin</span>
      </div>
      <div className="gv-sahne">
        <svg viewBox="0 0 360 232" className="gv-svg" role="img" aria-label={alt}>
          <Gunes x={180 + yon * 140} y={yon === 0 ? 30 : 56} />
          <path className="b-isin" d={yon === 0 ? 'M150 50L130 190H230L210 50Z' : `M${180 + yon * 118} 44L${180 + yon * 118} 84L${180 - yon * 30} 200L${180 - yon * 30} 40Z`} />
          <path className="b-sap" d={`M180 192C180 140 ${180 + yon * 8} 96 ${ucX} ${ucY}`} style={{ d: `path("M180 192C180 140 ${180 + yon * 8} 96 ${ucX} ${ucY}")` } as CSSProperties} />
          {[0.38, 0.62].map((s, i) => { const [lx, ly] = orta(s); const y1 = i ? 1 : -1; return <ellipse key={s} className="b-yaprak" cx={lx + y1 * 20} cy={ly - 4} rx={18} ry={8} transform={`rotate(${y1 * -24} ${lx + y1 * 20} ${ly - 4})`} />; })}
          {[0.5, 0.58, 0.66, 0.74, 0.82, 0.9].map((s, i) => { const [ox, oy] = orta(s); return <circle key={s} className="b-oksin" r={4.2} style={{ transform: `translate(${ox + taraf(i) * 3.4}px, ${oy}px)` }} />; })}
          <Saksi x={180} y={196} />
        </svg>
      </div>
    </Kutu>
  );
}
const FIDE = ['Ucu açık', 'Ucu kesik', 'Ucu örtülü'];
function Koleoptil() {
  const [isik, setIsik] = useState(false);
  const alt = !isik ? 'Üç fide de dik duruyor. Birinin ucu kesildi, birinin ucu ışık geçirmez bir başlıkla örtüldü. Işığı yandan aç.'
    : 'Yalnızca ucu açık fide ışığa eğildi. Ucu kesilen de ucu örtülen de eğilmedi. Demek ki ışığı algılayan ve oksini üreten yer uç kısım.';
  return (
    <Kutu ad="Koleoptil deneyi" ne="Işığı gören yer neresi? Üç fideye yandan ışık ver ve karşılaştır." alt={alt}>
      <div className="gv-sahne">
        <svg viewBox="0 0 440 226" className="gv-svg genis" role="img" aria-label={alt}>
          {isik && <><Gunes x={34} y={60} /><path className="b-isin" d="M56 40L420 70V170L56 84Z" /></>}
          {FIDE.map((ad, i) => {
            const fx = 130 + i * 120, egik = isik && i === 0;
            const d = egik ? `M${fx} 184C${fx} 150 ${fx - 4} 118 ${fx - 34} 92` : `M${fx} 184V${i === 1 ? 112 : 84}`;
            return (
              <g key={ad}>
                <path className="b-sap kalin" d={d} style={{ d: `path("${d}")` } as CSSProperties} />
                {i === 1 && <path className="b-kesik" d={`M${fx - 14} 104l28 8`} />}
                {i === 2 && <rect className="b-baslik" x={fx - 12} y={74} width={24} height={30} rx={8} />}
                <rect className="b-toprak" x={fx - 34} y={182} width={68} height={10} rx={5} />
                <text className="gv-yazi kalin" x={fx} y={212} textAnchor="middle">{ad}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="gv-serit orta">
        <button className={`btn ${isik ? '' : 'pri'}`} onClick={() => setIsik(!isik)}>{isik ? <><RotateCcw size={15} />Işığı kapat</> : <><Lightbulb size={15} />Işığı yandan aç</>}</button>
      </div>
    </Kutu>
  );
}

/* ---------- Tepe tomurcuğu: uç kesilince yan dallar ---------- */
export function Tepe() {
  const [kesik, setKesik] = useState(false);
  const alt = !kesik ? 'Tepe tomurcuğundan gelen oksin yan tomurcukları baskılıyor: bitki boyuna uzuyor. Buna apikal dominans denir. Ucu kes, ne olacak?'
    : 'Uç kesildi, oksinin baskısı kalktı. Sitokininin de etkisiyle yan dallar büyüdü: bitki yana dallandı.';
  return (
    <Kutu ad="Ucu kesersen ne olur?" ne="Mor noktalar tepeden aşağı inen oksin. Ucu kes ve yan tomurcuklara bak." alt={alt}>
      <div className="gv-ust"><span className="gv-lejant"><i className="b-oksin-n" />oksin</span></div>
      <div className="gv-sahne">
        <svg viewBox="0 0 340 236" className="gv-svg" role="img" aria-label={alt}>
          <path className="b-sap" d={`M170 200V${kesik ? 84 : 58}`} />
          <g className={`b-yan ${kesik ? 'buyudu' : ''}`} style={{ transformOrigin: '170px 156px' }}><path className="b-sap ince" d="M170 156C140 150 118 132 104 104" /><ellipse className="b-yaprak" cx={98} cy={96} rx={18} ry={8} transform="rotate(58 98 96)" /></g>
          <g className={`b-yan ${kesik ? 'buyudu' : ''}`} style={{ transformOrigin: '170px 124px' }}><path className="b-sap ince" d="M170 124C200 118 222 100 236 72" /><ellipse className="b-yaprak" cx={242} cy={64} rx={18} ry={8} transform="rotate(-58 242 64)" /></g>
          {[156, 124].map((ty, i) => <ellipse key={ty} className={`b-tomurcuk ${kesik ? 'yok' : ''}`} cx={170 + (i ? 9 : -9)} cy={ty} rx={6} ry={8} />)}
          {!kesik && <ellipse className="b-tomurcuk tepe" cx={170} cy={46} rx={10} ry={15} />}
          {kesik && <g className="b-dusen"><ellipse className="b-tomurcuk tepe" cx={258} cy={186} rx={10} ry={15} transform="rotate(70 258 186)" /><path className="b-kesik" d="M152 80l36 8" /></g>}
          {[70, 88, 106, 124, 142, 158].map((oy, i) => <circle key={oy} className={`b-oksin ${kesik ? 'yok' : ''}`} r={4.2} style={{ transform: `translate(${170 + (i % 2 ? 3 : -3)}px, ${oy}px)` }} />)}
          <Saksi x={170} y={202} />
        </svg>
      </div>
      <div className="gv-serit orta">
        {kesik ? <button className="btn" onClick={() => setKesik(false)}><RotateCcw size={15} />Baştan</button> : <button className="btn pri" onClick={() => setKesik(true)}><Scissors size={15} />Ucu kes</button>}
      </div>
    </Kutu>
  );
}

/* ---------- Hareketin adını çöz: önek + son ek ---------- */
const ONEK: [string, string][] = [['foto', 'ışık'], ['kemo', 'kimyasal'], ['hidro', 'su'], ['termo', 'sıcaklık'], ['sismo', 'sarsıntı, dokunma'], ['gravi', 'yer çekimi'], ['tigmo', 'temas']];
const SONEK = [
  { id: 'tropizma', ne: 'yönelme', oz: ['Uyaranın yönüne bağlı', 'Büyümeyle olur', 'Kalıcıdır'] },
  { id: 'nasti', ne: 'irkilme', oz: ['Uyaranın yönü fark etmez', 'Hücredeki su basıncı (turgor) değişir', 'Geri döner'] },
];
const ORNEK: Record<string, string> = {
  fototropizma: 'Saksıdaki bitki pencereye doğru eğilir.', kemotropizma: 'Polen tüpü yumurtaya doğru uzar.', hidrotropizma: 'Kök suya doğru uzar.',
  gravitropizma: 'Kök aşağı iner (pozitif), gövde yukarı çıkar (negatif).', tigmotropizma: 'Sarmaşık desteğe sarılır.',
  fotonasti: 'Akşamsefası akşam açar.', termonasti: 'Lale sıcakta açılır, soğukta kapanır.', sismonasti: 'Küstüm otu dokununca yapraklarını kapatır.',
};
export function HareketAdi() {
  const [o, setO] = useState(0), [s, setS] = useState(0);
  const ad = ONEK[o][0] + SONEK[s].id, ornek = ORNEK[ad];
  return (
    <Kutu ad="Hareketin adını çöz" ne="Her ad iki parçadır: önek uyaranı, son ek hareketin türünü söyler. Parçaları değiştir." alt={ornek ? `Örnek: ${ornek}` : 'Bu derste bu hareketin örneği yok; ama adını artık okuyabiliyorsun.'}>
      <div className="gv-ust sar">
        {ONEK.map(([e], i) => <button key={e} className={`gv-cip ${i === o ? 'on' : ''}`} aria-pressed={i === o} onClick={() => setO(i)}>{e}</button>)}
      </div>
      <div className="gv-ust sar">
        {SONEK.map((e, i) => <button key={e.id} className={`gv-cip iki ${i === s ? 'on' : ''}`} aria-pressed={i === s} onClick={() => setS(i)}>-{e.id}</button>)}
      </div>
      <div className="gv-sahne">
        <div className="gv-ad">
          <div className="gv-ad-p"><b>{ONEK[o][0]}</b><small>{ONEK[o][1]}</small></div>
          <div className="gv-ad-p iki"><b>{SONEK[s].id}</b><small>{SONEK[s].ne}</small></div>
        </div>
        <ul className="gv-oz">{SONEK[s].oz.map((x) => <li key={x}>{x}</li>)}</ul>
      </div>
    </Kutu>
  );
}
