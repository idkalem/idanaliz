// Yapay zekâ öğretmen: istediğin soruyu sor, soru fotoğrafı gönder ya da konuyu sen anlat, eksiğini o bulsun.
import { useState } from 'react';
import { MessageCircleQuestion, Mic, Camera, ShieldCheck } from 'lucide-react';
import { konuBul } from '../content';
import { useStore } from '../store';
import { tekrarBak, HAZIR } from '../engine';
import { sistem, konuBaglami } from '../ai';
import { Sohbet } from '../sohbet';
import { Page, Card, Seg } from '../ui';

const SEN_ANLAT = `Bu konuşmada öğrenci konuyu sana anlatacak. Sen konuyu ilk kez duyan meraklı bir sınıf arkadaşı gibi davran:
anlattığını dinle, anlamadığın yeri ya da atladığı kuralı tek bir soruyla sor. Yanlış bir şey söylerse hemen düzeltme; önce bir örnekle çelişkiyi fark ettir.
Öğrenci "bitti" dediğinde ya da üç dört turdan sonra, bağlamdaki özete göre iki kısa liste yaz: "İyi anlattıkların" ve "Eksik kalanlar".`;

export default function Zeka() {
  const st = useStore();
  const [mod, setMod] = useState<'sor' | 'anlat'>('sor');
  const zayif = tekrarBak(st)[0]?.konu ?? konuBul(st.son) ?? HAZIR[0];
  const [konuId, setKonuId] = useState(zayif?.id ?? '');
  const konu = konuBul(konuId);
  const oneriler = mod === 'anlat'
    ? [`${konu?.ad ?? 'Bu konu'} şöyle: ...`, 'Önce sen bana bir soru sor, oradan anlatayım']
    : konu ? [`${konu.ad} konusunda en sık yapılan hatayı bir örnekle anlat`, `Bana ${konu.ad} konusundan orta zorlukta bir soru sor`, `${konu.ad} konusunu üç cümlede özetle`] : [];

  return (
    <Page title="Yapay zekâ öğretmen" sub="Takıldığın her şeyi sorabilirsin. Cevabı hemen söylemez; önce ipucu verir, seninle birlikte bulur." actions={<Seg id="zeka" value={mod} onChange={setMod} options={[{ id: 'sor', label: 'Soru sor' }, { id: 'anlat', label: 'Sen anlat' }]} />}>
      <div className="grid g-main">
        <Card flush className="sohbet-kart">
          <div className="sohbet-ust">
            <span className="sm mut">Konu</span>
            <select className="input grow" value={konuId} onChange={(e) => setKonuId(e.target.value)} aria-label="Konu">
              <option value="">Genel (konu seçme)</option>
              {HAZIR.map((k) => <option key={k.id} value={k.id}>{k.ad}</option>)}
            </select>
          </div>
          <Sohbet key={`${mod}:${konuId}`} sistem={sistem(konu ? konuBaglami(konu) : '', mod === 'anlat' ? SEN_ANLAT : '')} oneriler={oneriler} resim={mod === 'sor'} yer={mod === 'anlat' ? 'Konuyu kendi cümlelerinle anlat' : 'Sorunu yaz ya da fotoğrafını ekle'} />
        </Card>

        <div className="stack">
          <Card title="Neler yapabilir?">
            <ul className="ozet-l sm">
              <li><MessageCircleQuestion size={16} /><span><b>Soru sor.</b> Anlamadığın kuralı, çözemediğin soruyu yaz.</span></li>
              <li><Camera size={16} /><span><b>Fotoğraf gönder.</b> Kitaptaki sorunun fotoğrafını ekle, adım adım ilerleyin.</span></li>
              <li><Mic size={16} /><span><b>Sen anlat.</b> Konuyu ona anlat; atladığın yeri sorar, sonunda eksiklerini listeler.</span></li>
            </ul>
          </Card>
          <Card title="Bilmen gerekenler" icon={<ShieldCheck size={17} />}>
            <p className="sm mut" style={{ lineHeight: 1.55 }}>Yapay zekâ yanılabilir. Bir sonuç sana garip gelirse konunun anlatımıyla karşılaştır ya da öğretmenine sor. Yazdıkların yanıt üretmek için Anthropic'e gönderilir; adın ve sınıfın gönderilmez. Kişisel bilgi yazma.</p>
          </Card>
        </div>
      </div>
    </Page>
  );
}
