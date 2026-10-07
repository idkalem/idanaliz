// İçerik sayımı: konu konu soru türleri, yanılgıya bağlı çeldirici oranı ve süre. `npx tsx scripts/sayim.ts`
import { HAZIR } from '../src/content/index';

for (const k of HAZIR) {
  let yanlis = 0, etiketsiz = 0;
  for (const s of k.sorular) s.y.forEach((y, i) => { if (i !== s.d) { yanlis++; if (y == null) etiketsiz++; } });
  const tur = (['islem', 'baglam', 'muhakeme'] as const).map((t) => k.sorular.filter((s) => s.tur === t).length).join('/');
  console.log(`${k.id.padEnd(12)} ${k.day?.kod ?? '-'.padEnd(9)}  ${k.kartlar.length} kart  ${k.sorular.length} soru (işlem/bağlam/muhakeme ${tur})  ${k.acik?.length ?? 0} açık uçlu  çeldirici ${yanlis - etiketsiz}/${yanlis} yanılgıya bağlı  ${k.dk}+${k.tdk ?? 0} dk`);
}
