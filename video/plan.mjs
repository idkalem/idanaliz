// Filmde kullanılan ekranlar. Her biri uzun tek görüntü (sayfa kaydırılmadan), öğe konumlarıyla birlikte.
const nav = (t) => ({ sel: '.nav a', text: t });
const card = (t) => ({ sel: 'h2', text: t, up: '.card' });
const btn = (t) => ({ sel: 'button', text: t });
const NAV = { nYuk: nav('Yükselenler'), nKar: nav('Karşılaştır'), nInc: nav('İncele'), nSin: nav('Sınıflar'), nOgr: nav('Öğrenciler'), nKon: nav('Konular'), nBug: nav('Bugün sınav olsa') };
const tiles = { t0: { sel: '.tile', nth: 0 }, t1: { sel: '.tile', nth: 1 }, t2: { sel: '.tile', nth: 2 }, t3: { sel: '.tile', nth: 3 } };

export default [
  { id: 'home', url: '/', h: 1560, steps: [{ snap: '', grab: { ...NAV, ...tiles, dersler: card('Dersler'), siniflar: card('Sınıflar'), iyi: card('İyi giden'), dikkat: card('Dikkat isteyen'), grafik: card('Denemelere göre') } }] },
  { id: 'movers', url: '/hareketler', h: 1100, steps: [{ snap: '', grab: { ...NAV, yuk: card('En çok yükselenler'), dus: card('En çok düşenler'), ozet: { text: 'En çok yükselen: 12-C' } } }] },
  { id: 'incele', url: '/incele?kim=c:1&n=s:5&b=konu&m=y', h: 1400, steps: [{ snap: '', grab: { ...NAV, ...tiles, fonk: { text: 'Fonksiyonlar', within: card('Konular: en çok yanlış üstte') }, konular: card('Konular: en çok yanlış üstte'), zaman: card('Denemeden denemeye'), h1: 'h1' } }] },
  { id: 'cmp2', url: '/karsilastir?k=c:0,c:1&g=karsi', h: 1260, steps: [{ snap: '', grab: { ...NAV, ...tiles, kart: card('Hangi derste kim önde?'), skor: { text: 'Önde olduğu ders sayısı' }, skorKutu: { text: 'Önde olduğu ders sayısı', up: 'div' }, sutun: btn('Sütun'), ekle: btn('Ekle'), cA: { text: '11-A', nth: 0 }, cB: { text: '11-B', nth: 0 } } }] },
  { id: 'cmp2s', url: '/karsilastir?k=c:0,c:1&g=sutun', h: 1260, steps: [{ snap: '', grab: { kart: card('Hangi derste kim önde?'), sutun: btn('Sütun'), ekle: btn('Ekle') } }] },
  { id: 'cmp3', url: '/karsilastir?k=c:0,c:1,c:2&g=sutun', h: 1330, steps: [{ snap: '', grab: { ...tiles, kart: card('Hangi derste kim önde?'), ekle: btn('Ekle'), cC: { text: '11-C', nth: 0 }, fizik: { text: 'Fizik', within: card('Hangi derste kim önde?') }, onde: { text: '5 derste önde' } } }] },
  { id: 'cmp3f', url: '/karsilastir?k=c:0,c:1,c:2&n=s:7&b=konu&m=pct&g=sutun', h: 1330, steps: [{ snap: '', grab: { kart: card('Hangi konuda kim önde?'), elek: { text: 'Elektrik', within: card('Hangi konuda kim önde?') } } }] },
  { id: 'cmp3k', url: '/karsilastir?k=c:0,c:1,c:2&n=k:76&m=pct&z=cizgi', h: 1300, steps: [{ snap: '', grab: { ...tiles, kart: card('Denemeden denemeye'), pts: { sel: 'circle', within: card('Denemeden denemeye'), all: true } } }] },
  { id: 'classes', url: '/siniflar', h: 840, steps: [
    { snap: '0', grab: { ...NAV, th: { sel: 'th', text: 'Değişim' }, tablo: '.card' } },
    { click: { sel: 'th', text: 'Değişim' } },
    { snap: '1', grab: { th: { sel: 'th', text: 'Değişim' }, satir: { sel: 'tr', text: '12-C' }, degisim: { text: '7,8' }, tablo: '.card' } },
  ] },
  { id: 'c12', url: '/sinif/12-C', h: 2500, steps: [{ snap: '', grab: { ...tiles, h1: 'h1', tabTekrar: btn('Üst üste yanlışlar'), grafik: card('Denemelere göre'), mini: card('En çok öğrencinin üst üste'), one: card('Bu sınıfta öne çıkanlar') } }] },
  { id: 'c12t', url: '/sinif/12-C?sekme=tekrar', h: 1900, steps: [{ snap: '', grab: { ...NAV, ...tiles, tabTekrar: btn('Üst üste yanlışlar'), liste: card('En çok öğrencinin üst üste'), ozel: { text: 'Özel Üçgenler', within: card('En çok öğrencinin üst üste'), up: '.rp-g' }, oz: { sel: '.tile', text: 'Özel Üçgenler' }, selim: { text: 'Selim Koç', within: card('En çok öğrencinin üst üste') } } }] },
  { id: 'topics', url: '/konular', h: 1000, steps: [{ snap: '', grab: { ...NAV, ...tiles, zayif: card('En zayıf konular'), iyi: card('En iyi konular'), olasilik: { text: 'Olasılık', within: card('En zayıf konular') }, tabAg: btn('Konu bağlantıları') } }] },
  { id: 'topicsag', url: '/konular?gorunum=ag', h: 1000, steps: [{ snap: '', grab: { ...NAV, kart: card('Konu bağlantıları'), tabNe: btn('Ne yapmalı'), ol: { text: 'Olasılık', within: card('Konu bağlantıları') }, perm: { text: 'Permütasyon', within: card('Konu bağlantıları') } } }] },
  { id: 'neyap', url: '/konular?gorunum=oncelik', h: 1000, steps: [{ snap: '', grab: { ...NAV, tabNe: btn('Ne yapmalı'), ozet: { text: 'Önce ilk beş konuya' }, tablo: { sel: 'table' }, r1: { sel: 'tbody tr', nth: 0 }, r2: { sel: 'tbody tr', nth: 1 }, r3: { sel: 'tbody tr', nth: 2 }, r5: { sel: 'tbody tr', nth: 4 }, g1: { sel: 'tbody tr .tag.good', nth: 0 }, hG: { sel: 'th', text: 'Kazanılabilecek net' }, hOnce: { sel: 'th', text: 'Önce bunu çalış' } } }] },
  { id: 'students', url: '/ogrenciler', h: 900, steps: [
    { snap: '0', grab: { ...NAV, th: { sel: 'th', text: 'Değişim' } } },
    { click: { sel: 'th', text: 'Değişim' } }, { click: { sel: 'th', text: 'Değişim' } },
    { snap: '1', grab: { th: { sel: 'th', text: 'Değişim' }, satir: { sel: 'tr', text: 'Esra Bulut' }, degisim: { text: '24,0' } } },
  ] },
  { id: 'esra', url: '/ogrenciler', h: 1500, steps: [
    { click: { sel: 'th', text: 'Değişim' } }, { click: { sel: 'th', text: 'Değişim' } }, { click: { sel: 'tr', text: 'Esra Bulut' }, wait: 900 },
    { snap: '', grab: { ...NAV, ...tiles, h1: 'h1', grafik: card('Denemelere göre'), pts: { sel: 'circle', within: card('Denemelere göre'), all: true } } },
  ] },
  { id: 'tahmin', url: '/tahmin', h: 1500, steps: [{ snap: '', grab: { ...tiles, hist: card('Kaç öğrenci hangi puanda'), sinir: card('Sınırdakiler'), tablo: { sel: 'th', text: 'Tahmini puan', up: '.card' } } }] },
];
