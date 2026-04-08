/**
 * Export solver results as a Helmod-compatible import string.
 *
 * Format: "0" + base64(gzip(lua_source))
 * Where lua_source is a serpent-style Lua table literal that Helmod's
 * loadstring() can parse and ModelBuilder.copyModel() can reconstruct.
 */

import { deflateSync } from 'zlib';
import type { PrototypeData } from '../data/PrototypeLoader.js';
import type { SolveInput, SolveResult } from '../solver/types.js';

// --- Lua table serializer ---

const LUA_IDENT = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function luaString(s: string): string {
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
}

function luaValue(value: unknown, indent: number): string {
  if (value === null || value === undefined) return 'nil';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return luaString(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '{}';
    const items = value.map(v => luaValue(v, indent + 1));
    return '{' + items.join(',') + '}';
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    const pad = '  '.repeat(indent + 1);
    const lines = entries.map(([k, v]) => {
      const key = LUA_IDENT.test(k) ? k : `[${luaString(k)}]`;
      return `${pad}${key}=${luaValue(v, indent + 1)}`;
    });
    return '{\n' + lines.join(',\n') + '\n' + '  '.repeat(indent) + '}';
  }
  return 'nil';
}

function luaSerialize(table: unknown): string {
  return `do local _=${luaValue(table, 0)}\nreturn _\nend`;
}

// --- Helmod model builder ---

interface HelmodFactory {
  class: string;
  name: string;
  quality: string;
  amount: number;
  fuel?: string;
  modules: Record<string, { name: string; amount: number; quality: string }>;
}

interface HelmodBeacon {
  class: string;
  name: string;
  quality: string;
  combo: number;
  per_factory: number;
  per_factory_constant: number;
  modules: Record<string, { name: string; amount: number; quality: string }>;
}

interface HelmodRecipe {
  class: string;
  id: string;
  index: number;
  name: string;
  type: string;
  production: number;
  quality: string;
  factory: HelmodFactory;
  beacons: HelmodBeacon[];
}

function buildHelmodModel(input: SolveInput, result: SolveResult, data: PrototypeData): Record<string, unknown> {
  const children: Record<string, HelmodRecipe> = {};

  for (let i = 0; i < input.recipes.length; i++) {
    const spec = input.recipes[i];
    const recipeResult = result.recipes[i];
    const id = `R${i + 1}`;

    // Build factory modules
    const modules: Record<string, { name: string; amount: number; quality: string }> = {};
    for (const mod of spec.modules ?? []) {
      modules[mod.name] = {
        name: mod.name,
        amount: mod.count,
        quality: mod.quality ?? 'normal',
      };
    }

    // Build factory
    const factory: HelmodFactory = {
      class: 'Factory',
      name: spec.factoryName,
      quality: spec.factoryQuality ?? 'normal',
      amount: 0, // let Helmod re-solve
      modules,
    };
    if (spec.fuel) {
      factory.fuel = spec.fuel;
    }

    // Build beacons
    const beacons: HelmodBeacon[] = [];
    for (const b of spec.beacons ?? []) {
      const beaconModules: Record<string, { name: string; amount: number; quality: string }> = {};
      for (const mod of b.modules) {
        beaconModules[mod.name] = {
          name: mod.name,
          amount: mod.count,
          quality: mod.quality ?? 'normal',
        };
      }
      beacons.push({
        class: 'Beacon',
        name: b.name,
        quality: b.quality ?? 'normal',
        combo: b.count,
        per_factory: b.count,
        per_factory_constant: 0,
        modules: beaconModules,
      });
    }

    children[id] = {
      class: 'Recipe',
      id,
      index: i + 1,
      name: spec.recipeName,
      type: 'recipe',
      production: 1,
      quality: 'normal',
      factory,
      beacons,
    };
  }

  // Build target objective if present
  const blockName = input.recipes[0]?.recipeName ?? 'block';

  // Build input/output constraints
  const blockProducts: Record<string, unknown> = {};
  const blockIngredients: Record<string, unknown> = {};

  if (input.target) {
    const itemType = data.items[input.target.name] ? 'item' : 'fluid';
    blockProducts[input.target.name] = {
      name: input.target.name,
      type: itemType,
      input: input.target.amount,
    };
  }
  if (input.input) {
    const itemType = data.items[input.input.name] ? 'item' : 'fluid';
    blockIngredients[input.input.name] = {
      name: input.input.name,
      type: itemType,
      input: input.input.amount,
    };
  }

  return {
    class: 'Model',
    version: 2,
    time: input.time,
    block_root: {
      class: 'Block',
      id: 'block_1',
      name: blockName,
      type: '',
      owner: '',
      by_product: !input.input,
      by_factory: false,
      solver: false,
      children,
      products: blockProducts,
      ingredients: blockIngredients,
    },
    blocks: {},
  };
}

// --- Encode pipeline ---

export function exportHelmod(input: SolveInput, result: SolveResult, data: PrototypeData): string {
  const model = buildHelmodModel(input, result, data);
  const luaSource = luaSerialize(model);
  const compressed = deflateSync(Buffer.from(luaSource, 'utf-8'));
  return compressed.toString('base64');
}
