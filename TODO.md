# TODO

Prioritized by impact per effort.

## P1 — Inventory accuracy

1. [ ] **Cascade export detection**: when an intermediate has a load station but net production ≈ 0 (all consumed internally), the inventory command shows nothing in exports. Real behavior: when downstream demand drops, excess overflows to the station. Need to model variable-demand scenarios — e.g., coal-gas-syngas block exports 0–221/s coal-gas depending on syngas pull. Hard problem: requires modeling demand elasticity, not just max-throughput steady state. At minimum, annotate items that have load stations but show as intermediates (potential cascade exports with max rate = production rate).

1b. [ ] **Import-aware steady-state convergence**: when an item has an unload station (import) AND is produced internally (recycling loop), the convergence treats it as a pure internal intermediate and caps consumers to match only internal production — ignoring the external supply from trains. This causes a death spiral to near-zero rates. Example: borax block has water imported via train + water recycled from muddy-sludge electrolyzer; convergence sees water consumption > electrolyzer production and collapses the whole block to 0.003/s. Fix: items with unload stations should be excluded from the "consumption exceeds production" capping (or modeled as having unlimited external supply). Reference blueprint: `data/inventory-failing-blueprints/borax-block-bp1.txt`.

## P2 — Solver usability

2. [ ] **`--electric` / `--no-burner`**: auto-select best electric (non-burner) factory per recipe.
2b. [ ] **`--fuel "recipe:item"`**: force a specific fuel for burner factories. Currently the solver auto-selects fuel and you can't override it. Needed for scenarios like forcing coke instead of coal in BOF (different fuel_value changes consumption rates and byproduct balance). Without this, inlined fuel production chains can't be solver-validated end-to-end.

## P3 — Methodology gaps

3. [ ] **Standard module/beacon strategy**: add methodology section for productivity/speed modules and beacons — the biggest late-game efficiency lever. Cover: when to apply productivity (most expensive recipes first), how it changes solver ratios (output up, craft time up), beacon placement strategy. **Factorio 2.0 note**: beacon effect is `distribution_efficiency / sqrt(n)` (2.0.7) — row-based arrays beat surrounding with max beacons.
4. [ ] **Circuit patterns for deadlock prevention**: add circuit cookbook to methodology — SR latch hysteresis, overflow valve wiring, conditional inserter loading for multi-product balancing. **Factorio 2.0 note**: valve entity with threshold mechanics may simplify overflow-to-void patterns.
5. [ ] **Train station throughput planning**: add capacity analysis to rule 30 — trains/minute per station, when to add parallel stations, validation that train network can deliver what block delta planning demands. **Factorio 2.0 note**: schedule interrupts and generic trains change the throughput calculus.
6. [ ] **Early game methodology**: `docs/pyanodon-methodology.md` assumes mid-game+. Add a section covering coal processing bootstrap (coal → coke → tar → coal-gas progression), first automation, power bootstrap, and the burner-phase survival guide. This is where most Py players quit — the methodology gap matters for completeness.
