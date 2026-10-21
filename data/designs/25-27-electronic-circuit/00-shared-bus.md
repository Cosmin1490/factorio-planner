# 00 — Shared bus — designs 25, 26, 27

The three blocks in this directory are designed **independently** — each solves on its own, each has
its own solver command, each can be stamped or resized without touching the others. What they share is
**logistics**: one bus feeds all three, and this file is the union.

```
25 formica ──formica 0.40/s──▶ 26 electronics ◀──battery-mk01 0.20/s── 27 battery + urea
                                      │                                        │
                                      ▼                                        ▼
                            electronic-circuit 1.00/s                   ammonia 6.00/s
```

| design | buildings | tiles | MW | own imports | own exports |
|---|--:|--:|--:|--:|---|
| [25 — formica](25-formica.md) | 166 | ~9,080 | 42.75 | 3 | formica |
| [26 — electronic circuits](26-electronic-circuit.md) | 20 | ~684 | 29.13 | 9 | electronic-circuit |
| [27 — battery + urea](27-battery-urea.md) | 81 | ~5,640 | 29.8 | 9 | battery-mk01, ammonia |
| **complex** | **267** | **~15,400** | **101.7** | **12 distinct** | **2 external** |

Scaled for **1.0 electronic-circuit/s**. Every rate below is linear in that.

---

## Imports — union and sum

### Solids — 10 items, 22.49 /s

| item | 25 | 26 | 27 | **bus total** | shared? |
|---|--:|--:|--:|--:|---|
| **native-flora** | — | — | 5.17 | **5.17** | 27 only |
| **copper-plate** | 2.00 | 2.80 | 0.18 | **4.98** | **all three** |
| **coke** | — | 2.41 | 2.31 | **4.72** | **26 + 27** |
| **tin-plate** | — | 1.87 | — | **1.87** | 26 only |
| **iron-plate** | — | 1.50 | 0.37 | **1.87** | **26 + 27** |
| **lead-plate** | — | 1.60 | — | **1.60** | 26 only |
| **glass** | — | 1.00 | 0.34 | **1.34** | **26 + 27** |
| **zinc-plate** | — | — | 0.60 | **0.60** | 27 only |
| **pbsb-alloy** | — | — | 0.20 | **0.20** | 27 only |
| **empty-petri-dish** | — | — | 0.14 | **0.14** | 27 only |
| | | | | **22.49 /s** | |

**All solids fit one red belt** — 22.49/s against 30/s, or 1.5 yellow belts. No single item exceeds
5.17/s, so nothing needs a dedicated lane on throughput; the only question is how many lanes you want
to route.

**Four items are genuinely shared** and are where the bus earns its place: copper-plate (all three),
coke, iron-plate and glass (26 + 27). The other six go to exactly one block.

### Fluids — 2 items

| item | 25 | 26 | 27 | **bus total** |
|---|--:|--:|--:|--:|
| **water** | 330.61 | 38.22 | 365.09 | **733.92** |
| **creosote** | 40.00 | — | — | **40.00** |

**Water should not be bussed.** 733.92/s is past the mk01 fluid-wagon ceiling (~400/s) and most of the
way to mk02's ~830/s. Rule 27's answer applies: **site the complex on water and pipe it** — unlimited
throughput, zero stations. Designs 25 and 27 want 95 % of it between them, so the siting constraint is
theirs, not 26's.

**Creosote is one 40.00/s pipe to design 25 only**, comfortably inside a mk01 wagon. It is also the
complex's binding constraint — see below.

---

## Exports — union and sum

### Leaving the complex

| item | from | /s | sink |
|---|---|--:|---|
| **electronic-circuit** | 26 | **1.00** | the product — Tier A, 219 consumers |
| **ammonia** | 27 | **6.00** | **no consumer identified** — see below |

### Internal to the complex

| item | from → to | /s | form |
|---|---|--:|---|
| **formica** | 25 → 26 | 0.40 | solid, stack 100 |
| **battery-mk01** | 27 → 26 | 0.20 | solid, stack 100 |

Both are tiny and solid. They ride the same bus as the imports; neither needs special handling.

---

## Station budget

| block | solid drops | fluid drops | loads | total |
|---|--:|--:|--:|--:|
| 25 formica | 1 | 2 | 1 | **4** |
| 26 electronics | 6 + 2 internal | 1 | 1 | **10** |
| 27 battery + urea | 7 | 1 | 2 | **10** |

**Design 26 is the station-heavy one** — 20 buildings against 10 stations. That is the rule 20 trade in
miniature: a small block spending its space budget on stations rather than factories.

**Worth considering: merge 26 into 27 physically.** 27 already imports five of 26's six external solids
(coke, iron-plate, glass, copper-plate, and shares the `graphite` recipe), the `battery-mk01` handoff
stops being bus traffic, and **the two boilers become one**. Design 26's `clay` wants 38.22 steam/s and
27's `agar` wants 14.22 — separately that is a `py-electric-boiler` at 64 % and one at 24 %; together it
is one at 87 %. Saves a building and ~6 MW of idle rated draw. They stay separate *designs* either way;
this is only about where the blueprints sit.

---

## What caps the complex

Two constraints, in order:

**1. Ammonia 6.00/s has no destination.** There are exactly two unlocked ammonia recipes in the game —
`melamine` and `cyanic-acid-01` — and both are inside design 27. Ammonia is on the never-vent list, so
it cannot be disposed of either. **`t = 0` for 27 and therefore for 26** until a consumer exists. It is
a design-level open item, not an operational one: the surplus is pinned at exactly 6.00/s by
`battery-mk01`'s cyanic-acid-without-ammonia demand and no internal change can move it
([27 § The ammonia decision](27-battery-urea.md)).

**2. Creosote 40.00/s exceeds the base's supply.** Design 10's structural floor is 31.75/s plus design
07's 2.45 — roughly **34/s against the 40.00 design 25 wants**, so `t ≈ 0.85` and the upstream must
scale before the complex runs at full rate. This is the cap once the ammonia has a home.

Nothing else is tight. No terminal output in any of the three blocks can throttle the complex — both
caps are on the import side.

---

## Scaling

Everything is linear in circuits/s, but the useful anchors are:

| | 1.0 c/s | 2.0 c/s | 5.0 c/s |
|---|--:|--:|--:|
| buildings | 267 | ~534 | ~1,335 |
| water | 733.92 | 1,467.84 | 3,669.60 |
| creosote | 40.00 | 80.00 | 200.00 |
| native-flora | 5.17 | 10.34 | 25.85 |
| solids total | 22.49 | 44.98 | 112.45 |
| ammonia out | 6.00 | 12.00 | 30.00 |

**Ratios are integer only at C = 1, 2, 5** — design 26's scale anchor is one `pcb-factory-mk01` at
0.2 pcb1/s, and anything between leaves fractional sub-part banks. Past 1.0 c/s the solids exceed a red
belt at ~1.33 c/s and water exceeds a mk02 wagon immediately, so **stamping the complex is cheaper than
scaling it** (rule 25) — and because the three designs are independent, you can stamp them at different
multiples if one is the bottleneck.

---

## Bio module bootstrap — not a flow, but it gates startup

None of this appears in any solver output or in the tables above. It is one-time capital.

| design | module | needed | source |
|---|---|--:|---|
| 25 | `moss` 255 · `moondrop` 384 | | **self-funding** — both are their own product |
| 25 | `sap-tree` 160 · `tree-mk01` 170 | | **effectively** — `sap-seeds ← saps 5 → 2`, so the sap field funds its own 800 seeds in ~8 min |
| 27 | `moss` 495 · `seaweed` 40 | | **self-funding** |
| 27 | **`auog` 52** | | **codex only** — `auog` [creature-chamber, 300 s] yields 1 per run. **~4.3 h** of chamber time, and the paddocks run at 1/5 speed until done |
| 25 + 27 | **331 planter-boxes** | `ash` 993 · `stone-brick` 1,324 · `iron-plate` 331 | **import, one-time** |

**`auog` ×52 is the critical path for the whole complex** — design 27 cannot reach rate without it, and
`auog-recharge-0` is no shortcut because it needs `auog-food-01` → **ralesia**, an entire additional
plantation. Start the creature chamber before anything else gets built.

The **planter-box materials are the easiest thing here to forget**: `ash` and `stone-brick` appear
nowhere in the import tables, because they are needed to *build* the bio modules rather than to run any
recipe. A few chests off design 12 or 24 covers all of it.
