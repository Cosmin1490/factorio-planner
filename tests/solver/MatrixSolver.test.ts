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

describe('power modeling', () => {
  it('computes totalPowerMW > 0 for electric factories', () => {
    const input: SolveInput = {
      recipes: [
        { recipeName: 'iron-plate', factoryName: 'electric-furnace' },
      ],
      target: { name: 'iron-plate', amount: 60 },
      time: 60,
    };
    const result = solve(data, input);
    expect(result.totalPowerMW).toBeGreaterThan(0);
    expect(result.recipes[0].energyUsage).toBeGreaterThan(0);
  });

  it('reports energyUsage = 0 for burner factories', () => {
    const input: SolveInput = {
      recipes: [
        { recipeName: 'iron-plate', factoryName: 'stone-furnace', fuel: 'coal' },
      ],
      target: { name: 'iron-plate', amount: 60 },
      time: 60,
    };
    const result = solve(data, input);
    expect(result.totalPowerMW).toBe(0);
    expect(result.recipes[0].energyUsage).toBe(0);
  });
});

describe('temperature-linked fluids', () => {
  it('links steam@250 from boiler to tar-refining (needs >=250)', () => {
    const input: SolveInput = {
      recipes: [
        { recipeName: 'tar-refining', factoryName: 'tar-processing-unit' },
        { recipeName: 'electric-boiler-water-to-steam', factoryName: 'py-electric-boiler' },
      ],
      target: { name: 'pitch', amount: 60 },
      time: 60,
      solver: 'simplex',
    };
    const result = solve(data, input);
    // Steam should be an intermediate (linked), not an import
    const steamIntermediate = result.intermediates.find(i => i.name === 'steam');
    expect(steamIntermediate, 'steam should be linked as intermediate').toBeDefined();
    expect(steamIntermediate!.producers).toHaveLength(1);
    expect(steamIntermediate!.consumers).toHaveLength(1);
    // Boiler should have positive count
    const boiler = result.recipes.find(r => r.recipeName === 'electric-boiler-water-to-steam');
    expect(boiler!.factoryCount).toBeGreaterThan(0);
  });

  it('does NOT link steam@150 to tar-refining (needs >=250)', () => {
    const input: SolveInput = {
      recipes: [
        { recipeName: 'tar-refining', factoryName: 'tar-processing-unit' },
        { recipeName: 'polybutadiene', factoryName: 'cracker-mk01' },
      ],
      target: { name: 'pitch', amount: 60 },
      time: 60,
      solver: 'simplex',
    };
    const result = solve(data, input);
    // Steam should NOT be an intermediate — polybutadiene's 150C doesn't satisfy >=250
    const steamIntermediate = result.intermediates.find(i => i.name === 'steam');
    const steamLinked = steamIntermediate?.producers.some(
      p => p.recipeName === 'polybutadiene' && p.amount > 0.01
    );
    expect(steamLinked, 'steam@150 should not link to tar-refining').toBeFalsy();
    // Steam should appear as an input (import needed)
    const steamInput = result.ingredients.find(i => i.name === 'steam');
    expect(steamInput, 'steam should be an unmet input').toBeDefined();
  });

  it('merges temps into one column when no consumer has temp constraints', () => {
    // coke-coal produces coke-oven-gas@250, warm-stone-brick-1 consumes coke-oven-gas min_temp=250
    // warm-stone-brick-1 also produces coke-oven-gas@100 (degraded)
    // The degraded gas should be a separate column (output), not recycled
    const input: SolveInput = {
      recipes: [
        { recipeName: 'coke-coal', factoryName: 'hpf' },
        { recipeName: 'warm-stone-brick-1', factoryName: 'rhe' },
      ],
      target: { name: 'warm-stone-brick', amount: 60 },
      time: 60,
      solver: 'simplex',
    };
    const result = solve(data, input);
    // coke-oven-gas at 100C should be an output (waste), not recycled
    const cokeGasOutput = result.products.find(p => p.name === 'coke-oven-gas');
    expect(cokeGasOutput, 'degraded coke-oven-gas@100 should be an output').toBeDefined();
    // coke-coal should have positive count (providing the 250C gas)
    const cokeCoal = result.recipes.find(r => r.recipeName === 'coke-coal');
    expect(cokeCoal!.factoryCount).toBeGreaterThan(0);
  });
});

describe('logistic science pack (100-recipe regression guard)', () => {
  const recipeNames = 'logistic-science-pack,graphite,glass-2,hotair-molten-glass,crushing-quartz,lens,warm-air-1,warm-stone-brick-1,coke-coal,pressured-air,stone-brick,boron-trioxide,boric-acid,diborane,borax-washing,hydrogen,animal-sample-01,full-render-auogs,caged-auog,auog-maturing-1,auog-pup-breeding-1,auog-pooping-1,urea-from-liquid-manure,liquid-manure,plasmids,lab-instrument,equipment-chassi,fenxsb-alloy-2,electronic-circuit,battery-mk00,capacitor1,inductor1,resistor1,pcb1,vacuum-tube,solder-0,formica,treated-wood,fiber-01,methanal,sap-01,hotair-flask,stopper,creamy-latex,latex-slab,latex,sodium-alginate,seaweed-1,agar,petri-dish,hotair-empty-petri-dish,petri-dish-bacteria,zogna-bacteria,alien-sample01,bio-sample01,ground-sample01,rich-clay,bone-to-bonemeal-2,cottongut-science-red-seeds,fawogae-substrate,cellulose-00,depolymerized-organics,subcritical-water-01,pressured-water,biomass-wood,cottongut-cub-1,caged-cottongut-1,wood-seeds,moondrop-1,moondrop-seeds,ralesia-1,ralesia-seeds,vrauks-1,vrauks-cocoon-1,full-render-vrauks,caged-vrauks,Moss-1,distilled-raw-coal,coke-co2,iron-plate,copper-plate,steel-plate,tin-plate-1,titanium-plate-1,iron-stick,bolts,copper-cable,iron-gear-wheel,small-parts-01,small-lamp,barrel,water-barrel,saline-water,vacuum,ceramic,clay,soil,soil-separation-2,extract-limestone-01,methane-co2'.split(',');
  const factoryMap: Record<string, string> = {
    'logistic-science-pack': 'research-center-mk01', 'graphite': 'hpf', 'glass-2': 'glassworks-mk01',
    'hotair-molten-glass': 'glassworks-mk01', 'crushing-quartz': 'jaw-crusher', 'lens': 'glassworks-mk01',
    'warm-air-1': 'rhe', 'warm-stone-brick-1': 'rhe', 'coke-coal': 'hpf', 'pressured-air': 'vacuum-pump-mk01',
    'stone-brick': 'advanced-foundry-mk01', 'boron-trioxide': 'hpf', 'boric-acid': 'electrolyzer-mk01',
    'diborane': 'electrolyzer-mk01', 'borax-washing': 'washer', 'hydrogen': 'electrolyzer-mk01',
    'animal-sample-01': 'genlab-mk01', 'full-render-auogs': 'slaughterhouse-mk01',
    'caged-auog': 'automated-factory-mk01', 'auog-maturing-1': 'auog-paddock-mk01',
    'auog-pup-breeding-1': 'rc-mk01', 'auog-pooping-1': 'auog-paddock-mk01',
    'urea-from-liquid-manure': 'bio-reactor-mk01', 'liquid-manure': 'bio-reactor-mk01',
    'plasmids': 'biofactory-mk01', 'lab-instrument': 'automated-factory-mk01',
    'equipment-chassi': 'automated-factory-mk01', 'fenxsb-alloy-2': 'smelter-mk01',
    'electronic-circuit': 'chipshooter-mk01', 'battery-mk00': 'automated-factory-mk01',
    'capacitor1': 'electronics-factory-mk01', 'inductor1': 'electronics-factory-mk01',
    'resistor1': 'electronics-factory-mk01', 'pcb1': 'pcb-factory-mk01',
    'vacuum-tube': 'electronics-factory-mk01', 'solder-0': 'automated-factory-mk01',
    'formica': 'pulp-mill-mk01', 'treated-wood': 'tar-processing-unit', 'fiber-01': 'wpu-mk01',
    'methanal': 'hpf', 'sap-01': 'sap-extractor-mk01', 'hotair-flask': 'glassworks-mk01',
    'stopper': 'automated-factory-mk01', 'creamy-latex': 'washer', 'latex-slab': 'distilator',
    'latex': 'hpf', 'sodium-alginate': 'hpf', 'seaweed-1': 'seaweed-crop-mk01', 'agar': 'hpf',
    'petri-dish': 'automated-factory-mk01', 'hotair-empty-petri-dish': 'glassworks-mk01',
    'petri-dish-bacteria': 'micro-mine-mk01', 'zogna-bacteria': 'incubator-mk01',
    'alien-sample01': 'automated-factory-mk01', 'bio-sample01': 'automated-factory-mk01',
    'ground-sample01': 'automated-factory-mk01', 'rich-clay': 'automated-factory-mk01',
    'bone-to-bonemeal-2': 'fbreactor-mk01', 'cottongut-science-red-seeds': 'incubator-mk01',
    'fawogae-substrate': 'automated-factory-mk01', 'cellulose-00': 'hpf',
    'depolymerized-organics': 'reformer-mk01', 'subcritical-water-01': 'py-heat-exchanger',
    'pressured-water': 'vacuum-pump-mk01', 'biomass-wood': 'compost-plant-mk01',
    'cottongut-cub-1': 'rc-mk01', 'caged-cottongut-1': 'prandium-lab-mk01',
    'wood-seeds': 'automated-factory-mk01', 'moondrop-1': 'moondrop-greenhouse-mk01',
    'moondrop-seeds': 'botanical-nursery', 'ralesia-1': 'ralesia-plantation-mk01',
    'ralesia-seeds': 'botanical-nursery', 'vrauks-1': 'vrauks-paddock-mk01',
    'vrauks-cocoon-1': 'rc-mk01', 'full-render-vrauks': 'slaughterhouse-mk01',
    'caged-vrauks': 'automated-factory-mk01', 'Moss-1': 'moss-farm-mk01',
    'distilled-raw-coal': 'distilator', 'coke-co2': 'hpf', 'iron-plate': 'advanced-foundry-mk01',
    'copper-plate': 'advanced-foundry-mk01', 'steel-plate': 'advanced-foundry-mk01',
    'tin-plate-1': 'advanced-foundry-mk01', 'titanium-plate-1': 'advanced-foundry-mk01',
    'iron-stick': 'automated-factory-mk01', 'bolts': 'automated-factory-mk01',
    'copper-cable': 'automated-factory-mk01', 'iron-gear-wheel': 'automated-factory-mk01',
    'small-parts-01': 'automated-factory-mk01', 'small-lamp': 'automated-factory-mk01',
    'barrel': 'automated-factory-mk01', 'water-barrel': 'barrel-machine-mk01',
    'saline-water': 'washer', 'vacuum': 'vacuum-pump-mk01', 'ceramic': 'hpf',
    'clay': 'clay-pit-mk01', 'soil': 'soil-extractor-mk01', 'soil-separation-2': 'solid-separator',
    'extract-limestone-01': 'soil-extractor-mk01', 'methane-co2': 'moondrop-greenhouse-mk01',
  };

  const recipes: RecipeSpec[] = recipeNames.map(name => ({
    recipeName: name,
    factoryName: factoryMap[name],
    modules: name === 'seaweed-1' ? [{ name: 'seaweed', count: 10 }] :
      name === 'sap-01' ? [{ name: 'sap-tree', count: 2 }] :
      name === 'Moss-1' ? [{ name: 'moss', count: 15 }] :
      name === 'moondrop-1' ? [{ name: 'moondrop', count: 16 }] :
      name === 'ralesia-1' ? [{ name: 'ralesia', count: 12 }] :
      name === 'auog-maturing-1' ? [{ name: 'auog', count: 4 }] :
      name === 'auog-pooping-1' ? [{ name: 'auog', count: 4 }] :
      name === 'auog-pup-breeding-1' ? [{ name: 'auog', count: 2 }] :
      name === 'vrauks-1' ? [{ name: 'vrauks', count: 10 }] :
      name === 'vrauks-cocoon-1' ? [{ name: 'vrauks', count: 2 }] :
      name === 'caged-cottongut-1' ? [{ name: 'cottongut-mk01', count: 20 }] :
      name === 'cottongut-cub-1' ? [{ name: 'cottongut-mk01', count: 2 }] :
      undefined,
  }));

  const input: SolveInput = {
    recipes,
    target: { name: 'logistic-science-pack', amount: 0.2 },
    time: 1,
    solver: 'simplex',
    constraints: [
      { recipeName: 'crushing-quartz', productName: 'stone', type: 'exclude' },
      { recipeName: 'borax-washing', productName: 'muddy-sludge', type: 'exclude' },
      { recipeName: 'soil-separation-2', productName: 'coarse', type: 'exclude' },
      { recipeName: 'full-render-auogs', productName: 'cage', type: 'exclude' },
      { recipeName: 'full-render-vrauks', productName: 'cage', type: 'exclude' },
      { recipeName: 'full-render-vrauks', productName: 'meat', type: 'exclude' },
      { recipeName: 'full-render-vrauks', productName: 'chitin', type: 'exclude' },
      { recipeName: 'full-render-vrauks', productName: 'guts', type: 'exclude' },
      { recipeName: 'full-render-vrauks', productName: 'brain', type: 'exclude' },
      { recipeName: 'hydrogen', productName: 'oxygen', type: 'exclude' },
      { recipeName: 'distilled-raw-coal', productName: 'coal-gas', type: 'exclude' },
      { recipeName: 'distilled-raw-coal', productName: 'tar', type: 'exclude' },
      { recipeName: 'distilled-raw-coal', productName: 'iron-oxide', type: 'exclude' },
      { recipeName: 'auog-pooping-1', productName: 'manure', type: 'exclude' },
      { recipeName: 'coke-co2', productName: 'ash', type: 'exclude' },
    ],
  };

  it('produces 0.2 logistic-science-pack/s', () => {
    const result = solve(data, input);
    const science = result.products.find(p => p.name === 'logistic-science-pack');
    expect(science).toBeDefined();
    expect(science!.amount).toBeCloseTo(0.2, 2);
  });

  it('total buildings stay under 400 (cascade guard)', () => {
    const result = solve(data, input);
    const total = result.recipes.reduce((s, r) => s + Math.ceil(r.factoryCount), 0);
    // LP simplex with cost minimization: ~163 buildings (avoids cascade over-scaling)
    // Previously ~326 with legacy simplex (cost-weighted pivot, no objective)
    // Previously 177 on main (incorrectly recycled 100C gas as 250C input)
    expect(total).toBeLessThan(400);
    expect(total).toBeGreaterThan(100);
  });

  it('all 100 recipes present in result', () => {
    const result = solve(data, input);
    expect(result.recipes).toHaveLength(100);
  });

  it('reports positive totalPowerMW', () => {
    const result = solve(data, input);
    expect(result.totalPowerMW).toBeGreaterThan(0);
  });
});

describe('electronic circuit sub-factory (12 recipes, validated pipeline)', () => {
  const input: SolveInput = {
    recipes: [
      { recipeName: 'electronic-circuit', factoryName: 'chipshooter-mk01' },
      { recipeName: 'battery-mk00', factoryName: 'automated-factory-mk01' },
      { recipeName: 'capacitor1', factoryName: 'electronics-factory-mk01' },
      { recipeName: 'inductor1', factoryName: 'electronics-factory-mk01' },
      { recipeName: 'resistor1', factoryName: 'electronics-factory-mk01' },
      { recipeName: 'vacuum-tube', factoryName: 'electronics-factory-mk01' },
      { recipeName: 'solder-0', factoryName: 'automated-factory-mk01' },
      { recipeName: 'vacuum', factoryName: 'vacuum-pump-mk01' },
      { recipeName: 'ceramic', factoryName: 'hpf' },
      { recipeName: 'clay', factoryName: 'clay-pit-mk01' },
      { recipeName: 'graphite', factoryName: 'hpf' },
      { recipeName: 'copper-cable', factoryName: 'automated-factory-mk01' },
    ],
    target: { name: 'electronic-circuit', amount: 0.9 },
    time: 1,
    solver: 'simplex',
  };

  it('produces 0.9/s electronic-circuit with 28 buildings', () => {
    const result = solve(data, input);
    const ec = result.products.find(p => p.name === 'electronic-circuit');
    expect(ec).toBeDefined();
    expect(ec!.amount).toBeCloseTo(0.9, 2);
    const total = result.recipes.reduce((s, r) => s + Math.ceil(r.factoryCount), 0);
    expect(total).toBe(28);
  });

  it('imports key materials at expected rates', () => {
    const result = solve(data, input);
    const pcb = result.ingredients.find(i => i.name === 'pcb1');
    expect(pcb!.amount).toBeCloseTo(0.3, 2);
    const ws = result.ingredients.find(i => i.name === 'water-saline');
    expect(ws!.amount).toBeCloseTo(75, 0);
    const cp = result.ingredients.find(i => i.name === 'copper-plate');
    expect(cp!.amount).toBeCloseTo(5.7, 1);
  });
});

describe('glass sub-factory (COG temperature degradation)', () => {
  const input: SolveInput = {
    recipes: [
      { recipeName: 'crushing-quartz', factoryName: 'jaw-crusher' },
      { recipeName: 'glass-2', factoryName: 'glassworks-mk01' },
      { recipeName: 'hotair-molten-glass', factoryName: 'glassworks-mk01' },
      { recipeName: 'warm-air-1', factoryName: 'rhe' },
      { recipeName: 'warm-stone-brick-1', factoryName: 'rhe' },
      { recipeName: 'coke-coal', factoryName: 'hpf' },
      { recipeName: 'pressured-air', factoryName: 'vacuum-pump-mk01' },
      { recipeName: 'stone-brick', factoryName: 'advanced-foundry-mk01' },
      { recipeName: 'lens', factoryName: 'glassworks-mk01' },
    ],
    target: { name: 'glass', amount: 5 },
    time: 1,
    solver: 'simplex',
    constraints: [
      { recipeName: 'crushing-quartz', productName: 'stone', type: 'exclude' },
    ],
  };

  it('produces 5/s glass', () => {
    const result = solve(data, input);
    const glass = result.products.find(p => p.name === 'glass');
    expect(glass).toBeDefined();
    expect(glass!.amount).toBeCloseTo(5, 1);
  });

  it('outputs degraded COG@100 as waste (not recycled)', () => {
    const result = solve(data, input);
    // coke-oven-gas at 100C from warm-stone-brick-1 should appear as output
    const cogOutput = result.products.find(p => p.name === 'coke-oven-gas');
    expect(cogOutput, 'degraded COG should be waste output').toBeDefined();
    expect(cogOutput!.amount).toBeGreaterThan(10);
  });
});

describe('bio module speed multipliers', () => {
  it('moss farm: 60 factories for 12/s with 15 moss modules', () => {
    const input: SolveInput = {
      recipes: [
        { recipeName: 'Moss-2', factoryName: 'moss-farm-mk01', modules: [{ name: 'moss', count: 15 }] },
      ],
      target: { name: 'moss', amount: 12 },
      time: 1,
    };
    const result = solve(data, input);
    expect(result.recipes[0].factoryCount).toBeCloseTo(60, 0);
    expect(result.recipes[0].effectiveSpeed).toBeCloseTo(1.0, 1);
  });

  it('auog paddock: effective speed 2.0 with 4 auog modules', () => {
    const input: SolveInput = {
      recipes: [
        { recipeName: 'auog-maturing-1', factoryName: 'auog-paddock-mk01', modules: [{ name: 'auog', count: 4 }] },
      ],
      target: { name: 'auog', amount: 1 },
      time: 1,
    };
    const result = solve(data, input);
    expect(result.recipes[0].effectiveSpeed).toBeCloseTo(2.0, 1);
  });
});

describe('LP cost minimization (target mode)', () => {
  it('LP simplex satisfies target with non-negative recipe counts', () => {
    // 3-recipe chain: iron-ore → processed-iron-ore → iron-plate
    const input: SolveInput = {
      recipes: [
        { recipeName: 'grade-1-iron-crush', factoryName: 'jaw-crusher' },
        { recipeName: 'low-grade-smelting-iron', factoryName: 'advanced-foundry-mk01' },
        { recipeName: 'iron-gear-wheel', factoryName: 'automated-factory-mk01' },
      ],
      target: { name: 'iron-gear-wheel', amount: 5 },
      time: 1,
      solver: 'simplex',
      constraints: [
        { recipeName: 'grade-1-iron-crush', productName: 'stone', type: 'exclude' },
      ],
    };
    const result = solve(data, input);
    const gears = result.products.find(p => p.name === 'iron-gear-wheel');
    expect(gears).toBeDefined();
    expect(gears!.amount).toBeCloseTo(5, 1);

    // All recipes should have non-negative counts (LP feasible solution)
    for (const r of result.recipes) {
      expect(r.factoryCount, `${r.recipeName}`).toBeGreaterThanOrEqual(-0.001);
    }
  });

  it('LP simplex handles single-recipe target correctly', () => {
    const input: SolveInput = {
      recipes: [
        { recipeName: 'stone-brick', factoryName: 'advanced-foundry-mk01' },
      ],
      target: { name: 'stone-brick', amount: 10 },
      time: 1,
      solver: 'simplex',
    };
    const result = solve(data, input);
    const bricks = result.products.find(p => p.name === 'stone-brick');
    expect(bricks).toBeDefined();
    expect(bricks!.amount).toBeCloseTo(10, 1);
  });
});

describe('cycle detection', () => {
  it('detects ash cycle in log3 with burner factory', () => {
    // log3 recipe consumes 30 ash per craft; fwf-mk01 is a burner that produces ash as burnt_result
    const input: SolveInput = {
      recipes: [
        { recipeName: 'log3', factoryName: 'fwf-mk01', fuel: 'coal' },
        { recipeName: 'wood-seedling', factoryName: 'botanical-nursery' },
        { recipeName: 'wood-seeds', factoryName: 'assembling-machine-1' },
        { recipeName: 'log-wood-fast', factoryName: 'wpu-mk01' },
      ],
      target: { name: 'log', amount: 1 },
      time: 1,
      solver: 'simplex',
    };
    const result = solve(data, input);
    expect(result.warnings.length).toBeGreaterThan(0);

    const ashCycle = result.warnings.find(w =>
      w.type === 'cycle' && w.detail.items.includes('ash'));
    expect(ashCycle).toBeDefined();
    expect(ashCycle!.detail.recipes).toContain('log3');
  });

  it('reports no cycles for acyclic pipeline', () => {
    // Simple iron gear chain — no cycles
    const input: SolveInput = {
      recipes: [
        { recipeName: 'grade-1-iron-crush', factoryName: 'jaw-crusher' },
        { recipeName: 'low-grade-smelting-iron', factoryName: 'advanced-foundry-mk01' },
        { recipeName: 'iron-gear-wheel', factoryName: 'automated-factory-mk01' },
      ],
      target: { name: 'iron-gear-wheel', amount: 5 },
      time: 1,
      solver: 'simplex',
      constraints: [
        { recipeName: 'grade-1-iron-crush', productName: 'stone', type: 'exclude' },
      ],
    };
    const result = solve(data, input);
    expect(result.warnings.length).toBe(0);
  });

  it('solver returns non-negative counts despite cycle', () => {
    // The LP solver handles cycles mathematically — recipe counts should never go negative
    const input: SolveInput = {
      recipes: [
        { recipeName: 'log3', factoryName: 'fwf-mk01', fuel: 'coal' },
        { recipeName: 'wood-seedling', factoryName: 'botanical-nursery' },
        { recipeName: 'wood-seeds', factoryName: 'assembling-machine-1' },
        { recipeName: 'log-wood-fast', factoryName: 'wpu-mk01' },
      ],
      target: { name: 'log', amount: 1 },
      time: 1,
      solver: 'simplex',
    };
    const result = solve(data, input);
    // All recipe counts should be non-negative (no degenerate negative scaling)
    for (const r of result.recipes) {
      expect(r.factoryCount, `${r.recipeName}`).toBeGreaterThanOrEqual(-0.001);
    }
  });
});
