# TODO

Prioritized by impact per effort.

## P1 — Inventory accuracy

1. [ ] **Cascade export detection**: when an intermediate has a load station but net production ≈ 0 (all consumed internally), the inventory command shows nothing in exports. Real behavior: when downstream demand drops, excess overflows to the station. Need to model variable-demand scenarios — e.g., coal-gas-syngas block exports 0–221/s coal-gas depending on syngas pull. Hard problem: requires modeling demand elasticity, not just max-throughput steady state. At minimum, annotate items that have load stations but show as intermediates (potential cascade exports with max rate = production rate).

1b. [ ] **Import-aware steady-state convergence**: when an item has an unload station (import) AND is produced internally (recycling loop), the convergence treats it as a pure internal intermediate and caps consumers to match only internal production — ignoring the external supply from trains. This causes a death spiral to near-zero rates. Example: borax block has water imported via train + water recycled from muddy-sludge electrolyzer; convergence sees water consumption > electrolyzer production and collapses the whole block to 0.003/s. Fix: items with unload stations should be excluded from the "consumption exceeds production" capping (or modeled as having unlimited external supply). Reference blueprint: `data/inventory-failing-blueprints/borax-block-bp1.txt`.

## P2 — Solver usability

2. [ ] **`--electric` / `--no-burner`**: auto-select best electric (non-burner) factory per recipe.
2b. [x] **`--temp-variant "recipe:fluid:temp"`**: create a virtual copy of a recipe that binds its fluid ingredient to a specific temperature column. Workaround for the solver's one-column-per-ingredient temperature limitation — when a recipe accepts a fluid range (e.g., COG ≥250°C) and multiple temperature sources exist (250°C from coke-coal, 500°C from reheat), the LP can only consume from one column. The variant lets it use both. Example: `--temp-variant "warm-stone-brick-1:coke-oven-gas:500"` creates `warm-stone-brick-1 (coke-oven-gas@500)` that binds to COG:500 instead of COG:250. Both the original and variant produce the same outputs; the LP splits demand between them.

## P3 — Methodology gaps

3. [ ] **Standard module/beacon strategy**: add design guide section for productivity/speed modules and beacons — the biggest late-game efficiency lever. Cover: when to apply productivity (most expensive recipes first), how it changes solver ratios (output up, craft time up), beacon placement strategy. **Factorio 2.0 note**: beacon effect is `distribution_efficiency / sqrt(n)` (2.0.7) — row-based arrays beat surrounding with max beacons.
4. [ ] **Circuit patterns for deadlock prevention**: add circuit cookbook to design guide — SR latch hysteresis, overflow valve wiring, conditional inserter loading for multi-product balancing. **Factorio 2.0 note**: valve entity with threshold mechanics may simplify overflow-to-void patterns.
5. [ ] **Train station throughput planning**: add capacity analysis to rule 30 — trains/minute per station, when to add parallel stations, validation that train network can deliver what block delta planning demands. **Factorio 2.0 note**: schedule interrupts and generic trains change the throughput calculus.
7. [ ] **Restore `/block-design` skill (rewritten)**: deleted 2026-10-10 along with `/pipeline` — both had drifted far enough to actively mislead (recoverable from git history before the deletion commit). The phase ordering was sound scaffolding (demand → recipes → boundary → fuel → power → recycling → solve → layout → export); what was wrong:
   - **Assumed demand-driven targets throughout.** Phase 1 asked "what item, what rate" and Phase 7 fed that into `--target`. Supply-driven blocks ("15/s raw-coal in, many products out") don't fit, and target mode on a multi-output chain silently drops processing branches. A rewrite needs both framings and the mode decision rule up front.
   - **Defaulted to voiding.** Phase 6 said "void or burn" for zero-consumer byproducts. Sinkholes are now disallowed outright, and "burn" silently fails for non-fuels (creosote is `fuel_value: 0`). Needs the fuel-vs-material-sink check instead.
   - **Restated design guide content** (rule numbers, fuel formulas, heat capacity) rather than linking it, so it drifted on every guide edit. A rewrite should link only — the `/pipeline` skill did this correctly and aged much better.
   - **Missing** the operating-policy feasibility check and the capacity-vs-demand route classification (disposal routes sized for 100% of upstream flow, value routes sized to max plausible demand).
   Also re-add the factory-naming gotcha and solver defaults from `/pipeline` if that one isn't restored — currently preserved in CLAUDE.md § Rules.

6. [ ] **Early game guide**: `docs/design-guide.md` assumes mid-game+. Add a section covering coal processing bootstrap (coal → coke → tar → coal-gas progression), first automation, power bootstrap, and the burner-phase survival guide. This is where most Py players quit — the methodology gap matters for completeness.
