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
    input: { name: 'raw-coal', amount: 15 },
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

  it('has no unexpected intermediates (all should be linked)', () => {
    const result = solve(data, input);
    expect(result.intermediates).toHaveLength(0);
  });
});
