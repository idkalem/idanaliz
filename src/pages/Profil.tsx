// Profil: avatar ve dükkânı, seviye, jeton, rozetler, sınıf sıralaması, kişisel mod, yapay zekâ ve hesap ayarları.
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Lock, Trash2, Coins, Snowflake, LogOut, Sparkles } from 'lucide-react';
import { useStore, useKok, set, sifirla, cikis, satinAl, donAl, toast, DON_FIYAT, DON_EN_COK, type Kisisel } from '../store';
import { seviye, rozetler, lig, seri } from '../engine';
import { Page, Card, Meter, Seg, Switch, Tabs } from '../ui';
import { Avatar, KATALOG, TURLER, AV_RENK, parcaDurum, type Tur } from '../avatar';
import { RozetIkon } from '../ikon';
import { sesVar } from '../parca';
import { AnahtarKutusu } from '../sohbet';

export default function Profil() {
  const st = useStore(), kok = useKok();
  const [sp] = useSearchParams();
  const sv = seviye(st.xp), rz = rozetler(st), sira = lig(kok, st);
  const rozet = Object.fromEntries(rz.map((r) => [r.id, { ad: r.ad, ok: r.ok }]));
  const max = Math.max(1, ...sira.map((r) => r.xp));
  const [emin, setEmin] = useState(false);
  const [tur, setTur] = useState<Tur>('renk');
  const ks = (p: Partial<Kisisel>) => set({ kisisel: { ...st.kisisel, ...p } });
  const ogrenci = st.rol === 'ogrenci';
  const aiRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (sp.get('ai')) aiRef.current?.scrollIntoView({ block: 'center' }); }, [sp]);

  /** Parçaya dokunma: açıksa giy, jetonla alınıyorsa al ve giy. */
  const sec = (i: number) => {
    const p = parcaDurum(st, tur, i, sv.no, rozet);
    if (!p.acik) {
      if (!p.fiyat) return;
      if (!satinAl(`${tur}:${i}`, p.fiyat)) { toast(`${p.fiyat - st.jeton} jeton daha gerek`); return; }
      toast(`${KATALOG[tur][i].ad} alındı`);
    }
    set({ avatar: { ...st.avatar, [tur]: i } });
  };

  return (
    <Page title="Profil" sub={ogrenci ? 'Avatarın, rozetlerin ve çalışma ayarların.' : 'Avatarın ve bu cihazın ayarları.'}>
      <div className="grid g-main">
        <div className="stack">
          <Card>
            <div className="row wrap" style={{ gap: 20, alignItems: 'center' }}>
              <Avatar a={st.avatar} size={132} />
              <div className="grow" style={{ minWidth: 220 }}>
                <input className="input" style={{ width: '100%', maxWidth: 280, fontWeight: 650, fontSize: 17 }} placeholder="Adın" value={st.ad} maxLength={24} onChange={(e) => set({ ad: e.target.value })} aria-label="Adın" />
                <div className="row" style={{ margin: '14px 0 7px', alignItems: 'baseline' }}>
                  <b style={{ fontSize: 17 }}>Seviye {sv.no}</b>
                  <span className="sm mut grow">{st.xp} XP, {seri(st)} günlük seri</span>
                  <span className="sm mut">{sv.ic} / {sv.gerek}</span>
                </div>
                <Meter v={sv.ic} max={sv.gerek} />
                <div className="row" style={{ marginTop: 12 }}><span className="say jeton"><Coins size={17} />{st.jeton}<small>jeton</small></span><span className="note">Her 5 XP bir jeton kazandırır.</span></div>
              </div>
            </div>

            <div className="ayar-l">Avatarını düzenle</div>
            <Tabs id="av" value={tur} onChange={setTur} tabs={TURLER.map((t) => ({ id: t.id, label: t.ad }))} />
            {tur === 'renk' ? (
              <div className="renkler">
                {AV_RENK.map((c, i) => <button key={c} className={st.avatar.renk === i ? 'on' : ''} style={{ ['--c' as string]: c }} aria-label={KATALOG.renk[i].ad} aria-pressed={st.avatar.renk === i} onClick={() => sec(i)} />)}
              </div>
            ) : (
              <div className="secenekler">
                {KATALOG[tur].map((x, i) => {
                  const p = parcaDurum(st, tur, i, sv.no, rozet), on = st.avatar[tur] === i, alinir = !p.acik && p.fiyat != null;
                  return (
                    <button key={x.ad} className={`${on ? 'on' : ''} ${!p.acik && !alinir ? 'kilit' : ''}`} title={p.acik ? x.ad : alinir ? `${x.ad}: ${p.fiyat} jeton` : `${x.ad}: ${p.kosul}`} aria-pressed={on} disabled={!p.acik && !alinir} onClick={() => sec(i)}>
                      <Avatar a={{ ...st.avatar, [tur]: i }} size={54} />
                      <span className="p-ad">{x.ad}</span>
                      {alinir && <span className={`kl fiyat ${st.jeton >= p.fiyat! ? '' : 'az'}`}><Coins size={11} />{p.fiyat}</span>}
                      {!p.acik && !alinir && <span className="kl"><Lock size={10} /></span>}
                    </button>
                  );
                })}
              </div>
            )}
            <p className="note" style={{ marginTop: 12 }}>Jetonlu parçaya dokununca satın alınır ve giyilir. Kilitli parçalar seviye atlayınca ya da rozet kazanınca açılır; üzerine gelince koşulu yazar.</p>
          </Card>

          {ogrenci && (
            <Card title="Rozetler" hint={`${rz.filter((r) => r.ok).length} / ${rz.length} kazanıldı`}>
              <div className="rozetler">
                {rz.map((r) => (
                  <div key={r.id} className={`rozet ${r.ok ? '' : 'yok'}`}>
                    <span className="r-ic"><RozetIkon id={r.id} /></span>
                    <b>{r.ad}</b>
                    <small>{r.ok ? r.ne : `${r.ne} (${r.var} / ${r.gerek})`}</small>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div ref={aiRef}>
            <Card title="Yapay zekâ" hint="Bu cihaz için bir kez ayarlanır; bütün hesaplar kullanır." icon={<Sparkles size={17} />}>
              <AnahtarKutusu />
            </Card>
          </div>
        </div>

        <div className="stack">
          {ogrenci && (
            <Card title="Bu haftanın sıralaması" hint={`${st.sinif || 'Bu cihazdaki öğrenciler'}. Puan çalışmayı ölçer: anlatım okumak, soru çözmek ve tekrar yapmak kazandırır.`} flush>
              <div style={{ paddingBottom: 10 }}>
                {sira.map((r, i) => (
                  <div key={r.id} className={`lig-row ${r.ben ? 'ben' : ''}`}>
                    <span className="sira">{i + 1}</span>
                    <Avatar a={r.av} size={32} />
                    <span className="clip">{r.ben ? `${r.ad} (sen)` : r.ad}</span>
                    <Meter v={r.xp} max={max} />
                    <b>{r.xp} XP</b>
                  </div>
                ))}
              </div>
              {sira.length < 2 && <p className="note" style={{ padding: '0 22px 16px' }}>Sınıf arkadaşların bu cihazda hesap açınca sıralamada görünür.</p>}
            </Card>
          )}

          {ogrenci && (
            <Card title="Seri dondurma" hint="Çalışamadığın bir gün serini korur." icon={<Snowflake size={17} />}>
              <div className="ayar">
                <div className="grow"><b>Elinde {st.don} / {DON_EN_COK} dondurma var</b><small>Bir günü kaçırırsan kendiliğinden kullanılır.</small></div>
                <button className="btn" disabled={st.don >= DON_EN_COK || st.jeton < DON_FIYAT} onClick={() => { if (donAl()) toast('Seri dondurma alındı'); }}><Coins size={15} />{DON_FIYAT} jetona al</button>
              </div>
            </Card>
          )}

          {ogrenci && (
            <Card title="Kişisel mod" hint="İsteyen açar. Anlatım senin seçtiğin biçimde gelir.">
              <div className="ayar"><div className="grow"><b>Kişisel modu aç</b><small>Kapalıyken herkes aynı anlatımı görür.</small></div><Switch on={st.kisisel.acik} onChange={(v) => ks({ acik: v })} label="Kişisel mod" /></div>
              {st.kisisel.acik && (
                <>
                  <div className="ayar"><div className="grow"><b>Anlatım uzunluğu</b><small>Kısa: yalnız ana fikir, kural ve örnek.</small></div><Seg id="tempo" value={st.kisisel.tempo} onChange={(v) => ks({ tempo: v })} options={[{ id: 'kisa', label: 'Kısa' }, { id: 'tam', label: 'Ayrıntılı' }]} /></div>
                  <div className="ayar"><div className="grow"><b>Önce hangisi gelsin</b><small>Kimi kuralı görüp örneğe geçer, kimi örnekten kurala gider.</small></div><Seg id="once" value={st.kisisel.once} onChange={(v) => ks({ once: v })} options={[{ id: 'kural', label: 'Kural' }, { id: 'ornek', label: 'Örnek' }]} /></div>
                  <div className="ayar"><div className="grow"><b>Kartı sesli oku</b><small>{sesVar ? 'Her kart açıldığında tarayıcının sesiyle okunur.' : 'Bu tarayıcıda sesli okuma yok.'}</small></div><Switch on={st.kisisel.dinle} onChange={(v) => ks({ dinle: v })} label="Sesli oku" /></div>
                </>
              )}
            </Card>
          )}

          <Card title="Hesap">
            {ogrenci && <div className="ayar"><div className="grow"><b>Sınıfın</b><small>Sıralama ve öğretmen ekranı buna göre gruplanır.</small></div><input className="input" style={{ width: 110 }} value={st.sinif} maxLength={8} placeholder="9-A" onChange={(e) => set({ sinif: e.target.value })} aria-label="Sınıfın" /></div>}
            {ogrenci && <div className="ayar"><div className="grow"><b>Günlük hedef</b><small>Bir günde kazanmak istediğin puan.</small></div><Seg id="hedef" value={st.hedef} onChange={(v) => set({ hedef: v })} options={[{ id: 30, label: '30' }, { id: 50, label: '50' }, { id: 100, label: '100' }]} /></div>}
            <div className="ayar"><div className="grow"><b>Çıkış yap</b><small>Hesabın bu cihazda kalır; başkası kendi hesabıyla girebilir.</small></div><button className="btn" onClick={cikis}><LogOut size={15} />Çıkış</button></div>
            {ogrenci && (
              <div className="ayar"><div className="grow"><b>Çalışma kaydını sıfırla</b><small>Puanın, yanlışların ve raporun silinir. Adın, şifren ve avatarın kalır.</small></div>
                {emin ? <><button className="btn" onClick={() => setEmin(false)}>Vazgeç</button><button className="btn pri" style={{ background: 'var(--bad)' }} onClick={() => { sifirla(); setEmin(false); }}>Evet, sil</button></> : <button className="btn" onClick={() => setEmin(true)}><Trash2 size={15} />Sıfırla</button>}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Page>
  );
}
