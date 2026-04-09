import { loadPrototypes, buildProducerIndex, buildConsumerIndex, pickFactory, isRecipeUnlocked } from '../data/PrototypeLoader.js';
import type { Recipe, PrototypeData, ProducerIndex, ConsumerIndex } from '../data/PrototypeLoader.js';

interface RecipeTreeOptions {
  needs?: string;
  producesFrom?: string;
  depth?: string;
  unlocked?: boolean;
}

export function recipeTreeCommand(protoPath: string, options: RecipeTreeOptions) {
  if (!options.needs && !options.producesFrom) {
    console.error('Specify --needs <item> or --produces-from <item>');
    process.exit(1);
  }
  if (options.needs && options.producesFrom) {
    console.error('Specify only one of --needs or --produces-from');
    process.exit(1);
  }

  const data = loadPrototypes(protoPath);
  const maxDepth = options.depth ? parseInt(options.depth, 10) : Infinity;
  const showUnlocked = !!options.unlocked;

  if (options.needs) {
    const producerIndex = buildProducerIndex(data);
    console.log(options.needs);
    printNeedsTree(data, producerIndex, options.needs, maxDepth, showUnlocked, '', true, new Set());
  } else {
    const consumerIndex = buildConsumerIndex(data);
    console.log(options.producesFrom);
    printProducesTree(data, consumerIndex, options.producesFrom!, maxDepth, showUnlocked, '', true, new Set());
  }
}

function formatRecipeLine(data: PrototypeData, recipe: Recipe): string {
  const factory = pickFactory(data, recipe.category);
  const factoryStr = factory ? ` (${factory.name})` : '';
  const energyStr = ` ${recipe.energy}s`;
  return `[${recipe.name}]${factoryStr}${energyStr}`;
}

function filterRecipes(data: PrototypeData, recipes: Recipe[], onlyUnlocked: boolean): Recipe[] {
  if (!onlyUnlocked) return recipes;
  return recipes.filter(r => isRecipeUnlocked(data, r.name));
}

function printNeedsTree(
  data: PrototypeData,
  producerIndex: ProducerIndex,
  itemName: string,
  maxDepth: number,
  onlyUnlocked: boolean,
  prefix: string,
  isRoot: boolean,
  visited: Set<string>,
) {
  const recipes = filterRecipes(data, producerIndex.get(itemName) ?? [], onlyUnlocked);

  if (recipes.length === 0) return; // raw material — already marked by caller

  for (let ri = 0; ri < recipes.length; ri++) {
    const recipe = recipes[ri];
    const isLastRecipe = ri === recipes.length - 1;
    const branch = isLastRecipe ? '└─ ' : '├─ ';
    const childPrefix = isLastRecipe ? '   ' : '│  ';

    console.log(`${prefix}${branch}${formatRecipeLine(data, recipe)}`);

    if (visited.has(recipe.name)) {
      console.log(`${prefix}${childPrefix}   (see above)`);
      continue;
    }

    if (maxDepth <= 0) continue;

    visited.add(recipe.name);

    const ingredients = recipe.ingredients;
    for (let ii = 0; ii < ingredients.length; ii++) {
      const ing = ingredients[ii];
      const isLastIng = ii === ingredients.length - 1;
      const ingBranch = isLastIng ? '└─ ' : '├─ ';
      const ingChildPrefix = isLastIng ? '   ' : '│  ';
      const amount = ing.amount ?? 1;

      const producers = filterRecipes(data, producerIndex.get(ing.name) ?? [], onlyUnlocked);
      const rawMarker = producers.length === 0 ? ' ★ raw' : '';

      console.log(`${prefix}${childPrefix}${ingBranch}${amount}x ${ing.name}${rawMarker}`);

      if (producers.length > 0) {
        printNeedsTree(
          data, producerIndex, ing.name, maxDepth - 1, onlyUnlocked,
          `${prefix}${childPrefix}${ingChildPrefix}`, false, visited,
        );
      }
    }
  }
}

function printProducesTree(
  data: PrototypeData,
  consumerIndex: ConsumerIndex,
  itemName: string,
  maxDepth: number,
  onlyUnlocked: boolean,
  prefix: string,
  isRoot: boolean,
  visited: Set<string>,
) {
  const recipes = filterRecipes(data, consumerIndex.get(itemName) ?? [], onlyUnlocked);

  if (recipes.length === 0) return;

  for (let ri = 0; ri < recipes.length; ri++) {
    const recipe = recipes[ri];
    const isLastRecipe = ri === recipes.length - 1;
    const branch = isLastRecipe ? '└─ ' : '├─ ';
    const childPrefix = isLastRecipe ? '   ' : '│  ';

    console.log(`${prefix}${branch}${formatRecipeLine(data, recipe)}`);

    if (visited.has(recipe.name)) {
      console.log(`${prefix}${childPrefix}   (see above)`);
      continue;
    }

    if (maxDepth <= 0) continue;

    visited.add(recipe.name);

    const products = Array.isArray(recipe.products) ? recipe.products : [];
    for (let pi = 0; pi < products.length; pi++) {
      const prod = products[pi];
      const isLastProd = pi === products.length - 1;
      const prodBranch = isLastProd ? '└─ ' : '├─ ';
      const prodChildPrefix = isLastProd ? '   ' : '│  ';
      const amount = prod.amount ?? 1;

      const consumers = filterRecipes(data, consumerIndex.get(prod.name) ?? [], onlyUnlocked);
      const terminalMarker = consumers.length === 0 ? ' ★ terminal' : '';

      console.log(`${prefix}${childPrefix}${prodBranch}${amount}x ${prod.name}${terminalMarker}`);

      if (consumers.length > 0) {
        printProducesTree(
          data, consumerIndex, prod.name, maxDepth - 1, onlyUnlocked,
          `${prefix}${childPrefix}${prodChildPrefix}`, false, visited,
        );
      }
    }
  }
}
