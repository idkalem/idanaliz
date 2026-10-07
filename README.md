# İD Okul

Ders çalışma portalı: konu anlatımı, kavrama testi, yanlışlara göre tekrar, yazılı provası, kişisel program ve rapor.
Konular Türkiye Yüzyılı Maarif Modeli öğretim programına ve MEB kaynaklarına göre yazılır.
İD ailesinin bir parçası (İD Kalem, İD Analiz, İD Okul).

## Çalıştırmak

Klasördeki **`İD Okul.html`** dosyasına çift tıkla. Kurulum gerekmez; yapay zekâ öğretmen dışında internet de gerekmez.

İlk açılışta giriş ekranı gelir. "Yeni hesap" ile kendi hesabını aç ya da nasıl göründüğünü denemek için
"Örnek sınıfı yükle"ye dokun (12 öğrenci ve bir öğretmen; hepsinin şifresi `1234`).

Tanıtım ve deneme için adres çubuğu kısayolları:

| Adresin sonuna ekle | Ne yapar |
| --- | --- |
| `?demo=1` | Örnek sınıfı yükler, örnek öğrenciyle (Deniz) girer |
| `?demo=ogretmen` | Örnek sınıfı yükler, öğretmen ekranını açar |
| `?demo=giris` | Örnek sınıfı yükler, giriş ekranında kalır |
| `?tema=koyu` ya da `?tema=acik` | Temayı seçer |
| `?anim=0` | Hareketleri kapatır (ekran görüntüsü için) |

## v0.3: Maarif Modeli'ne göre içerik

Bir konu artık şöyle kurulur: **yaklaşık 17 dakika anlatım + 13 dakika kavrama testi = 30 dakika**, isteyene yazılı provası.

- **Öğrenme çıktıları.** Dersler ekranında 9, 10 ve 11. sınıf sekmeleri var. Türk Dili ve Edebiyatı, Matematik, Fizik, Kimya ve Biyoloji için
  MEB'in 2026-2027 1. dönem konu soru dağılım tabloları uygulamaya aktarıldı (149 öğrenme çıktısı). Her çıktının yanında yazılıda
  kaç soru geleceği yazar. Tablo `src/content/mufredat.ts` dosyasındadır ve elle yazılmaz, MEB'in Excel dosyalarından üretilir.
- **Kaynağa dayalı konu.** Konu sayfasının başında "Bu konu neye göre yazıldı?" kutusu durur: öğrenme çıktısı, öğretim programındaki
  süreç bileşenleri, ders kitabındaki yeri ve anlatımın izlediği sıra.
- **Anlatım kartı.** Ders kitabındaki bir durumla başlar, örüntüyü tabloda gösterir, kuralı verir, örnek çözer, bir kontrol sorusu sorar.
- **Soru türleri.** İşlem, bağlam temelli (durum ve tablo) ve muhakeme (önerme, "ilk hata hangi adımda"). Her soru beş seçeneklidir;
  yanlış seçenekler adı konmuş yanılgılara bağlıdır. Cevaplandıktan sonra sorunun neye göre yazıldığı görünür.
- **Yazılı provası.** Açık uçlu sorular kâğıtta çözülür; puanlama anahtarı açılır ve adımlar tek tek işaretlenir.
- **Kaynaklar sayfası.** Hangi resmî kaynağın nerede kullanıldığı, bağlantılarıyla.

Bu yöntemle yazılan konular: **Üslü Gösterim** ve **Köklü Gösterim** (9. sınıf, MAT.9.1.1). Mutlak Değer, Oran ve Orantı,
Yazım Kuralları ile Madde ve Özkütle önceki sürümden kalan TYT tekrarı konularıdır.

**Durum:** anlatımlar ve sorular kaynaklardaki sıra, durum ve soru tiplerine göre yapay zekâ desteğiyle yazıldı; ders kitabının
kopyası değildir. Henüz bir öğretmen incelemedi. Sınıfta kullanılmadan önce dersin öğretmeni gözden geçirmelidir.

Yeni bir konu yazarken: `src/content/tip.ts` içerik biçimini anlatır; `npm run build` içeriği denetler (cevap anahtarı, beş seçenek,
tablo hücreleri, puanlama anahtarı 10 puan, öğrenme çıktısı tabloda var mı). `npx tsx scripts/sayim.ts` konu konu sayım verir.

## Neler var (v0.2'den beri)

- **Hesaplar.** Her öğrencinin kendi hesabı, dört haneli şifresi ve avatarı var. Öğretmen hesabı ayrı bir ekran görür.
- **Yol haritası.** Her dersin konuları sırayla kıvrılan bir yolun durakları: bitti, sürüyor, sırada. Testi bitirince yıldız kazanılır.
- **Program.** Tekrar günü gelen yanlışlara, doğru oranı düşük konulara ve ödevlere göre yedi günlük plan. "5, 10, 20 dakikam var" kısa oturumları ve seviye taraması.
- **Yanlışlara göre tekrar.** Yanlış yapılan soru 1, 3, 7 ve 16 gün arayla yeniden sorulur; her yanlış seçenek hangi hatadan geldiğini söyler.
- **Rapor.** Doğru oranı, en sık yapılan hatalar, yanlışların türü (yanlış bilgi, eksik bilgi, dikkatsizlik) ve koç notu.
- **Günlük görevler, sandık, jeton.** Jetonla avatar parçası ve seri dondurma alınır. Sıralama çalışma puanını (XP) ölçer.
- **Yapay zekâ öğretmen.** Yanlış sorunun yanında, anlatım kartında ve kendi sayfasında. Cevabı hemen söylemez, ipucuyla ilerler. Soru fotoğrafı da gönderilebilir.
- **Öğretmen ekranı.** Konulara göre sınıf durumu, sınıfın ortak hataları, öğrenci özetleri ve ödev verme. Öğrenciler sıralanmaz; ada göre dizilir.

## Hesaplar ve veri

Hesaplar ve çalışma kaydı **yalnızca o cihazın tarayıcısında** durur. Başka bir tahtada aynı hesap görünmez;
bunun için bir sunucu gerekir ve henüz yok. Şifre güvenlik için değil, hesaplar karışmasın diyedir.
Bu depoda gerçek öğrenci verisi yoktur; örnek sınıftaki adlar uydurmadır.

## Yapay zekâ öğretmen

Profil > Yapay zekâ bölümüne bir Claude API anahtarı girilince açılır. Anahtar yalnızca o cihazda saklanır ve
yalnızca Anthropic'e gönderilir; öğrencinin adı ve sınıfı gönderilmez. Kullanım ücretlidir: anahtarı alırken
harcama sınırı koy, ortak tahtada iş bitince anahtarı sil. Anahtar bu depoya asla yazılmaz.

Durum: istek yolu sahte bir anahtarla denendi (Anthropic'e ulaşıyor ve "anahtar kabul edilmedi" yanıtı doğru gösteriliyor).
Gerçek bir anahtarla canlı yanıt henüz denenmedi.

## Öteki bilgisayara almak

İD Okul, `idkalem/idanaliz` deposunun **`idokul` dalında** durur. İlk seferde:

```
git clone -b idokul https://github.com/idkalem/idanaliz.git "İD Okul"
```

Sonra klasördeki `İD Okul.html` dosyasına çift tıklamak yeter.

## Geliştirmek

Node.js 22 ya da üstü gerekir.

```
npm install      # yalnız ilk seferde
npm run dev      # değişiklikleri canlı gör
npm run build    # içeriği denetler, derler ve İD Okul.html dosyasını yeniden yazar
```

## Değişikliği öteki bilgisayara taşımak

Çalışmaya başlamadan önce `git pull`. Bitirince:

```
npm run build
git add -A
git commit -m "ne değişti"
git push
```

`İD Okul.html` derlemeyle üretilir ama depoda durur; böylece Node kurulu olmayan bilgisayarda da açılır.
Bu yüzden göndermeden önce `npm run build` çalıştır.

## Klasörler

- `src/content/` konu anlatımları ve sorular (her konu bir dosya); `mufredat.ts` MEB tablolarından üretilen öğrenme çıktıları
- `src/pages/` ekranlar
- `src/store.ts` hesaplar ve kayıt; `src/engine.ts` hesaplamalar (program, rapor, sınıf)
- `src/avatar.tsx` avatar ve parçaları; `src/ai.ts`, `src/sohbet.tsx` yapay zekâ öğretmen
- `scripts/kontrol.ts` içerik denetimi: cevap anahtarı, çözüm adımları, yanılgı etiketleri, tablolar, resmî dayanak
- `scripts/sayim.ts` konu konu sayım: soru türleri, yanılgıya bağlı seçenek sayısı, süre
- `scripts/meb/` MEB konu soru dağılım tablolarını aktarır: `xlsx.py` Excel dosyasını düz metne, `mufredat.py` o metni `mufredat.ts` dosyasına çevirir
- `scripts/tekdosya.mjs` derlemeyi tek HTML dosyasına toplar
