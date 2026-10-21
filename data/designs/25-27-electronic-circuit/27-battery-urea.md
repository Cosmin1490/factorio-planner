# 27 — Battery + urea + melamine — 0.20 battery-mk01/s + 1.60 melamine/s, 72 buildings

The cascade half of the circuit chain. `battery-mk01` takes **cyanic-acid 30 per battery**, and that
30:1 ratio drags in the whole urea → manure → auog → native-flora chain — **45 of the 72 buildings are
a bio annex.** Feeds design 26 with batteries and design 25 with melamine and urea.

```
battery-mk01        [U] [chemistry,  10 s]  pbsb-alloy 1 + melamine 2 + graphite 3 + bolts 3
                                            + glass 1 + zinc-plate 3 + cyanic-acid 30  →  1
urea-decomposition  [U] [distilator,  8 s]  urea 20  →  ammonia 30 + cyanic-acid 30
melamine            [U] [fbreactor,  10 s]  water 200 + cyanic-acid 20 + ammonia 20
                                                     →  melamine 20 + CO₂ 30 + muddy-sludge 50
auog-pooping-2      [U] [auog,       80 s]  water-barrel 5 + native-flora 20 + moss 10
                                            + auog-food-01 3  →  barrel 5 + manure (5-12)
```

**`urea-decomposition` is the only unlocked source of ammonia or cyanic-acid in the game.** Nine other
ammonia recipes exist; all nine are locked. There is no bypass around
`urea → liquid-manure → manure → auog paddocks`.

> **Two operating modes, one blueprint, switchable at runtime.** **Full mode** runs `auog-pooping-2` and
> needs `auog-food-01` 0.68/s from [design 28](../28-auog-food.md) → **1.0 electronic-circuit/s**.
> **Throttled mode** runs `auog-pooping-1` in the same nine paddocks with no food at all → **0.518
> circuit/s**. Both are the same machine and the same recipe category, so **a circuit-controlled recipe
> swap picks the mode from food and ammonia buffer levels** — the block degrades to 52 % instead of
> stalling, and halves its ammonia rate while it does. See § Interim mode and § Control scheme.

## Block boundary

| class | items |
|---|---|
| **export — to design 26** | **battery-mk01** 0.20/s |
| **export — to design 25** | **melamine** 1.60/s · **urea** 0.40/s |
| **export — external** | **ammonia** 6.00/s — *no consumer identified* |
| **import — whitelisted** | coke, copper-plate, iron-plate, glass, zinc-plate, water |
| **import — asked and approved** | **pbsb-alloy**, **native-flora**, **auog-food-01** |
| **import — boundary inherited from design 15** | **empty-petri-dish** 0.19/s |
| **made in-block** | cyanic-acid, ammonia, melamine, graphite, bolts, iron-stick, small-lamp, copper-cable · the whole urea chain: manure, liquid-manure, zogna-bacteria, petri-dish, agar, seaweed, urea · moss, muddy-sludge, soil, CO₂, wood, steam, pressured-air |
| **byproduct-exclude** | none |

## The auog food decision

`auog-pooping-2` is **1.93× the manure per paddock** (avg 8.5 per 80 s against variant 1's 5.5 per 100 s)
and **−19 % native-flora per manure**. Both variants are unlocked; the only difference is that variant 2
needs `auog-food-01 3` per craft. **The food is imported, not made here.**

That choice is the whole argument, because the food chain is large and the paddock saving is not:

| | `auog-pooping-1` | `-2`, **food imported** | `-2`, food made in-block |
|---|--:|--:|--:|
| **paddocks** | 18 | **9** | 9 |
| **total buildings** | 99 | **72** | 105 |
| tiles | ~7,678 | **~5,221** | ~8,440 |
| **MW at load** | 37.12 | **30.65** | 64.9 |
| **native-flora** | 6.95 /s | **4.50 /s** | 4.50 /s |
| water | 483.27 /s | **360.64 /s** | 583 /s |
| **`auog` modules** | 72 | **36** | 36 |
| new imports | — | **auog-food-01 0.68/s** | aromatics 22.5 · syngas 45.0 |

**Making the food on site costs 33 buildings and doubles the power.** `auog-food-01` is
`native-flora 5 + ralesia 5 + moss 5 + seaweed 3 + plastic-bar 2 + steam 100 → 3`, and at 0.68/s that is
**29 `ralesia-plantation-mk01`**, 2 `electrolyzer-mk01` for ralesia's hydrogen (11.25 MW), a
`py-electric-boiler` for the food's steam (9.38 MW), and `aromatics-to-plastic` — the only unlocked
plastic route — at `aromatics 50 + syngas 100 → plastic-bar 1`, i.e. 67 fluid units/s for 0.45
plastic-bar/s.

> **Importing moves the ralesia chain, it does not delete it.** The reason it is still the right call:
> **`auog-food-01` is shared infrastructure.** It feeds `auog-pooping-2/3`, `auog-maturing-2` through
> `-5`, and `auog-recharge-0` — so one food block serves every auog consumer in the base, where building
> it here serves exactly one. That is the Tier B boundary argument (rule 16), not a cost being hidden.
>
> **The supplier is [design 28](../28-auog-food.md) — 1.50 food/s, 126 buildings, 91.28 MW.** It is
> sized by an aromatics budget of 50/s rather than by this block's demand, so it covers the 0.68/s here
> **2.2×** with 0.82/s spare. Sized to this block alone it would be ~57 buildings, which is the number to
> compare against the 33 that making the food in-block would cost — **the sharing is the entire
> argument**, and it only pays once a second auog consumer exists.

**`ralesia` is self-funding** — `ralesia-plantation-mk01` takes `ralesia` as its own module (12 slots,
13×, reaching speed 1.00) and `ralesia-seeds` closes the loop at `ralesia 5 → seeds 8`. Whoever builds
the food block pays soil, hydrogen and plastic, not a module bootstrap.

## Interim mode — `auog-pooping-1` in the `-2` blueprint

**Build the blueprint below as drawn, but run `auog-pooping-1` in the nine paddocks until the food
exists.** The complex then produces **0.518 electronic-circuit/s** instead of 1.0, and needs no
`auog-food-01` at all — which takes [design 28](../28-auog-food.md) off the critical path entirely.

| per paddock | avg manure | craft | @ speed 2.0 |
|---|--:|--:|--:|
| `auog-pooping-2` | 8.5 | 80 s | **0.2125 /s** |
| `auog-pooping-1` | 5.5 | 100 s | **0.1100 /s** |

Nine paddocks × 0.11 = **manure 0.99/s** against this design's 1.911/s → **51.8 %**, and that factor
carries unchanged to the end:

```
manure 0.99  →  urea 2.97  →  cyanic-acid 4.14  →  battery-mk01 0.104 ┐
                                 →  melamine 1.04  →  formica 0.207 ┴→  0.518 circuit/s
```

| | full (`-2` + food) | **interim (`-1`)** |
|---|--:|--:|
| electronic-circuit | 1.000 /s | **0.518 /s** |
| **auog-food-01** | 0.68 /s | **none** |
| native-flora | 4.50 /s | **3.60 /s** |
| moss | 2.31 /s | 1.80 /s — **22.5 of 29 farms busy** |
| **ammonia accumulating** | 6.00 /s | **3.11 /s** |
| complex MW at load | 73.48 | **~41** *(derived, not solved)* |

### Four things about it that are not obvious

**1. Nothing mismatches, because both of design 26's inputs scale together.** Formica arrives at 0.207
of 0.40 and battery at 0.104 of 0.20 — both exactly 51.8 %, since both trace to the same manure. Circuits
come out at 0.518/s rather than being throttled to the lower of two unequal fractions.

**2. The moss bank gains headroom rather than losing it.** `auog-pooping-1` needs **more** moss per
manure (10/5.5 = 1.82 against `-2`'s 10/8.5 = 1.18), so the instinct is that moss gets tight. It does
not: you are making 48 % less manure, so demand falls to 1.80/s against the 2.31/s the 29 farms supply —
**21 % slack**. Nothing in the blueprint is undersized for interim mode.

**3. The four 100 %-load rows are only at 100 % in full mode.** `battery-mk01`, `melamine`, `Moss-1` and
the paddocks all sit at ~52 % in interim, so **the capacity pads in § Capacity pads can be deferred until
the switch.** The paddocks are the single exception — they are the deliberate throttle and run flat out,
which is exactly what a throttle should look like.

**4. The ammonia clock halves.** 3.11/s instead of 6.00/s means the surplus accumulates at half the rate,
roughly doubling the time before `t = 0` bites. Interim mode is therefore *also* a way to buy time on the
one unresolved byproduct in the complex.

### Control scheme — the modes are switchable, not sequential

**Do not treat interim as a phase you leave.** Both recipes run in the same machine, so the mode can be
a *control decision* rather than a build decision, and the block becomes self-adapting:

| condition | recipe | circuits | **ammonia** |
|---|---|--:|--:|
| food buffer high **and** ammonia buffer has room | **`auog-pooping-2`** | 1.000 /s | 6.00 /s |
| otherwise | **`auog-pooping-1`** | 0.518 /s | **3.11 /s** |

**This is mechanically available**, not a wish: `auog-paddock-mk01` is `type: assembling-machine` with
**no `fixed_recipe`**, both variants are category **`auog`**, and the prototype dump carries `qualities`
(normal…legendary) — so this is Factorio 2.0, where *Set recipe* is a circuit control behaviour on
assembling machines. One decider, one signal, nine paddocks. *(Version inferred from the dump, not
verified in-save.)*

**Switching on ammonia as well as food is the part that earns its keep.** It makes the block govern the
complex's one unresolved byproduct: **`-1` halves the ammonia sink you need**, and roughly doubles
time-to-full. That does not solve the surplus — 3.11/s still accumulates — but it converts `t = 0` from
a hard gate into *"the complex runs at 52 % when ammonia backs up."* Same discipline as design 23's COG
buffer: the **producer throttles** rather than the byproduct being dumped.

**The deadband is a sizing calculation, not a tuning hunt.** The trap is real — swapping recipe **ejects
in-progress ingredients**, and at 80–100 s craft times a paddock thrashing across the threshold produces
almost nothing. But `auog-food-01` is **stack 100**, so one wagon is 4,000 units = **98 minutes** at
0.68/s. Switch up at ~80 % of a wagon-scale chest bank and down at ~20 % and the band is **~59 minutes
against an 80–100 s craft** — oscillation is not physically reachable at that ratio. A one-craft dwell
timer is belt-and-braces, not a requirement.

**Nothing downstream needs tuning.** The entire chain below the paddocks follows whatever manure rate
arrives — no thresholds, no second loop, no rebalancing. The switched paddocks are the only controlled
element in the block.

### Why run it this way rather than building 18 paddocks

Eighteen paddocks on `auog-pooping-1` would give the full 1.0 circuit/s immediately — at **+27
buildings, 72 `auog` modules instead of 36 (6.0 h of chamber time rather than 3.0), and nine paddocks to
decommission later.** Interim mode trades 0.482 circuit/s during the bootstrap for none of that.

**The payback is about an hour of runtime.** Design 28 costs **1,695 electronic-circuit** to build; at
0.518/s that is **~55 minutes**, after which the paddocks switch recipe in place — same buildings, same
36 modules, no rework — and the complex steps to 1.0/s.

## Recipe table

Bio counts are **module-corrected**; the solver reports base crafting speed, a 5–17× error here.
**Divide the solver count by the multiplier** — that is correct whatever absolute speed the building
lands on, since `machines = solver_count × base_speed ÷ actual_speed` and `actual = base × multiplier`.

> **`auog-paddock-mk01` reaches effective speed 2.0, not 1.0** (base 0.400 × 5) — it is the only bio
> building here that does not land on exactly 1.0: moss-farm 0.0625 × 16, moondrop-greenhouse
> 0.0588 × 17, seaweed-crop and fwf 0.0909 × 11, ralesia-plantation 0.0769 × 13. Solver-reference
> § Bio module system has this right and uses the paddock as its worked example; **an earlier revision of
> this file said "all reaching effective speed 1.0", which is where the error was.** The counts are
> unaffected — they divide by the multiplier — but sizing paddocks as `crafts/s × craft_time` on an
> assumed 1.0 gives a **2× overbuild.**

```
┌──────────────────────────┬──────────────────────────┬──────┬───────┬───────┬─────────┐
│ Recipe                   │ Factory                  │ Cnt  │ Size  │ Load  │ MW load │
├──────────────────────────┼──────────────────────────┼──────┼───────┼───────┼─────────┤
│ battery-mk01             │ chemical-plant-mk01      │   2  │ 9x9   │ 100 % │   2.000 │
│ melamine                 │ fbreactor-mk01           │   1  │ 5x5   │ 100 % │   0.500 │
│ urea-decomposition       │ distilator               │   3  │ 8x8   │  71 % │   1.067 │
│ urea-from-liquid-manure  │ bio-reactor-mk01         │   2  │ 7x7   │  77 % │   0.612 │
│ liquid-manure            │ bio-reactor-mk01         │   2  │ 7x7   │  77 % │   0.612 │
│ zogna-bacteria           │ incubator-mk01           │   1  │ 7x7   │  48 % │   0.287 │
│ petri-dish               │ automated-factory-mk01   │   1  │ 7x7   │  96 % │   1.914 │
│ agar                     │ hpf                      │   1  │ 7x7   │  96 % │   1.914 │
│ graphite                 │ hpf                      │   1  │ 7x7   │  90 % │   1.802 │
│ bolts                    │ automated-factory-mk01   │   1  │ 7x7   │   6 % │   0.122 │
│ iron-stick               │ automated-factory-mk01   │   1  │ 7x7   │  15 % │   0.302 │
│ small-lamp               │ automated-factory-mk01   │   1  │ 7x7   │   6 % │   0.116 │
│ copper-cable             │ automated-factory-mk01   │   1  │ 7x7   │   9 % │   0.174 │
│ wood-seeds               │ automated-factory-mk01   │   1  │ 7x7   │   2 % │   0.034 │
│ water-barrel             │ barrel-machine-mk01      │   1  │ 3x3   │  45 % │   0.090 │
│ muddy-sludge             │ washer                   │   1  │ 6x6   │  96 % │   0.382 │
│ soil                     │ soil-extractor-mk01      │   2  │ 7x7   │  60 % │   0.478 │
│ pressured-air            │ vacuum-pump-mk01         │   1  │ 3x3   │   3 % │   0.025 │
│ log-wood-fast            │ wpu-mk01                 │   1  │ 6x6   │   1 % │   0.007 │
│ wood-seedling            │ botanical-nursery        │   1  │ 7x7   │  25 % │   0.031 │
│ electric-boiler-water-…  │ py-electric-boiler       │   1  │ 3x3   │  32 % │   8.025 │
├──────────────────────────┼──────────────────────────┼──────┼───────┼───────┼─────────┤
│ Moss-1                   │ moss-farm-mk01           │ *29  │ 6x6   │ 100 % │   2.888 │
│ auog-pooping-2           │ auog-paddock-mk01        │  *9  │ 14x14 │ 100 % │   4.497 │
│ seaweed-1                │ seaweed-crop-mk01        │  *5  │ 13x13 │  96 % │   2.150 │
│ log2                     │ fwf-mk01                 │  *1  │ 15x15 │  74 % │   0.333 │
│ moondrop-co2             │ moondrop-greenhouse-mk01 │  *1  │ 9x9   │  65 % │   0.291 │
└──────────────────────────┴──────────────────────────┴──────┴───────┴───────┴─────────┘
   * module-corrected. Solver base counts: 462 / 45 / 53 / 8 / 11
     multipliers:                           16x /  5x / 11x /11x /17x
```

**72 buildings · ~5,221 tiles · 30.65 MW at load · 60.78 MW rated**

**45 buildings and ~3,959 tiles (76 % of the area) are the bio annex** — 29 moss-farm, 9 auog-paddock,
5 seaweed-crop, 1 fwf, 1 moondrop-greenhouse. The 27 process buildings are the chemistry.

**At 5,221 tiles this is now borderline for a single stamp**, against 7,678 under variant 1 which
definitely needed two (rule 20 / phase 8). If you do split it, the seam is `moss` and `water-barrel` —
one solid and one barrelled fluid.

**Inputs** (/s): water 360.64 · **native-flora 4.50** · coke 1.50 · **auog-food-01 0.68** ·
zinc-plate 0.60 · iron-plate 0.38 · glass 0.36 · copper-plate 0.19 · **pbsb-alloy 0.20** ·
empty-petri-dish 0.19

**Exports** (/s): **battery-mk01 0.20** → 26 · **melamine 1.60** → 25 · **urea 0.40** → 25 ·
**ammonia 6.00** → *no destination*

## Intermediate flows

```
┌────────────────┬──────────┬───────────────────────────────┬──────────────────────────────────────────┐
│ Item           │ Rate /s  │ Producer                      │ Consumer                                 │
├────────────────┼──────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ cyanic-acid    │    8.00  │ urea-decomposition            │ battery-mk01 6.00, melamine 2.00 ← closed│
│ ammonia        │    8.00  │ urea-decomposition            │ melamine 2.00, **export 6.00**           │
│ melamine       │    2.00  │ melamine                      │ battery-mk01 0.40, **export 1.60**       │
│ graphite       │    0.60  │ graphite                      │ battery-mk01                             │
│ bolts          │    0.60  │ bolts                         │ battery-mk01                             │
│ iron-stick     │    0.60  │ iron-stick                    │ bolts                                    │
├── urea ────────┼──────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ urea           │    5.73  │ urea-from-liquid-manure       │ urea-decomposition 5.33, **export 0.40** │
│ liquid-manure  │   19.11  │ liquid-manure                 │ urea-from-liquid-manure                  │
│ manure         │    1.91  │ auog-pooping-2                │ liquid-manure                            │
│ zogna-bacteria │    1.91  │ zogna-bacteria                │ urea-from-liquid-manure                  │
│ barrel         │    1.13  │ auog-pooping-2                │ water-barrel       ← closed loop          │
│ water-barrel   │    1.13  │ water-barrel                  │ auog-pooping-2                           │
│ pressured-air  │    4.78  │ pressured-air                 │ zogna-bacteria                           │
│ petri-dish     │    0.19  │ petri-dish                    │ zogna-bacteria                           │
│ agar           │    0.19  │ agar                          │ petri-dish                               │
│ seaweed        │    0.96  │ seaweed-1                     │ agar                                     │
│ steam          │   19.26  │ electric-boiler-water-to-steam│ agar                                     │
│ small-lamp     │    0.11  │ small-lamp                    │ zogna-bacteria                           │
│ copper-cable   │    0.32  │ copper-cable                  │ small-lamp                               │
├── moss ────────┼──────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ moss           │    2.31  │ Moss-1                        │ auog-pooping-2 2.25, wood-seedling 0.06  │
│ muddy-sludge   │   28.88  │ muddy-sludge 23.88            │ Moss-1 28.88                             │
│                │          │ + melamine 5.00               │                                          │
│ carbon-dioxide │   28.88  │ moondrop-co2 25.88            │ Moss-1 28.88                             │
│                │          │ + melamine 3.00               │                                          │
│ soil           │    2.39  │ soil                          │ muddy-sludge                             │
│ wood           │    0.49  │ log-wood-fast                 │ zogna-bacteria 0.48, wood-seeds 0.01     │
│ log            │    0.05  │ log2                          │ log-wood-fast                            │
│ wood-seedling  │    0.04  │ wood-seedling                 │ log2               ← closed loop          │
└────────────────┴──────────┴───────────────────────────────┴──────────────────────────────────────────┘
```

**`melamine`'s byproducts now cover a much larger share.** At 2.00 melamine/s it emits **CO₂ 3.00/s and
muddy-sludge 5.00/s**, both straight into the moss bank — and because the bank shrank 45 → 29 farms,
that is now **10 % of the CO₂ and 17 % of the sludge** rather than 7 % and 11 %. One `moondrop-co2`
greenhouse at 65 % covers the rest; variant 1 needed two.

**The barrel loop is net zero** on barrels but not on water — `water-barrel` pulls **56.38 water/s** to
refill what the paddocks drink, down from 87.12 with nine fewer paddocks. Barrels are a one-time stock.

## Where the water goes

360.64/s, down from 483.27 — and still not the chemistry:

| consumer | /s | share |
|---|--:|--:|
| **`soil`** (soil-extractor, 800 per craft) | **119.50** | **33 %** |
| `liquid-manure` | 95.63 | 27 % |
| `water-barrel` → paddocks | 56.38 | 16 % |
| `muddy-sludge` | 23.90 | 7 % |
| `melamine` | 20.00 | 6 % |
| `electric-boiler` → `agar` steam | 19.26 | 5 % |
| `seaweed-1` | 19.11 | 5 % |
| `log2` · `wood-seedling` | 7.41 | 2 % |

**`soil` + `muddy-sludge` = 143.40/s — 40 % of the block's water still feeds the moss bank** (was 49 %).
See § Build notes for the recipe that would delete it entirely.

## The ammonia decision

`urea-decomposition` emits ammonia and cyanic-acid **1:1**, but `battery-mk01` takes cyanic-acid 30 and
**no ammonia**, while `melamine` is the only 1:1 consumer. So the block makes **8.00 ammonia/s against
2.00 wanted**.

**The surplus is pinned at exactly 6.00/s and nothing internal can move it.** With `a` =
urea-decomposition crafts/s and `m` = melamine crafts/s:

```
cyanic-acid:  30a − 20m − 6.00 (battery)  =  0   →   30a − 20m = 6.00
ammonia:      30a − 20m − X               =  0   →   X = 6.00,  for any m
```

**Design 25's melamine demand tested this and it held.** Going 0.40 → 2.00/s raises both sides together:
more melamine consumes more ammonia *and* needs exactly as much more `urea-decomposition` to make the
cyanic-acid it pairs with. The gap equals the battery's cyanic-acid draw precisely, because that is the
one demand with no matching ammonia. **The paddock swap did not move it either** — it changes how the
manure is made, not the urea:cyanic:ammonia stoichiometry above it. **This is also why the block split
lands at battery rather than at cyanic-acid** — the surplus belongs in the same block as the demand that
creates it.

**`cyanic-acid-01` would close it** (`coal 20 + methane 100 + ammonia 100 → cyanic-acid 100 +
hydrogen 50`), and was in an earlier revision. It was removed because it needs **`coal`** — a distinct
item from both `raw-coal` (3.0 MJ) and `coke` (5.0 MJ), reachable only through `distilled-raw-coal`,
`crushed-coal` or `coal-gas-from-wood`, each of which emits something. Of those, `crushed-coal`
(`raw-coal 3 → crushed-coal 1 + coal 2 + coal-dust`) is the cleanest, since its byproducts are solid
fuels. Four small byproducts and one extra import were traded for one large export.

> **The 6.00 ammonia/s has no consumer identified.** There are exactly two unlocked ammonia recipes in
> the game — `melamine` and `cyanic-acid-01` — and both are inside this block. All 42 locked ammonia
> consumers sit behind chemical science or worse. Ammonia is on the never-vent list, so it cannot be
> disposed of either. This is an export awaiting a destination, not a routed one. Recorded as risk 1,
> and it makes **`t = 0` for designs 25, 26 and 27 all three** — 25 now depends on this block too.

## Where the CO₂ comes from

`Moss-1` needs **CO₂ 28.88/s**; `melamine` contributes 3.00 and `moondrop-co2` makes the other 25.88
from nothing at all:

```
moondrop-co2  [U] [moon, 5 s]  (no ingredients)  →  carbon-dioxide 200
```

**One `moondrop-greenhouse-mk01` at 65 %** — 0.29 MW, 81 tiles, zero inputs. The catch is 16 `moondrop`
modules to reach effective speed 1.0, and this block runs no moondrop chain.

**That is a one-time transfer of 16 modules from design 25, not a dependency** — halved from 32, since
the smaller moss bank needs one greenhouse rather than two. Design 25 runs `moondrop-1` and
`moondrop-seeds` as a closed breeding loop for its methane, so 16 units is a brief surplus off its
nursery, and the creature-chamber codex that starts the loop is a once-per-base cost design 25 has
already paid. It crosses at build time and never again.

The alternative was `coke-co2` (`coke 2 → CO₂ 80`): at 25.88 CO₂/s that is **3 hpf, coke 0.65/s,
3.23 MW**, destroying 3.24 MJ/s of fuel value to avoid borrowing 16 modules from next door. Rejected —
it priced a once-paid bootstrap as though it had to be paid per block.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| **battery-mk01** | 0.20 | **design 26** `electronic-circuit-2` — stack 100, 21 consumers overall (11 unlocked) | — | it is a Tier B bus item; other consumers will want it |
| **melamine** | 1.60 | **design 25** `melamine-resin` → `formica-2` — solid, stack 100 | — | design 25's route 1 needed none, at +122 buildings |
| **urea** | 0.40 | **design 25** `melamine-resin` — solid, stack 100 | — | making it in 25 would mean a second urea chain, i.e. a second bio annex |
| **ammonia** | **6.00** | **export — no consumer identified** | — | `cyanic-acid-01` would close it at the cost of a `coal` import. Not ventable |

## Bio modules

| building | ×count | module | needed | self-funding? |
|---|--:|---|--:|---|
| `moss-farm-mk01` | 29 | `moss` 15 | **435** | **yes** — `Moss-1` is its own product |
| `seaweed-crop-mk01` | 5 | `seaweed` 10 | **50** | **yes** — `seaweed-1` runs here |
| **`auog-paddock-mk01`** | **9** | `auog` 4 | **36** | **no** |
| `moondrop-greenhouse-mk01` | 1 | `moondrop` 16 | **16** | **one-time from design 25** |
| `fwf-mk01` | 1 | `tree-mk01` 10 | **10** | needs **10 planter-boxes** |

**`auog` ×36 is still the long pole, but it halved.** The only traceable route is `auog`
[creature-chamber, 300 s] from a codex plus samples, at **1 per run** — so 36 modules is **~3.0 hours**
of chamber time (was 6.0 at 72 under variant 1), and the paddocks run at 1/5 speed until it finishes.
**Start this before anything else in the complex** — design 25 waits on design 27 for melamine and urea,
and 26 waits on both.

> **`auog-recharge-0` may now be viable and would end the codex bootstrap entirely** —
> `[bay, 5 s] auog-food-01 1 + used-auog 1 + moss 5 → auog 1`, i.e. 5 seconds against 300. Two of its
> three ingredients are now on hand (the food is imported, the moss is made here). **`used-auog` has no
> recipe anywhere in the export**, so it is script-driven like the digosaurus ore and cannot be sized
> from prototype data — presumably what a paddock returns when a module is spent. **Check in game.** If
> the paddocks do return `used-auog`, the module bank becomes renewable and the 3-hour bootstrap becomes
> a one-time seed of a handful.

`tree` [nursery, 30 s] is `planter-box 1 + wood-seedling 3 → tree-mk01 1`, so the ten modules need
**10 planter-boxes**: `ash 30 + soil 50 + empty-planter-box 10`, and `empty-planter-box` is
`stone-brick 40 + wood 20 + iron-plate 10`. Soil and wood are made here; **ash and stone-brick are
one-time imports** appearing nowhere in the flows.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **ammonia 6.00/s with no consumer** | both unlocked consumers are in this block and it is not ventable, so it cannot be disposed of. **`t = 0` until a destination exists** — a design-level open item, not an operational one, and it gates designs 25 and 26 too |
| 2 | **auog-food-01 0.68/s — supplied by [design 28](../28-auog-food.md)** | **Mitigated by the control scheme**: a food outage drops the paddocks to `auog-pooping-1` and the complex to 52 % rather than stopping. Without the recipe swap this would be the block's only no-fallback import, since design 28 is 126 buildings gated on **aromatics 50/s and a lakeside site**. **Wire the switch before relying on the food** |
| 3 | **moss 2.31/s** | 2.25 feeds `auog-pooping-2` → manure → urea → cyanic-acid → batteries **and** melamine → design 25's formica. A moss outage stops two blocks, and with 29 farms at 100 s per craft recovery is slow |
| 4 | **native-flora 4.50/s** | no recipe exists at all — map-placed only. Same cascade as moss, one step earlier. `flora-collector-mk01` mines it at 1.0/s, so **5 collectors**, map permitting |
| 5 | **the barrel loop** | nets to zero, so nothing refills it. One stray inserter drains it and the paddocks stop with no obvious cause |
| 6 | **`Moss-1`, `auog-pooping-2`, `battery-mk01`, `melamine` all at 100 %** | four rows with zero headroom; see § Capacity pads |
| 7 | coke 1.50/s | feeds `graphite` only; throttles the battery rather than stalling it |
| 8 | the auog module bootstrap | a schedule risk, not a flow one — 36 codex runs at 300 s each is ~3.0 h before the paddocks reach full speed |

**Importing the food raised a risk as well as lowering a count.** Under `auog-pooping-1` the paddocks
needed only native-flora and moss, both of which degrade gracefully; variant 2 adds a hard external
dependency with no fallback short of rebuilding nine paddocks into eighteen.

## Capacity pads

| recipe | solver | placed | load | why pad |
|---|--:|--:|--:|---|
| **`battery-mk01`** | 2.000 | 2 | **100 %** | exactly saturated — a third chemical-plant at ~0 % is 81 tiles and covers science's 0.025 bat/s later |
| **`melamine`** | 1.000 | 1 | **100 %** | exactly saturated, and it now feeds design 25. 25 tiles for a second `fbreactor-mk01` |
| **`Moss-1`** | 28.875 | 29 | **100 %** | no rounding slack left at all. A 30th farm is 36 tiles and 0.10 MW — **cheapest pad in the block** |
| **`auog-pooping-2`** | 8.994 | 9 | **100 %** | **196 tiles and 4 more `auog` modules** — 20 more minutes of chamber time. The expensive pad; leave it |
| `muddy-sludge` · `petri-dish` · `agar` | 0.956 · 0.957 | 1 each | 96 % | 36–49 tiles each |

**Variant 2 is tighter than variant 1 everywhere.** Halving the paddocks also halved the rounding slack
that used to pad the moss bank — `Moss-1` went from 44.205 (45 placed, 98 %) to 28.875 (29 placed,
100 %). **Pad the moss farm and the two chemistry outputs; skip the paddocks.**

## Build notes

- **`auog-pooping-2` with imported food** — see § The auog food decision for the three-way comparison.
  Reverting to `auog-pooping-1` costs 27 buildings and 2.45 native-flora/s but removes the block's only
  no-fallback import.
- **Never size the bio buildings without modules.** The three runs sum to **~594 fractional machines**
  before correction; the multipliers bring the block to 72. `moss-farm-mk01` 16× at 15 slots,
  `auog-paddock-mk01` 5× at 4, `seaweed-crop-mk01` 11× at 10, `moondrop-greenhouse-mk01` 17× at 16,
  `fwf-mk01` 11× at 10.
- **Unexamined, and still the largest lever: `Moss-1-without-sludge-for-real`** — `[moss, 100 s]
  carbon-dioxide 100 → moss 8`, **identical yield to `Moss-1` with no muddy-sludge at all.** That
  deletes 1 washer and 2 soil-extractors (**3 buildings, 134 tiles**) and **143.40 water/s — 40 % of
  this block's water.** The catch: `melamine`'s muddy-sludge 5.00/s would lose its only sink, and
  `moondrop-co2` would have to cover the 3.00 CO₂/s melamine currently contributes. Not applied — a
  recipe swap outside this revision's scope, but it should be the next thing examined.
- **Unexamined: `seaweed-1-dry`** — `[seaweed, 50 s] → seaweed 10`, same yield as `seaweed-1` with **no
  water**. Removes 19.11 water/s for zero cost if the dry variant has no hidden requirement. Check it.
- **`Moss-1`, not `Moss-2`.** Moss-2 gives 16 moss per craft against 8 but needs **stone 20**, which at
  28.88 sludge/s means **~2.9 stone/s**. It would cut the bank **29 → 15 farms (~500 tiles)**. Design 24
  exports 1.833 stone/s, so this still needs a second stone supplier — but **the gap is much smaller now
  than the 4.4/s variant 1 implied.** Worth revisiting the moment a stone outpost exists.
- **The boiler makes process steam, not power.** `agar` [hpf, 5 s] takes `steam 100` per craft as an
  *ingredient*. One `py-electric-boiler` at 32 % is 8.03 MW. It is under-loaded because the block split
  left `clay`'s 38.22 steam/s in design 26 — if the two blocks sit adjacent, one boiler covers both at
  **96 %** and saves a building.
- **`battery-mk01` is the only unlocked battery route**, at 0.100 bat/s per building — 10× worse than
  `nas-battery` (1.200), `battery-2` (1.000), `battery-1` (0.750) and `battery` (0.250). All four need
  **rayon**, which needs `fiber` + `sulfuric-acid` + `sodium-carbonate` + `carbon-sulfide`, none of
  which has an unlocked producer. **Revisit the moment sulfuric-acid lands** — it would collapse this
  entire block.

## Solver command

**Three solver runs, summed.** `--target` takes one item and this block has three independent products
(battery, melamine export, urea export). The chains are linear below `urea-decomposition`, so the
fractional machine counts add; they were recovered by re-running each at 1000× target and dividing.
**`auog-food-01` is absent from every `--recipes` list — that is what makes it an import.**

Run 1 — battery 0.20/s, which carries melamine 0.40/s internally:

```bash
npx tsx src/cli.ts solve \
  --recipes "battery-mk01,melamine,urea-decomposition,urea-from-liquid-manure,liquid-manure,auog-pooping-2,zogna-bacteria,petri-dish,agar,seaweed-1,water-barrel,Moss-1,muddy-sludge,soil,moondrop-co2,graphite,bolts,iron-stick,small-lamp,copper-cable,pressured-air,log2,log-wood-fast,wood-seedling,wood-seeds,electric-boiler-water-to-steam" \
  --target "battery-mk01:0.20" --time 1 \
  --factory "battery-mk01:chemical-plant-mk01" \
  --factory "melamine:fbreactor-mk01" \
  --factory "urea-decomposition:distilator" \
  --factory "urea-from-liquid-manure:bio-reactor-mk01" \
  --factory "liquid-manure:bio-reactor-mk01" \
  --factory "auog-pooping-2:auog-paddock-mk01" \
  --factory "zogna-bacteria:incubator-mk01" \
  --factory "petri-dish:automated-factory-mk01" \
  --factory "agar:hpf" \
  --factory "seaweed-1:seaweed-crop-mk01" \
  --factory "water-barrel:barrel-machine-mk01" \
  --factory "Moss-1:moss-farm-mk01" \
  --factory "muddy-sludge:washer" \
  --factory "soil:soil-extractor-mk01" \
  --factory "moondrop-co2:moondrop-greenhouse-mk01" \
  --factory "graphite:hpf" \
  --factory "bolts:automated-factory-mk01" \
  --factory "iron-stick:automated-factory-mk01" \
  --factory "small-lamp:automated-factory-mk01" \
  --factory "copper-cable:automated-factory-mk01" \
  --factory "wood-seeds:automated-factory-mk01" \
  --factory "pressured-air:vacuum-pump-mk01" \
  --factory "log2:fwf-mk01" \
  --factory "log-wood-fast:wpu-mk01" \
  --factory "wood-seedling:botanical-nursery" \
  --factory "electric-boiler-water-to-steam:py-electric-boiler" \
  --solver simplex \
  --unlocked
```

Run 2 — the **melamine 1.60/s export** to design 25:

```bash
npx tsx src/cli.ts solve \
  --recipes "melamine,urea-decomposition,urea-from-liquid-manure,liquid-manure,auog-pooping-2,zogna-bacteria,petri-dish,agar,seaweed-1,water-barrel,Moss-1,muddy-sludge,soil,moondrop-co2,pressured-air,log2,log-wood-fast,wood-seedling,wood-seeds,electric-boiler-water-to-steam" \
  --target "melamine:1.60" --time 1 \
  --factory "melamine:fbreactor-mk01" \
  --factory "urea-decomposition:distilator" \
  --factory "urea-from-liquid-manure:bio-reactor-mk01" \
  --factory "liquid-manure:bio-reactor-mk01" \
  --factory "auog-pooping-2:auog-paddock-mk01" \
  --factory "zogna-bacteria:incubator-mk01" \
  --factory "petri-dish:automated-factory-mk01" \
  --factory "agar:hpf" \
  --factory "seaweed-1:seaweed-crop-mk01" \
  --factory "water-barrel:barrel-machine-mk01" \
  --factory "Moss-1:moss-farm-mk01" \
  --factory "muddy-sludge:washer" \
  --factory "soil:soil-extractor-mk01" \
  --factory "moondrop-co2:moondrop-greenhouse-mk01" \
  --factory "pressured-air:vacuum-pump-mk01" \
  --factory "log2:fwf-mk01" \
  --factory "log-wood-fast:wpu-mk01" \
  --factory "wood-seedling:botanical-nursery" \
  --factory "wood-seeds:automated-factory-mk01" \
  --factory "electric-boiler-water-to-steam:py-electric-boiler" \
  --solver simplex \
  --unlocked
```

Run 3 — the **urea 0.40/s export** to design 25. `urea-decomposition` and `melamine` are dropped from
`--recipes` so the LP sizes the manure chain for a bare urea output:

```bash
npx tsx src/cli.ts solve \
  --recipes "urea-from-liquid-manure,liquid-manure,auog-pooping-2,zogna-bacteria,petri-dish,agar,seaweed-1,water-barrel,Moss-1,muddy-sludge,soil,moondrop-co2,small-lamp,bolts,iron-stick,copper-cable,pressured-air,log2,log-wood-fast,wood-seedling,wood-seeds,electric-boiler-water-to-steam" \
  --target "urea:0.40" --time 1 \
  --factory "urea-from-liquid-manure:bio-reactor-mk01" \
  --factory "liquid-manure:bio-reactor-mk01" \
  --factory "auog-pooping-2:auog-paddock-mk01" \
  --factory "zogna-bacteria:incubator-mk01" \
  --factory "petri-dish:automated-factory-mk01" \
  --factory "agar:hpf" \
  --factory "seaweed-1:seaweed-crop-mk01" \
  --factory "water-barrel:barrel-machine-mk01" \
  --factory "Moss-1:moss-farm-mk01" \
  --factory "muddy-sludge:washer" \
  --factory "soil:soil-extractor-mk01" \
  --factory "moondrop-co2:moondrop-greenhouse-mk01" \
  --factory "small-lamp:automated-factory-mk01" \
  --factory "bolts:automated-factory-mk01" \
  --factory "iron-stick:automated-factory-mk01" \
  --factory "copper-cable:automated-factory-mk01" \
  --factory "pressured-air:vacuum-pump-mk01" \
  --factory "log2:fwf-mk01" \
  --factory "log-wood-fast:wpu-mk01" \
  --factory "wood-seedling:botanical-nursery" \
  --factory "wood-seeds:automated-factory-mk01" \
  --factory "electric-boiler-water-to-steam:py-electric-boiler" \
  --solver simplex \
  --unlocked
```

### Interim mode

The interim configuration is **the same blueprint with one recipe swapped**, so there is no fourth
sizing run — every building except the paddocks simply runs at ~52 %. What needs verifying is only that
the nine placed paddocks yield 0.99 manure/s on `auog-pooping-1`:

```bash
npx tsx src/cli.ts solve \
  --recipes "auog-pooping-1,water-barrel,Moss-1,muddy-sludge,soil,moondrop-co2" \
  --target "manure:0.99" --time 1 \
  --factory "auog-pooping-1:auog-paddock-mk01" \
  --factory "water-barrel:barrel-machine-mk01" \
  --factory "Moss-1:moss-farm-mk01" \
  --factory "muddy-sludge:washer" \
  --factory "soil:soil-extractor-mk01" \
  --factory "moondrop-co2:moondrop-greenhouse-mk01" \
  --solver simplex \
  --unlocked
```

It returns **45 paddocks base → 9.000 module-corrected**, exactly the count the `-2` sizing places, and
**moss 1.80/s** against the 2.31/s the 29 farms supply. That is the whole proof of interim mode;
circuits 0.518/s then follows from 0.99 ÷ 1.911 by hand.

**Both `auog-pooping` variants have variable output** — manure 3–8 and 5–12, averaged to 5.5 and 8.5 per
solver-reference § Variable-output recipes. Sizing `-2` on `amount_min` instead would need **14 paddocks
rather than 9**, so if the paddocks turn out to be on a critical path with no manure buffer, re-read this
block at 5. **Interim mode is more exposed to this than full mode**, because `-1`'s spread is relatively
wider (3–8 is ±45 % of its mean, against `-2`'s ±41 %) and there is no food buffering the input side.

Run 2 reports `small-lamp` as a raw input and run 3 reports it as internal — in the merged block it is
internal. Same for `copper-cable`. The merged fractional count is the sum, still one building each.

Run 1 reports **`ammonia: 6.00/1s` as an output — that is the design intent, not an artefact.** Check
the urea rate to tell it from an earlier revision's artefact, which ran at 6.95/s against this design's
5.73.

All three runs emit a long cycle warning spanning the moss/CO₂/urea/barrel web. That is intentional and
the solver zeroes it correctly; do not add the suggested excludes.

## Build materials

Distinct construction materials across this block's 16 building types, separate from flow imports:

`aluminium-plate` · `boiler` · `burner-inserter` · `burner-mining-drill` · `concrete` · `copper-cable` ·
`copper-plate` · `distilator` · `electric-mining-drill` · `electronic-circuit` · `engine-unit` ·
`fluid-drill-mk01` · `gasifier` · `gearbox-mk01` · `glass` · `inductor1` · `inserter` ·
`intermetallics` · `iron-plate` · `lab` · `log` · `pcb1` · `pipe` · `pump` · `shaft-mk01` ·
`small-parts-01` · `steam-engine` · `steel-furnace` · `steel-plate` · `stone-brick` · `stone-furnace` ·
`wood`

The items to check first are **`auog` ×36** (§ Bio modules — a 3.0 h codex bootstrap, not a material)
and the one-time **`ash` ×30 and `stone-brick` ×40** for ten planter-boxes. Inferred from the recipe
graph, not from save state.
