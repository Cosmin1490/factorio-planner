# factorio-planner

## Running

```bash
npx tsx src/cli.ts <command>
```

No build step needed for dev. The 16MB prototype JSON loads in ~0.6 seconds.

## Key files

- `src/cli.ts` — CLI entry point (commander)
- `src/solver/MatrixSolver.ts` — production solver (matrix construction, Gaussian elimination, state classification)
- `src/solver/ModuleEffects.ts` — module/beacon effect computation
- `src/solver/types.ts` — solver input/output types
- `src/data/PrototypeLoader.ts` — prototype JSON loader + recipe/factory indexes
- `src/export/helmod.ts` — Helmod import string export (Lua serializer + zlib + base64)
- `src/commands/solve.ts` — solve command (target/input modes)
- `src/commands/recipes.ts` — recipe query commands
- `data/helmod-web-prototypes.json` — all recipe/entity/item data (16MB, exported from Factorio)
- `export-mod/` — Factorio mod that dumps prototype data to JSON

## Solver notes

- TypeScript reimplementation of Helmod's linear algebra solver
- Items produced by one recipe and consumed by another in the same block are classified as intermediates (state=0) and linked internally
- Multi-pass Gaussian elimination handles any recipe ordering
- Module/beacon effects computed and exposed via `--modules` and `--beacons` CLI flags
- `--input` mode solves forward from constrained supply (e.g., `--input "iron-ore:15"`)
- TODO: Temperature-linked fluid conversion rows (for steam at different temperatures, etc.)
- TODO: Simplex solver as alternative for cyclic/over-determined recipe sets

## Prototype data quirks

- `entity.energy_usage` is in **J/tick** (not watts). Multiply by 60 to get watts (J/s). This matters for fuel consumption calculation.
- Some recipes have `products: {}` (empty object) instead of `[]` — handle with `Array.isArray()` check
- Recipe categories `barreling`, `unbarreling`, `recycling` are filtered from the producer index
- In Pyanodon, assembling-machine-3 is a burner (has `burner_prototype`) — produces tiny fuel amounts filtered at 0.01 display threshold
- Entity quality fields (`crafting_speed` etc.) are objects keyed by quality name: `{ normal: 1, uncommon: 1.3, ... }`
- Module effects are per-quality: `item.module_effects.normal.speed`
- Coal `burnt_result` is ash (Pyanodon-specific)

## Helmod export format

Pipeline: `luaSerialize(model)` → `zlib.deflateSync()` → `base64` — **NO version byte prefix**.

- Factorio's `helpers.encode_string()` returns `base64(zlib(data))` without a "0" prefix. The "0" prefix is blueprint-string-specific, not used by Helmod.
- Helmod's `Converter.read()` passes the string directly to `helpers.decode_string()`, then `loadstring()` on the result.
- `ModelBuilder.copyModel()` reconstructs the model. It validates recipe names against game prototypes — they must be real recipes.
- Key fields read by `copyFactory()`: `name`, `quality`, `fuel`, `modules`, `module_priority`
- Input constraints go in `block_root.ingredients` with `{name, type, input=amount}`. Target constraints go in `block_root.products`.
- For input mode: `by_product=false, by_factory=false`. `by_factory=true` is a separate mode (fixed factory count) that skips reading `.input` values.
- Helmod source reference: extracted at `/tmp/helmod_extracted/helmod_2.2.13/` (core/Converter.lua, data/ModelBuilder.lua, data/Model.lua)
