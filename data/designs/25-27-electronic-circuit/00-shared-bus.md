# 00 — Shared bus — designs 25, 26, 27

The three blocks in this directory are designed **independently** — each solves on its own, each has
its own solver command, each can be stamped or resized without touching the others. What they share is
**logistics**: one bus feeds all three, and this file is the union.

```
                  ┌── melamine 1.60/s ──┐
                  │   urea 0.40/s       │
27 battery+urea ──┤                     ├──▶ 25 formica ── formica 0.40/s ──▶ 26 electronics
       │          └── battery-mk01 0.20/s ────────────────────────────────────▶      │
       ▼                                                                             ▼
  ammonia 6.00/s                                                        electronic-circuit 1.00/s
  (no destination)
```

| design | buildings | tiles | MW load | MW rated | own imports | own exports |
|---|--:|--:|--:|--:|--:|---|
| [25 — formica](25-formica.md) | 26 | ~1,687 | 13.67 | 48.50 | 7 | formica, iron-oxide |
| [26 — electronic circuits](26-electronic-circuit.md) | 20 | ~684 | 29.16 | 42.95 | 9 | electronic-circuit |
| [27 — battery + urea](27-battery-urea.md) | 99 | ~7,678 | 37.12 | 67.73 | 9 | battery-mk01, melamine, urea, ammonia |
| **complex** | **145** | **~10,049** | **79.95** | **159.18** | **13 distinct** | **3 external** |

Scaled for **1.0 electronic-circuit/s**. Every rate below is linear in that.

**Design 25 switched from `formica` to `formica-2`** — 148 → 26 buildings, and **creosote 40.00 →
6.00/s**, which was the complex's second cap. The cost is melamine 1.60/s and urea 0.40/s, both made in
design 27, which grew 79 → 99 to cover them. **Net: −102 buildings, −3,031 tiles, −12.0 MW.**

Two later boundary calls, both in design 25: **`water-saline` is imported rather than made from stone**
(drops 3 washers and the stone station, adds the bus's third fluid), and **`log2` replaced `log3`**
(drops the 0.54 ash/s flow, costs a second 15×15 `fwf`). Together they removed two solid items from the
bus and added one fluid.

---

## Imports — union and sum

### Solids — 10 items, 21.97 /s

| item | 25 | 26 | 27 | **bus total** | shared? |
|---|--:|--:|--:|--:|---|
| **native-flora** | — | — | 6.95 | **6.95** | 27 only |
| **coke** | — | 2.41 | 1.50 | **3.91** | **26 + 27** |
| **copper-plate** | 0.40 | 2.80 | 0.20 | **3.40** | **all three** |
| **iron-plate** | 0.02 | 1.50 | 0.38 | **1.90** | **all three** |
| **tin-plate** | — | 1.87 | — | **1.87** | 26 only |
| **lead-plate** | — | 1.60 | — | **1.60** | 26 only |
| **glass** | — | 1.00 | 0.35 | **1.35** | **26 + 27** |
| **zinc-plate** | — | — | 0.60 | **0.60** | 27 only |
| **pbsb-alloy** | — | — | 0.20 | **0.20** | 27 only |
| **empty-petri-dish** | — | — | 0.19 | **0.19** | 27 only |
| | | | | **21.97 /s** | |

**All solids fit one red belt** — 21.97/s against 30/s, with room to ~1.37 c/s before a second belt.
No single item exceeds 6.95/s, so nothing needs a dedicated lane on throughput.

**Four items are genuinely shared**: copper-plate and iron-plate (all three), coke and glass (26 + 27).
**Design 25 is down to two solid externals** — copper-plate 0.40 and iron-plate 0.02, both already on
the bus for 26 and 27. `ash` left with `log3`; `stone` left with the saline washers.

### Fluids — 3 items

| item | 25 | 26 | 27 | **bus total** |
|---|--:|--:|--:|--:|
| **water** | 60.46 | 38.22 | 483.27 | **581.95** |
| **creosote** | 6.00 | — | — | **6.00** |
| **water-saline** | 6.00 | — | — | **6.00** |

**Water should not be bussed.** 581.95/s is past the mk01 fluid-wagon ceiling (~400/s) and into mk02
territory (~830/s). Rule 27's answer applies: **site the complex on water and pipe it** — unlimited
throughput, zero stations. **Design 27 alone wants 83 % of it**, so the siting constraint is its, and
49 % of 27's share is the moss bank's sludge/soil chain — see
[27 § Where the water goes](27-battery-urea.md).

**Creosote is one 6.00/s pipe to design 25 only.** At route 1's 40.00/s this was the complex's binding
constraint against a base floor near 34/s; **at 6.00 it is no longer a constraint at all.**

**`water-saline` 6.00/s is the one import with no producer anywhere in the base.** It was moved out of
design 25 deliberately — see [25 § The sodium-hydroxide question](25-formica.md) — but **moving it did
not delete the three washers**, it relocated them. All three recipes that make it are `[washer, 20 s]`
and the cheapest external source is still stone 1.20/s or gravel 1.80/s into 3 washers at ~0.96 MW. Both
fluid pipes go to design 25 only, so one mk01 wagon or one pipe run covers creosote and saline together.

### Inter-block — not bus traffic

| item | from → to | /s | form |
|---|---|--:|---|
| **melamine** | 27 → 25 | 1.60 | solid, stack 100 |
| **formica** | 25 → 26 | 0.40 | solid, stack 100 |
| **urea** | 27 → 25 | 0.40 | solid, stack 100 |
| **battery-mk01** | 27 → 26 | 0.20 | solid, stack 100 |

All four are solid and small — 2.60/s combined. They ride the same bus as the imports; none needs
special handling. **But they make the blocks mutually ordered**: 25 cannot start before 27 has melamine
and urea, and 26 needs both.

---

## Exports — union and sum

### Leaving the complex

| item | from | /s | sink |
|---|---|--:|---|
| **electronic-circuit** | 26 | **1.00** | the product — Tier A, 219 consumers |
| **ammonia** | 27 | **6.00** | **no consumer identified** — see below |
| **iron-oxide** | 25 | 0.02 | real product; output of 25's chlorine sink |

### Handled in-block, not exported

| item | from | /s | disposition |
|---|---|--:|---|
| **tall-oil** | 25 | 0.60 | **burned** — `oil-boiler-mk01`, 2.43 of the block's 20.00 steam/s |
| **hydrogen** | 25 | 1.20 | **vented** — pre-approved, 0.10 MJ |
| **black-liquor** | 25 | 0.40 | **buffered** — 17.4 h per 25,000-unit tank. No sink exists; see 25 |

---

## Station budget

| block | solid items in | fluid items in | items out | notes |
|---|--:|--:|--:|---|
| 25 formica | 4 (2 external + 2 inter-block) | 3 | 2 | creosote + saline piped; water piped if sited on it |
| 26 electronics | 8 (6 external + 2 inter-block) | 1 | 1 | **station-heavy** — 20 buildings against ~10 station roles |
| 27 battery + urea | 7 | 1 | 4 | and it is the one block big enough to need two stamps |

**Design 26 is still the station-heavy one** — that is the rule 20 trade in miniature: a small block
spending its space budget on stations rather than factories. **Design 25 came out the cleanest**: two
external solids (copper-plate, iron-plate, both already bussed for the other two), two inter-block
solids, and three fluids that all terminate at this one block.

**Worth considering: merge 26 into 27 physically.** 27 imports **four of 26's six** external solids
(copper-plate, coke, iron-plate, glass) and runs the same `graphite` recipe, the `battery-mk01` handoff
stops being bus traffic, and **the two boilers become one**: 26's `clay` wants 38.22 steam/s and 27's
`agar` 19.26, so separately that is a `py-electric-boiler` at 64 % and one at 32 %, together **one at
96 %**. The saving is one building and 9 tiles, not power — load-weighted draw is 15.95 + 8.03 against
23.98, a wash. They stay separate *designs* either way; this is only about where the blueprints sit.
**Against it: 27 is already a two-stamp block at 7,678 tiles**, so merging makes the layout problem
worse, not better.

---

## What caps the complex

**1. Ammonia 6.00/s has no destination.** There are exactly two unlocked ammonia recipes in the game —
`melamine` and `cyanic-acid-01` — and both are inside design 27. All 42 locked consumers sit behind
chemical science or worse. Ammonia is on the never-vent list, so it cannot be disposed of either.
**`t = 0` for all three blocks** until a consumer exists — design 25 now depends on 27 too, so the
surplus gates the whole complex rather than two thirds of it. It is a design-level open item, not an
operational one: the surplus is pinned at exactly 6.00/s by `battery-mk01`'s
cyanic-acid-without-ammonia demand, **and raising melamine 5× did not move it**
([27 § The ammonia decision](27-battery-urea.md)).

**2. Nothing else is tight.** Creosote at 6.00/s clears the base's ~34/s floor with room to spare —
that cap is gone. The next two to watch, neither currently binding:

- **native-flora 6.95/s** has no recipe at all; it is map-placed. `flora-collector-mk01` mines it at
  1.0/s, so **~7 collectors**, map permitting. This is the complex's only genuinely unmakeable input.
- **water-saline 6.00/s has no producer anywhere yet.** Three washers and a stone or gravel feed have to
  exist somewhere before design 25 runs. That is a build-order item rather than a throughput cap — the
  rate is trivial — but it is the one import on this list that cannot be satisfied by an existing block.

**No terminal output in any of the three blocks can throttle the complex.** The one remaining
unresolved byproduct — black-liquor 0.40/s — is buffered on a 17-hour clock per tank, which is slow
enough not to be an operational constraint.

---

## Scaling

Everything is linear in circuits/s, but the useful anchors are:

| | 1.0 c/s | 2.0 c/s | 5.0 c/s |
|---|--:|--:|--:|
| buildings | 145 | ~290 | ~725 |
| tiles | ~10,049 | ~20,098 | ~50,245 |
| water | 581.95 | 1,163.90 | 2,909.75 |
| creosote | 6.00 | 12.00 | 30.00 |
| water-saline | 6.00 | 12.00 | 30.00 |
| native-flora | 6.95 | 13.90 | 34.75 |
| solids total | 21.97 | 43.94 | 109.85 |
| **`auog` modules** | **72** | **144** | **360** |
| ammonia out | 6.00 | 12.00 | 30.00 |

**Ratios are integer only at C = 1, 2, 5** — design 26's scale anchor is one `pcb-factory-mk01` at
0.2 pcb1/s, and anything between leaves fractional sub-part banks. Past 1.0 c/s the solids exceed a red
belt at ~1.37 c/s and water exceeds a mk02 wagon immediately, so **stamping the complex is cheaper than
scaling it** (rule 25) — and because the three designs are independent, you can stamp them at different
multiples if one is the bottleneck.

**The `auog` row is the real scaling wall.** At 300 s per codex run, 1.0 c/s is 6.0 hours of
creature-chamber time; 2.0 c/s is 12. Nothing else in the complex has a bootstrap cost that scales
linearly in wall-clock.

---

## Bio module bootstrap — not a flow, but it gates startup

None of this appears in any solver output or in the tables above. It is one-time capital.

| design | module | needed | source |
|---|---|--:|---|
| 25 | `moondrop` 96 · `moss` 30 | | **self-funding** — both are their own product |
| 27 | `moss` 675 · `seaweed` 50 | | **self-funding** |
| 25 → 27 | **`moondrop` 32** | | **one-time transfer** — 25 breeds them; 27's two `moondrop-co2` greenhouses need them to reach speed 1.0 |
| 25 + 27 | `tree-mk01` 20 + 10 | | **30 planter-boxes** — `ash` 90 · `soil` 150 · `stone-brick` 120 · `wood` 60 · `iron-plate` 30 |
| 27 | **`auog` 72** | | **codex only** — `auog` [creature-chamber, 300 s] yields 1 per run. **~6.0 h** of chamber time, and the paddocks run at 1/5 speed until done |

**1,417 modules before, 985 now** — and the composition changed more than the count. Route 1 needed
`sap-tree` ×160 and `tree-mk01` ×80 for a sap field `formica-2` does not use, so the planter-box
requirement collapsed from **241 to 31** (30 for the three fwf, 1 for the `moondrop-sample` bootstrap).
Moss went *up* 675 → 705 because design 27 grew — but moss is self-funding and costs only time, whereas
planter-boxes cost `ash` and `stone-brick` by hand.

> **`ash` is still needed, just not as a flow.** Dropping `log3` from design 25 removed the continuous
> 0.54 ash/s and its station; the **90 ash for the planter-boxes is one-time construction capital**,
> delivered the same way as the `stone-brick`. `log2` needing two `fwf` instead of one is what took that
> figure from 60 to 90.

**`auog` ×72 is the critical path for the whole complex** — design 27 cannot reach rate without it,
design 25 waits on 27 for melamine and urea, and 26 waits on both. `auog-recharge-0` is no shortcut
because it needs `auog-food-01` → **ralesia**, an entire additional plantation. **Start the creature
chamber before anything else gets built.**

The **planter-box materials are the easiest thing here to forget**: `ash` and `stone-brick` are needed to
*build* the bio modules rather than to run any recipe, so `stone-brick` appears in no import table at
all. A few chests off design 12 or 24 covers all of it.
