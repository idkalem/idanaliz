// film.html'i kare kare yakalar.
// node render.mjs                       → tmp/video.mp4 (tüm film, parçalı ve paralel)
// node render.mjs --stills=3,8.5,20     → qa/*.jpg (kontrol kareleri)
// seçenekler: --fps=60 --workers=10 --from=0 --to=20 --sayfa=film.html
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.join('=') || '1']; }));
const FPS = +(args.fps || 60), N = +(args.workers || 10);
const URL = pathToFileURL(resolve(args.sayfa || 'film.html')).href + (args.q ? '?' + args.q : '');
const OUT = args.out || 'tmp';
const launch = () => puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--allow-file-access-from-files', '--hide-scrollbars', '--force-color-profile=srgb', '--force-device-scale-factor=1'] });
async function open(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() !== 'log') console.error('[sayfa]', m.text()); });
  page.on('pageerror', (e) => console.error('[sayfa hata]', e.message));
  await page.goto(URL, { waitUntil: 'load' });
  await page.evaluate(() => window.ready);
  return page;
}
const shot = async (page, t) => { await page.evaluate((x) => window.seek(x), t); return page.screenshot({ type: 'jpeg', quality: 95, optimizeForSpeed: true, captureBeyondViewport: false }); };

const b0 = await launch(), p0 = await open(b0);
const { DUR, EVENTS } = await p0.evaluate(() => ({ DUR: window.DUR, EVENTS: window.EVENTS }));
writeFileSync((args.ad || 'film') + '.events.json', JSON.stringify({ dur: DUR, events: EVENTS }));
console.log('süre', DUR.toFixed(2), 's,', EVENTS.length, 'olay');

if (args.stills) {
  mkdirSync('qa', { recursive: true });
  const ts = args.stills === 'auto' ? Array.from({ length: Math.floor(DUR / +(args.step || 3)) }, (_, i) => +(args.off || 1.5) + i * +(args.step || 3)) : args.stills.split(',').map(Number);
  const q = ts.map((t, i) => [t, i]);
  const pages = [p0, ...(await Promise.all(Array.from({ length: Math.min(N, q.length) - 1 }, async () => open(await launch()))))];
  await Promise.all(pages.map(async (page) => { while (q.length) { const [t, i] = q.shift(); writeFileSync(`qa/${String(i).padStart(3, '0')}.jpg`, await shot(page, t)); } await page.browser().close(); }));
  console.log('kareler qa/ içinde:', ts.map((t) => t.toFixed(1)).join(' '));
  process.exit(0);
}

rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });
const F0 = Math.round(+(args.from || 0) * FPS), F1 = Math.ceil(+(args.to || DUR) * FPS), per = Math.ceil((F1 - F0) / N);
let done = 0; const T0 = Date.now();
const timer = setInterval(() => console.log(`${done}/${F1 - F0} kare, ${((Date.now() - T0) / 1000).toFixed(0)} sn`), 15000);
async function shard(k) {
  const a = F0 + k * per, b = Math.min(F1, a + per); if (a >= b) return null;
  const page = k === 0 ? p0 : await open(await launch());
  for (let i = a; i < b; i++) { writeFileSync(`${OUT}/f${String(i - F0).padStart(6, '0')}.jpg`, await shot(page, i / FPS)); done++; }
  await page.browser().close();
  return 1;
}
await Promise.all(Array.from({ length: N }, (_, k) => shard(k)));
clearInterval(timer);
await new Promise((r) => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${OUT}/f%06d.jpg`,
  '-vf', 'scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv', `${OUT}/video.mp4`], { stdio: 'inherit' }).on('close', r));
console.log(`bitti: ${OUT}/video.mp4, ${F1 - F0} kare, ${((Date.now() - T0) / 1000).toFixed(0)} sn`);
process.exit(0);
