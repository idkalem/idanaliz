# İD Okul

TYT ders çalışma portalı: konu anlatımı, kavrama testi, yanlışlara göre tekrar, kişisel program ve rapor.
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

## Neler var (v0.2)

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

- `src/content/` konu anlatımları ve sorular (her konu bir dosya)
- `src/pages/` ekranlar
- `src/store.ts` hesaplar ve kayıt; `src/engine.ts` hesaplamalar (program, rapor, sınıf)
- `src/avatar.tsx` avatar ve parçaları; `src/ai.ts`, `src/sohbet.tsx` yapay zekâ öğretmen
- `scripts/kontrol.ts` içerik denetimi: cevap anahtarı, çözüm adımları, yanılgı etiketleri
- `scripts/tekdosya.mjs` derlemeyi tek HTML dosyasına toplar
