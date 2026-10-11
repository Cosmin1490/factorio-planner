#!/usr/bin/env node
// Lists materials needed to CONSTRUCT a design's buildings that you probably DON'T have yet.
//
// Baseline inference: reaching the current tech level means you made the science to research it and
// built the buildings to make that science. So everything those buildings cost is already available.
// Only the remainder is worth reporting.
//
// Usage: node scripts/build-materials.mjs data/designs/<target>.md
import fs from 'fs';
import path from 'path';

// Designs that are BUILT in-game. Edit as the base grows.
const BUILT = ['01-py-science-pack-1.md', '03-coal-processing.md', '06-automation-science-pack.md'];

const root = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/helmod-web-prototypes.json'), 'utf8'));
const arr = x => Array.isArray(x) ? x : (x && typeof x === 'object' ? Object.values(x) : []);

// buildings a design doc actually uses — only table cells and backticks, never loose prose
function buildingsIn(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const cells = [];
  for (const line of txt.split('\n'))
    if (line.includes('│') || line.trimStart().startsWith('|'))
      line.split(/[│|]/).forEach(c => cells.push(c.replace(/\*\*/g, '').trim()));
  for (const m of txt.matchAll(/`([a-z0-9-]+)`/g)) cells.push(m[1]);
  return new Set(cells.filter(n => data.entities[n] && data.recipes[n]));
}
const costOf = b => arr(data.recipes[b].ingredients).map(i => i.name);

// product -> recipes that make it (recipe names often differ from item names: duralumin-1, lead-plate-2)
const producers = new Map();
for (const [rn, r] of Object.entries(data.recipes))
  for (const p of arr(r.products)) {
    if (!producers.has(p.name)) producers.set(p.name, []);
    producers.get(p.name).push(rn);
  }

// recipes a design doc runs — first column of its tables
function recipesIn(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const out = new Set();
  for (const line of txt.split('\n')) {
    if (!line.includes('│') && !line.trimStart().startsWith('|')) continue;
    for (const c of line.split(/[│|]/)) {
      const n = c.replace(/\*\*/g, '').trim();
      if (data.recipes[n]) out.add(n);
    }
  }
  return out;
}

// everything the built base demonstrably has: its buildings, and what they cost to place
const have = new Set();
for (const f of BUILT) {
  const fp = path.join(root, 'data/designs', f);
  for (const b of buildingsIn(fp)) { have.add(b); costOf(b).forEach(m => have.add(m)); }
  // and everything those designs actually produce
  for (const rn of recipesIn(fp)) arr(data.recipes[rn].products).forEach(p => have.add(p.name));
}

const file = process.argv[2];
const used = buildingsIn(file);
const need = new Map();
for (const b of used) for (const m of costOf(b)) {
  if (have.has(m) || used.has(m)) continue;          // already available, or built by this design
  if (!need.has(m)) need.set(m, new Set());
  need.get(m).add(b);
}

// one step away = everything its own recipe needs is already available
const depth = m => {
  const rs = producers.get(m) || [];
  if (!rs.length) return 'no recipe — must import/mine';
  return rs.some(rn => arr(data.recipes[rn].ingredients).every(i => have.has(i.name)))
    ? 'makeable now' : 'needs its own chain';
};

console.log(`buildings used: ${used.size} · baseline: ${BUILT.join(', ')}\n`);
if (!need.size) { console.log('_Nothing — every construction material is already available._'); process.exit(0); }
console.log('| Possibly missing | Status | Needed by |');
console.log('|---|---|---|');
for (const [m, who] of [...need].sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0]))) {
  const l = [...who].sort();
  console.log(`| \`${m}\` | ${depth(m)} | ${l.slice(0, 3).join(', ')}${l.length > 3 ? ` +${l.length - 3}` : ''} |`);
}
