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
| [27 — battery + urea](27-battery-urea.md) | 72 | ~5,221 | 30.65 | 60.78 | 10 | battery-mk01, melamine, urea, ammonia |
| **complex** | **118** | **~7,592** | **73.48** | **152.23** | **14 distinct** | **3 external** |

Scaled for **1.0 electronic-circuit/s**. Every rate below is linear in that.

> **The complex has an interim mode that needs no new buildings.** Running `auog-pooping-1` in design
> 27's nine paddocks instead of `-2` drops the whole complex to **0.518 circuit/s** and removes the
> `auog-food-01` import entirely — which takes [design 28](../28-auog-food.md), 126 buildings and 1,695
> circuits, off the critical path. **Build the blueprint once and start throttled**; ~55 minutes of
> interim running funds design 28, then the paddocks switch recipe in place.
> [27 § Interim mode](27-battery-urea.md) has the behaviour, which is not all intuitive — the moss bank
> *gains* headroom, and the ammonia clock halves.
>
> In interim mode every rate below scales by **0.518** except: `auog-food-01` → **0**, native-flora →
> **3.60/s**, and the `auog` module bootstrap → unchanged at 36.

**Design 25 switched from `formica` to `formica-2`** — 148 → 26 buildings, and **creosote 40.00 →
6.00/s**, which was the complex's second cap. The cost is melamine 1.60/s and urea 0.40/s, both made in
design 27, which grew 79 → 99 to cover them. **Net: −102 buildings, −3,031 tiles, −12.0 MW.**

Three later boundary calls. In design 25: **`water-saline` is imported rather than made from stone**
(drops 3 washers and the stone station, adds the bus's third fluid), and **`log2` replaced `log3`**
(drops the 0.54 ash/s flow, costs a second 15×15 `fwf`). In design 27: **`auog-pooping-2` with imported
`auog-food-01`** — **99 → 72 buildings**, paddocks 18 → 9, native-flora 6.95 → 4.50/s, water
483 → 361/s, and `auog` modules 72 → 36 (a 6.0 h creature-chamber bootstrap down to 3.0 h).

**Every one of the three moved work off-site rather than eliminating it.** The saline washers, the
planter-box ash and the ralesia chain all still exist somewhere; what changed is that they are no longer
inside a block that needs them for one recipe each. For `auog-food-01` that is a genuine Tier B argument
(it feeds every auog consumer in the base, not just this one); for the other two it is a logistics
preference, and the bus carries the consequence.

---

## Imports — union and sum

### Solids — 11 items, 20.20 /s

| item | 25 | 26 | 27 | **bus total** | shared? |
|---|--:|--:|--:|--:|---|
| **native-flora** | — | — | 4.50 | **4.50** | 27 only |
| **coke** | — | 2.41 | 1.50 | **3.91** | **26 + 27** |
| **copper-plate** | 0.40 | 2.80 | 0.19 | **3.39** | **all three** |
| **iron-plate** | 0.02 | 1.50 | 0.38 | **1.90** | **all three** |
| **tin-plate** | — | 1.87 | — | **1.87** | 26 only |
| **lead-plate** | — | 1.60 | — | **1.60** | 26 only |
| **glass** | — | 1.00 | 0.36 | **1.36** | **26 + 27** |
| **auog-food-01** | — | — | 0.68 | **0.68** | 27 only |
| **zinc-plate** | — | — | 0.60 | **0.60** | 27 only |
| **pbsb-alloy** | — | — | 0.20 | **0.20** | 27 only |
| **empty-petri-dish** | — | — | 0.19 | **0.19** | 27 only |
| | | | | **20.20 /s** | |

**All solids fit one red belt** — 20.20/s against 30/s, with room to ~1.49 c/s before a second belt.
No single item exceeds 4.50/s, so nothing needs a dedicated lane on throughput. **One more item but
less tonnage**: `auog-food-01` arrived and `native-flora` dropped 2.45/s, because three food units
replace enough paddock throughput to cut the flora by more than the food weighs.

**Four items are genuinely shared**: copper-plate and iron-plate (all three), coke and glass (26 + 27).
**Design 25 is down to two solid externals** — copper-plate 0.40 and iron-plate 0.02, both already on
the bus for 26 and 27. `ash` left with `log3`; `stone` left with the saline washers.

### Fluids — 3 items

| item | 25 | 26 | 27 | **bus total** |
|---|--:|--:|--:|--:|
| **water** | 60.46 | 38.22 | 360.64 | **459.32** |
| **creosote** | 6.00 | — | — | **6.00** |
| **water-saline** | 6.00 | — | — | **6.00** |

**Water should not be bussed.** 459.32/s is still past the mk01 fluid-wagon ceiling (~400/s), though it
now clears it by only 15 % rather than 45 %. Rule 27's answer applies: **site the complex on water and
pipe it** — unlimited throughput, zero stations. **Design 27 alone wants 79 % of it**, so the siting
constraint is its, and 40 % of 27's share is the moss bank's sludge/soil chain — see
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
| 27 battery + urea | 9 | 1 | 4 | **borderline single stamp now** at ~5,221 tiles, against two at 7,678 |

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
**The food swap strengthened this.** 27 was a two-stamp block at 7,678 tiles, which made merging 26 into
it an obviously bad idea; at 5,221 the combined 5,905 tiles is a plausible single stamp, so the layout
objection is now weak rather than decisive. Still one building and 9 tiles of actual saving.

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

- **native-flora 4.50/s** has no recipe at all; it is map-placed. `flora-collector-mk01` mines it at
  1.0/s, so **5 collectors**, map permitting. This is the complex's only genuinely unmakeable input.
- **`auog-food-01` 0.68/s now has a supplier: [design 28](../28-auog-food.md)** — 1.50 food/s, 126
  buildings, 91.28 MW, sized by an aromatics budget of 50/s rather than by this complex's demand, so it
  covers the 0.68 **2.2×**. It is a **build-order dependency, not a station**: design 27's paddocks
  cannot run at all without it, with no partial-rate fallback short of reverting to `auog-pooping-1`.
  Design 28 itself is gated on **aromatics 50/s and a lakeside site** (767.50 water/s).
- **`water-saline` 6.00/s still has no producer anywhere.** Three washers plus a stone or gravel feed
  have to exist before design 25 runs. Not a throughput cap — the rate is trivial — but it is now the
  only import in the complex with nothing behind it.

**No terminal output in any of the three blocks can throttle the complex.** The one remaining
unresolved byproduct — black-liquor 0.40/s — is buffered on a 17-hour clock per tank, which is slow
enough not to be an operational constraint.

---

## Scaling

Everything is linear in circuits/s, but the useful anchors are:

| | 1.0 c/s | 2.0 c/s | 5.0 c/s |
|---|--:|--:|--:|
| buildings | 118 | ~236 | ~590 |
| tiles | ~7,592 | ~15,184 | ~37,960 |
| water | 459.32 | 918.64 | 2,296.60 |
| creosote | 6.00 | 12.00 | 30.00 |
| water-saline | 6.00 | 12.00 | 30.00 |
| auog-food-01 | 0.68 | 1.36 | 3.40 |
| native-flora | 4.50 | 9.00 | 22.50 |
| solids total | 20.20 | 40.40 | 101.00 |
| **`auog` modules** | **36** | **72** | **180** |
| ammonia out | 6.00 | 12.00 | 30.00 |

**Ratios are integer only at C = 1, 2, 5** — design 26's scale anchor is one `pcb-factory-mk01` at
0.2 pcb1/s, and anything between leaves fractional sub-part banks. Past 1.0 c/s the solids exceed a red
belt at ~1.49 c/s and water exceeds a mk02 wagon at ~1.8 c/s, so **stamping the complex is cheaper than
scaling it** (rule 25) — and because the three designs are independent, you can stamp them at different
multiples if one is the bottleneck.

**The `auog` row is still the real scaling wall, at half its old height.** At 300 s per codex run,
1.0 c/s is 3.0 hours of creature-chamber time and 2.0 c/s is 6.0 — where variant 1 charged 6.0 and 12.0.
Nothing else in the complex has a bootstrap cost that scales linearly in wall-clock. **If the paddocks
turn out to return `used-auog`, this row stops mattering entirely** —
[27 § Bio modules](27-battery-urea.md) has the check.

---

## Bio module bootstrap — not a flow, but it gates startup

None of this appears in any solver output or in the tables above. It is one-time capital.

| design | module | needed | source |
|---|---|--:|---|
| 25 | `moondrop` 96 · `moss` 30 | | **self-funding** — both are their own product |
| 27 | `moss` 435 · `seaweed` 50 | | **self-funding** |
| 25 → 27 | **`moondrop` 16** | | **one-time transfer** — 25 breeds them; 27's single `moondrop-co2` greenhouse needs them to reach speed 1.0 |
| 25 + 27 | `tree-mk01` 20 + 10 | | **30 planter-boxes** — `ash` 90 · `soil` 150 · `stone-brick` 120 · `wood` 60 · `iron-plate` 30 |
| 27 | **`auog` 36** | | **codex only** — `auog` [creature-chamber, 300 s] yields 1 per run. **~3.0 h** of chamber time, and the paddocks run at 1/5 speed until done |

**1,417 modules before, 693 now.** Route 1 needed `sap-tree` ×160 and `tree-mk01` ×80 for a sap field
`formica-2` does not use, so the planter-box requirement collapsed from **241 to 31** (30 for the three
fwf, 1 for the `moondrop-sample` bootstrap). The food swap then halved the paddocks, which cut `auog`
72 → 36 and the moss bank 675 → 435 — **moss and auog fell together**, because `auog-pooping-2` consumes
the same 10 moss per craft while producing 1.93× the manure.

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
