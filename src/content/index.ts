// Müfredat: TYT dersleri ve konuları. İçeriği yazılmış konular KONULAR içinde durur; ötekiler listede "Hazırlanıyor" görünür.
import type { Konu } from './tip';
import uslu from './mat-uslu';
import koklu from './mat-koklu';
import mutlak from './mat-mutlak';
import oran from './mat-oran';
import yazim from './tr-yazim';
import ozkutle from './fiz-ozkutle';

export type { Konu, Kart, Soru, KSoru, Yanilgi } from './tip';

/** Uygulamanın adı. Tek yerden değişir. */
export const APP = 'İD Okul';

/** Ders grubu: rengi belirler (Türkçe mavi, Sosyal turuncu, Matematik mor, Fen yeşil). */
export type Grup = 'tr' | 'sos' | 'mat' | 'fen';
export interface Ders { id: string; ad: string; grup: Grup; konular: { id: string; ad: string }[] }

export const KONULAR: Record<string, Konu> = Object.fromEntries([uslu, koklu, mutlak, oran, yazim, ozkutle].map((k) => [k.id, k]));

/** "Ad|kimlik" biçimindeki satırlar içeriği hazır konulardır. */
const d = (id: string, ad: string, grup: Grup, liste: string[]): Ders => ({
  id, ad, grup,
  konular: liste.map((x, i) => { const [a, kid] = x.split('|'); return { id: kid ?? `${id}-${i + 1}`, ad: a }; }),
});

export const DERSLER: Ders[] = [
  d('tr', 'Türkçe', 'tr', ['Sözcükte Anlam', 'Cümlede Anlam', 'Paragraf', 'Ses Bilgisi', 'Yazım Kuralları|tr-yazim', 'Noktalama İşaretleri', 'Sözcük Türleri', 'Cümlenin Ögeleri', 'Anlatım Bozukluğu']),
  d('mat', 'Matematik', 'mat', ['Temel Kavramlar', 'Sayı Basamakları', 'Bölme ve Bölünebilme', 'EBOB ve EKOK', 'Rasyonel Sayılar', 'Basit Eşitsizlikler', 'Mutlak Değer|mat-mutlak', 'Üslü Sayılar|mat-uslu', 'Köklü Sayılar|mat-koklu', 'Çarpanlara Ayırma', 'Oran ve Orantı|mat-oran', 'Denklem Çözme', 'Problemler', 'Kümeler', 'Fonksiyonlar', 'Olasılık']),
  d('geo', 'Geometri', 'mat', ['Doğruda ve Üçgende Açılar', 'Özel Üçgenler', 'Üçgende Alan ve Benzerlik', 'Çokgenler ve Dörtgenler', 'Çember ve Daire', 'Katı Cisimler']),
  d('fiz', 'Fizik', 'fen', ['Fizik Bilimine Giriş', 'Madde ve Özkütle|fiz-ozkutle', 'Hareket ve Kuvvet', 'Enerji', 'Isı ve Sıcaklık', 'Basınç ve Kaldırma Kuvveti', 'Elektrostatik', 'Dalgalar', 'Optik']),
  d('kim', 'Kimya', 'fen', ['Kimya Bilimi', 'Atom ve Periyodik Sistem', 'Kimyasal Türler Arası Etkileşimler', 'Maddenin Hâlleri', 'Karışımlar', 'Asitler, Bazlar ve Tuzlar']),
  d('biy', 'Biyoloji', 'fen', ['Canlıların Ortak Özellikleri', 'Hücre', 'Canlıların Sınıflandırılması', 'Hücre Bölünmeleri', 'Kalıtım', 'Ekosistem Ekolojisi']),
  d('tar', 'Tarih', 'sos', ['Tarih ve Zaman', 'İlk Çağ Uygarlıkları', 'İlk Türk Devletleri', 'Osmanlı Kuruluş ve Yükselme', 'Millî Mücadele', 'Atatürk İlkeleri ve İnkılaplar']),
  d('cog', 'Coğrafya', 'sos', ['Doğa ve İnsan', 'Harita Bilgisi', 'İklim Bilgisi', 'Yer Şekilleri', 'Nüfus ve Yerleşme', 'Doğal Afetler']),
  d('fel', 'Felsefe', 'sos', ['Felsefeyi Tanıma', 'Bilgi Felsefesi', 'Varlık Felsefesi', 'Ahlak Felsefesi', 'Siyaset Felsefesi']),
  d('din', 'Din Kültürü', 'sos', ['Bilgi ve İnanç', 'İslam ve İbadet', 'Ahlak ve Değerler', 'Hz. Muhammed\'in Hayatı']),
];

export const konuBul = (id: string): Konu | undefined => KONULAR[id];
export const dersOf = (konuId: string): Ders => DERSLER.find((x) => x.konular.some((k) => k.id === konuId)) ?? DERSLER[0];
/** İçeriği hazır konular, müfredat sırasıyla. */
export const HAZIR: Konu[] = DERSLER.flatMap((x) => x.konular).filter((k) => KONULAR[k.id]).map((k) => KONULAR[k.id]);
