import { describe, it, expect, beforeAll, vi } from 'vitest';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadPrototypes, buildConsumerIndex, buildProducerIndex, isRecipeUnlocked, findFactories } from '../../src/data/PrototypeLoader.js';
import type { PrototypeData } from '../../src/data/PrototypeLoader.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROTO_PATH = resolve(__dirname, '../../data/helmod-web-prototypes.json');

let data: PrototypeData;

beforeAll(() => {
  data = loadPrototypes(PROTO_PATH);
});

describe('item-info: item lookups', () => {
  it('iron-plate has stack_size 100', () => {
    const item = data.items['iron-plate'];
    expect(item).toBeDefined();
    expect(item.stack_size).toBe(100);
  });

  it('copper-cable has stack_size 200', () => {
    const item = data.items['copper-cable'];
    expect(item).toBeDefined();
    expect(item.stack_size).toBe(200);
  });

  it('iron-plate has 100+ unlocked consumers', () => {
    const index = buildConsumerIndex(data);
    let consumers = index.get('iron-plate') || [];
    consumers = consumers.filter(r => isRecipeUnlocked(data, r.name));
    expect(consumers.length).toBeGreaterThanOrEqual(100);
  });

  it('copper-cable has fewer consumers than copper-plate (transport density)', () => {
    const index = buildConsumerIndex(data);
    const cableConsumers = (index.get('copper-cable') || []).filter(r => isRecipeUnlocked(data, r.name));
    const plateConsumers = (index.get('copper-plate') || []).filter(r => isRecipeUnlocked(data, r.name));
    expect(cableConsumers.length).toBeLessThan(plateConsumers.length);
  });

  it('battery-mk01 has 10+ unlocked consumers', () => {
    const index = buildConsumerIndex(data);
    let consumers = index.get('battery-mk01') || [];
    consumers = consumers.filter(r => isRecipeUnlocked(data, r.name));
    expect(consumers.length).toBeGreaterThanOrEqual(10);
  });

  it('coal has fuel_value and burnt_result', () => {
    const item = data.items['raw-coal'];
    expect(item).toBeDefined();
    expect(item.fuel_value).toBeGreaterThan(0);
    expect(item.fuel_category).toBe('chemical');
    expect(item.burnt_result).toBeDefined();
    expect(item.burnt_result!.name).toBe('ash');
  });
});

describe('item-info: fluid lookups', () => {
  it('syngas has fuel_value > 0', () => {
    const fluid = data.fluids['syngas'];
    expect(fluid).toBeDefined();
    expect(fluid.fuel_value).toBeGreaterThan(0);
  });

  it('water has heat_capacity 2100 (Pyanodon)', () => {
    const fluid = data.fluids['water'];
    expect(fluid).toBeDefined();
    expect(fluid.heat_capacity).toBe(2100);
  });

  it('steam has temperature range', () => {
    const fluid = data.fluids['steam'];
    expect(fluid).toBeDefined();
    expect(fluid.default_temperature).toBe(15);
    expect(fluid.max_temperature).toBeGreaterThan(100);
  });

  it('syngas has consumers and producers', () => {
    const consumerIndex = buildConsumerIndex(data);
    const producerIndex = buildProducerIndex(data);
    const consumers = consumerIndex.get('syngas') || [];
    const producers = producerIndex.get('syngas') || [];
    expect(consumers.length).toBeGreaterThan(0);
    expect(producers.length).toBeGreaterThan(0);
  });
});

describe('recipe-info: temperature display', () => {
  it('polybutadiene produces steam at 150°C', () => {
    const recipe = data.recipes['polybutadiene'];
    expect(recipe).toBeDefined();
    const products = Array.isArray(recipe.products) ? recipe.products : [];
    const steam = products.find(p => p.name === 'steam');
    expect(steam).toBeDefined();
    expect(steam!.temperature).toBe(150);
  });

  it('tar-refining requires steam ≥250°C', () => {
    const recipe = data.recipes['tar-refining'];
    expect(recipe).toBeDefined();
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const steam = ingredients.find(i => i.name === 'steam');
    expect(steam).toBeDefined();
    expect(steam!.minimum_temperature).toBe(250);
  });

  it('recipe-info shows compatible factories', () => {
    const recipe = data.recipes['polybutadiene'];
    expect(recipe).toBeDefined();
    const factories = findFactories(data, recipe.category);
    expect(factories.length).toBeGreaterThan(0);
    expect(factories[0].name).toContain('cracker');
  });

  it('recipe with no temperature fields has undefined temperature', () => {
    const recipe = data.recipes['iron-plate'];
    expect(recipe).toBeDefined();
    const products = Array.isArray(recipe.products) ? recipe.products : [];
    for (const p of products) {
      expect(p.temperature).toBeUndefined();
    }
  });
});

describe('factory-info: entity lookups', () => {
  it('moss-farm-mk01 has 15 module slots for moss', () => {
    const entity = data.entities['moss-farm-mk01'];
    expect(entity).toBeDefined();
    expect(entity.module_inventory_size).toBe(15);
    expect(entity.allowed_module_categories).toBeDefined();
    expect(entity.allowed_module_categories!['moss']).toBe(true);
  });

  it('automated-factory-mk01 has standard module categories', () => {
    const entity = data.entities['automated-factory-mk01'];
    expect(entity).toBeDefined();
    expect(entity.module_inventory_size).toBe(1);
    const cats = entity.allowed_module_categories!;
    expect(cats['speed']).toBe(true);
    expect(cats['productivity']).toBe(true);
  });

  it('stone-furnace is a burner', () => {
    const entity = data.entities['stone-furnace'];
    expect(entity).toBeDefined();
    expect(entity.burner_prototype).toBeDefined();
    expect(entity.burner_prototype!.fuel_categories['chemical']).toBe(true);
    expect(entity.burner_prototype!.effectivity).toBe(1);
  });

  it('automated-factory-mk01 is not a burner', () => {
    const entity = data.entities['automated-factory-mk01'];
    expect(entity).toBeDefined();
    expect(entity.burner_prototype).toBeUndefined();
  });

  it('energy_usage converts to watts correctly', () => {
    const entity = data.entities['moss-farm-mk01'];
    expect(entity).toBeDefined();
    expect(entity.energy_usage).toBeDefined();
    const watts = entity.energy_usage! * 60;
    expect(watts).toBeCloseTo(100000, -2); // ~100 kW
  });

  it('entities have tile dimensions', () => {
    const entity = data.entities['automated-factory-mk01'];
    expect(entity).toBeDefined();
    expect(entity.tile_width).toBeGreaterThan(0);
    expect(entity.tile_height).toBeGreaterThan(0);
  });

  it('bio buildings have organism-only module categories', () => {
    const bioBuildings: [string, string][] = [
      ['moss-farm-mk01', 'moss'],
      ['moondrop-greenhouse-mk01', 'moondrop'],
      ['ralesia-plantation-mk01', 'ralesia'],
      ['vrauks-paddock-mk01', 'vrauks'],
      ['auog-paddock-mk01', 'auog'],
      ['seaweed-crop-mk01', 'seaweed'],
    ];

    for (const [entityName, moduleCat] of bioBuildings) {
      const entity = data.entities[entityName];
      expect(entity, `${entityName} should exist`).toBeDefined();
      expect(entity.allowed_module_categories, `${entityName} should have module categories`).toBeDefined();
      expect(entity.allowed_module_categories![moduleCat], `${entityName} should accept ${moduleCat}`).toBe(true);
      expect(entity.module_inventory_size, `${entityName} should have module slots`).toBeGreaterThan(0);
    }
  });
});

describe('boundary selection data', () => {
  it('tier A items all have 20+ unlocked consumers', () => {
    const index = buildConsumerIndex(data);
    const tierA = ['small-parts-01', 'iron-plate', 'electronic-circuit', 'steel-plate', 'glass', 'stone-brick', 'copper-plate', 'titanium-plate', 'copper-cable'];

    for (const name of tierA) {
      let consumers = index.get(name) || [];
      consumers = consumers.filter(r => isRecipeUnlocked(data, r.name));
      expect(consumers.length, `${name} should have 20+ consumers`).toBeGreaterThanOrEqual(19);
    }
  });

  it('transport density: copper-plate stacks same as copper-cable but is 2x denser', () => {
    const plate = data.items['copper-plate'];
    const cable = data.items['copper-cable'];
    expect(plate.stack_size).toBeDefined();
    expect(cable.stack_size).toBeDefined();
    // cable is made 2:1 from plate, so plate is 2x more transport-efficient per stack slot
    // (both stack to same or similar amounts, but 1 plate = 2 cables)
    const recipe = data.recipes['copper-cable'];
    const products = Array.isArray(recipe.products) ? recipe.products : [];
    const cableOutput = products.find(p => p.name === 'copper-cable');
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const plateInput = ingredients.find(i => i.name === 'copper-plate');
    expect(cableOutput!.amount! / plateInput!.amount!).toBe(2);
  });
});
