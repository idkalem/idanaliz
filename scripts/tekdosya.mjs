// dist/ içindeki derlemeyi tek bir HTML dosyasına toplar: çift tıklayınca açılan İD Analiz.html.
// Betik, stil ve yazı tipleri dosyanın içine gömülür; sunucu ya da kurulum gerekmez.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(root, 'dist', 'assets');
let html = readFileSync(join(root, 'dist', 'index.html'), 'utf8');

const css = html.match(/<link rel="stylesheet"[^>]*href="\.\/assets\/([^"]+)"[^>]*>/);
const js = html.match(/<script type="module"[^>]*src="\.\/assets\/([^"]+)"[^>]*><\/script>/);
if (!css || !js) throw new Error('dist/index.html içinde stil ya da betik bağlantısı bulunamadı; önce "vite build" çalışmalı.');

const cssText = readFileSync(join(assets, css[1]), 'utf8')
  .replace(/url\(\.\/([^)]+\.woff2)\)/g, (_, f) => `url(data:font/woff2;base64,${readFileSync(join(assets, f)).toString('base64')})`);
// Satır içi betikte HTML ayrıştırıcısını erken kapatacak diziler kaçışlanır.
const jsText = readFileSync(join(assets, js[1]), 'utf8').replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');

// Değiştirme metni işlev olarak verilir; böylece içerikteki "$&" gibi diziler yorumlanmaz.
html = html.replace(css[0], () => `<style>${cssText}</style>`).replace(js[0], () => '');
html = html.replace('</body>', () => `<script type="module">${jsText}</script>\n  </body>`);

const out = join(root, 'İD Analiz.html');
writeFileSync(out, html);
console.log(`İD Analiz.html yazıldı (${(Buffer.byteLength(html) / 1024).toFixed(0)} kB)`);
