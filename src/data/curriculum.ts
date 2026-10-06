// TYT müfredatı: testler, dersler, konular (önkoşullarıyla) ve hata türleri sözlüğü.

export type TestId = 'tr' | 'sos' | 'mat' | 'fen';
export interface Test { id: TestId; name: string; coef: number }
export interface Subject { i: number; id: string; name: string; test: TestId; n: number; branch: string; fam: string; base: number }
export interface Topic { i: number; id: string; subject: number; name: string; w: number; pre: number[] }
export interface ErrType { i: number; id: string; fam: string; name: string; hint: string }

// Katsayılar yaklaşık TYT ham puan hesabı içindir (100 + Σ net × katsayı).
export const TESTS: Test[] = [
  { id: 'tr', name: 'Türkçe', coef: 3.3 },
  { id: 'sos', name: 'Sosyal Bilimler', coef: 3.4 },
  { id: 'mat', name: 'Temel Matematik', coef: 3.3 },
  { id: 'fen', name: 'Fen Bilimleri', coef: 3.4 },
];

const S: [string, string, TestId, number, string, string, number][] = [
  ['tur', 'Türkçe', 'tr', 40, 'Türk Dili ve Edebiyatı', 'tr', -0.5],
  ['tar', 'Tarih', 'sos', 5, 'Tarih', 'sos', 0],
  ['cog', 'Coğrafya', 'sos', 5, 'Coğrafya', 'sos', -0.1],
  ['fel', 'Felsefe', 'sos', 5, 'Felsefe', 'sos', -0.2],
  ['din', 'Din Kültürü', 'sos', 5, 'Din Kültürü', 'sos', -0.7],
  ['mat', 'Matematik', 'mat', 30, 'Matematik', 'mat', 0.45],
  ['geo', 'Geometri', 'mat', 10, 'Matematik', 'mat', 0.7],
  ['fiz', 'Fizik', 'fen', 7, 'Fizik', 'fen', 0.6],
  ['kim', 'Kimya', 'fen', 7, 'Kimya', 'fen', 0.4],
  ['biy', 'Biyoloji', 'fen', 6, 'Biyoloji', 'fen', 0.1],
];
export const SUBJECTS: Subject[] = S.map(([id, name, test, n, branch, fam, base], i) => ({ i, id, name, test, n, branch, fam, base }));

// [kısa ad, görünen ad, deneme başına tipik soru sayısı, önkoşul konular]
const RAW: Record<string, [string, string, number, string?][]> = {
  tur: [
    ['sozcuk', 'Sözcükte Anlam', 4],
    ['cumle', 'Cümlede Anlam', 5, 'tur.sozcuk'],
    ['ana', 'Paragrafta Ana Düşünce', 8, 'tur.cumle'],
    ['yardimci', 'Paragrafta Yardımcı Düşünce', 7, 'tur.cumle'],
    ['yapi', 'Paragrafta Yapı', 5, 'tur.ana'],
    ['mantik', 'Sözel Mantık', 2, 'tur.yardimci'],
    ['ses', 'Ses Bilgisi', 1],
    ['yazim', 'Yazım Kuralları', 2],
    ['noktalama', 'Noktalama İşaretleri', 2],
    ['tur', 'Sözcük Türleri', 2],
    ['oge', 'Cümlenin Ögeleri', 1, 'tur.tur'],
    ['bozukluk', 'Anlatım Bozukluğu', 1, 'tur.oge'],
  ],
  tar: [
    ['bilim', 'Tarih Bilimi', 0.5],
    ['ilkcag', 'İlk Çağ Uygarlıkları', 0.5],
    ['islam', 'İslam Tarihi', 0.7],
    ['kurulus', 'Osmanlı Kuruluş ve Yükselme', 1],
    ['gerileme', 'Osmanlı Duraklama ve Gerileme', 0.8, 'tar.kurulus'],
    ['mucadele', 'Millî Mücadele', 1, 'tar.gerileme'],
    ['inkilap', 'Atatürk İlke ve İnkılapları', 0.5, 'tar.mucadele'],
  ],
  cog: [
    ['doga', 'Doğa ve İnsan', 0.5],
    ['harita', 'Harita Bilgisi', 0.8],
    ['iklim', 'İklim Bilgisi', 1, 'cog.harita'],
    ['kuvvet', 'İç ve Dış Kuvvetler', 0.8],
    ['nufus', 'Nüfus ve Yerleşme', 0.8],
    ['ekonomi', 'Ekonomik Faaliyetler', 0.6, 'cog.nufus'],
    ['bolge', 'Bölgeler ve Ülkeler', 0.5],
  ],
  fel: [
    ['konu', 'Felsefenin Konusu', 0.8],
    ['bilgi', 'Bilgi Felsefesi', 1, 'fel.konu'],
    ['varlik', 'Varlık Felsefesi', 0.8, 'fel.konu'],
    ['ahlak', 'Ahlak Felsefesi', 1, 'fel.konu'],
    ['siyaset', 'Siyaset Felsefesi', 0.7, 'fel.ahlak'],
    ['bilimf', 'Bilim Felsefesi', 0.7, 'fel.bilgi'],
  ],
  din: [
    ['inanc', 'İnanç', 1.2],
    ['ibadet', 'İbadet', 1],
    ['deger', 'Ahlak ve Değerler', 1],
    ['siyer', 'Hz. Muhammed’in Hayatı', 0.8],
    ['kuran', 'Kur’an ve Yorumu', 1],
  ],
  mat: [
    ['temel', 'Temel Kavramlar', 2],
    ['basamak', 'Sayı Basamakları', 1, 'mat.temel'],
    ['bolme', 'Bölme ve Bölünebilme', 1, 'mat.temel'],
    ['ebob', 'EBOB–EKOK', 1, 'mat.bolme'],
    ['rasyonel', 'Rasyonel Sayılar', 1, 'mat.temel'],
    ['esitsizlik', 'Basit Eşitsizlikler', 1, 'mat.rasyonel'],
    ['mutlak', 'Mutlak Değer', 1, 'mat.esitsizlik'],
    ['uslu', 'Üslü Sayılar', 1.5, 'mat.rasyonel'],
    ['koklu', 'Köklü Sayılar', 1.5, 'mat.uslu'],
    ['carpan', 'Çarpanlara Ayırma', 1, 'mat.uslu'],
    ['oran', 'Oran–Orantı', 1, 'mat.rasyonel'],
    ['denklem', 'Denklem Çözme', 1.5, 'mat.rasyonel'],
    ['sayip', 'Sayı Problemleri', 2, 'mat.denklem'],
    ['yas', 'Yaş Problemleri', 1, 'mat.sayip'],
    ['hareket', 'Hareket Problemleri', 1, 'mat.sayip mat.oran'],
    ['isci', 'İşçi Problemleri', 1, 'mat.sayip mat.oran'],
    ['yuzde', 'Yüzde, Kâr ve Zarar', 2, 'mat.oran'],
    ['karisim', 'Karışım Problemleri', 1, 'mat.yuzde'],
    ['kume', 'Kümeler', 1, 'mat.temel'],
    ['mantik', 'Mantık', 1, 'mat.kume'],
    ['fonksiyon', 'Fonksiyonlar', 2, 'mat.denklem mat.kume'],
    ['polinom', 'Polinomlar', 1, 'mat.fonksiyon mat.carpan'],
    ['permutasyon', 'Permütasyon ve Kombinasyon', 1, 'mat.kume'],
    ['olasilik', 'Olasılık', 1.5, 'mat.permutasyon'],
    ['veri', 'Veri ve İstatistik', 1, 'mat.oran'],
    ['grafik', 'Grafik Problemleri', 1, 'mat.veri mat.yuzde'],
  ],
  geo: [
    ['aci', 'Doğruda ve Üçgende Açılar', 1.5],
    ['ozel', 'Özel Üçgenler', 1.5, 'geo.aci'],
    ['alan', 'Üçgende Alan ve Benzerlik', 1.5, 'geo.ozel'],
    ['cokgen', 'Çokgenler ve Dörtgenler', 1.5, 'geo.alan'],
    ['cember', 'Çember ve Daire', 1.5, 'geo.aci'],
    ['analitik', 'Analitik Geometri', 1, 'mat.denklem'],
    ['kati', 'Katı Cisimler', 1.5, 'geo.alan geo.cember'],
  ],
  fiz: [
    ['giris', 'Fizik Bilimine Giriş', 0.5],
    ['madde', 'Madde ve Özellikleri', 0.8, 'fiz.giris'],
    ['basinc', 'Basınç ve Kaldırma Kuvveti', 0.8, 'fiz.madde'],
    ['hareket', 'Hareket ve Kuvvet', 1.4, 'fiz.giris'],
    ['enerji', 'İş, Güç ve Enerji', 1, 'fiz.hareket'],
    ['isi', 'Isı ve Sıcaklık', 0.9, 'fiz.madde'],
    ['elektrik', 'Elektrik ve Manyetizma', 1.1, 'fiz.enerji'],
    ['optik', 'Optik', 0.6],
    ['dalga', 'Dalgalar', 0.5],
  ],
  kim: [
    ['bilim', 'Kimya Bilimi', 0.5],
    ['atom', 'Atom ve Periyodik Sistem', 1.4, 'kim.bilim'],
    ['etkilesim', 'Kimyasal Türler Arası Etkileşimler', 1.1, 'kim.atom'],
    ['hal', 'Maddenin Hâlleri', 1, 'kim.etkilesim'],
    ['mol', 'Mol ve Kimyasal Hesaplamalar', 1, 'kim.atom'],
    ['karisim', 'Karışımlar', 1, 'kim.hal'],
    ['asit', 'Asitler, Bazlar ve Tuzlar', 1, 'kim.mol'],
  ],
  biy: [
    ['ortak', 'Canlıların Ortak Özellikleri', 0.6],
    ['hucre', 'Hücre', 1.4, 'biy.ortak'],
    ['siniflandirma', 'Canlıların Sınıflandırılması', 1, 'biy.ortak'],
    ['bolunme', 'Hücre Bölünmeleri', 1, 'biy.hucre'],
    ['kalitim', 'Kalıtım', 1, 'biy.bolunme'],
    ['ekosistem', 'Ekosistem Ekolojisi', 1, 'biy.siniflandirma'],
  ],
};

export const TOPICS: Topic[] = [];
{
  const idx = new Map<string, number>();
  for (const s of SUBJECTS) {
    for (const [slug, name, w, pre] of RAW[s.id]) {
      const id = `${s.id}.${slug}`;
      idx.set(id, TOPICS.length);
      TOPICS.push({ i: TOPICS.length, id, subject: s.i, name, w, pre: (pre ? pre.split(' ') : []).map((p) => idx.get(p)!) });
    }
  }
}

const E: [string, string, string, string][] = [
  ['mat', 'isaret', 'İşaret hatası', 'Eksi işareti dağıtılırken ya da terim taraf değiştirirken işaret korunmamış.'],
  ['mat', 'oncelik', 'İşlem önceliği', 'Parantez ve üs, çarpma ile bölmeden önce yapılmamış.'],
  ['mat', 'ara', 'Ara sonucu işaretleme', 'Çözümün ortasındaki değer cevap sanılmış, istenen son adım atlanmış.'],
  ['mat', 'formul', 'Formülü yanlış hatırlama', 'Kural ya da özdeşlik eksik veya ters hatırlanmış.'],
  ['mat', 'okuma', 'Soruyu eksik okuma', 'Soru kökündeki koşul (en az, en çok, farklı) gözden kaçmış.'],
  ['mat', 'oran', 'Oranı ters kurma', 'Doğru orantı yerine ters orantı (ya da tersi) kurulmuş.'],
  ['mat', 'sekil', 'Şekli yanlış yorumlama', 'Şekildeki bir uzunluk ya da açı verilmemişken varsayılmış.'],
  ['tr', 'yakin', 'Yakın anlamlı çeldirici', 'Doğruya çok benzeyen ama parçayla tam örtüşmeyen seçenek işaretlenmiş.'],
  ['tr', 'olumsuz', 'Olumsuz soru kökünü kaçırma', '“Değildir”, “çıkarılamaz” gibi olumsuz kök fark edilmemiş.'],
  ['tr', 'disari', 'Parçada olmayanı çıkarma', 'Parçada söylenmeyen, öğrencinin kendi bilgisinden gelen yargı seçilmiş.'],
  ['tr', 'anayardimci', 'Ana düşünce yerine yardımcı düşünce', 'Parçanın bütünü yerine tek bir cümlesini özetleyen seçenek seçilmiş.'],
  ['tr', 'kural', 'Kuralı karıştırma', 'Benzer iki dil bilgisi kuralı birbirinin yerine uygulanmış.'],
  ['fen', 'kavram', 'Kavram karıştırma', 'Birbirine yakın iki kavram (ısı ile sıcaklık, kütle ile ağırlık) karıştırılmış.'],
  ['fen', 'birim', 'Birim çevirme', 'Birimler çevrilmeden işleme sokulmuş.'],
  ['fen', 'grafik', 'Grafiği ters okuma', 'Eksenler ya da eğim yanlış yorumlanmış.'],
  ['fen', 'neden', 'Neden–sonuç karıştırma', 'Sonuç, nedenin yerine konmuş.'],
  ['fen', 'uygulama', 'Formülü yanlış uygulama', 'Doğru formül yanlış büyüklüklerle kullanılmış.'],
  ['sos', 'kronoloji', 'Dönem karıştırma', 'Olay ya da kavram yanlış döneme yerleştirilmiş.'],
  ['sos', 'skavram', 'Kavram karıştırma', 'Yakın iki kavram birbirinin yerine kullanılmış.'],
  ['sos', 'genelleme', 'Genelleme tuzağı', 'Tek bir örnekten genel yargıya varan seçenek işaretlenmiş.'],
  ['sos', 'oncul', 'Öncülü eksik değerlendirme', 'Öncüllerden biri atlanmış ya da fazladan sayılmış.'],
  ['sos', 'harita', 'Haritayı yanlış yorumlama', 'Harita ya da tablodaki bilgi ters okunmuş.'],
];
export const ERRS: ErrType[] = E.map(([fam, slug, name, hint], i) => ({ i, id: `${fam}.${slug}`, fam, name, hint }));

export const subjectById = (id: string) => SUBJECTS.find((s) => s.id === id)!;
export const topicById = (id: string) => TOPICS.find((t) => t.id === id)!;
export const testById = (id: string) => TESTS.find((t) => t.id === id)!;
