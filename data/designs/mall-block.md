# Mall block — infrastructure crafting

A singleton setup that crafts low-volume infrastructure items. The one block type where production block rules don't apply.

## Why it's special

- **Throughput doesn't matter** for most items (locomotives, buildings, tanks, poles). Belts and inserters may need higher throughput during expansion phases.
- **Never stamped** — you only need one mall. The sole exception to rule 25.
- **Can span 2-4+ adjacent city blocks** — belt coupling and bots between subblocks are fine since you never copy it.
- **1 assembler per recipe**, buffer chests on outputs. The constraint is station count and ingredient variety, not building count.

## Top shared ingredients

These 5 items appear across most mall recipes — they form the "mall bus":

| Ingredient | Recipes using it |
|---|---|
| small-parts-01 | 13 |
| steel-plate | 12 |
| iron-plate | 10+ |
| electronic-circuit | 9 |
| duralumin | 8 |

## Natural groupings

Group recipes that share inputs to minimize station count.

### Train vehicles
locomotive, cargo-wagon, fluid-wagon

Shared: steel-plate, duralumin, intermetallics, brake-mk01, shaft-mk01, small-parts-01

| Recipe | Key ingredients |
|---|---|
| locomotive | 30 steel, 25 duralumin, 5 intermetallics, 4 brake-mk01, 1 gearbox-mk01, 4 shaft-mk01, 2 steam-engine, 10 e-circuit, 20 small-parts, 20 pipe |
| cargo-wagon | 20 steel, 10 duralumin, 5 intermetallics, 2 brake-mk01, 2 shaft-mk01, 50 titanium-plate, 10 small-parts, 20 iron-plate |
| fluid-wagon | 16 steel, 10 duralumin, 5 intermetallics, 2 brake-mk01, 2 shaft-mk01, 50 titanium-plate, 1 storage-tank, 8 pipe, 10 small-parts |

### Rail infrastructure
rail, train-stop, rail-signal, rail-chain-signal

| Recipe | Key ingredients |
|---|---|
| rail | 1 steel, 5 solder, 4 bolts, 2 treated-wood, 1 stone |
| train-stop | 3 steel, 5 e-circuit, 6 iron-plate, 6 iron-stick |
| rail-signal | 1 e-circuit, 5 iron-plate |
| rail-chain-signal | 1 e-circuit, 5 iron-plate |

### Belts
transport-belt, underground-belt, splitter

| Recipe | Key ingredients |
|---|---|
| transport-belt | 1 small-parts, 1 iron-plate |
| underground-belt | 10 transport-belt, 10 iron-plate |
| splitter | 4 transport-belt, 1 e-circuit, 5 iron-plate |

Note: fast-transport-belt needs lubricant (fluid), small-parts-02, stainless-steel, nbfe-alloy — separate station group.

### Inserters
inserter, fast-inserter, long-handed-inserter

| Recipe | Key ingredients |
|---|---|
| inserter | 1 burner-inserter, 2 e-circuit, 3 small-parts, 1 duralumin |
| fast-inserter | 1 inserter, 4 e-circuit, 10 small-parts, 1 vitreloy, 3 nbfe-alloy, 1 belt |
| long-handed-inserter | 1 inserter, 1 e-circuit, 5 small-parts, 10 chromium, 1 fenxsb-alloy, 1 belt |

### Power distribution
medium-electric-pole, big-electric-pole, substation

| Recipe | Key ingredients |
|---|---|
| medium-electric-pole | 2 copper-cable, 1 chromium, 4 aluminium-plate |
| big-electric-pole | 4 concrete, 6 steel, 2 niobium-plate, 19 tinned-cable |
| substation | 6 copper-cable, 5 advanced-circuit, 10 stainless-steel |

### Piping
pipe, pipe-to-ground, pump, offshore-pump

| Recipe | Key ingredients |
|---|---|
| pipe | 1 iron-plate |
| pipe-to-ground | 10 pipe, 5 iron-plate |
| pump | 1 pipe, 1 engine-unit, 1 steel |
| offshore-pump | 3 pipe, 2 small-parts |

### Combinators
constant, decider, arithmetic

All three: battery-mk01, copper-cable, electronic-circuit. Nearly identical ingredient lists.

### Storage
storage-tank, py-tank-4000

| Recipe | Key ingredients |
|---|---|
| storage-tank | 5 steel, 20 duralumin, 10 lead-plate |
| py-tank-4000 | 8 pipe, 40 iron-stick, 30 lead-plate |

### Building materials
stone-brick, concrete, landfill

| Recipe | Key ingredients |
|---|---|
| stone-brick | 2 stone |
| concrete | 5 lime, 10 gravel, 10 sand, 100 water |
| landfill | 30 stone, 30 gravel, 30 soil |

## Sub-components: inline vs import

**Import from bus** (high consumer count, shared across many blocks):
- small-parts-01, electronic-circuit, steel-plate, duralumin, iron-plate, copper-cable

**Inline in mall** (used only by mall recipes, no other consumers):
- brake-mk01, gearbox-mk01, shaft-mk01, steam-engine
- These have deep ingredient chains themselves (brake-mk01 needs vitreloy, ceramic, glass, copper-plate, duralumin, small-parts, steel)

## When to build

As soon as steel-plate, electronic-circuit, and small-parts-01 are available on the bus. Start with rail + belt + inserter groups (highest consumption during expansion), add train vehicles and other groups as ingredients become available.
