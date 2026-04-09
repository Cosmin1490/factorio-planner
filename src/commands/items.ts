import { loadPrototypes, buildConsumerIndex, buildProducerIndex, isRecipeUnlocked } from '../data/PrototypeLoader.js';

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

function formatEnergy(joules: number): string {
  if (joules >= 1e6) return `${(joules / 1e6).toFixed(1)} MJ`;
  if (joules >= 1e3) return `${(joules / 1e3).toFixed(1)} kJ`;
  return `${joules} J`;
}

export function itemInfoCommand(protoPath: string, name: string, options: { unlocked?: boolean }) {
  const data = loadPrototypes(protoPath);
  const filterUnlocked = options.unlocked ?? false;

  const item = data.items[name];
  const fluid = data.fluids[name];

  if (!item && !fluid) {
    console.log(`"${name}" not found in items or fluids`);
    return;
  }

  const consumerIndex = buildConsumerIndex(data);
  const producerIndex = buildProducerIndex(data);

  if (item) {
    // Item header
    console.log(`Item: ${item.name}`);
    const parts: string[] = [`Type: ${item.type}`];
    if (item.stack_size) parts.push(`Stack: ${item.stack_size}`);
    console.log(parts.join('    '));

    if (item.fuel_value && item.fuel_value > 0) {
      const fuelParts = [`Fuel: ${formatEnergy(item.fuel_value)}`];
      if (item.fuel_category) fuelParts.push(`Category: ${item.fuel_category}`);
      if (item.burnt_result) fuelParts.push(`Burns to: ${item.burnt_result.name}`);
      console.log(fuelParts.join('    '));
    }

    if (item.group) console.log(`Group: ${item.group.name}`);
  } else {
    // Fluid header
    console.log(`Fluid: ${fluid!.name}`);
    const parts: string[] = [];
    if (fluid!.fuel_value && fluid!.fuel_value > 0) parts.push(`Fuel: ${formatEnergy(fluid!.fuel_value)}`);
    if (fluid!.heat_capacity) parts.push(`Heat capacity: ${fluid!.heat_capacity.toLocaleString()} J/unit/°C`);
    if (parts.length > 0) console.log(parts.join('    '));

    if (fluid!.default_temperature != null || fluid!.max_temperature != null) {
      const tempParts: string[] = [];
      if (fluid!.default_temperature != null) tempParts.push(`Default: ${fluid!.default_temperature}°C`);
      if (fluid!.max_temperature != null) tempParts.push(`Max: ${fluid!.max_temperature}°C`);
      console.log(tempParts.join('    '));
    }
  }

  console.log();

  // Consumers
  let consumers = consumerIndex.get(name) || [];
  if (filterUnlocked) consumers = consumers.filter(r => isRecipeUnlocked(data, r.name));
  const unlockLabel = filterUnlocked ? ' unlocked' : '';

  console.log(`Consumed by (${consumers.length}${unlockLabel} recipes):`);
  if (consumers.length === 0) {
    console.log('  (none)');
  } else {
    const MAX_SHOW = 15;
    for (const r of consumers.slice(0, MAX_SHOW)) {
      console.log(`  ${r.name}  [${r.category}]  (${r.energy}s)`);
    }
    if (consumers.length > MAX_SHOW) {
      console.log(`  ... and ${consumers.length - MAX_SHOW} more`);
    }
  }

  console.log();

  // Producers
  let producers = producerIndex.get(name) || [];
  if (filterUnlocked) producers = producers.filter(r => isRecipeUnlocked(data, r.name));

  console.log(`Produced by (${producers.length}${unlockLabel} recipes):`);
  if (producers.length === 0) {
    console.log('  (none)');
  } else {
    for (const r of producers) {
      const products = Array.isArray(r.products) ? r.products : [];
      const match = products.find(p => p.name === name);
      const amt = match?.amount ?? '?';
      console.log(`  ${r.name}  [${r.category}]  (${r.energy}s)  → ${amt}x ${name}`);
    }
  }
}
