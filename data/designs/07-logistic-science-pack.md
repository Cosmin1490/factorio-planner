# Logistic science pack — 0.1/s, 218 buildings

Fully self-contained chain from raw resources. mk01 buildings, stone furnaces, bio modules on all farms. 218 buildings, 106.92 MW (213 solver + 5 mining fluid chain).

All factories mk01 tier. Stone furnaces for smelting (iron, copper, lead, tin, zinc, titanium, nexelit). Advanced-foundry-mk01 for steel (stone-furnace can't do advanced-foundry category). Bio modules on all farms/paddocks at mk01 slot counts. Stopper-2 (rubber-based) instead of stopper (coal+latex). Mining fluid production (acetylene, aromatics) covers all ore drilling requirements except steam.

## Optimization analysis

Full recycling mode with ore crushing, barrel loop, and grade-2-tin consumption. Cage recycling (vrauks loop is net-zero: 1 cage in → 1 cage out) — no cage recipe needed, no cage exclude constraint. Barrel recycling (water-barrel loop is net-zero: 1 barrel in → 1 barrel out) — water-barrel recipe closes the barrel cycle. Stone-import optimization — stone imported instead of sourced from antimony screening (see [§ Stone-import optimization](#stone-import-optimization)). Dedicated muddy-sludge recipe eliminates clean-nexelit overproduction. Slacked-lime recycled back to lime via evaporator.

### Design approach (218 buildings)

213 solver-validated buildings + 5 manual mining fluid chain buildings. Maximizes waste reduction, syngas export, and ore crushing optimization. Uses `--max-import "raw-coal:600"` to force recycling, `--max-import "copper-ore:55"` to force copper crushing, `--max-import "ore-tin:51"` to force grade-2-tin consumption, and ore crushing for iron/copper/tin/lead (see [§ Ore crushing optimization](#ore-crushing-optimization)). Dedicated muddy-sludge recipe (washer) eliminates clean-nexelit overproduction — see [§ Clean-nexelit handling](#clean-nexelit-handling). Mining fluid chain (acetylene + aromatics) covers all fluid-drill requirements — see [§ Mining fluid accounting](#mining-fluid-accounting).

**Oil refining recipes (design 03/05 patterns):**
1. **pitch-refining** (distilator): 100 pitch + 100 steam → 10 coke + 10 hydrogen + 20 light-oil + 20 naphthalene-oil + 30 anthracene-oil — eliminates pitch waste
2. **tar-refining-tops** (tar-processing-unit): 100 middle-oil + 100 steam → 50 light-oil + 50 carbolic-oil + 100 naphthalene-oil — eliminates middle-oil waste
3. **light-oil-aromatics** (distilator): 50 light-oil → 50 aromatics + 25 gasoline — converts light-oil to aromatics + gasoline fuel
4. **coal-gas-from-coke** (distilator): uses excess coke from pitch-refining to produce more coal-gas + tar
5. **syngas** scale-up (1→3 gasifiers): converts coal-gas to syngas fuel export
6. **anthracene-gasoline-cracking** (distilator): excess anthracene-oil → coke + gasoline
7. `naphthalene-oil-creosote`, `carbolic-oil-creosote` — included in recipe list but LP does not use them

**Recycling loops:**
7. **water-barrel** (barrel-machine-mk01): 1 barrel + 50 water → 1 water-barrel — closes barrel cycle (animal recipes consume water-barrel, produce barrel back)
8. **grade-2-crush-tin** (jaw-crusher): 1 grade-2-tin → 1 grade-1-tin + 1 stone — recycles grade-2-tin (screening byproduct) back into the tin chain. Forced via ore-tin import cap.
9. **muddy-sludge** (washer): 10 soil + 100 water → 100 muddy-sludge — dedicated source for Moss-2. `clean-nexelit:muddy-sludge:exclude` + `borax-washing:muddy-sludge:exclude` constraints prevent LP from scaling clean-nexelit or borax-washing for muddy-sludge. Clean-nexelit now runs at exact demand (0.58/60s).
10. **stopper-2** (1 rubber → 2 stopper) replaces stopper (5 coal + 2 latex → 4 stopper) — taps existing rubber chain, cleaner routing.

| Recipe | Notes |
|---|---|
| distilled-raw-coal: **2 bldg** (1.15) | raw-coal cap forces recycling |
| syngas: **3 bldg** (2.16) | coal-gas → syngas export |
| pitch-refining: **1 bldg** (0.83) | pitch → coke + hydrogen + oils |
| tar-refining-tops: **1 bldg** (0.17) | middle-oil → light-oil |
| light-oil-aromatics: **1 bldg** (0.26) | light-oil → aromatics |
| coal-gas-from-coke: **1 bldg** (0.49) | coke → coal-gas + tar feedback |
| anthracene-gasoline-cracking: **1 bldg** (0.02) | anthracene-oil → coke + gasoline |
| hydrogen: **1 bldg** (0.58) | −42% (pitch-refining provides hydrogen) |
| water-barrel: **1 bldg** (0.13) | barrel loop — closes water-barrel/barrel cycle |
| grade-2-crush-tin: **1 bldg** (0.28) | recycles grade-2-tin → grade-1-tin |
| muddy-sludge: **1 bldg** (0.75) | dedicated muddy-sludge — eliminates clean-nexelit overproduction |

### Steam accounting note

The solver reports steam as both import (60.70/s) and byproduct (58.33/s). Polybutadiene produces 58.33/s steam internally but the solver doesn't net it against consuming recipes. Actual net steam import is ~2.37/s.

### Self-power analysis

Available byproduct fuels (oil-boiler-mk01, effectivity 2):

| Fuel | /s | fuel_value (MJ) | MW electrical |
|---|---:|---:|---:|
| syngas | 47.22 | 0.40 | 18.89 |
| gasoline | 3.42 | 1.20 | 4.10 |
| naphthalene-oil | 6.86 | 0.30 | 2.06 |
| carbolic-oil | 1.78 | 0.35 | 0.62 |
| coal 1.08 (solid, boiler eff 1) | 1.08 | 4.00 | 2.16 |
| **Total** | | | **27.83** |

Self-power covers **28 MW / 107 MW (26%)**. Remaining 79 MW must be imported.

**Recommendation:** Syngas is more valuable as a bus fuel export (47/s at 0.4 MJ = 18.89 MW worth) than burned locally. Without syngas self-power: ~9 MW from minor fuels.

## Flow diagram

```
                         ┌─────────────────────────────────────┐
                         │     LOGISTIC-SCIENCE-PACK (0.1/s)   │
                         │  1x research-center-mk01            │
                         └──┬────────┬────────┬────────┬───────┘
                            │        │        │        │
                   animal-  │  alien- │  solidif│  battery
                   sample   │  sample │  -sarco│  -mk01
                   (0.02/s) │ (0.02/s)│ (0.01) │ (0.03/s)
                            │        │        │        │
        ┌───────────────────┘        │        │        └──────────────────┐
        ▼                            ▼        ▼                          ▼
  ┌───────────┐              ┌──────────┐  ┌──────────┐        ┌──────────────────┐
  │ANIMAL-    │              │ALIEN-    │  │COTTONGUT-│        │BATTERY-MK01      │
  │SAMPLE-01  │              │SAMPLE01  │  │SCIENCE-  │        │0.27x chem-plant  │
  │0.17x      │              │          │  │RED-SEEDS │        │                  │
  │genlab     │              │bio-sample│  │          │        │needs: graphite,  │
  │           │              │ground-   │  │needs:    │        │cyanic-acid, zinc,│
  │needs:     │              │sample    │  │plasmids, │        │melamine, pbsb-   │
  │blood,guts,│              │          │  │fawogae-  │        │alloy, glass,bolts│
  │meat,skin, │              │          │  │substrate,│        └─┬──┬──┬──┬──┬────┘
  │bones,fat, │              │          │  │depoly-org│          │  │  │  │  │
  │brain,     │              │          │  └──────────┘          │  │  │  │  │
  │plasmids   │              └──────────┘                        │  │  │  │  │
  └─────┬─────┘                                                 │  │  │  │  │
        │                                                       │  │  │  │  │
        ▼                                                       │  │  │  │  │
  ┌─────────────────────────────────────────────────────────────┐│  │  │  │  │
  │                    BIO / FARMING (103 bldgs)                ││  │  │  │  │
  │                                                            ││  │  │  │  │
  │  COTTONGUT  11x prandium + 1x rc + 1x slaughterhouse       ││  │  │  │  │
  │  VRAUKS    10x paddock + 3x rc + 1x slaughterhouse         ││  │  │  │  │
  │  MOONDROP  22x greenhouse + 1x methane-co2                 ││  │  │  │  │
  │  RALESIA   16x plantation + 2x botanical-nursery           ││  │  │  │  │
  │  MOSS       7x moss-farm                                   ││  │  │  │  │
  │  SEAWEED    6x seaweed-crop                                ││  │  │  │  │
  │  SAP        9x sap-extractor                               ││  │  │  │  │
  │  WOOD       2x fwf + 1x wpu + 1x nursery                  ││  │  │  │  │
  │  AUOG       2x auog-paddock ──▶ manure ──▶ urea cycle      ││  │  │  │  │
  │  SOIL       5x soil-extractor + 1x limestone + 1x separator││  │  │  │  │
  └────────────────────────────────────────────────────────────┘│  │  │  │  │
                                                                │  │  │  │  │
        ┌───────────────────────────────────────────────────────┘  │  │  │  │
        ▼                                                          │  │  │  │
  ┌──────────────────┐                                             │  │  │  │
  │ UREA CYCLE       │◄── auog manure                              │  │  │  │
  │ (4 bldgs)        │                                             │  │  │  │
  │                  │                                             │  │  │  │
  │ manure ──▶ liquid-manure ──▶ urea ──▶ urea-decomposition      │  │  │  │
  │                                       ├──▶ cyanic-acid ────────┘  │  │  │
  │ muddy-sludge ◄── dedicated recipe     └──▶ ammonia ──▶ melamine──┘  │  │
  │      └──▶ Moss-2  (soil+water, washer)                             │  │
  │ clean-nexelit ◄── washer (exact demand)                            │  │
  └──────────────────┘                                                 │  │
                                                                       │  │
        ┌──────────────────────────────────────────────────────────────┘  │
        ▼                                                                │
  ┌──────────────────────────────────────────────────────────────┐       │
  │ COAL & TAR CHEMISTRY (16 bldgs) — OPTIMIZED                 │       │
  │                                                              │       │
  │ raw-coal ──▶ distilled-raw-coal (2x)                         │       │
  │              ├──▶ coal-gas ──▶ syngas (3x gasifier)          │       │
  │              │                 ├──▶ syngas EXPORT (47/s fuel)│       │
  │              │                 ├──▶ tar (feedback!) ──┐      │       │
  │              │                 └──▶ aromatics-to-plastic     │       │
  │              ├──▶ tar ──┬──▶ tar-distilation ──▶ aromatics   │       │
  │              │          │    ├──▶ carbon-dioxide ──▶ Moss-2  │       │
  │              │          │    └──▶ middle-oil ──▶ tar-refining│       │
  │              │          │         -tops ──▶ light-oil ──┐    │       │
  │              │          └──▶ tar-refining               │    │       │
  │              │               ├──▶ pitch ──▶ pitch-refin-│    │       │
  │              │               │    ing ──▶ coke (→graphi)│    │       │
  │              │               │         ──▶ hydrogen ──┼──▶ ralesia  │
  │              │               │         ──▶ light-oil ─┘    │       │
  │              │               │         ──▶ anthracene ──▶ C-black  │
  │              │               │         ──▶ anthrac-gas-crack│       │
  │              │               └──▶ creosote ──▶ treated-wood │       │
  │              └──▶ coal (fuel for smelting)                   │       │
  │                                                              │       │
  │ light-oil ──▶ light-oil-aromatics ──▶ aromatics + gasoline  │       │
  │ aromatics ──▶ polybutadiene ──▶ rubber ──▶ lab-inst+stopper │       │
  │ carbon-black + latex ──▶ rubber-01                          │       │
  │ treated-wood + methanal + raw-fiber ──▶ formica ──▶ pcb1    │       │
  └──────────────────────────────────────────────────────────────┘       │
                                                                         │
        ┌────────────────────────────────────────────────────────────────┘
        ▼
  ┌─────────────────────────────────────────────────────────┐
  │ SMELTING & METALS (27 bldgs) — ORE CRUSHING            │
  │                                                         │
  │ iron-ore ──▶ crush (1x jaw) ──▶ smelt (2x furnace)     │
  │   ──▶ iron-stick ──▶ bolts                              │
  │ copper-ore ──▶ screen (1x) ──▶ crush (1x jaw) ──▶      │
  │   smelt (1x furnace) ──▶ cable, pcb, vacuum-tube       │
  │ ore-tin ──▶ screen (1x) ──▶ smelt (1x furnace)         │
  │   ──▶ solder, capacitor, equipment-chassi               │
  │ ore-lead ──▶ screen (1x) ──▶ smelt (1x furnace)        │
  │   ──▶ solder, pbsb-alloy                                │
  │ 1x titanium──▶ polybutadiene                            │
  │ 2x zinc    ──▶ battery-mk01                             │
  │ 4x glass   ──▶ battery, lamp, flask, petri-dish         │
  │                                                         │
  │ ANTIMONY (5 bldgs):                                     │
  │ antimonium-ore ──▶ sb-grade-01 (1x)                     │
  │ ──▶ sb-grade-02 ──▶ 03 ──▶ 04                          │
  │ ──▶ sb-oxide ──▶ pbsb-alloy ──▶ batt                    │
  │ ──▶ fenxsb-alloy ──▶ equipment-chassi                   │
  └─────────────────────────────────────────────────────────┘

  ┌────────────────────────────────────────┐
  │ ELECTRONICS & ASSEMBLY (17 bldgs)      │
  │                                        │
  │ ceramic ──▶ capacitor1, inductor1      │
  │ formica ──▶ pcb1 ──┐                   │
  │ vacuum-tube ───────┤                   │
  │ resistor1 ─────────┼──▶ e-circuit-2    │
  │ capacitor1 ────────┤  └──▶ equip-chassi│
  │ inductor1 ─────────┘     └──▶ lab-inst │
  │                                        │
  │ copper-cable ──▶ small-lamp ──▶ zogna  │
  │ iron-gear+bolts ──▶ small-parts ──▶ lab│
  │ lens (glass) ──▶ lab-instrument        │
  └────────────────────────────────────────┘

  ┌────────────────────────────────────────────┐
  │ MINING FLUID CHAIN (5 bldgs, manual)       │
  │                                            │
  │ coke ──▶ lime (hpf) ──▶ calcium-carbide   │
  │   ◄── limestone        (hpf)              │
  │                          └──▶ acetylene    │
  │                               (gasifier)   │
  │                               └──▶ EXPORT  │
  │ slacked-lime ──▶ evaporator ──▶ lime ──┘   │
  │                  (recycled)                │
  │                                            │
  │ pitch-refining +1 ──▶ extra coke           │
  │ aromatics (extra) ──▶ EXPORT (zinc mining) │
  └────────────────────────────────────────────┘
```

## Recipe tables (218 buildings)

213 solver-validated + 5 mining fluid chain (simplex, cage-recycled, stone-import, ore crushing, oil refining with pitch-refining + coal-gas-from-coke + anthracene-gasoline-cracking, dedicated muddy-sludge, stopper-2, `--max-import "raw-coal:600"`, `--max-import "copper-ore:55"`, `--max-import "ore-tin:51"`). Self-power potential: 28 MW from all byproduct fuels, or ~9 MW if syngas exported.

### Bio — farms & paddocks (103 buildings)

| Recipe | Factory | Count | Modules |
|---|---|---:|---|
| moondrop-1 | moondrop-greenhouse-mk01 | 22 (21.07) | 16x moondrop |
| moondrop-seeds | botanical-nursery | 1 (0.41) | |
| ralesia-1 | ralesia-plantation-mk01 | 16 (15.82) | 12x ralesia |
| ralesia-seeds | botanical-nursery | 2 (1.39) | |
| caged-cottongut-1 | prandium-lab-mk01 | 11 (10.42) | 20x cottongut-mk01 |
| cottongut-cub-1 | rc-mk01 | 1 (0.97) | 2x cottongut-mk01 |
| vrauks-1 | vrauks-paddock-mk01 | 10 (9.33) | 10x vrauks |
| vrauks-cocoon-1 | rc-mk01 | 3 (2.33) | 2x vrauks |
| Moss-2 | moss-farm-mk01 | 7 (6.07) | 15x moss |
| seaweed-1 | seaweed-crop-mk01 | 6 (5.22) | 10x seaweed |
| sap-01 | sap-extractor-mk01 | 9 (8.94) | 2x sap-tree |
| log2 | fwf-mk01 | 2 (1.01) | 10x tree-mk01 |
| log-wood-fast | wpu-mk01 | 1 (0.02) | |
| wood-seedling | botanical-nursery | 1 (0.34) | |
| wood-seeds | automated-factory-mk01 | 1 (0.37) | |
| auog-pooping-1 | auog-paddock-mk01 | 2 (1.93) | 4x auog |
| methane-co2 | moondrop-greenhouse-mk01 | 1 (0.09) | 16x moondrop |
| soil | soil-extractor-mk01 | 5 (4.13) | |
| extract-limestone-01 | soil-extractor-mk01 | 1 (0.44) | |
| soil-separation-2 | solid-separator | 1 (0.83) | |

### Bio — processing (18 buildings)

Cage is recycled natively: full-render-vrauks produces 1 cage → caged-vrauks consumes 1 cage. Net zero, no cage recipe needed.

| Recipe | Factory | Count | Modules |
|---|---|---:|---|
| full-render-cottongut | slaughterhouse-mk01 | 2 (1.67) | |
| full-render-vrauks | slaughterhouse-mk01 | 1 (0.58) | |
| caged-vrauks | automated-factory-mk01 | 1 (0.03) | |
| bone-to-bonemeal-2 | fbreactor-mk01 | 1 (0.04) | |
| cellulose-00 | hpf | 1 (0.08) | |
| depolymerized-organics | reformer-mk01 | 1 (0.01) | |
| fawogae-substrate | automated-factory-mk01 | 1 (0.01) | |
| fiber-01 | wpu-mk01 | 1 (0.10) | |
| agar | hpf | 1 (0.46) | |
| sodium-alginate | hpf | 1 (0.58) | |
| creamy-latex | washer | 1 (0.93) | |
| latex | hpf | 2 (1.17) | |
| latex-slab | distilator | 1 (0.58) | |
| rubber-01 | heavy-oil-refinery-mk01 | 1 (0.39) | |
| carbon-black | reformer-mk01 | 1 (0.10) | |
| polybutadiene | cracker-mk01 | 1 (0.10) | |

### Bio — science ingredients (13 buildings)

| Recipe | Factory | Count | Modules |
|---|---|---:|---|
| animal-sample-01 | genlab-mk01 | 1 (0.17) | |
| alien-sample01 | automated-factory-mk01 | 1 (0.04) | |
| bio-sample01 | automated-factory-mk01 | 1 (0.03) | |
| ground-sample01 | automated-factory-mk01 | 1 (0.03) | |
| cottongut-science-red-seeds | incubator-mk01 | 1 (0.04) | |
| plasmids | biofactory-mk01 | 1 (0.16) | |
| petri-dish-bacteria | micro-mine-mk01 | 1 (0.67) | |
| petri-dish | automated-factory-mk01 | 1 (0.46) | |
| empty-petri-dish | glassworks-mk01 | 1 (0.28) | |
| zogna-bacteria | incubator-mk01 | 1 (0.15) | |
| flask | glassworks-mk01 | 1 (0.03) | |
| stopper-2 | automated-factory-mk01 | 1 (0.02) | |
| lab-instrument | automated-factory-mk01 | 1 (0.07) | |

### Urea cycle (4 buildings)

| Recipe | Factory | Count | Modules |
|---|---|---:|---|
| urea-from-liquid-manure | bio-reactor-mk01 | 1 (0.16) | |
| liquid-manure | bio-reactor-mk01 | 1 (0.17) | |
| urea-decomposition | distilator | 1 (0.23) | |
| melamine | fbreactor-mk01 | 1 (0.03) | |

### Coal & tar chemistry (17 buildings)

| Recipe | Factory | Count | Modules |
|---|---|---:|---|
| distilled-raw-coal | distilator | 2 (1.15) | |
| syngas | gasifier | 3 (2.16) | |
| tar-distilation | distilator | 1 (0.20) | |
| tar-refining | tar-processing-unit | 1 (0.59) | |
| **pitch-refining** | distilator | 1 (0.83) | |
| **tar-refining-tops** | tar-processing-unit | 1 (0.17) | |
| **light-oil-aromatics** | distilator | 1 (0.26) | |
| **coal-gas-from-coke** | distilator | 1 (0.49) | |
| **anthracene-gasoline-cracking** | distilator | 1 (0.02) | |
| graphite | hpf | 1 (0.13) | |
| aromatics-to-plastic | biofactory-mk01 | 1 (0.05) | |
| treated-wood | tar-processing-unit | 1 (0.01) | |
| formica | pulp-mill-mk01 | 1 (0.04) | |
| methanal | hpf | 1 (0.02) | |

Removed vs baseline: `coke-coal` (pitch-refining provides coke). Added: `coal-gas-from-coke` (excess coke → coal-gas + tar feedback), `anthracene-gasoline-cracking` (excess anthracene-oil → coke + gasoline).

### Smelting, metals & muddy-sludge (29 buildings)

Cage recycling slashes metal demand: iron-plate −57%, lead −71%, tin −66%, titanium −83%. Ore crushing replaces direct smelting for iron, copper, tin, lead — 25–67% ore savings (see [§ Ore crushing optimization](#ore-crushing-optimization)). Grade-2-tin crusher recycles screening byproduct back into the tin chain (ore-tin import cap at 51/60s forces the LP to use it). Stone-import optimization reduces antimony screening from 6→1 buildings (see [§ Stone-import optimization](#stone-import-optimization)). Dedicated muddy-sludge recipe eliminates clean-nexelit overproduction (see [§ Clean-nexelit handling](#clean-nexelit-handling)).

| Recipe | Factory | Count | Modules |
|---|---|---:|---|
| grade-1-iron-crush | jaw-crusher | 1 (0.41) | |
| low-grade-smelting-iron | stone-furnace | 2 (1.22) | |
| grade-2-copper | automated-screener-mk01 | 1 (0.47) | |
| grade-1-copper-crush | jaw-crusher | 1 (0.23) | |
| copper-plate-4 | stone-furnace | 1 (0.16) | |
| grade-1-tin | automated-screener-mk01 | 1 (0.42) | |
| grade-2-crush-tin | jaw-crusher | 1 (0.28) | |
| tin-plate-2 | stone-furnace | 1 (0.58) | |
| grade-1-lead | automated-screener-mk01 | 1 (0.21) | |
| lead-plate-2 | stone-furnace | 1 (0.71) | |
| zinc-plate-1 | stone-furnace | 2 (1.21) | |
| titanium-plate-1 | stone-furnace | 1 (0.73) | |
| nexelit-plate-2 | stone-furnace | 1 (0.06) | |
| clean-nexelit | washer | 1 (0.03) | |
| muddy-sludge | washer | 1 (0.75) | |
| glass-1 | glassworks-mk01 | 4 (3.75) | |
| molten-glass | glassworks-mk01 | 1 (0.06) | |
| sb-grade-01 | automated-screener-mk01 | 1 (0.22) | |
| sb-grade-02 | jaw-crusher | 1 (0.22) | |
| sb-grade-03 | automated-screener-mk01 | 1 (0.56) | |
| sb-grade-04 | secondary-crusher-mk01 | 1 (0.05) | |
| sb-oxide-01 | bof-mk01 | 1 (0.32) | |
| pbsb-alloy | smelter-mk01 | 1 (0.27) | |
| fenxsb-alloy-2 | smelter-mk01 | 1 (0.10) | |

### Battery & chemistry (11 buildings)

| Recipe | Factory | Count | Modules |
|---|---|---:|---|
| battery-mk01 | chemical-plant-mk01 | 1 (0.27) | |
| hydrogen | electrolyzer-mk01 | 1 (0.61) | |
| solder-0 | automated-factory-mk01 | 1 (0.02) | |
| boron-trioxide | hpf | 1 (0.03) | |
| boric-acid | electrolyzer-mk01 | 1 (0.01) | |
| diborane | electrolyzer-mk01 | 1 (0.02) | |
| borax-washing | washer | 1 (0.02) | |
| vacuum | vacuum-pump-mk01 | 1 (0.05) | |
| pressured-air | vacuum-pump-mk01 | 1 (0.01) | |
| pressured-water | vacuum-pump-mk01 | 1 (0.02) | |
| subcritical-water-01 | py-heat-exchanger | 1 (0.42) | |

### Electronics, assembly & barreling (18 buildings)

| Recipe | Factory | Count | Modules |
|---|---|---:|---|
| electronic-circuit-2 | chipshooter-mk01 | 1 (0.01) | |
| capacitor1 | electronics-factory-mk01 | 1 (0.02) | |
| inductor1 | electronics-factory-mk01 | 1 (0.01) | |
| resistor1 | electronics-factory-mk01 | 1 (0.02) | |
| pcb1 | pcb-factory-mk01 | 1 (0.01) | |
| vacuum-tube | electronics-factory-mk01 | 1 (0.02) | |
| ceramic | hpf | 1 (0.01) | |
| clay | clay-pit-mk01 | 1 (0.01) | |
| copper-cable | automated-factory-mk01 | 1 (0.05) | |
| small-lamp | automated-factory-mk01 | 1 (0.01) | |
| small-parts-01 | automated-factory-mk01 | 1 (0.00) | |
| iron-gear-wheel | automated-factory-mk01 | 1 (0.01) | |
| iron-stick | automated-factory-mk01 | 1 (0.04) | |
| bolts | automated-factory-mk01 | 1 (0.02) | |
| equipment-chassi | automated-factory-mk01 | 1 (0.07) | |
| lens | glassworks-mk01 | 1 (0.03) | |
| water-barrel | barrel-machine-mk01 | 1 (0.13) | |
| logistic-science-pack | research-center-mk01 | 1 (0.75) | |

### Mining fluid chain (5 buildings, manual)

Not in solver (solver supports single target only). Computed manually from Step 1b ore import rates and ÷10 mining fluid formula (see [§ Mining fluid accounting](#mining-fluid-accounting)).

| Recipe | Factory | Count | Purpose |
|---|---|---:|---|
| acetylene | gasifier | 1 (0.47) | 352.7/60s acetylene for titanium + lead mining |
| calcium-carbide | hpf | 1 (0.24) | feeds acetylene gasifier |
| lime | hpf | 1 (0.05) | feeds calcium-carbide (reduced by recycling) |
| slacked-lime-void | evaporator | 1 (0.05) | recycles slacked-lime → lime |
| pitch-refining (scale-up) | distilator | +1 (0.83→1.10) | extra coke for acetylene chain |

Extra aromatics for zinc mining (194/60s) absorbed by existing oil chain capacity — extra tar from pitch-refining + tar-refining scaling fits within existing distilled-raw-coal (2 bldg) and syngas (3 bldg) buildings.

## Intermediate flows

All rates /s. Cage-recycled baseline.

### High-volume flows (>= 1/s)

| Item | /s | Produced by | Consumed by |
|---|---:|---|---|
| syngas | 50.40 | syngas gasifier | aromatics-to-plastic (3.18) |
| tar | 40.42 | syngas (21.60) + distilled-raw-coal (17.18) + coal-gas-from-coke (1.64) | tar-distilation (28.59), tar-refining (11.83) |
| coal-gas | 36.00 | distilled-raw-coal (34.36) + coal-gas-from-coke (1.64) | syngas (36.00) |
| hydrogen | 13.30 | electrolyzer (11.65) + pitch-refining (1.66) | diborane (0.65), ralesia-1 (12.66) |
| creamy-latex | 11.67 | washer | latex-slab |
| formic-acid | 11.67 | full-render-vrauks | latex-slab |
| pitch | 16.57 | tar-refining | pitch-refining (16.57) |
| aromatics | 13.25 | tar-distilation (8.17) + light-oil-aromatics (5.09) | aromatics-to-plastic (1.59), polybutadiene (11.67) |
| anthracene-oil | 13.84 | tar-refining (8.88) + pitch-refining (4.97) | carbon-black (11.67), anthracene-gasoline-cracking (2.18) |
| carbon-dioxide | 8.25 | tar-distilation (8.17), melamine (0.08) | Moss-2 (7.59), methane-co2 (0.58) |
| muddy-sludge | 8.82 | muddy-sludge recipe (7.45), clean-nexelit (0.97), melamine (0.13), borax (0.26) | Moss-2 |
| soil | 8.26 | soil (extractor) | soil-separation-2 (5.56), ralesia-1 (1.90), muddy-sludge (0.75) |
| molten-glass | 7.50 | glass-1 | empty-petri-dish, flask, lens, molten-glass |
| oxygen | 5.82 | electrolyzer | sb-oxide-01 (1.59) |
| vacuum | 6.08 | pump | carbon-black (5.83), pcb1, vacuum-tube |
| polybutadiene | 5.83 | cracker | rubber-01 |
| pressured-water | 5.56 | pump | subcritical-water-01 |
| naphthalene-oil | 6.86 | pitch-refining (3.31) + tar-refining-tops (3.55) | *none (void)* |
| light-oil | 5.09 | pitch-refining (3.31) + tar-refining-tops (1.78) | light-oil-aromatics (5.09) |
| middle-oil | 3.55 | tar-refining | tar-refining-tops (3.55) |
| sb-grade-02 | 0.56 | sb-grade-01 (0.13) + sb-grade-02 (0.43) | sb-grade-03 |
| sb-grade-01 | 0.22 | sb-grade-01 | sb-grade-02 |
| ralesia-seeds | 2.02 | botanical-nursery | bio-sample01, caged-cottongut-1, cottongut-cub-1, ralesia-1 |
| blood | 2.00 | full-render-cottongut | animal-sample-01 |
| creosote | 2.84 | tar-refining | treated-wood (0.39) |
| boric-acid | 1.94 | electrolyzer | boron-trioxide |
| coke | 1.87 | pitch-refining (1.66) + anthracene-gasoline-cracking (0.22) | graphite, resistor1, boron-trioxide, **coal-gas-from-coke (1.64)** |
| coal | 1.72 | distilled-raw-coal | smelting fuel (furnaces) |
| ash | 1.44 | smelting + syngas + coal-gas-from-coke | *none (void)* |
| pressured-air | 1.47 | pump | zogna-bacteria |
| subcritical-water | 1.39 | heat-exchanger | depolymerized-organics |
| ralesia | 1.27 | ralesia-1 | ralesia-seeds |
| moss | 1.21 | Moss-2 | vrauks-cocoon, auog, vrauks-1, etc. |
| seaweed | 1.04 | seaweed-1 | sodium-alginate, agar |

### Ore crushing intermediates

| Item | /s | Produced by | Consumed by |
|---|---:|---|---|
| processed-iron-ore | 0.61 | grade-1-iron-crush | low-grade-smelting-iron |
| grade-2-copper | 0.39 | grade-2-copper screener (0.31) + grade-1-copper-crush (0.08) | copper-plate-4 |
| grade-1-copper | 0.16 | grade-2-copper screener | grade-1-copper-crush |
| grade-1-tin | 0.17 | grade-1-tin screener (0.14) + grade-2-crush-tin (0.03) | tin-plate-2 |
| grade-2-tin | 0.07 | grade-1-tin screener | grade-2-crush-tin (fully consumed) |
| grade-1-lead | 0.07 | grade-1-lead screener | lead-plate-2 |

### Barrel loop

| Item | /s | Produced by | Consumed by |
|---|---:|---|---|
| water-barrel | 0.80 | water-barrel (barrel-machine-mk01) | vrauks-1, vrauks-cocoon-1, auog-pooping-1, caged-cottongut-1, cottongut-cub-1 |
| barrel | 0.80 | animal recipes (5 sources) | water-barrel recipe |

### Key changes from cage recycling

| Item | Old /s | New /s | Change |
|---|---:|---:|---|
| iron-stick | 1.03 | **0.15** | −85% (no longer feeds cage) |
| iron-plate (internal) | 6.41 bldg | **2.03 bldg** | −68% (no cage demand) |
| lead-plate (internal) | 6.44 bldg | **1.77 bldg** | −72% (no solder→cage) |
| tin-plate (internal) | 5.23 bldg | **1.73 bldg** | −67% (no solder→cage) |
| titanium-plate (internal) | 5.10 bldg | **0.73 bldg** | −86% (no cage demand) |
| cage | 0.23 bldg (recipe) | **0 (net-zero loop)** | cage recipe eliminated |

## Imports

All raw mined resources — no processed items. Mining fluid chain adds ~85/60s raw-coal and ~6/60s limestone.

| Resource | /s | Notes |
|---|---:|---|
| water | 719.80 | |
| steam | 60.70 (gross; net ~2.37 after polybutadiene steam) | |
| raw-coal | 7.14 | +1.41/s for mining fluid chain |
| ore-quartz | 4.50 | |
| stone | 1.57 | |
| native-flora | 1.57 | |
| iron-ore | 1.02 | |
| ore-zinc | 0.81 | |
| copper-ore | 0.78 | |
| ore-tin | 0.69 | |
| ore-titanium | 0.58 | |
| antimonium-ore | 0.43 | |
| ore-lead | 0.35 | |
| nexelit-ore | 0.03 | (exact demand, no overproduction) |
| raw-borax | 0.03 | |
| limestone | 0.09 | for mining fluid lime chain |

## Exports

| Item | /s | Notes |
|---|---:|---|
| logistic-science-pack | 0.10 | |
| syngas | 47.22 | Bus fuel (0.4 MJ), from coal-gas→syngas conversion |
| acetylene | 5.88 | Mining fluid for titanium + lead drilling (see [§ Mining fluid accounting](#mining-fluid-accounting)) |
| aromatics | 3.23 | Mining fluid for zinc drilling (see [§ Mining fluid accounting](#mining-fluid-accounting)) |

## Byproducts (voidable)

| Byproduct | /s | Notes |
|---|---:|---|
| steam | 58.33 | from polybutadiene (→ cooling-tower) |
| flue-gas | 40.84 | from smelting; no consumer; retrofit after filtration tech |
| naphthalene-oil | 6.86 | from pitch-refining + tar-refining-tops |
| oxygen | 4.23 | from electrolysis |
| sand | 3.61 | from soil-separation-2 |
| gasoline | 3.42 | from light-oil-aromatics + anthracene-gasoline-cracking (fuel) |
| creosote | 2.45 | from tar-refining |
| ash | 1.44 | from smelting + syngas + coal-gas-from-coke |
| carbolic-oil | 1.78 | from tar-refining-tops |
| muddy-sludge | 1.23 | phantom from clean-nexelit + borax-washing (excluded from solver) |
| blood | 1.17 | excess from full-render-cottongut |
| coal | 1.08 | excess (fuel) |
| coarse | 0.83 | from soil-separation-2; process with 1 classifier (see [§ Coarse processing](#coarse-processing)) |
| ammonia | 0.81 | from urea decomposition |
| slacked-lime | 0 | fully recycled via evaporator → lime (see [§ Mining fluid accounting](#mining-fluid-accounting)) |
| gravel | 0.19 | phantom from sb-grade-03 + slacked-lime-void (excluded from solver) |
| iron-oxide | 0.13 | phantom from sb-grade-01 (excluded from solver) |

**Phantom byproducts from ore crushing:** stone ~0.53/s (from grade-1-iron-crush + grade-1-copper-crush + grade-2-crush-tin, excluded from solver but physically produced in-game). Supplements stone import or buffers.

Major waste streams eliminated: coal-gas (100% consumed), pitch (100% consumed), sb-grade-01/02 (100% consumed via stone-import optimization), grade-2-tin (100% consumed via grade-2-crush-tin), clean-nexelit (100% consumed — dedicated muddy-sludge recipe eliminates overproduction, see [§ Clean-nexelit handling](#clean-nexelit-handling)), slacked-lime (100% recycled back to lime). Remaining byproducts are either fuel-capable (gasoline, coal, creosote) or must be voided.

## Key design decisions

- **Dedicated muddy-sludge recipe eliminates clean-nexelit overproduction.** Muddy-sludge recipe (10 soil + 100 water → 100 muddy-sludge, washer) provides bulk muddy-sludge for Moss-2 demand. `clean-nexelit:muddy-sludge:exclude` + `borax-washing:muddy-sludge:exclude` constraints prevent LP from scaling those recipes for muddy-sludge. Clean-nexelit now runs at exact demand (0.58/60s = nexelit-plate-2 demand). See [§ Clean-nexelit handling](#clean-nexelit-handling).
- **Cage recycling is net-zero.** The vrauks loop (caged-vrauks → vrauks-1 → vrauks-cocoon-1 → full-render-vrauks → cage output → caged-vrauks) recycles cage at 0.058/s with no loss. No cage recipe needed, no `full-render-vrauks:cage:exclude` constraint needed. Saves 18 buildings in smelting (iron −57%, lead −71%, tin −66%, titanium −83%) because cage consumed iron-stick, titanium-plate, and solder.
- **Bio modules are the dominant factor.** Without modules: 1000+ buildings. With mk01 modules: 206. The 5-21x speed multiplier on farms dwarfs the mk01-mk04 building tier difference.
- **Growth cycles self-sustaining.** Cottongut, wood, ralesia, moondrop seed loops are all net-positive. No seed imports needed.
- **Nine solver constraints required:**
  - `melamine:carbon-dioxide:exclude` — prevents melamine CO2 from feeding back into the urea cycle
  - `sb-grade-01:stone:exclude` — prevents LP from using antimony screening as a stone source (see [§ Stone-import optimization](#stone-import-optimization))
  - `sb-grade-02:stone:exclude` — same, for the crusher recipe
  - `sb-grade-03:gravel:exclude` — prevents LP from using sb-grade-03 as a gravel source
  - `grade-1-iron-crush:stone:exclude` — prevents LP from scaling iron crushing as a stone source (see [§ Ore crushing optimization](#ore-crushing-optimization))
  - `grade-1-copper-crush:stone:exclude` — same, for copper crushing
  - `grade-2-crush-tin:stone:exclude` — same, for tin crushing
  - `clean-nexelit:muddy-sludge:exclude` — prevents LP from overscaling clean-nexelit for muddy-sludge (see [§ Clean-nexelit handling](#clean-nexelit-handling))
  - `borax-washing:muddy-sludge:exclude` — prevents LP from using borax-washing as muddy-sludge source
- **Three max-import caps:**
  - `--max-import "raw-coal:600"` — forces internal coal-gas recycling
  - `--max-import "copper-ore:55"` — forces copper crushing (screening-only needs 58.71/60s, exceeding cap)
  - `--max-import "ore-tin:51"` — forces grade-2-crush-tin, consuming all grade-2-tin (41.53/60s under cap vs 51.92/60s screening-only)
- **Water-barrel produced internally.** Barrel-machine-mk01 runs water-barrel recipe (1 barrel + 50 water → 1 water-barrel). Barrel is net-zero (animal recipes produce barrel, water-barrel recipe consumes it), same loop structure as cage. 1 building at 0.13 utilization.
- **Clean-nexelit exactly matched to demand.** Dedicated muddy-sludge recipe + two exclude constraints eliminate overproduction. Clean-nexelit washer runs at 0.03 utilization, producing exactly 0.58/60s = nexelit-plate-2 demand. No excess nexelit-plate. See [§ Clean-nexelit handling](#clean-nexelit-handling).
- **Stopper-2 (rubber-based) replaces stopper (coal+latex).** stopper-2 (1 rubber → 2 stopper) taps the existing rubber chain. Rubber demand increases from 5.83/60s (lab-instrument only) to 7.00/60s (lab-instrument 5.83 + stopper-2 1.17). Cleaner routing than coal+latex stopper.
- **Mining fluid production covers all fluid-drill requirements.** Acetylene chain (3 buildings: gasifier + 2 hpf) produces 352.7/60s acetylene for titanium + lead mining. Extra aromatics (194/60s) for zinc mining absorbed by oil chain capacity scaling. Slacked-lime recycled back to lime (1 evaporator). See [§ Mining fluid accounting](#mining-fluid-accounting).
- **Ore crushing replaces direct smelting for iron, copper, tin, lead.** Screening → crushing → smelting gives 25–67% ore savings over direct smelting at +1 building (26→27). Stone byproduct excluded from solver to prevent LP stone-source exploitation. See [§ Ore crushing optimization](#ore-crushing-optimization).
- **Stone-import optimization eliminates sb-grade waste.** The LP was running 5.25 screeners for stone demand (Moss-2 + sodium-alginate), not antimony demand. Excluding stone/gravel from antimony recipe products forces stone import (1.64/s with ore crushing) and drops screening to 0.22x — the exact rate needed for sb-grade-04 production. All sb-grade-01/02 consumed internally. See [§ Stone-import optimization](#stone-import-optimization).
- **Pitch-refining replaces coke-coal.** Pitch-refining (design 03/05 pattern) converts pitch waste into coke + hydrogen + light-oil + anthracene-oil. The hydrogen from pitch-refining reduces the electrolyzer from 100% to 61% utilization.
- **coal-gas-from-coke completes the coke loop.** Excess coke from pitch-refining feeds coal-gas-from-coke (distilator), producing additional coal-gas + tar. This recipe was previously unused by the LP but activates with cage recycling because the reduced coke demand creates an excess.
- **Syngas conversion captures coal-gas value.** Coal-gas routed through syngas recipe (50 coal-gas + 100 water → 70 syngas + 30 tar + 1 ash). The syngas (47/s) exports as bus fuel (0.4 MJ/unit). Tar feedback reduces distilled-raw-coal to 2 buildings.
- **Raw-coal 67% reduction via `--max-import "raw-coal:600"`.** Without the cap, the LP wastes coal-gas rather than processing it. The raw-coal cap forces recycling (5.73/s raw-coal base + 1.41/s mining fluid chain = 7.14/s total).
- **Self-power at 26% from byproducts.** ~28 MW from byproduct fuels. Remaining ~79 MW imported.
- **Iron-oxide-smelting is incompatible with oil refining in the LP.** When both are present without stone-import, the LP scales sb-grade-01 +45% to source iron-oxide.
- **Cooling-water (cooling-tower-mk01) for steam recovery.** polybutadiene produces 58.33/s excess steam. Route through cooling-water (400 steam → 400 water@100°C, 1 tower) to recover ~58/s water. Not in solver — the LP abuses it.
- **coarse-classification handled manually.** Adding coarse-classification to the solver causes LP infeasibility, but 1 classifier at 4% utilization handles 0.83/s coarse outside the solver (see [§ Coarse processing](#coarse-processing)).
- **Flue-gas: no consumer at current tech.** fluegas-filtration and fluegas-to-syngas require `filtration` tech, which costs logistic-science-pack — bootstrap problem. Initial build must vent; retrofit after research.

## Solver command (213 buildings)

Oil refining variant with pitch-refining + tar-refining-tops + light-oil-aromatics + coal-gas-from-coke, raw-coal cap, copper-ore cap, ore-tin cap, and ore crushing for iron/copper/tin/lead. Cage-recycled (no cage recipe, no cage exclude constraint). Stone-import (sb-grade stone/gravel excluded). Ore crushing (stone excluded from all crushing recipes). Water-barrel produced internally (barrel-machine-mk01). Dedicated muddy-sludge recipe (clean-nexelit + borax-washing muddy-sludge excluded). Stopper-2 (rubber-based).

```bash
npx tsx src/cli.ts solve \
  --recipes "logistic-science-pack,battery-mk01,animal-sample-01,alien-sample01,cottongut-science-red-seeds,pbsb-alloy,sb-oxide-01,sb-grade-01,sb-grade-02,sb-grade-03,sb-grade-04,melamine,urea-decomposition,graphite,bolts,iron-stick,glass-1,molten-glass,zinc-plate-1,aromatics-to-plastic,syngas,distilled-raw-coal,tar-distilation,hydrogen,ground-sample01,rich-clay,soil,electronic-circuit-2,capacitor1,inductor1,resistor1,pcb1,vacuum-tube,solder-0,ceramic,clay,formica,treated-wood,fiber-01,methanal,vacuum,pressured-air,plasmids,flask,stopper-2,lab-instrument,equipment-chassi,fenxsb-alloy-2,lens,small-parts-01,iron-gear-wheel,copper-cable,small-lamp,petri-dish-bacteria,petri-dish,empty-petri-dish,agar,zogna-bacteria,rubber-01,carbon-black,polybutadiene,latex,latex-slab,sodium-alginate,creamy-latex,boron-trioxide,boric-acid,diborane,borax-washing,iron-plate,copper-plate,titanium-plate-1,steel-plate,nexelit-plate-2,clean-nexelit,seaweed-1,sap-01,tar-refining,bio-sample01,bone-to-bonemeal-2,full-render-cottongut,full-render-vrauks,caged-vrauks,vrauks-1,vrauks-cocoon-1,fawogae-substrate,cellulose-00,depolymerized-organics,fawogae-1,fawogae-spore,pressured-water,extract-limestone-01,soil-separation-2,subcritical-water-01,Moss-2,methane-co2,liquid-manure,auog-pooping-1,urea-from-liquid-manure,caged-cottongut-1,cottongut-cub-1,log-wood-fast,log2,wood-seedling,wood-seeds,ralesia-1,ralesia-seeds,moondrop-1,moondrop-seeds,pitch-refining,tar-refining-tops,light-oil-aromatics,naphthalene-oil-creosote,carbolic-oil-creosote,anthracene-gasoline-cracking,coal-gas-from-coke,tin-plate-1,lead-plate-1,grade-1-iron-crush,low-grade-smelting-iron,grade-2-copper,grade-1-copper-crush,copper-plate-4,grade-1-tin,grade-2-crush-tin,tin-plate-2,grade-1-lead,lead-plate-2,water-barrel,muddy-sludge" \
  --constraint "melamine:carbon-dioxide:exclude" \
  --constraint "sb-grade-01:stone:exclude" \
  --constraint "sb-grade-02:stone:exclude" \
  --constraint "sb-grade-03:gravel:exclude" \
  --constraint "grade-1-iron-crush:stone:exclude" \
  --constraint "grade-1-copper-crush:stone:exclude" \
  --constraint "grade-2-crush-tin:stone:exclude" \
  --constraint "clean-nexelit:muddy-sludge:exclude" \
  --constraint "borax-washing:muddy-sludge:exclude" \
  --max-import "raw-coal:600" \
  --max-import "copper-ore:55" \
  --max-import "ore-tin:51" \
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
  --factory "bolts:automated-factory-mk01" \
  --factory "iron-stick:automated-factory-mk01" \
  --factory "glass-1:glassworks-mk01" \
  --factory "molten-glass:glassworks-mk01" \
  --factory "zinc-plate-1:stone-furnace" \
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
  --factory "stopper-2:automated-factory-mk01" \
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
  --factory "pitch-refining:distilator" \
  --factory "tar-refining-tops:tar-processing-unit" \
  --factory "light-oil-aromatics:distilator" \
  --factory "naphthalene-oil-creosote:tar-processing-unit" \
  --factory "carbolic-oil-creosote:tar-processing-unit" \
  --factory "anthracene-gasoline-cracking:distilator" \
  --factory "coal-gas-from-coke:distilator" \
  --factory "tin-plate-1:stone-furnace" \
  --factory "lead-plate-1:stone-furnace" \
  --factory "grade-1-iron-crush:jaw-crusher" \
  --factory "low-grade-smelting-iron:stone-furnace" \
  --factory "grade-2-copper:automated-screener-mk01" \
  --factory "grade-1-copper-crush:jaw-crusher" \
  --factory "copper-plate-4:stone-furnace" \
  --factory "grade-1-tin:automated-screener-mk01" \
  --factory "grade-2-crush-tin:jaw-crusher" \
  --factory "tin-plate-2:stone-furnace" \
  --factory "grade-1-lead:automated-screener-mk01" \
  --factory "lead-plate-2:stone-furnace" \
  --factory "water-barrel:barrel-machine-mk01" \
  --factory "muddy-sludge:washer" \
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

Additional recipes available in the solver but not used by the LP (included for future exploration):
- `coke-coal` — removed (pitch-refining provides coke)
- `naphthalene-oil-creosote` — LP prefers exporting naphthalene-oil (could burn for 0.30 MJ/unit)
- `carbolic-oil-creosote` — LP prefers exporting carbolic-oil (could burn for 0.35 MJ/unit)
- `iron-plate`, `copper-plate`, `tin-plate-1`, `lead-plate-1` — replaced by ore crushing paths (LP sets count to 0)

Recipes now used by LP (previously unused):
- `anthracene-gasoline-cracking` — LP now uses it (1 bldg, 0.02 util) to convert excess anthracene-oil to coke + gasoline

## Irreducible waste

These byproducts have no consumers at current tech level — voiding is the only option:

| Byproduct | /s | Why irreducible |
|---|---:|---|
| flue-gas | 40.84 | No consumer at current tech; `filtration` tech (needs logistic-science-pack) unlocks fluegas-filtration and fluegas-to-syngas — retrofit after research |
| naphthalene-oil | 6.86 | From pitch-refining + tar-refining-tops; could burn for 0.30 MJ/unit |
| oxygen | 4.23 | Excess from electrolysis; only consumer is sb-oxide-01 (1.59/s) |
| sand | 3.61 | From soil-separation-2; no useful consumer at scale |
| gasoline | 3.42 | From light-oil-aromatics + anthracene-gasoline-cracking; fuel (1.20 MJ/unit) |
| creosote | 2.45 | From tar-refining; only 0.39/s consumed by treated-wood |
| carbolic-oil | 1.78 | From tar-refining-tops; could burn for 0.35 MJ/unit |
| ash | 1.44 | From smelting + syngas + coal-gas-from-coke |
| muddy-sludge | 1.23 | Phantom from excluded constraints; buffers or void |
| blood | 1.17 | Excess from full-render-cottongut; only consumer is animal-sample-01 |
| coal | 1.08 | Excess from distilled-raw-coal; fuel (4.00 MJ/unit) |
| coarse | 0.83 | From soil-separation-2; processed by 1 classifier (see [§ Coarse processing](#coarse-processing)) |
| ammonia | 0.81 | From urea-decomposition; no consumer at current tech |
| gravel | 0.19 | Phantom from sb-grade-03 + slacked-lime-void; negligible |
| iron-oxide | 0.13 | Phantom from sb-grade-01; negligible |

**Eliminated:** sb-grade-01/02 overproduction (stone-import optimization), clean-nexelit overproduction (dedicated muddy-sludge recipe), slacked-lime waste (recycled to lime via evaporator).

## Rejected optimizations

Investigated and rejected during design:

| Optimization | Why rejected |
|---|---|
| **Dedicated cage recipe** | Cage loop is net-zero (1 in → 1 out from vrauks rendering). Removing saves 18 smelting buildings |
| ~~**stopper-2** (rubber) vs stopper (coal+latex)~~ | ~~Rejected~~ → **Adopted.** stopper-2 (1 rubber → 2 stopper) taps existing rubber chain, cleaner routing |
| **sand-void-glass** (5 sand + 4 ore-quartz → 10 molten-glass) | LP includes it in recipe list but doesn't use it — glass-1 (6 ore-quartz → 10 molten-glass) is cheaper because sand is free to void |
| **coarse-classification in solver** | Causes LP Phase 1 infeasibility when added to recipe set. Handled manually with 1 classifier instead (see [§ Coarse processing](#coarse-processing)) |
| **Full self-power from raw-coal** | Would need ~57/s additional raw-coal, worse than baseline total. Byproduct self-power (~22 MW) is sufficient |
| **wpu-mk01-turd** | Not available — must use wpu-mk01 for wood processing |
| **Zinc ore crushing** | zinc-plate-1 recipe has 3.33:1 ore ratio via crushing, but needs iron-stick input — adds iron demand complexity |
| **Titanium ore crushing** | 4-step crushing chain produces gravel (another stone-source exploit risk), and the 1.875:1 ratio savings don't justify 4 extra buildings at this scale (only 1 titanium furnace) |
| ~~**clean-nexelit:muddy-sludge:exclude**~~ | ~~Rejected~~ → **Adopted** with `borax-washing:muddy-sludge:exclude` added. Both excludes together + dedicated muddy-sludge recipe prevents LP from using either as muddy-sludge source. See [§ Clean-nexelit handling](#clean-nexelit-handling) |

## Design notes for block layout

- **cooling-tower-mk01**: place 1 after polybutadiene's steam output, converts 58.33/s excess steam → water@100°C. Reduces water import by ~8%. ~0.8 kW power draw. Not in solver — LP abuses it to replace all water imports with steam imports.
- **Byproduct fuels for self-power** (oil-boiler-mk01 eff 2 + steam engine eff 0.5, net MW = rate × fuel_value):
  - Burn all: syngas 18.89 + gasoline 4.10 + naphthalene-oil 2.06 + carbolic-oil 0.62 + coal 2.16 (solid boiler eff 1) = **28 MW** (26% of 107 MW)
  - Export syngas, burn rest: 28 − 18.89 = **~9 MW** (8% of 107 MW)
  - Syngas (47/s) is more valuable as bus fuel export than burned locally
- **Flue-gas**: no consumer at current tech. Exhaust pipe void only. Retrofit with fluegas-filtration after `filtration` tech is researched (requires logistic-science-pack).
- **Sand**: 3.61/s excess from soil-separation-2. sand-void-glass available but LP doesn't use it (voiding sand is cheaper than the ore-quartz savings).
- **Coarse-classification**: 1 classifier outside solver, 4% utilization. See [§ Coarse processing](#coarse-processing).

## Ore crushing optimization

**Root cause:** Direct smelting recipes are extremely ore-inefficient. Iron: 8 ore → 1 plate (8:1). Copper: 8 ore → 1 plate (8:1). Tin: 40 ore → 4 plates (10:1). Lead: 6 ore → 1 plate (6:1). Crushing/screening paths are dramatically more efficient.

**Crushing paths:**

| Metal | Path | Ore:Plate ratio | Savings vs direct |
|---|---|---:|---:|
| Iron | grade-1-iron-crush (jaw-crusher) → low-grade-smelting-iron (stone-furnace) | 5:1 | −37% |
| Copper | grade-2-copper (screener) → grade-1-copper-crush (jaw-crusher) → copper-plate-4 (stone-furnace) | 5:1 | −37% |
| Tin | grade-1-tin (screener) → tin-plate-2 (stone-furnace) | 3.75:1 | −63% |
| Lead | grade-1-lead (screener) → lead-plate-2 (stone-furnace) | 2:1 | −67% |

**LP stone-source exploitation pattern:** Every crushing recipe produces stone as a byproduct. Without `stone:exclude` constraints, the LP scales ANY stone-producing recipe to source stone for Moss-2 and sodium-alginate, creating massive waste. This pattern was already seen with antimony screening. The fix is identical: exclude stone from all crushing recipe products. The stone is still physically produced in-game (phantom byproduct ~0.36/s from iron-crush + copper-crush) but the LP can't scale up to source it.

**Forcing copper crushing:** With stone excluded, the LP won't voluntarily use grade-1-copper-crush because the building cost outweighs the marginal ore savings at this scale. The screening-only path needs 58.71/60s copper-ore. Cap at `--max-import "copper-ore:55"` forces the LP to use the full crush path (46.97/60s copper-ore, under cap).

**Forcing tin crushing:** Without the ore-tin cap, the LP doesn't use grade-2-crush-tin (0 buildings). Grade-2-tin becomes waste. Cap at `--max-import "ore-tin:51"` forces the LP to use grade-2-crush-tin, consuming all 4.15/60s grade-2-tin. Ore-tin drops from 51.92/60s to 41.53/60s.

**Impact:**

| Resource | Before crushing | After crushing | Change |
|---|---:|---:|---|
| iron-ore | 1.63/s | 1.02/s | −37% |
| copper-ore | 1.25/s | 0.78/s | −37% |
| ore-lead | 1.06/s | 0.35/s | −67% |
| ore-tin | 1.15/s | 0.69/s | −40% |
| stone | 2.00/s | 1.57/s | −22% (phantom stone from crushing supplements import) |
| Buildings | 205 | 209 | +4 (26→28 in smelting, +1 barrel-machine) |

## Stone-import optimization

**Root cause:** The LP was running 5.25 screeners (sb-grade-01 recipe) to meet stone demand from Moss-2 (1.52/s) and sodium-alginate (0.58/s). Only 0.93 screeners were needed for actual antimony demand — the other 4.32 (82%) ran purely as a stone source. This created 5.25/s sb-grade-01 and 2.59/s sb-grade-02 as waste.

**Fix:** Three exclude constraints (`sb-grade-01:stone:exclude`, `sb-grade-02:stone:exclude`, `sb-grade-03:gravel:exclude`) prevent the LP from counting stone and gravel as products of antimony recipes. Stone becomes a raw import (1.64/s with ore crushing, 2.0/s without). The antimony chain runs at its natural rate (0.22x screener), perfectly balanced:

```
antimonium-ore (0.43/s) → sb-grade-01 (0.22/s) → sb-grade-02 crusher (all consumed)
                                                 → sb-grade-02 (0.56/s, all to sb-grade-03)
                                                 → sb-grade-03 → sb-grade-04 → sb-oxide
```

All sb-grade intermediates consumed internally. Zero waste.

**Impact:** −4 buildings, −96% antimonium-ore import, +stone import (1.57/s with ore crushing — a basic mined resource).

**Phantom byproducts:** The antimony recipes still physically produce stone (0.10/s), gravel (0.17/s), and iron-oxide (0.12/s) — these are excluded from the solver but exist in-game. All negligible; box or void.

## Coarse processing

Coarse (0.83/s from soil-separation-2) is processed by 1 classifier (not in solver — causes LP infeasibility when included).

**Recipe:** coarse-classification — 20 coarse → 5 stone + 2 iron-oxide + 4 gravel (1s, classifier)

At 0.83/s coarse input: 0.83/20 = 0.0415 classifiers (4% utilization).

**Products:**
- stone: 0.21/s → supplements stone import or buffers
- iron-oxide: 0.08/s → void (negligible)
- gravel: 0.17/s → can feed stone-to-gravel reverse (4 stone → 3 gravel) or gravel-to-sand if needed

All products are negligible at this scale. The classifier exists to prevent coarse backup, not for meaningful production.

## Clean-nexelit handling

**Solved.** Dedicated muddy-sludge recipe (10 soil + 100 water → 100 muddy-sludge, washer) provides bulk muddy-sludge for Moss-2 demand (455.11/60s). Two exclude constraints prevent the LP from using other recipes as muddy-sludge sources:

- `clean-nexelit:muddy-sludge:exclude` — prevents LP from scaling clean-nexelit washer for muddy-sludge
- `borax-washing:muddy-sludge:exclude` — prevents LP from using borax-washing as muddy-sludge source (was the failure mode when only clean-nexelit was excluded)

With both excludes, the LP uses the dedicated muddy-sludge recipe (1 washer, 0.75 util) for bulk demand. Clean-nexelit runs at exact demand: 0.58/60s produced, 0.58/60s consumed by nexelit-plate-2. No overproduction, no excess nexelit-plate, no "consumer TBD".

The physically-produced muddy-sludge from clean-nexelit (58.33/60s) and borax-washing (15.56/60s) is phantom — excluded from the solver but exists in-game. At 73.89/60s it's a minor surplus that supplements the dedicated recipe or buffers. Total muddy-sludge in-game: ~529/60s produced vs 455/60s consumed = ~74/60s excess (void or buffer).

## Mining fluid accounting

Coal processing covers all mining fluid requirements for this block's ore imports (except steam for ore-tin, excluded by design).

**Mining fluid formula:** `fluid/s = mining_speed × fluid_amount / (10 × mining_time)`. The `fluid_amount` in prototype data is 10x the actual in-game per-ore cost (Factorio engine constant — see [reference memory](../../.claude/projects/-Volumes-git-factorio-planner/memory/reference_fluid_amount_10x.md)). Verified 2026-10-10 with in-game tests.

**Per-ore fluid costs (÷10 corrected):**

| Ore | Fluid | Per ore | Import rate (/60s) | Fluid needed (/60s) |
|---|---|---:|---:|---:|
| ore-titanium | acetylene | 4 | 35.00 | 140.0 |
| ore-lead | acetylene | 10 | 21.27 | 212.7 |
| ore-zinc | aromatics | 4 | 48.50 | 194.0 |
| ore-tin | steam | 10 | 41.53 | (excluded) |
| borax | syngas | 2.5 | 1.56 | 3.9 |

**Acetylene chain (352.7/60s = 5.88/s):**

| Recipe | Factory | Fraction | Inputs | Outputs |
|---|---|---:|---|---|
| acetylene (8s) | gasifier | 0.47 | 0.59/s calcium-carbide, 17.6/s water | 5.88/s acetylene, 1.47/s slacked-lime |
| calcium-carbide (4s) | hpf | 0.24 | 0.41/s coke, 0.12/s lime | 0.59/s calcium-carbide |
| lime (5s) | hpf | 0.05 | 0.14/s coke, 0.09/s limestone | 0.09/s lime (after recycling), 1.18/s CO2 |
| slacked-lime-void (2s) | evaporator | 0.05 | 1.47/s slacked-lime | 0.02/s lime (recycled), 0.02/s gravel |

Total coke for acetylene: 0.55/s = 33.07/60s. Sourced from pitch-refining scale-up (+1 distilator, 0.83→1.10 utilization). Limestone: 0.09/s = 5.59/60s (new import).

**Extra aromatics for zinc mining (194/60s = 3.23/s):**

Absorbed by scaling the existing oil chain — extra pitch-refining produces extra light-oil → light-oil-aromatics → aromatics. The extra tar demand cascades through tar-refining → distilled-raw-coal → syngas, but all fit within existing building capacities (distilled-raw-coal 2 bldg at 1.50/2, syngas 3 bldg at 2.67/3). Extra raw-coal: ~85/60s.

**Syngas for borax mining (3.9/60s):** Trivially covered by existing syngas export (2833/60s).

**5 additional buildings total:**
1. gasifier (acetylene) — 47% util
2. hpf (calcium-carbide) — 24% util
3. hpf (lime) — 5% util
4. evaporator (slacked-lime-void) — 5% util
5. distilator (pitch-refining scale-up) — 1→2 buildings

## TODO

- [ ] Split into 3 blocks (battery/chemistry, bio/farming, assembly)
- [ ] Block boundary declarations (imports/exports between blocks)
- [ ] Verify self-power buildings don't significantly change total building count
- [ ] Retrofit flue-gas processing after filtration tech researched
