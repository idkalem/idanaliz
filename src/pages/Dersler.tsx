// Dersler → ders → konu. Ders sayfası konuları bir yol haritası olarak gösterir; konu sayfası üç adımı: anlatım, kavrama testi, yanlışlar.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Check, BookOpen, ListChecks, RotateCcw, Clock, Lock, Play, Info, Star } from 'lucide-react';
import { DERSLER, KONULAR, dersOf, konuBul, type Ders } from '../content';
import { useStore } from '../store';
import { dersDurum, konuDurum, hatalar, durak, yildiz, onkosulEksik, lv } from '../engine';
import { M } from '../math';
import { Page, Card, Seg, Empty, PctBar, LevelTag, Meter, Yildizlar, kOf, useTitle } from '../ui';
import { DersIkon } from '../ikon';
import { Avatar } from '../avatar';

export function Dersler() {
  const st = useStore();
  const [sinav, setSinav] = useState<'tyt' | 'ayt'>('tyt');
  return (
    <Page title="Dersler" sub="Dersini seç, yol haritasını aç. Her konuda önce anlatım, sonra kavrama testi var." actions={<Seg id="sinav" value={sinav} onChange={setSinav} options={[{ id: 'tyt', label: 'TYT' }, { id: 'ayt', label: 'AYT' }]} />}>
      {sinav === 'ayt' ? (
        <Card><Empty title="AYT konuları hazırlanıyor">Şimdilik TYT konularıyla çalışabilirsin.</Empty></Card>
      ) : (
        <div className="grid g3">
          {DERSLER.map((x) => {
            const s = dersDurum(st, x);
            return (
              <Link key={x.id} to={`/ders/${x.id}`} className={`ders ${kOf(x)}`}>
                <div className="row" style={{ gap: 14 }}>
                  <span className="ders-ic"><DersIkon id={x.id} /></span>
                  <div className="grow"><h3>{x.ad}</h3><small>{s.top} konu{s.hazir ? `, ${s.hazir} tanesi hazır` : ''}</small></div>
                  <ChevronRight size={18} className="dim" />
                </div>
                {s.hazir === 0 ? <span className="tag" style={{ alignSelf: 'flex-start' }}>Hazırlanıyor</span>
                  : s.coz || s.kart ? <PctBar p={s.oran} />
                  : <small>Henüz başlamadın</small>}
                {s.hazir > 0 && <div><Meter v={s.kart} max={s.kartTop} k={kOf(x)} /><div className="xs dim" style={{ marginTop: 6 }}>{s.kart} / {s.kartTop} anlatım kartı bitti</div></div>}
              </Link>
            );
          })}
        </div>
      )}
    </Page>
  );
}

export function DersSayfa() {
  const { id } = useParams();
  const st = useStore();
  const [gor, setGor] = useState<'yol' | 'liste'>('yol');
  const x = DERSLER.find((y) => y.id === id);
  if (!x) return <Page title="Ders bulunamadı"><Card><Empty title="Böyle bir ders yok"><Link className="btn" to="/dersler" style={{ marginTop: 12 }}>Derslere dön</Link></Empty></Card></Page>;
  const s = dersDurum(st, x), k = kOf(x);
  return (
    <Page title={x.ad} crumb={<Link to="/dersler">Dersler</Link>} sub={s.hazir ? `${s.top} konunun ${s.hazir} tanesinin anlatımı ve testi hazır. Ötekiler hazırlanıyor.` : 'Bu dersin konuları hazırlanıyor.'} actions={<Seg id="gor" value={gor} onChange={setGor} options={[{ id: 'yol', label: 'Yol haritası' }, { id: 'liste', label: 'Liste' }]} />}>
      {gor === 'yol' ? (
        <div className="grid g-main">
          <Yol x={x} />
          <div className="stack">
            <Card title="Bu derste durumun">
              {s.coz ? <PctBar p={s.oran} /> : <p className="sm mut">Henüz soru çözmedin.</p>}
              <div style={{ marginTop: 14 }}><Meter v={s.kart} max={s.kartTop || 1} k={k} /><div className="xs dim" style={{ marginTop: 6 }}>{s.kart} / {s.kartTop} anlatım kartı bitti</div></div>
            </Card>
            <Card title="Yol nasıl okunur?">
              <ul className="lejant">
                <li><span className="mini k-good"><Check size={15} strokeWidth={3} /></span><span><b>Bitti.</b> Rengi doğru oranını söyler: yeşil iyi, sarı orta, kırmızı zayıf.</span></li>
                <li><span className={`mini ${k}`}><BookOpen size={14} /></span><span><b>Sürüyor.</b> Çevresindeki halka ne kadarını bitirdiğini gösterir.</span></li>
                <li><span className={`mini bos ${k}`}><Play size={12} /></span><span><b>Sırada.</b> Henüz başlamadığın konu.</span></li>
                <li><span className="mini k-bad">3</span><span><b>Kırmızı sayı.</b> O konuda tekrar bekleyen soru sayısı.</span></li>
                <li><span className="yildizlar"><Star size={22} className="on" /></span><span><b>Yıldız.</b> Testi bitirince doğru oranına göre bir ile üç arası yıldız alırsın.</span></li>
                <li><span className="mini kilitli"><Lock size={13} /></span><span><b>Hazırlanıyor.</b> Anlatımı ve testi yazılınca açılır.</span></li>
              </ul>
            </Card>
          </div>
        </div>
      ) : (
        <Card flush>
          <div className="list">
            {x.konular.map((kn, i) => {
              const konu = KONULAR[kn.id];
              if (!konu) return (
                <div key={kn.id} className="konu-row yok">
                  <span className="no">{i + 1}</span><span>{kn.ad}</span><span /><span /><span className="tag">Hazırlanıyor</span><span />
                </div>
              );
              const d = konuDurum(st, konu);
              return (
                <Link key={kn.id} to={`/konu/${kn.id}`} className={`konu-row ${k}`}>
                  <span className="no">{i + 1}</span>
                  <div><b>{kn.ad}</b>{d.bekleyen > 0 && <div className="xs" style={{ color: 'var(--bad-ink)' }}>{d.bekleyen} soru tekrar bekliyor</div>}</div>
                  <span className="sm mut">Anlatım {d.kart} / {d.kartTop}</span>
                  {d.coz ? <PctBar p={d.oran} /> : <span className="sm dim">Test çözülmedi</span>}
                  <LevelTag p={d.oran} />
                  <ChevronRight size={17} className="dim" />
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </Page>
  );
}

/** Yol haritası: konular sırayla kıvrılan bir yolun durakları. Renk durumu söyler: yeşil bitti, dersin rengi sürüyor, gri hazırlanıyor. */
const YOL_X = 86, YOL_GENLIK = 46;
function Yol({ x }: { x: Ders }) {
  const st = useStore();
  const k = kOf(x);
  const hepsi = x.konular.map((kn) => { const konu = KONULAR[kn.id]; return { kn, konu, d: konu ? konuDurum(st, konu) : null }; });
  const simdi = hepsi.find((r) => r.d && durak(r.d) !== 'tamam')?.kn.id;
  let y = 0;
  const satirlar = hepsi.map((r, i) => {
    const h = !r.konu ? 58 : r.kn.id === simdi ? 168 : 108;
    const satir = { ...r, i, cx: YOL_X + Math.round(Math.sin(i * 0.9) * YOL_GENLIK), cy: y + h / 2, h };
    y += h;
    return satir;
  });
  const cizgi = satirlar.map((s, i) => { if (!i) return `M${s.cx} ${s.cy}`; const o = satirlar[i - 1], ym = (o.cy + s.cy) / 2; return `C${o.cx} ${ym} ${s.cx} ${ym} ${s.cx} ${s.cy}`; }).join('');
  const hazir = satirlar.filter((s) => s.d), biten = hazir.filter((s) => durak(s.d!) === 'tamam').length, yil = hazir.reduce((a, s) => a + yildiz(s.d!), 0);

  return (
    <div className={`yol-kap ${k}`}>
      <div className="yol-ozet">
        <span><b>{biten}</b> / {hazir.length} durak tamam</span>
        <span className="row yildizlar" style={{ gap: 6 }}><Star size={16} className="on" /><span><b>{yil}</b> / {hazir.length * 3} yıldız</span></span>
        <span className="dim">{satirlar.length - hazir.length} konu hazırlanıyor</span>
      </div>
      <div className="yol" style={{ height: y }}>
        <svg className="yol-cizgi" width={YOL_X + YOL_GENLIK + 40} height={y} aria-hidden="true"><path d={cizgi} /></svg>
        {satirlar.map((s) => {
          if (!s.konu || !s.d) return (
            <div key={s.kn.id} className="durak kilit" style={{ top: s.cy - s.h / 2, height: s.h }}>
              <span className="dugum" style={{ left: s.cx - 17 }}><Lock size={14} /></span>
              <div className="durak-yazi"><span>{s.kn.ad}</span><small>Hazırlanıyor</small></div>
            </div>
          );
          const d = s.d, dr = durak(d), yl = yildiz(d), burada = s.kn.id === simdi;
          const ilerleme = ((d.kart + d.coz) / (d.kartTop + d.top)) * 100;
          const eksik = dr === 'yeni' ? onkosulEksik(st, s.konu) : [];
          const ton = dr === 'tamam' ? (lv(d.oran) === 'bad' ? 'bad' : lv(d.oran) === 'mid' ? 'mid' : 'good') : '';
          return (
            <div key={s.kn.id} className={`durak ${dr} ${burada ? 'burada' : ''}`} style={{ top: s.cy - s.h / 2, height: s.h }}>
              <Link to={`/konu/${s.kn.id}`} className={`dugum buyuk ${ton}`} style={{ left: s.cx - 36, ['--p' as string]: `${dr === 'tamam' ? 100 : ilerleme}%` }} aria-label={`${s.kn.ad} konusunu aç`}>
                <span>{dr === 'tamam' ? <Check size={28} strokeWidth={3} /> : dr === 'yeni' ? <Play size={24} /> : <BookOpen size={24} />}</span>
                {d.bekleyen > 0 && <i className="rozet-say" title={`${d.bekleyen} soru tekrar bekliyor`}>{d.bekleyen}</i>}
              </Link>
              {burada && <span className="durak-av" style={{ left: s.cx - 23 }}><Avatar a={st.avatar} size={46} /></span>}
              <div className="durak-yazi">
                <Link to={`/konu/${s.kn.id}`}><b>{s.kn.ad}</b></Link>
                <small>
                  {dr === 'tamam' ? `Bitti, soruların %${Math.round(d.oran ?? 0)}'i doğru` : dr === 'yeni' ? `${d.kartTop} anlatım kartı, ${d.top} soru` : `Anlatım ${d.kart} / ${d.kartTop}${d.coz ? `, test ${d.coz} / ${d.top}` : ''}`}
                  {d.bekleyen > 0 && <span style={{ color: 'var(--bad-ink)' }}>, {d.bekleyen} soru tekrar bekliyor</span>}
                </small>
                {d.coz === d.top && <Yildizlar n={yl} />}
                {eksik.length > 0 && <small className="onkosul"><Info size={13} />Önce {eksik.map((e) => e.ad).join(', ')} konusunu bitirmen işini kolaylaştırır.</small>}
                {burada && (
                  <div className="row wrap" style={{ marginTop: 8 }}>
                    <Link className="btn lg pri" to={`/konu/${s.kn.id}/${d.kart < d.kartTop ? 'anlatim' : 'test'}`}>{dr === 'yeni' ? 'Başla' : d.kart < d.kartTop ? 'Anlatıma devam et' : 'Teste geç'}</Link>
                    {d.kart < d.kartTop && d.coz === 0 && <Link className="btn lg ghost" to={`/konu/${s.kn.id}/test`}>Biliyorum, teste geç</Link>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function KonuSayfa() {
  const { id = '' } = useParams();
  const st = useStore();
  const konu = konuBul(id);
  useTitle(konu?.ad ?? 'Konu');
  if (!konu) return <div className="page"><Card><Empty title="Bu konu hazırlanıyor">Anlatımı ve testi yazıldığında burada açılacak.<div><Link className="btn" to="/dersler" style={{ marginTop: 12 }}>Derslere dön</Link></div></Empty></Card></div>;
  const ders = dersOf(konu.id), k = kOf(ders), d = konuDurum(st, konu);
  const hs = hatalar(st).filter((h) => h.konu.id === konu.id);
  const anlatimBitti = d.kart === d.kartTop, eksik = onkosulEksik(st, konu);
  return (
    <div className={`page ${k}`}>
      <div className="konu-ust">
        <div className="grow">
          <div className="crumb"><Link to="/dersler">Dersler</Link> / <Link to={`/ders/${ders.id}`}>{ders.ad}</Link></div>
          <h1>{konu.ad}</h1>
          <p>{konu.giris}</p>
          {eksik.length > 0 && <p className="sm" style={{ display: 'flex', gap: 7, alignItems: 'center' }}><Info size={15} />Bu konu {eksik.map((e) => e.ad).join(', ')} konusuna dayanır. Önce onu bitirmen işini kolaylaştırır.</p>}
        </div>
        <div className="col" style={{ gap: 8, alignItems: 'flex-end' }}>
          {d.coz === d.top && <Yildizlar n={yildiz(d)} size={22} />}
          <span className="row" style={{ gap: 7, color: 'rgba(255,255,255,.85)', fontWeight: 600 }}><Clock size={16} />Yaklaşık {konu.dk} dakika</span>
        </div>
      </div>

      <div className="grid g3" style={{ marginBottom: 16 }}>
        <div className={`adim ${anlatimBitti ? 'bitti' : ''}`}>
          <div className="row"><span className="a-no">{anlatimBitti ? <Check size={16} strokeWidth={3} /> : 1}</span><h3>Konu anlatımı</h3></div>
          <p>{d.kartTop} kısa kart. Her kartta kural, çözümlü örnek ve bir kontrol sorusu var.</p>
          <Meter v={d.kart} max={d.kartTop} k={k} />
          <div className="row">
            <Link className="btn lg pri" to={`/konu/${konu.id}/anlatim${anlatimBitti ? '?kart=0' : ''}`}><BookOpen size={17} />{d.kart === 0 ? 'Anlatıma başla' : anlatimBitti ? 'Baştan oku' : 'Devam et'}</Link>
            <span className="sm mut">{d.kart} / {d.kartTop}</span>
          </div>
        </div>
        <div className={`adim ${d.coz === d.top ? 'bitti' : ''}`}>
          <div className="row"><span className="a-no">{d.coz === d.top ? <Check size={16} strokeWidth={3} /> : 2}</span><h3>Kavrama testi</h3></div>
          <p>{d.coz ? `Çözdüğün ${d.coz} sorunun ${d.dogru} tanesi doğru.` : `${d.top} soru. Yanlış yaptığında nerede takıldığını gösterir, çözümü adım adım açar.`}</p>
          {d.coz ? <PctBar p={d.oran} /> : <Meter v={0} max={1} />}
          <div className="row">
            <Link className={`btn lg ${anlatimBitti ? 'pri' : ''}`} to={`/konu/${konu.id}/test`}><ListChecks size={17} />{d.coz ? 'Yeniden çöz' : 'Testi çöz'}</Link>
            <LevelTag p={d.oran} />
          </div>
        </div>
        <div className={`adim ${d.coz > 0 && d.defter === 0 ? 'bitti' : ''}`}>
          <div className="row"><span className="a-no">{d.coz > 0 && d.defter === 0 ? <Check size={16} strokeWidth={3} /> : 3}</span><h3>Yanlışların</h3></div>
          <p>{d.defter ? `${d.defter} soru yanlış defterinde${d.bekleyen ? `, ${d.bekleyen} tanesi bugün tekrar bekliyor` : ''}.` : d.coz ? 'Bu konuda bekleyen yanlışın yok.' : 'Yanlış yaptığın sorular burada birikir ve aralıklarla yeniden sorulur.'}</p>
          <Meter v={d.coz ? d.coz - d.defter : 0} max={d.coz || 1} k="k-good" />
          <div className="row">
            {d.defter ? <Link className="btn lg" to={`/tekrar/coz?k=${konu.id}`}><RotateCcw size={17} />Yanlışlarını çöz</Link> : <button className="btn lg" disabled><RotateCcw size={17} />Yanlışlarını çöz</button>}
            {d.defter > 0 && <span className="sm mut">{d.defter} soru</span>}
          </div>
        </div>
      </div>

      <div className="grid g-main">
        <div className="stack">
          <Card title="Anlatım kartları" hint="İstediğin karta doğrudan gidebilirsin" flush>
            <div className="list">
              {konu.kartlar.map((c, i) => {
                const bitti = st.kart[`${konu.id}/${c.id}`] != null;
                return (
                  <Link key={c.id} to={`/konu/${konu.id}/anlatim?kart=${i}`}>
                    <span className="a-no" style={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13, flex: 'none', background: bitti ? 'var(--good)' : 'var(--sunken)', color: bitti ? '#fff' : 'var(--ink2)' }}>{bitti ? <Check size={15} strokeWidth={3} /> : i + 1}</span>
                    <span className="grow" style={{ fontWeight: 600 }}>{c.baslik}</span>
                    <ChevronRight size={17} className="dim" />
                  </Link>
                );
              })}
            </div>
          </Card>
          <Card title="Tek sayfa özet" hint="Sınavdan önce son bakış">
            <ul className="ozet-l">{konu.ozet.map((o, j) => <li key={j}><Check size={18} strokeWidth={2.8} /><span><M>{o}</M></span></li>)}</ul>
          </Card>
        </div>
        <Card title="Sık yapılan hatalar" hint="Testteki yanlış seçenekler bu hatalardan gelir">
          {Object.entries(konu.yan).map(([yid, y]) => {
            const h = hs.find((z) => z.id === yid);
            return (
              <details key={yid} className="yan" open={!!h}>
                <summary><ChevronRight size={16} /><span className="grow"><M>{y.ad}</M></span>{h && <span className="tag bad">Sen {h.n} kez yaptın</span>}</summary>
                <p><M>{y.anlat}</M></p>
                {y.ornek && <p className="orn"><M>{y.ornek}</M></p>}
              </details>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
