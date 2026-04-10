# factorio-planner

## Running

```bash
npx tsx src/cli.ts <command>
```

No build step needed for dev. The 16MB prototype JSON loads in ~0.6 seconds.

## Key files

- `src/cli.ts` — CLI entry point (commander)
- `src/solver/MatrixSolver.ts` — production solver (matrix construction, algebraic + simplex solvers, constraint handling)
- `src/solver/ModuleEffects.ts` — module/beacon effect computation
- `src/solver/types.ts` — solver input/output types
- `src/data/PrototypeLoader.ts` — prototype JSON loader + recipe/factory/tech indexes
- `src/export/helmod.ts` — Helmod import string export (Lua serializer + zlib + base64)
- `src/commands/solve.ts` — solve command (target/input modes, factory/module/beacon/fuel overrides)
- `src/commands/recipes.ts` — recipe query commands (--produces, --consumes, --unlocked)
- `src/commands/recipeTree.ts` — recipe graph traversal (--needs backward, --produces-from forward, --ignore, --unlocked)
- `src/commands/techs.ts` — technology lookup (--unlocks)
- `data/helmod-web-prototypes.json` — all recipe/entity/item/force/technology data (16MB, exported from Factorio)
- `data/saves/<name>.md` — per-save block inventories (what's built in-game, stations, rates). Ask which save before starting block design work.
- `export-mod/` — Factorio mod that dumps prototype + force + technology data to JSON

## Solver notes

- Native TypeScript solver (no Lua dependency)
- Items produced by one recipe and consumed by another in the same block are classified as intermediates (state=0) and linked internally
- **Algebraic solver**: Multi-pass Gaussian elimination. Default for target mode. Supports `--constraint` (master/exclude). Breaks on large chains (12+ recipes — gives astronomical numbers).
- **Simplex solver**: Linear programming. Default for input mode. Supports `--constraint exclude` (zeroes out production coefficients in working copy). Handles complex chains with competing consumers. Always use simplex for blocks with many recipes. **Caveat**: simplex finds ANY feasible solution, not the minimum one. Unconstrained byproducts cascade wildly in large runs (100+ recipes → 11,500 buildings). Fix: import deep commodities (battery, rubber) and exclude byproducts at every cascade link.
- Input mode defaults to simplex because algebraic greedy pass can't balance competing consumers
- Module/beacon effects computed and exposed via `--modules` and `--beacons` CLI flags
- Fuel consumption modeled in matrix: burner factories consume fuel and produce `burnt_result` (e.g., coal→ash). This creates automatic intermediate linking but can cause degenerate scaling — prefer electric factories or use exclude constraints.
- `--max-import "item:amount"` caps how much of an item can be imported. `amount=0` forces full internal production. Post-processing pass scales up producer/consumer recipes to close balance gaps, cascading deficits to raw materials. Works with both solver modes.
- **Solver is purely algebraic — no physical validation**: Does not model fluid temperatures, belt throughput, or energy. All steam is treated as one item regardless of temperature. Example: polybutadiene produces steam at 150°C, but tar-refining needs 250°C+ — solver links them anyway. Always verify `recipe.products[].temperature` and `recipe.ingredients[].minimum_temperature` for steam after solver runs.

## Prototype data quirks

- `entity.energy_usage` is in **J/tick** (not watts). Multiply by 60 to get watts (J/s). This matters for fuel consumption calculation.
- Some recipes have `products: {}` (empty object) instead of `[]` — handle with `Array.isArray()` check
- Recipe categories `barreling`, `unbarreling`, `recycling` are filtered from the producer index
- In Pyanodon, ALL vanilla assembling-machines (1/2/3) are burners (have `burner_prototype`). Use `automated-factory-mk01/02` (electric) or `advanced-foundry-mk01` (electric, smelting) to avoid burnt-result coupling.
- Entity quality fields (`crafting_speed` etc.) are objects keyed by quality name: `{ normal: 1, uncommon: 1.3, ... }`
- Module effects are per-quality: `item.module_effects.normal.speed`
- Coal `burnt_result` is ash (Pyanodon-specific). Solver models this — stone furnaces burning coal auto-produce ash as intermediate.
- Force data (`force.recipes`) tracks unlock state per recipe. Technology data tracks researched techs and their recipe unlocks.
- Some recipes have `ingredients: {}` (empty object) instead of `[]` — same `Array.isArray()` guard as products
- Pyanodon water `heat_capacity` is **2,100 J/unit/°C** (vanilla is 200). This is 10.5× higher and affects all steam/boiler calculations. Always read from `data.fluids["water"].heat_capacity`, don't hardcode.
- Fluid `fuel_value` is in `data.fluids`, not `data.items`. Oil boiler mk01 `fluid_energy_source.effectivity=2` doubles fuel efficiency.
- **Mineable items without recipes** — many items that appear to have "no producers" in recipe-tree are actually mined from resource patches with dedicated miners. These won't show up in `buildProducerIndex`. Key examples: `native-flora` (ore-bioreserve → flora-collector), wild plants like `ralesia`, `rennea`, `grod`, `tuuphra`, `yotoi`, `mova`, `kicalk`, `cadaveric-arum` (all → harvester), plus Pyanodon-specific ore variants (coal-rock, iron-rock, copper-rock, etc. with dedicated mines). Check `data.entities` for resources with `mineable_properties` when an item appears to have no recipe producers.
- **Bio bootstrap + self-sustaining loops** — Pyanodon bio organisms follow a two-phase pattern: (1) **Bootstrap** — a one-time setup to get the first organisms. Two routes: **world harvest** (moss, seaweed, fish — pick up from the map, trivial) or **codex route** (ralesia, vrauks, auog, fawogae, moondrop — creature-chamber/nursery recipe using a codex + earth-sample, yields only 1-2 organisms per run, slow and expensive). (2) **Steady-state** — a self-sustaining loop where output exceeds input, running forever on commodity inputs.
    
    **Bootstrap is gradual, not instant.** Bio buildings use organisms as modules (e.g., vrauks-paddock needs 10, moss-farm needs 15), but you don't need full module slots to start — a single organism works, just very slowly. The codex gives you 1-2, you breed at base speed, load offspring as modules, each module accelerates the next cycle. It snowballs until all slots are filled. This means one codex run is enough even for buildings with many module slots — it's just tediously slow at the start. Plan build order accordingly: start bio bootstraps early so they're at full speed when needed.
    
    Once you have critical mass, only the steady-state matters for pipeline planning. Don't model the bootstrap in the solver — it's a manual setup step.
    - **Ralesia**: bootstrap via `ralesia-sample` (nursery, codex) or harvest wild. Steady-state: 5 ralesia → 8 seeds → 10 ralesia (net +5/cycle, needs soil+water+hydrogen).
    - **Vrauks**: bootstrap via `vrauks` (creature-chamber, codex). Steady-state: cocoon production (native-flora+moss+saps → cocoons) + `vrauks-1` (cocoons+native-flora+moss → vrauks). No vrauks consumed in the loop — all inputs are commodity. Vrauks go to paddock modules (permanent) or caging→slaughter.
    - **Auog**: bootstrap via `auog` (creature-chamber, codex). Steady-state: breeding centers produce pups (native-flora+moss), `auog-maturing` grows them. Auogs used as permanent building modules (not consumed).
    - **Fawogae**: bootstrap via `fawogae-sample` (nursery, codex) — need at least 1 fawogae to load as module into fawogae-plantation (10 slots). Spores are free (spore-collector, no inputs), but the plantation needs fawogae modules to run at usable speed. Steady-state: `fawogae-spore` (free) → `fawogae-1` (3 spores → 7 fawogae). Self-sustaining once bootstrapped.
    - **Moondrop**: bootstrap via `moondrop-sample` (nursery, codex). Steady-state: 5 moondrop → 7 seeds + 2 back, `moondrop-1` (4 seeds + water → 4 moondrop). Net positive.
    - **Fish**: bootstrap by catching from water tiles (vanilla mechanic). Load 7 fish as modules into fish-farm-mk01. Steady-state: 12 fish → 25 eggs → 25 fish (breed-fish-egg-1 + breed-fish-1). Net positive — surplus loads more farms.
    - **Moss/seaweed**: bootstrap by harvesting from the world (moss on ground, seaweed in water). Load as modules (15 moss per moss-farm, 10 seaweed per seaweed-crop). Farm recipes take only commodity fluids — surplus output loads more farms. Trivial bootstrap vs the codex route above.
    - **Native-flora**: mine-only at current tech (flora-collector on ore-bioreserve patches). Bioreserve-farm recipes are locked. No bootstrap/loop — treat like any ore.

## Helmod export format

Pipeline: `luaSerialize(model)` → `zlib.deflateSync()` → `base64` — **NO version byte prefix**.

- Factorio's `helpers.encode_string()` returns `base64(zlib(data))` without a "0" prefix. The "0" prefix is blueprint-string-specific, not used by Helmod.
- Helmod's `Converter.read()` passes the string directly to `helpers.decode_string()`, then `loadstring()` on the result.
- `ModelBuilder.copyModel()` reconstructs the model. It validates recipe names against game prototypes — they must be real recipes.
- Key fields read by `copyFactory()`: `name`, `quality`, `fuel`, `modules`, `module_priority`
- Input constraints go in `block_root.ingredients` with `{name, type, input=amount}`. Target constraints go in `block_root.products`.
- For input mode: `by_product=false, by_factory=false`. `by_factory=true` is a separate mode (fixed factory count) that skips reading `.input` values.
- Export reverses recipe order so output recipe is R1 (index 0), matching Helmod's top-to-bottom algebraic solver.

## Pipeline methodology

### Comparing alternatives
1. **Identify the bottleneck** — most expensive input (deep chain, slow buildings, rare ores, animal husbandry).
2. **Trace alternatives to the shared bottleneck** — compare per-unit consumption of the limiter. If both paths converge on the same expensive intermediate, the "upgrade" is a trap.
3. **Normalize to same output** — cost per 1 unit of output, not per craft. 4x output at 2 inputs beats 2x at 1.
4. **Rank by:** efficiency (raw materials/output) > complexity (recipes/buildings) > convenience. Watch for "later game" recipes that exist to consume excess byproducts — traps at early tech.

### Byproduct management
5. **Classify before linking** — (a) convertible to fluid/gas → add consumer, (b) solid-to-solid → low value unless needed, (c) no conversion → waste (ash, stone). Only invest recipes in (a). Void stone via `saline-water` recipe (10 stone + 100 water → 50 water-saline).
6. **Match the limiting reagent** — don't force the abundant byproduct to zero; that over-scales the consumer and imports the scarce one. Let the scarce one set the pace. Use `--constraint "recipe:product:exclude"` + `--max-import "scarce-input:0"`.
7. **Recycle intermediates through every producing step** — when multiple recipes produce the target as byproduct (coal chain: raw-coal → coal → coke → coal-gas all produce tar), force intermediates back with `--max-import item:0`. Coal chain: 3x raw-material reduction (33 → 11/s for 100 tar/s).

### In-game byproduct handling
Multi-product recipes stall completely when ANY output buffer is full. Every product must have somewhere to go.

- **Voiding buildings**: sinkhole (liquids), exhaust pipe (gases), burner (any solid — requires fuel like coal, produces ash; loop ash back into the burner or void separately).
- **Convert before voiding when the intermediate has value** — stone can be burned directly, but converting to saline-water (10 stone + 100 water → 50 water-saline) creates a useful intermediate. Apply the overflow-to-void pattern on the saline-water: export what consumers need, sinkhole the rest. Example: copper block converts stone → saline-water, exports it for EC block, voids only surplus.
- **Overflow-to-void pattern**: don't void blindly — prioritize real consumption, only void surplus. Wire a pump or overflow valve with circuit condition: fill the load station buffer first, overflow excess to a sinkhole/exhaust. When a consumer eventually connects, trains pull from the station and less goes to void automatically. No block redesign needed. Example: tar refinery produces 280/s pitch with no current consumer — overflow valve after the pitch tank routes excess to sinkhole, block keeps running for creosote/gasoline/coke/middle-oil.
- **Primary products can back up too** — not just byproducts. If the main export has no consumer and isn't voided, the entire block stalls, including internal chains that feed other exports. Example: aluminium block stalls entirely when plates back up — coal chain stops, no coal-gas for mining fluid, drilling halts. Apply overflow-to-void on primary products with intermittent demand, or ensure a consumer exists before building.

### Power & energy
8. **Account for power cost, use unlocked tiers** — total MW = count × energy_usage × 60. Electric boilers (25 MW each) often dominate. Always `--factory` with unlocked tiers — solver auto-picks mk04 which are usually locked.
9. **Burn byproduct fluids for steam** — oil boiler mk01: effectivity=2, 0 MW electrical. `fuel_rate = (steam_rate × heat_capacity × ΔT) / (fuel_value × effectivity)`. Pyanodon water heat_capacity=2,100, ΔT=235. Fluid fuel_value in `data.fluids` not `data.items`. After splitting into sub-factories, check if byproduct fluids (syngas, pitch, gasoline) cover the sub-factory's own boiler needs — often they do (rubber sub-factory: syngas 177/s + pitch 44.8/s covers its 32/s steam at 250°C+).

### Pipeline decomposition
10. **Decompose at commodity boundaries** — split at natural handoff points, optimize each stage independently. When multiple end products share deep infrastructure, split by shared system (auog farm, plasmids, bio commons) not by end product. Map all dependencies first, identify natural service layers, then build bottom-up.
11. **Design for explicit handoff** — track exports/imports between pipelines. Surpluses become fuel (syngas → oil boiler) or feed parallel consumers. Deficits identify where to add recipes or accept imports.

### Boundary selection
A good boundary is an item where you'd naturally put a train stop. Score candidates on:

12. **Consumer count** — items consumed by many unlocked recipes are natural bus items. Empirical counts (Pyanodon, current unlock):
    - **Tier A (20+)**: small-parts-01 (126), iron-plate (105), electronic-circuit (96), steel-plate (93), glass (39), stone-brick (35), copper-plate (25), titanium-plate (24), copper-cable (20)
    - **Tier B (10-19)**: iron-stick (14), battery-mk01 (12), plastic-bar (12), tin-plate (11), coke (10), bolts (10)
    - **Tier C (4-9)**: petri-dish (9), tar (7), rubber (6), pitch (6), middle-oil (5), ceramic (5), creosote (5)
    - **Tier D (1-3)**: light-oil, syngas, lab-instrument (4 each), latex (3), iron-gear-wheel (2)
    Tier A/B are almost always good boundaries. Tier C/D only if they also have deep chains or cascade risk.

13. **Chain depth & cascade risk** — deep chains (5+ recipes) or chains containing cascade magnifiers (high input:output ratio) justify splitting even at low consumer counts. Battery-mk01 (12 consumers, 30:1 cyanic-acid cascade) and rubber (6 consumers, deep petrochemical chain) are worth splitting. Iron-plate from ore is only 2-3 recipes — not worth splitting on its own. For 50+ recipe solver runs, identify and import these items as commodities. Exclude byproducts at EVERY cascade link — breaking one link is not enough if the solver imports the intermediate.

14. **Context-dependent depth** — the boundary moves based on what you're solving. Making circuits? Iron-plate is a boundary (import it). Making iron-plate itself? Ore is the boundary. Rule: **import from the highest tier below your current target**.

15. **Stable physical properties** — good boundaries have uniform properties across consumers. Iron-plate at X/s is iron-plate regardless of consumer. Steam is a BAD boundary because temperature matters (150°C ≠ 250°C) and the solver treats all steam as fungible.

16. **Transport density** — prefer the densest form of an item as the boundary. If a high-consumer item is trivially crafted (1 step, fast) from a precursor with equal or better stack density, the precursor is the better boundary. Copper-cable (20 consumers) is made 2:1 from copper-plate, both stack to 200 — plates move 2x material per slot. Same for iron-stick, iron-gear-wheel. The boundary is what goes on the train; the derivative is crafted on-site.

17. **City block space budget** — in train-based city block architectures, each block has finite space split between factories and train stations (1 station per item, input or output). Three tools to fit a sub-factory into a block:
    - **Import** — 1 station, 0 buildings. Use for high-volume bus items.
    - **Inline** — 0 stations, N buildings. Use for cheap-to-produce items (1-2 buildings) to save a station. Vacuum (no inputs, 1 pump) should always be inlined.
    - **New boundary** — 1 station, but absorbs multiple imports into a separate block. Use when producing an item inline would require importing 3+ of its own ingredients. Example: pcb1 has only 4 consumers but producing it inline means importing formica, copper-plate, vacuum, plus formica's chain (treated-wood, sap, fiber, methanal, creosote) — 5+ stations vs 1 for pcb1.
    
    When a sub-factory has many buildings, aggressively inline cheap imports to save stations. When it has few buildings, more stations are fine. The balance point depends on block size and station footprint.

18. **Single-item smelting** — never mix metals in one sub-factory. Each plate gets its own city block. Prefer steel-furnace (2x2, speed 4, fluid-burning) over advanced-foundry (6x6, speed 1, electric) — 33x more plates per tile. Design fuel-agnostically — specify demand as "X/s of 1.0 MJ fluid fuel" and let factory-level logistics decide the source (coke-oven-gas, acetylene, etc.).
    
    **On-site vs centralized:** compare ore:plate ratio across unlocked chains. High ratio (8:1 direct iron) → smelt on-site at the ore patch, train plates. Low ratio (1.4:1 BOF casting) → centralize, ore and plates are nearly equal volume. Middle ground (5:1 crush+smelt) → on-site still wins. Rule of thumb: if ore:plate > 3:1, on-site saves significant belt/train capacity. If the efficient chain needs extra imports (borax, oxygen), centralized makes more sense so you can share that infrastructure.
    
    Smelting chains (Pyanodon, current tech) — ore:plate ratio:
    - **Iron**: direct 8:1 → crush+smelt 5:1 → BOF casting 1.4:1 (needs borax/oxygen/sand-casting)
    - **Copper**: direct 8:1 → screen+crush 4.2:1 (no extra inputs, stone byproduct)
    - **Tin**: direct 10:1 → screen+crush 3.75:1 (no extra inputs, stone byproduct)
    
    **Upgrade path:** aim for the most efficient chain. If its extra inputs aren't available, start with the simpler chain — even if it under-supplies, it gets plates flowing (e.g., stone-furnace direct smelting before steel-furnace is available). Leave room in the block to swap in the better chain later. The block layout (stations, belts) stays the same; only the internals change.

19. **Size for general use, constrained by input throughput** — Tier A/B bus items (plates, small-parts, glass, electronic-circuit, etc.) serve dozens to hundreds of consumers. Size these sub-factories for the bus, not for one consumer. However, the binding constraint is usually input throughput (belts/pipes), not block space. Each train station can feed **1-2 belts** (check unlocked belt tier: yellow 15/s, red 30/s, blue 45/s). The real tradeoff is **stations vs factories** — a block has finite space for both. A smelting block with 1 input type can dedicate 4-5 stations to ore (4-10 belts), while a crafting block with 8 different inputs gets 1 station each (1-2 belts per input). Size the block to match what you can actually feed it, not how many buildings fit. Only size to a specific consumer when the item is niche (Tier C/D, 1-3 consumers).

20. **Blocks are stamps** — in train city block architecture, each block is a self-contained unit connected only by train. Need more throughput than one block provides? Copy-paste the block. No redesign, no re-optimization — just stamp another copy and the train network absorbs it. Design each block once to maximize its output within the space/input constraints, then scale horizontally by stamping. This is the core advantage of the city block pattern. **Belt coupling between adjacent blocks is debt** — it works as a temporary hack but creates spatial dependency (blocks must stay neighbors), prevents stamping, and defeats train-based decoupling. Always plan to replace with a train station.

21. **Block capacity heuristic (bio farms)** — building tile footprint is the dominant factor for bio farm blocks. All bio buildings hit effective speed 1.0 with full modules, so per-farm output is recipe-determined, but how many fit is purely tile footprint vs block area. Actual block size is **~128x128 tiles** (16,384 tile²), but rail perimeter, stations, belt bus, and pipe routing consume significant space — usable interior is smaller. Empirical data:
    
    | Building | Size | Farms/block | Output/block |
    |---|---|---|---|
    | moss-farm-mk01 | 6x6 | 60 | 12.0 moss/s (Moss-2) |
    | seaweed-crop-mk01 | 13x13 | 32 | 6.4 seaweed/s |
    
    Small buildings (6x6) leave most of the block free — enough to inline supporting recipes (CO2 production, etc.). Large buildings (13x13) fill most of the usable interior, leaving room only for stations and logistics. When a block is space-constrained, stamp a second copy rather than trying to squeeze more in.

22. **Fluid transport threshold** — one fluid wagon per minute defines the practical throughput ceiling for training fluids. The threshold scales with wagon tier:
    
    | Wagon | Capacity | @1 wagon/min |
    |---|---|---|
    | fluid-wagon (mk01) | 25,000 | ~400/s |
    | mk02-fluid-wagon | 50,000 | ~830/s |
    | ht-generic (mk03) | 75,000 | ~1,250/s |
    | mk04-fluid-wagon | 150,000 | ~2,500/s |
    
    Below the threshold: train the fluid in, block can go anywhere. Above: **build near a water body** (pipe directly, unlimited throughput, 0 stations) or inline the water consumer. Example: soil extraction needs 50 water per soil — a block making 12/s soil needs 600/s water, over mk01 limit but fine at mk02+. When a water-heavy recipe can be inlined in the consumer's block (e.g., soil extraction inside a ralesia farm at 60/s water), that avoids both the train limit and the placement constraint. Revisit "must build near water" decisions when upgrading wagon tiers.

23. **Block design patterns** — all city blocks follow a standard template:
    
    **Size:** ~128x128 tiles. Rail perimeter loop consumes the outer ring; usable interior is smaller.
    
    **Station naming:**
    - Input (unload): `[icon]Unload` — rich text icon identifies the item/fluid (e.g., `[fluid=water]Unload`, `[item=copper-plate]Unload`)
    - Output (load): `[virtual-signal=signal-item-parameter]Load` — parameterized signal, reusable across blueprints. Actual item set per-instance.
    
    **Station circuit control:** Each station has a constant combinator setting three signals:
    - `signal-L = 1` (train limit enable)
    - `signal-P = 50` (priority)
    - Item/fluid filter `= 1` (identifies what this station handles)
    
    **Multi-threshold train limiting:** A second constant combinator provides signal-2/3/4/5 at staggered thresholds = `N × (wagon_capacity + 1)` for N=1..4. A decider combinator compares current stock against these thresholds — each threshold exceeded emits `signal-L = -1`, reducing the train limit. More stock → fewer trains dispatched. Threshold values by storage type:
    - **Solid items:** wagon_capacity = `stack_size × 20` (mk1 cargo wagon has 20 slots). E.g., 100-stack items → 2001/4001/6001/8001; 50-stack items → 1001/2001/3001/4001.
    - **Fluids:** py-tank-4000 capacity = 25,000 → 25001/50001/75001/100001.
    
    **Infrastructure:** Rail perimeter loop with chain signals on entry, regular signals on exit. Medium electric poles for power grid. Pipe-to-ground for fluid distribution. Transport belts for item collection to load station.

### Solver setup checklist
- **Use electric factories for crafting** — `automated-factory-mk01` (crafting). For smelting, prefer `steel-furnace` (2x2, speed 4, fluid fuel) in city blocks — solver can use `advanced-foundry-mk01` for simplicity but real builds should use steel-furnace for density.
- **Exclude byproducts that drive scaling** — `--constraint "recipe:product:exclude"` for every byproduct that could cascade.
- **Force internal production** — `--max-import "item:0"` for intermediates (iron-gear-wheel, iron-plate, grade-1-copper, grade-2-copper). Cascading deficits push to raw materials.
- **Recycle byproducts** — add recycling recipes + `--max-import "item:0"` to force items through the loop.
- **Target mode for complex chains** — input mode lets simplex freely import intermediates. Use target mode + binary search the target to fit input budgets.
- **Ash is free** — treat as readily available input, don't let it drive scaling.

### Examples
- Pitch pipeline: 3 electric boilers = 75 MW / 111.5 MW total. Oil boiler burning gasoline (28.79/s for 140 steam/s) saves 75 MW.
- Coal chain recycling: 11 raw-coal/s → 100 tar/s + 113.65 syngas/s (vs 33/s without). Syngas covers 77% of steam needs.
- Logistic science pack: 11,506 → 110 buildings by importing battery/rubber/creosote at commodity boundaries, excluding byproducts at every cascade link, and adding bio modules. Splitting by shared system (7 pipelines) not by product (4).

## Pyanodon module tricks

All Pyanodon biological buildings use items (not standard modules) as modules with +100% speed each:

| Building | Slots | Module item | Speed multiplier |
|---|---|---|---|
| `moss-farm-mk01` | 15 | `moss` | 16x |
| `moondrop-greenhouse-mk01` | 16 | `moondrop` | 17x |
| `ralesia-plantation-mk01` | 12 | `ralesia` | 13x |
| `prandium-lab-mk01` (cottongut) | 20 | `cottongut-mk01` | 21x |
| `vrauks-paddock-mk01` | 10 | `vrauks` | 11x |
| `auog-paddock-mk01` | 4 | `auog` | 5x |
| `rc-mk01` (breeding center) | 2 | matching animal | 3x |
| `seaweed-crop-mk01` | 10 | `seaweed` | 11x |
| `sap-extractor-mk01` | 2 | `sap-tree` | 3x |
| `fwf-mk01` (wood farm) | 10 | `tree-mk01` | 11x |

**ALWAYS add `--modules` for every biological recipe.** Without modules, bio farms are unusably slow and dominate building count (757→110 buildings for logistic science pack). mk02/mk03/mk04 tiers exist with 2x/3x/4x speed bonus per slot.

## Recipe tree tips

Pyanodon's recipe graph is extremely dense. For practical use:

- Always use `--unlocked` to filter locked recipes
- Use `--ignore` for commodity items: `water steam carbon-dioxide soil muddy-sludge compost oxygen hydrogen ash coke limestone`
- Add `wood moss raw-coal` to ignore list for deeper chains
- Use `--depth 2-3` for focused exploration, full depth only with aggressive ignore lists
- Without ignore, even simple items like acetylene produce 6000+ lines

## Pipeline summary format

When showing pipeline summaries, use:

1. Header: `<recipe> — <rate>/s, <N> buildings`
2. Recipe table — ASCII box-drawing (┌─┬─┐ │ ├─┼─┤ └─┴─┘) with columns: Recipe, Factory, Count (right-aligned), Modules (shown when any recipe has modules)
3. Inputs on one line, comma-separated: `item rate/s, item rate/s, ...`
4. Byproducts on one line, same format
5. Intermediates table — ASCII box-drawing with columns: Item, Rate, Producer, Consumer (per-recipe routing for belt/pipe planning)

## TODO

- [ ] `--electric` / `--no-burner`: auto-select best electric (non-burner) factory per recipe
- [ ] Temperature-linked fluids: conversion rows for fluids at different temperatures (steam 165C vs 250C vs 500C)
