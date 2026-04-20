import { describe, it, expect, beforeAll } from 'vitest';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadPrototypes, findTechForRecipe } from '../../src/data/PrototypeLoader.js';
import type { PrototypeData } from '../../src/data/PrototypeLoader.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROTO_PATH = resolve(__dirname, '../../data/helmod-web-prototypes.json');

let data: PrototypeData;

beforeAll(() => {
  data = loadPrototypes(PROTO_PATH);
});

describe('technology data', () => {
  it('exports both researched and unresearched techs', () => {
    const techs = Object.values(data.technologies!);
    const researched = techs.filter(t => t.researched);
    const unresearched = techs.filter(t => !t.researched);
    expect(researched.length).toBeGreaterThan(0);
    expect(unresearched.length).toBeGreaterThan(0);
    expect(techs.length).toBeGreaterThan(researched.length);
  });

  it('automation tech has prerequisites and research cost', () => {
    const tech = data.technologies!['automation'];
    expect(tech).toBeDefined();
    expect(tech.researched).toBe(true);
    expect(tech.prerequisites).toBeDefined();
    expect(tech.prerequisites!.length).toBeGreaterThan(0);
    expect(tech.research_unit_count).toBeGreaterThan(0);
    expect(Array.isArray(tech.research_unit_ingredients)).toBe(true);
    expect(tech.research_unit_ingredients!.length).toBeGreaterThan(0);
    expect(tech.research_unit_ingredients![0]).toHaveProperty('name');
    expect(tech.research_unit_ingredients![0]).toHaveProperty('amount');
  });

  it('steam-power is a starting tech with no prerequisites', () => {
    const tech = data.technologies!['steam-power'];
    expect(tech).toBeDefined();
    expect(tech.researched).toBe(true);
    const prereqs = Array.isArray(tech.prerequisites) ? tech.prerequisites : [];
    expect(prereqs.length).toBe(0);
  });

  it('findTechForRecipe returns correct tech', () => {
    const tech = findTechForRecipe(data, 'assembling-machine-1');
    expect(tech).not.toBeNull();
    expect(tech!.name).toBe('automation');
  });

  it('findTechForRecipe returns null for unknown recipe', () => {
    const tech = findTechForRecipe(data, 'nonexistent-recipe-xyz');
    expect(tech).toBeNull();
  });

  it('unresearched tech has expected fields', () => {
    const tech = data.technologies!['quality-module'];
    expect(tech).toBeDefined();
    expect(tech.researched).toBe(false);
    expect(tech.prerequisites!.length).toBeGreaterThan(0);
    expect(tech.unlocks.length).toBeGreaterThan(0);
    expect(tech.research_unit_count).toBeGreaterThan(0);
  });
});
