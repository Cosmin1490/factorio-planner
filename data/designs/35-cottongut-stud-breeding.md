# 35 — Cottongut stud breeding — 1.0633 mk01/min, 29 buildings

Everything here is **per minute**. `prandium-lab-mk01` is base speed 0.047619, so an unmoduled 30 s
recipe takes 630 s; at a 1 s time base every rate in this block rounds below the solver's ~0.01
display floor and three real imports vanish from the output entirely.

```
cottongut-pup-mk01-raising  [U] [cottongut, 30 s]  fish-egg 2 + cottongut-food-01 1
                                                   + cottongut-mk01 2 + seaweed 10
                                →  cottongut-mk01 1 + cottongut-mk01 1 (50%)
                                 + cottongut-pup 1 (50%) + cottongut-pup-mk01 3-8 (80%)
cottongut-mature-basic-01   [U] [cottongut, 50 s]  wood 1 + cottongut-food-01 1
                                                   + cottongut-pup-mk01 1 + moondrop 3
                                →  cottongut-mk01 1
```

**Read the probabilities.** Expected yields are `1.5` cottongut-mk01, `0.5` cottongut-pup and
`(3+8)/2 × 0.8 = 4.4` cottongut-pup-mk01. Face values overstate pup-mk01 by 1.8×. Net economics are
`−2 + 1.5 + 4.4 = +3.9` mk01 per raising craft.

## Two facts set the whole block

**1. The 7.33 : 1 ratio is forced.** `cottongut-pup-mk01` has exactly one unlocked consumer —
`cottongut-mature-basic-01`. No compost recipe, no void. And the breeder is **multi-output**, so it
stalls when any of its four outputs backs up. Every pup must be matured:

```
4.4 pup-mk01 per raising craft ÷ 1 per maturing × (50 s ÷ 30 s)  =  7.33 maturing labs per raising lab
```

**2. Bio modules are 21×, and they are the difference between 29 buildings and 36.** Every bio
building in this block lands on **exactly 1.00 effective speed** at full slots — clearly the mod's
intent:

| building | slots | module | multiplier | base → effective |
|---|--:|---|--:|---|
| `prandium-lab-mk01` | 20 | `cottongut-mk01` | **21×** | 0.04762 → 1.00 |
| `moondrop-greenhouse-mk01` | 16 | `moondrop` | 17× | 0.05882 → 1.00 |
| `ralesia-plantation-mk01` | 12 | `ralesia` | 13× | 0.07692 → 1.00 |
| `seaweed-crop-mk01` | 10 | `seaweed` | 11× | 0.09091 → 1.00 |
| `fish-farm-mk01` | 7 | `fish` | 8× | 0.12500 → 1.00 |

Moduled, the maturing bank collapses from 8 labs to **1**, and output goes 3.04 → 63.80 mk01/h for
one extra building.

## Recipe table

```
┌────────────────────────────┬──────────────────────────┬───────┬───────┬────────┬────────────────────┐
│ Recipe                     │ Factory                  │ frac  │ Count │  util  │ Modules            │
├────────────────────────────┼──────────────────────────┼───────┼───────┼────────┼────────────────────┤
│ cottongut-mature-basic-01  │ prandium-lab-mk01        │ 1.000 │   1   │ 100.0% │ 20x cottongut-mk01 │
│ moondrop-1                 │ moondrop-greenhouse-mk01 │ 3.351 │   4   │  83.8% │ 16x moondrop       │
│ ralesia-1                  │ ralesia-plantation-mk01  │ 2.109 │   3   │  70.3% │ 12x ralesia        │
│ seaweed-1                  │ seaweed-crop-mk01        │ 0.381 │   1   │  38.1% │ 10x seaweed        │
│ ralesia-seeds              │ botanical-nursery        │ 0.186 │   1   │  18.6% │                    │
│ saline-water               │ washer                   │ 0.185 │   1   │  18.5% │                    │
│ cottongut-pup-mk01-raising │ prandium-lab-mk01        │ 0.137 │   1   │  13.7% │ 20x cottongut-mk01 │
│ soil                       │ soil-extractor-mk01      │ 0.127 │   1   │  12.7% │                    │
│ breed-fish-1               │ fish-farm-mk01           │ 0.126 │   1   │  12.6% │  7x fish           │
│ hydrogen                   │ electrolyzer-mk01        │ 0.082 │   1   │   8.2% │                    │
│ moondrop-seeds             │ botanical-nursery        │ 0.064 │   1   │   6.4% │                    │
│ breed-fish-egg-1           │ fish-farm-mk01           │ 0.056 │   1   │   5.6% │  7x fish           │
│ phytoplankton              │ plankton-farm            │ 0.053 │   1   │   5.3% │                    │
│ fiber-01                   │ wpu-mk01                 │ 0.052 │   1   │   5.2% │                    │
│ powdered-ralesia-seeds     │ pulp-mill-mk01           │ 0.033 │   1   │   3.3% │                    │
│ cottongut-food-01          │ assembling-machine-2     │ 0.031 │   1   │   3.1% │ tall-oil-canister  │
│ starch                     │ solid-separator          │ 0.025 │   1   │   2.5% │                    │
│ wood-seeds                 │ assembling-machine-2     │ 0.020 │   1   │   2.0% │ tall-oil-canister  │
│ fiberboard                 │ pulp-mill-mk01           │ 0.011 │   1   │   1.1% │                    │
│ chlorine                   │ electrolyzer-mk01        │ 0.007 │   1   │   0.7% │                    │
│ waste-water-void           │ quenching-tower          │ 0.004 │   1   │   0.4% │                    │
│ log-wood-fast              │ wpu-mk01                 │ 0.003 │   1   │   0.3% │                    │
│ fill-tall-oil-canister     │ barrel-machine-mk01      │ 0.001 │   1   │   0.1% │                    │
│ (steam)                    │ oil-boiler-mk01          │ 0.003 │   1   │   0.3% │ burns acetylene    │
└────────────────────────────┴──────────────────────────┴───────┴───────┴────────┴────────────────────┘
```

**29 buildings · ~1,746 tiles · 4.96 MW electric · 8.044 machines of work = 28 % average**

**Three rows carry 80 % of it** — maturing, moondrop, ralesia. This is a horticulture block with two
labs bolted on, not a breeding block with support.

## Imports and exports

| import | /min | /s | delivery | one buffer lasts |
|---|--:|--:|---|--:|
| water | 1,392.46 | 23.21 | pipe | — |
| **acetylene** | **24.22** | 0.404 | 40 kL `py-tank-4000` | **27.5 h** ← binding |
| stone | 5.53 | 0.092 | belt, off the tin line | — |
| tin-plate | 0.74 | 0.0123 | iron chest | 72.1 h |
| log | 0.66 | 0.0110 | iron chest | 80.8 h |
| treated-wood | 0.37 | 0.0062 | iron chest | 144 h |
| grade-1-tin | 0.21 | 0.0035 | iron chest | 254 h |
| small-lamp | 0.15 | 0.0025 | iron chest | 178 h |

| export | /min | /s | sink |
|---|--:|--:|---|
| **cottongut-mk01** | **1.0633** | 0.0177 | **the product** — one every 56 s |
| **cottongut-pup** | **0.1363** | 0.0023 | **`caged-cottongut-1`** — one every 7.3 min; **7 needed = 51 min** |
| oxygen | 45.75 | 0.763 | pre-approved vent, or pipe to design 24's BOF (which wants 90/s) |
| biomass | 1.97 | 0.0328 | 0.25 MJ `biomass` fuel, burns to nothing. Wanted elsewhere |
| **chlorine** | **1.84** | 0.0306 | **unresolved — see § Closing the chlorine** |
| tall-oil | 1.38 | 0.0230 | 1.00 MJ fuel, canister it |
| **black-liquor** | **1.23** | 0.0205 | **none** |

Acetylene drives the oil-boiler for **98.15 steam/min**. *Hand-derived* — boilers are entities with a
`fluid_energy_source` (effectivity **2**, nested, not the top-level `effectivity` field), so they sit
outside the solve the way mining does.

**Two tanks is wrong; one is right.** Creosote was eliminated by importing `treated-wood` rather than
making it — `treated-wood` is the only creosote consumer and wants **100 per craft** to serve 0.49
fiberboard/min four steps downstream of the animal food. 0.37 treated-wood/min in a chest replaces a
pipe and a 36-hour tank.

**`log` not `wood`.** `log-wood-fast` is 4 log → 40 wood, both stack 100, so importing logs is a
**10× cut in inbound tonnage** for one 6×6 building. Same compounding stack-and-rate lever as rule 21.

## The fish farms are there for the waste-water, not the eggs

The single least obvious thing in this block, and it was nearly removed before being understood:

```
cottongut-food-01  needs  starch
starch             needs  fiberboard
fiberboard         needs  sodium-hydroxide
sodium-hydroxide   ←  ONE unlocked source: chlorine [electrolyzer], co-producing 20 chlorine
chlorine           ←  only clean sink: waste-water-void
waste-water        ←  ONLY source in this block: the two fish farms
```

Import the fish-eggs and delete the farms, and **chlorine strands five steps away in a subsystem that
looks unrelated.** The fallback sink, `chloride-void-iron-oxide` (1 iron-plate + 60 chlorine →
1 iron-oxide), costs an iron import and emits iron-oxide needing its own home.

Leeching eggs off design 29 was priced and is attractive in isolation — cottongut needs **0.00913
fish-egg/s, which is 4.6 % of what design 29 already circulates**, and in design 29's upgraded end
state (`breed-fish-2` + `a-select`) it fits in existing headroom at **+4.2 % on the breed farm, zero
new buildings**. It is **not taken** because of the chlorine coupling above. Revisit only alongside a
chlorine answer.

## Closing the chlorine — priced, needs a solve

**Chlorine is the one ruleset violation in this design as written.** 1.84/min leaves the block and it
is on the never-vent list. The balance:

```
chlorine made    3.675 /min   (from the 0.367 NaOH fiberboard needs)
waste-water      9.27  /min   → absorbs only 1.855
surplus          1.820 /min   (solver reports 1.84 — model reproduces it)
```

**Running the fish farms at roughly double closes it exactly, and pays you fish for doing it:**

| | now | chlorine-closed | breed farm 100 % |
|---|--:|--:|--:|
| surplus fish /min | 0 | **0.338** | 1.82 |
| egg farm | 5.6 % | **9.1 %** | 24 % |
| breed farm | 12.6 % | **28.9 %** | 100 % |
| biomass net /min | +1.97 | **+1.32** | −1.52 |
| chlorine surplus | 1.84 | **0** | 0 |
| stone /min | 5.53 | ~9.2 | ~15.3 |
| fish-oil if rendered | — | 4.2 /min | 22.75 /min |

No extra buildings, no extra biomass beyond what `starch` already makes, both farms still under 30 %.
Cost is ~3.7 more stone/min. **This is strictly better than what is specced above** and should replace
it — but it is **hand algebra, not a solve**, because the LP will not produce surplus fish unless
targeted and `--target` takes one item. Verify by targeting `fish-oil` with `full-render-fish` added
and checking cottongut lands back on 1.0633 before building it.

## Biomass closes, and tall-oil beats it as fuel

`starch` produces **5 biomass per craft** alongside its 3 starch — easy to miss, and the only producer
here. `breed-fish-1` at 10 per craft is the only consumer.

```
made 2.48 /min   used 0.51 /min   net +1.97 /min
```

Biomass *could* fuel the two `assembling-machine-2` (they take `chemical`/`biomass`/`jerry`), but at
**0.25 MJ** that is 1.836 biomass/min for 0.459 MJ/min of demand — **93 % of the surplus**, and it
breaks the moment the fish rate rises. `tall-oil-canister` is **10 MJ, 40× denser**: 0.046/min against
the 1.838 tall-oil/min fiberboard hands over as a byproduct, a **4× margin that scales with the block**.
Keep biomass as export.

## Bootstrap — the 40 studs are the only real barrier

Module capital, all self-funding except the labs:

```
40x cottongut-mk01   2 labs x 20   ← you need these first
64x moondrop         4 x 16        ← the farm makes its own
36x ralesia          3 x 12
14x fish             2 x 7
10x seaweed          1 x 10
```

Starting from the creature-chamber's output, module the **maturing** lab first — it is the 100 % row:

| stage | studs held as modules | output |
|---|--:|--:|
| unmoduled | 0 | 3.04 /h |
| maturing moduled | 20 | **22.28 /h** |
| both moduled | 40 | **63.80 /h** |

Unmoduled → first 20 studs is ~6.6 h; the second 20 is ~54 min. **Build it unmoduled and it modules
itself inside a working day.** Note stage 2's 22.28/h is exactly what 8 unmoduled maturing labs would
give — one moduled lab replaces all of them.

Only **2 cottongut-mk01** are needed as breeding stock; raising consumes 2 and returns 1.5 per craft.
Stud count never limits throughput, lab count does.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **cottongut-pup-mk01 backs up** | one sink, and the breeder is 4-output, so a full buffer stalls raising completely. This is why 7.33:1 is not negotiable |
| 2 | **all three breeder outputs are stall paths** | mk01, pup-mk01 *and* cottongut-pup each stop the breeder if unremoved. Every one needs a live destination before the block runs at all, not just the one you want |
| 3 | **chlorine 1.84/min** | currently exported in violation of the ruleset. Closes with the fish bump above |
| 4 | **black-liquor 1.23/min** | no sink at all. Gasifying trades it for acetone, which also has none |
| 5 | acetylene tank 27.5 h | shortest clock in the block by 3×. `py-tank-10000` takes it to 68.8 h |
| 6 | moondrop at 83.8 % | the tightest real row; 16 moondrop per building in modules, self-funding |

## Build notes

- **Five recipe-swap pairs take this to 24 buildings** (rule 20), all sharing a factory type, all
  sub-10 %, all single-in/single-out so the switching logic is trivial:

  | pair | combined frac | saves |
  |---|--:|---|
  | `moondrop-seeds` + `ralesia-seeds` | 0.250 | 1 `botanical-nursery` |
  | `hydrogen` + `chlorine` | 0.089 | 1 `electrolyzer-mk01` |
  | `fiber-01` + `log-wood-fast` | 0.055 | 1 `wpu-mk01` |
  | `cottongut-food-01` + `wood-seeds` | 0.051 | 1 `assembling-machine-2` |
  | `powdered-ralesia-seeds` + `fiberboard` | 0.044 | 1 `pulp-mill-mk01` |

- **Target 1.0633, not a round number.** It is derived from one maturing lab at exactly 100 %. At
  1.0643 the fractional crosses 1.001 and rounds to 2, wasting a 144-tile lab.
- **Buffers in hours, not seconds.** A moduled raising craft is 30 s but a stud emerges every 56 s and
  a pup every 7.3 min. Expect the block to look motionless.
- `prandium-lab-mk02` is locked and barely faster — 0.0494 against 0.0476, **+3.7 %** for 2× the power.
  The lab tier is not a throughput lever; module slots and building count are.
- **This block is a seeder.** Once `cottongut` exists, `cottongut-cub-1` (4 cottongut → 10 pup) plus
  `caged-cottongut-1` (7 pup → 6 cottongut) is **self-amplifying at 2.14× per cycle**, and the stud
  line stops being the pup source. Size the amplifier separately — `rc-mk01` is 22×22, larger than
  this entire block.

## Solver command

Per-minute time base is mandatory. **At `--time 1` the solver silently drops `grade-1-tin`,
`small-lamp` and `log` below its ~0.01 display floor.** Fractional counts for the utilisation table
come from the same command at `--target "cottongut-mk01:1063.3"` ÷ 1000.

Three flags are load-bearing:

- **`--max-import "stone:8"`** — without it the LP runs the `chlorine` electrolyzer as a cheap hydrogen
  source for `ralesia-1` and dumps **~266 chlorine/min**. The cap is set just above the 5.53 actually
  needed. This is a tuned constraint, not a derived one.
- **`--max-import "cottongut-mk01:0.1"`** — raising both consumes and produces mk01, which reclassifies
  it as an Intermediate with `net >= 0` that cannot bootstrap. A small positive cap adds the import
  variable. Not the bootstrap quantity.
- **the near-zero caps on `moondrop-seeds`, `fish-egg`, `ralesia-seeds`, `soil`, `wood`, `water-saline`,
  `biomass`, `chlorine`** — each has an internal producer, and without the caps the LP saturates them
  as free imports instead of closing the loop. Set to 1e-5 rather than 0 so the import variable exists.

```bash
npx tsx src/cli.ts solve \
  --recipes "cottongut-pup-mk01-raising,cottongut-mature-basic-01,cottongut-food-01,moondrop-1,moondrop-seeds,seaweed-1,starch,powdered-ralesia-seeds,ralesia-1,ralesia-seeds,breed-fish-egg-1,breed-fish-1,phytoplankton,hydrogen,fiberboard,fiber-01,chlorine,waste-water-void,fill-tall-oil-canister,soil,wood-seeds,log-wood-fast,saline-water" \
  --target "cottongut-mk01:1.0633" --time 60 \
  --max-import "cottongut-mk01:0.1" --max-import "moondrop-seeds:0.00001" --max-import "fish-egg:0.00001" \
  --max-import "ralesia-seeds:0.00001" --max-import "water:5000" --max-import "biomass:0.00001" \
  --max-import "empty-fuel-canister:0.5" --max-import "chlorine:0.00001" --max-import "soil:0.00001" \
  --max-import "water-saline:0.00001" --max-import "wood:0.00001" --max-import "stone:8" \
  --modules "cottongut-pup-mk01-raising:cottongut-mk01:20" \
  --modules "cottongut-mature-basic-01:cottongut-mk01:20" \
  --modules "moondrop-1:moondrop:16" \
  --modules "ralesia-1:ralesia:12" \
  --modules "seaweed-1:seaweed:10" \
  --modules "breed-fish-egg-1:fish:7" \
  --modules "breed-fish-1:fish:7" \
  --factory "cottongut-pup-mk01-raising:prandium-lab-mk01" \
  --factory "cottongut-mature-basic-01:prandium-lab-mk01" \
  --factory "cottongut-food-01:assembling-machine-2" \
  --factory "wood-seeds:assembling-machine-2" \
  --factory "moondrop-1:moondrop-greenhouse-mk01" \
  --factory "moondrop-seeds:botanical-nursery" \
  --factory "seaweed-1:seaweed-crop-mk01" \
  --factory "starch:solid-separator" \
  --factory "powdered-ralesia-seeds:pulp-mill-mk01" \
  --factory "fiberboard:pulp-mill-mk01" \
  --factory "ralesia-1:ralesia-plantation-mk01" \
  --factory "ralesia-seeds:botanical-nursery" \
  --factory "breed-fish-egg-1:fish-farm-mk01" \
  --factory "breed-fish-1:fish-farm-mk01" \
  --factory "phytoplankton:plankton-farm" \
  --factory "soil:soil-extractor-mk01" \
  --factory "hydrogen:electrolyzer-mk01" \
  --factory "chlorine:electrolyzer-mk01" \
  --factory "fiber-01:wpu-mk01" \
  --factory "log-wood-fast:wpu-mk01" \
  --factory "saline-water:washer" \
  --factory "waste-water-void:quenching-tower" \
  --factory "fill-tall-oil-canister:barrel-machine-mk01" \
  --fuel "cottongut-food-01:tall-oil-canister" \
  --fuel "wood-seeds:tall-oil-canister" \
  --solver simplex \
  --unlocked
```

The oil-boiler is not in the solve — compute it as
`steam/min × 0.4935 MJ ÷ effectivity 2 = acetylene/min`, giving 24.22 acetylene/min for 98.15 steam.
One `oil-boiler-mk01` covers it at 0.26 % load.

**One-off bootstrap, not part of the steady state.** Two studs from the creature chamber cost
**380 automation-science-pack**, 130 bio-sample, 12 iron-chest, 6 cdna, 4 cottongut-codex
(= 20 small-lamp + 200 electronic-circuit + 8 glass + 80 tinned-cable) and 2,000 water, across a
`creature-chamber-mk01`, a `data-array` and an `incubator-mk01`. Build those once, take the studs out,
and the breeding loop never needs them again.

## Build materials

Distinct construction materials across this block's 17 building types, separate from flow imports:

`aluminium-plate` · `assembling-machine-1` · `burner-mining-drill` · `concrete` · `copper-cable` ·
`distilator` · `duralumin` · `electric-mining-drill` · `electronic-circuit` · `fluid-drill-mk01` ·
`gasifier` · `glass` · `inductor1` · `intermetallics` · `iron-plate` · `lab` · `lead-plate` ·
`limestone` · `log` · `pipe` · `planter-box` · `pump` · `small-lamp` · `small-parts-01` · `soil` ·
`soil-extractor-mk01` · `steam-engine` · `steel-plate` · `stone-brick` · `storage-tank` ·
`tar-processing-unit` · `tin-plate` · `treated-wood` · `wood`

```
 980x iron-plate    900x soil      890x glass     565x small-parts-01
 289x steel-plate   228x electronic-circuit       160x pipe
 150x treated-wood  140x aluminium-plate          140x stone-brick
 100x duralumin     100x copper-cable              80x lead-plate
  76x small-lamp     62x inductor1                 60x wood
  52x intermetallics 50x tin-plate                 50x concrete
  33x steam-engine   25x limestone                 20x planter-box
  12x pump           10x log       7x lab          6x burner-mining-drill
   3x electric-mining-drill        2x each: assembling-machine-1, fluid-drill-mk01,
                                   soil-extractor-mk01, distilator, tar-processing-unit
   1x each: storage-tank, gasifier
```

**`soil` at 900 and `glass` at 890 are the two to check** — soil comes almost entirely from the four
`moondrop-greenhouse-mk01` and three `ralesia-plantation-mk01`, glass from the two `prandium-lab-mk01`
at 50 each plus the greenhouses. Neither appears anywhere else in this block's flow. **`concrete` ×50**
needs the gravel/lime/sand/water cluster, which no current design supplies. Inferred from the recipe
graph, not from save state.
