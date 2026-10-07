// 11. sınıf biyoloji, "Tepki" teması: nöronun yapısı, nöronda sinyal iletimi ve sinaps.
// Notlar, benzetmeler ve ilk beş soru sınıfta kullanılan örnek ders dosyasından (ornek-dersler.json) aktarıldı.
// Görseller, kart soruları ve s6-s8 aynı notlara göre yazıldı; notlarda olmayan sayı ya da kavram eklenmedi.
// Ders kitabı ve öğretim programıyla karşılaştırması yapılmadığı için bu konunun `day` alanı yoktur.
import type { Konu } from './tip';

const DOSYA = 'Örnek ders dosyası';

const k: Konu = {
  id: 'biy-noron', ad: 'Nöron ve Sinyal İletimi', dk: 14, tdk: 8,
  giris: 'Sinir hücresi bilgiyi nasıl alır, nasıl taşır, bir sonraki hücreye nasıl verir? Bu konuda her şeyi şeklin üstünde deneyerek göreceksin: uyartıyı sen göndereceksin, iyonları sen hareket ettireceksin.',
  yer: { sinif: 11, ders: 'biy', konu: 'Uyartıların Alınması (Reseptörler, Uyaran Çeşitleri), Nöronların Yapısı, Nöronlarda Sinyal İletimi ve Sinaps, Duyu Organları' },
  kaynak: 'Notlar ve ilk beş soru sınıfta kullanılan örnek ders dosyasından aktarıldı; görseller ve öteki sorular aynı notlara göre hazırlandı. Ders kitabı ve öğretim programıyla karşılaştırması henüz yapılmadı.',

  yan: {
    tur: {
      ad: 'Nöron çeşitlerini karıştırmak',
      anlat: 'Duyu nöronu bilgiyi merkeze **getirir**. Motor nöron komutu merkezden **götürür**. Ara nöron ikisinin arasındadır: beyin ve omurilikte bilgiyi değerlendirir.',
      ornek: 'Merkeze giden: duyu. Merkezden çıkan: motor.',
    },
    yon: {
      ad: 'Uyartının yönünü ters çevirmek',
      anlat: 'Bilgi hep aynı yönde akar: dendrit → gövde → akson → akson ucu. Dendrit alır, akson taşır, akson ucu verir.',
      ornek: 'Dendrit giriş, akson ucu çıkıştır.',
    },
    karistir: {
      ad: 'Depolarizasyon ile repolarizasyonu karıştırmak',
      anlat: 'Depolarizasyonda Na⁺ içeri girer ve içerisi + olur. Repolarizasyonda K⁺ dışarı çıkar ve içerisi yine − olur.',
      ornek: 'Kısa yol: Na girer, bozulur; K çıkar, düzelir.',
    },
    miyelin: {
      ad: 'Uyartının miyelin üzerinde oluştuğunu sanmak',
      anlat: 'Miyelin kaplamadır: kaplamalı yerlerden iyon geçemez. Uyartı yalnızca kaplamanın kesildiği Ranvier boğumlarında oluşur ve boğumdan boğuma atlar.',
    },
    orantili: {
      ad: 'Güçlü uyarının daha büyük uyartı oluşturduğunu sanmak',
      anlat: 'Ya hep ya hiç: eşik geçilmezse uyartı hiç oluşmaz, geçilirse tam oluşur. Uyarıyı güçlendirmek uyartının büyüklüğünü değiştirmez.',
      ornek: 'Işık düğmesi: ya açık ya kapalı.',
    },
    elektrik: {
      ad: 'Elektriğin sinaps boşluğunu geçtiğini sanmak',
      anlat: 'İki nöron birbirine değmez; elektrik boşluktan atlayamaz. Boşluğu, akson ucundaki keseciklerden salınan nörotransmitter geçer.',
    },
    sinapsHiz: {
      ad: 'Sinapsın iletimi hızlandırdığını sanmak',
      anlat: 'Hızlandıran miyelindir. Sinapsta iletim kimyasaldır ve yavaşlar; yolda ne kadar çok sinaps varsa tepki o kadar geç oluşur.',
    },
    kesecik: {
      ad: 'Tek yönlülüğün sebebini yanlış yerde aramak',
      anlat: 'Sinapsta iletim tek yönlüdür, çünkü nörotransmitter kesecikleri yalnızca akson ucunda, reseptörler ise sonraki nöronun dendritinde bulunur.',
    },
  },

  kartlar: [
    {
      id: 'ne', baslik: 'Nöron ne iş yapar?',
      giris: 'Telefonun cebinde titrer, elin cebine gider. Arada ne oldu? Derindeki bir alıcı uyarıldı, bilgi merkeze gitti, merkezden kasa bir komut geldi.',
      metin: [
        'Nöron sinir hücresi demek. Vücudun **kablosu** gibi düşün: bilgiyi bir yerden bir yere **elektrikle** taşır.',
        'Tepki hep aynı sırayla oluşur: uyaran → reseptör → duyu nöronu → beyin ya da omurilik (ara nöron) → motor nöron → kas ya da bez.',
      ],
      tablo: {
        ad: 'Nöron çeşitleri',
        bas: ['Nöron', 'Ne yapar?'],
        sat: [
          ['Duyu nöronu', 'Reseptörden merkeze bilgi taşır.'],
          ['Ara nöron', 'Beyin ve omurilikte bilgiyi değerlendirir.'],
          ['Motor nöron', 'Merkezden kas ya da beze komut götürür.'],
        ],
      },
      gorsel: { tip: 'sirala', ad: 'Tepkinin yolunu sırala', oge: ['Uyaran', 'Reseptör', 'Duyu nöronu', 'Ara nöron', 'Motor nöron', 'Kas ya da bez'] },
      kural: ['uyaran → reseptör → duyu nöronu → ara nöron → motor nöron → kas ya da bez'],
      baska: 'Bir okul düşün. Kapıdaki görevli (reseptör) gelen haberi alır ve bir öğrenciyle (duyu nöronu) müdüre yollar. Müdür (ara nöron) haberi değerlendirir, kararını başka bir öğrenciyle (motor nöron) işi yapacak kişiye (kas) gönderir. Haber hep aynı yönde ilerler.',
      soru: { s: 'Merkezden kasa komut götüren nöron hangisidir?', o: ['Duyu nöronu', 'Ara nöron', 'Motor nöron'], d: 2, y: ['tur', 'tur', null], neden: 'Motor nöron, merkezden kas ya da beze komut götürür. Duyu nöronu ise bilgiyi merkeze getirir.' },
    },
    {
      id: 'parca', baslik: 'Nöronun parçaları',
      giris: 'Bir kulaklık kablosuna bak: bir ucunda fiş, ortada kaplamalı uzun bir tel, öbür ucunda hoparlör. Nöron da böyle parçalardan oluşur ve her parçanın işi ayrıdır.',
      gorsel: { tip: 'noron' },
      metin: [
        '**Dendrit** girişteki antenlerdir, bilgiyi alır. **Hücre gövdesi** merkezdir, çekirdek buradadır. **Akson** uzun kablodur, bilgiyi taşır. **Miyelin kılıf** kablonun üstündeki kaplamadır. **Akson ucu** bilgiyi sonraki hücreye verir.',
        'Bilgi hep aynı yönde akar: dendrit → gövde → akson → akson ucu.',
      ],
      kural: ['dendrit → hücre gövdesi → akson → akson ucu'],
      baska: 'Nöronu bir ağaca benzet. Dallar (dendritler) dışarıdan geleni toplar, gövde hepsini bir araya getirir, uzun kök (akson) bunu uzağa taşır, kökün uçları (akson uçları) bir sonraki ağaca verir. Yön hiç değişmez: daldan köke.',
      soru: { s: 'Uyartıyı alan, "girişteki anten" görevi gören parça hangisidir?', o: ['Akson', 'Dendrit', 'Akson ucu'], d: 1, y: ['yon', null, 'yon'], neden: 'Dendrit uyartıyı alır. Akson uyartıyı taşır, akson ucu sonraki hücreye verir.' },
    },
    {
      id: 'uyarti', baslik: 'Uyartı nasıl oluşur?',
      giris: 'Bir pilin iki ucu arasında yük farkı vardır; bu fark sayesinde iş yapar. Nöronun zarı da küçük bir pil gibidir: içi ile dışı arasında yük farkı vardır.',
      gorsel: { tip: 'aksiyon' },
      metin: [
        'Hücrenin içinde ve dışında **iyon** denen, elektrik yüklü minik parçacıklar var. İki tanesi önemli: **Na⁺ (sodyum)** ve **K⁺ (potasyum)**. İkisi de artı yüklü ve hücrenin içiyle dışında eşit dağılmamış.',
        '**Polarizasyon (bekleme):** dışarıda çok Na⁺ var; bu yüzden dışı +, içi −. **Depolarizasyon (uyarı geldi):** kapılar açılır, Na⁺ içeri dalar, içerisi + olur. "De-" bozmak demek; uyartı tam olarak budur. **Repolarizasyon (eski hâle dönüş):** K⁺ dışarı çıkar, içerisi yine − olur. "Re-" yeniden demek.',
        'Sonra hücre enerji harcayarak (ATP) iyonları eski yerlerine taşır ve nöron yeni uyarıya hazır olur.',
      ],
      tablo: {
        ad: 'Üç aşama yan yana',
        bas: ['Aşama', 'Hangi iyon hareket eder?', 'Hücrenin içi'],
        sat: [
          ['Polarizasyon (bekleme)', 'Hareket yok; dışarıda çok Na⁺ var', '−'],
          ['Depolarizasyon', 'Na⁺ içeri girer', '+'],
          ['Repolarizasyon', 'K⁺ dışarı çıkar', '−'],
        ],
      },
      kural: ['Na girer, bozulur; K çıkar, düzelir.'],
      baska: 'Kapıları kapalı bir salon düşün: kalabalık dışarıda bekliyor (Na⁺ dışarıda). Kapı açılınca kalabalık içeri dalar ve salonun durumu bir anda değişir (depolarizasyon). Sonra arka kapıdan başka bir grup (K⁺) dışarı çıkar, salon eski dengesine döner (repolarizasyon). En sonda görevliler herkesi ilk yerine götürür; bu iş emek ister (ATP).',
      soru: { s: 'Repolarizasyon sırasında ne olur?', o: ['Na⁺ içeri girer, içerisi + olur', 'K⁺ dışarı çıkar, içerisi − olur', 'Na⁺ dışarı çıkar, içerisi + olur'], d: 1, y: ['karistir', null, 'karistir'], neden: 'K⁺ dışarı çıkar ve içerisi yine − olur. Na⁺ iyonunun içeri girmesi depolarizasyondur.' },
    },
    {
      id: 'iletim', baslik: 'Uyartı aksonda nasıl ilerler?',
      giris: 'Stadyumda dalga yapılırken kimse yerinden koşmaz: herkes sırayla kalkıp oturur, dalga tribün boyunca ilerler.',
      gorsel: { tip: 'iletim' },
      metin: [
        'Uyartı aksonda **stadyum dalgası** gibi ilerler: her nokta sırayla depolarize ve repolarize olur, dalga kablo boyunca akar.',
        '**Miyelin neden hızlandırır?** Kaplamalı yerlerden iyon geçemez; olay yalnızca aradaki boşluklarda, yani **Ranvier boğumlarında** olur. Uyartı boğumdan boğuma **atlar**. Bu yüzden miyelinli nöron çok daha hızlı iletir.',
      ],
      kural: ['Miyelinli aksonda uyartı Ranvier boğumlarından atlayarak ilerler: iletim hızlanır.'],
      baska: 'Bir dereyi geçmenin iki yolu var: ya suyun içinde adım adım yürürsün ya da taşların üstünden atlarsın. Miyelinsiz aksonda uyartı her noktaya tek tek uğrar. Miyelinli aksonda yalnızca boğumlara basar, aradaki kaplamalı kısımları atlar.',
      soru: { s: 'Miyelinli bir aksonda uyartı nerede oluşur?', o: ['Yalnızca Ranvier boğumlarında', 'Miyelin kılıfın üstünde', 'Aksonun her noktasında'], d: 0, y: [null, 'miyelin', 'miyelin'], neden: 'Kaplamalı yerlerden iyon geçemez; uyartı yalnızca boğumlarda oluşur ve boğumdan boğuma atlar.' },
    },
    {
      id: 'hep', baslik: 'Ya hep ya hiç',
      giris: 'Bir ışık düğmesine hafifçe dokunursan lamba yanmaz. Yeterince bastığında yanar; daha sert basmak lambayı daha parlak yapmaz.',
      gorsel: { tip: 'esik' },
      metin: [
        'Nöron da böyle çalışır. Uyarı **eşik değeri** geçmezse uyartı hiç oluşmaz. Geçerse tam oluşur.',
        'Uyarıyı daha da güçlendirmek uyartıyı büyütmez. Buna **ya hep ya hiç kuralı** denir.',
      ],
      kural: ['Eşiğin altında: uyartı yok.', 'Eşiğin üstünde: uyartı tam; uyarı güçlense de büyümez.'],
      baska: 'Bir domino taşını düşün. Hafifçe dokunursan devrilmez; yeterince itersen devrilir ve sıra aynı biçimde ilerler. Taşı daha sert itmek taşların "daha çok" devrilmesini sağlamaz: ya devrilir ya devrilmez.',
      soru: { s: 'Eşik değerin altında kalan bir uyarı nöronda ne oluşturur?', o: ['Küçük bir uyartı', 'Hiç uyartı oluşturmaz', 'Yavaş ilerleyen bir uyartı'], d: 1, y: ['orantili', null, 'orantili'], neden: 'Uyarı eşik değeri geçmezse uyartı hiç oluşmaz. Uyartının küçüğü ya da yarımı olmaz.' },
    },
    {
      id: 'sinaps', baslik: 'Sinaps: boşluğu ne geçer?',
      giris: 'İki nöron birbirine değmez; aralarında minicik bir boşluk vardır. Elektrik bu boşluktan atlayamaz. Peki bilgi karşıya nasıl geçer?',
      gorsel: { tip: 'sinaps' },
      metin: [
        'Bu boşluğa **sinaps** denir. Geçiş üç adımda olur: uyartı akson ucuna ulaşır; akson ucundaki keseciklerden **nörotransmitter** (kimyasal ileti maddesi) boşluğa salınır; bu madde sonraki nöronun dendritindeki reseptörlere bağlanır ve orada yeni uyartı başlar.',
        'Demek ki nöronun içinde iletim **elektriksel**, sinapsta **kimyasaldır**.',
      ],
      kural: ['Nöronun içinde: elektriksel iletim', 'Sinapsta: kimyasal iletim (nörotransmitter)'],
      baska: 'Köprüsü olmayan bir nehir düşün. Bu yakaya gelen kurye (uyartı) karşıya geçemez; mektubu bir kayığa (nörotransmitter) koyar. Kayık karşı iskeleye (reseptör) yanaşınca oradan yeni bir kurye yola çıkar. Kayıklar yalnızca bu yakada durduğu için mektup hep aynı yöne gider.',
      soru: { s: 'Sinaps boşluğunu geçen şey nedir?', o: ['Elektrik akımı', 'Nörotransmitter', 'Miyelin kılıf'], d: 1, y: ['elektrik', null, null], neden: 'Elektrik boşluktan atlayamaz. Akson ucundaki keseciklerden salınan nörotransmitter karşıya geçer ve reseptörlere bağlanır.' },
    },
    {
      id: 'sinav', baslik: 'Sınavda sorulanlar',
      giris: 'Bu konudan gelen soruların çoğu üç cümleye dayanır. Üçünü de az önce şekillerde gördün; şimdi yan yana koy.',
      metin: [
        'Nöronun içinde iletim **elektriksel**, sinapsta **kimyasaldır**.',
        'Sinapsta iletim **tek yönlüdür**, çünkü kesecikler yalnızca akson ucunda vardır.',
        'Sinapsta iletim **yavaşlar**. Yolda ne kadar çok sinaps varsa tepki o kadar geç oluşur.',
      ],
      tablo: {
        bas: ['', 'Nöronun içinde', 'Sinapsta'],
        sat: [
          ['İletim türü', 'Elektriksel', 'Kimyasal'],
          ['Yön', 'Dendritten akson ucuna', 'Yalnızca akson ucundan dendrite'],
          ['Hız', 'Miyelin varsa çok daha hızlı', 'Yavaşlar'],
        ],
      },
      gorsel: {
        tip: 'grupla', ad: 'Nöronun içinde mi, sinapsta mı?', kutu: ['Nöronun içinde', 'Sinapsta'],
        oge: [['Elektriksel iletim', 0], ['Kimyasal iletim', 1], ['Nörotransmitter salınır', 1], ['Na⁺ içeri girer, K⁺ dışarı çıkar', 0], ['İletim yavaşlar', 1], ['Boğumdan boğuma atlama', 0]],
      },
      kural: ['Sinaps: kimyasal, tek yönlü, yavaş.'],
      baska: 'Bir bayrak yarışı düşün. Koşucu pistte hızla koşar (nöronun içi); bayrağı verirken yavaşlar (sinaps). Bayrak hep koşandan bekleyene geçer, tersine geçmez. Yarışta ne kadar çok bayrak değişimi varsa toplam süre o kadar uzar.',
      soru: { s: 'Bir tepkinin yolunda sinaps sayısı artarsa ne olur?', o: ['Tepki daha geç oluşur', 'Tepki daha erken oluşur', 'Tepkinin süresi değişmez'], d: 0, y: [null, 'sinapsHiz', 'sinapsHiz'], neden: 'Sinapsta iletim yavaşlar. Yolda ne kadar çok sinaps varsa tepki o kadar geç oluşur.' },
    },
  ],

  ozet: [
    'Tepkinin yolu: uyaran → reseptör → duyu nöronu → ara nöron → motor nöron → kas ya da bez.',
    'Nöronda bilgi hep aynı yönde akar: dendrit → gövde → akson → akson ucu.',
    'Na girer, bozulur (depolarizasyon); K çıkar, düzelir (repolarizasyon). Sonra iyonlar ATP harcanarak eski yerine taşınır.',
    'Miyelinli aksonda uyartı Ranvier boğumlarından atlar; iletim çok daha hızlıdır.',
    'Ya hep ya hiç: eşik geçilmezse uyartı yok, geçilirse tam.',
    'Sinapsta iletim kimyasaldır, tek yönlüdür ve yavaşlar.',
  ],

  sorular: [
    {
      id: 's1', z: 1, kart: 'parca',
      s: 'Bir nöronda uyartının izlediği yol hangisidir?',
      o: ['Akson → hücre gövdesi → dendrit', 'Dendrit → hücre gövdesi → akson → akson ucu', 'Hücre gövdesi → dendrit → akson', 'Akson ucu → akson → dendrit', 'Dendrit → akson → hücre gövdesi → akson ucu'],
      d: 1, y: ['yon', null, 'yon', 'yon', 'yon'],
      c: ['Dendrit uyartıyı alır: yol dendritte başlar.', 'Uyartı hücre gövdesinden geçer ve akson boyunca iletilir.', 'Akson ucunda sinapsa aktarılır: dendrit → hücre gövdesi → akson → akson ucu.'],
      kay: `${DOSYA}, 1. soru (beşinci seçenek eklendi)`,
    },
    {
      id: 's2', z: 1, kart: 'uyarti',
      s: 'Depolarizasyon sırasında ne olur?',
      o: ['K⁺ dışarı çıkar, içerisi − olur', 'Na⁺ dışarı çıkar, içerisi − olur', 'Hiçbir iyon hareket etmez', 'Na⁺ içeri girer, içerisi + olur', 'K⁺ içeri girer, içerisi + olur'],
      d: 3, y: ['karistir', 'karistir', null, null, 'karistir'],
      ip: 'Na girer, bozulur.',
      c: ['"De-" bozmak demek: bekleyen düzen bozulur.', 'Uyarı gelince kapılar açılır ve Na⁺ içeri girer; zarın içi + yüklü olur.', 'K⁺ iyonunun dışarı çıkması bir sonraki aşamadır: repolarizasyon.'],
      kay: `${DOSYA}, 2. soru (beşinci seçenek eklendi)`,
    },
    {
      id: 's3', z: 2, kart: 'iletim',
      s: 'Miyelinli nöronların miyelinsiz nöronlardan daha hızlı iletim yapmasının sebebi nedir?',
      o: ['Uyartı Ranvier boğumlarından atlayarak ilerlediği için', 'Daha çok dendritleri olduğu için', 'Sinapsları olmadığı için', 'Hücre gövdeleri büyük olduğu için', 'Uyartı miyelin kılıfın üzerinden aktığı için'],
      d: 0, y: [null, null, null, null, 'miyelin'],
      c: ['Miyelin kılıf yalıtır: kaplamalı yerlerden iyon geçemez.', 'Uyartı yalnızca kaplamanın kesildiği Ranvier boğumlarında oluşur.', 'Boğumdan boğuma sıçradığı için iletim hızlanır.'],
      kay: `${DOSYA}, 3. soru (beşinci seçenek eklendi)`,
    },
    {
      id: 's4', z: 2, kart: 'sinav',
      s: 'Sinapsta iletimin tek yönlü olmasının sebebi nedir?',
      o: ['Dendritler elektrik iletemez', 'Sinaps boşluğunda miyelin vardır', 'Na⁺ yalnızca bir yöne hareket eder', 'Elektrik boşluğu yalnızca bir yönde geçebilir', 'Nörotransmitter kesecikleri yalnızca akson ucunda bulunur'],
      d: 4, y: ['kesecik', 'kesecik', 'kesecik', 'elektrik', null],
      c: ['Kimyasal ileti maddesini salan kesecikler yalnızca akson ucundadır.', 'Reseptörler ise sonraki nöronun dendritindedir.', 'Bu yüzden ileti hep akson ucundan dendrite gider; tersi olamaz.'],
      kay: `${DOSYA}, 4. soru (beşinci seçenek eklendi)`,
    },
    {
      id: 's5', z: 2, kart: 'hep',
      s: 'Eşik değerin üzerindeki bir uyarının şiddeti iki katına çıkarılırsa nörondaki uyartı nasıl etkilenir?',
      o: ['Uyartı iki kat büyür', 'Uyartı oluşmaz', 'Uyartının büyüklüğü değişmez', 'Uyartı ters yöne gider', 'Uyartı yarıya iner'],
      d: 2, y: ['orantili', null, null, null, 'orantili'],
      ip: 'Ya hep ya hiç.',
      c: ['Uyarı zaten eşiğin üzerinde: uyartı tam oluşmuş durumda.', 'Ya hep ya hiç kuralı: uyarıyı güçlendirmek uyartının büyüklüğünü değiştirmez.'],
      kay: `${DOSYA}, 5. soru (beşinci seçenek eklendi)`,
    },
    {
      id: 's6', z: 1, kart: 'ne',
      s: 'Bir tepkinin oluşma sırasında ara nörondan hemen sonra hangisi gelir?',
      o: ['Motor nöron', 'Reseptör', 'Duyu nöronu', 'Kas ya da bez', 'Uyaran'],
      d: 0, y: [null, null, 'tur', 'tur', null],
      ip: 'Sırayı baştan say: uyaran, reseptör…',
      c: ['Sıra: uyaran → reseptör → duyu nöronu → ara nöron → motor nöron → kas ya da bez.', 'Ara nöron beyin ve omurilikte bilgiyi değerlendirir; ardından komutu motor nöron götürür.'],
      kay: `${DOSYA}, "Nöron ne?" notundaki sıraya göre yazıldı`,
    },
    {
      id: 's7', z: 2, kart: 'sinaps',
      s: 'Akson ucuna ulaşan uyartı sonraki nörona nasıl aktarılır?',
      o: ['Elektrik boşluktan atlayarak geçer', 'Akson ucu sonraki nöronun dendritine değer', 'Miyelin kılıf uyartıyı karşıya taşır', 'Keseciklerden salınan nörotransmitter reseptörlere bağlanır', 'Na⁺ iyonları boşluğu geçip sonraki nörona girer'],
      d: 3, y: ['elektrik', 'elektrik', null, null, 'elektrik'],
      c: ['İki nöron birbirine değmez; elektrik sinaps boşluğundan atlayamaz.', 'Uyartı akson ucuna ulaşınca keseciklerden nörotransmitter boşluğa salınır.', 'Bu madde sonraki nöronun dendritindeki reseptörlere bağlanır ve orada yeni uyartı başlar.'],
      kay: `${DOSYA}, "Sinaps" notundaki üç adıma göre yazıldı`,
    },
    {
      id: 's8', z: 3, kart: 'sinav',
      b: ['İki tepki yolu karşılaştırılıyor. Birinci yolda 2, ikinci yolda 5 sinaps var. Öteki koşullar aynı.'],
      s: 'Buna göre hangi yorum doğrudur?',
      o: ['İkinci yolda tepki daha erken oluşur', 'İkinci yolda tepki daha geç oluşur', 'İki yolda tepki aynı anda oluşur', 'İkinci yolda uyartı daha büyük olur', 'İkinci yolda iletim sinapslarda elektrikseldir'],
      d: 1, y: ['sinapsHiz', null, 'sinapsHiz', 'orantili', 'elektrik'],
      c: ['Sinapsta iletim kimyasaldır ve yavaşlar.', 'Yolda ne kadar çok sinaps varsa tepki o kadar geç oluşur: 5 sinapslı yolda tepki daha geç oluşur.'],
      kay: `${DOSYA}, "Sınavda sorulanlar" notuna göre yazıldı`,
    },
  ],
};
export default k;
