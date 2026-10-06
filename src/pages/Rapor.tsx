// Rapor: ne kadar çalıştım, nerede zorlanıyorum, hangi hatayı tekrar ediyorum.
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, Percent, CalendarDays, RotateCcw, Printer, ChevronRight, TriangleAlert, BookOpen, Sparkles, MessageSquareText } from 'lucide-react';
import { useStore, useKok, bugun, type State } from '../store';
import { ozet, ozetCumle, tekrarBak, hatalar, bekleyenler, konuDurum, dersDurum, haftaBasi, gunAd, tarih, lv, hataTurleri, kocNotu, HAZIR, DERSLER, type Hata } from '../engine';
import { M } from '../math';
import { Page, Card, Tile, Seg, Empty, PctBar, LevelTag, Drawer, kOf } from '../ui';
import { KartGovde } from '../parca';
import { sor, sistem } from '../ai';
import { Yazi } from '../sohbet';

export default function Rapor() {
  const st = useStore();
  const [n, setN] = useState<number>(7);
  const [hata, setHata] = useState<Hata | null>(null);
  const d = bugun(), o = ozet(st, n), since = n ? d - n + 1 : 0;
  const bak = tekrarBak(st), hs = hatalar(st, since).slice(0, 5), bek = bekleyenler(st).length;
  const konular = HAZIR.map((k) => ({ k, s: konuDurum(st, k) })).filter((r) => r.s.basladi);
  const dersler = DERSLER.map((x) => ({ x, s: dersDurum(st, x) })).filter((r) => r.s.coz > 0);
  const ilk = haftaBasi(d) - 21;
  const l = lv(o.oran), ht = hataTurleri(st, since);
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
      <Koc st={st} />
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
          <Card title="Yanlışların neden oluyor?" hint="Kayıtlarından çıkarılan bir tahmin">
            {ht.top ? (
              <>
                <div className="yigin" role="img" aria-label={`${ht.bilgi} yanlış bilgi, ${ht.eksik} bilgi eksiği, ${ht.dikkat} dikkatsizlik`}>
                  {ht.bilgi > 0 && <i className="k-bad" style={{ flex: ht.bilgi }} />}
                  {ht.eksik > 0 && <i className="k-mid" style={{ flex: ht.eksik }} />}
                  {ht.dikkat > 0 && <i className="k-brand" style={{ flex: ht.dikkat }} />}
                </div>
                <div className="ayar k-bad"><i className="nokta" /><div className="grow"><b>Yanlış bildiğin</b><small>Emin olup yanıldın. Kuralı yanlış biliyorsun: anlatımı yeniden oku.</small></div><b className="num">{ht.bilgi}</b></div>
                <div className="ayar k-mid"><i className="nokta" /><div className="grow"><b>Eksik bildiğin</b><small>Emin değildin. Konuyu pekiştir, yanlışlarını tekrar et.</small></div><b className="num">{ht.eksik}</b></div>
                <div className="ayar k-brand"><i className="nokta" /><div className="grow"><b>Dikkatsizlik</b><small>İyi olduğun konuda bir kez yaptığın hata. Soruyu yavaş oku.</small></div><b className="num">{ht.dikkat}</b></div>
              </>
            ) : <Empty title="Bu dönemde yanlış yok" />}
          </Card>

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

/** Koç notu: kayıtlardan kurulan üç cümle. Anahtar girilmişse yapay zekâ daha ayrıntılı yazar. */
function Koc({ st }: { st: State }) {
  const kok = useKok();
  const [yazi, setYazi] = useState<string | null>(null);
  const [hata, setHata] = useState('');
  const [bekle, setBekle] = useState(false);
  const kes = useRef<AbortController | null>(null);
  const not = kocNotu(st);
  const yaz = async () => {
    setBekle(true); setHata(''); setYazi('');
    kes.current = new AbortController();
    const konular = HAZIR.map((k) => ({ k, s: konuDurum(st, k) })).filter((r) => r.s.basladi).map((r) => `- ${r.k.ad}: anlatım ${r.s.kart}/${r.s.kartTop}, ${r.s.coz} soru çözüldü${r.s.oran != null ? `, doğru oranı %${Math.round(r.s.oran)}` : ''}, yanlış defterinde ${r.s.defter} soru`);
    const hs = hatalar(st).slice(0, 5).map((h) => `- ${h.konu.ad}: ${h.yan.ad} (${h.n} kez)`);
    const o7 = ozet(st, 7), t = hataTurleri(st);
    const veri = [`Son 7 gün: ${o7.gunSay} gün çalışıldı, ${o7.soru} soru, doğru oranı ${o7.oran == null ? 'yok' : `%${Math.round(o7.oran)}`}.`, `Bugün tekrar bekleyen soru: ${bekleyenler(st).length}.`, 'Konular:', ...konular, 'En sık hatalar:', ...(hs.length ? hs : ['- yok']), `Yanlış türleri (tahmin): emin olup yanılma ${t.bilgi}, emin değilken yanlış ${t.eksik}, dikkatsizlik ${t.dikkat}.`].join('\n');
    try {
      await sor({ sistem: sistem(veri, 'Bu konuşmada soru çözmeyeceksin. Bağlamdaki çalışma kayıtlarına bakıp öğrenciye haftalık bir koç notu yaz: bir cümle neyin iyi gittiği, sonra en çok üç maddelik "Bu hafta şunu yap" listesi. Her madde somut olsun (hangi konu, ne yapılacak). Toplam 90 kelimeyi geçme. Kayıtlarda olmayan bir şey uydurma.'), mesajlar: [{ rol: 'user', metin: 'Bu haftaki koç notumu yazar mısın?' }], onParca: setYazi, signal: kes.current.signal, enCok: 500 });
    } catch (e) { if ((e as Error).name !== 'AbortError') { setHata((e as Error).message); setYazi(null); } }
    finally { setBekle(false); }
  };
  return (
    <Card title="Koç notu" icon={<MessageSquareText size={17} />} style={{ marginBottom: 18 }} className="koc" action={kok.ai.anahtar ? <button className="btn no-print" disabled={bekle} onClick={() => void yaz()}><Sparkles size={15} />{yazi ? 'Yeniden yazdır' : 'Yapay zekâya yazdır'}</button> : undefined}>
      {yazi ? <Yazi>{yazi}</Yazi> : <ul className="ozet-l">{not.map((x, i) => <li key={i}><ChevronRight size={18} /><span><M>{x}</M></span></li>)}</ul>}
      {hata && <p className="note" style={{ marginTop: 10, color: 'var(--bad-ink)' }}>{hata}</p>}
      {!kok.ai.anahtar && <p className="note no-print" style={{ marginTop: 12 }}>Bu not kayıtlarından otomatik kuruldu. Profil'den yapay zekâ anahtarı girilirse daha ayrıntılı, haftaya özel bir not yazdırabilirsin.</p>}
    </Card>
  );
}
