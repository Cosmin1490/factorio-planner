import { describe, it, expect, beforeAll } from 'vitest';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadPrototypes } from '../../src/data/PrototypeLoader.js';
import { solve } from '../../src/solver/MatrixSolver.js';
import type { PrototypeData } from '../../src/data/PrototypeLoader.js';
import type { SolveInput, RecipeSpec } from '../../src/solver/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROTO_PATH = resolve(__dirname, '../../data/helmod-web-prototypes.json');

let data: PrototypeData;

beforeAll(() => {
  data = loadPrototypes(PROTO_PATH);
});

describe('acetylene pipeline (14-recipe, simplex input mode)', () => {
  // Validated against Helmod: ~391.5 acetylene/s from 15 raw-coal/s
  const recipes: RecipeSpec[] = [
    { recipeName: 'distilled-raw-coal', factoryName: 'distilator' },
    { recipeName: 'coal-gas', factoryName: 'distilator' },
    { recipeName: 'syngas', factoryName: 'gasifier' },
    { recipeName: 'tar-refining', factoryName: 'tar-processing-unit' },
    { recipeName: 'pitch-refining', factoryName: 'distilator' },
    { recipeName: 'anthracene-gasoline-cracking', factoryName: 'distilator' },
    { recipeName: 'naphthalene-oil-creosote', factoryName: 'tar-processing-unit' },
    { recipeName: 'light-oil-aromatics', factoryName: 'distilator' },
    { recipeName: 'tar-refining-tops', factoryName: 'tar-processing-unit' },
    { recipeName: 'carbolic-oil-creosote', factoryName: 'tar-processing-unit' },
    { recipeName: 'lime', factoryName: 'hpf' },
    { recipeName: 'calcium-carbide', factoryName: 'hpf' },
    { recipeName: 'acetylene', factoryName: 'gasifier' },
    { recipeName: 'slacked-lime-void', factoryName: 'evaporator' },
  ];

  const input: SolveInput = {
    recipes,
    inputs: [{ name: 'raw-coal', amount: 15 }],
    time: 1,
    solver: 'simplex',
  };

  it('produces ~391.48 acetylene/s from 15 raw-coal/s', () => {
    const result = solve(data, input);

    const acetylene = result.products.find(p => p.name === 'acetylene');
    expect(acetylene).toBeDefined();
    expect(acetylene!.amount).toBeCloseTo(391.4784, 1);
  });

  it('consumes exactly 15 raw-coal/s', () => {
    const result = solve(data, input);

    const rawCoal = result.ingredients.find(i => i.name === 'raw-coal');
    expect(rawCoal).toBeDefined();
    expect(rawCoal!.amount).toBeCloseTo(15, 5);
  });

  it('all 14 recipes have positive factory counts', () => {
    const result = solve(data, input);

    expect(result.recipes).toHaveLength(14);
    for (const r of result.recipes) {
      expect(r.factoryCount, `${r.recipeName} should have positive count`).toBeGreaterThan(0);
    }
  });

  it('key factory counts match expected values', () => {
    const result = solve(data, input);

    const counts = new Map(result.recipes.map(r => [r.recipeName, r.factoryCount]));
    expect(counts.get('distilled-raw-coal')).toBeCloseTo(3.0, 1);
    expect(counts.get('acetylene')).toBeCloseTo(31.32, 1);
    expect(counts.get('calcium-carbide')).toBeCloseTo(15.66, 1);
    expect(counts.get('lime')).toBeCloseTo(3.10, 1);
  });

  it('all intermediates are balanced (no net surplus/deficit)', () => {
    const result = solve(data, input);
    for (const im of result.intermediates) {
      const produced = im.producers.reduce((s, p) => s + p.amount, 0);
      const consumed = im.consumers.reduce((s, c) => s + c.amount, 0);
      expect(Math.abs(produced - consumed)).toBeLessThan(0.01);
    }
  });
});

describe('automation science pack (15-recipe, simplex + max-import balance)', () => {
  const recipes: RecipeSpec[] = [
    { recipeName: 'grade-1-iron-crush', factoryName: 'jaw-crusher' },
    { recipeName: 'low-grade-smelting-iron', factoryName: 'advanced-foundry-mk01' },
    { recipeName: 'grade-2-copper', factoryName: 'automated-screener-mk01' },
    { recipeName: 'copper-plate-4', factoryName: 'advanced-foundry-mk01' },
    { recipeName: 'stone-brick', factoryName: 'advanced-foundry-mk01' },
    { recipeName: 'iron-stick', factoryName: 'automated-factory-mk01' },
    { recipeName: 'iron-gear-wheel', factoryName: 'automated-factory-mk01' },
    { recipeName: 'copper-cable', factoryName: 'automated-factory-mk01' },
    { recipeName: 'bolts', factoryName: 'automated-factory-mk01' },
    { recipeName: 'small-parts-01', factoryName: 'automated-factory-mk01' },
    { recipeName: 'empty-planter-box', factoryName: 'automated-factory-mk01' },
    { recipeName: 'soil', factoryName: 'soil-extractor-mk01' },
    { recipeName: 'planter-box', factoryName: 'automated-factory-mk01' },
    { recipeName: 'automation-science-pack', factoryName: 'automated-factory-mk01' },
    { recipeName: 'grade-1-copper-crush', factoryName: 'jaw-crusher' },
  ];

  const input: SolveInput = {
    recipes,
    target: { name: 'automation-science-pack', amount: 0.545 },
    time: 1,
    solver: 'simplex',
    constraints: [
      { recipeName: 'grade-1-iron-crush', productName: 'stone', type: 'exclude' },
      { recipeName: 'grade-1-copper-crush', productName: 'stone', type: 'exclude' },
    ],
    maxImports: [
      { name: 'iron-gear-wheel', amount: 0 },
      { name: 'iron-plate', amount: 0 },
      { name: 'processed-iron-ore', amount: 0 },
      { name: 'grade-1-copper', amount: 0 },
      { name: 'grade-2-copper', amount: 0 },
    ],
  };

  it('produces ~0.55 automation-science-pack/s', () => {
    const result = solve(data, input);
    const science = result.products.find(p => p.name === 'automation-science-pack');
    expect(science).toBeDefined();
    expect(science!.amount).toBeCloseTo(0.545, 2);
  });

  it('keeps iron-ore under 15/s', () => {
    const result = solve(data, input);
    const ironOre = result.ingredients.find(i => i.name === 'iron-ore');
    expect(ironOre).toBeDefined();
    expect(ironOre!.amount).toBeLessThan(15);
    expect(ironOre!.amount).toBeCloseTo(14.99, 1);
  });

  it('produces copper-plate as byproduct from recycled grade-2-copper', () => {
    const result = solve(data, input);
    const copperPlate = result.products.find(p => p.name === 'copper-plate');
    expect(copperPlate).toBeDefined();
    expect(copperPlate!.amount).toBeCloseTo(0.20, 1);
  });

  it('does not import any max-import=0 intermediates', () => {
    const result = solve(data, input);
    const banned = ['iron-gear-wheel', 'iron-plate', 'processed-iron-ore', 'grade-1-copper', 'grade-2-copper'];
    for (const name of banned) {
      const ing = result.ingredients.find(i => i.name === name);
      if (ing) {
        expect(ing.amount, `${name} should not be imported`).toBeLessThan(0.01);
      }
    }
  });

  it('imports only raw materials', () => {
    const result = solve(data, input);
    const allowedRaws = new Set(['iron-ore', 'copper-ore', 'stone', 'water', 'ash', 'wood', 'native-flora']);
    const significantImports = result.ingredients.filter(i => i.amount >= 0.01);
    for (const ing of significantImports) {
      expect(allowedRaws.has(ing.name), `unexpected import: ${ing.name}`).toBe(true);
    }
  });

  it('all 15 recipes have positive factory counts', () => {
    const result = solve(data, input);
    expect(result.recipes).toHaveLength(15);
    for (const r of result.recipes) {
      expect(r.factoryCount, `${r.recipeName} should have positive count`).toBeGreaterThan(0);
    }
  });
});
