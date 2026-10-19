# 21 — Tin mining + grading — 3.00 tin-plate/s, 44 buildings

Third of four mining upgrades (19 titanium, 20 lead, 22 zinc). Same pattern: mk02 drills, the
grading chain, gas smelters. Ore-to-plate goes **10.0 → 6.0**.

```
tin-plate-1        [U] [smelting, 60 s]  ore-tin 40      →  tin-plate 4      10.0 ore/plate
grade-1-tin        [U] [screener,  3 s]  ore-tin 5       →  grade-1-tin 1 + grade-2-tin 0.5
grade-2-crush-tin  [U] [crusher,   4 s]  grade-2-tin 1   →  grade-1-tin 0.5 + stone 1
tin-plate-2        [U] [smelting, 50 s]  grade-1-tin 15  →  tin-plate 10      6.0 ore/plate
```

The grade-2 recycle returns 20 % of the grade-1 supply, same shape as titanium. The deeper tiers
(`grade-3-tin`, `tin-ore-rejects`, `wash-grade-3-tin`, `ball-grade-4-tin`) are locked — together
they would take the ratio to **3.50 ore/plate**, halving this outpost.

**Sized at 18 drills, not 6.** Tin is the binding plate for electronic circuits — `solder-0` alone
eats 0.80 tin-plate/s at 1.0 e-circuit/s — so this outpost is scaled to clear design 14 with room
rather than to a round drill count. See § Why 18.

**Tin is the one outpost whose mining fluid is steam, not acetylene.** Under the island pattern that
is a cost, not a saving: the steam is boiled on site from imported acetylene so the outpost still
takes exactly one fluid. See § Steam.

## Block boundary

| class | items |
|---|---|
| **import** | acetylene (boiler fuel + steel-furnace fuel), water, electricity |
| **mined in-block** | ore-tin — `fluid-drill-mk02` on the patch |
| **must-consume-internally** | steam, grade-1-tin, grade-2-tin |
| **byproduct-exclude** | none |

## Recipe table

```
┌───────────────────┬─────────────────────────┬───────┬──────┬─────────┐
│ Recipe            │ Factory                 │ Count │ Size │ MW each │
├───────────────────┼─────────────────────────┼───────┼──────┼─────────┤
│ (mining)          │ fluid-drill-mk02        │    18 │ 5x5  │    0.90 │
│ grade-1-tin       │ automated-screener-mk01 │    11 │ 7x7  │    0.30 │
│ grade-2-crush-tin │ jaw-crusher             │     8 │ 7x7  │    1.00 │
│ tin-plate-2       │ steel-furnace           │     4 │ 2x2  │  (gas)  │
│ (steam)           │ oil-boiler-mk01         │     3 │ 5x5  │  (gas)  │
└───────────────────┴─────────────────────────┴───────┴──────┴─────────┘
```

**44 buildings · 26.64 MW electric** — 16.20 drills + 10.44 process. ~1,480 tiles of building.

**Inputs** (/s): **acetylene 66.92** — 44.42 boilers + 22.50 steel-furnaces · water 180.00

One fluid in. Steam is produced in-block and never crosses the boundary.

**Exports** (/s): **tin-plate 3.00** · stone 1.80

## Intermediate flows

```
┌─────────────┬─────────┬──────────────────────────────────────────┬──────────────────────────┐
│ Item        │ Rate /s │ Producer                                 │ Consumer                 │
├─────────────┼─────────┼──────────────────────────────────────────┼──────────────────────────┤
│ ore-tin     │   18.00 │ 18x fluid-drill-mk02                     │ grade-1-tin 18.00        │
│ steam       │  180.00 │ 3x oil-boiler-mk01                       │ mining 180.00            │
│ grade-1-tin │    4.50 │ grade-1-tin 3.60 + grade-2-crush-tin 0.90│ tin-plate-2 4.50         │
│ grade-2-tin │    1.80 │ grade-1-tin 1.80                         │ grade-2-crush-tin 1.80   │
└─────────────┴─────────┴──────────────────────────────────────────┴──────────────────────────┘
```

## Why 18

Tin is the plate that binds circuits. Design 14 at 1.0 e-circuit/s wants **1.87 tin-plate/s**:

```
capacitor1  0.67 /s  +  resistor1  0.40  +  solder-0  0.80   =  1.87 tin-plate/s
```

At 6.0 ore/plate that is 11.2 ore/s — twelve drills just to meet it, with no margin and no slack for
anything else. Eighteen gives **3.00 plate/s**, 1.6× design 14's draw, and leaves grade-1-tin
headroom for the second consumer:

```
grade-1-tin produced               4.500 /s
tin-plate-2 at 1.87 plate/s        2.805 /s
                                   ─────
spare                              1.695 /s   →  16.95 phytoplankton/s   (~27 fish-farms)
```

`phytoplankton` [U] [plankton, 15 s] is `grade-1-tin 1 + water 500 → 10`. There is also
`jerky-to-phytoplankton` [U] (`dried-meat 3 + water 500 → 10`, 10 s) which is tin-free and 1.5×
faster per building — design 17's organ surplus covers about 0.75 phytoplankton/s off waste. The
jerky route is the free one; the tin route is the one that scales.

## Steam — boiled on site

```
ore-tin   required_fluid = steam,  fluid_amount 100 ÷ 10  =  10 steam per ore   →  180 /s
oil-boiler-mk01   effectivity 2    60 steam/s on 14.805 MW of fuel              →  3 boilers
```

`required_fluid` carries no temperature so any steam would qualify, and cheaper surplus steam exists
elsewhere in the base — but importing it would mean a second caravan route *and* would couple this
outpost's uptime to whatever produces it. The outpost pattern is one fluid in, solids out; the
boilers buy that for 44.42 acetylene/s.

The feedwater lever applies if warm return water is ever available locally: fed 100 °C water rather
than 15 °C each boiler makes **94 steam/s instead of 60**, so two would cover 18 drills instead of
three. That is an in-block optimisation and does not break the island.

## Utilisation

| | placed | fractional | load |
|---|--:|--:|--:|
| **oil-boiler-mk01** | 3 | 3.00 | **100 %** |
| grade-1-tin | 11 | 10.80 | 98 % |
| tin-plate-2 | 4 | 3.75 | 94 % |
| grade-2-crush-tin | 8 | 7.20 | 90 % |

Everything is tight — this outpost is sized to its drills, not oversized. A nineteenth drill needs
another of almost everything.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| tin-plate | 3.00 | the product | — | — |
| stone | 1.80 | **export** — offsets stone mining | 0 | mining it |

## Against what it replaces

| | 6× mk01 + `tin-plate-1` | this design |
|---|--:|--:|
| buildings | 12 | 44 |
| ore-tin | 3.00 /s | 18.00 /s |
| **tin-plate** | **0.30 /s** | **3.00 /s** — 10× |
| steam (made in-block) | 30 /s | 180 /s |
| electric | 2.40 MW | 26.64 MW |
| acetylene | ~7.4 /s | **66.9 /s** |
| coal in · ash out | 0.23 · 0.23 /s | — |
| stone out | — | 1.80 /s |
| **acetylene per plate** | 24.7 | **22.3** |

**This is the weakest of the four upgrades on acetylene efficiency** — 24.7 → 22.3 per plate, where
titanium went 40.0 → 24.6 and lead 60.0 → 26.0. Tin's old route spent no acetylene on smelting at
all (stone furnaces burned coal), so the gas smelter is a new cost rather than a saving, and the
boilers are a new cost on top. The per-plate figure is flat at any drill count.

Smaller stopping points, all from the same command at lower `--input`:

| drills | buildings | tin-plate /s | acetylene /s |
|--:|--:|--:|--:|
| 3 | 9 | 0.50 | 11.2 |
| 6 | 16 | 1.00 | 22.3 |
| 12 | 30 | 2.00 | 44.6 |
| **18** | **44** | **3.00** | **66.9** |

## Acetylene across the four mining outposts

```
design 19  titanium   14.16 /s
design 20  lead       77.91 /s
design 21  tin        66.92 /s
design 22  zinc        3.67 /s
                      ────────
                      162.66 /s   ≈ 42 % of design 13's 391.5/s at r=0
```

Tin at 18 drills makes it the second-largest acetylene consumer after lead. A design-13 copy sized
to supply all four needs **`r ≈ 0.70`**, which still leaves it ~81.7 aromatics/s — enough for zinc's
24.0 plus plastic and rubber's 51.25, with copy 1's 56.89/s on top. Derived from the recursion, not
re-solved.

## Build gotchas

- **The solver's MW figure counts `steel-furnace` as electric.** It reports 32.94 MW; 22.50 of that
  is the furnaces' acetylene. Real process electric is 10.44 MW, 26.64 with drills.
- `ore-tin` has `fluid_amount 100` → **10 steam per ore** after the 10× prototype correction.
- Drill rate is `mining_speed ÷ mining_time`: mk02 on tin is `1 ÷ 1` = **1.00 ore/s**, same as lead,
  double what it does on titanium.
- **`fluid-drill-mk02` consumes `fluid-drill-mk01 ×1`** each, so 18 drills needs **18 mk01** — you
  have six at this outpost, so **twelve more to build**. This is the only one of the four upgrades
  that cannot be done purely in place.
- Verify the patch sustains 18.0 ore/s before committing — `resource_drain_rate_percent` is 100 on
  `fluid-drill-mk02`.
- `tin-plate-3` (casting, 50 plate per craft) and `tin-plate-4` (grade-4-tin) are both locked and
  would beat this again.

## Solver command

Input mode, supply-driven off a fixed drill count. The drills, boilers and acetylene are computed
manually — the solver models neither mining nor fluid-burner fuel.

```bash
npx tsx src/cli.ts solve \
  --recipes "grade-1-tin,grade-2-crush-tin,tin-plate-2" \
  --input "ore-tin:18.0" --time 1 \
  --factory "grade-1-tin:automated-screener-mk01" \
  --factory "grade-2-crush-tin:jaw-crusher" \
  --factory "tin-plate-2:steel-furnace" \
  --solver simplex \
  --unlocked
```

Smaller variants are the same command with `--input "ore-tin:3.0"`, `6.0` or `12.0`.

## Build materials

Distinct construction materials across this block's 5 building types, separate from flow imports:

`aluminium-plate` · `electric-mining-drill` · `electronic-circuit` · `engine-unit` ·
`fluid-drill-mk01` · `gasifier` · `intermetallics` · `iron-plate` · `lab` · `refined-concrete` ·
`small-parts-01` · `steam-engine` · `steel-plate`

Superset of designs 19 and 20 — the extras are `gasifier`, `intermetallics` and `lab`, all from
`oil-boiler-mk01`, the one building type the other outposts don't need. The binding item is
**`fluid-drill-mk01` ×18**. Inferred from the recipe graph, not from save state.
