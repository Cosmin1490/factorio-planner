# Solver & Data Reference

Technical reference for the factorio-planner production solver and Pyanodon prototype data. Consult when running the solver, debugging data issues, or looking up entity/recipe specifics. For design heuristics and decision frameworks, see [`design-guide.md`](design-guide.md).

---

## Solver mechanics

- Native TypeScript solver (no Lua dependency)
- Items produced by one recipe and consumed by another in the same block are classified as intermediates (state=0) and linked internally
- **Simplex solver** (default): Linear programming. Supports `--constraint exclude` (zeroes out production coefficients in working copy). In target mode, uses LP cost minimization (two-phase simplex). In input mode, uses legacy Helmod-style cost-weighted pivot selection. Handles complex chains with competing consumers.
- **Algebraic solver**: Multi-pass Gaussian elimination. Legacy, available via `--solver algebra`. Supports `--constraint` (master/exclude). Breaks on large chains (12+ recipes — gives astronomical numbers). No reason to use over simplex except for debugging.
- Module/beacon effects computed and exposed via `--modules` and `--beacons` CLI flags
- Fuel consumption modeled in matrix: burner factories consume fuel and produce `burnt_result` (e.g., coal→ash). This creates automatic intermediate linking but can cause degenerate scaling — prefer electric factories or use exclude constraints.
- `--max-import "item:amount"` caps how much of an item can be imported. In LP simplex (target mode), caps > 0 are modeled as hard LP constraints via import variables — the simplex finds the optimal solution within the cap. `amount=0` forces full internal production via post-processing (`adjustForBalance`). In algebraic and input-mode simplex, all caps use post-processing. Use `--max-import` for recycling loops (design guide rule 5a): when a byproduct converts back to an input at less than 100% recovery, the intermediate needs partial external supply. The LP classifies it as Intermediate (produced + consumed) with a `net >= 0` constraint, which is infeasible without the import variable. Cap at the net deficit to force recycling. Example: borax washing recycles 67% of water via sludge→water electrolyzer; `--max-import "water:75"` caps external water, forcing 150/s recycled.
- **LP simplex with cost minimization (target mode)**: standard two-phase simplex minimizes `sum(recipeCost × recipeRate)` where recipe costs are derived from BFS depth. Phase 1 finds feasibility via artificial variables, Phase 2 optimizes cost. Eliminates cascade blowup — 100-recipe logistic science pipeline dropped from ~326 to ~163 buildings. Exclude constraints and temperature-linked fluids work unchanged. Input mode uses the legacy Helmod-style simplex (cost-weighted pivot selection).
- **Temperature-linked fluids**: solver models fluid temperatures for fluids where at least one consumer has explicit `minimum_temperature` or `maximum_temperature` constraints. For these fluids, temperature-specific columns are created (e.g., `coke-oven-gas:fluid:250`, `coke-oven-gas:fluid:100`). Fluids without temp-constrained consumers share one column (old behavior). Example: `warm-stone-brick-1` degrades coke-oven-gas from 250°C→100°C — the solver correctly treats the 100°C output as waste, not recyclable into recipes needing 250°C+. Unconstrained fluids (steam without explicit temp requirements) still share one column — verify manually for those. **Limitation:** each ingredient binds to exactly one temperature column (the lowest qualifying). When multiple sources produce the same fluid at different qualifying temperatures (e.g., COG at 250°C from coke-coal and 500°C from reheat, both valid for a ≥250°C consumer), the solver only uses one. Fix: `--temp-variant "recipe:fluid:temp"` creates a virtual copy of the recipe that binds its fluid ingredient to the specified temperature column. The original recipe keeps its default binding (lowest qualifying). Example: `--temp-variant "warm-stone-brick-1:coke-oven-gas:500"` creates `warm-stone-brick-1 (coke-oven-gas@500)` that consumes COG:500 while the original consumes COG:250 — the LP splits demand across both.
- **Power modeling**: solver computes `totalPowerMW` and per-recipe `energyUsage` for electric factories. Burner factories (with `burner_prototype`) report 0. `fluid_energy_source` entities (e.g., steel-furnace) are NOT modeled as burners — their fuel consumption is silently ignored.
- **Recipe cycle detection**: pre-solve Tarjan's SCC on the item-recipe bipartite graph. Detects and warns about circular dependencies (e.g., ash loops from burner factories, coal-gas feedback). Cycles cause silent degenerate scaling in the algebraic solver (183M buildings on a 4-recipe log pipeline); the LP simplex handles cycles mathematically but returns 0 when infeasible. Warnings include suggested `--constraint` excludes. Example: `log3` on `fwf-mk01` (burner, coal fuel) creates an ash cycle because `assembling-machine-1` making wood-seeds also produces ash as burnt_result, which feeds back to log3's ash ingredient. **Recycling loops are not degenerate cycles.** When a byproduct recycles back to an input of the same chain (design guide rule 5a, e.g., muddy-sludge → water via electrolyzer), the cycle is intentional. Don't exclude it — use `--max-import "item:amount"` to cap the recycled item's external supply, forcing the LP to use the recycling recipe for the remainder.
- **No belt/pipe throughput modeling**: solver is algebraic — does not model belt limits, pipe capacity, or physical layout. Manual verification still needed for logistics.
- **Time base**: `--target "item:N"` means N per time base (default `--time 60` = 60 seconds). For per-second targets, use `--time 1`. The output labels show `/<time>s` (e.g., `80.00/1s` or `80.00/60s`).
- **Entity naming**: base-tier entities use bare names (`distilator`, `tar-processing-unit`), not `-mk01`. Higher tiers use `-mk02`/`-mk03`/`-mk04`. The solver errors with "Factory not found" on wrong names. Check `data.entities` keys if unsure.

---

## Solver setup checklist

Mechanical translation of design decisions to solver flags. For the design thinking behind each decision (what to import, what to exclude, why), see [design-guide.md](design-guide.md).

- **Recipe selection determines solution quality** — the solver finds a feasible solution given the recipes you chose. It does NOT search for better recipe alternatives. Every recipe in the `--recipes` list is a human decision: does this recipe use the cheapest path? Is there an alternative that avoids an expensive intermediate? Are there newer unlocked recipes that obsolete this one? Run `recipes --produces <item> --unlocked` for every non-trivial intermediate before locking in the recipe list. The solver is a calculator, not an optimizer — garbage recipes in, garbage solution out.
- **Translate boundary decisions to flags.** After classifying items per the design guide's boundary declaration:
    - **Readily available import** — no flag needed; the solver imports by default.
    - **Byproduct, don't scale for it** → `--constraint "recipe:product:exclude"`.
    - **Must consume internally** — compute manually and feed as fixed imports if the sub-chain has a fixed ratio.
- **Use electric factories for crafting** — `automated-factory-mk01` (crafting). For smelting, prefer `steel-furnace` (2x2, speed 4, fluid fuel) in city blocks — solver can use `advanced-foundry-mk01` for simplicity but real builds should use steel-furnace for density.
- **Exclude byproducts that drive scaling** — `--constraint "recipe:product:exclude"` for every item classified as "byproduct, don't scale for it." Excludes reduce degrees of freedom, helping the LP find better solutions faster. **Note:** excluded production is invisible to the solver — if the same item is also consumed by another recipe (crusher stone → stone-brick), the solver overstates the import. Subtract excluded production manually from solver-reported import rates.
- **Force internal production** — `--max-import "item:0"` for items the solver would otherwise import from the bus (iron-gear-wheel, iron-plate, processed ores). Cascading deficits push to raw materials. Distinct from "must consume internally" (design guide boundary declaration) — `--max-import` prevents import, not export.
- **Recycle byproducts** — add recycling recipes + `--max-import "item:0"` to force items through the loop.
- **Recycling loops: cap the loop's raw input** — when a recipe produces a byproduct that recycles back into the same chain (e.g., copper screener → grade-1-copper → crusher → grade-2-copper), the LP will skip the recycling step because imports are free in the objective function. It's cheaper (fewer buildings) to waste the byproduct and import more ore. Fix: `--max-import "ore:budget"` where budget = ore needed assuming full recycling. This forces the LP to use the recycling recipe to meet demand within the ore cap. Compute the budget from stoichiometry: e.g., copper needs 5 ore per plate with full grade-1 recycling, so `--max-import "copper-ore:N"` where N = 5 × target plates. Without the cap, the LP uses ~8 ore/plate (no recycling) and over-scales the screener. This applies to any chain where a multi-output recipe feeds a recycling loop — the LP will always prefer wasting the recyclable byproduct over adding the recycling building.
- **Pick the mode from the block's shape** — `--target` for demand-driven blocks with a *single* end product: it uses LP simplex with cost minimization and handles 100+ recipe chains without cascade blowup. `--input` for supply-driven or multi-output blocks ("I have 15/s raw-coal, what comes out"): it uses the legacy Helmod-style simplex, which propagates proportionally through the whole recipe set. **Do not use target mode on a multi-output chain.** Cost minimization drops recipes that do not feed the named target, so it returns a plausible-looking answer with entire processing branches missing — targeting syngas on the coal chain yielded 12 buildings and skipped tar refining completely, against 47 for the correct input-mode solve. To cap specific inputs in target mode, use `--max-import "item:amount"`.
- **Ash is readily available** — a common instance of "readily available import" in the design guide's boundary declaration. Nearly every block with burner buildings produces ash; it's always available from existing infrastructure. Exclude it from every burner recipe. **Exception:** when the block *consumes* ash as a recipe ingredient (log3, planter-box), ash becomes a production input, not just a byproduct. Don't import it — compute the ash balance manually: burner machine fuel ash + boiler ash vs recipe ash demand. Exclude ash from solver (prevents LP from gaming furnace scaling for ash), then verify self-sufficiency in a manual overlay. See design guide rule 9 (burner machines and boilers as ash sources).
- **Fuel selection: raw-coal vs coal** — the solver auto-selects the highest `fuel_value` fuel (coal 4 MJ > raw-coal 3 MJ). Use `--fuel "recipe:raw-coal"` to override when: (a) you want ash without a coal processing chain — raw-coal is mined directly, coal requires distillation, (b) the block should be self-contained with minimal processing depth, or (c) raw-coal is already imported for other burner machines. raw-coal burns 33% faster than coal but eliminates the entire distillation chain. Apply `--fuel` to every burner recipe in the solve command.
- **Watch for cycle warnings** — the solver detects cycles (Tarjan's SCC) and warns before solving. Common cause: burner factories producing ash as `burnt_result`. Use electric factories or `--constraint exclude` to break cycles.
- **Always add `--modules` for biological recipes** — without modules, bio farms are unusably slow and dominate building count (see Bio module system below).
- **Use `--time 1` for per-second targets** — without `--time 1`, `--target "item:0.2"` means 0.2 per 60 seconds (0.003/s), not 0.2/s. Check the output denominator (`/1s` vs `/60s`).
- **Entity names: no universal suffix rule** — check `data.entities` keys. Base-tier uses bare names (see Solver mechanics above).

---

## Constraint system

### Byproduct constraint mechanics

The design guide's classification (recycle > export > convert > void) determines WHAT to constrain. This section covers HOW to express those decisions as solver flags.

- **Match the limiting reagent** (design guide rule 6) — implement with `--constraint "recipe:product:exclude"` + `--max-import "scarce-input:0"`.
- **Recycle intermediates through every producing step** (design guide rule 7) — implement by forcing intermediates back with `--max-import item:0`.
- **Excluded production is invisible** — when a recipe's product is excluded, the solver treats it as if the recipe doesn't produce that item at all. If another recipe in the same solve consumes that item, the solver will report it as an import. The actual production still happens in-game. Subtract excluded production manually from solver-reported import rates.

### Closed self-sustaining loops — an invocation problem, not a solver fault

A product feeding back into its own production, net-positive without external input: breeding
(`animal → pup → animal`), forestry (`wood → seeds → seedling → log → wood`), fluid recycles
(`water → sludge → water`), coke/tar. The LP is correct on all of them; the invocation has to change.

- **Never cap both ends.** `--max-import` on two nodes of one closed cycle over-determines it — the
  loop needs no external input, so simplex settles on an inflated vertex. One breeding loop gave a flat
  **45× overshoot at every target scale** with two caps, and the right answer with one or none.
- **A recycled input needs a positive `--max-import` to stay importable** — the fix for most "cycle
  returns 0 buildings" cases, and an invocation change rather than a code one. Adding a recycle recipe
  gives its output an internal producer, reclassifying it from free-import to Intermediate with
  `net >= 0`, so the LP must balance it internally — usually impossible when the block is a net consumer.
  A positive cap adds an **import variable** (`solveSimplexLP`, `importVars` branch), letting the item be
  produced *and* imported; `cap = 0` forces internal balance instead. **Cap generously — it is a ceiling,
  not a target.** A water recycle in a block drawing net water is the common case: cap water and the
  whole recipe set, cycles included, solves in one pass.
- **Read stderr before assuming a solver fault.** `Phase 1 infeasible: Z=…, stuck artificials: <item>`
  names the item whose constraint cannot be met — either the recycled-input case above, or a loop that is
  genuinely short. **Check the loop's arithmetic first:** a single byproduct feeding its own input is
  often infeasible at every scale, and the LP is right to refuse. This prints to stderr, so
  `2>&1 | grep` on the results table hides it.
- **Target mode can still go Phase-1 infeasible** where no import is wanted. Solve in legs: import the
  looped item, size the loop's balance by hand (`X = X₀/(1−k)`, design guide rule 7), reconcile.
- **It will not partially mix two recipes serving one demand under a cap.** Given two moss recipes and
  a stone cap it took the all-stone-free option at nearly double the buildings. Blend by hand: cheap
  recipe up to the capped input, the other for the remainder.
- **A cycle warning is information.** Its suggested `:exclude` usually breaks the loop you are
  modelling. Read it as "confirm this is intentional", then check the intermediates table shows
  producer = consumer on every looped item.

**Always check output against target** — overshoot is the over-constrained signature, and it scales
linearly so it looks plausible at any size.

---

## Recipe verification

**Verify every recipe attribute against prototype data** before committing it to a block design. Run `recipe-info <recipe>` and confirm: (1) **category** → which building runs it (coal-gas is distilator, NOT gasifier — this error survived 3+ plan versions), (2) **ingredients** → exact item names ("coal" ≠ "raw-coal" — wrong name means a missing supply chain stage), (3) **products** → exact output count and probability, (4) **craft time**. The solver command implicitly assumes all four. Never rely on memory for recipe attributes — memory of recipe details decays and mutates; the prototype JSON is ground truth.

---

## Recipe availability — a separate check from `recipe-info`

**Authoritative:** `recipes --produces <item> --unlocked` reads `data.force.recipes[name].enabled`, the
live save state. Prototype `enabled: false` means nothing alone — `log1`/`log2`/`log3` all carry it and
all work. **`--unlocked` on `solve` does not filter recipes named in `--recipes`**, so naming a locked
one yields a complete, plausible, unbuildable answer.

Three states for a disabled recipe:

| signature | meaning |
|---|---|
| some technology lists it in `unlocks` | **research-gated** — traceable and costable |
| **no** technology lists it | **ambiguous** — TURD options (`Moss-1-without-sludge-for-real`) mixed with vanilla py disables outright (`loader`, `pumpjack`, `oil-refinery`). Never call these unavailable |

### TURD — one pick from N

`pyalienlife` grants one choice from several sub-techs at a master tech `<thing>-upgrade`. The mechanism
is **`recipe-replacement`, not `unlock-recipe`** — hence no tech→recipe edge. Option sets:
`pyalienlife/prototypes/upgrades/<thing>.lua`, `sub_techs[].effects`. Picks flip force state
(`turd.lua`: `old.enabled = false; if new then new.enabled = true end`), so the export can resolve them:

| master tech | base recipe | options | conclusion |
|---|---|---|---|
| not researched | enabled | all disabled | research-gated — cost the master tech |
| **researched** | **enabled** | **all disabled** | **`NOT_SELECTED` — pick open and free** |
| researched | disabled | one enabled | that option was taken |

Changing a *taken* pick needs `turd-partial-respec-1` — 700u behind `chemical-science-pack`. Treat taken
picks as frozen until chemical science.

**Trap: sub-techs carry `module-effects` (speed, consumption, productivity, pollution) applied via hidden
beacons at runtime — absent from the exported prototypes.** Real speed and draw can therefore differ from
`crafting_speed`/`energy_usage` with no trace in the JSON, so any block sized from the dump alone
understates power on affected entities. `moondrop-greenhouse-mk01` is a live instance: the pick that
unlocks `moondrop-co2` also applies `{consumption = 2, speed = 0.5}` to it. **Check a bio building's TURD
before trusting § Bio module system's multipliers.**

---

## Post-solver feasibility check

After running the solver, compute total tile footprint (`count × tile_width × tile_height` per recipe) and count distinct fluid/item types that need separate routing (pipes, belts). If total footprint exceeds ~5,000 tiles or distinct routed types exceed ~6, the block probably won't fit comfortably in a single city block with stations and routing. **Split into 2-3 identical stamps** (design guide rule 25) — divide the total input evenly across stamps, each sized to fit comfortably. The stamp count depends on building footprint and routing complexity, not a fixed ratio. This is cheaper than redesigning for density. The solver doesn't model physical constraints; this check bridges the gap.

---

## Power & energy formulas

**Steam producer throttling:** all boilers (electric and oil) stop when their steam output buffer is full. No steam draw -> no fuel/electricity consumed. Rated power is peak, not constant — actual cost tracks steam demand. Don't overestimate power budget based on rated values.

- **Total MW** = count × energy_usage × 60. Electric boilers (25 MW rated) often dominate peak budget. Always `--factory` with unlocked tiers — solver auto-picks mk04 which are usually locked.
- **Boiler + steam engine (solid fuel)**: boiler `max_energy_usage` = 61,687.5 J/tick = 3.70 MW thermal → heats 7.5/s water (at 2,100 × 235 = 493,500 J per unit). Steam engine `effectivity` = **0.5** (Pyanodon-specific, vanilla is 1.0) — halves the energy extracted from steam. `engine_output = fluid_usage × heat_capacity × ΔT × effectivity` = 15/s × 493,500 × 0.5 = **3.70 MW per engine**. Each engine needs 2 boilers (15/s steam ÷ 7.5/s per boiler). Fuel rate: `boiler_count × max_energy_usage / fuel_value` = e.g., 4 boilers with raw-coal (3 MJ): 4 × 3.70 / 3.0 = 4.93/s. The `max_energy_production` field (127,312.5 J/tick = 7.64 MW) is the absolute output cap, only reached with 500°C steam — at 250°C from standard boilers, effectivity is the binding constraint.
- **Oil boiler mk01**: effectivity=2, 0 MW electrical. `fuel_rate = (steam_rate × heat_capacity × dT) / (fuel_value × effectivity)`. Pyanodon water heat_capacity=2,100, dT=235. Fluid fuel_value in `data.fluids` not `data.items`. Oil-boiler-mk01: max_energy_usage = 493,500 J/tick = 29.61 MW heat → **60 steam/s** at Pyanodon water properties (2,100 × 235 = 493,500 J per steam). Confirmed in-game.
- **1.00 MJ/MJ is the ceiling for plain steam, not a tier to beat.** Read the `fluidbox_prototypes` filter before assuming a generator pairing — it is the binding constraint, not effectivity:

    | generator | eff | accepts | steam/s | max_power | unlocked |
    |---|--:|---|--:|--:|---|
    | `steam-engine` | **0.5** | `steam` ≥100 °C, max 500 | 15 | 7.64 MW | yes |
    | `steam-turbine` | **0.5** | `steam` ≥100 °C, max 2000 | 60 | 125.06 MW | no |
    | `steam-turbine-mk01` | **1.0** | **`pressured-steam` ≥500 °C**, max 1000 | 60 | **472.8 MW** | yes |

    **Every plain-steam generator in Pyanodon is effectivity 0.5**, so an oil-boiler (effectivity 2) feeding engines is exactly `1.00 MJ electric per MJ of fuel` and nothing better exists for plain steam. `steam-turbine-mk01` is unlocked but **cannot run on boiler steam at all** — it needs `pressured-steam`, whose only unlocked source is `he-01` (molten salt). Designs computing self-power on engines are correct, not stale.

- **Steam temperature sets engine *count*, not power.** An engine extracts `heat_capacity × (T − 15) × 0.5` per unit, so hotter steam means fewer engines for the same MJ/s, not more output: 3.70 MW each at 250 °C against **7.64 MW at 500 °C**, halving the bank. `oil-boiler-mk01` is capped at `target_temperature: 250`; the only unlocked 500 °C source is `geo-he-00` (geothermal-water 600 → steam 300 @500 °C).

- **Boilers scale steam output with feedwater temperature** (verified in-game) — `steam/s = max_energy_usage / (heat_capacity × (target_T − input_T))`, so returning 100 °C water instead of 15 °C cuts the heat needed per unit by 36% and the same fuel makes proportionally more steam. Recipe-based "boilers" do **not**: `electric-boiler-water-to-steam` and `cooling-water` are temperature-blind, producing fixed output regardless of input temperature. Check whether a steam source is a `type: boiler` entity or an assembling-machine recipe before assuming preheating helps.
- **Fluid-burner machines: the solver ignores their fuel and miscounts it as electricity.** `resolveFuel` returns `null` on `if (!factory.burner_prototype)`, and a `--fuel` override is silently dropped for the same reason plus a second one — it looks the fuel up in `data.items`, where fluids do not appear. So `--fuel "<recipe>:<a fluid>"` is accepted and has no effect. **The reported MW includes `energy_usage` for these machines**, so subtract it: `electrical = reported − (fractional × energy_usage)`, and `fuel_rate = fractional × energy_usage ÷ (fuel_value × effectivity)`. Check `fluid_energy_source.effectivity` — it is 1 on furnaces but 2 on oil boilers. Fluid `fuel_value` is in `data.fluids`. Low-value fuels change infrastructure, not just rate: coal-gas at 0.2 MJ needs 5× the pipe throughput of COG at 1.0.

**Fuel categories are not interchangeable.** Solid fuels belong to distinct categories: `chemical` (coal, coke, raw-coal), `biomass` (wood), `jerry` (all canisters — acetylene, gasoline, light-oil, etc.), `nexelit`, `quantum`. Each burner entity accepts only specific categories — check `entity.burner_prototype.fuel_categories`.

| Entity | chemical | biomass | jerry | nuke | nexelit | quantum |
|---|---|---|---|---|---|---|
| locomotive (mk01) | yes | yes | — | yes | — | — |
| mk02-locomotive | — | — | yes | yes | — | — |
| ht-locomotive (mk03) | — | — | — | — | yes | — |
| stone-furnace | yes | yes | — | — | — | — |
| assembling-machine-1 | yes | yes | — | — | — | — |
| assembling-machine-2 | yes | yes | yes | — | — | — |
| assembling-machine-3 | yes | yes | yes | yes | — | — |
| py-burner | yes | yes | yes | yes | — | — |

All canisters have the same fuel_value (10,000,000 J) regardless of the fluid inside. When planning fuel imports for a block, verify the consumer entity accepts the fuel category. Jerry fuels follow the container pattern (like barrels/cages) — fill at source (`empty-fuel-canister` + fluid → canister), burn at consumer, empty canister returns. No net canister consumption; plan for the return logistics (canister unload at filler, canister load at consumer).

---

## Bio module system

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

**NEVER compute bio building counts without full modules.** Without modules, bio farms are unusably slow and dominate building count (757 buildings for logistic science). Adding bio modules drops this to ~326; LP cost minimization further reduces to ~163. Unmoduled counts are meaningless — a 5-21× error makes the entire analysis wrong (e.g., 67 auog paddocks without modules vs 14 with). Always use `effective_speed` (formula below) for manual calculations and `--modules` for solver runs. mk02/mk03/mk04 tiers exist with 2x/3x/4x speed bonus per slot.

**Effective speed formula:** `effective_speed = base_crafting_speed × (1 + N_modules × module_bonus)`. Example: auog-paddock-mk01 (base 0.4) with 4 auog modules (+100% each): `0.4 × (1 + 4×1.0) = 2.0`. The "5x" in the table means full slots give 5x the base speed, not 5x some other number. Always compute effective craft time as `recipe_time / effective_speed` when sizing buildings.

**Variable-output recipes:** Some bio recipes produce a range (e.g., auog-pooping-1 yields 3-8 manure). Use the **average** `(min+max)/2` for throughput calculations — variance averages out over time. When sizing for a hard minimum guarantee (e.g., a critical-path item with no buffer), use `amount_min` instead and note the conservative assumption.

---

## Smelting & mining reference

### Smelting chains

Smelting chains (Pyanodon, current tech) — ore:plate ratio:
- **Iron**: direct 8:1 -> crush+smelt 5:1 -> BOF casting 1.4:1 (needs borax/oxygen/sand-casting)
- **Copper**: direct 8:1 -> screen+crush 4.2:1 (no extra inputs, stone byproduct)
- **Tin**: direct 10:1 -> screen+crush 3.75:1 (no extra inputs, stone byproduct)
- **Lead**: direct 6:1 -> screen+smelt 2:1 (5 ore -> 1 grade-1 -> 2.5 plate)
- **Zinc**: direct 10:1 -> crush+screen+smelt 3.3:1 (5 ore -> 1 g1 -> 1 g2 -> 1.5 plate; needs iron-stick)
- **Titanium**: direct 10:1 -> screen+recycle+smelt 1.9:1 (5 ore -> 2 g1 -> 1.33 g3 -> 2.67 plate; ti-rejects recycled)

Steel-furnace: 2x2 tiles, speed 4, fluid-burning. Prefer over advanced-foundry (6x6, speed 1, electric) — 33x more plates per tile. See Power & energy formulas for steel-furnace fuel calculation.

### Mining

**Mining fluid consumption formula:** `fluid/s per mine = mining_speed × fluid_amount / (10 × mining_time)`. **⚠ The `fluid_amount` in prototype data is 10x the actual in-game per-ore cost.** The Factorio engine applies a ÷10 divisor that is NOT visible in the exported prototype JSON or mod source. When reading `mineable_properties.fluid_amount` directly from data, always divide by 10. Verified 2026-10-10 with in-game testing:

| Ore | Fluid | Prototype `fluid_amount` | Actual per ore | In-game test |
|---|---|---:|---:|---|
| ore-titanium | acetylene | 40 | 4 | mk01: 60/min fluid, 15/min ore |
| ore-lead | acetylene | 100 | 10 | mk01: 300/min fluid, 30/min ore |
| ore-zinc | aromatics | 40 | 4 | (formula-derived) |
| ore-tin | steam | 100 | 10 | (formula-derived) |
| borax | syngas | 25 | 2.5 | (Helmod-verified) |

This is a common mistake — the prototype value looks plausible as-is (e.g., "40 acetylene per titanium ore" seems reasonable for Pyanodon), so the 10x error isn't obvious until you compute building counts and find they're absurdly high.

Mining operations can require any combination of: a **specific fluid** (acetylene, steam, aromatics — piped to fluid-drills), a **specific solid item** (drill heads — consumed by dedicated miners), a **type of fuel** (any burner fuel — for burner-type miners like antimony-drill), or just **electricity**. Basic electric/burner miners only work on `basic-solid` resources (iron, copper, coal, stone). Other ores need fluid-drills, dedicated miners, or ground-borers. Check `required_fluid` on the resource entity, and the miner entity's `energy_source` type and `ingredient` requirements.

### Dig sites

Some ores use a non-standard mining mechanic: a `dino-dig-site` building (7×7, 4 module slots) staffed with creature modules (digosaurus/thikat/work-o-dile) instead of conventional miners, fed food via a companion container (`dino-dig-site-food-input`). Currently only nexelit-ore uses it.

**⚠ The export does not contain the rate.** The dig site's only unlocked recipe is `digosaurus-hidden-recipe` (no ingredients → `nexelit-ore x4000`) — a placeholder, not a throughput. The `digosaurus-helmod-recipe-*` variants are Helmod display fictions carrying a fixed `energy_required = 10`; **that 10 s is not a cycle time.** Real production runs in `scripts/digosaurus/digosaurus.lua`: each module is one walking `unit` that pathfinds to a scanned `ore-nexelit` tile within `mining_range = 12.5`, mines, and walks back at `movement_speed = 0.076` tiles/tick (4.56 tiles/s), delivering `ores_gained_per_trip × product.amount × creature_bonus`. Trip time scales with walk distance, so **the rate is map-dependent and must be measured in game.**

**Measured 2026-10-15: averages ~4 trips/min per digosaurus** — about one trip per 15 s, consistent with a ~25-tile round trip at 4.56 tiles/s plus mining and dispatch overhead. **This is a mean with real trip-to-trip variance, not a constant:** `start_mining_command` calls `find_random_scanned_ore`, so every trip targets a *randomly chosen* tile within the 12.5 range and the walk distance varies with it; the 61-tick dispatch tick and unit pathfinding add further spread. Size belts and buffers against the average, and expect the average itself to move with patch geometry — a sparse or lopsided patch lengthens the mean walk. Trips are the food-independent primitive; ore follows from the multipliers:

`ore/min = 4 × ores_gained_per_trip × creature_bonus × occupied module slots`

A 4-digosaurus site is therefore 16 ore/min on guts or dried-meat, 32 on meat, 128 on workers-food.

| Food | `ores_gained_per_trip` | | Creature | `creature_bonus` |
|---|---:|---|---|---:|
| guts, dried-meat | 1 | | digosaurus | 1 |
| meat | 2 | | thikat | 2 |
| workers-food | 8 | | work-o-dile | 3 |
| workers-food-02 | 16 | | | |
| workers-food-03 | 32 | | | |

**Food is a yield multiplier, not a fuel** — the natural wrong reading, since it sits in a fuel-like slot. `Digosaurus.eat` removes exactly `count = 1` per trip whatever the food is, and the item eaten sets that trip's `ores_gained_per_trip`. So food consumption is flat at ~4 items/min per creature and **ore per food item = `ores_gained_per_trip` × `creature_bonus`**: upgrading guts → workers-food is 8× the ore at *identical* item throughput, not a slower burn. Confirmed in game 2026-10-15. Note `eat` returns the first matching food it finds rather than the best one, so feed a single food type per site — a mixed chest yields an unpredictable blend of multipliers.

Modules are **worker count, not a speed bonus** — each slot is one creature that can be out at a time, so a full site is **4×** one creature and an empty site produces nothing. Do not read the 4 slots as `1 + 4 × 100%`. The handler dispatches one creature per site per 61 ticks, which only binds if trips run under ~1 s. The site **stops mining once its output buffer passes 1000 ore**, so it must be drained to keep running, and it also needs food, scanned ore in range, and an electric buffer above 90%.

Since this mechanic is invisible to `recipe-tree`, `recipes --produces`, and `buildProducerIndex`, check for `helmod-recipe` variants when an ore appears to have no recipe producers — but treat their rates as display-only. Food sourcing (especially meat/guts from slaughterhouses) creates cross-block dependencies that must be planned explicitly.

---

## Prototype data quirks

- `entity.energy_usage` is in **J/tick** (not watts). Multiply by 60 to get watts (J/s). This matters for fuel consumption calculation.
- Some recipes have `products: {}` (empty object) instead of `[]` — handle with `Array.isArray()` check
- Recipe categories `barreling`, `unbarreling`, `py-barreling`, `py-unbarreling`, `recycling` are filtered from the producer index
- In Pyanodon, ALL vanilla assembling-machines (1/2/3) are burners (have `burner_prototype`). Use `automated-factory-mk01/02` (electric) or `advanced-foundry-mk01` (electric, smelting) to avoid burnt-result coupling.
- Entity quality fields (`crafting_speed` etc.) are objects keyed by quality name: `{ normal: 1, uncommon: 1.3, ... }`
- Module effects are per-quality: `item.module_effects.normal.speed`
- Coal `burnt_result` is ash (Pyanodon-specific). Solver models this — stone furnaces burning coal auto-produce ash as intermediate.
- Fuel categories and canister mechanics: see Power & energy formulas section. Code-facing: check `item.fuel_category` and `entity.burner_prototype.fuel_categories` (object with category keys → true). All canister items (`*-canister`) have `fuel_category: "jerry"` and `fuel_value: 10000000`. Recipe category `py-incineration` (pyvoid recipes) is filtered from producer index — check `data.recipes["<item>-pyvoid"]` directly.
- Force data (`force.recipes`) tracks unlock state per recipe. Technology data tracks researched techs with recipe unlocks, prerequisites, and research cost (science packs + unit count).
- Some recipes have `ingredients: {}` (empty object) instead of `[]` — same `Array.isArray()` guard as products
- Some recipes have variable output: `products[].amount_min` / `amount_max` instead of `amount` (e.g., auog-pooping-1 yields 3-8 manure). Read `.amount` first; if undefined, use `(amount_min + amount_max) / 2` for average throughput. See Bio module system section for sizing guidance.
- Products also carry **`probability`** — expected yield is `amount × probability`, and the solver uses that throughout. A face `amount` is not the yield. `sb-grade-03` advertises `2x sb-grade-03` at `probability 0.4`, so a recycle loop balanced on `2` is wrong by 2.5×. Byproduct probabilities (0.2, 0.3) only shift byproduct rates; **a probability on a recycled item corrupts the whole chain ratio.**
- **`recipes --produces` prints the face amount and omits `probability`; `recipe-info` prints it as `(40%)`.** Two printers in `recipes.ts`. Verify yields with `recipe-info`, never the listing.
- Pyanodon water `heat_capacity` is **2,100 J/unit/°C** (vanilla is 200). This is 10.5× higher and affects all steam/boiler calculations. Always read from `data.fluids["water"].heat_capacity`, don't hardcode.
- Fluid `fuel_value` is in `data.fluids`, not `data.items`. Oil boiler mk01 `fluid_energy_source.effectivity=2` doubles fuel efficiency. **Boiler `max_energy_usage`** = max heat output rate (not fuel burn rate). Oil-boiler-mk01: 493,500 J/tick = 29.61 MW heat → **60 steam/s** at Pyanodon water properties (2,100 × 235 = 493,500 J per steam). Confirmed in-game.
- **Mining quirks** — many items that appear to have "no producers" in recipe-tree are actually mined from resource patches with dedicated miners (`buildProducerIndex` won't find them). Key examples: `native-flora` (ore-bioreserve → flora-collector), wild plants (`ralesia`, `rennea`, etc. → harvester), specialized ores (`coal-rock`, `quartz-rock`, `borax` → dedicated mines). Check `data.entities` for resources with `mineable_properties` when an item has no recipe producers. Also: stone mining yields both `stone` and `kerogen` (check `mineable_properties.products` for co-products), and many ores require a specific fluid to mine (check `mineable_properties.required_fluid`; see Smelting & mining reference). Mining fluid consumption: `fluid/s = mining_speed × fluid_amount / (10 × mining_time)` — the ÷10 is a game engine constant not visible in prototype data. Entity display names (e.g., "Crystal mine" for `borax-mine`) come from locale strings not in prototype JSON — don't assume an entity doesn't exist because the display name doesn't match.
- **Script-driven production is invisible to the export.** Where a mod implements output in `control.lua`/`scripts/`, the prototype JSON carries a placeholder recipe whose numbers are meaningless — `digosaurus-hidden-recipe` advertises `nexelit-ore x4000` for no inputs, and pyAL's farm buildings are born `active = false` until a module is inserted (`scripts/farming/farming.lua`), which no data-stage read reveals. When a rate looks absurd or a building appears to need nothing, read the mod's Lua before trusting the dump. Rates from these mechanics have to be measured in game — see Dig sites.

---

## CLI reference

### Recipe tree tips

Pyanodon's recipe graph is extremely dense. For practical use:

- Always use `--unlocked` to filter locked recipes
- Use `--ignore` for commodity items: `water steam carbon-dioxide soil muddy-sludge compost oxygen hydrogen ash coke limestone`
- Add `wood moss raw-coal` to ignore list for deeper chains
- Use `--depth 2-3` for focused exploration, full depth only with aggressive ignore lists
- Without ignore, even simple items like acetylene produce 6000+ lines

### Inventory command

Decodes blueprint strings, infers what each block does, and saves to `data/saves/<name>.json`.

```bash
# Analyze a blueprint
npx tsx src/cli.ts inventory --blueprint bp7.txt --name "copper block"

# Save incrementally (appends new block or updates existing by name)
npx tsx src/cli.ts inventory --blueprint bp7.txt --name "copper block" --save pyanodon-main
```

- **Recipe-less entity detection**: three classes of blueprint entities have no `recipe` field:
  - **Miners** (`type=mining-drill`): inferred from `resource_categories` × items consumed by block recipes
  - **Boilers** (`type=boiler`, `burns_fluid=true`): picks best non-cycling fluid fuel from block-produced fluids
  - **Furnaces** (`type=furnace`): inferred from `crafting_categories` × recipes whose ingredients are block-produced. Disambiguated by station/consumer presence. Void categories (`py-incineration`, `py-runoff`) excluded.
- **Steady-state rates**: iterative convergence — caps consumers at available supply, caps overproducers only when ALL consumed products are surplus. Export-path protection: upstream intermediates feeding stationed exports are shielded from bidirectional scaling. Void recipes (`py-venting`, `py-incineration`, `py-runoff`) sized to leftover surplus after convergence — they don't compete with production recipes for supply. Waste byproducts (zero consumers) don't block scaling.
- **Export classification**: `exports` = net-positive items WITH a load station. `surplus` = net-positive items WITHOUT a load station (voided, burned, recycled). Both fields are `Record<string, number>` in `BlockInventory`.
- **Overproduction capping**: post-convergence pass detects recipes that consume valuable inputs (exports or imports) but massively overproduce intermediates (>5x demand). Caps them to match actual demand, then re-converges with bidirectional scaling until stable. Handles both self-reinforcing cycles (bp5 log→wood cycle exports 1.47/s) and import waste (bp2 log-wood-fast capped from 4→0.65 log/s).
- **Burner fuel not modeled**: stone-furnace coal consumption is invisible in rates (same limitation as solver for burner factories).
- **Save format**: `--name` required for `--save`. Existing entries matched by name — replaced if found, appended if new. `count` field defaults to 1, editable in JSON for multiple copies. **When saving a block, always update both `data/saves/<name>.json` (via `--save`) AND `data/saves/<name>.md` (manually) to keep them in sync.**

### Helmod export format

Pipeline: `luaSerialize(model)` → `zlib.deflateSync()` → `base64` — **NO version byte prefix**.

- Factorio's `helpers.encode_string()` returns `base64(zlib(data))` without a "0" prefix. The "0" prefix is blueprint-string-specific, not used by Helmod.
- Helmod's `Converter.read()` passes the string directly to `helpers.decode_string()`, then `loadstring()` on the result.
- `ModelBuilder.copyModel()` reconstructs the model. It validates recipe names against game prototypes — they must be real recipes.
- Key fields read by `copyFactory()`: `name`, `quality`, `fuel`, `modules`, `module_priority`
- Input constraints go in `block_root.ingredients` with `{name, type, input=amount}`. Target constraints go in `block_root.products`.
- For input mode: `by_product=false, by_factory=false`. `by_factory=true` is a separate mode (fixed factory count) that skips reading `.input` values.
- Export reverses recipe order so output recipe is R1 (index 0), matching Helmod's top-to-bottom algebraic solver.
