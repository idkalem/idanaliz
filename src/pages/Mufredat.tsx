// Sınıf ve derse göre öğrenme çıktıları. Tablo, MEB'in konu soru dağılım tablosundan üretilen mufredat.ts dosyasından gelir;
// her çıktının yanında yazılıdaki soru sayısı ve o çıktıyı işleyen İD Okul konuları durur.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, ChevronRight, Landmark, Clock } from 'lucide-react';
import { MDERSLER, SINAV, satirlar, cikiKonulari, type Satir } from '../content';
import { useStore } from '../store';
import { konuDurum } from '../engine';
import { Page, Card, Seg, Empty, PctBar } from '../ui';
import { DersIkon } from '../ikon';

/** Senaryolara göre soru sayısı: "2-3 soru". */
export function soruAraligi(v: number[]): string {
  if (!v.length) return '';
  const a = Math.min(...v), b = Math.max(...v);
  return b === 0 ? 'Soru yok' : a === b ? `${a} soru` : `${a}-${b} soru`;
}

export default function Mufredat() {
  const { sinif = '', ders = '' } = useParams();
  const st = useStore();
  const [yz, setYz] = useState<1 | 2>(1);
  const n = +sinif, md = MDERSLER.find((d) => d.id === ders), rows = satirlar(n, ders), sv = SINAV[`${ders}${n}`];
  if (!md || !rows.length || !sv) return <Page title="Bulunamadı"><Card><Empty title="Bu sınıf ve ders için tablo yok"><Link className="btn" to="/dersler" style={{ marginTop: 12 }}>Derslere dön</Link></Empty></Card></Page>;

  const k = `k-${md.grup}`;
  const ulke = yz === 1 ? sv.ulke1 : sv.ulke2, senaryo = yz === 1 ? sv.s1 : sv.s2;
  const say = (r: Satir) => (yz === 1 ? r.y1 : r.y2);
  // Tema → konu → çıktılar, tablodaki sırayla
  const temalar: { ad: string; konular: { ad: string; rows: Satir[] }[] }[] = [];
  for (const r of rows) {
    let t = temalar[temalar.length - 1];
    if (!t || t.ad !== r.tema) temalar.push(t = { ad: r.tema, konular: [] });
    let kn = t.konular[t.konular.length - 1];
    if (!kn || kn.ad !== r.konu) t.konular.push(kn = { ad: r.konu, rows: [] });
    kn.rows.push(r);
  }
  const hazir = ders === 'tde' ? [] : [...new Set(rows.flatMap((r) => cikiKonulari(r.kod)))];

  return (
    <Page
      title={`${n}. sınıf ${md.ad}`}
      crumb={<Link to="/dersler">Dersler</Link>}
      sub={`${temalar.length} tema, ${rows.length} öğrenme çıktısı. ${hazir.length ? `${hazir.length} konunun anlatımı ve testi hazır.` : 'Bu dersin konu anlatımları hazırlanıyor.'}`}
      actions={<Seg id="yazili" value={yz} onChange={setYz} options={[{ id: 1, label: '1. yazılı' }, { id: 2, label: '2. yazılı' }]} />}
    >
      <div className={`grid g-main ${k}`}>
        <div className="stack">
          {temalar.map((t, ti) => (
            <Card key={t.ad + ti} title={t.ad} icon={<DersIkon id={md.ikon} size={18} />} k={k} flush>
              {t.konular.map((kn, ki) => (
                <div key={ki} className="muf-konu">
                  <div className="muf-ad">{kn.ad}</div>
                  {kn.rows.map((r, ri) => {
                    const v = say(r), ks = ders === 'tde' ? [] : cikiKonulari(r.kod);
                    return (
                      <div key={ri} className="muf-satir">
                        <span className="tag kod">{r.kod}</span>
                        <div className="grow">
                          <p>{r.cikti}</p>
                          {ks.length > 0 && (
                            <div className="muf-ders">
                              {ks.map((kk) => {
                                const d = konuDurum(st, kk);
                                return (
                                  <Link key={kk.id} to={`/konu/${kk.id}`} className="muf-link">
                                    <span className="ml-ic"><BookOpen size={16} /></span>
                                    <span className="grow"><b>{kk.ad}</b><small><Clock size={12} />{kk.dk + (kk.tdk ?? 0)} dakika: anlatım ve test</small></span>
                                    {d.coz > 0 && <span style={{ width: 120 }}><PctBar p={d.oran} /></span>}
                                    <ChevronRight size={17} className="dim" />
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="muf-say">
                          {ulke ? <span className="tag">Ülke geneli</span> : v.length ? <><b className={Math.max(...v) === 0 ? 'yok' : ''}>{soruAraligi(v)}</b><small title="Senaryolara göre soru sayısı">{v.join(' · ')}</small></> : <span className="dim">–</span>}
                          {!ks.length && <span className="tag">Hazırlanıyor</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </Card>
          ))}
        </div>
        <div className="stack">
          <Card title={`${yz}. ortak yazılı`} icon={<Landmark size={18} />} k="k-brand">
            {ulke ? (
              <p className="sm mut">Bu sınav ülke geneli ortak yazılı olarak yapılacak. MEB, konu soru dağılım tablosunu sınavdan önce kılavuzla birlikte yayımlayacağını bildirdi; yayımlanınca buraya eklenecek.</p>
            ) : (
              <>
                <p className="sm mut">MEB bu sınav için <b>{senaryo} senaryo</b> yayımladı. Her senaryoda bir öğrenme çıktısından kaç soru geleceği yazar; hangi senaryonun uygulanacağını okulun zümresi belirler.</p>
                <p className="sm mut" style={{ marginTop: 8 }}>Sağdaki kalın yazı senaryolardaki en az ve en çok soru sayısıdır. Altındaki küçük sayılar senaryoları sırayla gösterir.</p>
              </>
            )}
          </Card>
          <Card title="Bu tablo nereden geliyor?">
            <p className="sm mut">Tema, konu, öğrenme çıktısı ve soru sayıları MEB Ölçme, Değerlendirme ve Sınav Hizmetleri Genel Müdürlüğünün 2026-2027 1. dönem konu soru dağılım tablosundan değiştirilmeden alındı.</p>
            <Link className="btn" to="/kaynaklar" style={{ marginTop: 12 }}><Landmark size={15} />Bütün kaynakları gör</Link>
          </Card>
        </div>
      </div>
    </Page>
  );
}
