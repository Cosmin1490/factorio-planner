# Bootstrap — intermetallics + batteries (temporary)

Short-lived build to unblock everything else. Expect to tear it down and redesign properly once
logistic science is running. Sized as a **trickle into chests**, not a production block — you are
accumulating build materials over minutes, not feeding a consumer.

Assumes the current base: 0.4/s automation science, 0.2/s py-science-1, design 03 coal processing.

## The finding that orders everything

**Intermetallics gate 48 unlocked recipes. Batteries gate 6.**

| needs intermetallics | qty | | needs battery-mk01 | qty |
|---|--:|---|---|--:|
| `oil-boiler-mk01` | 10 | | `accumulator` | 30 |
| `steam-turbine-mk01` | 10 | | `logistic-science-pack` | 3 |
| `chemical-plant-mk01` | 5 | | `py-roboport-mk01` | 2 |
| `bio-reactor-mk01` | 5 | | `py-construction-robot-mk01` | 2 |
| `mixer-mk01` | 5 | | combinators (each) | 1 |
| `auog-paddock-mk01` | 5 | | `electronic-circuit-2` | 1 |
| `locomotive`/`cargo-wagon`/`fluid-wagon` | 5 ea | | | |
| `automated-factory-mk01` | 2 | | | |
| `casting-unit-mk01` | 8 | | | |
| `py-coal-powerplant-mk01` | 50 | | | |

**And the battery chain's own buildings cost ~30 intermetallics** — `auog-paddock-mk01` (5),
`bio-reactor-mk01` ×2 (5 each, plus a `mixer-mk01` at 5 each), `chemical-plant-mk01` (5).

So the order is forced: **intermetallics first, batteries second.** There is no path where batteries
come first, and intermetallics is the thing actually blocking the coal blocks anyway.

## Phase 0 — two bolt-ons to design 03

Both are single buildings tapping streams design 03 already produces. They unlock three separate
downstream gates, so build these first:

| add | recipe | unlocks |
|---|---|---|
| 1 `gasifier` | `syngas` — 50 coal-gas + 100 water → 70 syngas + 30 tar + 1 ash | **nickel mining** (4 syngas/ore), plastic-bar |
| 1 `distilator` | `light-oil-aromatics` — 50 light-oil → 50 aromatics + 25 gasoline | **zinc mining** (4 aromatics/ore), plastic-bar |

Both syngas and aromatics are mining fluids *and* plastic feedstock, which is why two buildings open
so much.

## Phase 1 — intermetallics · 17 buildings · 9.27 MW · 1.5/min

Solver-validated (`--target intermetallics:1.5 --time 60`). This is the floor — one building per
recipe. 1.5/min = 90/hour, so the ~30 intermetallics the battery chain needs accumulate in **20
minutes**.

```
┌──────────────────────┬─────────────────────────┬───────┐
│ Recipe               │ Factory                 │ Count │
├──────────────────────┼─────────────────────────┼───────┤
│ intermetallics       │ advanced-foundry-mk01   │     1 │
│ vitreloy             │ smelter-mk01            │     1 │
│ fenxsb-alloy-2       │ smelter-mk01            │     1 │
│ duralumin-1          │ smelter-mk01            │     1 │
│ sb-oxide-01          │ bof-mk01                │     1 │
│ nickel-plate-2       │ stone-furnace           │     1 │
│ grade-1-nickel       │ jaw-crusher             │     1 │
│ nexelit-plate-2      │ stone-furnace           │     1 │
│ clean-nexelit        │ washer                  │     1 │
│ sb-grade-01          │ automated-screener-mk01 │     1 │
│ sb-grade-02          │ jaw-crusher             │     1 │
│ sb-grade-03          │ automated-screener-mk01 │     1 │
│ sb-grade-04          │ secondary-crusher-mk01  │     1 │
│ aromatics-to-plastic │ biofactory-mk01         │     1 │
│ light-oil-aromatics  │ distilator              │     1 │
│ syngas               │ gasifier                │     1 │
│ hydrogen             │ electrolyzer-mk01       │     1 │
└──────────────────────┴─────────────────────────┴───────┘
```

**Inputs** (/60s): iron-plate 5.25, titanium-plate 2.25, copper-plate 6.75, aluminium-plate 9.00,
ore-nickel 11.25, nexelit-ore 4.50, antimonium-ore 40.92, light-oil 150, coal-gas 214.29, coal 38.88,
water 1028.57.

Light-oil and coal-gas come off design 03. Titanium and aluminium come off the small mining you already
set up for building materials.

### New buildings to construct for phase 1

All are plain iron/stone/duralumin builds — **none needs intermetallics**, which is what makes this the
valid entry point:

| building | cost |
|---|---|
| `advanced-foundry-mk01` | 20 stone-brick, 10 stone-furnace, 30 copper-cable, 10 small-parts-01, 30 iron-plate |
| `smelter-mk01` | (py-rawores-smelter — the vitreloy/alloy workhorse) |
| `bof-mk01` | 3 boiler, 1 steel-furnace, 10 electronic-circuit, 10 small-parts-01, 15 iron-plate |
| `secondary-crusher-mk01` | 1 small-lamp, 1 steam-engine, 25 electronic-circuit, 50 small-parts-01, 40 steel-plate, **20 duralumin** |
| `biofactory-mk01` | 5 steam-engine, 15 electronic-circuit, 20 small-parts-01, 15 steel-plate, **50 duralumin**, 50 glass, 15 titanium-plate |
| `electrolyzer-mk01` | 3 steam-engine, 2 lab, 1 tar-processing-unit, 5 electronic-circuit, 10 small-parts-01, 30 aluminium-plate |
| `gasifier` | 20 pipe, 2 steam-engine, 4 inductor1, 10 small-parts-01, 20 steel-plate, 10 iron-plate |

**Build `smelter-mk01` first and make duralumin** (`4 aluminium-plate + 2 copper-plate → 1 duralumin`).
Two of the above need it — 70 duralumin total — and it is the cheapest unlock in the chain.

**nexelit-ore** comes from the `dino-dig-site` (7×7, **0 MW**, 4 `digosaurus` slots): `1 meat → 2
nexelit-ore`. Your vrauks rendering for formic acid already produces meat as a byproduct. The
`nexelit-ore-1` route (500 tailings → 1 nexelit-ore, via `tar-quenching`) also exists if you'd rather
not spend meat.

## Phase 2 — what the first 30 intermetallics buy

| building | cost | why |
|---|--:|---|
| `auog-paddock-mk01` | 5 | manure — **build this first, see below** |
| `mixer-mk01` ×2 | 10 | component of bio-reactor |
| `bio-reactor-mk01` ×2 | 10 | liquid-manure, then urea |
| `chemical-plant-mk01` | 5 | battery-mk01 itself |

**Build the auog paddock the moment you have 5 intermetallics, before anything else.** It is 14×14 with
**4 `auog` module slots** — same mechanic as your vrauks paddock — and you need to create auogs
(`5 bio-sample + 3 cdna + 1 earth-bear-sample + 2 earth-generic-sample + 1 auog-codex + 1000 water`,
all unlocked) and get them in. Design guide rule 12: start bio early regardless of phase, because the
wall-clock cost is not recoverable later.

## Phase 3 — batteries · 27 buildings · 5.20 MW · 1/min

Auogs are **unavoidable**: `ammonia` comes only from `urea-decomposition`, urea only from manure, and
manure only from auog paddocks at current tech (`worm-manure` and the Scrondrix routes need `worm` and
`yotoi-leaves`, neither of which has an unlocked recipe). Your instinct was right.

```
┌─────────────────────────┬─────────────────────────┬───────┐
│ Recipe                  │ Factory                 │ Count │
├─────────────────────────┼─────────────────────────┼───────┤
│ battery-mk01            │ chemical-plant-mk01     │     1 │
│ melamine                │ fbreactor-mk01          │     1 │
│ urea-decomposition      │ distilator              │     1 │
│ urea-from-liquid-manure │ bio-reactor-mk01        │     1 │
│ liquid-manure           │ bio-reactor-mk01        │     1 │
│ auog-pooping-1          │ auog-paddock-mk01       │     6 │  ← dominant cost
│ zogna-bacteria          │ incubator-mk01          │     1 │
│ graphite                │ hpf                     │     1 │
│ pbsb-alloy              │ smelter-mk01            │     1 │
│ lead-plate-2            │ stone-furnace           │     1 │
│ grade-1-lead            │ automated-screener-mk01 │     1 │
│ zinc-plate-1            │ stone-furnace           │     1 │
│ bolts / iron-stick      │ assembling-machine-1    │     2 │
│ (+ sb-oxide & antimony chain, shared with phase 1) │       │
└─────────────────────────┴─────────────────────────┴───────┘
```

**Build 1 paddock, not 6.** Six paddocks at 14×14 is 1,176 tiles for 1 battery/min, which is far more
than a bootstrap needs. One paddock gives **~10 batteries/hour** — enough for combinators and a slow
accumulation toward logistic science. `auog-pooping-1` is 100s at paddock speed 0.4, so 250s per craft
for ~5.5 manure; the rate is set by paddock count and nothing else, so scaling later is just stamping
more paddocks.

Note `auog-pooping-1` needs only **water-barrel + native-flora + moss** — you have all three
(barrel-machine, native-flora import, moss-farm).

## Notes

- **Batteries don't block the coal blocks.** Nothing needs a battery to place an `oil-boiler-mk01`, so
  phase 1 alone unblocks designs 09/10. Batteries gate combinators (1 each), roboports (2),
  accumulators (30) and `logistic-science-pack` itself (3) — build phase 3 whenever those matter.
- **`steam-turbine-mk01` costs 10 intermetallics each.** Design 10's engine-based power island avoids
  this, but if turbines ever become worth it (2× the power), budget 10 intermetallics per turbine on
  top.
- **Antimony is 4 of the 17 buildings** in phase 1, because `sb-oxide` is consumed 4× per
  intermetallics (3 in vitreloy, 1 in fenxsb-alloy). The `sb-grade-01/02:stone:exclude` and
  `sb-grade-03:gravel:exclude` constraints are required or the LP scales screening ~5× to source stone.
- **Teardown:** phase 1's `smelter-mk01`, `advanced-foundry-mk01`, `bof-mk01` and the antimony chain are
  all wanted permanently — only the trickle sizing is temporary. The auog paddock is likewise permanent
  infrastructure. Realistically you are re-siting rather than scrapping.

## Build materials

Distinct items needed to **construct** this block's buildings — separate from the flow imports,
and several appear nowhere in the solve. Quantities are omitted deliberately: the binding question is
whether you have *any*, since a small amount can be hand-fed or trickled while a zero is a hard stop.
Regenerate with `node scripts/build-materials.mjs data/designs/11-bootstrap-intermetallics-batteries.md`.

| Material | Needed by |
|---|---|
| `small-parts-01` | advanced-foundry-mk01, assembling-machine-1, automated-factory-mk01 +26 |
| `steel-plate` | automated-factory-mk01, automated-screener-mk01, bio-reactor-mk01 +14 |
| `electronic-circuit` | accumulator, automated-factory-mk01, automated-screener-mk01 +13 |
| `iron-plate` | accumulator, advanced-foundry-mk01, assembling-machine-1 +13 |
| `intermetallics` | auog-paddock-mk01, automated-factory-mk01, bio-reactor-mk01 +11 |
| `steam-engine` | biofactory-mk01, distilator, electrolyzer-mk01 +11 |
| `duralumin` | biofactory-mk01, cargo-wagon, dino-dig-site +5 |
| `pipe` | chemical-plant-mk01, distilator, fbreactor-mk01 +5 |
| `titanium-plate` | biofactory-mk01, cargo-wagon, digosaurus +5 |
| `inductor1` | assembling-machine-1, distilator, gasifier +2 |
| `shaft-mk01` | automated-factory-mk01, cargo-wagon, fluid-wagon +2 |
| `aluminium-plate` | electrolyzer-mk01, mixer-mk01, py-construction-robot-mk01 +1 |
| `brake-mk01` | cargo-wagon, fluid-wagon, locomotive +1 |
| `copper-plate` | casting-unit-mk01, chemical-plant-mk01, distilator +1 |
| `gearbox-mk01` | automated-factory-mk01, locomotive, py-construction-robot-mk01 +1 |
| `glass` | bio-reactor-mk01, biofactory-mk01, chemical-plant-mk01 +1 |
| `stone-brick` | advanced-foundry-mk01, hpf, smelter-mk01 +1 |
| `battery-mk01` | accumulator, py-construction-robot-mk01, py-roboport-mk01 |
| `lab` | casting-unit-mk01, electrolyzer-mk01, oil-boiler-mk01 |
| `boiler` | bof-mk01, fbreactor-mk01 |
| `electric-mining-drill` | oil-boiler-mk01, py-coal-powerplant-mk01 |
| `steel-furnace` | bof-mk01, casting-unit-mk01 |
| `stone` | auog-paddock-mk01, stone-furnace |
| `belt` | py-construction-robot-mk01 |
| `bolts` | auog-paddock-mk01 |
| `ceramic` | smelter-mk01 |
| `copper-cable` | advanced-foundry-mk01 |
| `earth-generic-sample` | digosaurus |
| `fish-oil` | py-construction-robot-mk01 |
| `fluid-drill-mk01` | automated-screener-mk01 |
| `inserter` | automated-factory-mk01 |
| `lead-plate` | dino-dig-site |
| `mechanical-parts-01` | py-coal-powerplant-mk01 |
| `moss-gen` | digosaurus |
| `petri-dish` | digosaurus |
| `py-local-radar` | casting-unit-mk01 |
| `py-tank-8000` | mixer-mk01 |
| `small-lamp` | secondary-crusher-mk01 |
| `soil` | auog-paddock-mk01 |
| `solder` | py-construction-robot-mk01 |
| `storage-tank` | fluid-wagon |
| `tailings-pond` | bio-reactor-mk01 |
| `tar-processing-unit` | electrolyzer-mk01 |
| `utility-box-mk01` | steam-turbine-mk01 |
| `water-saline` | digosaurus |
