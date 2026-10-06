import type { Konu } from './tip';

const k: Konu = {
  id: 'mat-uslu', ad: 'Üslü Sayılar', dk: 25,
  giris: 'Üs, tekrarlı çarpmanın kısa yazımıdır. Kuralların hepsi "kaç tane çarpan var?" diye sayarak görülebilir.',
  yan: {
    carp: {
      ad: 'Üssü tabanla çarpmak',
      anlat: 'Üs, tabanın kaç kez kendisiyle çarpılacağını söyler; tabanla çarpılmaz. 2^3 demek 2·2·2 demektir.',
      ornek: '2^3 = 2·2·2 = 8 olur; 2·3 = 6 değil.',
    },
    uscarp: {
      ad: 'Çarpımda üsleri çarpmak',
      anlat: 'Tabanlar aynıyken çarpmada üsler toplanır, çünkü çarpanlar yan yana eklenir. Üsler yalnızca üssün üssü alınırken çarpılır.',
      ornek: '2^3·2^4 = 2^{3+4} = 2^7 olur; 2^{12} değil.',
    },
    ustopla: {
      ad: 'Üssün üssünde üsleri toplamak',
      anlat: 'Üssün üssü, aynı grubun tekrar tekrar çarpılmasıdır; üsler çarpılır.',
      ornek: '(3^2)^3 = 3^2·3^2·3^2 = 3^6 olur; 3^5 değil.',
    },
    taban: {
      ad: 'Tabanları da çarpmak',
      anlat: 'Aynı tabanlı iki üslü sayı çarpılırken taban değişmez, yalnızca üsler toplanır.',
      ornek: '5^4·5^2 = 5^6 olur; 25^6 değil.',
    },
    negatif: {
      ad: 'Negatif üssü negatif sayı sanmak',
      anlat: 'Negatif üs sayıyı negatif yapmaz; çarpmaya göre tersini aldırır. Sonucun işareti değişmez.',
      ornek: '2^{−3} = {1//2^3} = {1//8} olur; −8 değil.',
    },
    sifir: {
      ad: 'Sıfırıncı kuvveti yanlış almak',
      anlat: 'Sıfırdan farklı her sayının sıfırıncı kuvveti 1\'dir. Çünkü a^n ÷ a^n hem 1\'e hem de a^{n−n} = a^0\'a eşittir.',
      ornek: '5^0 = 1 olur; 0 ya da 5 değil.',
    },
    parantez: {
      ad: 'Eksi işaretini üsse yanlış katmak',
      anlat: 'Parantez varsa eksi de tabana aittir. Parantez yoksa önce üs alınır, eksi sonra başa konur.',
      ornek: '(−2)^4 = 16 ama −2^4 = −16.',
    },
    toplam: {
      ad: 'Toplamada üs kuralı uygulamak',
      anlat: 'Üs kuralları yalnızca çarpma ve bölmede geçerlidir. Toplamada aynı terimler sayılır ya da ortak çarpan parantezine alınır.',
      ornek: '2^3 + 2^3 = 2·2^3 = 2^4 olur; 2^6 ya da 4^3 değil.',
    },
  },
  kartlar: [
    {
      id: 'tanim', baslik: 'Üs ne söyler?',
      metin: [
        'a^n yazımında a tabandır, n üstür. Üs, tabanın kaç kez yan yana yazılıp çarpılacağını söyler.',
        'Üs 1 ise sayı tek başına durur: a^1 = a. Üs 0 ise, taban sıfır olmadığı sürece sonuç 1\'dir.',
      ],
      kural: ['a^n = a·a·…·a   (n tane a)', 'a^1 = a   ve   a^0 = 1   (a ≠ 0)'],
      ornek: { s: '3^4 kaçtır?', a: ['3^4, dört tane 3\'ün çarpımıdır: 3·3·3·3', '3·3 = 9, 9·3 = 27, 27·3 = 81', 'Sonuç: 3^4 = 81'] },
      baska: 'Bir kâğıdı ikiye katla: 2 kat. Bir daha katla: 4 kat. Bir daha: 8 kat. Her katlamada kat sayısı 2 ile çarpılır; 3 katlamadan sonra 2·2·2 = 2^3 = 8 kat olur. Hiç katlamadıysan elinde 1 kat vardır: 2^0 = 1.',
      soru: { s: '2^5 kaçtır?', o: ['10', '25', '32'], d: 2, y: ['carp', null, null], neden: '2^5 = 2·2·2·2·2 = 32.' },
    },
    {
      id: 'isaret', baslik: 'Negatif taban ve parantez',
      metin: [
        'Negatif bir sayının çift kuvveti pozitif, tek kuvveti negatiftir; çünkü eksiler ikişer ikişer birbirini götürür.',
        'Parantez yoksa eksi tabana ait değildir: önce üs alınır, eksi en sona kalır.',
      ],
      kural: ['(−a)^{çift} pozitif,   (−a)^{tek} negatif', '−a^n = −(a^n)'],
      ornek: { s: '(−3)^2 + (−2)^3 − 2^2 kaçtır?', a: ['(−3)^2 = 9   (çift kuvvet, pozitif)', '(−2)^3 = −8   (tek kuvvet, negatif)', '2^2 = 4', '9 + (−8) − 4 = −3'] },
      baska: 'Parantezi bir kutu gibi düşün: kutunun içinde ne varsa üs onun hepsine uygulanır. (−2)^4 kutusunda −2 var: (−2)·(−2)·(−2)·(−2) = 16. −2^4 yazımında kutu yok; üs yalnızca 2\'ye dokunur, 2^4 = 16 bulunur, sonra başına eksi gelir: −16.',
      soru: { s: '−3^2 kaçtır?', o: ['9', '−9', '−6'], d: 1, y: ['parantez', null, 'carp'], neden: 'Parantez yok: önce 3^2 = 9, sonra eksi. Sonuç −9.' },
    },
    {
      id: 'islem', baslik: 'Çarpma, bölme ve üssün üssü',
      metin: [
        'Tabanlar aynıysa çarpmada üsler toplanır, bölmede çıkarılır. Bir üslü sayının yeniden üssü alınırsa üsler çarpılır.',
        'Tabanlar farklıysa önce aynı tabana çevir: 4 = 2^2, 8 = 2^3, 9 = 3^2, 27 = 3^3.',
      ],
      kural: ['a^m · a^n = a^{m+n}', '{a^m//a^n} = a^{m−n}', '(a^m)^n = a^{m·n}', '(a·b)^n = a^n · b^n'],
      ornek: { s: '{(2^3)^2 · 2^4//2^7} kaçtır?', a: ['Üssün üssü: (2^3)^2 = 2^6', 'Çarpma: 2^6 · 2^4 = 2^{10}', 'Bölme: 2^{10} ÷ 2^7 = 2^3', 'Sonuç: 8'] },
      baska: 'Kuralı ezberlemek yerine say. 2^3·2^2 = (2·2·2)·(2·2): toplam 3 + 2 = 5 tane 2 var, yani 2^5. (2^3)^2 = (2·2·2)·(2·2·2): üçerli 2 grup, 3·2 = 6 tane 2 var, yani 2^6. Bölmede ise üstteki ve alttaki 2\'ler birbirini götürür.',
      soru: { s: '5^4 · 5^2 neye eşittir?', o: ['5^8', '5^6', '25^6'], d: 1, y: ['uscarp', null, 'taban'], neden: 'Taban aynı, üsler toplanır: 5^{4+2} = 5^6.' },
    },
    {
      id: 'negatif', baslik: 'Negatif üs ve sıfırıncı kuvvet',
      metin: [
        'Üssü 1 azaltmak, sayıyı tabana bölmek demektir: 2^3 = 8, 2^2 = 4, 2^1 = 2. Aynı adımla devam et: 2^0 = 1, 2^{−1} = {1//2}, 2^{−2} = {1//4}.',
        'Demek ki negatif üs sayıyı negatif yapmaz, paydaya indirir. Kesirde ise pay ile payda yer değiştirir.',
      ],
      kural: ['a^{−n} = {1//a^n}', '({a//b})^{−n} = ({b//a})^n', 'a^0 = 1   (a ≠ 0)'],
      ornek: { s: '({2//3})^{−2} kaçtır?', a: ['Negatif üs kesri ters çevirir: ({3//2})^2', 'Pay ve paydanın karesi alınır: {3^2//2^2}', 'Sonuç: {9//4}'] },
      baska: 'Bölmeyle düşün: 2^3 ÷ 2^5 işleminde üstte üç, altta beş tane 2 var. Üçü sadeleşir, altta iki tane 2 kalır: {1//2^2}. Kurala göre aynı işlem 2^{3−5} = 2^{−2} eder. Yani 2^{−2} ile {1//4} aynı şeydir; ortada negatif bir sayı yok.',
      soru: { s: '2^{−3} kaçtır?', o: ['−8', '−6', '{1//8}'], d: 2, y: ['negatif', 'carp', null], neden: '2^{−3} = {1//2^3} = {1//8}.' },
    },
    {
      id: 'toplam', baslik: 'Toplama ve çıkarmada dikkat',
      metin: [
        'Üs kuralları çarpma ve bölme içindir. Toplamada üsler toplanmaz, tabanlar da toplanmaz.',
        'Aynı terimleri say ya da ortak çarpan parantezine al. Soruların çoğu bu adımla çözülür.',
      ],
      kural: ['a^n + a^n = 2·a^n', 'a^{n+1} + a^n = a^n·(a + 1)'],
      ornek: { s: '3^5 + 3^5 + 3^5 neye eşittir?', a: ['Aynı terimden 3 tane var: 3·3^5', '3 = 3^1 olduğundan 3^1·3^5 = 3^6', 'Sonuç: 3^6'] },
      baska: 'x + x + x = 3x olduğunu biliyorsun. 3^5\'i tek bir "x" gibi düşün: üç tane x eder 3x, yani 3·3^5. Bundan sonrası çarpma olduğu için üs kuralı artık kullanılabilir.',
      soru: { s: '2^{10} + 2^{10} neye eşittir?', o: ['2^{20}', '4^{10}', '2^{11}'], d: 2, y: ['toplam', 'toplam', null], neden: 'İki tane 2^{10} var: 2·2^{10} = 2^{11}.' },
    },
  ],
  ozet: [
    'a^n, n tane a\'nın çarpımıdır. a^1 = a, a^0 = 1 (a ≠ 0).',
    'Negatif tabanın çift kuvveti pozitif, tek kuvveti negatiftir. −a^n ile (−a)^n aynı değildir.',
    'Çarpmada üsler toplanır: a^m·a^n = a^{m+n}. Bölmede çıkarılır: a^m ÷ a^n = a^{m−n}.',
    'Üssün üssünde üsler çarpılır: (a^m)^n = a^{m·n}.',
    'Negatif üs paydaya indirir: a^{−n} = {1//a^n}. Kesir ters döner.',
    'Toplamada üs kuralı yoktur; ortak çarpan parantezine alınır.',
  ],
  sorular: [
    {
      id: 's1', z: 1, kart: 'tanim', s: '2^3 + 3^2 işleminin sonucu kaçtır?',
      o: ['12', '15', '17', '25', '36'], d: 2, y: ['carp', null, null, null, null],
      c: ['2^3 = 2·2·2 = 8', '3^2 = 3·3 = 9', '8 + 9 = 17'], h: '2**3 + 3**2 === 17',
    },
    {
      id: 's2', z: 1, kart: 'isaret', s: '(−2)^3 − (−2)^2 işleminin sonucu kaçtır?',
      o: ['−12', '−4', '−2', '4', '12'], d: 0, y: [null, 'parantez', 'carp', 'parantez', null],
      c: ['(−2)^3 = −8   (tek kuvvet, negatif)', '(−2)^2 = 4   (çift kuvvet, pozitif)', '−8 − 4 = −12'], h: '(-2)**3 - (-2)**2 === -12',
    },
    {
      id: 's3', z: 1, kart: 'islem', s: '(3^2)^3 · 3^{−4} işleminin sonucu kaçtır?',
      o: ['3', '9', '27', '81', '{1//9}'], d: 1, y: ['ustopla', null, null, null, null],
      c: ['Üssün üssü: (3^2)^3 = 3^6', 'Çarpmada üsler toplanır: 3^6 · 3^{−4} = 3^{6−4} = 3^2', '3^2 = 9'], h: '(3**2)**3 * 3**-4 === 9',
    },
    {
      id: 's4', z: 2, kart: 'negatif', s: '({1//2})^{−3} + 5^0 işleminin sonucu kaçtır?',
      o: ['{7//8}', '8', '9', '{9//8}', '13'], d: 2, y: ['negatif', 'sifir', null, 'negatif', 'sifir'],
      c: ['Negatif üs kesri ters çevirir: ({1//2})^{−3} = 2^3 = 8', 'Sıfırıncı kuvvet: 5^0 = 1', '8 + 1 = 9'], h: '(1/2)**-3 + 5**0 === 9',
    },
    {
      id: 's5', z: 2, kart: 'toplam', s: '3^{10} + 3^{10} + 3^{10} toplamı aşağıdakilerden hangisine eşittir?',
      o: ['3^{11}', '3^{13}', '3^{30}', '9^{10}', '9^{30}'], d: 0, y: [null, null, 'toplam', 'toplam', 'toplam'],
      c: ['Aynı terimden 3 tane var: 3·3^{10}', '3 = 3^1 yazılır: 3^1 · 3^{10}', 'Çarpmada üsler toplanır: 3^{11}'], h: '3 * 3**10 === 3**11',
    },
    {
      id: 's6', z: 2, kart: 'islem', s: '{2^5 · 4^3//8^3} işleminin sonucu kaçtır?',
      o: ['1', '2', '4', '8', '16'], d: 2, y: [null, 'ustopla', null, null, null],
      c: ['Hepsini 2 tabanına çevir: 4^3 = (2^2)^3 = 2^6 ve 8^3 = (2^3)^3 = 2^9', 'Pay: 2^5 · 2^6 = 2^{11}', 'Bölme: 2^{11} ÷ 2^9 = 2^2', 'Sonuç: 4'], h: '2**5 * 4**3 / 8**3 === 4',
    },
    {
      id: 's7', z: 3, kart: 'toplam', s: '{2^{n+2} + 2^n//2^{n−1}} ifadesinin değeri kaçtır?',
      o: ['5', '8', '10', '12', '16'], d: 2, y: [null, null, null, null, null],
      c: ['Payda ortak çarpan 2^n: 2^n·(2^2 + 1) = 5·2^n', 'Bölme: 2^n ÷ 2^{n−1} = 2^{n−(n−1)} = 2^1 = 2', '5·2 = 10'], h: '(2**7 + 2**5) / 2**4 === 10',
    },
    {
      id: 's8', z: 3, kart: 'isaret', s: 'a = −2^4,   b = (−2)^4,   c = (−2)^{−3} sayılarının küçükten büyüğe sıralanışı hangisidir?',
      o: ['a < b < c', 'a < c < b', 'b < c < a', 'c < a < b', 'c < b < a'], d: 1, y: ['negatif', null, 'parantez', null, null],
      c: ['a = −2^4 = −16   (parantez yok, eksi sonda)', 'b = (−2)^4 = 16   (çift kuvvet)', 'c = (−2)^{−3} = {1//(−2)^3} = −{1//8}', '−16 < −{1//8} < 16 olduğundan a < c < b'], h: '-(2**4) < (-2)**-3 && (-2)**-3 < (-2)**4',
    },
  ],
};
export default k;
