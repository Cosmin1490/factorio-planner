# factorio-planner

A recipe-space search copilot for [Pyanodon's Factorio modpack](https://mods.factorio.com/user/pyanodon), backed by a production solver. The solver computes rates; the design guide provides search strategy; Claude applies both to the user's game state interactively.

The user holds game state and priorities. Claude holds recipe knowledge and systematic search discipline. The goal is helping the user achieve their goals and surfacing options they might not have considered — not prescribing what to build.

## Running

```bash
npx tsx src/cli.ts <command>
```

No build step needed for dev. The 16MB prototype JSON loads in ~0.6 seconds.

## Documentation

- **[`docs/design-guide.md`](docs/design-guide.md)** — Accumulated design knowledge: how to search the recipe space, compare alternatives, manage byproducts, plan block boundaries, and design city blocks. Read before any pipeline design or block planning work.
- **[`docs/solver-reference.md`](docs/solver-reference.md)** — Technical reference: solver mechanics, prototype data quirks, CLI usage, bio module tables, smelting/mining data. Read when running the solver, debugging data issues, or looking up entity/recipe specifics.
- `data/designs/*.md` — Completed block designs with solver commands, rates, and design notes.
- `data/saves/<name>.json` / `.md` — Per-save block inventories (JSON via `inventory --save`, markdown manually maintained). Ask which save before starting block design work.

## Rules

- When working with encoded/compressed data (blueprint strings, Helmod export strings, base64, zlib), always write a script to decode/process programmatically. Never attempt to decode or parse inline or mentally.
- When selecting factories or recipes for pipeline calculations, always use `--unlocked` and verify machine tier availability. Do not assume mk03/mk04 machines are available — ask if unsure.
- **Before presenting any pipeline, block design, or block delta analysis**, self-review against all applicable rules in `docs/design-guide.md`. Each rule that applies to the current analysis must be verified as followed. Skipping a rule requires the user to explicitly say which specific rule(s) to skip for this specific case — "just skip the checks" doesn't count. Common failure modes to check:
  - Units match between demand and supply before comparing (rule 11 step 1b)
  - Bio buildings computed with full modules (solver reference § Bio module system)
  - Solver-validated rates used, not hand-trace estimates (rule 10 step 6)
  - Byproducts forward-traced for downstream value (rule 10 step 5)
  - Existing waste streams checked before new production (rule 2)
  - Byproduct recycling checked before voiding (rule 5a — run `recipes --consumes <byproduct>` to find recipes that convert it back to a chain input)
  - Conversion recipes checked for items with processing steps (log→wood, ore→plate)
  - Block boundary declared before solver run — every item classified as readily-available-import, byproduct-exclude, or must-consume-internally (design guide § Block boundary declaration). If block inventory is empty or you're unsure what's on the bus, ask the user before classifying — don't guess
- When asked to solve a pipeline or compute production rates, use the `/pipeline` skill. When asked to design a block, use the `/block-design` skill.

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
- `src/commands/inventory.ts` — blueprint analyzer (decode entities, infer miners/boilers/furnaces, compute steady-state rates, classify exports/imports/mined)
- `data/helmod-web-prototypes.json` — all recipe/entity/item/force/technology data (16MB, exported from Factorio)
- `export-mod/` — Factorio mod that dumps prototype + force + technology data to JSON

## Pipeline summary format

When showing pipeline summaries, use:

1. Header: `<recipe> — <rate>/s, <N> buildings`
2. Recipe table — ASCII box-drawing (┌─┬─┐ │ ├─┼─┤ └─┴─┘) with columns: Recipe, Factory, Count (right-aligned), Modules (shown when any recipe has modules)
3. Inputs on one line, comma-separated: `item rate/s, item rate/s, ...`
4. Byproducts on one line, same format
5. Intermediates table — ASCII box-drawing with columns: Item, Rate, Producer, Consumer (per-recipe routing for belt/pipe planning)

## TODO

See [`TODO.md`](TODO.md) for the full list, prioritized by impact per effort.
