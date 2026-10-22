# 33 — Aluminium outpost, direct smelt — 1.32 plate/s on one belt of raw-coal

**Two imports: raw-coal and electricity.** No fluid enters or leaves except the block's own tar
surplus. Mine-to-plate in two recipes plus the gas chain that feeds the drills.

```
distilled-raw-coal  [U] [distilator, 2 s]  raw-coal 10  →  coal-gas 60 + coal 3 + tar 30
                                                            + iron-oxide 1 @0.2
coal-gas            [U] [distilator, 3 s]  coal 10      →  coal-gas 40 + coke 6 + tar 50
                                                            + iron-oxide 1 @0.3
coal-gas-from-coke  [U] [distilator, 5 s]  coke 20      →  coal-gas 20 + tar 20 + ash 1
aluminium-plate-1   [U] [smelting,  6 s]   ore-aluminium 10  →  aluminium-plate 1
```

`ore-aluminium` is a `basic-with-fluid` resource: `mining_time 1`, `required_fluid coal-gas`,
`fluid_amount 100` — so **10 coal-gas per ore**, independent of drill speed or tier. The entire gas
chain exists to feed that.

## The tar closes the loop

**The gas chain's tar byproduct fuels the smelters outright.** `steel-furnace` has
`fluid_energy_source` with `burns_fluid: true` and no fuel filter, so it burns tar at 0.2 MJ:

| per 1 raw-coal/s | tar made | furnaces need | |
|---|--:|--:|---|
| `distilled-raw-coal` only, +20 % prod | 3.00 | 3.24 | **8 % short** |
| **all three gas legs, +20 % prod** | **4.68** | **3.99** | **85 % used** |
| all three legs, 0 % prod | 4.68 | 3.32 | 71 % used |

**The `coal-gas` and `coal-gas-from-coke` legs are load-bearing for this**, not just for consuming
coal and coke — they add 1.68 tar per raw-coal and flip the block from fuel-short to fuel-positive.
The ratio is scale-free, so self-sufficiency holds at any size.

```
tar needed = 3.32 × (1 + p)   vs   4.68 available      →  crossover at p = 40.9 %
```

## Productivity envelope and lifecycle

**The block runs unmodified to +40 %.** Read the horizon in science *tiers*, not unit counts — the
units are grind within a tier:

| | new science packs required |
|---|---|
| mp-3 · `coalbed-mk01` · **`petroleum-gas-mk01`** | **none — current tier** (automation + py-1 + logistic) |
| mp-4 | military |
| mp-5 *(first level that breaks the tar balance)* | military + py-2 |
| `big-mines` *(`aluminium-rock`, no mining fluid)* | py-2 + chemical |

**mp-5 and `big-mines` are the same era** — both py-2, differing only in military vs chemical.

The useful consequence is that **cheaper coal-gas arrives a whole tier before anything stresses this
block.** `petroleum-gas-mk01` needs no new pack (2,875 u across 14 techs, all on packs already in
production) and unlocks `low-distillate-to-coal-gas` at **100 low-distillate → 200 coal-gas, a 2:1
gain** against `distilled-raw-coal`'s 6 gas per raw-coal. Gas stops being the constraint before mp-4
is even reachable.

**That also settles the casting-route question in direct smelt's favour.** Casting's whole case is
2 ore/plate against 10 — 66.7 gas/plate saved at +20 % — bought with borax, graphite, creosote, the
tar-refining tree and `eaf-mk01` at 18 MW each. Cheap gas devalues the saving while leaving the power
penalty intact (14.8 vs 9.4 MW per plate/s). **Casting only wins back if gas stays expensive *and*
throughput needs to exceed ~1.5 plate/s.**

| prod | plate /s | tar used | **genset MW** | net import | buildings |
|---|--:|--:|--:|--:|--:|
| 0 % | 1.100 | 71 % | 4.05 | 8.35 MW | 21 |
| +10 % | 1.210 | 78 % | 3.06 | 9.34 MW | 21 |
| **+20 %** | **1.320** | **85 %** | **2.07** | **10.33 MW** | **21** |
| +30 % | 1.430 | 92 % | 1.08 | 11.32 MW | 21 |
| +40 % *(mp-4)* | 1.541 | **99.3 %** | 0.09 | 12.31 MW | **19** |
| +40.9 % | **1.551** | 100 % | 0 | 12.40 MW | 19 |

**The genset is temporary.** Its fuel is the tar the furnaces don't burn, and that shrinks as
productivity rises — 2.07 MW today, 1.08 at +30 %, **0.09 at +40 %**. At mp-4 pull the
`oil-boiler-mk01` and `steam-engine` and recover 2 buildings, 9 circuits and the 10 intermetallics.
Build it now, remove it then.

**Past the crossover it caps rather than breaks.** Output holds at **1.551 plate/s** at +50 %, +100 %,
any level — the tar can only fuel 2.326 furnaces' worth of smelting. What degrades is the *balance*:
the ore the furnaces can't process backs up, so the drills stall intermittently and the block hunts
instead of settling. No deadlock.

**And the fix is nearly free**, because stone furnaces need 1.20 MJ/s per plate/s against steel's 9.00.
Leave the steel furnaces tar-fed at their ceiling and give the overflow to stone furnaces on raw-coal:

| prod | ore supports | tar can fuel | gap | **stone-furnaces** | **extra raw-coal/s** |
|---|--:|--:|--:|--:|--:|
| +50 % | 1.651 | 1.551 | 0.100 | **1** | **0.04** |
| +60 % | 1.761 | 1.551 | 0.210 | 2 | 0.08 |
| +100 % | 2.201 | 1.551 | 0.650 | 4 | 0.26 |

One 5-stone building carries it through +50 %.

## Direct smelt, and why

`aluminium-plate-1` is **10 ore → 1 plate** against the casting route's 2 ore → 1. It is five times
worse on ore and wins anyway on everything else at this scale:

| | casting route | **direct smelt** |
|---|--:|--:|
| ore per plate | 2 | **10** |
| **MW per plate/s** | 14.8 | **9.4** |
| imports | raw-coal, borax, water, coke | **raw-coal, electricity** |
| byproducts to place | creosote, rich-clay, 5 oils, ash | **tar** |
| recipes | 15 | **4** |

`eaf-mk01` is 18 MW each and the casting chain needs six of them — that is where its power goes.
Direct smelt skips the EAF, ball-mill, casting unit, borax, graphite, sand-casting, creosote and the
entire tar-refining tree. **It is cheaper per plate on power despite the ore penalty.**

The ore cost only bites if you need high throughput, and aluminium is construction material:
**1 plate/s ≈ 15 inserters/min, or a `fluid-drill-mk02` every 20 s.**

## Recipe table

```
┌───────────────────────┬──────────────────┬───────┬──────┬───────┬───────┬───────────┐
│ Recipe                │ Factory          │ Frac  │ Cnt  │ Size  │ Load  │ MW load   │
├───────────────────────┼──────────────────┼───────┼──────┼───────┼───────┼───────────┤
│ distilled-raw-coal    │ distilator       │ 2.98  │   3  │ 8x8   │  99 % │    1.491  │
│ coal-gas              │ distilator       │ 1.34  │   2  │ 8x8   │  67 % │    0.671  │
│ coal-gas-from-coke    │ distilator       │ 0.67  │   1  │ 8x8   │  67 % │    0.335  │
│ (mining ore-aluminium)│ fluid-drill-mk02 │11.00  │  11  │ 5x5   │ 100 % │    9.900  │
│ aluminium-plate-1     │ steel-furnace    │ 1.98  │   2  │ 2x2   │  99 % │ tar 59.40 │
│ (steam 8.40/s)        │ oil-boiler-mk01  │ 0.14  │   1  │ 5x5   │  14 % │ tar 10.36 │
│ (power)               │ steam-engine     │ 0.27  │   1  │ 3x5   │  27 % │  −2.072   │
└───────────────────────┴──────────────────┴───────┴──────┴───────┴───────┴───────────┘
```

**21 buildings · 707 tiles · 10.33 MW net import · 185 electronic-circuit to build**

**Inputs** (/s): **raw-coal 14.91** · **water 8.40** · electricity **10.33 MW** *(12.40 drawn − 2.07 made)*

**Outputs** (/s): **aluminium-plate 1.32** · iron-oxide 0.43 · ash 0.13

**Tar is fully consumed:** 69.76 made → 59.40 to the furnaces, 10.36 to the boiler. **Nothing leaves.**
The genset is two buildings for a 17 % cut in the power bill and it removes the block's only fluid
export — see § Why the genset is not optional.

**Internal, net zero:** coal 4.47 · coke 2.68 · coal-gas 110.00 · ore-aluminium 13.20

Three rows sit at 99–100 % and two at 67 %. The 67 % rows are the coal and coke legs, which are sized
by what the first leg throws off rather than by demand — they cannot be loaded further without more
raw-coal.

## Circuit cost — 185, nearly all in the drills

| entity | n | circuits/ea | total |
|---|--:|--:|--:|
| `fluid-drill-mk02` | 11 | 16 *(10 direct + 2 × `electric-mining-drill` × 3)* | **176** |
| `oil-boiler-mk01` | 1 | 9 *(3 × `electric-mining-drill`)* | 9 |
| `distilator` | 6 | 0 | 0 |
| `steel-furnace` | 2 | 0 | 0 |
| `steam-engine` | 1 | 0 | 0 |

`distilator` is `pipe + steam-engine + inductor1 + small-parts-01 + copper-plate + iron-plate`,
`steel-furnace` is `refined-concrete + steel-plate`, `steam-engine` is `pipe + small-parts-01 +
iron-plate` — **none carries a circuit.** The bill is effectively the drills, so it scales with drill
count: **16 per drill, 1.2 ore/s each.**

## Why the genset is not optional

Without it the block exports **10.36 tar/s**, and tar is a liquid fuel — burn-or-route under the
ruleset, never void. An 80,000 tank buys **2 h 09 m** before it backs up and stalls all six
distilators, so a buffer only defers the problem:

| build | tar surplus /s | 80k tank fills in |
|---|--:|--:|
| ⅔ belt | 6.60 | 3 h 22 m |
| **1 belt** | **10.36** | **2 h 09 m** |
| 2 belts | 20.70 | 1 h 04 m |

Two buildings close it instead: `oil-boiler-mk01` at **effectivity 2** and `steam-engine` at
**effectivity 0.5** multiply to exactly **1:1**, so 2.072 MJ/s of tar becomes **2.072 MW**.

```
tar 10.36/s × 0.2 MJ = 2.072 MJ/s  →  ×2 (boiler) = 4.144 MJ/s heat
                                   →  8.40 steam/s @250°C  →  ×0.5 (engine) = 2.072 MW
```

Both run cold — 14 % and 27 % load — so they absorb any transient without resizing.

**Counter-intuitively the genset matters more at 0 % productivity**, where the furnaces burn only
71 % of the tar instead of 85 % and the surplus doubles to 20.3/s. Mining productivity quietly halves
the tar problem as well as adding plate.

## Bootstrap note

**`fluid-drill-mk02` costs 20 aluminium-plate each — 220 plate to stand up all eleven.** The block
needs 167 seconds of its own output to build its own mining. Not a blocker, but it means the first
drill has to come from stock, and expanding by a drill costs 20 plate plus 16 circuits.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| **aluminium-plate** | 1.32 | the product — `duralumin-1` (4 plate → 1), `engine-unit`, poles, robots | — | — |
| ~~tar~~ | **0** | **consumed internally** — 59.40 to the furnaces, 10.36 to the boiler | 2 buildings | belting it out as fuel; `tar-to-carbolic` needs steam and makes rich-clay; `tar-refining` emits five oils |
| **iron-oxide** | 0.43 | `iron-oxide-smelting` | trickle, co-locate | `py-iron-oxide` needs an hpf |
| **ash** | 0.13 | `py-limestone`, `planter-box`, `log3` | trickle | nothing — 0.13/s is noise |

**Tar is the only stream that matters.** 10.36/s is 2.07 MJ/s; burning it on site returns ~2.07 MW
against the block's 12.40 MW draw, a 17 % offset for two buildings. Venting is not an option — tar is a
liquid fuel, so under the ruleset it is burn-or-route, never void.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **the boiler or engine stops** | tar then has no sink. Every gas recipe is multi-output on tar, so a full tar line stalls all six distilators → coal-gas stops → **the drills stop** → total block stop. Both run at 14 %/27 %, so this is an outage risk rather than a sizing one — but it is the one failure that takes the whole block down |
| 2 | **the drills and `distilled-raw-coal` are at 99–100 %** | zero headroom on the two rows that set output. A drill outage drops plate proportionally; a distilator outage starves eleven drills |
| 3 | **the furnaces are at 99 %** | 1.98 of 2. They are 2×2 and five stone — the cheapest pad in the block by a wide margin |
| 4 | coal-gas 110.00/s | one pipe feeding all eleven drills. An interruption stops mining but nothing cascades upstream; the distilators simply back up on tar and stall |
| 5 | raw-coal 14.91/s | a full yellow belt. Anything less throttles proportionally — no cliff |

**The tar line is the single point of failure.** Everything else degrades gracefully.

## Scaling

Linear in drills; each drill is exactly 10 coal-gas/s and 1.2 ore/s at +20 %.

| raw-coal /s | 9.49 | **14.91** | 29.81 |
|---|--:|--:|--:|
| belt | ⅔ | **1 yellow** | 2 yellow |
| drills | 7 | **11** | 22 |
| distilators | 2+1+1 = 4 | **3+2+1 = 6** | 6+3+2 = 11 |
| `steel-furnace` | 2 | **2** | 4 |
| — furnace load | **63 %** | **99 %** | 99 % |
| buildings | 13 | **19** | 37 |
| MW | 7.9 | **12.40** | 24.8 |
| **plate /s** (+20 %) | 0.84 | **1.32** | 2.64 |
| plate /s (0 %) | 0.70 | 1.10 | 2.20 |
| tar surplus /s | 6.6 | **10.36** | 20.7 |

**One belt is the sweet spot.** The ⅔-belt build wastes a furnace at 63 % load; one belt lands two
furnaces at 99 % and nearly doubles the output for six more buildings. Past two belts, stamp.

## Solver commands

Two solves — the gas chain is demand-driven on coal-gas, the smelter is supply-driven on ore.

**`--max-import "raw-coal:40"` is load-bearing even though it never binds** (actual draw is 14.91).
Capping an item converts it from a free import — absent from the objective — into an import variable
priced at `maxRecipeCost × 100` (`MatrixSolver.ts:850`), so the LP economises on it and runs the coal
and coke legs instead of stranding them:

| | uncapped | **capped** |
|---|--:|--:|
| distilators | 4 | 6 |
| raw-coal /s | **18.33** | **14.91** |
| coal out /s | **5.50 stranded** | 0 |
| tar /s | **55.00** | **69.76** |

**Without the cap the block does not work at all** — 55.00 tar/s against the furnaces' 59.40 leaves it
7 % fuel-short, on top of burning 3.42 more raw-coal. The cap is what makes the tar close.

```bash
npx tsx src/cli.ts solve \
  --recipes "distilled-raw-coal,coal-gas,coal-gas-from-coke" \
  --target "coal-gas:110" --time 1 \
  --max-import "raw-coal:40" \
  --factory "distilled-raw-coal:distilator" \
  --factory "coal-gas:distilator" \
  --factory "coal-gas-from-coke:distilator" \
  --solver simplex \
  --unlocked
```

```bash
npx tsx src/cli.ts solve \
  --recipes "aluminium-plate-1" \
  --input "ore-aluminium:13.2" --time 1 \
  --factory "aluminium-plate-1:steel-furnace" \
  --solver simplex \
  --unlocked
```

**The mining is outside both solves.** `ore-aluminium` has `required_fluid: coal-gas`,
`fluid_amount: 100`, `mining_time: 1`, so per the ÷10 rule each `fluid-drill-mk02` (speed 1) draws
**10.00 coal-gas/s** and yields **1.00 ore/s base, 1.20 at +20 % mining productivity**. Fluid per ore
is `fluid_amount / 10 = 10` and is **unaffected by drill speed or tier** — only mining productivity
moves it, via `10 / (1 + p)`. Add the drills' 11 × 25 = 275 tiles and 9.90 MW to the solver totals.

**The second solve reports 11.88 MW electric for the furnaces — that is fuel, not electricity.**
`steel-furnace` has `fluid_energy_source` and no `burner_prototype`, so `resolveFuel` returns null and
`--fuel` would be silently dropped. Hand-derived:

```
furnace fractional = (ore 13.2/s ÷ 10) × 6 s ÷ speed 4   =  1.980
fuel               = 1.980 × 6.00 MW ÷ (0.20 MJ × eff 1) =  59.40 tar/s
electrical         = 0                                    (all of it is fuel)
```

True electric is therefore **distilators 2.50 + drills 9.90 = 12.40 MW**.

## Build materials

Distinct construction materials across this block's 5 building types, separate from flow imports:

`aluminium-plate` · `copper-plate` · `electric-mining-drill` · `electronic-circuit` · `engine-unit` ·
`fluid-drill-mk01` · `gasifier` · `inductor1` · `intermetallics` · `iron-plate` · `lab` · `pipe` ·
`refined-concrete` · `small-parts-01` · `steam-engine` · `steel-plate`

Mostly early-tier — no duralumin, no titanium, no graphite. Two things to have on hand:
**`fluid-drill-mk01`** (one per mk02, so eleven) and **`electric-mining-drill`** (2 per drill plus 3
for the boiler, so 25).

**`intermetallics` is the one to check** — 10 of them, needed only by `oil-boiler-mk01`, and it is the
deepest material in the list. If it is short, the genset is the part to defer: run the block with the
tar belted out instead (19 buildings, 12.40 MW, 10.36 tar/s export) and retrofit the boiler later.
Nothing else in the block touches it. Inferred from the recipe graph, not from save state.
