# 26 — Electronic circuits — 1.0 e-circuit/s, 99 buildings

The electrical and chemical half of the circuit chain. Imports **formica 0.40/s from design 25** and
nothing else from it — every other input is a base commodity. Supersedes design 14 at the same rate.

```
electronic-circuit-2  [U] [chip, 4 s]  battery-mk01 1 + capacitor1 5 + inductor1 3 + resistor1 6
                                       + pcb1 1 + vacuum-tube 3 + solder 2        →  5
pcb1                  [U] [pcb,  5 s]  formica 2 + copper-plate 5 + vacuum 50     →  1
battery-mk01          [U] [chemistry, 10 s]  pbsb-alloy 1 + melamine 2 + graphite 3 + bolts 3
                                             + glass 1 + zinc-plate 3 + cyanic-acid 30  →  1
```

Scale anchor is **1 `pcb-factory-mk01`** — 0.2 pcb1/s at 1 pcb1 per 5 circuits is exactly
1.0 e-circuit/s, which also fixes 1 chipshooter and 2 chemical plants. Ratios are integer only at
C = 1, 2, 5 circuits/s.

## Block boundary

| class | items |
|---|---|
| **import — from design 25** | **formica** 0.40/s — the only cross-block flow |
| **import — whitelisted** | coke, copper-plate, tin-plate, iron-plate, lead-plate, zinc-plate, glass, water |
| **import — asked and approved** | **pbsb-alloy**, **native-flora** |
| **import — boundary inherited from design 15** | **empty-petri-dish** 0.14/s |
| **made in-block** | all six circuit sub-parts, ceramic, clay, graphite, vacuum, copper-cable, bolts, iron-stick, small-lamp · battery, melamine, cyanic-acid · the whole urea chain: manure, liquid-manure, zogna-bacteria, petri-dish, agar, seaweed, urea · moss, muddy-sludge, soil, CO₂, wood, steam |
| **byproduct-exclude** | none |

**Independent apart from formica.** The block runs its own wood chain (0.37/s, for `zogna-bacteria`),
its own moss bank, and makes CO₂ from coke rather than sharing design 25's free `moondrop-co2` — see
§ Why CO₂ comes from coke. That costs **+6 buildings and +3.7 MW against a shared design**, which is
the price of the two blocks being independently stampable.

## Recipe table

Bio counts are **module-corrected**; the solver reports base crafting speed, a 5–16× error here.
Multipliers from solver-reference § Bio module system, all reaching effective speed 1.0.

```
┌────────────────────────────────┬──────────────────────────┬───────┬───────┬────────┐
│ Recipe                         │ Factory                  │ Count │ Size  │ MW ea  │
├────────────────────────────────┼──────────────────────────┼───────┼───────┼────────┤
│ electronic-circuit-2           │ chipshooter-mk01         │     1 │ 5x5   │   0.15 │
│ capacitor1                     │ electronics-factory-mk01 │     2 │ 5x5   │   0.50 │
│ inductor1                      │ electronics-factory-mk01 │     1 │ 5x5   │   0.50 │
│ resistor1                      │ electronics-factory-mk01 │     2 │ 5x5   │   0.50 │
│ vacuum-tube                    │ electronics-factory-mk01 │     3 │ 5x5   │   0.50 │
│ pcb1                           │ pcb-factory-mk01         │     1 │ 7x7   │   0.40 │
│ solder-0                       │ automated-factory-mk01   │     3 │ 7x7   │   2.00 │
│ copper-cable                   │ automated-factory-mk01   │     1 │ 7x7   │   2.00 │
│ bolts · iron-stick             │ automated-factory-mk01   │   1+1 │ 7x7   │   2.00 │
│ small-lamp · petri-dish        │ automated-factory-mk01   │   1+1 │ 7x7   │   2.00 │
│ wood-seeds                     │ automated-factory-mk01   │     1 │ 7x7   │   2.00 │
│ ceramic · graphite · agar      │ hpf                      │ 1+2+1 │ 7x7   │   2.00 │
│ coke-co2                       │ hpf                      │     3 │ 7x7   │   2.00 │
│ clay                           │ clay-pit-mk01            │     2 │ 7x7   │   0.20 │
│ vacuum · pressured-air         │ vacuum-pump-mk01         │   1+1 │ 3x3   │   1.00 │
│ battery-mk01                   │ chemical-plant-mk01      │     2 │ 9x9   │   1.00 │
│ melamine                       │ fbreactor-mk01           │     1 │ 9x9   │   1.00 │
│ urea-decomposition             │ distilator               │     2 │ 8x8   │   0.50 │
│ urea-from-liquid-manure        │ bio-reactor-mk01         │     2 │ 9x9   │   1.00 │
│ liquid-manure                  │ bio-reactor-mk01         │     2 │ 9x9   │   1.00 │
│ zogna-bacteria                 │ incubator-mk01           │     1 │ 5x5   │   0.30 │
│ water-barrel                   │ barrel-machine-mk01      │     1 │ 3x3   │   0.20 │
│ muddy-sludge                   │ washer                   │     2 │ 6x6   │   0.40 │
│ soil                           │ soil-extractor-mk01      │     2 │ 5x5   │   0.30 │
│ log-wood-fast                  │ wpu-mk01                 │     1 │ 6x6   │   0.50 │
│ wood-seedling                  │ botanical-nursery        │     1 │ 7x7   │   0.13 │
│ electric-boiler-water-to-steam │ py-electric-boiler       │     1 │ 3x3   │  25.00 │
├────────────────────────────────┼──────────────────────────┼───────┼───────┼────────┤
│ Moss-1                         │ moss-farm-mk01           │  *33  │ 6x6   │   0.10 │
│ auog-pooping-1                 │ auog-paddock-mk01        │  *13  │ 14x14 │   0.50 │
│ seaweed-1                      │ seaweed-crop-mk01        │   *4  │ 13x13 │   0.50 │
│ log2                           │ fwf-mk01                 │   *1  │ 15x15 │   0.45 │
└────────────────────────────────┴──────────────────────────┴───────┴───────┴────────┘
   * module-corrected. Solver base counts: 527 / 65 / 40 / 7
     multipliers:                          16x /  5x / 11x / 11x
```

**99 buildings · ~6,560 tiles · 58.9 MW electric** — all drawn; the block generates nothing.

**51 of the 99 buildings are a bio annex that exists purely to make urea** — 33 moss-farm, 13
auog-paddock, 4 seaweed-crop. The 48 process buildings are the actual electronics.

**Inputs** (/s): water 403.31 · **native-flora 5.17** · coke 4.72 · copper-plate 2.98 · tin-plate 1.87 ·
iron-plate 1.87 · lead-plate 1.60 · glass 1.34 · zinc-plate 0.60 · **formica 0.40** · pbsb-alloy 0.20 ·
empty-petri-dish 0.14

**Exports** (/s): **electronic-circuit 1.00** · **ammonia 6.00**

Twelve imports, two exports, no fuel — the boiler is electric.

## Intermediate flows

```
┌────────────────┬──────────┬──────────────────────────────────────┬──────────────────────────────────────────────┐
│ Item           │ Rate /s  │ Producer                             │ Consumer                                     │
├────────────────┼──────────┼──────────────────────────────────────┼──────────────────────────────────────────────┤
│ capacitor1     │    1.00  │ capacitor1                           │ electronic-circuit-2                         │
│ resistor1      │    1.20  │ resistor1                            │ electronic-circuit-2                         │
│ inductor1      │    0.60  │ inductor1                            │ electronic-circuit-2                         │
│ vacuum-tube    │    0.60  │ vacuum-tube                          │ electronic-circuit-2                         │
│ solder         │    0.40  │ solder-0                             │ electronic-circuit-2                         │
│ pcb1           │    0.20  │ pcb1                                 │ electronic-circuit-2                         │
│ battery-mk01   │    0.20  │ battery-mk01                         │ electronic-circuit-2                         │
│ vacuum         │   25.00  │ vacuum                               │ pcb1 10.00, vacuum-tube 15.00                │
│ ceramic        │    0.57  │ ceramic                              │ capacitor1 0.33, inductor1 0.24              │
│ clay           │    1.15  │ clay                                 │ ceramic 1.15                                 │
│ copper-cable   │    2.61  │ copper-cable                         │ inductor1 2.40, small-lamp 0.21              │
│ graphite       │    1.20  │ graphite                             │ vacuum-tube 0.60, battery-mk01 0.60          │
│ bolts          │    0.60  │ bolts                                │ battery-mk01 0.60                            │
│ iron-stick     │    0.60  │ iron-stick                           │ bolts 0.60                                   │
│ steam          │   52.44  │ electric-boiler-water-to-steam       │ clay 38.22, agar 14.22                       │
├── urea ────────┼──────────┼──────────────────────────────────────┼──────────────────────────────────────────────┤
│ urea           │    4.27  │ urea-from-liquid-manure              │ urea-decomposition 4.27                      │
│ liquid-manure  │   14.22  │ liquid-manure                        │ urea-from-liquid-manure                      │
│ manure         │    1.42  │ auog-pooping-1                       │ liquid-manure                                │
│ zogna-bacteria │    1.42  │ zogna-bacteria                       │ urea-from-liquid-manure                      │
│ barrel         │    1.29  │ auog-pooping-1                       │ water-barrel          ← closed loop           │
│ water-barrel   │    1.29  │ water-barrel                         │ auog-pooping-1                               │
│ pressured-air  │    3.56  │ pressured-air                        │ zogna-bacteria                               │
│ petri-dish     │    0.14  │ petri-dish                           │ zogna-bacteria                               │
│ agar           │    0.14  │ agar                                 │ petri-dish                                   │
│ seaweed        │    0.71  │ seaweed-1                            │ agar                                         │
│ small-lamp     │    0.07  │ small-lamp                           │ zogna-bacteria                               │
│ moss           │    2.63  │ Moss-1                               │ auog-pooping-1 2.59, wood-seedling 0.05      │
│ muddy-sludge   │   32.90  │ muddy-sludge 31.90 + melamine 1.00   │ Moss-1 32.90                                 │
│ soil           │    3.19  │ soil                                 │ muddy-sludge 3.19                            │
│ carbon-dioxide │   32.90  │ coke-co2 32.30 + melamine 0.60       │ Moss-1 32.90                                 │
│ wood           │    0.37  │ log-wood-fast                        │ zogna-bacteria 0.36, wood-seeds 0.01         │
│ log            │    0.04  │ log2                                 │ log-wood-fast                                │
│ wood-seedling  │    0.03  │ wood-seedling                        │ log2                                         │
├── chemistry ───┼──────────┼──────────────────────────────────────┼──────────────────────────────────────────────┤
│ cyanic-acid    │    6.40  │ urea-decomposition                   │ battery-mk01 6.00, melamine 0.40  ← closed   │
│ ammonia        │    6.40  │ urea-decomposition                   │ melamine 0.40, **export 6.00**               │
│ melamine       │    0.40  │ melamine                             │ battery-mk01 0.40                            │
└────────────────┴──────────┴──────────────────────────────────────┴──────────────────────────────────────────────┘
```

**The barrel loop is net zero** — `auog-pooping-1` emits 5 barrels per craft and one `barrel-machine`
refills exactly what the paddocks empty, so barrels are a one-time stock, not a resupply.

## The ammonia decision

`urea-decomposition` emits ammonia and cyanic-acid **1:1**, but demand is **16:1** against it —
`battery-mk01` takes cyanic-acid 30 per battery and no ammonia, and `melamine` is the only 1:1 consumer
at 0.40/s. So the block makes **6.40 ammonia/s against 0.40 wanted**.

**The surplus is pinned at exactly 6.00/s and nothing internal can move it.** With `a` =
urea-decomposition crafts/s and `m` = melamine crafts/s:

```
cyanic-acid:  30a − 20m − 6.00 (battery)  =  0   →   30a − 20m = 6.00
ammonia:      30a − 20m − X               =  0   →   X = 6.00,  for any m
```

More melamine scales both sides together and the gap never closes — it equals the battery's
cyanic-acid draw precisely, because that is the one demand with no matching ammonia.

**`cyanic-acid-01` would close it** (`coal 20 + methane 100 + ammonia 100 → cyanic-acid 100 +
hydrogen 50`), and was in an earlier revision. What removing it cost:

| | with `cyanic-acid-01` | **ammonia exported** |
|---|--:|--:|
| buildings | 79 | **99** |
| urea | 2.27 /s | **4.27 /s** |
| **native-flora** | 2.75 /s | **5.17 /s** |
| moss · auog · seaweed | 17 · 7 · 2 | **33 · 13 · 4** |
| byproducts | tar 1.80 · coal-gas 0.60 · hydrogen 1.50 | **ammonia 6.00** |
| extra import | **coal 0.60/s** | none |

Keeping it halves the bio annex, because the 3.00 cyanic-acid/s it returns lets `urea-decomposition`
run at 3.40 instead of 6.40. It was removed because it needs **`coal`** — a distinct item from both
`raw-coal` (3.0 MJ) and `coke` (5.0 MJ), reachable only through `distilled-raw-coal`, `crushed-coal`
or `coal-gas-from-wood`, each of which emits something. Four small byproducts and a thirteenth import
were traded for one large export.

> **The 6.00 ammonia/s has no consumer identified.** There are exactly two unlocked ammonia recipes in
> the game — `melamine` and `cyanic-acid-01` — and both are in this block. Ammonia is on the never-vent
> list, so it cannot be disposed of either. This is an export awaiting a destination, not a routed one.
> Recorded as risk 1.

## Why CO₂ comes from coke

`Moss-1` needs **CO₂ 32.90/s**, and design 25 gets its CO₂ free from `moondrop-co2` (no ingredients at
all). Using that here would mean one `moondrop-greenhouse` — and **16 `moondrop` modules** to bring it
to effective speed 1.0, which this block has no moondrop chain to supply. That is a codex bootstrap for
a single building.

```
coke-co2  [U] [hpf, 5 s]  coke 2  →  carbon-dioxide 80
```

**3 hpf and coke 0.81/s instead**, using an import the block already has for graphite and resistors. It
destroys 4.05 MJ/s of coke fuel value and draws 6 MW, which is the honest cost of independence — but it
removes a bio-module dependency entirely. Switch to `moondrop-co2` if a moondrop line ever exists
nearby: 1 building against 3, and no coke.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| **electronic-circuit** | 1.00 | the product — Tier A, 219 consumers | — | — |
| **ammonia** | **6.00** | **export — no consumer identified** | — | `cyanic-acid-01` would close it at +20 buildings and +88 % native-flora (§ The ammonia decision). Not ventable |

**No other byproducts.** `melamine`'s CO₂ and muddy-sludge are both consumed internally by `Moss-1`,
which is why they do not appear here.

## Bio modules

| building | ×count | module | needed | self-funding? |
|---|--:|---|--:|---|
| `moss-farm-mk01` | 33 | `moss` 15 | **495** | **yes** — `Moss-1` is its own product |
| `seaweed-crop-mk01` | 4 | `seaweed` 10 | **40** | **yes** — `seaweed-1` runs here |
| `auog-paddock-mk01` | 13 | `auog` 4 | **52** | **no** |
| `fwf-mk01` | 1 | `tree-mk01` 10 | **10** | needs 1 planter-box |

**`auog` ×52 is the hard one.** The only non-circular route is `auog` [creature-chamber, 300 s] from a
codex plus samples, at **1 per run** — so 52 paddock modules is a long bootstrap, and the paddocks run
at 1/5 speed until it is done. `auog-recharge-0` needs `auog-food-01`, which needs **ralesia** — an
entire additional plantation — so it is not a shortcut. Start this before anything else in the block.

The single `tree-mk01` needs one **planter-box** = `ash 3 + soil 5 + empty-planter-box 1`, and
`empty-planter-box` = `stone-brick 4 + wood 2 + iron-plate 1`. Soil and wood are made here; **ash and
stone-brick are one-time imports** that appear nowhere in the flows.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **ammonia 6.00/s with no consumer** | both unlocked consumers are in this block, and it is not ventable, so it cannot be disposed of. **`t = 0` until a destination exists** — a design-level open item, not an operational one |
| 2 | **formica 0.40/s from design 25** | the only cross-block flow. Starves `pcb1` → circuits directly, and design 25's own cap is creosote at `t ≈ 0.85`, so this import is the inherited constraint |
| 3 | **moss 2.63/s** | 2.59 of it feeds `auog-pooping-1` → manure → urea → cyanic-acid → batteries. A moss outage stops the batteries, and with 33 farms at 100 s per craft the recovery is slow |
| 4 | **native-flora 5.17/s** | no recipe exists at all — map-placed only. Same cascade as moss |
| 5 | **the barrel loop** | nets to zero, so nothing refills it. One stray inserter drains it and the paddocks stop with no obvious cause |
| 6 | CO₂ 32.90/s | internal, but the coke that makes it is also feeding graphite and resistors — a coke shortfall hits three chains at once |

Given a consumer for the ammonia, the next cap is **formica**, inherited from design 25's creosote
constraint.

## Build notes

- **Never size the bio buildings without modules.** The solver's 687 is meaningless; the multipliers
  bring it to 99. `moss-farm-mk01` 16× at 15 slots, `auog-paddock-mk01` 5× at 4,
  `seaweed-crop-mk01` 11× at 10, `fwf-mk01` 11× at 10.
- **`auog-pooping-1`, not `-2`.** Variant 2 is 1.9× the manure per paddock but needs `auog-food-01`,
  which wants **ralesia**. Taking variant 1 costs **+54 % native-flora** (5.17 against 3.34/s at this
  urea rate) and roughly double the paddocks, to avoid an entire plantation chain.
- **`Moss-1`, not `Moss-2`.** Moss-2 gives 16 moss per craft against 8 but needs **stone 20**, which
  this block does not import. Switching would cut the bank **33 → 14 farms (~680 tiles)** for
  **~3.3 stone/s** — worth taking if stone is acceptable, since design 24 exports 1.833/s.
- **The electric boiler makes process steam, not power.** `clay` (38.22/s) and `agar` (14.22/s) drink
  it as a recipe ingredient; none reaches a generator and the block has no steam engines. One
  `py-electric-boiler` at 87 % is **21.81 MW — 37 % of the block's draw** and the single largest line
  item. An `oil-boiler-mk01` on acetylene would be 0 MW for 12.91 acetylene/s if a fluid line is ever
  acceptable; a solid `boiler` on coke would be 7 buildings at effectivity 1 and 5.18 ash/s.
- **The urea annex is the natural third split.** 51 bio buildings plus 2 distilators produce one item;
  lifting it out would leave a 48-building pure electronics block importing urea or cyanic-acid.
- `inductor1` over `inductor1-2` — half the copper (4 cable per inductor against 8) for one extra
  building at this scale.
- **2 chemical plants are exactly saturated** by the circuits. Science's 0.025 battery/s would need a
  third at ~25 % and ~0.28 more urea/s.

## Solver command

Target mode on the end product. No `--max-import`, no `--fuel`, no constraints — urea is endogenous so
there is no free input for the LP to over-consume, and the block has no burner machines. Bio buildings
are specified at mk01 and **must be re-read with the module multipliers above**.

```bash
npx tsx src/cli.ts solve \
  --recipes "electronic-circuit-2,capacitor1,inductor1,resistor1,pcb1,vacuum-tube,solder-0,copper-cable,bolts,iron-stick,small-lamp,petri-dish,ceramic,graphite,agar,clay,vacuum,pressured-air,battery-mk01,melamine,urea-decomposition,urea-from-liquid-manure,liquid-manure,auog-pooping-1,zogna-bacteria,seaweed-1,water-barrel,Moss-1,muddy-sludge,soil,coke-co2,electric-boiler-water-to-steam,log2,log-wood-fast,wood-seedling,wood-seeds" \
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
  --factory "agar:hpf" \
  --factory "coke-co2:hpf" \
  --factory "clay:clay-pit-mk01" \
  --factory "vacuum:vacuum-pump-mk01" \
  --factory "pressured-air:vacuum-pump-mk01" \
  --factory "battery-mk01:chemical-plant-mk01" \
  --factory "melamine:fbreactor-mk01" \
  --factory "urea-decomposition:distilator" \
  --factory "urea-from-liquid-manure:bio-reactor-mk01" \
  --factory "liquid-manure:bio-reactor-mk01" \
  --factory "auog-pooping-1:auog-paddock-mk01" \
  --factory "zogna-bacteria:incubator-mk01" \
  --factory "seaweed-1:seaweed-crop-mk01" \
  --factory "water-barrel:barrel-machine-mk01" \
  --factory "Moss-1:moss-farm-mk01" \
  --factory "muddy-sludge:washer" \
  --factory "soil:soil-extractor-mk01" \
  --factory "log2:fwf-mk01" \
  --factory "log-wood-fast:wpu-mk01" \
  --factory "wood-seedling:botanical-nursery" \
  --factory "electric-boiler-water-to-steam:py-electric-boiler" \
  --solver simplex \
  --unlocked
```

It reports **`ammonia: 6.00/1s` as an output — that is the design intent here, not an artefact.**
Contrast an earlier revision where the same row appeared because the LP was scaling `melamine` for its
CO₂ and muddy-sludge byproducts; check the urea rate to tell them apart, since the artefact ran it at
6.95/s against this design's 4.27.

It also emits a long cycle warning spanning the moss/CO₂/urea/barrel web. That is intentional and the
solver zeroes it correctly; do not add the suggested excludes.

## Build materials

Distinct construction materials across this block's 17 building types, separate from flow imports:

`aluminium-plate` · `boiler` · `burner-inserter` · `burner-mining-drill` · `concrete` · `copper-cable` ·
`copper-plate` · `distilator` · `electronic-circuit` · `electronics-factory-mk01` · `engine-unit` ·
`fluid-drill-mk01` · `gasifier` · `gearbox-mk01` · `glass` · `inductor1` · `inserter` ·
`intermetallics` · `iron-plate` · `lab` · `log` · `pcb1` · `pipe` · `pump` · `shaft-mk01` ·
`small-parts-01` · `steam-engine` · `steel-furnace` · `steel-plate` · `stone-brick` · `stone-furnace` ·
`tar-processing-unit` · `wood`

**`py-electric-boiler`** costs `electric-mining-drill 3 + lab 1 + gasifier 1 + small-parts-01 20 +
iron-plate 100`, and **`tar-processing-unit`** appears here only as a component, not as a machine. The
items to check first are `auog` ×52 (§ Bio modules) and the one-time `ash` and `stone-brick` for the
single planter-box. Inferred from the recipe graph, not from save state.
