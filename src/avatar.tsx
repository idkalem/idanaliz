// Avatar: katmanlı küçük bir yaratık. Parçalar jetonla alınır, seviyeyle ya da rozetle açılır.
import { useId } from 'react';
import type { Avatar as Av, State } from './store';

export type Tur = 'renk' | 'desen' | 'goz' | 'agiz' | 'bas' | 'gozluk' | 'boyun' | 'zemin';
/** fiyat: jetonla alınır; lv: o seviyede açılır; rozet: o rozet kazanılınca açılır. Hiçbiri yoksa herkese açıktır. */
export interface Parca { ad: string; fiyat?: number; lv?: number; rozet?: string }
export const AV_RENK = ['#4a7df0', '#7a5be8', '#e8518d', '#f0772b', '#1baf7a', '#0e9bb5', '#e3a008', '#5b6b8c'];
const p = (ad: string, x: Omit<Parca, 'ad'> = {}): Parca => ({ ad, ...x });
export const TURLER: { id: Tur; ad: string }[] = [
  { id: 'renk', ad: 'Renk' }, { id: 'desen', ad: 'Desen' }, { id: 'goz', ad: 'Gözler' }, { id: 'agiz', ad: 'Ağız' },
  { id: 'bas', ad: 'Baş' }, { id: 'gozluk', ad: 'Gözlük' }, { id: 'boyun', ad: 'Boyun' }, { id: 'zemin', ad: 'Zemin' },
];
export const KATALOG: Record<Tur, Parca[]> = {
  renk: ['Mavi', 'Mor', 'Pembe', 'Turuncu', 'Yeşil', 'Turkuaz', 'Sarı', 'Gri'].map((ad) => p(ad)),
  desen: [p('Düz'), p('Benekli', { fiyat: 40 }), p('Çizgili', { fiyat: 40 }), p('Yıldızlı', { fiyat: 80 })],
  goz: [p('Yuvarlak'), p('Gülen'), p('Meraklı'), p('Uykulu', { fiyat: 30 }), p('Kararlı', { fiyat: 30 }), p('Yıldız', { fiyat: 70 })],
  agiz: [p('Gülümseme'), p('Kocaman gülüş'), p('Şaşkın'), p('Dil', { fiyat: 30 }), p('Dişlek', { fiyat: 30 })],
  bas: [p('Yok'), p('Bere', { fiyat: 50 }), p('Kasket', { fiyat: 50 }), p('Kurdele', { fiyat: 40 }), p('Anten', { fiyat: 30 }), p('Kulaklık', { lv: 3 }), p('Mezuniyet kepi', { rozet: 'konu' }), p('Taç', { rozet: 'seri7' })],
  gozluk: [p('Yok'), p('Yuvarlak', { fiyat: 40 }), p('Kare', { fiyat: 40 }), p('Güneş gözlüğü', { fiyat: 70 })],
  boyun: [p('Yok'), p('Papyon', { fiyat: 40 }), p('Atkı', { fiyat: 50 }), p('Madalya', { rozet: 'avci' })],
  zemin: [p('Sade'), p('Gökyüzü', { fiyat: 60 }), p('Gün batımı', { fiyat: 60 }), p('Çimen', { fiyat: 60 }), p('Uzay', { lv: 5 })],
};

export interface PDurum { acik: boolean; fiyat?: number; kosul?: string }
/** Bir parça bu hesapta kullanılabilir mi; değilse neyle açılır. */
export function parcaDurum(st: State, tur: Tur, i: number, lvNo: number, rozet: Record<string, { ad: string; ok: boolean }>): PDurum {
  const x = KATALOG[tur][i];
  if (x.fiyat) return st.sahip.includes(`${tur}:${i}`) ? { acik: true } : { acik: false, fiyat: x.fiyat };
  if (x.lv) return lvNo >= x.lv ? { acik: true } : { acik: false, kosul: `Seviye ${x.lv} olunca açılır` };
  if (x.rozet) { const r = rozet[x.rozet]; return r?.ok ? { acik: true } : { acik: false, kosul: `"${r?.ad ?? x.rozet}" rozetiyle açılır` }; }
  return { acik: true };
}

const INK = '#1b1f33';
/** Dört köşeli küçük yıldız. */
const yil = (x: number, y: number, s: number) => { const k = s * 0.3; return `M${x} ${y - s}L${x + k} ${y - k}L${x + s} ${y}L${x + k} ${y + k}L${x} ${y + s}L${x - k} ${y + k}L${x - s} ${y}L${x - k} ${y - k}z`; };
const GOVDE = 'M50 22c19 0 31 13 31 33 0 20-12 32-31 32S19 75 19 55c0-20 12-33 31-33z';

/** hal: 'sevinc' kutlama yüzü, 'dusun' düşünen yüz. Verilmezse avatarın kendi yüzü çizilir. */
export type Hal = 'normal' | 'sevinc' | 'dusun';
export function Avatar({ a, size = 40, hal = 'normal' }: { a: Av; size?: number; hal?: Hal }) {
  const uid = `av${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const c = AV_RENK[a.renk % AV_RENK.length];
  const goz = hal === 'sevinc' ? 1 : a.goz, agiz = hal === 'sevinc' ? 1 : hal === 'dusun' ? 5 : a.agiz;
  const bak = hal === 'dusun' ? -2.5 : 0;
  return (
    <svg className="av" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <clipPath id={`${uid}z`}><circle cx="50" cy="50" r="50" /></clipPath>
        <clipPath id={`${uid}g`}><path d={GOVDE} /></clipPath>
        <linearGradient id={`${uid}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7cc4ff" /><stop offset="1" stopColor="#e3f4ff" /></linearGradient>
        <linearGradient id={`${uid}b`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6d4fd8" /><stop offset="0.55" stopColor="#ff6f91" /><stop offset="1" stopColor="#ffb45e" /></linearGradient>
      </defs>

      {/* zemin */}
      <g clipPath={`url(#${uid}z)`}>
        {a.zemin === 1 ? <><rect width="100" height="100" fill={`url(#${uid}s)`} /><g fill="#fff"><ellipse cx="20" cy="24" rx="12" ry="6" /><ellipse cx="29" cy="20" rx="8" ry="6" /><ellipse cx="80" cy="34" rx="11" ry="5" /></g></>
          : a.zemin === 2 ? <><rect width="100" height="100" fill={`url(#${uid}b)`} /><circle cx="78" cy="30" r="11" fill="#ffe08a" opacity="0.9" /></>
          : a.zemin === 3 ? <><rect width="100" height="100" fill="#bfe6ff" /><path d="M0 70q50-24 100 0v30H0z" fill="#58c26b" /><path d="M0 82q50-18 100 0v18H0z" fill="#3fa653" /></>
          : a.zemin === 4 ? <><rect width="100" height="100" fill="#151a3a" /><g fill="#fff"><circle cx="16" cy="22" r="1.6" /><circle cx="84" cy="18" r="1.3" /><circle cx="70" cy="8" r="1" /><circle cx="10" cy="60" r="1.2" /><circle cx="90" cy="64" r="1.5" /><circle cx="30" cy="9" r="1" /><path d={yil(86, 40, 4)} /></g><circle cx="14" cy="38" r="5.5" fill="#ffb45e" /><ellipse cx="14" cy="38" rx="9.5" ry="2.4" fill="none" stroke="#ffe08a" strokeWidth="1.3" /></>
          : <rect width="100" height="100" fill={c} opacity="0.2" />}
      </g>

      {/* gövde ve desen */}
      <path d={GOVDE} fill={c} />
      <g clipPath={`url(#${uid}g)`}>
        {a.desen === 1 && <g fill="#fff" opacity="0.28"><circle cx="29" cy="40" r="4.5" /><circle cx="70" cy="36" r="5" /><circle cx="75" cy="64" r="4" /><circle cx="27" cy="72" r="5" /><circle cx="52" cy="29" r="3" /><circle cx="62" cy="82" r="4" /></g>}
        {a.desen === 2 && <g stroke="#fff" strokeWidth="6" opacity="0.2">{[-30, -12, 6, 24, 42, 60, 78].map((x) => <line key={x} x1={x} y1="100" x2={x + 60} y2="0" />)}</g>}
        {a.desen === 3 && <g fill="#fff" opacity="0.42"><path d={yil(29, 38, 5)} /><path d={yil(72, 40, 4)} /><path d={yil(74, 70, 5)} /><path d={yil(27, 72, 4)} /><path d={yil(52, 29, 3)} /></g>}
        <ellipse cx="50" cy="70" rx="17" ry="11" fill="#fff" opacity="0.22" />
      </g>
      <circle cx="31" cy="62" r="5.5" fill="#ff7b9c" opacity="0.5" /><circle cx="69" cy="62" r="5.5" fill="#ff7b9c" opacity="0.5" />

      {/* gözler */}
      {goz === 1 ? <g fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round"><path d="M33 52q6-8 12 0" /><path d="M55 52q6-8 12 0" /></g>
        : goz === 2 ? <g><circle cx="39" cy="50" r="10" fill="#fff" /><circle cx="61" cy="50" r="10" fill="#fff" /><circle cx={41.5 + bak} cy={47.5 + bak} r="5" fill={INK} /><circle cx={63.5 + bak} cy={47.5 + bak} r="5" fill={INK} /><circle cx={43 + bak} cy={45.5 + bak} r="1.7" fill="#fff" /><circle cx={65 + bak} cy={45.5 + bak} r="1.7" fill="#fff" /></g>
        : goz === 3 ? <g><circle cx="39" cy="50" r="7.5" fill="#fff" /><circle cx="61" cy="50" r="7.5" fill="#fff" /><circle cx="39.5" cy="53" r="3.4" fill={INK} /><circle cx="61.5" cy="53" r="3.4" fill={INK} /><path d="M31.5 50a7.5 7.5 0 0 1 15 0zM53.5 50a7.5 7.5 0 0 1 15 0z" fill={c} /><path d="M31.5 50h15M53.5 50h15" stroke={INK} strokeWidth="2.4" strokeLinecap="round" /></g>
        : goz === 5 ? <g fill="#ffd43b" stroke={INK} strokeWidth="1.5" strokeLinejoin="round"><path d={yil(39, 50, 9)} /><path d={yil(61, 50, 9)} /></g>
        : <g><circle cx="39" cy="50" r="7.5" fill="#fff" /><circle cx="61" cy="50" r="7.5" fill="#fff" /><circle cx={39.5 + bak} cy={50.5 + bak} r="3.8" fill={INK} /><circle cx={61.5 + bak} cy={50.5 + bak} r="3.8" fill={INK} />{goz === 4 && <path d="M30 39l14 4M70 39l-14 4" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />}</g>}

      {/* ağız */}
      {agiz === 1 ? <g><path d="M40 63h20a10 9 0 0 1-20 0z" fill={INK} /><ellipse cx="50" cy="69.5" rx="5" ry="2.4" fill="#ff7b9c" /></g>
        : agiz === 2 ? <ellipse cx="50" cy="67.5" rx="4" ry="5" fill={INK} />
        : agiz === 5 ? <path d="M44 67q6-2 12 1" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
        : <g><path d="M42 66q8 7 16 0" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
          {agiz === 3 && <path d="M46.5 68.6h7v3.2a3.5 3.5 0 0 1-7 0z" fill="#ff7b9c" stroke={INK} strokeWidth="1.4" />}
          {agiz === 4 && <g fill="#fff" stroke={INK} strokeWidth="0.9"><rect x="46.4" y="68" width="3.4" height="4.2" rx="0.8" /><rect x="50.2" y="68" width="3.4" height="4.2" rx="0.8" /></g>}
        </g>}

      {/* boyun */}
      {a.boyun === 1 && <g><path d="M50 81l-11-6.5v13zM50 81l11-6.5v13z" fill="#e5484d" /><circle cx="50" cy="81" r="3.2" fill="#a61e24" /></g>}
      {a.boyun === 2 && <g><path d="M25 74q25 11 50 0l1.5 8q-26.5 12-53 0z" fill="#f0772b" /><path d="M61 81l9-2.5 3 14-9 2.5z" fill="#d95a12" /></g>}
      {a.boyun === 3 && <g><path d="M41 71l9 12 9-12" fill="none" stroke="#2b59e8" strokeWidth="4" strokeLinejoin="round" /><circle cx="50" cy="86" r="6.5" fill="#ffd43b" stroke="#d68a00" strokeWidth="2" /></g>}

      {/* gözlük */}
      {a.gozluk === 1 && <g fill="none" stroke={INK} strokeWidth="3"><circle cx="39" cy="50" r="11" /><circle cx="61" cy="50" r="11" /><path d="M28 49l-6-3M72 49l6-3" strokeLinecap="round" /></g>}
      {a.gozluk === 2 && <g fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round"><rect x="28" y="40.5" width="20" height="18" rx="4" /><rect x="52" y="40.5" width="20" height="18" rx="4" /><path d="M48 48h4M28 47l-6-2M72 47l6-2" strokeLinecap="round" /></g>}
      {a.gozluk === 3 && <g><path d="M27 42h21v9a9 9 0 0 1-9 9h-3a9 9 0 0 1-9-9zM52 42h21v9a9 9 0 0 1-9 9h-3a9 9 0 0 1-9-9z" fill={INK} /><path d="M48 45h4M27 45l-6-2M73 45l6-2" stroke={INK} strokeWidth="3" strokeLinecap="round" /><path d="M31 46l5 0M56 46l5 0" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" /></g>}

      {/* baş */}
      {a.bas === 1 && <g><path d="M24 38c2-22 50-22 52 0z" fill="#e5484d" /><rect x="22" y="34" width="56" height="9" rx="4.5" fill="#fff" /><circle cx="50" cy="17" r="6.5" fill="#fff" /></g>}
      {a.bas === 2 && <g><path d="M26 37c1-21 47-21 48 0z" fill="#2b59e8" /><path d="M50 37h33c1.5 5-3 7-8 7H50z" fill="#1f3fa8" /><circle cx="50" cy="21" r="2.6" fill="#1f3fa8" /></g>}
      {a.bas === 3 && <g><path d="M50 25l-15-9.5v19zM50 25l15-9.5v19z" fill="#ff5c93" /><circle cx="50" cy="25" r="4.6" fill="#d6336c" /></g>}
      {a.bas === 4 && <g><path d="M40 26l-6-14M60 26l6-14" stroke={INK} strokeWidth="3" strokeLinecap="round" /><circle cx="33.5" cy="11" r="4.6" fill="#ffd43b" /><circle cx="66.5" cy="11" r="4.6" fill="#ffd43b" /></g>}
      {a.bas === 5 && <g><path d="M21 54a29 29 0 0 1 58 0" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" /><rect x="13" y="46" width="12" height="20" rx="6" fill={INK} /><rect x="75" y="46" width="12" height="20" rx="6" fill={INK} /></g>}
      {a.bas === 6 && <g><path d="M33 25v10c8 6 26 6 34 0V25l-17 6z" fill="#2a2f4a" /><path d="M50 9l31 11.5L50 32 19 20.5z" fill={INK} /><path d="M79 21v13" stroke="#ffd43b" strokeWidth="2.4" strokeLinecap="round" /><circle cx="79" cy="36" r="3" fill="#ffd43b" /></g>}
      {a.bas === 7 && <path d="M30 32l4-18 9 10 7-14 7 14 9-10 4 18z" fill="#ffd43b" stroke="#d68a00" strokeWidth="2.4" strokeLinejoin="round" />}

      {hal === 'sevinc' && <g fill="#ffd43b"><path d={yil(88, 22, 6)} /><path d={yil(11, 30, 4.5)} /><path d={yil(92, 52, 3.5)} /></g>}
    </svg>
  );
}
