# 40 — Rubber — 15.00/min, 13 buildings, net +15.8 MW exporter

Sized so **`rubber-01` sits at exactly 100 %** — frac 1.000, one `heavy-oil-refinery-mk01`. That is the
natural stopping point: the other three process rows are at 25 % or below, so 15/min is the largest
output the block reaches before anything needs a second machine.

**Design 39 wants 5.85 rubber/min**, and design 36 buys `lab-instrument` rather than rubber, so its
demand flows through 39 — 5.85 is the combined figure, not a sum. This block covers it **2.56× over**.

```
rubber-01      [U] [hor,       4 s]  latex 1 + carbon-black 2 + polybutadiene 50  →  1
carbon-black   [U] [reformer,  2 s]  anthracene-oil 200 + vacuum 100              →  4
polybutadiene  [U] [cracker,   2 s]  titanium-plate 1 + aromatics 200 + water 1000
                                     →  polybutadiene 100 + steam 1000 @150 °C
vacuum         [U] [vacuum,    2 s]  (no ingredients)                             →  200
```

## Recipe table

```
┌───────────────┬─────────────────────────┬────────┬───────┬────────┬────────────┐
│ Recipe        │ Factory                 │  frac  │ Count │  Util  │ Size       │
├───────────────┼─────────────────────────┼────────┼───────┼────────┼────────────┤
│ rubber-01     │ heavy-oil-refinery-mk01 │  1.000 │   1   │ 100.0% │ 13x13      │
│ carbon-black  │ reformer-mk01           │  0.250 │   1   │  25.0% │ 13x13      │
│ polybutadiene │ cracker-mk01            │  0.250 │   1   │  25.0% │ 7x7        │
│ vacuum        │ vacuum-pump-mk01        │  0.125 │   1   │  12.5% │ 3x3        │
├───────────────┼─────────────────────────┼────────┼───────┼────────┼────────────┤
│ (power)       │ steam-engine            │  8.333 │   9   │  92.6% │ 3x5 · hand │
└───────────────┴─────────────────────────┴────────┴───────┴────────┴────────────┘
```

**13 buildings · 531 tiles · 1.90 MW drawn, 17.72 MW generated → net +15.82 MW**

Four process machines and nine engines. `vacuum` is free — `[vacuum, 2 s]` with an empty ingredient
list, same shape as `pressured-air`.

## Imports — 5

| | /min | note |
|---|--:|---|
| **aromatics** | **1,500.00** | 25.00/s — the real cost |
| **anthracene-oil** | **1,500.00** | 25.00/s — imported by choice |
| water | 7,500.00 | 125/s, all into `polybutadiene` |
| latex | 15.00 | design 17 makes 27/min |
| titanium-plate | 7.50 | |

**Exports** (/min): **rubber 15.00** · steam 7,500 @150 °C *(consumed by the engines)*

**Aromatics and anthracene-oil both land at exactly 25.00/s** — the same figure design 17 draws of
each. That is coincidence, not structure, but it is the right scale reference: this block doubles the
base's draw on both.

## The steam is why it is an exporter

`polybutadiene` emits **1,000 steam @150 °C per craft**, and with `latex` imported none of it is
consumed internally:

```
steam @150 C  =  2100 x (150 - 15)  =  0.2835 MJ/unit      <- not 0.4935; that is 250 C
125/s x 0.2835 x 0.5 (steam-engine effectivity)  =  17.72 MW
125 / 15 steam-per-engine  =  8.33  ->  place 9
```

Hand-derived — engines are entities, not recipes, so they sit outside the solve.

**Inlining `latex` would waste most of it.** `latex` [hpf, 10 s] takes 150 steam per unit, so 15
latex/min reclaims only **37.5 of the 125 steam/s**. Design 17 routes its polybutadiene steam that way
because it makes latex anyway; here, generating is strictly better.

## The aromatics ratio is inherent

`rubber-01` wants **50 polybutadiene per rubber**, and `polybutadiene` is 200 aromatics per 100 — so
**33.3 aromatics per rubber**, before anything else in the chain.

That is why design 39 buys rubber rather than making it, and this block does not change the arithmetic
— it relocates it somewhere visible and recovers 15.8 MW on the way. The decision is whether the
aromatics bus can carry +25/s, not whether four buildings are worth it.

## Terminal outputs and their sinks

| output | /min | sink chosen | what it beat |
|---|--:|---|---|
| **rubber** | 15.00 | **design 39** (5.85) — the product, 2.56× covered | — |
| steam @150 °C | 7,500 | **9 steam-engines → 17.72 MW** | `latex` inline, which reclaims only 30 % of it; venting is forbidden — steam is never vented |

**Nothing is vented and nothing is stranded.** The steam rule applies in the usual direction: if the
engines back up the cracker throttles, which costs throughput rather than fuel.

## Risks

| | risk | why |
|---|---|---|
| 1 | **aromatics 25.00/s** | doubles the base-wide draw. Design 17 takes 25, design 32 takes 20 for its plastic. **Check the supply before building, not after** |
| 2 | **anthracene-oil 25.00/s** | second fluid at the same rate; both come off the coal-chemicals side |
| 3 | `rubber-01` at 100 % | zero headroom by construction. Any increase needs a second 13×13 refinery, and the block jumps to 6+ buildings |
| 4 | steam must drain | the engines are the sink; if they are not placed the cracker stalls and rubber stops four steps later |

**Risk 1 is the decision.** At 5.85/min of actual demand you are sizing 2.56× ahead to hit a round
utilisation — that is defensible if rubber finds other consumers, and 25 aromatics/s is a lot to spend
if it does not. **Scaling down is linear and costs nothing but utilisation**: 6/min needs the same
4 process buildings at 40 %, 10 aromatics/s, and 4 engines for +6.3 MW.

## Scaling

| rubber/min | process bldgs | engines | aromatics/s | net MW |
|---:|---:|---:|---:|---:|
| 6 | 4 | 4 | 10.0 | +6.3 |
| **15** | **4** | **9** | **25.0** | **+15.8** |
| 30 | 6 | 17 | 50.0 | +31.5 |

Strictly linear in everything. 15/min is the knee — below it the refinery is idle, above it you buy a
second one.

## Solver command

The three `--max-import` caps force `carbon-black`, `polybutadiene` and `vacuum` internal; drop any and
the LP buys that step. Fractional counts come from the same command at `--target "rubber:15000"` ÷ 1000.

```bash
npx tsx src/cli.ts solve \
  --recipes "rubber-01,carbon-black,polybutadiene,vacuum" \
  --target "rubber:15" --time 60 \
  --max-import "carbon-black:0.001" --max-import "polybutadiene:0.001" \
  --max-import "vacuum:0.001" \
  --factory "rubber-01:heavy-oil-refinery-mk01" \
  --factory "carbon-black:reformer-mk01" \
  --factory "polybutadiene:cracker-mk01" \
  --factory "vacuum:vacuum-pump-mk01" \
  --solver simplex \
  --unlocked
```

The nine engines are **not** in the solve. Size them as
`steam/s ÷ 15` and the output as `steam/s × 0.2835 × 0.5` — and note the **0.2835, not 0.4935**: this
steam is 150 °C, not the 250 °C a boiler makes. Using the boiler figure overstates generation by 74 %.

## Build materials

Distinct construction materials across this block's 5 building types, separate from flow imports:

`distilator` · `electronic-circuit` · `iron-plate` · `lab` · `lead-plate` · `pipe` · `small-parts-01` ·
`steam-engine` · `steel-plate` · `stone-furnace` · `titanium-plate`

```
 360x iron-plate     122x small-parts-01    90x steel-plate    80x electronic-circuit
  55x pipe            25x steam-engine      20x lead-plate     10x titanium-plate
   2x stone-furnace    1x distilator         1x lab
```

**25 `steam-engine` as a material, separate from the 9 placed** — they come in through the
`heavy-oil-refinery-mk01`, `reformer-mk01` and `cracker-mk01` recipes. **`distilator` ×1 and `lab` ×1**
are the two whole machines consumed as ingredients, both inside the refinery. `titanium-plate` appears
twice over: 10 to build, 7.50/min to run. Inferred from the recipe graph, not from save state.
