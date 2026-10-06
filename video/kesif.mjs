// Keşif turu: sahnelerde kullanılacak ekranların ilk görüntüleri ve başlık dökümü.
export default [
  { id: 'home', url: '/', dump: true },
  { id: 'movers', url: '/hareketler', dump: true },
  { id: 'incele', url: '/incele?kim=c:1&n=s:5&b=konu&m=y', dump: true },
  { id: 'cmp2', url: '/karsilastir?k=c:0,c:1&g=karsi', dump: true },
  { id: 'cmp2s', url: '/karsilastir?k=c:0,c:1&g=sutun' },
  { id: 'cmp3', url: '/karsilastir?k=c:0,c:1,c:2&g=sutun' },
  { id: 'cmp3f', url: '/karsilastir?k=c:0,c:1,c:2&n=s:7&b=konu&g=sutun', dump: true },
  { id: 'cmp3k', url: '/karsilastir?k=c:0,c:1,c:2&n=k:76&z=cizgi', dump: true },
  { id: 'classes', url: '/siniflar', steps: [{ click: { sel: 'th', text: 'Değişim' } }, { snap: '' }], dump: true },
  { id: 'c12', url: '/sinif/12-C', dump: true },
  { id: 'c12t', url: '/sinif/12-C?sekme=tekrar', dump: true },
  { id: 'topics', url: '/konular', dump: true },
  { id: 'topicsag', url: '/konular?gorunum=ag', dump: true },
  { id: 'students', url: '/ogrenciler', steps: [{ click: { sel: 'th', text: 'Değişim' } }, { snap: 'a' }, { click: { sel: 'th', text: 'Değişim' } }, { snap: 'b' }], dump: true },
  { id: 'esra', url: '/ogrenci/s259', dump: true },
  { id: 'tahmin', url: '/tahmin', dump: true },
];
