# Tanıtım filmi — durum

## Bitti (2026-10-06)
- `Masaüstü\İD Analiz - Tanıtım.mp4` — 1920×1080, 60 fps, 169,2 sn, müzikli (asıl film, `build()`). Konular'dan sonra "kaçan net" sahnesi var (`neyap` ekranı = Konular → Ne yapmalı).
- `Masaüstü\İD Analiz - Kısa.mp4` — 34,4 sn, "beş soru, beş cevap" (`build2()`, `film.html?v=2`).

## Yeniden üretmek için (bu klasörde)
1. Ekran görüntüleri: `node shots.mjs plan.mjs shots 2` (önce üst klasörde `npm run build`).
2. Kontrol kareleri: `node render.mjs --stills=auto --step=3.6` → `qa/`.
3. Render: `node render.mjs --workers=8 --out=<geçici klasör>` → `<geçici>/video.mp4`.
   Kısa film: `--q=v=2 --ad=film2` ekle.
4. Müzik: `python muzik.py film.events.json ses.wav 6` (son sayı logo sesi: 1–9; seçilen 6 = Pizzicato, vuruşları `logoIn` hareketlerine oturtulmuş — animasyon süreleri değişirse `s6` içindeki anları da değiştir, `sesler.py`; 0 = eski çan). Ses değişince yeniden render gerekmez, yalnız 4–5.
   Logo sesleri gerçek çalgı kayıtlarından kurulur (`ornekler/`, VSCO-2 CE, CC0). Kodla sentezlenen ilk sekiz seçenek "hepsi aynı ton, yapay" diye reddedildi.
   Yeni bir kayıt gerekirse ham dosyaları indir, `VSCO=<klasör>` ile çalıştır; `ornekler/katalog.json` perde ve başlangıç ölçümlerini tutar.
   Seçenek klipleri: `python sesler.py <logo klibi> <logonun başladığı sn> <klasör>` → `MasaüstüİD Analiz - Ses Seçenekleri`.
5. Birleştir: `ffmpeg -y -i video.mp4 -i ses.wav -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart cikti.mp4`.

## Tuzaklar
- 10 işçi + boruyla x264 kodlama 16 GB belleği taşırdı; 8 işçi ve diske kare yazma kullan (kareler ~2 GB, OneDrive dışına yaz).
- GSAP `fromTo`'da yalnız "from"da olan özellik, hedefte yoksa o anki değere gider (logo parçaları görünmez kalmıştı): hedefe de yaz.
- Öğrenci profili adresi (`/ogrenci/s259`) dizin numarası değildir; profile satıra tıklayarak git.
- `c12t` ekranında `.tile` nth 0 sınıf kutusudur; "Özel Üçgenler" kutusu `oz` anahtarıyla alınır.

## Kaçan net sahnesi (öğretmen sahnesinin yerine)
- Öğretmen sahnesi kullanıcı isteğiyle çıkarıldı (2026-10-06); `generate.ts` içindeki "Öğretmen izi" veri bloğu ve `tch` ekranı da silindi. Karşılaştır'daki "Başa baş" etiketi kaldı.
- Yeni özellik yazılmadı: ekran uygulamada zaten vardı (Konular → "Ne yapmalı", `/konular?gorunum=oncelik`). Sayılar o ekrandan: Paragrafta Ana Düşünce okul %69, en iyi sınıf %83, +1,28 net; ilk beş konu +4,9 net.
- Dil söz vermez: "en iyi sınıf kadar yapılsa", "yaklaşık".

## Kurallar
- Sayılar uygulamadan (bkz. `../scripts/facts.ts`); uydurma yok.
- "Deneme deneme karşılaştırma" filmde YOK (uygulamaya sonradan eklenecek özellik).
- Font: TeX Gyre Heros (Helvetica eşleniği); gerçek Helvetica kurulu değil.
