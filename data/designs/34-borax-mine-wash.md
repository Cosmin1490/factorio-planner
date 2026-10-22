# 34 — Borax mine + on-site wash — 15.00 borax/s, belt-locked

Wash at the pit. **Three inputs: syngas for the mining fluid, water, electricity.** Sized so the wash
side fills exactly one yellow belt of raw-borax and **never needs rebuilding** — rising mining
productivity idles the mines and cuts syngas instead of changing the output.

```
borax (resource)    mining_time 1.5, required_fluid syngas, fluid_amount 25
borax-washing  [U] [washer, 7 s]       raw-borax 10 + water 150  →  borax 10 + muddy-sludge 100
muddy-sludge-void-electrolyzer
               [U] [electrolyzer, 3 s] muddy-sludge 100  →  soil 5 + water 100 + oxygen 10
```

## The sizing idea

**Productivity rises over the game; a yellow belt does not.** So the wash side is built once against
the belt — 15.00 raw-borax/s — and the mine count is chosen to saturate it with margin. Ten mines hit
the belt at **+12.5 %** productivity and stay there forever after.

| prod | mine capacity /s | **uptime** | **borax /s** | **syngas /s** | water /s | MW |
|---|--:|--:|--:|--:|--:|--:|
| 0 % | 13.333 | 100 % | 13.333 | 33.33 | 66.67 | 47.93 |
| +12.5 % | 15.000 | 100 % | **15.000** | 33.33 | 75.00 | 53.40 |
| **+20 %** *(current)* | 16.000 | **93.8 %** | **15.000** | **31.25** | 75.00 | **53.14** |
| +30 % | 17.333 | 86.5 % | **15.000** | 28.85 | 75.00 | 52.83 |
| +40 % *(mp-4)* | 18.667 | 80.4 % | **15.000** | 26.79 | 75.00 | 52.58 |
| +50 % *(mp-5)* | 20.000 | 75.0 % | **15.000** | **25.00** | 75.00 | 52.35 |

**Everything downstream is frozen** — borax, water, soil, oxygen, washer load, electrolyzer load, and
power to within 1 MW. The single moving number is **syngas, and it falls**: 31.25/s today to 25.00/s
at mp-5, a **20 % cut with no rebuild**. Idle mines are the cheapest buffer in the block at 0.42 MW
and 81 tiles each.

Below +12.5 % the belt simply isn't full and output is mine-limited; at 0 % it would be 13.333/s.

## Recipe table

```
┌────────────────────────────────┬───────────────────┬────────┬──────┬───────┬────────┬──────────┐
│ Recipe                         │ Factory           │ Frac   │ Cnt  │ Size  │ Load   │ MW load  │
├────────────────────────────────┼───────────────────┼────────┼──────┼───────┼────────┼──────────┤
│ (mining borax)                 │ borax-mine        │  9.38  │  10  │ 9x9   │  93.8% │   3.938  │
│ borax-washing                  │ washer            │ 10.50  │  11  │ 6x6   │  95.5% │   4.200  │
│ muddy-sludge-void-electrolyzer │ electrolyzer-mk01 │  4.50  │   5  │ 6x6   │  90.0% │  45.000  │
└────────────────────────────────┴───────────────────┴────────┴──────┴───────┴────────┴──────────┘
```

*(at +20 % productivity)*

**26 buildings · 1,386 tiles · 53.14 MW · 25 electronic-circuit to build**

**Inputs** (/s): syngas **31.25** · water **75.00** · 53.14 MW
**Outputs** (/s): **borax 15.00** · soil 7.50 · oxygen 15.00

That supports **34.1 iron-plate/s** on the hot-air BOF route (0.440 borax per plate), or 25.0
aluminium-plate/s through the casting chain.

## Water cannot close, and the ceiling is exactly ⅔

The washer takes **150 water and emits only 100 as sludge** — the other 50 leaves in the product. The
recycle is 1:1 on what it gets, so recovery is capped at **66.7 % at any scale**:

```
225.00 consumed  −  150.00 recycled  =  75.00/s imported      net 5 water per borax, irreducible
```

**The electrolyzer is sludge disposal, not water recovery.** Muddy-sludge is a liquid, so under the
ruleset it must be processed — the 45 MW is mandatory and the recovered water is a rebate on it. The
alternative sink, `py-iron-oxide` (`hpf`, 20 sludge/craft), costs the same power, adds pipe and
iron-oxide imports, recovers no water and emits py-iron-oxide. **Electrolyzer wins outright.**

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| **borax** | 15.00 | the product — `molten-iron-05`, `hotair-iron-plate-1`, `iron-plate-1`, `molten-aluminium-01` | — | — |
| **oxygen** | 15.00 | **pipe to the BOF** — `molten-iron-05` wants 8 oxygen per iron-plate | pipe run | venting: forfeits 15.00 MW of avoided electrolysis |
| **soil** | 7.50 | planter boxes, bio farms | belt out | nothing — soil is wanted |
| muddy-sludge | 0 | consumed internally | — | `py-iron-oxide` (same power, 2 extra imports, no water back) |

**Do not vent the oxygen.** Electrolysis costs **1.0 MW per oxygen/s**, so 15.00/s is worth **15.00 MW
of avoided generation elsewhere** — 28 % of this block's own draw — and `molten-iron-05` sits at the
other end of the borax belt. Piping it takes the effective cost to **~38 MW**.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **the electrolyzers stop** | sludge has nowhere to go, the washers stall on a full sludge pipe, and the mines back up behind them. Also drops the water loop, so the import would have to cover 225/s instead of 75/s |
| 2 | **water supply below 75.00/s** | throttles washing proportionally, and the loop amplifies it — every unit of fresh water short is a unit of recycled water not made next cycle |
| 3 | **washers at 95.5 %** | the tightest row. 6×6 and cheap; one spare is the obvious pad |
| 4 | **oxygen backs up** | only if vented through a throttled stack or piped to a stalled consumer. Stalls the electrolyzers → cascades to #1 |
| 5 | syngas 31.25/s | stops mining; washers and electrolyzers drain their buffers and idle. No cascade. **This is the one input that shrinks over time** |

**The mines are deliberately over-provisioned** and run at 93.8 %, so a single mine outage costs
nothing until productivity has risen enough to need all ten again — which never happens, since
uptime only falls from here.

## Scaling

The wash side is belt-locked, so scaling means another belt and another stamp rather than resizing.
One stamp is 26 buildings and 15.00 borax/s; the block shares no loop with anything outside itself.

If a **red belt** (30/s) is ever worth it, double everything: 20 mines, 22 washers, 10 electrolyzers,
52 buildings, ~106 MW, 30.00 borax/s. The mine count would saturate at the same +12.5 %.

## Solver command

**`--max-import "water:120"` is load-bearing.** The recycle gives water an internal producer, which
reclassifies it from free import to Intermediate with `net >= 0` — impossible in a block that is a net
water consumer. A positive cap adds the import variable and the whole cycle solves in one pass. Cap
generously; it is a ceiling, not a target.

```bash
npx tsx src/cli.ts solve \
  --recipes "borax-washing,muddy-sludge-void-electrolyzer" \
  --target "borax:15" --time 1 \
  --max-import "water:120" \
  --factory "borax-washing:washer" \
  --factory "muddy-sludge-void-electrolyzer:electrolyzer-mk01" \
  --solver simplex \
  --unlocked
```

The cycle warning it prints is expected — confirm the intermediates table shows `muddy-sludge`
producer = consumer, which it does.

**The mining is outside the solve.** `borax` is a `borax`-category resource with `mining_time 1.5`,
`required_fluid: syngas`, `fluid_amount: 25`. `borax-mine` is **speed 2, electric, 0.42 MW, 9×9, one
module slot**:

```
raw-borax = mining_speed / mining_time × (1 + p)              =  2 / 1.5 × 1.2  =  1.600 /s per mine
syngas    = mining_speed × fluid_amount / (10 × mining_time)  =  2 × 25 / 15    =  3.333 /s per mine
uptime    = min(1, 15.00 / (10 × 1.333 × (1 + p)))
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
**`fluid-drill-mk01`** (one each per mine, so ten of each) and **`tar-processing-unit`** (one per
electrolyzer, so five). `aluminium-plate` at 30 per electrolyzer — 150 total — is the only draw on
design 33's output. Inferred from the recipe graph, not from save state.
