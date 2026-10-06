// Rapor: ne kadar çalıştım, nerede zorlanıyorum, hangi hatayı tekrar ediyorum.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, Percent, CalendarDays, RotateCcw, Printer, ChevronRight, TriangleAlert, BookOpen } from 'lucide-react';
import { useStore, bugun } from '../store';
import { ozet, ozetCumle, tekrarBak, hatalar, bekleyenler, konuDurum, dersDurum, haftaBasi, gunAd, tarih, lv, HAZIR, DERSLER, type Hata } from '../engine';
import { M } from '../math';
import { Page, Card, Tile, Seg, Empty, PctBar, LevelTag, Drawer, kOf } from '../ui';
import { KartGovde } from '../parca';

export default function Rapor() {
  const st = useStore();
  const [n, setN] = useState<number>(7);
  const [hata, setHata] = useState<Hata | null>(null);
  const d = bugun(), o = ozet(st, n), since = n ? d - n + 1 : 0;
  const bak = tekrarBak(st), hs = hatalar(st, since).slice(0, 5), bek = bekleyenler(st).length;
  const konular = HAZIR.map((k) => ({ k, s: konuDurum(st, k) })).filter((r) => r.s.basladi);
  const dersler = DERSLER.map((x) => ({ x, s: dersDurum(st, x) })).filter((r) => r.s.coz > 0);
  const ilk = haftaBasi(d) - 21;
  const l = lv(o.oran);
  const hataKart = hata && hata.konu.kartlar.find((c) => c.id === hata.konu.sorular.find((s) => s.id === hata.sorular[0])?.kart);

  return (
    <Page
      title="Rapor"
      sub="Çalışmanın özeti: ne kadar çalıştın, hangi konuya ve hangi hataya yeniden bakmalısın."
      actions={<>
        <Seg id="rapor" value={n} onChange={setN} options={[{ id: 7, label: 'Son 7 gün' }, { id: 30, label: 'Son 30 gün' }, { id: 0, label: 'Tümü' }]} />
        <button className="btn" onClick={() => window.print()}><Printer size={15} />Yazdır</button>
      </>}
    >
      <p className="lead-line"><M>{ozetCumle(st, n)}</M></p>
      <div className="tiles">
        <Tile label="Çözülen soru" icon={<ListChecks size={17} />} tone="brand" sub={`${o.kart} anlatım kartı bitti`}>{o.soru}</Tile>
        <Tile label="Doğru oranı" icon={<Percent size={17} />} tone={l === 'none' ? '' : l} sub={o.eminYanlis ? `${o.eminYanlis} soruda emin olup yanıldın` : o.soru ? `${o.dogru} doğru, ${o.soru - o.dogru} yanlış` : 'Henüz soru çözülmedi'}>{o.oran == null ? '–' : `%${Math.round(o.oran)}`}</Tile>
        <Tile label="Çalışılan gün" icon={<CalendarDays size={17} />} unit={n ? `/ ${n}` : 'gün'} sub={`${o.xp} XP kazandın`}>{o.gunSay}</Tile>
        <Tile label="Tekrar bekleyen" icon={<RotateCcw size={17} />} tone={bek ? 'bad' : 'good'} unit="soru" sub={bek ? 'Bugün yeniden sorulacak' : 'Bekleyen yok'} to="/tekrar">{bek}</Tile>
      </div>

      <div className="grid g-main">
        <div className="stack">
          <Card title="Bu konulara tekrar bak" hint="En çok zorlandığın konu en üstte" flush>
            {bak.length ? (
              <div className="list">
                {bak.map((b) => (
                  <div key={b.konu.id} className={`find ${kOf(b.konu.id)}`}>
                    <span className="find-ic"><RotateCcw size={16} /></span>
                    <div className="grow">
                      <b>{b.konu.ad}</b>
                      <p>{b.neden.join(', ')}.{b.hata && <> En sık yaptığın hata: <span style={{ color: 'var(--ink)', fontWeight: 600 }}><M>{b.hata.yan.ad.toLocaleLowerCase('tr')}</M></span>.</>}</p>
                      <div className="row wrap no-print" style={{ marginTop: 10 }}>
                        <Link className="btn" to={`/konu/${b.konu.id}`}><BookOpen size={15} />Konuyu aç</Link>
                        {b.d.defter > 0 && <Link className="btn pri" to={`/tekrar/coz?k=${b.konu.id}`}><RotateCcw size={15} />Yanlışlarını çöz ({b.d.defter})</Link>}
                      </div>
                    </div>
                    <div style={{ width: 130, marginTop: 5 }}><PctBar p={b.d.oran} /></div>
                  </div>
                ))}
              </div>
            ) : <Empty title="Tekrar bakman gereken konu yok">Test çözdükçe zorlandığın konular burada sıralanır.</Empty>}
          </Card>

          <Card title="Konulara göre durum" hint="Doğru oranı son denemelerine göre hesaplanır" flush>
            {konular.length ? (
              <div className="list">
                {konular.map(({ k, s }, i) => (
                  <Link key={k.id} to={`/konu/${k.id}`} className={`konu-row ${kOf(k.id)}`}>
                    <span className="no">{i + 1}</span>
                    <b>{k.ad}</b>
                    <span className="sm mut">Anlatım {s.kart} / {s.kartTop}</span>
                    {s.coz ? <PctBar p={s.oran} /> : <span className="sm dim">Test çözülmedi</span>}
                    <LevelTag p={s.oran} />
                    <ChevronRight size={17} className="dim" />
                  </Link>
                ))}
              </div>
            ) : <Empty title="Henüz bir konuya başlamadın"><Link className="btn pri" to="/dersler" style={{ marginTop: 12 }}>Derslere git</Link></Empty>}
          </Card>
        </div>

        <div className="stack">
          <Card title="En sık yaptığın hatalar" hint="Yanlış seçeneklerinden çıkarıldı" flush>
            {hs.length ? (
              <div className="list">
                {hs.map((h) => (
                  <button key={`${h.konu.id}:${h.id}`} className="find click k-bad" style={{ width: '100%', textAlign: 'left' }} onClick={() => setHata(h)}>
                    <span className="find-ic"><TriangleAlert size={16} /></span>
                    <div className="grow"><b><M>{h.yan.ad}</M></b><p>{h.konu.ad}</p></div>
                    <span className="tag bad" style={{ marginTop: 4 }}>{h.n} kez</span>
                  </button>
                ))}
              </div>
            ) : <Empty title="Bu dönemde kayıtlı hata yok" />}
          </Card>

          {dersler.length > 0 && (
            <Card title="Derslere göre doğru oranı">
              <div style={{ display: 'grid', gap: 12 }}>
                {dersler.map(({ x, s }) => (
                  <div key={x.id} className="row">
                    <span style={{ width: 92, fontWeight: 620 }}>{x.ad}</span>
                    <div className="grow"><PctBar p={s.oran} /></div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card title="Çalışma takvimi" hint="Son dört hafta. Koyu kutu çok çalıştığın gün.">
            <div className="isi">
              {Array.from({ length: 7 }, (_, i) => <span key={i}>{gunAd(ilk + i)}</span>)}
              {Array.from({ length: 28 }, (_, i) => {
                const g = ilk + i, v = st.gun[g] ?? 0;
                return <i key={g} className={`${v >= 110 ? 'y3' : v >= 60 ? 'y2' : v > 0 ? 'y1' : ''} ${g === d ? 'bugun' : ''}`} title={`${tarih(g)}: ${v} XP`} />;
              })}
            </div>
          </Card>
        </div>
      </div>

      <Drawer open={!!hata} onClose={() => setHata(null)} label={hata ? `${hata.konu.ad}: sık yapılan hata` : ''}>
        {hata && (
          <div className={kOf(hata.konu.id)}>
            <h1><M>{hata.yan.ad}</M></h1>
            <div className="metin"><p><M>{hata.yan.anlat}</M></p>{hata.yan.ornek && <p style={{ fontWeight: 620 }}><M>{hata.yan.ornek}</M></p>}</div>
            <p className="note" style={{ margin: '12px 0 4px' }}>Bu hatayı {hata.sorular.length} farklı soruda, toplam {hata.n} kez yaptın.</p>
            <div className="row wrap" style={{ margin: '12px 0 22px' }}>
              <Link className="btn pri" to={`/tekrar/coz?k=${hata.konu.id}`}><RotateCcw size={15} />Bu konunun yanlışlarını çöz</Link>
              <Link className="btn" to={`/konu/${hata.konu.id}`}>Konuyu aç</Link>
            </div>
            {hataKart && <><div className="ayar-l">Anlatımdaki ilgili kısım: {hataKart.baslik}</div><KartGovde kart={hataKart} kisisel={st.kisisel} baska={false} /></>}
          </div>
        )}
      </Drawer>
    </Page>
  );
}
