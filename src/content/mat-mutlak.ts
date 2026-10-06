import type { Konu } from './tip';

const k: Konu = {
  id: 'mat-mutlak', ad: 'Mutlak Değer', dk: 20,
  giris: 'Mutlak değer bir uzaklıktır. Bu tek fikirle tanım, denklem ve eşitsizlik soruları aynı yoldan çözülür.',
  yan: {
    eksi: {
      ad: 'Mutlak değeri negatif bir sayıya eşitlemek',
      anlat: 'Mutlak değer bir uzaklıktır ve negatif olamaz. Sağ taraf negatifse denklemin çözümü yoktur; işlem yapmaya gerek kalmaz.',
      ornek: '|x + 1| = −3 denkleminin çözüm kümesi boştur.',
    },
    tek: {
      ad: 'Tek çözümle yetinmek',
      anlat: 'Sağ taraf pozitifse içerisi hem o sayıya hem de onun eksisine eşit olabilir. İki denklem de çözülür.',
      ornek: '|x − 4| = 6 için x − 4 = 6 ve x − 4 = −6 çözülür: x = 10 ve x = −2.',
    },
    isaret: {
      ad: 'İçi negatifken işaret değiştirmeyi unutmak',
      anlat: 'Mutlak değerin içi negatifse dışarı önüne eksi alarak çıkar. Önce içerinin işaretine bak, sonra aç.',
      ornek: 'x < 3 ise x − 3 negatiftir; |x − 3| = −(x − 3) = 3 − x.',
    },
    yon: {
      ad: 'Eşitsizlikte içeriyi ve dışarıyı karıştırmak',
      anlat: '"Küçüktür" sınıra yakın kalmaktır, tek bir aralık verir. "Büyüktür" uzaklaşmaktır, iki ayrı parça verir.',
      ornek: '|x| < 2 ise −2 < x < 2.   |x| > 2 ise x < −2 ya da x > 2.',
    },
  },
  kartlar: [
    {
      id: 'tanim', baslik: 'Mutlak değer: sıfıra uzaklık',
      metin: [
        '|x|, sayı doğrusunda x\'in sıfıra olan uzaklığıdır. Uzaklık negatif olmaz: |5| = 5 ve |−5| = 5.',
        'Aynı fikirle |a − b|, a ile b arasındaki uzaklıktır.',
      ],
      kural: ['x ≥ 0 ise |x| = x', 'x < 0 ise |x| = −x'],
      ornek: { s: '|3 − 7| + |−2| kaçtır?', a: ['3 − 7 = −4 ve |−4| = 4', '|−2| = 2', '4 + 2 = 6'] },
      baska: 'Evinden 3 km doğuya da yürüsen, 3 km batıya da yürüsen yürüdüğün yol 3 km\'dir. Mutlak değer yönü atar, yalnızca mesafeyi tutar. Kuraldaki "−x" seni şaşırtmasın: x negatifken −x pozitif bir sayıdır.',
      soru: { s: 'x = −4 için |x| − x kaçtır?', o: ['0', '8', '−8'], d: 1, y: ['isaret', null, null], neden: '|−4| = 4 ve 4 − (−4) = 8.' },
    },
    {
      id: 'acma', baslik: 'Mutlak değeri açmak',
      metin: [
        'Mutlak değeri kaldırmadan önce içerinin işaretine bak. İçerisi pozitifse aynen çıkar, negatifse önüne eksi alarak çıkar.',
        'İçerinin işaretini bulmak için verilen aralıktan bir sayı denemek yeterlidir.',
      ],
      kural: ['a > b ise |a − b| = a − b', 'a < b ise |a − b| = b − a'],
      ornek: { s: '1 < x < 4 için |x − 1| + |x − 4| neye eşittir?', a: ['x − 1 pozitif: |x − 1| = x − 1', 'x − 4 negatif: |x − 4| = 4 − x', '(x − 1) + (4 − x) = 3'] },
      baska: 'Aklından bir sayı tut: x = 2 olsun. |2 − 1| + |2 − 4| = 1 + 2 = 3. x = 3 dene: 2 + 1 = 3. Hep 3 çıkıyor; çünkü bu toplam x\'in 1\'e ve 4\'e uzaklıklarının toplamıdır. x ikisinin arasındayken bu toplam, 1 ile 4 arasındaki mesafeye eşittir.',
      soru: { s: 'x < 0 için |x| + x neye eşittir?', o: ['2x', '0', '−2x'], d: 1, y: ['isaret', null, null], neden: 'x negatifken |x| = −x olur: −x + x = 0.' },
    },
    {
      id: 'denklem', baslik: 'Mutlak değerli denklemler',
      metin: [
        '|x − a| = b denklemi "x\'in a\'ya uzaklığı b" demektir. b pozitifse a\'nın iki yanında birer nokta vardır.',
        'b sıfırsa tek çözüm vardır. b negatifse çözüm yoktur.',
      ],
      kural: ['|x − a| = b ise x − a = b ya da x − a = −b   (b > 0)'],
      ornek: { s: '|2x − 1| = 7 denkleminin çözüm kümesi nedir?', a: ['Birinci durum: 2x − 1 = 7, buradan x = 4', 'İkinci durum: 2x − 1 = −7, buradan x = −3', 'Çözüm kümesi: {−3, 4}'] },
      baska: '|x − 3| = 5 için sayı doğrusunda 3\'ün üzerinde dur. 5 birim sağa git: 8. 5 birim sola git: −2. İşte iki çözüm. Denklemi kurmadan önce böyle düşünmek, ikinci çözümü unutmanı engeller.',
      soru: { s: '|x + 1| = −3 denkleminin kaç çözümü vardır?', o: ['Çözümü yoktur', '1', '2'], d: 0, y: [null, 'eksi', 'eksi'], neden: 'Mutlak değer negatif olamaz; çözüm yoktur.' },
    },
    {
      id: 'esitsizlik', baslik: 'Mutlak değerli eşitsizlikler',
      metin: [
        '|x − a| < b, x\'in a\'ya uzaklığı b\'den az demektir: x, a\'nın çevresindeki tek bir aralıkta kalır.',
        '|x − a| > b ise x o aralığın dışındadır; solda ve sağda iki ayrı parça oluşur.',
      ],
      kural: ['|x| < a ise −a < x < a', '|x| > a ise x < −a ya da x > a'],
      ornek: { s: '|x − 2| ≤ 3 eşitsizliğini kaç tam sayı sağlar?', a: ['−3 ≤ x − 2 ≤ 3', 'Her tarafa 2 ekle: −1 ≤ x ≤ 5', 'Tam sayılar: −1, 0, 1, 2, 3, 4, 5', '7 tam sayı'] },
      baska: '|x − 2| ≤ 3 cümlesini Türkçe oku: "2\'ye en çok 3 birim uzaklıktaki sayılar". 2\'nin 3 solu −1, 3 sağı 5\'tir; aradaki her sayı olur. "Küçüktür" içeride kalmak, "büyüktür" dışarı çıkmaktır.',
      soru: { s: '|x| > 2 koşulunu aşağıdakilerden hangisi sağlar?', o: ['x = −3', 'x = 0', 'x = 2'], d: 0, y: [null, 'yon', null], neden: '|−3| = 3 ve 3 > 2. Negatif tarafta da çözüm vardır.' },
    },
  ],
  ozet: [
    '|x|, x\'in sıfıra uzaklığıdır; negatif olmaz. |a − b|, a ile b arasındaki uzaklıktır.',
    'Açarken içerinin işaretine bak: pozitifse aynen, negatifse önüne eksi alarak çıkar.',
    '|x − a| = b (b > 0) denkleminin iki çözümü vardır: x − a = b ve x − a = −b.',
    'Sağ taraf negatifse çözüm yoktur.',
    '|x| < a tek aralık verir: −a < x < a.',
    '|x| > a iki parça verir: x < −a ya da x > a.',
  ],
  sorular: [
    {
      id: 's1', z: 1, kart: 'tanim', s: '|−8| − |3 − 5| + |−1| işleminin sonucu kaçtır?',
      o: ['5', '7', '9', '11', '−7'], d: 1, y: [null, null, null, 'isaret', null],
      c: ['|−8| = 8', '|3 − 5| = |−2| = 2', '|−1| = 1', '8 − 2 + 1 = 7'], h: 'Math.abs(-8) - Math.abs(3-5) + Math.abs(-1) === 7',
    },
    {
      id: 's2', z: 1, kart: 'denklem', s: '|x − 4| = 6 denkleminin kökleri toplamı kaçtır?',
      o: ['−2', '4', '8', '10', '12'], d: 2, y: [null, null, null, 'tek', null],
      c: ['Birinci durum: x − 4 = 6, x = 10', 'İkinci durum: x − 4 = −6, x = −2', '10 + (−2) = 8'], h: '[10, -2].every((x) => Math.abs(x - 4) === 6)',
    },
    {
      id: 's3', z: 1, kart: 'acma', s: 'x < 3 olmak üzere |x − 3| + x ifadesinin eşiti hangisidir?',
      o: ['−3', '3', '2x − 3', '3 − 2x', '2x + 3'], d: 1, y: [null, null, 'isaret', null, null],
      c: ['x < 3 olduğundan x − 3 negatiftir', '|x − 3| = 3 − x', '3 − x + x = 3'], h: '[-5, 0, 2.5].every((x) => Math.abs(x - 3) + x === 3)',
    },
    {
      id: 's4', z: 2, kart: 'esitsizlik', s: '|x − 1| < 4 eşitsizliğini sağlayan kaç tam sayı vardır?',
      o: ['5', '6', '7', '8', '9'], d: 2, y: [null, null, null, null, null],
      c: ['−4 < x − 1 < 4', 'Her tarafa 1 ekle: −3 < x < 5', 'Tam sayılar: −2, −1, 0, 1, 2, 3, 4', '7 tam sayı (uçlar dahil değil)'], h: 'Array.from({ length: 41 }, (_, i) => i - 20).filter((x) => Math.abs(x - 1) < 4).length === 7',
    },
    {
      id: 's5', z: 2, kart: 'denklem', s: '|2x + 3| = x + 6 denklemini sağlayan x değerlerinin toplamı kaçtır?',
      o: ['−3', '0', '3', '6', '9'], d: 1, y: [null, null, 'tek', null, null],
      c: ['Birinci durum: 2x + 3 = x + 6, x = 3', 'İkinci durum: 2x + 3 = −(x + 6), 3x = −9, x = −3', 'Kontrol: x = 3 için 9 = 9, x = −3 için 3 = 3; ikisi de sağlıyor', '3 + (−3) = 0'], h: '[3, -3].every((x) => Math.abs(2*x + 3) === x + 6)',
    },
    {
      id: 's6', z: 2, kart: 'acma', s: '2 < x < 5 olmak üzere |x − 2| + |x − 5| + |x + 1| ifadesinin eşiti hangisidir?',
      o: ['x + 4', '3x − 6', '8 − x', 'x + 8', '6 − x'], d: 0, y: [null, 'isaret', null, null, null],
      c: ['x − 2 pozitif: |x − 2| = x − 2', 'x − 5 negatif: |x − 5| = 5 − x', 'x + 1 pozitif: |x + 1| = x + 1', '(x − 2) + (5 − x) + (x + 1) = x + 4'], h: '[2.5, 3, 4.5].every((x) => Math.abs(x-2) + Math.abs(x-5) + Math.abs(x+1) === x + 4)',
    },
    {
      id: 's7', z: 3, kart: 'esitsizlik', s: '|x + 2| ≥ 5 eşitsizliğini sağlamayan tam sayıların toplamı kaçtır?',
      o: ['−20', '−18', '−14', '−9', '0'], d: 1, y: [null, null, null, null, null],
      c: ['Sağlamayanlar |x + 2| < 5 koşulunu sağlar', '−5 < x + 2 < 5, buradan −7 < x < 3', 'Tam sayılar: −6, −5, −4, −3, −2, −1, 0, 1, 2', 'Toplamları: −18'], h: 'Array.from({ length: 41 }, (_, i) => i - 20).filter((x) => !(Math.abs(x + 2) >= 5)).reduce((a, b) => a + b, 0) === -18',
    },
    {
      id: 's8', z: 3, kart: 'tanim', s: '|x − 3| + |y + 2| = 0 olduğuna göre x·y çarpımı kaçtır?',
      o: ['−6', '−5', '1', '5', '6'], d: 0, y: [null, null, null, null, null],
      c: ['Mutlak değerler negatif olamaz; toplamları 0 ise ikisi de 0\'dır', '|x − 3| = 0 ise x = 3', '|y + 2| = 0 ise y = −2', 'x·y = 3·(−2) = −6'], h: 'Math.abs(3 - 3) + Math.abs(-2 + 2) === 0 && 3 * -2 === -6',
    },
  ],
};
export default k;
