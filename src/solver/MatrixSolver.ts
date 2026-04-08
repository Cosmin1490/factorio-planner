/**
 * TypeScript reimplementation of the Helmod production solver.
 *
 * Solves for factory counts given a set of recipes and a production target,
 * using Gaussian elimination on a recipe/item coefficient matrix.
 */

import type { PrototypeData, Recipe, Entity, Item, RecipeElement } from '../data/PrototypeLoader.js';
import { computeEffects, effectiveSpeed, effectiveProductivity } from './ModuleEffects.js';
import { ItemState, type SolveInput, type SolveResult, type RecipeResult, type ItemFlow, type EffectTotals } from './types.js';

/** Resolved fuel info for a burner factory */
interface FuelInfo {
  item: Item;
  fuelValue: number;       // joules per unit
  burntResult?: string;    // item name of burnt result (e.g., "ash")
}

/** Column in the solver matrix — represents one item/fluid flow */
interface MatrixColumn {
  key: string;        // unique key: "name:type" or "name:type:temp"
  name: string;
  type: 'item' | 'fluid';
  temperature?: number;
  state: ItemState;
}

/** Row metadata — represents one recipe */
interface MatrixRow {
  recipeName: string;
  factoryName: string;
  factoryCount: number;
  effectiveSpeed: number;
  effects: EffectTotals;
}

/**
 * Build a unique key for an item/fluid. Fluids with temperature get a suffix.
 */
function itemKey(el: RecipeElement): string {
  if (el.type === 'fluid' && el.temperature != null) {
    return `${el.name}:${el.type}:${el.temperature}`;
  }
  return `${el.name}:${el.type}`;
}

/**
 * Get effective amount for a recipe element, accounting for probability and extra_count_fraction.
 */
function elementAmount(el: RecipeElement): number {
  const base = el.amount ?? ((el.amount_min ?? 0) + (el.amount_max ?? 0)) / 2;
  const prob = el.probability ?? 1;
  const extra = el.extra_count_fraction ?? 0;
  return base * prob + extra;
}

/**
 * Classify items as intermediate (state=0), output (state=1), or input (state=2).
 * An item that appears as both a product and an ingredient across the block's recipes
 * is an intermediate — the solver should link production to consumption internally.
 *
 * extraProduced/extraConsumed account for non-recipe flows like fuel and burnt results.
 */
function classifyItems(
  recipes: Recipe[],
  extraProduced: Set<string>,
  extraConsumed: Set<string>,
): Map<string, { name: string; type: 'item' | 'fluid'; temperature?: number; state: ItemState }> {
  const producedBy = new Set<string>(extraProduced);
  const consumedBy = new Set<string>(extraConsumed);

  for (const recipe of recipes) {
    const products = Array.isArray(recipe.products) ? recipe.products : [];
    for (const p of products) {
      producedBy.add(itemKey(p));
    }
    for (const ing of recipe.ingredients) {
      consumedBy.add(`${ing.name}:${ing.type}`);
    }
  }

  const result = new Map<string, { name: string; type: 'item' | 'fluid'; temperature?: number; state: ItemState }>();

  // Helper to add an item with proper classification
  function addItem(name: string, type: 'item' | 'fluid', temperature?: number) {
    const key = temperature != null ? `${name}:${type}:${temperature}` : `${name}:${type}`;
    if (result.has(key)) return;
    const baseKey = `${name}:${type}`;
    const isIntermediate = producedBy.has(baseKey) && consumedBy.has(baseKey);
    const isProduced = producedBy.has(key) || producedBy.has(baseKey);
    result.set(key, {
      name,
      type,
      temperature,
      state: isIntermediate ? ItemState.Intermediate : (isProduced ? ItemState.Output : ItemState.Input),
    });
  }

  for (const recipe of recipes) {
    const products = Array.isArray(recipe.products) ? recipe.products : [];
    for (const p of products) addItem(p.name, p.type, p.temperature);
    for (const ing of recipe.ingredients) addItem(ing.name, ing.type);
  }

  // Add fuel/burnt result items
  for (const key of extraConsumed) {
    const [name, type] = key.split(':');
    addItem(name, type as 'item' | 'fluid');
  }
  for (const key of extraProduced) {
    const [name, type] = key.split(':');
    addItem(name, type as 'item' | 'fluid');
  }

  return result;
}

/**
 * Resolve fuel for a burner factory. If no fuel is specified, pick the first
 * available fuel from the item list matching the burner's fuel categories.
 */
function resolveFuel(
  data: PrototypeData,
  factory: Entity,
  fuelName?: string,
): FuelInfo | null {
  const burner = factory.burner_prototype;
  if (!burner) return null;

  if (fuelName) {
    const item = data.items[fuelName];
    if (!item?.fuel_value) throw new Error(`"${fuelName}" is not a valid fuel item`);
    return { item, fuelValue: item.fuel_value, burntResult: item.burnt_result?.name };
  }

  // Auto-pick: find a fuel item matching the burner's categories
  // Prefer coal as a common default
  const fuelCategories = burner.fuel_categories;
  for (const name of ['coal', 'wood', 'solid-fuel']) {
    const item = data.items[name];
    if (item?.fuel_value && item.fuel_category && fuelCategories[item.fuel_category]) {
      return { item, fuelValue: item.fuel_value, burntResult: item.burnt_result?.name };
    }
  }

  // Fall back to any matching fuel
  for (const item of Object.values(data.items)) {
    if (item.fuel_value && item.fuel_category && fuelCategories[item.fuel_category]) {
      return { item, fuelValue: item.fuel_value, burntResult: item.burnt_result?.name };
    }
  }

  return null;
}

export function solve(data: PrototypeData, input: SolveInput): SolveResult {
  const { time } = input;

  // Resolve recipes, factories, and fuel
  const resolvedRecipes: { recipe: Recipe; factory: Entity; row: MatrixRow; fuel: FuelInfo | null }[] = [];
  for (const spec of input.recipes) {
    const recipe = data.recipes[spec.recipeName];
    if (!recipe) throw new Error(`Recipe "${spec.recipeName}" not found`);
    const factory = data.entities[spec.factoryName];
    if (!factory) throw new Error(`Factory "${spec.factoryName}" not found`);

    const effects = computeEffects(
      data.items,
      data.entities,
      recipe,
      factory,
      spec.modules ?? [],
      spec.beacons ?? [],
    );

    const speed = effectiveSpeed(factory, effects, spec.factoryQuality);
    const fuel = resolveFuel(data, factory, spec.fuel);

    resolvedRecipes.push({
      recipe,
      factory,
      fuel,
      row: {
        recipeName: spec.recipeName,
        factoryName: spec.factoryName,
        factoryCount: 0,
        effectiveSpeed: speed,
        effects,
      },
    });
  }

  // Step 1: Classify items (including fuel/burnt result items)
  const extraProduced = new Set<string>();
  const extraConsumed = new Set<string>();
  for (const { fuel } of resolvedRecipes) {
    if (fuel) {
      extraConsumed.add(`${fuel.item.name}:item`);
      if (fuel.burntResult) {
        extraProduced.add(`${fuel.burntResult}:item`);
      }
    }
  }
  const itemClassification = classifyItems(resolvedRecipes.map(r => r.recipe), extraProduced, extraConsumed);

  // Step 2: Build column index
  const columns: MatrixColumn[] = [];
  const colIndex = new Map<string, number>();

  for (const [key, info] of itemClassification) {
    colIndex.set(key, columns.length);
    columns.push({ key, name: info.name, type: info.type, temperature: info.temperature, state: info.state });
  }

  const numRows = resolvedRecipes.length;
  const numCols = columns.length;

  // Step 3: Build coefficient matrix
  // matrix[row][col] = rate of item flow per factory for this recipe
  // Positive = production, Negative = consumption
  const matrix: number[][] = [];
  for (let r = 0; r < numRows; r++) {
    matrix[r] = new Array(numCols).fill(0);
    const { recipe, row } = resolvedRecipes[r];
    const productivity = effectiveProductivity(row.effects);

    // Recipe cycle time and cycles per time base
    const cycleTime = recipe.energy / row.effectiveSpeed;
    const cyclesPerTime = time / cycleTime;

    // Products (positive flow)
    const products = Array.isArray(recipe.products) ? recipe.products : [];
    for (const p of products) {
      const key = itemKey(p);
      const ci = colIndex.get(key);
      if (ci != null) {
        matrix[r][ci] += elementAmount(p) * productivity * cyclesPerTime;
      }
    }

    // Ingredients (negative flow)
    for (const ing of recipe.ingredients) {
      const key = `${ing.name}:${ing.type}`;
      const ci = colIndex.get(key);
      if (ci != null) {
        matrix[r][ci] -= elementAmount(ing) * cyclesPerTime;
      }
    }

    // Fuel consumption and burnt result for burner factories
    const { fuel, factory } = resolvedRecipes[r];
    if (fuel) {
      const burner = factory.burner_prototype!;
      const consumptionEffect = 1 + row.effects.consumption;
      // Energy per recipe cycle (joules) = energy_usage (watts) × cycle_time (seconds)
      const energyPerCycle = (factory.energy_usage ?? 0) * (recipe.energy / row.effectiveSpeed) * consumptionEffect;
      // Fuel units per cycle = energy per cycle / (fuel_value × burner effectivity)
      const fuelPerCycle = energyPerCycle / (fuel.fuelValue * burner.effectivity);
      const fuelPerTime = fuelPerCycle * cyclesPerTime;

      // Fuel consumed (negative flow)
      const fuelCol = colIndex.get(`${fuel.item.name}:item`);
      if (fuelCol != null) {
        matrix[r][fuelCol] -= fuelPerTime;
      }

      // Burnt result produced (positive flow, 1:1 with fuel consumed)
      if (fuel.burntResult) {
        const burntCol = colIndex.get(`${fuel.burntResult}:item`);
        if (burntCol != null) {
          matrix[r][burntCol] += fuelPerTime;
        }
      }
    }
  }

  // TODO: Temperature-linked fluid conversion rows would be inserted here.
  // For fluids that exist at different temperatures, synthetic conversion rows
  // allow the solver to route between compatible temperature variants.
  // See: Helmod SolverLinkedMatrix.lua linkTemperatureFluid()

  // Step 4: Z-row (objective/demand vector)
  // Z[col] tracks remaining demand. Negative = demand, positive = surplus.
  const Z = new Array(numCols).fill(0);

  if (input.target) {
    // Find the target column
    const targetKey = `${input.target.name}:item`;
    let targetCol = colIndex.get(targetKey);
    if (targetCol == null) {
      // Try as fluid
      const fluidKey = `${input.target.name}:fluid`;
      targetCol = colIndex.get(fluidKey);
    }
    if (targetCol == null) {
      throw new Error(`Target "${input.target.name}" not found in recipe products/ingredients`);
    }
    Z[targetCol] = -input.target.amount;
  }

  // Step 5: Gaussian elimination (multi-pass)
  // Process recipes repeatedly until all satisfiable demands are met.
  // A single pass may not suffice because downstream recipes create demand
  // for upstream recipes that were processed earlier in the same pass.
  const recipeCounts: number[] = new Array(numRows).fill(0);
  const maxPasses = numRows + 1;

  for (let pass = 0; pass < maxPasses; pass++) {
    let changed = false;

    for (let r = 0; r < numRows; r++) {
      // Find best pivot column: the column with the most unsatisfied demand
      // that this recipe can produce.
      let bestCol = -1;
      let bestRatio = 0;

      for (let c = 0; c < numCols; c++) {
        const production = matrix[r][c]; // how much this recipe produces per factory
        if (production <= 0) continue;    // can't produce this item

        const demand = -Z[c];            // positive = unsatisfied demand
        if (demand <= 1e-9) continue;     // no demand for this item

        const ratio = demand / production;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestCol = c;
        }
      }

      if (bestCol < 0) continue; // recipe doesn't satisfy any demand

      // Scale factor: how many factories of this recipe do we need?
      const production = matrix[r][bestCol];
      const demand = -Z[bestCol];
      const scale = demand / production;

      recipeCounts[r] += scale;
      changed = true;

      // Update Z-row: subtract this recipe's contributions (scaled)
      for (let c = 0; c < numCols; c++) {
        Z[c] += matrix[r][c] * scale;
      }
    }

    if (!changed) break;
  }

  // Step 6: Compute actual production/consumption totals per column
  const totalProduction = new Array(numCols).fill(0);
  const totalConsumption = new Array(numCols).fill(0);
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const flow = matrix[r][c] * recipeCounts[r];
      if (flow > 0) totalProduction[c] += flow;
      else totalConsumption[c] += -flow;
    }
  }

  // Step 7: Extract results
  const recipeResults: RecipeResult[] = [];
  for (let r = 0; r < numRows; r++) {
    const { row } = resolvedRecipes[r];
    recipeResults.push({
      recipeName: row.recipeName,
      factoryName: row.factoryName,
      factoryCount: recipeCounts[r],
      effectiveSpeed: row.effectiveSpeed,
      energyUsage: 0, // TODO: compute from factory energy × consumption effect
    });
  }

  const products: ItemFlow[] = [];
  const ingredients: ItemFlow[] = [];
  const intermediates: ItemFlow[] = [];

  for (let c = 0; c < numCols; c++) {
    const col = columns[c];

    if (col.state === ItemState.Intermediate) {
      // For intermediates, check if there's a net surplus or deficit
      const net = totalProduction[c] - totalConsumption[c];
      if (Math.abs(net) < 0.0001) continue; // perfectly balanced, true intermediate
      // Unbalanced intermediate — show surplus as output, deficit as input
      const flow: ItemFlow = { name: col.name, type: col.type, amount: Math.abs(net), state: col.state };
      if (net > 0) {
        flow.state = ItemState.Output;
        products.push(flow);
      } else {
        flow.state = ItemState.Input;
        ingredients.push(flow);
      }
    } else if (col.state === ItemState.Output) {
      // Output items: report total production
      if (totalProduction[c] > 0.0001) {
        products.push({ name: col.name, type: col.type, amount: totalProduction[c], state: col.state });
      }
    } else {
      // Input items: report total consumption
      if (totalConsumption[c] > 0.0001) {
        ingredients.push({ name: col.name, type: col.type, amount: totalConsumption[c], state: col.state });
      }
    }
  }

  return { recipes: recipeResults, products, ingredients, intermediates };
}
