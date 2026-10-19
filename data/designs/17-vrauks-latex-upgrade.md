# 17 — Vrauks/latex tier-2 upgrade — 0.45 latex/s, 139 buildings

An **upgrade of design 01's vrauks and latex section, not a replacement.** Design 01 keeps its
0.20 latex/s for `stopper`; the extra 0.25 goes to a new rubber stage. Both lines run off one
vrauks chain.

The whole thing rests on two recipe swaps on buildings design 01 already has:

```
vrauks-1        [U] [vrauks, 160 s]  water-barrel 3 + native-flora 15 + cocoon 10 + moss 5
                                     →  barrel 3 + vrauks 2          0.0125 vrauks/craft-s
vrauks-2        [U] [vrauks, 130 s]  water-barrel 3 + vrauks-food-01 2 + cocoon 20 + saps 10 + moss 8
                                     →  barrel 3 + vrauks 4          0.0308  — 2.46×

vrauks-cocoon-1 [U] [rc, 40 s]  water-barrel 4 + native-flora 5 + saps 3 + moss 10
                                →  barrel 4 + cocoon 5               0.1250 cocoon/craft-s
vrauks-cocoon-2 [U] [rc, 35 s]  water-barrel 4 + native-flora 10 + vrauks-food-01 1 + saps 6 + moss 20
                                →  barrel 4 + cocoon 10              0.2857  — 2.29×
```

Both tier-2s and `vrauks-food-01` are already unlocked.

## Configuration

Sized to **4 `rc-mk01`**, which design 01 already has. That caps vrauks at ~0.23/s and puts the
block at 15 of design 01's 16 paddocks, one left idle.

| config | paddocks running | rc | latex/s | rubber/s | buildings |
|---|---|--:|--:|--:|--:|
| 13× tier-2, 3 idle | 13 | 4 | 0.400 | 0.200 | 121 |
| 13× tier-2 + 3× tier-1 | 16 | 4 | 0.438 | 0.238 | ~130 |
| **this design — 15× tier-2, 1 idle** | **15** | **4** | **0.450** | **0.250** | **139** |
| 16× tier-2 | 16 | **5** | 0.492 | 0.292 | 151 |

**Keeping spares on `vrauks-1` is dominated.** A tier-2 paddock is worth 2.46 tier-1s, so converting
two more spares adds 0.031 vrauks/s where running three on the old recipe adds 0.019. `vrauks-1` has
no role once tier-2 is available, except that it pays in native-flora where tier-2 pays in saps and
food — about 0.14 native-flora/s saved against 0.06 saps/s spent, which is not enough to carry it.

The ceiling on existing stock is **one `rc-mk01`**, not the paddocks.

## Block boundary

| class | items |
|---|---|
| **import — readily available** | water, stone |
| **import — map-limited** | native-flora |
| **import — design 18** | vrauks-food-01 |
| **import — design 13** | aromatics, anthracene-oil |
| **import — other** | muddy-sludge, carbon-dioxide, titanium-plate |
| **must-consume-internally** | vrauks, cocoon, cage, caged-vrauks, formic-acid, saps, moss, seaweed, sodium-alginate, limestone, creamy-latex, latex-slab, barrel, vacuum, carbon-black, polybutadiene |
| **byproduct-exclude** | none |

## Recipe table

```
┌──────────────────────┬─────────────────────────┬───────┬─────────────┐
│ Recipe               │ Factory                 │ Count │ Modules     │
├──────────────────────┼─────────────────────────┼───────┼─────────────┤
│ sap-01               │ sap-extractor-mk01      │    43 │ 2x sap-tree │
│ Moss-1               │ moss-farm-mk01          │    34 │ 15x moss    │
│ vrauks-2             │ vrauks-paddock-mk01     │    15 │ 10x vrauks  │
│ seaweed-1            │ seaweed-crop-mk01       │    12 │ 10x seaweed │
│ extract-limestone-01 │ soil-extractor-mk01     │     7 │             │
│ latex                │ hpf                     │     5 │             │
│ creamy-latex         │ washer                  │     4 │             │
│ vrauks-cocoon-2      │ rc-mk01                 │     4 │ 2x vrauks   │
│ latex-slab           │ distilator              │     3 │             │
│ sodium-alginate      │ hpf                     │     3 │             │
│ full-render-vrauks   │ slaughterhouse-mk01     │     3 │             │
│ caged-vrauks         │ automated-factory-mk01  │     1 │             │
│ water-barrel         │ barrel-machine-mk01     │     1 │             │
├──────────────────────┼─────────────────────────┼───────┼─────────────┤
│ rubber-01            │ heavy-oil-refinery-mk01 │     1 │             │
│ carbon-black         │ reformer-mk01           │     1 │             │
│ polybutadiene        │ cracker-mk01            │     1 │             │
│ vacuum               │ vacuum-pump-mk01        │     1 │             │
└──────────────────────┴─────────────────────────┴───────┴─────────────┘
```

**139 buildings, 45.29 MW** — 135 latex chain (solver-validated) + 4 rubber stage (computed
manually; the solve targets latex, which cannot also produce rubber).

**Inputs** (/s): water 425.94, muddy-sludge 33.75, carbon-dioxide 33.75, aromatics 25.00,
anthracene-oil 25.00, stone 2.25, native-flora 1.125, vrauks-food-01 0.225, titanium-plate 0.125

**Byproducts** (/s): steam 57.50 @150 °C, meat 0.45, guts 0.45, chitin 0.225, brain 0.225

## Intermediate flows

```
┌─────────────────┬─────────┬───────────────────────────────┬────────────────────────────────────────┐
│ Item            │ Rate /s │ Producer                      │ Consumer                               │
├─────────────────┼─────────┼───────────────────────────────┼────────────────────────────────────────┤
│ steam           │  125.00 │ polybutadiene                 │ latex 67.50  (57.50 exported)          │
│ creamy-latex    │   45.00 │ creamy-latex                  │ latex-slab 45.00                       │
│ formic-acid     │   45.00 │ full-render-vrauks            │ latex-slab 45.00                       │
│ polybutadiene   │   12.50 │ polybutadiene                 │ rubber-01 12.50                        │
│ vacuum          │   12.50 │ vacuum                        │ carbon-black 12.50                     │
│ moss            │    2.70 │ Moss-1                        │ vrauks-2 0.45, vrauks-cocoon-2 2.25    │
│ limestone       │    2.70 │ extract-limestone-01          │ creamy-latex 0.90, sodium-alginate 1.80│
│ saps            │    2.14 │ sap-01                        │ creamy-latex 0.90, vrauks-2 0.56, vrauks-cocoon-2 0.68 │
│ seaweed         │    2.25 │ seaweed-1                     │ sodium-alginate 2.25                   │
│ cocoon          │    1.13 │ vrauks-cocoon-2               │ vrauks-2 1.13                          │
│ carbon-black    │    0.50 │ carbon-black                  │ rubber-01 0.50                         │
│ barrel          │    0.62 │ vrauks-2 0.17 + cocoon-2 0.45 │ water-barrel 0.62                      │
│ water-barrel    │    0.62 │ water-barrel                  │ vrauks-2 0.17, vrauks-cocoon-2 0.45    │
│ latex           │    0.45 │ latex                         │ **design 01 stopper 0.20**, rubber-01 0.25 │
│ latex-slab      │    0.45 │ latex-slab                    │ latex 0.45                             │
│ sodium-alginate │    0.45 │ sodium-alginate               │ latex-slab 0.45                        │
│ vrauks          │    0.225│ vrauks-2                      │ caged-vrauks 0.225                     │
│ caged-vrauks    │    0.225│ caged-vrauks                  │ full-render-vrauks 0.225               │
│ cage            │    0.225│ full-render-vrauks            │ caged-vrauks 0.225                     │
└─────────────────┴─────────┴───────────────────────────────┴────────────────────────────────────────┘
```

Three loops close net-zero: `cage ↔ caged-vrauks`, `cocoon → vrauks`, `barrel ↔ water-barrel`.

**Steam needs no import.** `polybutadiene` emits 125/s at 150 °C, `latex` has no
`minimum_temperature` on its steam and takes 67.50/s of it directly. 57.50/s leaves the block.

## Terminal outputs

| output | /s | notes |
|---|--:|---|
| latex | 0.45 | 0.20 → design 01 `stopper`, 0.25 → `rubber-01` |
| rubber | 0.25 | the new product |
| steam @150 °C | 57.50 | exported; 25.00/s of it feeds design 18, rest unassigned |
| meat · guts | 0.45 each | exported; no sink in this block |
| chitin · brain | 0.225 each | exported; no sink in this block |

## Diff vs design 01

Design 01 holds **86 buildings** in these recipe slots.

| recipe | design 01 | this | Δ |
|---|--:|--:|--:|
| **sap-01** | 14 | 43 | **+29** |
| **extract-limestone-01** | 0 | 7 | **+7** |
| latex (hpf) | 2 | 5 | +3 |
| creamy-latex (washer) | 2 | 4 | +2 |
| latex-slab · sodium-alginate · full-render-vrauks | 1 each | 3 each | **+2 each** |
| rubber-01 · carbon-black · polybutadiene · vacuum | 0 | 1 each | **+4** |
| **vrauks-1 → `vrauks-2`** | 16 | 15 | **−1** · *recipe swap, 1 idle* |
| **vrauks-cocoon-1 → `vrauks-cocoon-2`** | 4 | 4 | **0** · *recipe swap* |
| Moss-1 | 32 | 34 | +2 ˢ |
| seaweed-1 | 11 | 12 | +1 ˢ |
| caged-vrauks · water-barrel | 1 each | 1 each | 0 |
| | **86** | **139** | **+53** |

**ˢ Understated.** Design 01's Moss-1 and seaweed also feed its science line, which keeps running:

```
Moss-1   : 34 (here) + 17 (design 01's fawogae-substrate + wood-seedling)  = 51  vs 32  →  +19
seaweed-1: 12 (here) +  6 (design 01's agar → petri-dish)                  = 18  vs 11  →   +7
```

**True net +76**, not +53. Design 18 carries its own 10 Moss-1 and 6 seaweed on top.

## Variant — 16 paddocks, 5 rc

Building one more `rc-mk01` unlocks the last paddock: **151 buildings, 50.01 MW, 0.492 latex/s,
0.292 rubber/s.** The latex chain solves to 146 (Moss-1 37, sap-01 47, seaweed-1 13,
vrauks-2 16, vrauks-cocoon-2 5, extract-limestone-01 8, latex 5, creamy-latex 4, latex-slab 3,
sodium-alginate 3, full-render-vrauks 3, caged-vrauks 1, water-barrel 1) plus a 5-building rubber
stage (`rubber-01` goes to 2).

## Aromatics

Both configs clear `r=0` with design 14 and 15's 0.49 plastic-bar/s reserved:

| | aromatics /s | of design 13's 56.89 | plastic-bar/s left |
|---|--:|--:|--:|
| **this design (0.25 rubber/s)** | 25.0 | 44 % | **0.638** |
| variant (0.292 rubber/s) | 29.2 | 51 % | 0.554 |

No dial movement required. At `r=1` there is 95.28 aromatics/s and neither config is close to
binding.

## Build gotchas

- **`sap-01` must carry 2× `sap-tree`** — base speed 0.333 → 1.0. Without them the bank triples
  from 43 to 129. Design 01 already fits them.
- **`Moss-1` chosen over `Moss-2`** to keep stone off the critical path, matching design 01.
  Moss-2 would be 14 farms instead of 34 and 2.5× the moss per building, but costs 20 stone per
  craft and halves the muddy-sludge/CO₂ draw — re-price it if stone stops being annoying.
- **Do not apply the solver's `:exclude` suggestions.** Two cycle warnings appear
  (`cage → caged-vrauks`, `cocoon → water-barrel → barrel`); both are the real loops.
- `caged-vrauks` in design 01 is an `assembling-machine-1`; this design assumes
  `automated-factory-mk01`. Either works — the recipe is `crafting`.
- **muddy-sludge and CO₂ roughly double** against design 01's current draw (33.75/s each here).
  Design 01 imports CO₂ at 32/s and runs 2 `soil-washing` washers; both sources need scaling and
  neither is counted in the 139.

## Solver command

The command targets **latex**, since the 0.45/s splits between design 01's `stopper` line and the
rubber stage and the solver takes a single target. The four rubber-stage buildings are computed
from 0.25 rubber/s: `rubber-01` 0.25 crafts/s × 4 s = 1, `carbon-black` and `polybutadiene` 0.125
crafts/s × 2 s = 1 each, `vacuum` 12.5/s = 1.

```bash
npx tsx src/cli.ts solve \
  --recipes "latex,latex-slab,creamy-latex,sap-01,sodium-alginate,full-render-vrauks,caged-vrauks,vrauks-2,vrauks-cocoon-2,seaweed-1,extract-limestone-01,water-barrel,Moss-1" \
  --target "latex:27" --time 60 \
  --factory "latex:hpf" \
  --factory "latex-slab:distilator" \
  --factory "creamy-latex:washer" \
  --factory "sap-01:sap-extractor-mk01" \
  --factory "sodium-alginate:hpf" \
  --factory "full-render-vrauks:slaughterhouse-mk01" \
  --factory "caged-vrauks:automated-factory-mk01" \
  --factory "vrauks-2:vrauks-paddock-mk01" \
  --factory "vrauks-cocoon-2:rc-mk01" \
  --factory "seaweed-1:seaweed-crop-mk01" \
  --factory "extract-limestone-01:soil-extractor-mk01" \
  --factory "water-barrel:barrel-machine-mk01" \
  --factory "Moss-1:moss-farm-mk01" \
  --modules "sap-01:sap-tree:2" \
  --modules "vrauks-2:vrauks:10" \
  --modules "vrauks-cocoon-2:vrauks:2" \
  --modules "seaweed-1:seaweed:10" \
  --modules "Moss-1:moss:15" \
  --solver simplex \
  --unlocked
```

The variant is the same command with `--target "latex:29.5"`.

The solver warns `moss`, `seaweed` and `sap-tree` are "not unlocked" — export data limitation; all
three are available in-game and self-funding.

## Build materials

Distinct construction materials across this block's 13 building types, separate from flow imports:

`aluminium-plate` · `burner-inserter` · `burner-mining-drill` · `concrete` · `copper-plate` ·
`distilator` · `electronic-circuit` · `gearbox-mk01` · `glass` · `inductor1` · `inserter` ·
`intermetallics` · `iron-plate` · `lab` · `lead-plate` · `limestone` · `micro-mine-mk01` · `pipe` ·
`shaft-mk01` · `small-parts-01` · `soil` · `steam-engine` · `steel-plate` · `stone` · `stone-brick` ·
`stone-furnace` · `tin-plate` · `titanium-plate`

Every building type already appears in the catalogue — most of them in design 01 itself, which is
the point of this design. Inferred from the catalogue, not from save state.
