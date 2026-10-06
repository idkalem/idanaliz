import type { Konu } from './tip';

const k: Konu = {
  id: 'fiz-ozkutle', ad: 'Madde ve Özkütle', dk: 20,
  giris: 'Aynı hacimde ne kadar madde var? Özkütle tanımı, kütle–hacim grafiği, karışımlar ve hacim ölçme.',
  yan: {
    miktar: {
      ad: 'Özkütleyi madde miktarına bağlamak',
      anlat: 'Özkütle maddenin kendisine ait, ayırt edici bir özelliktir. Aynı sıcaklık ve basınçta, maddenin ne kadar olduğuna bağlı değildir: kütle iki katına çıkarsa hacim de iki katına çıkar, oran değişmez.',
      ornek: 'Bir demir çubuk ikiye bölünürse her parçanın özkütlesi çubuğunkiyle aynıdır.',
    },
    tersoran: {
      ad: 'Kütle ile hacmin yerini karıştırmak',
      anlat: 'Özkütle, kütlenin hacme bölümüdür. Birime bakmak yeterli: g/cm³, "gram bölü santimetreküp" demektir.',
      ornek: '240 g ve 80 cm³ için d = {240//80} = 3 g/cm³ olur; {80//240} değil.',
    },
    birim: {
      ad: 'Birim çevirmede yanılmak',
      anlat: '1 g/cm³, 1000 kg/m³ eder. g/cm³ cinsinden değer kg/m³\'e çevrilirken 1000 ile çarpılır.',
      ornek: 'Suyun özkütlesi 1 g/cm³ = 1000 kg/m³.',
    },
    eksen: {
      ad: 'Grafikte eksenleri karıştırmak',
      anlat: 'Kütle düşey, hacim yatay eksendeyse doğrunun eğimi özkütleyi verir: dik olan daha yoğundur. Eksenler yer değiştirirse durum tersine döner. Önce eksenleri oku.',
      ornek: 'Aynı hacme karşılık kütlesi büyük olan maddenin özkütlesi büyüktür.',
    },
    ortalama: {
      ad: 'Eşit hacim ile eşit kütleyi karıştırmak',
      anlat: 'Özkütlelerin ortalaması yalnızca eşit hacimli karışımda geçerlidir. Eşit kütleli ya da farklı miktarlı karışımda toplam kütle toplam hacme bölünür.',
      ornek: '1 ve 3 g/cm³ için eşit hacimde 2 g/cm³, eşit kütlede 1,5 g/cm³ bulunur.',
    },
    topla: {
      ad: 'Karışımda özkütleleri toplamak',
      anlat: 'Karışımın özkütlesi, karışan maddelerin özkütleleri arasında bir değerdir; ikisinden de büyük olamaz.',
      ornek: '2 ve 4 g/cm³ özkütleli sıvıların karışımı 2 ile 4 arasında çıkar; 6 olamaz.',
    },
    seviye: {
      ad: 'Su seviyesini cismin hacmi sanmak',
      anlat: 'Batan cismin hacmi, su seviyesindeki yükselme kadardır: son seviyeden ilk seviye çıkarılır.',
      ornek: 'Su 40 cm³ çizgisinden 70 cm³ çizgisine çıktıysa cismin hacmi 30 cm³\'tür.',
    },
    kutle: {
      ad: 'Taşan sıvıyı cismin kütlesine bağlamak',
      anlat: 'Tamamen batan bir cisim, kütlesi ne olursa olsun kendi hacmi kadar sıvının yerini değiştirir.',
      ornek: 'Aynı hacimli demir ve alüminyum bilyeler aynı miktarda su taşırır.',
    },
  },
  kartlar: [
    {
      id: 'tanim', baslik: 'Özkütle nedir?',
      metin: [
        'Özkütle, bir maddenin birim hacminin kütlesidir. Kütle hacme bölünerek bulunur; birimi g/cm³ ya da kg/m³\'tür.',
        'Saf maddeler için ayırt edici bir özelliktir: aynı sıcaklık ve basınçta, maddenin miktarı ne olursa olsun değişmez.',
      ],
      kural: ['d = {m//V}', '1 g/cm³ = 1000 kg/m³'],
      ornek: { s: 'Kütlesi 200 g, hacmi 80 cm³ olan bir cismin özkütlesi kaç g/cm³\'tür?', a: ['d = {m//V} = {200//80}', 'Sonuç: 2,5 g/cm³', 'kg/m³ cinsinden: 2,5·1000 = 2500 kg/m³'] },
      baska: 'Aynı boyda iki kutu düşün: biri pamukla, biri demirle dolu. Hacimleri eşit ama demir dolu olan çok daha ağır; çünkü demirin özkütlesi büyük. Özkütle, maddenin ne kadar sıkı paketlendiğini söyler.',
      soru: { s: 'Bir demir çubuk ikiye bölünürse parçaların özkütlesi nasıl olur?', o: ['Yarıya iner', 'Değişmez', 'İki katına çıkar'], d: 1, y: ['miktar', null, 'miktar'], neden: 'Kütle de hacim de yarıya iner; oranları aynı kalır.' },
    },
    {
      id: 'grafik', baslik: 'Kütle–hacim grafiği',
      metin: [
        'Sabit sıcaklıkta bir maddenin kütlesi hacmiyle doğru orantılıdır. Kütle–hacim grafiği orijinden geçen bir doğrudur.',
        'Kütle düşey, hacim yatay eksendeyse doğrunun eğimi özkütledir: doğru ne kadar dikse madde o kadar yoğundur.',
      ],
      kural: ['eğim = {m//V} = d   (kütle düşey eksendeyken)'],
      ornek: { s: 'Grafikte K için 20 cm³\'e 60 g, L için 30 cm³\'e 30 g karşılık geliyor. d_K / d_L kaçtır?', a: ['d_K = {60//20} = 3 g/cm³', 'd_L = {30//30} = 1 g/cm³', 'd_K / d_L = 3'] },
      baska: 'Grafikte aynı hacme, yani aynı düşey çizgiye bak. O hacimde hangisinin kütlesi fazlaysa o daha yoğundur. Eğim hesabına girmeden karşılaştırma yapmanın en hızlı yolu budur.',
      soru: { s: 'Kütle düşey, hacim yatay eksendeyken daha dik olan doğrunun özkütlesi nasıldır?', o: ['Daha büyüktür', 'Daha küçüktür', 'Eşittir'], d: 0, y: [null, 'eksen', null], neden: 'Eğim {m//V} olduğundan dik doğru büyük özkütle demektir.' },
    },
    {
      id: 'karisim', baslik: 'Karışımların özkütlesi',
      metin: [
        'Karışımın özkütlesi, toplam kütlenin toplam hacme bölümüdür. Sonuç her zaman karışan maddelerin özkütleleri arasında kalır.',
        'Eşit hacimde karıştırılırsa özkütlelerin ortalaması alınır. Eşit kütlede karıştırılırsa sonuç ortalamadan küçük çıkar, çünkü özkütlesi küçük olan daha çok yer kaplar.',
      ],
      kural: ['d_{karışım} = {m_1 + m_2//V_1 + V_2}', 'Eşit hacim: {d_1 + d_2//2}', 'Eşit kütle: {2·d_1·d_2//d_1 + d_2}'],
      ornek: { s: 'Özkütleleri 2 ve 6 g/cm³ olan iki sıvı eşit kütlede karıştırılırsa karışımın özkütlesi kaç olur?', a: ['Her birinden 6 g alalım', 'Hacimler: {6//2} = 3 cm³ ve {6//6} = 1 cm³', 'Toplam kütle 12 g, toplam hacim 4 cm³', 'd = {12//4} = 3 g/cm³'] },
      baska: 'Formül ezberlemek zorunda değilsin; kendine kolay sayılar seç. Eşit hacim deniyorsa her birinden 1 cm³ al, eşit kütle deniyorsa ikisinin de bölünebildiği bir kütle al. Sonra toplam kütleyi toplam hacme böl.',
      soru: { s: 'Özkütleleri 1 ve 3 g/cm³ olan iki sıvı eşit hacimde karıştırılırsa karışımın özkütlesi kaç g/cm³ olur?', o: ['1,5', '2', '4'], d: 1, y: ['ortalama', null, 'topla'], neden: 'Eşit hacimde ortalama alınır: {1 + 3//2} = 2.' },
    },
    {
      id: 'hacim', baslik: 'Hacim ölçme ve taşan sıvı',
      metin: [
        'Düzgün olmayan bir katının hacmi sıvı yardımıyla ölçülür. Sıvıya tamamen batan cisim, kendi hacmi kadar sıvının yerini değiştirir.',
        'Dereceli silindirde sıvı seviyesi cismin hacmi kadar yükselir. Ağzına kadar dolu bir kaptan ise cismin hacmi kadar sıvı taşar.',
      ],
      kural: ['V_{cisim} = V_{son} − V_{ilk}'],
      ornek: { s: '50 cm³ su bulunan dereceli silindire 120 g\'lık bir taş bırakılınca seviye 80 cm³ oluyor. Taşın özkütlesi kaçtır?', a: ['Taşın hacmi: 80 − 50 = 30 cm³', 'd = {120//30}', 'Sonuç: 4 g/cm³'] },
      baska: 'Küvete girdiğinde su yükselir. Yükselen su miktarı, vücudunun suya giren kısmının hacmidir; kilon bunu değiştirmez. Taş için de aynısı geçerli: su ne kadar yükseldiyse taşın hacmi o kadardır.',
      soru: { s: 'Suya tamamen batan iki bilyeden hacmi büyük olan için hangisi doğrudur?', o: ['Daha çok su taşırır', 'Daha az su taşırır', 'Yalnızca kütlesi büyükse çok taşırır'], d: 0, y: [null, null, 'kutle'], neden: 'Taşan su cismin hacmi kadardır; kütleye bağlı değildir.' },
    },
  ],
  ozet: [
    'd = {m//V}. Birimler: g/cm³ ve kg/m³. 1 g/cm³ = 1000 kg/m³.',
    'Özkütle ayırt edici özelliktir; madde miktarına bağlı değildir.',
    'Kütle–hacim grafiğinde (kütle düşeyde) eğim özkütledir.',
    'Karışım: toplam kütle bölü toplam hacim. Sonuç iki özkütlenin arasındadır.',
    'Eşit hacimde ortalama alınır; eşit kütlede sonuç ortalamadan küçüktür.',
    'Batan cismin hacmi, sıvı seviyesindeki yükselme kadardır.',
  ],
  sorular: [
    {
      id: 's1', z: 1, kart: 'tanim', s: 'Kütlesi 240 g, hacmi 80 cm³ olan bir cismin özkütlesi kaç g/cm³\'tür?',
      o: ['{1//3}', '2', '3', '4', '160'], d: 2, y: ['tersoran', null, null, null, null],
      c: ['d = {m//V}', 'd = {240//80}', 'Sonuç: 3 g/cm³'], h: '240 / 80 === 3',
    },
    {
      id: 's2', z: 1, kart: 'tanim', s: 'Özkütlesi 2,5 g/cm³ olan bir maddenin özkütlesi kaç kg/m³\'tür?',
      o: ['0,0025', '2,5', '25', '250', '2500'], d: 4, y: ['birim', 'birim', 'birim', 'birim', null],
      c: ['1 g/cm³ = 1000 kg/m³', '2,5·1000 = 2500', 'Sonuç: 2500 kg/m³'], h: '2.5 * 1000 === 2500',
    },
    {
      id: 's3', z: 1, kart: 'tanim', s: 'Aynı maddeden yapılmış, aynı sıcaklıktaki X ve Y cisimlerinden X\'in kütlesi Y\'ninkinin 3 katıdır. X\'in özkütlesinin Y\'nin özkütlesine oranı kaçtır?',
      o: ['{1//3}', '1', '3', '6', '9'], d: 1, y: ['miktar', null, 'miktar', null, null],
      c: ['Özkütle maddeye aittir; miktara bağlı değildir', 'Aynı madde, aynı sıcaklık: özkütleler eşit', 'Oran: 1'],
    },
    {
      id: 's4', z: 2, kart: 'grafik', s: 'Bir kütle–hacim grafiğinde K sıvısı için 20 cm³\'e 60 g, L sıvısı için 40 cm³\'e 40 g karşılık gelmektedir. d_K / d_L oranı kaçtır?',
      o: ['{1//3}', '{2//3}', '{3//2}', '2', '3'], d: 4, y: ['tersoran', null, null, null, null],
      c: ['d_K = {60//20} = 3 g/cm³', 'd_L = {40//40} = 1 g/cm³', 'd_K / d_L = 3'], h: '(60 / 20) / (40 / 40) === 3',
    },
    {
      id: 's5', z: 2, kart: 'karisim', s: 'Özkütleleri 2 g/cm³ ve 4 g/cm³ olan, birbirine karışabilen iki sıvıdan eşit hacimde alınarak karışım yapılıyor. Karışımın özkütlesi kaç g/cm³\'tür?',
      o: ['{8//3}', '3', '3,5', '6', '8'], d: 1, y: ['ortalama', null, null, 'topla', null],
      c: ['Her birinden 1 cm³ alalım', 'Kütleler: 2 g ve 4 g; toplam 6 g', 'Toplam hacim: 2 cm³', 'd = {6//2} = 3 g/cm³'], h: '(2 + 4) / 2 === 3',
    },
    {
      id: 's6', z: 2, kart: 'karisim', s: 'Özkütleleri 1 g/cm³ ve 3 g/cm³ olan iki sıvıdan eşit kütlede alınarak karışım yapılıyor. Karışımın özkütlesi kaç g/cm³\'tür?',
      o: ['1,5', '2', '2,5', '3', '4'], d: 0, y: [null, 'ortalama', null, null, 'topla'],
      c: ['Her birinden 3 g alalım', 'Hacimler: {3//1} = 3 cm³ ve {3//3} = 1 cm³', 'Toplam kütle 6 g, toplam hacim 4 cm³', 'd = {6//4} = 1,5 g/cm³'], h: '6 / (3 / 1 + 3 / 3) === 1.5',
    },
    {
      id: 's7', z: 2, kart: 'hacim', s: 'İçinde 40 cm³ su bulunan dereceli silindire kütlesi 150 g olan bir taş bırakılıyor. Taş tamamen batıyor ve su seviyesi 70 cm³ çizgisine yükseliyor. Taşın özkütlesi kaç g/cm³\'tür?',
      o: ['2', '{15//7}', '3,75', '5', '6'], d: 3, y: [null, 'seviye', 'seviye', null, null],
      c: ['Taşın hacmi: 70 − 40 = 30 cm³', 'd = {150//30}', 'Sonuç: 5 g/cm³'], h: '150 / (70 - 40) === 5',
    },
    {
      id: 's8', z: 3, kart: 'karisim', s: 'Özkütlesi 1 g/cm³ olan sudan 300 cm³ ile özkütlesi 0,8 g/cm³ olan bir sıvıdan 200 cm³ karıştırılıyor. Karışımın özkütlesi kaç g/cm³\'tür?',
      o: ['0,88', '0,90', '0,92', '0,95', '1,8'], d: 2, y: [null, 'ortalama', null, null, 'topla'],
      c: ['Suyun kütlesi: 1·300 = 300 g', 'Sıvının kütlesi: 0,8·200 = 160 g', 'Toplam kütle 460 g, toplam hacim 500 cm³', 'd = {460//500} = 0,92 g/cm³'], h: 'Math.abs((300 + 0.8 * 200) / 500 - 0.92) < 1e-9',
    },
  ],
};
export default k;
