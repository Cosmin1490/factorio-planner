# 24 — Iron plate, borax/BOF route — 11.25 plate/s, 50 buildings

Clamped at **raw-coal 15/s** — one yellow belt. The borax route replaces direct smelting at
**1.111 iron-ore per plate against 8.00**, a 7.2× ore reduction, and pays for it almost entirely in
oxygen: 95 % of the electrical draw is electrolysis.

```
grade-1-iron-crush   [U] [crusher, 2 s]  iron-ore 5                     →  processed-iron-ore 3 + stone 1
molten-iron-05       [U] [bof,     4 s]  borax 3 + processed-iron-ore 5 + oxygen 60
                                                                        →  molten-iron 10
hotair-iron-plate-1  [U] [casting, 4 s]  borax 3 + sand-casting 1 + molten-iron 100 + hot-air 50
                                                                        →  iron-plate 75
hydrogen             [U] [electrolyzer, 10 s]  water 300                →  hydrogen 200 + oxygen 100
coke-coal            [U] [hpf,     2 s]  raw-coal 10                    →  coke 4 + coke-oven-gas 20 @250 °C
```

Plate per raw-coal is **0.75**, plate per iron-ore **0.9** — both fixed, no branching anywhere in the
chain, so either input clamps it cleanly.

## Why oxygen, and why it is the whole cost

`molten-iron-05` runs in a `bof-mk01` — a basic oxygen furnace. It takes **60 oxygen per 10 molten-iron**,
the oxygen blow that burns carbon out of the iron, and a plate needs 1.333 molten-iron. That is
**8.00 oxygen per plate**, and there is no way around it: the BOF *is* the borax route.

It is expensive only because of how oxygen is made. **`hydrogen` is the sole viable unlocked source** —
you buy it for the oxygen and the hydrogen is the side product. Every better route is locked:
`syngas-methane` and `hydrogen-chloride-2` behind chemical science, `syngas-from-hydrogen-1` behind
that plus `fuel-production`, `pa-oxygen` five tiers up. `muddy-sludge-void-electrolyzer` is unlocked but
yields 3.33 O₂/s per building against `hydrogen`'s 10.00, and there is no muddy-sludge here anyway.

Productivity cannot help: **`hydrogen` has `productivity: false`**, so modules only trade MW for
buildings. See § The oxygen alternative for the one route that does beat it.

## Why creosote and sand — they are not a cost

`sand-casting` is the **mould** the plates are cast in, and creosote is its binder — resin-bonded
foundry sand. It has exactly one recipe and every casting route to every metal goes through it:

```
sand-casting  [U] [tar, 1 s]  sand 5 + creosote 20  →  sand-casting 2
```

It appears in ~50 recipes — every `*-plate-3`, `steel-20`, `stainless-steel`, `super-steel`, most
alloys — so **one `tar-processing-unit` at 8 % load is the entry ticket to the whole molten-metal
tier**, not an iron-specific expense.

Neither input is scarce. **Creosote is a disposal problem you already have**: design 10 emits 31.75/s
at its structural floor with the sink recorded as *assumed*, and its own throughput identity has
`S_creosote/31.75` as a term — a 10/s sink throttles that block to 138.6 MW, 32 % of nameplate. This
block eats 1.50/s, which turns an assumed sink into a real one. **Sand is made in-block from the
crusher's own stone** (§ Intermediate flows).

## Block boundary

| class | items |
|---|---|
| **import — readily available** | iron-ore, raw-coal, water, electricity |
| **import — from design 10/13** | creosote |
| **import — from a borax outpost** | borax, **washed there** |
| **must-consume-internally** | processed-iron-ore, molten-iron, oxygen, coke, coke-oven-gas (both temperatures), hot-air, pressured-air, warm-stone-brick, stone-brick, sand, gravel, sand-casting, hydrogen, steam |
| **byproduct-exclude** | none |

**Borax is imported already washed.** `borax-washing` (raw-borax 10 + water 150 → borax 10 +
muddy-sludge 100) stays at the outpost, which keeps 89 water/s and **59 muddy-sludge/s** out of this
block entirely. Stack size agrees: raw-borax is 50, borax is 100, so washing first doubles wagon
density. The outpost also carries the `borax` resource's mining fluid — **syngas 2.5 per raw-borax**,
a design 13 draw, which is why it is not in this block's import list.

**Coke-oven-gas is a temperature-variant boundary** (rule 19) and deliberately internal. The solver
reports it twice — 250 °C consumed by `warm-stone-brick-1`, 100 °C emitted — and **both rows are fuel**.

## Recipe table

```
┌─────────────────────┬─────────────────────┬───────┬───────┬───────┬────────┬────────┐
│ Recipe              │ Factory             │ Count │ Size  │ frac  │ load   │ MW     │
├─────────────────────┼─────────────────────┼───────┼───────┼───────┼────────┼────────┤
│ grade-1-iron-crush  │ jaw-crusher         │     5 │ 7x7   │  5.00 │ 100 %  │   5.00 │
│ molten-iron-05      │ bof-mk01            │     6 │ 7x7   │  6.00 │ 100 %  │ (coke) │
│ hotair-iron-plate-1 │ casting-unit-mk01   │     1 │ 7x7   │  0.60 │  60 %  │   0.30 │
│ sand-casting        │ tar-processing-unit │     1 │ 11x11 │  0.08 │   8 %  │   0.04 │
│ hydrogen            │ electrolyzer-mk01   │     9 │ 6x6   │  9.00 │ 100 %  │  90.00 │
│ stone-to-gravel     │ jaw-crusher         │     1 │ 7x7   │  0.17 │  17 %  │   0.17 │
│ gravel-to-sand      │ jaw-crusher         │     1 │ 7x7   │  0.13 │  13 %  │   0.13 │
│ coke-coal           │ hpf                 │     3 │ 7x7   │  3.00 │ 100 %  │   6.00 │
│ warm-stone-brick-1  │ rhe                 │     2 │ 5x5   │  1.60 │  80 %  │   0.48 │
│ warm-air-1          │ rhe                 │     1 │ 5x5   │  0.10 │  10 %  │   0.03 │
│ pressured-air       │ vacuum-pump-mk01    │     1 │ 3x3   │  0.04 │   4 %  │   0.04 │
│ (COG surplus)       │ oil-boiler-mk01     │     3 │ 5x5   │  2.03 │  68 %  │      — │
│ (hydrogen)          │ oil-boiler-mk01     │     2 │ 5x5   │  1.22 │  61 %  │      — │
│ (power)             │ steam-engine        │    13 │ 3x5   │ 12.97 │ 100 %  │      — │
│ (bypass gate)       │ pump                │     1 │ 1x2   │     — │   —    │   0.03 │
└─────────────────────┴─────────────────────┴───────┴───────┴───────┴────────┴────────┘
```

**50 buildings · ~1,684 tiles · 102.21 MW drawn, 48.00 MW generated, 54.21 MW net grid**

**Inputs** (/s): **raw-coal 15.000** · iron-ore 12.500 · water 270.000 · borax 4.950 · creosote 1.500 ·
electricity 54.21 MW net

**Exports** (/s): **iron-plate 11.250** · **stone 1.833** · ash 6.000

Five imports, one solid fuel, and **no coke crosses the boundary in either direction**.

## Intermediate flows

```
┌────────────────────┬──────────┬────────────────────────┬────────────────────────────────────────┐
│ Item               │ Rate /s  │ Producer               │ Consumer                               │
├────────────────────┼──────────┼────────────────────────┼────────────────────────────────────────┤
│ processed-iron-ore │    7.500 │ grade-1-iron-crush     │ molten-iron-05 7.500                   │
│ molten-iron        │   15.000 │ molten-iron-05         │ hotair-iron-plate-1 15.000             │
│ oxygen             │   90.000 │ hydrogen               │ molten-iron-05 90.000                  │
│ coke               │    6.000 │ coke-coal              │ molten-iron-05 6.000 (as fuel) ← closed│
│ hot-air            │    7.500 │ warm-air-1             │ hotair-iron-plate-1 7.500              │
│ pressured-air      │    7.500 │ pressured-air          │ warm-air-1 7.500                       │
│ warm-stone-brick   │    1.000 │ warm-stone-brick-1     │ warm-air-1 1.000                       │
│ stone-brick        │    1.000 │ warm-air-1             │ warm-stone-brick-1 1.000   ← closed    │
│ COG @250 °C        │   30.000 │ coke-coal              │ warm-stone-brick-1 20.000, boiler 10.000│
│ COG @100 °C        │   20.000 │ warm-stone-brick-1     │ boiler 20.000                          │
│ hydrogen           │  180.000 │ hydrogen               │ boiler 180.000                         │
│ steam @250 °C      │  194.530 │ 5x oil-boiler-mk01     │ steam-engine 194.530                   │
│ stone              │    2.500 │ grade-1-iron-crush     │ stone-to-gravel 0.667, export 1.833    │
│ gravel             │    0.500 │ stone-to-gravel        │ gravel-to-sand 0.500                   │
│ sand               │    0.375 │ gravel-to-sand         │ sand-casting 0.375                     │
│ sand-casting       │    0.150 │ sand-casting           │ hotair-iron-plate-1 0.150              │
└────────────────────┴──────────┴────────────────────────┴────────────────────────────────────────┘
```

**Sand is free, and the stone exports.** `stone-to-gravel` (stone 4 → gravel 3) and `gravel-to-sand`
(gravel 4 → sand 3) give **0.5625 sand per stone**, so the 0.375 sand/s needed costs 0.667 stone/s —
**27 % of the stone**, leaving **1.833/s to export**. One crusher each at 17 % and 13 %, so
**recipe-swap them onto one machine** (rule 20) for 49 fewer tiles.

**Stone is a hard stall path — it needs a real destination.** `grade-1-iron-crush` is multi-output
(`iron-ore 5 → processed-iron-ore 3 + stone 1`) and a multi-output recipe stalls when **any** output
backs up, so a full stone buffer stops processed-iron-ore, the BOF, and the whole block. It is not a
byproduct that can be left to sort itself out.

**The export is 1.833/s and that is the number to size against.** Design 01 imports 1.00 stone/s, so
roughly half of it has an existing home and the rest needs one. Three routes if the export ever needs
help, cheapest first:

| route | buildings | output | note |
|---|--:|---|---|
| **raise the existing crushers** | **0 new** | sand | they cover 4.00 stone/s each; taking all 2.500 puts them at 63 %/47 % and yields 1.406 sand/s (stack 200, 117 consumers). No new buildings at all |
| `stone-brick-2` [hpf, 2 s] | 1 at 73 % | stone-brick 1.47/s | **also sinks pitch 18.33/s**, which design 10 voids at 280/s. 0.8 brick per stone, the best ratio |
| `stone-brick` [smelting, 3.2 s] | 3 `stone-furnace` (2×2, 12 tiles) | stone-brick 0.92/s | smallest footprint, but burner — adds 0.12 ash/s |

The first is the natural overflow tier (rule 29): splitter on the stone belt, export station at priority,
crushers as overflow. It costs nothing because the capacity is already placed, and it means the block
**cannot** stall on stone regardless of what the export is doing.

## The coke loop closes exactly

```
coke-coal  raw-coal 15.000/s  →  coke 6.000/s  +  coke-oven-gas 30.000/s
                                   │                 │
                                   │                 ├── 20.000/s → RHE → hot-air 7.500/s + COG @100 20.000/s
                                   │                 └── 10.000/s @250 ──────────────────────────────┐
                                   └─▶ molten-iron-05 burns 6.000/s  (6 bof x 5 MW = 30 MW)          │
                                                                                                     ▼
                                                              5 boilers + 13 engines ◀── hydrogen 18.00 MJ/s
                                                                     48.00 MW
```

**6.000 coke/s produced, 6.000 coke/s burned** — nothing spare, nothing short, no import. The hot-air
plant exists for the hot-air; its coke co-product happens to be exactly what the furnaces eat, because
`coke-coal` is the only unlocked COG source and the ratio is locked at 1 coke per 5 COG.

### All 30.00 COG/s is burnable, including the 20 that passed the exchanger

`warm-stone-brick-1` takes COG at ≥250 °C and returns it at 100 °C, extracting
`100 × 1000 J/°C × 150 °C = 15 MJ` per craft into the bricks — **but `coke-oven-gas` has
`fuel_value: 1,000,000` flat, temperature-blind**, so the cooled gas still burns for the full 1.0 MJ.
The exchanger is a free heat tap, not a consumer.

```
COG      30.000 /s  x 1.0 MJ   =  30.00 MJ/s
hydrogen 180.000 /s x 0.1 MJ   =  18.00 MJ/s
                                  ──────────
                                  48.00 MJ/s  →  48.00 MW   at 1.00 MJe/MJ
```

**Separate boilers per fluid, shared engine bank.** A burner has one fuel fluid box and Factorio will
not mix two fluids in a pipe, so COG and hydrogen cannot share — hence 3 + 2 boilers rather than one
bank. Steam is steam, so the 13 engines are common. `oil-boiler-mk01` is effectivity 2 and
`max_energy_usage` 29.61 MW is **heat output, not fuel burn** — 14.805 MJ/s of fuel each, 60 steam/s
out, pairing 1 : 4 with `steam-engine` at effectivity 0.5.

**Hydrogen is not noise at this rate.** The ruleset pre-approves venting it because 0.10 MJ is
negligible per unit — true per unit, false at 180/s, where it is 18.00 MJ/s and 37 % of the block's
generation for 2 boilers and ~5 engines.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| **iron-plate** | 11.250 | the product — Tier A, 183 consumers | — | — |
| **stone** | 1.833 | **export** — design 01 takes 1.00/s for `sodium-alginate`; **0.833/s still needs a home** | 0 | mining it. Overflow to the in-block crushers is the zero-building fallback (→ 1.406 sand/s); `stone-brick-2` sinks pitch too |
| **ash** | 6.000 | **design 12 `ash-separation`** (~10 ash/s rated) | 0 — block exists | `rich-clay` (4.17/s per 9×9 chemical plant, emits rich-clay needing its own home); chests at stack 1000 = 22 h each, fine as a buffer, not a sink |
| coke-oven-gas | 30.000 | **boiler → engines**, 30.00 MW | 3 boilers, 9 engines | venting — not approved, it is a fuel gas |
| hydrogen | 180.000 | **boiler → engines**, 18.00 MW | 2 boilers, 4 engines | venting (pre-approved but worth 18.00 MW) |

**Ash is the one to watch.** 6.000/s fits design 12's ~10/s with margin, but a second stamp of this
block does not — 12.000/s needs design 12 doubled or a second route. And in the degraded mode below it
rises to 10.000/s on its own.

## The oxygen alternative — priced, not chosen

**Air separation beats electrolysis by 58.5 MW and removes the water import.** Recorded so it is not
re-derived later:

```
nitrogen-mk01        160 units [automation + py-science-1 + logistic]   prerequisite: logistic-science-pack ✓ researched
purest-nitrogen-gas  [U after] [distilator, 5 s]  pressured-air 100  →  purest-nitrogen-gas 60 + nitrogen 20 + oxygen 20
pressured-air        [U]       [vacuum, 1 s]      (no ingredients)   →  pressured-air 200
```

| for 90 oxygen/s | electrolysis | air separation |
|---|--:|--:|
| buildings | 9 `electrolyzer-mk01` | 23 `distilator` + 2 pumps + 1 vent |
| **tiles** | **324** | **1,499** |
| MW drawn | 90.00 | **13.53** |
| hydrogen credit | −18.00 | — |
| **net MW** | **72.00** | **13.53** |
| water | 270 /s | **0** |

Whole-block effect: 102.21 → **25.75 MW drawn** against 30.00 generated — the block becomes a **net
power exporter at 4.25 MW**, on four imports instead of five, for **+11 buildings and ~1,150 tiles**.

**Not taken: this block is space-constrained, not power-constrained.** 23 distilators at 8×8 is 9 % of
a city block and the largest single item in the design. `productivity: false` on the recipe means
modules cannot cut the count, and `distilator-mk02` halves buildings while quadrupling MW each
(12 × 2.00 = 24 MW against 23 × 0.50 = 11.25), defeating the purpose. **Revisit only if power becomes
the binding constraint rather than footprint.**

Its byproducts were priced too: purest-nitrogen-gas 270/s and nitrogen 90/s have **no unlocked
consumers** (1 of 14 and 1 of 40 recipes, both barreling). `purest-nitrogen-void` — unlocked by the
same tech — converts purest-nitrogen-gas 240 → pressured-air 240, but **recycling into a free input
cannot pay**: returning 270/s costs 2.25 pumps / 2.25 MW against 1.35 pumps / 1.35 MW to make the same
air from nothing. One `py-gas-vent` (1×1, 25 kW, 40,000/s) would cover both streams.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **the @250 header receiving return gas** | the boiler header carries both @250 and @100 COG, which is fine — `fuel_value` is temperature-blind — but any backflow into the exchanger inlet fails `minimum_temperature: 250` and **stalls both RHEs at once**, killing hot-air *and* the gas path. Directional pump only. The one mistake with no graceful degradation |
| 2 | **the coke loop is a single thread** | `coke-coal` down → no coke *and* no hot-air → furnaces starve *and* casting stalls. Raw-coal to the BOF does not rescue it alone; see § Degraded mode |
| 3 | **stone 1.833/s** | `grade-1-iron-crush` is multi-output, so a full stone buffer stalls it → no processed-iron-ore → **total stall**. Design 01 absorbs 1.00/s; the other 0.833/s needs a destination. Zero-building fallback: raise the two crushers to 63 %/47 % and it all becomes sand |
| 4 | **ash 6.000/s** | backs up → BOF stalls → no molten-iron → total stall. Design 12 covers it; a second stamp does not |
| 5 | **`stone-brick` loop** | 1.000/s circulates and nets to zero, so nothing refills it. One stray inserter drains it and hot-air stops with no obvious cause. Self-healing if one `stone-brick` furnace is added — `stone 2 → 1`, and the block has 1.833 stone/s spare |
| 6 | water 270/s | under the mk01 fluid-wagon ceiling (~400/s) with room; two stamps need mk02 |

`t = min(sink_i / rate_i)` over every terminal output. **Stone is the binding one**: 1.833/s against
design 01's 1.00/s import gives `t = 0.55` — the block capped at **6.19 plate/s, 55 % of nameplate** —
unless the export gets a second consumer or the crusher overflow is wired. Ash is next at `t = 1.67`
(6.000/s against design 12's ~10/s), then iron-plate. This is the trivial-byproduct-throttles-the-product
case from Backpressure #3, and stone is the one to settle before building.

**The stone-brick cycle cannot deadlock by filling** (Backpressure #6), but not for the ratio reason —
it is a **pure catalyst loop**, net zero in both directions (`warm-stone-brick-1` consumes 5 stone-brick
and emits 5 warm-stone-brick; `warm-air-1` does the reverse at 20). With no net production there is
nothing to back up: if hot-air demand stops, both steps simply stall and resume together. **The hazard
is the loop draining, not filling** — see risk 4. Note the 4:1 craft ratio means `warm-air-1` needs four
of the producer's crafts before it can fire once, so the initial brick stock must be at least 20 or the
loop never starts.

## Degraded mode — `iron-plate-1` plus raw-coal

Both casting recipes are unlocked, same building, identical ingredients minus the hot-air. **Solid
burners take mixed chemical fuels in one inventory**, so coke-priority-then-raw-coal is two inserters
and a circuit condition — none of the duplicated-machine awkwardness a fluid burner would force.

| | normal | degraded |
|---|---|---|
| casting recipe | `hotair-iron-plate-1` (75 per 100 molten-iron) | `iron-plate-1` (60 per 100) |
| BOF fuel | coke 6.000/s, internal | raw-coal 10.000/s, imported |
| **iron-plate** | **11.250 /s** | **9.000 /s** (−20 %) |
| oxygen per plate | 8.000 | 10.000 |
| **ash** | 6.000 /s | **10.000 /s** |

Both changes are needed together — raw-coal alone does not help, because an hpf outage stops hot-air
and the casting step with it. Note the ash: 10.000/s saturates design 12 exactly, so degraded mode is
**rate-limited by ash disposal**, not by fuel.

## Build notes

- **Four banks run at exactly 100 %.** `coke-coal` (3), `molten-iron-05` (6), `hydrogen` (9),
  `grade-1-iron-crush` (5). Padding is argued from **N+1, not load percentage** — the question is
  whether losing one unit drops the bank below demand:

  | bank | lose one → | N+1 cost |
  |---|--:|---|
  | `coke-coal` | **67 %** | **none available** — 3 hpf *are* the 15/s clamp; a 4th lets them pull 20/s and breaks it |
  | `molten-iron-05` | 83 % | **49 tiles, 0 MW** — it is a burner. The cheapest pad in the block |
  | `grade-1-iron-crush` | 80 % | 49 tiles, 1.00 MW |
  | `hydrogen` | 89 % | 36 tiles; an idle electrolyzer draws only its drain |

  The hpf bank at 100 % is correct rather than risky, same as any clamp-by-construction.
- **`electrolyzer-mk01` costs a `tar-processing-unit` each.** Nine of them plus the one standing as the
  `sand-casting` machine is **ten `tar-processing-unit` to build** — the binding construction item here,
  and easy to miss because only one appears in the recipe table.
- **The 19-building power island is fully detachable**, keeping the core at 31 buildings — under the
  40-building stamping threshold, with gas and power as a separate pad.
- **Clamp on either input, the ratios are fixed.** 0.75 plate per raw-coal, 0.9 per iron-ore, no
  branching. At this clamp everything fits one yellow belt: raw-coal 15.00/s exactly, iron-ore 12.50/s
  and iron-plate 11.25/s both under one, water inside a mk01 wagon.
- **Worth knowing about the ore form.** `grade-1-iron-crush` at the mine instead would import
  **processed-iron-ore 7.50/s** — stack 50 → 100 and a lower item rate, so ~3.3× fewer trains, and one
  yellow belt of processed ore would feed far more than this block. Rule 21 uses iron as its worked
  example for exactly this. A different block boundary, not a change to this design.
- `steam-turbine-mk01` accepts only `pressured-steam` ≥500 °C; `steam-engine` is the generator here
  (`min_temp 100`, effectivity 0.5).

## Two stamps

Rule 25: a second copy is zero design cost. **raw-coal 30/s → 22.50 plate/s, 100 buildings,
~108.4 MW net**, imports doubled (iron-ore 25.00, water 540.00, borax 9.90, creosote 3.00). Water needs
a mk02 wagon at that point, and **ash 12.000/s exceeds design 12** — size the ash destination before
stamping, not after.

## Solver command

One run, target mode on the single end product. `--max-import` is load-bearing on all three: without
`coke:0` the LP imports coke instead of running `coke-coal`, without `hot-air:0` it imports hot-air
rather than building the exchanger chain, and without `sand:0` it imports sand rather than crushing the
block's own stone. `--fuel` is required because the solver models `bof-mk01`'s burner but defaults it
to coal. Drills and every boiler/engine pair are computed by hand — the solver models neither mining
nor fluid-burner fuel.

```bash
npx tsx src/cli.ts solve \
  --recipes "hotair-iron-plate-1,molten-iron-05,grade-1-iron-crush,sand-casting,hydrogen,stone-to-gravel,gravel-to-sand,coke-coal,warm-stone-brick-1,warm-air-1,pressured-air" \
  --target "iron-plate:11.25" --time 1 \
  --factory "grade-1-iron-crush:jaw-crusher" \
  --factory "molten-iron-05:bof-mk01" \
  --factory "hotair-iron-plate-1:casting-unit-mk01" \
  --factory "sand-casting:tar-processing-unit" \
  --factory "hydrogen:electrolyzer-mk01" \
  --factory "stone-to-gravel:jaw-crusher" \
  --factory "gravel-to-sand:jaw-crusher" \
  --factory "coke-coal:hpf" \
  --factory "warm-stone-brick-1:rhe" \
  --factory "warm-air-1:rhe" \
  --factory "pressured-air:vacuum-pump-mk01" \
  --fuel "molten-iron-05:coke" \
  --max-import "coke:0" --max-import "sand:0" --max-import "hot-air:0" \
  --solver simplex \
  --unlocked
```

It emits a cycle warning on `stone-brick → warm-stone-brick`; ignore it, the loop is intentional and
the solver zeroes it correctly. It also reports `coke-oven-gas` twice — 30.00/s at 250 °C and 20.00/s
at 100 °C. **Both are fuel, not waste.**

The air-separation variant, should power ever bind instead of space — replace the `hydrogen` rows with:

```bash
npx tsx src/cli.ts solve \
  --recipes "hotair-iron-plate-1,molten-iron-05,grade-1-iron-crush,sand-casting,purest-nitrogen-gas,stone-to-gravel,gravel-to-sand,coke-coal,warm-stone-brick-1,warm-air-1,pressured-air" \
  --target "iron-plate:11.25" --time 1 \
  --factory "purest-nitrogen-gas:distilator" \
  --factory "grade-1-iron-crush:jaw-crusher" --factory "molten-iron-05:bof-mk01" \
  --factory "hotair-iron-plate-1:casting-unit-mk01" --factory "sand-casting:tar-processing-unit" \
  --factory "stone-to-gravel:jaw-crusher" --factory "gravel-to-sand:jaw-crusher" \
  --factory "coke-coal:hpf" --factory "warm-stone-brick-1:rhe" --factory "warm-air-1:rhe" \
  --factory "pressured-air:vacuum-pump-mk01" \
  --fuel "molten-iron-05:coke" \
  --max-import "coke:0" --max-import "sand:0" --max-import "hot-air:0" --max-import "oxygen:0" \
  --solver simplex \
  --unlocked
```

Requires `nitrogen-mk01` researched; the command will not solve before that.

## Build materials

Distinct construction materials across this block's 12 building types, separate from flow imports:

`aluminium-plate` · `boiler` · `copper-plate` · `electric-mining-drill` · `electronic-circuit` ·
`engine-unit` · `gasifier` · `inductor1` · `intermetallics` · `iron-plate` · `lab` · `pipe` ·
`py-local-radar` · `small-parts-01` · `steam-engine` · `steel-furnace` · `steel-plate` ·
`stone-brick` · `stone-furnace` · `tar-processing-unit`

The binding item is **`tar-processing-unit` ×10** — nine consumed by the electrolyzers plus one standing.
**`py-local-radar`** and **`aluminium-plate`** are the two to check: the radar appears only via
`casting-unit-mk01` and aluminium only via `electrolyzer-mk01`, so neither shows up elsewhere in this
block's graph. `intermetallics` comes in through both `casting-unit-mk01` and `oil-boiler-mk01`.
Inferred from the recipe graph, not from save state.
