// Uygulamadan ekran görüntüsü ve öğe konumu toplar.
// node shots.mjs <plan dosyası> <çıktı klasörü> [ölçek=2] [yalnız id,id]
import puppeteer from 'puppeteer-core';
import { pathToFileURL } from 'node:url';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const [planFile, outDir, scaleArg, only] = process.argv.slice(2);
const SCALE = +(scaleArg || 2), W = 1440, H = 810;
const { default: plan } = await import(pathToFileURL(resolve(planFile)).href);
const list = only ? plan.filter((p) => only.split(',').includes(p.id)) : plan;
mkdirSync(outDir, { recursive: true });
const APPURL = pathToFileURL(resolve('..', 'İD Analiz.html')).href;
const launch = () => puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--allow-file-access-from-files', '--hide-scrollbars', '--force-color-profile=srgb'] });

// sayfa içinde çalışır: seçici + metinle öğe bulur
const FIND = `window.__findAll = (q) => {
  if (typeof q === 'string') q = { sel: q };
  let els = [...document.querySelectorAll(q.sel || '*')];
  if (q.text) els = els.filter((e) => (q.exact ? e.textContent.trim() === q.text : e.textContent.includes(q.text)));
  if (q.text && !q.sel) els = els.filter((e) => ![...e.children].some((c) => c.textContent.includes(q.text)));
  if (q.within) { const w = window.__find(q.within); els = els.filter((e) => w && w.contains(e)); }
  return els;
};
window.__find = (q) => { let el = window.__findAll(q)[(q && q.nth) || 0] || null; if (el && q.up) el = el.closest(q.up); return el; };`;

async function shoot(p, browser) {
  const page = await browser.newPage();
  page.setDefaultTimeout(25000);
  await page.setViewport({ width: W, height: p.h || H, deviceScaleFactor: SCALE });
  await page.evaluateOnNewDocument((per, theme) => {
    try { localStorage.setItem('netlik.v1', JSON.stringify({ theme, per, level: 0, watch: [], notes: [], envOpen: [], views: [], assign: {} })); } catch {}
  }, p.per || 'yil', p.theme || 'light');
  await page.goto(`${APPURL}?anim=0&tema=${p.theme === 'dark' ? 'koyu' : 'acik'}#${p.url}`, { waitUntil: 'load' });
  await page.evaluate(FIND);
  await new Promise((r) => setTimeout(r, 500));
  const out = { id: p.id, url: p.url, w: W, h: p.h || H, states: [] };
  const snap = async (name, grab = {}) => {
    await new Promise((r) => setTimeout(r, 350));
    const rects = await page.evaluate((g) => {
      const o = {};
      const R = (e) => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
      for (const k in g) { if (g[k] && g[k].all) { o[k] = window.__findAll(g[k]).map(R); continue; } const e = window.__find(g[k]); if (e) { const r = e.getBoundingClientRect(); o[k] = [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; } else o[k] = null; }
      return o;
    }, grab);
    const file = `${p.id}${name ? '-' + name : ''}.png`;
    await page.screenshot({ path: join(outDir, file), type: 'png' });
    out.states.push({ name: name || '', file, rects, scrollY: await page.evaluate(() => (document.scrollingElement || document.body).scrollTop) });
  };
  if (p.dump) {
    out.dump = await page.evaluate(() => [...document.querySelectorAll('h1,h2,h3,.card-h,.tabs button,.seg button,th,.tile .t-l')].map((e) => { const r = e.getBoundingClientRect(); return `${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.split(' ').join('.') : ''} @${Math.round(r.x)},${Math.round(r.y + scrollY)} ${Math.round(r.width)}x${Math.round(r.height)} | ${e.textContent.trim().slice(0, 60)}`; }));
    out.pageH = await page.evaluate(() => document.documentElement.scrollHeight);
  }
  for (const s of p.steps || [{ snap: '' }]) {
    if (s.click) {
      const ok = await page.evaluate((q) => { const e = window.__find(q); if (!e) return false; e.scrollIntoView({ block: 'nearest' }); e.click(); return true; }, s.click);
      if (!ok) console.error(`[${p.id}] tıklanacak öğe yok:`, JSON.stringify(s.click));
      await new Promise((r) => setTimeout(r, s.wait || 400));
    }
    if (s.scroll != null) await page.evaluate((q) => { if (typeof q === 'number') { window.scrollTo(0, q); return; } const e = window.__find(q.to || q); if (e) { const r = e.getBoundingClientRect(); window.scrollTo(0, r.y + scrollY - (q.top ?? 90)); } }, s.scroll);
    if (s.hover) { const r = await page.evaluate((q) => { const e = window.__find(q); if (!e) return null; const b = e.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; }, s.hover); if (r) await page.mouse.move(r[0], r[1]); }
    if (s.type) await page.keyboard.type(s.type);
    if (s.snap != null) await snap(s.snap, s.grab);
  }
  await page.close();
  return out;
}

const res = [];
const queue = [...list];
await Promise.all(Array.from({ length: Math.min(8, queue.length) }, async () => {
  let browser = await launch();
  while (queue.length) {
    const p = queue.shift();
    try { res.push(await Promise.race([shoot(p, browser), new Promise((_, no) => setTimeout(() => no(new Error('zaman aşımı')), 45000))])); }
    catch (e) { console.error(`[${p.id}] ${e.message}`); try { browser.process().kill(); } catch {} browser = await launch(); }
  }
  await browser.close().catch(() => {});
}));
res.sort((a, b) => list.findIndex((p) => p.id === a.id) - list.findIndex((p) => p.id === b.id));
let all = res;
if (only && existsSync(join(outDir, 'shots.json'))) { all = JSON.parse(readFileSync(join(outDir, 'shots.json'), 'utf8')); for (const r of res) { const i = all.findIndex((p) => p.id === r.id); if (i >= 0) all[i] = r; else all.push(r); } }
writeFileSync(join(outDir, 'shots.json'), JSON.stringify(all));
writeFileSync(join(outDir, 'shots.js'), 'window.SHOTS=' + JSON.stringify(all) + ';');
for (const r of res) { console.log(`== ${r.id}  ${r.states.map((s) => s.file).join(' ')}${r.pageH ? '  pageH=' + r.pageH : ''}`); if (r.dump) console.log(r.dump.join('\n')); }
