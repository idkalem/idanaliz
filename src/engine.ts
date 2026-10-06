// Durumdan türetilen her şey: konu durumu, tekrar listesi, rapor, seviye, seri, görevler, program, rozetler, sınıf özeti.
import { DERSLER, HAZIR, KONULAR, ONKOSUL, dersOf, type Konu, type Soru, type Yanilgi, type Ders } from './content';
import { bugun, OGRENILDI, type State, type Tekrar, type Avatar, type Kok, type Odev } from './store';

/* ---------- Tarih ---------- */
const gunTarih = (g: number) => new Date(g * 864e5);
export const gunAd = (g: number) => gunTarih(g).toLocaleDateString('tr-TR', { timeZone: 'UTC', weekday: 'short' });
export const gunTam = (g: number) => gunTarih(g).toLocaleDateString('tr-TR', { timeZone: 'UTC', weekday: 'long' });
export const tarih = (g: number) => gunTarih(g).toLocaleDateString('tr-TR', { timeZone: 'UTC', day: 'numeric', month: 'long' });
/** Haftanın pazartesisi. */
export const haftaBasi = (g: number) => g - ((g + 3) % 7);
/** Haftanın kaçıncı günü: pazartesi 0, pazar 6. */
export const haftaGunu = (g: number) => (g + 3) % 7;
export function neZaman(son: number, d = bugun()): string {
  const f = son - d;
  return f <= 0 ? 'bugün' : f === 1 ? 'yarın' : `${f} gün sonra`;
}
export function neZamandi(g: number | null, d = bugun()): string {
  if (g == null) return 'hiç çalışmadı';
  const f = d - g;
  return f <= 0 ? 'bugün' : f === 1 ? 'dün' : `${f} gün önce`;
}

/* ---------- Seviye ve seri ---------- */
export const SEVIYE_XP = 250;
export const seviye = (xp: number) => ({ no: Math.floor(xp / SEVIYE_XP) + 1, ic: xp % SEVIYE_XP, gerek: SEVIYE_XP });
/** Art arda çalışılan gün sayısı. Bugün henüz çalışılmadıysa seri dünden sayılır; dondurulmuş günler seriyi bozmaz. */
export function seri(st: Pick<State, 'gun' | 'donGun'>, d = bugun()): number {
  const dolu = (g: number) => !!st.gun[g] || st.donGun.includes(g);
  let g = dolu(d) ? d : d - 1, n = 0;
  while (dolu(g)) { n++; g--; }
  return n;
}
export const haftaXp = (st: State, d = bugun()) => { let t = 0; for (let g = haftaBasi(d); g <= d; g++) t += st.gun[g] ?? 0; return t; };
/** En son çalışılan gün; hiç çalışılmadıysa null. */
export const sonGun = (st: State): number | null => { const gs = Object.keys(st.gun).map(Number).filter((g) => st.gun[g]); return gs.length ? Math.max(...gs) : null; };

/* ---------- Konu durumu ---------- */
/** Doğru oranı eşikleri: %60 ve üstü iyi, %40 altı zayıf. Bütün ekranlarda aynıdır. */
export const LV_LO = 40, LV_HI = 60;
export type Lv = 'good' | 'mid' | 'bad' | 'none';
export const lv = (p: number | null | undefined): Lv => (p == null || !isFinite(p) ? 'none' : p >= LV_HI ? 'good' : p >= LV_LO ? 'mid' : 'bad');
export const LV_NAME: Record<Lv, string> = { good: 'İyi', mid: 'Orta', bad: 'Zayıf', none: 'Başlanmadı' };

export interface KDurum {
  kart: number; kartTop: number;
  /** çözülen farklı soru sayısı ve bunlardan son denemesi doğru olanlar */
  coz: number; dogru: number; top: number;
  /** son denemelere göre doğru yüzdesi; hiç soru çözülmediyse null */
  oran: number | null;
  /** bugün tekrarı gelen ve defterde bekleyen soru sayısı */
  bekleyen: number; defter: number;
  basladi: boolean;
}
export function konuDurum(st: State, k: Konu, d = bugun()): KDurum {
  const son = new Map<string, boolean>();
  for (const c of st.cevap) if (c.k === k.id) son.set(c.q, c.ok);
  let dogru = 0;
  for (const v of son.values()) if (v) dogru++;
  let bekleyen = 0, defter = 0;
  for (const t of Object.values(st.tekrar)) if (t.k === k.id && t.kutu < OGRENILDI) { defter++; if (t.son <= d) bekleyen++; }
  const kart = k.kartlar.filter((c) => st.kart[`${k.id}/${c.id}`] != null).length;
  return { kart, kartTop: k.kartlar.length, coz: son.size, dogru, top: k.sorular.length, oran: son.size ? (dogru / son.size) * 100 : null, bekleyen, defter, basladi: kart > 0 || son.size > 0 };
}
export function dersDurum(st: State, ders: Ders) {
  const hazir = ders.konular.filter((k) => KONULAR[k.id]).map((k) => KONULAR[k.id]);
  let coz = 0, dogru = 0, kart = 0, kartTop = 0;
  for (const k of hazir) { const x = konuDurum(st, k); coz += x.coz; dogru += x.dogru; kart += x.kart; kartTop += x.kartTop; }
  return { hazir: hazir.length, top: ders.konular.length, oran: coz ? (dogru / coz) * 100 : null, coz, kart, kartTop };
}

/* ---------- Yol haritası ---------- */
/** Kavrama testinin yıldızı: bütün sorular çözüldüyse doğru oranına göre 1–3. */
export const yildiz = (x: KDurum) => (x.coz < x.top || x.oran == null ? 0 : x.oran >= 90 ? 3 : x.oran >= 70 ? 2 : x.oran >= 50 ? 1 : 0);
export type Durak = 'yeni' | 'suruyor' | 'tamam';
export const durak = (x: KDurum): Durak => (!x.basladi ? 'yeni' : x.kart === x.kartTop && x.coz === x.top ? 'tamam' : 'suruyor');
/** Henüz bitirilmemiş ön koşul konuları. */
export const onkosulEksik = (st: State, k: Konu): Konu[] => (ONKOSUL[k.id] ?? []).map((id) => KONULAR[id]).filter((o) => o && durak(konuDurum(st, o)) !== 'tamam');

/* ---------- Yanlış defteri ---------- */
export interface Bekleyen { id: string; t: Tekrar; konu: Konu; soru: Soru }
const cozumle = (id: string, t: Tekrar): Bekleyen | null => {
  const konu = KONULAR[t.k], soru = konu?.sorular.find((s) => s.id === t.q);
  return konu && soru ? { id, t, konu, soru } : null;
};
/** Defterdeki bütün sorular (öğrenilenler dahil), tekrar günü yakın olan önce. */
export function defter(st: State): Bekleyen[] {
  return Object.entries(st.tekrar).map(([id, t]) => cozumle(id, t)).filter((x): x is Bekleyen => !!x).sort((a, b) => a.t.kutu - b.t.kutu || a.t.son - b.t.son);
}
/** Tekrar günü gelmiş sorular. */
export const bekleyenler = (st: State, d = bugun()) => defter(st).filter((x) => x.t.kutu < OGRENILDI && x.t.son <= d).sort((a, b) => a.t.son - b.t.son);

/* ---------- Kaldığın yer ---------- */
export interface Devam { konu: Konu; tur: 'anlatim' | 'test'; kart?: number; yazi: string }
function devamKonu(st: State, k: Konu): Devam | null {
  const x = konuDurum(st, k);
  if (x.kart < x.kartTop) {
    const i = k.kartlar.findIndex((c) => st.kart[`${k.id}/${c.id}`] == null);
    return { konu: k, tur: 'anlatim', kart: i, yazi: `Anlatım, ${i + 1}. kart: ${k.kartlar[i].baslik}` };
  }
  if (x.coz < x.top) return { konu: k, tur: 'test', yazi: x.coz ? `Kavrama testi: ${x.top - x.coz} soru kaldı` : `Kavrama testi: ${x.top} soru` };
  return null;
}
export function devamEt(st: State): Devam | null {
  const sira = [KONULAR[st.son], ...HAZIR.filter((k) => konuDurum(st, k).basladi)].filter(Boolean);
  for (const k of sira) { const dv = devamKonu(st, k); if (dv) return dv; }
  return null;
}

/* ---------- Rapor ---------- */
export interface Hata { konu: Konu; id: string; yan: Yanilgi; n: number; sorular: string[] }
/** Yanlış cevapların arkasındaki yanılgılar, en sık yapılan önce. `since` verilirse o günden sonrası. */
export function hatalar(st: State, since = 0): Hata[] {
  const m = new Map<string, Hata>();
  for (const c of st.cevap) {
    if (c.ok || !c.y || c.g < since) continue;
    const konu = KONULAR[c.k], yan = konu?.yan[c.y];
    if (!yan) continue;
    const key = `${c.k}:${c.y}`, h = m.get(key) ?? { konu, id: c.y, yan, n: 0, sorular: [] };
    h.n++; if (!h.sorular.includes(c.q)) h.sorular.push(c.q);
    m.set(key, h);
  }
  return [...m.values()].sort((a, b) => b.n - a.n);
}
export interface Bak { konu: Konu; d: KDurum; neden: string[]; skor: number; hata?: Hata }
/** Tekrar bakılması gereken konular: doğru oranı düşük olan ya da defterinde soru bekleyenler. */
export function tekrarBak(st: State): Bak[] {
  const hs = hatalar(st);
  const out: Bak[] = [];
  for (const k of HAZIR) {
    const d = konuDurum(st, k);
    if (d.oran == null || (d.oran >= 70 && !d.defter)) continue;
    const hata = hs.find((h) => h.konu.id === k.id && st.cevap.some((c) => c.k === k.id && c.y === h.id && !sonDogru(st, k.id, c.q)));
    const neden: string[] = [];
    if (d.oran < 70) neden.push(`Soruların %${Math.round(d.oran)}'i doğru`);
    if (d.bekleyen) neden.push(`${d.bekleyen} soru bugün tekrar bekliyor`);
    else if (d.defter) neden.push(`${d.defter} soru yanlış defterinde`);
    out.push({ konu: k, d, neden, hata, skor: Math.max(0, 70 - d.oran) + d.bekleyen * 8 + d.defter * 3 });
  }
  return out.sort((a, b) => b.skor - a.skor);
}
function sonDogru(st: State, k: string, q: string): boolean {
  for (let i = st.cevap.length - 1; i >= 0; i--) if (st.cevap[i].k === k && st.cevap[i].q === q) return st.cevap[i].ok;
  return false;
}
export interface Ozet { soru: number; dogru: number; oran: number | null; gunSay: number; xp: number; eminYanlis: number; kart: number }
/** Son `n` günün özeti (n = 0: baştan beri). */
export function ozet(st: State, n: number, d = bugun()): Ozet {
  const since = n ? d - n + 1 : 0;
  const cs = st.cevap.filter((c) => c.g >= since);
  const dogru = cs.filter((c) => c.ok).length;
  let gunSay = 0, xp = 0;
  for (const [g, v] of Object.entries(st.gun)) if (+g >= since && v) { gunSay++; xp += v; }
  return { soru: cs.length, dogru, oran: cs.length ? (dogru / cs.length) * 100 : null, gunSay, xp, eminYanlis: cs.filter((c) => !c.ok && c.emin).length, kart: Object.values(st.kart).filter((g) => g >= since).length };
}
/** Raporun başındaki tek cümlelik özet. */
export function ozetCumle(st: State, n: number, kim: 'sen' | 'o' = 'sen'): string {
  const o = ozet(st, n), ne = n === 7 ? 'Son 7 günde' : n === 30 ? 'Son 30 günde' : 'Bugüne kadar';
  const s = kim === 'sen';
  if (!o.soru && !o.kart) return s ? `${ne} kayıtlı bir çalışma yok. Bir konu seçip anlatımıyla başlayabilirsin.` : `${ne} kayıtlı bir çalışma yok.`;
  const bak = tekrarBak(st)[0];
  const p1 = o.soru
    ? `${ne} ${o.gunSay} gün ${s ? 'çalıştın' : 'çalıştı'}, ${o.soru} soru ${s ? 'çözdün' : 'çözdü'} ve %${Math.round(o.oran!)}'ini doğru ${s ? 'yaptın' : 'yaptı'}.`
    : `${ne} ${o.gunSay} gün ${s ? 'çalıştın' : 'çalıştı'} ve ${o.kart} anlatım kartı ${s ? 'bitirdin' : 'bitirdi'}.`;
  const p2 = bak ? ` En çok ${bak.konu.ad} konusunda ${s ? 'zorlandın' : 'zorlandı'}${bak.hata ? `; en sık ${s ? 'yaptığın' : 'yaptığı'} hata: ${bak.hata.yan.ad.toLocaleLowerCase('tr')}.` : '.'}` : s ? ' Tekrar bakman gereken bir konu görünmüyor.' : ' Tekrar bakması gereken bir konu görünmüyor.';
  return p1 + p2;
}

/** Yanlışların türü. Kesin bir ölçüm değil, kayıtlardan çıkarılan bir tahmindir. */
export interface HataTur { bilgi: number; eksik: number; dikkat: number; top: number }
export function hataTurleri(st: State, since = 0): HataTur {
  const out: HataTur = { bilgi: 0, eksik: 0, dikkat: 0, top: 0 };
  const oran = new Map(HAZIR.map((k) => [k.id, konuDurum(st, k).oran ?? 0]));
  const kac = new Map<string, number>();
  for (const c of st.cevap) if (!c.ok) { const key = `${c.k}:${c.y ?? c.q}`; kac.set(key, (kac.get(key) ?? 0) + 1); }
  for (const c of st.cevap) {
    if (c.ok || c.g < since) continue;
    out.top++;
    // Emin olup yanılmak: kural yanlış biliniyor. Konu genelde doğru yapılıyor ve hata bir kez yapıldıysa: dikkatsizlik. Gerisi: bilgi eksiği.
    if (c.emin) out.bilgi++;
    else if ((oran.get(c.k) ?? 0) >= 70 && kac.get(`${c.k}:${c.y ?? c.q}`) === 1) out.dikkat++;
    else out.eksik++;
  }
  return out;
}

/** Rapordaki koç notu: kayıtlardan kurulan üç kısa cümle. */
export function kocNotu(st: State): string[] {
  const out: string[] = [];
  const ks = HAZIR.map((k) => ({ k, s: konuDurum(st, k) })).filter((r) => r.s.oran != null);
  const iyi = [...ks].sort((a, b) => b.s.oran! - a.s.oran!)[0];
  if (iyi && iyi.s.oran! >= 70) out.push(`En iyi olduğun konu ${iyi.k.ad}: soruların %${Math.round(iyi.s.oran!)}'i doğru.`);
  const bak = tekrarBak(st)[0];
  if (bak) out.push(`Önce ${bak.konu.ad} konusuna dön${bak.hata ? `. Orada en sık yaptığın hata: ${bak.hata.yan.ad.toLocaleLowerCase('tr')}` : ''}.`);
  const bek = bekleyenler(st).length, t = hataTurleri(st);
  if (bek) out.push(`Bugün ${bek} soru tekrar bekliyor; yaklaşık ${Math.max(2, Math.ceil(bek * 1.5))} dakikada biter.`);
  if (t.top >= 3 && t.bilgi >= t.eksik && t.bilgi >= t.dikkat) out.push('Yanlışlarının çoğunda emindin. Demek ki bazı kuralları yanlış biliyorsun: o konuların anlatımını yeniden oku.');
  else if (t.top >= 3 && t.dikkat > t.eksik) out.push('Yanlışlarının çoğu bildiğin konularda. Soruyu bir kez daha oku, işaretlemeden önce işlemini kontrol et.');
  if (!out.length) out.push('Henüz yorum yapacak kadar kayıt yok. Bir konunun kavrama testini çöz, not burada oluşsun.');
  return out.slice(0, 3);
}

/* ---------- Günlük görevler ---------- */
export interface Gorev { id: 'xp' | 'soru' | 'tekrar' | 'kart' | 'dogru'; ad: string; var: number; gerek: number; ok: boolean }
export function gorevler(st: State, d = bugun()): Gorev[] {
  const bg = st.cevap.filter((c) => c.g === d);
  const g = (id: Gorev['id'], ad: string, v: number, gerek: number): Gorev => ({ id, ad, var: Math.min(v, gerek), gerek, ok: v >= gerek });
  const tk = bg.filter((c) => c.tk).length, bek = bekleyenler(st, d).length;
  const kartKaldi = HAZIR.some((k) => k.kartlar.some((c) => st.kart[`${k.id}/${c.id}`] == null));
  return [
    g('xp', `Günlük hedefine ulaş: ${st.hedef} XP`, st.gun[d] ?? 0, st.hedef),
    g('soru', '10 soru çöz', bg.length, 10),
    tk + bek > 0 ? g('tekrar', 'Bugünkü tekrarlarını bitir', tk, tk + bek)
      : kartKaldi ? g('kart', '2 anlatım kartı bitir', Object.values(st.kart).filter((x) => x === d).length, 2)
      : g('dogru', '5 soruyu doğru çöz', bg.filter((c) => c.ok).length, 5),
  ];
}

/* ---------- Ödev ---------- */
/** Ödev, verildiği günden sonra konunun bütün soruları çözülünce tamamlanır. */
export const odevTamam = (st: State, o: Odev) => { const k = KONULAR[o.konu]; return !!k && k.sorular.every((s) => st.cevap.some((c) => c.k === o.konu && c.q === s.id && c.g >= o.verildi)); };
export const odevler = (st: State, kok: Kok) => kok.odev.filter((o) => KONULAR[o.konu]).map((o) => ({ o, konu: KONULAR[o.konu], tamam: odevTamam(st, o) })).sort((a, b) => a.o.son - b.o.son);

/* ---------- Çalışma programı ---------- */
/** Bir soru için ayrılan süre, dakika. */
const SORU_DK = 1.5;
export interface Is { tur: 'tekrar' | 'anlatim' | 'test'; konu?: Konu; ad: string; neden: string; dk: number; to: string }
export interface PGun { g: number; calis: boolean; isler: Is[]; dk: number }
/** Sıradaki işler: önce ödev, sonra zayıf konular, sonra yarım kalanlar, en son yeni konular. */
function isKuyrugu(st: State, kok: Kok): Is[] {
  const out: Is[] = [], var_ = new Set<string>();
  const ekle = (x: Is) => { const key = `${x.tur}:${x.konu?.id}`; if (!var_.has(key)) { var_.add(key); out.push(x); } };
  const anlatim = (k: Konu, s: KDurum, neden: string, bastan = false): Is => ({ tur: 'anlatim', konu: k, ad: `${k.ad}: ${bastan ? 'anlatımı yeniden oku' : s.kart ? 'anlatıma devam et' : 'anlatım'}`, neden, dk: Math.max(4, Math.round(bastan ? k.dk / 2 : (k.dk * (s.kartTop - s.kart)) / s.kartTop)), to: `/konu/${k.id}/anlatim${bastan ? '?kart=0' : ''}` });
  const test = (k: Konu, kalan: number, neden: string, yeniden = false): Is => ({ tur: 'test', konu: k, ad: `${k.ad}: ${yeniden ? 'testi yeniden çöz' : 'kavrama testi'}`, neden, dk: Math.ceil(kalan * SORU_DK), to: `/konu/${k.id}/test` });

  for (const { o, konu, tamam } of odevler(st, kok)) {
    if (tamam) continue;
    const s = konuDurum(st, konu), neden = `Ödev, son gün ${tarih(o.son)}`;
    if (s.kart < s.kartTop) ekle(anlatim(konu, s, neden));
    ekle(test(konu, s.top, neden, s.coz > 0));
  }
  for (const b of tekrarBak(st)) {
    if (b.d.oran == null || b.d.oran >= LV_HI) continue;
    ekle(anlatim(b.konu, b.d, b.hata ? `Doğru oranın %${Math.round(b.d.oran)}; en sık hatan: ${b.hata.yan.ad.toLocaleLowerCase('tr')}` : `Doğru oranın %${Math.round(b.d.oran)}`, true));
    ekle(test(b.konu, b.d.top, 'Okuduktan sonra kendini dene', true));
  }
  for (const k of HAZIR) {
    const s = konuDurum(st, k);
    if (!s.basladi) continue;
    if (s.kart < s.kartTop) ekle(anlatim(k, s, 'Yarım kaldı'));
    if (s.coz < s.top) ekle(test(k, s.top - s.coz, s.coz ? 'Yarım kaldı' : 'Anlatımı bitirdin, sıra testte'));
  }
  for (const k of HAZIR) {
    const s = konuDurum(st, k);
    if (s.basladi) continue;
    const eksik = onkosulEksik(st, k);
    ekle(anlatim(k, s, eksik.length ? `Sıradaki konu (önce ${eksik[0].ad} iyi olur)` : 'Sıradaki konu'));
    ekle(test(k, s.top, 'Anlatımdan sonra'));
  }
  return out;
}
/** Bugünden başlayarak 7 günlük program. Tekrar günü gelen sorular her zaman en başa yazılır. */
export function program(st: State, kok: Kok, d = bugun()): PGun[] {
  const kuyruk = isKuyrugu(st, kok);
  const acik = Object.values(st.tekrar).filter((t) => t.kutu < OGRENILDI);
  let sayilan = 0;
  return Array.from({ length: 7 }, (_, i) => {
    const g = d + i, calis = st.plan.gunler[haftaGunu(g)] !== false;
    const isler: Is[] = [];
    if (!calis) return { g, calis, isler, dk: 0 };
    const gelen = acik.filter((t) => t.son <= g).length - sayilan;
    if (gelen > 0) { sayilan += gelen; isler.push({ tur: 'tekrar', ad: `${gelen} soruyu tekrar et`, neden: i === 0 ? 'Yanlışlarının tekrar günü geldi' : 'Yanlışlarının tekrar günü', dk: Math.max(2, Math.ceil(gelen * SORU_DK)), to: '/tekrar/coz' }); }
    let dk = isler.reduce((a, x) => a + x.dk, 0);
    while (kuyruk.length && (dk + kuyruk[0].dk <= st.plan.dk * 1.2 || isler.length === 0)) { const x = kuyruk.shift()!; isler.push(x); dk += x.dk; }
    return { g, calis, isler, dk };
  });
}
/** "Şu kadar dakikam var": süreye sığacak sorular. Önce günü gelenler, sonra defterdekiler, sonra başlanmış konuların çözülmemiş soruları. */
export function hizli(st: State, dk: number, d = bugun()): { konu: Konu; soru: Soru }[] {
  const n = Math.max(3, Math.round(dk / SORU_DK)), out: { konu: Konu; soru: Soru }[] = [], var_ = new Set<string>();
  const ekle = (konu: Konu, soru: Soru) => { const id = `${konu.id}/${soru.id}`; if (!var_.has(id) && out.length < n) { var_.add(id); out.push({ konu, soru }); } };
  for (const x of bekleyenler(st, d)) ekle(x.konu, x.soru);
  for (const x of defter(st)) if (x.t.kutu < OGRENILDI) ekle(x.konu, x.soru);
  const baslanan = HAZIR.filter((k) => konuDurum(st, k).basladi), cozulen = new Set(st.cevap.map((c) => `${c.k}/${c.q}`));
  for (const k of baslanan) for (const s of k.sorular) if (!cozulen.has(`${k.id}/${s.id}`)) ekle(k, s);
  // Hâlâ yer varsa: en zayıf konudan başlayarak daha önce çözülmüş sorular.
  for (const k of [...(baslanan.length ? baslanan : HAZIR)].sort((a, b) => (konuDurum(st, a).oran ?? 0) - (konuDurum(st, b).oran ?? 0))) for (const s of k.sorular) ekle(k, s);
  return out;
}
/** Seviye taraması: her hazır konudan bir kolay, bir orta soru. */
export const tarama = (): { konu: Konu; soru: Soru }[] => HAZIR.flatMap((konu) => {
  const a = konu.sorular.find((s) => s.z === 1) ?? konu.sorular[0], b = konu.sorular.find((s) => s.z === 2 && s !== a) ?? konu.sorular.find((s) => s !== a)!;
  return [a, b].map((soru) => ({ konu, soru }));
});

/* ---------- Rozetler ---------- */
export interface Rozet { id: string; ad: string; ne: string; var: number; gerek: number; ok: boolean }
export function rozetler(st: State): Rozet[] {
  const kart = Object.keys(st.kart).length;
  let enSeri = 0, run = 0, once = -9;
  for (const g of Object.keys(st.gun).map(Number).filter((g) => st.gun[g]).sort((a, b) => a - b)) { run = g === once + 1 ? run + 1 : 1; once = g; enSeri = Math.max(enSeri, run); }
  const tamam = HAZIR.filter((k) => { const d = konuDurum(st, k); return d.kart === d.kartTop && d.coz === d.top && (d.oran ?? 0) >= 80; }).length;
  const dersler = new Set([...st.cevap.map((c) => dersOf(c.k).id), ...Object.keys(st.kart).map((id) => dersOf(id.split('/')[0]).id)]).size;
  const r = (id: string, ad: string, ne: string, v: number, gerek: number): Rozet => ({ id, ad, ne, var: Math.min(v, gerek), gerek, ok: v >= gerek });
  return [
    r('ilk', 'İlk adım', 'İlk anlatım kartını bitir', kart, 1),
    r('seri3', 'Üç gün üst üste', '3 gün art arda çalış', enSeri, 3),
    r('seri7', 'Tam bir hafta', '7 gün art arda çalış', enSeri, 7),
    r('soru50', 'Elli soru', '50 soru çöz', st.cevap.length, 50),
    r('konu', 'Konu tamam', 'Bir konunun anlatımını bitir, testinde %80 yap', tamam, 1),
    r('avci', 'Yanlış avcısı', 'Yanlış yaptığın 5 soruyu tekrarda doğru çöz', st.cevap.filter((c) => c.tk && c.ok).length, 5),
    r('emin', 'Emin ve doğru', '10 soruyu "eminim" deyip doğru çöz', st.cevap.filter((c) => c.emin && c.ok).length, 10),
    r('uc', 'Üç ders', '3 farklı derste çalış', dersler, 3),
  ];
}

/* ---------- Sınıf: sıralama ve öğretmen özeti ---------- */
/** Bu cihazdaki öğrenci hesapları, ada göre. `sinif` verilirse yalnız o sınıf. */
export const ogrenciler = (kok: Kok, sinif = ''): State[] => Object.values(kok.hesap).filter((h) => h.rol === 'ogrenci' && (!sinif || h.sinif === sinif)).sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
export const siniflar = (kok: Kok): string[] => [...new Set(Object.values(kok.hesap).filter((h) => h.rol === 'ogrenci' && h.sinif).map((h) => h.sinif))].sort((a, b) => a.localeCompare(b, 'tr'));
export interface LigSatir { id: string; ad: string; xp: number; av: Avatar; ben: boolean }
/** Bu haftanın çalışma puanına göre sınıf sıralaması. Puan doğru sayısını değil, çalışmayı ölçer. */
export function lig(kok: Kok, st: State, d = bugun()): LigSatir[] {
  return ogrenciler(kok, st.sinif).map((h) => ({ id: h.id, ad: h.ad, xp: haftaXp(h, d), av: h.avatar, ben: h.id === st.id })).sort((a, b) => b.xp - a.xp);
}
export interface SinifKonu { konu: Konu; baslayan: number; biten: number; oran: number | null }
export function sinifKonular(os: State[]): SinifKonu[] {
  return HAZIR.map((konu) => {
    let baslayan = 0, biten = 0, coz = 0, dogru = 0;
    for (const st of os) { const s = konuDurum(st, konu); if (s.basladi) baslayan++; if (durak(s) === 'tamam') biten++; coz += s.coz; dogru += s.dogru; }
    return { konu, baslayan, biten, oran: coz ? (dogru / coz) * 100 : null };
  });
}
export interface SinifHata { konu: Konu; id: string; yan: Yanilgi; n: number; kim: string[] }
/** Sınıfın ortak hataları: en çok öğrencinin yaptığı önce. */
export function sinifHatalar(os: State[]): SinifHata[] {
  const m = new Map<string, SinifHata>();
  for (const st of os) for (const h of hatalar(st)) {
    const key = `${h.konu.id}:${h.id}`, x = m.get(key) ?? { konu: h.konu, id: h.id, yan: h.yan, n: 0, kim: [] };
    x.n += h.n; x.kim.push(st.ad);
    m.set(key, x);
  }
  return [...m.values()].sort((a, b) => b.kim.length - a.kim.length || b.n - a.n);
}

export { DERSLER, HAZIR, KONULAR, dersOf };
