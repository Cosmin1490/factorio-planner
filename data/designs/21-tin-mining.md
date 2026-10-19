# 21 — Tin mining + grading — 1.00 tin-plate/s, 16 buildings

Third of the mining upgrades (designs 19 titanium, 20 lead). Same pattern: mk02 drills, the grading
chain, gas smelters. Ore-to-plate goes **10.0 → 6.0**.

```
tin-plate-1        [U] [smelting, 60 s]  ore-tin 40      →  tin-plate 4      10.0 ore/plate
grade-1-tin        [U] [screener,  3 s]  ore-tin 5       →  grade-1-tin 1 + grade-2-tin 0.5
grade-2-crush-tin  [U] [crusher,   4 s]  grade-2-tin 1   →  grade-1-tin 0.5 + stone 1
tin-plate-2        [U] [smelting, 50 s]  grade-1-tin 15  →  tin-plate 10      6.0 ore/plate
```

The grade-2 recycle returns 20 % of the grade-1 supply, same shape as titanium. The deeper tiers
(`grade-3-tin`, `tin-ore-rejects`, `wash-grade-3-tin`, `ball-grade-4-tin`) are locked — with them
this would improve again, as titanium's reject recycle does.

**Tin is the one outpost whose mining fluid is steam, not acetylene.** That turns out to be an
advantage, not a complication — see § Steam.

## Block boundary

| class | items |
|---|---|
| **import** | steam (any temperature), acetylene (steel-furnace fuel + boiler fuel), water, electricity |
| **mined in-block** | ore-tin — `fluid-drill-mk02` on the patch |
| **must-consume-internally** | grade-1-tin, grade-2-tin |
| **byproduct-exclude** | none |

## Recipe table

```
┌───────────────────┬─────────────────────────┬───────┬──────┬─────────┐
│ Recipe            │ Factory                 │ Count │ Size │ MW each │
├───────────────────┼─────────────────────────┼───────┼──────┼─────────┤
│ (mining)          │ fluid-drill-mk02        │     6 │ 5x5  │    0.90 │
│ grade-1-tin       │ automated-screener-mk01 │     4 │ 7x7  │    0.30 │
│ grade-2-crush-tin │ jaw-crusher             │     3 │ 7x7  │    1.00 │
│ tin-plate-2       │ steel-furnace           │     2 │ 2x2  │  (gas)  │
│ (steam)           │ oil-boiler-mk01         │     1 │ 5x5  │  (gas)  │
└───────────────────┴─────────────────────────┴───────┴──────┴─────────┘
```

**16 buildings · 8.88 MW electric** — 5.40 drills + 3.48 process. ~440 tiles of building.

**Inputs** (/s): **steam 60.00** · **acetylene 15.1–22.3** (see below) · water 60.00 (to the boiler)

**Exports** (/s): **tin-plate 1.00** · stone 0.60

## Intermediate flows

```
┌─────────────┬─────────┬──────────────────────────────────────────┬──────────────────────────┐
│ Item        │ Rate /s │ Producer                                 │ Consumer                 │
├─────────────┼─────────┼──────────────────────────────────────────┼──────────────────────────┤
│ ore-tin     │    6.00 │ 6x fluid-drill-mk02                      │ grade-1-tin 6.00         │
│ grade-1-tin │    1.50 │ grade-1-tin 1.20 + grade-2-crush-tin 0.30│ tin-plate-2 1.50         │
│ grade-2-tin │    0.60 │ grade-1-tin 0.60                         │ grade-2-crush-tin 0.60   │
└─────────────┴─────────┴──────────────────────────────────────────┴──────────────────────────┘
```

## Steam — the cheapest part of this design

```
ore-tin   required_fluid = steam,  fluid_amount 100 ÷ 10  =  10 steam per ore   →  60 /s
oil-boiler-mk01   effectivity 2    60 steam/s on 14.805 MW of fuel              →  1 boiler
```

**`required_fluid` carries no temperature**, so any steam qualifies — which makes design 17's
150 °C polybutadiene surplus a direct feed. It exports 57.50/s, design 18 claims 28.13, leaving
**29.37/s** for tin:

| steam source | boiler fuel | furnace fuel | **total acetylene** |
|---|--:|--:|--:|
| boiler alone | 14.8 | 7.5 | **22.3 /s** |
| **design 17 leftover + top-up boiler** | 7.6 | 7.5 | **15.1 /s** |

The feedwater lever applies on top: fed 100 °C water rather than 15 °C, the same boiler makes
**94 steam/s instead of 60** — enough for nine drills on the same fuel. Worth wiring if any warm
return water is nearby.

## Utilisation

| | placed | fractional | load |
|---|--:|--:|--:|
| grade-1-tin | 4 | 3.60 | 90 % |
| grade-2-crush-tin | 3 | 2.40 | 80 % |
| tin-plate-2 | 2 | 1.25 | 63 % |
| oil-boiler-mk01 | 1 | 1.00 | 100 % |

The boiler is the only thing at 100 % — a seventh drill needs a second one (or warmer feedwater).

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| tin-plate | 1.00 | the product | — | — |
| stone | 0.60 | **export** — offsets stone mining | 0 | mining it |

## Against what it replaces

| | 6× mk01 + `tin-plate-1` | this design |
|---|--:|--:|
| buildings | 12 | 16 |
| ore-tin | 3.00 /s | 6.00 /s |
| **tin-plate** | **0.30 /s** | **1.00 /s** — 3.3× |
| steam | 30 /s | 60 /s |
| electric | 2.40 MW | 8.88 MW |
| acetylene | ~7.4 /s | 15.1–22.3 /s |
| coal in · ash out | 0.23 · 0.23 /s | — |
| stone out | — | 0.60 /s |
| **acetylene per plate** | 24.7 | **15.1** (d17 steam) / 22.3 (boiler) |

**This is the weakest of the three upgrades on acetylene efficiency.** Titanium went 40.0 → 24.6 and
lead 60.0 → 26.0; tin only reaches 15.1 *if* design 17's steam is available, and barely moves at
22.3 without it. The reason is that tin's old route spent no acetylene on smelting at all — stone
furnaces burned coal — so the gas smelter is a new cost rather than a saving.

It is still 3.3× the plate for four more buildings, and the stone is free.

## Acetylene across the three mining outposts

```
design 19  titanium  14.16 /s
design 20  lead      77.91 /s
design 21  tin       15.1–22.3 /s
                     ───────────
                     107–114 /s     ≈ 29 % of design 13's 391.5/s at r=0
```

Lead is two-thirds of the total. A design-13 copy sized to supply all three needs **`r ≈ 0.80`**,
costing roughly 12 % of its aromatics — derived from the recursion, not re-solved. Running lead at
3 drills instead of 6 brings the total to ~68/s and most of that back.

## Build gotchas

- **The solver's MW figure counts `steel-furnace` as electric.** It reports 10.98 MW; 7.50 of that
  is the furnaces' acetylene. Real process electric is 3.48 MW, 8.88 with drills.
- `ore-tin` has `fluid_amount 100` → **10 steam per ore** after the 10× prototype correction.
- Drill rate is `mining_speed ÷ mining_time`: mk02 on tin is `1 ÷ 1` = **1.00 ore/s**, same as lead,
  double what it does on titanium.
- **`fluid-drill-mk02` consumes `fluid-drill-mk01 ×1`** each. Designs 19, 20 and 21 together need
  **18 mk01 drills** as feedstock — you have 6 per outpost today, so all three upgrades can run in
  parallel only if each outpost's own drills are consumed in place.
- `tin-plate-3` (casting, 50 plate per craft) and `tin-plate-4` (grade-4-tin) are both locked and
  would beat this again.

## Solver command

Input mode, supply-driven off a fixed drill count. The six drills, the boiler and the acetylene are
computed manually — the solver models neither mining nor fluid-burner fuel.

```bash
npx tsx src/cli.ts solve \
  --recipes "grade-1-tin,grade-2-crush-tin,tin-plate-2" \
  --input "ore-tin:6.0" --time 1 \
  --factory "grade-1-tin:automated-screener-mk01" \
  --factory "grade-2-crush-tin:jaw-crusher" \
  --factory "tin-plate-2:steel-furnace" \
  --solver simplex \
  --unlocked
```

The 3-drill variant is the same command with `--input "ore-tin:3.0"`.

## Build materials

Distinct construction materials across this block's 5 building types, separate from flow imports:

`aluminium-plate` · `electric-mining-drill` · `electronic-circuit` · `engine-unit` ·
`fluid-drill-mk01` · `gasifier` · `intermetallics` · `iron-plate` · `lab` · `refined-concrete` ·
`small-parts-01` · `steam-engine` · `steel-plate`

Superset of designs 19 and 20 — the extras are `gasifier`, `intermetallics` and `lab`, all from
`oil-boiler-mk01`, which is the one building type the other two outposts don't need. Inferred from
the recipe graph, not from save state.
