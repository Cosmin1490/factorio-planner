#!/usr/bin/env node

import { Command } from 'commander';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { recipesCommand, recipeInfoCommand } from './commands/recipes.js';
import { factoriesCommand } from './commands/factories.js';
import { itemsCommand } from './commands/items.js';
import { solveCommand } from './commands/solve.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

const DEFAULT_PROTO_PATH = resolve(PROJECT_ROOT, 'data/helmod-web-prototypes.json');

const program = new Command();

program
  .name('factorio-planner')
  .description('Factorio production planner')
  .version('0.1.0');

program
  .command('recipes')
  .description('List recipes that produce or consume an item')
  .option('--produces <item>', 'Show recipes that produce this item')
  .option('--consumes <item>', 'Show recipes that consume this item')
  .option('--proto <path>', 'Path to prototype JSON', DEFAULT_PROTO_PATH)
  .action((opts) => {
    recipesCommand(opts.proto, { produces: opts.produces, consumes: opts.consumes });
  });

program
  .command('recipe-info <name>')
  .description('Show detailed info about a recipe')
  .option('--proto <path>', 'Path to prototype JSON', DEFAULT_PROTO_PATH)
  .action((name, opts) => {
    recipeInfoCommand(opts.proto, name);
  });

program
  .command('factories')
  .description('List factories for a recipe category')
  .requiredOption('--category <category>', 'Recipe category')
  .option('--proto <path>', 'Path to prototype JSON', DEFAULT_PROTO_PATH)
  .action((opts) => {
    factoriesCommand(opts.proto, { category: opts.category });
  });

program
  .command('items')
  .description('Search for items and fluids by name')
  .requiredOption('--search <query>', 'Search query')
  .option('--proto <path>', 'Path to prototype JSON', DEFAULT_PROTO_PATH)
  .action((opts) => {
    itemsCommand(opts.proto, { search: opts.search });
  });

program
  .command('solve')
  .description('Solve a production block')
  .requiredOption('--recipes <list>', 'Comma-separated recipe names')
  .option('--target <item:amount>', 'Target output (e.g., "iron-plate:100")')
  .option('--input <item:amount>', 'Constrained input (e.g., "raw-coal:15")')
  .option('--time <seconds>', 'Time base in seconds (default: 60)', '60')
  .option('--factory <recipe:entity...>', 'Factory override (e.g., "iron-plate:stone-furnace")')
  .option('--fuel <recipe:item...>', 'Fuel override for burner factories (e.g., "iron-plate:coal")')
  .option('--json', 'Output raw JSON result')
  .option('--proto <path>', 'Path to prototype JSON', DEFAULT_PROTO_PATH)
  .action((opts) => {
    solveCommand(opts.proto, {
      recipes: opts.recipes,
      target: opts.target,
      input: opts.input,
      time: opts.time,
      factory: opts.factory,
      fuel: opts.fuel,
      json: opts.json,
    });
  });

program.parse();
