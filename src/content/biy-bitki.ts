// 11. sınıf biyoloji, "Tepki" teması: bitkisel hormonlar, tropizma ve nasti.
// Notlar, örnekler ve ilk beş soru sınıfta kullanılan örnek ders dosyasından (ornek-dersler.json) aktarıldı.
// Görseller, kart soruları, benzetmeler ve s6-s9 aynı notlara göre yazıldı; notlarda olmayan hormon, hareket ya da sayı eklenmedi.
// Ders kitabı ve öğretim programıyla karşılaştırması yapılmadığı için bu konunun `day` alanı yoktur.
import type { Konu } from './tip';

const DOSYA = 'Örnek ders dosyası';

const k: Konu = {
  id: 'biy-bitki', ad: 'Bitki Hormonları ve Bitki Hareketleri', dk: 16, tdk: 9,
  giris: 'Bitkinin siniri de kası da yok; ama ışığa döner, kuraklıkta kendini korur, dokununca yaprağını kapatır. Bunu hormonlarla yapar. Bu konuda ışığı sen çevireceksin, ucu sen keseceksin; sonucu şeklin üstünde göreceksin.',
  yer: { sinif: 11, ders: 'biy', konu: 'Bitkisel Hormonlar Bitkilerde Tepki Mekanizmaları (Tropizma, Nasti)' },
  kaynak: 'Notlar ve ilk beş soru sınıfta kullanılan örnek ders dosyasından aktarıldı; görseller ve öteki sorular aynı notlara göre hazırlandı. Ders kitabı ve öğretim programıyla karşılaştırması henüz yapılmadı.',

  yan: {
    golge: {
      ad: 'Oksinin ışık alan tarafta biriktiğini sanmak',
      anlat: 'Oksin **gölgede kalan** tarafa gider. O taraf daha çok uzar; bitki bu yüzden öbür tarafa, yani ışığa doğru eğilir.',
      ornek: 'Işık sağdan geliyorsa oksin solda birikir, bitki sağa eğilir.',
    },
    baski: {
      ad: 'Tepedeki oksinin yan dalları büyüttüğünü sanmak',
      anlat: 'Tepe tomurcuğundan gelen oksin yan tomurcukları **baskılar**. Uç kesilince baskı kalkar ve bitki yana dallanır.',
    },
    hormon: {
      ad: 'Hormonların işlerini karıştırmak',
      anlat: 'Oksin hücreyi uzatır. Giberellin boğum arasını uzatır ve çimlenmeyi başlatır. Sitokinin hücreyi böldürür. Absisik asit kuraklıkta stomaları kapatır. Etilen meyveyi olgunlaştırır.',
    },
    grup: {
      ad: 'Teşvik eden ve engelleyen hormonları karıştırmak',
      anlat: 'Büyümeyi teşvik edenler: oksin, giberellin, sitokinin. Engelleyenler: absisik asit ve etilen.',
    },
    zit: {
      ad: 'Birbirinin tersini yapan hormonları karıştırmak',
      anlat: 'Giberellin çimlenmeyi başlatır ve uykuyu kırar; absisik asit tohumu uykuda tutar. Oksin yan tomurcukları baskılar; sitokinin onları uyarır.',
    },
    tropNasti: {
      ad: 'Tropizma ile nastiyi karıştırmak',
      anlat: 'Tropizma yönelmedir: uyaranın yönüne göre, büyümeyle olur ve kalıcıdır. Nasti irkilmedir: uyaranın yönü fark etmez, turgor değişir ve hareket geri döner.',
      ornek: 'Sarmaşığın desteğe sarılması tropizma, küstüm otunun kapanması nastidir.',
    },
    onek: {
      ad: 'Hareketin önekini karıştırmak',
      anlat: 'Önek uyaranı söyler: foto ışık, kemo kimyasal, hidro su, termo sıcaklık, sismo sarsıntı ya da dokunma, gravi yer çekimi, tigmo temas.',
    },
    isaret: {
      ad: 'Pozitif ile negatifi karıştırmak',
      anlat: 'Pozitif, uyarana doğru demektir; negatif, uyarandan uzağa. Kök yer çekimine doğru büyür (pozitif), gövde tersine büyür (negatif).',
    },
    uc: {
      ad: 'Işığı algılayan yeri yanlış bilmek',
      anlat: 'Uç kesilirse ya da ışık geçirmez bir başlıkla örtülürse fide eğilmez. Demek ki ışığı algılayan ve oksini üreten yer fidenin ucudur.',
    },
  },

  kartlar: [
    {
      id: 'oksin', baslik: 'Oksin ve ışığa yönelme',
      giris: 'Pencere kenarındaki saksıya birkaç gün sonra bak: bitki cama doğru eğilmiştir. Gözü yok, kası yok. Peki nasıl dönüyor?',
      gorsel: { tip: 'isik' },
      metin: [
        'Bitkide büyümeyi **hormonlar** yönetir. İlki **oksin**: gövde ucunda, genç yapraklarda ve tohumda üretilir. Asıl işi **hücreleri uzatmaktır**.',
        '**Fototropizma (ışığa yönelme):** oksin gölgede kalan tarafa gider. O taraf daha çok uzar ve bitki ışığa doğru eğilir.',
        'Oksinin öteki işleri: çelikte kök oluşturur, çekirdeksiz meyve oluşumunu sağlar (partenokarpi), yüksek dozu yabani ot ilacı olarak kullanılır. Kök oksine gövdeden çok daha hassastır: gövdeyi uzatan miktar kökü yavaşlatır.',
      ],
      kural: ['Oksin gölgede kalan tarafa gider → o taraf daha çok uzar → bitki ışığa eğilir.'],
      baska: 'Yan yana yürüyen bir sıra düşün. Sol uçtakiler uzun adım atarsa sıra sağa döner. Gövdede de böyle olur: gölgede kalan taraftaki hücreler daha çok uzar, gövde öbür tarafa, yani ışığa doğru kıvrılır.',
      soru: { s: 'Işık bir fideye yalnızca sağdan geliyor. Oksin hangi tarafta birikir?', o: ['Sağda, ışık alan tarafta', 'Solda, gölgede kalan tarafta', 'İki tarafta eşit'], d: 1, y: ['golge', null, 'golge'], neden: 'Oksin gölgede kalan tarafa gider. O taraf daha çok uzar ve fide ışığa, yani sağa eğilir.' },
    },
    {
      id: 'tepe', baslik: 'Tepe tomurcuğu neden baskındır?',
      giris: 'Bahçıvan bir çalının ucunu budar. Çalı bundan sonra boyuna değil, yana doğru dallanır ve sıklaşır.',
      gorsel: { tip: 'tepe' },
      metin: [
        '**Apikal dominans (tepe baskınlığı):** tepe tomurcuğundan gelen oksin, alttaki yan tomurcukları baskılar. Bitki önce boyuna uzar.',
        'Ucu kesersen oksinin kaynağı gider, baskı kalkar ve bitki yana dallanır.',
      ],
      kural: ['Tepeden gelen oksin yan tomurcukları baskılar.', 'Uç kesilirse baskı kalkar: bitki yana dallanır.'],
      baska: 'Bir toplantıda sözü hiç bırakmayan birini düşün: o konuşurken ötekiler söz alamaz. O çıkınca herkes konuşmaya başlar. Tepe tomurcuğu oksinle yan tomurcukları susturur; uç kesilince yan tomurcuklar büyümeye başlar.',
      soru: { s: 'Tepe tomurcuğu kesilen bir bitkide ne olur?', o: ['Bitki daha hızlı boy atar', 'Yan tomurcuklar gelişir, bitki yana dallanır', 'Bitkinin büyümesi tümüyle durur'], d: 1, y: ['baski', null, null], neden: 'Tepeden gelen oksinin baskısı kalkar; yan tomurcuklar gelişir ve bitki yana dallanır.' },
    },
    {
      id: 'gs', baslik: 'Giberellin ve sitokinin',
      giris: 'Bir tohum toprağın altında uzun süre uykuda bekleyebilir. Sonra uyanır ve çimlenir. Onu uyandıran bir hormondur.',
      metin: [
        '**Giberellin:** boğum aralarını uzatır (cüce bitkiyi uzatır), çimlenmeyi başlatır, tohumun uykusunu (dormansi) kırar, çiçeklenmeyi ve meyve büyümesini sağlar.',
        '**Sitokinin:** kökte üretilir. Hücre bölünmesini sağlar, yaşlanmayı geciktirir, yan tomurcukları uyarır. Tepe baskınlığında oksinin tersini yapar.',
      ],
      tablo: {
        ad: 'Büyümeyi teşvik eden üç hormon',
        bas: ['Hormon', 'Asıl işi', 'Aklında kalsın'],
        sat: [
          ['Oksin', 'Hücre uzaması', 'Işığa yönelme, tepe baskınlığı'],
          ['Giberellin', 'Boğum arası uzaması, çimlenme', 'Cüce bitkiyi uzatır, uykuyu kırar'],
          ['Sitokinin', 'Hücre bölünmesi', 'Yaşlanmayı geciktirir, yan tomurcukları uyarır'],
        ],
      },
      gorsel: { tip: 'eslestir', ad: 'Hormonu işiyle eşleştir', cift: [['Oksin', 'Hücreyi uzatır'], ['Giberellin', 'Tohumun uykusunu kırar'], ['Sitokinin', 'Hücreyi böldürür']] },
      kural: ['Giberellin: boyu uzatır, tohumu uyandırır.', 'Sitokinin: hücreyi böldürür, yaşlanmayı geciktirir.'],
      baska: 'Üç hormonu üç ustaya benzet. Oksin hücreleri **uzatan** usta. Giberellin bitkiyi **boyuna çeken** ve tohumu **uyandıran** usta. Sitokinin hücreleri **çoğaltan** ve bitkiyi **genç tutan** usta.',
      soru: { s: 'Hücre bölünmesini sağlayan ve yaşlanmayı geciktiren hormon hangisidir?', o: ['Giberellin', 'Sitokinin', 'Oksin'], d: 1, y: ['hormon', null, 'hormon'], neden: 'Sitokinin hücre bölünmesini sağlar ve yaşlanmayı geciktirir. Giberellin boğum aralarını, oksin hücreleri uzatır.' },
    },
    {
      id: 'engel', baslik: 'Absisik asit ve etilen',
      giris: 'Meyve kasasında tek bir çürük elma kalırsa birkaç gün sonra bütün kasa bozulur. Elmalar birbirine dokunmadan bunu nasıl yapıyor?',
      metin: [
        '**Etilen** gaz hâlindeki tek hormondur. Meyveyi olgunlaştırır; yaprak, çiçek ve meyve dökülmesini sağlar; yaşlanmaya yol açar. Bir çürük elmanın bütün kasayı bozması bu yüzdendir.',
        '**Absisik asit (ABA)** stres hormonudur. Kuraklıkta stomaları kapatır, tohum ve tomurcukta uykuyu (dormansi) sağlar, büyümeyi engeller. Giberellinin tersini yapar.',
        'Sınav klasiği: büyümeyi **teşvik edenler** oksin, giberellin ve sitokinin; **engelleyenler** absisik asit ve etilen.',
      ],
      gorsel: {
        tip: 'grupla', ad: 'Teşvik mi eder, engeller mi?', kutu: ['Büyümeyi teşvik eder', 'Büyümeyi engeller'],
        oge: [['Oksin', 0], ['Absisik asit', 1], ['Giberellin', 0], ['Etilen', 1], ['Sitokinin', 0]],
      },
      kural: ['Teşvik edenler: oksin, giberellin, sitokinin', 'Engelleyenler: absisik asit, etilen'],
      baska: 'Bitkiyi bir arabaya benzet. Oksin, giberellin ve sitokinin **gaz pedalıdır**: büyümeyi hızlandırır. Absisik asit ve etilen **frendir**: kuraklıkta stomaları kapatır, tohumu uykuda tutar, yaprağı döker. Bitki koşullara ikisini birlikte kullanarak uyar.',
      soru: { s: 'Gaz hâlinde olan ve meyveyi olgunlaştıran hormon hangisidir?', o: ['Absisik asit', 'Etilen', 'Giberellin'], d: 1, y: ['hormon', null, 'hormon'], neden: 'Etilen gaz hâlindeki tek hormondur ve meyveyi olgunlaştırır.' },
    },
    {
      id: 'ad', baslik: 'Hareketin adını çöz',
      giris: 'Fototropizma, sismonasti, hidrotropizma… Bu adları tek tek ezberlemene gerek yok. Hepsi iki parçadan oluşur; parçaları bilirsen adı kendin çözersin.',
      gorsel: { tip: 'hareket-adi' },
      metin: [
        'Ad = **önek + son ek**. Önek **uyaranı**, son ek **hareketin türünü** söyler.',
        '**-tropizma** yönelme demek: bitki uyaranın yönüne doğru ya da tersine büyür. Büyümeyle olur, kalıcıdır. **-nasti** irkilme demek: uyaranın yönü fark etmez, hücredeki su basıncı (turgor) değişir, hareket geri döner.',
        'Yönelmede bir de işaret vardır: **pozitif** uyarana doğru, **negatif** uyarandan uzağa.',
      ],
      tablo: {
        ad: 'Önekler',
        bas: ['Önek', 'Uyaran'],
        sat: [['foto', 'ışık'], ['kemo', 'kimyasal'], ['hidro', 'su'], ['termo', 'sıcaklık'], ['sismo', 'sarsıntı, dokunma'], ['gravi ya da jeo', 'yer çekimi'], ['tigmo', 'temas']],
      },
      kural: ['-tropizma: yönelme. Yöne bağlıdır, büyümeyle olur, kalıcıdır.', '-nasti: irkilme. Yönden bağımsızdır, turgorla olur, geri döner.'],
      baska: 'Adı bir adres gibi oku. Önek "neye tepki?" sorusunu, son ek "nasıl tepki?" sorusunu yanıtlar. Termo-nasti: sıcaklığa, yönden bağımsız ve geri dönen bir tepki. Hidro-tropizma: suya, yönüne göre büyüyerek verilen kalıcı bir tepki.',
      soru: { s: '"Termonasti" adındaki "termo" öneki neyi söyler?', o: ['Uyaranın sıcaklık olduğunu', 'Hareketin kalıcı olduğunu', 'Uyaranın ışık olduğunu'], d: 0, y: [null, 'tropNasti', 'onek'], neden: 'Önek uyaranı söyler: termo sıcaklık demektir. Hareketin türünü son ek söyler.' },
    },
    {
      id: 'tropizma', baslik: 'Tropizmalar: yönelerek büyüme',
      giris: 'Bir tohumu toprağa hangi yönde bırakırsan bırak kökü aşağı, gövdesi yukarı gider. Sarmaşık ise bulduğu desteğe sarılarak tırmanır.',
      metin: [
        'Tropizmada bitki **uyaranın yönüne göre** büyür.',
        '**Fototropizma:** saksıdaki bitki pencereye eğilir (gövde pozitif). **Kemotropizma:** polen tüpü yumurtaya doğru uzar. **Hidrotropizma:** kök suya yönelir. **Gravitropizma:** kök aşağı (pozitif), gövde yukarı (negatif) büyür. **Tigmotropizma:** sarmaşık desteğe sarılır.',
      ],
      gorsel: {
        tip: 'eslestir', ad: 'Örneği adıyla eşleştir',
        cift: [['Bitki pencereye eğilir', 'Fototropizma'], ['Polen tüpü yumurtaya uzar', 'Kemotropizma'], ['Kök suya yönelir', 'Hidrotropizma'], ['Kök aşağı, gövde yukarı büyür', 'Gravitropizma'], ['Sarmaşık desteğe sarılır', 'Tigmotropizma']],
      },
      kural: ['Pozitif: uyarana doğru. Negatif: uyarandan uzağa.', 'Kök yer çekimine pozitif, gövde negatif yönelir.'],
      baska: 'Her tropizmada kendine iki soru sor: Uyaran ne? Bitki ona doğru mu, ters yöne mi büyüyor? Kök aşağı iner: uyaran yer çekimi, yön ona doğru; pozitif gravitropizma. Gövde yukarı çıkar: uyaran yine yer çekimi, yön ters; negatif gravitropizma.',
      soru: { s: 'Gövdenin yer çekiminin tersine, yukarı doğru büyümesi hangi harekettir?', o: ['Pozitif gravitropizma', 'Negatif gravitropizma', 'Negatif fototropizma'], d: 1, y: ['isaret', null, 'onek'], neden: 'Uyaran yer çekimidir: gravi. Gövde uyarandan uzağa büyür: negatif. Işığa göre bakılsaydı gövde ışığa doğru büyür, yani pozitif fototropizma olurdu.' },
    },
    {
      id: 'nasti', baslik: 'Nastiler: irkilme hareketleri',
      giris: 'Küstüm otuna dokunursan yaprakları hemen kapanır, bir süre sonra kendiliğinden yeniden açılır. Nereden dokunduğun fark etmez.',
      metin: [
        'Nastide uyaranın **yönü önemli değildir**. Hareket büyümeyle değil, hücredeki su basıncının (turgor) değişmesiyle olur; bu yüzden **geri döner**.',
        '**Fotonasti:** akşamsefası akşam açar. **Termonasti:** lale sıcakta açılır, soğukta kapanır. **Sismonasti:** küstüm otu dokununca yapraklarını kapatır.',
      ],
      gorsel: {
        tip: 'grupla', ad: 'Tropizma mı, nasti mi?', kutu: ['Tropizma', 'Nasti'],
        oge: [['Bitki pencereye eğilir', 0], ['Küstüm otu yapraklarını kapatır', 1], ['Sarmaşık desteğe sarılır', 0], ['Lale sıcakta açılır', 1], ['Kök suya yönelir', 0], ['Akşamsefası akşam açar', 1]],
      },
      kural: ['Kalıcıysa ve yöne bağlıysa: tropizma.', 'Geri dönüyorsa ve yön fark etmiyorsa: nasti.'],
      baska: 'İki soru yeter. Uyaranın geldiği yön sonucu değiştiriyor mu? Hareket geri dönüyor mu? Küstüm otu nereden dokunursan dokun kapanır ve sonra açılır: nasti. Sarmaşık desteğin olduğu yöne doğru büyür ve öyle kalır: tropizma.',
      soru: { s: 'Lalenin sıcakta açılıp soğukta kapanması hangi harekettir?', o: ['Termonasti', 'Fotonasti', 'Fototropizma'], d: 0, y: [null, 'onek', 'tropNasti'], neden: 'Uyaran sıcaklıktır: termo. Hareket geri döner ve yönden bağımsızdır: nasti.' },
    },
    {
      id: 'deney', baslik: 'Koleoptil deneyi: ışığı kim algılıyor?',
      giris: 'Bitkinin ışığa eğildiğini gördün. Peki ışığı bitkinin neresi fark ediyor: ucu mu, gövdesi mi? Bunu anlamanın yolu bir deney kurmaktır.',
      gorsel: { tip: 'isik', deney: true },
      metin: [
        'Üç fideye aynı yönden ışık verilir. Birincinin ucu **açık** bırakılır, ikincinin ucu **kesilir**, üçüncünün ucu ışık geçirmez bir başlıkla **örtülür**.',
        'Sonuç: yalnızca ucu açık olan fide ışığa eğilir. Ucu kesilen ve ucu örtülen fide eğilmez.',
        'Demek ki ışığı algılayan ve oksini üreten yer fidenin **ucudur**.',
      ],
      kural: ['Uç kesilir ya da örtülürse fide eğilmez.', 'Işığı algılayan ve oksini üreten yer: uç.'],
      baska: 'Bir şeyin etkili olup olmadığını anlamak için onu ortadan kaldırır, neyin değiştiğine bakarsın. Ucu kestin: eğilme bitti. Ucu kesmeden yalnızca ışığını kestin: eğilme yine bitti. İkisi birlikte şunu söyler: uç hem yerinde olmalı hem ışığı görmeli.',
      soru: { s: 'Ucu ışık geçirmez başlıkla örtülen fide neden eğilmez?', o: ['Uç ışığı algılayamadığı için', 'Başlık fideyi ağırlaştırdığı için', 'Gövde ışık alamadığı için'], d: 0, y: [null, null, 'uc'], neden: 'Işığı algılayan yer uçtur. Uç örtülünce ışığın hangi yönden geldiği algılanmaz ve fide eğilmez.' },
    },
  ],

  ozet: [
    'Oksin hücreyi uzatır. Gölgede kalan tarafa gider, o taraf daha çok uzar, bitki ışığa eğilir.',
    'Tepe tomurcuğundan gelen oksin yan tomurcukları baskılar; uç kesilirse bitki yana dallanır.',
    'Giberellin boyu uzatır ve tohumu uyandırır. Sitokinin hücreyi böldürür ve yaşlanmayı geciktirir.',
    'Absisik asit kuraklıkta stomaları kapatır. Etilen gaz hâlindedir ve meyveyi olgunlaştırır.',
    'Teşvik edenler: oksin, giberellin, sitokinin. Engelleyenler: absisik asit, etilen.',
    'Tropizma: yöne bağlı, büyümeyle olur, kalıcı. Nasti: yönden bağımsız, turgorla olur, geri döner.',
    'Koleoptil deneyi: ışığı algılayan ve oksini üreten yer fidenin ucudur.',
  ],

  sorular: [
    {
      id: 's1', z: 1, kart: 'oksin',
      s: 'Tek taraftan ışık alan bir fidede oksin nasıl dağılır ve sonuç ne olur?',
      o: ['Işık alan tarafta birikir, bitki ışıktan uzaklaşır', 'Gölgede kalan tarafta birikir, o taraf uzar ve bitki ışığa eğilir', 'Eşit dağılır, bitki dik büyür', 'Köke taşınır, gövde büyümesi durur', 'Işık alan tarafta birikir, o taraf uzar ve bitki ışığa eğilir'],
      d: 1, y: ['golge', null, null, null, 'golge'],
      ip: 'Hangi taraf daha çok uzarsa bitki ters yöne eğilir.',
      c: ['Oksin gölgede kalan tarafa gider.', 'Oksin hücreleri uzatır: gölgedeki taraf daha çok uzar.', 'Bir taraf daha çok uzayınca gövde öbür tarafa, yani ışığa doğru eğilir.'],
      kay: `${DOSYA}, 1. soru (beşinci seçenek eklendi)`,
    },
    {
      id: 's2', z: 2, kart: 'tepe',
      s: 'Bir bitkinin tepe tomurcuğu kesilince yan dallar hızla gelişiyor. Bunun sebebi nedir?',
      o: ['Etilen üretiminin artması', 'Absisik asidin yan tomurcuklara gitmesi', 'Tepeden gelen oksinin yan tomurcukları daha çok uyarması', 'Tepeden gelen oksinin yan tomurcuklar üzerindeki baskısının kalkması', 'Giberellinin azalması'],
      d: 3, y: ['hormon', 'hormon', 'baski', null, 'hormon'],
      c: ['Tepe tomurcuğundan gelen oksin yan tomurcukları baskılar: apikal dominans.', 'Uç kesilince oksinin kaynağı gider ve baskı kalkar.', 'Sitokininin de etkisiyle yan tomurcuklar gelişir, bitki yana dallanır.'],
      kay: `${DOSYA}, 2. soru (beşinci seçenek eklendi)`,
    },
    {
      id: 's3', z: 1, kart: 'engel',
      s: 'Kuraklık stresinde stomaların kapanmasını sağlayan hormon hangisidir?',
      o: ['Absisik asit', 'Sitokinin', 'Giberellin', 'Oksin', 'Etilen'],
      d: 0, y: [null, 'hormon', 'zit', 'hormon', 'hormon'],
      c: ['Kuraklık bitki için bir strestir; stres hormonu absisik asittir.', 'Absisik asit stomaları kapatır.'],
      kay: `${DOSYA}, 3. soru (beşinci seçenek eklendi)`,
    },
    {
      id: 's4', z: 2, kart: 'engel',
      s: 'Aşağıdakilerden hangisi büyümeyi genel olarak engelleyen hormon grubudur?',
      o: ['Oksin ve giberellin', 'Sitokinin ve oksin', 'Absisik asit ve etilen', 'Giberellin ve sitokinin', 'Absisik asit ve sitokinin'],
      d: 2, y: ['grup', 'grup', null, 'grup', 'grup'],
      c: ['Büyümeyi teşvik edenler: oksin, giberellin, sitokinin.', 'Geriye kalan ikisi büyümeyi engeller: absisik asit ve etilen.'],
      kay: `${DOSYA}, 4. soru (beşinci seçenek eklendi)`,
    },
    {
      id: 's5', z: 2, kart: 'nasti',
      s: 'Küstüm otunun dokununca yapraklarını kapatması hangi harekettir?',
      o: ['Tigmotropizma', 'Sismonasti', 'Fototropizma', 'Gravitropizma', 'Termonasti'],
      d: 1, y: ['tropNasti', null, 'tropNasti', 'tropNasti', 'onek'],
      ip: 'Kalıcı mı, geri dönüşümlü mü?',
      c: ['Yapraklar sonra yeniden açılır ve dokunmanın yönü fark etmez: hareket bir nastidir.', 'Uyaran sarsıntı ya da dokunmadır: önek sismo.', 'Sismonasti. Sarmaşığın desteğe sarılması ise kalıcıdır: tigmotropizma.'],
      kay: `${DOSYA}, 5. soru (beşinci seçenek eklendi)`,
    },
    {
      id: 's6', z: 1, kart: 'gs',
      b: ['Bir tohum uygun koşullar oluşana kadar uykuda (dormansi) bekliyor.'],
      s: 'Tohumun uykusunu kırıp çimlenmeyi başlatan hormon hangisidir?',
      o: ['Absisik asit', 'Etilen', 'Sitokinin', 'Oksin', 'Giberellin'],
      d: 4, y: ['zit', 'hormon', 'hormon', 'hormon', null],
      ip: 'Tohumu uykuda tutan hormon ile uyandıran hormon birbirinin tersini yapar.',
      c: ['Tohumu uykuda tutan hormon absisik asittir.', 'Giberellin onun tersini yapar: uykuyu kırar ve çimlenmeyi başlatır.'],
      kay: `${DOSYA}, giberellin ve absisik asit notlarına göre yazıldı`,
    },
    {
      id: 's7', z: 2, kart: 'ad',
      s: 'Adı "hidrotropizma" olan bir hareket için hangisi söylenebilir?',
      o: ['Bitki suya göre yönelir; hareket büyümeyle olur ve kalıcıdır', 'Bitki suya yönden bağımsız tepki verir; hareket geri döner', 'Bitki ışığa göre yönelir; hareket büyümeyle olur ve kalıcıdır', 'Bitki sıcaklığa yönden bağımsız tepki verir; hareket geri döner', 'Bitki yer çekimine göre yönelir; hareket büyümeyle olur ve kalıcıdır'],
      d: 0, y: [null, 'tropNasti', 'onek', 'onek', 'onek'],
      ip: 'Adı ikiye böl: hidro + tropizma.',
      c: ['Önek uyaranı söyler: hidro su demektir.', 'Son ek hareketin türünü söyler: -tropizma yönelmedir; büyümeyle olur ve kalıcıdır.', 'Demek ki bitki suyun yönüne göre büyür ve bu hareket kalıcıdır.'],
      kay: `${DOSYA}, "önek + son ek" notuna göre yazıldı`,
    },
    {
      id: 's8', z: 2, kart: 'tropizma',
      s: 'Bir bitkinin kökü aşağı, gövdesi yukarı doğru büyüyor. Bu durum hangisiyle doğru adlandırılır?',
      o: ['Kök negatif, gövde pozitif gravitropizma', 'Kök de gövde de pozitif gravitropizma', 'Kök pozitif, gövde negatif fototropizma', 'Kök pozitif, gövde negatif gravitropizma', 'Kök de gövde de negatif gravitropizma'],
      d: 3, y: ['isaret', 'isaret', 'onek', null, 'isaret'],
      c: ['Aşağı ve yukarı yönünü belirleyen uyaran yer çekimidir: gravitropizma.', 'Kök yer çekimine doğru büyür: pozitif.', 'Gövde yer çekiminin tersine büyür: negatif.'],
      kay: `${DOSYA}, tropizma örneklerine göre yazıldı`,
    },
    {
      id: 's9', z: 3, kart: 'deney',
      b: ['Üç fideye aynı yönden ışık veriliyor. Birinci fidenin ucu açık, ikincinin ucu kesilmiş, üçüncünün ucu ışık geçirmez bir başlıkla örtülmüş. Yalnızca birinci fide ışığa doğru eğiliyor.'],
      s: 'Bu deneyden hangi sonuç çıkar?',
      o: ['Işığı fidenin gövdesi algılar', 'Fide ışık olmadan büyüyemez', 'Işığı algılayan ve oksini üreten yer fidenin ucudur', 'Ucu kesilen fide ışıktan uzaklaşır', 'Oksin yalnızca kökte üretilir'],
      d: 2, y: ['uc', null, null, null, 'uc'],
      c: ['Ucu kesilen fide eğilmiyor: eğilme için uç gerekli.', 'Ucu örtülen fidenin gövdesi ışık aldığı hâlde fide eğilmiyor: ışığı gövde değil, uç algılıyor.', 'Sonuç: ışığı algılayan ve oksini üreten yer fidenin ucudur.'],
      kay: `${DOSYA}, koleoptil deneyi notuna göre yazıldı`,
    },
  ],
};
export default k;
