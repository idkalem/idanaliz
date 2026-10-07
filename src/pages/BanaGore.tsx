// Bana göre: kişiselleştirmenin tek ekranı. Ne değişiyor, neden değişiyor, tercihler nasıl değiştirilir.
// Okulun envanteri sistemin dışında uygulanır; sonucu buraya 40 cevap olarak aktarılır. Ham puan gösterilmez, öğrenci etiketlenmez.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, ArrowRight, ShieldCheck, Upload, Eye, Compass, Heart, LifeBuoy, ClipboardList } from 'lucide-react';
import { useStore, set, toast } from '../store';
import { Page, Card, Switch, Seg, Empty } from '../ui';
import { sesVar } from '../parca';
import { uyarla, TERCIH, ILGILER, BOYUTLAR, ARALIK_AD, boyut, aralik, boyutlarVar, oncelikli, harf, harfYaz, profilOku, destekler } from '../kisi';

/** Envanterdeki beş basamaklı ilgi cevabı üç düzeyde gösterilir. */
const duzey = (h: string) => (h === '' ? '' : 'AB'.includes(h) ? 'B' : h === 'C' ? 'C' : 'E');

export default function BanaGore() {
  const st = useStore();
  const q = st.profil;
  const plan = uyarla(st);
  const [metin, setMetin] = useState('');
  const [hata, setHata] = useState(false);
  const yaz = (n: number, c: string) => set({ profil: harfYaz(q, n, c) });
  const onc = oncelikli(q), dst = destekler(q), envanter = boyutlarVar(q);
  const yukle = () => {
    const yeni = profilOku(metin);
    if (!yeni) { setHata(true); return; }
    set({ profil: yeni }); setMetin(''); setHata(false); toast('Envanter sonucu yüklendi');
  };
  const yukleme = (
    <div className="envanter-yukle">
      <textarea value={metin} rows={2} onChange={(e) => { setMetin(e.target.value); setHata(false); }} placeholder="Örnek: 1-C 2-D 3-B … 40-A ya da CDBA…" aria-label="Envanter cevapları" />
      <div className="row wrap" style={{ marginTop: 8 }}>
        <button className="btn" disabled={!metin.trim()} onClick={yukle}><Upload size={15} />Yükle</button>
        {hata && <span className="note">40 cevap bulunamadı. Cevapları 1'den 40'a sırayla, A ile E arasında harflerle yapıştır.</span>}
      </div>
    </div>
  );
  return (
    <Page title="Bana göre" sub="Herkes aynı konuyu öğrenir; ama anlatımın sırası ve biçimi sana göre düzenlenebilir. İstediğin an kapatabilir, tercihlerini değiştirebilirsin.">
      <div className="grid g-main">
        <div className="stack">
          <Card title="Kişiselleştirme" icon={<SlidersHorizontal size={17} />}>
            <div className="ayar"><div className="grow"><b>Anlatımı bana göre düzenle</b><small>Kapalıyken herkesle aynı anlatımı görürsün. Anlatım sırasında da üstteki şeritten geçiş yapabilirsin.</small></div><Switch on={st.kisisel.acik} onChange={(v) => set({ kisisel: { ...st.kisisel, acik: v } })} label="Anlatımı bana göre düzenle" /></div>
            <div className="ayar"><div className="grow"><b>Kartı sesli oku</b><small>{sesVar ? 'Her kart açıldığında tarayıcının sesiyle okunur.' : 'Bu tarayıcıda sesli okuma yok.'}</small></div><Switch on={st.kisisel.dinle} onChange={(v) => set({ kisisel: { ...st.kisisel, dinle: v } })} label="Kartı sesli oku" /></div>
          </Card>

          <Card title="Tercihlerin" hint="Bunlar değişmez özellikler değil. Birini seç, bir konuda dene; işine yaramazsa değiştir." icon={<Compass size={17} />}>
            {([25, 30, 32] as const).map((no) => (
              <div className="tercih" key={no}>
                <div className="ayar-l">{TERCIH[no].soru}</div>
                <div className="tercih-sec">
                  {TERCIH[no].sec.map((s) => (
                    <button key={s.h} className={`tsec ${harf(q, no) === s.h ? 'on' : ''}`} aria-pressed={harf(q, no) === s.h} onClick={() => yaz(no, s.h)}>
                      <b>{s.ad}</b><small>{s.ne}</small>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </Card>

          <Card title="İlgi alanların" hint="Kartı açan durumun yanına, yazılmışsa en çok ilgini çeken alandan bir örnek eklenir. İlgi, yetenek demek değildir." icon={<Heart size={17} />}>
            {ILGILER.map((x, i) => (
              <div className="ayar" key={x.id}>
                <div className="grow"><b>{x.ad}</b></div>
                <Seg id={`ilgi-${x.id}`} value={duzey(harf(q, 33 + i))} onChange={(v) => yaz(33 + i, v)} options={[{ id: 'B', label: 'Az' }, { id: 'C', label: 'Orta' }, { id: 'E', label: 'Çok' }]} />
              </div>
            ))}
          </Card>
        </div>

        <div className="stack">
          <Card title="Şu an sana göre ne değişiyor?" hint="Yalnızca gerçekten uygulanan değişiklikler yazılır." icon={<Eye size={17} />}>
            {!st.kisisel.acik ? <Empty title="Kişiselleştirme kapalı">Herkesle aynı anlatımı görüyorsun.</Empty>
              : !plan.neden.length ? <Empty title="Henüz bir tercih yok">Soldan bir tercih seç ya da envanter sonucunu yükle.</Empty>
              : (
                <>
                  <ul className="degisen">
                    {plan.neden.map((x) => <li key={x.kisa}><span className="tag kisi">{x.kisa}</span><div><b>{x.ne}</b><small>{x.neden}</small></div></li>)}
                  </ul>
                  <Link className="btn pri" to="/konu/mat-uslu/anlatim?kart=1" style={{ marginTop: 14 }}>Bir kartta gör<ArrowRight size={16} /></Link>
                </>
              )}
          </Card>

          <Card title="Akademik davranışların" hint="Okulun envanterinden gelir. Puan yazılmaz; davranışı ne sıklıkta kullandığın yazılır." icon={<ClipboardList size={17} />}>
            {envanter ? (
              <>
                <ul className="boyutlar">
                  {BOYUTLAR.map((b, i) => (
                    <li key={b.ad} className={onc.includes(i) ? 'onc' : ''}>
                      <b>{b.ad}</b>
                      <small>{ARALIK_AD[aralik(boyut(q, i)!)]}</small>
                      {onc.includes(i) && b.yap && <span className="b-yap"><span className="tag kisi">Uygulama ne yapıyor?</span>{b.yap}</span>}
                    </li>
                  ))}
                </ul>
                <details className="katli" style={{ marginTop: 12 }}><summary>Envanter sonucunu yenile</summary>{yukleme}</details>
              </>
            ) : (
              <>
                <p className="sm mut" style={{ marginBottom: 10, lineHeight: 1.5 }}>Envanter okulda uygulanır; burada sorular yeniden sorulmaz. Rehber öğretmeninden aldığın 40 cevabı buraya yapıştırabilirsin. Yüklemesen de soldaki tercihlerle kişiselleştirme çalışır.</p>
                {yukleme}
              </>
            )}
          </Card>

          {dst.length > 0 && (
            <Card title="Destek istediğin konular" hint="Destek istemek, o konuda eksik olduğun anlamına gelmez." icon={<LifeBuoy size={17} />}>
              {dst.map((d) => (
                <div className="ayar" key={d.ad}>
                  <div className="grow"><b>{d.ad}</b><small>{d.ne}</small></div>
                  {d.to && <Link className="btn" to={d.to}>{d.git}</Link>}
                </div>
              ))}
            </Card>
          )}

          <div className="gizlilik">
            <ShieldCheck size={20} />
            <p>Bu profil yalnızca bu cihazda, senin hesabında durur; öğretmen ekranında görünmez. Yapay zekâ öğretmene yalnızca çalışma tercihlerin gider; adın, sınıfın ve envanter cevapların gitmez. Envanter bir etiket değildir: çalışma biçimin hakkında, denedikçe güncellenen bir varsayımdır.</p>
          </div>
        </div>
      </div>
    </Page>
  );
}
