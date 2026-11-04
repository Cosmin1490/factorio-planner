# 34 — Borax mine + on-site wash + soil closure — 10.00 borax/s, 24 buildings

Wash at the pit, and **close the soil on site**. Three inputs: syngas for the mining fluid, water,
electricity. **10.00/s is the size where every wash row lands on an exact integer** and the block
still covers design 24 twice over.

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
│ borax-washing                  │ washer            │  7.000 │   7  │ 6x6   │ 100.0% │   2.800 │
│ muddy-sludge-void-electrolyzer │ electrolyzer-mk01 │  6.000 │   6  │ 6x6   │ 100.0% │  60.000 │
│ (mining borax)                 │ borax-mine        │  6.250 │   7  │ 9x9   │  89.3% │   2.625 │
│ muddy-sludge                   │ washer            │  4.000 │   4  │ 6x6   │ 100.0% │   1.600 │
└────────────────────────────────┴───────────────────┴────────┴──────┴───────┴────────┴─────────┘
```

*(at +20 % mining productivity)*

**24 buildings · 1,179 tiles · 67.03 MW**

**Inputs** (/s): water **50.00** · syngas **20.83** · 67.03 MW
**Outputs** (/s): **borax 10.00** · oxygen 20.00 · **soil 0**

## The soil loop, and why it is water-neutral

The electrolyzer returns **5 soil per 100 sludge**, and the `muddy-sludge` washer takes **10 soil per
100 sludge** — so half the soil comes back every pass and the series converges:

```
fresh soil from borax-washing      5.00 /s
total soil through the washer     10.00 /s      =  5.00 / (1 − 0.5)
total sludge to electrolyzers     200.00 /s     =  100 (borax) + 100 (soil)
```

**Water closes exactly.** The soil washer draws 100/s and the extra electrolyzers hand back 100/s, so
the import is unchanged by the soil loop — it stays at the irreducible 5 water per borax that the
wash alone needs:

```
150.00 consumed (borax) + 100.00 (soil)  −  200.00 recycled  =  50.00 /s imported
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

**Productivity rises over the game; the mine count does not.** Seven mines saturate from +12.5 %
onward, and everything downstream is frozen — borax, water, soil, oxygen, washer load, electrolyzer
load. The single moving number is **syngas, and it falls.**

| prod | cap /s (7 mines) | **uptime** | **borax /s** | **syngas /s** | water /s |
|---|--:|--:|--:|--:|--:|
| 0 % | 9.333 | 100 % | 9.333 | 23.33 | 46.67 |
| +12.5 % | 10.500 | 95.2 % | **10.000** | 22.22 | 50.00 |
| **+20 %** *(current)* | 11.200 | **89.3 %** | **10.000** | **20.83** | 50.00 |
| +30 % | 12.133 | 82.4 % | **10.000** | 19.23 | 50.00 |
| +40 % *(mp-4)* | 13.067 | 76.5 % | **10.000** | 17.86 | 50.00 |
| +50 % *(mp-5)* | 14.000 | 71.4 % | **10.000** | **16.67** | 50.00 |

Syngas falls 20.83 → 16.67/s by mp-5, a **20 % cut with no rebuild**. Below +12.5 % the mines cannot
fill the target and output is mine-limited at 9.333/s. Idle mines are the cheapest buffer in the
block at 0.42 MW and 81 tiles each.

**Scaling up means another stamp**, not a resize — the three wash rows are all at exactly 100 % and
any rate increase needs an eighth washer, a seventh electrolyzer and a fifth soil washer.

## Terminal outputs and their sinks

| output | /s | sink chosen | what it beat |
|---|--:|---|---|
| **borax** | 10.00 | the product — design 24's BOF route, `molten-aluminium-01` | — |
| **oxygen** | 20.00 | **pipe to design 24's BOF** | venting: forfeits ~20 MW of avoided electrolysis |
| soil | **0** | consumed internally | exporting it — see § Why not the lighter soil sinks |
| muddy-sludge | 0 | consumed internally | `py-iron-oxide` (identical power, 2 extra imports, no water back) |

**Do not vent the oxygen.** Electrolysis costs **1.0 MW per oxygen/s**, so 20.00/s is worth **20 MW**
of avoided generation — 30 % of this block's own draw. Design 24 makes its own oxygen in nine
electrolyzers at 90 MW, and **94 % of its electrical draw is electrolysis**, so piping this over
removes two of those nine. That takes the block's effective cost to **~47 MW**.

**The oxygen does not cover design 24.** `molten-iron-05` needs 60 oxygen per 10 molten-iron =
**10.00 oxygen per plate**, so 9.00 plate/s wants 90 oxygen/s against this block's 20.00. The pipe is
a 22 % rebate, not a replacement.

## Who needs the borax

| consumer | borax /s | note |
|---|--:|---|
| **design 24** @ 9.00 iron-plate/s | **4.950** | imported already washed — see below |
| design 24 doubled @ 18 plate/s | 9.900 | **the ceiling for this block** |
| design 39 (`diborane`, 10 borax → 150) | 0.026 | 1.56/min |
| design 36 | 0 | none |

**10.00/s covers design 24 twice over, or its doubled size with 0.7 % margin.** Design 39's draw is
rounding error. That is why 10/s rather than 15/s: the extra 5/s had no consumer and cost 33 MW.

**Borax is exported already washed.** `borax-washing` at the pit means the train carries `borax` not
`raw-borax` — stack size 100 against 50, so washing first doubles wagon density, and the mining fluid
stays at the outpost.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **the electrolyzers stop** | sludge has nowhere to go, both washer banks stall on a full sludge pipe, and the mines back up behind them. Also drops the water loop, so the import would have to cover 250/s instead of 50/s |
| 2 | **all three wash rows are at 100 %** | no pad anywhere. One washer or electrolyzer down is an immediate proportional cut. 6×6 and cheap — one spare of each is the obvious insurance |
| 3 | **water supply below 50.00/s** | throttles washing proportionally, and the loop amplifies it — every unit short is a unit of recycled water not made next cycle |
| 4 | **oxygen backs up** | only if vented through a throttled stack or piped to a stalled consumer. Stalls the electrolyzers → cascades to #1 |
| 5 | syngas 20.83/s | stops mining; washers and electrolyzers drain their buffers and idle. No cascade. **This is the one input that shrinks over time** |

The mines are the only over-provisioned row at 89.3 %, so a single mine outage costs nothing until
productivity has risen enough to need all seven — which never happens, since uptime only falls.

## Solver command

**`--max-import "soil:0.001"` is load-bearing** — it is what forces the soil loop closed. Without it
the LP exports soil and never builds the `muddy-sludge` washers. `--max-import "muddy-sludge:0.001"`
does the same for the sludge leg. Input mode is used rather than target mode because the block has
three terminal outputs.

```bash
npx tsx src/cli.ts solve \
  --recipes "borax-washing,muddy-sludge,muddy-sludge-void-electrolyzer" \
  --input "raw-borax:10" --time 1 \
  --max-import "muddy-sludge:0.001" --max-import "soil:0.001" \
  --factory "borax-washing:washer" \
  --factory "muddy-sludge:washer" \
  --factory "muddy-sludge-void-electrolyzer:electrolyzer-mk01" \
  --solver simplex --unlocked
```

**Always run at `--input "raw-borax:10000"` and divide counts by 1000.** The direct solve is wrong
on two rows here — it reports **8 `borax-washing` and 7 electrolyzers** where the fracs are exactly
**7.000 and 6.000**, the float-ceiling artifact. The 64.40 MW it reports is the check: 7.000 × 0.4 +
4.000 × 0.4 + 6.000 × 10 = 64.40 exactly, which only works at 7/4/6. Never trust a machine count
from this block's direct solve.

The cycle warning it prints is expected — confirm the intermediates table shows `muddy-sludge` and
`soil` each with producer = consumer, which they do.

**The mining is outside the solve.** `borax` is a `borax`-category resource with `mining_time 1.5`,
`required_fluid: syngas`, `fluid_amount: 25`. `borax-mine` is **speed 2, electric, 0.42 MW, 9×9, one
module slot**:

```
raw-borax = mining_speed / mining_time × (1 + p)              =  2 / 1.5 × 1.2  =  1.600 /s per mine
syngas    = mining_speed × fluid_amount / (10 × mining_time)  =  2 × 25 / 15    =  3.333 /s per mine
uptime    = min(1, 10.00 / (7 × 1.333 × (1 + p)))
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

**Only 30 circuits for the whole site** — `borax-mine` and `washer` carry none, and the entire bill is
5 each in the six `electrolyzer-mk01`. Sub-assemblies to have on hand: **`soil-extractor-mk01`** and
**`fluid-drill-mk01`** (one each per mine, so seven of each) and **`tar-processing-unit`** (one per
electrolyzer, so six). `aluminium-plate` at 30 per electrolyzer — 180 total — is the only draw on
design 33's output. Inferred from the recipe graph, not from save state.
