// Örnek sınıf: tanıtım ve çekim için hazır hesaplar. Adres satırında ?demo=1 (öğrenci), ?demo=ogretmen ya da giriş ekranındaki "Örnek sınıfı yükle".
// Tarihler bugüne göre kurulur; dosya ne zaman açılırsa açılsın aynı görüntü çıkar. Kişiler uydurmadır; şifrelerin hepsi 1234.
import { HAZIR, KONULAR } from './content';
import { bos, bugun, ARALIK, getKok, setKok, pinOzet, type State, type Cevap, type Tekrar, type Kok, type Odev } from './store';
import { profilKur } from './kisi';

export const DEMO_PIN = '1234';
export const DEMO_SINIF = '9-A';
const demoMu = (id: string) => id.startsWith('demo-');
export const demoVar = (kok: Kok) => Object.keys(kok.hesap).some(demoMu);

const hesap = (id: string, ad: string, x: Partial<State>): State => ({ ...bos(id), ad, sinif: DEMO_SINIF, pin: pinOzet(id, DEMO_PIN), ...x });

/** Deniz: üç haftadır çalışan, Köklü Gösterim'de zorlanan öğrenci. Tanıtımın ana hesabı. */
function deniz(d: number): State {
  const st = hesap('demo-deniz', 'Deniz', { avatar: { renk: 4, desen: 0, goz: 0, agiz: 0, bas: 5, gozluk: 0, boyun: 0, zemin: 0 }, son: 'mat-mutlak', jeton: 185, tarama: true, yazili: { 'mat-uslu/a1': [0, 1, 2], 'mat-uslu/a3': [0, 1] }, profil: DENIZ_PROFIL });
  st.plan = { ...st.plan, kuruldu: true };
  const cevap: Cevap[] = [], tekrar: Record<string, Tekrar> = {};

  const kartlar = (k: string, once: number, n = 99) => KONULAR[k].kartlar.slice(0, n).forEach((c) => { st.kart[`${k}/${c.id}`] = d - once; });
  /** Bir kavrama testi: `secim` her soruda işaretlenen seçenek (verilmeyenler doğru), `emin` emin olunan soru numaraları. */
  const test = (k: string, once: number, secim: Record<number, number>, emin: number[]) => {
    KONULAR[k].sorular.forEach((s, i) => {
      const sec = secim[i + 1] ?? s.d, ok = sec === s.d, y = ok ? undefined : s.y[sec] ?? undefined;
      cevap.push({ k, q: s.id, ok, sec, emin: emin.includes(i + 1), g: d - once, ...(y ? { y } : {}) });
      if (!ok) tekrar[`${k}/${s.id}`] = { k, q: s.id, kutu: 0, son: d - once + ARALIK[0], y, n: 1, sec };
    });
  };
  /** Tekrar oturumunda doğru çözülen bir soru: bir basamak ilerler. */
  const tekrarDogru = (k: string, no: number, once: number) => {
    const s = KONULAR[k].sorular[no - 1], id = `${k}/${s.id}`, t = tekrar[id];
    cevap.push({ k, q: s.id, ok: true, sec: s.d, emin: true, g: d - once, tk: 1 });
    tekrar[id] = { ...t, kutu: t.kutu + 1, son: d - once + ARALIK[t.kutu + 1] };
  };

  // Üslü Gösterim: bitmiş, üç yanlış tekrarla toparlanmış. İkisi bugün yeniden soruluyor.
  kartlar('mat-uslu', 10);
  test('mat-uslu', 9, { 4: 0, 5: 2, 8: 2 }, [1, 2, 3, 6]);
  tekrarDogru('mat-uslu', 4, 5); tekrarDogru('mat-uslu', 5, 5); tekrarDogru('mat-uslu', 8, 5);
  tekrar['mat-uslu/s4'].son = d; tekrar['mat-uslu/s5'].son = d; tekrarDogru('mat-uslu', 8, 2);

  // Madde ve Özkütle: aynı yanılgı iki soruda.
  kartlar('fiz-ozkutle', 8);
  test('fiz-ozkutle', 7, { 5: 0, 6: 1 }, [1, 2, 3, 6]);
  tekrarDogru('fiz-ozkutle', 5, 5); tekrarDogru('fiz-ozkutle', 5, 2); tekrarDogru('fiz-ozkutle', 6, 5);
  tekrar['fiz-ozkutle/s6'].son = d + 1;

  // Köklü Gösterim: zayıf; "tekrar bak" listesinin başı.
  kartlar('mat-koklu', 5);
  test('mat-koklu', 4, { 1: 4, 3: 0, 5: 4, 6: 3, 8: 2 }, [1, 2, 3]);
  tekrar['mat-koklu/s1'].son = d; tekrar['mat-koklu/s3'].son = d;
  tekrar['mat-koklu/s5'].son = d + 1; tekrar['mat-koklu/s6'].son = d + 1; tekrar['mat-koklu/s8'].son = d + 2;

  // Yazım Kuralları: iyi, tek yanlış.
  kartlar('tr-yazim', 3);
  test('tr-yazim', 2, { 4: 2 }, [1, 2, 3, 5, 6]);
  tekrar['tr-yazim/s4'].son = d;

  // Mutlak Değer: yarım; "kaldığın yerden devam et".
  kartlar('mat-mutlak', 1, 2);

  const xp: Record<number, number> = { 20: 60, 19: 90, 17: 40, 16: 120, 14: 80, 13: 100, 12: 120, 10: 50, 9: 120, 8: 60, 7: 110, 5: 80, 4: 130, 3: 70, 2: 110, 1: 40 };
  for (const [once, v] of Object.entries(xp)) st.gun[d - +once] = v;
  return { ...st, cevap: cevap.sort((a, b) => a.g - b.g), tekrar, xp: Object.values(xp).reduce((a, b) => a + b, 0) };
}

/** Deniz'in envanter cevabı: yeni konuya örnekle girer, kısa molayla toparlanır, ikinci bir yoldan anlatımı sever; sanat ve tasarıma ilgili.
 * Öz düzenleme ve akademik dayanıklılık desteklenmesi yararlı olabilecek alanlar olarak çıkar. */
const DENIZ_PROFIL = profilKur(['DCD', 'CCC', 'CDC', 'BCB', 'BBC', 'EDD', 'DDD', 'DCD'], 'DCBABBAB', 'CBEC', 'DCBE');
/** Sınıfın geri kalanı için tercih, ilgi ve destek cevapları: her öğrenciye farklı bir birleşim düşer. */
const TERCIHLER = ['ACBABAAD', 'BDCACDBA', 'CABDACDC', 'DBABDBCB'], ILGILER = ['ECBC', 'BECB', 'CBCE', 'DBDC'], DESTEKLER = ['CDBD', 'DBCE', 'BCDC'];
const ADLAR = ['Elif', 'Mert', 'Zeynep', 'Arda', 'Defne', 'Kerem', 'Nisa', 'Emir', 'İrem', 'Baran', 'Azra'];
const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** Sınıfın geri kalanı: tohumlu rastgele sayılarla üretilir, her açılışta aynı çıkar. Sınıf Köklü Gösterim'de daha çok yanılır. */
function ogrenci(i: number, ad: string, d: number): State {
  const r = (n: number) => rnd(i * 97 + n);
  const beceri = 0.1 + r(1) * 0.42;
  const st = hesap(`demo-${i + 1}`, ad, {
    avatar: { renk: (i * 3 + 1) % 8, desen: i % 4 === 3 ? 1 : 0, goz: i % 3, agiz: i % 3 === 1 ? 1 : 0, bas: [0, 1, 0, 3, 0, 2, 4, 0][i % 8], gozluk: i % 5 === 2 ? 1 : 0, boyun: i % 6 === 4 ? 1 : 0, zemin: i % 7 === 5 ? 1 : 0 },
    jeton: Math.round(r(2) * 120), tarama: true,
    profil: profilKur(Array.from({ length: 8 }, (_, b) => [0, 1, 2].map((m) => 'BCCDDE'[Math.floor(r(700 + b * 3 + m) * 6)]).join('')), TERCIHLER[i % 4], ILGILER[i % 4], DESTEKLER[i % 3]),
  });
  HAZIR.forEach((konu, j) => {
    const sans = r(10 + j);
    if (sans > 0.8) return;
    const once = 2 + Math.floor(r(20 + j) * 12);
    konu.kartlar.forEach((c) => { st.kart[`${konu.id}/${c.id}`] = d - once; });
    if (sans > 0.62) return;
    konu.sorular.forEach((s, q) => {
      const yanlis = r(100 + j * 10 + q) < beceri + (konu.id === 'mat-koklu' ? 0.22 : 0) + (s.z - 1) * 0.06;
      // Yanlışlar çoğunlukla aynı yanılgıya gider: yanılgısı yazılmış ilk yanlış seçenek.
      const sec = yanlis ? Math.max(0, s.y.findIndex((y, o) => o !== s.d && y != null)) : s.d;
      const ok = sec === s.d, y = ok ? undefined : s.y[sec] ?? undefined, g = d - once + 1;
      st.cevap.push({ k: konu.id, q: s.id, ok, sec, emin: r(300 + j * 10 + q) < 0.45, g, ...(y ? { y } : {}) });
      if (!ok) st.tekrar[`${konu.id}/${s.id}`] = { k: konu.id, q: s.id, kutu: 0, son: g + ARALIK[0], y, n: 1, sec };
    });
    st.son = konu.id;
  });
  // Günlük puan: bazı öğrenciler birkaç gündür çalışmıyor.
  const ara = i % 4 === 1 ? 5 : i % 5 === 3 ? 2 : 0;
  for (let once = ara; once < 15; once++) if (r(500 + once) < 0.62) st.gun[d - once] = 20 + Math.round(r(600 + once) * 11) * 10;
  st.cevap.sort((a, b) => a.g - b.g);
  st.xp = Object.values(st.gun).reduce((a, b) => a + b, 0);
  return st;
}

/** Örnek hesaplar ve örnek ödev. */
export function demoVeri(): { hesap: Record<string, State>; odev: Odev[] } {
  const d = bugun();
  const liste = [deniz(d), ...ADLAR.map((ad, i) => ogrenci(i, ad, d)), hesap('demo-ogretmen', 'Örnek Öğretmen', { rol: 'ogretmen', avatar: { renk: 1, desen: 0, goz: 4, agiz: 0, bas: 0, gozluk: 2, boyun: 1, zemin: 0 } })];
  return { hesap: Object.fromEntries(liste.map((h) => [h.id, h])), odev: [{ id: 'demo-odev', konu: 'mat-koklu', verildi: d - 1, son: d + 2 }] };
}
/** Örnek sınıfı bu cihazdaki hesapların yanına ekler; gerçek hesaplara dokunmaz. `aktif` verilirse o hesapla giriş yapılır. */
export function demoYukle(aktif: string | null = null) {
  const k = getKok(), dm = demoVeri();
  setKok({ hesap: { ...k.hesap, ...dm.hesap }, odev: [...k.odev.filter((o) => !demoMu(o.id)), ...dm.odev], aktif: aktif ?? k.aktif });
}
export function demoKaldir() {
  const k = getKok();
  setKok({ hesap: Object.fromEntries(Object.entries(k.hesap).filter(([id]) => !demoMu(id))), odev: k.odev.filter((o) => !demoMu(o.id)), aktif: k.aktif && demoMu(k.aktif) ? null : k.aktif });
}
