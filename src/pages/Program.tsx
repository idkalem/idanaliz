// Program: doğru oranına, yanlışlarına ve ödevlerine göre kurulan yedi günlük çalışma planı.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Timer, Trophy, RotateCcw, BookOpen, ListChecks, Settings2, Compass, Coffee, Play } from 'lucide-react';
import { useStore, useKok, set, bugun, gunYaz, gunOku, type Plan } from '../store';
import { program, konuDurum, durak, bekleyenler, gunTam, tarih, HAZIR, type Is } from '../engine';
import { Page, Card, Tile, Seg, kOf } from '../ui';

const GUNLER = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const IKON = { tekrar: RotateCcw, anlatim: BookOpen, test: ListChecks };

export function IsSatiri({ x, basla }: { x: Is; basla: boolean }) {
  const I = IKON[x.tur];
  return (
    <div className={`is ${x.konu ? kOf(x.konu.id) : 'k-bad'}`}>
      <span className="find-ic"><I size={16} /></span>
      <div className="grow"><b>{x.ad}</b><small>{x.neden}</small></div>
      <span className="sm mut num">{x.dk} dk</span>
      {basla && <Link className="btn pri" to={x.to}>Başla</Link>}
    </div>
  );
}

export default function Program() {
  const st = useStore(), kok = useKok();
  const d = bugun();
  const [ayar, setAyar] = useState(!st.plan.kuruldu);
  const gunler = program(st, kok);
  const biten = HAZIR.filter((k) => durak(konuDurum(st, k)) === 'tamam').length;
  const haftaDk = gunler.reduce((a, g) => a + g.dk, 0), bek = bekleyenler(st).length;
  const kalan = st.plan.sinav - d;
  const pl = (p: Partial<Plan>) => set({ plan: { ...st.plan, ...p } });

  return (
    <Page title="Program" sub="Plan senin kayıtlarından kurulur: önce tekrar günü gelen yanlışların, sonra zorlandığın konular, sonra sıradaki konu." actions={<button className={`btn ${ayar ? 'on' : ''}`} onClick={() => setAyar(!ayar)}><Settings2 size={15} />Ayarlar</button>}>
      {ayar && (
        <Card title={st.plan.kuruldu ? 'Program ayarları' : 'Programını kur'} hint="Üç bilgi yeter. İstediğin zaman değiştirebilirsin." style={{ marginBottom: 16 }}>
          <div className="ayar"><div className="grow"><b>Sınav tarihin</b><small>Geri sayım buna göre yapılır.</small></div><input className="input" type="date" value={gunYaz(st.plan.sinav)} min={gunYaz(d)} onChange={(e) => { if (e.target.value) pl({ sinav: gunOku(e.target.value) }); }} aria-label="Sınav tarihi" /></div>
          <div className="ayar"><div className="grow"><b>Günde kaç dakika</b><small>Her güne bu kadar iş yazılır.</small></div><Seg id="dk" value={st.plan.dk} onChange={(v) => pl({ dk: v })} options={[20, 40, 60, 90].map((n) => ({ id: n, label: `${n} dk` }))} /></div>
          <div className="ayar"><div className="grow"><b>Hangi günler</b><small>Kapalı günler dinlenme günüdür.</small></div>
            <div className="gun-sec">{GUNLER.map((g, i) => <button key={g} className={st.plan.gunler[i] ? 'on' : ''} aria-pressed={st.plan.gunler[i]} onClick={() => pl({ gunler: st.plan.gunler.map((v, j) => (j === i ? !v : v)) })}>{g}</button>)}</div>
          </div>
          {!st.plan.kuruldu && <div className="row" style={{ marginTop: 14 }}><span className="grow" /><button className="btn lg pri" onClick={() => { pl({ kuruldu: true }); setAyar(false); }}>Programımı oluştur</button></div>}
        </Card>
      )}

      <div className="tiles">
        <Tile label="Sınava kalan" icon={<CalendarClock size={17} />} tone="brand" unit="gün" sub={tarih(st.plan.sinav)}>{Math.max(0, kalan)}</Tile>
        <Tile label="Bu 7 günde" icon={<Timer size={17} />} unit="dk" sub={`${gunler.filter((g) => g.calis).length} çalışma günü, günde ${st.plan.dk} dk`}>{haftaDk}</Tile>
        <Tile label="Biten konu" icon={<Trophy size={17} />} tone={biten ? 'good' : ''} unit={`/ ${HAZIR.length}`} sub="Anlatımı ve testi tamamlanan">{biten}</Tile>
        <Tile label="Tekrar bekleyen" icon={<RotateCcw size={17} />} tone={bek ? 'bad' : 'good'} unit="soru" sub={bek ? 'Bugünün ilk işi' : 'Bekleyen yok'} to="/tekrar">{bek}</Tile>
      </div>

      <div className="grid g-main">
        <div className="stack">
          {gunler.map((g, i) => (
            <Card key={g.g} flush className={`pgun ${i === 0 ? 'bugun' : ''}`}>
              <div className="pgun-bas">
                <b>{i === 0 ? 'Bugün' : i === 1 ? 'Yarın' : gunTam(g.g)}</b>
                <span className="sm mut grow">{tarih(g.g)}</span>
                {g.calis && g.isler.length > 0 && <span className="tag">{g.dk} dk</span>}
              </div>
              {!g.calis ? <div className="is dinlen"><span className="find-ic"><Coffee size={16} /></span><div className="grow"><b>Dinlenme günü</b><small>Programında bu gün kapalı. Tekrarların ertesi güne kayar.</small></div></div>
                : g.isler.length ? g.isler.map((x, j) => <IsSatiri key={j} x={x} basla={i === 0} />)
                : <div className="is dinlen"><span className="find-ic"><Trophy size={16} /></span><div className="grow"><b>Yazılacak iş kalmadı</b><small>Hazır konuların hepsini bitirdin. Yeni konular eklendiğinde burada görünür.</small></div></div>}
            </Card>
          ))}
        </div>

        <div className="stack">
          <Card title="Şu an kaç dakikan var?" hint="Süreye sığacak kadar soru gelir: önce yanlışların." icon={<Timer size={17} />}>
            <div className="sure-sec">{[5, 10, 20].map((n) => <Link key={n} to={`/tekrar/coz?sure=${n}`}><b>{n}</b><small>dakika</small></Link>)}</div>
          </Card>
          <Card title="Seviye taraması" hint={st.tarama ? 'Taramayı yaptın. İstersen yeniden çöz.' : 'Nereden başlayacağını bilmiyorsan'} icon={<Compass size={17} />}>
            <p className="sm mut" style={{ marginBottom: 12 }}>Her hazır konudan iki soru, toplam {HAZIR.length * 2} soru. Sonuca göre program hangi konuya önce döneceğini bilir.</p>
            <Link className={`btn lg ${st.tarama ? '' : 'pri'}`} to="/tarama"><Play size={16} />{st.tarama ? 'Yeniden çöz' : 'Taramaya başla'}</Link>
          </Card>
          <Card title="Program nasıl kuruluyor?">
            <ul className="ozet-l sm">
              <li><RotateCcw size={16} /><span>Yanlış yaptığın sorular tekrar günü gelince günün ilk işi olur.</span></li>
              <li><BookOpen size={16} /><span>Doğru oranı %60'ın altındaki konuların anlatımı ve testi yeniden yazılır.</span></li>
              <li><ListChecks size={16} /><span>Yarım kalan konular, ardından sıradaki yeni konu gelir.</span></li>
            </ul>
          </Card>
        </div>
      </div>
    </Page>
  );
}
