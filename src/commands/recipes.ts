import { loadPrototypes, buildProducerIndex, isRecipeUnlocked, type PrototypeData } from '../data/PrototypeLoader.js';

export function recipesCommand(protoPath: string, options: { produces?: string; consumes?: string; unlocked?: boolean }) {
  const data = loadPrototypes(protoPath);
  const filterUnlocked = options.unlocked ?? false;

  if (options.produces) {
    const index = buildProducerIndex(data);
    let recipes = index.get(options.produces);
    if (!recipes || recipes.length === 0) {
      console.log(`No recipes produce "${options.produces}"`);
      return;
    }
    if (filterUnlocked) {
      recipes = recipes.filter(r => isRecipeUnlocked(data, r.name));
    }
    const label = filterUnlocked ? ' (unlocked only)' : '';
    console.log(`Recipes that produce "${options.produces}" (${recipes.length})${label}:\n`);
    for (const r of recipes) {
      const ingredients = r.ingredients.map(i => `${i.amount ?? '?'}x ${i.name}`).join(', ');
      const products = r.products.map(p => `${p.amount ?? '?'}x ${p.name}`).join(', ');
      console.log(`  ${r.name}  [${r.category}]  (${r.energy}s)`);
      console.log(`    in:  ${ingredients}`);
      console.log(`    out: ${products}`);
      console.log();
    }
  }

  if (options.consumes) {
    let results: typeof data.recipes[string][] = [];
    for (const recipe of Object.values(data.recipes)) {
      if (recipe.hidden) continue;
      const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
      if (ingredients.some(i => i.name === options.consumes)) {
        results.push(recipe);
      }
    }
    if (filterUnlocked) {
      results = results.filter(r => isRecipeUnlocked(data, r.name));
    }
    const label = filterUnlocked ? ' (unlocked only)' : '';
    console.log(`Recipes that consume "${options.consumes}" (${results.length})${label}:\n`);
    for (const r of results) {
      const ingredients = r.ingredients.map(i => `${i.amount ?? '?'}x ${i.name}`).join(', ');
      const products = r.products.map(p => `${p.amount ?? '?'}x ${p.name}`).join(', ');
      console.log(`  ${r.name}  [${r.category}]  (${r.energy}s)`);
      console.log(`    in:  ${ingredients}`);
      console.log(`    out: ${products}`);
      console.log();
    }
  }
}

export function recipeInfoCommand(protoPath: string, recipeName: string) {
  const data = loadPrototypes(protoPath);
  const recipe = data.recipes[recipeName];
  if (!recipe) {
    console.log(`Recipe "${recipeName}" not found`);
    return;
  }

  console.log(`Recipe: ${recipe.name}`);
  console.log(`Category: ${recipe.category}`);
  console.log(`Energy: ${recipe.energy}s`);
  console.log(`Hidden: ${recipe.hidden}`);
  console.log(`Enabled: ${recipe.enabled}`);
  console.log();
  console.log('Ingredients:');
  for (const i of recipe.ingredients) {
    console.log(`  ${i.amount ?? '?'}x ${i.name} (${i.type})`);
  }
  console.log();
  console.log('Products:');
  for (const p of recipe.products) {
    const prob = p.probability != null && p.probability < 1 ? ` (${p.probability * 100}%)` : '';
    console.log(`  ${p.amount ?? '?'}x ${p.name} (${p.type})${prob}`);
  }
}
