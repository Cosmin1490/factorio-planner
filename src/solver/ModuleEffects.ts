/**
 * Computes effective module and beacon effects for a recipe/factory combination.
 */

import type { Entity, Item, Recipe } from '../data/PrototypeLoader.js';
import type { BeaconSpec, EffectTotals, ModuleSpec } from './types.js';

const EFFECT_KEYS = ['speed', 'productivity', 'consumption', 'pollution', 'quality'] as const;

function emptyEffects(): EffectTotals {
  return { speed: 0, productivity: 0, consumption: 0, pollution: 0, quality: 0 };
}

/**
 * Look up a module's effects for a given quality tier.
 * Returns per-effect bonuses (e.g., { speed: 0.4, consumption: 1 }).
 */
function getModuleEffects(
  items: Record<string, Item>,
  moduleName: string,
  quality: string = 'normal',
): Record<string, number> {
  const item = items[moduleName];
  if (!item?.module_effects) return {};
  return item.module_effects[quality] ?? item.module_effects['normal'] ?? {};
}

/**
 * Compute the quality level index (for beacon effectivity bonus).
 */
function qualityLevel(quality: string): number {
  const levels: Record<string, number> = {
    normal: 0,
    uncommon: 1,
    rare: 2,
    epic: 3,
    legendary: 4,
  };
  return levels[quality] ?? 0;
}

/**
 * Compute combined module + beacon effects for a factory.
 */
export function computeEffects(
  items: Record<string, Item>,
  entities: Record<string, Entity>,
  recipe: Recipe,
  factory: Entity,
  modules: ModuleSpec[],
  beacons: BeaconSpec[],
): EffectTotals {
  const effects = emptyEffects();

  // Factory modules
  for (const mod of modules) {
    const modEffects = getModuleEffects(items, mod.name, mod.quality);
    for (const key of EFFECT_KEYS) {
      effects[key] += (modEffects[key] ?? 0) * mod.count;
    }
  }

  // Beacon contributions
  for (const beacon of beacons) {
    const beaconEntity = entities[beacon.name];
    if (!beaconEntity) continue;

    const baseEffectivity = beaconEntity.distribution_effectivity ?? 0.5;
    const bonusPerLevel = beaconEntity.distribution_effectivity_bonus_per_quality_level ?? 0;
    const effectivity = baseEffectivity + qualityLevel(beacon.quality ?? 'normal') * bonusPerLevel;

    // Profile-based diminishing returns
    // beacon.count is the number of beacons; profile[i] gives effectiveness at distance index i
    // For simplicity, we use profile[0] (adjacent) scaled by count
    // In practice, Helmod uses beacon_counter to look up profile index
    const profile = beaconEntity.profile;
    const profileEffectivity = profile && profile.length > 0 ? profile[0] : 1;

    for (const mod of beacon.modules) {
      const modEffects = getModuleEffects(items, mod.name, mod.quality);
      // Only apply effects that the beacon allows
      const allowedEffects = beaconEntity.allowed_effects ?? {};
      for (const key of EFFECT_KEYS) {
        if (allowedEffects[key] !== false) {
          effects[key] += (modEffects[key] ?? 0) * mod.count * beacon.count * effectivity * profileEffectivity;
        }
      }
    }
  }

  // Clamp effects
  const maxProductivity = recipe.maximum_productivity ?? 300; // default generous cap
  effects.productivity = Math.max(0, Math.min(effects.productivity, maxProductivity));
  effects.speed = Math.max(-0.8, effects.speed);
  effects.consumption = Math.max(-0.8, effects.consumption);
  effects.pollution = Math.max(-0.8, effects.pollution);

  return effects;
}

/**
 * Compute effective factory speed (crafts per second) for a recipe.
 */
export function effectiveSpeed(
  factory: Entity,
  effects: EffectTotals,
  quality: string = 'normal',
): number {
  const baseCraftingSpeed = factory.crafting_speed?.[quality] ?? factory.crafting_speed?.['normal'] ?? 1;
  return baseCraftingSpeed * (1 + effects.speed);
}

/**
 * Compute effective productivity multiplier (1 + bonus).
 */
export function effectiveProductivity(effects: EffectTotals): number {
  return 1 + effects.productivity;
}
