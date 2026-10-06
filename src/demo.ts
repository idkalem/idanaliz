// Örnek veri: tanıtım ve çekim için hazır bir öğrenci geçmişi. Adres satırında ?demo=1 ya da Profil > "Örnek veriyi yükle".
// Tarihler bugüne göre kurulur; dosya ne zaman açılırsa açılsın aynı görüntü çıkar.
import { KONULAR } from './content';
import { bos, bugun, ARALIK, type State, type Cevap, type Tekrar } from './store';

export function demo(theme: State['theme']): State {
  const d = bugun();
  const st: State = { ...bos(), theme, ad: 'Deniz', avatar: { renk: 4, goz: 0, aks: 2 }, son: 'mat-mutlak' };
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

  // Üslü Sayılar: bitmiş, üç yanlış tekrarla toparlanmış. İkisi bugün yeniden soruluyor.
  kartlar('mat-uslu', 10);
  test('mat-uslu', 9, { 4: 0, 5: 2, 8: 2 }, [1, 2, 3, 6]);
  tekrarDogru('mat-uslu', 4, 5); tekrarDogru('mat-uslu', 5, 5); tekrarDogru('mat-uslu', 8, 5);
  tekrar['mat-uslu/s4'].son = d; tekrar['mat-uslu/s5'].son = d; tekrarDogru('mat-uslu', 8, 2);

  // Madde ve Özkütle: aynı yanılgı iki soruda.
  kartlar('fiz-ozkutle', 8);
  test('fiz-ozkutle', 7, { 5: 0, 6: 1 }, [1, 2, 3, 6]);
  tekrarDogru('fiz-ozkutle', 5, 5); tekrarDogru('fiz-ozkutle', 5, 2); tekrarDogru('fiz-ozkutle', 6, 5);
  tekrar['fiz-ozkutle/s6'].son = d + 1;

  // Köklü Sayılar: zayıf; "tekrar bak" listesinin başı.
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

  const gun: Record<number, number> = {};
  const xp: Record<number, number> = { 20: 60, 19: 90, 17: 40, 16: 120, 14: 80, 13: 100, 12: 120, 10: 50, 9: 120, 8: 60, 7: 110, 5: 80, 4: 130, 3: 70, 2: 110, 1: 40 };
  for (const [once, v] of Object.entries(xp)) gun[d - +once] = v;
  return { ...st, cevap: cevap.sort((a, b) => a.g - b.g), tekrar, gun, xp: Object.values(xp).reduce((a, b) => a + b, 0) };
}
