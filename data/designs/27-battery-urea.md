# 27 — Battery + urea — 0.20 battery-mk01/s, 81 buildings

The cascade half of the circuit chain. `battery-mk01` takes **cyanic-acid 30 per battery**, and that
30:1 ratio drags in the whole urea → manure → auog → native-flora chain — **51 of the 81 buildings are
a bio annex that exists to make one item.** Feeds design 26.

```
battery-mk01        [U] [chemistry, 10 s]  pbsb-alloy 1 + melamine 2 + graphite 3 + bolts 3
                                           + glass 1 + zinc-plate 3 + cyanic-acid 30  →  1
urea-decomposition  [U] [distilator,  8 s]  urea 20                →  ammonia 30 + cyanic-acid 30
melamine            [U] [fbreactor,  10 s]  water 200 + cyanic-acid 20 + ammonia 20
                                                                   →  melamine 20 + CO₂ 30 + muddy-sludge 50
```

**`urea-decomposition` is the only unlocked source of ammonia or cyanic-acid in the game.** Nine other
ammonia recipes exist; all nine are locked. There is no bypass around
`urea → liquid-manure → manure → auog paddocks`.

## Block boundary

| class | items |
|---|---|
| **export — to design 26** | **battery-mk01** 0.20/s |
| **import — whitelisted** | coke, copper-plate, iron-plate, glass, zinc-plate, water |
| **import — asked and approved** | **pbsb-alloy**, **native-flora** |
| **import — boundary inherited from design 15** | **empty-petri-dish** 0.14/s |
| **made in-block** | cyanic-acid, ammonia, melamine, graphite, bolts, iron-stick, small-lamp, copper-cable · the whole urea chain: manure, liquid-manure, zogna-bacteria, petri-dish, agar, seaweed, urea · moss, muddy-sludge, soil, CO₂, wood, steam |
| **byproduct-exclude** | none |

**Independent — nothing crosses but the battery.** The block runs its own wood chain (0.37/s for
`zogna-bacteria`), its own moss bank, and makes CO₂ from coke rather than sharing design 25's free
`moondrop-co2`; see § Why CO₂ comes from coke.

## Recipe table

Bio counts are **module-corrected**; the solver reports base crafting speed, a 5–16× error here.
Multipliers from solver-reference § Bio module system, all reaching effective speed 1.0.

```
┌─────────────────────────────┬────────────────────────┬───────┬───────┬────────┐
│ Recipe                      │ Factory                │ Count │ Size  │ MW ea  │
├─────────────────────────────┼────────────────────────┼───────┼───────┼────────┤
│ battery-mk01                │ chemical-plant-mk01    │     2 │ 9x9   │   1.00 │
│ melamine                    │ fbreactor-mk01         │     1 │ 9x9   │   1.00 │
│ urea-decomposition          │ distilator             │     2 │ 8x8   │   0.50 │
│ urea-from-liquid-manure     │ bio-reactor-mk01       │     2 │ 9x9   │   1.00 │
│ liquid-manure               │ bio-reactor-mk01       │     2 │ 9x9   │   1.00 │
│ zogna-bacteria              │ incubator-mk01         │     1 │ 5x5   │   0.30 │
│ agar                        │ hpf                    │     1 │ 7x7   │   2.00 │
│ graphite                    │ hpf                    │     1 │ 7x7   │   2.00 │
│ coke-co2                    │ hpf                    │     3 │ 7x7   │   2.00 │
│ petri-dish · bolts          │ automated-factory-mk01 │   1+1 │ 7x7   │   2.00 │
│ iron-stick · small-lamp     │ automated-factory-mk01 │   1+1 │ 7x7   │   2.00 │
│ copper-cable · wood-seeds   │ automated-factory-mk01 │   1+1 │ 7x7   │   2.00 │
│ water-barrel                │ barrel-machine-mk01    │     1 │ 3x3   │   0.20 │
│ muddy-sludge                │ washer                 │     2 │ 6x6   │   0.40 │
│ soil                        │ soil-extractor-mk01    │     2 │ 5x5   │   0.30 │
│ pressured-air               │ vacuum-pump-mk01       │     1 │ 3x3   │   1.00 │
│ log-wood-fast               │ wpu-mk01               │     1 │ 6x6   │   0.50 │
│ wood-seedling               │ botanical-nursery      │     1 │ 7x7   │   0.13 │
│ electric-boiler-water-to-…  │ py-electric-boiler     │     1 │ 3x3   │  25.00 │
├─────────────────────────────┼────────────────────────┼───────┼───────┼────────┤
│ Moss-1                      │ moss-farm-mk01         │  *33  │ 6x6   │   0.10 │
│ auog-pooping-1              │ auog-paddock-mk01      │  *13  │ 14x14 │   0.50 │
│ seaweed-1                   │ seaweed-crop-mk01      │   *4  │ 13x13 │   0.50 │
│ log2                        │ fwf-mk01               │   *1  │ 15x15 │   0.45 │
└─────────────────────────────┴────────────────────────┴───────┴───────┴────────┘
   * module-corrected. Solver base counts: 527 / 65 / 40 / 7
     multipliers:                          16x /  5x / 11x / 11x
```

**81 buildings · ~5,640 tiles · 29.8 MW electric**

**51 buildings and ~4,640 tiles are the bio annex** — 33 moss-farm, 13 auog-paddock, 4 seaweed-crop,
1 fwf. The 30 process buildings are the chemistry.

**Inputs** (/s): water 365.09 · **native-flora 5.17** · coke 2.31 · zinc-plate 0.60 · iron-plate 0.37 ·
glass 0.34 · **pbsb-alloy 0.20** · copper-plate 0.18 · empty-petri-dish 0.14

**Exports** (/s): **battery-mk01 0.20** · **ammonia 6.00**

## Intermediate flows

```
┌────────────────┬──────────┬──────────────────────────────────────┬──────────────────────────────────────────────┐
│ Item           │ Rate /s  │ Producer                             │ Consumer                                     │
├────────────────┼──────────┼──────────────────────────────────────┼──────────────────────────────────────────────┤
│ cyanic-acid    │    6.40  │ urea-decomposition                   │ battery-mk01 6.00, melamine 0.40  ← closed   │
│ ammonia        │    6.40  │ urea-decomposition                   │ melamine 0.40, **export 6.00**               │
│ melamine       │    0.40  │ melamine                             │ battery-mk01 0.40                            │
│ graphite       │    0.60  │ graphite                             │ battery-mk01 0.60                            │
│ bolts          │    0.60  │ bolts                                │ battery-mk01 0.60                            │
│ iron-stick     │    0.60  │ iron-stick                           │ bolts 0.60                                   │
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
│ steam          │   14.22  │ electric-boiler-water-to-steam       │ agar 14.22                                   │
│ small-lamp     │    0.07  │ small-lamp                           │ zogna-bacteria                               │
│ copper-cable   │    0.21  │ copper-cable                         │ small-lamp                                   │
│ moss           │    2.63  │ Moss-1                               │ auog-pooping-1 2.59, wood-seedling 0.05      │
│ muddy-sludge   │   32.90  │ muddy-sludge 31.90 + melamine 1.00   │ Moss-1 32.90                                 │
│ soil           │    3.19  │ soil                                 │ muddy-sludge 3.19                            │
│ carbon-dioxide │   32.90  │ coke-co2 32.30 + melamine 0.60       │ Moss-1 32.90                                 │
│ wood           │    0.37  │ log-wood-fast                        │ zogna-bacteria 0.36, wood-seeds 0.01         │
│ log            │    0.04  │ log2                                 │ log-wood-fast                                │
│ wood-seedling  │    0.03  │ wood-seedling                        │ log2                                         │
└────────────────┴──────────┴──────────────────────────────────────┴──────────────────────────────────────────────┘
```

**`melamine`'s byproducts are both consumed internally** — its CO₂ 0.60/s and muddy-sludge 1.00/s both
go to `Moss-1`, which is why neither appears in the export table. **The barrel loop is net zero**:
`auog-pooping-1` emits 5 barrels per craft and one `barrel-machine` refills exactly what the paddocks
empty, so barrels are a one-time stock, not a resupply.

## The ammonia decision

`urea-decomposition` emits ammonia and cyanic-acid **1:1**, but demand is **16:1** against it —
`battery-mk01` takes cyanic-acid 30 and **no ammonia**, and `melamine` is the only 1:1 consumer at
0.40/s. So the block makes **6.40 ammonia/s against 0.40 wanted**.

**The surplus is pinned at exactly 6.00/s and nothing internal can move it.** With `a` =
urea-decomposition crafts/s and `m` = melamine crafts/s:

```
cyanic-acid:  30a − 20m − 6.00 (battery)  =  0   →   30a − 20m = 6.00
ammonia:      30a − 20m − X               =  0   →   X = 6.00,  for any m
```

More melamine scales both sides together and the gap never closes. It equals the battery's cyanic-acid
draw precisely, because that is the one demand with no matching ammonia. **This is also why the block
split lands at battery rather than at cyanic-acid** — the surplus belongs in the same block as the
demand that creates it.

**`cyanic-acid-01` would close it** (`coal 20 + methane 100 + ammonia 100 → cyanic-acid 100 +
hydrogen 50`), and was in an earlier revision. What removing it cost:

| | with `cyanic-acid-01` | **ammonia exported** |
|---|--:|--:|
| buildings | 61 | **81** |
| urea | 2.27 /s | **4.27 /s** |
| **native-flora** | 2.75 /s | **5.17 /s** |
| moss · auog · seaweed | 17 · 7 · 2 | **33 · 13 · 4** |
| byproducts | tar 1.80 · coal-gas 0.60 · hydrogen 1.50 | **ammonia 6.00** |
| extra import | **coal 0.60/s** | none |

Keeping it **halves the bio annex**, because the 3.00 cyanic-acid/s it returns lets
`urea-decomposition` run at 3.40 instead of 6.40. It was removed because it needs **`coal`** — a
distinct item from both `raw-coal` (3.0 MJ) and `coke` (5.0 MJ), reachable only through
`distilled-raw-coal`, `crushed-coal` or `coal-gas-from-wood`, each of which emits something. Of those,
`crushed-coal` (`raw-coal 3 → crushed-coal 1 + coal 2 + coal-dust`) is the cleanest, since its
byproducts are solid fuels. Four small byproducts and one extra import were traded for one large export.

> **The 6.00 ammonia/s has no consumer identified.** There are exactly two unlocked ammonia recipes in
> the game — `melamine` and `cyanic-acid-01` — and both are in this block. Ammonia is on the never-vent
> list, so it cannot be disposed of either. This is an export awaiting a destination, not a routed one.
> Recorded as risk 1, and it makes `t = 0` for designs 26 and 27 both.

## Why CO₂ comes from coke

`Moss-1` needs **CO₂ 32.90/s**, and design 25 gets its CO₂ free from `moondrop-co2` (no ingredients at
all). Using that here would mean one `moondrop-greenhouse` plus **16 `moondrop` modules** to bring it to
effective speed 1.0 — a codex bootstrap for a single building, with no moondrop chain here to supply it.

```
coke-co2  [U] [hpf, 5 s]  coke 2  →  carbon-dioxide 80
```

**3 hpf and coke 0.81/s instead**, using an import the block already has for graphite. It destroys
4.05 MJ/s of coke fuel value and draws 6 MW — the honest cost of independence — but removes a
bio-module dependency entirely. Switch to `moondrop-co2` if a moondrop line ever sits nearby: 1 building
against 3, and no coke.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| **battery-mk01** | 0.20 | **design 26** `electronic-circuit-2` — stack 100, 21 consumers overall (11 unlocked) | — | it is a Tier B bus item; other consumers will want it |
| **ammonia** | **6.00** | **export — no consumer identified** | — | `cyanic-acid-01` would close it at +20 buildings and +88 % native-flora (above). Not ventable |

## Bio modules

| building | ×count | module | needed | self-funding? |
|---|--:|---|--:|---|
| `moss-farm-mk01` | 33 | `moss` 15 | **495** | **yes** — `Moss-1` is its own product |
| `seaweed-crop-mk01` | 4 | `seaweed` 10 | **40** | **yes** — `seaweed-1` runs here |
| `auog-paddock-mk01` | 13 | `auog` 4 | **52** | **no** |
| `fwf-mk01` | 1 | `tree-mk01` 10 | **10** | needs 1 planter-box |

**`auog` ×52 is the long pole.** The only non-circular route is `auog` [creature-chamber, 300 s] from a
codex plus samples, at **1 per run** — so 52 modules is a slow bootstrap, and the paddocks run at 1/5
speed until it finishes. `auog-recharge-0` is not a shortcut: it needs `auog-food-01`, which needs
**ralesia**, an entire additional plantation. **Start this before anything else in the block.**

The single `tree-mk01` needs one **planter-box** = `ash 3 + soil 5 + empty-planter-box 1`, and
`empty-planter-box` = `stone-brick 4 + wood 2 + iron-plate 1`. Soil and wood are made here; **ash and
stone-brick are one-time imports** appearing nowhere in the flows.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **ammonia 6.00/s with no consumer** | both unlocked consumers are in this block and it is not ventable, so it cannot be disposed of. **`t = 0` until a destination exists** — a design-level open item, not an operational one, and it gates design 26 too |
| 2 | **moss 2.63/s** | 2.59 feeds `auog-pooping-1` → manure → urea → cyanic-acid → batteries. A moss outage stops the product, and with 33 farms at 100 s per craft recovery is slow |
| 3 | **native-flora 5.17/s** | no recipe exists at all — map-placed only. Same cascade as moss, one step earlier |
| 4 | **the barrel loop** | nets to zero, so nothing refills it. One stray inserter drains it and the paddocks stop with no obvious cause |
| 5 | **coke 2.31/s** | feeds `graphite` *and* `coke-co2`, so a shortfall hits the battery directly and the moss farms through CO₂ |
| 6 | the auog module bootstrap | not a flow risk but a schedule one — 52 codex runs at 300 s each is ~4.3 h of chamber time before the paddocks reach full speed |

## Build notes

- **Never size the bio buildings without modules.** The solver's 669 is meaningless; the multipliers
  bring it to 81. `moss-farm-mk01` 16× at 15 slots, `auog-paddock-mk01` 5× at 4, `seaweed-crop-mk01`
  11× at 10, `fwf-mk01` 11× at 10.
- **`auog-pooping-1`, not `-2`.** Variant 2 is 1.9× the manure per paddock but needs `auog-food-01` →
  **ralesia**. Variant 1 costs **+54 % native-flora** and roughly double the paddocks to avoid an
  entire plantation chain.
- **`Moss-1`, not `Moss-2`.** Moss-2 gives 16 moss per craft against 8 but needs **stone 20**, which
  this block does not import. Switching would cut the bank **33 → 14 farms (~680 tiles)** for
  **~3.3 stone/s** — worth taking if stone is acceptable, since design 24 exports 1.833/s.
- **The boiler makes process steam, not power.** `agar` [hpf, 5 s] takes `steam 100` per craft as an
  *ingredient*. One `py-electric-boiler` at 24 % is 5.93 MW. It is heavily under-loaded because the
  block split left `clay`'s 38.22 steam/s in design 26 — if the two blocks sit adjacent, one boiler
  covers both at 87 % and saves a building.
- **2 chemical plants are exactly saturated** by design 26's draw. Science's 0.025 battery/s would need
  a third at ~25 % and ~0.28 more urea/s — which at this urea ratio means ~0.6 more native-flora/s and
  another paddock.
- **`battery-mk01` is the only unlocked battery route**, at 0.100 bat/s per building — 10× worse than
  `nas-battery` (1.200), `battery-2` (1.000), `battery-1` (0.750) and `battery` (0.250). All four need
  **rayon**, which needs `fiber` + `sulfuric-acid` + `sodium-carbonate` + `carbon-sulfide`, none of
  which has an unlocked producer. **Revisit the moment sulfuric-acid lands** — it would collapse this
  entire block.

## Solver command

Target mode on `battery-mk01`. No `--max-import`, no `--fuel`, no constraints — urea is endogenous so
there is no free input for the LP to over-consume, and the block has no burner machines. Bio buildings
are specified at mk01 and **must be re-read with the module multipliers above**.

```bash
npx tsx src/cli.ts solve \
  --recipes "battery-mk01,melamine,urea-decomposition,urea-from-liquid-manure,liquid-manure,auog-pooping-1,zogna-bacteria,petri-dish,agar,seaweed-1,water-barrel,Moss-1,muddy-sludge,soil,coke-co2,graphite,bolts,iron-stick,small-lamp,copper-cable,pressured-air,log2,log-wood-fast,wood-seedling,wood-seeds,electric-boiler-water-to-steam" \
  --target "battery-mk01:0.20" --time 1 \
  --factory "battery-mk01:chemical-plant-mk01" \
  --factory "melamine:fbreactor-mk01" \
  --factory "urea-decomposition:distilator" \
  --factory "urea-from-liquid-manure:bio-reactor-mk01" \
  --factory "liquid-manure:bio-reactor-mk01" \
  --factory "auog-pooping-1:auog-paddock-mk01" \
  --factory "zogna-bacteria:incubator-mk01" \
  --factory "petri-dish:automated-factory-mk01" \
  --factory "agar:hpf" \
  --factory "seaweed-1:seaweed-crop-mk01" \
  --factory "water-barrel:barrel-machine-mk01" \
  --factory "Moss-1:moss-farm-mk01" \
  --factory "muddy-sludge:washer" \
  --factory "soil:soil-extractor-mk01" \
  --factory "coke-co2:hpf" \
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

It reports **`ammonia: 6.00/1s` as an output — that is the design intent, not an artefact.** Contrast an
earlier revision where the same row appeared because the LP was scaling `melamine` for its CO₂ and
muddy-sludge byproducts; check the urea rate to tell them apart, since the artefact ran it at 6.95/s
against this design's 4.27.

It also emits a long cycle warning spanning the moss/CO₂/urea/barrel web. That is intentional and the
solver zeroes it correctly; do not add the suggested excludes.

## Build materials

Distinct construction materials across this block's 15 building types, separate from flow imports:

`aluminium-plate` · `boiler` · `burner-inserter` · `burner-mining-drill` · `concrete` · `copper-cable` ·
`copper-plate` · `distilator` · `electric-mining-drill` · `electronic-circuit` · `engine-unit` ·
`fluid-drill-mk01` · `gasifier` · `gearbox-mk01` · `glass` · `inductor1` · `inserter` ·
`intermetallics` · `iron-plate` · `lab` · `log` · `pcb1` · `pipe` · `pump` · `shaft-mk01` ·
`small-parts-01` · `steam-engine` · `steel-furnace` · `steel-plate` · `stone-brick` · `stone-furnace` ·
`wood`

The items to check first are **`auog` ×52** (§ Bio modules — a 4.3 h codex bootstrap, not a material)
and the one-time **`ash` ×3 and `stone-brick` ×4** for the single planter-box. Inferred from the recipe
graph, not from save state.
