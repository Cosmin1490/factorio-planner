import { describe, it, expect, beforeAll } from 'vitest';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadPrototypes } from '../../src/data/PrototypeLoader.js';
import { analyzeBlueprint, decodeBlueprintFile } from '../../src/commands/inventory.js';
import type { PrototypeData } from '../../src/data/PrototypeLoader.js';
import type { BlockInventory } from '../../src/commands/inventory.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROTO_PATH = resolve(__dirname, '../../data/helmod-web-prototypes.json');
const FIXTURES = resolve(__dirname, '../fixtures');

let data: PrototypeData;

beforeAll(() => {
  data = loadPrototypes(PROTO_PATH);
});

function analyze(fixture: string, name: string): BlockInventory {
  const { entities, wires } = decodeBlueprintFile(resolve(FIXTURES, fixture));
  return analyzeBlueprint(data, entities, wires, name, 1);
}

describe('seaweed farm (bp1)', () => {
  let inv: BlockInventory;
  beforeAll(() => { inv = analyze('bp1.txt', 'seaweed farm'); });

  it('exports seaweed', () => {
    expect(inv.exports['seaweed']).toBeCloseTo(6.4, 1);
  });

  it('imports water', () => {
    expect(inv.imports['water']).toBeCloseTo(128, 0);
  });
});

describe('pcb1 factory (bp2)', () => {
  let inv: BlockInventory;
  beforeAll(() => { inv = analyze('bp2.txt', 'pcb1 factory'); });

  it('exports pcb1', () => {
    expect(inv.exports['pcb1']).toBeCloseTo(0.125, 2);
  });

  it('imports creosote, methanal, log, copper-plate', () => {
    expect(inv.imports['creosote']).toBeCloseTo(25, 0);
    expect(inv.imports['methanal']).toBeCloseTo(12.5, 0);
    expect(inv.imports['log']).toBeCloseTo(0.65, 1);
    expect(inv.imports['copper-plate']).toBeCloseTo(0.625, 1);
  });
});

describe('methanal factory (bp3)', () => {
  let inv: BlockInventory;
  beforeAll(() => { inv = analyze('bp3.txt', 'methanal factory'); });

  it('exports methanal', () => {
    expect(inv.exports['methanal']).toBeCloseTo(8.89, 1);
  });

  it('imports water and copper-plate', () => {
    expect(inv.imports['water']).toBeCloseTo(31.7, 0);
    expect(inv.imports['copper-plate']).toBeCloseTo(0.889, 1);
  });
});

describe('moss farm (bp4)', () => {
  let inv: BlockInventory;
  beforeAll(() => { inv = analyze('bp4.txt', 'moss farm'); });

  it('exports moss', () => {
    expect(inv.exports['moss']).toBeCloseTo(12, 0);
  });

  it('imports water and stone', () => {
    expect(inv.imports['water']).toBeCloseTo(480, 0);
    expect(inv.imports['stone']).toBeCloseTo(15, 0);
  });
});

describe('log block (bp5) — self-reinforcing cycle', () => {
  let inv: BlockInventory;
  beforeAll(() => { inv = analyze('bp5.txt', 'log block'); });

  it('exports log (cycle correctly sized)', () => {
    expect(inv.exports['log']).toBeCloseTo(1.47, 1);
  });

  it('imports ash, moss, water', () => {
    expect(inv.imports['ash']).toBeCloseTo(7.5, 0);
    expect(inv.imports['moss']).toBeCloseTo(1.25, 1);
    expect(inv.imports['water']).toBeCloseTo(150, 0);
  });

  it('does not import log (cycle is self-sustaining)', () => {
    expect(inv.imports['log']).toBeUndefined();
  });
});

describe('tar refinery (bp6)', () => {
  let inv: BlockInventory;
  beforeAll(() => { inv = analyze('bp6.txt', 'tar refinery'); });

  it('exports pitch, middle-oil, creosote, coke, gasoline', () => {
    expect(inv.exports['pitch']).toBeCloseTo(280, 0);
    expect(inv.exports['middle-oil']).toBeCloseTo(60, 0);
    expect(inv.exports['creosote']).toBeCloseTo(48, 0);
    expect(inv.exports['coke']).toBeCloseTo(15, 0);
    expect(inv.exports['gasoline']).toBeCloseTo(10.7, 0);
  });

  it('imports water and tar', () => {
    expect(inv.imports['water']).toBeCloseTo(300, 0);
    expect(inv.imports['tar']).toBeCloseTo(200, 0);
  });
});

describe('copper block (bp7)', () => {
  let inv: BlockInventory;
  beforeAll(() => { inv = analyze('bp7.txt', 'copper block'); });

  it('exports copper-plate', () => {
    expect(inv.exports['copper-plate']).toBeCloseTo(3.16, 1);
  });

  it('mines copper-ore', () => {
    expect(inv.mined['copper-ore']).toBeCloseTo(16, 0);
  });

  it('imports water only', () => {
    expect(inv.imports['water']).toBeCloseTo(30, 0);
    expect(inv.imports['copper-ore']).toBeUndefined();
  });
});

describe('aluminium block (bp8)', () => {
  let inv: BlockInventory;
  beforeAll(() => { inv = analyze('bp8.txt', 'aluminium block'); });

  it('exports tar and aluminium-plate', () => {
    expect(inv.exports['tar']).toBeCloseTo(70.2, 0);
    expect(inv.exports['aluminium-plate']).toBeCloseTo(1.0, 1);
  });

  it('mines ore-aluminium', () => {
    expect(inv.mined['ore-aluminium']).toBeCloseTo(10, 0);
  });

  it('imports raw-coal', () => {
    expect(inv.imports['raw-coal']).toBeCloseTo(15, 0);
  });

  it('iron-oxide is surplus, not export', () => {
    expect(inv.exports['iron-oxide']).toBeUndefined();
    expect(inv.surplus['iron-oxide']).toBeDefined();
  });
});

describe('coal refinery (bp9) — export-path protection', () => {
  let inv: BlockInventory;
  beforeAll(() => { inv = analyze('bp9.txt', 'coal refinery'); });

  it('exports creosote (stationed, chain not collapsed)', () => {
    expect(inv.exports['creosote']).toBeCloseTo(36.4, 0);
  });

  it('imports water and raw-coal', () => {
    expect(inv.imports['water']).toBeCloseTo(142, 0);
    expect(inv.imports['raw-coal']).toBeCloseTo(5, 0);
  });

  it('tar and pitch are surplus, not export', () => {
    expect(inv.exports['tar']).toBeUndefined();
    expect(inv.exports['pitch']).toBeUndefined();
    expect(inv.surplus['tar']).toBeDefined();
    expect(inv.surplus['pitch']).toBeDefined();
  });
});
