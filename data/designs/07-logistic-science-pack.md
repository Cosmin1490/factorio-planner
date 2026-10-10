# Logistic science pack — 0.1/s, 226 buildings (WIP)

Fully self-contained chain from raw resources. mk01 buildings, stone furnaces, bio modules on all farms.
Block splitting into 3 blocks (battery/chemistry, bio/farming, assembly) not yet done.

All factories mk01 tier. Stone furnaces for smelting (iron, copper, lead, tin, zinc, titanium, nexelit). Advanced-foundry-mk01 for steel (stone-furnace can't do advanced-foundry category). Bio modules on all farms/paddocks at mk01 slot counts.

## Recipe table

226 buildings solver-validated (simplex). Self-power not yet computed.

### Buildings >= 1

```
┌─────────────────────────┬──────────────────────────────┬───────┬─────────────────────┐
│ Recipe                  │ Factory                      │ Count │ Modules             │
├─────────────────────────┼──────────────────────────────┼───────┼─────────────────────┤
│ moondrop-1              │ moondrop-greenhouse-mk01     │    22 │ 16x moondrop        │
│ ralesia-1               │ ralesia-plantation-mk01      │    16 │ 12x ralesia         │
│ caged-cottongut-1       │ prandium-lab-mk01            │    11 │ 20x cottongut-mk01  │
│ vrauks-1                │ vrauks-paddock-mk01          │    10 │ 10x vrauks          │
│ sap-01                  │ sap-extractor-mk01           │     9 │ 2x sap-tree         │
│ lead-plate-1            │ stone-furnace                │     7 │                     │
│ iron-plate              │ stone-furnace                │     7 │                     │
│ Moss-2                  │ moss-farm-mk01               │     7 │ 15x moss            │
│ sb-grade-01             │ automated-screener-mk01      │     6 │                     │
│ tin-plate-1             │ stone-furnace                │     6 │                     │
│ seaweed-1               │ seaweed-crop-mk01            │     6 │ 10x seaweed         │
│ titanium-plate-1        │ stone-furnace                │     6 │                     │
│ soil                    │ soil-extractor-mk01          │     4 │                     │
│ glass-1                 │ glassworks-mk01              │     4 │                     │
│ distilled-raw-coal      │ distilator                   │     4 │                     │
│ vrauks-cocoon-1         │ rc-mk01                      │     3 │ 2x vrauks           │
│ auog-pooping-1          │ auog-paddock-mk01            │     2 │ 4x auog             │
│ copper-plate            │ stone-furnace                │     2 │                     │
│ ralesia-seeds           │ botanical-nursery            │     2 │                     │
│ zinc-plate-1            │ stone-furnace                │     2 │                     │
│ latex                   │ hpf                          │     2 │                     │
│ log2                    │ fwf-mk01                     │     2 │ 10x tree-mk01       │
│ full-render-cottongut   │ slaughterhouse-mk01          │     1 │                     │
│ cottongut-cub-1         │ rc-mk01                      │     1 │ 2x cottongut-mk01   │
│ creamy-latex            │ washer                       │     1 │                     │
│ soil-separation-2       │ solid-separator              │     1 │                     │
│ logistic-science-pack   │ research-center-mk01         │     1 │                     │
│ solder-0                │ automated-factory-mk01       │     1 │                     │
│ petri-dish-bacteria     │ micro-mine-mk01              │     1 │                     │
│ hydrogen                │ electrolyzer-mk01            │     1 │                     │
│ tar-refining            │ tar-processing-unit          │     1 │                     │
│ latex-slab              │ distilator                   │     1 │                     │
│ full-render-vrauks      │ slaughterhouse-mk01          │     1 │                     │
│ sodium-alginate         │ hpf                          │     1 │                     │
│ sb-grade-03             │ automated-screener-mk01      │     1 │                     │
└─────────────────────────┴──────────────────────────────┴───────┴─────────────────────┘
```

Plus 73 fractional recipes (1 building each when built): battery-mk01, electronic-circuit-2, melamine, urea cycle, all assembly sub-components, rubber/plastic chain, boron chemistry, fawogae, and more.

## Imports

All raw mined resources — no processed items.

| Resource | /s |
|---|---:|
| water | 566.68 |
| steam | 41.71 |
| raw-coal | 17.65 |
| antimonium-ore | 10.50 |
| iron-ore | 5.13 |
| ore-quartz | 4.50 |
| ore-lead | 3.86 |
| ore-tin | 3.49 |
| ore-titanium | 3.40 |
| native-flora | 1.57 |
| copper-ore | 1.25 |
| ore-zinc | 0.81 |
| water-barrel | 0.80 |
| nexelit-ore | 0.22 |
| raw-borax | 0.03 |

## Exports

| Item | /s |
|---|---:|
| logistic-science-pack | 0.10 |

## Byproducts (wasted)

| Byproduct | /s | Notes |
|---|---:|---|
| coal-gas | 100.12 | from coal distillation — self-power fuel candidate |
| flue-gas | 56.56 | from smelting |
| steam | 48.61 | from various processes |
| pitch | 18.15 | tar byproduct — fuel or tar recycling |
| sb-grade-01 | 5.25 | antimony screening waste |
| oxygen | 5.06 | from electrolysis |
| middle-oil | 3.89 | tar-refining byproduct, no consumer in chain |
| sand | 3.61 | |
| coal | 3.37 | from coal processing |
| carbon-dioxide | 3.22 | excluded from melamine |
| creosote | 2.72 | tar byproduct |
| sb-grade-02 | 2.59 | antimony screening waste |
| ammonia | 0.81 | from urea decomposition |

## Key design decisions

- **Urea cycle closes without dedicated muddy-sludge recipe.** LP scales up clean-nexelit production to get enough muddy-sludge as a byproduct. The urea demand is driven by cyanic-acid for batteries (0.81/s), not melamine (0.05/s).
- **Bio modules are the dominant factor.** Without modules: 1000+ buildings. With mk01 modules: 226. The 5-21x speed multiplier on farms dwarfs the mk01→mk04 building tier difference.
- **Growth cycles self-sustaining.** Cottongut, wood, ralesia, moondrop seed loops are all net-positive. No seed imports needed.
- **Two solver constraints required:**
  - `full-render-vrauks:cage:exclude` — prevents cage recycling loop from vrauks rendering
  - `melamine:carbon-dioxide:exclude` — prevents melamine CO2 from feeding back into the urea cycle

## Solver command

```bash
npx tsx src/cli.ts solve \
  --recipes "logistic-science-pack,battery-mk01,animal-sample-01,alien-sample01,cottongut-science-red-seeds,pbsb-alloy,sb-oxide-01,sb-grade-01,sb-grade-02,sb-grade-03,sb-grade-04,melamine,urea-decomposition,graphite,coke-coal,bolts,iron-stick,glass-1,molten-glass,zinc-plate-1,lead-plate-1,aromatics-to-plastic,syngas,distilled-raw-coal,tar-distilation,hydrogen,ground-sample01,rich-clay,soil,electronic-circuit-2,capacitor1,inductor1,resistor1,pcb1,vacuum-tube,solder-0,tin-plate-1,ceramic,clay,formica,treated-wood,fiber-01,methanal,vacuum,pressured-air,plasmids,flask,stopper,lab-instrument,equipment-chassi,fenxsb-alloy-2,lens,small-parts-01,iron-gear-wheel,copper-cable,small-lamp,petri-dish-bacteria,petri-dish,empty-petri-dish,agar,zogna-bacteria,rubber-01,carbon-black,polybutadiene,latex,latex-slab,sodium-alginate,creamy-latex,boron-trioxide,boric-acid,diborane,borax-washing,iron-plate,copper-plate,titanium-plate-1,steel-plate,nexelit-plate-2,clean-nexelit,seaweed-1,sap-01,tar-refining,bio-sample01,bone-to-bonemeal-2,full-render-cottongut,full-render-vrauks,caged-vrauks,vrauks-1,vrauks-cocoon-1,cage,fawogae-substrate,cellulose-00,depolymerized-organics,fawogae-1,fawogae-spore,pressured-water,extract-limestone-01,soil-separation-2,subcritical-water-01,Moss-2,methane-co2,liquid-manure,auog-pooping-1,urea-from-liquid-manure,caged-cottongut-1,cottongut-cub-1,log-wood-fast,log2,wood-seedling,wood-seeds,ralesia-1,ralesia-seeds,moondrop-1,moondrop-seeds" \
  --constraint "full-render-vrauks:cage:exclude" \
  --constraint "melamine:carbon-dioxide:exclude" \
  --target "logistic-science-pack:6" --time 60 \
  --solver simplex --unlocked \
  --factory "logistic-science-pack:research-center-mk01" \
  --factory "battery-mk01:chemical-plant-mk01" \
  --factory "animal-sample-01:genlab-mk01" \
  --factory "alien-sample01:automated-factory-mk01" \
  --factory "cottongut-science-red-seeds:incubator-mk01" \
  --factory "pbsb-alloy:smelter-mk01" \
  --factory "sb-oxide-01:bof-mk01" \
  --factory "sb-grade-01:automated-screener-mk01" \
  --factory "sb-grade-02:jaw-crusher" \
  --factory "sb-grade-03:automated-screener-mk01" \
  --factory "sb-grade-04:secondary-crusher-mk01" \
  --factory "melamine:fbreactor-mk01" \
  --factory "urea-decomposition:distilator" \
  --factory "graphite:hpf" \
  --factory "coke-coal:hpf" \
  --factory "bolts:automated-factory-mk01" \
  --factory "iron-stick:automated-factory-mk01" \
  --factory "glass-1:glassworks-mk01" \
  --factory "molten-glass:glassworks-mk01" \
  --factory "zinc-plate-1:stone-furnace" \
  --factory "lead-plate-1:stone-furnace" \
  --factory "aromatics-to-plastic:biofactory-mk01" \
  --factory "syngas:gasifier" \
  --factory "distilled-raw-coal:distilator" \
  --factory "tar-distilation:distilator" \
  --factory "hydrogen:electrolyzer-mk01" \
  --factory "ground-sample01:automated-factory-mk01" \
  --factory "rich-clay:automated-factory-mk01" \
  --factory "soil:soil-extractor-mk01" \
  --factory "electronic-circuit-2:chipshooter-mk01" \
  --factory "capacitor1:electronics-factory-mk01" \
  --factory "inductor1:electronics-factory-mk01" \
  --factory "resistor1:electronics-factory-mk01" \
  --factory "pcb1:pcb-factory-mk01" \
  --factory "vacuum-tube:electronics-factory-mk01" \
  --factory "solder-0:automated-factory-mk01" \
  --factory "tin-plate-1:stone-furnace" \
  --factory "ceramic:hpf" \
  --factory "clay:clay-pit-mk01" \
  --factory "formica:pulp-mill-mk01" \
  --factory "treated-wood:tar-processing-unit" \
  --factory "fiber-01:wpu-mk01" \
  --factory "methanal:hpf" \
  --factory "vacuum:vacuum-pump-mk01" \
  --factory "pressured-air:vacuum-pump-mk01" \
  --factory "plasmids:biofactory-mk01" \
  --factory "flask:glassworks-mk01" \
  --factory "stopper:automated-factory-mk01" \
  --factory "lab-instrument:automated-factory-mk01" \
  --factory "equipment-chassi:automated-factory-mk01" \
  --factory "fenxsb-alloy-2:smelter-mk01" \
  --factory "lens:glassworks-mk01" \
  --factory "small-parts-01:automated-factory-mk01" \
  --factory "iron-gear-wheel:automated-factory-mk01" \
  --factory "copper-cable:automated-factory-mk01" \
  --factory "small-lamp:automated-factory-mk01" \
  --factory "petri-dish-bacteria:micro-mine-mk01" \
  --factory "petri-dish:automated-factory-mk01" \
  --factory "empty-petri-dish:glassworks-mk01" \
  --factory "agar:hpf" \
  --factory "zogna-bacteria:incubator-mk01" \
  --factory "rubber-01:heavy-oil-refinery-mk01" \
  --factory "carbon-black:reformer-mk01" \
  --factory "polybutadiene:cracker-mk01" \
  --factory "latex:hpf" \
  --factory "latex-slab:distilator" \
  --factory "sodium-alginate:hpf" \
  --factory "creamy-latex:washer" \
  --factory "boron-trioxide:hpf" \
  --factory "boric-acid:electrolyzer-mk01" \
  --factory "diborane:electrolyzer-mk01" \
  --factory "borax-washing:washer" \
  --factory "iron-plate:stone-furnace" \
  --factory "copper-plate:stone-furnace" \
  --factory "titanium-plate-1:stone-furnace" \
  --factory "steel-plate:advanced-foundry-mk01" \
  --factory "nexelit-plate-2:stone-furnace" \
  --factory "clean-nexelit:washer" \
  --factory "seaweed-1:seaweed-crop-mk01" \
  --factory "sap-01:sap-extractor-mk01" \
  --factory "tar-refining:tar-processing-unit" \
  --factory "bio-sample01:automated-factory-mk01" \
  --factory "bone-to-bonemeal-2:fbreactor-mk01" \
  --factory "full-render-cottongut:slaughterhouse-mk01" \
  --factory "full-render-vrauks:slaughterhouse-mk01" \
  --factory "caged-vrauks:automated-factory-mk01" \
  --factory "vrauks-1:vrauks-paddock-mk01" \
  --factory "vrauks-cocoon-1:rc-mk01" \
  --factory "cage:automated-factory-mk01" \
  --factory "fawogae-substrate:automated-factory-mk01" \
  --factory "cellulose-00:hpf" \
  --factory "depolymerized-organics:reformer-mk01" \
  --factory "fawogae-1:fawogae-plantation-mk01" \
  --factory "fawogae-spore:spore-collector-mk01" \
  --factory "pressured-water:vacuum-pump-mk01" \
  --factory "extract-limestone-01:soil-extractor-mk01" \
  --factory "soil-separation-2:solid-separator" \
  --factory "subcritical-water-01:py-heat-exchanger" \
  --factory "Moss-2:moss-farm-mk01" \
  --factory "methane-co2:moondrop-greenhouse-mk01" \
  --factory "liquid-manure:bio-reactor-mk01" \
  --factory "auog-pooping-1:auog-paddock-mk01" \
  --factory "urea-from-liquid-manure:bio-reactor-mk01" \
  --factory "caged-cottongut-1:prandium-lab-mk01" \
  --factory "cottongut-cub-1:rc-mk01" \
  --factory "log-wood-fast:wpu-mk01" \
  --factory "log2:fwf-mk01" \
  --factory "wood-seedling:botanical-nursery" \
  --factory "wood-seeds:automated-factory-mk01" \
  --factory "ralesia-1:ralesia-plantation-mk01" \
  --factory "ralesia-seeds:botanical-nursery" \
  --factory "moondrop-1:moondrop-greenhouse-mk01" \
  --factory "moondrop-seeds:botanical-nursery" \
  --modules "seaweed-1:seaweed:10" \
  --modules "sap-01:sap-tree:2" \
  --modules "vrauks-1:vrauks:10" \
  --modules "vrauks-cocoon-1:vrauks:2" \
  --modules "Moss-2:moss:15" \
  --modules "methane-co2:moondrop:16" \
  --modules "auog-pooping-1:auog:4" \
  --modules "caged-cottongut-1:cottongut-mk01:20" \
  --modules "cottongut-cub-1:cottongut-mk01:2" \
  --modules "log2:tree-mk01:10" \
  --modules "ralesia-1:ralesia:12" \
  --modules "moondrop-1:moondrop:16"
```

## TODO

- [ ] Split into 3 blocks (battery/chemistry, bio/farming, assembly)
- [ ] Compute self-power for each block
- [ ] Intermediate flow tables per block
- [ ] Block boundary declarations (imports/exports between blocks)
