# İD Analiz

Okul deneme sınavlarını analiz eden uygulama. İD ailesinin bir parçası (İD Kalem, İD Analiz, İD Okul).
Şu an örnek veriyle çalışır; gerçek öğrenci verisi bu depoda yoktur.

## Çalıştırmak

Depoyu indir, klasördeki **`İD Analiz.html`** dosyasına çift tıkla. Kurulum ve internet gerekmez.

```
git clone https://github.com/idkalem/idanaliz.git
```

Daha önce indirdiysen klasörün içinde `git pull` yazman yeter.

## İD Okul da bu depoda

İD Okul (ders çalışma portalı) bu deponun **`idokul` dalında** durur. Ayrı bir klasöre indirmek için:

```
git clone -b idokul https://github.com/idkalem/idanaliz.git "İD Okul"
```

İndirdikten sonra klasördeki `İD Okul.html` dosyasına çift tıkla. Güncellemek için o klasörde `git pull`.

## Geliştirmek

Node.js 22 ya da üstü gerekir.

```
npm install      # yalnız ilk seferde
npm run dev      # değişiklikleri canlı gör
npm run build    # denetler, derler ve İD Analiz.html dosyasını yeniden yazar
```

## Değişikliği öteki bilgisayara taşımak

Çalışmaya başlamadan önce:

```
git pull
```

Bitirince:

```
npm run build
git add -A
git commit -m "ne değişti"
git push
```

`İD Analiz.html` derlemeyle üretilir ama depoda durur; böylece Node kurulu olmayan bilgisayarda da açılır. Bu yüzden göndermeden önce `npm run build` çalıştır.

## Klasörler

- `src/` uygulamanın kodu (Vite + React + TypeScript)
- `scripts/` derlemeyi tek HTML dosyasına toplayan betik
- `video/` tanıtım filmini üreten betikler. Ses kayıtları ve ekran görüntüleri büyük oldukları için depoda yok.
