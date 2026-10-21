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

## Working mode

The intro's division of labour, operationally. The user holds intent, engineering judgment and taste;
Claude holds recipe knowledge and computes exactly what is asked. **The failure mode to watch is a
correct answer to the wrong question** — arithmetic rigour does not catch a badly posed one.

- **Exploratory questions are fragments, not scope.** A question probes one piece of a picture the user
  is already assembling. Answer that piece fully, on its own terms. Do not infer the surrounding design,
  do not frame the answer as "for your X this means Y", and do not treat the question's boundary as the
  extent of their thinking. **The synthesis is theirs** — they say when they want the pieces assembled.
- **Most branches close, and that is the normal ratio.** The dead ends are what make the live branch
  findable. Keep exploratory answers cheap: fast, no design files, nothing to undo when a branch closes.
- **Never assert game state.** State material and building needs as *requirements*, never "which you
  don't have". If readiness genuinely changes the answer, derive it or ask — do not guess. Modules that
  are their own product (moss, ralesia, auog, moondrop) are self-funding capital, not barriers.
- **Built-ness is not evidence, in either direction.** Do not weight "design X is already built" when
  comparing it against an exploratory alternative — lab time is cheap against committing hundreds of
  buildings. Equally, never frame an unbuilt or superseded design as a failure or a detour: it may have
  settled the question that made its successor statable. Keep *verification* caveats (a figure the
  solver could not confirm) strictly separate from sunk cost, which is not a caveat at all.
- **Report trades, do not resolve them.** Where an optimisation exists but costs build complexity —
  circuit-switched fuel reallocation, bypass wiring — give both numbers and the condition that
  separates them. Silently picking a side removes an option the builder did not know they had.
- **Verify over speed — iterations are free, wrong answers cost a build cycle.** The expensive resource
  is the user's build time, never solver runs or round-trips. Re-check rather than extrapolate, and
  **label provenance** when a number is not direct solver output (hand algebra, scaled from another
  solve, read from mod source).
- **Design-guide text is terse and never cites a design file.** Frame insights as knowledge the owner
  holds, not as a cost to buy. Lead with the claim and let the number carry the argument — explanation
  before claim doubles the length for no added information. Show drafts and take critique rather than
  writing into the guide on the first pass.

## Rules

- **Ruleset: full Pyanodon with self-imposed restrictions inspired by pyhardmode.** The mod is *not* installed — these are house rules, and *harsher* than the real mod, which ships compensating voiding recipes so its restriction isn't masochistic. The lists below correct for those missing affordances; they do not relax the standard.
  - **Default: no voiding.** Every byproduct is recycled, exported, or converted. All 71 `py-venting` recipes are mechanically unlocked, so nothing enforces this but discipline — and that discipline is what produced the best designs in this repo.
  - **Venting is a fallback, never a path.** Price the real sinks first, then fall back if they don't justify themselves — and record what was chosen and what it beat (design guide rule 5). Pre-approval below removes the need to *ask*; it does not remove the analysis. Do not reach for a vent because a sink is inconvenient to design. Separately, "the alternative is busywork with no design interest" is a reason to *raise* the question, never to self-approve — it is the criterion that would otherwise justify anything.
  - **Pre-approved to vent, once the alternatives have been priced** — atmospheric or inert, and `py-gas-vent` is a stack, so venting inert exhaust up one is what real plants do: `carbon-dioxide`, `oxygen`, `nitrogen`/`purest-nitrogen-gas`, `hydrogen`, `helium`/`helium3`/`purier-helium`/`helium-rich-gas`, the `*-air` family, `flue-gas`, `vacuum`. (`hydrogen` is nominally a fuel but 0.10 MJ is the weakest in the game — noise in any energy budget. `flue-gas` is combustion exhaust, and the pollution was already charged at the burner. **`pressured-hydrogen` is not on this list** — at 1.25 MJ it is the most energy-dense gas in the vent list. **The steams are not on this list either** — see the next bullet.) `py-gas-vent` is 1×1, 25 kW, 40,000/s — one handles essentially any rate.
  - **Steam is never vented — it goes to a generator or a recipe.** `steam`/`pressured-steam`/`critical-steam` pass the test that built the list above (`fuel_value: 0`) but fail the one that matters: steam's energy is `heat_capacity × (T − 15)`, not `fuel_value`. `steam` at 250°C is 0.4935 MJ/unit, and `pressured-steam` (heat capacity 8000, max 5000°C) exceeds `pressured-hydrogen`'s 1.25 MJ above 171°C — so venting these would be inconsistent with excluding that. A steam-engine or turbine always exists. If steam has nowhere to go, the correct behavior is for the **producer to throttle**: a backed-up boiler simply stops burning, which costs throughput, not fuel. Cooling towers are not an escape — `cooling-water` is a temperature-blind recipe (400 steam → 400 water @100°C regardless of input temperature), so it destroys exactly the energy a vent would, and the 100°C return water makes the boiler *more* productive per unit fuel, enlarging the surplus it was meant to absorb.
  - **Not approved — burn it instead.** Fuel gases: `methane`, `syngas`/`hot-`/`purified-`/`dirty-`/`refsyngas`, `coal-gas`, `coalbed-gas`, `coke-oven-gas`, the `natural-gas` family, `petroleum-gas`, `propene`, `ethylene`, `acetylene`, `raw-gas`, `residual-gas`, `outlet-gas-*`, `pressured-hydrogen`. A boiler always exists; venting fuel wastes capturable energy, which is what this ruleset exists to prevent.
  - **Never vented — must be processed.** Toxic or reactive: `chlorine`, `fluorine-gas`, `phosphine-gas`, `nitrogen-mustard`, `carbon-sulfide`, `acidgas`, `ammonia`, `aniline`, `chloromethane`, `dcm`, `dms`, `phosphorus-tricloride`, `phosphoryl-chloride`, `nitrous-oxide`, `formic-acid`, `tholins`/`proto-tholins`, `trichlorosilane`/`pure-trichlorosilane`, `acetone`, `diborane`, `tritium`. Real plants scrub these rather than stacking them. Anything unlisted — `gas-stream`, `dry-gas-stream`, `rich-gas`, `high-purified-gas`, `hot-reaction-gas`, `proton`: **ask.**
  - **Liquids and solids: ask, and expect no.** `py-sinkhole` is a hole in the ground and `py-burner` destroys matter — neither resembles anything industry does, so these are effectively never approved. Note that "flaring is realistic" is not an argument for sinkholing a liquid fuel: flaring is controlled combustion, which is already the "burn it instead" answer.
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
  - Block boundary declared before solver run — every item classified as readily-available-import, byproduct-exclude, or must-consume-internally (design guide § Block boundary declaration). If the inventory is empty or stale, **reconstruct it** from completed designs — inputs of what the base produces, plus the construction materials of those designs' buildings, closed transitively (§ Construction-cost feasibility). Ask only for what reconstruction cannot settle, and label reconstructed items as inferred
  - **Every terminal output tabulated with the sink it needs** — `t = min(sink_i / rate_i)` over all of them, not just the ones you care about. An undersized sink on a trivial byproduct throttles the primary product (design guide § Backpressure analysis #3)
  - **Each byproduct row names the sink that was chosen**, its rate, cost, and what it beat — not a list of options (design guide rule 5)
  - For blocks whose output varies with demand: cascades traced to a raw input, cycles checked for deadlock, and any stated operating policy tested for feasibility before control is designed (§ Backpressure analysis, § Energy economics)
- Block design output: every design lists the **distinct materials needed to construct its buildings** (separate from flow imports — many never appear in the solve), then gets a two-or-three-sentence **construction-feasibility note** if any of those look unavailable: what's missing, what to build first, and that it's an inference. Both in design guide § Construction-cost feasibility. The note is appended *after* the design — never a gate, never a question round.
- **Every design records the full solver command that produced it**, in a ```bash block, with every `--recipes` / `--target` / `--input` / `--time` / `--factory` / `--modules` / `--fuel` / `--max-import` flag verbatim — not a prose summary like "input mode, `--input raw-coal:900`". Multi-mode designs record one command per mode. Above the block, add a line for any flag whose *absence* changes the answer (e.g. a `--max-import` that forces a recycling loop the LP would otherwise skip). Rates go stale as prototype data and unlocks change; the command is what makes a design re-checkable instead of re-derivable from scratch. **Designs 06 and 07 are the format reference** — 07 is the stress case at 130 recipes and 130 `--factory` overrides. Applies to new designs and to any existing one being revised. The earlier back catalogue predates the rule and its published rates stand; it may be backfilled later where a command isn't already recorded, but that is never a prerequisite for other work.
  - The command is also what makes a design **revisable**: when a decision changes the recipe set — an import becomes local, a byproduct gets a different sink, a chain is split out — **re-run the command rather than editing the numbers**. Patching propagates the old configuration's consequences, and those are never the rows you changed: removing a recipe strands whatever its byproducts were justifying, two or three steps away and usually in a different subsystem. A re-solve catches that for free. The solver keeps producing a consistent answer either way, which is exactly why hand-editing feels safe.
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
