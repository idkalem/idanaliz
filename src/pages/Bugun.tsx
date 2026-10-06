// Bugün: açılış ekranı. Bugün ne yapılacağını tek bakışta söyler.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Flame, Zap, Star, RotateCcw, Check, Target, ChevronRight, Gift, Coins, ClipboardList, Timer, Coffee, Snowflake } from 'lucide-react';
import { useStore, useKok, bugun, sandikAc, SANDIK_ODUL } from '../store';
import { bekleyenler, devamEt, seri, seviye, tekrarBak, gunAd, tarih, program, gorevler, odevler } from '../engine';
import { M } from '../math';
import { Page, Card, Tile, Meter, kOf, Empty } from '../ui';
import { Avatar } from '../avatar';
import { IsSatiri } from './Program';

export default function Bugun() {
  const st = useStore(), kok = useKok();
  const d = bugun();
  const bek = bekleyenler(st), dv = devamEt(st);
  const bg = st.gun[d] ?? 0, sv = seviye(st.xp), sr = seri(st);
  const bak = tekrarBak(st).slice(0, 3);
  const hafta = Array.from({ length: 7 }, (_, i) => d - 6 + i);
  const max = Math.max(st.hedef, ...hafta.map((g) => st.gun[g] ?? 0));
  const plan = program(st, kok)[0], isler = plan.isler.slice(0, 3);
  const gs = gorevler(st), hepsi = gs.every((g) => g.ok), acildi = st.sandik === d;
  const os = odevler(st, kok).filter((o) => !o.tamam || o.o.son >= d);
  const [kutla, setKutla] = useState(false);
  const selam = hepsi ? 'Bugünün görevlerini bitirdin. Harikasın!'
    : bek.length ? `Bugün ${bek.length} soru tekrar bekliyor. Yaklaşık ${Math.max(2, Math.ceil(bek.length * 1.5))} dakikada biter.`
    : st.donGun.includes(d - 1) ? 'Dün çalışamadın ama seri dondurman serini korudu.'
    : sr ? `${sr} gündür üst üste çalışıyorsun. Bugün de devam edelim mi?`
    : 'Hazırsan bir konu seçelim ve başlayalım.';

  return (
    <Page title={`Merhaba, ${st.ad}`} sub={tarih(d)}>
      <div className="selam">
        <Avatar a={st.avatar} size={76} hal={hepsi ? 'sevinc' : bek.length ? 'dusun' : 'normal'} />
        <p>{selam}</p>
      </div>

      <div className="grid g-main" style={{ marginBottom: 16 }}>
        <section className="plan">
          <h2>Bugünün planı</h2>
          <p>{plan.calis ? 'Programından bugüne düşenler. Sırayla gitmek zorunda değilsin.' : 'Bugün programında dinlenme günü. İstersen yine de çalışabilirsin.'}</p>
          {isler.map((x, i) => (
            <div key={i} className="plan-row">
              <span className="p-ic">{x.tur === 'tekrar' ? <RotateCcw size={19} /> : <ClipboardList size={19} />}</span>
              <div className="grow"><b>{x.ad}</b><small>{x.neden}, yaklaşık {x.dk} dk</small></div>
              <Link className="btn lg white" to={x.to}>Başla</Link>
            </div>
          ))}
          {!isler.length && (
            <div className="plan-row">
              <span className="p-ic">{plan.calis ? <Check size={20} strokeWidth={3} /> : <Coffee size={19} />}</span>
              <div className="grow"><b>{dv ? dv.konu.ad : 'Yeni bir konu seç'}</b><small>{dv ? dv.yazi : 'Dersini ve konunu seç, anlatımla başla.'}</small></div>
              <Link className="btn lg white" to={dv ? `/konu/${dv.konu.id}/${dv.tur === 'anlatim' ? 'anlatim' : 'test'}` : '/dersler'}>{dv ? 'Devam et' : 'Derslere git'}</Link>
            </div>
          )}
          <div className={`plan-row ${bg >= st.hedef ? 'done' : ''}`}>
            <span className="p-ic">{bg >= st.hedef ? <Check size={20} strokeWidth={3} /> : <Target size={19} />}</span>
            <div className="grow">
              <b>Günlük hedef: {bg} / {st.hedef} XP</b>
              <div style={{ marginTop: 8 }}><Meter v={bg} max={st.hedef} /></div>
            </div>
          </div>
          <div className="plan-alt">
            <Timer size={16} /><span className="grow">Az vaktin mi var?</span>
            {[5, 10, 20].map((n) => <Link key={n} to={`/tekrar/coz?sure=${n}`}>{n} dk</Link>)}
            <Link to="/program">Bütün program<ChevronRight size={14} /></Link>
          </div>
        </section>

        <Card title="Günlük görevler" hint="Üçünü de bitir, sandığı aç" icon={<Gift size={17} />}>
          <div className="gorevler">
            {gs.map((g) => (
              <div key={g.id} className={`gorev ${g.ok ? 'ok' : ''}`}>
                <span className="g-ic">{g.ok ? <Check size={16} strokeWidth={3} /> : null}</span>
                <div className="grow"><b>{g.ad}</b><Meter v={g.var} max={g.gerek} k={g.ok ? 'k-good' : ''} /></div>
                <span className="sm mut num">{g.var} / {g.gerek}</span>
              </div>
            ))}
          </div>
          <div className={`sandik ${hepsi && !acildi ? 'hazir' : ''} ${acildi ? 'acik' : ''}`}>
            <motion.span className="s-ic" animate={kutla ? { rotate: [0, -14, 12, -8, 0], scale: [1, 1.25, 1] } : {}} transition={{ duration: 0.6 }}><Gift size={24} /></motion.span>
            <div className="grow">
              <b>{acildi ? 'Bugünkü sandığı açtın' : hepsi ? 'Sandık hazır' : 'Günün sandığı'}</b>
              <small>{acildi ? `${SANDIK_ODUL} jeton kazandın. Yarın yenisi gelir.` : `İçinde ${SANDIK_ODUL} jeton var. Jetonla avatarına parça alırsın.`}</small>
            </div>
            {!acildi && <button className="btn lg pri" disabled={!hepsi} onClick={() => { sandikAc(); setKutla(true); }}>Aç</button>}
          </div>
        </Card>
      </div>

      <div className="tiles">
        <Tile label="Seri" icon={<Flame size={17} />} tone="seri" unit="gün" sub={st.don ? <><Snowflake size={14} />{st.don} seri dondurman var</> : sr ? (st.gun[d] ? 'Bugün de çalıştın' : 'Bugün çalışırsan seri sürer') : 'Bugün başlat'}>{sr}</Tile>
        <Tile label="Bugünkü puan" icon={<Zap size={17} />} unit="XP" sub={bg >= st.hedef ? 'Günlük hedef tamam' : `Hedefe ${st.hedef - bg} XP kaldı`}>{bg}</Tile>
        <Tile label="Seviye" icon={<Star size={17} />} sub={`Sonraki seviyeye ${sv.gerek - sv.ic} XP`} to="/profil">{sv.no}</Tile>
        <Tile label="Jeton" icon={<Coins size={17} />} tone="jeton" sub="Avatar parçası ve seri dondurma için" to="/profil">{st.jeton}</Tile>
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

        <div className="stack">
          {os.length > 0 && (
            <Card title="Ödevlerin" hint="Öğretmeninin verdiği kavrama testleri" flush>
              <div className="pgun-ic">
                {os.map(({ o, konu, tamam }) => tamam
                  ? <div key={o.id} className="is k-good"><span className="find-ic"><Check size={16} strokeWidth={3} /></span><div className="grow"><b>{konu.ad}: kavrama testi</b><small>Tamamlandı</small></div></div>
                  : <IsSatiri key={o.id} basla x={{ tur: 'test', konu, ad: `${konu.ad}: kavrama testi`, neden: o.son < d ? `Son gün geçti (${tarih(o.son)})` : `Son gün ${o.son === d ? 'bugün' : tarih(o.son)}`, dk: Math.ceil(konu.sorular.length * 1.5), to: `/konu/${konu.id}/test` }} />)}
              </div>
            </Card>
          )}
          <Card title="Son 7 gün" hint="Her gün kazandığın puan">
            <div className="hafta">
              {hafta.map((g) => {
                const v = st.gun[g] ?? 0;
                return (
                  <div key={g}>
                    <span className="v">{v || (st.donGun.includes(g) ? <Snowflake size={13} /> : '')}</span>
                    <i className={`b ${v ? '' : 'bos'}`} style={{ height: Math.max(3, (v / max) * 80) }} />
                    <span className={g === d ? 'bugun' : ''}>{g === d ? 'Bugün' : gunAd(g)}</span>
                  </div>
                );
              })}
            </div>
            <p className="note" style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--line)' }}>Son 7 günde {hafta.filter((g) => st.gun[g]).length} gün çalıştın, toplam {hafta.reduce((a, g) => a + (st.gun[g] ?? 0), 0)} XP kazandın. Günlük hedefin {st.hedef} XP.</p>
          </Card>
        </div>
      </div>
    </Page>
  );
}
