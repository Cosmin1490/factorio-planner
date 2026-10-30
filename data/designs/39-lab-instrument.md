# 39 — Lab instrument — 1.17/min, 14 buildings

Sized to **design 36's exact draw**. `lab-instrument` is the deeper of the two things design 36 buys
to make plasmids, and buying it there was the right call precisely because the chain beneath it is
nine stages deep — this block is that depth made explicit.

**Nothing here is above 13 % utilisation.** Rated power is 67 MW; actual draw is **1.33 MW**. It is a
chain-length block, not a throughput one.

```
lab-instrument    [U] [crafting,     7 s]  equipment-chassi 2 + lens 3 + rubber 10
                                           + small-parts-01 5            →  2
equipment-chassi  [U] [crafting,     7 s]  fenxsb-alloy 1 + electronic-circuit 1
                                           + tin-plate 10                →  2
lens              [U] [glassworks,   3 s]  boron-trioxide 1 + molten-glass 100  →  3
glass-2           [U] [glassworks,   4 s]  crushed-quartz 2              →  molten-glass 30
crushing-quartz   [U] [crusher,      1 s]  ore-quartz 5    →  crushed-quartz 1 + stone 1 (50%)
boron-trioxide    [U] [hpf,          3 s]  coke 1 + boric-acid 200       →  1
boric-acid        [U] [electrolyzer, 2 s]  diborane 100 + water 500      →  500
diborane          [U] [electrolyzer, 7 s]  borax 10 + hydrogen 250       →  150
```

## Recipe table

```
┌──────────────────┬────────────────────────┬────────┬───────┬────────┬───────────┐
│ Recipe           │ Factory                │  frac  │ Count │  Util  │ Power     │
├──────────────────┼────────────────────────┼────────┼───────┼────────┼───────────┤
│ glass-2          │ glassworks-mk01        │  0.130 │   1   │  13.0% │ acetylene │
│ lab-instrument   │ automated-factory-mk01 │  0.069 │   1   │   6.9% │ electric  │
│ equipment-chassi │ automated-factory-mk01 │  0.069 │   1   │   6.9% │ electric  │
│ hydrogen         │ electrolyzer-mk01      │  0.033 │   1   │   3.3% │ electric  │
│ boron-trioxide   │ hpf                    │  0.030 │   1   │   3.0% │ electric  │
│ lens             │ glassworks-mk01        │  0.029 │   1   │   2.9% │ acetylene │
│ diborane         │ electrolyzer-mk01      │  0.019 │   1   │   1.9% │ electric  │
│ iron-stick       │ automated-factory-mk01 │  0.019 │   1   │   1.9% │ electric  │
│ copper-cable     │ automated-factory-mk01 │  0.019 │   1   │   1.9% │ electric  │
│ crushing-quartz  │ jaw-crusher            │  0.013 │   1   │   1.3% │ electric  │
│ iron-gear-wheel  │ automated-factory-mk01 │  0.013 │   1   │   1.3% │ electric  │
│ bolts            │ automated-factory-mk01 │  0.008 │   1   │   0.8% │ electric  │
│ boric-acid       │ electrolyzer-mk01      │  0.008 │   1   │   0.8% │ electric  │
│ small-parts-01   │ automated-factory-mk01 │  0.005 │   1   │   0.5% │ electric  │
└──────────────────┴────────────────────────┴────────┴───────┴────────┴───────────┘
```

**14 buildings · 647 tiles · 1.33 MW electric + 95.5 acetylene/min**

```
automated-factory-mk01  x7   343 tiles      glassworks-mk01  x2    98 tiles
electrolyzer-mk01       x3   108 tiles      jaw-crusher      x1    49 tiles
hpf                     x1    49 tiles
```

## Imports — 10

| | /min | note |
|---|--:|---|
| water | 175.50 | `boric-acid` 117 + `hydrogen` 58.5 |
| **acetylene** | **95.5** | both glassworks — `glass-2` 78.0 + `lens` 17.5 |
| **ore-quartz** | **19.50** | **no producer in any current design** — see § Risks |
| rubber · tin-plate | 5.85 each | |
| iron-plate | 5.12 | `iron-gear-wheel` + `iron-stick` |
| copper-plate | 2.19 | → `copper-cable` |
| borax | 1.56 | → `diborane` |
| fenxsb-alloy | 0.59 | see § What importing the alloy bought |
| coke · electronic-circuit | 0.58 each | |

**Exports** (/min): **lab-instrument 1.17** · stone 1.95 · oxygen 19.50

## `glass-2` over `glass-1` is a 1.8× quartz saving

The obvious route is `glass-1` (6 ore-quartz → 10 molten-glass). Going through the crusher first is
much better:

| route | ore-quartz per molten-glass |
|---|--:|
| `glass-1` | 0.600 |
| **`crushing-quartz` → `glass-2`** | **0.333** |

`glass-2` is 30 molten-glass per 2 crushed-quartz, and `crushing-quartz` is 1 crushed-quartz per
5 ore-quartz — so **15 molten-glass per crushed-quartz** carries the ratio. That is what makes the
import 19.50 ore-quartz/min rather than 35, and it throws off **stone 1.95/min** at 50 % probability
as a free byproduct.

## The glassworks are fluid burners

Both draw **zero electric** — `glassworks-mk01` is `fluid_energy_source`, `burns_fluid: true`,
effectivity 1, so its "10 MW" is acetylene at 1.0 MJ/unit:

```
glass-2  13.0% duty  ->  1.30 MW  ->  1.30 acetylene/s  =  78.0 /min
lens      2.9% duty  ->  0.29 MW  ->  0.29 acetylene/s  =  17.5 /min
                                                            ─────
                                                            95.5 /min
```

**`glass-2` is 82 % of the acetylene** because a glassworks burns proportional to its 10 MW rating and
`glass-2` is the busier of the two. `--fuel` is a **silent no-op** on fluid-burner entities and
`totalPowerMW` folds the fuel into the electric total, so the 1.33 / 95.5 split above is hand-derived.

## What importing the alloy bought

`fenxsb-alloy-2` [smelter, 20 s] is `2 nexelit-plate + 1 sb-oxide + 7 iron-plate → 2`, and
`nexelit-plate-2` needs `clean-nexelit` [washer] which is `3 nexelit-ore + 100 water → 1 +
100 muddy-sludge`.

| | alloy made | **alloy bought** |
|---|--:|--:|
| buildings | 17 | **14** |
| tiles | 901 | **647** |
| MW | 2.36 | **1.33** |
| **muddy-sludge out** | 58.50 /min | **0** |

**−3 buildings and the only byproduct stream disappears.** `clean-nexelit` was the sludge source at
100 per craft; dropping it also drops the recovery electrolyzer it would otherwise need, so against a
version that actually handles its waste it is **−4**. Gone as imports: `nexelit-ore` 1.76 and
`sb-oxide` 0.29, with iron-plate falling 7.17 → 5.12.

> **The cost is the digosaurus link.** `nexelit-ore` comes from dig sites at `1 guts →
> 1 nexelit-ore`, and design 17 emits **guts 27/min** as waste. 1.76/min is a rounding error against
> that. Worth revisiting if a pen is ever built — dig rates are script-driven and absent from the
> export, measured at ~4 trips/min each.

## Rubber — priced, keep buying it

| | rubber bought | rubber made |
|---|--:|--:|
| buildings | **14** | 18 |
| MW | **1.33** | 3.05 |
| imports | **10** | 15 |
| **aromatics** | — | **585 /min (9.75/s)** |
| anthracene-oil | — | 585 /min |
| water | 175.50 | **3,159** |
| steam out | — | +2,925/min (≈12 MW through engines) |

`rubber-01` wants **50 polybutadiene per rubber**, and `polybutadiene` is
`1 titanium-plate + 200 aromatics + 1000 water → 100 + 1000 steam`. That is **+9.75 aromatics/s** on a
bus already carrying design 17's 25/s and design 32's 20/s. The 48.75 steam/s it throws off is the one
argument for it and is not enough.

## Terminal outputs and their sinks

| output | /min | sink chosen | what it beat |
|---|--:|---|---|
| **lab-instrument** | 1.17 | **design 36** — the product | — |
| stone | 1.95 | joins the base stone pool (crushing/saline/disposal) | nothing; stone has no voidable route |
| oxygen | 19.50 | **vent** — pre-approved, inert | burning it; there is nothing to burn it with here |

**Nothing is stranded.** The block has no fluid byproducts at all once the alloy is bought.

## Risks

| | risk | why |
|---|---|---|
| 1 | **`ore-quartz` 19.50/min has no producer** | `mining-quartz [ground-borer]` needs drill-head + lubricant + coal-gas; `calcinate-separation` and `sea-sponge-processing-01` are the alternatives. **Nothing in the catalogue mines quartz.** This is the gate on the whole block |
| 2 | **acetylene 95.5/min is a single fluid thread** | both glassworks on one pipe; if it runs dry the glass stops and `lens` stalls four steps from the product |
| 3 | nine sequential stages at <13 % | the chain is long and thin, so a stall anywhere propagates to the product with no buffering between stages. Every intermediate wants a tank or chest |
| 4 | `fenxsb-alloy` 0.59/min | single external thread for the `equipment-chassi` leg |

**Risk 1 is the one to settle before building.** At 0.325 ore-quartz/s this block alone does not
justify a mine — **size the quartz source against the whole base's glass demand instead.** The
electronic-circuit complex wants 1.36 glass/s, roughly 4× this, and `glass-2` is the efficient route
for that too.

## Solver command

The eleven `--max-import` caps are what force the chain internal — drop any one and the LP buys that
step instead of building it. `--fuel` on the two glassworks is recorded for intent but is a **no-op**;
acetylene is hand-derived as `duty × 10 MW ÷ 1.0 MJ`. Fractional counts come from the same command at
`--target "lab-instrument:1170"` ÷ 1000.

```bash
npx tsx src/cli.ts solve \
  --recipes "lab-instrument,equipment-chassi,lens,glass-2,crushing-quartz,boron-trioxide,boric-acid,diborane,hydrogen,small-parts-01,iron-gear-wheel,bolts,iron-stick,copper-cable" \
  --target "lab-instrument:1.17" --time 60 \
  --max-import "equipment-chassi:0.001" \
  --max-import "lens:0.001" --max-import "boron-trioxide:0.001" \
  --max-import "boric-acid:0.001" --max-import "diborane:0.001" --max-import "hydrogen:0.001" \
  --max-import "small-parts-01:0.001" --max-import "iron-gear-wheel:0.001" \
  --max-import "bolts:0.001" --max-import "iron-stick:0.001" --max-import "copper-cable:0.001" \
  --max-import "molten-glass:0.001" --max-import "crushed-quartz:0.001" \
  --factory "lab-instrument:automated-factory-mk01" \
  --factory "equipment-chassi:automated-factory-mk01" \
  --factory "small-parts-01:automated-factory-mk01" \
  --factory "iron-gear-wheel:automated-factory-mk01" \
  --factory "bolts:automated-factory-mk01" \
  --factory "iron-stick:automated-factory-mk01" \
  --factory "copper-cable:automated-factory-mk01" \
  --factory "lens:glassworks-mk01" \
  --factory "glass-2:glassworks-mk01" \
  --factory "crushing-quartz:jaw-crusher" \
  --factory "boron-trioxide:hpf" \
  --factory "boric-acid:electrolyzer-mk01" \
  --factory "diborane:electrolyzer-mk01" \
  --factory "hydrogen:electrolyzer-mk01" \
  --fuel "lens:acetylene" --fuel "glass-2:acetylene" \
  --solver simplex \
  --unlocked
```

**Do not omit `--factory`.** Without the overrides the solver auto-picks `assembling-machine-3`,
`glassworks-mk04` and `electrolyzer-mk04` — all locked — and `assembling-machine-3` defaults to coal,
which puts a spurious `coal`/`ash` pair in the import list.

The **rubber-inlined variant**, for comparison — add three recipes and three factories:

```bash
# ... as above but:
  --recipes "<as above>,rubber-01,polybutadiene,carbon-black" \
  --max-import "rubber:0.001" --max-import "polybutadiene:0.001" --max-import "carbon-black:0.001" \
  --factory "rubber-01:heavy-oil-refinery-mk01" \
  --factory "polybutadiene:cracker-mk01" \
  --factory "carbon-black:reformer-mk01" \
# -> 18 buildings, 3.05 MW, aromatics 585/min, anthracene-oil 585/min, water 3,159/min
```

## Build materials

Distinct construction materials across this block's 5 building types, separate from flow imports:

`aluminium-plate` · `copper-plate` · `electronic-circuit` · `gearbox-mk01` · `inductor1` · `inserter` ·
`intermetallics` · `iron-plate` · `lab` · `shaft-mk01` · `small-parts-01` · `steam-engine` ·
`steel-plate` · `stone-brick` · `tar-processing-unit`

```
 215x small-parts-01    170x steel-plate       90x aluminium-plate   75x iron-plate
  60x copper-plate       50x electronic-circuit 50x stone-brick      21x inserter
  20x steam-engine       14x intermetallics     14x gearbox-mk01     14x shaft-mk01
  13x inductor1           6x lab                 3x tar-processing-unit
```

**`gearbox-mk01` and `shaft-mk01` at 14 each are the drivetrain gate** — both come in through the
three `electrolyzer-mk01`, and `gearbox-mk01` needs fish-oil. **`tar-processing-unit` ×3** and
**`lab` ×6** likewise arrive inside the electrolyzers rather than being obvious from the recipe list.
`aluminium-plate` 90 comes from the seven `automated-factory-mk01`. Inferred from the recipe graph,
not from save state.
