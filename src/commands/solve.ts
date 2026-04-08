import { resolve } from 'path';
import { loadPrototypes, pickFactory, type PrototypeData } from '../data/PrototypeLoader.js';
import { NodeBridge, type SolverBlock, type SolverEntry } from '../bridge/NodeBridge.js';

interface SolveOptions {
  recipes: string;
  target?: string;
  input?: string;
  time?: string;
  factory?: string[];
  json?: boolean;
}

function parseAmountSpec(spec: string): { name: string; amount: number } {
  const [name, amountStr] = spec.split(':');
  return { name, amount: parseFloat(amountStr) };
}

function buildEntry(
  id: string,
  index: number,
  recipeName: string,
  factoryName: string,
  factoryType: string,
): SolverEntry {
  return {
    id,
    name: recipeName,
    type: 'recipe',
    index,
    count: 0,
    production: 1,
    quality: 'normal',
    base_time: 60,
    factory: {
      name: factoryName,
      type: factoryType,
      quality: 'normal',
      modules: [],
    },
    beacons: [],
    isBlock: false,
    need_candidat_objective: true,
    need_first_candidat_objective: index === 0,
  };
}

export function solveCommand(protoPath: string, luaDir: string, options: SolveOptions) {
  const data = loadPrototypes(protoPath);
  const recipeNames = options.recipes.split(',').map(s => s.trim()).filter(Boolean);

  if (recipeNames.length === 0) {
    console.error('No recipes specified');
    process.exit(1);
  }

  // Parse factory overrides: --factory "recipe:entity"
  const factoryOverrides = new Map<string, string>();
  for (const spec of options.factory ?? []) {
    const [recipe, entity] = spec.split(':');
    factoryOverrides.set(recipe, entity);
  }

  const time = parseInt(options.time ?? '60', 10);
  const isInputMode = !!options.input;

  // Build children
  const children: Record<string, SolverEntry> = {};
  for (let i = 0; i < recipeNames.length; i++) {
    const recipeName = recipeNames[i];
    const recipe = data.recipes[recipeName];
    if (!recipe) {
      console.error(`Recipe "${recipeName}" not found`);
      process.exit(1);
    }

    // Determine factory
    let factoryName = factoryOverrides.get(recipeName);
    let factoryType = 'assembling-machine';
    if (factoryName) {
      const entity = data.entities[factoryName];
      if (!entity) {
        console.error(`Factory "${factoryName}" not found`);
        process.exit(1);
      }
      factoryType = entity.type;
    } else {
      const factory = pickFactory(data, recipe.category);
      if (!factory) {
        console.error(`No factory found for category "${recipe.category}" (recipe: ${recipeName})`);
        process.exit(1);
      }
      factoryName = factory.name;
      factoryType = factory.type;
    }

    const entryId = `entry_${i + 1}`;
    children[entryId] = buildEntry(entryId, i, recipeName, factoryName, factoryType);
  }

  // Parse target/input
  let targetAmount: number | undefined;
  if (options.target) {
    const spec = parseAmountSpec(options.target);
    targetAmount = spec.amount;
  }

  // Build block
  const block: SolverBlock = {
    id: 'block_1',
    name: recipeNames[0],
    children,
    products: {},
    ingredients: {},
    time,
    count: 1,
    by_product: !isInputMode,
    by_factory: isInputMode,
    solver: false,
    isBlock: true,
    index: 0,
    __target_amount: targetAmount,
  };

  // Initialize bridge and run solver
  const bridge = new NodeBridge(luaDir);
  console.error('Initializing solver (loading prototypes)...');
  bridge.init(protoPath);
  console.error('Running solver...');
  const result = bridge.computeBlock(block);

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Pretty-print results
  const resultChildren = (result as Record<string, unknown>).children as Record<string, Record<string, unknown>> | undefined;
  if (!resultChildren) {
    console.log('No results from solver');
    return;
  }

  console.log(`\nResults (time base: ${time}s):\n`);
  console.log('Recipe                          Factory                    Count    Speed');
  console.log('─'.repeat(80));

  for (const [_id, child] of Object.entries(resultChildren)) {
    const name = child.name as string;
    const factory = child.factory as Record<string, unknown>;
    const factoryName = factory.name as string;
    const count = factory.count as number ?? factory.amount as number ?? 0;
    const speed = factory.speed as number ?? 0;
    console.log(
      `${name.padEnd(32)}${factoryName.padEnd(27)}${Math.ceil(count).toString().padStart(5)}    ${speed.toFixed(2)}`
    );
  }

  // Show products and ingredients
  const products = (result as Record<string, unknown>).products as Record<string, Record<string, unknown>> | undefined;
  const ingredients = (result as Record<string, unknown>).ingredients as Record<string, Record<string, unknown>> | undefined;

  if (products && Object.keys(products).length > 0) {
    console.log('\nOutputs:');
    for (const [_key, prod] of Object.entries(products)) {
      const name = prod.name as string ?? _key;
      const amount = prod.count as number ?? prod.amount as number ?? 0;
      if (amount > 0.001) {
        console.log(`  ${name}: ${amount.toFixed(2)}/${time}s`);
      }
    }
  }

  if (ingredients && Object.keys(ingredients).length > 0) {
    console.log('\nInputs (raw):');
    for (const [_key, ing] of Object.entries(ingredients)) {
      const name = ing.name as string ?? _key;
      const amount = ing.count as number ?? ing.amount as number ?? 0;
      if (amount > 0.001) {
        console.log(`  ${name}: ${amount.toFixed(2)}/${time}s`);
      }
    }
  }

  const power = (result as Record<string, unknown>).power as number | undefined;
  if (power) {
    console.log(`\nTotal power: ${(power / 1000).toFixed(1)} kW`);
  }
}
