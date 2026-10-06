import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { APP, ds, NE, PRES, SUBJECTS, TOPICS, LETTERS, BLANK, LAST, at, val, entHref } from '../engine/core';
import { ALL } from '../engine/analysis';
import { date } from '../engine/fmt';
import { useStore, assignTeacher } from '../store';
import { Page, Card, DataTable, Sel, downloadCsv, type Col } from '../ui';

const EXPORTS: { name: string; hint: string; run: () => void }[] = [
  {
    name: 'Öğrenci netleri', hint: 'Her öğrenci bir satır; her deneme bir sütun (toplam net)',
    run: () => downloadCsv('ogrenci-netleri', ['Öğrenci', 'Sınıf', 'Okul no', ...ds.exams.map((x) => x.name)], ds.students.map((s) => [s.name, ds.classes[s.cls].name, s.no, ...ds.exams.map((x) => at(`s:${s.i}`, x.i, 'all', 'net'))])),
  },
  {
    name: 'Sınıf ve ders ortalamaları', hint: 'Her sınıf bir satır; her ders bir sütun (tüm yılın net ortalaması)',
    run: () => downloadCsv('sinif-ders-ortalamalari', ['Sınıf', ...SUBJECTS.map((s) => s.name)], ds.classes.map((c) => [c.name, ...SUBJECTS.map((s) => val(`c:${c.i}`, ALL, `s:${s.i}`, 'net'))])),
  },
  {
    name: 'Konu doğru oranları', hint: 'Her konu bir satır; okul ve her sınıf bir sütun (yüzde)',
    run: () => downloadCsv('konu-dogru-oranlari', ['Ders', 'Konu', 'Okul', ...ds.classes.map((c) => c.name)], TOPICS.map((t) => [SUBJECTS[t.subject].name, t.name, val('o', ALL, `k:${t.i}`, 'pct'), ...ds.classes.map((c) => val(`c:${c.i}`, ALL, `k:${t.i}`, 'pct'))])),
  },
  {
    name: 'Öğretmen atamaları', hint: 'Sınıf, ders ve öğretmen',
    run: () => downloadCsv('ogretmen-atamalari', ['Sınıf', 'Ders', 'Öğretmen'], ds.classes.flatMap((c) => SUBJECTS.map((s) => [c.name, s.name, ds.teachers[c.teachers[s.i]].name]))),
  },
  {
    name: 'Son denemenin cevapları', hint: 'Her öğrenci bir satır; 120 sorunun işaretlenen şıkkı',
    run: () => downloadCsv(`${ds.exams[LAST].id}-cevaplar`, ['Öğrenci', 'Sınıf', ...ds.exams[LAST].q.map((q) => `S${q.i + 1}`)],
      [['Cevap anahtarı', '', ...ds.exams[LAST].q.map((q) => LETTERS[q.key])], ...ds.students.filter((s) => PRES[LAST][s.i]).map((s) => [s.name, ds.classes[s.cls].name, ...Array.from(ds.ans[LAST][s.i]!, (o) => (o === BLANK ? '' : LETTERS[o]))])]),
  },
];

export default function Data() {
  const st = useStore(), nav = useNavigate();
  const [c, setC] = useState(0);
  const [ask, setAsk] = useState(false);
  const cls = ds.classes[c];
  interface Row { e: number; n: number }
  const rows: Row[] = ds.exams.map((x) => ({ e: x.i, n: ds.students.filter((s) => PRES[x.i][s.i]).length }));
  const cols: Col<Row>[] = [
    { id: 'ad', head: 'Deneme', cell: (r) => <span className="ent">{ds.exams[r.e].name}</span>, val: (r) => ds.exams[r.e].name },
    { id: 'tarih', head: 'Tarih', cell: (r) => date(ds.exams[r.e].date, true), val: (r) => ds.exams[r.e].date },
    { id: 'yayin', head: 'Yayınevi', cell: (r) => <span className="mut">{ds.exams[r.e].publisher}</span>, val: (r) => ds.exams[r.e].publisher },
    { id: 'q', head: 'Soru', right: true, cell: (r) => ds.exams[r.e].q.length, val: (r) => ds.exams[r.e].q.length },
    { id: 'n', head: 'Katılan öğrenci', right: true, cell: (r) => <>{r.n} <span className="dim">/ {ds.students.length}</span></>, val: (r) => r.n },
    { id: 'c', head: 'İşlenen cevap', right: true, cell: (r) => (r.n * ds.exams[r.e].q.length).toLocaleString('tr-TR'), val: (r) => r.n * ds.exams[r.e].q.length },
  ];
  const changed = Object.keys(st.assign).length;
  return (
    <Page title="Veri" sub="Yüklü denemeler, öğretmen atamaları ve dışa aktarım.">
      <div className="stack">
        <Card flush title="Yüklü denemeler" hint={`${NE} deneme, ${ds.students.length} öğrenci, ${ds.classes.length} sınıf`}>
          <DataTable cols={cols} rows={rows} rowKey={(r) => r.e} onRow={(r) => nav(`/deneme/${ds.exams[r.e].id}`)} sort={{ id: 'tarih', desc: true }} />
        </Card>

        <Card title="Öğretmen atamaları" hint="Hangi sınıfın hangi dersine kimin girdiğini seçin. Değişiklik anında işlenir; öğretmen ekranları buna göre yeniden hesaplanır."
          action={<Sel label="Sınıf" value={c} onChange={setC} options={ds.classes.map((x) => ({ id: x.i, label: x.name }))} />}>
          <div className="grid g2" style={{ gap: '4px 40px' }}>
            {SUBJECTS.map((s) => {
              const opts = ds.teachers.filter((t) => t.subjects.includes(s.i));
              return (
                <div key={s.i} className="row" style={{ padding: '5px 0' }}>
                  <span className="grow"><b style={{ fontWeight: 600 }}>{s.name}</b> <span className="dim sm">{s.branch}</span></span>
                  <Sel label={`${cls.name} ${s.name} öğretmeni`} value={cls.teachers[s.i]} onChange={(t) => assignTeacher(c, s.i, t)} options={opts.map((t) => ({ id: t.i, label: t.name }))} />
                  <Link className="lnk sm" to={entHref(`t:${cls.teachers[s.i]}`)}>Profil</Link>
                </div>
              );
            })}
          </div>
          <p className="note" style={{ marginTop: 14 }}>{changed ? `${changed} atama okul tarafından değiştirildi; bu tarayıcıda saklanıyor.` : 'Atamalar yüklenen hâliyle duruyor.'}</p>
        </Card>

        <Card flush title="Dışa aktar" hint="Dosyalar Excel ile açılır (noktalı virgülle ayrılmış, Türkçe karakterler korunur). Ekranlardaki her tablonun altında da kendi CSV düğmesi vardır.">
          <div className="list">
            {EXPORTS.map((x) => (
              <div key={x.name}>
                <span className="grow"><b style={{ fontWeight: 600 }}>{x.name}</b><span className="sm mut" style={{ display: 'block' }}>{x.hint}</span></span>
                <button className="btn" onClick={x.run}><Download size={14} />CSV indir</button>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Bu veri hakkında">
          <div className="col" style={{ gap: 9, maxWidth: '78ch' }}>
            <p>Gösterilen okul, öğrenciler, öğretmenler ve deneme sonuçları örnek olarak üretilmiştir; gerçek kişilere ait değildir.</p>
            <p className="mut">Ekranlardaki bütün sayılar bu örnek cevaplardan hesaplanır: netler, sıralar, “Neden?” açıklamaları, tahmin zarfı, “Şans mı, bilgi mi?” ve “Bugün sınav olsa” tahminleri hazır yazılmış değerler değildir.</p>
            <p className="mut">Üç şey bu sürümde örnek veriyle birlikte hazır gelir: soruların konu etiketleri, yanlış şıkların hangi hata türüne karşılık geldiği ve Türkiye ortalamaları. Gerçek kullanımda ilk ikisi deneme kitapçığından çıkarılır, üçüncüsü yayınevinin açıkladığı sonuçlardan girilir.</p>
            <p className="mut">Okulun kendi sonuçlarını yükleme adımı (optik okuyucu çıktısı ya da Excel) henüz {APP} içinde yok.</p>
          </div>
          <div className="row wrap" style={{ marginTop: 18 }}>
            {!ask
              ? <button className="btn" onClick={() => setAsk(true)}>Bu tarayıcıdaki kayıtları sıfırla</button>
              : <>
                <span className="sm">Notlar, takip listesi, kayıtlı görünümler ve atama değişiklikleri silinir.</span>
                <button className="btn pri" style={{ background: 'var(--bad)' }} onClick={() => { try { localStorage.removeItem('netlik.v1'); } catch { /* erişim yok */ } location.reload(); }}>Sıfırla</button>
                <button className="btn ghost" onClick={() => setAsk(false)}>Vazgeç</button>
              </>}
          </div>
        </Card>
      </div>
    </Page>
  );
}
