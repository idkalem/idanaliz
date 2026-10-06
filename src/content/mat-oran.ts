import type { Konu } from './tip';

const k: Konu = {
  id: 'mat-oran', ad: 'Oran ve Orantı', dk: 25,
  giris: 'İki çokluk birlikte nasıl değişiyor? Doğru orantıda bölüm, ters orantıda çarpım sabit kalır.',
  yan: {
    fark: {
      ad: 'Oranı toplama–çıkarmayla düşünmek',
      anlat: 'Oran bir bölümdür. {a//b} = {2//5} demek a = 2 ve b = 5 demek değildir; a = 2k ve b = 5k demektir. Çokluklar aynı sayıyla çarpılarak büyür, aynı sayı eklenerek değil.',
      ornek: '{a//b} = {2//5} ve a + b = 42 ise 7k = 42, k = 6; a = 12 ve b = 30.',
    },
    capraz: {
      ad: 'Orantıyı ters kurmak',
      anlat: 'Orantıda aynı tür çokluklar aynı hizaya yazılır, sonra içler dışlar çarpımı yapılır.',
      ornek: '{a//b} = {3//4} ve a = 12 ise 12·4 = 3·b, b = 16.',
    },
    ters: {
      ad: 'Doğru ve ters orantıyı karıştırmak',
      anlat: 'Önce sor: biri artınca öbürü artıyor mu, azalıyor mu? Birlikte artıyorsa doğru orantıdır, bölüm sabittir. Biri artarken öbürü azalıyorsa ters orantıdır, çarpım sabittir.',
      ornek: 'İşçi sayısı artınca süre azalır: 8·15 = 12·x, x = 10 gün.',
    },
    pay: {
      ad: 'Paylaştırmada oranların toplamını kullanmamak',
      anlat: 'Paylar oranların toplamı üzerinden bulunur: bütün, toplam pay sayısına bölünür ve bir payın değeri (k) elde edilir.',
      ornek: '180 TL 2, 3 ve 4 ile doğru orantılı paylaşılırsa 9k = 180, k = 20; paylar 40, 60 ve 80 TL.',
    },
  },
  kartlar: [
    {
      id: 'oran', baslik: 'Oran, orantı ve k sabiti',
      metin: [
        'Oran, aynı türden iki çokluğun bölümle karşılaştırılmasıdır. İki oranın eşitliğine orantı denir.',
        'Bir oran verildiğinde çoklukların gerçek değerleri bilinmez; yalnızca kaç pay oldukları bilinir. Bir payın değerine k denir.',
      ],
      kural: ['{a//b} = {c//d} ise a·d = b·c', '{a//b} = {2//3} ise a = 2k, b = 3k'],
      ornek: { s: '{a//b} = {2//3} ve a + b = 30 ise a kaçtır?', a: ['a = 2k ve b = 3k yaz', 'a + b = 5k = 30, buradan k = 6', 'a = 2·6 = 12'] },
      baska: 'Bir pilav tarifi düşün: 2 bardak pirince 3 bardak su. 4 bardak pirinç koyarsan 6 bardak su gerekir. Miktarlar değişti ama "2\'ye 3" ilişkisi aynı kaldı. k, tarifi kaç kat yaptığındır.',
      soru: { s: '{a//b} = {3//4} ve a = 12 ise b kaçtır?', o: ['9', '13', '16'], d: 2, y: ['capraz', 'fark', null], neden: 'a = 3k = 12 ise k = 4; b = 4k = 16.' },
    },
    {
      id: 'dogru', baslik: 'Doğru orantı',
      metin: [
        'İki çokluktan biri artarken diğeri de aynı oranda artıyorsa doğru orantılıdırlar. Bölümleri sabittir.',
        'Alınan ürün miktarı ile ödenen para, sabit hızla gidilen süre ile alınan yol doğru orantılıdır.',
      ],
      kural: ['{y//x} = k   (sabit)', 'y = k·x'],
      ornek: { s: '3 kg elma 45 TL ise 5 kg elma kaç TL\'dir?', a: ['Bölüm sabit: {45//3} = {x//5}', 'İçler dışlar: 3·x = 45·5 = 225', 'x = 75 TL'] },
      baska: 'En kısa yol birim değeri bulmaktır: 1 kg elma 45 ÷ 3 = 15 TL. 5 kg ise 5·15 = 75 TL. Doğru orantının özü "bir tanesi ne kadar?" sorusudur.',
      soru: { s: '4 defter 60 TL ise 7 defter kaç TL\'dir?', o: ['63', '105', '420'], d: 1, y: ['fark', null, null], neden: 'Bir defter 15 TL; 7 defter 7·15 = 105 TL.' },
    },
    {
      id: 'ters', baslik: 'Ters orantı',
      metin: [
        'İki çokluktan biri artarken diğeri aynı oranda azalıyorsa ters orantılıdırlar. Çarpımları sabittir.',
        'Aynı iş için işçi sayısı ile süre, aynı yol için hız ile süre ters orantılıdır.',
      ],
      kural: ['x·y = k   (sabit)'],
      ornek: { s: '6 işçi bir işi 12 günde bitiriyor. 9 işçi aynı işi kaç günde bitirir?', a: ['İşçi artınca süre azalır: ters orantı', 'Çarpım sabit: 6·12 = 9·x', '72 = 9x, x = 8 gün'] },
      baska: 'Toplam iş değişmez. 6 işçi 12 gün çalışınca 6·12 = 72 "işçi-gün" emek harcanır. Aynı 72\'yi 9 işçiye bölersen her birine 8 gün düşer. Önce toplamı bul, sonra yeni sayıya böl.',
      soru: { s: '4 musluk bir havuzu 6 saatte dolduruyor. Aynı havuzu 8 musluk kaç saatte doldurur?', o: ['12', '3', '10'], d: 1, y: ['ters', null, 'fark'], neden: 'Çarpım sabit: 4·6 = 8·x, x = 3 saat.' },
    },
    {
      id: 'paylastir', baslik: 'Orantılı paylaştırma',
      metin: [
        'Bir bütün 2, 3 ve 5 ile doğru orantılı paylaştırılacaksa paylar 2k, 3k ve 5k olur. Toplam bütüne eşitlenir ve k bulunur.',
        'Ters orantılı paylaşımda paylar {k//2}, {k//3} gibi yazılır: sayısı küçük olan büyük payı alır.',
      ],
      kural: ['Doğru orantılı paylar: a·k, b·k', 'Ters orantılı paylar: {k//a}, {k//b}'],
      ornek: { s: '120 TL, 2 ve 3 ile ters orantılı paylaştırılırsa paylar kaç TL olur?', a: ['Paylar {k//2} ve {k//3}', '{k//2} + {k//3} = {5k//6} = 120, buradan k = 144', 'Paylar: {144//2} = 72 TL ve {144//3} = 48 TL'] },
      baska: '2 ve 3 ile ters orantılı olmak, {1//2} ve {1//3} ile doğru orantılı olmaktır. Paydaları eşitle: {3//6} ve {2//6}. Yani para 3\'e 2 paylaşılır: 120\'nin beşte üçü 72, beşte ikisi 48.',
      soru: { s: '60 ceviz, 1 ve 2 ile doğru orantılı paylaştırılırsa küçük pay kaç ceviz olur?', o: ['20', '30', '40'], d: 0, y: [null, 'pay', null], neden: 'k + 2k = 60, k = 20. Küçük pay 20 ceviz.' },
    },
  ],
  ozet: [
    'Oran bölümdür. {a//b} = {2//3} ise a = 2k, b = 3k yazılır.',
    'Orantıda içler dışlar çarpımı eşittir: a·d = b·c.',
    'Doğru orantı: birlikte artarlar, bölüm sabittir.',
    'Ters orantı: biri artar, öbürü azalır; çarpım sabittir.',
    'Paylaştırmada önce payları k ile yaz, toplamı bütüne eşitle.',
    'Birden çok çokluk varsa toplam işi (işçi × saat × gün) hesapla.',
  ],
  sorular: [
    {
      id: 's1', z: 1, kart: 'oran', s: '{a//b} = {2//5} ve a + b = 42 ise b kaçtır?',
      o: ['5', '12', '18', '30', '35'], d: 3, y: ['fark', null, null, null, null],
      c: ['a = 2k ve b = 5k yaz', 'a + b = 7k = 42, buradan k = 6', 'b = 5·6 = 30'], h: '12 / 30 === 2 / 5 && 12 + 30 === 42',
    },
    {
      id: 's2', z: 1, kart: 'dogru', s: 'Bir araç sabit hızla 3 saatte 240 km yol alıyor. Aynı hızla 5 saatte kaç km yol alır?',
      o: ['144', '320', '360', '400', '480'], d: 3, y: ['ters', null, null, null, null],
      c: ['Süre artınca yol da artar: doğru orantı', 'Bir saatte alınan yol: 240 ÷ 3 = 80 km', '5 saatte: 5·80 = 400 km'], h: '240 / 3 * 5 === 400',
    },
    {
      id: 's3', z: 1, kart: 'ters', s: '8 işçi bir işi 15 günde bitiriyor. Aynı işi 12 işçi kaç günde bitirir?',
      o: ['8', '10', '12', '19', '22,5'], d: 1, y: [null, null, null, 'fark', 'ters'],
      c: ['İşçi artınca süre azalır: ters orantı', 'Çarpım sabit: 8·15 = 12·x', '120 = 12x, x = 10 gün'], h: '8 * 15 / 12 === 10',
    },
    {
      id: 's4', z: 2, kart: 'paylastir', s: '180 TL, üç kardeş arasında 2, 3 ve 4 sayılarıyla doğru orantılı paylaştırılıyor. En büyük pay kaç TL\'dir?',
      o: ['40', '60', '80', '90', '120'], d: 2, y: [null, null, null, 'pay', null],
      c: ['Paylar 2k, 3k ve 4k', '2k + 3k + 4k = 9k = 180, buradan k = 20', 'En büyük pay: 4·20 = 80 TL'], h: '180 / 9 * 4 === 80',
    },
    {
      id: 's5', z: 2, kart: 'oran', s: '{x//3} = {y//4} = {z//5} ve x + y + z = 48 ise z − x kaçtır?',
      o: ['2', '4', '8', '12', '20'], d: 2, y: ['fark', null, null, null, null],
      c: ['x = 3k, y = 4k, z = 5k yaz', '3k + 4k + 5k = 12k = 48, buradan k = 4', 'z − x = 5k − 3k = 2k = 8'], h: '12 + 16 + 20 === 48 && 20 - 12 === 8',
    },
    {
      id: 's6', z: 2, kart: 'paylastir', s: '140 ceviz, Ali ve Burak arasında sırasıyla 2 ve 5 sayılarıyla ters orantılı paylaştırılıyor. Ali kaç ceviz alır?',
      o: ['40', '56', '70', '100', '120'], d: 3, y: ['ters', null, 'pay', null, null],
      c: ['Ters orantılı paylar: Ali {k//2}, Burak {k//5}', '{k//2} + {k//5} = {7k//10} = 140, buradan k = 200', 'Ali: {200//2} = 100 ceviz'], h: '200 / 2 + 200 / 5 === 140',
    },
    {
      id: 's7', z: 3, kart: 'ters', s: '6 işçi günde 8 saat çalışarak bir işi 10 günde bitiriyor. Aynı işi 8 işçi günde 6 saat çalışarak kaç günde bitirir?',
      o: ['7,5', '8', '10', '12', '15'], d: 2, y: [null, null, null, null, null],
      c: ['Toplam iş: 6·8·10 = 480 işçi-saat', 'Yeni ekip bir günde 8·6 = 48 işçi-saat çalışır', '480 ÷ 48 = 10 gün'], h: '6 * 8 * 10 / (8 * 6) === 10',
    },
    {
      id: 's8', z: 3, kart: 'ters', s: 'a sayısı b ile doğru, c ile ters orantılıdır. a = 6 iken b = 4 ve c = 2\'dir. Buna göre b = 10 ve c = 3 iken a kaçtır?',
      o: ['5', '10', '15', '22,5', '45'], d: 1, y: [null, null, null, 'ters', null],
      c: ['Doğru orantılı olan çarpılır, ters orantılı olan bölünür: a = {k·b//c}', '6 = {k·4//2}, buradan k = 3', 'a = {3·10//3} = 10'], h: '3 * 4 / 2 === 6 && 3 * 10 / 3 === 10',
    },
  ],
};
export default k;
