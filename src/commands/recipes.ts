import { loadPrototypes, buildProducerIndex, isRecipeUnlocked, findFactories, findTechForRecipe, type PrototypeData } from '../data/PrototypeLoader.js';

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
      const ingredients = (Array.isArray(r.ingredients) ? r.ingredients : []).map(i => `${i.amount ?? '?'}x ${i.name}`).join(', ');
      const products = (Array.isArray(r.products) ? r.products : []).map(p => `${p.amount ?? '?'}x ${p.name}`).join(', ');
      console.log(`  ${r.name}  [${r.category}]  (${r.energy}s)`);
      console.log(`    in:  ${ingredients || '(none)'}`);
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
      const ingredients = (Array.isArray(r.ingredients) ? r.ingredients : []).map(i => `${i.amount ?? '?'}x ${i.name}`).join(', ');
      const products = (Array.isArray(r.products) ? r.products : []).map(p => `${p.amount ?? '?'}x ${p.name}`).join(', ');
      console.log(`  ${r.name}  [${r.category}]  (${r.energy}s)`);
      console.log(`    in:  ${ingredients || '(none)'}`);
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

  // Unlock status
  const unlocked = isRecipeUnlocked(data, recipe.name);
  const tech = findTechForRecipe(data, recipe.name);
  const unlockParts: string[] = [`Unlocked: ${unlocked ? 'yes' : 'no'}`];
  if (tech) unlockParts.push(`Tech: ${tech.name}${tech.researched ? '' : ' (not researched)'}`);
  console.log(unlockParts.join('    '));

  console.log();
  console.log('Ingredients:');
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  for (const i of ingredients) {
    let tempStr = '';
    if (i.minimum_temperature != null && i.minimum_temperature > -1e30) {
      tempStr += ` ≥${i.minimum_temperature}°C`;
    }
    if (i.maximum_temperature != null && i.maximum_temperature < 1e30) {
      tempStr += ` ≤${i.maximum_temperature}°C`;
    }
    console.log(`  ${i.amount ?? '?'}x ${i.name} (${i.type})${tempStr}`);
  }
  console.log();
  console.log('Products:');
  const products = Array.isArray(recipe.products) ? recipe.products : [];
  for (const p of products) {
    const prob = p.probability != null && p.probability < 1 ? ` (${p.probability * 100}%)` : '';
    const temp = p.temperature != null ? ` @ ${p.temperature}°C` : '';
    console.log(`  ${p.amount ?? '?'}x ${p.name} (${p.type})${prob}${temp}`);
  }

  // Compatible factories
  const factories = findFactories(data, recipe.category);
  if (factories.length > 0) {
    console.log();
    console.log(`Factories for [${recipe.category}] (${factories.length}):`);
    for (const f of factories.slice(0, 5)) {
      const speed = f.crafting_speed?.['normal'] ?? '?';
      const slots = f.module_inventory_size ?? 0;
      const burner = f.burner_prototype ? ' (burner)' : '';
      console.log(`  ${f.name}  speed=${speed}  modules=${slots}${burner}`);
    }
    if (factories.length > 5) {
      console.log(`  ... and ${factories.length - 5} more`);
    }
  }
}
