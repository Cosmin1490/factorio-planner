# 31 — Iron plate outpost (crushing) — 6.00 iron-plate/s at 2 yellow belts

Remote smelting, the simple way. **Three inputs: iron-ore on belt, acetylene for the furnaces,
electricity.** `iron-ore` is `basic-solid`, so no mining fluid. Two recipes, no byproducts to resolve.

```
grade-1-iron-crush       [U] [crusher,  2 s]  iron-ore 5           →  processed-iron-ore 3 + stone 1
low-grade-smelting-iron  [U] [smelting, 6 s]  processed-iron-ore 3 →  iron-plate 1
```

**Companion to [design 24](24-iron-plate-borax-bof.md), not a replacement** — see § Against the BOF route.

## Crush, don't smelt direct

| route | per iron-ore | |
|---|--:|---|
| `iron-plate` — `iron-ore 8 → iron-plate 1` | **0.125** plate/ore | one building, terrible ratio |
| **crushing chain** — `ore 5 → processed 3 → plate 1` | **0.200** plate/ore | **1.6× better** |

The chain stops there: **`grade-2-iron` is locked**, so there is no deeper grading to recover (unlike
copper, where `grade-1-copper` crushes back into `grade-2-copper`). Two recipes is the whole block.

## Both sizes

| | **1 yellow belt** | **2 yellow belts** |
|---|--:|--:|
| iron-ore in | 15.00 /s | **30.00 /s** |
| **iron-plate out** | 3.00 /s | **6.00 /s** |
| **stone out** | 3.00 /s | **6.00 /s** |
| **acetylene** | 27.00 /s | **54.00 /s** |
| electricity | 6.00 MW | **12.00 MW** |
| buildings | 11 | **21** |
| tiles | ~314 | **~624** |

**2 belts recommended**, matching the copper outpost so the pair is symmetric and the stone rates line up.

## Recipe table — 2 belts

```
┌─────────────────────────┬───────────────┬──────┬───────┬───────┬──────────┐
│ Recipe                  │ Factory       │ Cnt  │ Size  │ Load  │ MW load  │
├─────────────────────────┼───────────────┼──────┼───────┼───────┼──────────┤
│ grade-1-iron-crush      │ jaw-crusher   │  12  │ 7x7   │ 100 % │   12.00  │
│ low-grade-smelting-iron │ steel-furnace │   9  │ 2x2   │ 100 % │   burner │
└─────────────────────────┴───────────────┴──────┴───────┴───────┴──────────┘
```

**21 buildings · ~624 tiles · 12.00 MW electric · acetylene 54.00/s**

Both rows land on **exact integers at 100 %** — 12.000 and 9.000 fractional — so there is no rounding
waste anywhere in the block. That only happens at belt multiples; see § Scaling.

**Inputs** (/s): iron-ore 30.00 · **acetylene 54.00** · electricity 12.00 MW

**Outputs** (/s): **iron-plate 6.00** · **stone 6.00**

## Acetylene — six times the copper outpost

> **The solver cannot model fluid-burner fuel and reports it as electricity.** It gives 66.00 MW for the
> 2-belt case; **54.00 of that is the furnaces' gas.** `resolveFuel` bails on
> `if (!factory.burner_prototype)` and a `--fuel` override is silently dropped, so this is hand-derived:
>
> ```
> furnace fractional = (processed-iron-ore 18/s ÷ 3) × 6 s ÷ speed 4  =  9.000
> fuel               = 9.000 × 6.00 MW ÷ (1.00 MJ × eff 1)            =  54.00 acetylene/s
> electrical         = 66.00 reported − 54.00 fuel                    =  12.00 MW
> ```

**This is the block's defining cost.** For the same 6.00 plate/s, the copper outpost burns **9.00
acetylene/s and this one burns 54.00** — six times as much:

| | copper (design 30) | **iron (this)** |
|---|--:|--:|
| plate out | 6.00 /s | 6.00 /s |
| **acetylene** | **9.00 /s** | **54.00 /s** |
| furnace-seconds per plate | 0.25 | **1.50** |
| furnaces | 2 | **9** |

`copper-plate-4` is `grade-2-copper 5 → copper-plate 2` in **2 s**; `low-grade-smelting-iron` is
`processed-iron-ore 3 → iron-plate 1` in **6 s**. Twelve times the furnace time per plate, partly offset
by speed 4 on both. **Iron smelting is where the gas goes.**

Design 10 produces acetylene at 391.48/s, so 54.00 is affordable — but **copper + iron together is
63.00/s**, and a second iron outpost would be another 54.

## Against the BOF route

[Design 24](24-iron-plate-borax-bof.md) is **4.5× more ore-efficient**:

| | **crushing (this)** | **BOF (design 24)** |
|---|--:|--:|
| plate per iron-ore | **0.200** | **0.900** |
| inputs | ore · acetylene · power | ore · **raw-coal · borax · creosote · water** |
| internal chain | 2 recipes | oxygen electrolysis · coke oven · sand-casting · hot-air |
| buildings for 6 plate/s | **21** | ~27 (scaled from 50 at 11.25/s) |
| byproducts to resolve | none | ash 6.00 · stone 1.83 |

`hotair-iron-plate-1` (`molten-iron 100 + hot-air 50 → iron-plate 75`) is simply a far better recipe than
anything in the crushing line, and the BOF route gets 4.5 plates per ore where this gets one.

**So use this where the BOF infrastructure is not worth standing up** — a remote patch, a site with
acetylene and power but no coke or borax line, or a second source that needs no new chemistry. It trades
**4.5× the ore** for **zero chemical dependencies.** On a large patch that is usually the right trade;
on a small one it is not.

## Terminal outputs and their sinks

| output | /s | sink |
|---|--:|---|
| **iron-plate** | 6.00 | the product — Tier A. Circuit complex takes 1.90 |
| **stone** | 6.00 | **[design 38](38-stone-disposal-outpost.md)** — absorbs 12.00/s base-wide at 80 % duty. Also saline, `Moss-2`, stone-brick |

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **stone backs up and stops the block** | `grade-1-iron-crush` is **multi-output** (`processed-iron-ore 3 + stone 1`), so a full stone belt stalls every crusher → total stop. **Not optional to route** |
| 2 | ~~**stone 6.00/s here + 6.00/s from design 30 = 12.00/s base-wide**~~ **resolved** | **[design 38](38-stone-disposal-outpost.md) takes the whole 12.00/s** via `stone-to-gravel → gravel-to-sand → sand-classification`, which destroys 20 sand into 4.55 units. 17 buildings, and it degrades gracefully on undersupply |
| 3 | **both rows at 100 %** | zero headroom on either. A crusher outage drops plate proportionally; 49 tiles and 1.00 MW each is the cheap pad |
| 4 | acetylene 54.00/s | stops all smelting, but ore and processed-ore back up gracefully — no cascade |

> **The stone problem is real and arrives with the second outpost** — a backed-up stone belt stops both
> outposts dead, because `grade-1-iron-crush` is multi-output. **[Design 38](38-stone-disposal-outpost.md)
> is the answer**: 17 buildings sized for 15.00 stone/s, so the combined 12.00/s runs it at 80 % duty with
> room for design 24's 1.833/s and design 32's 1.309/s on top.
>
> **Correction to the 1.42 figure above: that is the stone, not the saline.** Base-wide saline demand is
> **7.103/s** — design 25 6.000 + design 29 1.103, with designs 26, 27 and 36 needing none — and 1.421/s
> is the stone that makes it. Design 30's table has both columns; this one compressed them. Saline was
> never going to absorb more than ~1.4 stone/s either way, so the shape of the problem is unchanged.
>
> Alternative sinks still stand if 38 is not built: `Moss-2` would take ~3–4/s in each of designs 27 and
> 28 if that swap is taken, and `stone-brick` absorbs any amount but needs a consumer of its own.

## Scaling

Linear in iron-ore, and **integer at every yellow-belt multiple** — `grade-1-iron-crush` is exactly
2 crushers per 5 ore/s and `low-grade-smelting-iron` exactly 3 furnaces per 10 ore/s:

| | 1 belt | 2 belts | 3 belts |
|---|--:|--:|--:|
| iron-plate | 3.00 | 6.00 | 9.00 |
| buildings | 11 | 21 | 32 |
| **acetylene** | 27.00 | **54.00** | 81.00 |
| stone | 3.00 | 6.00 | 9.00 |

**Acetylene is what caps this, not buildings.** Three belts is 81/s — a fifth of design 10's entire
output for one outpost.

## Solver command

**Input mode** — supply-driven with two products, so `--target` would size for iron-plate and could drop
the stone leg.

```bash
npx tsx src/cli.ts solve \
  --recipes "grade-1-iron-crush,low-grade-smelting-iron" \
  --input "iron-ore:30" --time 1 \
  --factory "grade-1-iron-crush:jaw-crusher" \
  --factory "low-grade-smelting-iron:steel-furnace" \
  --solver simplex \
  --unlocked
```

For one belt, `--input "iron-ore:15"`. No constraints needed — no cycles, no capped intermediates.
**Reported MW includes the furnaces' fuel as electrical**; subtract `furnace_fractional × 6.00` for the
true electrical figure and divide the same number by the fuel's MJ for the gas rate.

## Build materials

Distinct construction materials across this block's 2 building types, separate from flow imports:

`concrete` · `copper-cable` · `electronic-circuit` · `engine-unit` · `iron-gear-wheel` · `iron-plate` ·
`pipe` · `refined-concrete` · `small-parts-01` · `steel-plate` · `stone-brick` · `stone-furnace`

**`jaw-crusher` carries no electronic-circuit at all** (`steam-engine 4 + small-parts-01 10 +
steel-plate 30 + iron-plate 25`), and neither does `steel-furnace` (`refined-concrete 10 +
steel-plate 6`). **So this block costs zero circuits to build** — the cheapest thing in the repo by that
measure, and worth knowing while circuits are the constraint. Inferred from the recipe graph, not from
save state.
