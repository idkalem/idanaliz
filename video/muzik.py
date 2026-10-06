# Filmin müziğini ve efekt seslerini üretir: python muzik.py [olaylar.json] [cikti.wav] [logo sesi 1-9, 0 = eski çan]
# 120 BPM, Do majör (C–G–Am–F). Olay zamanları film.html'den gelir (render.mjs yazar).
import json, sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

src = sys.argv[1] if len(sys.argv) > 1 else 'film.events.json'
out = sys.argv[2] if len(sys.argv) > 2 else 'ses.wav'
STING = int(sys.argv[3]) if len(sys.argv) > 3 else 6
E = json.load(open(src, encoding='utf-8'))
DUR, EV = E['dur'], E['events']
SR = 48000
N = int((DUR + 0.3) * SR)
rng = np.random.default_rng(11)


def filt(x, lo=None, hi=None, order=2):
    if lo and hi: sos = butter(order, [lo, hi], 'bandpass', fs=SR, output='sos')
    elif lo: sos = butter(order, lo, 'highpass', fs=SR, output='sos')
    else: sos = butter(order, hi, 'lowpass', fs=SR, output='sos')
    return sosfilt(sos, x, axis=0)


def put(buf, sig, at, g=1.0, pan=0.0):
    i = int(round(at * SR))
    if i < 0 or i >= N: return
    j = min(N, i + len(sig)); s = sig[:j - i] * g
    a = (pan + 1) * np.pi / 4
    buf[i:j, 0] += s * np.cos(a); buf[i:j, 1] += s * np.sin(a)


def tone(f, dur, tau, harm=(1.0,), att=0.004):
    t = np.arange(int(dur * SR)) / SR
    x = sum(a * np.sin(2 * np.pi * f * (k + 1) * t) for k, a in enumerate(harm))
    return x * np.exp(-t / tau) * np.minimum(1, t / att)


def noise(dur): return rng.standard_normal(int(dur * SR))
def tt(dur): return np.arange(int(dur * SR)) / SR
mf = lambda m: 440 * 2 ** ((m - 69) / 12)

times = lambda k: [e['t'] for e in EV if e['k'] == k]
drops, hits = times('drop'), times('hit')
first, outro = drops[0], times('outro')[0]
cards = [(h, min(d for d in drops if d > h)) for h in hits]
in_card = lambda t: any(h - .01 <= t < d - .01 for h, d in cards)
groove = lambda t: first - .01 <= t < outro - .01 and not in_card(t)
lv = [first, cards[0][1], cards[1][1], cards[1][1] + 30.8, cards[2][1]]
level = lambda t: sum(t >= x - .01 for x in lv)

PROG = [  # bas, pad, arp
    (36, [48, 55, 60, 64], [60, 64, 67, 72, 76]),
    (43, [55, 59, 62, 67], [59, 62, 67, 71, 74]),
    (45, [57, 60, 64, 69], [60, 64, 69, 72, 76]),
    (41, [53, 57, 60, 65], [60, 65, 69, 72, 77]),
]
chord = lambda t: PROG[int(t // 2) % 4]
PAT = [0, 2, 1, 3, 2, 4, 3, 1]

drum, bass, arp, pad, sfx, lg = (np.zeros((N, 2)) for _ in range(6))

# davul örnekleri
t = tt(.32); kick = np.sin(2 * np.pi * np.cumsum(48 + 105 * np.exp(-t / .035)) / SR) * np.exp(-t / .14)
hat = filt(noise(.06), lo=7000) * np.exp(-tt(.06) / .012)
t = tt(.25); cl = filt(noise(.25), 900, 3500)
clap = cl * (np.exp(-t / .07) * .6 + sum(np.exp(-np.abs(t - d) / .003) for d in (0, .011, .022)) * .5)
sc = np.ones(N)

b = first
while b < outro - .01:
    if groove(b):
        L, bar = level(b), int(round((b % 2) / .5))
        put(drum, kick, b, .62)
        i = int(b * SR); n = min(N - i, int(.4 * SR)); sc[i:i + n] *= 1 - .5 * np.exp(-tt(.4)[:n] / .11)
        if L >= 2: put(drum, hat, b + .25, .12, .2)
        if L >= 4:
            put(drum, hat, b + .125, .045, -.3); put(drum, hat, b + .375, .045, .3)
        if L >= 3 and bar in (1, 3): put(drum, clap, b, .2)
        root = mf(chord(b)[0])
        put(bass, tone(root, .26, .2, (1, .5, .22)), b, .2)
        put(bass, tone(root, .26, .16, (1, .5, .22)), b + .25, .34)
    b += .5

# arpej (kartlarda ve kapanışta kısık sürer)
a = first; k = 0
while a < outro + 2.0:
    g = .2 if groove(a) else .1
    notes = chord(a)[2]; nt = notes[PAT[int(round((a % 2) / .25)) % 8]]
    put(arp, tone(mf(nt), .6, .17, (1, .35, .12, .05)), a, g, .4 if k % 2 else -.4)
    if groove(a) and level(a) >= 4: put(arp, tone(mf(nt + 12), .4, .1, (1, .2)), a + .125, .06, -.5 if k % 2 else .5)
    a += .25; k += 1

# ped: her ölçüde akor, yumuşak giriş-çıkış
t = tt(2.7); env = np.minimum(1, t / .45) * np.minimum(1, (2.7 - t) / .7)
for i in range(int(DUR // 2) + 1):
    x = np.zeros(len(t))
    for m in PROG[i % 4][1]:
        for det in (1.0, 1.004):
            f = mf(m) * det
            x += sum(np.sin(2 * np.pi * f * h * t + i) / h for h in range(1, 6))
    put(pad, x * env, i * 2.0, .02)
pad = filt(pad, hi=1500)
pad *= np.minimum(1, np.arange(N) / (2.5 * SR))[:, None] ** 1.5

# efektler
click = tone(2300, .03, .006) + filt(noise(.03), lo=4000) * np.exp(-tt(.03) / .003) * .6
tick = tone(1500, .06, .013, (1, .3))
t = tt(.12); pop = np.sin(2 * np.pi * np.cumsum(520 + 420 * np.minimum(1, t / .07)) / SR) * np.exp(-t / .03)
t = tt(.6); wh = filt(noise(.6), 300, 5000) * np.sin(np.pi * t / .6) ** 2
t = tt(.4); mv = filt(noise(.4), 500, 3500) * np.sin(np.pi * t / .4) ** 2
t = tt(1.1); boom = np.sin(2 * np.pi * np.cumsum(40 + 50 * np.exp(-t / .05)) / SR) * np.exp(-t / .33) + filt(noise(1.1), hi=900) * np.exp(-t / .08) * .5
t = tt(1.3); crash = filt(noise(1.3), lo=5000) * np.exp(-t / .33)
for e in EV:
    k, at = e['k'], e['t']
    if k == 'click': put(sfx, click, at, .34)
    elif k == 'tick': put(sfx, tick, at, .09, .15)
    elif k == 'pop': put(sfx, pop, at, .15, -.15)
    elif k == 'move': put(sfx, mv, at - .1, .05)
    elif k == 'whoosh':
        n = min(len(wh), N - int(at * SR)); p = np.linspace(-.6, .6, len(wh))
        i = int(at * SR); sfx[i:i + n, 0] += wh[:n] * .2 * np.cos((p[:n] + 1) * np.pi / 4); sfx[i:i + n, 1] += wh[:n] * .2 * np.sin((p[:n] + 1) * np.pi / 4)
    elif k in ('hit', 'outro'): put(sfx, boom, at, .5)
    elif k == 'drop':
        put(drum, kick, at, .3); put(sfx, crash, at, .1)
        for m in chord(at)[2][:4]: put(arp, tone(mf(m), 1.4, .5, (1, .3, .1)), at, .09)
    elif k == 'rise' and STING:  # logo sesi (sesler.py); girişte müzik başlayınca geri çekilir
        from sesler import sting
        x = sting(STING); t = np.arange(len(x)) / SR
        if at < first: x = x * (1 - np.clip((t - (first - at - .45)) / .6, 0, 1))[:, None]  # tonlar farklı: müzik başlarken tamamen çekilir
        j = min(N, int(at * SR) + len(x)); lg[int(at * SR):j] += x[:j - int(at * SR)] * .5
    elif k == 'rise':  # eski logo sesi: çan arpeji, yazı gelince akor
        for i, m in enumerate((72, 76, 79, 84)): put(arp, tone(mf(m), 1.6, .5, (1, .4, .15)), at + .8 + i * .14, .15, -.4 + i * .27)
        put(arp, tone(mf(88), 1.2, .35, (1, .3)), at + 1.32, .1, .4)
        for m in (48, 60, 64, 67, 72): put(arp, tone(mf(m), 3.0, 1.1, (1, .35, .12)), at + 1.65, .11)

# karıştırma
duck = sc[:, None]
dry = drum + bass * duck + arp * (0.6 + 0.4 * duck) + pad * duck + sfx
bus = arp + sfx * .5 + pad * .3 + drum * .08
t = tt(1.8); ir = np.stack([filt(noise(1.8), 300, 6000) * np.exp(-t / .42) for _ in range(2)], 1); ir /= np.sqrt((ir ** 2).sum(0))
wet = np.stack([fftconvolve(bus[:, c], ir[:, c])[:N] for c in range(2)], 1)
mix = dry + wet * .2 + lg
fade = np.minimum(1, (N - np.arange(N)) / (1.6 * SR))[:, None]
mix = np.tanh(mix * 1.5) * fade
mix *= .9 / np.abs(mix).max()
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print(f'{out}: {N / SR:.1f} sn, tepe {np.abs(mix).max():.2f}, rms {np.sqrt((mix ** 2).mean()):.3f}')
