import type { Konu } from './tip';

const k: Konu = {
  id: 'tr-yazim', ad: 'Yazım Kuralları', dk: 20,
  giris: 'Sınavda en sık çıkan dört başlık: de ile ki\'nin yazımı, soru eki, büyük harfler ve kesme işareti.',
  yan: {
    baglac: {
      ad: 'Bağlaç olan "de"yi bitişik yazmak',
      anlat: '"Dahi, bile" anlamı katan de/da bağlaçtır ve her zaman ayrı yazılır. Cümleden çıkarıldığında cümle bozulmaz. Bağlaç olan de hiçbir zaman "te, ta" biçimine girmez.',
      ornek: '"Sen de gel." cümlesinden de çıkarılınca "Sen gel." kalır; cümle bozulmaz, o hâlde ayrı yazılır.',
    },
    ek: {
      ad: 'Ek olan "-de"yi ayrı yazmak',
      anlat: 'Yer ya da zaman bildiren -de/-da ektir ve bitişik yazılır. Çıkarıldığında cümle bozulur.',
      ornek: '"Evde kaldım." cümlesinden -de çıkarılınca "Ev kaldım." olur; bozulur, o hâlde bitişik yazılır.',
    },
    ki: {
      ad: 'Bağlaç olan "ki" ile ek olan "-ki"yi karıştırmak',
      anlat: 'Bağlaç olan ki ayrı yazılır. Sıfat yapan ve zamir olan -ki bitişik yazılır; arkasına -ler getirilebiliyorsa ektir. Kalıplaşmış birkaç sözcük de bitişiktir: sanki, oysaki, mademki, belki, hâlbuki, çünkü, meğerki.',
      ornek: '"Evdeki" sözcüğü "evdekiler" olabilir: ek, bitişik. "Duydum ki" için "duydum kiler" denmez: bağlaç, ayrı.',
    },
    mi: {
      ad: 'Soru ekini bitişik yazmak',
      anlat: 'Soru eki mı, mi, mu, mü kendinden önceki sözcükten her zaman ayrı yazılır. Kendinden sonra gelen ekler ise ona bitişir.',
      ornek: '"Gelecek misin?" doğrudur; "Gelecekmisin?" yanlıştır.',
    },
    tarih: {
      ad: 'Tarih bildirmeyen ay ve gün adını büyük yazmak',
      anlat: 'Ay ve gün adları yalnızca belirli bir tarihi gösterdiklerinde büyük harfle başlar. Yanlarında gün sayısı ya da yıl yoksa küçük yazılırlar.',
      ornek: '"29 Ekim 1923 Pazartesi" büyük; "ekim ayında", "her pazartesi" küçük yazılır.',
    },
    yon: {
      ad: 'Yön adlarının yazımını karıştırmak',
      anlat: 'Yön adı özel addan önce gelip onunla birlikte bir bölgeyi adlandırıyorsa büyük yazılır. Özel addan sonra gelirse küçük yazılır.',
      ornek: '"Doğu Anadolu" büyük; "Anadolu\'nun doğusu" küçük yazılır.',
    },
    kesme: {
      ad: 'Kesme işaretinin yerini karıştırmak',
      anlat: 'Özel adlara gelen çekim ekleri kesmeyle ayrılır. Yapım ekleri ve onlardan sonra gelen ekler ayrılmaz.',
      ornek: '"Ankara\'ya" doğru; "Ankara\'lı" yanlış, doğrusu "Ankaralı". "Türkçeyi" de kesmesiz yazılır.',
    },
    kurum: {
      ad: 'Kurum adına gelen eki kesmeyle ayırmak',
      anlat: 'Kurum, kuruluş ve kurul adlarına gelen ekler kesmeyle ayrılmaz.',
      ornek: '"Türk Dil Kurumunun" doğru; "Türk Dil Kurumu\'nun" yanlıştır.',
    },
    hersey: {
      ad: 'Ayrı ve bitişik yazılan kalıpları karıştırmak',
      anlat: '"Şey" sözcüğü her zaman ayrı yazılır: her şey, bir şey. "Birkaç, birçok, hiçbir, herhangi" bitişik; "pek çok, ya da" ayrı yazılır.',
      ornek: '"Hiçbir şey" yazımında hiçbir bitişik, şey ayrıdır.',
    },
  },
  kartlar: [
    {
      id: 'dede', baslik: '"de" ne zaman ayrı yazılır?',
      metin: [
        'Türkçede iki ayrı "de" vardır. Biri bağlaçtır: "dahi, bile" anlamı katar ve ayrı yazılır. Öbürü ektir: yer ya da zaman bildirir ve bitişik yazılır.',
        'Ayırmak için "de"yi cümleden çıkar. Cümle bozulmuyorsa bağlaçtır. Bağlaç olan de hiçbir zaman "te, ta" olmaz; "Kitap ta aldım." yanlıştır, doğrusu "Kitap da aldım."',
      ],
      kural: ['Çıkarınca cümle bozulmuyorsa: bağlaç, ayrı yaz', 'Çıkarınca cümle bozuluyorsa: ek, bitişik yaz'],
      ornek: { s: '"Bu akşam bizde kal, kardeşin de gelsin." cümlesindeki iki "de" nasıl yazılmış?', a: ['"bizde": çıkarınca "Bu akşam biz kal" olur, bozulur. Ek, bitişik.', '"kardeşin de": çıkarınca "kardeşin gelsin" olur, bozulmaz. Bağlaç, ayrı.', 'İkisi de doğru yazılmış.'] },
      baska: 'Bir başka deneme: "de"nin yerine "bile" koy. "Ben de geldim" yerine "Ben bile geldim" denebiliyor; bağlaç, ayrı yazılır. "Evde kaldım" yerine "Ev bile kaldım" denemiyor; ek, bitişik yazılır.',
      soru: { s: '"Okulda sen de vardın." cümlesinde ayrı yazılan "de" için hangisi doğrudur?', o: ['Yer bildiren ektir', 'Bağlaçtır, doğru yazılmıştır', 'Yanlış yazılmıştır, bitişik olmalıdır'], d: 1, y: ['ek', null, 'baglac'], neden: '"Okulda sen vardın." cümlesi bozulmuyor; bağlaçtır ve ayrı yazılır.' },
    },
    {
      id: 'kimi', baslik: '"ki" ve soru eki "mi"',
      metin: [
        'Bağlaç olan ki ayrı yazılır: "Öyle yoruldum ki anlatamam." Sıfat yapan -ki ile zamir olan -ki bitişik yazılır: "evdeki hesap", "benimki".',
        'Soru eki mı, mi, mu, mü her zaman ayrı yazılır; ardından gelen ekler ona bitişir: "Geldin mi?", "Gelecek misin?", "Güzel miydi?"',
      ],
      kural: ['Arkasına -ler geliyorsa (evdekiler): ek, bitişik', 'Gelmiyorsa: bağlaç, ayrı', 'Soru eki her zaman ayrı'],
      ornek: { s: '"Bahçedeki çiçekler öyle güzel ki bakmaya doyamadım." cümlesindeki iki "ki" nasıl yazılmış?', a: ['"bahçedeki": "bahçedekiler" denebiliyor. Ek, bitişik.', '"güzel ki": "güzel kiler" denemiyor. Bağlaç, ayrı.', 'İkisi de doğru yazılmış.'] },
      baska: 'Bitişik yazılan kalıplaşmış yedi sözcüğün baş harfleri "SOMBaHÇeM" eder: Sanki, Oysaki, Mademki, Belki, Hâlbuki, Çünkü, Meğerki. Bunların dışında bağlaç olan ki ayrı yazılır.',
      soru: { s: 'Aşağıdakilerin hangisinde yazım yanlışı vardır?', o: ['Sen de mi geldin?', 'Öyle yoruldum ki anlatamam.', 'Bahçede ki çiçekler açmış.'], d: 2, y: ['mi', 'ki', null], neden: '"Bahçedeki" sıfat yapan -ki almıştır; bitişik yazılır.' },
    },
    {
      id: 'buyuk', baslik: 'Büyük harflerin kullanımı',
      metin: [
        'Özel adlar, dil ve millet adları, kurum adları büyük harfle başlar: Türkçe, İngiliz, Türk Dil Kurumu.',
        'Ay ve gün adları yalnızca belirli bir tarihi gösterdiklerinde büyük yazılır. Yön adları ise özel addan önce geldiklerinde büyük, sonra geldiklerinde küçük yazılır.',
      ],
      kural: ['29 Ekim 1923 Pazartesi  ama  ekim ayında, her pazartesi', 'Doğu Anadolu  ama  Anadolu\'nun doğusu'],
      ornek: { s: '"Okullar 14 Eylül 2026 Pazartesi günü açılacak; her eylül olduğu gibi heyecanlıyız." cümlesi doğru yazılmış mı?', a: ['"14 Eylül 2026 Pazartesi" belirli bir tarih: büyük, doğru.', '"her eylül" herhangi bir eylül: küçük, doğru.', 'Cümlede yazım yanlışı yok.'] },
      baska: 'Kendine şunu sor: "Bu, takvimde tek bir gün mü?" "5 Mayıs 2025 Pazartesi" takvimde tek bir gündür, büyük yazılır. "Pazartesi günleri" ise yılda elli iki ayrı gündür, küçük yazılır.',
      soru: { s: 'Aşağıdakilerin hangisinin yazımı doğrudur?', o: ['Okullar Eylül ayında açılacak.', 'Toplantı 12 Mart 2026 Perşembe günü yapılacak.', 'Türkiye\'nin Batısı daha ılımandır.'], d: 1, y: ['tarih', null, 'yon'], neden: 'Gün ve yıl verildiği için belirli bir tarihtir; ay ve gün adı büyük yazılır.' },
    },
    {
      id: 'kesme', baslik: 'Kesme işareti ve sık karıştırılan sözcükler',
      metin: [
        'Özel adlara gelen çekim ekleri kesmeyle ayrılır: Ankara\'ya, Ayşe\'nin, 1923\'te. Yapım ekleri ve onlardan sonra gelen ekler ayrılmaz: Ankaralı, Türkçenin. Kurum adlarına gelen ekler de kesmeyle ayrılmaz: Türk Dil Kurumunun.',
        '"Şey" her zaman ayrı yazılır: her şey, bir şey. "Birkaç, birçok, hiçbir, herhangi" bitişik yazılır. Birden çok sözcükten oluşan sayılar ayrı yazılır: on beş, yüz elli.',
      ],
      kural: ['Ankara\'ya  ama  Ankaralı', 'her şey, bir şey  ama  birkaç, hiçbir', 'on beş, otuz iki'],
      ornek: { s: '"Türk Dil Kurumunun sözlüğünde hiçbir şey bulamadım." cümlesi doğru yazılmış mı?', a: ['"Kurumunun": kurum adına gelen ek kesmeyle ayrılmaz, doğru.', '"hiçbir": bitişik, doğru.', '"şey": ayrı, doğru.', 'Cümlede yazım yanlışı yok.'] },
      baska: 'Kesme için tek soru: ek, özel adı başka bir sözcüğe çeviriyor mu? "Ankaralı" artık bir şehir değil, bir kişidir; yeni bir sözcük oluştu, kesme konmaz. "Ankara\'ya" derken şehir hâlâ aynı şehirdir; kesme konur.',
      soru: { s: 'Aşağıdakilerin hangisinin yazımı doğrudur?', o: ['Türk Dil Kurumu\'nun sitesine baktım.', 'Herşey yolunda.', 'Ankara\'dan birkaç kişi geldi.'], d: 2, y: ['kurum', 'hersey', null], neden: '"Ankara\'dan" özel ada gelen çekim ekidir, "birkaç" bitişik yazılır.' },
    },
  ],
  ozet: [
    'Bağlaç olan de/da ayrı yazılır; çıkarınca cümle bozulmaz. Ek olan -de/-da bitişik yazılır.',
    'Bağlaç olan ki ayrı; sıfat yapan ve zamir olan -ki bitişik. Bitişik kalıplar: sanki, oysaki, mademki, belki, hâlbuki, çünkü, meğerki.',
    'Soru eki mı, mi, mu, mü her zaman ayrı yazılır.',
    'Ay ve gün adları yalnızca belirli bir tarihte büyük yazılır.',
    'Yön adı özel addan önce büyük (Doğu Anadolu), sonra küçük (Anadolu\'nun doğusu).',
    'Özel ada gelen çekim eki kesmeyle ayrılır; yapım eki ve kurum adına gelen ek ayrılmaz.',
    'her şey, bir şey ayrı; birkaç, birçok, hiçbir bitişik; on beş ayrı.',
  ],
  sorular: [
    {
      id: 's1', z: 1, kart: 'dede', s: 'Aşağıdaki cümlelerin hangisinde "de"nin yazımı yanlıştır?',
      o: ['Bu konuyu ben de bilmiyorum.', 'Kitabı masanın üstünde unutmuş.', 'Sende mi bizimle geliyorsun?', 'Akşam evde olacağım.', 'Gitsek de olur, gitmesek de.'],
      d: 2, y: ['baglac', 'ek', null, 'ek', 'baglac'],
      c: ['Her cümlede "de"yi çıkarıp cümlenin bozulup bozulmadığına bak.', 'C seçeneği: "Sen mi bizimle geliyorsun?" cümlesi bozulmuyor; bu de bağlaçtır.', 'Bağlaç ayrı yazılır: "Sen de mi bizimle geliyorsun?"'],
    },
    {
      id: 's2', z: 1, kart: 'kimi', s: 'Aşağıdaki cümlelerin hangisinde "ki"nin yazımı yanlıştır?',
      o: ['Bahçedeki ağaçlar çiçek açmış.', 'Öyle bir yağmur yağdı ki sokaklar göle döndü.', 'Seninki benimkinden daha yeni.', 'Duydumki sınavı kazanmışsın.', 'Mademki geldin, biraz otur.'],
      d: 3, y: ['ki', 'ki', 'ki', null, 'ki'],
      c: ['Arkasına -ler getirmeyi dene: "bahçedekiler", "seninkiler" olur; bunlar ektir, bitişik yazılır.', '"Duydum ki": "duydum kiler" olmaz; bağlaçtır.', 'Bağlaç ayrı yazılır: "Duydum ki sınavı kazanmışsın."', '"Mademki" kalıplaşmış sözcüklerdendir, bitişik yazılır.'],
    },
    {
      id: 's3', z: 1, kart: 'kimi', s: 'Aşağıdaki cümlelerin hangisinde yazım yanlışı vardır?',
      o: ['Sen de mi geldin?', 'Yarın bize gelecekmisin?', 'Güzel mi güzel bir evdi.', 'Bunu sen mi yaptın?', 'Hava soğuk muydu?'],
      d: 1, y: ['mi', null, 'mi', 'mi', 'mi'],
      c: ['Soru eki her zaman kendinden önceki sözcükten ayrı yazılır.', 'Kendinden sonra gelen ekler ona bitişir.', 'Doğrusu: "Yarın bize gelecek misin?"'],
    },
    {
      id: 's4', z: 2, kart: 'buyuk', s: 'Aşağıdaki cümlelerin hangisinde büyük harflerin kullanımıyla ilgili bir yanlışlık vardır?',
      o: ['Sınav 14 Haziran 2026 Pazar günü yapılacak.', 'Her yıl Ağustos ayında köye gideriz.', 'Güneydoğu Anadolu\'da yazlar sıcak geçer.', 'Bu yaz Ege\'nin kuzeyini gezeceğiz.', 'Türkçe dersinden yüksek not aldı.'],
      d: 1, y: ['tarih', null, 'yon', 'yon', null],
      c: ['A: gün ve yıl verilmiş, belirli bir tarih; büyük yazım doğru.', 'B: "her yıl ağustos ayında" belirli bir tarih değil; ay adı küçük yazılmalı.', 'C ve D: yön adı özel addan önce büyük, sonra küçük; ikisi de doğru.', 'Yanlış olan B: "Her yıl ağustos ayında köye gideriz."'],
    },
    {
      id: 's5', z: 2, kart: 'kesme', s: 'Aşağıdaki cümlelerin hangisinde kesme işareti yanlış kullanılmıştır?',
      o: ['Ayşe\'nin kitabı bende kaldı.', 'Yarın İzmir\'e gidiyoruz.', 'Toplantıya Ankara\'lı iki öğretmen katıldı.', '1923\'te Cumhuriyet ilan edildi.', 'TDK\'nin sözlüğüne baktım.'],
      d: 2, y: ['kesme', 'kesme', null, null, null],
      c: ['Özel adlara gelen çekim ekleri kesmeyle ayrılır: Ayşe\'nin, İzmir\'e.', '"-lı" bir yapım ekidir; yeni bir sözcük oluşturur.', 'Yapım ekleri kesmeyle ayrılmaz: "Ankaralı".'],
    },
    {
      id: 's6', z: 2, kart: 'kesme', s: 'Aşağıdaki cümlelerin hangisinde yazım yanlışı vardır?',
      o: ['Bugün her şey yolunda gitti.', 'Birkaç gün sonra görüşürüz.', 'Bu konuda hiç bir fikrim yok.', 'Sana bir şey söyleyeceğim.', 'Pek çok kişi konsere geldi.'],
      d: 2, y: ['hersey', 'hersey', null, 'hersey', 'hersey'],
      c: ['"Şey" her zaman ayrı yazılır: her şey, bir şey.', '"Birkaç" bitişik, "pek çok" ayrı yazılır.', '"Hiçbir" bitişik yazılır; C seçeneğinde ayrı yazılmış.'],
    },
    {
      id: 's7', z: 3, kart: 'kesme', s: 'Aşağıdaki cümlelerin hangisinde yazım yanlışı yoktur?',
      o: ['Türk Dil Kurumu\'nun yeni sözlüğü yayımlandı.', 'Okulun önündeki parkta buluşalım, sen de gel.', 'Yarınki maça sende gelir misin?', 'Herkez bu habere çok sevindi.', 'Kardeşim bu yıl onbeş yaşına girdi.'],
      d: 1, y: ['kurum', null, 'baglac', null, null],
      c: ['A: kurum adına gelen ek kesmeyle ayrılmaz; doğrusu "Kurumunun".', 'C: "sen de" bağlaçtır, ayrı yazılır.', 'D: doğrusu "herkes".   E: doğrusu "on beş".', 'B: "önündeki" ek, bitişik; "sen de" bağlaç, ayrı. Yanlış yok.'],
    },
    {
      id: 's8', z: 3, kart: 'buyuk', s: '"Geçen Salı günü (I) Doğu Anadolu\'ya (II) gittik. Oradaki (III) insanlar Türkçeyi (IV) çok güzel konuşuyordu; öyle ki (V) hayran kaldık." Numaralanmış sözlerin hangisinde yazım yanlışı vardır?',
      o: ['I', 'II', 'III', 'IV', 'V'], d: 0, y: [null, 'yon', 'ki', 'kesme', 'ki'],
      c: ['I: "geçen salı günü" belirli bir tarih değil; gün adı küçük yazılmalı.', 'II: yön adı özel addan önce, büyük; doğru.', 'III: "oradakiler" denebiliyor; ek, bitişik; doğru.', 'IV: "-çe" yapım ekidir, sonrasına kesme konmaz; doğru.', 'V: "öyle ki" bağlaçtır, ayrı; doğru. Yanlış olan I.'],
    },
  ],
};
export default k;
