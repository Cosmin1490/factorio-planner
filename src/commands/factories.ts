import { loadPrototypes, findFactories } from '../data/PrototypeLoader.js';

export function factoriesCommand(protoPath: string, options: { category: string }) {
  const data = loadPrototypes(protoPath);
  const factories = findFactories(data, options.category);

  if (factories.length === 0) {
    console.log(`No factories found for category "${options.category}"`);
    return;
  }

  console.log(`Factories for category "${options.category}" (${factories.length}):\n`);
  for (const f of factories) {
    const speed = f.crafting_speed?.['normal'] ?? '?';
    const slots = f.module_slots ?? 0;
    console.log(`  ${f.name}  speed=${speed}  modules=${slots}  type=${f.type}`);
  }
}
