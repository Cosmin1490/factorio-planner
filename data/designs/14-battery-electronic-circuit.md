# 14 — Battery + electronic circuits — 1.0 e-circuit/s, 31 buildings

Batteries and circuits are one block: `electronic-circuit-2` burns exactly 1 `battery-mk01` per 5
circuits, and both chains run on the same cyanic-acid / ammonia / melamine plant.

Scale anchor is **1 `pcb-factory-mk01`** — 0.2 pcb1/s at 1 pcb1 per 5 circuits is exactly
1.0 e-circuit/s, which also fixes 1 chipshooter and 2 chemical plants. Ratios are integer only at
C = 1, 2, 5 circuits/s.

```
electronic-circuit    [U] [chip, 4 s]  battery-mk00 x1 + capacitor1 x5 + inductor1 x3
                                       + resistor1 x6 + pcb1 x1 + vacuum-tube x3 + solder x2  →  3
electronic-circuit-2  [U] [chip, 4 s]  battery-mk01 x1 + [identical]                          →  5
```

Both routes consume **0.25 battery/s per chipshooter**; output goes 0.75 → 1.25 circuits/s. An
existing mk00 line needs no more batteries, only better ones.

## Block boundary

| class | items |
|---|---|
| **import — readily available** | tin-plate, copper-plate, iron-plate, lead-plate, zinc-plate, iron-stick, glass, coke, coal, methane, steam, water |
| **import — from another block** | urea (design 15), pbsb-alloy, treated-wood, raw-fiber, sodium-hydroxide |
| **must-consume-internally** | cyanic-acid, ammonia, melamine, graphite, bolts, all six circuit sub-parts |
| **byproduct-exclude** | none |

## Recipe table

```
┌──────────────────────┬──────────────────────────┬───────┐
│ Recipe               │ Factory                  │ Count │
├──────────────────────┼──────────────────────────┼───────┤
│ electronic-circuit-2 │ chipshooter-mk01         │     1 │
│ capacitor1           │ electronics-factory-mk01 │     2 │
│ inductor1            │ electronics-factory-mk01 │     1 │
│ resistor1            │ electronics-factory-mk01 │     2 │
│ vacuum-tube          │ electronics-factory-mk01 │     3 │
│ pcb1                 │ pcb-factory-mk01         │     1 │
│ solder-0             │ automated-factory-mk01   │     3 │
│ copper-cable         │ automated-factory-mk01   │     1 │
│ bolts                │ automated-factory-mk01   │     1 │
│ ceramic              │ hpf                      │     1 │
│ graphite             │ hpf                      │     2 │
│ methanal             │ hpf                      │     1 │
│ clay                 │ clay-pit-mk01            │     2 │
│ vacuum               │ vacuum-pump-mk01         │     1 │
│ formica-2            │ wpu-mk01                 │     1 │
│ fiberboard           │ pulp-mill-mk01           │     1 │
│ melamine-resin       │ fbreactor-mk01           │     1 │
│ melamine             │ fbreactor-mk01           │     1 │
│ urea-decomposition   │ distilator               │     2 │
│ cyanic-acid-01       │ quenching-tower          │     1 │
│ battery-mk01         │ chemical-plant-mk01      │     2 │
└──────────────────────┴──────────────────────────┴───────┘
```

**31 buildings, 19.64 MW electric.**

**Inputs** (/s): steam 58.22, water 20.00, methane 7.80, coke 3.92, urea 3.73, copper-plate 3.20,
tin-plate 1.87, lead-plate 1.60, iron-plate 1.50, glass 1.20, coal 0.60, zinc-plate 0.60,
iron-stick 0.60, pbsb-alloy 0.20, raw-fiber 0.20, treated-wood 0.12, sodium-hydroxide 0.12

**Byproducts** (/s): muddy-sludge 5.00, carbon-dioxide 3.00, hydrogen 1.50, tall-oil 0.60, black-liquor 0.40

## Intermediate flows

```
┌────────────────┬─────────┬──────────────────────────────────────┬───────────────────────────────────────┐
│ Item           │ Rate /s │ Producer                             │ Consumer                              │
├────────────────┼─────────┼──────────────────────────────────────┼───────────────────────────────────────┤
│ vacuum         │   25.00 │ vacuum                               │ pcb1 10.00, vacuum-tube 15.00         │
│ cyanic-acid    │    8.00 │ urea-decomposition 5.00 + cya-01 3.00│ melamine 2.00, battery-mk01 6.00      │
│ ammonia        │    5.00 │ urea-decomposition 5.00              │ melamine 2.00, cyanic-acid-01 3.00    │
│ methanal       │    4.00 │ methanal                             │ melamine-resin 4.00                   │
│ copper-cable   │    2.40 │ copper-cable                         │ inductor1 2.40                        │
│ melamine       │    2.00 │ melamine                             │ melamine-resin 1.60, battery-mk01 0.40│
│ clay           │    1.15 │ clay                                 │ ceramic 1.15                          │
│ graphite       │    1.20 │ graphite                             │ vacuum-tube 0.60, battery-mk01 0.60   │
│ resistor1      │    1.20 │ resistor1                            │ electronic-circuit-2 1.20             │
│ capacitor1     │    1.00 │ capacitor1                           │ electronic-circuit-2 1.00             │
│ melamine-resin │    0.80 │ melamine-resin                       │ formica-2 0.80                        │
│ inductor1      │    0.60 │ inductor1                            │ electronic-circuit-2 0.60             │
│ vacuum-tube    │    0.60 │ vacuum-tube                          │ electronic-circuit-2 0.60             │
│ bolts          │    0.60 │ bolts                                │ battery-mk01 0.60                     │
│ ceramic        │    0.57 │ ceramic                              │ capacitor1 0.33, inductor1 0.24       │
│ solder         │    0.40 │ solder-0                             │ electronic-circuit-2 0.40             │
│ formica        │    0.40 │ formica-2                            │ pcb1 0.40                             │
│ battery-mk01   │    0.20 │ battery-mk01                         │ electronic-circuit-2 0.20             │
│ pcb1           │    0.20 │ pcb1                                 │ electronic-circuit-2 0.20             │
│ fiberboard     │    0.16 │ fiberboard                           │ formica-2 0.16                        │
└────────────────┴─────────┴──────────────────────────────────────┴───────────────────────────────────────┘
```

`urea-decomposition` emits ammonia and cyanic-acid 1:1 but the block wants 5:8 — the one quenching
tower burns the ammonia surplus into the extra cyanic-acid, closing both at zero. It is not an
optimisation; without it ammonia has nowhere legal to go.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| electronic-circuit | 1.00 | the product | — | — |
| muddy-sludge | 5.00 | design 15 `Moss-2` (wants 9.15/s) | 0 — already an import there | a separate washer |
| carbon-dioxide | 3.00 | design 15 `Moss-2` (wants 9.15/s) | 0 | `moondrop-co2` greenhouse; venting |
| hydrogen | 1.50 | **vent** (`py-gas-vent`) | 25 kW | burning it — 0.15 MW, noise against 19.64 |
| tall-oil | 0.60 | **UNRESOLVED** | | |
| black-liquor | 0.40 | **UNRESOLVED** | | |

## Open: `fiberboard`'s two byproducts have no legal sink

```
fiberboard  [U] [pulp, 5 s]  treated-wood 3 + raw-fiber 5 + sodium-hydroxide 3 + steam 500
                             →  fiberboard 4 + tall-oil 15 + black-liquor 10
```

- **tall-oil** — only unlocked consumer is `tall-oil-pyvoid-fluid` (py-runoff sinkhole). The three
  real routes (`tall-oil-separation` → benzene + aromatics, `tall-oil-combustion`, `ash-sap`) are
  locked. `tall-oil-separation` needs tech `fluid-separation` (prereq `organic-solvent`, 250 units ×
  [3 automation, 2 py-1, 1 logistic]).
- **black-liquor** — `black-liquor` [U] [gasifier] gives aromatics 100 + acetone 50, which looks
  clean but is closed by its own byproduct: acetone's only unlocked consumer is the vent, and
  acetone is on the never-vent list.

**Variant B below removes both** by importing formica. That is the suggested default if you have a
formica source.

## Variant B — formica imported

```
┌──────────────────────┬──────────────────────────┬───────┐
│ Recipe               │ Factory                  │ Count │
├──────────────────────┼──────────────────────────┼───────┤
│ electronic-circuit-2 │ chipshooter-mk01         │     1 │
│ capacitor1           │ electronics-factory-mk01 │     2 │
│ inductor1            │ electronics-factory-mk01 │     1 │
│ resistor1            │ electronics-factory-mk01 │     2 │
│ vacuum-tube          │ electronics-factory-mk01 │     3 │
│ pcb1                 │ pcb-factory-mk01         │     1 │
│ solder-0             │ automated-factory-mk01   │     3 │
│ copper-cable         │ automated-factory-mk01   │     1 │
│ bolts                │ automated-factory-mk01   │     1 │
│ ceramic              │ hpf                      │     1 │
│ graphite             │ hpf                      │     2 │
│ clay                 │ clay-pit-mk01            │     2 │
│ vacuum               │ vacuum-pump-mk01         │     1 │
│ melamine             │ fbreactor-mk01           │     1 │
│ urea-decomposition   │ distilator               │     1 │
│ cyanic-acid-01       │ quenching-tower          │     1 │
│ battery-mk01         │ chemical-plant-mk01      │     2 │
└──────────────────────┴──────────────────────────┴───────┘
```

**26 buildings, 17.75 MW.**

**Inputs** (/s): steam 38.22, water 4.00, coke 3.92, methane 3.00, copper-plate 2.80, urea 2.27,
tin-plate 1.87, lead-plate 1.60, iron-plate 1.50, glass 1.20, coal 0.60, zinc-plate 0.60,
iron-stick 0.60, formica 0.40, pbsb-alloy 0.20

**Byproducts** (/s): muddy-sludge 1.00, carbon-dioxide 0.60, hydrogen 1.50 — same three sinks as
above. No tall-oil, no black-liquor.

## Build gotchas

- **`formica-2`, not `formica`.** `pcb1` needs formica; route 1 takes **saps x10** per formica,
  which at 0.4 formica/s is 4 saps/s = 80 moduled sap-extractors. `formica-2` runs on
  melamine-resin off the cyanic-acid plant the batteries already need, at 5× the throughput per
  building.
- **`battery-mk01` is the only unlocked battery route**, at 0.100 bat/s per building — 10× worse
  than `nas-battery` (1.200), `battery-2` (1.000), `battery-1` (0.750) and `battery` (0.250). All
  four need **rayon**, which needs `fiber` + `sulfuric-acid` + `sodium-carbonate` +
  `carbon-sulfide`, none of which has an unlocked producer. Revisit the moment sulfuric-acid lands.
- **2 chemical plants are exactly saturated** by the circuits. Science's 0.025 battery/s needs a
  3rd plant at ~25 % and ~0.28 more urea/s.
- No generic speed/productivity modules are fitted — every slot here is the generic kind, and the
  convention across designs 06, 07, 10 and 13 is bio modules only.
- `inductor1` over `inductor1-2`: half the copper (4 cable per inductor vs 8) for under one extra
  building at this scale.

## Plastic draw

`pbsb-alloy` 0.20/s traces 1:1 through `pbsb-alloy` (sb-oxide 1 + lead-plate 6 → 1) and
`sb-oxide-01` (plastic-bar 1 + sb-grade-04 10 + oxygen 50 → 1) — **0.20 plastic-bar/s**. Every other
import has an unlocked route with no plastic in it.

## Solver commands

Target mode on the end product; `battery-mk01` is in the recipe list rather than targeted, so the LP
sizes it to exactly what the circuits consume. No `--max-import` needed — no recycling loop for the
LP to skip.

**Variant A — 31 buildings:**

```bash
npx tsx src/cli.ts solve \
  --recipes "electronic-circuit-2,capacitor1,inductor1,resistor1,pcb1,vacuum-tube,solder-0,ceramic,clay,vacuum,copper-cable,formica-2,melamine-resin,melamine,fiberboard,methanal,graphite,urea-decomposition,cyanic-acid-01,battery-mk01,bolts" \
  --target "electronic-circuit:60" --time 60 \
  --factory "electronic-circuit-2:chipshooter-mk01" \
  --factory "capacitor1:electronics-factory-mk01" \
  --factory "inductor1:electronics-factory-mk01" \
  --factory "resistor1:electronics-factory-mk01" \
  --factory "pcb1:pcb-factory-mk01" \
  --factory "vacuum-tube:electronics-factory-mk01" \
  --factory "solder-0:automated-factory-mk01" \
  --factory "ceramic:hpf" \
  --factory "clay:clay-pit-mk01" \
  --factory "vacuum:vacuum-pump-mk01" \
  --factory "copper-cable:automated-factory-mk01" \
  --factory "formica-2:wpu-mk01" \
  --factory "melamine-resin:fbreactor-mk01" \
  --factory "melamine:fbreactor-mk01" \
  --factory "fiberboard:pulp-mill-mk01" \
  --factory "methanal:hpf" \
  --factory "graphite:hpf" \
  --factory "urea-decomposition:distilator" \
  --factory "cyanic-acid-01:quenching-tower" \
  --factory "battery-mk01:chemical-plant-mk01" \
  --factory "bolts:automated-factory-mk01" \
  --solver simplex \
  --unlocked
```

**Variant B — 26 buildings:**

```bash
npx tsx src/cli.ts solve \
  --recipes "electronic-circuit-2,capacitor1,inductor1,resistor1,pcb1,vacuum-tube,solder-0,ceramic,clay,vacuum,copper-cable,melamine,graphite,urea-decomposition,cyanic-acid-01,battery-mk01,bolts" \
  --target "electronic-circuit:60" --time 60 \
  --factory "electronic-circuit-2:chipshooter-mk01" \
  --factory "capacitor1:electronics-factory-mk01" \
  --factory "inductor1:electronics-factory-mk01" \
  --factory "resistor1:electronics-factory-mk01" \
  --factory "pcb1:pcb-factory-mk01" \
  --factory "vacuum-tube:electronics-factory-mk01" \
  --factory "solder-0:automated-factory-mk01" \
  --factory "ceramic:hpf" \
  --factory "clay:clay-pit-mk01" \
  --factory "vacuum:vacuum-pump-mk01" \
  --factory "copper-cable:automated-factory-mk01" \
  --factory "melamine:fbreactor-mk01" \
  --factory "graphite:hpf" \
  --factory "urea-decomposition:distilator" \
  --factory "cyanic-acid-01:quenching-tower" \
  --factory "battery-mk01:chemical-plant-mk01" \
  --factory "bolts:automated-factory-mk01" \
  --solver simplex \
  --unlocked
```

## Build materials

Distinct construction materials across this block's 13 building types, separate from flow imports:

`boiler` · `burner-inserter` · `burner-mining-drill` · `concrete` · `copper-cable` · `copper-plate` ·
`distilator` · `electronic-circuit` · `electronics-factory-mk01` · `fluid-drill-mk01` ·
`gearbox-mk01` · `glass` · `inductor1` · `inserter` · `intermetallics` · `iron-plate` · `log` ·
`pcb1` · `pipe` · `pump` · `shaft-mk01` · `small-parts-01` · `steam-engine` · `steel-plate` ·
`stone-brick` · `stone-furnace` · `wood`

Every building type here already appears in the existing design catalogue. Inferred from the
catalogue, not from save state.
