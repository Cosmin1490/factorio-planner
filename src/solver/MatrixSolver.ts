/**
 * TypeScript reimplementation of the Helmod production solver.
 *
 * Supports two solver algorithms:
 * - Algebraic: greedy multi-pass Gaussian elimination (fast, handles most linear chains)
 * - Simplex: tableau pivoting with artificial variables (handles cyclic/over-determined systems)
 *
 * Matrix layout: rows = recipes, columns = items/fluids.
 * Positive coefficients = production, negative = consumption.
 */

import type { PrototypeData, Recipe, Entity, Item, RecipeElement } from '../data/PrototypeLoader.js';
import { computeEffects, effectiveSpeed, effectiveProductivity } from './ModuleEffects.js';
import { ItemState, type SolveInput, type SolveResult, type RecipeResult, type ItemFlow, type IntermediateDetail, type EffectTotals, type ConstraintSpec } from './types.js';

// ── Internal types ──────────────────────────────────────────────────────────

interface FuelInfo {
  item: Item;
  fuelValue: number;
  burntResult?: string;
}

interface MatrixColumn {
  key: string;
  name: string;
  type: 'item' | 'fluid';
  temperature?: number;
  state: ItemState;
}

interface ResolvedRecipe {
  recipe: Recipe;
  factory: Entity;
  fuel: FuelInfo | null;
  recipeName: string;
  factoryName: string;
  effectiveSpeed: number;
  effects: EffectTotals;
}

/** The constructed matrix + metadata, ready for a solver to consume */
interface SolverMatrix {
  matrix: number[][];
  columns: MatrixColumn[];
  colIndex: Map<string, number>;
  resolved: ResolvedRecipe[];
  Z: number[];
  numRows: number;
  numCols: number;
  itemCosts: number[];
  itemDepths: number[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function itemKey(el: RecipeElement): string {
  if (el.type === 'fluid' && el.temperature != null) {
    return `${el.name}:${el.type}:${el.temperature}`;
  }
  return `${el.name}:${el.type}`;
}

function elementAmount(el: RecipeElement): number {
  const base = el.amount ?? ((el.amount_min ?? 0) + (el.amount_max ?? 0)) / 2;
  const prob = el.probability ?? 1;
  const extra = el.extra_count_fraction ?? 0;
  return base * prob + extra;
}

/**
 * Identify fluids where at least one consumer has explicit temperature constraints.
 * Only these fluids need temp-specific matrix columns; others share one column.
 */
function findTempConstrainedFluids(recipes: Recipe[]): Set<string> {
  const result = new Set<string>();
  for (const recipe of recipes) {
    const ings = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    for (const ing of ings) {
      if (ing.type === 'fluid' && (ing.minimum_temperature != null || ing.maximum_temperature != null)) {
        result.add(ing.name);
      }
    }
  }
  return result;
}

function classifyItems(
  recipes: Recipe[],
  extraProduced: Set<string>,
  extraConsumed: Set<string>,
  tempConstrainedFluids: Set<string>,
): Map<string, { name: string; type: 'item' | 'fluid'; temperature?: number; state: ItemState }> {
  const producedBy = new Set<string>(extraProduced);
  const consumedBy = new Set<string>(extraConsumed);

  for (const recipe of recipes) {
    const products = Array.isArray(recipe.products) ? recipe.products : [];
    for (const p of products) {
      // Only use temp-specific keys for fluids with temp-constrained consumers
      if (p.type === 'fluid' && p.temperature != null && tempConstrainedFluids.has(p.name)) {
        producedBy.add(itemKey(p));
      } else {
        producedBy.add(`${p.name}:${p.type}`);
      }
    }
    const ings = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    for (const ing of ings) consumedBy.add(`${ing.name}:${ing.type}`);
  }

  const result = new Map<string, { name: string; type: 'item' | 'fluid'; temperature?: number; state: ItemState }>();

  function addItem(name: string, type: 'item' | 'fluid', temperature?: number) {
    // Only create temp-specific columns for fluids with temp-constrained consumers
    const useTemp = type === 'fluid' && temperature != null && tempConstrainedFluids.has(name);
    const key = useTemp ? `${name}:${type}:${temperature}` : `${name}:${type}`;
    if (result.has(key)) return;
    const baseKey = `${name}:${type}`;
    const isConsumed = consumedBy.has(key) || consumedBy.has(baseKey);
    const isProduced = producedBy.has(key) || producedBy.has(baseKey);
    result.set(key, {
      name, type, temperature: useTemp ? temperature : undefined,
      state: (isProduced && isConsumed) ? ItemState.Intermediate : (isProduced ? ItemState.Output : ItemState.Input),
    });
  }

  for (const recipe of recipes) {
    const products = Array.isArray(recipe.products) ? recipe.products : [];
    for (const p of products) addItem(p.name, p.type, p.temperature);
    const ings2 = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    for (const ing of ings2) addItem(ing.name, ing.type);
  }
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

function resolveFuel(data: PrototypeData, factory: Entity, fuelName?: string): FuelInfo | null {
  const burner = factory.burner_prototype;
  if (!burner) return null;

  if (fuelName) {
    const item = data.items[fuelName];
    if (!item?.fuel_value) throw new Error(`"${fuelName}" is not a valid fuel item`);
    return { item, fuelValue: item.fuel_value, burntResult: item.burnt_result?.name };
  }

  const fuelCategories = burner.fuel_categories;
  for (const name of ['coal', 'wood', 'solid-fuel']) {
    const item = data.items[name];
    if (item?.fuel_value && item.fuel_category && fuelCategories[item.fuel_category]) {
      return { item, fuelValue: item.fuel_value, burntResult: item.burnt_result?.name };
    }
  }
  for (const item of Object.values(data.items)) {
    if (item.fuel_value && item.fuel_category && fuelCategories[item.fuel_category]) {
      return { item, fuelValue: item.fuel_value, burntResult: item.burnt_result?.name };
    }
  }
  return null;
}

function findColumn(colIndex: Map<string, number>, name: string): number | null {
  return colIndex.get(`${name}:item`) ?? colIndex.get(`${name}:fluid`) ?? null;
}

/**
 * Find the column for a fluid ingredient, respecting temperature constraints.
 * Only does temp-aware matching when the ingredient has explicit min/max temperature.
 * For unconstrained ingredients, uses the base no-temp column.
 */
function findIngredientColumn(
  colIndex: Map<string, number>,
  ing: RecipeElement,
): number | null {
  // For items, exact match only
  if (ing.type !== 'fluid') {
    return colIndex.get(`${ing.name}:${ing.type}`) ?? null;
  }

  // Only do temp-aware matching when the ingredient has explicit temperature constraints
  const hasTempConstraint = ing.minimum_temperature != null || ing.maximum_temperature != null;
  if (hasTempConstraint) {
    const minT = ing.minimum_temperature ?? -Infinity;
    const maxT = ing.maximum_temperature ?? Infinity;
    let bestCol: number | null = null;
    let bestTemp = Infinity;

    for (const [key, idx] of colIndex) {
      if (!key.startsWith(`${ing.name}:fluid:`)) continue;
      const temp = parseFloat(key.split(':')[2]);
      if (temp < minT || temp > maxT) continue;
      if (temp < bestTemp) {
        bestTemp = temp;
        bestCol = idx;
      }
    }
    if (bestCol != null) return bestCol;
  }

  // Fall back to no-temp column
  return colIndex.get(`${ing.name}:fluid`) ?? null;
}

/**
 * Compute BFS depth from raw inputs for each item column.
 * Used by both the legacy simplex (item costs) and LP simplex (recipe costs).
 */
function computeItemDepths(
  columns: MatrixColumn[],
  matrix: number[][],
  numRows: number,
  numCols: number,
): number[] {
  const depth = new Array(numCols).fill(Infinity);
  for (let c = 0; c < numCols; c++) {
    if (columns[c].state === ItemState.Input) depth[c] = 0;
  }

  // Iterative relaxation: product depth = max(ingredient depths) + 1
  for (let iter = 0; iter < numCols; iter++) {
    let changed = false;
    for (let r = 0; r < numRows; r++) {
      let maxIngDepth = -1;
      for (let c = 0; c < numCols; c++) {
        if (matrix[r][c] < 0 && depth[c] < Infinity) {
          maxIngDepth = Math.max(maxIngDepth, depth[c]);
        }
      }
      if (maxIngDepth < 0) continue;
      const prodDepth = maxIngDepth + 1;
      for (let c = 0; c < numCols; c++) {
        if (matrix[r][c] > 0 && prodDepth < depth[c]) {
          depth[c] = prodDepth;
          changed = true;
        }
      }
    }
    if (!changed) break;
  }

  return depth;
}

/** Shallow = high weight (preferred), deep = low weight. Used by legacy simplex pivot. */
function computeItemCosts(depths: number[]): number[] {
  return depths.map(d => d === Infinity ? 0.01 : 1 / (1 + d));
}

/**
 * Compute per-recipe cost for LP objective: minimize sum(recipeCost_r * x_r).
 * Cost = 1 + max depth of any product. Deep recipes are expensive → LP avoids scaling them.
 */
function computeRecipeCosts(
  depths: number[],
  matrix: number[][],
  numRows: number,
  numCols: number,
): number[] {
  const costs = new Array(numRows).fill(1);
  for (let r = 0; r < numRows; r++) {
    let maxProductDepth = 0;
    for (let c = 0; c < numCols; c++) {
      if (matrix[r][c] > 0 && depths[c] < Infinity) {
        maxProductDepth = Math.max(maxProductDepth, depths[c]);
      }
    }
    costs[r] = 1 + maxProductDepth;
  }
  return costs;
}

// ── Matrix construction ─────────────────────────────────────────────────────

function buildMatrix(data: PrototypeData, input: SolveInput): SolverMatrix {
  const { time } = input;

  // Resolve recipes, factories, and fuel
  const resolved: ResolvedRecipe[] = [];
  for (const spec of input.recipes) {
    const recipe = data.recipes[spec.recipeName];
    if (!recipe) throw new Error(`Recipe "${spec.recipeName}" not found`);
    const factory = data.entities[spec.factoryName];
    if (!factory) throw new Error(`Factory "${spec.factoryName}" not found`);

    const effects = computeEffects(data.items, data.entities, recipe, factory, spec.modules ?? [], spec.beacons ?? []);
    const speed = effectiveSpeed(factory, effects, spec.factoryQuality);
    const fuel = resolveFuel(data, factory, spec.fuel);

    resolved.push({ recipe, factory, fuel, recipeName: spec.recipeName, factoryName: spec.factoryName, effectiveSpeed: speed, effects });
  }

  // Classify items
  const extraProduced = new Set<string>();
  const extraConsumed = new Set<string>();
  for (const { fuel } of resolved) {
    if (fuel) {
      extraConsumed.add(`${fuel.item.name}:item`);
      if (fuel.burntResult) extraProduced.add(`${fuel.burntResult}:item`);
    }
  }
  const tempConstrainedFluids = findTempConstrainedFluids(resolved.map(r => r.recipe));
  const itemClassification = classifyItems(resolved.map(r => r.recipe), extraProduced, extraConsumed, tempConstrainedFluids);

  // Build column index
  const columns: MatrixColumn[] = [];
  const colIndex = new Map<string, number>();
  for (const [key, info] of itemClassification) {
    colIndex.set(key, columns.length);
    columns.push({ key, name: info.name, type: info.type, temperature: info.temperature, state: info.state });
  }

  const numRows = resolved.length;
  const numCols = columns.length;

  // Build coefficient matrix
  const matrix: number[][] = [];
  for (let r = 0; r < numRows; r++) {
    matrix[r] = new Array(numCols).fill(0);
    const { recipe, factory, fuel, effectiveSpeed: speed, effects } = resolved[r];
    const productivity = effectiveProductivity(effects);
    const cycleTime = recipe.energy / speed;
    const cyclesPerTime = time / cycleTime;

    const products = Array.isArray(recipe.products) ? recipe.products : [];
    for (const p of products) {
      // Only use temp-specific key for fluids with temp-constrained consumers
      const useTemp = p.type === 'fluid' && p.temperature != null && tempConstrainedFluids.has(p.name);
      const pKey = useTemp ? itemKey(p) : `${p.name}:${p.type}`;
      const ci = colIndex.get(pKey);
      if (ci != null) matrix[r][ci] += elementAmount(p) * productivity * cyclesPerTime;
    }
    const matIngs = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    for (const ing of matIngs) {
      const ci = findIngredientColumn(colIndex, ing);
      if (ci != null) matrix[r][ci] -= elementAmount(ing) * cyclesPerTime;
    }

    if (fuel) {
      const burner = factory.burner_prototype!;
      const consumptionEffect = 1 + effects.consumption;
      const powerWatts = (factory.energy_usage ?? 0) * 60;
      const energyPerCycle = powerWatts * (recipe.energy / speed) * consumptionEffect;
      const fuelPerCycle = energyPerCycle / (fuel.fuelValue * burner.effectivity);
      const fuelPerTime = fuelPerCycle * cyclesPerTime;

      const fuelCol = colIndex.get(`${fuel.item.name}:item`);
      if (fuelCol != null) matrix[r][fuelCol] -= fuelPerTime;
      if (fuel.burntResult) {
        const burntCol = colIndex.get(`${fuel.burntResult}:item`);
        if (burntCol != null) matrix[r][burntCol] += fuelPerTime;
      }
    }
  }

  // Z-row (objective/demand vector)
  const Z = new Array(numCols).fill(0);
  if (input.target) {
    const targetCol = findColumn(colIndex, input.target.name);
    if (targetCol == null) throw new Error(`Target "${input.target.name}" not found in recipe products/ingredients`);
    Z[targetCol] = -input.target.amount;
  } else if (input.inputs?.length) {
    for (const inp of input.inputs) {
      const inputCol = findColumn(colIndex, inp.name);
      if (inputCol == null) throw new Error(`Input "${inp.name}" not found in recipe products/ingredients`);
      Z[inputCol] = inp.amount;
    }
  }

  const itemDepths = computeItemDepths(columns, matrix, numRows, numCols);
  const itemCosts = computeItemCosts(itemDepths);
  return { matrix, columns, colIndex, resolved, Z, numRows, numCols, itemCosts, itemDepths };
}

// ── Algebraic solver ────────────────────────────────────────────────────────

function solveAlgebra(m: SolverMatrix, input: SolveInput): number[] {
  const { matrix, Z, numRows, numCols, resolved } = m;
  const recipeCounts = new Array(numRows).fill(0);
  const maxPasses = numRows + 1;
  const isInputMode = !!input.inputs?.length && !input.target;

  // Build constraint lookup: recipeName → ConstraintSpec[]
  const constraintMap = new Map<string, ConstraintSpec[]>();
  for (const c of input.constraints ?? []) {
    const existing = constraintMap.get(c.recipeName) ?? [];
    existing.push(c);
    constraintMap.set(c.recipeName, existing);
  }

  if (isInputMode) {
    for (let pass = 0; pass < maxPasses; pass++) {
      let changed = false;
      for (let r = 0; r < numRows; r++) {
        let bestCol = -1;
        let bestScale = 0;
        const constraints = constraintMap.get(resolved[r].recipeName);

        for (let c = 0; c < numCols; c++) {
          const consumption = -matrix[r][c];
          if (consumption <= 0) continue;
          const supply = Z[c];
          if (supply <= 1e-9) continue;

          // Check constraints
          if (constraints) {
            const colName = m.columns[c].name;
            const isMaster = constraints.some(cs => cs.productName === colName && cs.type === 'master');
            const isExcluded = constraints.some(cs => cs.productName === colName && cs.type === 'exclude');
            if (isExcluded) continue;
            if (isMaster) { bestCol = c; bestScale = supply / consumption; break; }
          }

          const scale = supply / consumption;
          if (scale > bestScale) { bestScale = scale; bestCol = c; }
        }
        if (bestCol < 0) continue;

        const scale = Z[bestCol] / (-matrix[r][bestCol]);
        if (scale < 1e-10) continue;

        recipeCounts[r] += scale;
        changed = true;
        for (let c = 0; c < numCols; c++) {
          Z[c] += matrix[r][c] * scale;
        }
      }
      if (!changed) break;
    }
  } else {
    for (let pass = 0; pass < maxPasses; pass++) {
      let changed = false;
      for (let r = 0; r < numRows; r++) {
        let bestCol = -1;
        let bestRatio = 0;
        const constraints = constraintMap.get(resolved[r].recipeName);

        for (let c = 0; c < numCols; c++) {
          const production = matrix[r][c];
          if (production <= 0) continue;
          const demand = -Z[c];
          if (demand <= 1e-9) continue;

          if (constraints) {
            const colName = m.columns[c].name;
            const isMaster = constraints.some(cs => cs.productName === colName && cs.type === 'master');
            const isExcluded = constraints.some(cs => cs.productName === colName && cs.type === 'exclude');
            if (isExcluded) continue;
            if (isMaster) { bestCol = c; bestRatio = demand / production; break; }
          }

          const ratio = demand / production;
          if (ratio > bestRatio) { bestRatio = ratio; bestCol = c; }
        }
        if (bestCol < 0) continue;

        const production = matrix[r][bestCol];
        const demand = -Z[bestCol];
        const scale = demand / production;
        recipeCounts[r] += scale;
        changed = true;
        for (let c = 0; c < numCols; c++) Z[c] += matrix[r][c] * scale;
      }
      if (!changed) break;
    }
  }

  return recipeCounts;
}

// ── Simplex solver ──────────────────────────────────────────────────────────

interface SimplexTableau {
  rows: number[][];         // includes Z-row as last row
  headers: number[];        // row header → original column index (-1 for artificial)
  colMap: number[];         // tableau column → original column index (-1 for slack/artificial)
  coefficients: number[];   // per-row coefficient values
  numOrigRows: number;
  numOrigCols: number;
  totalCols: number;
  itemCosts: number[];      // per-original-column cost weights for pivot selection
}

function simplexPrepare(m: SolverMatrix, input: SolveInput): SimplexTableau {
  const { matrix, Z, numRows, numCols } = m;
  const isInputMode = !!input.inputs?.length && !input.target;

  // Deep copy matrix rows and Z
  // In input mode, negate the matrix (Helmod uses factor=-1 for by_product=false)
  // This flips production/consumption so the simplex can work forward from inputs
  const rows: number[][] = [];
  for (let r = 0; r < numRows; r++) {
    if (isInputMode) {
      rows.push(matrix[r].map(v => -v));
    } else {
      rows.push([...matrix[r]]);
    }
  }
  // Apply exclude constraints: zero out production coefficients so the simplex
  // won't use excluded byproducts to satisfy downstream demand.
  // The original matrix (used by extractResults) is untouched.
  const constraintMap = new Map<string, ConstraintSpec[]>();
  for (const c of input.constraints ?? []) {
    const existing = constraintMap.get(c.recipeName) ?? [];
    existing.push(c);
    constraintMap.set(c.recipeName, existing);
  }
  for (let r = 0; r < numRows; r++) {
    const constraints = constraintMap.get(m.resolved[r].recipeName);
    if (!constraints) continue;
    for (let c = 0; c < numCols; c++) {
      if (rows[r][c] <= 0) continue;
      const colName = m.columns[c].name;
      if (constraints.some(cs => cs.productName === colName && cs.type === 'exclude')) {
        rows[r][c] = 0;
      }
    }
  }

  const zRow = [...Z];

  // Coefficients per row (initially 0)
  const coefficients = new Array(numRows).fill(0);

  // Headers: each row starts mapped to itself
  const headers = Array.from({ length: numRows }, (_, i) => i);

  // Column map: first numCols are original columns
  const colMap = Array.from({ length: numCols }, (_, i) => i);

  // Step 1: Add artificial rows for unproduced columns
  // A column is "unproduced" if no recipe row has a positive value for it
  const artificialRows: number[][] = [];
  const artificialCoeffs: number[] = [];
  let artIndex = 1;

  for (let c = 0; c < numCols; c++) {
    let hasProducer = false;
    for (let r = 0; r < numRows; r++) {
      if (rows[r][c] > 0) { hasProducer = true; break; }
    }
    if (!hasProducer) {
      // Add artificial row with 1 in this column, 0 elsewhere
      const artRow = new Array(numCols).fill(0);
      artRow[c] = 1;
      artificialRows.push(artRow);
      artificialCoeffs.push(1e4 * artIndex);
      artIndex++;
    }
  }

  // Combine real + artificial rows
  for (const artRow of artificialRows) {
    rows.push(artRow);
    headers.push(-1); // artificial row marker
  }
  for (const coeff of artificialCoeffs) {
    coefficients.push(coeff);
  }

  const totalRows = rows.length; // real + artificial (not counting Z-row yet)

  // Step 2: Prepend coefficient column
  for (let r = 0; r < totalRows; r++) {
    rows[r].unshift(coefficients[r]);
  }
  // Coefficient column is index 0 in the tableau
  const coeffColMap = [-1]; // not an original column
  const shiftedColMap = colMap.map(c => c); // original columns shift by 1

  // Step 3: Append identity matrix (slack variables) — one per ORIGINAL row only
  // Helmod uses rawlen(matrix.rows) = numOrigRows, NOT including artificial rows
  for (let r = 0; r < totalRows; r++) {
    for (let s = 0; s < numRows; s++) {
      rows[r].push(r === s ? 1 : 0);
    }
  }

  // Step 4: Z-row — simplex needs positive values for items with unsatisfied demand/supply
  // In buildMatrix: target mode sets Z = -amount (demand), input mode sets Z = +amount (supply)
  // Simplex pivots on positive Z values, so use absolute values
  const zRowTableau: number[] = [0]; // coefficient column = 0
  for (let c = 0; c < numCols; c++) {
    zRowTableau.push(Math.abs(zRow[c]));
  }
  // Slack columns in Z-row = 0 (one per original row)
  for (let s = 0; s < numRows; s++) {
    zRowTableau.push(0);
  }
  rows.push(zRowTableau);

  // Build full column map
  const fullColMap: number[] = [-1]; // coeff column
  for (const c of shiftedColMap) fullColMap.push(c);
  for (let s = 0; s < numRows; s++) fullColMap.push(-1); // slack columns

  const totalCols = 1 + numCols + numRows; // coeff + original + slack (original rows only)

  return {
    rows,
    headers,
    colMap: fullColMap,
    coefficients,
    numOrigRows: numRows,
    numOrigCols: numCols,
    totalCols,
    itemCosts: m.itemCosts,
  };
}

function simplexGetPivot(t: SimplexTableau): { found: boolean; xrow: number; xcol: number } {
  const zRow = t.rows[t.rows.length - 1];
  const numDataRows = t.rows.length - 1; // exclude Z-row

  let maxZValue = 0;
  let xcol = -1;
  let xrow = -1;

  // Find column with highest cost-weighted positive Z-value (skip coefficient column at index 0)
  // Weighting by item cost biases pivot selection toward shallow (cheap) items,
  // leading to solutions that minimize deep cascade chains.
  for (let c = 1; c < t.totalCols; c++) {
    const zVal = zRow[c] ?? 0;
    const origCol = t.colMap[c];
    const weight = origCol >= 0 && origCol < t.itemCosts.length ? t.itemCosts[origCol] : 1;
    const weightedZ = zVal * weight;
    if (weightedZ > maxZValue) {
      // Find best row for this column (ratio test)
      let bestRatio: number | null = null;
      let bestValue = 0;
      let candidateRow = -1;

      for (let r = 0; r < numDataRows; r++) {
        const cellVal = t.rows[r][c] ?? 0;
        if (cellVal > 0) {
          const coeff = t.rows[r][0]; // coefficient is column 0
          const ratio = coeff / cellVal;
          if (bestRatio === null || ratio > bestRatio || coeff > bestValue) {
            bestRatio = ratio;
            bestValue = coeff;
            candidateRow = r;
          }
        }
      }

      if (candidateRow >= 0) {
        maxZValue = weightedZ;
        xcol = c;
        xrow = candidateRow;
      }
    }
  }

  return { found: maxZValue > 1e-10, xrow, xcol };
}

function simplexPivot(t: SimplexTableau, xrow: number, xcol: number): void {
  const pivotValue = t.rows[xrow][xcol];
  const numAllRows = t.rows.length;
  const oldRows = t.rows.map(row => [...row]); // snapshot

  // Update coefficient for pivot row
  t.coefficients[xrow] = t.coefficients[xrow] / pivotValue;
  t.rows[xrow][0] = t.coefficients[xrow];

  for (let r = 0; r < numAllRows; r++) {
    for (let c = 0; c < t.totalCols; c++) {
      const cellVal = oldRows[r][c] ?? 0;
      if (r === xrow) {
        // Pivot row: divide by pivot value
        t.rows[r][c] = cellVal / pivotValue;
      } else if (c === xcol) {
        // Pivot column: zero out
        t.rows[r][c] = 0;
      } else {
        const B = oldRows[r][xcol] ?? 0;
        const D = oldRows[xrow][c] ?? 0;
        const value = cellVal - (B * D) / pivotValue;
        t.rows[r][c] = Math.abs(value) < 1e-10 ? 0 : value;
      }
    }
  }

  // Swap basis: the row's header becomes the column, and vice versa
  // Track which original column is now in this row's basis
  const oldHeader = t.headers[xrow];
  t.headers[xrow] = t.colMap[xcol];
  t.colMap[xcol] = oldHeader;
}

function solveSimplexLegacy(m: SolverMatrix, input: SolveInput): number[] {
  const tableau = simplexPrepare(m, input);

  // Pivot loop
  const maxIterations = (m.numRows + m.numCols) * 3;
  for (let iter = 0; iter < maxIterations; iter++) {
    const { found, xrow, xcol } = simplexGetPivot(tableau);
    if (!found) break;
    simplexPivot(tableau, xrow, xcol);
  }

  // Extract recipe counts from the slack variable columns in the Z-row
  // After pivoting, recipe counts are: -Z[slackCol] for each original recipe row
  // (Helmod's table_compute: parameters.recipe_count = -zrow[icol])
  const recipeCounts = new Array(m.numRows).fill(0);
  const zRow = tableau.rows[tableau.rows.length - 1];
  const slackStart = 1 + m.numCols; // coeff column + original columns

  for (let r = 0; r < m.numRows; r++) {
    const slackVal = zRow[slackStart + r] ?? 0;
    recipeCounts[r] = Math.abs(slackVal) < 1e-10 ? 0 : -slackVal;
  }

  return recipeCounts;
}

// ── LP simplex solver (target mode — cost minimization) ───────────────────

/**
 * Standard two-phase simplex with cost minimization objective.
 * Minimizes sum(recipeCost_r * x_r) subject to production/balance constraints.
 *
 * LP formulation:
 *   Variables: x_r >= 0 (recipe rate for each recipe r)
 *   Objective: minimize sum(recipeCost_r * x_r)
 *   Constraints:
 *     Target column: sum_r(A[r][c] * x_r) >= targetAmount
 *     Intermediates: sum_r(A[r][c] * x_r) >= 0 (production >= consumption)
 *     Inputs/outputs: unconstrained
 *
 * Phase 1 finds a feasible solution via artificial variables.
 * Phase 2 optimizes the cost objective.
 */
function solveSimplexLP(m: SolverMatrix, input: SolveInput): number[] {
  const { matrix, columns, Z, numRows, numCols, resolved, itemDepths } = m;

  // Apply exclude constraints to a working copy of the matrix
  const workMatrix = matrix.map(row => [...row]);
  const constraintMap = new Map<string, ConstraintSpec[]>();
  for (const c of input.constraints ?? []) {
    const existing = constraintMap.get(c.recipeName) ?? [];
    existing.push(c);
    constraintMap.set(c.recipeName, existing);
  }
  for (let r = 0; r < numRows; r++) {
    const constraints = constraintMap.get(resolved[r].recipeName);
    if (!constraints) continue;
    for (let c = 0; c < numCols; c++) {
      if (workMatrix[r][c] <= 0) continue;
      const colName = columns[c].name;
      if (constraints.some(cs => cs.productName === colName && cs.type === 'exclude')) {
        workMatrix[r][c] = 0;
      }
    }
  }

  // Identify constrained columns and build RHS
  const constrainedCols: number[] = [];
  const rhs: number[] = [];

  for (let c = 0; c < numCols; c++) {
    if (Z[c] < -1e-10) {
      // Target column: must produce at least targetAmount
      constrainedCols.push(c);
      rhs.push(-Z[c]); // targetAmount (positive)
    } else if (columns[c].state === ItemState.Intermediate) {
      // Intermediate: check if it has at least one producer in the working matrix
      let hasProducer = false;
      for (let r = 0; r < numRows; r++) {
        if (workMatrix[r][c] > 1e-10) { hasProducer = true; break; }
      }
      if (!hasProducer) continue; // no producer after excludes → treat as free import
      constrainedCols.push(c);
      rhs.push(0); // production >= consumption
    }
  }

  const K = constrainedCols.length; // number of constraints
  const n = numRows; // number of recipe variables

  if (K === 0) return new Array(n).fill(0);

  // Compute recipe costs for the objective
  const recipeCosts = computeRecipeCosts(itemDepths, workMatrix, numRows, numCols);

  // ── Build tableau ────────────────────────────────────────────────────────
  // Layout: K constraint rows + 1 Z-row
  // Columns: n (recipe vars) + K (surplus) + K (artificial) + 1 (RHS)
  //          [x_0..x_{n-1}] [s_0..s_{K-1}] [a_0..a_{K-1}] [rhs]

  const totalVars = n + 2 * K;
  const rhsIdx = totalVars;
  const tab: number[][] = [];
  const basis: number[] = [];

  for (let k = 0; k < K; k++) {
    const row = new Array(totalVars + 1).fill(0);
    const c = constrainedCols[k];

    // Recipe variable coefficients: A[r][c] for each recipe r
    for (let r = 0; r < n; r++) {
      row[r] = workMatrix[r][c];
    }

    // Surplus variable (subtract from >= constraint to get equality)
    row[n + k] = -1;

    // Artificial variable
    row[n + K + k] = 1;

    // RHS
    row[rhsIdx] = rhs[k];

    tab.push(row);
    basis.push(n + K + k); // artificial k is initially in basis
  }

  // ── Phase 1: minimize sum of artificials ──────────────────────────────────
  // Z-row: c_j = 1 for artificial vars, 0 for others
  // Reduced costs: Z_j = c_j - sum_k(c_Bk * tab[k][j])
  // Since all basis vars are artificial with c_Bk = 1:
  const zRow = new Array(totalVars + 1).fill(0);
  for (let j = 0; j <= totalVars; j++) {
    let basisSum = 0;
    for (let k = 0; k < K; k++) basisSum += tab[k][j];
    zRow[j] = (j >= n + K && j < n + 2 * K ? 1 : 0) - basisSum;
  }
  tab.push(zRow);

  const maxIter = (n + K) * 10;

  for (let iter = 0; iter < maxIter; iter++) {
    // Find entering column: most negative reduced cost
    let minRC = -1e-8;
    let enterCol = -1;
    for (let j = 0; j < totalVars; j++) {
      if (tab[K][j] < minRC) {
        minRC = tab[K][j];
        enterCol = j;
      }
    }
    if (enterCol < 0) break; // optimal

    // Find leaving row: minimum ratio test (Bland's rule for ties)
    let minRatio = Infinity;
    let leaveRow = -1;
    for (let k = 0; k < K; k++) {
      if (tab[k][enterCol] > 1e-10) {
        const ratio = tab[k][rhsIdx] / tab[k][enterCol];
        if (ratio < minRatio - 1e-10) {
          minRatio = ratio;
          leaveRow = k;
        } else if (Math.abs(ratio - minRatio) < 1e-10 && basis[k] > basis[leaveRow]) {
          leaveRow = k; // Bland's: prefer leaving the higher-index basis variable
        }
      }
    }
    if (leaveRow < 0) break; // unbounded

    // Pivot
    lpPivot(tab, K, totalVars, rhsIdx, basis, leaveRow, enterCol);
  }

  // Check feasibility: Phase 1 objective should be ~0
  if (tab[K][rhsIdx] > 1e-6) {
    return new Array(n).fill(0); // infeasible
  }

  // ── Phase 2: minimize recipe costs ─────────────────────────────────────────
  // Rebuild Z-row with real costs
  for (let j = 0; j <= totalVars; j++) tab[K][j] = 0;

  // Set costs: recipe vars get recipeCosts, artificials get big-M
  const objCosts = new Array(totalVars).fill(0);
  for (let r = 0; r < n; r++) objCosts[r] = recipeCosts[r];
  for (let k = 0; k < K; k++) objCosts[n + K + k] = 1e8; // big-M for artificials

  // Compute reduced costs: Z_j = c_j - sum_k(c_Bk * tab[k][j])
  for (let j = 0; j <= totalVars; j++) {
    let val = j < totalVars ? objCosts[j] : 0;
    for (let k = 0; k < K; k++) {
      const bVar = basis[k];
      const bCost = bVar < totalVars ? objCosts[bVar] : 0;
      val -= bCost * tab[k][j];
    }
    tab[K][j] = val;
  }

  // Phase 2 pivot loop
  for (let iter = 0; iter < maxIter; iter++) {
    let minRC = -1e-8;
    let enterCol = -1;
    for (let j = 0; j < totalVars; j++) {
      if (tab[K][j] < minRC) {
        minRC = tab[K][j];
        enterCol = j;
      }
    }
    if (enterCol < 0) break;

    let minRatio = Infinity;
    let leaveRow = -1;
    for (let k = 0; k < K; k++) {
      if (tab[k][enterCol] > 1e-10) {
        const ratio = tab[k][rhsIdx] / tab[k][enterCol];
        if (ratio < minRatio - 1e-10) {
          minRatio = ratio;
          leaveRow = k;
        } else if (Math.abs(ratio - minRatio) < 1e-10 && leaveRow >= 0 && basis[k] > basis[leaveRow]) {
          leaveRow = k;
        }
      }
    }
    if (leaveRow < 0) break;

    // Update Z-row reduced costs before pivot
    lpPivot(tab, K, totalVars, rhsIdx, basis, leaveRow, enterCol);
  }

  // Extract recipe counts from basis
  const recipeCounts = new Array(n).fill(0);
  for (let k = 0; k < K; k++) {
    const bVar = basis[k];
    if (bVar < n) {
      recipeCounts[bVar] = Math.max(0, tab[k][rhsIdx]);
    }
  }

  return recipeCounts;
}

/** Standard simplex pivot operation. */
function lpPivot(
  tab: number[][],
  numConstraints: number,
  totalVars: number,
  rhsIdx: number,
  basis: number[],
  leaveRow: number,
  enterCol: number,
): void {
  const pivotVal = tab[leaveRow][enterCol];

  // Divide pivot row by pivot value
  for (let j = 0; j <= totalVars; j++) {
    tab[leaveRow][j] /= pivotVal;
  }

  // Eliminate from all other rows (including Z-row at index numConstraints)
  for (let k = 0; k <= numConstraints; k++) {
    if (k === leaveRow) continue;
    const factor = tab[k][enterCol];
    if (Math.abs(factor) < 1e-12) continue;
    for (let j = 0; j <= totalVars; j++) {
      tab[k][j] -= factor * tab[leaveRow][j];
      if (Math.abs(tab[k][j]) < 1e-10) tab[k][j] = 0;
    }
  }

  basis[leaveRow] = enterCol;
}

function solveSimplex(m: SolverMatrix, input: SolveInput): number[] {
  const isInputMode = !!input.inputs?.length && !input.target;

  if (isInputMode) {
    // Input mode: use legacy Helmod-style simplex (validated, no cascade issue)
    return solveSimplexLegacy(m, input);
  }

  // Target mode: use LP simplex with cost minimization
  return solveSimplexLP(m, input);
}

// ── Result extraction (shared) ──────────────────────────────────────────────

function extractResults(m: SolverMatrix, recipeCounts: number[]): SolveResult {
  const { matrix, columns, resolved, numRows, numCols } = m;

  const totalProduction = new Array(numCols).fill(0);
  const totalConsumption = new Array(numCols).fill(0);
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const flow = matrix[r][c] * recipeCounts[r];
      if (flow > 0) totalProduction[c] += flow;
      else totalConsumption[c] += -flow;
    }
  }

  const recipeResults: RecipeResult[] = [];
  let totalPowerWatts = 0;
  for (let r = 0; r < numRows; r++) {
    let energyUsage = 0;
    // Only electric factories contribute to grid power (burners consume fuel instead)
    if (!resolved[r].fuel) {
      const powerWatts = (resolved[r].factory.energy_usage ?? 0) * 60;
      const consumptionEffect = 1 + resolved[r].effects.consumption;
      energyUsage = powerWatts * consumptionEffect * recipeCounts[r];
      totalPowerWatts += energyUsage;
    }
    recipeResults.push({
      recipeName: resolved[r].recipeName,
      factoryName: resolved[r].factoryName,
      factoryCount: recipeCounts[r],
      effectiveSpeed: resolved[r].effectiveSpeed,
      energyUsage,
    });
  }

  const products: ItemFlow[] = [];
  const ingredients: ItemFlow[] = [];
  const intermediates: IntermediateDetail[] = [];

  for (let c = 0; c < numCols; c++) {
    const col = columns[c];
    if (col.state === ItemState.Intermediate) {
      // Build per-recipe routing for this intermediate
      const producers: { recipeName: string; amount: number }[] = [];
      const consumers: { recipeName: string; amount: number }[] = [];
      for (let r = 0; r < numRows; r++) {
        const flow = matrix[r][c] * recipeCounts[r];
        if (flow > 0.0001) producers.push({ recipeName: resolved[r].recipeName, amount: flow });
        else if (flow < -0.0001) consumers.push({ recipeName: resolved[r].recipeName, amount: -flow });
      }
      if (producers.length > 0 || consumers.length > 0) {
        intermediates.push({
          name: col.name,
          type: col.type,
          totalFlow: totalProduction[c],
          producers,
          consumers,
        });
      }

      const net = totalProduction[c] - totalConsumption[c];
      if (Math.abs(net) < 0.0001) continue;
      const flow: ItemFlow = { name: col.name, type: col.type, amount: Math.abs(net), state: col.state };
      if (net > 0) { flow.state = ItemState.Output; products.push(flow); }
      else { flow.state = ItemState.Input; ingredients.push(flow); }
    } else if (col.state === ItemState.Output) {
      if (totalProduction[c] > 0.0001) {
        products.push({ name: col.name, type: col.type, amount: totalProduction[c], state: col.state });
      }
    } else {
      if (totalConsumption[c] > 0.0001) {
        ingredients.push({ name: col.name, type: col.type, amount: totalConsumption[c], state: col.state });
      }
    }
  }

  return { recipes: recipeResults, products, ingredients, intermediates, totalPowerMW: totalPowerWatts / 1e6 };
}

// ── Balance adjustment (post-processing) ──────────────────────────────────

/**
 * Balance intermediates by pushing deficits/surpluses through the recipe chain.
 * For items importing more than allowed: scale up the production recipe.
 * For items exporting when cap=0: scale up the consumption recipe.
 * Cascading changes propagate until they reach uncapped items (raw materials).
 */
function adjustForBalance(
  m: SolverMatrix,
  recipeCounts: number[],
  maxImports: Map<string, number>,
): void {
  const { matrix, columns, numRows, numCols } = m;
  const maxPasses = 10;

  for (let pass = 0; pass < maxPasses; pass++) {
    // Compute net flow per item
    const netFlow = new Array(numCols).fill(0);
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        netFlow[c] += matrix[r][c] * recipeCounts[r];
      }
    }

    let adjusted = false;
    for (let c = 0; c < numCols; c++) {
      const cap = maxImports.get(columns[c].name);
      if (cap == null) continue; // no cap on this item

      const importAmount = -netFlow[c]; // positive if importing
      if (importAmount > cap + 1e-8) {
        // Importing too much — scale up the best producer
        let bestRow = -1;
        let bestRate = 0;
        for (let r = 0; r < numRows; r++) {
          if (matrix[r][c] > bestRate) {
            bestRate = matrix[r][c];
            bestRow = r;
          }
        }
        if (bestRow < 0) continue; // no producer — stays as import

        const deficit = importAmount - cap;
        recipeCounts[bestRow] += deficit / bestRate;
        adjusted = true;
      } else if (cap === 0 && netFlow[c] > 1e-8) {
        // Exporting when it should balance — scale up the best consumer
        let bestRow = -1;
        let bestRate = 0;
        for (let r = 0; r < numRows; r++) {
          if (-matrix[r][c] > bestRate) { // negative = consumption
            bestRate = -matrix[r][c];
            bestRow = r;
          }
        }
        if (bestRow < 0) continue; // no consumer — stays as output

        recipeCounts[bestRow] += netFlow[c] / bestRate;
        adjusted = true;
      }
    }

    if (!adjusted) break;
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

export function solve(data: PrototypeData, input: SolveInput): SolveResult {
  const m = buildMatrix(data, input);
  const solver = input.solver ?? 'algebra';
  const recipeCounts = solver === 'simplex' ? solveSimplex(m, input) : solveAlgebra(m, input);
  if (input.maxImports?.length) {
    adjustForBalance(m, recipeCounts, new Map(input.maxImports.map(i => [i.name, i.amount])));
  }
  return extractResults(m, recipeCounts);
}
