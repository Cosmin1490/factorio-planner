/**
 * Types for the TypeScript production solver.
 */

/** Module placed in a factory or beacon */
export interface ModuleSpec {
  name: string;
  count: number;
  quality?: string;
}

/** Beacon affecting a factory */
export interface BeaconSpec {
  name: string;
  modules: ModuleSpec[];
  count: number;      // number of beacons with this configuration
  quality?: string;
}

/** A recipe + factory + module/beacon configuration to solve */
export interface RecipeSpec {
  recipeName: string;
  factoryName: string;
  factoryQuality?: string;
  modules?: ModuleSpec[];
  beacons?: BeaconSpec[];
  fuel?: string;           // fuel item name for burner factories (e.g., "coal")
}

export type SolverMode = 'algebra' | 'simplex';

/** Constraint on which recipe handles a specific product */
export interface ConstraintSpec {
  recipeName: string;
  productName: string;
  type: 'master' | 'exclude';  // master = force this recipe, exclude = skip this recipe
}

/** Input to the solver */
export interface SolveInput {
  recipes: RecipeSpec[];
  target?: { name: string; amount: number };
  inputs?: { name: string; amount: number }[];
  time: number;
  solver?: SolverMode;
  constraints?: ConstraintSpec[];
  maxImports?: { name: string; amount: number }[];
}

/** Item/fluid flow in solver results */
export interface ItemFlow {
  name: string;
  type: 'item' | 'fluid';
  amount: number;
  state: ItemState;
}

export enum ItemState {
  Intermediate = 0,
  Output = 1,
  Input = 2,
}

/** Per-recipe result from the solver */
export interface RecipeResult {
  recipeName: string;
  factoryName: string;
  factoryCount: number;
  effectiveSpeed: number;
  energyUsage: number;
}

/** Per-intermediate routing: who produces it and who consumes it */
export interface IntermediateDetail {
  name: string;
  type: 'item' | 'fluid';
  totalFlow: number;
  producers: { recipeName: string; amount: number }[];
  consumers: { recipeName: string; amount: number }[];
}

/** Cycle detected in item-recipe graph */
export interface CycleWarning {
  recipes: string[];    // recipe names in the cycle
  items: string[];      // item names forming the cycle edges
}

/** Solver warning (cycle detection, etc.) */
export interface SolverWarning {
  type: 'cycle';
  message: string;
  detail: CycleWarning;
}

/** Full solver output */
export interface SolveResult {
  recipes: RecipeResult[];
  products: ItemFlow[];
  ingredients: ItemFlow[];
  intermediates: IntermediateDetail[];
  totalPowerMW: number;
  warnings: SolverWarning[];
}

/** Computed module/beacon effects for a single recipe */
export interface EffectTotals {
  speed: number;
  productivity: number;
  consumption: number;
  pollution: number;
  quality: number;
}
