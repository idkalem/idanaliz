// Yanlışlarım: yanlış yapılan her soru burada durur ve aralıklarla yeniden sorulur.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, RotateCcw, NotebookPen, Check, BookOpen, Play } from 'lucide-react';
import { useStore, bugun, OGRENILDI, ARALIK } from '../store';
import { defter, neZaman, dersOf, type Bekleyen } from '../engine';
import { M } from '../math';
import { Page, Card, Tile, Tabs, Empty, kOf } from '../ui';
import { Secenekler, Cozum, Takil, SoruMetni } from '../parca';

export default function Yanlislar() {
  const st = useStore();
  const d = bugun();
  const hepsi = defter(st);
  const bekleyen = hepsi.filter((x) => x.t.kutu < OGRENILDI && x.t.son <= d).length;
  const acikSay = hepsi.filter((x) => x.t.kutu < OGRENILDI).length;
  const [tab, setTab] = useState('hepsi');
  const [acik, setAcik] = useState<string | null>(null);

  const dersler = [...new Map(hepsi.map((x) => [dersOf(x.konu.id).id, dersOf(x.konu.id)])).values()];
  const liste = tab === 'hepsi' ? hepsi : hepsi.filter((x) => dersOf(x.konu.id).id === tab);
  const gruplar = new Map<string, Bekleyen[]>();
  for (const x of liste) gruplar.set(x.konu.id, [...(gruplar.get(x.konu.id) ?? []), x]);

  return (
    <Page
      title="Yanlışlarım"
      sub={`Yanlış yaptığın soru ertesi gün yeniden sorulur. Her doğruda ara uzar: ${ARALIK.join(', ')} gün. Dört tekrarda da doğru yaparsan öğrenilmiş sayılır.`}
      actions={<>
        {acikSay > 0 && <Link className="btn lg" to="/tekrar/coz?hepsi=1">Hepsini çöz ({acikSay})</Link>}
        {bekleyen > 0 ? <Link className="btn lg pri" to="/tekrar/coz"><Play size={16} />Bugünkü tekrarı başlat ({bekleyen})</Link> : <button className="btn lg pri" disabled><Play size={16} />Bugün tekrar yok</button>}
      </>}
    >
      <div className="tiles n3">
        <Tile label="Bugün tekrar bekleyen" icon={<RotateCcw size={17} />} tone={bekleyen ? 'bad' : 'good'} unit="soru" sub={bekleyen ? 'Zamanı geldi, yeniden çöz' : 'Bugünlük hepsi tamam'}>{bekleyen}</Tile>
        <Tile label="Defterde" icon={<NotebookPen size={17} />} unit="soru" sub="Henüz öğrenilmemiş yanlışlar">{acikSay}</Tile>
        <Tile label="Öğrenilen" icon={<Check size={17} strokeWidth={2.8} />} tone="good" unit="soru" sub="Dört tekrarda da doğru">{hepsi.length - acikSay}</Tile>
      </div>

      {!hepsi.length ? (
        <Card><Empty title="Defterin boş">Bir kavrama testi çöz; yanlış yaptığın sorular çözümleriyle birlikte burada birikir.<div><Link className="btn pri" to="/dersler" style={{ marginTop: 12 }}>Derslere git</Link></div></Empty></Card>
      ) : (
        <>
          {dersler.length > 1 && <Tabs id="yl" value={tab} onChange={setTab} tabs={[{ id: 'hepsi', label: `Tümü (${hepsi.length})` }, ...dersler.map((x) => ({ id: x.id, label: x.ad }))]} />}
          <Card flush>
            {[...gruplar.entries()].map(([kid, xs]) => (
              <div key={kid} className={kOf(kid)}>
                <div className="grup-bas"><i /><Link to={`/konu/${kid}`} className="grow">{xs[0].konu.ad}</Link><span className="xs dim">{xs.length} soru</span></div>
                {xs.map((x) => <Satir key={x.id} x={x} d={d} acik={acik === x.id} onAc={() => setAcik(acik === x.id ? null : x.id)} />)}
              </div>
            ))}
          </Card>
        </>
      )}
    </Page>
  );
}

function Satir({ x, d, acik, onAc }: { x: Bekleyen; d: number; acik: boolean; onAc: () => void }) {
  const { t, konu, soru } = x;
  const yan = t.y ? konu.yan[t.y] : undefined;
  const kartNo = konu.kartlar.findIndex((c) => c.id === soru.kart);
  const ogrenildi = t.kutu >= OGRENILDI;
  return (
    <div className={`yl ${acik ? 'acik' : ''}`}>
      <button className="yl-bas" aria-expanded={acik} onClick={onAc}>
        <div>
          <span className="s"><M>{soru.s}</M></span>
          <small>{t.n} kez yanlış{yan && <>, takıldığın yer: <M>{yan.ad.toLocaleLowerCase('tr')}</M></>}</small>
        </div>
        <span className="basamak" title={`${Math.min(t.kutu, 4)} / 4 tekrar doğru`}>{[0, 1, 2, 3].map((i) => <i key={i} className={i < t.kutu ? 'on' : ''} />)}</span>
        <span className={`tag ${ogrenildi ? 'good' : t.son <= d ? 'bad' : ''}`}>{ogrenildi ? 'Öğrenildi' : t.son <= d ? 'Bugün' : neZaman(t.son, d)}</span>
        <ChevronRight size={17} />
      </button>
      {acik && (
        <div className="yl-ic">
          <SoruMetni soru={soru} />
          <Secenekler o={soru.o} sec={t.sec} dogru={soru.d} durum="goster" />
          <p className="note" style={{ marginTop: 10 }}>Kırmızı senin son cevabın, yeşil doğru cevap.</p>
          {yan && <Takil yan={yan} baslik="Takıldığın yer" />}
          <Cozum adimlar={soru.c} />
          <div className="row wrap" style={{ marginTop: 14 }}>
            {!ogrenildi && <Link className="btn pri" to={`/tekrar/coz?q=${encodeURIComponent(x.id)}`}><RotateCcw size={15} />Bu soruyu şimdi çöz</Link>}
            {kartNo >= 0 && <Link className="btn" to={`/konu/${konu.id}/anlatim?kart=${kartNo}`}><BookOpen size={15} />Anlatımda bu kısmı aç</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
