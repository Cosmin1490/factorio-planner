#!/usr/bin/env node
// Lists the distinct materials needed to CONSTRUCT the buildings used by a design doc.
// These are separate from flow imports and frequently absent from the solve entirely.
// Usage: node scripts/build-materials.mjs data/designs/<file>.md
import fs from 'fs';
import path from 'path';

const data = JSON.parse(fs.readFileSync(
  path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'data/helmod-web-prototypes.json'), 'utf8'));
const arr = x => Array.isArray(x) ? x : (x && typeof x === 'object' ? Object.values(x) : []);

const file = process.argv[2];
if (!file) { console.error('usage: build-materials.mjs <design.md>'); process.exit(1); }
const txt = fs.readFileSync(file, 'utf8');

// Only look in contexts where a building is actually being *used*: table cells and
// backticked names. Prevents prose mentions pulling in unrelated entities.
const cells = [];
for (const line of txt.split('\n')) {
  if (line.includes('│') || line.trimStart().startsWith('|')) {
    line.split(/[│|]/).forEach(c => cells.push(c.trim()));
  }
}
for (const m of txt.matchAll(/`([a-z0-9-]+)`/g)) cells.push(m[1]);

const used = new Set();
for (const c of cells) {
  const name = c.replace(/\*\*/g, '').trim();
  if (data.entities[name] && data.recipes[name]) used.add(name);
}

const mats = new Map();            // material -> set of buildings needing it
for (const b of used) {
  for (const ing of arr(data.recipes[b].ingredients)) {
    if (!mats.has(ing.name)) mats.set(ing.name, new Set());
    mats.get(ing.name).add(b);
  }
}
// a material that is itself one of the design's buildings isn't a *separate* requirement
for (const b of used) mats.delete(b);

const rows = [...mats.entries()].sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0]));
console.log(`buildings used: ${used.size}\n`);
console.log('| Material | Needed by |');
console.log('|---|---|');
for (const [m, who] of rows) {
  const list = [...who].sort();
  console.log(`| \`${m}\` | ${list.slice(0, 3).join(', ')}${list.length > 3 ? ` +${list.length - 3}` : ''} |`);
}
