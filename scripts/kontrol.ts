// İçerik denetimi: derlemeden önce çalışır. Hatalı içerik (yanlış anahtar, bozuk yazım, tutmayan hesap) derlemeyi durdurur.
import { DERSLER, KONULAR, HAZIR } from '../src/content/index';

const hata: string[] = [], uyari: string[] = [];
const dengeli = (s: string) => {
  let p = 0, b = 0;
  for (const c of s) { if (c === '(') p++; if (c === ')') p--; if (c === '{') b++; if (c === '}') b--; if (p < 0 || b < 0) return false; }
  return p === 0 && b === 0;
};

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

  for (const [id, y] of Object.entries(k.yan)) metinler.push([`yanılgı ${id}`, `${y.ad} ${y.anlat} ${y.ornek ?? ''}`]);
  for (const c of k.kartlar) {
    metinler.push([`kart ${c.id}`, [c.baslik, ...c.metin, ...(c.kural ?? []), c.ornek?.s ?? '', ...(c.ornek?.a ?? []), c.baska, c.soru.s, ...c.soru.o, c.soru.neden].join(' ¦ ')]);
    secenek(`kart ${c.id} sorusu`, c.soru.o, c.soru.d, c.soru.y);
  }
  k.ozet.forEach((o, i) => metinler.push([`özet ${i + 1}`, o]));
  const yerler = [0, 0, 0, 0, 0];
  for (const s of k.sorular) {
    metinler.push([`soru ${s.id}`, [s.s, ...s.o, ...s.c].join(' ¦ ')]);
    secenek(`soru ${s.id}`, s.o, s.d, s.y);
    if (s.o.length !== 5) hata.push(yer(`soru ${s.id}: 5 seçenek olmalı`));
    if (!kartlar.has(s.kart)) hata.push(yer(`soru ${s.id}: "${s.kart}" adlı kart yok`));
    if (s.c.length < 2) hata.push(yer(`soru ${s.id}: çözüm en az 2 adım olmalı`));
    yerler[s.d]++;
    if (s.h) {
      try { if (new Function(`return (${s.h});`)() !== true) hata.push(yer(`soru ${s.id}: hesap denetimi tutmuyor (${s.h})`)); }
      catch (e) { hata.push(yer(`soru ${s.id}: hesap denetimi çalışmadı (${(e as Error).message})`)); }
    }
  }
  for (const [ad, m] of metinler) for (const parca of m.split(' ¦ ')) if (!dengeli(parca)) hata.push(yer(`${ad}: parantez ya da süslü parantez dengesiz → ${parca}`));
  for (const id of Object.keys(k.yan)) if (!kullanilan.has(id)) uyari.push(yer(`"${id}" yanılgısı hiçbir seçeneğe bağlı değil`));
  if (Math.max(...yerler) > k.sorular.length / 2) uyari.push(yer(`doğru cevaplar tek harfte toplanmış: ${yerler.join(' ')}`));
  for (const kartId of kartlar) if (!k.sorular.some((s) => s.kart === kartId)) uyari.push(yer(`"${kartId}" kartına bağlı test sorusu yok`));
}

const say = HAZIR.reduce((a, k) => a + k.sorular.length + k.kartlar.length, 0);
for (const u of uyari) console.log(`uyarı  ${u}`);
for (const h of hata) console.error(`HATA   ${h}`);
console.log(`${HAZIR.length} konu, ${HAZIR.reduce((a, k) => a + k.kartlar.length, 0)} anlatım kartı, ${say} soru denetlendi: ${hata.length} hata, ${uyari.length} uyarı.`);
if (hata.length) throw new Error('İçerik denetimi başarısız.');
