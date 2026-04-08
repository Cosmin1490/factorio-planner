/**
 * Loads and indexes the Factorio prototype JSON data.
 */

import { readFileSync } from 'fs';

export interface RecipeElement {
  name: string;
  type: 'item' | 'fluid';
  amount?: number;
  amount_min?: number;
  amount_max?: number;
  probability?: number;
  catalyst_amount?: number;
  temperature?: number;
  minimum_temperature?: number;
  maximum_temperature?: number;
  extra_count_fraction?: number;
}

export interface Recipe {
  name: string;
  category: string;
  energy: number;
  enabled: boolean;
  hidden: boolean;
  hidden_from_player_crafting: boolean;
  ingredients: RecipeElement[];
  products: RecipeElement[];
  group?: { name: string; order: string };
  subgroup?: { name: string; order: string };
  allowed_effects?: Record<string, boolean>;
  maximum_productivity?: number;
  emissions_multiplier?: number;
  order?: string;
}

export interface BurnerPrototype {
  fuel_categories: Record<string, boolean>;
  effectivity: number;
  emissions_per_joule?: Record<string, number>;
  fuel_inventory_size?: number;
  type: string;
}

export interface Entity {
  name: string;
  type: string;
  crafting_categories?: Record<string, boolean>;
  crafting_speed?: Record<string, number>;
  module_slots?: number;
  module_inventory_size?: number;
  distribution_effectivity?: number;
  distribution_effectivity_bonus_per_quality_level?: number;
  profile?: number[];
  allowed_effects?: Record<string, boolean>;
  allowed_module_categories?: Record<string, boolean>;
  beacon_counter?: string;
  energy_usage?: number;
  burner_prototype?: BurnerPrototype;
  hidden?: boolean;
}

export interface Item {
  name: string;
  type: string;
  group?: { name: string };
  subgroup?: { name: string };
  order?: string;
  module_effects?: Record<string, Record<string, number>>;
  fuel_value?: number;
  fuel_category?: string;
  fuel_emissions_multiplier?: number;
  burnt_result?: { name: string; type: string };
}

export interface Fluid {
  name: string;
  order?: string;
}

export interface PrototypeData {
  recipes: Record<string, Recipe>;
  entities: Record<string, Entity>;
  items: Record<string, Item>;
  fluids: Record<string, Fluid>;
}

/** Map from item/fluid name to recipes that produce it */
export type ProducerIndex = Map<string, Recipe[]>;

let cachedData: PrototypeData | null = null;
let cachedProducerIndex: ProducerIndex | null = null;

export function loadPrototypes(jsonPath: string): PrototypeData {
  if (cachedData) return cachedData;
  const raw = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  cachedData = {
    recipes: raw.recipes ?? {},
    entities: raw.entities ?? {},
    items: raw.items ?? {},
    fluids: raw.fluids ?? {},
  };
  return cachedData;
}

/**
 * Build an index: item/fluid name → recipes that produce it.
 * Filters out hidden recipes and barreling/unbarreling.
 */
export function buildProducerIndex(data: PrototypeData): ProducerIndex {
  if (cachedProducerIndex) return cachedProducerIndex;

  const index: ProducerIndex = new Map();

  for (const recipe of Object.values(data.recipes)) {
    if (recipe.hidden) continue;

    // Skip barreling/unbarreling recipes
    if (recipe.category === 'barreling' || recipe.category === 'unbarreling') continue;
    if (recipe.name.startsWith('fill-') || recipe.name.startsWith('empty-')) continue;

    // Skip recycling recipes
    if (recipe.category === 'recycling') continue;

    const products = Array.isArray(recipe.products) ? recipe.products : [];
    for (const product of products) {
      const existing = index.get(product.name);
      if (existing) {
        existing.push(recipe);
      } else {
        index.set(product.name, [recipe]);
      }
    }
  }

  cachedProducerIndex = index;
  return index;
}

/**
 * Find factories that can craft a given recipe category.
 */
export function findFactories(data: PrototypeData, category: string): Entity[] {
  const results: Entity[] = [];
  for (const entity of Object.values(data.entities)) {
    if (entity.hidden) continue;
    if (entity.crafting_categories?.[category]) {
      results.push(entity);
    }
  }
  // Sort by crafting speed (fastest first)
  results.sort((a, b) => {
    const speedA = a.crafting_speed?.['normal'] ?? 0;
    const speedB = b.crafting_speed?.['normal'] ?? 0;
    return speedB - speedA;
  });
  return results;
}

/**
 * Pick the best (fastest) factory for a recipe category.
 */
export function pickFactory(data: PrototypeData, category: string): Entity | null {
  const factories = findFactories(data, category);
  return factories[0] ?? null;
}
