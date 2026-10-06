# Logo sesi seçenekleri (giriş ve kapanış). Gerçek çalgı kayıtlarından kurulur:
# VSCO-2 Community Edition (Versilian Studios, CC0 — telifsiz, kaynak göstermek gerekmez).
# Kullanılan kayıtlar ornekler/ içinde kısaltılmış FLAC olarak durur; ham klasör yalnızca
# yeni bir kayıt gerektiğinde lazım (VSCO ortam değişkeni).
# muzik.py içinden: sting(n) → (örnek, 2) dizi, 0. saniye = logonun belirdiği an.
# Tek başına:  python sesler.py <logo.mp4> <logonun klipteki başlangıcı (sn)> <çıktı klasörü>
import sys, os, re, json, subprocess
from fractions import Fraction
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly
from scipy.io import wavfile

SR = 48000
LEN = 5.6   # sn
H = 1.3     # kırmızı noktanın patladığı an: ana vuruş
rng = np.random.default_rng(7)
ORN = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ornekler')
HAM = os.environ.get('VSCO', '')
KAT = json.load(open(os.path.join(ORN, 'katalog.json'), encoding='utf-8'))

ADLAR = {1: 'Piyano', 2: 'Arp', 3: 'Yaylılar', 4: 'Sinema', 5: 'Marimba', 6: 'Pizzicato', 7: 'Parıltı', 8: 'Davul', 9: 'Piyano ve Yaylılar'}

# Dosya adındaki nota çalgıya göre bir oktav kayık olabiliyor; ölçülen perdeyle birleştirilir.
NOTA = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
for _f, _c in KAT.items():
    m = re.search(r'_([A-G])(s?)(\d)_', _f)
    _c['ad'] = (int(m.group(3)) + 1) * 12 + NOTA[m.group(1)] + (1 if m.group(2) else 0) if m and 'Player' not in _f else None
_gr = {}
for _f, _c in KAT.items():
    if _c['ad'] is not None and _c['q'] > .9: _gr.setdefault(_f.rsplit('__', 1)[0], []).append(round((_c['midi'] - _c['ad']) / 12) * 12)
for _f, _c in KAT.items():
    if _c['ad'] is None: _c['p'] = _c['midi'] if _c['q'] >= .95 and _c['midi'] > 20 else None; continue
    kay = sorted(_gr.get(_f.rsplit('__', 1)[0], [0])); beklenen = _c['ad'] + kay[len(kay) // 2]
    _c['p'] = _c['midi'] if abs(_c['midi'] - beklenen) < .5 and 'Glock' not in _f else beklenen


def filt(x, lo=None, hi=None, order=2):
    if lo and hi: sos = butter(order, [lo, hi], 'bandpass', fs=SR, output='sos')
    elif lo: sos = butter(order, lo, 'highpass', fs=SR, output='sos')
    else: sos = butter(order, hi, 'lowpass', fs=SR, output='sos')
    return sosfilt(sos, x, axis=0)


def put(buf, sig, at, g=1.0):
    i = int(round(at * SR))
    if i < 0: sig = sig[-i:]; i = 0
    j = min(len(buf), i + len(sig))
    if j > i: buf[i:j] += sig[:j - i] * g


def smp(ad, nota=None, sure=5.0, bas=0.0, son=.3, kaynak=None):
    """Bir kayıt. nota verilirse o perdeye çekilir; sure çıktı uzunluğu, bas kaydın içinden başlangıç (sn)."""
    f = next(k for k in sorted(KAT) if ad in k); c = KAT[f]; p = os.path.join(ORN, f[:-4] + '.flac')
    if not os.path.exists(p):
        x, sr = sf.read(os.path.join(HAM, f), always_2d=True)
        x = x[max(0, int((c['on'] - .01) * sr)):][:int(9 * sr)]
        if x.shape[1] == 1: x = np.repeat(x, 2, 1)
        sf.write(p, x / np.abs(x).max() * .9, sr, subtype='PCM_16')
    x, sr = sf.read(p, always_2d=True)
    oran = 2 ** ((nota - (kaynak if kaynak is not None else c['p'])) / 12) if nota is not None else 1.0
    x = x[int(bas * sr):][:int((sure * oran + .05) * sr)]
    fr = Fraction(SR / (sr * oran)).limit_denominator(3000)
    y = resample_poly(x, fr.numerator, fr.denominator, axis=0)[:int(sure * SR)]
    y = y / np.abs(y).max(); n = len(y)
    return y * np.minimum(1, (n - np.arange(n)) / (son * SR))[:, None]


def ins(grup, nota, **kw):
    """Çalgı grubundan istenen notaya en yakın kaydı seçip o perdeye çeker."""
    ad = min((k for k in KAT if grup in k and KAT[k]['p'] is not None), key=lambda k: abs(KAT[k]['p'] - nota))
    return smp(ad, nota, **kw)


def env(x, att, rel):
    n = len(x); t = np.arange(n) / SR
    return x * (np.minimum(1, t / att) ** 1.6 * np.minimum(1, (n / SR - t) / rel) ** 1.4)[:, None]


def timpani(nota, **kw):
    """Timpani kayıtlarının perdesi adında yazmıyor: en güçlü alt sesi ölç, en yakın davulu seç."""
    best = None
    for k in sorted(KAT):
        if 'Timpani' not in k: continue
        x = smp(k, sure=1.2).mean(1); F = np.abs(np.fft.rfft(x * np.hanning(len(x)), 1 << 17)); fr = np.fft.rfftfreq(1 << 17, 1 / SR)
        sel = (fr > 60) & (fr < 300); p = 69 + 12 * np.log2(fr[sel][F[sel].argmax()] / 440)
        if best is None or abs(p - nota) < abs(best[1] - nota): best = (k, p)
    return smp(best[0], nota, kaynak=best[1], **kw)


def reverb(x, t60=2.8, pre=.02, damp=4500):
    n = int(t60 * 1.3 * SR); t = np.arange(n) / SR; ir = np.zeros((n, 2))
    for c in range(2):
        w = rng.standard_normal(n)
        ir[:, c] = filt(w, hi=700) * np.exp(-6.9 * t / (t60 * 1.25)) + filt(w, 700, damp) * np.exp(-6.9 * t / t60) + filt(w, lo=damp) * np.exp(-6.9 * t / (t60 * .4)) * .7
    ir *= np.minimum(1, t / .015)[:, None]; ir /= np.sqrt((ir ** 2).sum(0))
    p = int(pre * SR); wet = np.zeros_like(x)
    for c in range(2): wet[p:, c] = fftconvolve(x[:, c], ir[:, c])[:len(x) - p]
    return wet


def fin(x):
    x = filt(x, lo=28)
    n = len(x); x = x * np.minimum(1, (n - np.arange(n)) / (.9 * SR))[:, None]
    x = np.tanh(x / np.abs(x).max() * 1.05)
    return x * (.89 / np.abs(x).max())


st = lambda: np.zeros((int(LEN * SR), 2))
PIY = 'Player_dyn2'; CEL = 'Cello_Section__susvib'; VLA = 'Viola_Section__susvib'; VLN = 'Violin_Section__susVib'


def s1():  # Piyano (Re majör): gerçek piyanoda tek, sakin bir akor; ardından iki ince nota
    b = st()
    for i, (m, g) in enumerate([(38, .75), (45, .6), (54, .55), (57, .5), (64, .6)]): put(b, ins(PIY, m, sure=4.2, son=1.5), H - .03 + i * .024, g)
    put(b, ins(PIY, 69, sure=3.3, son=1.2), H + .72, .3); put(b, ins(PIY, 74, sure=3.3, son=1.2), H + .74, .28)
    return fin(b + reverb(b, 2.4) * .22)


def s2():  # Arp (Sol majör): çizgiyle birlikte yukarı doğru akan arp, tepe notada kalır
    b = st(); N = [43, 50, 55, 59, 62, 66, 69, 71, 74, 79, 83, 86]
    for i, m in enumerate(N): put(b, ins('Harp', m, sure=4.2, son=1.5), H - .8 * (1 - i / (len(N) - 1)) ** 1.2, .4 + .35 * i / len(N))
    return fin(b + reverb(b, 2.8) * .3)


def s3():  # Yaylılar (Fa majör 7): vuruş yok; yaylı grubu yavaşça açılır ve söner
    b = st()
    for g_, m, g in [(CEL, 41, .5), (CEL, 48, .42), (VLA, 57, .36), (VLA, 64, .33), (VLN, 69, .3), (VLN, 72, .28), (VLN, 76, .22)]:
        put(b, env(ins(g_, m, sure=4.7, bas=.05), 1.25, 2.0), .12, g)
    return fin(b + reverb(b, 3.0) * .3)


def s4():  # Sinema (Si bemol majör): zil kabarır, büyük davul ve timpani vurur, kornolar akoru tutar
    b = st()
    z = smp('roll2_cresc', sure=2.6, bas=2.3, son=1.2); put(b, z * np.minimum(1, np.arange(len(z)) / (1.36 * SR))[:, None] ** 2.2, H - 1.36, .32)
    put(b, smp('bdrum_ff_1', sure=3.6, son=1.5), H, .9); put(b, timpani(46, sure=3.6, son=1.5), H, .6)
    for m, g in [(46, .34), (53, .3), (58, .3), (62, .26)]: put(b, env(ins('F_Horn__sus', m, sure=3.9), .1, 2.2), H - .04, g)
    put(b, env(ins(CEL, 46, sure=3.9), .15, 2.2), H - .04, .3)
    return fin(b + reverb(b, 3.2) * .35)


def s5():  # Marimba (La majör): üç notalık neşeli bir yükseliş ve kısa bir cevap
    b = st(); M = 'Marimba'
    put(b, ins(M, 73, sure=2), H - .3, .5); put(b, ins(M, 76, sure=2), H - .15, .55); put(b, ins(M, 81, sure=3), H, .7)
    put(b, ins(M, 45, sure=3), H, .7); put(b, ins('Contrabass__Pizz', 45, sure=2.5), H, .5)
    put(b, ins(M, 69, sure=3), H + .45, .4); put(b, ins(M, 76, sure=3), H + .45, .4)
    return fin(b + reverb(b, 1.6) * .15)


def hit(buf, sig, at, g=1.0):
    """Vuruşun kendisi (sesin yarı tepeye ulaştığı an) tam 'at' anına gelsin."""
    put(buf, sig, at - np.argmax(np.abs(sig).max(1) > .5) / SR, g)


def s6():  # Pizzicato (Mi bemol majör), logonun hareketlerine oturtulmuş:
    # kutu belirir → harfler gelir → İ'nin noktası üç kez seker → çizgi yükselir → kırmızı nokta: akor → yazı yerine oturur
    b = st(); C = 'pizzT'; V = 'Violin_Section__Pizz'; K = 'Contrabass__Pizz'
    hit(b, ins(K, 46, sure=1.0, son=.5), .15, .3); hit(b, ins(C, 46, sure=1.0, son=.5), .15, .34)          # kutu
    hit(b, ins(C, 53, sure=.9, son=.4), .37, .36); hit(b, ins(C, 58, sure=.9, son=.4), .50, .4)             # İ'nin gövdesi, D
    for at, g in ((.73, .34), (.91, .2), (1.005, .11)): hit(b, ins(V, 74, sure=.5, son=.25), at - .025, g)         # nokta sekiyor
    hit(b, ins(V, 67, sure=.7, son=.3), 1.095, .36); hit(b, ins(V, 70, sure=.7, son=.3), 1.215, .42)          # çizgi yükseliyor
    for g_, m, g in [(K, 39, .36), (C, 51, .6), (C, 58, .52), (V, 67, .55), (V, 70, .5), (V, 75, .55)]: hit(b, ins(g_, m, sure=1.8, son=.9), 1.36, g)  # kırmızı nokta
    hit(b, ins('glock', 94, sure=3), 1.36, .1); hit(b, ins('glock', 99, sure=2.5), 1.38, .06)
    for g_, m, g in [(K, 39, .22), (C, 51, .34), (V, 63, .3), (V, 70, .25)]: hit(b, ins(g_, m, sure=2.2, son=1.0), 1.95, g)  # yazı oturuyor
    return fin(b + reverb(b, 1.8) * .2)


def s7():  # Parıltı: nota yok; çan ağacı süzülür, derinde gong, üstte tek bir çınlama
    b = st()
    put(b, smp('gong_hit_p.', sure=4.3, son=2.2), H, .55); put(b, smp('bdrum_mp_1', sure=3, son=1.5), H, .3)
    put(b, smp('BellTree_Stroke1', sure=3.6, son=1.5), H - .58, .5); put(b, smp('susp_hit_softmall_p.', sure=4, son=2), H, .3)
    put(b, ins('glock', 84, sure=3.5, son=1.5), H, .2); put(b, ins('glock', 91, sure=3.5, son=1.5), H + .01, .14)
    return fin(b + reverb(b, 3.4, damp=6000) * .4)


def s8():  # Davul: nota yok; iki tahta vuruş ve derin bir davul, "tok-tok bum"
    b = st()
    put(b, smp('LogDrumHi_MedM_v3', sure=1.2), H - .36, .55); put(b, smp('LogDrumLo_MedM_v3', sure=1.2), H - .18, .7)
    put(b, smp('bdrum_f_1', sure=3.2, son=1.6), H, 1.0); put(b, timpani(38, sure=3.0, son=1.6), H, .45)
    return fin(b + reverb(b, 2.2) * .25)


def s9():  # Piyano ve Yaylılar (Mi majör): tek piyano vuruşu, arkasından yaylılar açılır
    b = st()
    for i, (m, g) in enumerate([(40, .75), (47, .55), (56, .5)]): put(b, ins(PIY, m, sure=4.2, son=1.5), H + i * .02, g)
    for g_, m, g in [(CEL, 52, .3), (VLA, 59, .27), (VLN, 66, .24), (VLN, 68, .22), (VLN, 71, .22), (VLN, 76, .16)]:
        put(b, env(ins(g_, m, sure=4.2, bas=.05), 1.4, 1.9), H - .05, g)
    return fin(b + reverb(b, 3.0) * .3)


def sting(n):
    global rng
    rng = np.random.default_rng(7 + n)
    return globals()[f's{n}']()


if __name__ == '__main__':
    klip, t0, cikti = sys.argv[1], float(sys.argv[2]), sys.argv[3]
    os.makedirs(cikti, exist_ok=True); os.makedirs('tmp_ses', exist_ok=True)
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', klip]).decode())
    parts = []
    for n, ad in ADLAR.items():
        x = sting(n); a = np.zeros((int(dur * SR), 2)); put(a, x, t0)
        a *= np.minimum(1, (len(a) - np.arange(len(a))) / (.5 * SR))[:, None]
        wavfile.write(f'tmp_ses/{n}.wav', SR, (a * 32767).astype(np.int16))
        open(f'tmp_ses/{n}.txt', 'w', encoding='utf-8').write(f'{n}  {ad}')
        out = os.path.join(cikti, f'{n} - {ad}.mp4')
        subprocess.check_call(['ffmpeg', '-y', '-v', 'error', '-i', klip, '-i', f'tmp_ses/{n}.wav', '-vf',
                               f'drawtext=fontfile=fonts/heros-bold.otf:textfile=tmp_ses/{n}.txt:fontcolor=white@0.8:fontsize=44:x=(w-text_w)/2:y=h-150',
                               '-c:v', 'libx264', '-preset', 'fast', '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', out])
        parts.append(out)
        print(n, f'rms {np.sqrt((x ** 2).mean()):.3f}')
    open('tmp_ses/liste.txt', 'w', encoding='utf-8').write(''.join(f"file '{os.path.abspath(p).replace(chr(92), '/')}'\n" for p in parts))
    subprocess.check_call(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', 'tmp_ses/liste.txt', '-c', 'copy', '-movflags', '+faststart', os.path.join(cikti, 'Hepsi sırayla.mp4')])
