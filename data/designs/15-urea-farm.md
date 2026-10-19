# 15 — Urea farm — 3.73 urea/s, 25 buildings

Shared infrastructure for design 14. **`urea-decomposition` is the only unlocked source of ammonia
in the game**, and ammonia + cyanic-acid is what the batteries and melamine run on.

```
urea-decomposition  [U] [distilator, 8 s]   urea 20  →  ammonia 30 + cyanic-acid 30
```

Nine other ammonia recipes exist; all nine are locked. There is no bypass around
`urea → liquid-manure → manure → auog paddocks`.

## Block boundary

| class | items |
|---|---|
| **import — readily available** | water, steam, stone, wood, small-lamp, empty-petri-dish |
| **import — map-limited** | **native-flora** — no craftable route in the export; `bioreserve-farm` recipes are locked and map-placed. Not sized here. |
| **import — from another block** | auog-food-01, muddy-sludge, carbon-dioxide (design 14 covers part) |
| **must-consume-internally** | manure, liquid-manure, moss, zogna-bacteria, pressured-air, barrel, petri-dish, agar, seaweed |
| **byproduct-exclude** | none |

The glass boundary sits at the **empty** dish — that keeps the glassworks and its molten-glass pipe
out while `agar`, which is bio, stays with the farm.

## Recipe table

```
┌─────────────────────────┬────────────────────────┬───────┬─────────────┐
│ Recipe                  │ Factory                │ Count │ Modules     │
├─────────────────────────┼────────────────────────┼───────┼─────────────┤
│ Moss-2                  │ moss-farm-mk01         │     8 │ 15x moss    │
│ auog-pooping-2          │ auog-paddock-mk01      │     6 │ 4x auog     │
│ seaweed-1               │ seaweed-crop-mk01      │     4 │ 10x seaweed │
│ urea-from-liquid-manure │ bio-reactor-mk01       │     1 │             │
│ liquid-manure           │ bio-reactor-mk01       │     1 │             │
│ zogna-bacteria          │ incubator-mk01         │     1 │             │
│ petri-dish              │ automated-factory-mk01 │     1 │             │
│ agar                    │ hpf                    │     1 │             │
│ water-barrel            │ barrel-machine-mk01    │     1 │             │
│ pressured-air           │ vacuum-pump-mk01       │     1 │             │
└─────────────────────────┴────────────────────────┴───────┴─────────────┘
```

**25 buildings, 8.61 MW electric.**

**Inputs** (/s): water 111.27, steam 12.44, muddy-sludge 9.15, carbon-dioxide 9.15, native-flora 2.93,
stone 1.83, auog-food-01 0.44, wood 0.31, empty-petri-dish 0.12, small-lamp 0.06

**Byproducts**: none. Urea 3.73/s is the sole output.

## Intermediate flows

```
┌────────────────┬─────────┬────────────────────┬─────────────────────────┐
│ Item           │ Rate /s │ Producer           │ Consumer                │
├────────────────┼─────────┼────────────────────┼─────────────────────────┤
│ liquid-manure  │   12.44 │ liquid-manure      │ urea-from-liquid-manure │
│ pressured-air  │    3.11 │ pressured-air      │ zogna-bacteria          │
│ moss           │    1.46 │ Moss-2             │ auog-pooping-2          │
│ manure         │    1.24 │ auog-pooping-2     │ liquid-manure           │
│ zogna-bacteria │    1.24 │ zogna-bacteria     │ urea-from-liquid-manure │
│ barrel         │    0.73 │ auog-pooping-2     │ water-barrel            │
│ water-barrel   │    0.73 │ water-barrel       │ auog-pooping-2          │
│ seaweed        │    0.62 │ seaweed-1          │ agar                    │
│ agar           │    0.12 │ agar               │ petri-dish              │
│ petri-dish     │    0.12 │ petri-dish         │ zogna-bacteria          │
└────────────────┴─────────┴────────────────────┴─────────────────────────┘
```

The barrel loop is net zero — one barrel-machine refills what the paddocks empty.

## Terminal outputs

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| urea | 3.73 | design 14 (`urea-decomposition`) | — it is the product | — |

Nothing else leaves the block.

## Variant — serving design 14 variant B

Urea draw falls to **2.27/s**:

```
┌─────────────────────────┬────────────────────────┬───────┬─────────────┐
│ Recipe                  │ Factory                │ Count │ Modules     │
├─────────────────────────┼────────────────────────┼───────┼─────────────┤
│ Moss-2                  │ moss-farm-mk01         │     5 │ 15x moss    │
│ auog-pooping-2          │ auog-paddock-mk01      │     4 │ 4x auog     │
│ seaweed-1               │ seaweed-crop-mk01      │     2 │ 10x seaweed │
│ urea-from-liquid-manure │ bio-reactor-mk01       │     1 │             │
│ liquid-manure           │ bio-reactor-mk01       │     1 │             │
│ zogna-bacteria          │ incubator-mk01         │     1 │             │
│ petri-dish              │ automated-factory-mk01 │     1 │             │
│ agar                    │ hpf                    │     1 │             │
│ water-barrel            │ barrel-machine-mk01    │     1 │             │
│ pressured-air           │ vacuum-pump-mk01       │     1 │             │
└─────────────────────────┴────────────────────────┴───────┴─────────────┘
```

**18 buildings, 5.23 MW.**

**Inputs** (/s): water 67.56, steam 7.56, muddy-sludge 5.56, carbon-dioxide 5.56, native-flora 1.78,
stone 1.11, auog-food-01 0.27, wood 0.19, empty-petri-dish 0.08, small-lamp 0.04

**Byproducts**: none.

## Supply from design 14

`Moss-2` takes muddy-sludge 100 + CO₂ 100 + stone 20 → moss 16, and design 14 emits both:

| pairing | wants each | design 14 gives | shortfall |
|---|--:|--:|--:|
| 3.73 urea/s ← design 14 A | 9.15/s | sludge 5.00 · CO₂ 3.00 | 4.15 · 6.15 |
| 2.27 urea/s ← design 14 B | 5.56/s | sludge 1.00 · CO₂ 0.60 | 4.56 · 4.96 |

Either shortfall costs the same two buildings: one `washer` on `muddy-sludge` (soil 10 + water 100
→ 100) and one `moondrop-co2` greenhouse (no ingredients, 40 CO₂/s — covers any of these rates
many times over). Both beat shipping a fluid in.

## Build gotchas

- **Bio modules are not optional.** Without them `moss-farm-mk01` runs at speed 0.0625 and
  `auog-paddock-mk01` at 0.4 — the farm multiplies several times over. Both are self-funding.
- **`auog-pooping-2`, not `-1`.** 8.5 manure per 80 s vs 5.5 per 100 s — **1.93×** per paddock for
  3 `auog-food-01` per craft. The LP picks it unprompted; `-1` solves to 0. At 14×14 a paddock is
  196 tiles, the biggest footprint lever here.
- **Do not apply the solver's `:exclude` on the `water-barrel → barrel` cycle** — it is the real
  loop.
- `auog-food-01` is imported: it needs `ralesia` and `plastic-bar`, neither of which this block
  otherwise touches. It carries **0.293 plastic-bar/s**, the block's entire plastic exposure.
- `bio-reactor-mk01` has a `bio-reactor` module slot. The export does not expose module category on
  items, so the matching module could not be identified and the two bio-reactors are computed bare.
  2 of 25 buildings — unverified rather than checked.

## Growing it

Pure linear, no ratio constraints — grow a paddock at a time. Per urea/s:

```
moss-farm-mk01  2.14   auog-paddock-mk01  1.61   seaweed-crop-mk01  1.07
bio-reactor     0.54   buildings          ≈ 6.7  MW                ≈ 2.31
water          29.83   muddy-sludge       2.45   carbon-dioxide     2.45
native-flora    0.79   stone              0.49   auog-food-01       0.12
```

Design 14's core has hard integer ratios and does not want to be half-built; this block has none.
**Build 14 whole and let this throttle it** — the design-13 pattern.

## Unlocks to watch

- **`urea2`** (raw-fiber 6 + fawogae 4 → 25 in 10 s) — 2.5 urea/s per building would collapse this
  block to a handful of machines. Also locked: `waste-water-urea`, `blood-to-urea`, `urea`.
- **`auog-pooping-3/4/5`** — 10.5 / 15 / 25 manure per craft at 60/30/20 s; `-5` is 4.5× this.
  Need `bedding` + `saps` + `raw-fiber`.
- **`native-flora`** is the one input this design cannot size or substitute. If it binds, this
  block's ceiling is set outside it.

## Solver command

Both auog recipes are offered so the LP chooses.

```bash
npx tsx src/cli.ts solve \
  --recipes "urea-from-liquid-manure,liquid-manure,auog-pooping-1,auog-pooping-2,Moss-2,water-barrel,zogna-bacteria,pressured-air,petri-dish,agar,seaweed-1" \
  --target "urea:224" --time 60 \
  --factory "urea-from-liquid-manure:bio-reactor-mk01" \
  --factory "liquid-manure:bio-reactor-mk01" \
  --factory "auog-pooping-1:auog-paddock-mk01" \
  --factory "auog-pooping-2:auog-paddock-mk01" \
  --factory "Moss-2:moss-farm-mk01" \
  --factory "water-barrel:barrel-machine-mk01" \
  --factory "zogna-bacteria:incubator-mk01" \
  --factory "pressured-air:vacuum-pump-mk01" \
  --factory "petri-dish:automated-factory-mk01" \
  --factory "agar:hpf" \
  --factory "seaweed-1:seaweed-crop-mk01" \
  --modules "Moss-2:moss:15" \
  --modules "auog-pooping-1:auog:4" \
  --modules "auog-pooping-2:auog:4" \
  --modules "seaweed-1:seaweed:10" \
  --solver simplex \
  --unlocked
```

Variant B is the same command with `--target "urea:136"`. The solver warns `moss` and `seaweed` are
"not unlocked" — export data limitation, available in-game.

## Build materials

Distinct construction materials across this block's 9 building types, separate from flow imports:

`aluminium-plate` · `bolts` · `copper-plate` · `duralumin` · `electronic-circuit` · `gasifier` ·
`gearbox-mk01` · `glass` · `inductor1` · `inserter` · `intermetallics` · `iron-plate` · `limestone` ·
`mixer-mk01` · `pipe` · `shaft-mk01` · `small-parts-01` · `soil` · `steam-engine` · `steel-plate` ·
`stone` · `stone-brick` · `tailings-pond` · `tin-plate` · `titanium-plate`

Every building type here already appears in the existing design catalogue, most in design 07.
Inferred from the catalogue, not from save state.
