# 43 — Rail — 0.60/s (36/min), 12 buildings

Sized against **4 lead-plate/s**, which is what rail actually costs: `solder` is 5 per 3 rails and
solder is 4 lead + 2 tin, so **a rail is 6.67 lead-plate and 0.33 steel — lead outweighs steel 20:1.**
Everything else follows from the lead lane.

Steel and limestone are made on site; `treated-wood` and `solder`'s plates are bought.

```
rail                  [U] [crafting,        0.5 s]  stone 1 + treated-wood 2 + bolts 4
                                                    + steel-plate 1 + solder 5          →  3
solder-0              [U] [crafting,          6 s]  lead-plate 4 + tin-plate 2          →  1
steel-plate           [U] [advanced-foundry, 15 s]  coke 5 + limestone 5 + iron-ore 20  →  1
extract-limestone-01  [U] [soil-extraction,  20 s]  water 400                           →  8
bolts                 [U] [crafting,        0.2 s]  iron-stick 2                        →  2
iron-stick            [U] [crafting,        0.5 s]  iron-plate 1                        →  2
```

`rail-support` and `rail-ramp` are **locked behind `elevated-rail`** and not in this block.

## Recipe table

```
┌──────────────────────┬───────────────────────┬────────┬───────┬────────┬───────┬─────────┐
│ Recipe               │ Factory               │  frac  │ Count │  Util  │ Size  │ MW load │
├──────────────────────┼───────────────────────┼────────┼───────┼────────┼───────┼─────────┤
│ solder-0             │ assembling-machine-2  │  3.000 │   3   │ 100.0% │ 3x3   │  (jerry)│
│ steel-plate          │ advanced-foundry-mk01 │  3.000 │   3   │ 100.0% │ 6x6   │   3.600 │
│ extract-limestone-01 │ soil-extractor-mk01   │  2.500 │   3   │  83.3% │ 7x7   │   1.000 │
│ iron-stick           │ assembling-machine-2  │  0.101 │   1   │  10.1% │ 3x3   │  (jerry)│
│ rail                 │ assembling-machine-2  │  0.051 │   1   │   5.1% │ 3x3   │  (jerry)│
│ bolts                │ assembling-machine-2  │  0.041 │   1   │   4.1% │ 3x3   │  (jerry)│
└──────────────────────┴───────────────────────┴────────┴───────┴────────┴───────┴─────────┘
```

**12 buildings · 309 tiles · 4.58 MW electric** *(plus ~0.5 MW of jerry across the six assemblers)*

## Imports — 9

| | /s | note |
|---|--:|---|
| **water** | **49.70** | → limestone |
| **lead-plate** | **4.00** | → solder. **the sizing input** |
| **iron-ore** | **3.98** | → steel, 20 per plate |
| tin-plate | 2.00 | → solder |
| coke | 0.99 | → steel |
| iron-plate | 0.40 | → iron-stick → bolts |
| treated-wood | 0.40 | 1 wood + 100 creosote → 2, bought |
| stone | 0.20 | |
| acetylene-canister | 0.05 | **net zero** — empties return |

**Exports** (/s): **rail 0.60** · empty-fuel-canister 0.05

### How long a chest lasts

An iron chest is 32 slots. At 0.60 rail/s:

| item | stack | full box | /s | lasts |
|---|--:|--:|--:|--:|
| **iron-ore** | 50 | 1,600 | 3.98 | **6.7 min** |
| lead-plate | 100 | 3,200 | 4.00 | 13.3 min |
| tin-plate | 100 | 3,200 | 2.00 | 26.7 min |
| coke | 100 | 3,200 | 0.99 | 53.9 min |
| iron-plate · treated-wood | 100 | 3,200 | 0.40 | 2 h 13 m |
| stone | 50 | 1,600 | 0.20 | 2 h 13 m |

**`iron-ore` empties in under seven minutes** — a 50 stack and the highest rate in the block, both
because steel is 20 ore per plate. That single row makes this un-hand-feedable. Importing steel
removes iron-ore and coke together and the shortest chest becomes **lead-plate at 13 minutes**,
with everything else over two hours.

## The rail assembler is 5 % of the block

Two rows at 100 % carry it, and neither is rail:

| | buildings | what it is |
|---|--:|---|
| `solder-0` | 3 | turning 4 lead + 2 tin into 1 solder/s |
| `steel-plate` | 3 | turning 20 iron-ore into 1 plate |
| `extract-limestone-01` | 3 | 400 water into 8 limestone |
| **the rest** | **3** | rail, bolts, iron-stick — all under 11 % |

**Nine of twelve buildings exist to make two ingredients.** That is the shape to know before siting
it, because every one of them is optional.

## Fallbacks — all three solver-verified

| config | buildings | MW | imports |
|---|--:|--:|---|
| **as built** | **12** | **4.58** | water 49.7, lead 4.00, iron-ore 3.98, tin 2.00, coke 0.99, iron 0.40, t-wood 0.40, stone 0.20 |
| import limestone | 9 | 3.60 | drops water 49.7, adds limestone 1.00 |
| import steel too | 6 | **0** | drops iron-ore 3.98 + coke 0.99, adds steel-plate 0.20 |
| import solder too | **3** | **0** | drops lead 4.00 + tin 2.00, adds solder 1.00 |

**Importing steel is the big one.** `steel-plate` is 20 iron-ore per plate, so 0.20 steel/s costs
**3.98 iron-ore/s — twenty times the tonnage for the same plate** — plus 0.99 coke, three
advanced-foundries and the block's entire 3.60 MW. Worth it only with ore at the site and no steel
lane.

**Importing solder takes the block to three buildings** and removes the only other pinned row.
Per design-guide rule, `solder` is one of the three mall intermediates worth a dedicated block
rather than making on site — it is 6 machine-seconds per item, the most expensive row anywhere it
appears.

## Creosote — the sink that was given up

`treated-wood` is `1 wood + 100 creosote → 2`, so making it here would want **20.00 creosote/s** at
this rate. Design 13 produces **31.8–55.7 creosote/s** and disposes of it externally, its own notes
listing three on-site sinks rejected as too expensive.

So an inlined-`treated-wood` variant would absorb **36–63 % of design 13's creosote problem** for
one extra `tar-processing-unit` (13×13, frac 0.401). It costs three import lanes — creosote 20.00,
wood 0.20 — against treated-wood 0.40, so it is only worth it **sited next to design 13**, where the
creosote is already there and otherwise thrown away.

## Solver command

`--max-import "water:100000"` is a plain allowance — without a positive cap the limestone extractor
has no import variable. `--fuel ...:acetylene-canister` on all four `assembling-machine-2` rows
avoids the coal default and its phantom ash.

```bash
npx tsx src/cli.ts solve \
  --recipes "rail,bolts,iron-stick,solder-0,steel-plate,extract-limestone-01" \
  --target "rail:0.6" --time 1 \
  --max-import "bolts:0.001" --max-import "iron-stick:0.001" \
  --max-import "solder:0.001" --max-import "steel-plate:0.001" --max-import "limestone:0.001" \
  --max-import "water:100000" \
  --factory "rail:assembling-machine-2" --factory "bolts:assembling-machine-2" \
  --factory "iron-stick:assembling-machine-2" --factory "solder-0:assembling-machine-2" \
  --factory "steel-plate:advanced-foundry-mk01" \
  --factory "extract-limestone-01:soil-extractor-mk01" \
  --fuel "rail:acetylene-canister" --fuel "bolts:acetylene-canister" \
  --fuel "iron-stick:acetylene-canister" --fuel "solder-0:acetylene-canister" \
  --solver simplex --unlocked
```

Run at `--target "rail:600"` and divide counts by 1000 for fracs — the direct solve reports `solder-0`
correctly at 3 here, but its frac reads 3.001 under the ×1000 probe, so check against MW
(3.000 foundries × 1.20 + 2.500 extractors × 0.40 = 4.60) rather than trusting a count on a rescale.

## Intermediates

```
┌─────────────┬──────────┬──────────────────────┬─────────────────────┐
│ Item        │ Rate     │ Producer             │ Consumer            │
├─────────────┼──────────┼──────────────────────┼─────────────────────┤
│ solder      │ 1.00/s   │ solder-0             │ rail 1.00           │
│ limestone   │ 0.99/s   │ extract-limestone-01 │ steel-plate 0.99    │
│ bolts       │ 0.80/s   │ bolts                │ rail 0.80           │
│ iron-stick  │ 0.80/s   │ iron-stick           │ bolts 0.80          │
│ steel-plate │ 0.20/s   │ steel-plate          │ rail 0.20           │
└─────────────┴──────────┴──────────────────────┴─────────────────────┘
```

## Risks

1. **Two rows at 100 %** — `solder-0` and `steel-plate`. No pad on either, and together they are half
   the block. A fourth of each is cheap insurance at 3×3 and 6×6.
2. **Lead is the sizing input and has no substitute.** `solder-0` is the only unlocked solder recipe
   until `solder-mk02` (495 u across `tin-mk02` + `lead-mk02` + `solder-mk02`, all at the
   automation + py-1 + logistic tier). That tech would take solder from 10/min per machine to
   75–105/min on a `casting-unit-mk01` and delete two of the three assemblers here.
3. **`extract-limestone-01` is 49.70 water/s** for 0.99 limestone — by volume the largest flow in the
   block by 12×.
4. **Rate is a placeholder.** 0.60/s was chosen because 4 lead/s was the stated budget, not because a
   rollout was measured against it. Rail demand is bursty — a grid consumes it in stamps, not
   continuously — so a buffer matters more here than the rate does.

## Build materials

Distinct items to construct the 12 machines, separate from flow imports:

| item | qty | from |
|---|--:|---|
| iron-plate | 180 | foundries 30 ea + extractors 30 ea |
| small-parts-01 | 105 | all three machine types |
| copper-cable | 90 | advanced-foundry ×3 |
| stone-brick | 60 | advanced-foundry ×3 |
| duralumin | 30 | assembling-machine-2 ×6 |
| stone-furnace | 30 | advanced-foundry ×3 |
| **inductor1** | **30** | soil-extractor ×3, 10 ea |
| electronic-circuit | 18 | assembling-machine-2 ×6 |
| steel-plate | 12 | assembling-machine-2 ×6 |
| burner-mining-drill | 6 | soil-extractor ×3 |
| assembling-machine-1 | 6 | |

`small-parts-01` at 105 and `inductor1` at 30 are both covered by the small-parts block — 105 is
about 30 s of its 3.43/s, and 30 inductors is under a minute either route. Inferred from the recipe
graph, not from save state.
