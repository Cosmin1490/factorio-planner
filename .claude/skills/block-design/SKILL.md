# /block-design — City Block Design Checklist

Design a production block following the Pyanodon methodology (rules 8-28).

## Prerequisites

Before starting, read `docs/pyanodon-methodology.md` for the full framework.

## Phase 1: Target & Demand

- Ask: **what item** and **what rate** (items/s)?
- Ask: **which save** for inventory context? Load `data/saves/<name>.json` to see existing blocks, their exports/imports, and current supply/demand.
- Re-derive demand fresh — targets go stale as the factory evolves (rule 14).
- Round up to belt-tier increments: 15/s (yellow), 30/s (red), 45/s (blue).

## Phase 2: Recipe Selection

- Explore alternatives with `npx tsx src/cli.ts recipe-tree --needs <item> --unlocked --depth 2 --ignore "water steam carbon-dioxide soil muddy-sludge compost oxygen hydrogen ash coke limestone"`
- Compare competing recipes on: ingredient availability, byproduct value, building count, power cost (rule 10).
- Check recipe attributes: category, ingredient count, products, craft time.
- For variable-output recipes (bio): use average `(amount_min + amount_max) / 2`.

## Phase 3: Boundary Selection

- Classify intermediates by consumer count (rule 16):
  - **Tier A (50+)**: bus items — always import (steel-plate, iron-plate, electronic-circuit, glass...)
  - **Tier B (15-49)**: strong candidates for dedicated blocks (coke, rubber, battery-mk01...)
  - **Tier C (5-14)**: context-dependent
  - **Tier D (<5)**: inline unless shared
- Check chain depth: 5+ recipes justify splitting into sub-blocks (rule 17).
- Avoid temperature-variant fluids as boundaries (rule 19).
- Count ALL recipes (including locked) for consumer counts — boundaries should hold as more techs unlock.

## Phase 4: Fuel Strategy

- Evaluate **ALL block-produced fluids** as fuel candidates — including the main product if it's a fluid. Using main product as fuel is a production cost, not waste.
- Check fuel category compatibility: `entity.burner_prototype.fuel_categories` vs `item.fuel_category`. Categories are NOT interchangeable (chemical, biomass, jerry, nexelit, quantum).
- Oil boiler mk01: `effectivity=2`, doubles fuel efficiency, 0 MW electrical.
- Formula: `fuel_rate = (steam_rate × heat_capacity × ΔT) / (fuel_value × effectivity)`
- Pyanodon water heat_capacity = 2,100 J/unit/°C (10.5x vanilla). Read from `data.fluids["water"].heat_capacity`.
- Produce steam locally, never train it. Train fuel fluids instead.

## Phase 5: Power Estimate

- Sum building power: `count × energy_usage × 60` (energy_usage is J/tick, ×60 = watts).
- Electric boilers (25 MW rated) dominate peak budget — flag them.
- Use unlocked machine tiers only.

## Phase 6: Recycling Analysis

- Identify byproducts from the solver output.
- **Recycle when it saves a station or eliminates voiding** — don't dismiss recycling just because LP says importing is cheaper.
- Void at source when possible. One void destination at lowest priority is OK if it doesn't fit within the producing block.
- Waste byproducts with zero consumers: void or burn, don't let them block scaling.

## Phase 7: Solve

Run `/pipeline` with assembled parameters:
- All recipes from phase 2
- Target from phase 1
- Factory overrides with correct (unlocked) tiers
- Constraints: exclude byproducts identified in phase 6
- Max-import caps for items that should be produced internally

## Phase 8: Layout Feasibility

Post-solver checks:
- **Footprint**: if total tile area > ~5,000 tiles or routed item/fluid types > ~6, split into 2-3 identical stamps.
- **Building count**: if > 40 buildings, strongly consider stamping.
- Building count ≠ building space: a 6×6 sap-extractor vs 15×15 FWF is a 56x tile range.
- Check that all imports have existing supplier blocks (from save inventory).

## Phase 9: Helmod Export

- Generate Helmod import string: `--export helmod`
- Remind: export reverses recipe order (output recipe becomes R1/index 0).
- No version byte prefix — Helmod uses raw `base64(zlib(lua))`.

## Output

Present the complete block specification:
1. Pipeline summary (from /pipeline)
2. Station plan: which items get load/unload stations
3. Import sources: which existing blocks supply each import
4. Fuel strategy: which fluid fuels steam, at what rate
5. Power budget: total MW, breakdown by recipe
6. Design notes: stamping plan, recycling loops, build order constraints (e.g., mining fluid dependencies)
7. Helmod import string
