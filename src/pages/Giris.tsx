// Giriş: bu cihazdaki hesaplar. Hesabını seç, dört haneli şifreni gir.
import { useEffect, useState } from 'react';
import { Plus, Delete, ArrowLeft, Sun, Moon, GraduationCap, Database, Trash2 } from 'lucide-react';
import { APP } from '../content';
import { useKok, setKok, girisYap, hesapAc, type State } from '../store';
import { siniflar } from '../engine';
import { demoYukle, demoKaldir, demoVar, DEMO_PIN } from '../demo';
import { Logo, Seg, useTitle } from '../ui';
import { Avatar, AV_RENK } from '../avatar';

export default function Giris() {
  const kok = useKok();
  useTitle('Giriş');
  const hs = Object.values(kok.hesap).sort((a, b) => (a.rol === b.rol ? a.ad.localeCompare(b.ad, 'tr') : a.rol === 'ogrenci' ? -1 : 1));
  const [sec, setSec] = useState<State | null>(null);
  const [yeni, setYeni] = useState(false);
  const ornek = demoVar(kok);

  return (
    <div className="giris">
      <header className="giris-ust">
        <Logo />
        <div className="grow"><b>{APP}</b><small>Ders çalışma portalı</small></div>
        <button className="btn ghost icon" aria-label={kok.tema === 'dark' ? 'Açık tema' : 'Koyu tema'} onClick={() => setKok({ tema: kok.tema === 'dark' ? 'light' : 'dark' })}>{kok.tema === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
      </header>

      {sec ? <Sifre h={sec} geri={() => setSec(null)} />
        : yeni || !hs.length ? <Yeni geri={hs.length ? () => setYeni(false) : undefined} siniflar={siniflar(kok)} />
        : (
          <>
            <h1>Kim çalışacak?</h1>
            <p className="giris-alt">Hesabını seç. Çalışman, yanlışların ve avatarın hesabında durur.</p>
            <div className="hesaplar">
              {hs.map((h) => (
                <button key={h.id} className="hesap" onClick={() => setSec(h)}>
                  <Avatar a={h.avatar} size={84} />
                  <b className="clip">{h.ad}</b>
                  {h.rol === 'ogretmen' ? <span className="tag info"><GraduationCap size={13} />Öğretmen</span> : <small>{h.sinif || 'Öğrenci'}</small>}
                </button>
              ))}
              <button className="hesap yeni" onClick={() => setYeni(true)}>
                <span className="arti"><Plus size={34} /></span>
                <b>Yeni hesap</b>
                <small>Öğrenci ya da öğretmen</small>
              </button>
            </div>
          </>
        )}

      <footer className="giris-alt-not">
        <p>Hesaplar yalnızca bu cihazda saklanır. Şifre, hesapların karışmaması içindir.</p>
        {ornek
          ? <button className="btn ghost" onClick={() => { setSec(null); demoKaldir(); }}><Trash2 size={15} />Örnek sınıfı kaldır</button>
          : <button className="btn ghost" onClick={() => { setYeni(false); demoYukle(); }}><Database size={15} />Örnek sınıfı yükle</button>}
      </footer>
    </div>
  );
}

/** Dört haneli şifre: büyük tuşlar tahtada dokunmak için, klavye de çalışır. */
function Sifre({ h, geri }: { h: State; geri: () => void }) {
  const [pin, setPin] = useState('');
  const [hata, setHata] = useState(false);
  const bas = (r: string) => { setHata(false); setPin((p) => (p.length < 4 ? p + r : p)); };
  const sil = () => { setHata(false); setPin((p) => p.slice(0, -1)); };
  useEffect(() => {
    if (pin.length < 4) return;
    if (!girisYap(h.id, pin)) { setHata(true); setPin(''); }
  }, [pin, h.id]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (/^\d$/.test(e.key)) bas(e.key); else if (e.key === 'Backspace') sil(); else if (e.key === 'Escape') geri(); };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });
  return (
    <div className="sifre">
      <Avatar a={h.avatar} size={104} />
      <h1>{h.ad}</h1>
      <p className="giris-alt">{hata ? 'Şifre yanlış. Yeniden dene.' : 'Dört haneli şifreni gir.'}</p>
      <div className={`noktalar ${hata ? 'hata' : ''}`} aria-label={`${pin.length} / 4 hane girildi`}>{[0, 1, 2, 3].map((i) => <i key={i} className={i < pin.length ? 'on' : ''} />)}</div>
      <div className="tuslar">
        {'123456789'.split('').map((r) => <button key={r} onClick={() => bas(r)}>{r}</button>)}
        <button className="yan" aria-label="Geri dön" onClick={geri}><ArrowLeft size={22} /></button>
        <button onClick={() => bas('0')}>0</button>
        <button className="yan" aria-label="Son haneyi sil" onClick={sil}><Delete size={22} /></button>
      </div>
      {h.id.startsWith('demo-') && <p className="note">Örnek hesapların şifresi {DEMO_PIN}.</p>}
    </div>
  );
}

function Yeni({ geri, siniflar: ss }: { geri?: () => void; siniflar: string[] }) {
  const [ad, setAd] = useState('');
  const [sinif, setSinif] = useState(ss[0] ?? '');
  const [pin, setPin] = useState('');
  const [rol, setRol] = useState<State['rol']>('ogrenci');
  const [renk, setRenk] = useState(0);
  const tamam = ad.trim().length > 0 && /^\d{4}$/.test(pin);
  return (
    <form className="yeni-hesap" onSubmit={(e) => { e.preventDefault(); if (tamam) hesapAc({ ad, sinif: rol === 'ogrenci' ? sinif : '', pin, rol, renk }); }}>
      <h1>Yeni hesap</h1>
      <p className="giris-alt">Bir dakikada hazır. Avatarını sonra Profil'den süslersin.</p>
      <div className="row" style={{ justifyContent: 'center', margin: '18px 0 6px' }}><Avatar a={{ renk, desen: 0, goz: 0, agiz: 0, bas: 0, gozluk: 0, boyun: 0, zemin: 0 }} size={96} /></div>
      <div className="renkler" style={{ justifyContent: 'center' }}>
        {AV_RENK.map((c, i) => <button type="button" key={c} className={renk === i ? 'on' : ''} style={{ ['--c' as string]: c }} aria-label={`Renk ${i + 1}`} aria-pressed={renk === i} onClick={() => setRenk(i)} />)}
      </div>
      <div className="row" style={{ justifyContent: 'center', margin: '18px 0 4px' }}><Seg id="rol" value={rol} onChange={setRol} options={[{ id: 'ogrenci', label: 'Öğrenciyim' }, { id: 'ogretmen', label: 'Öğretmenim' }]} /></div>
      <label><span>Adın</span><input className="input" value={ad} onChange={(e) => setAd(e.target.value)} maxLength={24} autoFocus placeholder="Örneğin Deniz" /></label>
      {rol === 'ogrenci' && <label><span>Sınıfın</span><input className="input" value={sinif} onChange={(e) => setSinif(e.target.value)} maxLength={8} placeholder="Örneğin 9-A" list="siniflar" /><datalist id="siniflar">{ss.map((s) => <option key={s} value={s} />)}</datalist></label>}
      <label><span>Dört haneli şifre</span><input className="input" type="password" inputMode="numeric" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" /></label>
      <div className="row" style={{ marginTop: 18 }}>
        {geri && <button type="button" className="btn lg" onClick={geri}>Vazgeç</button>}
        <span className="grow" />
        <button className="btn lg pri" disabled={!tamam}>Hesabı aç</button>
      </div>
    </form>
  );
}
