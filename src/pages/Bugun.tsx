// Bugün: açılış ekranı. Bugün ne yapılacağını tek bakışta söyler.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Zap, Star, RotateCcw, Check, BookOpen, Target, ChevronRight } from 'lucide-react';
import { useStore, set, bugun } from '../store';
import { bekleyenler, devamEt, seri, seviye, tekrarBak, gunAd, tarih, dersDurum, DERSLER } from '../engine';
import { M } from '../math';
import { Page, Card, Tile, Meter, PctBar, kOf, Empty } from '../ui';
import { DersIkon } from '../ikon';

export default function Bugun() {
  const st = useStore();
  const d = bugun();
  const bek = bekleyenler(st), dv = devamEt(st);
  const bg = st.gun[d] ?? 0, sv = seviye(st.xp), sr = seri(st.gun);
  const bak = tekrarBak(st).slice(0, 3);
  const hafta = Array.from({ length: 7 }, (_, i) => d - 6 + i);
  const max = Math.max(st.hedef, ...hafta.map((g) => st.gun[g] ?? 0));
  const dersler = DERSLER.map((x) => ({ x, s: dersDurum(st, x) })).filter((r) => r.s.kart > 0 || r.s.coz > 0);
  const [ad, setAd] = useState('');

  return (
    <Page title={st.ad ? `Merhaba, ${st.ad}` : 'Merhaba'} sub={`${tarih(d)}. ${bek.length ? `Bugün ${bek.length} soru tekrar bekliyor.` : sr ? `${sr} gündür üst üste çalışıyorsun.` : 'Bir konu seç ve başla.'}`}>
      {!st.ad && (
        <Card title="Sana nasıl seslenelim?" style={{ marginBottom: 16 }}>
          <form className="row wrap" onSubmit={(e) => { e.preventDefault(); if (ad.trim()) set({ ad: ad.trim() }); }}>
            <input className="input grow" style={{ maxWidth: 280 }} placeholder="Adın" value={ad} onChange={(e) => setAd(e.target.value)} maxLength={24} />
            <button className="btn pri" disabled={!ad.trim()}>Kaydet</button>
          </form>
        </Card>
      )}

      <div className="grid g-main" style={{ marginBottom: 16 }}>
        <section className="plan">
          <h2>Bugünün planı</h2>
          <p>Üç adım. Sırayla gitmek zorunda değilsin.</p>
          <div className={`plan-row ${bek.length ? '' : 'done'}`}>
            <span className="p-ic">{bek.length ? <RotateCcw size={19} /> : <Check size={20} strokeWidth={3} />}</span>
            <div className="grow">
              <b>{bek.length ? 'Yanlışlarını tekrar et' : 'Bugün tekrar bekleyen soru yok'}</b>
              <small>{bek.length ? `Daha önce yanlış yaptığın ${bek.length} soru bugün yeniden sorulacak.` : 'Yanlış yaptığın sorular zamanı gelince burada görünür.'}</small>
            </div>
            {bek.length > 0 && <Link className="btn lg white" to="/tekrar/coz">Başla</Link>}
          </div>
          <div className="plan-row">
            <span className="p-ic"><BookOpen size={19} /></span>
            <div className="grow">
              <b>{dv ? dv.konu.ad : 'Yeni bir konu seç'}</b>
              <small>{dv ? dv.yazi : 'Dersini ve konunu seç, anlatımla başla.'}</small>
            </div>
            <Link className="btn lg white" to={dv ? `/konu/${dv.konu.id}/${dv.tur === 'anlatim' ? 'anlatim' : 'test'}` : '/dersler'}>{dv ? 'Devam et' : 'Derslere git'}</Link>
          </div>
          <div className={`plan-row ${bg >= st.hedef ? 'done' : ''}`}>
            <span className="p-ic">{bg >= st.hedef ? <Check size={20} strokeWidth={3} /> : <Target size={19} />}</span>
            <div className="grow">
              <b>Günlük hedef: {bg} / {st.hedef} XP</b>
              <div style={{ marginTop: 8 }}><Meter v={bg} max={st.hedef} /></div>
            </div>
          </div>
        </section>

        <Card title="Son 7 gün" hint="Her gün kazandığın puan">
          <div className="hafta">
            {hafta.map((g) => {
              const v = st.gun[g] ?? 0;
              return (
                <div key={g}>
                  <span className="v">{v || ''}</span>
                  <i className={`b ${v ? '' : 'bos'}`} style={{ height: Math.max(3, (v / max) * 80) }} />
                  <span className={g === d ? 'bugun' : ''}>{g === d ? 'Bugün' : gunAd(g)}</span>
                </div>
              );
            })}
          </div>
          <p className="note" style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--line)' }}>Son 7 günde {hafta.filter((g) => st.gun[g]).length} gün çalıştın, toplam {hafta.reduce((a, g) => a + (st.gun[g] ?? 0), 0)} XP kazandın. Günlük hedefin {st.hedef} XP.</p>
        </Card>
      </div>

      <div className="tiles">
        <Tile label="Seri" icon={<Flame size={17} />} tone="seri" unit="gün" sub={sr ? (st.gun[d] ? 'Bugün de çalıştın' : 'Bugün çalışırsan seri sürer') : 'Bugün başlat'}>{sr}</Tile>
        <Tile label="Bugünkü puan" icon={<Zap size={17} />} unit="XP" sub={bg >= st.hedef ? 'Günlük hedef tamam' : `Hedefe ${st.hedef - bg} XP kaldı`}>{bg}</Tile>
        <Tile label="Seviye" icon={<Star size={17} />} sub={`Sonraki seviyeye ${sv.gerek - sv.ic} XP`} to="/profil">{sv.no}</Tile>
        <Tile label="Tekrar bekleyen" icon={<RotateCcw size={17} />} tone={bek.length ? 'bad' : 'good'} unit="soru" sub={bek.length ? 'Bugün yeniden sorulacak' : 'Hepsi tamam'} to="/tekrar">{bek.length}</Tile>
      </div>

      <div className="grid g2">
        <Card title="Bu konulara tekrar bak" hint="Doğru oranın düşük ya da yanlışın bekleyen konular" flush action={<Link className="btn ghost" to="/rapor" style={{ marginRight: 22 }}>Rapor<ChevronRight size={15} /></Link>}>
          {bak.length ? (
            <div className="list">
              {bak.map((b) => (
                <Link key={b.konu.id} to={`/konu/${b.konu.id}`} className={`find ${kOf(b.konu.id)}`}>
                  <span className="find-ic"><RotateCcw size={16} /></span>
                  <div className="grow">
                    <b>{b.konu.ad}</b>
                    <p>{b.neden.join(', ')}.{b.hata && <> En sık hata: <M>{b.hata.yan.ad.toLocaleLowerCase('tr')}</M>.</>}</p>
                  </div>
                  <ChevronRight size={17} className="dim" style={{ marginTop: 7 }} />
                </Link>
              ))}
            </div>
          ) : <Empty title="Tekrar bakman gereken konu yok">Test çözdükçe zorlandığın konular burada görünür.</Empty>}
        </Card>
        <Card title="Çalıştığın dersler" flush action={<Link className="btn ghost" to="/dersler" style={{ marginRight: 22 }}>Bütün dersler<ChevronRight size={15} /></Link>}>
          {dersler.length ? (
            <div className="list">
              {dersler.map(({ x, s }) => (
                <Link key={x.id} to={`/ders/${x.id}`} className={kOf(x)}>
                  <span className="find-ic"><DersIkon id={x.id} size={16} /></span>
                  <div className="grow"><b style={{ fontWeight: 650 }}>{x.ad}</b><div className="xs dim">{s.kart} / {s.kartTop} anlatım kartı, {s.coz} soru</div></div>
                  <div style={{ width: 150 }}><PctBar p={s.oran} /></div>
                </Link>
              ))}
            </div>
          ) : <Empty title="Henüz bir derse başlamadın"><Link className="btn pri" to="/dersler" style={{ marginTop: 12 }}>Derslere git</Link></Empty>}
        </Card>
      </div>
    </Page>
  );
}
