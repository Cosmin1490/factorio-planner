# 26 — Electronic circuits — 1.0 e-circuit/s, 20 buildings

The electronics proper, with **formica from design 25** and **battery-mk01 from design 27**. No bio
buildings, no byproducts, no chemistry — everything that made design 14 complicated lives in the other
two blocks now.

```
electronic-circuit-2  [U] [chip, 4 s]  battery-mk01 1 + capacitor1 5 + inductor1 3 + resistor1 6
                                       + pcb1 1 + vacuum-tube 3 + solder 2        →  5
pcb1                  [U] [pcb,  5 s]  formica 2 + copper-plate 5 + vacuum 50     →  1
```

Scale anchor is **1 `pcb-factory-mk01`** — 0.2 pcb1/s at 1 pcb1 per 5 circuits is exactly
1.0 e-circuit/s, which also fixes the chipshooter. Ratios are integer only at C = 1, 2, 5 circuits/s.

## Block boundary

| class | items |
|---|---|
| **import — from design 25** | **formica** 0.40/s |
| **import — from design 27** | **battery-mk01** 0.20/s |
| **import — whitelisted** | coke, copper-plate, tin-plate, iron-plate, lead-plate, glass, water |
| **made in-block** | capacitor1, inductor1, resistor1, vacuum-tube, pcb1, solder, ceramic, clay, graphite, copper-cable, vacuum, steam |
| **byproduct-exclude** | none — the block has no byproducts |

## Recipe table

```
┌────────────────────────────────┬──────────────────────────┬───────┬───────┬────────┬────────┐
│ Recipe                         │ Factory                  │ Count │ Size  │ MW ea  │ load   │
├────────────────────────────────┼──────────────────────────┼───────┼───────┼────────┼────────┤
│ electronic-circuit-2           │ chipshooter-mk01         │     1 │ 5x5   │   0.15 │  80 %  │
│ capacitor1                     │ electronics-factory-mk01 │     2 │ 5x5   │   0.50 │  83 %  │
│ inductor1                      │ electronics-factory-mk01 │     1 │ 5x5   │   0.50 │  60 %  │
│ resistor1                      │ electronics-factory-mk01 │     2 │ 5x5   │   0.50 │ 100 %  │
│ vacuum-tube                    │ electronics-factory-mk01 │     3 │ 5x5   │   0.50 │  70 %  │
│ pcb1                           │ pcb-factory-mk01         │     1 │ 7x7   │   0.40 │ 100 %  │
│ solder-0                       │ automated-factory-mk01   │     3 │ 7x7   │   2.00 │  80 %  │
│ copper-cable                   │ automated-factory-mk01   │     1 │ 7x7   │   2.00 │  60 %  │
│ ceramic                        │ hpf                      │     1 │ 7x7   │   2.00 │  57 %  │
│ graphite                       │ hpf                      │     1 │ 7x7   │   2.00 │  90 %  │
│ clay                           │ clay-pit-mk01            │     2 │ 7x7   │   0.20 │  77 %  │
│ vacuum                         │ vacuum-pump-mk01         │     1 │ 3x3   │   1.00 │  13 %  │
│ electric-boiler-water-to-steam │ py-electric-boiler       │     1 │ 3x3   │  25.00 │  64 %  │
└────────────────────────────────┴──────────────────────────┴───────┴───────┴────────┴────────┘
```

**20 buildings · ~684 tiles · 29.13 MW electric**

**Inputs** (/s): water 38.22 · copper-plate 2.80 · coke 2.41 · tin-plate 1.87 · lead-plate 1.60 ·
iron-plate 1.50 · glass 1.00 · **formica 0.40** · **battery-mk01 0.20**

**Exports** (/s): **electronic-circuit 1.00**

Nine imports, one export, nothing else. This block fits inside a corner of a city block.

## Intermediate flows

```
┌──────────────┬──────────┬────────────────────────────────┬───────────────────────────────────────┐
│ Item         │ Rate /s  │ Producer                       │ Consumer                              │
├──────────────┼──────────┼────────────────────────────────┼───────────────────────────────────────┤
│ capacitor1   │    1.00  │ capacitor1                     │ electronic-circuit-2                  │
│ resistor1    │    1.20  │ resistor1                      │ electronic-circuit-2                  │
│ inductor1    │    0.60  │ inductor1                      │ electronic-circuit-2                  │
│ vacuum-tube  │    0.60  │ vacuum-tube                    │ electronic-circuit-2                  │
│ solder       │    0.40  │ solder-0                       │ electronic-circuit-2                  │
│ pcb1         │    0.20  │ pcb1                           │ electronic-circuit-2                  │
│ vacuum       │   25.00  │ vacuum                         │ pcb1 10.00, vacuum-tube 15.00         │
│ ceramic      │    0.57  │ ceramic                        │ capacitor1 0.33, inductor1 0.24       │
│ clay         │    1.15  │ clay                           │ ceramic 1.15                          │
│ steam        │   38.22  │ electric-boiler-water-to-steam │ clay 38.22                            │
│ copper-cable │    2.40  │ copper-cable                   │ inductor1 2.40                        │
│ graphite     │    0.60  │ graphite                       │ vacuum-tube 0.60                      │
└──────────────┴──────────┴────────────────────────────────┴───────────────────────────────────────┘
```

**The boiler makes process steam, not power.** `clay` [clay-pit-mk01, 4 s] takes `steam 100` per craft
as an *ingredient*; none of it reaches a generator and there are no steam engines here. One
`py-electric-boiler` at 64 % is **16.00 MW — 55 % of the block's draw** and by far its largest line
item. An `oil-boiler-mk01` on acetylene would be 0 MW for 9.43 acetylene/s if a fluid line is ever
acceptable.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| **electronic-circuit** | 1.00 | the product — Tier A, 219 consumers | — | — |

Nothing else leaves the block.

## Why the split lands here

`battery-mk01` is the seam because of **rule 17's cascade argument**: it takes `cyanic-acid 30` per
battery, and that 30:1 ratio is the amplifier that drags in the entire urea → manure → auog →
native-flora chain. Splitting here puts the amplifier and everything it amplifies in design 27, leaving
this block as pure electronics.

The alternative seam — cutting at cyanic-acid — is worse on every axis:

| | **at battery** | at cyanic-acid |
|---|---|---|
| streams crossing | **1** | **2–3** |
| form | solid, **stack 100** | two fluids (`melamine` needs ammonia 20 as well as cyanic-acid 20) |
| stations | 1 | 2 fluid |
| consumers of the boundary item | **21 (11 unlocked)** | 13 (2 unlocked) |

And it keeps the **6.00 ammonia/s surplus in the same block as its cause** — that surplus exists
*because* `battery-mk01` consumes cyanic-acid without matching ammonia, so putting the two on opposite
sides of a boundary would displace the symptom from the cause.

**Cost of the split: 2 buildings, 0 MW.** A second `graphite` hpf (0.60/s each side instead of 1.20
shared), a second `copper-cable` factory, and the boiler splits across both — against the combined
99-building block, 20 + 81 = 101.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **battery-mk01 0.20/s** from design 27 | design 27 carries the ammonia open item, so until that has a destination this import is `t = 0`. The inherited constraint |
| 2 | **formica 0.40/s** from design 25 | design 25's own cap is creosote at `t ≈ 0.85` |
| 3 | `resistor1` and `pcb1` at 100 % | no fault margin on either. A 3rd `electronics-factory` on resistors and a 2nd `pcb-factory` are 25 and 49 tiles for N+1 |
| 4 | coke 2.41/s | feeds `graphite` and `resistor1`; a shortfall hits two sub-parts |

`t = min(sink_i / rate_i)` has one terminal output and no byproducts, so nothing internal can throttle
this block — both caps are imported.

## Build notes

- **No bio buildings and no modules.** Everything here runs at base crafting speed, so the solver's
  counts are the real counts — unlike designs 25 and 27, which need the 3–17× module correction.
- `inductor1` over `inductor1-2` — half the copper (4 cable per inductor against 8) for one extra
  building at this scale.
- **The whole block is ~684 tiles.** It can sit in the corner of a city block with its 9 stations, or
  share one with design 27 if the ammonia ever gets a home nearby.
- 1 `pcb-factory-mk01` is the scale anchor; going to 2 circuits/s doubles everything cleanly, 5
  circuits/s likewise. Anything between leaves fractional sub-part banks.

## Solver command

Target mode on the end product. No constraints, no `--max-import`, no `--fuel` — a single output, no
byproducts, nothing for the LP to game.

```bash
npx tsx src/cli.ts solve \
  --recipes "electronic-circuit-2,capacitor1,inductor1,resistor1,pcb1,vacuum-tube,solder-0,copper-cable,ceramic,clay,graphite,vacuum,electric-boiler-water-to-steam" \
  --target "electronic-circuit:1" --time 1 \
  --factory "electronic-circuit-2:chipshooter-mk01" \
  --factory "capacitor1:electronics-factory-mk01" \
  --factory "inductor1:electronics-factory-mk01" \
  --factory "resistor1:electronics-factory-mk01" \
  --factory "vacuum-tube:electronics-factory-mk01" \
  --factory "pcb1:pcb-factory-mk01" \
  --factory "solder-0:automated-factory-mk01" \
  --factory "copper-cable:automated-factory-mk01" \
  --factory "ceramic:hpf" \
  --factory "graphite:hpf" \
  --factory "clay:clay-pit-mk01" \
  --factory "vacuum:vacuum-pump-mk01" \
  --factory "electric-boiler-water-to-steam:py-electric-boiler" \
  --solver simplex \
  --unlocked
```

No warnings — this block has no cycles.

## Build materials

Distinct construction materials across this block's 7 building types, separate from flow imports:

`boiler` · `copper-cable` · `copper-plate` · `electric-mining-drill` · `electronic-circuit` ·
`electronics-factory-mk01` · `gasifier` · `glass` · `inductor1` · `intermetallics` · `iron-plate` ·
`lab` · `pcb1` · `pipe` · `small-parts-01` · `steam-engine` · `steel-plate` · `stone-brick` ·
`stone-furnace` · `wood`

`py-electric-boiler` costs `electric-mining-drill 3 + lab 1 + gasifier 1 + small-parts-01 20 +
iron-plate 100`. Everything else is already in the catalogue. Inferred from the recipe graph, not from
save state.
