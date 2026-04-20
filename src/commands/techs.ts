import { loadPrototypes, findTechForRecipe, Technology } from '../data/PrototypeLoader.js';

function printTechDetails(tech: Technology) {
  if (tech.prerequisites && tech.prerequisites.length > 0) {
    console.log(`Prerequisites: ${tech.prerequisites.join(', ')}`);
  }
  const ingredients = Array.isArray(tech.research_unit_ingredients) ? tech.research_unit_ingredients : [];
  if (tech.research_unit_count && ingredients.length > 0) {
    const packs = ingredients.map(i => `${i.amount}× ${i.name}`).join(', ');
    console.log(`Research cost: ${tech.research_unit_count} units × [${packs}]`);
  }
  const unlocks = Array.isArray(tech.unlocks) ? tech.unlocks : [];
  if (unlocks.length > 0) {
    console.log(`Unlocks: ${unlocks.join(', ')}`);
  }
}

export function techsCommand(protoPath: string, options: { unlocks?: string; tech?: string }) {
  const data = loadPrototypes(protoPath);

  if (!data.technologies || Object.keys(data.technologies).length === 0) {
    console.log('No technology data available. Re-run /helmod-web-export in Factorio to export technologies.');
    return;
  }

  if (options.tech) {
    const tech = data.technologies[options.tech];
    if (!tech) {
      console.error(`Technology "${options.tech}" not found`);
      process.exit(1);
    }
    console.log(`Technology: ${tech.name}`);
    printTechDetails(tech);
    return;
  }

  if (options.unlocks) {
    const recipe = data.recipes[options.unlocks];
    if (!recipe) {
      console.error(`Recipe "${options.unlocks}" not found`);
      process.exit(1);
    }

    const tech = findTechForRecipe(data, options.unlocks);
    if (tech) {
      console.log(`Recipe "${options.unlocks}" is unlocked by technology: ${tech.name}`);
      printTechDetails(tech);
    } else if (recipe.enabled) {
      console.log(`Recipe "${options.unlocks}" is available from the start (no research needed)`);
    } else {
      console.log(`Recipe "${options.unlocks}" — no matching technology found in exported data`);
    }
    return;
  }

  console.error('Provide --unlocks <recipe> or --tech <name>');
  process.exit(1);
}
