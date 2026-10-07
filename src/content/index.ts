// Dersler ve konular. İçeriği yazılmış konular KONULAR içinde durur; ötekiler listede "Hazırlanıyor" görünür.
// Sınıf sınıf öğrenme çıktıları ve yazılıdaki soru sayıları MEB tablolarından üretilen mufredat.ts içindedir.
import type { Konu } from './tip';
import { MUFREDAT, type MDers, type Satir } from './mufredat';
import uslu from './mat-uslu';
import koklu from './mat-koklu';
import mutlak from './mat-mutlak';
import oran from './mat-oran';
import yazim from './tr-yazim';
import ozkutle from './fiz-ozkutle';
import bitki from './biy-bitki';
import noron from './biy-noron';

export type { Konu, Kart, Soru, KSoru, Yanilgi, Tablo, Tur, Acik, Dayanak, Gorsel, Ilgi } from './tip';
export { MUFREDAT, SINAV, type MDers, type Satir, type Sinav } from './mufredat';

/** Uygulamanın adı. Tek yerden değişir. */
export const APP = 'İD Okul';

/** Ders grubu: rengi belirler (Türkçe mavi, Sosyal turuncu, Matematik mor, Fen yeşil). */
export type Grup = 'tr' | 'sos' | 'mat' | 'fen';
export interface Ders { id: string; ad: string; grup: Grup; konular: { id: string; ad: string }[] }

export const KONULAR: Record<string, Konu> = Object.fromEntries([uslu, koklu, mutlak, oran, yazim, ozkutle, bitki, noron].map((k) => [k.id, k]));

/** "Ad|kimlik" biçimindeki satırlar içeriği hazır konulardır. */
const d = (id: string, ad: string, grup: Grup, liste: string[]): Ders => ({
  id, ad, grup,
  konular: liste.map((x, i) => { const [a, kid] = x.split('|'); return { id: kid ?? `${id}-${i + 1}`, ad: a }; }),
});

export const DERSLER: Ders[] = [
  d('tr', 'Türkçe', 'tr', ['Sözcükte Anlam', 'Cümlede Anlam', 'Paragraf', 'Ses Bilgisi', 'Yazım Kuralları|tr-yazim', 'Noktalama İşaretleri', 'Sözcük Türleri', 'Cümlenin Ögeleri', 'Anlatım Bozukluğu']),
  d('mat', 'Matematik', 'mat', ['Temel Kavramlar', 'Sayı Basamakları', 'Bölme ve Bölünebilme', 'EBOB ve EKOK', 'Rasyonel Sayılar', 'Basit Eşitsizlikler', 'Mutlak Değer|mat-mutlak', 'Üslü Gösterim|mat-uslu', 'Köklü Gösterim|mat-koklu', 'Çarpanlara Ayırma', 'Oran ve Orantı|mat-oran', 'Denklem Çözme', 'Problemler', 'Kümeler', 'Fonksiyonlar', 'Olasılık']),
  d('geo', 'Geometri', 'mat', ['Doğruda ve Üçgende Açılar', 'Özel Üçgenler', 'Üçgende Alan ve Benzerlik', 'Çokgenler ve Dörtgenler', 'Çember ve Daire', 'Katı Cisimler']),
  d('fiz', 'Fizik', 'fen', ['Fizik Bilimine Giriş', 'Madde ve Özkütle|fiz-ozkutle', 'Hareket ve Kuvvet', 'Enerji', 'Isı ve Sıcaklık', 'Basınç ve Kaldırma Kuvveti', 'Elektrostatik', 'Dalgalar', 'Optik']),
  d('kim', 'Kimya', 'fen', ['Kimya Bilimi', 'Atom ve Periyodik Sistem', 'Kimyasal Türler Arası Etkileşimler', 'Maddenin Hâlleri', 'Karışımlar', 'Asitler, Bazlar ve Tuzlar']),
  d('biy', 'Biyoloji', 'fen', ['Canlıların Ortak Özellikleri', 'Hücre', 'Canlıların Sınıflandırılması', 'Hücre Bölünmeleri', 'Kalıtım', 'Ekosistem Ekolojisi', 'Bitki Hormonları ve Bitki Hareketleri|biy-bitki', 'Nöron ve Sinyal İletimi|biy-noron']),
  d('tar', 'Tarih', 'sos', ['Tarih ve Zaman', 'İlk Çağ Uygarlıkları', 'İlk Türk Devletleri', 'Osmanlı Kuruluş ve Yükselme', 'Millî Mücadele', 'Atatürk İlkeleri ve İnkılaplar']),
  d('cog', 'Coğrafya', 'sos', ['Doğa ve İnsan', 'Harita Bilgisi', 'İklim Bilgisi', 'Yer Şekilleri', 'Nüfus ve Yerleşme', 'Doğal Afetler']),
  d('fel', 'Felsefe', 'sos', ['Felsefeyi Tanıma', 'Bilgi Felsefesi', 'Varlık Felsefesi', 'Ahlak Felsefesi', 'Siyaset Felsefesi']),
  d('din', 'Din Kültürü', 'sos', ['Bilgi ve İnanç', 'İslam ve İbadet', 'Ahlak ve Değerler', 'Hz. Muhammed\'in Hayatı']),
];

/** Bir konudan önce bitirilmesi işi kolaylaştıran konular. Yol haritasında not olarak görünür; kilitlemez. */
export const ONKOSUL: Record<string, string[]> = { 'mat-koklu': ['mat-uslu'] };

export const konuBul = (id: string): Konu | undefined => KONULAR[id];
export const dersOf = (konuId: string): Ders => DERSLER.find((x) => x.konular.some((k) => k.id === konuId)) ?? DERSLER[0];
/** İçeriği hazır konular, müfredat sırasıyla. */
export const HAZIR: Konu[] = DERSLER.flatMap((x) => x.konular).filter((k) => KONULAR[k.id]).map((k) => KONULAR[k.id]);

/* ---------- Türkiye Yüzyılı Maarif Modeli: sınıf sınıf öğrenme çıktıları ---------- */
export const SINIFLAR = [9, 10, 11] as const;
export type SinifNo = (typeof SINIFLAR)[number];
/** Konu soru dağılım tablosu yayımlanan dersler. */
export const MDERSLER: { id: MDers; ad: string; grup: Grup; ikon: string }[] = [
  { id: 'tde', ad: 'Türk Dili ve Edebiyatı', grup: 'tr', ikon: 'tr' },
  { id: 'mat', ad: 'Matematik', grup: 'mat', ikon: 'mat' },
  { id: 'fiz', ad: 'Fizik', grup: 'fen', ikon: 'fiz' },
  { id: 'kim', ad: 'Kimya', grup: 'fen', ikon: 'kim' },
  { id: 'biy', ad: 'Biyoloji', grup: 'fen', ikon: 'biy' },
];
export const satirlar = (sinif: number, ders: string): Satir[] => MUFREDAT.filter((r) => r.sinif === sinif && r.ders === ders);
/** Bir öğrenme çıktısını işleyen, içeriği hazır konular. */
export const cikiKonulari = (kod: string): Konu[] => HAZIR.filter((k) => k.day?.kod === kod);
/** Resmî dayanağı işlenmemiş ama tablodaki yeri belli olan hazır konular: sınıf ve derse, istenirse içerik çerçevesi başlığına göre. */
export const yerKonulari = (sinif: number, ders: string, konu?: string): Konu[] =>
  HAZIR.filter((k) => !k.day && k.yer?.sinif === sinif && k.yer.ders === ders && (konu == null || k.yer.konu === konu));
/** Konunun dayandığı öğrenme çıktısının tablodaki satırı. */
export const dayanakSatiri = (konu: Konu): Satir | undefined => MUFREDAT.find((r) => r.kod === konu.day?.kod);
