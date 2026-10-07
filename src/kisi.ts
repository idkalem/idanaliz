// Kişiselleştirme: okulun "Öğrenci Akademik Gelişim Profili Envanteri" sonucundan anlatımın nasıl düzenleneceğini çıkarır.
// Envanter sistemin dışında uygulanır; buraya yalnızca 40 sorunun cevabı gelir (Q1–Q40, A–E). Sorular burada yeniden sorulmaz.
// Okulun kuralları burada da geçerlidir: öğrenciye tip etiketi yapıştırılmaz, tercih seçenekleri sıralanmaz, ham puan gösterilmez,
// öğrenciler karşılaştırılmaz. Profil değişmez bir özellik değil; denenip güncellenen bir çalışma varsayımıdır.
import type { Ilgi } from './content';
import type { State } from './store';

export const BOS_PROFIL = '-'.repeat(40);
/** n. sorunun cevabı (1'den başlar): 'A'…'E'; cevap yoksa boş. */
export const harf = (q: string | undefined, n: number): string => { const c = (q ?? '')[n - 1] ?? ''; return 'ABCDE'.includes(c) && c ? c : ''; };
export const harfYaz = (q: string | undefined, n: number, c: string): string => { const a = [...(q ?? BOS_PROFIL).padEnd(40, '-')]; a[n - 1] = c; return a.join(''); };
/** Yapıştırılan cevap dizisini okur: "ACDB…" ya da "1-A 2-C …". 40 cevap çıkmazsa null. */
export function profilOku(metin: string): string | null {
  const h = metin.toUpperCase().replace(/Q?\d+\s*[-:.)=]?\s*/g, '').replace(/[^A-E]/g, '');
  return h.length === 40 ? h : null;
}

/* ---------- 1. katman: sekiz akademik davranış boyutu (Q1–Q24) ---------- */
export const BOYUTLAR: { ad: string; yap?: string }[] = [
  { ad: 'Analitik düşünme ve hata analizi' },
  { ad: 'Araştırma ve kanıt kullanımı' },
  { ad: 'Öğrenme stratejisi ve üstbiliş', yap: 'Her kartın sonunda konuyu kendi cümlenle yazarsın.' },
  { ad: 'Öz düzenleme ve çalışma yönetimi', yap: 'Anlatım ikişer kartlık küçük hedeflere bölünür.' },
  { ad: 'Akademik dayanıklılık ve geri bildirim kullanımı', yap: 'Yanlış cevap bir eksik gibi değil, nerede takıldığını gösteren bir bilgi olarak sunulur.' },
  { ad: 'Yaratıcı düşünme ve alternatif üretme' },
  { ad: 'Sosyal öğrenme ve iletişim' },
  { ad: 'Sorumluluk ve akademik özerklik' },
];
/** Boyutun ortalaması (1–5). Üç maddesinden biri eksikse null. i. boyutun maddeleri: Q(i+1), Q(i+9), Q(i+17). */
export function boyut(q: string | undefined, i: number): number | null {
  const v = [1, 9, 17].map((n) => 'ABCDE'.indexOf(harf(q, n + i)) + 1);
  return v.every((x) => x > 0) ? (v[0] + v[1] + v[2]) / 3 : null;
}
/** Raporlama aralığı: 0 en sınırlı, 4 en belirgin. Norm değildir; yalnızca nitel açıklamayı seçer. */
export const aralik = (x: number) => (x >= 4.2 ? 4 : x >= 3.4 ? 3 : x >= 2.6 ? 2 : x >= 1.8 ? 1 : 0);
export const ARALIK_AD = [
  'Rehber öğretmeninle birlikte bakmanız yararlı olabilir',
  'Daha sınırlı kullandığın, desteklenmesi yararlı olabilecek bir davranış',
  'Duruma göre değişen, gelişmekte olan bir davranış',
  'Sık kullandığın bir davranış',
  'Belirgin biçimde kullandığın bir davranış',
];
export const boyutlarVar = (q: string | undefined) => BOYUTLAR.every((_, i) => boyut(q, i) != null);
/** Öncelikli gelişim alanları: desteklenmesi yararlı olabilecek boyutlar, en çok üç tane. */
export function oncelikli(q: string | undefined): number[] {
  return BOYUTLAR.map((_, i) => ({ i, x: boyut(q, i) })).filter((b) => b.x != null && b.x < 2.6).sort((a, b) => a.x! - b.x!).slice(0, 3).map((b) => b.i);
}

/* ---------- 2. katman: doğal tercihler (puanlanmaz, sıralanmaz). Uygulama üçünü kullanır. ---------- */
export interface Secenek { h: string; ad: string; kisa: string; ne: string }
export const TERCIH: Record<25 | 30 | 32, { soru: string; sec: Secenek[] }> = {
  25: {
    soru: 'Yeni bir konuya nasıl girmek istersin?',
    sec: [
      { h: 'A', ad: 'Araştırarak', kisa: 'Önce kendin bul', ne: 'Önce şekil ve tablo gelir. Kuralı kendin bulmaya çalışırsın, sonra açarsın.' },
      { h: 'B', ad: 'Rehberlik alarak', kisa: 'Adım adım', ne: 'Önce açıklama ve kural gelir. Örnek, adımları birer birer açarak çözülür.' },
      { h: 'C', ad: 'Konuşarak, tartışarak', kisa: 'Kendi cümlenle', ne: 'Her kartın sonunda konuyu kendi cümlenle yazarsın; istersen yapay zekâ öğretmene anlatırsın.' },
      { h: 'D', ad: 'Örnek ve uygulama üzerinden', kisa: 'Önce örnek', ne: 'Kart çözümlü örnekle açılır. Uzun açıklama, isteyince açılır.' },
    ],
  },
  30: {
    soru: 'Dikkatin dağılınca seni ne toparlar?',
    sec: [
      { h: 'A', ad: 'Ortamı düzenlemek', kisa: 'Önce hazırlık', ne: 'Anlatım başlamadan kısa bir hazırlık listesi çıkar.' },
      { h: 'B', ad: 'Kısa bir mola', kisa: 'Ortada mola', ne: 'Anlatımın ortasında kısa bir mola önerilir.' },
      { h: 'C', ad: 'Yöntemi değiştirmek', kisa: 'Yanılınca başka yol', ne: 'Karttaki soruda yanılınca konu kendiliğinden başka bir yoldan anlatılır.' },
      { h: 'D', ad: 'Küçük hedefler koymak', kisa: 'Küçük hedefler', ne: 'Anlatım ikişer kartlık küçük hedeflere bölünür.' },
    ],
  },
  32: {
    soru: 'Bir bilgiyi senin için anlamlı kılan ne?',
    sec: [
      { h: 'A', ad: 'Gerçek yaşamla bağlantısı', kisa: 'Gerçek yaşam', ne: 'Kartlar zaten gerçek bir durumla açılır; yazılmışsa ilgi alanından bir örnek de eklenir. Başka bir şey değişmez.' },
      { h: 'B', ad: 'Nedenini ve nasılını anlamak', kisa: 'İkinci bir yol', ne: '"Bir de şöyle düşün" kutusu her kartta açık gelir: aynı fikir ikinci bir yoldan anlatılır.' },
      { h: 'C', ad: 'Bir şey üretmek', kisa: 'Sen üret', ne: 'Her kartta kendi örneğini yazacağın bir "Sen üret" kutusu çıkar.' },
      { h: 'D', ad: 'Problem çözmek, zorlanmak', kisa: 'Önce dene', ne: 'Kartın sorusu en başta gelir: önce denersin, sonra okursun.' },
    ],
  },
};

/* ---------- 3. katman: ilgi haritası (Q33–Q36). İlgi, yetenek demek değildir. ---------- */
export const ILGILER: { id: Ilgi; ad: string }[] = [
  { id: 'bilim', ad: 'Bilim ve teknoloji' }, { id: 'insan', ad: 'İnsan ve toplum' }, { id: 'sanat', ad: 'Sanat ve tasarım' }, { id: 'girisim', ad: 'Girişimcilik ve yönetim' },
];
export const ILGI_AD = Object.fromEntries(ILGILER.map((x) => [x.id, x.ad])) as Record<Ilgi, string>;
/** Öne çıkan ilgi alanı: D ya da E işaretlenenlerin en yükseği. Yoksa null. */
export function oneCikanIlgi(q: string | undefined): Ilgi | null {
  const v = ILGILER.map((x, i) => ({ id: x.id, x: 'ABCDE'.indexOf(harf(q, 33 + i)) + 1 })).filter((a) => a.x >= 4);
  return v.length ? v.reduce((a, b) => (b.x > a.x ? b : a)).id : null;
}

/* ---------- 4. katman: destek öncelikleri (Q37–Q40). Destek isteği, beceri eksiği demek değildir. ---------- */
export const DESTEK: { ad: string; ne: string; to?: string; git?: string }[] = [
  { ad: 'Ders çalışma, odaklanma ve zaman yönetimi', ne: 'Program sayfası haftanı günlere böler; her gün ne çalışacağın hazır gelir.', to: '/program', git: 'Programı aç' },
  { ad: 'Güçlü ve gelişime açık yönlerini tanıma', ne: 'Rapor sayfası hangi konuda nerede olduğunu ve en sık düştüğün hatayı gösterir.', to: '/rapor', git: 'Raporu aç' },
  { ad: 'Eğitim alanı ve kariyer keşfi', ne: 'Bu uygulamada bununla ilgili bir bölüm yok. Rehber öğretmeninle konuşabilirsin.' },
  { ad: 'Sınav performansı ve hata azaltma', ne: 'Yanlışların defterde toplanır ve aralıklarla yeniden sorulur; konu sayfasında yazılı provası vardır.', to: '/tekrar', git: 'Yanlışlarımı aç' },
];
export const destekler = (q: string | undefined) => DESTEK.filter((_, i) => 'DE'.includes(harf(q, 37 + i) || '-'));

/* ---------- Anlatımın planı ---------- */
export interface Uyarlama {
  /** kişiselleştirme uygulanıyor mu */
  acik: boolean;
  /** Q25, Q30, Q32 cevapları; yoksa boş */
  giris: string; dikkat: string; anlam: string;
  ilgi: Ilgi | null;
  /** ikişer kartlık küçük hedefler */
  kucukAdim: boolean;
  /** yanlış cevap bilgi olarak çerçevelenir */
  hataVeri: boolean;
  /** kartın sonunda "kendi cümlenle anlat" kutusu */
  anlat: boolean;
  /** uygulanan her değişiklik: kısa adı, ne olduğu ve neden uygulandığı */
  neden: { kisa: string; ne: string; neden: string }[];
}
/** Herkesin gördüğü anlatım. */
export const DUZ: Uyarlama = { acik: false, giris: '', dikkat: '', anlam: '', ilgi: null, kucukAdim: false, hataVeri: false, anlat: false, neden: [] };

const sec = (no: 25 | 30 | 32, h: string) => TERCIH[no].sec.find((s) => s.h === h);
export function uyarla(st: Pick<State, 'kisisel' | 'profil'>): Uyarlama {
  const q = st.profil;
  if (!st.kisisel.acik || !q) return DUZ;
  const giris = harf(q, 25), dikkat = harf(q, 30), anlam = harf(q, 32), ilgi = oneCikanIlgi(q), onc = oncelikli(q);
  const neden: Uyarlama['neden'] = [];
  const g = sec(25, giris), d = sec(30, dikkat), a = sec(32, anlam);
  if (g) neden.push({ kisa: g.kisa, ne: g.ne, neden: `Yeni konuya girerken "${g.ad.toLocaleLowerCase('tr')}" yolunu seçtin.` });
  if (a && anlam !== 'A') neden.push({ kisa: a.kisa, ne: a.ne, neden: `Bilgiyi anlamlı kılan şey için "${a.ad.toLocaleLowerCase('tr')}" dedin.` });
  if (ilgi) neden.push({ kisa: `${ILGI_AD[ilgi]} örnekleri`, ne: 'Kartı açan durumun yanına, yazılmışsa bu alandan bir örnek eklenir.', neden: 'İlgi haritanda bu alan öne çıkıyor.' });
  if (d) neden.push({ kisa: d.kisa, ne: d.ne, neden: `Dikkatini toplamak için "${d.ad.toLocaleLowerCase('tr')}" yolunu seçtin.` });
  const kucukAdim = dikkat === 'D' || onc.includes(3), hataVeri = onc.includes(4), anlat = giris === 'C' || onc.includes(2);
  for (const i of onc) {
    const b = BOYUTLAR[i];
    const zatenVar = (i === 3 && dikkat === 'D') || (i === 2 && giris === 'C');
    if (b.yap && !zatenVar) neden.push({ kisa: i === 3 ? 'Küçük hedefler' : i === 4 ? 'Yanlış bir bilgidir' : 'Kendi cümlenle', ne: b.yap, neden: `Envanterde "${b.ad.toLocaleLowerCase('tr')}" desteklenmesi yararlı olabilecek bir alan olarak çıktı.` });
  }
  return { acik: neden.length > 0, giris, dikkat, anlam, ilgi, kucukAdim, hataVeri, anlat, neden };
}

/** Yapay zekâ öğretmene giden çalışma tercihleri. Ad, sınıf ve puan gitmez. */
export function kisiYonerge(st: Pick<State, 'kisisel' | 'profil'>): string {
  const p = uyarla(st);
  if (!p.acik) return '';
  const g = sec(25, p.giris), a = sec(32, p.anlam);
  return [
    'Öğrencinin kendi belirttiği çalışma tercihleri (değişmez özellik değildir; öğrenciyi bir tipe sokma, "görsel öğrenci" gibi etiketler kullanma, bu tercihleri ona tekrar sorma):',
    g && `- Yeni konuya girerken: ${g.ad.toLocaleLowerCase('tr')}.`,
    a && `- Bilgiyi anlamlı kılan: ${a.ad.toLocaleLowerCase('tr')}.`,
    p.ilgi && `- Örnek verirken mümkünse şu alandan seç: ${ILGI_AD[p.ilgi].toLocaleLowerCase('tr')}.`,
    p.kucukAdim && '- Görevi küçük adımlara böl; her adımda tek bir şey iste.',
    p.hataVeri && '- Yanlışı bir eksik gibi değil, nerede takıldığını gösteren bir bilgi olarak ele al.',
  ].filter(Boolean).join('\n');
}

/** Tanıtım hesapları için envanter cevabı kurar. boyut: sekiz boyutun üçer cevabı; tercih: Q25–Q32; ilgi: Q33–Q36; destek: Q37–Q40. */
export function profilKur(boyutlar: string[], tercih: string, ilgi: string, destek: string): string {
  const q = [...BOS_PROFIL];
  boyutlar.forEach((b, i) => [0, 8, 16].forEach((n, j) => { q[i + n] = b[j]; }));
  [...tercih].forEach((c, i) => { q[24 + i] = c; });
  [...ilgi].forEach((c, i) => { q[32 + i] = c; });
  [...destek].forEach((c, i) => { q[36 + i] = c; });
  return q.join('');
}
