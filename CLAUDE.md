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

## Methodology

**Read [`docs/pyanodon-methodology.md`](docs/pyanodon-methodology.md) before any pipeline design or block planning work.** It contains the full framework: comparing alternatives, byproduct management, block design, boundary selection, bio modules, solver setup.

## Solver notes

- Native TypeScript solver (no Lua dependency)
- Items produced by one recipe and consumed by another in the same block are classified as intermediates (state=0) and linked internally
- **Algebraic solver**: Multi-pass Gaussian elimination. Default for target mode. Supports `--constraint` (master/exclude). Breaks on large chains (12+ recipes — gives astronomical numbers).
- **Simplex solver**: Linear programming. Default for input mode. Supports `--constraint exclude` (zeroes out production coefficients in working copy). Handles complex chains with competing consumers. Always use simplex for blocks with many recipes. See "Solver lacks minimization objective" below for cascade caveat.
- Input mode defaults to simplex because algebraic greedy pass can't balance competing consumers
- Module/beacon effects computed and exposed via `--modules` and `--beacons` CLI flags
- Fuel consumption modeled in matrix: burner factories consume fuel and produce `burnt_result` (e.g., coal→ash). This creates automatic intermediate linking but can cause degenerate scaling — prefer electric factories or use exclude constraints.
- `--max-import "item:amount"` caps how much of an item can be imported. `amount=0` forces full internal production. Post-processing pass scales up producer/consumer recipes to close balance gaps, cascading deficits to raw materials. Works with both solver modes.
- **Solver lacks minimization objective**: simplex finds any feasible solution, not the cheapest. Unconstrained byproducts cascade wildly in large runs (100+ recipes → 11,500 buildings). Current workaround: manual `--constraint exclude` + `--max-import` at every cascade link. YAFC solves this with cost-weighted LP via Google OR-Tools — see TODO.
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
- Some recipes have variable output: `products[].amount_min` / `amount_max` instead of `amount` (e.g., auog-pooping-1 yields 3-8 manure). Read `.amount` first; if undefined, use `(amount_min + amount_max) / 2` for average throughput. See methodology Bio organisms section for sizing guidance.
- Pyanodon water `heat_capacity` is **2,100 J/unit/°C** (vanilla is 200). This is 10.5× higher and affects all steam/boiler calculations. Always read from `data.fluids["water"].heat_capacity`, don't hardcode.
- Fluid `fuel_value` is in `data.fluids`, not `data.items`. Oil boiler mk01 `fluid_energy_source.effectivity=2` doubles fuel efficiency.
- **Mining quirks** — many items that appear to have "no producers" in recipe-tree are actually mined from resource patches with dedicated miners (`buildProducerIndex` won't find them). Key examples: `native-flora` (ore-bioreserve → flora-collector), wild plants (`ralesia`, `rennea`, etc. → harvester), specialized ores (`coal-rock`, `quartz-rock`, `borax` → dedicated mines). Check `data.entities` for resources with `mineable_properties` when an item has no recipe producers. Also: stone mining yields both `stone` and `kerogen` (check `mineable_properties.products` for co-products), and many ores require a specific fluid to mine (check `mineable_properties.required_fluid`; see methodology rule 24).

## Helmod export format

Pipeline: `luaSerialize(model)` → `zlib.deflateSync()` → `base64` — **NO version byte prefix**.

- Factorio's `helpers.encode_string()` returns `base64(zlib(data))` without a "0" prefix. The "0" prefix is blueprint-string-specific, not used by Helmod.
- Helmod's `Converter.read()` passes the string directly to `helpers.decode_string()`, then `loadstring()` on the result.
- `ModelBuilder.copyModel()` reconstructs the model. It validates recipe names against game prototypes — they must be real recipes.
- Key fields read by `copyFactory()`: `name`, `quality`, `fuel`, `modules`, `module_priority`
- Input constraints go in `block_root.ingredients` with `{name, type, input=amount}`. Target constraints go in `block_root.products`.
- For input mode: `by_product=false, by_factory=false`. `by_factory=true` is a separate mode (fixed factory count) that skips reading `.input` values.
- Export reverses recipe order so output recipe is R1 (index 0), matching Helmod's top-to-bottom algebraic solver.

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
- [ ] **Minimization objective for simplex**: add `minimize(sum of recipe_rate × cost_weight)` to the objective row, where cost_weight = chain depth from raw ore (or similar heuristic). Would eliminate manual cascade isolation (`--constraint exclude` at every link) — the most labor-intensive part of the current workflow.
- [ ] **Power modeling in solver**: auto-compute total MW per solution (count × energy_usage × 60). Post-solve report initially; optionally a constraint (cap total power) later.
- [ ] **Early game methodology**: `docs/pyanodon-methodology.md` assumes mid-game+. Add a section covering coal processing bootstrap (coal → coke → tar → coal-gas progression), first automation, power bootstrap, and the burner-phase survival guide. This is where most Py players quit — the methodology gap matters for completeness.
- [ ] **Standard module/beacon strategy**: add methodology section for productivity/speed modules and beacons — the biggest late-game efficiency lever. Cover: when to apply productivity (most expensive recipes first), how it changes solver ratios (output up, craft time up), beacon placement strategy. **Factorio 2.0 note**: beacon effect is `distribution_efficiency / sqrt(n)` (2.0.7) — row-based arrays beat surrounding with max beacons.
- [ ] **Train station throughput planning**: add capacity analysis to rule 30 — trains/minute per station, when to add parallel stations, validation that train network can deliver what block delta planning demands. **Factorio 2.0 note**: schedule interrupts and generic trains change the throughput calculus.
- [ ] **Circuit patterns for deadlock prevention**: add circuit cookbook to methodology — SR latch hysteresis, overflow valve wiring, conditional inserter loading for multi-product balancing. **Factorio 2.0 note**: valve entity with threshold mechanics may simplify overflow-to-void patterns.
- [ ] **Recipe cycle detection in solver**: pre-solve pass to detect and warn about circular dependencies (ash loops, coal-gas feedback). Currently cycles cause silent degenerate scaling — astronomical numbers with no explanation.
