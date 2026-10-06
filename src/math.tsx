// Küçük matematik yazımı: içerik metinlerindeki üs, alt simge, kök ve kesirleri ekrana dizer.
//   2^3, 2^{n+1}   üs          d_K, V_{son}   alt simge
//   √12, √(a^2·b)  kök         {a//b}         kesir          **kalın**
import type { ReactNode } from 'react';

function run(s: string, st: { i: number; k: number }, stops: string[]): [ReactNode[], string] {
  const out: ReactNode[] = [];
  let buf = '';
  const flush = () => { if (buf) { out.push(buf); buf = ''; } };
  /** Üs ya da simgenin kapsamı: süslü parantezli grup, yoksa tek sayı ya da tek harf. */
  const arg = (): ReactNode[] => {
    if (s[st.i] === '{') { st.i++; return run(s, st, ['}'])[0]; }
    const m = /^[−-]?(\d+(,\d+)?|\p{L})/u.exec(s.slice(st.i));
    if (!m) return [];
    st.i += m[0].length;
    return [m[0]];
  };
  while (st.i < s.length) {
    const hit = stops.find((x) => s.startsWith(x, st.i));
    if (hit) { st.i += hit.length; flush(); return [out, hit]; }
    const c = s[st.i];
    if (c === '^' || c === '_') {
      st.i++; flush();
      const a = arg();
      out.push(c === '^' ? <sup key={st.k++}>{a}</sup> : <sub key={st.k++}>{a}</sub>);
    } else if (c === '√') {
      st.i++; flush();
      const a = s[st.i] === '(' ? (st.i++, run(s, st, [')'])[0]) : arg();
      out.push(<span className="m-rt" key={st.k++}>√<span className="m-ri">{a}</span></span>);
    } else if (c === '(') {
      st.i++; flush();
      const [a, h] = run(s, st, [')']);
      out.push('(', ...a, h);
    } else if (c === '{') {
      st.i++; flush();
      const [a, h] = run(s, st, ['//', '}']);
      if (h === '//') {
        const [b] = run(s, st, ['}']);
        out.push(<span className="m-fr" key={st.k++}><span>{a}</span><span>{b}</span></span>);
      } else out.push('{', ...a, '}');
    } else if (s.startsWith('**', st.i)) {
      st.i += 2; flush();
      out.push(<b key={st.k++}>{run(s, st, ['**'])[0]}</b>);
    } else { buf += c; st.i++; }
  }
  flush();
  return [out, ''];
}

/** İçerik metnini dizer. */
export function M({ children }: { children: string }) {
  return <>{run(children, { i: 0, k: 0 }, [])[0]}</>;
}

/** Aynı metnin düz yazı hâli: sesli okuma ve tek satırlık kısaltmalar için. */
export function duz(s: string): string {
  return s
    .replace(/\*\*/g, '')
    .replace(/\{([^{}]*)\/\/([^{}]*)\}/g, '$1 bölü $2')
    .replace(/\{([^{}]*)\/\/([^{}]*)\}/g, '$1 bölü $2')
    .replace(/\^\{([^{}]*)\}/g, ' üssü $1').replace(/\^([−-]?[\d\p{L}]+)/gu, ' üssü $1')
    .replace(/_\{([^{}]*)\}/g, ' $1').replace(/_/g, ' ')
    .replace(/√/g, ' karekök ').replace(/·/g, ' çarpı ').replace(/÷/g, ' bölü ').replace(/−/g, ' eksi ')
    .replace(/[{}]/g, ' ').replace(/\s+/g, ' ').trim();
}
