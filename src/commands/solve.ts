import { loadPrototypes, pickFactory, isRecipeUnlocked } from '../data/PrototypeLoader.js';
import { solve } from '../solver/MatrixSolver.js';
import { exportHelmod } from '../export/helmod.js';
import type { RecipeSpec, SolveInput, ModuleSpec, BeaconSpec, SolverMode, ConstraintSpec } from '../solver/types.js';

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
  solver?: string;
  constraint?: string[];
  maxImport?: string[];
  unlocked?: boolean;
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

    if (options.unlocked) {
      if (!isRecipeUnlocked(data, recipeName)) {
        console.error(`Warning: recipe "${recipeName}" is not unlocked in your save`);
      }
      if (!isRecipeUnlocked(data, factoryName)) {
        console.error(`Warning: factory "${factoryName}" is not unlocked in your save`);
      }
    }

    const mods = moduleOverrides.get(recipeName);
    const beacs = beaconOverrides.get(recipeName);
    if (options.unlocked) {
      for (const mod of mods ?? []) {
        if (!isRecipeUnlocked(data, mod.name)) {
          console.error(`Warning: module "${mod.name}" is not unlocked in your save`);
        }
      }
      for (const b of beacs ?? []) {
        if (!isRecipeUnlocked(data, b.name)) {
          console.error(`Warning: beacon "${b.name}" is not unlocked in your save`);
        }
        for (const mod of b.modules) {
          if (!isRecipeUnlocked(data, mod.name)) {
            console.error(`Warning: module "${mod.name}" is not unlocked in your save`);
          }
        }
      }
    }

    recipeSpecs.push({
      recipeName,
      factoryName,
      fuel: fuelOverrides.get(recipeName),
      modules: mods,
      beacons: beacs,
    });
  }

  // Parse constraints
  const constraints: ConstraintSpec[] = [];
  for (const spec of options.constraint ?? []) {
    const parts = spec.split(':');
    if (parts.length < 3) {
      console.error(`Invalid constraint "${spec}" — expected "recipe:product:master|exclude"`);
      process.exit(1);
    }
    const [recipe, product, type] = parts;
    if (type !== 'master' && type !== 'exclude') {
      console.error(`Invalid constraint type "${type}" — must be "master" or "exclude"`);
      process.exit(1);
    }
    constraints.push({ recipeName: recipe, productName: product, type });
  }

  // Simplex is the default — LP cost minimization for target mode, legacy Helmod-style for input mode.
  // Algebra is legacy, breaks on 12+ recipe chains (astronomical numbers). Still available via --solver algebra.
  const solverMode = (options.solver ?? 'simplex') as SolverMode;
  if (solverMode !== 'algebra' && solverMode !== 'simplex') {
    console.error(`Invalid solver "${options.solver}" — must be "algebra" or "simplex"`);
    process.exit(1);
  }

  const solveInput: SolveInput = {
    recipes: recipeSpecs,
    time,
    solver: solverMode,
    constraints: constraints.length > 0 ? constraints : undefined,
  };

  if (options.target) {
    const spec = parseAmountSpec(options.target);
    solveInput.target = spec;
  }
  if (options.input) {
    const rawInputs = Array.isArray(options.input) ? options.input : [options.input];
    solveInput.inputs = rawInputs.map(parseAmountSpec);
  }
  if (options.maxImport) {
    const rawMaxImports = Array.isArray(options.maxImport) ? options.maxImport : [options.maxImport];
    solveInput.maxImports = rawMaxImports.map(parseAmountSpec);
  }

  console.error('Running solver...');
  const result = solve(data, solveInput);

  if (result.warnings.length > 0) {
    console.error('\nWarnings:');
    for (const w of result.warnings) {
      console.error(`  \u26a0 ${w.message}`);
      if (w.type === 'cycle') {
        const { recipes: cycleRecipes, items: cycleItems } = w.detail;
        // Suggest excluding each cyclic item from the first recipe that produces it
        const suggestion = cycleRecipes[0] && cycleItems[0]
          ? `--constraint "${cycleRecipes[0]}:${cycleItems[0]}:exclude"`
          : '';
        if (suggestion) console.error(`    Consider: ${suggestion}`);
      }
    }
  }

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

  // Build module string lookup from recipeSpecs
  const modulesByRecipe = new Map<string, string>();
  for (const spec of recipeSpecs) {
    if (spec.modules && spec.modules.length > 0) {
      const parts = spec.modules.map(m => `${m.count}x ${m.name}`);
      modulesByRecipe.set(spec.recipeName, parts.join(', '));
    }
  }

  const hasModules = modulesByRecipe.size > 0;
  const recipeRows = result.recipes.map(r => ({
    recipe: r.recipeName,
    factory: r.factoryName,
    count: Math.ceil(r.factoryCount).toString(),
    modules: modulesByRecipe.get(r.recipeName) ?? '',
  }));

  const rW = Math.max(6, ...recipeRows.map(r => r.recipe.length));
  const fW = Math.max(7, ...recipeRows.map(r => r.factory.length));
  const cW = Math.max(5, ...recipeRows.map(r => r.count.length));
  const mW = hasModules ? Math.max(7, ...recipeRows.map(r => r.modules.length)) : 0;

  const rLine = (l: string, m: string, r: string) => {
    const cols = [`─`.repeat(rW + 2), `─`.repeat(fW + 2), `─`.repeat(cW + 2)];
    if (hasModules) cols.push(`─`.repeat(mW + 2));
    return `${l}${cols.join(m)}${r}`;
  };
  const rRow = (recipe: string, factory: string, count: string, modules: string) => {
    const cols = [` ${recipe.padEnd(rW)} `, ` ${factory.padEnd(fW)} `, ` ${count.padStart(cW)} `];
    if (hasModules) cols.push(` ${modules.padEnd(mW)} `);
    return `│${cols.join('│')}│`;
  };

  console.log(rLine('┌', '┬', '┐'));
  console.log(rRow('Recipe', 'Factory', 'Count', 'Modules'));
  console.log(rLine('├', '┼', '┤'));
  for (const r of recipeRows) {
    console.log(rRow(r.recipe, r.factory, r.count, r.modules));
  }
  console.log(rLine('└', '┴', '┘'));

  const totalBuildings = result.recipes.reduce((sum, r) => sum + Math.ceil(r.factoryCount), 0);
  const powerStr = result.totalPowerMW >= 1
    ? `${result.totalPowerMW.toFixed(2)} MW`
    : `${(result.totalPowerMW * 1000).toFixed(1)} kW`;
  console.log(`\n${totalBuildings} buildings, ${powerStr} electric`);

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

  if (result.intermediates.length > 0) {
    console.log('\nIntermediates:');

    // Build rows: [item, rate, producer(s), consumer(s)]
    const imRows: [string, string, string, string][] = [];
    for (const im of result.intermediates) {
      const prodStr = im.producers.map(p => `${p.recipeName} ${p.amount.toFixed(2)}/${time}s`).join(' + ');
      const consStr = im.consumers.map(c => `${c.recipeName} ${c.amount.toFixed(2)}/${time}s`).join(', ');
      imRows.push([im.name, `${im.totalFlow.toFixed(2)}/${time}s`, prodStr, consStr]);
    }

    const headers = ['Item', 'Rate', 'Producer', 'Consumer'];
    const widths = headers.map((h, i) => Math.max(h.length, ...imRows.map(r => r[i].length)));

    const pad = (s: string, w: number, right = false) => right ? s.padStart(w) : s.padEnd(w);
    const line = (l: string, m: string, r: string) =>
      `${l}${widths.map(w => '─'.repeat(w + 2)).join(m)}${r}`;

    console.log(line('┌', '┬', '┐'));
    console.log(`│ ${headers.map((h, i) => pad(h, widths[i])).join(' │ ')} │`);
    console.log(line('├', '┼', '┤'));
    for (const row of imRows) {
      console.log(`│ ${row.map((cell, i) => pad(cell, widths[i], i === 1)).join(' │ ')} │`);
    }
    console.log(line('└', '┴', '┘'));
  }
}
