import { loadPrototypes, pickFactory } from '../data/PrototypeLoader.js';
import { solve } from '../solver/MatrixSolver.js';
import { exportHelmod } from '../export/helmod.js';
import type { RecipeSpec, SolveInput, ModuleSpec, BeaconSpec } from '../solver/types.js';

interface SolveOptions {
  recipes: string;
  target?: string;
  input?: string;
  time?: string;
  factory?: string[];
  fuel?: string[];
  modules?: string[];
  beacons?: string[];
  export?: string;
  json?: boolean;
}

function parseAmountSpec(spec: string): { name: string; amount: number } {
  const [name, amountStr] = spec.split(':');
  return { name, amount: parseFloat(amountStr) };
}

/**
 * Parse --modules "recipe:module:count[:quality]"
 * Returns a map of recipe name → ModuleSpec[]
 */
function parseModuleSpecs(specs: string[]): Map<string, ModuleSpec[]> {
  const result = new Map<string, ModuleSpec[]>();
  for (const spec of specs) {
    const parts = spec.split(':');
    if (parts.length < 3) {
      console.error(`Invalid module spec "${spec}" — expected "recipe:module:count[:quality]"`);
      process.exit(1);
    }
    const [recipe, moduleName, countStr, quality] = parts;
    const existing = result.get(recipe) ?? [];
    existing.push({ name: moduleName, count: parseInt(countStr, 10), quality });
    result.set(recipe, existing);
  }
  return result;
}

/**
 * Parse --beacons "recipe:beacon:module:moduleCount:beaconCount[:quality]"
 * Returns a map of recipe name → BeaconSpec[]
 */
function parseBeaconSpecs(specs: string[]): Map<string, BeaconSpec[]> {
  const result = new Map<string, BeaconSpec[]>();
  for (const spec of specs) {
    const parts = spec.split(':');
    if (parts.length < 5) {
      console.error(`Invalid beacon spec "${spec}" — expected "recipe:beacon:module:moduleCount:beaconCount[:quality]"`);
      process.exit(1);
    }
    const [recipe, beaconName, moduleName, moduleCountStr, beaconCountStr, quality] = parts;
    const existing = result.get(recipe) ?? [];
    existing.push({
      name: beaconName,
      modules: [{ name: moduleName, count: parseInt(moduleCountStr, 10) }],
      count: parseInt(beaconCountStr, 10),
      quality,
    });
    result.set(recipe, existing);
  }
  return result;
}

export function solveCommand(protoPath: string, options: SolveOptions) {
  const data = loadPrototypes(protoPath);
  const recipeNames = options.recipes.split(',').map(s => s.trim()).filter(Boolean);

  if (recipeNames.length === 0) {
    console.error('No recipes specified');
    process.exit(1);
  }

  // Parse overrides
  const factoryOverrides = new Map<string, string>();
  for (const spec of options.factory ?? []) {
    const [recipe, entity] = spec.split(':');
    factoryOverrides.set(recipe, entity);
  }

  const fuelOverrides = new Map<string, string>();
  for (const spec of options.fuel ?? []) {
    const [recipe, fuelItem] = spec.split(':');
    fuelOverrides.set(recipe, fuelItem);
  }

  const moduleOverrides = parseModuleSpecs(options.modules ?? []);
  const beaconOverrides = parseBeaconSpecs(options.beacons ?? []);

  const time = parseInt(options.time ?? '60', 10);

  // Resolve factories for each recipe
  const recipeSpecs: RecipeSpec[] = [];
  for (const recipeName of recipeNames) {
    const recipe = data.recipes[recipeName];
    if (!recipe) {
      console.error(`Recipe "${recipeName}" not found`);
      process.exit(1);
    }

    let factoryName = factoryOverrides.get(recipeName);
    if (factoryName) {
      const entity = data.entities[factoryName];
      if (!entity) {
        console.error(`Factory "${factoryName}" not found`);
        process.exit(1);
      }
    } else {
      const factory = pickFactory(data, recipe.category);
      if (!factory) {
        console.error(`No factory found for category "${recipe.category}" (recipe: ${recipeName})`);
        process.exit(1);
      }
      factoryName = factory.name;
    }

    recipeSpecs.push({
      recipeName,
      factoryName,
      fuel: fuelOverrides.get(recipeName),
      modules: moduleOverrides.get(recipeName),
      beacons: beaconOverrides.get(recipeName),
    });
  }

  const solveInput: SolveInput = {
    recipes: recipeSpecs,
    time,
  };

  if (options.target) {
    const spec = parseAmountSpec(options.target);
    solveInput.target = spec;
  }
  if (options.input) {
    const spec = parseAmountSpec(options.input);
    solveInput.input = spec;
  }

  console.error('Running solver...');
  const result = solve(data, solveInput);

  if (options.export === 'helmod') {
    const exportString = exportHelmod(solveInput, result, data);
    console.log(exportString);
    return;
  }

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Pretty-print results
  console.log(`\nResults (time base: ${time}s):\n`);
  console.log('Recipe                          Factory                    Count    Speed');
  console.log('─'.repeat(80));

  for (const r of result.recipes) {
    console.log(
      `${r.recipeName.padEnd(32)}${r.factoryName.padEnd(27)}${Math.ceil(r.factoryCount).toString().padStart(5)}    ${r.effectiveSpeed.toFixed(2)}`
    );
  }

  const visibleProducts = result.products.filter(p => p.amount >= 0.01);
  const visibleIngredients = result.ingredients.filter(i => i.amount >= 0.01);

  if (visibleProducts.length > 0) {
    console.log('\nOutputs:');
    for (const p of visibleProducts) {
      console.log(`  ${p.name}: ${p.amount.toFixed(2)}/${time}s`);
    }
  }

  if (visibleIngredients.length > 0) {
    console.log('\nInputs (raw):');
    for (const ing of visibleIngredients) {
      console.log(`  ${ing.name}: ${ing.amount.toFixed(2)}/${time}s`);
    }
  }
}
