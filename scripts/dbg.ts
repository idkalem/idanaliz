import { topicDeficit, topicStats, ALL } from '../src/engine/analysis.ts';
import { TOPICS } from '../src/data/curriculum.ts';
const d = topicDeficit('c:1', ALL), st = topicStats('c:1', ALL), o = topicDeficit('o', ALL), so = topicStats('o', ALL);
for (const t of TOPICS.filter((t) => t.id.startsWith('mat.'))) console.log(t.id.padEnd(18), 'pre', t.pre, '11-B', st[t.i].pct?.toFixed(0), 'def', d[t.i]?.toFixed(1), '| okul', so[t.i].pct?.toFixed(0), 'def', o[t.i]?.toFixed(1), 'n', so[t.i].n);
