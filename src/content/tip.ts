// İçerik biçimi. Metinlerde küçük bir matematik yazımı kullanılır (bkz. math.tsx):
//   2^3, 2^{n+1}  üs      d_K  alt simge      √12, √(a^2·b)  kök      {a//b}  kesir      **kalın**

/** Yanılgı: bir yanlış seçeneğin arkasındaki düşünme hatası. Öğrenci o seçeneği işaretlerse bu anlatım gösterilir. */
export interface Yanilgi { ad: string; anlat: string; ornek?: string }

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
  metin: string[];
  kural?: string[];
  ornek?: { s: string; a: string[] };
  /** "Anlamadım" denince gösterilen, aynı fikrin başka yoldan anlatımı */
  baska: string;
  soru: KSoru;
}

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
}

export interface Konu {
  id: string; ad: string;
  /** anlatımın yaklaşık süresi, dakika */
  dk: number;
  giris: string;
  yan: Record<string, Yanilgi>;
  kartlar: Kart[];
  ozet: string[];
  sorular: Soru[];
}
