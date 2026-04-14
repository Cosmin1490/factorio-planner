# Mall block — infrastructure crafting

A singleton setup that crafts low-volume infrastructure items. The one block type where production block rules don't apply.

## Why it's special

- **Throughput doesn't matter** for most items (locomotives, buildings, tanks, poles). Belts and inserters may need higher throughput during expansion phases.
- **Never stamped** — you only need one mall. The sole exception to rule 25.
- **Can span 2-4+ adjacent city blocks** — belt coupling and bots between subblocks are fine since you never copy it.
- **1 assembler per recipe** is the simple approach — buffer chests on outputs. But see the MAM pattern below for fewer assemblers via recipe swapping.

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
- electronic-circuit, steel-plate, duralumin, iron-plate, intermetallics, glass, solder

**MAM self-crafted** (crafting category, cheap from imported plates — no dedicated block needed):
- small-parts-01, bolts, copper-cable, iron-gear-wheel, pipe, iron-stick

**Inline specialized buildings** (mall-adjacent, require non-crafting factories):
- brake-mk01 (needs ceramic from hpf), gearbox-mk01, shaft-mk01, steam-engine
- These have deep ingredient chains themselves (brake-mk01 needs vitreloy, ceramic, glass, copper-plate, duralumin, small-parts, steel)

## MAM pattern (Make Anything Machine)

*Community term from the Pyanodon Discord and r/pyanodons. "MAM" = Make Anything Machine (sometimes "Make Everything Machine"). The mechanics are standard Factorio 2.0 circuit-based recipe setting + Pyanodon warehouses. See [u/laserbeam3's r/factorio post](https://www.reddit.com/r/factorio/comments/1oxokr2/pyanodons_early_game_mall/) and [r/pyanodons MAM thread](https://www.reddit.com/r/pyanodons/comments/1qsf1n2/do_you_also_build_huge_mams_in_py/) for community examples.*

Instead of 1 dedicated assembler per recipe, use Factorio 2.0's circuit-based recipe setting to have shared assemblers dynamically swap between recipes. Combined with Pyanodon's warehouses (450 slots) as smart buffers, this dramatically reduces assembler count.

### How it works

1. **Warehouse as buffer + inventory monitor** — a `py-warehouse-basic` (6x6, 450 slots) stores all outputs. Connect it to the circuit network — it broadcasts current stock levels for every item inside.
2. **Constant combinator sets targets** — define desired stock per item (e.g., signal small-parts-01 = 200, signal bolts = 100, signal iron-gear-wheel = 50).
3. **Decider combinator compares** — for each item, if warehouse stock < target, output that item's signal. Uses the `each` virtual signal to compare all items in parallel.
4. **Assembler reads signal → sets recipe** — the assembler is configured to "set recipe based on incoming signals." It picks whichever item is below threshold and crafts it. When the recipe signal changes, the assembler finishes its current craft, then switches.
5. **Inserters feed from shared input chests/warehouses** — since recipes in the same crafting category share many inputs (iron-plate, copper-plate, etc.), the inserter setup can be simple.

### Community implementations

**u/laserbeam3's belt-based MAM** (r/factorio, 88 upvotes):
- 4 `automated-factory-mk01` producing from a single warehouse
- 3 configurable logistics groups carried as blueprints: **Mall Products** (outputs), **Mall Intermediates** (internal crafts like wires/solder), **Mall Inputs** (imports from bus)
- A "brain" circuit checks warehouse inventory against desired quantities, enables recipes only when ingredients are sufficient
- Assemblers keep a recipe active until satisfied or idle — not just threshold-based swapping
- All outputs extracted from warehouse, resorted when product list changes
- Works without bots — belts + circuits + warehouses only. Upgraded to better inserters and bots over time.

**r/pyanodons community approaches**:
- **Modular units** (u/BeanBayFrijoles): many smaller MAM units supplied by bots, each with its own recipe list. Higher-tier items on separate units to avoid dependency issues.
- **Overfilling prevention** is a recurring theme — several players use circuits or inserter crane stack size control to avoid jamming assemblers with wrong ingredients during recipe switches.
- **Hysteresis**: build until `amount > target + buffer`, don't restart until `amount < target`. Prevents rapid recipe oscillation (u/Miserable-Theme-1280).
- **Dependency tiers** (u/Miserable-Theme-1280): successive tiers of MAM units — lower tiers craft ingredients for higher tiers. Avoids circular dependencies within a single MAM.
- **Recipe Combinator mod** (u/bitwiseshiftleft): provides circuit signals for recipe ingredients/products/crafting times — useful for advanced MAM control logic.

### Why it works for malls

- **Throughput doesn't matter** — a single assembler cycling through 5 recipes at 20% duty cycle each still produces far more than you consume of any individual item.
- **Same crafting category** — recipes within a category (e.g., `crafting`) run on the same assembler type. Small-parts-01, bolts, iron-gear-wheel, copper-cable, pipe — all `crafting`, one `automated-factory` handles them all.
- **Warehouses absorb variance** — 450 slots buffer enough stock to cover gaps while the assembler works on other recipes.
- **Warehouse footprint enables shared access** — the 6x6 warehouse can serve multiple assemblers simultaneously. Unlike vanilla chests (1x1) where only 1-2 inserters fit per side, a warehouse has 24 tiles of perimeter — enough for 6+ assemblers to insert/extract from the same buffer. This physical advantage is what makes the shared-buffer pattern practical; vanilla chests can't do it.

### MAM vs dedicated assemblers

| | Dedicated (1 per recipe) | MAM (shared + recipe swap) |
|---|---|---|
| Assembler count | 1 per recipe (~40 total) | ~5-10 total (grouped by crafting category) |
| Circuit complexity | None | Moderate (combinator logic per group) |
| Throughput | Continuous per item | Time-shared, lower per item |
| Intermediates | Import or inline separately | **Can self-craft** — the MAM crafts its own intermediates (small-parts, bolts, copper-cable) between end-product runs, reducing import stations |
| Space | More assemblers, simpler wiring | Fewer assemblers, more combinators + warehouses |

### Self-crafting intermediates

The MAM's strongest advantage: it can craft intermediates as part of its recipe rotation. Instead of importing small-parts-01, bolts, copper-cable, and iron-gear-wheel from bus blocks, the MAM imports only raw plates (iron, copper) and crafts the intermediates itself — the warehouse monitors stock of both intermediates and end products, and the assembler prioritizes whichever is lowest.

This collapses the import station list from ~15 (plates + intermediates) to ~6-8 (plates only). The trade-off is throughput — intermediates share assembler time with end products — but since mall throughput doesn't matter, this is free.

### Limitations

- **Cross-category recipes can't share** — a `crafting` assembler can't run `advanced-foundry` recipes. Group MAMs by crafting category.
- **Fluid ingredients** — recipes needing fluids (fast-transport-belt needs lubricant, concrete needs water) require pipe connections. Recipes with different fluid inputs can't easily share one assembler unless you valve/switch the pipes.
- **Recipe transition delay** — when the assembler switches recipes, it finishes the current craft first, then clears ingredients for the new recipe. Leftover ingredients from the old recipe go to the output, not back to input. Design inserter logic to handle this (filter inserters, or accept small waste).
- **Ingredient overfilling** — inserters loading ingredients don't know when a recipe switch is coming. Large stack sizes can jam the assembler with wrong ingredients. Mitigations: inserter crane stack size control, circuit-controlled inserters that check the current recipe signal, or simply accepting slower loading with stack size 1.
- **Signal priority** — when multiple items are below threshold simultaneously, the assembler picks one (lowest signal index). This is fine for malls — all items eventually get crafted.

### Pyanodon warehouse variants

| Building | Size | Slots | Type |
|---|---|---|---|
| py-warehouse-basic | 6x6 | 450 | Container (no logistics) |
| py-warehouse-passive-provider | 6x6 | 450 | Logistic — bots pick up |
| py-warehouse-requester | 6x6 | 450 | Logistic — bots deliver |
| py-warehouse-buffer | 6x6 | 450 | Logistic — bots use as overflow |
| py-warehouse-storage | 6x6 | 450 | Logistic — bot storage |
| py-warehouse-active-provider | 6x6 | 450 | Logistic — bots actively empty |

Use **passive-provider** for output warehouses (bots or inserters pick up finished items) and **requester** for input warehouses (bots deliver raw materials from the train station area).

## When to build

As soon as steel-plate, electronic-circuit, and small-parts-01 are available on the bus. Start with rail + belt + inserter groups (highest consumption during expansion), add train vehicles and other groups as ingredients become available. The MAM pattern can be adopted from the start or retrofitted onto a dedicated-assembler mall later.

## Build sequence — material blocks needed

The mall assembles end products but imports materials. These upstream blocks must exist before the mall can produce each recipe group. Blocks listed in dependency order.

### Phase 1: basic materials (enables rail, belts, inserters, pipes)
| Block | Output | Buildings | Key feeds |
|---|---|---|---|
| [iron-plate](iron-plate-block.md) | 15/s | 38 steel-furnace | small-parts, pipe, rail, inserters, everything |
| [steel-plate](steel-plate-block.md) | 5/s | 75 adv-foundry (2× stamps) | locomotive, wagons, rail, train-stop |
| [solder](solder-block.md) | 2/s | 12 auto-factory | shaft-mk01, e-circuit chain |

**Mall unlocked:** rail, transport-belt, underground-belt, splitter, pipe, pipe-to-ground, pump, offshore-pump, stone-brick, landfill

### Phase 2: alloys + plates (enables train vehicles)
| Block | Output | Buildings | Key feeds |
|---|---|---|---|
| [duralumin](duralumin-block.md) | 3/s | 12 smelter | locomotive, wagons, brake, inserters |
| [glass](glass-block.md) | 2/s | 5 glassworks | brake-mk01, resistor1, battery-mk01 |
| [titanium-plate](titanium-plate-block.md) | 2/s | 8 steel-furnace | wagons (50 each), vitreloy |
| [intermetallics](intermetallics-block.md) | 1/s | 30 (adv-foundry + smelter) | locomotive, wagons, 48 total consumers |

**Mall unlocked:** locomotive, cargo-wagon, fluid-wagon (with inline brake/gearbox/shaft/steam-engine), medium-electric-pole, big-electric-pole

### Phase 3: electronics (enables combinators, substation, fast-inserter)
| Block | Output | Buildings | Key feeds |
|---|---|---|---|
| [electronic-circuit](electronic-circuit-block.md) | 2/s | 31 (chipshooter + electronics + chemical) | locomotive (10), combinators, substation, fast-inserter, 219 consumers |

**Mall unlocked:** all remaining groups (combinators, substation, fast-inserter, train-stop)

### Upstream blocks not yet designed
These are needed by the material blocks above but don't have design files yet:
- **lead-plate** — feeds solder (8/s), intermetallics (via pbsb-alloy)
- **tin-plate** — feeds solder (4/s), capacitor1, e-circuit
- **zinc-plate** — feeds battery-mk01
- **nickel-plate** — feeds vitreloy (1.5/s)
- **nexelit-plate** — feeds fenxsb-alloy (1/s)
- **sb-oxide** — feeds vitreloy + fenxsb-alloy (2/s total)
- **aluminium-plate** — feeds duralumin (12/s, current block only 1/s)
- **copper-plate** — feeds duralumin (6/s), vitreloy, e-circuit (current block only 3.16/s)
- **graphite** — feeds vacuum-tube, battery-mk01 (2.4/s)
- **ceramic** — feeds capacitor1, inductor1 (1.15/s)
- **cyanic-acid** — feeds battery-mk01 (12/s fluid)
- **melamine** — feeds battery-mk01 (0.8/s)
- **pbsb-alloy** — feeds battery-mk01 (0.4/s)
- **pcb1** — feeds e-circuit (0.4/s, current block 0.125/s — needs scaling)
