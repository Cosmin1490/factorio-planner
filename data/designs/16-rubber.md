# 16 — Rubber — 0.2 rubber/s, 57 buildings

Sized to 16 `vrauks-paddock-mk01`. Formic-acid is the largest cost in the block and
`full-render-vrauks` is the only unlocked source, so paddocks are the anchor.

## Block boundary

| class | items |
|---|---|
| **import — readily available** | water, stone, titanium-plate |
| **import — coal chemistry (design 13)** | anthracene-oil, aromatics |
| **import — bio** | native-flora, moss |
| **must-consume-internally** | saps, creamy-latex, latex-slab, latex, formic-acid, carbon-black, polybutadiene, sodium-alginate, seaweed, limestone, vacuum, cage, cocoon, vrauks, barrel |
| **byproduct-exclude** | none |

## Recipe table

```
┌──────────────────────┬─────────────────────────┬───────┬─────────────┐
│ Recipe               │ Factory                 │ Count │ Modules     │
├──────────────────────┼─────────────────────────┼───────┼─────────────┤
│ vrauks-1             │ vrauks-paddock-mk01     │    16 │ 10x vrauks  │
│ sap-01               │ sap-extractor-mk01      │    14 │ 2x sap-tree │
│ seaweed-1            │ seaweed-crop-mk01       │     5 │ 10x seaweed │
│ vrauks-cocoon-1      │ rc-mk01                 │     4 │ 2x vrauks   │
│ extract-limestone-01 │ soil-extractor-mk01     │     4 │             │
│ latex                │ hpf                     │     3 │             │
│ creamy-latex         │ washer                  │     2 │             │
│ rubber-01            │ heavy-oil-refinery-mk01 │     1 │             │
│ latex-slab           │ distilator              │     1 │             │
│ sodium-alginate      │ hpf                     │     1 │             │
│ carbon-black         │ reformer-mk01           │     1 │             │
│ polybutadiene        │ cracker-mk01            │     1 │             │
│ full-render-vrauks   │ slaughterhouse-mk01     │     1 │             │
│ caged-vrauks         │ automated-factory-mk01  │     1 │             │
│ water-barrel         │ barrel-machine-mk01     │     1 │             │
│ vacuum               │ vacuum-pump-mk01        │     1 │             │
└──────────────────────┴─────────────────────────┴───────┴─────────────┘
```

**57 buildings, 20.65 MW electric.**

**Inputs** (/s): water 247.50, anthracene-oil 20.00, aromatics 20.00, native-flora 1.25, moss 1.25,
stone 1.00, titanium-plate 0.10

**Byproducts** (/s): steam 70.00 @150 °C, meat 0.20, guts 0.20, chitin 0.10, brain 0.10

## Intermediate flows

```
┌─────────────────┬─────────┬───────────────────────────────┬────────────────────────────────────────┐
│ Item            │ Rate /s │ Producer                      │ Consumer                               │
├─────────────────┼─────────┼───────────────────────────────┼────────────────────────────────────────┤
│ steam           │  100.00 │ polybutadiene                 │ latex 30.00  (70.00 exported)          │
│ creamy-latex    │   20.00 │ creamy-latex                  │ latex-slab 20.00                       │
│ formic-acid     │   20.00 │ full-render-vrauks            │ latex-slab 20.00                       │
│ polybutadiene   │   10.00 │ polybutadiene                 │ rubber-01 10.00                        │
│ vacuum          │   10.00 │ vacuum                        │ carbon-black 10.00                     │
│ limestone       │    1.20 │ extract-limestone-01          │ creamy-latex 0.40, sodium-alginate 0.80│
│ seaweed         │    1.00 │ seaweed-1                     │ sodium-alginate 1.00                   │
│ saps            │    0.70 │ sap-01                        │ creamy-latex 0.40, vrauks-cocoon-1 0.30│
│ barrel          │    0.55 │ vrauks-1 0.15 + cocoon-1 0.40 │ water-barrel 0.55                      │
│ water-barrel    │    0.55 │ water-barrel                  │ vrauks-1 0.15, vrauks-cocoon-1 0.40    │
│ cocoon          │    0.50 │ vrauks-cocoon-1               │ vrauks-1 0.50                          │
│ carbon-black    │    0.40 │ carbon-black                  │ rubber-01 0.40                         │
│ latex           │    0.20 │ latex                         │ rubber-01 0.20                         │
│ latex-slab      │    0.20 │ latex-slab                    │ latex 0.20                             │
│ sodium-alginate │    0.20 │ sodium-alginate               │ latex-slab 0.20                        │
│ vrauks          │    0.10 │ vrauks-1                      │ caged-vrauks 0.10                      │
│ caged-vrauks    │    0.10 │ caged-vrauks                  │ full-render-vrauks 0.10                │
│ cage            │    0.10 │ full-render-vrauks            │ caged-vrauks 0.10                      │
└─────────────────┴─────────┴───────────────────────────────┴────────────────────────────────────────┘
```

Three loops close net-zero: `cage ↔ caged-vrauks`, `cocoon → vrauks`, `barrel ↔ water-barrel`.

## Terminal outputs

| output | /s | notes |
|---|--:|---|
| rubber | 0.20 | the product |
| steam @150 °C | 70.00 | exported; disposition not settled here |
| meat · guts | 0.20 ea | exported; no sink in this block |
| chitin · brain | 0.10 ea | exported; no sink in this block |

`latex` has no `minimum_temperature` on its steam, so it absorbs 30/s of the 100/s internally
despite the low grade.

## Build gotchas

- **`sap-01` must carry 2× `sap-tree`.** Base speed 0.333 → 1.0; without the modules the extractor
  bank triples from 14 to 42. Self-funding — `sap-seeds` [U] (saps 5 → 2) then `sap-tree` [U]
  [nursery] (planter-box 1 + sap-seeds 5 → 1).
- **The vrauks chain eats saps too.** Of 0.70 saps/s only 0.40 reaches `creamy-latex`;
  `vrauks-cocoon-1` takes 0.30. Easy to miss tracing latex backwards.
- **Do not apply the solver's suggested `:exclude` constraints.** Two cycle warnings appear
  (`cage → caged-vrauks`, `cocoon → water-barrel → barrel`) — both are the real loops above.
- `vacuum` and `water-barrel` are each one building that removes an import. Keep them.
- `extract-limestone-01` is 4 soil-extractors on water alone (400 water → 8 limestone, 20 s) — the
  reason water import is 247.50/s rather than ~100.

## Cost in aromatics

| | draws | design 13 makes | share |
|---|--:|--:|--:|
| anthracene-oil | 20/s | 155–272/s | 7.4–12.9 % |
| **aromatics** | **20/s** | **56.9–99.8/s** | **20–35 %** |

Design 13's plastic is aromatics-limited at `aromatics/50`, so **20 aromatics/s is 0.40 plastic-bar/s
forgone**. The draw is flat regardless of `r`, so turning design 13's dial up absorbs it: leftover
plastic 0.74/s at `r=0`, 1.60/s at `r=1`. Design-13 figures derived from its published per-tar
coefficients × `tar(r)`, not a fresh solve.

This block imports no plastic itself.

## Do not scale this up

| | current | pending | factor |
|---|---|---|--:|
| latex → rubber | `rubber-01` 1→1 | **`rubber-04` 4→40** | 10× |
| saps per building | `sap-01` 0.05/s moduled | `sap-tree-mulch-mk01` 1.375/s per wpu | 8.5× |

~85× compounded. 0.2 rubber/s is 10× the stopper demand of the logistic science pack and 1.7× what
pulling `lab-instrument` in-house needs. At 1.0 rubber/s the block would be 255 buildings and take
100 aromatics/s — more than design 13 makes at `r=0`.

`sulfuric-acid` is the unlock to watch: it opens `formic-acid` (formamide + water + sulfuric-acid →
100), which deletes the 22-building vrauks chain, and it is the same gate on all four better battery
routes in design 14.

## Solver command

```bash
npx tsx src/cli.ts solve \
  --recipes "rubber-01,latex,latex-slab,creamy-latex,sap-01,sodium-alginate,carbon-black,polybutadiene,full-render-vrauks,caged-vrauks,vrauks-1,vrauks-cocoon-1,seaweed-1,extract-limestone-01,water-barrel,vacuum" \
  --target "rubber:12" --time 60 \
  --factory "rubber-01:heavy-oil-refinery-mk01" \
  --factory "latex:hpf" \
  --factory "latex-slab:distilator" \
  --factory "creamy-latex:washer" \
  --factory "sap-01:sap-extractor-mk01" \
  --factory "sodium-alginate:hpf" \
  --factory "carbon-black:reformer-mk01" \
  --factory "polybutadiene:cracker-mk01" \
  --factory "full-render-vrauks:slaughterhouse-mk01" \
  --factory "caged-vrauks:automated-factory-mk01" \
  --factory "vrauks-1:vrauks-paddock-mk01" \
  --factory "vrauks-cocoon-1:rc-mk01" \
  --factory "seaweed-1:seaweed-crop-mk01" \
  --factory "extract-limestone-01:soil-extractor-mk01" \
  --factory "water-barrel:barrel-machine-mk01" \
  --factory "vacuum:vacuum-pump-mk01" \
  --modules "sap-01:sap-tree:2" \
  --modules "vrauks-1:vrauks:10" \
  --modules "vrauks-cocoon-1:vrauks:2" \
  --modules "seaweed-1:seaweed:10" \
  --solver simplex \
  --unlocked
```

The solver warns `seaweed` is "not unlocked" — export data limitation, available in-game.

## Build materials

Distinct construction materials across this block's 15 building types, separate from flow imports:

`aluminium-plate` · `burner-inserter` · `burner-mining-drill` · `concrete` · `copper-plate` ·
`distilator` · `electronic-circuit` · `gearbox-mk01` · `glass` · `inductor1` · `inserter` ·
`intermetallics` · `iron-plate` · `lab` · `lead-plate` · `limestone` · `micro-mine-mk01` · `pipe` ·
`shaft-mk01` · `small-parts-01` · `soil` · `steam-engine` · `steel-plate` · `stone-brick` ·
`stone-furnace` · `tin-plate` · `titanium-plate`

Every building type here already appears in the existing design catalogue — the vrauks and sap set
in design 07, the oil set in designs 10 and 13. Inferred from the catalogue, not from save state.
