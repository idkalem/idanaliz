// Yazılı provası: açık uçlu sorular. Öğrenci kâğıtta çözer, sonra puanlama anahtarını açar ve yaptığı adımları işaretler.
// Okul yazılıları açık uçlu olduğu için puan sonuca değil, adımlara verilir.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, PencilLine, KeyRound, RotateCcw, Landmark } from 'lucide-react';
import { konuBul, dersOf, type Acik } from '../content';
import { useStore, set } from '../store';
import { M } from '../math';
import { Page, Card, Empty, Tile, kOf } from '../ui';
import { TabloKutu } from '../parca';

const HARF = ['a', 'b', 'c', 'ç', 'd', 'e'];
const tam = (a: Acik) => a.adim.reduce((x, y) => x + y.p, 0);

export default function Yazili() {
  const { id = '' } = useParams();
  const st = useStore();
  const konu = konuBul(id);
  if (!konu?.acik?.length) return <Page title="Yazılı provası"><Card><Empty title="Bu konunun yazılı provası henüz hazır değil"><Link className="btn" to="/dersler" style={{ marginTop: 12 }}>Derslere dön</Link></Empty></Card></Page>;
  const ders = dersOf(konu.id), k = kOf(ders);
  const isaret = (a: Acik) => st.yazili?.[`${konu.id}/${a.id}`];
  const puan = (a: Acik) => (isaret(a) ?? []).reduce((x, i) => x + (a.adim[i]?.p ?? 0), 0);
  const toplam = konu.acik.reduce((x, a) => x + tam(a), 0), alinan = konu.acik.reduce((x, a) => x + puan(a), 0);
  const bakilan = konu.acik.filter((a) => isaret(a)).length;
  const yaz = (a: Acik, v: number[] | undefined) => {
    const y = { ...(st.yazili ?? {}) };
    if (v) y[`${konu.id}/${a.id}`] = v; else delete y[`${konu.id}/${a.id}`];
    set({ yazili: y });
  };

  return (
    <Page
      title={`${konu.ad}: yazılı provası`}
      crumb={<><Link to="/dersler">Dersler</Link> / <Link to={`/konu/${konu.id}`}>{konu.ad}</Link></>}
      sub="Okul yazılısındaki gibi açık uçlu sorular. Önce kâğıda çöz, sonra puanlama anahtarını aç ve yaptığın adımları işaretle. Puan sonuca değil, adımlara verilir."
    >
      <div className="tiles n3">
        <Tile label="Soru" icon={<PencilLine size={17} />} tone="brand" sub="Her biri kâğıtta çözülür">{konu.acik.length}</Tile>
        <Tile label="Anahtarına baktığın" icon={<KeyRound size={17} />} unit={`/ ${konu.acik.length}`}>{bakilan}</Tile>
        <Tile label="Kendine verdiğin puan" icon={<Check size={17} strokeWidth={2.8} />} tone={bakilan ? (alinan / toplam >= 0.7 ? 'good' : alinan / toplam >= 0.5 ? 'mid' : 'bad') : ''} unit={`/ ${toplam}`}>{alinan}</Tile>
      </div>
      <div className={`stack ${k}`}>
        {konu.acik.map((a, i) => <Soru key={a.id} a={a} no={i + 1} isaret={isaret(a)} puan={puan(a)} onYaz={(v) => yaz(a, v)} />)}
      </div>
    </Page>
  );
}

function Soru({ a, no, isaret, puan, onYaz }: { a: Acik; no: number; isaret: number[] | undefined; puan: number; onYaz: (v: number[] | undefined) => void }) {
  const [acik, setAcik] = useState(!!isaret);
  const sec = isaret ?? [];
  const degis = (i: number) => onYaz(sec.includes(i) ? sec.filter((x) => x !== i) : [...sec, i]);
  return (
    <Card title={`${no}. soru: ${a.baslik}`} hint={`${tam(a)} puan`} action={acik ? <span className="yz-puan"><b>{puan}</b> / {tam(a)}</span> : undefined}>
      {(a.b || a.t) && (
        <div className="baglam">
          {a.b?.map((p, i) => <p key={i}><M>{p}</M></p>)}
          {a.t && <TabloKutu t={a.t} />}
        </div>
      )}
      <ol className="yz-alt">
        {a.alt.map((x, i) => <li key={i}><span className="h">{HARF[i]}</span><span><M>{x}</M></span></li>)}
      </ol>
      {!acik ? (
        <div className="row wrap" style={{ marginTop: 16 }}>
          <button className="btn lg pri" onClick={() => { setAcik(true); onYaz(sec); }}><KeyRound size={17} />Çözdüm, puanlama anahtarını aç</button>
          <span className="sm mut">Anahtarı açmadan önce çözümünü kâğıda yaz.</span>
        </div>
      ) : (
        <div className="yz-anahtar">
          <div className="o-l">Puanlama anahtarı: kâğıdında olan adımları işaretle</div>
          {a.adim.map((ad, i) => (
            <button key={i} className={`yz-adim ${sec.includes(i) ? 'on' : ''}`} role="checkbox" aria-checked={sec.includes(i)} onClick={() => degis(i)}>
              <span className="kutu">{sec.includes(i) && <Check size={15} strokeWidth={3.2} />}</span>
              <span className="grow"><M>{ad.m}</M></span>
              <span className="p">{ad.p} puan</span>
            </button>
          ))}
          <div className="row wrap" style={{ marginTop: 12 }}>
            <button className="btn ghost" onClick={() => { setAcik(false); onYaz(undefined); }}><RotateCcw size={15} />Sıfırla ve anahtarı kapat</button>
            {a.kay && <span className="kaynak" style={{ margin: 0 }}><Landmark size={14} /><span><b>Neye göre yazıldı?</b> {a.kay}</span></span>}
          </div>
        </div>
      )}
    </Card>
  );
}
