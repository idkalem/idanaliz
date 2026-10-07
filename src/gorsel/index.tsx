// Kartın görseli: içerikteki `gorsel` alanına göre doğru şekli ya da etkinliği çizer.
import type { Gorsel } from '../content';
import { UsKatla, UsBirlestir, Virgul, Kare, KokCikar, KareAra } from './mat';
import { Noron, Aksiyon, Iletim, Esik, Sinaps, Isik, Tepe, HareketAdi } from './biy';
import { Eslestir, Grupla, Sirala } from './etkinlik';

/** Etkinlikler (eşleştir, ayır, sırala) okuduktan sonra yapılır; öteki görseller anlatımın parçasıdır. */
export const etkinlikMi = (g: Gorsel) => g.tip === 'eslestir' || g.tip === 'grupla' || g.tip === 'sirala';

export function GorselKutu({ g }: { g: Gorsel }) {
  switch (g.tip) {
    case 'us-katla': return <UsKatla />;
    case 'us-birlestir': return <UsBirlestir />;
    case 'virgul': return <Virgul sayilar={g.sayilar} />;
    case 'kare': return <Kare alan={g.alan} />;
    case 'kok-cikar': return <KokCikar sayilar={g.sayilar} />;
    case 'kare-ara': return <KareAra n={g.n} />;
    case 'noron': return <Noron />;
    case 'aksiyon': return <Aksiyon />;
    case 'iletim': return <Iletim />;
    case 'esik': return <Esik />;
    case 'sinaps': return <Sinaps />;
    case 'isik': return <Isik deney={g.deney} />;
    case 'tepe': return <Tepe />;
    case 'hareket-adi': return <HareketAdi />;
    case 'eslestir': return <Eslestir ad={g.ad} cift={g.cift} />;
    case 'grupla': return <Grupla ad={g.ad} kutu={g.kutu} oge={g.oge} />;
    case 'sirala': return <Sirala ad={g.ad} oge={g.oge} />;
  }
}
