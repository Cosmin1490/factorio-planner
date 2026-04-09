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

function formatPower(watts: number): string {
  if (watts >= 1e6) return `${(watts / 1e6).toFixed(1)} MW`;
  if (watts >= 1e3) return `${(watts / 1e3).toFixed(1)} kW`;
  return `${watts.toFixed(0)} W`;
}

export function factoryInfoCommand(protoPath: string, name: string) {
  const data = loadPrototypes(protoPath);
  const entity = data.entities[name];

  if (!entity) {
    console.log(`Entity "${name}" not found`);
    return;
  }

  console.log(`Factory: ${entity.name}`);
  const headerParts: string[] = [`Type: ${entity.type}`];
  if (entity.tile_width && entity.tile_height) {
    headerParts.push(`Size: ${entity.tile_width}x${entity.tile_height}`);
  }
  console.log(headerParts.join('    '));

  const speed = entity.crafting_speed?.['normal'];
  if (speed != null) console.log(`Crafting speed: ${speed}`);

  if (entity.energy_usage != null) {
    const watts = entity.energy_usage * 60;
    console.log(`Energy: ${formatPower(watts)}`);
  }

  // Module info
  const slots = entity.module_inventory_size ?? 0;
  if (slots > 0) {
    const categories = entity.allowed_module_categories
      ? Object.keys(entity.allowed_module_categories).join(', ')
      : 'all';
    console.log(`Module slots: ${slots}    Allowed: ${categories}`);
  }

  // Burner info
  if (entity.burner_prototype) {
    const bp = entity.burner_prototype;
    const fuelCats = Object.keys(bp.fuel_categories).join(', ');
    console.log(`Burner: ${fuelCats}    Effectivity: ${bp.effectivity}`);
  }

  // Crafting categories
  if (entity.crafting_categories) {
    const cats = Object.keys(entity.crafting_categories);
    console.log();
    console.log(`Crafting categories (${cats.length}):`);
    for (const cat of cats) {
      console.log(`  ${cat}`);
    }
  }
}
