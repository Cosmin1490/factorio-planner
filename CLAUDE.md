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
- `export-mod/` — Factorio mod that dumps prototype + force + technology data to JSON

## Solver notes

- Native TypeScript solver (no Lua dependency)
- Items produced by one recipe and consumed by another in the same block are classified as intermediates (state=0) and linked internally
- **Algebraic solver**: Multi-pass Gaussian elimination. Default for target mode. Supports `--constraint` (master/exclude). Breaks on large chains (12+ recipes — gives astronomical numbers).
- **Simplex solver**: Linear programming. Default for input mode. Supports `--constraint exclude` (zeroes out production coefficients in working copy). Handles complex chains with competing consumers. Always use simplex for blocks with many recipes.
- Input mode defaults to simplex because algebraic greedy pass can't balance competing consumers
- Module/beacon effects computed and exposed via `--modules` and `--beacons` CLI flags
- Fuel consumption modeled in matrix: burner factories consume fuel and produce `burnt_result` (e.g., coal→ash). This creates automatic intermediate linking but can cause degenerate scaling — prefer electric factories or use exclude constraints.
- `--constraint "recipe:product:exclude"` prevents a recipe's byproduct from driving solver scaling (works in both algebraic and simplex)
- `--max-import "item:amount"` caps how much of an item can be imported. `amount=0` forces full internal production. Post-processing pass scales up producer/consumer recipes to close balance gaps, cascading deficits to raw materials. Works with both solver modes.
- Helmod export reverses recipe order (output recipe first) to match Helmod's top-to-bottom processing

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
- Pyanodon's recipe graph is extremely dense: even with `--unlocked` filtering, `recipe-tree --needs acetylene` produces 6000+ lines. Commodity items (water, steam, soil, coke, ash, limestone, muddy-sludge, carbon-dioxide, oxygen, hydrogen, compost) fan out to hundreds of recipes each. Use `--ignore` to prune them and `--depth 2-3` for focused exploration.

## Helmod export format

Pipeline: `luaSerialize(model)` → `zlib.deflateSync()` → `base64` — **NO version byte prefix**.

- Factorio's `helpers.encode_string()` returns `base64(zlib(data))` without a "0" prefix. The "0" prefix is blueprint-string-specific, not used by Helmod.
- Helmod's `Converter.read()` passes the string directly to `helpers.decode_string()`, then `loadstring()` on the result.
- `ModelBuilder.copyModel()` reconstructs the model. It validates recipe names against game prototypes — they must be real recipes.
- Key fields read by `copyFactory()`: `name`, `quality`, `fuel`, `modules`, `module_priority`
- Input constraints go in `block_root.ingredients` with `{name, type, input=amount}`. Target constraints go in `block_root.products`.
- For input mode: `by_product=false, by_factory=false`. `by_factory=true` is a separate mode (fixed factory count) that skips reading `.input` values.
- Export reverses recipe order so output recipe is R1 (index 0), matching Helmod's top-to-bottom algebraic solver.

## Pipeline design preferences

- **Use electric factories**: Prefer `automated-factory-mk01` (crafting), `advanced-foundry-mk01` (smelting) over stone-furnace / assembling-machine-1/2/3 which are all burners in Pyanodon and couple fuel→ash.
- **Exclude constraints for byproducts**: When a recipe produces a byproduct that drives over-scaling (e.g., stone from crushers), use `--constraint "recipe:product:exclude"`.
- **Use `--max-import item:0` for intermediates**: Forces internal production. Cascading deficits push to raw materials. Use for items like iron-gear-wheel, iron-plate, grade-1-copper, grade-2-copper.
- **Recycle byproducts**: Add recycling recipes + `--max-import "item:0"` to force byproducts through the loop (e.g., grade-1-copper → crush → grade-2-copper → copper-plate).
- **Target mode for complex chains**: Input mode lets simplex freely import intermediates. Use target mode + binary search the target to fit input budgets (e.g., keep iron-ore under 15/s).
- **Ash is free**: Treat ash as a readily available input. Don't let it drive scaling.
- **Void solid byproducts**: Stone can be voided via `saline-water` recipe (10 stone + 100 water → 50 water-saline).

## Recipe alternative evaluation

When comparing recipe alternatives, don't assume "more complex = more efficient":

1. **Identify the bottleneck** — what's the most expensive input? (deep chain, slow buildings, rare ores, animal husbandry)
2. **Trace both paths to shared dependencies** — alternatives often share the same bottleneck upstream. Compare per-unit consumption of that bottleneck.
3. **Normalize to same output** — compare cost per 1 unit of output, not per craft. 4x output at 2 inputs beats 2x output at 1 input.
4. **Check if the alternative actually bypasses the bottleneck** — if both converge on the same expensive intermediate, the "upgrade" is a trap.
5. **Rank by:** efficiency (raw materials/output) > complexity (recipes/buildings) > convenience
6. **Watch for "later game" recipes** — some exist to consume excess byproducts (e.g., rubber uses excess petrochemicals), not for efficiency. They're traps at early tech.

Example: stopper-2 (rubber) looks like an upgrade over stopper, but both need 0.5 latex/stopper (same formic-acid cost). Rubber just adds carbon-black + polybutadiene + titanium for no benefit.

## Pyanodon module tricks

Some Pyanodon buildings use items (not standard modules) as modules:

- **Seaweed farms** (`seaweed-crop-mk01`): 10 module slots, category `seaweed`. Use `seaweed` item as module (+100% speed each = 11x total). Without modules, speed is 0.09 — unusable.
- **Sap extractors** (`sap-extractor-mk01`): 2 module slots, categories `sap-mk01..04`. Use `sap-tree` (+100% speed each = 3x total). Without modules, speed is 0.33.
- Other biological buildings likely have similar item-as-module patterns — check `allowed_module_categories` and search for items with `module_effects` matching that category.

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
- [x] `--recipe-tree`: ingredient/product graph traversal with --needs, --produces-from, --ignore, --unlocked
- [x] Multi-input constraints: support multiple `--input` flags simultaneously
- [x] `--max-import`: cap intermediate imports, force internal production
- [ ] Temperature-linked fluids: conversion rows for fluids at different temperatures (steam 165C vs 250C vs 500C)
