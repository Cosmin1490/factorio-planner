import { loadPrototypes } from '../data/PrototypeLoader.js';

export function itemsCommand(protoPath: string, options: { search: string }) {
  const data = loadPrototypes(protoPath);
  const query = options.search.toLowerCase();

  const matches: string[] = [];

  for (const name of Object.keys(data.items)) {
    if (name.toLowerCase().includes(query)) matches.push(name);
  }
  for (const name of Object.keys(data.fluids)) {
    if (name.toLowerCase().includes(query)) matches.push(name);
  }

  matches.sort();

  if (matches.length === 0) {
    console.log(`No items or fluids matching "${options.search}"`);
    return;
  }

  console.log(`Items/fluids matching "${options.search}" (${matches.length}):\n`);
  for (const name of matches.slice(0, 50)) {
    const isFluid = name in data.fluids;
    console.log(`  ${name}${isFluid ? ' (fluid)' : ''}`);
  }
  if (matches.length > 50) {
    console.log(`  ... and ${matches.length - 50} more`);
  }
}
