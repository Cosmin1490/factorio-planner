# 29 — Fish oil — 1.30 fish-oil/s, 13 buildings

Sized for **gearboxes**, and rated so the three `breed-fish-1` farms run at exactly 100 %.

| output | rate |
|---|--:|
| **fish-oil** | **1.30 /s** |
| **gearbox-mk01** (fish-oil 20 each) | **0.065 /s · 3.9 /min · 234 /hour** |
| `py-construction-robot-mk01` (fish-oil 50 + a gearbox) | 0.026 /s · 1.6 /min |

```
full-render-fish  [U] [slaughterhouse, 30 s]  fish 8  →  bones 2 + meat 2 + skin 3 + guts 5 + fish-oil 100
breed-fish-1      [U] [fish-farm,    150 s]  small-lamp 3 + biomass 10 + fish-egg 10 + oxygen 60
                                             + water-saline 100  →  fish 10 + waste-water 100
breed-fish-egg-1  [U] [fish-farm,     80 s]  fish 12 + phytoplankton 50 + water-saline 100
                                             →  fish-egg 25 + waste-water 100
```

**fish-oil 100 per 8 fish.** One render craft covers 5 gearboxes, so the breeding is the expensive half
and the slaughterhouse runs at 39 %.

**Base `breed-fish-1`, no TURD pick.** At tier 1 `a-select` is rate-neutral on fish so it saves no farms
and costs +24 % saline and +24 % oxygen. The pick is held for `breed-fish-2`+, where `fish-food-01`
becomes a required ingredient.

## Fuel independent, and nearly closed

**Four imports, one product, one vent.** No coke, no ash, no solid exports except a trace.

| | /s |
|---|--:|
| **Imports** | water 20.80 · **water-saline 2.80** · small-lamp 0.060 · grade-1-tin 0.040 |
| **Exports** | **fish-oil 1.30** · meat 0.0016 *(trickle — see § The 1.3 % surplus)* |
| **Vented** | hydrogen 2.40 |

**`water-saline` has no producer anywhere in the base.** In mineral terms, at `[washer, 20 s]`:

| route | material | water | washers |
|---|--:|--:|--:|
| `saline-water` (`stone 10 + water 100 → 50`) | **stone 0.560 /s** | 5.60 /s | 2 |
| `gravel-saline-water` (`gravel 15 + water 100 → 50`) | **gravel 0.840 /s** | 5.60 /s | 2 |

## Three closures

**Biomass from every co-product.** Rendering yields 12 solid items per 8 fish, each composting to
`biomass 3`. All four are composted, because the atomizer burns biomass too:

```
biomass needed   = 0.200 (breeding) + 0.179 (atomizer fuel)   = 0.379 /s
biomass supplied = 3 × (skin 0.039 + guts 0.037 + bones 0.026 + meat 0.0247) = 0.384 /s
```

**Chlorine from the guts.** `waste-water-void` (`waste-water 50 + chlorine 10 → water 50`) is the only
enabled waste-water sink; `guts-to-chlorine` makes 100 chlorine per 5 guts. The guts split and the
chlorine balances exactly:

```
guts 0.065/s  →  guts-to-chlorine 0.028  →  chlorine 0.560/s  =  waste-water-void demand, exact
              →  biomass-guts     0.037  →  biomass 0.111/s
```

**Oxygen from water.** `hydrogen` [electrolyzer-mk01] at 12 % covers `breed-fish-1`'s oxygen 1.200/s,
venting hydrogen 2.40/s (pre-approved, 0.10 MJ).

## Recipe table

Fish farms are **module-corrected**: `fish-farm-mk01` is speed 0.125 with 7 `fish` slots → **8×**,
reaching effective speed 1.00. Modules are self-funding. Everything else is speed 1.

```
┌──────────────────────────┬─────────────────────┬──────┬───────┬───────┬─────────┐
│ Recipe                   │ Factory             │ Cnt  │ Size  │ Load  │ MW load │
├──────────────────────────┼─────────────────────┼──────┼───────┼───────┼─────────┤
│ breed-fish-1             │ fish-farm-mk01      │  *3  │ 11x11 │ 100 % │   3.000 │
│ breed-fish-egg-1         │ fish-farm-mk01      │  *1  │ 11x11 │  64 % │   0.640 │
│ phytoplankton            │ plankton-farm       │   1  │ 7x7   │  60 % │   0.210 │
│ full-render-fish         │ slaughterhouse-mk01 │   1  │ 11x11 │  39 % │   0.117 │
│ hydrogen  (for oxygen)   │ electrolyzer-mk01   │   1  │ 6x6   │  12 % │   1.210 │
│ biomass-skin             │ compost-plant-mk01  │   1  │ 11x11 │  12 % │   0.059 │
│ biomass-guts             │ compost-plant-mk01  │   1  │ 11x11 │  11 % │   0.056 │
│ biomass-bones            │ compost-plant-mk01  │   1  │ 11x11 │   8 % │   0.040 │
│ biomass-meat             │ compost-plant-mk01  │   1  │ 11x11 │   7 % │   0.037 │
│ waste-water-void         │ quenching-tower     │   1  │ 7x7   │   6 % │   0.029 │
│ guts-to-chlorine         │ atomizer-mk01       │   1  │ 7x7   │   6 % │  burner │
└──────────────────────────┴─────────────────────┴──────┴───────┴───────┴─────────┘
   * module-corrected. Solver base counts: 24.00 / 5.12, multiplier 8x
```

**13 buildings · ~1,272 tiles · 5.40 MW at load · 17.15 MW rated**

> **`atomizer-mk01` is a burner** — its 0.80 MW is **fuel, not electricity**, so it is excluded from both
> MW columns. At 6 % load it burns **0.046 MJ/s = biomass 0.179/s**, which is 47 % of the block's biomass.

Rated is 3× load almost entirely because of **one `electrolyzer-mk01` at 12 %** (10.00 MW rated, 1.21 at
load). **Size the substation for 5.5 MW.**

**The four fish farms are 484 of the 1,272 tiles** and **3.64 of the 5.40 MW** — intrinsic, since
`breed-fish-1` is a 150-second craft in an 0.125-speed building. **The four compost plants are another
484 tiles** at 7–12 % load each: the price of closing the biomass loop rather than importing fuel.

## Intermediate flows

```
┌───────────────┬─────────┬────────────────────────────┬────────────────────────────────────────┐
│ Item          │ Rate /s │ Producer                   │ Consumer                               │
├───────────────┼─────────┼────────────────────────────┼────────────────────────────────────────┤
│ fish          │  0.200  │ breed-fish-1               │ full-render-fish 0.104,                │
│               │         │                            │ breed-fish-egg-1 0.096                 │
│ fish-egg      │  0.200  │ breed-fish-egg-1           │ breed-fish-1        ← closed loop        │
│ phytoplankton │  0.400  │ phytoplankton              │ breed-fish-egg-1                       │
│ biomass       │  0.379  │ skin 0.117 + guts 0.111    │ breed-fish-1 0.200,                    │
│               │         │ + bones 0.079 + meat 0.074 │ guts-to-chlorine (fuel) 0.179          │
│ oxygen        │  1.200  │ hydrogen (electrolyzer)    │ breed-fish-1                           │
│ guts          │  0.065  │ full-render-fish           │ biomass-guts 0.037,                    │
│               │         │                            │ guts-to-chlorine 0.028   ← split        │
│ skin · bones  │  0.039 · 0.026 │ full-render-fish    │ composted in full                      │
│ meat          │  0.026  │ full-render-fish           │ biomass-meat 0.0247, export 0.0016     │
│ chlorine      │  0.560  │ guts-to-chlorine           │ waste-water-void    ← exact             │
│ waste-water   │  2.800  │ breed 2.000 + egg 0.800    │ waste-water-void                       │
│ water         │  2.800  │ waste-water-void           │ of phytoplankton 20.00                 │
│               │         │ + import 20.80             │ + hydrogen 3.60                        │
└───────────────┴─────────┴────────────────────────────┴────────────────────────────────────────┘
```

**The fish/egg loop is net zero** — eggs 25 per 12 fish, fish 10 per 10 eggs. Starting stock, not
resupply.

## The 1.3 % surplus

Composting all four co-products gives **0.384 biomass/s against 0.379 needed — net positive by
0.005/s**, which leaves **0.0016/s of one co-product uncomposted.** The LP parks it on **meat** (running
`biomass-meat` at 7 % rather than 8 %), so the block's only solid export is **meat ≈ 5.8/hour**.

> **Give it somewhere to go.** 0.0016/s fills one stack in **17 hours** and the slaughterhouse's own
> output buffer in roughly a day — at which point `full-render-fish` stalls and takes fish-oil with it. A
> steel chest is 35 days. **Nothing forces the surplus onto meat**: run `biomass-meat` flat out and
> throttle `biomass-bones` or `-skin` instead if you would rather the trickle be something else.

**1.3 % is not operational headroom.** Every co-product is load-bearing — a stall in skin, bones, guts
*or* meat starves either the breeding or the atomizer within minutes, and both cascade to the product.
**Buffer biomass in a chest** as the pad; a few hundred units costs nothing and absorbs the whole class.

## Why not the alternatives

| configuration | buildings | fuel | saline | solid exports | verdict |
|---|--:|---|--:|---|---|
| **biomass fuel, all composted** | **13** | **independent** | 2.80 | meat trickle | **chosen** |
| coke fuel | 11 | coke 0.009/s, ash 0.009/s out | 2.80 | skin · bones · meat · guts | 2 buildings cheaper, not independent |
| electrolysis chlorine | 11 | independent | **5.60** | skin · bones · meat + NaOH 0.06 | doubles saline, 26.15 MW rated |

**Burning biomass is only possible because every co-product is composted.** Leave the meat out and
biomass goes **0.306 against 0.379 — 19 % short**, and the LP does not report infeasible: it under-runs
`guts-to-chlorine` until the budget closes, leaving **waste-water 0.78/s with no sink.** That reads as a
clean solve and is not one.

**Three meat alternatives were priced and all fail on the same thing** — rendering yields meat 2 per 8
fish, and every downstream use wants an order of magnitude more:

| route | covers | why not |
|---|--:|---|
| `meat-to-tin` → `grade-1-tin` | 78 % of tin | breaks biomass by 19 %; the extra `atomizer` is a second burner |
| `meat → dried-meat-01 → jerky-to-phytoplankton` | **10.8 %** of phytoplankton | needs **meat 0.240/s** against 0.026 produced — fixed ratio, never closes at any scale |
| trickle (0.0016/s) → tin | 4.8 % | the atomizer's fuel to process it costs **0.0102 biomass/s** against a 0.005/s surplus — net negative |

`jerky-to-phytoplankton` is the only route that removes `grade-1-tin` entirely, and it is **1.5× faster
per plankton-farm** (10 s vs 15 s for the same phytoplankton 10) with no mineral input. Importing meat
0.240/s to avoid importing grade-1-tin 0.040/s is six times the tonnage, so it only becomes interesting
if a cheap meat source turns up.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **biomass margin is 1.3 %** | all four co-products load-bearing; a stall in any starves breeding or the atomizer. Buffer biomass |
| 2 | **water-saline 2.80/s has no producer** | = stone 0.560/s or gravel 0.840/s in 2 washers |
| 3 | **the guts split is a priority, not a ratio** | if the chlorine leg starves, waste-water backs up into both fish farms. **`guts-to-chlorine` gets the priority inserter**, `biomass-guts` second |
| 4 | **the fish/egg loop nets to zero** | no external top-up; recovery is minutes at 150 s and 80 s crafts |
| 5 | the meat trickle | ~a day to clog the slaughterhouse buffer. Slowest clock in the block |
| 6 | grade-1-tin 0.040/s | feeds `phytoplankton` only. Design 21 produces it |

## Bio modules

| building | ×count | module | needed | self-funding? |
|---|--:|---|--:|---|
| `fish-farm-mk01` | 4 | `fish` 7 | **28** | **yes** — the block makes fish |

**28 fish is ~140 seconds of the block's own output** — no codex, no creature chamber, the cheapest bio
bootstrap in the repo.

## Solver command

**All eleven recipes and all three cycles in one solve.** Two flags are load-bearing:

```bash
npx tsx src/cli.ts solve \
  --recipes "breed-fish-1,breed-fish-egg-1,phytoplankton,full-render-fish,biomass-skin,biomass-guts,biomass-bones,biomass-meat,guts-to-chlorine,waste-water-void,hydrogen" \
  --target "fish-oil:1.3" --time 1 \
  --max-import "water:100" \
  --fuel "guts-to-chlorine:biomass" \
  --factory "breed-fish-1:fish-farm-mk01" \
  --factory "breed-fish-egg-1:fish-farm-mk01" \
  --factory "phytoplankton:plankton-farm" \
  --factory "full-render-fish:slaughterhouse-mk01" \
  --factory "biomass-skin:compost-plant-mk01" \
  --factory "biomass-guts:compost-plant-mk01" \
  --factory "biomass-bones:compost-plant-mk01" \
  --factory "biomass-meat:compost-plant-mk01" \
  --factory "guts-to-chlorine:atomizer-mk01" \
  --factory "waste-water-void:quenching-tower" \
  --factory "hydrogen:electrolyzer-mk01" \
  --solver simplex \
  --unlocked
```

- **`--max-import "water:100"`** — without it the solve returns **0 buildings**. `waste-water-void` gives
  water an internal producer, reclassifying it from free-import to Intermediate with `net >= 0`, so the
  LP must balance all 24.40 water/s internally. A positive cap adds an import variable. The cap is a
  ceiling, not a target; 100 is arbitrary against the 20.80/s drawn.
- **`--fuel "guts-to-chlorine:biomass"`** — without it the atomizer defaults to **coal**, and the solve
  comes back with `coal 0.01/s` in, `ash 0.01/s` out, and meat and guts exported instead of composted.
- `--max-import "biomass:0"` is **not** needed — biomass already has producers, so it is an Intermediate
  with `net >= 0` and internal by construction. Tested: identical result with and without.

It emits one long cycle warning spanning chlorine → guts → biomass → skin → fish-egg → oxygen →
phytoplankton → water → waste-water → fish. **Do not apply the suggested
`--constraint "guts-to-chlorine:chlorine:exclude"`** — it breaks the waste-water sink.

**Flows under ~0.01/s are hidden from the output tables.** The meat trickle (0.0016/s) is invisible at
this target and only appears at `--target "fish-oil:13"`, where it reads `meat: 0.02/1s`. The same filter
hid the atomizer's coal before `--fuel` was set. **Re-run any exactly-balanced loop at 10× to check for a
trace import or surplus.**

Fractional counts from `--target "fish-oil:1300"` ÷ 1000: **24.00 / 5.12 / 0.601 / 0.390 / 0.117 / 0.111
/ 0.079 / 0.074 / 0.057 / 0.057 / 0.121**.

## Build materials

Distinct construction materials across this block's 7 building types, separate from flow imports:

`aluminium-plate` · `concrete` · `copper-cable` · `copper-plate` · `duralumin` · `electronic-circuit` ·
`engine-unit` · `gearbox-mk01` · `glass` · `intermetallics` · `iron-gear-wheel` · `iron-plate` · `lab` ·
`pipe` · `pump` · `shaft-mk01` · `small-lamp` · `small-parts-01` · `steam-engine` · `steel-plate` ·
`stone-brick` · `wood`

> **This block needs `gearbox-mk01` to build, and `gearbox-mk01` needs fish-oil.** One-way and small — a
> handful from existing stock gets the first block up, after which it funds every gearbox thereafter.
> Flagged because it looks like a blocker and is not. Inferred from the recipe graph, not from save state.
