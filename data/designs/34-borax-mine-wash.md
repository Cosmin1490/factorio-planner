# 34 — Borax mine + on-site wash + soil closure — 7.14 borax/s, 18 buildings

Wash at the pit, and **close the soil on site**. Three inputs: syngas for the mining fluid, water,
electricity. Sized at **7.14/s, where `borax-washing` lands on exactly five machines at 100 %** — a
washer is 10 borax per 7 s, so five is 7.143/s and every other row gets a pad.

```
borax (resource)    mining_time 1.5, required_fluid syngas, fluid_amount 25
borax-washing  [U] [washer, 7 s]       raw-borax 10 + water 150  →  borax 10 + muddy-sludge 100
muddy-sludge   [U] [washer, 4 s]       soil 10 + water 100       →  muddy-sludge 100
muddy-sludge-void-electrolyzer
               [U] [electrolyzer, 3 s] muddy-sludge 100          →  soil 5 + water 100 + oxygen 10
```

## Recipe table

```
┌────────────────────────────────┬───────────────────┬────────┬──────┬───────┬────────┬─────────┐
│ Recipe                         │ Factory           │  frac  │ Cnt  │ Size  │  Util  │ MW load │
├────────────────────────────────┼───────────────────┼────────┼──────┼───────┼────────┼─────────┤
│ borax-washing                  │ washer            │  5.000 │   5  │ 6x6   │ 100.0% │   2.000 │
│ muddy-sludge                   │ washer            │  2.858 │   3  │ 6x6   │  95.3% │   1.143 │
│ (mining borax)                 │ borax-mine        │  4.464 │   5  │ 9x9   │  89.3% │   1.875 │
│ muddy-sludge-void-electrolyzer │ electrolyzer-mk01 │  4.286 │   5  │ 6x6   │  85.7% │  42.860 │
└────────────────────────────────┴───────────────────┴────────┴──────┴───────┴────────┴─────────┘
```

*(at +20 % mining productivity)*

**18 buildings · 873 tiles · 47.88 MW**

**Inputs** (/s): water **35.71** · syngas **14.88** · 47.88 MW
**Outputs** (/s): **borax 7.14** · oxygen 14.29 · **soil 0**

## The soil loop, and why it is water-neutral

The electrolyzer returns **5 soil per 100 sludge**, and the `muddy-sludge` washer takes **10 soil per
100 sludge** — so half the soil comes back every pass and the series converges:

```
fresh soil from borax-washing      3.57 /s
total soil through the washer      7.14 /s      =  3.57 / (1 − 0.5)
total sludge to electrolyzers    142.86 /s      =  71.43 (borax) + 71.43 (soil)
```

**Water closes exactly.** The soil washer draws 71.43/s and the extra electrolyzers hand back 71.43/s,
so the import is unchanged by the soil loop — it stays at the irreducible 5 water per borax that the
wash alone needs:

```
107.14 consumed (borax) + 71.43 (soil)  −  142.86 recycled  =  35.71 /s imported
```

The washer takes 150 water and emits only 100 as sludge; the other 50 leaves in the product. That
cap is structural and unchanged — recovery is 66.7 % on the borax leg at any scale.

**The electrolyzer is sludge disposal, not water recovery.** Muddy-sludge is a liquid, so under the
ruleset it must be processed, and the recovered water is a rebate on mandatory power. The
alternative sink `py-iron-oxide` (`hpf`, 20 sludge/craft) is **exactly the same 0.300 MW per
sludge/s** — 2.00 MW over 6.67 sludge/s against the electrolyzer's 10.00 over 33.33 — and it adds
pipe and iron-oxide imports, recovers no water and emits py-iron-oxide. **Electrolyzer wins outright.**

## Why not the lighter soil sinks

Two cheaper disposal routes exist and both were rejected on their secondary cost. Priced at the
7.50 soil/s of the old 15/s configuration:

| route | buildings | MW | what it costs |
|---|--:|--:|---|
| **`muddy-sludge` washer** *(chosen)* | +11 | +47.40 | nothing — water-neutral, no byproduct |
| `soil-washing` + sand loop | +3 | +9.79 | **+150 water/s**, tripling the block's one irreducible number |
| `soil-separation-2` + landfill | +7 | +2.54 | **biomass 1.20/s and limestone to route**, and `limestone-void` feeds soil back |

`soil-washing` returns only 5 soil per 30 (17 % against 50 %), so it converges six times faster and
needs a sixth of the sludge — but it drinks 600 water per 30 soil. Its sand closes cheaply against
`gravel-to-sand` (20 sand → 4 gravel → 3 sand, **85 % destroyed per pass**, 2 buildings), so sand was
never the obstacle; water was. `soil-separation-2` destroys soil in one pass with no return at all
and is by far the cheapest in power, but it emits sand, coarse, limestone and biomass, and closing
limestone costs another building that returns soil.

**The choice is water against power.** This configuration spends 47 MW to keep the water import at
its structural minimum.

## Sizing

**Productivity rises over the game; the mine count does not.** Five mines are saturated from
+12.5 % onward, and everything downstream is frozen — borax, water, soil, oxygen, washer load, electrolyzer
load. The single moving number is **syngas, and it falls.**

| prod | cap /s (5 mines) | **uptime** | **borax /s** | **syngas /s** | water /s |
|---|--:|--:|--:|--:|--:|
| 0 % | 6.667 | 100 % | 6.667 | 16.67 | 33.33 |
| +12.5 % | 7.500 | 95.2 % | **7.143** | 15.87 | 35.71 |
| **+20 %** *(current)* | 8.000 | **89.3 %** | **7.143** | **14.88** | 35.71 |
| +30 % | 8.667 | 82.4 % | **7.143** | 13.74 | 35.71 |
| +40 % *(mp-4)* | 9.333 | 76.5 % | **7.143** | 12.76 | 35.71 |
| +50 % *(mp-5)* | 10.000 | 71.4 % | **7.143** | **11.90** | 35.71 |

Syngas falls 14.88 → 11.90/s by mp-5, a **20 % cut with no rebuild**. Below +12.5 % the mines cannot
fill the target and output is mine-limited at 6.667/s. Idle mines are the cheapest buffer in the
block at 0.42 MW and 81 tiles each.

**`borax-washing` is the pinned row at 100 %** — and that is the shape to want, because it is a
0.4 MW washer rather than the 45 MW electrolyzer bank. `muddy-sludge` has 4.7 % spare and the
electrolyzers 14.3 %, so any rate increase needs a sixth borax washer first and nothing else until
~8.5/s. Scaling past that means another stamp rather than a resize.

## Terminal outputs and their sinks

| output | /s | sink chosen | what it beat |
|---|--:|---|---|
| **borax** | 7.14 | the product — design 24's BOF route, `molten-aluminium-01` | — |
| **oxygen** | 14.29 | **pipe to design 24's BOF** | venting: forfeits ~14 MW of avoided electrolysis |
| soil | **0** | consumed internally | exporting it — see § Why not the lighter soil sinks |
| muddy-sludge | 0 | consumed internally | `py-iron-oxide` (identical power, 2 extra imports, no water back) |

**Do not vent the oxygen.** Electrolysis costs **1.0 MW per oxygen/s**, so 14.29/s is worth **14.3 MW**
of avoided generation — 30 % of this block's own draw. Design 24 makes its own oxygen in nine
electrolyzers at 90 MW, and **94 % of its electrical draw is electrolysis**, so piping this over
removes 1.4 of those nine. That takes the block's effective cost to **~34 MW**.

**The oxygen does not cover design 24.** `molten-iron-05` needs 60 oxygen per 10 molten-iron =
**10.00 oxygen per plate**, so 9.00 plate/s wants 90 oxygen/s against this block's 14.29. The pipe is
a 16 % rebate, not a replacement.

> **`nitrogen-mk01` (160 u, prereq `logistic-science-pack`) changes this entirely.** It unlocks
> `purest-nitrogen-gas` — 100 `pressured-air` → 60 purest-nitrogen-gas + 20 nitrogen + 20 oxygen in a
> 0.50 MW distilator, and `pressured-air` is a `vacuum` recipe with no ingredients. That is
> **0.150 MW per oxygen/s against electrolysis's 1.000**, so design 24's 90 oxygen/s would cost
> 13.5 MW instead of 90. Costs 4.6× the footprint and two gas streams — both on the pre-approved
> vent list, and the same tech ships `purest-nitrogen-void`. Not costed as a design; flagged because
> design 24's "every better route is locked" does not distinguish 160 u at a researched tier from
> the 700 u chemical-science routes.

## Who needs the borax

| consumer | borax /s | note |
|---|--:|---|
| **design 24** @ 9.00 iron-plate/s | **4.950** | imported already washed — see below. **1.44× covered** |
| design 24 doubled @ 18 plate/s | 9.900 | **not covered** — would need 10/s and a second stamp |
| design 39 (`diborane`, 10 borax → 150) | 0.026 | 1.56/min |
| design 36 | 0 | none |

**7.14/s covers design 24 with 44 % headroom.** Design 39's draw is rounding error. Sized here rather
than at 15/s because the extra 7.9/s had no consumer and cost 52 MW; if design 24 ever doubles,
stamp a second block rather than resizing this one.

**Borax is exported already washed.** `borax-washing` at the pit means the train carries `borax` not
`raw-borax` — stack size 100 against 50, so washing first doubles wagon density, and the mining fluid
stays at the outpost.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **the electrolyzers stop** | sludge has nowhere to go, both washer banks stall on a full sludge pipe, and the mines back up behind them. Also drops the water loop, so the import would have to cover 178.6/s instead of 35.7/s |
| 2 | **`borax-washing` is pinned at 100 %** | the only row with no pad, but it is a 0.4 MW washer — a sixth is the cheapest insurance in the block. `muddy-sludge` has 4.7 % spare, electrolyzers 14.3 % |
| 3 | **water supply below 35.71/s** | throttles washing proportionally, and the loop amplifies it — every unit short is a unit of recycled water not made next cycle |
| 4 | **oxygen backs up** | only if vented through a throttled stack or piped to a stalled consumer. Stalls the electrolyzers → cascades to #1 |
| 5 | syngas 14.88/s | stops mining; washers and electrolyzers drain their buffers and idle. No cascade. **This is the one input that shrinks over time** |

The mines run at 93.8 %, so a single mine outage drops output immediately — unlike the 15/s build,
five mines is not over-provisioned. A sixth mine would restore that cushion for 0.42 MW idle.

## Solver command

**`--max-import "soil:0.001"` is load-bearing** — it is what forces the soil loop closed. Without it
the LP exports soil and never builds the `muddy-sludge` washers. `--max-import "muddy-sludge:0.001"`
does the same for the sludge leg. Input mode is used rather than target mode because the block has
three terminal outputs.

```bash
npx tsx src/cli.ts solve \
  --recipes "borax-washing,muddy-sludge,muddy-sludge-void-electrolyzer" \
  --input "raw-borax:7.142857" --time 1 \
  --max-import "muddy-sludge:0.001" --max-import "soil:0.001" \
  --factory "borax-washing:washer" \
  --factory "muddy-sludge:washer" \
  --factory "muddy-sludge-void-electrolyzer:electrolyzer-mk01" \
  --solver simplex --unlocked
```

**At this rate the direct solve is correct** — 5/3/5, matching the fracs, because `borax-washing`
lands on exactly 5.0000 and nothing else sits on an integer boundary. That is luck, not a property:
at 7.5/s the same command miscounts `muddy-sludge` as 4 where the frac is 3.000, and at 10/s and
15/s it miscounts two rows each. **On any rescale, run `--input "raw-borax:<rate×1000>"` and divide
counts by 1000**, and check against MW — here 5.000 × 0.4 + 2.858 × 0.4 + 4.286 × 10 = 46.00.

The cycle warning it prints is expected — confirm the intermediates table shows `muddy-sludge` and
`soil` each with producer = consumer, which they do.

**The mining is outside the solve.** `borax` is a `borax`-category resource with `mining_time 1.5`,
`required_fluid: syngas`, `fluid_amount: 25`. `borax-mine` is **speed 2, electric, 0.42 MW, 9×9, one
module slot**:

```
raw-borax = mining_speed / mining_time × (1 + p)              =  2 / 1.5 × 1.2  =  1.600 /s per mine
syngas    = mining_speed × fluid_amount / (10 × mining_time)  =  2 × 25 / 15    =  3.333 /s per mine
uptime    = min(1, 7.143 / (5 × 1.333 × (1 + p)))
```

The ÷10 is an engine constant, not in the prototype. **Syngas is charged per mining *operation*, not
per ore** — which is exactly why it scales with uptime and therefore *falls* as productivity rises,
while ore per operation goes up. Syngas per raw-borax is `fluid_amount / 10 / (1 + p)` = 2.083 at
+20 %, and is unaffected by drill speed or tier.

## Build materials

Distinct construction materials across this block's 3 building types, separate from flow imports:

`aluminium-plate` · `electronic-circuit` · `fluid-drill-mk01` · `inductor1` · `iron-plate` · `lab` ·
`pipe` · `small-parts-01` · `soil-extractor-mk01` · `steam-engine` · `stone-brick` ·
`tar-processing-unit` · `transport-belt`

**Only 25 circuits for the whole site** — `borax-mine` and `washer` carry none, and the entire bill is
5 each in the five `electrolyzer-mk01`. Sub-assemblies to have on hand: **`soil-extractor-mk01`** and
**`fluid-drill-mk01`** (one each per mine, so five of each) and **`tar-processing-unit`** (one per
electrolyzer, so five). `aluminium-plate` at 30 per electrolyzer — 150 total — is the only draw on
design 33's output. Inferred from the recipe graph, not from save state.
