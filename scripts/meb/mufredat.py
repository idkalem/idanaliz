# MEB konu-soru dağılım tablolarının (xlsx -> txt) düz metninden src/content/mufredat.ts dosyasını üretir.
# Kullanım: python -I mufredat.py <kaynak klasörü> <çıktı .ts>
import sys, re, io, json, os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
KAYNAK, CIKTI = sys.argv[1], sys.argv[2]
DERS = [('tde', 'tde.txt', 'edebiyat2.xlsx'), ('mat', 'mat.txt', 'matematik2.xlsx'), ('fiz', 'fiz.txt', 'fizik2.xlsx'),
        ('kim', 'kim.txt', 'kimya3_2.xlsx'), ('biy', 'biy.txt', 'biyoloji2.xlsx')]
ON_EK = {'mat': 'MAT', 'fiz': 'FİZ', 'kim': 'KİM', 'biy': 'BİY'}
KUCUK = {'ve', 'ile', 'veya'}

def kucult(s):
    return s.replace('I', 'ı').replace('İ', 'i').lower()

def buyut(c):
    return {'i': 'İ', 'ı': 'I'}.get(c, c.upper())

def baslik(s):
    """BÜYÜK HARFLİ başlığı Türkçe kurallarıyla Baş Harfleri Büyük yapar. Zaten karışık yazılmışsa dokunmaz."""
    s = re.sub(r'\s+', ' ', s).strip()
    harf = [c for c in s if c.isalpha()]
    if not harf or sum(1 for c in harf if c == buyut(c) and c != kucult(c)) < 0.8 * len(harf):
        return s
    out = []
    for i, w in enumerate(kucult(s).split(' ')):
        if i and w in KUCUK:
            out.append(w); continue
        j = next((k for k, c in enumerate(w) if c.isalpha()), None)
        out.append(w if j is None else w[:j] + buyut(w[j]) + w[j + 1:])
    return ' '.join(out)

def oku(yol):
    sayfalar, ad = {}, None
    for satir in open(yol, encoding='utf-8'):
        satir = satir.rstrip('\n')
        if satir.startswith('=== SAYFA:'):
            ad = satir.split(':', 1)[1].strip(); sayfalar[ad] = []; continue
        if ' | ' not in satir: continue
        no, _, kalan = satir.partition(' | ')
        hucre = {}
        for parca in kalan.split(' | '):
            m = re.match(r'(\d+):(.*)$', parca, re.S)
            if m: hucre[int(m.group(1))] = m.group(2).strip()
            elif hucre: hucre[max(hucre)] += ' | ' + parca
        sayfalar[ad].append((int(no), hucre))
    return sayfalar

satirlar, sinavlar = [], {}
for ders, dosya, xlsx in DERS:
    for ad, rows in oku(os.path.join(KAYNAK, dosya)).items():
        m = re.match(r'(\d+)', ad)
        if not m or int(m.group(1)) not in (9, 10, 11): continue
        sinif = int(m.group(1))
        ust = next(h for n, h in rows if any('1. Dönem 1.' in v for v in h.values()))
        alt = next(h for n, h in rows if any(v.startswith('Senaryo') or 'Ülke Geneli' in v for v in h.values()))
        c1 = next(c for c, v in ust.items() if '1. Dönem 1.' in v)
        c2 = next(c for c, v in ust.items() if '1. Dönem 2.' in v)
        ulke1 = any('Ülke Geneli' in v for c, v in alt.items() if c1 <= c < c2)
        ulke2 = any('Ülke Geneli' in v for c, v in alt.items() if c >= c2)
        k1 = sorted(c for c, v in alt.items() if c1 <= c < c2 and v.startswith('Senaryo'))
        k2 = sorted(c for c, v in alt.items() if c >= c2 and v.startswith('Senaryo'))
        sinavlar[f'{ders}{sinif}'] = {'s1': len(k1), 's2': len(k2), 'ulke1': ulke1, 'ulke2': ulke2}
        tema = konu = ''
        cc = next(c for c, v in ust.items() if 'Çıktı' in v)
        for n, h in rows:
            if n < 7 or cc not in h: continue
            if cc - 2 in h: tema = baslik(h[cc - 2])
            if cc - 1 in h: konu = re.sub(r'\s+', ' ', h[cc - 1]).strip()
            m = re.match(r'((?:[A-ZÇĞİÖŞÜ]+\.?)?\d+(?:\.\d+)*)\.\s+(.*)$', h[cc])
            if not m: raise SystemExit(f'kod okunamadı: {ders}{sinif} satır {n}: {h[cc][:60]}')
            kod, cikti = m.group(1), m.group(2).strip()
            if ders in ON_EK and not kod.startswith(ON_EK[ders]): kod = f'{ON_EK[ders]}.{kod}'
            say = lambda cols: [int(float(h[c])) if c in h and re.match(r'^\d+(\.0)?$', h[c]) else 0 for c in cols]
            satirlar.append({'sinif': sinif, 'ders': ders, 'tema': tema, 'konu': konu, 'kod': kod, 'cikti': cikti, 'y1': say(k1), 'y2': say(k2)})

js = lambda x: json.dumps(x, ensure_ascii=False)
with open(CIKTI, 'w', encoding='utf-8', newline='\n') as f:
    f.write('// ÜRETİLMİŞ DOSYA. Kaynak: MEB Ölçme, Değerlendirme ve Sınav Hizmetleri Genel Müdürlüğü,\n')
    f.write('// "1. Dönem Konu Soru Dağılım Tabloları (2026-2027)", odsgm.meb.gov.tr/www/1donem-konu-soru-dagilim-tablolari-2026-2027/icerik/1724\n')
    f.write('// Tablolardaki tema, konu (içerik çerçevesi), öğrenme çıktısı ve senaryo başına soru sayıları değiştirilmeden aktarıldı.\n')
    f.write('// 12. sınıf tabloları alınmadı: 2026-2027\'de 12. sınıflar önceki programı izliyor.\n\n')
    f.write("export type MDers = 'tde' | 'mat' | 'fiz' | 'kim' | 'biy';\n")
    f.write('/** Bir öğrenme çıktısı satırı. y1, y2: birinci ve ikinci ortak yazılıda senaryo başına soru sayısı. */\n')
    f.write('export interface Satir { sinif: 9 | 10 | 11; ders: MDers; tema: string; konu: string; kod: string; cikti: string; y1: number[]; y2: number[] }\n')
    f.write('/** Ders ve sınıfa göre sınav bilgisi. ulke: sınav ülke geneli ortak yazılı olarak yapılacak, tablosu sonra yayımlanacak. */\n')
    f.write('export interface Sinav { s1: number; s2: number; ulke1: boolean; ulke2: boolean }\n\n')
    f.write('export const SINAV: Record<string, Sinav> = {\n')
    for k, v in sinavlar.items():
        f.write(f"  {k}: {{ s1: {v['s1']}, s2: {v['s2']}, ulke1: {js(v['ulke1'])}, ulke2: {js(v['ulke2'])} }},\n")
    f.write('};\n\nexport const MUFREDAT: Satir[] = [\n')
    for s in satirlar:
        f.write(f"  {{ sinif: {s['sinif']}, ders: '{s['ders']}', tema: {js(s['tema'])}, konu: {js(s['konu'])}, kod: '{s['kod']}', cikti: {js(s['cikti'])}, y1: {js(s['y1'])}, y2: {js(s['y2'])} }},\n")
    f.write('];\n')

print(len(satirlar), 'satır')
for k, v in sinavlar.items():
    r = [s for s in satirlar if f"{s['ders']}{s['sinif']}" == k]
    t1 = [sum(s['y1'][i] for s in r) for i in range(v['s1'])]
    t2 = [sum(s['y2'][i] for s in r) for i in range(v['s2'])]
    print(k, len(r), 'çıktı | 1. yazılı senaryo toplamları', t1, 'ülke' if v['ulke1'] else '', '| 2. yazılı', t2, 'ülke' if v['ulke2'] else '', '| temalar:', ' ; '.join(dict.fromkeys(s['tema'] for s in r)))
