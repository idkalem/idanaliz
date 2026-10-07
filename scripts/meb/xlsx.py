# xlsx -> düz metin (yalnız stdlib). Kullanım: python -I xlsx.py dosya.xlsx [sayfa adı süzgeci]
import sys, zipfile, re, io
import xml.etree.ElementTree as ET

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}

def col(ref):
    s = re.match(r'[A-Z]+', ref).group(0)
    n = 0
    for ch in s:
        n = n * 26 + ord(ch) - 64
    return n

def main(path, filt=None):
    z = zipfile.ZipFile(path)
    ss = []
    if 'xl/sharedStrings.xml' in z.namelist():
        root = ET.fromstring(z.read('xl/sharedStrings.xml'))
        for si in root.findall('m:si', NS):
            ss.append(''.join(t.text or '' for t in si.iter('{%s}t' % NS['m'])))
    wb = ET.fromstring(z.read('xl/workbook.xml'))
    rels = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    rmap = {r.get('Id'): r.get('Target') for r in rels}
    for sh in wb.find('m:sheets', NS):
        name = sh.get('name')
        if filt and filt.lower() not in name.lower():
            continue
        target = rmap[sh.get('{%s}id' % NS['r'])]
        target = target.lstrip('/')
        if not target.startswith('xl/'):
            target = 'xl/' + target
        root = ET.fromstring(z.read(target))
        print('=== SAYFA:', name)
        for row in root.iter('{%s}row' % NS['m']):
            cells = {}
            for c in row.findall('m:c', NS):
                v = c.find('m:v', NS)
                t = c.get('t')
                if t == 's' and v is not None:
                    val = ss[int(v.text)]
                elif t == 'inlineStr':
                    val = ''.join(x.text or '' for x in c.iter('{%s}t' % NS['m']))
                else:
                    val = v.text if v is not None else ''
                val = re.sub(r'\s+', ' ', val or '').strip()
                if val:
                    cells[col(c.get('r'))] = val
            if cells:
                print(row.get('r'), '|', ' | '.join('%s:%s' % (k, cells[k]) for k in sorted(cells)))

main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
