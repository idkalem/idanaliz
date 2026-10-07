// İçerik biçimi. Metinlerde küçük bir matematik yazımı kullanılır (bkz. math.tsx):
//   2^3, 2^{n+1}  üs      d_K  alt simge      √12, √(a^2·b), √[3]5  kök      {a//b}  kesir      **kalın**

/** Yanılgı: bir yanlış seçeneğin arkasındaki düşünme hatası. Öğrenci o seçeneği işaretlerse bu anlatım gösterilir. */
export interface Yanilgi { ad: string; anlat: string; ornek?: string }

/** Küçük veri tablosu: bağlam temelli sorularda ve anlatımdaki keşif tablolarında kullanılır. */
export interface Tablo { ad?: string; bas: string[]; sat: string[][] }

/** Okulun envanterindeki dört ilgi alanı: Bilim ve Teknoloji, İnsan ve Toplum, Sanat ve Tasarım, Girişimcilik ve Yönetim. */
export type Ilgi = 'bilim' | 'insan' | 'sanat' | 'girisim';

/** Kartın görseli: dokunarak denenen bir şekil ya da küçük bir etkinlik (bkz. src/gorsel). */
export type Gorsel =
  /** 2'nin kuvvetleri: her adımda ikiye katlanan, ikiye bölünen kutular */
  | { tip: 'us-katla' }
  /** tabanı aynı kuvvetleri çarpma ve bölme: çarpan kutuları */
  | { tip: 'us-birlestir' }
  /** bilimsel gösterim: virgülü kaydır, üs değişsin */
  | { tip: 'virgul'; sayilar: string[] }
  /** alanı verilen karenin kenarı */
  | { tip: 'kare'; alan: number }
  /** kök dışına çıkarma: asal çarpan çiftleri */
  | { tip: 'kok-cikar'; sayilar: number[] }
  /** karesi n eden sayıyı deneyerek bulma */
  | { tip: 'kare-ara'; n: number }
  | { tip: 'noron' } | { tip: 'aksiyon' } | { tip: 'iletim' } | { tip: 'esik' } | { tip: 'sinaps' }
  /** ışığa yönelme; deney: koleoptil deneyi (uç açık, kesik, örtülü) */
  | { tip: 'isik'; deney?: boolean }
  | { tip: 'tepe' } | { tip: 'hareket-adi' }
  /** eşleştirme: her çiftin solu ile sağı */
  | { tip: 'eslestir'; ad: string; cift: [string, string][] }
  /** iki kutuya ayırma: öge ve ait olduğu kutu (0 ya da 1) */
  | { tip: 'grupla'; ad: string; kutu: [string, string]; oge: [string, 0 | 1][] }
  /** sıraya dizme: ögeler doğru sırayla yazılır */
  | { tip: 'sirala'; ad: string; oge: string[] };

/** Anlatım kartının sonundaki "Anladın mı?" sorusu. */
export interface KSoru {
  s: string; o: string[]; d: number;
  /** yanlış seçeneklerin yanılgı kimliği (doğru seçenek ve bilinmeyenler null) */
  y?: (string | null)[];
  /** doğru cevabın kısa gerekçesi */
  neden: string;
}

export interface Kart {
  id: string; baslik: string;
  /** kartı açan gerçek yaşam durumu (ders kitabındaki "konuya başlarken" bağlamı) */
  giris?: string;
  /** aynı durumun öğrencinin ilgi alanına göre yazılmış hâli */
  ilgi?: Partial<Record<Ilgi, string>>;
  gorsel?: Gorsel;
  metin: string[];
  /** keşif tablosu: kural söylenmeden önce örüntüyü gösterir */
  tablo?: Tablo;
  kural?: string[];
  ornek?: { s: string; a: string[] };
  /** "Anlamadım" denince gösterilen, aynı fikrin başka yoldan anlatımı */
  baska: string;
  soru: KSoru;
}

/** Soru türü: işlem becerisi, bağlam temelli (gerçek yaşam durumu) ya da muhakeme (önerme, doğrulama, hata bulma). */
export type Tur = 'islem' | 'baglam' | 'muhakeme';

export interface Soru {
  id: string; s: string; o: string[]; d: number;
  y: (string | null)[];
  /** adım adım çözüm */
  c: string[];
  /** zorluk: 1 kolay, 2 orta, 3 zor */
  z: 1 | 2 | 3;
  /** sorunun dayandığı anlatım kartı */
  kart: string;
  /** içerik denetimi için: doğru olması gereken bir JavaScript ifadesi */
  h?: string;
  tur?: Tur;
  /** bağlam: soru kökünden önce okunan durum */
  b?: string[];
  /** bağlamın tablosu */
  t?: Tablo;
  /** sorunun hangi kaynaktaki hangi soru tipine göre yazıldığı */
  kay?: string;
  /** cevaplamadan önce istenirse açılan ipucu; yoksa çözümün ilk adımı gösterilir */
  ip?: string;
}

/** Açık uçlu yazılı sorusu. Kâğıtta çözülür; sonra puanlama anahtarı açılır ve öğrenci kendi çözümünü işaretler. */
export interface Acik {
  id: string; baslik: string;
  b?: string[]; t?: Tablo;
  /** istenenler: a, b, c diye sıralanır */
  alt: string[];
  /** puanlama anahtarı: her satır bir adım, p o adımın puanı */
  adim: { p: number; m: string }[];
  kay?: string;
}

/** Konunun resmî dayanağı: hangi öğrenme çıktısına ve hangi kaynaklara göre yazıldığı. */
export interface Dayanak {
  /** öğrenme çıktısının kodu; mufredat.ts içindeki satırla eşleşir */
  kod: string;
  /** öğrenme çıktısının bu derste işlenen bölümü */
  kapsam: string;
  /** öğretim programındaki süreç bileşenleri */
  surec: string[];
  /** ders kitabındaki yeri */
  kitap: string;
  /** anlatımın izlediği sıra: ders kitabındaki başlıklar */
  sira: string[];
}

export interface Konu {
  id: string; ad: string;
  /** anlatımın yaklaşık süresi, dakika */
  dk: number;
  /** kavrama testinin yaklaşık süresi, dakika */
  tdk?: number;
  giris: string;
  day?: Dayanak;
  /** resmî dayanağı işlenmemiş konunun tablodaki yeri: sınıf, ders ve içerik çerçevesi başlığı */
  yer?: { sinif: 9 | 10 | 11; ders: 'tde' | 'mat' | 'fiz' | 'kim' | 'biy'; konu: string };
  /** içeriğin nereden geldiği (resmî dayanağı işlenmemiş konularda gösterilir) */
  kaynak?: string;
  yan: Record<string, Yanilgi>;
  kartlar: Kart[];
  ozet: string[];
  sorular: Soru[];
  /** yazılı provası */
  acik?: Acik[];
}
