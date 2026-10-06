import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, BarChart3, Flag, Users, Activity } from 'lucide-react';
import { ds, LAST, TESTS, at, members, rootEnt, entName, entHref, entKind, scopeN, type Ent } from '../engine/core';
import { forecast, pAbove, type Fc } from '../engine/analysis';
import { fmt, pct } from '../engine/fmt';
import { useStore } from '../store';
import { Page, Card, Num, Delta, DataTable, EntField, Empty, useQuery, Tile, Who, LBar, type Col } from '../ui';
import { Histogram, Bars } from '../charts';

const valid = (en: string) => en === 'o' || /^l:1[12]$/.test(en) || (/^c:\d+$/.test(en) && !!ds.classes[+en.slice(2)]) || (/^s:\d+$/.test(en) && !!ds.students[+en.slice(2)]);

export default function Forecast() {
  const st = useStore(), q = useQuery(), nav = useNavigate();
  const root = rootEnt(st.level), kim = q.get('kim'), en: Ent = valid(kim) ? kim : root;
  const [cut, setCut] = useState(() => +q.get('esik', '300') || 300);
  interface Row { s: number; f: Fc; p: number; last: number | null }
  const all = useMemo(() => members(en).map((s) => ({ s, f: forecast(s), last: at(`s:${s}`, LAST, 'all', 'net') })).filter((r): r is { s: number; f: Fc; last: number | null } => r.f != null), [en]);
  const rows: Row[] = all.map((r) => ({ ...r, p: pAbove(r.f, cut) }));
  const n = rows.length, avg = n ? rows.reduce((a, r) => a + r.f.puan, 0) / n : null, avgNet = n ? rows.reduce((a, r) => a + r.f.net, 0) / n : null;
  const expect = rows.reduce((a, r) => a + r.p, 0);
  const edge = rows.filter((r) => r.p >= 0.25 && r.p < 0.6).sort((a, b) => b.p - a.p);
  const single = entKind(en) === 'student' ? rows[0] : null;

  const cols: Col<Row>[] = [
    { id: 'ad', head: 'Öğrenci', cell: (r) => <Who en={`s:${r.s}`} />, val: (r) => ds.students[r.s].name },
    { id: 'sn', head: 'Sınıf', cell: (r) => <span className="tag">{ds.classes[ds.students[r.s].cls].name}</span>, val: (r) => ds.classes[ds.students[r.s].cls].name },
    { id: 'puan', head: 'Tahmini puan', right: true, cell: (r) => <span className="nowrap"><span className="num" style={{ fontSize: 15.5 }}>≈ {fmt(r.f.puan, 0)}</span> <span className="dim">± {fmt(r.f.sdP, 0)}</span></span>, val: (r) => r.f.puan },
    { id: 'p', head: `${cut} puanı geçme ihtimali`, cell: (r) => <LBar v={r.p * 100} max={100}>{pct(r.p * 100)}</LBar>, val: (r) => r.p * 100 },
    { id: 'net', head: 'Tahmini net', right: true, cell: (r) => <span className="nowrap">{fmt(r.f.net)} <span className="dim">± {fmt(r.f.sd)}</span></span>, val: (r) => r.f.net },
    { id: 'son', head: 'Son denemesine göre', right: true, cell: (r) => <Delta v={r.last != null ? r.f.net - r.last : null} />, val: (r) => (r.last != null ? r.f.net - r.last : null) },
  ];

  return (
    <Page title="Bugün sınav olsa" sub="Her öğrencinin denemelerinden çıkarılan tahmin. Son denemeler daha çok sayılır; denemenin kolay ya da zor çıkması Türkiye ortalamasıyla dengelenir."
      actions={<>
        <EntField value={en} onChange={(e) => q.put({ kim: e === root ? null : e })} kinds={['top', 'class', 'student']} />
        <label className="field" style={{ gap: 8 }}>
          <span className="lbl">Hedef puan</span>
          <input type="number" min={100} max={500} step={10} value={cut} onChange={(e) => { const v = Math.max(100, Math.min(500, +e.target.value || 0)); setCut(v); q.put({ esik: v === 300 ? null : `${v}` }); }}
            style={{ width: 58, border: 0, background: 'none', outline: 'none', fontWeight: 600 }} aria-label="Hedef puan" />
        </label>
      </>}>
      {!n ? <Card><Empty title="Tahmin için yeterli deneme yok">Bir öğrencinin en az iki denemeye girmiş olması gerekir.</Empty></Card> : (
        <>
          <div className="tiles">
            <Tile tone="brand" icon={<Target size={17} />} label={single ? 'Tahmini TYT puanı' : 'Tahmini TYT puanı ortalaması'} unit="puan" sub={entName(en)}>
              ≈ <Num v={avg} dig={0} />
            </Tile>
            <Tile icon={<BarChart3 size={17} />} label="Tahmini net" unit="net" sub="120 soruda">{fmt(avgNet)}</Tile>
            {single
              ? <Tile tone={single.p >= 0.6 ? 'good' : single.p < 0.25 ? 'bad' : 'mid'} icon={<Flag size={17} />} label={`${cut} puanı geçme ihtimali`} sub="Hedef puanı sağ üstten değiştirebilirsiniz">{pct(single.p * 100)}</Tile>
              : <Tile tone="good" icon={<Flag size={17} />} label={`${cut} puanı geçmesi beklenen`} unit={`/ ${n} öğrenci`} sub="Hedef puanı sağ üstten değiştirebilirsiniz">{fmt(expect, 0)}</Tile>}
            {single
              ? <Tile icon={<Activity size={17} />} label="Tahmin ne kadar oynayabilir" unit="puan" sub="Denemeden denemeye ne kadar değiştiğine göre">± {fmt(single.f.sdP, 0)}</Tile>
              : <Tile tone={edge.length ? 'mid' : ''} icon={<Users size={17} />} label="Sınırdaki öğrenci" sub="Biraz artışla hedefi geçebilecek olanlar">{edge.length}</Tile>}
          </div>

          {single ? (
            <div className="grid g2">
              <Card title="Testlere göre tahmini net" hint={`${single.f.k} denemeden hesaplandı. Çubuk, testin soru sayısına göre dolar.`}>
                <Bars dig={1} tw={92} rows={TESTS.map((t, i) => {
                  const of = scopeN(`t:${t.id}`, LAST);
                  return { key: t.id, k: `k-${t.id}`, label: t.name, v: single.f.test[i], of, text: `${fmt(single.f.test[i])} / ${of}` };
                })} />
              </Card>
              <Card title="Bu tahmin nasıl yapılıyor">
                <p className="mut">Öğrencinin girdiği denemelerin ortalaması alınır; son deneme en çok, eski denemeler giderek daha az sayılır. Bir denemede çok iyi, ötekinde kötü yapan öğrencide tahmin daha geniş bir aralıkta oynar.</p>
                <button className="btn" style={{ marginTop: 14 }} onClick={() => nav(entHref(en))}>Öğrencinin profilini aç</button>
              </Card>
            </div>
          ) : (
            <div className="stack">
              <div className="grid g-main">
                <Card title="Kaç öğrenci hangi puanda" hint={`Her çubuk 20 puanlık bir aralık. Yeşil çubuklar ${cut} puanın üstünde, gri çubuklar altında.`}>
                  <Histogram height={262} values={rows.map((r) => r.f.puan)} step={20} mark={cut} label={(lo, hi) => `${fmt(lo, 0)} – ${fmt(hi, 0)} puan`} />
                </Card>
                <Card flush title="Sınırdakiler" k="k-mid" hint={`${cut} puanı geçme ihtimali %25 ile %60 arasında olanlar. Küçük bir artış sonucu değiştirir.`}>
                  {edge.length ? (
                    <div className="list" style={{ maxHeight: 264, overflowY: 'auto' }}>
                      {edge.slice(0, 20).map((r) => (
                        <div key={r.s} className="click" style={{ cursor: 'pointer' }} onClick={() => nav(entHref(`s:${r.s}`))}>
                          <span className="grow clip"><span className="ent">{ds.students[r.s].name}</span> <span className="dim sm">{ds.classes[ds.students[r.s].cls].name}</span></span>
                          <span className="sm mut nowrap">≈ {fmt(r.f.puan, 0)} puan</span>
                          <span className="tag mid" style={{ width: 52, justifyContent: 'center' }}>{pct(r.p * 100)}</span>
                        </div>
                      ))}
                    </div>
                  ) : <Empty title="Bu hedefte sınırda öğrenci yok">Hedef puanı değiştirerek başka bir sınıra bakabilirsiniz.</Empty>}
                </Card>
              </div>
              <Card flush>
                <DataTable cols={cols} rows={rows} rowKey={(r) => r.s} onRow={(r) => nav(entHref(`s:${r.s}`))} sort={{ id: 'puan', desc: true }} csv="bugun-sinav-olsa" limit={40} />
              </Card>
            </div>
          )}
          <p className="note" style={{ marginTop: 14, maxWidth: '86ch' }}>
            Puan yaklaşık bir hesaptır: 100 taban puana her testin neti, testin katsayısıyla çarpılarak eklenir
            ({TESTS.map((t) => `${t.name} ${fmt(t.coef)}`).join(', ')}). Gerçek TYT puanı o yıl sınava girenlere göre belirlenir;
            buradaki değer kesin sonuç değildir.
          </p>
        </>
      )}
    </Page>
  );
}
