import type { Konu } from './tip';

const k: Konu = {
  id: 'mat-koklu', ad: 'Köklü Sayılar', dk: 25,
  giris: 'Karekök, "karesi bu olan sayı hangisi?" sorusudur. Kök dışına çıkarma, dört işlem ve paydayı kökten kurtarma.',
  yan: {
    topla: {
      ad: 'Kökleri toplarken içlerini toplamak',
      anlat: 'Toplamada kökler birleşmez. Önce her kök ayrı ayrı hesaplanır ya da sadeleştirilir; ancak içleri aynı olan kökler toplanabilir.',
      ornek: '√9 + √16 = 3 + 4 = 7 olur; √25 = 5 değil.',
    },
    isaret: {
      ad: '√(a^2) = a sanmak',
      anlat: 'Karekökün sonucu negatif olamaz. Bu yüzden √(a^2) = |a| olur; a negatifse işaret değişir.',
      ornek: '√((−5)^2) = √25 = 5 olur; −5 değil.',
    },
    disari: {
      ad: 'Kök dışına çıkarırken karekök almayı unutmak',
      anlat: 'Kökten dışarı tam karenin kendisi değil, karekökü çıkar. İçeri alırken de sayının karesi alınır.',
      ornek: '√12 = √(4·3) = 2√3 olur; 4√3 değil. Tersine 3√2 = √(9·2) = √18.',
    },
    payda: {
      ad: 'Paydayı kökten kurtarırken paydayı unutmak',
      anlat: 'Pay ve payda aynı kökle çarpılır. Payda kökten kurtulurken tam sayıya dönüşür ve orada kalır; sadeleştirme en son yapılır.',
      ornek: '{6//√3} = {6√3//3} = 2√3 olur; 6√3 değil.',
    },
  },
  kartlar: [
    {
      id: 'tanim', baslik: 'Karekök ne demek?',
      metin: [
        '√a, karesi a olan ve negatif olmayan sayıdır. √25 = 5\'tir; (−5)^2 de 25 eder ama kök işareti yalnızca pozitif olanı verir.',
        'Bu yüzden bir sayının karesinin karekökü o sayının mutlak değeridir. Negatif bir sayının karekökü gerçek sayı değildir.',
      ],
      kural: ['√(a^2) = |a|', '(√a)^2 = a   (a ≥ 0)'],
      ornek: { s: '√((−7)^2) kaçtır?', a: ['Önce içerisi: (−7)^2 = 49', '√49 = 7', 'Kısa yol: √((−7)^2) = |−7| = 7'] },
      baska: 'Alanı 25 birimkare olan bir karenin kenarı kaç birimdir? 5. Karekök tam olarak bunu sorar: "alanı bilinen karenin kenarı". Kenar uzunluğu negatif olamayacağı için karekök de negatif çıkmaz.',
      soru: { s: '√((−4)^2) kaçtır?', o: ['−4', '4', '16'], d: 1, y: ['isaret', null, null], neden: '√((−4)^2) = √16 = 4. Kök sonucu negatif olmaz.' },
    },
    {
      id: 'sade', baslik: 'Kök dışına çıkarma, kök içine alma',
      metin: [
        'Kök içindeki sayıyı, biri tam kare olacak şekilde iki çarpana ayır. Tam karenin karekökü dışarı çıkar.',
        'Ters yönde, kökün önündeki sayı içeri karesi alınarak girer. Köklü sayıları sıralarken bu yol çok işe yarar.',
      ],
      kural: ['√(a^2·b) = a√b   (a ≥ 0)', 'a√b = √(a^2·b)'],
      ornek: { s: '√50 + √18 − √8 kaçtır?', a: ['√50 = √(25·2) = 5√2', '√18 = √(9·2) = 3√2', '√8 = √(4·2) = 2√2', '5√2 + 3√2 − 2√2 = 6√2'] },
      baska: 'Kökün içini bir oda gibi düşün; dışarı çıkmak için eş bulmak gerekiyor. √12 = √(2·2·3): iki tane 2 eş olur ve dışarıya tek bir 2 olarak çıkar. 3\'ün eşi yok, içeride kalır: 2√3.',
      soru: { s: '√45 en sade biçimde nasıl yazılır?', o: ['9√5', '3√5', '5√3'], d: 1, y: ['disari', null, null], neden: '√45 = √(9·5) = 3√5.' },
    },
    {
      id: 'islem', baslik: 'Köklü sayılarda dört işlem',
      metin: [
        'Toplama ve çıkarma yalnızca kök içleri aynı olan terimler arasında yapılır; katsayılar toplanır, kök aynen kalır.',
        'Çarpma ve bölmede ise kökler tek kök altında birleşir.',
      ],
      kural: ['a√x + b√x = (a + b)√x', '√a · √b = √(a·b)', '{√a//√b} = √({a//b})'],
      ornek: { s: '√3 · √12 + {√48//√3} kaçtır?', a: ['Çarpma: √3 · √12 = √36 = 6', 'Bölme: √48 ÷ √3 = √16 = 4', '6 + 4 = 10'] },
      baska: '√3\'ü bir meyve gibi düşün: 2 elma ile 5 elma 7 elma eder, yani 2√3 + 5√3 = 7√3. Ama 2 elma ile 3 armut tek tür meyve olmaz; 2√3 + 3√2 toplanmaz. Sayılarla dene: √9 + √16 = 3 + 4 = 7 eder, √25 ise 5\'tir.',
      soru: { s: '√9 + √16 kaçtır?', o: ['5', '7', '25'], d: 1, y: ['topla', null, 'topla'], neden: 'Her kök ayrı hesaplanır: 3 + 4 = 7.' },
    },
    {
      id: 'payda', baslik: 'Paydayı kökten kurtarma',
      metin: [
        'Paydada kök bırakılmaz. Payda tek bir kökse pay ve payda o kökle çarpılır.',
        'Paydada toplam ya da fark varsa eşleniğiyle çarpılır: (√a − √b)·(√a + √b) = a − b olduğu için kökler kaybolur.',
      ],
      kural: ['{a//√b} = {a√b//b}', '(√a − √b)·(√a + √b) = a − b'],
      ornek: { s: '{4//√5 − 1} en sade biçimde nedir?', a: ['Eşlenik: √5 + 1. Pay ve payda bununla çarpılır.', 'Payda: (√5 − 1)·(√5 + 1) = 5 − 1 = 4', 'Pay: 4·(√5 + 1)', '4\'ler sadeleşir: √5 + 1'] },
      baska: 'Bir kesri 1 ile çarpmak değerini değiştirmez. {√3//√3} de 1\'dir. Yani pay ve paydayı birlikte √3 ile çarptığında kesir aynı kalır; yalnızca payda √3·√3 = 3 olur ve kök paya geçer.',
      soru: { s: '{10//√5} neye eşittir?', o: ['2', '2√5', '10√5'], d: 1, y: [null, null, 'payda'], neden: '{10//√5} = {10√5//5} = 2√5.' },
    },
  ],
  ozet: [
    '√a negatif olmaz. √(a^2) = |a|.',
    'Dışarı çıkarma: √(a^2·b) = a√b. İçeri alma: a√b = √(a^2·b).',
    'Toplama ve çıkarma yalnızca kök içleri aynıysa yapılır: 2√3 + 5√3 = 7√3.',
    'Çarpma ve bölmede kökler birleşir: √a·√b = √(a·b).',
    'Paydayı kökten kurtar: {a//√b} = {a√b//b}. Toplam ya da fark varsa eşlenikle çarp.',
    'Köklü sayıları sıralamak için hepsini kök içine al.',
  ],
  sorular: [
    {
      id: 's1', z: 1, kart: 'tanim', s: '√81 − √((−5)^2) işleminin sonucu kaçtır?',
      o: ['−14', '−4', '0', '4', '14'], d: 3, y: [null, null, null, null, 'isaret'],
      c: ['√81 = 9', '√((−5)^2) = |−5| = 5', '9 − 5 = 4'], h: 'Math.sqrt(81) - Math.sqrt((-5)**2) === 4',
    },
    {
      id: 's2', z: 1, kart: 'sade', s: '√48 sayısının en sade yazılışı hangisidir?',
      o: ['2√12', '3√5', '4√3', '16√3', '24'], d: 2, y: [null, null, null, 'disari', null],
      c: ['48 içindeki en büyük tam kare 16\'dır: 48 = 16·3', '√48 = √16 · √3', '√16 = 4 olduğundan sonuç 4√3'], h: 'Math.abs(Math.sqrt(48) - 4*Math.sqrt(3)) < 1e-9',
    },
    {
      id: 's3', z: 1, kart: 'islem', s: '√12 + √27 − √3 işleminin sonucu hangisidir?',
      o: ['6', '4√3', '5√3', '6√3', '12√3'], d: 1, y: ['topla', null, null, null, 'disari'],
      c: ['√12 = √(4·3) = 2√3', '√27 = √(9·3) = 3√3', '2√3 + 3√3 − √3 = (2 + 3 − 1)√3', 'Sonuç: 4√3'], h: 'Math.abs(Math.sqrt(12) + Math.sqrt(27) - Math.sqrt(3) - 4*Math.sqrt(3)) < 1e-9',
    },
    {
      id: 's4', z: 2, kart: 'islem', s: '√2 · √18 + {√50//√2} işleminin sonucu kaçtır?',
      o: ['7', '9', '10', '11', '13'], d: 3, y: [null, null, null, null, null],
      c: ['Çarpma: √2 · √18 = √36 = 6', 'Bölme: √50 ÷ √2 = √25 = 5', '6 + 5 = 11'], h: 'Math.abs(Math.sqrt(2)*Math.sqrt(18) + Math.sqrt(50)/Math.sqrt(2) - 11) < 1e-9',
    },
    {
      id: 's5', z: 2, kart: 'payda', s: '{12//√6} ifadesinin eşiti hangisidir?',
      o: ['2√6', '√6', '2', '6√2', '12√6'], d: 0, y: [null, null, null, null, 'payda'],
      c: ['Pay ve payda √6 ile çarpılır: {12√6//√6·√6}', 'Payda: √6·√6 = 6', '{12√6//6} = 2√6'], h: 'Math.abs(12/Math.sqrt(6) - 2*Math.sqrt(6)) < 1e-9',
    },
    {
      id: 's6', z: 2, kart: 'sade', s: '3√5,   2√11   ve   4√3 sayılarının küçükten büyüğe sıralanışı hangisidir?',
      o: ['2√11 < 3√5 < 4√3', '3√5 < 2√11 < 4√3', '2√11 < 4√3 < 3√5', '4√3 < 3√5 < 2√11', '3√5 < 4√3 < 2√11'], d: 0, y: [null, null, null, 'disari', null],
      c: ['Hepsini kök içine al; katsayının karesi içeri girer.', '3√5 = √(9·5) = √45', '2√11 = √(4·11) = √44', '4√3 = √(16·3) = √48', '√44 < √45 < √48 olduğundan 2√11 < 3√5 < 4√3'], h: '2*Math.sqrt(11) < 3*Math.sqrt(5) && 3*Math.sqrt(5) < 4*Math.sqrt(3)',
    },
    {
      id: 's7', z: 3, kart: 'payda', s: '{2//√3 − 1} − √3 işleminin sonucu kaçtır?',
      o: ['−√3', '−1', '0', '1', '√3'], d: 3, y: [null, null, null, null, null],
      c: ['Kesri eşlenikle genişlet: {2·(√3 + 1)//(√3 − 1)·(√3 + 1)}', 'Payda: 3 − 1 = 2', 'Kesir: {2·(√3 + 1)//2} = √3 + 1', '√3 + 1 − √3 = 1'], h: 'Math.abs(2/(Math.sqrt(3)-1) - Math.sqrt(3) - 1) < 1e-9',
    },
    {
      id: 's8', z: 3, kart: 'tanim', s: 'a < 0 < b olmak üzere √(a^2) + √(b^2) − √((a − b)^2) ifadesinin eşiti hangisidir?',
      o: ['0', '2a', '2b', '−2a', '2b − 2a'], d: 0, y: [null, null, 'isaret', null, 'isaret'],
      c: ['√(a^2) = |a| = −a   (a negatif)', '√(b^2) = |b| = b   (b pozitif)', 'a − b negatiftir, bu yüzden √((a − b)^2) = |a − b| = b − a', '−a + b − (b − a) = −a + b − b + a = 0'], h: '(() => { const a = -3, b = 5; return Math.sqrt(a*a) + Math.sqrt(b*b) - Math.sqrt((a-b)**2) === 0; })()',
    },
  ],
};
export default k;
