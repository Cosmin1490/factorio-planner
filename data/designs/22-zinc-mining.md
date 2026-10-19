# 22 — Zinc mining + grading — 1.80 zinc-plate/s, 16 buildings

Fourth of the mining upgrades (19 titanium, 20 lead, 21 tin). Ore-to-plate goes **10.0 → 3.33**,
a clean 3×.

```
zinc-plate-1  [U] [smelting, 60 s]        ore-zinc 40                →  zinc-plate 4   10.0 ore/plate
grade-1-zinc  [U] [ball-mill, 4 s]        iron-stick 3 + ore-zinc 5  →  grade-1-zinc 1 + soil 0.7 + stone 0.5
grade-2-zinc  [U] [impact-crusher, 2 s]   grade-1-zinc 2             →  grade-2-zinc 2 + sand 0.5
zinc-plate-2  [U] [smelting, 40 s]        grade-2-zinc 20            →  zinc-plate 30   3.33 ore/plate
```

Two things make zinc unlike the other three outposts: **its mining fluid is aromatics**, which
competes directly with plastic and rubber, and **`grade-1-zinc` consumes iron-stick**, which has to
be made on site.

## The iron-stick problem and the canister loop

`grade-1-zinc` wants `iron-stick 3` per 5 ore. Shipping sticks to an outpost is the thing this
design exists to avoid, so they are made locally from imported plate — in a burner assembler fed by
a self-closing fuel loop:

```
assembling-machine-2     burner {chemical, biomass, jerry} · speed 2 · 0.15 MW
fill-acetylene-canister  [U] [py-unbarreling, 0.2 s]  empty-fuel-canister 1 + acetylene 10
                                                      →  acetylene-canister 1
acetylene-canister       10.00 MJ · fuel_category jerry · burnt_result = empty-fuel-canister
```

**Lossless and self-closing.** Acetylene is 1.00 MJ/unit and the canister is 10.00 MJ, so the fill
step converts energy 1:1 with no penalty; `burnt_result` returns the empty automatically when the
assembler burns it. The canisters are a **catalyst** — a one-time stock, never a resupply. This is
what lets an outpost run an assembler with no electricity and no stick imports.

Fuel draw is negligible: the assembler is 45 % loaded on 0.15 MW, so 0.0675 MW → **0.0675
acetylene/s** through the loop.

## Block boundary

| class | items |
|---|---|
| **import — from design 13** | aromatics (mining fluid), acetylene (smelter + canister fuel) |
| **import — readily available** | iron-plate, electricity |
| **import — one-time** | empty-fuel-canister (catalyst, recovered by `burnt_result`) |
| **mined in-block** | ore-zinc |
| **must-consume-internally** | grade-1-zinc, grade-2-zinc, iron-stick, acetylene-canister |
| **byproduct-exclude** | none |

## Recipe table

```
┌─────────────────────────┬──────────────────────┬───────┬──────┬─────────┐
│ Recipe                  │ Factory              │ Count │ Size │ MW each │
├─────────────────────────┼──────────────────────┼───────┼──────┼─────────┤
│ (mining)                │ fluid-drill-mk02     │     6 │ 5x5  │    0.90 │
│ grade-1-zinc            │ ball-mill-mk01       │     5 │ 6x6  │    1.00 │
│ grade-2-zinc            │ impact-crusher-mk01  │     2 │ 6x6  │    0.50 │
│ zinc-plate-2            │ steel-furnace        │     1 │ 2x2  │  (gas)  │
│ iron-stick              │ assembling-machine-2 │     1 │ 3x3  │  (gas)  │
│ fill-acetylene-canister │ barrel-machine-mk01  │     1 │ 3x3  │    0.20 │
└─────────────────────────┴──────────────────────┴───────┴──────┴─────────┘
```

**16 buildings · 10.80 MW electric** — 5.40 drills + 5.40 process. ~400 tiles of building.

**Inputs** (/s): **aromatics 24.00** · iron-plate 1.80 · acetylene 3.67 (3.60 furnace + 0.07 canisters)

**Exports** (/s): **zinc-plate 1.80** · soil 0.84 · stone 0.60 · sand 0.30

## Intermediate flows

```
┌───────────────────┬─────────┬─────────────────────┬────────────────────────┐
│ Item              │ Rate /s │ Producer            │ Consumer               │
├───────────────────┼─────────┼─────────────────────┼────────────────────────┤
│ ore-zinc          │    6.00 │ 6x fluid-drill-mk02 │ grade-1-zinc 6.00      │
│ iron-stick        │    3.60 │ iron-stick (AM2)    │ grade-1-zinc 3.60      │
│ grade-1-zinc      │    1.20 │ grade-1-zinc        │ grade-2-zinc 1.20      │
│ grade-2-zinc      │    1.20 │ grade-2-zinc        │ zinc-plate-2 1.20      │
│ acetylene-canister│   0.007 │ fill-acetylene-can. │ iron-stick (as fuel)   │
│ empty-fuel-canister│  0.007 │ AM2 burnt_result    │ fill-acetylene-canister│
└───────────────────┴─────────┴─────────────────────┴────────────────────────┘
```

The canister loop closes net-zero on the empties.

## Utilisation

| | placed | fractional | load |
|---|--:|--:|--:|
| **grade-1-zinc** | 5 | 4.80 | **96 %** |
| grade-2-zinc | 2 | 1.20 | 60 % |
| zinc-plate-2 | 1 | 0.60 | 60 % |
| iron-stick | 1 | 0.45 | 45 % |
| fill-acetylene-canister | 1 | 0.003 | <1 % |

The ball-mill bank at 96 % is what binds — a seventh drill needs a sixth mill.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| zinc-plate | 1.80 | the product | — | — |
| **soil** | 0.84 | **export** — `Moss-2`, `ralesia-1`, `soil-separation-2` all consume it | 0 | `soil-extractor-mk01`, which is what it replaces |
| stone | 0.60 | **export** — offsets stone mining | 0 | mining it |
| sand | 0.30 | **export** — feeds the sand/concrete line | 0 | `gravel-to-sand` |

All three byproducts are wanted. The soil is the best of them: designs 15, 17 and 18 all run soil
extractors, and 0.84/s is a meaningful offset.

## Aromatics — the binding constraint

```
ore-zinc  required_fluid = aromatics,  fluid_amount 40 ÷ 10  =  4 aromatics per ore  →  24.00 /s
```

**Zinc is the only outpost whose mining fluid competes with plastic and rubber.** Against one design
13 stamp at `r=0`:

```
plastic  0.525 bar/s × 50         26.25
rubber   0.250 /s × 100           25.00
zinc     6× mk02                  24.00
                                  ─────
                                  75.25   against 56.89 /s available
```

**Over by 18.4/s.** Note also that the *current* zinc outpost already draws 12.0/s, which earlier
aromatics budgets in this repo did not count — at 3 drills the base is already at 63.25 and over.

Per plate the upgrade is still a 3× improvement: **40.0 → 13.3 aromatics per plate.** It is the
absolute rate that does not fit.

**This design requires design 13 copy 2.** The 3-drill variant does not: 10 buildings — one *fewer*
than the current 11 — at 3.00 ore/s, **0.90 zinc-plate/s (3× today)**, aromatics unchanged at
12.0/s, iron-plate 0.90/s. Same trick as lead and tin, and it fits the existing budget exactly.

## Against what it replaces

| | 6× mk01 + `zinc-plate-1` | this design |
|---|--:|--:|
| buildings | 11 | 16 |
| ore-zinc | 3.00 /s | 6.00 /s |
| **zinc-plate** | **0.30 /s** | **1.80 /s** — 6× |
| **aromatics** | **12.0 /s** | **24.0 /s** |
| acetylene | — | 3.67 /s |
| iron-plate | — | 1.80 /s |
| electric | 2.40 MW | 10.80 MW |
| coal in · ash out | 0.23 · 0.23 /s | — |
| soil · stone · sand out | — | 0.84 · 0.60 · 0.30 /s |
| **aromatics per plate** | **40.0** | **13.3** |

The old route needs no iron-stick at all — the grading chain introduces it. That is the trade the
canister loop exists to make payable.

## Four outposts combined

| | mining fluid | /s | acetylene /s |
|---|---|--:|--:|
| 19 titanium | acetylene | 14.16 | (in column) |
| 20 lead | acetylene | 77.91 | (in column) |
| 21 tin | steam 60 | — | 15.1–22.3 |
| **22 zinc** | **aromatics 24.0** | — | 3.67 |
| | | | **111–118 /s acetylene** |

Lead dominates acetylene; zinc is the only aromatics draw. The two scarce fluids are consumed by
different outposts, so they can be scaled independently — zinc against design 13's aromatics,
lead against its acetylene.

## Build gotchas

- **The solver imports `iron-stick` rather than making it** — imports are free in its objective and
  `--max-import` is post-processing only in input mode. The `assembling-machine-2` row is computed
  by hand: 3.60 stick/s ÷ 2 per craft = 1.80 crafts/s × 0.5 s ÷ speed 2 = **0.45 buildings**.
- **The solver's MW figure counts `steel-furnace` as electric.** It reports 9.00 MW; 3.60 of that is
  the furnace's acetylene. Real process electric is 5.40 MW, 10.80 with drills.
- `ore-zinc` has `fluid_amount 40` → **4 aromatics per ore** after the 10× prototype correction.
- `empty-fuel-canister` has **no production recipe** in the export. It is recovered as
  `burnt_result`, so you need an initial stock from somewhere — check before committing the design.
- `zinc-plate-3` (casting, 50 per craft) and `zinc-plate-4` (powdered-zinc) are locked and would
  beat this again. `grade-3-zinc`/`grade-4-zinc` are locked too.
- **`fluid-drill-mk02` consumes `fluid-drill-mk01 ×1`** each — designs 19–22 together need 24 mk01
  drills, six per outpost, which is exactly what each outpost already has.

## Solver command

Input mode, supply-driven off a fixed drill count. Drills, the iron-stick assembler and the
canister loop are computed manually — the solver models neither mining nor fluid-burner fuel, and
it import-substitutes the sticks.

```bash
npx tsx src/cli.ts solve \
  --recipes "grade-1-zinc,grade-2-zinc,zinc-plate-2,iron-stick" \
  --input "ore-zinc:6.0" --time 1 \
  --factory "grade-1-zinc:ball-mill-mk01" \
  --factory "grade-2-zinc:impact-crusher-mk01" \
  --factory "zinc-plate-2:steel-furnace" \
  --factory "iron-stick:assembling-machine-2" \
  --solver simplex \
  --unlocked
```

The 3-drill variant is the same command with `--input "ore-zinc:3.0"`.

## Build materials

Distinct construction materials across this block's 6 building types, separate from flow imports:

`aluminium-plate` · `assembling-machine-1` · `copper-plate` · `duralumin` · `electric-mining-drill` ·
`electronic-circuit` · `engine-unit` · `fluid-drill-mk01` · `intermetallics` · `iron-plate` · `pipe` ·
`py-local-radar` · `refined-concrete` · `small-parts-01` · `steam-engine` · `steel-plate` ·
`tinned-cable`

The two not shared with designs 19–21 are **`py-local-radar`** and **`tinned-cable`**, both from
`impact-crusher-mk01`. Inferred from the recipe graph, not from save state.
