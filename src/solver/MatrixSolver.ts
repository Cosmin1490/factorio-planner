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
import { ItemState, type SolveInput, type SolveResult, type RecipeResult, type ItemFlow, type EffectTotals, type ConstraintSpec } from './types.js';

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

function classifyItems(
  recipes: Recipe[],
  extraProduced: Set<string>,
  extraConsumed: Set<string>,
): Map<string, { name: string; type: 'item' | 'fluid'; temperature?: number; state: ItemState }> {
  const producedBy = new Set<string>(extraProduced);
  const consumedBy = new Set<string>(extraConsumed);

  for (const recipe of recipes) {
    const products = Array.isArray(recipe.products) ? recipe.products : [];
    for (const p of products) producedBy.add(itemKey(p));
    for (const ing of recipe.ingredients) consumedBy.add(`${ing.name}:${ing.type}`);
  }

  const result = new Map<string, { name: string; type: 'item' | 'fluid'; temperature?: number; state: ItemState }>();

  function addItem(name: string, type: 'item' | 'fluid', temperature?: number) {
    const key = temperature != null ? `${name}:${type}:${temperature}` : `${name}:${type}`;
    if (result.has(key)) return;
    const baseKey = `${name}:${type}`;
    const isIntermediate = producedBy.has(baseKey) && consumedBy.has(baseKey);
    const isProduced = producedBy.has(key) || producedBy.has(baseKey);
    result.set(key, {
      name, type, temperature,
      state: isIntermediate ? ItemState.Intermediate : (isProduced ? ItemState.Output : ItemState.Input),
    });
  }

  for (const recipe of recipes) {
    const products = Array.isArray(recipe.products) ? recipe.products : [];
    for (const p of products) addItem(p.name, p.type, p.temperature);
    for (const ing of recipe.ingredients) addItem(ing.name, ing.type);
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
  const itemClassification = classifyItems(resolved.map(r => r.recipe), extraProduced, extraConsumed);

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
      const ci = colIndex.get(itemKey(p));
      if (ci != null) matrix[r][ci] += elementAmount(p) * productivity * cyclesPerTime;
    }
    for (const ing of recipe.ingredients) {
      const ci = colIndex.get(`${ing.name}:${ing.type}`);
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

  return { matrix, columns, colIndex, resolved, Z, numRows, numCols };
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
  };
}

function simplexGetPivot(t: SimplexTableau): { found: boolean; xrow: number; xcol: number } {
  const zRow = t.rows[t.rows.length - 1];
  const numDataRows = t.rows.length - 1; // exclude Z-row

  let maxZValue = 0;
  let xcol = -1;
  let xrow = -1;

  // Find column with highest positive Z-value (skip coefficient column at index 0)
  for (let c = 1; c < t.totalCols; c++) {
    const zVal = zRow[c] ?? 0;
    if (zVal > maxZValue) {
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
        maxZValue = zVal;
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

function solveSimplex(m: SolverMatrix, input: SolveInput): number[] {
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
  for (let r = 0; r < numRows; r++) {
    recipeResults.push({
      recipeName: resolved[r].recipeName,
      factoryName: resolved[r].factoryName,
      factoryCount: recipeCounts[r],
      effectiveSpeed: resolved[r].effectiveSpeed,
      energyUsage: 0,
    });
  }

  const products: ItemFlow[] = [];
  const ingredients: ItemFlow[] = [];
  const intermediates: ItemFlow[] = [];

  for (let c = 0; c < numCols; c++) {
    const col = columns[c];
    if (col.state === ItemState.Intermediate) {
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

  return { recipes: recipeResults, products, ingredients, intermediates };
}

// ── Public API ──────────────────────────────────────────────────────────────

export function solve(data: PrototypeData, input: SolveInput): SolveResult {
  const m = buildMatrix(data, input);
  const solver = input.solver ?? 'algebra';
  const recipeCounts = solver === 'simplex' ? solveSimplex(m, input) : solveAlgebra(m, input);
  return extractResults(m, recipeCounts);
}
