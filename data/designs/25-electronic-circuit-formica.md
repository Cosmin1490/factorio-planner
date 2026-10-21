# 25 — Electronic circuits, formica route — 1.0 e-circuit/s, 259 buildings

Supersedes design 14 at the same output rate, under a tight **import whitelist**: coke, plates,
creosote, glass, water, plus **pbsb-alloy, native-flora, empty-petri-dish** where asked. Everything
else is in-block, which turns a 31-building chemistry block into a **bio megablock** — 189 of the 258
buildings are farms, and design 15's entire urea chain is absorbed into it.

```
electronic-circuit-2  [U] [chip, 4 s]  battery-mk01 1 + capacitor1 5 + inductor1 3 + resistor1 6
                                       + pcb1 1 + vacuum-tube 3 + solder 2        →  5
pcb1                  [U] [pcb,  5 s]  formica 2 + copper-plate 5 + vacuum 50     →  1
formica               [U] [pulp, 10 s] treated-wood 2 + saps 10 + raw-fiber 5 + methanal 50  →  1
```

## Why `formica` and not `formica-2`

Design 14 used `formica-2` and called route 1 absurd on saps. Under this whitelist it inverts, because
`formica-2`'s inputs are the ones that cannot be bought:

```
formica-2 ← melamine-resin 10 + fiberboard 2
            fiberboard ← treated-wood 3 + raw-fiber 5 + sodium-hydroxide 3 + steam 500
                         sodium-hydroxide ← chlorine [electrolyzer] water-saline 100
                                            → NaOH 2 + chlorine 20 + hydrogen 20
```

**`sodium-hydroxide` emits chlorine at 10 per NaOH** — never-ventable, with two unlocked consumers that
each destroy something else to absorb it. Route 1 avoids NaOH entirely.

**What route 1 costs instead: 40.00 creosote/s.** `formica` needs treated-wood 2 per formica 1, and
treated-wood is `wood 1 + creosote 100 → 2`. `formica-2` yields 5 per craft and routes treated-wood
through fiberboard, needing only ~6 creosote/s — route 1 is **6.7×**. Design 10's structural floor is
31.75/s plus design 07's 2.45/s, so **this block alone exceeds the base's creosote supply** and the
upstream must scale. Accepted deliberately; it is risk 1 below.

## Why both formica routes need a moondrop farm

`methanal` has one unlocked recipe (`copper-plate 5 + methane 60`) and **methane** has one unlocked
route, `methane-co2` [moon] `moondrop-seeds 1 + water 100 + CO₂ 100 → methane 40`. Design 14 imported
methane 7.80/s; here it is **27.00/s** made on site. Unavoidable on either formica route.

CO₂ is free — **`moondrop-co2` takes no ingredients at all** — and `soil` comes from water alone
(`soil` [soil-extraction] water 800 → soil 16), so the moss chain needs no stone.

## Block boundary

| class | items |
|---|---|
| **import — whitelisted** | coke, copper-plate, tin-plate, iron-plate, lead-plate, zinc-plate, creosote, glass, water |
| **import — asked and approved** | **pbsb-alloy**, **native-flora** |
| **import — boundary inherited from design 15** | **empty-petri-dish** 0.08/s |
| **made in-block** | pulp/bio: wood, log, saps, raw-fiber, treated-wood, moss, moondrop, methane, methanal, soil, muddy-sludge, seaweed, agar, petri-dish, small-lamp · urea: manure, liquid-manure, zogna-bacteria, urea · chemistry: cyanic-acid, ammonia, melamine · every circuit sub-part |
| **byproduct-exclude** | none |

**`empty-petri-dish` is the one boundary I set rather than you.** It is a glassworks product
(`molten-glass 50 → 1`) and the block has no molten-glass or hot-air, so making it means a glassworks
plus an ore-quartz line for **0.08/s**. Design 15 draws the identical boundary — *"the glass boundary
sits at the empty dish"* — and design 23's glass works is the supplier. Say so if you want it local.

**The boundary is set by the whitelist, not by consumer count** (rule 16). `formica` has 1 consumer and
`saps` 5 — Tier D items that would never normally justify in-block production. They are local because
they cannot be bought.

## Recipe table

Bio counts are **module-corrected**. The solver reports base crafting speed, a 3–17× error; multipliers
from solver-reference § Bio module system, all reaching effective speed 1.0.

```
┌─────────────────────────┬──────────────────────────┬───────┬───────┬────────┐
│ Recipe                  │ Factory                  │ Count │ Size  │ MW ea  │
├─────────────────────────┼──────────────────────────┼───────┼───────┼────────┤
│ electronic-circuit-2    │ chipshooter-mk01         │     1 │ 5x5   │   0.15 │
│ capacitor1              │ electronics-factory-mk01 │     2 │ 5x5   │   0.50 │
│ inductor1               │ electronics-factory-mk01 │     1 │ 5x5   │   0.50 │
│ resistor1               │ electronics-factory-mk01 │     2 │ 5x5   │   0.50 │
│ vacuum-tube             │ electronics-factory-mk01 │     3 │ 5x5   │   0.50 │
│ pcb1                    │ pcb-factory-mk01         │     1 │ 7x7   │   0.40 │
│ solder-0                │ automated-factory-mk01   │     3 │ 7x7   │   2.00 │
│ copper-cable            │ automated-factory-mk01   │     1 │ 7x7   │   2.00 │
│ bolts · iron-stick      │ automated-factory-mk01   │   1+1 │ 7x7   │   2.00 │
│ wood-seeds · petri-dish │ automated-factory-mk01   │   1+1 │ 7x7   │   2.00 │
│ small-lamp              │ automated-factory-mk01   │     1 │ 7x7   │   2.00 │
│ ceramic · graphite      │ hpf                      │   1+2 │ 7x7   │   2.00 │
│ methanal · agar         │ hpf                      │   2+1 │ 7x7   │   2.00 │
│ clay                    │ clay-pit-mk01            │     2 │ 7x7   │   0.20 │
│ vacuum · pressured-air  │ vacuum-pump-mk01         │   1+1 │ 3x3   │   1.00 │
│ formica                 │ pulp-mill-mk01           │     4 │ 5x5   │   0.15 │
│ treated-wood            │ tar-processing-unit      │     1 │ 11x11 │   0.50 │
│ fiber-01                │ wpu-mk01                 │    10 │ 6x6   │   0.50 │
│ log-wood-fast           │ wpu-mk01                 │     1 │ 6x6   │   0.50 │
│ battery-mk01            │ chemical-plant-mk01      │     2 │ 9x9   │   1.00 │
│ melamine                │ fbreactor-mk01           │     1 │ 9x9   │   1.00 │
│ urea-decomposition      │ distilator               │     2 │ 8x8   │   0.50 │
│ moondrop-seeds          │ botanical-nursery        │     1 │ 7x7   │   0.13 │
│ wood-seedling           │ botanical-nursery        │     6 │ 7x7   │   0.13 │
│ soil                    │ soil-extractor-mk01      │     2 │ 5x5   │   0.30 │
│ muddy-sludge            │ washer                   │     2 │ 6x6   │   0.40 │
│ urea-from-liquid-manure │ bio-reactor-mk01         │     1 │ 9x9   │   1.00 │
│ liquid-manure           │ bio-reactor-mk01         │     1 │ 9x9   │   1.00 │
│ zogna-bacteria          │ incubator-mk01           │     1 │ 5x5   │   0.30 │
│ water-barrel            │ barrel-machine-mk01      │     1 │ 3x3   │   0.20 │
│ electric-boiler-water…  │ py-electric-boiler       │     1 │ 3x3   │  25.00 │
├─────────────────────────┼──────────────────────────┼───────┼───────┼────────┤
│ sap-01                  │ sap-extractor-mk01       │  *80  │ 5x5   │   0.15 │
│ Moss-1                  │ moss-farm-mk01           │  *50  │ 6x6   │   0.10 │
│ log2                    │ fwf-mk01                 │  *17  │ 15x15 │   0.45 │
│ moondrop-1              │ moondrop-greenhouse-mk01 │  *13  │ 9x9   │   0.45 │
│ methane-co2             │ moondrop-greenhouse-mk01 │   *9  │ 9x9   │   0.45 │
│ moondrop-co2            │ moondrop-greenhouse-mk01 │   *3  │ 9x9   │   0.45 │
│ auog-pooping-1          │ auog-paddock-mk01        │  *13  │ 14x14 │   0.50 │
│ seaweed-1               │ seaweed-crop-mk01        │   *4  │ 13x13 │   0.50 │
└─────────────────────────┴──────────────────────────┴───────┴───────┴────────┘
   * module-corrected. Solver base counts: 240 / 795 / 184 / 213 / 153 / 47 / 65 / 40
     multipliers:        3x  /  16x /  11x /  17x /  17x / 17x /  5x /  11x
```

**259 buildings · ~15,710 tiles · 98.0 MW electric** — all drawn; the block generates nothing

**189 buildings and ~12,900 tiles are bio farms.** The natural seam is a **farm block** (sap 80, moss 36,
fwf 18, moondrop 29, auog 7, seaweed 2 — ~11,400 tiles) against a **process block** (~3,400 tiles).
That is two city blocks minimum.

**Inputs** (/s): **water 733.81** (52.33 of it boiled to steam in-block) · **creosote 40.00** ·
**native-flora 5.17** · copper-plate 4.98 · coke 3.91 · tin-plate 1.87 · iron-plate 1.87 ·
lead-plate 1.60 · glass 1.34 · zinc-plate 0.60 · **pbsb-alloy 0.20** · empty-petri-dish 0.14

**Twelve imports**, and no fuel at all — the boiler is electric. The antimony chain is imported whole at `pbsb-alloy`
(§ Why the alloy is not made here); the ammonia surplus is exported (§ The ammonia decision).

**Exports** (/s): **electronic-circuit 1.00** · **ammonia 6.00**

## Intermediate flows

```
┌────────────────┬──────────┬──────────────────────────────────────┬──────────────────────────────────────────────────────┐
│ Item           │ Rate /s  │ Producer                             │ Consumer                                             │
├────────────────┼──────────┼──────────────────────────────────────┼──────────────────────────────────────────────────────┤
│ capacitor1     │    1.00  │ capacitor1                           │ electronic-circuit-2                                 │
│ resistor1      │    1.20  │ resistor1                            │ electronic-circuit-2                                 │
│ inductor1      │    0.60  │ inductor1                            │ electronic-circuit-2                                 │
│ vacuum-tube    │    0.60  │ vacuum-tube                          │ electronic-circuit-2                                 │
│ solder         │    0.40  │ solder-0                             │ electronic-circuit-2                                 │
│ pcb1           │    0.20  │ pcb1                                 │ electronic-circuit-2                                 │
│ battery-mk01   │    0.20  │ battery-mk01                         │ electronic-circuit-2                                 │
│ vacuum         │   25.00  │ vacuum                               │ pcb1 10.00, vacuum-tube 15.00                        │
│ ceramic        │    0.57  │ ceramic                              │ capacitor1 0.33, inductor1 0.24                      │
│ clay           │    1.15  │ clay                                 │ ceramic 1.15                                         │
│ copper-cable   │    2.51  │ copper-cable                         │ inductor1 2.40, small-lamp 0.11                      │
│ graphite       │    1.20  │ graphite                             │ vacuum-tube 0.60, battery-mk01 0.60                  │
│ bolts          │    0.60  │ bolts                                │ battery-mk01 0.60                                    │
│ iron-stick     │    0.60  │ iron-stick                           │ bolts 0.60                                           │
├── formica ─────┼──────────┼──────────────────────────────────────┼──────────────────────────────────────────────────────┤
│ formica        │    0.40  │ formica                              │ pcb1 0.40                                            │
│ saps           │    4.00  │ sap-01                               │ formica 4.00                                         │
│ raw-fiber      │    2.00  │ fiber-01                             │ formica 2.00                                         │
│ treated-wood   │    0.80  │ treated-wood                         │ formica 0.80                                         │
│ methanal       │   20.00  │ methanal                             │ formica 20.00                                        │
│ methane        │   24.00  │ methane-co2                          │ methanal 24.00                                       │
├── wood ────────┼──────────┼──────────────────────────────────────┼──────────────────────────────────────────────────────┤
│ wood           │   11.03  │ log-wood-fast                        │ fiber-01 10.00, treated-wood 0.40,                   │
│                │          │                                      │   wood-seeds 0.34, zogna-bacteria 0.29              │
│ log            │    1.11  │ log2                                 │ log-wood-fast                                        │
│ wood-seedling  │    0.83  │ wood-seedling                        │ log2                                                 │
│ wood-seeds     │    0.28  │ wood-seeds                           │ wood-seedling                                        │
│ moss           │    3.97  │ Moss-1                               │ auog-pooping-1 2.59, wood-seedling 1.39              │
│ muddy-sludge   │   49.67  │ muddy-sludge 48.67 + melamine 1.00   │ Moss-1 49.67                                         │
│ soil           │    4.87  │ soil                                 │ muddy-sludge 4.87                                    │
│ carbon-dioxide │  109.67  │ moondrop-co2 109.07 + melamine 0.60  │ methane-co2 60.00, Moss-1 49.67                      │
│ moondrop-seeds │    0.96  │ moondrop-seeds                       │ methane-co2 0.60, moondrop-1 0.36                    │
│ moondrop       │    0.36  │ moondrop-1                           │ moondrop-seeds   ← closed loop                        │
├── urea ────────┼──────────┼──────────────────────────────────────┼──────────────────────────────────────────────────────┤
│ urea           │    4.27  │ urea-from-liquid-manure              │ urea-decomposition 4.27                              │
│ liquid-manure  │   14.22  │ liquid-manure                        │ urea-from-liquid-manure                              │
│ manure         │    1.42  │ auog-pooping-1                       │ liquid-manure                                        │
│ zogna-bacteria │    1.42  │ zogna-bacteria                       │ urea-from-liquid-manure                              │
│ barrel         │    1.29  │ auog-pooping-1                       │ water-barrel          ← closed loop                   │
│ water-barrel   │    1.29  │ water-barrel                         │ auog-pooping-1                                       │
│ pressured-air  │    3.56  │ pressured-air                        │ zogna-bacteria                                       │
│ petri-dish     │    0.14  │ petri-dish                           │ zogna-bacteria                                       │
│ agar           │    0.14  │ agar                                 │ petri-dish                                           │
│ seaweed        │    0.71  │ seaweed-1                            │ agar                                                 │
│ small-lamp     │    0.07  │ small-lamp                           │ zogna-bacteria                                       │
├── chemistry ───┼──────────┼──────────────────────────────────────┼──────────────────────────────────────────────────────┤
│ cyanic-acid    │    6.40  │ urea-decomposition                   │ battery-mk01 6.00, melamine 0.40     ← closed         │
│ ammonia        │    6.40  │ urea-decomposition                   │ melamine 0.40, **export 6.00**                       │
│ melamine       │    0.40  │ melamine                             │ battery-mk01 0.40                                    │
└────────────────┴──────────┴──────────────────────────────────────┴──────────────────────────────────────────────────────┘
```

**Two loops close on their own.** `moondrop → moondrop-seeds → moondrop` at 0.36/s, and the **barrel
loop** is net zero — `auog-pooping-1` emits 5 barrels per craft and one `barrel-machine` refills exactly
what the paddocks empty, so barrels are a one-time stock, not a resupply.

**Cyanic-acid closes; ammonia does not.** `urea-decomposition` makes both 1:1 at 6.40/s, the cyanic-acid
is fully consumed (battery 6.00 + melamine 0.40) and **6.00 ammonia/s leaves the block**. See
§ The ammonia decision.

## The ammonia decision

`urea-decomposition` emits ammonia and cyanic-acid **1:1**, but demand is **16:1** against it —
`battery-mk01` takes cyanic-acid 30 per battery and no ammonia, and `melamine` is the only 1:1 consumer
at 0.40/s. So the block produces **6.40 ammonia/s against 0.40 wanted**.

**The surplus is pinned at exactly 6.00/s and nothing internal can move it.** With `a` =
urea-decomposition crafts/s and `m` = melamine crafts/s:

```
cyanic-acid:  30a − 20m − 6.00 (battery)  =  0   →   30a − 20m = 6.00
ammonia:      30a − 20m − X               =  0   →   X = 6.00,  for any m
```

More melamine scales both sides together and the gap never closes — it equals the battery's
cyanic-acid draw precisely, because that is the one demand with no matching ammonia.

**`cyanic-acid-01` would close it**, converting ammonia → cyanic-acid (`coal 20 + methane 100 +
ammonia 100 → cyanic-acid 100 + hydrogen 50`). It was in an earlier revision of this design and was
removed deliberately. What it cost and what removing it bought:

| | with `cyanic-acid-01` | **ammonia exported** |
|---|--:|--:|
| **buildings** | 238 | **258** |
| MW | 71.1 | **76.2** |
| urea | 2.27 /s | **4.27 /s** |
| **native-flora** | 2.75 /s | **5.17 /s** |
| moss farms · auog paddocks · seaweed | 36 · 7 · 2 | **50 · 13 · 4** |
| water | 539.79 /s | **681.48 /s** |
| byproducts | tar 1.80 · coal-gas 0.60 · iron-oxide 0.02 · hydrogen 1.50 | **ammonia 6.00** |
| coal import | 0.60 /s | **none** |

Keeping it halves the bio chain, because the 3.00 cyanic-acid/s it returns lets `urea-decomposition`
run at 3.40 instead of 6.40. The reason it is gone is that it needs **`coal`** — a distinct item from
both `raw-coal` (3.0 MJ) and `coke` (5.0 MJ), reachable only via `distilled-raw-coal`, `crushed-coal`
or `coal-gas-from-wood`, each of which emits something. The wood route dragged **tar 1.80 and coal-gas
0.60/s**; `crushed-coal` (raw-coal 3 → crushed-coal 1 + coal 2 + coal-dust) would have been cleaner,
its byproducts being solid fuels the boilers want. **Four small exports and a 14th import were traded
for one large export.**

**The 6.00 ammonia/s has no consumer identified.** There are exactly two unlocked ammonia recipes in
the game, `melamine` and `cyanic-acid-01`, and both are in this block — so this is an export awaiting a
destination, not a routed one. Ammonia is on the never-vent list, so it cannot be disposed of; it needs
a real consumer before the block runs. Recorded as risk 1.

## Why the alloy is not made here

`battery-mk01` needs `pbsb-alloy` 0.20/s. Making it locally means `sb-oxide-01` → `pbsb-alloy` plus the
plastic and oxygen they need. Priced three ways:

| import seam | buildings | extra MW | this chain's imports |
|---|--:|--:|---|
| `sb-grade-04` | 6 | **+30.1** | sb-grade-04 2.00 · aromatics 10.00 · syngas 20.00 |
| `sb-oxide` | 2 | **+20.0** | sb-oxide 0.20 |
| **`pbsb-alloy`** | **0** | **0** | **pbsb-alloy 0.20** |

**The alloy step alone is 20 MW in two `smelter-mk01` at 13×13**, flat out, for 0.20/s — the worst
MW-per-output available. `sb-oxide-01` adds two `bof-mk01`, a `biofactory` and a 10 MW `electrolyzer`
for the oxygen, plus the aromatics and syngas imports. Taking the finished alloy drops all of it and
cuts lead-plate from 2.80 to 1.60/s, since `pbsb-alloy` consumed 6 per craft.

Note for whoever supplies it: `sb-grade-03` emits `sb-grade-04` 5 directly per craft **and**
`sb-grade-04` converts it 5→4, so the grading chain upstream uses both paths, not a linear one.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| **electronic-circuit** | 1.00 | the product | — | — |
| **ammonia** | **6.00** | **export — no consumer identified** | — | `cyanic-acid-01` would close it at +23 buildings and +88 % native-flora (§ The ammonia decision). Not ventable |
| coal-gas | 0.60 | **boiler** (0.12 MJ/s) | shares the bank | venting — not approved, it is a fuel gas |
| iron-oxide | 0.02 | **export** — design 12's territory | 0 | — |

**Steam is boiled in-block** (rule 9). 45.78 steam/s needs 11.30 MJ/s of fuel at `oil-boiler-mk01`
## What the boiler is for

**Process steam, as a recipe ingredient — not power.** Two recipes drink it:

```
clay  [clay-pit-mk01, 4 s]  steam 100             →  clay 3     38.33 steam/s
agar  [hpf,           5 s]  seaweed 5 + steam 100 →  agar 1     14.00 steam/s
                                                                ──────────────
                                                                52.33 steam/s
```

Clay → ceramic → `capacitor1` and `inductor1`; agar → petri-dish → zogna-bacteria → urea. So steam
feeds both halves of the block, **every unit is consumed as an ingredient, and none reaches a
generator.** There are no steam engines here and the block generates no power at all.

```
electric-boiler-water-to-steam  [U] [electric-boiler, 5 s]  water 300  →  steam 300 @250 °C
   py-electric-boiler  3x3 · 25.00 MW · speed 1 · 3 module slots
   52.33 steam/s ÷ 60 per building  =  0.87 fractional  →  1 unit at 87 %, 21.81 MW
```

**One building, 9 tiles, no fuel, no ash, no fourteenth import** — at the cost of **+21.81 MW**, taking
the block from 76.2 to 98.0. That is the trade the guide flags under rule 8: *"Electric boilers (25 MW
rated) dominate peak budget."* Its 3 module slots would take efficiency modules, which are locked.

What it beat:

| | **`py-electric-boiler`** | `oil-boiler-mk01` on acetylene | 7 × solid `boiler` on coke |
|---|--:|--:|--:|
| buildings · tiles | **1 · 9** | 1 · 25 | 7 · 42 |
| MW | **+21.81** | 0 | 0 |
| fuel | none | acetylene 12.91 /s | coke 5.18 /s |
| ash | **0** | 0 | 5.18 /s |
| new import | **none** | acetylene (14th) | — |

Acetylene would be free on power and is noise against design 13's 391.5/s, but adds a fluid line to a
block that otherwise has none. Coke is the worst of the three: the solid `boiler` is **effectivity 1
against the oil boiler's 2**, so it needs double the fuel, seven buildings, and emits 5.18 ash/s.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **ammonia 6.00/s with no consumer** | the only two unlocked consumers are in this block. Not ventable, so it cannot be disposed of — the block cannot run until a destination exists. This is a design-level open item, not an operational one |
| 2 | **creosote 40.00/s** | exceeds the base's ~34/s. Starves `treated-wood` → `formica` → `pcb1` → circuits. **`t ≈ 0.85`** — the binding constraint, and the reason to scale design 10 before building this |
| 3 | **moss 3.97/s feeds two chains** | `auog-pooping-1` takes 2.59 and `wood-seedling` 1.39. A moss outage stops seedlings → logs → wood → formica **and** manure → urea → batteries. Single point of failure for both halves, and now the larger draw is the urea side |
| 4 | **native-flora 5.17/s** | no recipe exists at all — map-placed only. Stops manure → urea → cyanic-acid → batteries |
| 5 | **the barrel loop** | nets to zero, so nothing refills it. One stray inserter drains it and the paddocks stop with no obvious cause — same shape as a catalyst loop |
| 6 | CO₂ 109.67/s | internal and self-balancing (`moondrop-co2` is free and uncapped), but the largest single flow in the block |

`t = min(sink_i / rate_i)` is **undefined until ammonia has a sink** — with none, `t = 0`. Given a
consumer, the **creosote import binds at 0.85** and is the next cap.

## Build notes

- **Never size the bio buildings without modules.** The solver's 1,580 is meaningless; the multipliers
  bring it to 259. `moss-farm-mk01` 16× at 15 slots, `moondrop-greenhouse-mk01` 17× at 16, `fwf-mk01`
  11× at 10, `seaweed-crop-mk01` 11× at 10, `auog-paddock-mk01` 5× at 4, `sap-extractor-mk01` 3× at 2.
- **The module items are the real bootstrap, and two are not self-funding.** `moss` (540), `moondrop`
  (464), `seaweed` (20) and `auog` (28) are all their own product — capital, not barriers. But
  **`sap-tree` ×160** and **`tree-mk01` ×180** each cost a **`planter-box`** = `ash 3 + soil 5 +
  empty-planter-box 1`. That is ~340 planter-boxes, ~1,020 ash and **370 `empty-planter-box`** before
  any farm turns over. Soil and ash are made here; **`empty-planter-box` is the item to check.**
- **The auog bank nearly doubled** to 13 paddocks when `cyanic-acid-01` came out — it is the single
  biggest consequence of exporting the ammonia, at 196 tiles each.
- **`auog-pooping-1`, not `-2`.** Variant 2 is 1.9× the manure per paddock but needs **`auog-food-01`**,
  which wants **`ralesia`** — an entire additional plantation chain. Taking variant 1 costs **+54 %
  native-flora** (2.75 vs 1.78/s) and roughly double the paddocks, to avoid that. Revisit if a ralesia
  farm ever exists.
- **`Moss-1`, not `Moss-2`, and that costs 21 moss farms.** `Moss-2` gives 16 moss per craft against 8
  but needs **stone 20**, and this block has no stone source since the antimony grading is imported
  past. Switching would cut the bank **36 → 15 farms (~756 tiles)** for **~3.53 stone/s** imported —
  worth taking if stone is acceptable, since design 24 exports 1.833/s.
- **Ash must be imported for the bootstrap.** The ~330 planter-boxes want `ash 3` each — roughly
  **990 ash one-time** — and with an electric boiler the block burns nothing and produces none. Capital,
  not a flow, so a few chests off design 12 or 24 covers it, but it is easy to miss: ash appears nowhere
  in the flows. It is capital, not a flow,
  so a few chests off design 12 or 24 covers it, but it is easy to miss now that ash has left the
  export table.
- **Start the farms first** (rule 12). They carry the module bootstrap, which is wall-clock time rather
  than throughput, and 189 of the 259 buildings are in that half.
- `inductor1` over `inductor1-2` — half the copper for one extra building, as in design 14.

## Solver command

Target mode on the end product. **No `--max-import` and no `--fuel` override are needed.** The urea cap
existed only to stop the LP scaling `melamine` for its CO₂ and muddy-sludge byproducts, and with urea
endogenous that incentive is gone; the `--fuel` override existed only for the BOFs, which the alloy
import removed. With no burner machines left, the block has no solid-fuel line except the boilers.

**The solver reports `ammonia: 6.00/1s` as an output.** That is the design intent here, not an
artefact — contrast an earlier revision where the same row appeared because the LP was scaling
`melamine` for its CO₂ and muddy-sludge byproducts. Check the urea rate (4.27/s) to tell them apart: the
artefact ran urea at 6.95.

Bio buildings are specified at mk01 and **must be re-read with the module multipliers above** — the
solver has no model of bio modules.

```bash
npx tsx src/cli.ts solve \
  --recipes "electronic-circuit-2,capacitor1,inductor1,resistor1,pcb1,vacuum-tube,solder-0,copper-cable,bolts,iron-stick,ceramic,clay,graphite,vacuum,formica,treated-wood,fiber-01,methanal,battery-mk01,melamine,urea-decomposition,methane-co2,moondrop-co2,moondrop-1,moondrop-seeds,sap-01,log2,wood-seedling,wood-seeds,log-wood-fast,Moss-1,soil,muddy-sludge,urea-from-liquid-manure,liquid-manure,auog-pooping-1,zogna-bacteria,petri-dish,agar,seaweed-1,water-barrel,small-lamp,pressured-air" \
  --target "electronic-circuit:1" --time 1 \
  --factory "electronic-circuit-2:chipshooter-mk01" \
  --factory "capacitor1:electronics-factory-mk01" \
  --factory "inductor1:electronics-factory-mk01" \
  --factory "resistor1:electronics-factory-mk01" \
  --factory "vacuum-tube:electronics-factory-mk01" \
  --factory "pcb1:pcb-factory-mk01" \
  --factory "solder-0:automated-factory-mk01" \
  --factory "copper-cable:automated-factory-mk01" \
  --factory "bolts:automated-factory-mk01" \
  --factory "iron-stick:automated-factory-mk01" \
  --factory "small-lamp:automated-factory-mk01" \
  --factory "petri-dish:automated-factory-mk01" \
  --factory "wood-seeds:automated-factory-mk01" \
  --factory "ceramic:hpf" \
  --factory "graphite:hpf" \
  --factory "methanal:hpf" \
  --factory "agar:hpf" \
  --factory "clay:clay-pit-mk01" \
  --factory "vacuum:vacuum-pump-mk01" \
  --factory "pressured-air:vacuum-pump-mk01" \
  --factory "formica:pulp-mill-mk01" \
  --factory "treated-wood:tar-processing-unit" \
  --factory "fiber-01:wpu-mk01" \
  --factory "log-wood-fast:wpu-mk01" \
  --factory "battery-mk01:chemical-plant-mk01" \
  --factory "melamine:fbreactor-mk01" \
  --factory "urea-decomposition:distilator" \
  --factory "methane-co2:moondrop-greenhouse-mk01" \
  --factory "moondrop-co2:moondrop-greenhouse-mk01" \
  --factory "moondrop-1:moondrop-greenhouse-mk01" \
  --factory "moondrop-seeds:botanical-nursery" \
  --factory "wood-seedling:botanical-nursery" \
  --factory "sap-01:sap-extractor-mk01" \
  --factory "log2:fwf-mk01" \
  --factory "Moss-1:moss-farm-mk01" \
  --factory "soil:soil-extractor-mk01" \
  --factory "muddy-sludge:washer" \
  --factory "urea-from-liquid-manure:bio-reactor-mk01" \
  --factory "liquid-manure:bio-reactor-mk01" \
  --factory "auog-pooping-1:auog-paddock-mk01" \
  --factory "zogna-bacteria:incubator-mk01" \
  --factory "seaweed-1:seaweed-crop-mk01" \
  --factory "water-barrel:barrel-machine-mk01" \
  --solver simplex \
  --unlocked
```

It emits one long cycle warning spanning the wood/moss/CO₂/urea/barrel web plus
`moondrop-seeds ↔ moondrop`. **Both are intentional** and the solver zeroes them correctly; do not add
the suggested excludes, which would break the loops the design depends on.

`log3` would halve the FWF bank (40 s and 6 logs against 60 s and 4) for **ash ~5/s** on top of the
bootstrap demand — ~9 buildings and ~2,000 tiles saved if the ash supply is comfortable.

## Build materials

Distinct construction materials across this block's 17 building types, separate from flow imports.
Union of each building's own recipe, recursing into building ingredients:

`aluminium-plate` · `boiler` · `burner-inserter` · `burner-mining-drill` · `concrete` · `copper-cable` ·
`copper-plate` · `distilator` · `electronic-circuit` · `electronics-factory-mk01` · `engine-unit` ·
`fluid-drill-mk01` · `gasifier` · `gearbox-mk01` · `glass` · `inductor1` · `inserter` ·
`intermetallics` · `iron-plate` · `lab` · `log` · `pcb1` · `pipe` · `pump` · `shaft-mk01` ·
`small-parts-01` · `steam-engine` · `steel-furnace` · `steel-plate` · `stone-brick` · `stone-furnace` ·
`tar-processing-unit` · `wood`

The items to check first are **`empty-planter-box`** (×370 for the bio modules — not a flow import and
not produced by any recipe in this block) and **`tar-processing-unit`**, which `electrolyzer-mk01`
consumes as a component as well as standing as the `treated-wood` machine. `auog-paddock-mk01` also
costs `stone 100 + soil 300` each, which is 700 stone and 2,100 soil for seven — soil is made here,
stone is not. Inferred from the recipe graph, not from save state.
