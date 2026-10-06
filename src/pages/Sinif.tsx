// Sınıf: öğretmenin ekranı. Sınıf hangi konuda nerede, hangi hatayı birlikte yapıyor, kim desteğe ihtiyaç duyuyor.
// Öğrenciler sıralanmaz; ada göre dizilir. Renk yalnızca durumu söyler.
import { useState } from 'react';
import { Users, CalendarCheck, ListChecks, Percent, TriangleAlert, ChevronRight, ClipboardList, Trash2, Plus } from 'lucide-react';
import { useKok, bugun, odevVer, odevSil, type State } from '../store';
import { ogrenciler, siniflar, sinifKonular, sinifHatalar, ozet, ozetCumle, tekrarBak, hatalar, bekleyenler, sonGun, neZamandi, odevTamam, tarih, lv, HAZIR, KONULAR, type SinifHata } from '../engine';
import { M } from '../math';
import { Page, Card, Tile, Tabs, Seg, Empty, PctBar, LevelTag, Drawer, kOf, pct } from '../ui';
import { Avatar } from '../avatar';

export default function Sinif() {
  const kok = useKok();
  const d = bugun();
  const ss = siniflar(kok);
  const [sinif, setSinif] = useState('');
  const os = ogrenciler(kok, sinif);
  const [hata, setHata] = useState<SinifHata | null>(null);
  const [kim, setKim] = useState<State | null>(null);
  const [odevKonu, setOdevKonu] = useState(HAZIR[0]?.id ?? '');
  const [odevGun, setOdevGun] = useState(3);

  const hafta = os.map((o) => ozet(o, 7));
  const calisan = hafta.filter((o) => o.gunSay > 0).length;
  const soru = hafta.reduce((a, o) => a + o.soru, 0), dogru = hafta.reduce((a, o) => a + o.dogru, 0);
  const oran = soru ? (dogru / soru) * 100 : null, l = lv(oran);
  const konular = sinifKonular(os), hs = sinifHatalar(os).slice(0, 6);
  const odevler = kok.odev.filter((o) => KONULAR[o.konu]);

  if (!ogrenciler(kok).length) return (
    <Page title="Sınıf" sub="Bu cihazda henüz öğrenci hesabı yok.">
      <Card><Empty title="Öğrenciler hesap açınca burada görünür">Öğrenciler giriş ekranından "Yeni hesap" ile kendi hesabını açar. Nasıl göründüğünü denemek için giriş ekranından örnek sınıfı yükleyebilirsin.</Empty></Card>
    </Page>
  );

  return (
    <Page title="Sınıf" sub="Bu cihazdaki öğrenci hesaplarından derlenir. Sayılar son 7 günü gösterir.">
      {ss.length > 1 && <Tabs id="sinif" value={sinif} onChange={setSinif} tabs={[{ id: '', label: 'Bütün sınıflar' }, ...ss.map((s) => ({ id: s, label: s }))]} />}
      <div className="tiles">
        <Tile label="Öğrenci" icon={<Users size={17} />} tone="brand" sub={sinif || ss.join(', ') || 'Sınıf yazılmamış'}>{os.length}</Tile>
        <Tile label="Son 7 günde çalışan" icon={<CalendarCheck size={17} />} unit={`/ ${os.length}`} sub={calisan < os.length ? `${os.length - calisan} öğrenci hiç çalışmadı` : 'Herkes çalıştı'}>{calisan}</Tile>
        <Tile label="Çözülen soru" icon={<ListChecks size={17} />} sub={os.length ? `Öğrenci başına ${Math.round(soru / os.length)}` : ''}>{soru}</Tile>
        <Tile label="Doğru oranı" icon={<Percent size={17} />} tone={l === 'none' ? '' : l} sub={soru ? `${dogru} doğru, ${soru - dogru} yanlış` : 'Son 7 günde soru çözülmedi'}>{pct(oran)}</Tile>
      </div>

      <div className="grid g-main">
        <div className="stack">
          <Card title="Konulara göre sınıf" hint="Kaç öğrenci başladı, kaçı bitirdi, soruların yüzde kaçı doğru" flush>
            <div className="list">
              {konular.map(({ konu, baslayan, biten, oran: p }, i) => (
                <div key={konu.id} className={`konu-row ${kOf(konu.id)}`}>
                  <span className="no">{i + 1}</span>
                  <b>{konu.ad}</b>
                  <span className="sm mut">{baslayan} başladı, {biten} bitirdi</span>
                  {p == null ? <span className="sm dim">Test çözülmedi</span> : <PctBar p={p} />}
                  <LevelTag p={p} />
                  <span />
                </div>
              ))}
            </div>
          </Card>

          <Card title="Öğrenciler" hint="Ada göre. Bir öğrenciye dokununca özeti açılır." flush>
            <div className="ogr-bas"><span /><span>Öğrenci</span><span>Son 7 gün</span><span>Doğru oranı</span><span>Tekrar</span><span>Son çalışma</span><span /></div>
            <div className="list">
              {os.map((o, i) => {
                const h = hafta[i], xp7 = Array.from({ length: 7 }, (_, j) => o.gun[d - j] ?? 0).reduce((a, b) => a + b, 0), son = sonGun(o), bek = bekleyenler(o).length, ara = son == null ? 99 : d - son;
                return (
                  <button key={o.id} className="ogr click" onClick={() => setKim(o)}>
                    <Avatar a={o.avatar} size={36} />
                    <b className="clip">{o.ad}</b>
                    <span className="sm mut">{xp7} XP, {h.soru} soru</span>
                    {h.soru ? <PctBar p={h.oran} /> : <span className="sm dim">Soru çözmedi</span>}
                    <span className={`tag ${bek >= 5 ? 'bad' : bek ? 'mid' : ''}`}>{bek ? `${bek} soru` : 'Yok'}</span>
                    <span className={`sm ${ara >= 4 ? '' : 'mut'}`} style={ara >= 4 ? { color: 'var(--bad-ink)', fontWeight: 600 } : undefined}>{neZamandi(son)}</span>
                    <ChevronRight size={17} className="dim" />
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="stack">
          <Card title="Sınıfın ortak hataları" hint="En çok öğrencinin yaptığı en üstte. Derste üzerinden geçmek için." flush>
            {hs.length ? (
              <div className="list">
                {hs.map((h) => (
                  <button key={`${h.konu.id}:${h.id}`} className="find click k-bad" style={{ width: '100%', textAlign: 'left' }} onClick={() => setHata(h)}>
                    <span className="find-ic"><TriangleAlert size={16} /></span>
                    <div className="grow"><b><M>{h.yan.ad}</M></b><p>{h.konu.ad}</p></div>
                    <span className="tag bad" style={{ marginTop: 4 }}>{h.kim.length} öğrenci</span>
                  </button>
                ))}
              </div>
            ) : <Empty title="Kayıtlı hata yok">Öğrenciler test çözdükçe ortak hatalar burada birikir.</Empty>}
          </Card>

          <Card title="Ödev ver" hint="Seçtiğin konunun kavrama testi bütün öğrencilerin Bugün ekranına düşer." icon={<ClipboardList size={17} />}>
            <div className="row wrap">
              <select className="input grow" value={odevKonu} onChange={(e) => setOdevKonu(e.target.value)} aria-label="Konu">{HAZIR.map((k) => <option key={k.id} value={k.id}>{k.ad}</option>)}</select>
              <Seg id="odev-gun" value={odevGun} onChange={setOdevGun} options={[{ id: 1, label: 'Yarın' }, { id: 3, label: '3 gün' }, { id: 7, label: '1 hafta' }]} />
              <button className="btn pri" onClick={() => odevVer(odevKonu, odevGun)}><Plus size={15} />Ver</button>
            </div>
            {odevler.map((o) => {
              const yapan = os.filter((x) => odevTamam(x, o)).length;
              return (
                <div key={o.id} className="ayar">
                  <div className="grow"><b>{KONULAR[o.konu].ad}</b><small>Son gün {tarih(o.son)}{o.son < d ? ' (geçti)' : ''}. {yapan} / {os.length} öğrenci tamamladı.</small></div>
                  <button className="btn ghost icon" aria-label="Ödevi kaldır" onClick={() => odevSil(o.id)}><Trash2 size={16} /></button>
                </div>
              );
            })}
          </Card>
        </div>
      </div>

      <Drawer open={!!hata} onClose={() => setHata(null)} label={hata ? `${hata.konu.ad}: ortak hata` : ''}>
        {hata && (
          <div className={kOf(hata.konu.id)}>
            <h1><M>{hata.yan.ad}</M></h1>
            <div className="metin"><p><M>{hata.yan.anlat}</M></p>{hata.yan.ornek && <p style={{ fontWeight: 620 }}><M>{hata.yan.ornek}</M></p>}</div>
            <div className="ayar-l">Bu hatayı yapan {hata.kim.length} öğrenci, toplam {hata.n} kez</div>
            <div className="row wrap">{[...hata.kim].sort((a, b) => a.localeCompare(b, 'tr')).map((ad) => <span key={ad} className="tag">{ad}</span>)}</div>
            <div className="row" style={{ marginTop: 20 }}><button className="btn pri" onClick={() => { odevVer(hata.konu.id, 3); setHata(null); }}><ClipboardList size={15} />Bu konuyu ödev ver (3 gün)</button></div>
          </div>
        )}
      </Drawer>

      <Drawer open={!!kim} onClose={() => setKim(null)} label="Öğrenci özeti">
        {kim && <Ogrenci o={kim} />}
      </Drawer>
    </Page>
  );
}

function Ogrenci({ o }: { o: State }) {
  const bak = tekrarBak(o).slice(0, 3), hs = hatalar(o).slice(0, 3), h = ozet(o, 7), l = lv(h.oran);
  return (
    <div>
      <div className="row" style={{ gap: 14, marginBottom: 14 }}><Avatar a={o.avatar} size={64} /><div><h1 style={{ marginBottom: 2 }}>{o.ad}</h1><span className="mut">{o.sinif || 'Sınıf yazılmamış'}</span></div></div>
      <div className="metin"><p style={{ fontSize: 16 }}><M>{ozetCumle(o, 7, 'o')}</M></p></div>
      <div className="tiles n3" style={{ margin: '16px 0' }}>
        <Tile label="Soru">{h.soru}</Tile>
        <Tile label="Doğru" tone={l === 'none' ? '' : l}>{pct(h.oran)}</Tile>
        <Tile label="Gün" unit="/ 7">{h.gunSay}</Tile>
      </div>
      <div className="ayar-l">Zorlandığı konular</div>
      {bak.length ? bak.map((b) => <div key={b.konu.id} className="ayar"><div className="grow"><b>{b.konu.ad}</b><small>{b.neden.join(', ')}</small></div><div style={{ width: 120 }}><PctBar p={b.d.oran} /></div></div>) : <p className="note">Kayıtlara göre zorlandığı bir konu görünmüyor.</p>}
      <div className="ayar-l">En sık yaptığı hatalar</div>
      {hs.length ? hs.map((x) => <div key={`${x.konu.id}:${x.id}`} className="ayar"><div className="grow"><b><M>{x.yan.ad}</M></b><small>{x.konu.ad}</small></div><span className="tag bad">{x.n} kez</span></div>) : <p className="note">Kayıtlı hata yok.</p>}
    </div>
  );
}
