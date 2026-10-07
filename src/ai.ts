// Yapay zekâ öğretmen: tarayıcıdan doğrudan Claude API'sine bağlanır. Arada sunucu yoktur.
// Anahtar bu cihaza bir kez girilir (Profil > Yapay zekâ) ve yalnızca api.anthropic.com adresine gönderilir.
// Öğrencinin adı ve sınıfı gönderilmez; yalnızca üzerinde çalışılan soru ve konunun metni gider.
// Kişiselleştirme açıksa öğrencinin çalışma tercihleri de eklenir (bkz. kisi.ts); envanter cevapları ve puanlar gitmez.
import { getKok, get } from './store';
import { kisiYonerge } from './kisi';
import type { Konu, Kart, Soru, Tablo } from './content';

export const MODELLER: { id: string; ad: string; ne: string }[] = [
  { id: 'claude-opus-5-5', ad: 'Opus 5.5', ne: 'En yetenekli' },
  { id: 'claude-sonnet-5-5', ad: 'Sonnet 5.5', ne: 'Dengeli' },
  { id: 'claude-haiku-4-5-20251001', ad: 'Haiku 4.5', ne: 'En hızlı, en ucuz' },
];
export interface Mesaj { rol: 'user' | 'assistant'; metin: string; resim?: { tur: string; veri: string } }
export const aiHazir = () => !!getKok().ai.anahtar.trim();

const TEMEL = `Sen İD Okul'un yapay zekâ öğretmenisin. Karşındaki bir lise öğrencisi; okul yazılılarına ve TYT'ye hazırlanıyor.
Kurallar:
- Türkçe yaz, "sen" diye seslen. Kısa yaz: çoğu yanıt 3-6 cümle.
- Cevabı hemen verme. Önce öğrencinin nerede takıldığını bulduran bir soru ya da küçük bir ipucu ver. Yine takılırsa bir sonraki adımı göster. Tam çözümü ancak üçüncü denemede ya da öğrenci açıkça "çözümü göster" derse yaz.
- Yanlışı küçümseme; hatanın hangi düşünceden geldiğini söyle.
- Matematik yazımı: üs için 2^3 ya da 2^{n+1}, kök için √12 ya da √(a^2·b), kesir için {a//b}, çarpma için ·, vurgu için **kalın**. LaTeX, tablo ve başlık (#) kullanma. Madde gerekiyorsa satır başına "- " koy.
- Emin olmadığın bilgiyi uydurma; emin değilsen söyle. Ders dışı isteklerde kibarca derse dön.`;
/** Sistem yönergesi: temel kurallar, ekrana özel ek ve üzerinde çalışılan içerik. */
export const sistem = (baglam = '', ek = '') => [TEMEL, kisiYonerge(get()), ek, baglam && `Öğrencinin şu an baktığı içerik:\n${baglam}`].filter(Boolean).join('\n\n');

const HARF = 'ABCDE';
const tabloYazi = (t: Tablo) => [t.bas.join(' | '), ...t.sat.map((r) => r.join(' | '))].join('\n');
export function soruBaglami(konu: Konu, soru: Soru, sec?: number | null): string {
  const yan = sec != null ? konu.yan[soru.y[sec] ?? ''] : undefined;
  return [
    `Konu: ${konu.ad}`, soru.b && `Sorunun bağlamı: ${soru.b.join(' ')}`, soru.t && `Bağlamdaki tablo:\n${tabloYazi(soru.t)}`,
    `Soru: ${soru.s}`, `Seçenekler: ${soru.o.map((x, i) => `${HARF[i]}) ${x}`).join('   ')}`, `Doğru cevap: ${HARF[soru.d]}`,
    sec != null && `Öğrencinin işaretlediği: ${HARF[sec]}`,
    yan && `Bu seçeneğin arkasındaki olası yanılgı: ${yan.ad}. ${yan.anlat}`,
    `Çözüm adımları: ${soru.c.join(' | ')}`,
  ].filter(Boolean).join('\n');
}
export const kartBaglami = (konu: Konu, kart: Kart) => [`Konu: ${konu.ad}`, `Anlatım kartı: ${kart.baslik}`, kart.giris, ...kart.metin, kart.tablo && `Tablo:\n${tabloYazi(kart.tablo)}`, kart.kural && `Kural: ${kart.kural.join(' ; ')}`, kart.ornek && `Örnek: ${kart.ornek.s} Çözüm: ${kart.ornek.a.join(' | ')}`].filter(Boolean).join('\n');
export const konuBaglami = (konu: Konu) => [`Konu: ${konu.ad}`, konu.giris, 'Özet:', ...konu.ozet.map((o) => `- ${o}`), 'Sık yapılan hatalar:', ...Object.values(konu.yan).map((y) => `- ${y.ad}: ${y.anlat}`)].join('\n');

function hataYazisi(durum: number, mesaj: string): string {
  if (durum === 401 || durum === 403) return 'Anahtar kabul edilmedi. Profil > Yapay zekâ bölümünden anahtarı kontrol et.';
  if (durum === 429) return 'Çok fazla istek gönderildi ya da kullanım sınırı doldu. Biraz sonra yeniden dene.';
  if (durum === 404) return 'Seçili model bu anahtarla kullanılamıyor. Profil > Yapay zekâ bölümünden başka bir model seç.';
  if (durum >= 500) return 'Yapay zekâ şu an yoğun. Birkaç saniye sonra yeniden dene.';
  return `İstek kabul edilmedi${mesaj ? `: ${mesaj}` : '.'}`;
}

/** Yanıtı parça parça getirir; `onParca` her seferinde o ana kadarki bütün metni alır. Bittiğinde tam metni döndürür. */
export async function sor(o: { sistem: string; mesajlar: Mesaj[]; onParca?: (tum: string) => void; signal?: AbortSignal; enCok?: number }): Promise<string> {
  const { anahtar, model } = getKok().ai;
  if (!anahtar.trim()) throw new Error('Yapay zekâ için bu cihaza henüz anahtar girilmedi.');
  let res: Response;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal: o.signal,
      headers: { 'content-type': 'application/json', 'x-api-key': anahtar.trim(), 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({
        model, max_tokens: o.enCok ?? 1200, system: o.sistem, stream: true,
        messages: o.mesajlar.map((m) => ({ role: m.rol, content: m.resim ? [{ type: 'image', source: { type: 'base64', media_type: m.resim.tur, data: m.resim.veri } }, { type: 'text', text: m.metin || 'Bu soruya bakar mısın?' }] : m.metin })),
      }),
    });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new Error('Bağlanılamadı. İnternet yok ya da bu ağ yapay zekâya erişimi engelliyor.');
  }
  if (!res.ok || !res.body) {
    let mesaj = '';
    try { mesaj = ((await res.json()) as { error?: { message?: string } }).error?.message ?? ''; } catch { /* gövde okunamadı */ }
    throw new Error(hataYazisi(res.status, mesaj));
  }
  const oku = res.body.getReader(), coz = new TextDecoder();
  let tampon = '', tum = '';
  for (;;) {
    const { done, value } = await oku.read();
    if (done) break;
    tampon += coz.decode(value, { stream: true });
    const satirlar = tampon.split('\n');
    tampon = satirlar.pop() ?? '';
    for (const s of satirlar) {
      if (!s.startsWith('data:')) continue;
      let olay: { type?: string; delta?: { type?: string; text?: string }; error?: { message?: string } };
      try { olay = JSON.parse(s.slice(5)); } catch { continue; }
      if (olay.type === 'content_block_delta' && olay.delta?.type === 'text_delta' && olay.delta.text) { tum += olay.delta.text; o.onParca?.(tum); }
      else if (olay.type === 'error') throw new Error(hataYazisi(529, olay.error?.message ?? ''));
    }
  }
  return tum;
}
