// Kaynaklar: İD Okul'daki anlatım ve soruların hangi resmî kaynağa göre yazıldığı.
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Landmark, BookOpen, Table2, ListChecks, Megaphone, ExternalLink, ChevronRight, ArrowRight, TriangleAlert, Clock } from 'lucide-react';
import { HAZIR, MUFREDAT, MDERSLER, SINIFLAR } from '../content';
import { Page, Card } from '../ui';

interface Kaynak { ad: string; kim: string; ne: string; ikon: ReactNode; k: string; baglar: { ad: string; url: string }[] }
const KAYNAKLAR: Kaynak[] = [
  {
    ad: 'Öğretim programı', kim: 'Türkiye Yüzyılı Maarif Modeli, Matematik Dersi Öğretim Programı', ikon: <Landmark size={19} />, k: 'k-mat',
    ne: 'Hangi öğrenme çıktısının işleneceği, o çıktının süreç bileşenleri ve kapsam notları buradan alındı. Örneğin MAT.9.1.1 için bilimsel gösterim, eşlenik, yaklaşık değer ve hata payı programda yazdığı için anlatıma girdi.',
    baglar: [
      { ad: 'Matematik programı (PDF)', url: 'https://tymm.meb.gov.tr/assets/pdf/matematik-dersi_20260819_143102_154.pdf' },
      { ad: 'Fizik programı (PDF)', url: 'https://tymm.meb.gov.tr/assets/pdf/fizik-dersi_20260819_142915_270.pdf' },
      { ad: 'Bütün programlar', url: 'https://tymm.meb.gov.tr/ogretim-programlari' },
    ],
  },
  {
    ad: 'Ders kitabı', kim: 'MEB 9. Sınıf Matematik Ders Kitabı (1. Kitap), 1. Tema: Sayılar', ikon: <BookOpen size={19} />, k: 'k-tr',
    ne: 'Anlatımın sırası, her kartı açan gerçek yaşam durumu, kuraldan önce gelen keşif tabloları, çözümlü örnekler ve problemler kitaptaki sırayı izler. Tema sonundaki ölçme sorularının biçimi de buradan alındı: tablolu bağlam, "ilk hata hangi adımda", çok adımlı açık uçlu soru.',
    baglar: [{ ad: 'Ders kitabı sayfası', url: 'https://tymm.meb.gov.tr/kitap/41/matematik-9sinif-ders-kitabi-1kitap' }],
  },
  {
    ad: 'Konu soru dağılım tabloları', kim: 'MEB Ölçme, Değerlendirme ve Sınav Hizmetleri Genel Müdürlüğü, 2026-2027 1. dönem', ikon: <Table2 size={19} />, k: 'k-fen',
    ne: 'Her öğrenme çıktısından birinci ve ikinci ortak yazılıda kaç soru geleceği bu tablolarda yazar. Tablolar değiştirilmeden uygulamaya aktarıldı; Dersler ekranında sınıf ve ders seçince açılır.',
    baglar: [
      { ad: 'Tabloların yayımlandığı sayfa', url: 'https://odsgm.meb.gov.tr/www/1donem-konu-soru-dagilim-tablolari-2026-2027/icerik/1724' },
      { ad: 'Matematik tablosu (Excel)', url: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2026/09/KSDT/matematik2.xlsx' },
    ],
  },
  {
    ad: 'Soru yazım kılavuzu', kim: 'MEB Çoktan Seçmeli Soru Yazım Kılavuzu', ikon: <ListChecks size={19} />, k: 'k-sos',
    ne: 'Soruların biçimi bu kılavuza göre kuruldu: bağlamın işlevi, çeldiricilerin nereden seçileceği, seçenek sayısı ve kaçınılacak kalıplar. Aşağıdaki tablo ilkeleri ve uygulamadaki karşılığını gösterir.',
    baglar: [{ ad: 'Kılavuz (PDF)', url: 'https://tymm.meb.gov.tr/upload/kilavuz/coktan-secmeli-soru-yazim-kilavuzu.pdf' }],
  },
  {
    ad: 'MEB duyuruları', kim: 'Millî Eğitim Bakanlığı haberleri', ikon: <Megaphone size={19} />, k: 'k-brand',
    ne: 'MEB, 2028\'den itibaren LGS ve YKS sorularının yeni öğretim programına uyumlu, beceri ve bağlam temelli olacağını duyurdu. Aynı duyuruda bunun sınav sistemi ya da sınav modeli değişikliği olmadığı belirtildi. Soru yazım kılavuzu da bu geçişin temel başvuru kaynağı olarak tanıtıldı.',
    baglar: [
      { ad: 'Yeni soru modeli duyurusu', url: 'https://www.meb.gov.tr/yks-ve-lgsde-yeni-mufredata-uyumlu-soru-modeli-2028de-hayata-gececek/haber/39265/tr' },
      { ad: 'Soru yazım kılavuzu duyurusu', url: 'https://www.meb.gov.tr/olcme-ve-degerlendirme-sisteminde-koklu-degisiklikler-iceren-soru-yazim-kilavuzu-hazirlandi/haber/40284/tr' },
    ],
  },
];

/** Kılavuzdaki ilkelerin özeti ve uygulamadaki karşılığı. */
const ilkeler = (bagli: number, yanlis: number): [string, string][] => [
  ['Bağlam süs olamaz; soru, bağlamdaki bilgi kullanılmadan çözülememelidir.', 'Bağlam temelli sorularda sayılar bağlamdan ya da tablodan gelir; soru kökü tek başına çözülemez.'],
  ['Çeldiriciler öğrencilerin sık yaptığı hatalardan ve kavram yanılgılarından seçilir.', `Bu yöntemle yazılan konulardaki ${yanlis} yanlış seçeneğin ${bagli} tanesi adı konmuş bir yanılgıya bağlıdır. Öğrenci böyle bir seçeneği işaretlerse hangi düşünce hatasına düştüğü anlatılır; öğretmen ekranı sınıfın en sık düştüğü yanılgıları sayar.`],
  ['Ortaöğretimde çoktan seçmeli soru beş seçeneklidir.', 'Bütün test soruları beş seçeneklidir. Derleme sırasındaki içerik denetimi başka sayıya izin vermez.'],
  ['"Hepsi" ve "Hiçbiri" gibi seçenekler kullanılmaz.', 'Hiçbir soruda kullanılmadı.'],
  ['Doğru cevap biçimiyle ele verilmez; seçenekler birbirine yakın uzunlukta olur.', 'İçerik denetimi doğru cevapların tek harfte toplanmasını ve yinelenen seçenekleri yakalar.'],
  ['Soru gereksiz okuma ve işlem yükü taşımaz.', 'Bağlamlar birkaç cümledir; her soru tek bir öğrenme çıktısını ölçer.'],
];

export default function Kaynaklar() {
  const dayali = HAZIR.filter((k) => k.day), eski = HAZIR.filter((k) => !k.day);
  const celdirici = dayali.flatMap((k) => k.sorular.flatMap((q) => q.y.filter((_, i) => i !== q.d)));
  const ILKELER = ilkeler(celdirici.filter((y) => y != null).length, celdirici.length);
  return (
    <Page title="Kaynaklar" sub="İD Okul'daki konu anlatımları ve sorular kafadan yazılmaz. Bu sayfa hangi resmî kaynağın nerede kullanıldığını gösterir.">
      <div className="kay-akis">
        {[
          ['1', 'Öğretim programı', 'Ne öğretilecek?'],
          ['2', 'Ders kitabı', 'Hangi sırayla, hangi örnekle?'],
          ['3', 'Soru dağılım tablosu', 'Yazılıda kaç soru?'],
          ['4', 'Soru yazım kılavuzu', 'Soru nasıl sorulur?'],
          ['5', 'İD Okul konusu', '30 dakika: anlatım ve test'],
        ].map(([no, ad, ne], i, a) => (
          <div key={no} className={`ka ${i === a.length - 1 ? 'son' : ''}`}>
            <span className="no">{no}</span>
            <div><b>{ad}</b><small>{ne}</small></div>
            {i < a.length - 1 && <ArrowRight size={18} className="ok" />}
          </div>
        ))}
      </div>

      <div className="grid g-main">
        <div className="stack">
          {KAYNAKLAR.map((x) => (
            <Card key={x.ad} title={x.ad} hint={x.kim} icon={x.ikon} k={x.k}>
              <p className="kay-ne">{x.ne}</p>
              <div className="row wrap" style={{ marginTop: 12 }}>
                {x.baglar.map((b) => <a key={b.url} className="btn" href={b.url} target="_blank" rel="noreferrer"><ExternalLink size={15} />{b.ad}</a>)}
              </div>
            </Card>
          ))}
          <Card title="Kılavuzdaki ilkeler ve uygulamadaki karşılığı" hint="Sol sütun kılavuzun özetidir, birebir alıntı değildir" flush>
            <div className="ilke-l">
              <div className="ilke bas"><span>MEB kılavuzu ne diyor?</span><span>İD Okul'da nasıl uygulandı?</span></div>
              {ILKELER.map(([a, b]) => <div key={a} className="ilke"><span>{a}</span><span>{b}</span></div>)}
            </div>
          </Card>
        </div>

        <div className="stack">
          <Card title="Bir konu nasıl kurulur?" icon={<Clock size={18} />} k="k-brand">
            <ul className="kur-l">
              <li><b>Anlatım, yaklaşık 17 dakika.</b> Sekiz kart. Her kart ders kitabındaki bir durumla başlar, örüntüyü tabloda gösterir, kuralı verir, bir örnek çözer ve bir kontrol sorusu sorar.</li>
              <li><b>Kavrama testi, yaklaşık 13 dakika.</b> On soru: işlem, bağlam temelli ve muhakeme. Yanlışta hangi yanılgıya düşüldüğü anlatılır.</li>
              <li><b>Yazılı provası, isteyene.</b> Üç açık uçlu soru ve adım adım puanlama anahtarı.</li>
            </ul>
          </Card>
          <Card title="Bu yöntemle yazılan konular">
            <div className="stack" style={{ gap: 8 }}>
              {dayali.map((k) => (
                <Link key={k.id} to={`/konu/${k.id}`} className="muf-link">
                  <span className="ml-ic"><BookOpen size={16} /></span>
                  <span className="grow"><b>{k.ad}</b><small>{k.day!.kod}, {k.dk + (k.tdk ?? 0)} dakika</small></span>
                  <ChevronRight size={17} className="dim" />
                </Link>
              ))}
            </div>
            <p className="sm mut" style={{ marginTop: 12 }}>Tablolardan {SINIFLAR.length} sınıf, {MDERSLER.length} ders ve {MUFREDAT.length} öğrenme çıktısı aktarıldı. Öteki çıktıların konuları aynı yöntemle yazılacak.</p>
            <Link className="btn" to="/dersler" style={{ marginTop: 12 }}>Tabloları aç</Link>
          </Card>
          <Card title="Açıkça söyleyelim" icon={<TriangleAlert size={18} />} k="k-mid">
            <ul className="kur-l">
              <li>Anlatımlar ve sorular, bu kaynaklardaki sıra, durum ve soru tiplerine göre yapay zekâ desteğiyle yazıldı. Ders kitabının birebir kopyası değildir; uyarlanan her sorunun altında neye göre yazıldığı yazar.</li>
              <li><b>Henüz bir öğretmen incelemedi.</b> Sınıfta kullanılmadan önce dersin öğretmeninin anlatımı ve soruları gözden geçirmesi gerekir.</li>
              {eski.length > 0 && <li>{eski.map((k) => k.ad).join(', ')} konuları önceki sürümden kalan TYT tekrarı konularıdır; resmî dayanakları henüz işlenmedi.</li>}
            </ul>
          </Card>
        </div>
      </div>
    </Page>
  );
}
