import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';
import { inflateSync } from 'zlib';
import { resolve, dirname } from 'path';
import { loadPrototypes } from '../data/PrototypeLoader.js';
import type { PrototypeData, Recipe, Entity } from '../data/PrototypeLoader.js';

export interface BlockInventory {
  name: string;
  count: number;
  recipes: Record<string, { factory: string; count: number }>;
  stations: Record<string, 'load' | 'unload'>;
  exports: Record<string, number>;
  surplus: Record<string, number>;
  imports: Record<string, number>;
  mined: Record<string, number>;
  intermediates: Record<string, number>;
  powerMW: number;
}

interface InventoryOptions {
  blueprint: string[];
  name?: string;
  save?: string;
  json?: boolean;
  time?: string;
}

interface BlueprintEntity {
  name: string;
  recipe?: string;
  recipe_quality?: string;
  station?: string;
  items?: { id: { name: string }; items: { in_inventory: { inventory: number; stack: number }[] } }[];
  position: { x: number; y: number };
  direction?: number;
  entity_number?: number;
  control_behavior?: {
    sections?: {
      sections?: {
        filters?: { index: number; type?: string; name: string; count: number }[];
      }[];
    };
  };
}

export function decodeBlueprintFile(filePath: string): { entities: BlueprintEntity[]; wires: number[][] } {
  const raw = readFileSync(filePath, 'utf8').trim();
  const json = JSON.parse(inflateSync(Buffer.from(raw.slice(1), 'base64')).toString());
  return {
    entities: json.blueprint?.entities ?? [],
    wires: json.blueprint?.wires ?? [],
  };
}

function countModules(entity: BlueprintEntity): { name: string; count: number } | null {
  if (!entity.items || entity.items.length === 0) return null;
  const moduleItem = entity.items[0];
  const name = moduleItem.id.name;
  const count = moduleItem.items.in_inventory?.length ?? 0;
  return count > 0 ? { name, count } : null;
}

function getEffectiveSpeed(
  data: PrototypeData,
  factoryName: string,
  modules: { name: string; count: number } | null,
): number {
  const entity = data.entities[factoryName];
  if (!entity) return 1;
  const baseSpeed = entity.crafting_speed?.normal ?? 1;

  if (!modules || modules.count === 0) return baseSpeed;

  const item = data.items[modules.name];
  const speedBonus = item?.module_effects?.normal?.speed ?? 0;
  return baseSpeed * (1 + modules.count * speedBonus);
}

function getItemType(data: PrototypeData, name: string): string {
  if (data.fluids[name]) return 'fluid';
  return 'item';
}

function parseStationItem(station: string): { name: string; type: string; direction: 'load' | 'unload' } | null {
  // Parse "[fluid=tar]Unload" or "[item=copper-plate]Unload"
  const match = station.match(/\[(fluid|item)=([^\]]+)\](Unload|Load)/i);
  if (match) {
    return { type: match[1], name: match[2], direction: match[3].toLowerCase() as 'load' | 'unload' };
  }
  // Parameterized stations: [virtual-signal=signal-item-parameter]Load or [virtual-signal=signal-fluid-parameter]Load
  const paramMatch = station.match(/\[virtual-signal=signal-(item|fluid)-parameter\](Load|Unload)/i);
  if (paramMatch) {
    return { type: paramMatch[1], name: '*', direction: paramMatch[2].toLowerCase() as 'load' | 'unload' };
  }
  return null;
}

/** Resolve all station items using wire connections to constant combinators.
 *  Each station is wired to a combinator with signals: signal-L, signal-P, and one item/fluid. */
function resolveStationItems(
  entities: BlueprintEntity[],
  wires: number[][],
): Map<number, { name: string; type: string; direction: 'load' | 'unload' }> {
  const result = new Map<number, { name: string; type: string; direction: 'load' | 'unload' }>();

  // Index signal combinators (constant-combinators with signal-L in filters)
  const signalCombinators = new Set<number>();
  const entityMap = new Map<number, BlueprintEntity>();
  for (const ent of entities) {
    if (ent.entity_number != null) entityMap.set(ent.entity_number, ent);
    if (ent.name === 'constant-combinator') {
      const filters = ent.control_behavior?.sections?.sections?.[0]?.filters;
      if (filters?.some(f => f.name === 'signal-L')) {
        signalCombinators.add(ent.entity_number!);
      }
    }
  }

  // Build wire adjacency graph
  const adj = new Map<number, Set<number>>();
  for (const w of wires) {
    const a = w[0], b = w[2];
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a)!.add(b);
    adj.get(b)!.add(a);
  }

  // For each station, BFS through wires to find connected signal combinator
  for (const ent of entities) {
    if (!ent.station || ent.entity_number == null) continue;
    const parsed = parseStationItem(ent.station);
    if (!parsed) continue;

    // Explicit station — no wire resolution needed
    if (parsed.name !== '*') {
      result.set(ent.entity_number, { name: parsed.name, type: parsed.type, direction: parsed.direction });
      continue;
    }

    // BFS to find connected signal combinator (usually 1-2 hops)
    const visited = new Set<number>([ent.entity_number]);
    const queue = [ent.entity_number];
    let resolved = false;
    while (queue.length > 0 && !resolved) {
      const cur = queue.shift()!;
      for (const neighbor of adj.get(cur) ?? []) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        if (signalCombinators.has(neighbor)) {
          const comb = entityMap.get(neighbor)!;
          const filters = comb.control_behavior?.sections?.sections?.[0]?.filters;
          const itemSignal = filters?.find(f => f.name !== 'signal-L' && f.name !== 'signal-P');
          if (itemSignal) {
            result.set(ent.entity_number, {
              name: itemSignal.name,
              type: itemSignal.type ?? 'item',
              direction: parsed.direction,
            });
            resolved = true;
            break;
          }
        }
        queue.push(neighbor);
      }
    }
  }

  return result;
}

interface RecipeGroup {
  factory: string;
  count: number;
  modules: { name: string; count: number } | null;
}

interface BoilerGroup {
  entityName: string;
  count: number;
  steamPerSec: number;   // per boiler
  waterPerSec: number;   // per boiler
  fuelName: string;
  fuelPerSec: number;    // per boiler
}

interface MinerGroup {
  entityName: string;
  count: number;
  products: { name: string; ratePerMiner: number }[];
  fluidInput?: { name: string; ratePerMiner: number };
}

/** Detect mining drills (no recipe, type="mining-drill").
 *  Infers which resource they mine by matching resource_categories with items consumed by block recipes.
 *  Rate = mining_speed / mining_time per drill. */
function detectMiners(
  data: PrototypeData,
  entities: BlueprintEntity[],
  recipeGroups: Map<string, RecipeGroup>,
): MinerGroup[] {
  const minerCounts = new Map<string, number>();
  for (const ent of entities) {
    if (ent.recipe) continue;
    const entity = data.entities[ent.name];
    if (!entity || entity.type !== 'mining-drill') continue;
    minerCounts.set(ent.name, (minerCounts.get(ent.name) ?? 0) + 1);
  }
  if (minerCounts.size === 0) return [];

  // Build set of items consumed and produced by block recipes
  const blockConsumed = new Set<string>();
  const blockProduced = new Set<string>();
  for (const [recipeName] of recipeGroups) {
    const recipe = data.recipes[recipeName];
    if (!recipe) continue;
    const ings = Array.isArray(recipe.ingredients) ? recipe.ingredients : Object.values(recipe.ingredients ?? {});
    for (const i of ings) blockConsumed.add(i.name);
    const prods = Array.isArray(recipe.products) ? recipe.products : Object.values(recipe.products ?? {});
    for (const p of prods) blockProduced.add(p.name);
  }

  // Build resource lookup: resource_category → resource entities
  const resourcesByCategory = new Map<string, any[]>();
  for (const entity of Object.values(data.entities)) {
    const e = entity as any;
    if (e.type !== 'resource' || !e.mineable_properties?.products) continue;
    const cat = e.resource_category;
    if (!cat) continue;
    if (!resourcesByCategory.has(cat)) resourcesByCategory.set(cat, []);
    resourcesByCategory.get(cat)!.push(e);
  }

  const result: MinerGroup[] = [];
  for (const [entityName, count] of minerCounts) {
    const entity = data.entities[entityName] as any;
    if (!entity) continue;
    const miningSpeed = entity.mining_speed ?? 1;
    const categories = entity.resource_categories ?? {};

    // Find matching resources whose products are consumed but NOT already produced by block recipes.
    // This distinguishes copper-ore (needs mining) from stone (produced by crushing).
    for (const cat of Object.keys(categories)) {
      const resources = resourcesByCategory.get(cat) ?? [];
      for (const resource of resources) {
        const mp = resource.mineable_properties;
        const products = Array.isArray(mp.products) ? mp.products : Object.values(mp.products ?? {});
        const hasUnmetDemand = products.some((p: any) => blockConsumed.has(p.name) && !blockProduced.has(p.name));
        if (!hasUnmetDemand) continue;

        const miningTime = mp.mining_time ?? 1;
        const ratePerMiner = miningSpeed / miningTime;

        const minerProducts = products.map((p: any) => ({
          name: p.name,
          ratePerMiner: ratePerMiner * (p.amount ?? 1),
        }));

        const group: MinerGroup = { entityName, count, products: minerProducts };

        // Check for required fluid (e.g., ore-aluminium needs coal-gas to mine)
        if (mp.required_fluid) {
          const fluidAmount = mp.fluid_amount ?? 10;
          group.fluidInput = {
            name: mp.required_fluid,
            ratePerMiner: ratePerMiner * fluidAmount / 10, // fluid_amount is per 10 mining operations
          };
        }

        result.push(group);
      }
    }
  }

  return result;
}

/** Detect furnaces (no recipe field, type="furnace").
 *  Infers recipe by matching furnace crafting_categories against recipes whose
 *  ingredients are available (produced by other block recipes or miners). */
function detectFurnaces(
  data: PrototypeData,
  entities: BlueprintEntity[],
  recipeGroups: Map<string, RecipeGroup>,
  miners: MinerGroup[],
  exportItems: Set<string>,
): void {
  // Group furnace entities by name
  const furnaceCounts = new Map<string, number>();
  for (const ent of entities) {
    if (ent.recipe) continue;
    const entity = data.entities[ent.name];
    if (!entity || entity.type !== 'furnace') continue;
    furnaceCounts.set(ent.name, (furnaceCounts.get(ent.name) ?? 0) + 1);
  }
  if (furnaceCounts.size === 0) return;

  // Build set of items produced and consumed by existing block recipes + miners
  const blockProduced = new Set<string>();
  const blockConsumed = new Set<string>();
  for (const [recipeName] of recipeGroups) {
    const recipe = data.recipes[recipeName];
    if (!recipe) continue;
    const prods = Array.isArray(recipe.products) ? recipe.products : Object.values(recipe.products ?? {});
    for (const p of prods) blockProduced.add(p.name);
    const ings = Array.isArray(recipe.ingredients) ? recipe.ingredients : Object.values(recipe.ingredients ?? {});
    for (const i of ings) blockConsumed.add(i.name);
  }
  for (const m of miners) {
    for (const p of m.products) blockProduced.add(p.name);
  }

  // Index recipes by category
  const recipesByCategory = new Map<string, any[]>();
  for (const recipe of Object.values(data.recipes)) {
    const r = recipe as any;
    const cat = r.category;
    if (!cat) continue;
    if (!recipesByCategory.has(cat)) recipesByCategory.set(cat, []);
    recipesByCategory.get(cat)!.push(r);
  }

  for (const [entityName, count] of furnaceCounts) {
    const entity = data.entities[entityName] as any;
    if (!entity) continue;
    const categories = entity.crafting_categories ?? {};

    // Find the best recipe for this furnace: must have all ingredients block-produced,
    // prefer recipes whose primary ingredient is a recipe product (not raw/mined).
    const recipeProduced = new Set<string>();
    for (const [recipeName] of recipeGroups) {
      const recipe = data.recipes[recipeName];
      if (!recipe) continue;
      const prods = Array.isArray(recipe.products) ? recipe.products : Object.values(recipe.products ?? {});
      for (const p of prods) recipeProduced.add(p.name);
    }

    // Skip void/incineration categories — these are waste disposal, not production
    const voidCategories = new Set(['py-incineration', 'py-runoff']);

    let bestRecipe: any = null;
    let bestScore = -1;
    for (const cat of Object.keys(categories)) {
      if (voidCategories.has(cat)) continue;
      const candidates = recipesByCategory.get(cat) ?? [];
      for (const recipe of candidates) {
        const ings = Array.isArray(recipe.ingredients) ? recipe.ingredients : Object.values(recipe.ingredients ?? {});
        if (ings.length === 0) continue;
        const allAvailable = (ings as any[]).every((i: any) => blockProduced.has(i.name));
        if (!allAvailable) continue;
        // Score: prefer recipes with more recipe-produced ingredients,
        // tiebreak by product having a station (export) or being consumed by block recipes
        const prods = Array.isArray(recipe.products) ? recipe.products : Object.values(recipe.products ?? {});
        const ingScore = (ings as any[]).filter((i: any) => recipeProduced.has(i.name)).length;
        const hasExportProduct = (prods as any[]).some((p: any) => exportItems.has(p.name)) ? 1000 : 0;
        const hasConsumedProduct = (prods as any[]).some((p: any) => blockConsumed.has(p.name)) ? 100 : 0;
        const score = ingScore + hasExportProduct + hasConsumedProduct;
        if (score > bestScore) {
          bestScore = score;
          bestRecipe = recipe;
        }
      }
    }

    if (bestRecipe) {
      const recipeName = bestRecipe.name;
      if (recipeGroups.has(recipeName)) {
        recipeGroups.get(recipeName)!.count += count;
      } else {
        recipeGroups.set(recipeName, {
          factory: entityName,
          count,
          modules: null,
        });
      }
      const prods = Array.isArray(bestRecipe.products) ? bestRecipe.products : Object.values(bestRecipe.products ?? {});
      for (const p of prods) blockProduced.add((p as any).name);
    }
  }
}

/** Detect fluid-burning boilers (no recipe, type="boiler", burns_fluid=true).
 *  Computes steam output and fuel consumption rates. */
function detectBoilers(
  data: PrototypeData,
  entities: BlueprintEntity[],
  recipeGroups: Map<string, RecipeGroup>,
): BoilerGroup[] {
  // Find boiler entities not already counted as recipe machines
  const recipeEntityNames = new Set<string>();
  for (const [, group] of recipeGroups) recipeEntityNames.add(group.factory);

  const boilerCounts = new Map<string, number>();
  for (const ent of entities) {
    if (ent.recipe) continue; // has a recipe → already handled
    const entity = data.entities[ent.name];
    if (!entity || entity.type !== 'boiler') continue;
    if (!entity.fluid_energy_source?.burns_fluid) continue;
    boilerCounts.set(ent.name, (boilerCounts.get(ent.name) ?? 0) + 1);
  }

  const result: BoilerGroup[] = [];
  const water = data.fluids['water'];
  const heatCap = water?.heat_capacity ?? 200;
  const defaultTemp = water?.default_temperature ?? 15;

  for (const [entityName, count] of boilerCounts) {
    const entity = data.entities[entityName];
    if (!entity) continue;

    const maxEnergy = entity.max_energy_usage?.normal ?? 0; // J/tick
    const effectivity = entity.fluid_energy_source?.effectivity ?? 1;
    const targetTemp = entity.target_temperature ?? 165;
    const deltaT = targetTemp - defaultTemp;

    if (maxEnergy <= 0 || deltaT <= 0) continue;

    const steamPerTick = maxEnergy / (heatCap * deltaT);
    const steamPerSec = steamPerTick * 60;
    const waterPerSec = steamPerSec; // 1:1 water→steam

    // Find fluid fuel: prefer fluids produced by recipes in this block
    const internalFluids = new Set<string>();
    for (const [recipeName] of recipeGroups) {
      const recipe = data.recipes[recipeName];
      if (!recipe) continue;
      const products = Array.isArray(recipe.products) ? recipe.products : Object.values(recipe.products ?? {});
      for (const p of products) {
        if (p.type === 'fluid' && data.fluids[p.name]?.fuel_value) {
          internalFluids.add(p.name);
        }
      }
    }

    // Check if a fuel's production chain depends on steam (boiler output) → cycle.
    // Returns true only if ALL production paths go through steam.
    // If at least one path avoids steam (e.g., coke from coal-gas, not pitch-refining), it's safe.
    const fuelCyclesThroughSteam = (fuelName: string): boolean => {
      const canProduceWithoutSteam = (item: string, visited: Set<string>): boolean => {
        if (item === 'steam') return false;
        if (visited.has(item)) return false;
        visited.add(item);
        const producers: any[] = [];
        for (const [rn] of recipeGroups) {
          const r = data.recipes[rn];
          if (!r) continue;
          const prods = Array.isArray(r.products) ? r.products : Object.values(r.products ?? {});
          if ((prods as any[]).some(p => p.name === item)) producers.push(r);
        }
        if (producers.length === 0) return true; // raw input
        for (const recipe of producers) {
          const ings = Array.isArray(recipe.ingredients) ? recipe.ingredients : Object.values(recipe.ingredients ?? {});
          if ((ings as any[]).some((i: any) => i.name === 'steam')) continue;
          const allOk = (ings as any[]).every((i: any) => canProduceWithoutSteam(i.name, new Set(visited)));
          if (allOk) return true;
        }
        return false;
      };
      return !canProduceWithoutSteam(fuelName, new Set());
    };

    let bestFuel: { name: string; perSec: number } | null = null;
    let bestCyclingFuel: { name: string; perSec: number } | null = null;
    // Prefer internally-produced fuels that DON'T cycle through steam
    for (const fluidName of internalFluids) {
      const fluid = data.fluids[fluidName];
      if (!fluid?.fuel_value) continue;
      const fuelPerTick = maxEnergy / (fluid.fuel_value * effectivity);
      const fuelPerSec = fuelPerTick * 60;
      if (fuelCyclesThroughSteam(fluidName)) {
        if (!bestCyclingFuel || fuelPerSec < bestCyclingFuel.perSec) {
          bestCyclingFuel = { name: fluid.name, perSec: fuelPerSec };
        }
      } else {
        if (!bestFuel || fuelPerSec < bestFuel.perSec) {
          bestFuel = { name: fluid.name, perSec: fuelPerSec };
        }
      }
    }
    // Fall back to cycling fuel if no non-cycling option (e.g., bp6 has electric boiler bootstrap)
    if (!bestFuel) bestFuel = bestCyclingFuel;
    // Last resort: any fluid fuel
    if (!bestFuel) {
      for (const fluid of Object.values(data.fluids)) {
        if (fluid.fuel_value && fluid.fuel_value > 0) {
          const fuelPerTick = maxEnergy / (fluid.fuel_value * effectivity);
          const fuelPerSec = fuelPerTick * 60;
          if (!bestFuel || fuelPerSec < bestFuel.perSec) {
            bestFuel = { name: fluid.name, perSec: fuelPerSec };
          }
        }
      }
    }

    if (!bestFuel) continue;

    result.push({
      entityName,
      count,
      steamPerSec,
      waterPerSec,
      fuelName: bestFuel.name,
      fuelPerSec: bestFuel.perSec,
    });
  }

  return result;
}

/** Compute steady-state rates by iteratively capping recipes at what their internal inputs can supply.
 *  Each machine runs at min(maxRate, available_input / demanded_input) — same as Factorio's behavior. */
function computeSteadyState(
  data: PrototypeData,
  recipeGroups: Map<string, RecipeGroup>,
  boilers: BoilerGroup[],
  miners: MinerGroup[],
  exportItems: Set<string>,
): Map<string, number> {
  // Build per-recipe data: max crafts/s, products, ingredients
  interface RecipeInfo {
    name: string;
    maxCraftsPerSec: number;
    products: { name: string; amount: number }[];
    ingredients: { name: string; amount: number }[];
  }

  const recipes: RecipeInfo[] = [];
  for (const [recipeName, group] of recipeGroups) {
    const recipe = data.recipes[recipeName];
    if (!recipe) continue;

    const speed = getEffectiveSpeed(data, group.factory, group.modules);
    const maxCrafts = (speed / recipe.energy) * group.count;

    const rawProducts = Array.isArray(recipe.products) ? recipe.products : Object.values(recipe.products ?? {});
    const products = rawProducts.map(p => {
      let amount = p.amount ?? ((p.amount_min ?? 0) + (p.amount_max ?? 0)) / 2;
      if (p.probability != null) amount *= p.probability;
      return { name: p.name, amount };
    });

    const rawIngs = Array.isArray(recipe.ingredients) ? recipe.ingredients : Object.values(recipe.ingredients ?? {});
    const ingredients = rawIngs.map(i => ({ name: i.name, amount: i.amount ?? 1 }));

    recipes.push({ name: recipeName, maxCraftsPerSec: maxCrafts, products, ingredients });
  }

  // Add boilers as synthetic recipes (maxCrafts=1, amounts = total rate for all boilers)
  for (const b of boilers) {
    recipes.push({
      name: `__boiler_${b.entityName}`,
      maxCraftsPerSec: 1,
      products: [{ name: 'steam', amount: b.steamPerSec * b.count }],
      ingredients: [
        { name: 'water', amount: b.waterPerSec * b.count },
        { name: b.fuelName, amount: b.fuelPerSec * b.count },
      ],
    });
  }

  // Add miners as synthetic recipes (maxCrafts=1, amounts = total rate for all drills)
  for (const m of miners) {
    const products = m.products.map(p => ({ name: p.name, amount: p.ratePerMiner * m.count }));
    const ingredients: { name: string; amount: number }[] = [];
    if (m.fluidInput) {
      ingredients.push({ name: m.fluidInput.name, amount: m.fluidInput.ratePerMiner * m.count });
    }
    recipes.push({
      name: `__miner_${m.entityName}_${m.products[0]?.name ?? 'unknown'}`,
      maxCraftsPerSec: 1,
      products,
      ingredients,
    });
  }

  // Identify which items are produced AND consumed internally (intermediates)
  const internallyProduced = new Set<string>();
  const internallyConsumed = new Set<string>();
  for (const r of recipes) {
    for (const p of r.products) internallyProduced.add(p.name);
    for (const ing of r.ingredients) internallyConsumed.add(ing.name);
  }
  const internalIntermediates = new Set<string>();
  for (const item of internallyProduced) {
    if (internallyConsumed.has(item)) internalIntermediates.add(item);
  }

  // Expand exportItems to protect all upstream intermediates on paths leading to exports.
  // This prevents bidirectional scaling from collapsing chains that feed stationed exports
  // (e.g., tar→pitch→creosote where creosote has a load station).
  const protectedItems = new Set(exportItems);
  let changed = true;
  while (changed) {
    changed = false;
    for (const r of recipes) {
      const producesProtected = r.products.some(p => protectedItems.has(p.name));
      if (!producesProtected) continue;
      for (const ing of r.ingredients) {
        if (!protectedItems.has(ing.name)) {
          protectedItems.add(ing.name);
          changed = true;
        }
      }
    }
  }

  // Identify void recipes (py-incineration, py-runoff, py-venting) — these are waste disposal
  // and should only consume leftover surplus, not compete with production recipes for supply.
  const voidCategories = new Set(['py-incineration', 'py-runoff', 'py-venting']);
  const voidRecipes = new Set<string>();
  for (const [recipeName] of recipeGroups) {
    const recipe = data.recipes[recipeName];
    if (recipe && voidCategories.has(recipe.category)) {
      voidRecipes.add(recipeName);
    }
  }

  // Iterative convergence: scale down over-consumers and over-producers.
  // Each iteration collects proposed rate caps per recipe, then applies the most
  // restrictive one. This avoids multiplicative double-application when a recipe
  // is constrained by both input supply and output demand in the same iteration.
  // Void recipes are excluded from convergence and sized to leftover surplus afterward.
  const rate = new Map<string, number>();
  for (const r of recipes) rate.set(r.name, voidRecipes.has(r.name) ? 0 : r.maxCraftsPerSec);

  for (let iter = 0; iter < 50; iter++) {
    let maxChange = 0;

    // Compute total production and consumption per item at current rates
    const produced = new Map<string, number>();
    const consumed = new Map<string, number>();
    for (const r of recipes) {
      const crafts = rate.get(r.name)!;
      for (const p of r.products) {
        produced.set(p.name, (produced.get(p.name) ?? 0) + crafts * p.amount);
      }
      for (const ing of r.ingredients) {
        consumed.set(ing.name, (consumed.get(ing.name) ?? 0) + crafts * ing.amount);
      }
    }

    // Collect proposed rate caps (minimum wins per recipe)
    const caps = new Map<string, number>();
    for (const r of recipes) caps.set(r.name, rate.get(r.name)!);

    for (const item of internalIntermediates) {
      const prod = produced.get(item) ?? 0;
      const cons = consumed.get(item) ?? 0;

      if (cons > prod + 0.001) {
        // Consumption exceeds production → cap consumers (export surplus handled post-convergence)
        const ratio = prod / cons;
        for (const r of recipes) {
          if (!r.ingredients.some(i => i.name === item)) continue;
          const proposed = Math.min(rate.get(r.name)! * ratio, r.maxCraftsPerSec);
          caps.set(r.name, Math.min(caps.get(r.name)!, proposed));
        }
      } else if (prod > cons + 0.001 && !protectedItems.has(item)) {
        // Production exceeds consumption for non-protected → cap producers
        // Only cap a recipe if ALL its consumed non-export products are overproduced.
        // Skip waste byproducts (zero consumers) — they don't constrain the recipe.
        for (const r of recipes) {
          if (!r.products.some(p => p.name === item)) continue;
          const consumedProducts = r.products.filter(p =>
            !protectedItems.has(p.name) && (consumed.get(p.name) ?? 0) > 0.001);
          if (consumedProducts.length === 0) continue; // all products are waste
          const allOverProduced = consumedProducts.every(p => {
            const pProd = produced.get(p.name) ?? 0;
            const pCons = consumed.get(p.name) ?? 0;
            return pProd > pCons + 0.001;
          });
          if (!allOverProduced) continue;
          const minRatio = Math.min(...consumedProducts
            .map(p => (consumed.get(p.name) ?? 0) / Math.max(produced.get(p.name) ?? 1, 0.001)));
          const proposed = Math.min(rate.get(r.name)! * minRatio, r.maxCraftsPerSec);
          caps.set(r.name, Math.min(caps.get(r.name)!, proposed));
        }
      }
    }

    // Apply the most restrictive cap per recipe
    for (const r of recipes) {
      const newRate = caps.get(r.name)!;
      const change = Math.abs(rate.get(r.name)! - newRate);
      if (change > maxChange) maxChange = change;
      rate.set(r.name, newRate);
    }

    if (maxChange < 0.0001) break;
  }

  // Fix self-reinforcing export cycles: when a recipe consumes an export item
  // but its outputs are all overproduced, cap it to match output demand.
  // Example: log→wood→seeds→seedlings→log cycle — log-wood-fast consumes the
  // export (log) and massively overproduces wood; cap it to what the seed chain needs.
  // Iterate: each cap + re-converge changes downstream demand, so repeat until stable.
  for (let cycleIter = 0; cycleIter < 20; cycleIter++) {
    const produced = new Map<string, number>();
    const consumed = new Map<string, number>();
    for (const r of recipes) {
      const crafts = rate.get(r.name)!;
      for (const p of r.products) produced.set(p.name, (produced.get(p.name) ?? 0) + crafts * p.amount);
      for (const ing of r.ingredients) consumed.set(ing.name, (consumed.get(ing.name) ?? 0) + crafts * ing.amount);
    }
    let cycleFixed = false;
    for (const r of recipes) {
      if (voidRecipes.has(r.name)) continue;
      const consumesExport = r.ingredients.some(i => exportItems.has(i.name));
      if (!consumesExport) continue;
      const consumedProducts = r.products.filter(p =>
        !exportItems.has(p.name) && (consumed.get(p.name) ?? 0) > 0.001);
      if (consumedProducts.length === 0) continue;
      // Only trigger when outputs are egregiously overproduced (>5x demand).
      // Mild overproduction (e.g., 1.5x steam from boilers) is normal and intentional.
      const allMassivelyOverProduced = consumedProducts.every(p => {
        const pProd = produced.get(p.name) ?? 0;
        const pCons = consumed.get(p.name) ?? 0;
        return pProd > pCons * 5;
      });
      if (!allMassivelyOverProduced) continue;
      const minRatio = Math.min(...consumedProducts.map(p =>
        (consumed.get(p.name) ?? 0) / Math.max(produced.get(p.name) ?? 1, 0.001)));
      const proposed = rate.get(r.name)! * minRatio;
      if (proposed < rate.get(r.name)! - 0.0001) {
        rate.set(r.name, proposed);
        cycleFixed = true;
      }
    }
    if (!cycleFixed) break;
    // Re-run convergence to propagate the cycle fix through the chain
    for (let iter = 0; iter < 50; iter++) {
      let maxChange = 0;
      const produced2 = new Map<string, number>();
      const consumed2 = new Map<string, number>();
      for (const r of recipes) {
        const crafts = rate.get(r.name)!;
        for (const p of r.products) produced2.set(p.name, (produced2.get(p.name) ?? 0) + crafts * p.amount);
        for (const ing of r.ingredients) consumed2.set(ing.name, (consumed2.get(ing.name) ?? 0) + crafts * ing.amount);
      }
      for (const item of internalIntermediates) {
        const prod = produced2.get(item) ?? 0;
        const cons = consumed2.get(item) ?? 0;
        if (cons > prod + 0.001) {
          // Forward: cap consumers when supply insufficient
          const ratio = prod / cons;
          for (const r of recipes) {
            if (!r.ingredients.some(i => i.name === item)) continue;
            const newRate = Math.min(rate.get(r.name)! * ratio, r.maxCraftsPerSec);
            const change = Math.abs(rate.get(r.name)! - newRate);
            if (change > maxChange) maxChange = change;
            rate.set(r.name, newRate);
          }
        } else if (prod > cons + 0.001 && !exportItems.has(item)) {
          // Bidirectional: cap overproducers of non-export cycle intermediates.
          // Safe here because this only runs after a cycle fix was applied.
          const consumedProducts2 = (r: typeof recipes[0]) => r.products.filter(p =>
            !exportItems.has(p.name) && (consumed2.get(p.name) ?? 0) > 0.001);
          for (const r of recipes) {
            if (!r.products.some(p => p.name === item)) continue;
            const cp = consumedProducts2(r);
            if (cp.length === 0) continue;
            const allOverProduced = cp.every(p => {
              const pProd = produced2.get(p.name) ?? 0;
              const pCons = consumed2.get(p.name) ?? 0;
              return pProd > pCons + 0.001;
            });
            if (!allOverProduced) continue;
            const minRatio = Math.min(...cp.map(p =>
              (consumed2.get(p.name) ?? 0) / Math.max(produced2.get(p.name) ?? 1, 0.001)));
            const newRate = rate.get(r.name)! * minRatio;
            const change = Math.abs(rate.get(r.name)! - newRate);
            if (change > maxChange) maxChange = change;
            rate.set(r.name, newRate);
          }
        }
      }
      if (maxChange < 0.0001) break;
    }
  }

  // Size void recipes to consume leftover surplus (waste disposal)
  if (voidRecipes.size > 0) {
    const produced = new Map<string, number>();
    const consumed = new Map<string, number>();
    for (const r of recipes) {
      const crafts = rate.get(r.name)!;
      for (const p of r.products) produced.set(p.name, (produced.get(p.name) ?? 0) + crafts * p.amount);
      for (const ing of r.ingredients) consumed.set(ing.name, (consumed.get(ing.name) ?? 0) + crafts * ing.amount);
    }
    for (const r of recipes) {
      if (!voidRecipes.has(r.name)) continue;
      // Rate limited by surplus of each ingredient and by max capacity
      let maxRate = r.maxCraftsPerSec;
      for (const ing of r.ingredients) {
        const surplus = (produced.get(ing.name) ?? 0) - (consumed.get(ing.name) ?? 0);
        if (surplus > 0 && ing.amount > 0) {
          maxRate = Math.min(maxRate, surplus / ing.amount);
        } else {
          maxRate = 0;
          break;
        }
      }
      rate.set(r.name, maxRate);
    }
  }

  return rate;
}

export function analyzeBlueprint(
  data: PrototypeData,
  entities: BlueprintEntity[],
  wires: number[][],
  name: string,
  time: number,
): BlockInventory {
  // Group recipe entities by recipe name, track factories and modules
  const recipeGroups = new Map<string, RecipeGroup>();

  for (const ent of entities) {
    if (!ent.recipe) continue;
    const recipe = data.recipes[ent.recipe];
    if (!recipe) continue;

    const key = ent.recipe;
    const existing = recipeGroups.get(key);
    const modules = countModules(ent);

    if (existing) {
      existing.count++;
      if (!existing.modules && modules) existing.modules = modules;
    } else {
      recipeGroups.set(key, { factory: ent.name, count: 1, modules });
    }
  }

  // Resolve stations early — needed to identify export items for steady-state
  const resolvedStations = resolveStationItems(entities, wires);
  const stationItems = new Map<string, 'load' | 'unload'>();
  const exportItems = new Set<string>();
  for (const [, info] of resolvedStations) {
    stationItems.set(info.name, info.direction);
    if (info.direction === 'load') exportItems.add(info.name);
  }

  // Detect fluid-burning boilers (no recipe, produce steam)
  const boilers = detectBoilers(data, entities, recipeGroups);

  // Detect mining drills (no recipe, produce ore)
  const miners = detectMiners(data, entities, recipeGroups);

  // Detect furnaces (no recipe field, infer from crafting categories + available inputs)
  detectFurnaces(data, entities, recipeGroups, miners, exportItems);

  // Compute steady-state rates (machines capped by internal supply)
  const steadyRates = computeSteadyState(data, recipeGroups, boilers, miners, exportItems);

  // Compute production/consumption at steady-state rates
  const produced = new Map<string, number>();
  const consumed = new Map<string, number>();
  const recipeResults: Record<string, { factory: string; count: number }> = {};
  let totalPowerMW = 0;

  for (const [recipeName, group] of recipeGroups) {
    const recipe = data.recipes[recipeName];
    if (!recipe) continue;

    const speed = getEffectiveSpeed(data, group.factory, group.modules);
    const crafts = steadyRates.get(recipeName) ?? 0;

    recipeResults[recipeName] = { factory: group.factory, count: group.count };

    const entity = data.entities[group.factory];
    if (entity?.energy_usage && !entity.burner_prototype) {
      const maxCrafts = (speed / recipe.energy) * group.count;
      const utilization = maxCrafts > 0 ? crafts / maxCrafts : 0;
      totalPowerMW += (entity.energy_usage * 60 * group.count * utilization) / 1_000_000;
    }

    const products = Array.isArray(recipe.products) ? recipe.products : Object.values(recipe.products ?? {});
    for (const prod of products) {
      let amount: number;
      if (prod.amount != null) {
        amount = prod.amount;
      } else if (prod.amount_min != null && prod.amount_max != null) {
        amount = (prod.amount_min + prod.amount_max) / 2;
      } else {
        amount = 1;
      }
      if (prod.probability != null) amount *= prod.probability;
      const rate = crafts * amount;
      produced.set(prod.name, (produced.get(prod.name) ?? 0) + rate);
    }

    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : Object.values(recipe.ingredients ?? {});
    for (const ing of ingredients) {
      const amount = ing.amount ?? 1;
      const rate = crafts * amount;
      consumed.set(ing.name, (consumed.get(ing.name) ?? 0) + rate);
    }
  }

  // Add boiler flows (steam produced, water + fuel consumed)
  for (const b of boilers) {
    const boilerRate = steadyRates.get(`__boiler_${b.entityName}`) ?? 0;
    produced.set('steam', (produced.get('steam') ?? 0) + boilerRate * b.steamPerSec * b.count);
    consumed.set('water', (consumed.get('water') ?? 0) + boilerRate * b.waterPerSec * b.count);
    consumed.set(b.fuelName, (consumed.get(b.fuelName) ?? 0) + boilerRate * b.fuelPerSec * b.count);
    recipeResults[`${b.entityName} (fluid burner)`] = { factory: b.entityName, count: b.count };
  }

  // Add miner flows (ore produced, fluid consumed if required)
  const minedItems = new Map<string, number>();
  for (const m of miners) {
    const minerKey = `__miner_${m.entityName}_${m.products[0]?.name ?? 'unknown'}`;
    const minerRate = steadyRates.get(minerKey) ?? 0;
    for (const p of m.products) {
      const totalRate = minerRate * p.ratePerMiner * m.count;
      produced.set(p.name, (produced.get(p.name) ?? 0) + totalRate);
      minedItems.set(p.name, (minedItems.get(p.name) ?? 0) + totalRate);
    }
    if (m.fluidInput) {
      consumed.set(m.fluidInput.name, (consumed.get(m.fluidInput.name) ?? 0) + minerRate * m.fluidInput.ratePerMiner * m.count);
    }
    const minerLabel = `${m.entityName} (mining ${m.products.map(p => p.name).join('+')})`;
    recipeResults[minerLabel] = { factory: m.entityName, count: m.count };
  }

  // Build stations map
  const stations: Record<string, 'load' | 'unload'> = {};
  for (const [, info] of resolvedStations) {
    stations[info.name] = info.direction;
  }

  // Classify items into exports/surplus/imports/intermediates/mined
  // exports = net-positive items WITH a load station (confirmed train export)
  // surplus = net-positive items WITHOUT a load station (voided, burned, recycled internally)
  const allItems = new Set([...produced.keys(), ...consumed.keys()]);

  const exports: Record<string, number> = {};
  const surplus: Record<string, number> = {};
  const imports: Record<string, number> = {};
  const mined: Record<string, number> = {};
  const intermediates: Record<string, number> = {};

  for (const item of allItems) {
    const prod = produced.get(item) ?? 0;
    const cons = consumed.get(item) ?? 0;
    const net = prod - cons;

    if (prod > 0 && cons > 0) {
      intermediates[item] = Math.min(prod, cons);
      if (net > 0.01) {
        if (exportItems.has(item)) {
          exports[item] = net;
        } else {
          surplus[item] = net;
        }
      } else if (net < -0.01) {
        imports[item] = Math.abs(net);
      }
    } else if (net > 0.01) {
      if (exportItems.has(item)) {
        exports[item] = net;
      } else {
        surplus[item] = net;
      }
    } else if (net < -0.01) {
      imports[item] = Math.abs(net);
    }
  }

  // Move mined items from imports to mined section
  for (const [item, rate] of minedItems) {
    if (item in imports) {
      // Miner produces some, but not enough — remainder is imported
      // Keep in imports, add to mined what's produced locally
    }
    mined[item] = rate;
  }

  return {
    name,
    count: 1,
    recipes: recipeResults,
    stations,
    exports: roundRates(exports),
    surplus: roundRates(surplus),
    imports: roundRates(imports),
    mined: roundRates(mined),
    intermediates: roundRates(intermediates),
    powerMW: Math.round(totalPowerMW * 100) / 100,
  };
}

function formatRate(rate: number): string {
  if (rate >= 10) return rate.toFixed(1);
  if (rate >= 1) return rate.toFixed(2);
  return rate.toFixed(3);
}

/** Round a rate map's values to avoid floating point noise in JSON */
function roundRates(map: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [k, v] of Object.entries(map)) {
    result[k] = Math.round(v * 1000) / 1000;
  }
  return result;
}

function printInventory(inv: BlockInventory) {
  console.log(`\nBlock: ${inv.name}${inv.count > 1 ? ` (×${inv.count})` : ''}`);
  console.log();

  // Recipe table
  const rows = Object.entries(inv.recipes).map(([name, r]) => ({
    recipe: name,
    factory: r.factory,
    count: r.count.toString(),
  }));

  const rW = Math.max(6, ...rows.map(r => r.recipe.length));
  const fW = Math.max(7, ...rows.map(r => r.factory.length));
  const cW = Math.max(5, ...rows.map(r => r.count.length));

  const line = (l: string, m: string, r: string) =>
    `${l}${'─'.repeat(rW + 2)}${m}${'─'.repeat(fW + 2)}${m}${'─'.repeat(cW + 2)}${r}`;
  const row = (recipe: string, factory: string, count: string) =>
    `│ ${recipe.padEnd(rW)} │ ${factory.padEnd(fW)} │ ${count.padStart(cW)} │`;

  console.log(line('┌', '┬', '┐'));
  console.log(row('Recipe', 'Factory', 'Count'));
  console.log(line('├', '┼', '┤'));
  for (const r of rows) console.log(row(r.recipe, r.factory, r.count));
  console.log(line('└', '┴', '┘'));

  const totalBuildings = Object.values(inv.recipes).reduce((s, r) => s + r.count, 0);
  const powerStr = inv.powerMW >= 1
    ? `${inv.powerMW.toFixed(2)} MW`
    : `${(inv.powerMW * 1000).toFixed(1)} kW`;
  console.log(`\n${totalBuildings} buildings, ${powerStr} electric`);

  const fmtItems = (items: Record<string, number>) =>
    Object.entries(items).sort(([,a], [,b]) => b - a).map(([n, r]) => `${n}: ${formatRate(r)}/s`).join(', ');

  // Exports (only items with load stations)
  if (Object.keys(inv.exports).length > 0) {
    console.log('\nExports:');
    console.log('  ' + fmtItems(inv.exports));
  }

  // Surplus (net-positive items without load stations — voided, burned, recycled)
  if (Object.keys(inv.surplus).length > 0) {
    console.log('\nSurplus:');
    console.log('  ' + fmtItems(inv.surplus));
  }

  // Mined
  if (Object.keys(inv.mined).length > 0) {
    console.log('\nMined:');
    console.log('  ' + fmtItems(inv.mined));
  }

  // Imports
  if (Object.keys(inv.imports).length > 0) {
    console.log('\nImports:');
    console.log('  ' + fmtItems(inv.imports));
  }

  // Intermediates
  if (Object.keys(inv.intermediates).length > 0) {
    console.log('\nIntermediates:');
    console.log('  ' + fmtItems(inv.intermediates));
  }

  console.log();
}

export function inventoryCommand(protoPath: string, options: InventoryOptions) {
  const data = loadPrototypes(protoPath);
  const time = parseInt(options.time ?? '1', 10);

  if (options.save && !options.name) {
    console.error('Error: --name is required when using --save');
    process.exit(1);
  }

  const inventories: BlockInventory[] = [];

  for (const bpPath of options.blueprint) {
    try {
      const { entities, wires } = decodeBlueprintFile(bpPath);
      const blockName = options.name ?? bpPath;
      const inv = analyzeBlueprint(data, entities, wires, blockName, time);
      inventories.push(inv);
    } catch (err: any) {
      console.error(`Error processing ${bpPath}: ${err.message}`);
    }
  }

  if (options.json) {
    console.log(JSON.stringify(inventories, null, 2));
    return;
  }

  for (const inv of inventories) {
    printInventory(inv);
  }

  if (options.save && inventories.length > 0) {
    const __dirname = dirname(resolve(protoPath));
    const savePath = resolve(__dirname, 'saves', `${options.save}.json`);

    // Append/update: read existing save, replace by name or append
    let existing: BlockInventory[] = [];
    try {
      existing = JSON.parse(readFileSync(savePath, 'utf8'));
    } catch { /* file doesn't exist yet */ }

    for (const inv of inventories) {
      const idx = existing.findIndex(e => e.name === inv.name);
      if (idx >= 0) {
        existing[idx] = inv;
      } else {
        existing.push(inv);
      }
    }

    writeFileSync(savePath, JSON.stringify(existing, null, 2));
    console.log(`Saved "${options.name}" to ${savePath} (${existing.length} blocks total)`);
  }
}
