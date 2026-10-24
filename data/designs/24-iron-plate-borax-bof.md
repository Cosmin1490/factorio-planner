# 24 — Iron plate, borax/BOF route — 9.00 plate/s, 31 buildings

Clamped at **coke 6/s** — the BOF's own fuel burn, imported rather than made. The borax route replaces
direct smelting at **1.389 iron-ore per plate against 8.00**, a 5.8× ore reduction, and pays for it
almost entirely in oxygen: 94 % of the electrical draw is electrolysis.

```
grade-1-iron-crush   [U] [crusher, 2 s]  iron-ore 5                     →  processed-iron-ore 3 + stone 1
molten-iron-05       [U] [bof,     4 s]  borax 3 + processed-iron-ore 5 + oxygen 60
                                                                        →  molten-iron 10
iron-plate-1         [U] [casting, 4 s]  borax 3 + sand-casting 1 + molten-iron 100
                                                                        →  iron-plate 60
hydrogen             [U] [electrolyzer, 10 s]  water 300                →  hydrogen 200 + oxygen 100
```

Plate per coke is **1.50**, plate per iron-ore **0.72** — both fixed, no branching anywhere in the
chain, so either input clamps it cleanly.

## Coke is imported, and that is what rules out hot-air

The hot-air casting variant yields 75 plate per 100 molten-iron against this route's 60 — **25 % more
plate on byte-identical inputs**. It is not taken, and the reason is a rigid dependency rather than a
preference:

```
hotair-iron-plate-1  needs  hot-air
warm-air-1           needs  warm-stone-brick
warm-stone-brick-1   needs  coke-oven-gas @>=250 C     <- names the fluid, not "any hot gas"
coke-coal            is the only unlocked COG source
```

Every alternative brick-heating recipe — `warm-stone-brick-2`, `warmer-stone-brick-1/2`,
`hot-stone-brick` — needs `outlet-gas-04` or COG at ≥500 °C and is **locked**. So hot-air requires
running `coke-coal` in-block, which means importing raw-coal at 15/s instead of coke at 6/s.

**What importing coke buys**, against the raw-coal-plus-hot-air configuration:

| | import coke (this design) | make coke, keep hot-air |
|---|--:|--:|
| **iron-plate /s** | 9.000 | **11.250** |
| buildings | **31** | 50 |
| tiles | **~1,256** | ~1,684 |
| import | **coke 6.00/s** | raw-coal 15.00/s |
| **inbound stacks/s** | **0.06** | 0.30 |
| MW drawn | **95.63** | 102.21 |
| MW generated | 18.00 | 48.00 |
| ash /s | 6.00 | 6.00 |
| oxygen per plate | 10.000 | **8.000** |

**Five times fewer trains.** Coke is stack 100 against raw-coal's 50, at 2.5× lower rate — the same
compounding stack-and-rate lever rule 21 uses. Nineteen fewer buildings, 428 fewer tiles.

**The 30 MW of lost generation is relocated, not destroyed.** Six coke/s requires `coke-coal` at
15 raw-coal/s upstream, which emits the same 30 COG/s; the boilers and engines simply live in the
other block. Corrected for that, energy per plate is **5.29 MW/plate/s against 4.82** — 9.8 % worse,
not the 43 % the net-import column suggests.

**The genuine loss is the oxygen ratio.** Nine electrolyzers produce 90 oxygen/s either way, for
90 MW, regardless of casting recipe. Plate per oxygen falls **0.125 → 0.100**, and that part does not
relocate anywhere. Accept it when train throughput or footprint binds; take the raw-coal route when
ore or power binds.

**`coke-coal` is a 1.18× fuel upgrader**, which is why it is worth running *somewhere*:
`15 raw-coal (45 MJ) + 6 MW hpf → 6 coke (30 MJ) + 30 COG (30 MJ)`, 51 MJ/s in for 60 MJ/s out, in
exactly the two forms a BOF block wants. Burning raw-coal directly in the BOF instead — which works,
`bof-mk01` takes `chemical`/`biomass` — throws that away and raises ash from 6.00 to **10.000/s**,
saturating design 12 on a single stamp.

**Revisit if `outlet-gas-04` unlocks** — `warm-stone-brick-2` heats bricks without COG, and hot-air
would come back on imported coke.

## Why oxygen, and why it is the whole cost

`molten-iron-05` runs in a `bof-mk01` — a basic oxygen furnace. It takes **60 oxygen per 10 molten-iron**,
the oxygen blow that burns carbon out of the iron, and a plate needs 1.667 molten-iron. That is
**10.00 oxygen per plate**, and there is no way around it: the BOF *is* the borax route.

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

The casting rate is unchanged by dropping hot-air — both recipes run at 0.15 crafts/s on the same
15 molten-iron/s — so borax, sand, gravel and stone are all identical to the hot-air configuration.

## Block boundary

| class | items |
|---|---|
| **import — readily available** | iron-ore, water, electricity |
| **import — from a coking block** | **coke** |
| **import — from design 10/13** | creosote |
| **import — from a borax outpost** | borax, **washed there** |
| **must-consume-internally** | processed-iron-ore, molten-iron, oxygen, sand, gravel, sand-casting, hydrogen, steam |
| **byproduct-exclude** | none |

**Borax is imported already washed.** `borax-washing` (raw-borax 10 + water 150 → borax 10 +
muddy-sludge 100) stays at the outpost, which keeps 74 water/s and **49 muddy-sludge/s** out of this
block entirely. Stack size agrees: raw-borax is 50, borax is 100, so washing first doubles wagon
density. The outpost also carries the `borax` resource's mining fluid — **syngas 2.5 per raw-borax**,
a design 13 draw, which is why it is not in this block's import list. Design 34 is that outpost.

**No temperature-variant fluid crosses the boundary.** Dropping the COG chain removed the one rule-19
hazard the previous configuration carried.

## Recipe table

```
┌─────────────────────┬─────────────────────┬───────┬───────┬───────┬────────┬────────┐
│ Recipe              │ Factory             │ Count │ Size  │ frac  │ load   │ MW     │
├─────────────────────┼─────────────────────┼───────┼───────┼───────┼────────┼────────┤
│ grade-1-iron-crush  │ jaw-crusher         │     5 │ 7x7   │  5.00 │ 100 %  │   5.00 │
│ molten-iron-05      │ bof-mk01            │     6 │ 7x7   │  6.00 │ 100 %  │ (coke) │
│ iron-plate-1        │ casting-unit-mk01   │     1 │ 7x7   │  0.60 │  60 %  │   0.30 │
│ sand-casting        │ tar-processing-unit │     1 │ 11x11 │  0.08 │   8 %  │   0.04 │
│ hydrogen            │ electrolyzer-mk01   │     9 │ 6x6   │  9.00 │ 100 %  │  90.00 │
│ stone-to-gravel     │ jaw-crusher         │     1 │ 7x7   │  0.17 │  17 %  │   0.17 │
│ gravel-to-sand      │ jaw-crusher         │     1 │ 7x7   │  0.13 │  13 %  │   0.13 │
│ (hydrogen)          │ oil-boiler-mk01     │     2 │ 5x5   │  1.22 │  61 %  │      — │
│ (power)             │ steam-engine        │     5 │ 3x5   │  4.86 │  97 %  │      — │
└─────────────────────┴─────────────────────┴───────┴───────┴───────┴────────┴────────┘
```

**31 buildings · ~1,256 tiles · 95.63 MW drawn, 18.00 MW generated, 77.63 MW net grid**

**Inputs** (/s): **coke 6.000** · iron-ore 12.500 · water 270.000 · borax 4.950 · creosote 1.500 ·
electricity 77.63 MW net

**Exports** (/s): **iron-plate 9.000** · **stone 1.833** · ash 6.000

Five imports, one solid fuel, and the fuel arrives already upgraded.

## Intermediate flows

```
┌────────────────────┬──────────┬────────────────────────┬────────────────────────────────────────┐
│ Item               │ Rate /s  │ Producer               │ Consumer                               │
├────────────────────┼──────────┼────────────────────────┼────────────────────────────────────────┤
│ processed-iron-ore │    7.500 │ grade-1-iron-crush     │ molten-iron-05 7.500                   │
│ molten-iron        │   15.000 │ molten-iron-05         │ iron-plate-1 15.000                    │
│ oxygen             │   90.000 │ hydrogen               │ molten-iron-05 90.000                  │
│ hydrogen           │  180.000 │ hydrogen               │ boiler 180.000                         │
│ steam @250 °C      │   72.950 │ 2x oil-boiler-mk01     │ steam-engine 72.950                    │
│ stone              │    2.500 │ grade-1-iron-crush     │ stone-to-gravel 0.667, export 1.833    │
│ gravel             │    0.500 │ stone-to-gravel        │ gravel-to-sand 0.500                   │
│ sand               │    0.375 │ gravel-to-sand         │ sand-casting 0.375                     │
│ sand-casting       │    0.150 │ sand-casting           │ iron-plate-1 0.150                     │
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

## The hydrogen power island

```
hydrogen 180.000 /s  x 0.1 MJ  =  18.00 MJ/s
   │
   └─▶ 2 oil-boiler-mk01 (effectivity 2)  ──  36.00 MJ/s of heat  ──  72.95 steam/s @250 C
                                                                          │
                                                       5 steam-engine (effectivity 0.5)
                                                                          │
                                                                     18.00 MW
```

**Hydrogen is not noise at this rate.** The ruleset pre-approves venting it because 0.10 MJ is
negligible per unit — true per unit, false at 180/s, where it is 18.00 MJ/s and **23 % of the block's
own draw** for 7 buildings and 125 tiles.

`oil-boiler-mk01` is effectivity 2 and `max_energy_usage` 29.61 MW is **heat output, not fuel burn** —
14.805 MJ/s of fuel each, 60 steam/s out, pairing 1 : 2.4 with `steam-engine` at effectivity 0.5.
The product is exactly **1.00 MJe per MJ of fuel**, which is the ceiling on plain steam: every
plain-steam generator in Py is effectivity 0.5, and `steam-turbine-mk01` accepts only
`pressured-steam` ≥500 °C, reachable solely from `he-01` and molten salt.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| **iron-plate** | 9.000 | the product — Tier A, 183 consumers | — | — |
| **stone** | 1.833 | **export** — design 01 takes 1.00/s for `sodium-alginate`; **0.833/s still needs a home** | 0 | mining it. Overflow to the in-block crushers is the zero-building fallback (→ 1.406 sand/s); `stone-brick-2` sinks pitch too |
| **ash** | 6.000 | **design 12 `ash-separation`** (~10 ash/s rated) | 0 — block exists | `rich-clay` (4.17/s per 9×9 chemical plant, emits rich-clay needing its own home); chests at stack 1000 = 22 h each, fine as a buffer, not a sink |
| hydrogen | 180.000 | **boiler → engines**, 18.00 MW | 2 boilers, 5 engines | venting (pre-approved but worth 18.00 MW) |

**Ash has headroom now.** 6.000/s against design 12's ~10/s leaves room a raw-coal-fired BOF would not
— that variant runs 10.000/s and saturates it exactly. Two stamps still need design 12 doubled.

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

Whole-block effect: 95.63 → **19.16 MW drawn** against 0 generated — net import falls from 77.63 to
**19.16 MW**, on four imports instead of five, for **+10 buildings and ~1,150 tiles**. The power island
disappears with the hydrogen, so the net building count rises only to 41.

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
| 1 | **stone 1.833/s** | `grade-1-iron-crush` is multi-output, so a full stone buffer stalls it → no processed-iron-ore → **total stall**. Design 01 absorbs 1.00/s; the other 0.833/s needs a destination. Zero-building fallback: raise the two crushers to 63 %/47 % and it all becomes sand |
| 2 | **ash 6.000/s** | backs up → BOF stalls → no molten-iron → total stall. Design 12 covers it with margin; a second stamp does not |
| 3 | **coke 6.000/s** | single import, and the BOF's only fuel. Starves the furnaces, but **degrades gracefully** — no cascade beyond stopping, and the block restarts cleanly. `bof-mk01` takes any `chemical`/`biomass` fuel in one inventory, so raw-coal is a two-inserter fallback at 10/s (and 10 ash/s) |
| 4 | **oxygen backs up** | only if the BOFs stall for another reason; electrolyzers then stall behind it, which also drops the 18 MW island. Consequence of 1–3, not a cause |
| 5 | water 270/s | under the mk01 fluid-wagon ceiling (~400/s) with room; two stamps need mk02 |

`t = min(sink_i / rate_i)` over every terminal output. **Stone is the binding one**: 1.833/s against
design 01's 1.00/s import gives `t = 0.55` — the block capped at **4.95 plate/s, 55 % of nameplate** —
unless the export gets a second consumer or the crusher overflow is wired. Ash is next at `t = 1.67`
(6.000/s against design 12's ~10/s), then iron-plate. This is the trivial-byproduct-throttles-the-product
case from Backpressure #3, and stone is the one to settle before building.

**Three of the previous configuration's six risks are gone** with the COG chain: the @250 header
backflow that stalled both RHEs with no graceful degradation, the coke loop's single-thread coupling of
fuel to hot-air, and the `stone-brick` catalyst loop that could silently drain. What remains is the
stone and ash pair, both of which are sink problems rather than internal ones.

## Build notes

- **Three banks run at exactly 100 %.** `molten-iron-05` (6), `hydrogen` (9), `grade-1-iron-crush` (5).
  Padding is argued from **N+1, not load percentage** — the question is whether losing one unit drops
  the bank below demand:

  | bank | lose one → | N+1 cost |
  |---|--:|---|
  | `molten-iron-05` | 83 % | **49 tiles, 0 MW** — it is a burner. The cheapest pad in the block |
  | `grade-1-iron-crush` | 80 % | 49 tiles, 1.00 MW |
  | `hydrogen` | 89 % | 36 tiles; an idle electrolyzer draws only its drain |

- **`electrolyzer-mk01` costs a `tar-processing-unit` each.** Nine of them plus the one standing as the
  `sand-casting` machine is **ten `tar-processing-unit` to build** — the binding construction item here,
  and easy to miss because only one appears in the recipe table.
- **The 7-building power island is fully detachable**, keeping the core at 24 buildings — well under the
  40-building stamping threshold, with power as a separate pad.
- **Clamp on either input, the ratios are fixed.** 1.50 plate per coke, 0.72 per iron-ore, no branching.
  Everything fits one yellow belt with room: coke 6.00/s, iron-ore 12.50/s, iron-plate 9.00/s, water
  inside a mk01 wagon.
- **Worth knowing about the ore form.** `grade-1-iron-crush` at the mine instead would import
  **processed-iron-ore 7.50/s** — stack 50 → 100 and a lower item rate, so ~3.3× fewer trains, and one
  yellow belt of processed ore would feed far more than this block. Rule 21 uses iron as its worked
  example for exactly this. A different block boundary, not a change to this design. Note it would also
  move the stone byproduct — and therefore risk 1 — out of this block entirely.
- `steam-turbine-mk01` accepts only `pressured-steam` ≥500 °C; `steam-engine` is the generator here
  (`min_temp 100`, effectivity 0.5).

## Two stamps

Rule 25: a second copy is zero design cost. **coke 12/s → 18.00 plate/s, 62 buildings, ~155.3 MW net**,
imports doubled (iron-ore 25.00, water 540.00, borax 9.90, creosote 3.00). Water needs a mk02 wagon at
that point, and **ash 12.000/s exceeds design 12** — size the ash destination before stamping, not
after. Coke at 12/s is still only 0.12 stacks/s, so the import stays trivial where raw-coal at 30/s
would not.

## Solver command

One run, target mode on the single end product. `--max-import "sand:0"` is load-bearing — without it
the LP imports sand rather than crushing the block's own stone, and the stone byproduct then has no
internal consumer at all. `--fuel` is required because the solver models `bof-mk01`'s burner but
defaults it to coal. Drills and the boiler/engine pair are computed by hand — the solver models neither
mining nor fluid-burner fuel.

```bash
npx tsx src/cli.ts solve \
  --recipes "iron-plate-1,molten-iron-05,grade-1-iron-crush,sand-casting,hydrogen,stone-to-gravel,gravel-to-sand" \
  --target "iron-plate:9" --time 1 \
  --factory "grade-1-iron-crush:jaw-crusher" \
  --factory "molten-iron-05:bof-mk01" \
  --factory "iron-plate-1:casting-unit-mk01" \
  --factory "sand-casting:tar-processing-unit" \
  --factory "hydrogen:electrolyzer-mk01" \
  --factory "stone-to-gravel:jaw-crusher" \
  --factory "gravel-to-sand:jaw-crusher" \
  --fuel "molten-iron-05:coke" \
  --max-import "sand:0" \
  --solver simplex \
  --unlocked
```

No cycle warnings — the brick catalyst loop that produced one is gone with the hot-air chain.

The air-separation variant, should power ever bind instead of space — replace the `hydrogen` rows with:

```bash
npx tsx src/cli.ts solve \
  --recipes "iron-plate-1,molten-iron-05,grade-1-iron-crush,sand-casting,purest-nitrogen-gas,stone-to-gravel,gravel-to-sand,pressured-air" \
  --target "iron-plate:9" --time 1 \
  --factory "purest-nitrogen-gas:distilator" \
  --factory "grade-1-iron-crush:jaw-crusher" --factory "molten-iron-05:bof-mk01" \
  --factory "iron-plate-1:casting-unit-mk01" --factory "sand-casting:tar-processing-unit" \
  --factory "stone-to-gravel:jaw-crusher" --factory "gravel-to-sand:jaw-crusher" \
  --factory "pressured-air:vacuum-pump-mk01" \
  --fuel "molten-iron-05:coke" \
  --max-import "sand:0" --max-import "oxygen:0" \
  --solver simplex \
  --unlocked
```

Requires `nitrogen-mk01` researched; the command will not solve before that.

The superseded raw-coal-plus-hot-air configuration, for comparison — 11.25 plate/s, 50 buildings, and
the numbers in § Coke is imported:

```bash
npx tsx src/cli.ts solve \
  --recipes "hotair-iron-plate-1,molten-iron-05,grade-1-iron-crush,sand-casting,hydrogen,stone-to-gravel,gravel-to-sand,coke-coal,warm-stone-brick-1,warm-air-1,pressured-air" \
  --target "iron-plate:11.25" --time 1 \
  --factory "grade-1-iron-crush:jaw-crusher" --factory "molten-iron-05:bof-mk01" \
  --factory "hotair-iron-plate-1:casting-unit-mk01" --factory "sand-casting:tar-processing-unit" \
  --factory "hydrogen:electrolyzer-mk01" --factory "stone-to-gravel:jaw-crusher" \
  --factory "gravel-to-sand:jaw-crusher" --factory "coke-coal:hpf" \
  --factory "warm-stone-brick-1:rhe" --factory "warm-air-1:rhe" \
  --factory "pressured-air:vacuum-pump-mk01" \
  --fuel "molten-iron-05:coke" \
  --max-import "coke:0" --max-import "sand:0" --max-import "hot-air:0" \
  --solver simplex \
  --unlocked
```

## Build materials

Distinct construction materials across this block's 7 building types, separate from flow imports:

`aluminium-plate` · `boiler` · `copper-plate` · `electric-mining-drill` · `electronic-circuit` ·
`gasifier` · `inductor1` · `intermetallics` · `iron-plate` · `lab` · `pipe` · `py-local-radar` ·
`small-parts-01` · `steam-engine` · `steel-furnace` · `steel-plate` · `stone-furnace` ·
`tar-processing-unit`

Quantities for one stamp, largest first:

```
 535x iron-plate      310x small-parts-01   270x aluminium-plate   245x steel-plate
 105x electronic-circuit   58x steam-engine   45x pipe   28x intermetallics
  21x lab   20x copper-plate   18x boiler    9x tar-processing-unit
   8x steel-furnace    7x inductor1    6x electric-mining-drill
   3x stone-furnace    2x gasifier    1x py-local-radar
```

The binding item is **`tar-processing-unit` ×10** — nine consumed by the electrolyzers plus one standing.
**`py-local-radar`** and **`aluminium-plate`** are the two to check: the radar appears only via
`casting-unit-mk01` and aluminium only via `electrolyzer-mk01`, so neither shows up elsewhere in this
block's graph. `intermetallics` comes in through both `casting-unit-mk01` and `oil-boiler-mk01`.
Dropping the COG chain removed `engine-unit` and `stone-brick` from the list — 18 distinct materials
against the previous 20. Inferred from the recipe graph, not from save state.
