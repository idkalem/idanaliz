// Profil: avatar, seviye, rozetler, haftalık sıralama, kişisel mod ve ayarlar.
import { useState } from 'react';
import { Lock, Database, Trash2 } from 'lucide-react';
import { useStore, set, sifirla, type Kisisel } from '../store';
import { seviye, rozetler, lig, seri } from '../engine';
import { demo } from '../demo';
import { Page, Card, Meter, Seg, Switch, Avatar, AV_RENK, AV_GOZ, AV_AKS } from '../ui';
import { RozetIkon } from '../ikon';
import { sesVar } from '../parca';

export default function Profil() {
  const st = useStore();
  const sv = seviye(st.xp), rz = rozetler(st), sira = lig(st);
  const max = Math.max(1, ...sira.map((r) => r.xp));
  const [emin, setEmin] = useState(false);
  const av = (p: Partial<typeof st.avatar>) => set({ avatar: { ...st.avatar, ...p } });
  const ks = (p: Partial<Kisisel>) => set({ kisisel: { ...st.kisisel, ...p } });
  const sonraki = AV_AKS.find((a) => a.lv > sv.no);

  return (
    <Page title="Profil" sub="Avatarın, rozetlerin ve çalışma ayarların.">
      <div className="grid g-main">
        <div className="stack">
          <Card>
            <div className="row wrap" style={{ gap: 20, alignItems: 'center' }}>
              <Avatar a={st.avatar} size={116} />
              <div className="grow" style={{ minWidth: 220 }}>
                <input className="input" style={{ width: '100%', maxWidth: 280, fontWeight: 650, fontSize: 17 }} placeholder="Adın" value={st.ad} maxLength={24} onChange={(e) => set({ ad: e.target.value })} aria-label="Adın" />
                <div className="row" style={{ margin: '14px 0 7px', alignItems: 'baseline' }}>
                  <b style={{ fontSize: 17 }}>Seviye {sv.no}</b>
                  <span className="sm mut grow">{st.xp} XP, {seri(st.gun)} günlük seri</span>
                  <span className="sm mut">{sv.ic} / {sv.gerek}</span>
                </div>
                <Meter v={sv.ic} max={sv.gerek} />
                {sonraki && <p className="note" style={{ marginTop: 8 }}>Seviye {sonraki.lv} olunca {sonraki.ad.toLocaleLowerCase('tr')} açılır.</p>}
              </div>
            </div>
            <div className="ayar-l">Renk</div>
            <div className="renkler">
              {AV_RENK.map((c, i) => <button key={c} className={st.avatar.renk === i ? 'on' : ''} style={{ ['--c' as string]: c }} aria-label={`Renk ${i + 1}`} aria-pressed={st.avatar.renk === i} onClick={() => av({ renk: i })} />)}
            </div>
            <div className="ayar-l">Gözler</div>
            <div className="secenekler">
              {AV_GOZ.map((ad, i) => <button key={ad} className={st.avatar.goz === i ? 'on' : ''} title={ad} aria-pressed={st.avatar.goz === i} onClick={() => av({ goz: i })}><Avatar a={{ ...st.avatar, goz: i, aks: 0 }} size={46} /></button>)}
            </div>
            <div className="ayar-l">Aksesuar</div>
            <div className="secenekler">
              {AV_AKS.map((a, i) => {
                const kilit = sv.no < a.lv;
                return (
                  <button key={a.ad} className={`${st.avatar.aks === i ? 'on' : ''} ${kilit ? 'kilit' : ''}`} title={kilit ? `${a.ad}: seviye ${a.lv} olunca açılır` : a.ad} aria-pressed={st.avatar.aks === i} disabled={kilit} onClick={() => av({ aks: i })}>
                    <Avatar a={{ ...st.avatar, aks: i }} size={46} />
                    {kilit && <span className="kl"><Lock size={10} />{a.lv}</span>}
                  </button>
                );
              })}
            </div>
          </Card>

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
        </div>

        <div className="stack">
          <Card title="Bu haftanın sıralaması" hint="Puan çalışmayı ölçer: anlatım okumak, soru çözmek ve tekrar yapmak kazandırır." flush>
            <div style={{ paddingBottom: 10 }}>
              {sira.map((r, i) => (
                <div key={r.ad + i} className={`lig-row ${r.ben ? 'ben' : ''}`}>
                  <span className="sira">{i + 1}</span>
                  <Avatar a={r.av} size={32} />
                  <span className="clip">{r.ben ? `${r.ad} (sen)` : r.ad}</span>
                  <Meter v={r.xp} max={max} />
                  <b>{r.xp} XP</b>
                </div>
              ))}
            </div>
            <p className="note" style={{ padding: '0 22px 16px' }}>Sınıf arkadaşları tanıtım için üretilmiş örnek veridir.</p>
          </Card>

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

          <Card title="Ayarlar">
            <div className="ayar"><div className="grow"><b>Günlük hedef</b><small>Bir günde kazanmak istediğin puan.</small></div><Seg id="hedef" value={st.hedef} onChange={(v) => set({ hedef: v })} options={[{ id: 30, label: '30' }, { id: 50, label: '50' }, { id: 100, label: '100' }]} /></div>
            <div className="ayar"><div className="grow"><b>Örnek veri</b><small>Üç haftalık örnek bir çalışma geçmişi yükler. Tanıtım için.</small></div><button className="btn" onClick={() => set(demo(st.theme))}><Database size={15} />Yükle</button></div>
            <div className="ayar"><div className="grow"><b>Her şeyi sıfırla</b><small>Bu tarayıcıdaki bütün çalışma kaydın silinir.</small></div>
              {emin ? <><button className="btn" onClick={() => setEmin(false)}>Vazgeç</button><button className="btn pri" style={{ background: 'var(--bad)' }} onClick={() => { sifirla(); setEmin(false); }}>Evet, sil</button></> : <button className="btn" onClick={() => setEmin(true)}><Trash2 size={15} />Sıfırla</button>}
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
