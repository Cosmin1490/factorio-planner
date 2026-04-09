import { loadPrototypes, findTechForRecipe } from '../data/PrototypeLoader.js';

export function techsCommand(protoPath: string, options: { unlocks: string }) {
  const data = loadPrototypes(protoPath);

  const recipe = data.recipes[options.unlocks];
  if (!recipe) {
    console.error(`Recipe "${options.unlocks}" not found`);
    process.exit(1);
  }

  if (!data.technologies || Object.keys(data.technologies).length === 0) {
    console.log('No technology data available. Re-run /helmod-web-export in Factorio to export technologies.');
    return;
  }

  const tech = findTechForRecipe(data, options.unlocks);
  if (tech) {
    console.log(`Recipe "${options.unlocks}" is unlocked by technology: ${tech.name}`);
    if (tech.unlocks.length > 1) {
      console.log(`\nThis technology also unlocks:`);
      for (const other of tech.unlocks) {
        if (other !== options.unlocks) console.log(`  ${other}`);
      }
    }
  } else if (recipe.enabled) {
    console.log(`Recipe "${options.unlocks}" is available from the start (no research needed)`);
  } else {
    console.log(`Recipe "${options.unlocks}" — no matching technology found in exported data`);
  }
}
