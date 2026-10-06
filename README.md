# İD Okul

TYT ders çalışma portalı: konu anlatımı, kavrama testi, yanlışlara göre tekrar ve rapor. İD ailesinin bir parçası (İD Kalem, İD Analiz, İD Okul).
Kayıt şimdilik yalnızca tarayıcıda durur; gerçek öğrenci verisi bu depoda yoktur.

## Çalıştırmak

Klasördeki **`İD Okul.html`** dosyasına çift tıkla. Kurulum ve internet gerekmez.
Örnek bir çalışma geçmişiyle açmak için adresin sonuna `?demo=1` ekle.

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

`İD Okul.html` derlemeyle üretilir ama depoda durur; böylece Node kurulu olmayan bilgisayarda da açılır. Bu yüzden göndermeden önce `npm run build` çalıştır.

## Klasörler

- `src/content/` konu anlatımları ve sorular (her konu bir dosya)
- `src/pages/` ekranlar
- `scripts/kontrol.ts` içerik denetimi: cevap anahtarı, çözüm adımları, yanılgı etiketleri
- `scripts/tekdosya.mjs` derlemeyi tek HTML dosyasına toplar
