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

- **Ruleset: full Pyanodon with self-imposed restrictions inspired by pyhardmode.** The hardmode mod is *not* installed — these are house rules, and note they are *harsher* than the real mod, which ships compensating voiding recipes specifically so the restriction isn't masochistic. Exceptions below correct for those missing affordances rather than relaxing the standard. The test for an exception is **realistic or pragmatic**: realistic = it is what actual industry does with that substance; pragmatic = the alternative is busywork that adds no design interest. Realism is self-applying via the tiers below. Pragmatism is *not* — it is a reason to raise the question, never to quietly self-approve, because it is the criterion that would otherwise justify anything. Default assumption: **no voiding** — every byproduct recycled, exported, or converted. All 71 `py-venting` recipes are mechanically unlocked, so the restriction is entirely a design discipline; it is also what produced the best designs in this repo.
  - **Tier 1 — vent freely (atmospheric or inert, disperses harmlessly).** No need to ask: `carbon-dioxide`, `oxygen`, `nitrogen`/`purest-nitrogen-gas`, `hydrogen`, `helium`/`helium3`/`purier-helium`/`helium-rich-gas`, `steam`/`pressured-steam`/`critical-steam`, the `*-air` family, `flue-gas`, `vacuum`. (`hydrogen` is nominally a fuel but at 0.10 MJ — the weakest in the game — it is within the noise of any energy budget. `flue-gas` is combustion exhaust; venting it is what a flue is for. **`pressured-hydrogen` is tier 2, not tier 1** — at 1.25 MJ it is the most energy-dense gas in the vent list.) Via `py-gas-vent` (1×1, 25 kW, 20,000/craft at speed 2 = 40,000/s — one vent handles essentially any rate).
  - **Tier 2 — do not vent; burn it.** Fuel gases: `methane`, `syngas`/`hot-`/`purified-`/`dirty-`/`refsyngas`, `coal-gas`, `coalbed-gas`, `coke-oven-gas`, the `natural-gas` family, `petroleum-gas`, `propene`, `ethylene`, `acetylene`, `raw-gas`, `residual-gas`, `outlet-gas-*`, **`pressured-hydrogen` (1.25 MJ)**. Real industry flares these, but a boiler always exists — venting fuel wastes capturable energy, which is exactly what this ruleset exists to prevent.
  - **Tier 3 — never vent; must be processed.** Toxic or reactive: `chlorine`, `fluorine-gas`, `phosphine-gas`, `nitrogen-mustard`, `carbon-sulfide`, `acidgas`, `ammonia`, `aniline`, `chloromethane`, `dcm`, `dms`, `phosphorus-tricloride`, `phosphoryl-chloride`, `nitrous-oxide`, `formic-acid`, `tholins`/`proto-tholins`, `trichlorosilane`/`pure-trichlorosilane`, `acetone`, `diborane`, `tritium` (radioactive). Anything unlisted — `gas-stream`, `dry-gas-stream`, `rich-gas`, `high-purified-gas`, `hot-reaction-gas`, `proton`: **ask.**
  - **Liquids (sinkhole) and solids (py-burner) remain restricted** — ask before assuming. And do not quietly fall back to voiding because a sink is inconvenient to design: price the real sinks first, then decide. The exception should be earned by the analysis, not used to skip it.
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
  - **Every terminal output tabulated with the sink it needs** — `t = min(sink_i / rate_i)` over all of them, not just the ones you care about. An undersized sink on a trivial byproduct throttles the primary product (design guide § Backpressure analysis #3)
  - **Each byproduct row names the sink that was chosen**, its rate, cost, and what it beat — not a list of options (design guide rule 5)
  - For blocks whose output varies with demand: cascades traced to a raw input, cycles checked for deadlock, and any stated operating policy tested for feasibility before control is designed (§ Backpressure analysis, § Energy economics)
- Solver mode selection: use `--target` only for demand-driven blocks with a single end product. Use `--input` for supply-driven or multi-output blocks (e.g. "I have 15/s raw-coal, what comes out"). Target mode minimizes buildings for the named target and will silently skip recipes that don't feed it — on a multi-output chain it produces a plausible-looking answer that drops whole processing branches. Note that `--max-import` is a hard LP constraint in target mode but only post-processing in input mode (`src/commands/solve.ts:207`).
- Solver defaults: always `--unlocked` and `--solver simplex`. Base-tier entities use bare names (`distilator`, `tar-processing-unit`), not `-mk01`; higher tiers use `-mk02`/`-mk03`/`-mk04`.

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
