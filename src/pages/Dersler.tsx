// Dersler → ders → konu. Konu sayfası üç adımı gösterir: anlatım, kavrama testi, yanlışlar.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Check, BookOpen, ListChecks, RotateCcw, Clock } from 'lucide-react';
import { DERSLER, KONULAR, dersOf, konuBul } from '../content';
import { useStore } from '../store';
import { dersDurum, konuDurum, hatalar } from '../engine';
import { M } from '../math';
import { Page, Card, Seg, Empty, PctBar, LevelTag, Meter, kOf, useTitle } from '../ui';
import { DersIkon } from '../ikon';

export function Dersler() {
  const st = useStore();
  const [sinav, setSinav] = useState<'tyt' | 'ayt'>('tyt');
  return (
    <Page title="Dersler" sub="Dersini seç, konusunu aç. Her konuda önce anlatım, sonra kavrama testi var." actions={<Seg id="sinav" value={sinav} onChange={setSinav} options={[{ id: 'tyt', label: 'TYT' }, { id: 'ayt', label: 'AYT' }]} />}>
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
  const x = DERSLER.find((y) => y.id === id);
  if (!x) return <Page title="Ders bulunamadı"><Card><Empty title="Böyle bir ders yok"><Link className="btn" to="/dersler" style={{ marginTop: 12 }}>Derslere dön</Link></Empty></Card></Page>;
  const s = dersDurum(st, x), k = kOf(x);
  return (
    <Page title={x.ad} crumb={<Link to="/dersler">Dersler</Link>} sub={s.hazir ? `${s.top} konunun ${s.hazir} tanesinin anlatımı ve testi hazır. Ötekiler hazırlanıyor.` : 'Bu dersin konuları hazırlanıyor.'}>
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
    </Page>
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
  const anlatimBitti = d.kart === d.kartTop;
  return (
    <div className={`page ${k}`}>
      <div className="konu-ust">
        <div className="grow">
          <div className="crumb"><Link to="/dersler">Dersler</Link> / <Link to={`/ders/${ders.id}`}>{ders.ad}</Link></div>
          <h1>{konu.ad}</h1>
          <p>{konu.giris}</p>
        </div>
        <span className="row" style={{ gap: 7, color: 'rgba(255,255,255,.85)', fontWeight: 600 }}><Clock size={16} />Yaklaşık {konu.dk} dakika</span>
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
