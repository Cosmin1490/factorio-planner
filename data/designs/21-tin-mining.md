# 21 — Tin mining + grading — 1.00 tin-plate/s, 16 buildings

Third of four mining upgrades (19 titanium, 20 lead, 22 zinc). Same pattern: mk02 drills, the
grading chain, gas smelters. Ore-to-plate goes **10.0 → 6.0**.

```
tin-plate-1        [U] [smelting, 60 s]  ore-tin 40      →  tin-plate 4      10.0 ore/plate
grade-1-tin        [U] [screener,  3 s]  ore-tin 5       →  grade-1-tin 1 + grade-2-tin 0.5
grade-2-crush-tin  [U] [crusher,   4 s]  grade-2-tin 1   →  grade-1-tin 0.5 + stone 1
tin-plate-2        [U] [smelting, 50 s]  grade-1-tin 15  →  tin-plate 10      6.0 ore/plate
```

The grade-2 recycle returns 20 % of the grade-1 supply, same shape as titanium. The deeper tiers
(`grade-3-tin`, `tin-ore-rejects`, `wash-grade-3-tin`, `ball-grade-4-tin`) are locked — with them
this would improve again, as titanium's reject recycle does.

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
│ (mining)          │ fluid-drill-mk02        │     6 │ 5x5  │    0.90 │
│ grade-1-tin       │ automated-screener-mk01 │     4 │ 7x7  │    0.30 │
│ grade-2-crush-tin │ jaw-crusher             │     3 │ 7x7  │    1.00 │
│ tin-plate-2       │ steel-furnace           │     2 │ 2x2  │  (gas)  │
│ (steam)           │ oil-boiler-mk01         │     1 │ 5x5  │  (gas)  │
└───────────────────┴─────────────────────────┴───────┴──────┴─────────┘
```

**16 buildings · 8.88 MW electric** — 5.40 drills + 3.48 process. ~440 tiles of building.

**Inputs** (/s): **acetylene 22.30** — 14.8 boiler + 7.5 steel-furnaces · water 60.00 (to the boiler)

One fluid in. Steam is produced in-block and never crosses the boundary.

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

## Steam — boiled on site

```
ore-tin   required_fluid = steam,  fluid_amount 100 ÷ 10  =  10 steam per ore   →  60 /s
oil-boiler-mk01   effectivity 2    60 steam/s on 14.805 MW of fuel              →  1 boiler
```

**The steam is made on site, not imported.** `required_fluid` carries no temperature so any steam
would qualify, and cheaper surplus steam exists elsewhere in the base — but importing it would mean
a second caravan route *and* would couple this outpost's uptime to whatever produces it. The outpost
pattern is one fluid in, solids out; the boiler buys that for 14.8 acetylene/s.

```
boiler fuel   14.8 /s        furnace fuel   7.5 /s        total acetylene  22.3 /s
```

The feedwater lever applies if warm return water is ever available locally: fed 100 °C water rather
than 15 °C the same boiler makes **94 steam/s instead of 60**, enough for nine drills on the same
fuel. That is an in-block optimisation and does not break the island.

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
| steam (made in-block) | 30 /s | 60 /s |
| electric | 2.40 MW | 8.88 MW |
| acetylene | ~7.4 /s | **22.3 /s** |
| coal in · ash out | 0.23 · 0.23 /s | — |
| stone out | — | 0.60 /s |
| **acetylene per plate** | 24.7 | **22.3** |

**This is the weakest of the four upgrades on acetylene efficiency** — 24.7 → 22.3 per plate, where
titanium went 40.0 → 24.6 and lead 60.0 → 26.0. The reason is that tin's old route spent no
acetylene on smelting at all (stone furnaces burned coal), so the gas smelter is a new cost rather
than a saving, and the boiler is a new cost on top.

It is still 3.3× the plate for four more buildings, and the stone is free.

## Acetylene across the four mining outposts

```
design 19  titanium   14.16 /s
design 20  lead       77.91 /s
design 21  tin        22.30 /s
design 22  zinc        3.67 /s
                      ────────
                      118.04 /s   ≈ 30 % of design 13's 391.5/s at r=0
```

Lead is two-thirds of it. A design-13 copy sized to supply all four needs **`r ≈ 0.79`**, which
still leaves it 86.5 aromatics/s — enough for zinc's 24.0 plus plastic and rubber. Derived from the
recursion, not re-solved. Running lead at 3 drills instead of 6 brings the total to ~79/s.

## Build gotchas

- **The solver's MW figure counts `steel-furnace` as electric.** It reports 10.98 MW; 7.50 of that
  is the furnaces' acetylene. Real process electric is 3.48 MW, 8.88 with drills.
- `ore-tin` has `fluid_amount 100` → **10 steam per ore** after the 10× prototype correction.
- Drill rate is `mining_speed ÷ mining_time`: mk02 on tin is `1 ÷ 1` = **1.00 ore/s**, same as lead,
  double what it does on titanium.
- **`fluid-drill-mk02` consumes `fluid-drill-mk01 ×1`** each. Designs 19–22 together need **24 mk01
  drills** as feedstock — six per outpost, which is exactly what each outpost already has, so every
  upgrade is done in place.
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
