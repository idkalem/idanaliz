// İçerik denetimi: derlemeden önce çalışır. Hatalı içerik (yanlış anahtar, bozuk yazım, tutmayan hesap) derlemeyi durdurur.
import { DERSLER, KONULAR, HAZIR, MUFREDAT, type Tablo } from '../src/content/index';

const hata: string[] = [], uyari: string[] = [];
const dengeli = (s: string) => {
  let p = 0, b = 0, k = 0;
  for (const c of s) {
    if (c === '(') p++; if (c === ')') p--; if (c === '{') b++; if (c === '}') b--; if (c === '[') k++; if (c === ']') k--;
    if (p < 0 || b < 0 || k < 0) return false;
  }
  return p === 0 && b === 0 && k === 0;
};
const tabloMetni = (t?: Tablo) => (t ? [t.ad ?? '', ...t.bas, ...t.sat.flat()] : []);

for (const d of DERSLER) for (const k of d.konular) {
  const hz = KONULAR[k.id];
  if (hz && hz.ad !== k.ad) hata.push(`${k.id}: müfredattaki ad "${k.ad}" ile içerikteki ad "${hz.ad}" farklı`);
}
if (HAZIR.length !== Object.keys(KONULAR).length) hata.push('İçeriği yazılmış bir konu müfredat listesinde yok');

for (const k of HAZIR) {
  const yer = (x: string) => `${k.id} ${x}`;
  const metinler: [string, string][] = [];
  const kullanilan = new Set<string>();
  const kartlar = new Set(k.kartlar.map((c) => c.id));
  if (kartlar.size !== k.kartlar.length) hata.push(yer('kart kimlikleri yineleniyor'));
  if (k.kartlar.length < 4) hata.push(yer('en az 4 anlatım kartı olmalı'));
  if (k.sorular.length < 6) hata.push(yer('en az 6 soru olmalı'));
  if (new Set(k.sorular.map((s) => s.id)).size !== k.sorular.length) hata.push(yer('soru kimlikleri yineleniyor'));

  const secenek = (ad: string, o: string[], d: number, y: (string | null)[] | undefined) => {
    if (d < 0 || d >= o.length) hata.push(yer(`${ad}: doğru seçenek aralık dışında`));
    if (new Set(o).size !== o.length) hata.push(yer(`${ad}: aynı seçenek iki kez yazılmış`));
    if (y) {
      if (y.length !== o.length) hata.push(yer(`${ad}: yanılgı listesi seçenek sayısıyla aynı uzunlukta değil`));
      if (y[d] != null) hata.push(yer(`${ad}: doğru seçeneğe yanılgı bağlanmış`));
      for (const id of y) if (id != null) { kullanilan.add(id); if (!k.yan[id]) hata.push(yer(`${ad}: "${id}" adlı yanılgı tanımlı değil`)); }
    }
  };

  const tablo = (ad: string, t?: Tablo) => {
    if (!t) return;
    if (t.bas.length < 2 || !t.sat.length) hata.push(yer(`${ad}: tablo en az iki sütun ve bir satır olmalı`));
    t.sat.forEach((r, i) => { if (r.length !== t.bas.length) hata.push(yer(`${ad}: tablonun ${i + 1}. satırında ${r.length} hücre var, başlıkta ${t.bas.length}`)); });
  };

  // Resmî dayanağı olan konu: öğrenme çıktısı tabloda bulunmalı, anlatım ve test birlikte 30 dakika tutmalı.
  if (k.day) {
    if (!MUFREDAT.some((r) => r.kod === k.day!.kod)) hata.push(yer(`dayanak: "${k.day.kod}" kodlu öğrenme çıktısı tabloda yok`));
    if (!k.day.surec.length || !k.day.sira.length) hata.push(yer('dayanak: süreç bileşenleri ve anlatım sırası yazılmalı'));
    if (k.dk + (k.tdk ?? 0) !== 30) uyari.push(yer(`anlatım ve test süresi ${k.dk + (k.tdk ?? 0)} dakika; hedef 30`));
    metinler.push(['dayanak', [k.day.kapsam, k.day.kitap, ...k.day.surec, ...k.day.sira].join(' ¦ ')]);
    for (const c of k.kartlar) if (!c.giris) uyari.push(yer(`kart ${c.id}: giriş durumu yok`));
    for (const s of k.sorular) { if (!s.tur) hata.push(yer(`soru ${s.id}: türü yazılmamış`)); if (!s.kay) uyari.push(yer(`soru ${s.id}: kaynağı yazılmamış`)); }
    if (!k.sorular.some((s) => s.tur === 'baglam') || !k.sorular.some((s) => s.tur === 'muhakeme')) hata.push(yer('testte bağlam temelli ve muhakeme sorusu bulunmalı'));
  }
  metinler.push(['giriş', k.giris]);

  for (const [id, y] of Object.entries(k.yan)) metinler.push([`yanılgı ${id}`, `${y.ad} ${y.anlat} ${y.ornek ?? ''}`]);
  for (const c of k.kartlar) {
    metinler.push([`kart ${c.id}`, [c.baslik, c.giris ?? '', ...c.metin, ...tabloMetni(c.tablo), ...(c.kural ?? []), c.ornek?.s ?? '', ...(c.ornek?.a ?? []), c.baska, c.soru.s, ...c.soru.o, c.soru.neden].join(' ¦ ')]);
    secenek(`kart ${c.id} sorusu`, c.soru.o, c.soru.d, c.soru.y);
    tablo(`kart ${c.id}`, c.tablo);
  }
  for (const a of k.acik ?? []) {
    metinler.push([`yazılı ${a.id}`, [a.baslik, ...(a.b ?? []), ...tabloMetni(a.t), ...a.alt, ...a.adim.map((x) => x.m)].join(' ¦ ')]);
    tablo(`yazılı ${a.id}`, a.t);
    if (!a.alt.length || a.alt.length > 6) hata.push(yer(`yazılı ${a.id}: 1 ile 6 arası istenen olmalı`));
    const p = a.adim.reduce((x, y) => x + y.p, 0);
    if (p !== 10) hata.push(yer(`yazılı ${a.id}: puanlama anahtarı ${p} puan ediyor, 10 olmalı`));
    if (a.adim.some((x) => x.p <= 0)) hata.push(yer(`yazılı ${a.id}: puansız adım var`));
  }
  if (new Set((k.acik ?? []).map((a) => a.id)).size !== (k.acik ?? []).length) hata.push(yer('yazılı soru kimlikleri yineleniyor'));
  k.ozet.forEach((o, i) => metinler.push([`özet ${i + 1}`, o]));
  const yerler = [0, 0, 0, 0, 0];
  for (const s of k.sorular) {
    metinler.push([`soru ${s.id}`, [s.s, ...(s.b ?? []), ...tabloMetni(s.t), ...s.o, ...s.c].join(' ¦ ')]);
    secenek(`soru ${s.id}`, s.o, s.d, s.y);
    tablo(`soru ${s.id}`, s.t);
    if (s.tur === 'baglam' && !s.b && !s.t) hata.push(yer(`soru ${s.id}: bağlam temelli soruda bağlam ya da tablo yok`));
    if (s.o.length !== 5) hata.push(yer(`soru ${s.id}: 5 seçenek olmalı`));
    if (!kartlar.has(s.kart)) hata.push(yer(`soru ${s.id}: "${s.kart}" adlı kart yok`));
    if (s.c.length < 2) hata.push(yer(`soru ${s.id}: çözüm en az 2 adım olmalı`));
    yerler[s.d]++;
    if (s.h) {
      try { if (new Function(`return (${s.h});`)() !== true) hata.push(yer(`soru ${s.id}: hesap denetimi tutmuyor (${s.h})`)); }
      catch (e) { hata.push(yer(`soru ${s.id}: hesap denetimi çalışmadı (${(e as Error).message})`)); }
    }
  }
  for (const [ad, m] of metinler) for (const parca of m.split(' ¦ ')) if (!dengeli(parca)) hata.push(yer(`${ad}: parantez, köşeli ya da süslü parantez dengesiz → ${parca}`));
  for (const id of Object.keys(k.yan)) if (!kullanilan.has(id)) uyari.push(yer(`"${id}" yanılgısı hiçbir seçeneğe bağlı değil`));
  if (Math.max(...yerler) > k.sorular.length / 2) uyari.push(yer(`doğru cevaplar tek harfte toplanmış: ${yerler.join(' ')}`));
  for (const kartId of kartlar) if (!k.sorular.some((s) => s.kart === kartId)) uyari.push(yer(`"${kartId}" kartına bağlı test sorusu yok`));
}

const say = HAZIR.reduce((a, k) => a + k.sorular.length + k.kartlar.length, 0);
for (const u of uyari) console.log(`uyarı  ${u}`);
for (const h of hata) console.error(`HATA   ${h}`);
console.log(`${HAZIR.length} konu, ${HAZIR.reduce((a, k) => a + k.kartlar.length, 0)} anlatım kartı, ${say} soru denetlendi: ${hata.length} hata, ${uyari.length} uyarı.`);
if (hata.length) throw new Error('İçerik denetimi başarısız.');
