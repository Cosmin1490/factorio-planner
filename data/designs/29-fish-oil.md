# 29 — Fish oil — 1.00 fish-oil/s, 11 buildings

Sized for **gearboxes**. `gearbox-mk01` takes `fish-oil 20`, so 1.00 fish-oil/s is:

| | rate |
|---|--:|
| **gearbox-mk01** | **0.050 /s · 3 /min · 180 /hour** |
| `py-construction-robot-mk01` (fish-oil 50, also needs a gearbox) | 0.020 /s · 1.2 /min |

That is well past construction demand — it is the smallest rate at which the breeding loop rounds
cleanly, since one render craft already covers 5 gearboxes.

```
full-render-fish  [U] [slaughterhouse, 30 s]  fish 8  →  bones 2 + meat 2 + skin 3 + guts 5 + fish-oil 100
breed-fish-1      [U] [fish-farm,    150 s]  small-lamp 3 + biomass 10 + fish-egg 10 + oxygen 60
                                             + water-saline 100  →  fish 10 + waste-water 100
breed-fish-egg-1  [U] [fish-farm,     80 s]  fish 12 + phytoplankton 50 + water-saline 100
                                             →  fish-egg 25 + waste-water 100
```

**Base `breed-fish-1`, no TURD pick.** At tier 1 `a-select` is rate-neutral on fish so it saves no farms,
and costs **+24 % water-saline and +24 % oxygen** — both of which this block sources itself. The pick is
held for `breed-fish-2`+, where `fish-food-01` becomes a required ingredient.

## Three closures, all internal

**Biomass from the co-products.** Rendering 8 fish yields 12 solid co-products, each composting to
`biomass 3`, against breeding's `biomass 10 per 10 fish`. Composting `skin` fully and `guts` partially
lands on **exactly 0.1538/s against 0.1538 needed** — no import, no surplus.

**Chlorine from the guts.** `waste-water-void` (`waste-water 50 + chlorine 10 → water 50`) is the only
enabled sink for waste-water, and `guts-to-chlorine` makes 100 chlorine per 5 guts. The guts therefore
split three ways and the chlorine balances exactly:

```
guts 0.0500/s  →  guts-to-chlorine 0.0215  →  chlorine 0.431/s  =  waste-water-void demand, exact
               →  biomass-guts     0.0213  →  biomass 0.064/s
               →  export           0.0072
```

**Oxygen from water.** `hydrogen` [electrolyzer-mk01] at 9 % covers `breed-fish-1`'s oxygen 0.923/s,
venting hydrogen 1.85/s (pre-approved, 0.10 MJ).

## Block boundary

| class | items |
|---|---|
| **export** | **fish-oil** 1.00/s → gearboxes |
| **export — trace** | bones 0.02 · meat 0.02 · guts 0.007 /s |
| **vented** | hydrogen 1.85/s |
| **import — whitelisted** | water 16.00/s · small-lamp 0.046/s |
| **import — asked and approved** | **water-saline** 2.154/s · **grade-1-tin** 0.031/s |
| **made in-block** | fish, fish-egg, phytoplankton, **biomass**, **oxygen**, chlorine |
| **byproduct-exclude** | none — skin, guts and waste-water all close internally |

**Four imports, two of them trace.** `water-saline` in mineral terms, since it has no producer anywhere
in the base:

| route | material | water | washers |
|---|--:|--:|--:|
| `saline-water` (`stone 10 + water 100 → 50`) | **stone 0.431 /s** | 4.31 /s | 1 |
| `gravel-saline-water` (`gravel 15 + water 100 → 50`) | **gravel 0.646 /s** | 4.31 /s | 1 |

Stone 0.431/s is a fifth of design 24's 1.833/s export. **Combined with design 25's 6.00/s saline, the
base needs stone 1.631/s or gravel 2.446/s across 4 washers** — still inside design 24 alone.

## Recipe table

Fish farms are **module-corrected**: `fish-farm-mk01` is speed 0.125 with 7 `fish` slots → **8×**,
reaching effective speed 1.00. Modules are **self-funding**. Everything else is speed 1.

```
┌──────────────────────────┬─────────────────────┬──────┬───────┬───────┬─────────┐
│ Recipe                   │ Factory             │ Cnt  │ Size  │ Load  │ MW load │
├──────────────────────────┼─────────────────────┼──────┼───────┼───────┼─────────┤
│ breed-fish-1             │ fish-farm-mk01      │  *3  │ 11x11 │  77 % │   2.308 │
│ breed-fish-egg-1         │ fish-farm-mk01      │  *1  │ 11x11 │  49 % │   0.492 │
│ phytoplankton            │ plankton-farm       │   1  │ 7x7   │  46 % │   0.162 │
│ full-render-fish         │ slaughterhouse-mk01 │   1  │ 11x11 │  30 % │   0.090 │
│ biomass-skin             │ compost-plant-mk01  │   1  │ 11x11 │   9 % │   0.045 │
│ biomass-guts             │ compost-plant-mk01  │   1  │ 11x11 │   6 % │   0.032 │
│ guts-to-chlorine         │ atomizer-mk01       │   1  │ 7x7   │   4 % │   0.035 │
│ waste-water-void         │ quenching-tower     │   1  │ 7x7   │   4 % │   0.022 │
│ hydrogen  (for oxygen)   │ electrolyzer-mk01   │   1  │ 6x6   │   9 % │   0.930 │
└──────────────────────────┴─────────────────────┴──────┴───────┴───────┴─────────┘
   * module-corrected. Solver base counts: 18.46 / 3.94, multiplier 8x
   All nine rows from one solve — see § Solver command.
```

**11 buildings · ~1,030 tiles · 4.12 MW at load · 16.95 MW rated**

Rated is 4× load almost entirely because of **one `electrolyzer-mk01` at 9 %** (10.00 MW rated, 0.93 at
load). **Size the substation for 4 MW.**

**The four fish farms are 484 of the 1,030 tiles**, three of them feeding one slaughterhouse at 30 %.
Intrinsic — `breed-fish-1` is a 150-second craft in an 0.125-speed building.

**Inputs** (/s): water 16.00 · **water-saline 2.154** · small-lamp 0.046 · grade-1-tin 0.031

**Exports** (/s): **fish-oil 1.00** · bones 0.02 · meat 0.02 · guts 0.007 · *(hydrogen 1.85 vented)*

## Intermediate flows

```
┌───────────────┬─────────┬────────────────────────────┬────────────────────────────────────────┐
│ Item          │ Rate /s │ Producer                   │ Consumer                               │
├───────────────┼─────────┼────────────────────────────┼────────────────────────────────────────┤
│ fish          │  0.154  │ breed-fish-1               │ full-render-fish 0.080,                │
│               │         │                            │ breed-fish-egg-1 0.074                 │
│ fish-egg      │  0.154  │ breed-fish-egg-1           │ breed-fish-1        ← closed loop        │
│ phytoplankton │  0.308  │ phytoplankton              │ breed-fish-egg-1                       │
│ biomass       │  0.154  │ biomass-skin 0.090         │ breed-fish-1 0.154   ← exact            │
│               │         │ + biomass-guts 0.064       │                                        │
│ oxygen        │  0.923  │ hydrogen (electrolyzer)    │ breed-fish-1                           │
│ skin          │  0.030  │ full-render-fish           │ biomass-skin                           │
│ guts          │  0.050  │ full-render-fish           │ guts-to-chlorine 0.0215,               │
│               │         │                            │ biomass-guts 0.0213, export 0.0072     │
│ chlorine      │  0.431  │ guts-to-chlorine           │ waste-water-void    ← exact             │
│ waste-water   │  2.154  │ breed 1.538 + egg 0.615    │ waste-water-void                       │
│ water         │  2.154  │ waste-water-void           │ of phytoplankton 15.385                │
│               │         │ + import 16.00             │ + hydrogen 2.769                       │
└───────────────┴─────────┴────────────────────────────┴────────────────────────────────────────┘
```

**The fish/egg loop is net zero** — `breed-fish-egg-1` takes fish 12 and returns eggs 25; `breed-fish-1`
takes eggs 10 and returns fish 10. It needs a starting stock, not resupply.

**Water: 18.154/s consumed, 2.154/s recycled, 16.00/s imported.** Phytoplankton is 85 % of the draw
(water 500 per craft).

## Terminal outputs and their sinks

| output | /s | sink chosen | what it beat |
|---|--:|---|---|
| **fish-oil** | 1.00 | **gearboxes** — 20 each, 3/min | the product |
| **skin** | 0.030 | **`biomass-skin`** → feeds `breed-fish-1` | `skin-to-lead` (skin 7 → ore-lead 5) — an atomizer for 0.021 ore-lead/s, and biomass would then need importing |
| **guts** | 0.050 | **split** — chlorine 0.0215, biomass 0.0213, export 0.0072 | composting all of it strands the waste-water; converting all of it strands 0.47 chlorine/s |
| **waste-water** | 2.154 | **`waste-water-void`** → water 2.154/s back | a liquid with no other enabled consumer; a recycle, not a void |
| **chlorine** | 0.431 | **`waste-water-void`, exactly balanced** | never-vent, so no alternative |
| **hydrogen** | 1.846 | **vented** — pre-approved, 0.10 MJ is noise | a boiler recovers ~0.37 MJ/s — not worth a building |
| **bones · meat** | 0.02 · 0.02 | **export, trace** | `bones-to-kerogen` and `meat-to-tin` are enabled but each is an `atomizer-mk01` at ~4 % for 0.032 kerogen/s and 0.06 ore-tin/s |

> **`meat 0.02/s` is worth remembering for design 27.** `auog-recharge-00` is
> `[bay, 15 s] meat 10 + used-auog 1 + moss 5 → auog 1`, which would replace the 300 s codex bootstrap.
> At this rate it supports ~7 auog/hour against design 27's need for 36 — not a shortcut at this scale,
> but a reason to size this block **up** rather than down. **`used-auog` still needs an in-game check**;
> it has no recipe anywhere in the export.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **water-saline 2.154/s has no producer** | = stone 0.431/s or gravel 0.646/s in 1 washer. Same unsourced input as design 25's 6.00/s |
| 2 | **the fish/egg loop nets to zero** | no external top-up. One stray inserter drains the egg bank and both farms stop; at 150 s and 80 s per craft, recovery is minutes |
| 3 | **the guts split is a priority, not a ratio** | if the chlorine leg starves, `waste-water-void` stops and waste-water backs up into both fish farms. **Give `guts-to-chlorine` the priority inserter**, `biomass-guts` second, export last |
| 4 | **biomass is exactly balanced — zero headroom** | 0.1538 supplied against 0.1538 needed. A skin or guts interruption starves `breed-fish-1` within minutes. **The cheapest pad is a second `biomass-skin` plant**, or buffer biomass in a chest |
| 5 | bones · meat buffers | days, not hours. A clock, not an operational risk |
| 6 | grade-1-tin 0.031/s | feeds `phytoplankton` only. Design 21 produces it |

## Bio modules

| building | ×count | module | needed | self-funding? |
|---|--:|---|--:|---|
| `fish-farm-mk01` | 4 | `fish` 7 | **28** | **yes** — the block makes fish |

**28 fish is about 180 seconds of the block's own output** — no codex, no creature chamber, the cheapest
bio bootstrap in the repo. Seed it with a few manually caught or imported fish.

## Solver command

**All nine recipes and all three cycles in one solve.** The `--max-import "water:100"` is the flag that
makes it work and is not optional:

```bash
npx tsx src/cli.ts solve \
  --recipes "breed-fish-1,breed-fish-egg-1,phytoplankton,full-render-fish,biomass-skin,biomass-guts,guts-to-chlorine,waste-water-void,hydrogen" \
  --target "fish-oil:1" --time 1 \
  --max-import "water:100" \
  --factory "breed-fish-1:fish-farm-mk01" \
  --factory "breed-fish-egg-1:fish-farm-mk01" \
  --factory "phytoplankton:plankton-farm" \
  --factory "full-render-fish:slaughterhouse-mk01" \
  --factory "biomass-skin:compost-plant-mk01" \
  --factory "biomass-guts:compost-plant-mk01" \
  --factory "guts-to-chlorine:atomizer-mk01" \
  --factory "waste-water-void:quenching-tower" \
  --factory "hydrogen:electrolyzer-mk01" \
  --solver simplex \
  --unlocked
```

> **Without `--max-import "water:100"` this returns 0 buildings.** `waste-water-void` gives water an
> internal producer, which reclassifies it from free-import to Intermediate with `net >= 0` — so the LP
> must balance all 18.15 water/s internally, which is impossible. A positive cap adds an **import
> variable**, letting water be produced *and* imported. The cap is a ceiling, not a target: 100 is
> arbitrary and generous against the 16.00/s actually drawn. Solver-reference § *Closed self-sustaining
> loops*.

It emits one long cycle warning spanning chlorine → guts → biomass → skin → fish-egg → oxygen →
phytoplankton → water → waste-water → fish. That is the block working as designed — **do not apply the
suggested `--constraint "guts-to-chlorine:chlorine:exclude"`**, which breaks the waste-water sink.

Fractional counts came from `--target "fish-oil:1000"` ÷ 1000:
**18.46 / 3.94 / 0.46 / 0.30 / 0.090 / 0.064 / 0.044 / 0.044 / 0.093**. The guts split was read at
`--target "fish-oil:100"` where the three legs resolve to 2.15 / 2.13 / 0.72 per 100.

**The LP sizes the composts tighter than hand algebra does** — it lands biomass on exactly 0.1538/s with
no surplus, where hand-sizing `skin + all surplus guts` gives 0.175/s and 0.022/s of waste. Worth
re-solving rather than hand-splitting whenever a loop has two feed options.

## Build materials

Distinct construction materials across this block's 7 building types, separate from flow imports:

`aluminium-plate` · `concrete` · `copper-cable` · `copper-plate` · `duralumin` · `electronic-circuit` ·
`engine-unit` · `gearbox-mk01` · `glass` · `intermetallics` · `iron-gear-wheel` · `iron-plate` · `lab` ·
`pipe` · `pump` · `shaft-mk01` · `small-lamp` · `small-parts-01` · `steam-engine` · `steel-plate` ·
`stone-brick` · `wood`

> **This block needs `gearbox-mk01` to build, and `gearbox-mk01` needs fish-oil.** One-way and small — a
> handful of gearboxes from existing stock gets the first block up, after which it funds every gearbox
> thereafter. Flagged because it looks like a blocker and is not. Inferred from the recipe graph, not
> from save state.
