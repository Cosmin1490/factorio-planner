# Logistic science pack — 0.1/s, 202–206 buildings

Fully self-contained chain from raw resources. mk01 buildings, stone furnaces, bio modules on all farms.
Block splitting into 3 blocks (battery/chemistry, bio/farming, assembly) not yet done.

All factories mk01 tier. Stone furnaces for smelting (iron, copper, lead, tin, zinc, titanium, nexelit). Advanced-foundry-mk01 for steel (stone-furnace can't do advanced-foundry category). Bio modules on all farms/paddocks at mk01 slot counts.

## Optimization analysis

Two optimization axes, each LP-validated independently. All produce 0.1/s logistic-science-pack from raw resources. Cage recycling (vrauks loop is net-zero: 1 cage in → 1 cage out) is the baseline for both variants — no cage recipe needed, no cage exclude constraint. Stone-import optimization is the baseline for both variants — stone imported instead of sourced from antimony screening (see [§ Stone-import optimization](#stone-import-optimization)).

### Variant comparison

| Metric | A: LP-optimized | B: Max recycling |
|---|---:|---:|
| Buildings | **202** | 206 |
| Power (MW) | 105.26 | 105.83 |
| raw-coal (/s) | 16.41 | **5.37 (−67%)** |
| stone (/s) | 2.00 | 1.64 |
| antimonium-ore (/s) | 0.43 | 0.43 |
| iron-ore (/s) | 0.25 | **1.02** |
| copper-ore (/s) | 1.25 | **0.78** |
| ore-lead (/s) | 1.06 | **0.35 (−67%)** |
| ore-tin (/s) | 1.15 | **0.87 (−25%)** |
| ore-titanium (/s) | 0.49 | 0.49 |
| water (/s) | 566.68 | 626.64 |
| steam (/s) | 41.71 | 50.32 (gross) |
| coal-gas waste (/s) | 97.76 | **0 (consumed)** |
| pitch waste (/s) | 18.15 | **0 (consumed)** |
| middle-oil waste (/s) | 3.89 | **0.86 (−78%)** |
| syngas export (/s) | 0 | **43.19** |
| sb-grade waste (/s) | **0** | **0** |
| grade-2-tin waste (/s) | — | 0.09 |
| Unique recipes | +2, −1 | +17, −5 |

### Variant A — LP-optimized (202 buildings, recommended)

Fewest buildings, lowest imports. Cage recycling eliminates most metal demand; stone import eliminates sb-grade waste; iron-oxide-smelting covers most iron from distilled-raw-coal + coal-gas byproducts, with a small 0.25/s iron-ore import for the remainder.

**Recipes added:**
1. **coal-gas** (distilator): 10 coal → 6 coke + 1 iron-oxide + 40 coal-gas + 50 tar — converts waste coal into useful products.
2. **iron-oxide-smelting** (stone-furnace): 20 iron-oxide → 10 iron-plate — converts iron-oxide byproduct (from distilled-raw-coal + coal-gas) to iron-plate. With stone import, sb-grade-01 screening runs at minimum (0.22x), so iron-oxide comes primarily from coal processing, not antimony.

**Recipe eliminated:** `coke-coal` — the coal-gas recipe produces enough coke to replace it.

| Recipe | Change vs Variant B |
|---|---|
| distilled-raw-coal: **4 bldg** (3.28) | +2 (more raw-coal, no oil refining) |
| coal-gas: **1 bldg** (0.12) | Converts waste coal |
| iron-oxide-smelting: **1 bldg** | Covers most iron from coal-processing iron-oxide |
| iron-plate: **1 bldg** (0.40) | Small supplement (0.25/s iron-ore) |

### Variant B — Max recycling (206 buildings)

Trades +4 buildings and +21% gross steam for massive waste reduction, syngas export, and ore crushing optimization. Uses `--max-import "raw-coal:600"` to force recycling, `--max-import "copper-ore:55"` to force copper crushing, and ore crushing for iron/copper/tin/lead (see [§ Ore crushing optimization](#ore-crushing-optimization)).

**Recipes added (design 03/05 patterns):**
1. **pitch-refining** (distilator): 100 pitch + 100 steam → 10 coke + 10 hydrogen + 20 light-oil + 20 naphthalene-oil + 30 anthracene-oil — eliminates pitch waste
2. **tar-refining-tops** (tar-processing-unit): 100 middle-oil + 100 steam → 50 light-oil + 50 carbolic-oil + 100 naphthalene-oil — eliminates middle-oil waste
3. **light-oil-aromatics** (distilator): 50 light-oil → 50 aromatics + 25 gasoline — converts light-oil to aromatics + gasoline fuel
4. **coal-gas-from-coke** (distilator): uses excess coke from pitch-refining to produce more coal-gas + tar
5. **syngas** scale-up (1→2 gasifiers): converts coal-gas to syngas fuel export
6. `naphthalene-oil-creosote`, `carbolic-oil-creosote`, `anthracene-gasoline-cracking` — included in recipe list but LP does not use them

| Recipe | Variant B |
|---|---|
| distilled-raw-coal: **2 bldg** (1.07) | raw-coal cap forces recycling |
| syngas: **2 bldg** (1.99) | coal-gas → syngas export |
| pitch-refining: **1 bldg** (0.58) | pitch → coke + hydrogen + oils |
| tar-refining-tops: **1 bldg** (0.07) | middle-oil → light-oil |
| light-oil-aromatics: **1 bldg** (0.13) | light-oil → aromatics |
| coal-gas-from-coke: **1 bldg** (0.23) | coke → coal-gas + tar feedback |
| hydrogen: **1 bldg** (0.61) | −39% (pitch-refining provides hydrogen) |

### Why the variants can't be combined

Adding pitch-refining recipes to Variant A's recipe list changes the solver's `computeItemDepths` output — the depth computation runs on the original matrix before LP constraints. Even if the LP wouldn't use pitch-refining, the additional recipes create new item→recipe→item paths that inflate recipe costs, changing the LP solution. Tested:

- **Without raw-coal cap:** Adding pitch-refining + tar-refining-tops + light-oil-aromatics to Variant A produces 225 buildings with coal-gas at 0.05 instead of 0.71 — the LP "forgets" to recycle coal because recipe costs shifted. The LP rejects all three oil-refining recipes.
- **With raw-coal cap:** The LP scales antimony screening to 20 buildings (from 6 pre-stone-import) and imports 38.96/s antimonium-ore to source iron-oxide from sb-grade-01's probability output — technically optimal but +14 wasteful antimony buildings. (Stone-import constraints mitigate this, but the variant combination still fails.)
- **Full feedback loop** (coal-gas-from-coke → syngas → tar → pitch-refining → coke → coal-gas-from-coke): Creates a cycle that causes `computeItemDepths` to diverge, making Phase 1 infeasible. Manual analysis shows the loop saves ~1.5/s additional raw-coal at +3–4 buildings — a modest improvement the solver can't validate.

### Steam accounting note

The solver reports steam as both import (50.32/s) and byproduct (48.61/s). Polybutadiene produces 48.61/s steam internally but the solver doesn't net it against consuming recipes. Actual net steam import is ~1.71/s. The "+21% steam" trade-off is grossly overstated — true incremental steam cost is minimal.

### Self-power analysis (Variant B)

Available byproduct fuels from the Variant B chain (oil-boiler-mk01, effectivity 2):

| Fuel | /s | fuel_value (MJ) | MW electrical |
|---|---:|---:|---:|
| syngas | 43.19 | 0.40 | 17.28 |
| gasoline | 1.57 | 1.20 | 1.88 |
| naphthalene-oil | 3.96 | 0.30 | 1.19 |
| carbolic-oil | 0.82 | 0.35 | 0.29 |
| middle-oil | 0.86 | 0.20 | 0.17 |
| coal 0.71 (solid, boiler eff 1) | 0.71 | 4.00 | 1.42 |
| **Total** | | | **22.23** |

Self-power covers **22 MW / 105 MW (21%)**. Remaining 83 MW must be imported.

**Recommendation:** Syngas is more valuable as a bus fuel export (43/s at 0.4 MJ = 17.28 MW worth) than burned locally. Without syngas self-power: ~5 MW from minor fuels.

**Variant A self-power:** Coal-gas (97.76/s × 0.20 MJ × eff 2 = 19.55 MW) + creosote (2.72/s × 0.35 MJ × eff 2 = 0.95 MW) + pitch (18.15/s — no fuel value) + middle-oil (3.89/s × 0.20 MJ × eff 2 = 0.78 MW) + coal (3.73/s × 4.0 MJ × eff 1 = 7.46 MW) = ~29 MW (28% of 105 MW). No syngas export — all value consumed internally.

## Flow diagram (Variant B)

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
  │                    BIO / FARMING (102 bldgs)                ││  │  │  │  │
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
  │  SOIL       4x soil-extractor + 1x limestone + 1x separator││  │  │  │  │
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
  │ muddy-sludge ◄── clean-nexelit        └──▶ ammonia ──▶ melamine──┘  │  │
  │      └──▶ Moss-2                                                   │  │
  └──────────────────┘                                                 │  │
                                                                       │  │
        ┌──────────────────────────────────────────────────────────────┘  │
        ▼                                                                │
  ┌──────────────────────────────────────────────────────────────┐       │
  │ COAL & TAR CHEMISTRY (15 bldgs) — OPTIMIZED                 │       │
  │                                                              │       │
  │ raw-coal ──▶ distilled-raw-coal (2x)                         │       │
  │              ├──▶ coal-gas ──▶ syngas (2x gasifier)          │       │
  │              │                 ├──▶ syngas EXPORT (42/s fuel)│       │
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
  │              │               └──▶ creosote ──▶ treated-wood │       │
  │              └──▶ coal (fuel for smelting)                   │       │
  │                                                              │       │
  │ light-oil ──▶ light-oil-aromatics ──▶ aromatics + gasoline  │       │
  │ aromatics ──▶ polybutadiene ──▶ rubber ──▶ lab-instrument   │       │
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
```

## Recipe tables (Variant B — 206 buildings)

Solver-validated (simplex, cage-recycled, stone-import, ore crushing, oil refining variant with `--max-import "raw-coal:600"` and `--max-import "copper-ore:55"`). Self-power potential: 22 MW from all byproduct fuels, or ~5 MW if syngas exported. Variant A differences noted in [§ Variant A recipe changes](#variant-a-recipe-changes).

### Bio — farms & paddocks (102 buildings)

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
| soil | soil-extractor-mk01 | 4 (3.76) | |
| extract-limestone-01 | soil-extractor-mk01 | 1 (0.44) | |
| soil-separation-2 | solid-separator | 1 (0.83) | |

### Bio — processing (17 buildings)

Cage is recycled natively: full-render-vrauks produces 1 cage → caged-vrauks consumes 1 cage. Net zero, no cage recipe needed.

| Recipe | Factory | Count | Modules |
|---|---|---:|---|
| full-render-cottongut | slaughterhouse-mk01 | 1 | |
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
| stopper | automated-factory-mk01 | 1 (0.05) | |
| lab-instrument | automated-factory-mk01 | 1 (0.07) | |

### Urea cycle (4 buildings)

| Recipe | Factory | Count | Modules |
|---|---|---:|---|
| urea-from-liquid-manure | bio-reactor-mk01 | 1 (0.16) | |
| liquid-manure | bio-reactor-mk01 | 1 (0.17) | |
| urea-decomposition | distilator | 1 (0.23) | |
| melamine | fbreactor-mk01 | 1 (0.03) | |

### Coal & tar chemistry (15 buildings)

| Recipe | Factory | Count | Modules |
|---|---|---:|---|
| distilled-raw-coal | distilator | 2 (1.07) | |
| syngas | gasifier | 2 (1.99) | |
| tar-distilation | distilator | 1 (0.20) | |
| tar-refining | tar-processing-unit | 1 (0.42) | |
| **pitch-refining** | distilator | 1 (0.58) | |
| **tar-refining-tops** | tar-processing-unit | 1 (0.07) | |
| **light-oil-aromatics** | distilator | 1 (0.13) | |
| **coal-gas-from-coke** | distilator | 1 (0.23) | |
| graphite | hpf | 1 (0.13) | |
| aromatics-to-plastic | biofactory-mk01 | 1 (0.05) | |
| treated-wood | tar-processing-unit | 1 (0.01) | |
| formica | pulp-mill-mk01 | 1 (0.04) | |
| methanal | hpf | 1 (0.02) | |

Removed vs baseline: `coke-coal` (pitch-refining provides coke). Added: `coal-gas-from-coke` (excess coke from pitch-refining → coal-gas + tar feedback).

### Smelting & metals (27 buildings)

Cage recycling slashes metal demand: iron-plate −57%, lead −71%, tin −66%, titanium −83%. Ore crushing replaces direct smelting for iron, copper, tin, lead — 25–67% ore savings (see [§ Ore crushing optimization](#ore-crushing-optimization)). Stone-import optimization reduces antimony screening from 6→1 buildings (see [§ Stone-import optimization](#stone-import-optimization)).

| Recipe | Factory | Count | Modules |
|---|---|---:|---|
| grade-1-iron-crush | jaw-crusher | 1 (0.41) | |
| low-grade-smelting-iron | stone-furnace | 2 (1.22) | |
| grade-2-copper | automated-screener-mk01 | 1 (0.47) | |
| grade-1-copper-crush | jaw-crusher | 1 (0.23) | |
| copper-plate-4 | stone-furnace | 1 (0.16) | |
| grade-1-tin | automated-screener-mk01 | 1 (0.52) | |
| tin-plate-2 | stone-furnace | 1 (0.58) | |
| grade-1-lead | automated-screener-mk01 | 1 (0.21) | |
| lead-plate-2 | stone-furnace | 1 (0.71) | |
| zinc-plate-1 | stone-furnace | 2 (1.21) | |
| titanium-plate-1 | stone-furnace | 1 (0.73) | |
| nexelit-plate-2 | stone-furnace | 1 (0.03) | |
| clean-nexelit | washer | 1 (0.22) | |
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

### Electronics & assembly (17 buildings)

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
| logistic-science-pack | research-center-mk01 | 1 (0.75) | |

## Variant A recipe changes (202 buildings)

Bio, urea, battery, and electronics sections are identical to Variant B. Only Coal & tar and Smelting differ.

### Coal & tar chemistry (13 buildings)

| Recipe | Factory | Count |
|---|---|---:|
| distilled-raw-coal | distilator | 4 (3.28) |
| **coal-gas** | distilator | 1 (0.12) |
| syngas | gasifier | 1 (0.14) |
| tar-distilation | distilator | 1 (0.28) |
| tar-refining | tar-processing-unit | 1 (0.65) |
| graphite | hpf | 1 (0.13) |
| aromatics-to-plastic | biofactory-mk01 | 1 (0.05) |
| treated-wood | tar-processing-unit | 1 (0.01) |
| formica | pulp-mill-mk01 | 1 (0.04) |
| methanal | hpf | 1 (0.02) |

vs Variant B: +2 distilled-raw-coal, +1 coal-gas, −1 syngas, −4 oil recipes (pitch-refining, tar-refining-tops, light-oil-aromatics, coal-gas-from-coke). Net: −2 buildings.

### Smelting & metals (25 buildings)

Iron-oxide from distilled-raw-coal + coal-gas covers most iron demand via iron-oxide-smelting. Small 0.25/s iron-ore supplement via iron-plate. Stone-import reduces sb-grade-01 from 6→1 and adds sb-grade-02 crusher. Ore crushing not yet validated for Variant A — copper/tin/lead still use direct smelting.

| Recipe | Factory | Count |
|---|---|---:|
| **iron-oxide-smelting** | stone-furnace | 1 |
| **iron-plate** | stone-furnace | 1 (0.40) |
| copper-plate | stone-furnace | 2 (1.57) |
| lead-plate-1 | stone-furnace | 2 (1.77) |
| tin-plate-1 | stone-furnace | 2 (1.73) |
| zinc-plate-1 | stone-furnace | 2 (1.21) |
| titanium-plate-1 | stone-furnace | 1 (0.73) |
| nexelit-plate-2 | stone-furnace | 1 (0.03) |
| clean-nexelit | washer | 1 (0.22) |
| glass-1 | glassworks-mk01 | 4 (3.75) |
| molten-glass | glassworks-mk01 | 1 (0.06) |
| sb-grade-01 | automated-screener-mk01 | 1 (0.22) |
| sb-grade-02 | jaw-crusher | 1 (0.22) |
| sb-grade-03 | automated-screener-mk01 | 1 (0.56) |
| sb-grade-04 | secondary-crusher-mk01 | 1 (0.05) |
| sb-oxide-01 | bof-mk01 | 1 (0.32) |
| pbsb-alloy | smelter-mk01 | 1 (0.27) |
| fenxsb-alloy-2 | smelter-mk01 | 1 (0.10) |

vs Variant B: no ore crushing (not yet validated), +iron-oxide-smelting, +iron-plate supplement.

### Variant A imports

| Resource | /s |
|---|---:|
| water | 566.68 |
| steam | 41.71 |
| raw-coal | 16.41 |
| ore-quartz | 4.50 |
| stone | 2.00 |
| native-flora | 1.57 |
| copper-ore | 1.25 |
| ore-lead | 1.06 |
| ore-tin | 1.15 |
| ore-zinc | 0.81 |
| water-barrel | 0.80 |
| ore-titanium | 0.49 |
| antimonium-ore | 0.43 |
| iron-ore | 0.25 |
| nexelit-ore | 0.22 |
| raw-borax | 0.03 |

### Variant A byproducts

| Byproduct | /s | Notes |
|---|---:|---|
| coal-gas | 97.76 | primary fuel source (19.55 MW) |
| flue-gas | 56.56 | no consumer; retrofit after filtration tech |
| steam | 48.61 | — |
| pitch | 18.15 | waste |
| oxygen | 5.06 | — |
| middle-oil | 3.89 | waste |
| coal | 3.73 | fuel (4.0 MJ) |
| sand | 3.61 | — |
| carbon-dioxide | 3.22 | — |
| creosote | 2.72 | — |
| ash | 0.80 | — |
| ammonia | 0.81 | — |
| coarse | 0.83 | from soil-separation-2; process with 1 classifier (see [§ Coarse processing](#coarse-processing)) |
| gravel | 0.17 | phantom from sb-grade-03 (excluded from solver) |
| iron-oxide | 0.12 | phantom from sb-grade-01 (excluded from solver) |

Variant A trades small iron-ore import (0.25/s) for higher raw-coal (16.41 vs 5.37) and higher coal-gas/pitch/middle-oil waste vs Variant B.

## Intermediate flows (Variant B)

All rates /s. Cage-recycled baseline.

### High-volume flows (>= 1/s)

| Item | /s | Produced by | Consumed by |
|---|---:|---|---|
| syngas | 46.37 | syngas gasifier | aromatics-to-plastic (3.18) |
| tar | 36.90 | syngas (19.87) + distilled-raw-coal (16.10) + coal-gas-from-coke (0.93) | tar-distilation (28.59), tar-refining (8.31) |
| coal-gas | 33.12 | distilled-raw-coal (32.20) + coal-gas-from-coke (0.93) | syngas (33.12) |
| hydrogen | 13.30 | electrolyzer (12.14) + pitch-refining (1.16) | diborane (0.65), ralesia-1 (12.66) |
| creamy-latex | 11.67 | washer | latex-slab |
| formic-acid | 11.67 | full-render-vrauks | latex-slab |
| pitch | 11.63 | tar-refining | pitch-refining (11.63) |
| aromatics | 11.31 | tar-distilation (8.17) + light-oil-aromatics (3.14) | aromatics-to-plastic (1.59), polybutadiene (9.72) |
| anthracene-oil | 9.72 | tar-refining (6.23) + pitch-refining (3.49) | carbon-black (9.72) |
| carbon-dioxide | 8.25 | tar-distilation (8.17), melamine (0.08) | Moss-2 (7.59), methane-co2 (0.58) |
| muddy-sludge | 7.59 | clean-nexelit (7.19), melamine (0.13), borax (0.26) | Moss-2 |
| soil | 7.52 | soil (extractor) | soil-separation-2 (5.56), ralesia-1 (1.90) |
| molten-glass | 7.50 | glass-1 | empty-petri-dish, flask, lens, molten-glass |
| oxygen | 6.07 | electrolyzer | sb-oxide-01 (1.59) |
| pressured-water | 5.56 | pump | subcritical-water-01 |
| vacuum | 5.10 | pump | carbon-black (4.86), pcb1, vacuum-tube |
| polybutadiene | 4.86 | cracker | rubber-01 |
| naphthalene-oil | 3.96 | pitch-refining (2.33) + tar-refining-tops (1.63) | *none (void)* |
| light-oil | 3.14 | pitch-refining (2.33) + tar-refining-tops (0.82) | light-oil-aromatics (3.14) |
| sb-grade-02 | 0.56 | sb-grade-01 (0.13) + sb-grade-02 (0.43) | sb-grade-03 |
| middle-oil | 2.49 | tar-refining | tar-refining-tops (1.63) |
| sb-grade-01 | 0.22 | sb-grade-01 | sb-grade-02 |
| ralesia-seeds | 2.02 | botanical-nursery | bio-sample01, caged-cottongut-1, cottongut-cub-1, ralesia-1 |
| blood | 2.00 | full-render-cottongut | animal-sample-01 |
| creosote | 1.99 | tar-refining | treated-wood (0.39) |
| boric-acid | 1.94 | electrolyzer | boron-trioxide |
| coal | 1.61 | distilled-raw-coal | smelting fuel (furnaces + stopper) |
| ash | 1.34 | smelting + syngas + coal-gas-from-coke | *none (void)* |
| pressured-air | 1.47 | pump | zogna-bacteria |
| subcritical-water | 1.39 | heat-exchanger | depolymerized-organics |
| ralesia | 1.27 | ralesia-1 | ralesia-seeds |
| moss | 1.21 | Moss-2 | vrauks-cocoon, auog, vrauks-1, etc. |
| coke | 1.16 | pitch-refining | graphite, resistor1, boron-trioxide, **coal-gas-from-coke (0.93)** |
| seaweed | 1.04 | seaweed-1 | sodium-alginate, agar |

### Ore crushing intermediates (Variant B)

| Item | /s | Produced by | Consumed by |
|---|---:|---|---|
| processed-iron-ore | 0.61 | grade-1-iron-crush | low-grade-smelting-iron |
| grade-2-copper | 0.39 | grade-2-copper screener (0.31) + grade-1-copper-crush (0.08) | copper-plate-4 |
| grade-1-copper | 0.16 | grade-2-copper screener | grade-1-copper-crush |
| grade-1-tin | 0.17 | grade-1-tin screener | tin-plate-2 |
| grade-2-tin | 0.09 | grade-1-tin screener | *none (waste)* |
| grade-1-lead | 0.07 | grade-1-lead screener | lead-plate-2 |

### Key changes from cage recycling

| Item | Old /s | New /s | Change |
|---|---:|---:|---|
| iron-stick | 1.03 | **0.15** | −85% (no longer feeds cage) |
| iron-plate (internal) | 6.41 bldg | **2.03 bldg** | −68% (no cage demand) |
| lead-plate (internal) | 6.44 bldg | **1.77 bldg** | −72% (no solder→cage) |
| tin-plate (internal) | 5.23 bldg | **1.73 bldg** | −67% (no solder→cage) |
| titanium-plate (internal) | 5.10 bldg | **0.73 bldg** | −86% (no cage demand) |
| cage | 0.23 bldg (recipe) | **0 (net-zero loop)** | cage recipe eliminated |

## Imports (Variant B)

All raw mined resources — no processed items. See [§ Variant A imports](#variant-a-imports) for Variant A.

| Resource | /s |
|---|---:|
| water | 626.64 |
| steam | 50.32 (gross; net ~1.71 after polybutadiene steam) |
| raw-coal | 5.37 |
| ore-quartz | 4.50 |
| stone | 1.64 |
| native-flora | 1.57 |
| iron-ore | 1.02 |
| ore-tin | 0.87 |
| ore-zinc | 0.81 |
| water-barrel | 0.80 |
| copper-ore | 0.78 |
| ore-titanium | 0.49 |
| antimonium-ore | 0.43 |
| ore-lead | 0.35 |
| nexelit-ore | 0.22 |
| raw-borax | 0.03 |

## Exports (Variant B)

| Item | /s | Notes |
|---|---:|---|
| logistic-science-pack | 0.10 | |
| syngas | 43.19 | Bus fuel (0.4 MJ), from coal-gas→syngas conversion |

Variant A has no syngas export — only logistic-science-pack.

## Byproducts — Variant B (voidable)

| Byproduct | /s | Notes |
|---|---:|---|
| steam | 48.61 | from polybutadiene (→ cooling-tower) |
| flue-gas | 40.84 | from smelting; no consumer; retrofit after filtration tech |
| oxygen | 4.48 | from electrolysis |
| naphthalene-oil | 3.96 | from pitch-refining + tar-refining-tops |
| sand | 3.61 | from soil-separation-2 |
| creosote | 1.61 | from tar-refining |
| gasoline | 1.57 | from light-oil-aromatics (fuel) |
| ash | 1.34 | from smelting + syngas (lower than baseline: 4 fewer furnaces) |
| blood | 1.17 | excess from full-render-cottongut |
| coal | 0.93 | excess (fuel); higher than baseline: 4 fewer furnaces consuming coal |
| middle-oil | 0.86 | residual |
| coarse | 0.83 | from soil-separation-2; process with 1 classifier (see [§ Coarse processing](#coarse-processing)) |
| carbolic-oil | 0.82 | from tar-refining-tops |
| ammonia | 0.81 | from urea decomposition |
| gravel | 0.17 | phantom from sb-grade-03 (excluded from solver) |
| iron-oxide | 0.12 | phantom from sb-grade-01 (excluded from solver) |
| grade-2-tin | 0.09 | from tin screening; no crusher used (see [§ Ore crushing optimization](#ore-crushing-optimization)) |
| clean-nexelit | 0.06 | excess from muddy-sludge scaling |

**Phantom byproducts from ore crushing:** stone ~0.36/s (from grade-1-iron-crush + grade-1-copper-crush, excluded from solver but physically produced in-game). Supplements stone import or buffers.

Major waste streams eliminated: coal-gas (100% consumed), pitch (100% consumed), sb-grade-01/02 (100% consumed via stone-import optimization). Remaining byproducts are either fuel-capable (gasoline, coal, creosote) or must be voided.

## Key design decisions

- **Urea cycle closes without dedicated muddy-sludge recipe.** LP scales up clean-nexelit production to get enough muddy-sludge as a byproduct. The urea demand is driven by cyanic-acid for batteries (0.81/s), not melamine (0.05/s).
- **Cage recycling is net-zero.** The vrauks loop (caged-vrauks → vrauks-1 → vrauks-cocoon-1 → full-render-vrauks → cage output → caged-vrauks) recycles cage at 0.058/s with no loss. No cage recipe needed, no `full-render-vrauks:cage:exclude` constraint needed. Saves 18 buildings in smelting (iron −57%, lead −71%, tin −66%, titanium −83%) because cage consumed iron-stick, titanium-plate, and solder.
- **Bio modules are the dominant factor.** Without modules: 1000+ buildings. With mk01 modules: 206. The 5-21x speed multiplier on farms dwarfs the mk01-mk04 building tier difference.
- **Growth cycles self-sustaining.** Cottongut, wood, ralesia, moondrop seed loops are all net-positive. No seed imports needed.
- **Seven solver constraints required:**
  - `melamine:carbon-dioxide:exclude` — prevents melamine CO2 from feeding back into the urea cycle
  - `sb-grade-01:stone:exclude` — prevents LP from using antimony screening as a stone source (see [§ Stone-import optimization](#stone-import-optimization))
  - `sb-grade-02:stone:exclude` — same, for the crusher recipe
  - `sb-grade-03:gravel:exclude` — prevents LP from using sb-grade-03 as a gravel source
  - `grade-1-iron-crush:stone:exclude` — prevents LP from scaling iron crushing as a stone source (see [§ Ore crushing optimization](#ore-crushing-optimization))
  - `grade-1-copper-crush:stone:exclude` — same, for copper crushing
  - `grade-2-crush-tin:stone:exclude` — same, for tin crushing
- **Two max-import caps (Variant B):**
  - `--max-import "raw-coal:600"` — forces internal coal-gas recycling
  - `--max-import "copper-ore:55"` — forces copper crushing (screening-only needs 58.71/60s, exceeding cap)
- **Ore crushing replaces direct smelting for iron, copper, tin, lead.** Screening → crushing → smelting gives 25–67% ore savings over direct smelting at +1 building (26→27). Stone byproduct excluded from solver to prevent LP stone-source exploitation. See [§ Ore crushing optimization](#ore-crushing-optimization).
- **Stone-import optimization eliminates sb-grade waste.** The LP was running 5.25 screeners for stone demand (Moss-2 + sodium-alginate), not antimony demand. Excluding stone/gravel from antimony recipe products forces stone import (1.64/s with ore crushing) and drops screening to 0.22x — the exact rate needed for sb-grade-04 production. All sb-grade-01/02 consumed internally. See [§ Stone-import optimization](#stone-import-optimization).
- **Variant A uses iron-oxide-smelting for most iron.** Iron-oxide from distilled-raw-coal + coal-gas covers most iron demand. A small 0.25/s iron-ore supplement is needed because sb-grade-01 screening (now at 0.22x, not 5.25x) provides far less iron-oxide.
- **Pitch-refining replaces coke-coal (Variant B).** Pitch-refining (design 03/05 pattern) converts pitch waste into coke + hydrogen + light-oil + anthracene-oil. The hydrogen from pitch-refining reduces the electrolyzer from 100% to 61% utilization.
- **coal-gas-from-coke completes the coke loop (Variant B).** Excess coke from pitch-refining feeds coal-gas-from-coke (distilator), producing additional coal-gas + tar. This recipe was previously unused by the LP but activates with cage recycling because the reduced coke demand creates an excess.
- **Syngas conversion captures coal-gas value (Variant B).** Coal-gas routed through syngas recipe (50 coal-gas + 100 water → 70 syngas + 30 tar + 1 ash). The syngas (43/s) exports as bus fuel (0.4 MJ/unit). Tar feedback reduces distilled-raw-coal to 2 buildings.
- **Raw-coal 67% reduction via `--max-import "raw-coal:600"` (Variant B).** Without the cap, the LP wastes coal-gas rather than processing it. The raw-coal cap forces recycling (5.37/s raw-coal).
- **Self-power at 21% from byproducts.** ~22 MW from byproduct fuels. Remaining ~84 MW imported.
- **Iron-oxide-smelting is incompatible with oil refining in the LP.** When both are present without stone-import, the LP scales sb-grade-01 +45% to source iron-oxide. Choose one: oil refining for byproduct elimination (Variant B), or iron recycling for iron-ore reduction (Variant A).
- **Cooling-water (cooling-tower-mk01) for steam recovery.** polybutadiene produces 48.61/s excess steam. Route through cooling-water (400 steam → 400 water@100°C, 1 tower) to recover ~48/s water. Not in solver — the LP abuses it.
- **coarse-classification handled manually.** Adding coarse-classification to the solver causes LP infeasibility, but 1 classifier at 4% utilization handles 0.83/s coarse outside the solver (see [§ Coarse processing](#coarse-processing)).
- **Flue-gas: no consumer at current tech.** fluegas-filtration and fluegas-to-syngas require `filtration` tech, which costs logistic-science-pack — bootstrap problem. Initial build must vent; retrofit after research.

## Solver commands

### Variant B — max recycling (206 buildings)

Oil refining variant with pitch-refining + tar-refining-tops + light-oil-aromatics + coal-gas-from-coke, raw-coal cap, copper-ore cap, and ore crushing for iron/copper/tin/lead. Cage-recycled (no cage recipe, no cage exclude constraint). Stone-import (sb-grade stone/gravel excluded). Ore crushing (stone excluded from all crushing recipes).

```bash
npx tsx src/cli.ts solve \
  --recipes "logistic-science-pack,battery-mk01,animal-sample-01,alien-sample01,cottongut-science-red-seeds,pbsb-alloy,sb-oxide-01,sb-grade-01,sb-grade-02,sb-grade-03,sb-grade-04,melamine,urea-decomposition,graphite,bolts,iron-stick,glass-1,molten-glass,zinc-plate-1,aromatics-to-plastic,syngas,distilled-raw-coal,tar-distilation,hydrogen,ground-sample01,rich-clay,soil,electronic-circuit-2,capacitor1,inductor1,resistor1,pcb1,vacuum-tube,solder-0,ceramic,clay,formica,treated-wood,fiber-01,methanal,vacuum,pressured-air,plasmids,flask,stopper,lab-instrument,equipment-chassi,fenxsb-alloy-2,lens,small-parts-01,iron-gear-wheel,copper-cable,small-lamp,petri-dish-bacteria,petri-dish,empty-petri-dish,agar,zogna-bacteria,rubber-01,carbon-black,polybutadiene,latex,latex-slab,sodium-alginate,creamy-latex,boron-trioxide,boric-acid,diborane,borax-washing,iron-plate,copper-plate,titanium-plate-1,steel-plate,nexelit-plate-2,clean-nexelit,seaweed-1,sap-01,tar-refining,bio-sample01,bone-to-bonemeal-2,full-render-cottongut,full-render-vrauks,caged-vrauks,vrauks-1,vrauks-cocoon-1,fawogae-substrate,cellulose-00,depolymerized-organics,fawogae-1,fawogae-spore,pressured-water,extract-limestone-01,soil-separation-2,subcritical-water-01,Moss-2,methane-co2,liquid-manure,auog-pooping-1,urea-from-liquid-manure,caged-cottongut-1,cottongut-cub-1,log-wood-fast,log2,wood-seedling,wood-seeds,ralesia-1,ralesia-seeds,moondrop-1,moondrop-seeds,pitch-refining,tar-refining-tops,light-oil-aromatics,naphthalene-oil-creosote,carbolic-oil-creosote,anthracene-gasoline-cracking,coal-gas-from-coke,tin-plate-1,lead-plate-1,grade-1-iron-crush,low-grade-smelting-iron,grade-2-copper,grade-1-copper-crush,copper-plate-4,grade-1-tin,grade-2-crush-tin,tin-plate-2,grade-1-lead,lead-plate-2" \
  --constraint "melamine:carbon-dioxide:exclude" \
  --constraint "sb-grade-01:stone:exclude" \
  --constraint "sb-grade-02:stone:exclude" \
  --constraint "sb-grade-03:gravel:exclude" \
  --constraint "grade-1-iron-crush:stone:exclude" \
  --constraint "grade-1-copper-crush:stone:exclude" \
  --constraint "grade-2-crush-tin:stone:exclude" \
  --max-import "raw-coal:600" \
  --max-import "copper-ore:55" \
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
- `anthracene-gasoline-cracking` — LP uses carbon-black for anthracene-oil instead
- `iron-plate`, `copper-plate`, `tin-plate-1`, `lead-plate-1` — replaced by ore crushing paths (LP sets count to 0)
- `grade-2-crush-tin` — LP doesn't use tin crusher (0.09/s grade-2-tin waste not worth 1 building)

### Variant A — LP-optimized (202 buildings)

Iron recycling variant: baseline recipes + coal-gas + iron-oxide-smelting, no raw-coal cap, no oil refining. Cage-recycled (no cage recipe, no cage exclude constraint). Stone-import (sb-grade stone/gravel excluded). Do NOT combine with Variant B oil refining recipes — causes +45% antimonium-ore scaling (see [§ Why the variants can't be combined](#why-the-variants-cant-be-combined)).

```bash
npx tsx src/cli.ts solve \
  --recipes "logistic-science-pack,battery-mk01,animal-sample-01,alien-sample01,cottongut-science-red-seeds,pbsb-alloy,sb-oxide-01,sb-grade-01,sb-grade-02,sb-grade-03,sb-grade-04,melamine,urea-decomposition,graphite,coke-coal,bolts,iron-stick,glass-1,molten-glass,zinc-plate-1,lead-plate-1,aromatics-to-plastic,syngas,distilled-raw-coal,tar-distilation,hydrogen,ground-sample01,rich-clay,soil,electronic-circuit-2,capacitor1,inductor1,resistor1,pcb1,vacuum-tube,solder-0,tin-plate-1,ceramic,clay,formica,treated-wood,fiber-01,methanal,vacuum,pressured-air,plasmids,flask,stopper,lab-instrument,equipment-chassi,fenxsb-alloy-2,lens,small-parts-01,iron-gear-wheel,copper-cable,small-lamp,petri-dish-bacteria,petri-dish,empty-petri-dish,agar,zogna-bacteria,rubber-01,carbon-black,polybutadiene,latex,latex-slab,sodium-alginate,creamy-latex,boron-trioxide,boric-acid,diborane,borax-washing,iron-plate,copper-plate,titanium-plate-1,steel-plate,nexelit-plate-2,clean-nexelit,seaweed-1,sap-01,tar-refining,bio-sample01,bone-to-bonemeal-2,full-render-cottongut,full-render-vrauks,caged-vrauks,vrauks-1,vrauks-cocoon-1,fawogae-substrate,cellulose-00,depolymerized-organics,fawogae-1,fawogae-spore,pressured-water,extract-limestone-01,soil-separation-2,subcritical-water-01,Moss-2,methane-co2,liquid-manure,auog-pooping-1,urea-from-liquid-manure,caged-cottongut-1,cottongut-cub-1,log-wood-fast,log2,wood-seedling,wood-seeds,ralesia-1,ralesia-seeds,moondrop-1,moondrop-seeds,coal-gas,coal-gas-from-coke,iron-oxide-smelting,sand-void-glass" \
  --constraint "melamine:carbon-dioxide:exclude" \
  --constraint "sb-grade-01:stone:exclude" \
  --constraint "sb-grade-02:stone:exclude" \
  --constraint "sb-grade-03:gravel:exclude" \
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
  --factory "coal-gas:distilator" \
  --factory "coal-gas-from-coke:distilator" \
  --factory "iron-oxide-smelting:stone-furnace" \
  --factory "sand-void-glass:glassworks-mk01" \
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

Key differences from Variant B: +coal-gas, +coal-gas-from-coke, +iron-oxide-smelting, +sand-void-glass, +coke-coal; −pitch-refining, −tar-refining-tops, −light-oil-aromatics, −naphthalene-oil-creosote, −carbolic-oil-creosote, −anthracene-gasoline-cracking, −coal-gas-from-coke; no `--max-import`, no ore crushing recipes. Both share the same 4 base constraints (melamine CO2, sb-grade stone/gravel excludes); Variant B adds 3 ore crushing stone excludes + 2 max-import caps. Ore crushing not yet validated for Variant A.

## Irreducible waste

These byproducts have no consumers at current tech level — voiding is the only option:

| Byproduct | /s (A) | /s (B) | Why irreducible |
|---|---:|---:|---|
| flue-gas | 56.56 | 40.84 | No consumer at current tech; `filtration` tech (needs logistic-science-pack) unlocks fluegas-filtration and fluegas-to-syngas — retrofit after research |
| oxygen | 5.06 | 4.48 | Excess from electrolysis; only consumer is sb-oxide-01 (1.59/s) |
| sand | 3.61 | 3.61 | From soil-separation-2; no useful consumer at scale |
| ammonia | 0.81 | 0.81 | From urea-decomposition; no consumer at current tech |
| blood | 1.17 | 1.17 | Excess from full-render-cottongut; only consumer is animal-sample-01 |
| coarse | 0.83 | 0.83 | From soil-separation-2; processed by 1 classifier (see [§ Coarse processing](#coarse-processing)) |
| gravel | 0.17 | 0.17 | Phantom from sb-grade-03 (excluded from solver); negligible |
| iron-oxide | 0.12 | 0.12 | Phantom from sb-grade-01 (excluded from solver); negligible |
| grade-2-tin | — | 0.09 | From tin screening; LP doesn't use grade-2-crush-tin (1 building not worth 0.09/s ore savings) |

**Eliminated by stone-import optimization:** sb-grade-01/02 (was 7.84/s combined). All sb-grade intermediates now fully consumed internally — see [§ Stone-import optimization](#stone-import-optimization).

## Rejected optimizations

Investigated and rejected during design:

| Optimization | Why rejected |
|---|---|
| **Dedicated cage recipe** | Cage loop is net-zero (1 in → 1 out from vrauks rendering). Removing saves 18 smelting buildings |
| **stopper-2** (rubber) vs stopper (coal+latex) | stopper-2 is more expensive — rubber costs more to produce than coal+latex at current scale |
| **sand-void-glass** (5 sand + 4 ore-quartz → 10 molten-glass) | LP includes it in recipe list but doesn't use it — glass-1 (6 ore-quartz → 10 molten-glass) is cheaper because sand is free to void |
| **coarse-classification in solver** | Causes LP Phase 1 infeasibility when added to recipe set. Handled manually with 1 classifier instead (see [§ Coarse processing](#coarse-processing)) |
| **Combined Variant A + B** | Three test runs all failed — see [§ Why the variants can't be combined](#why-the-variants-cant-be-combined) |
| **Full self-power from raw-coal** | Would need ~57/s additional raw-coal, worse than baseline total. Byproduct self-power (~22 MW) is sufficient |
| **wpu-mk01-turd** | Not available — must use wpu-mk01 for wood processing |
| **Zinc ore crushing** | zinc-plate-1 recipe has 3.33:1 ore ratio via crushing, but needs iron-stick input — adds iron demand complexity |
| **Titanium ore crushing** | 4-step crushing chain produces gravel (another stone-source exploit risk), and the 1.875:1 ratio savings don't justify 4 extra buildings at this scale (only 1 titanium furnace) |
| **Tin crusher (grade-2-crush-tin)** | LP doesn't use it — 0.09/s grade-2-tin waste isn't worth 1 building for the ore savings. Included in recipe list but LP sets count to 0 |

## Design notes for block layout

- **cooling-tower-mk01**: place 1 after polybutadiene's steam output, converts 48.61/s excess steam → water@100°C. Reduces water import by ~8%. ~0.8 kW power draw. Not in solver — LP abuses it to replace all water imports with steam imports.
- **Byproduct fuels for self-power** (oil-boiler-mk01 eff 2 + steam engine eff 0.5, net MW = rate × fuel_value):
  - Variant B burn all: syngas 17.28 + gasoline 1.88 + naphthalene-oil 1.19 + carbolic-oil 0.29 + middle-oil 0.17 + coal 1.42 (solid boiler eff 1) = **22 MW** (21% of 105 MW)
  - Variant B export syngas, burn rest: 22 − 17.28 = **~5 MW** (5% of 105 MW)
  - Variant A: coal-gas 19.55 + coal 7.46 + creosote 0.95 + middle-oil 0.78 = **~29 MW** (28% of 105 MW), no syngas export
  - Syngas (43/s, Variant B only) is more valuable as bus fuel export than burned locally
- **Flue-gas**: no consumer at current tech. Exhaust pipe void only. Retrofit with fluegas-filtration after `filtration` tech is researched (requires logistic-science-pack).
- **Sand**: 3.61/s excess. sand-void-glass available but LP doesn't use it (voiding sand is cheaper than the ore-quartz savings).
- **Coarse-classification**: 1 classifier outside solver, 4% utilization. See [§ Coarse processing](#coarse-processing).

## Ore crushing optimization

**Root cause:** Direct smelting recipes are extremely ore-inefficient. Iron: 8 ore → 1 plate (8:1). Copper: 8 ore → 1 plate (8:1). Tin: 40 ore → 4 plates (10:1). Lead: 6 ore → 1 plate (6:1). Crushing/screening paths are dramatically more efficient.

**Crushing paths (Variant B):**

| Metal | Path | Ore:Plate ratio | Savings vs direct |
|---|---|---:|---:|
| Iron | grade-1-iron-crush (jaw-crusher) → low-grade-smelting-iron (stone-furnace) | 5:1 | −37% |
| Copper | grade-2-copper (screener) → grade-1-copper-crush (jaw-crusher) → copper-plate-4 (stone-furnace) | 5:1 | −37% |
| Tin | grade-1-tin (screener) → tin-plate-2 (stone-furnace) | 3.75:1 | −63% |
| Lead | grade-1-lead (screener) → lead-plate-2 (stone-furnace) | 2:1 | −67% |

**LP stone-source exploitation pattern:** Every crushing recipe produces stone as a byproduct. Without `stone:exclude` constraints, the LP scales ANY stone-producing recipe to source stone for Moss-2 and sodium-alginate, creating massive waste. This pattern was already seen with antimony screening. The fix is identical: exclude stone from all crushing recipe products. The stone is still physically produced in-game (phantom byproduct ~0.36/s from iron-crush + copper-crush) but the LP can't scale up to source it.

**Forcing copper crushing:** With stone excluded, the LP won't voluntarily use grade-1-copper-crush because the building cost outweighs the marginal ore savings at this scale. The screening-only path needs 58.71/60s copper-ore. Cap at `--max-import "copper-ore:55"` forces the LP to use the full crush path (46.97/60s copper-ore, under cap).

**Tin crusher not used:** The LP doesn't use grade-2-crush-tin (0 buildings). Grade-2-tin (0.09/s) is waste. Using the crusher would save ~0.09/s ore-tin at the cost of 1 building — not worth it.

**Impact (Variant B):**

| Resource | Before crushing | After crushing | Change |
|---|---:|---:|---|
| iron-ore | 1.63/s | 1.02/s | −37% |
| copper-ore | 1.25/s | 0.78/s | −37% |
| ore-lead | 1.06/s | 0.35/s | −67% |
| ore-tin | 1.15/s | 0.87/s | −25% |
| stone | 2.00/s | 1.64/s | −18% (phantom stone from crushing supplements import) |
| Buildings | 205 | 206 | +1 (26→27 in smelting section) |

## Stone-import optimization

**Root cause:** The LP was running 5.25 screeners (sb-grade-01 recipe) to meet stone demand from Moss-2 (1.52/s) and sodium-alginate (0.58/s). Only 0.93 screeners were needed for actual antimony demand — the other 4.32 (82%) ran purely as a stone source. This created 5.25/s sb-grade-01 and 2.59/s sb-grade-02 as waste.

**Fix:** Three exclude constraints (`sb-grade-01:stone:exclude`, `sb-grade-02:stone:exclude`, `sb-grade-03:gravel:exclude`) prevent the LP from counting stone and gravel as products of antimony recipes. Stone becomes a raw import (1.64/s with ore crushing, 2.0/s without). The antimony chain runs at its natural rate (0.22x screener), perfectly balanced:

```
antimonium-ore (0.43/s) → sb-grade-01 (0.22/s) → sb-grade-02 crusher (all consumed)
                                                 → sb-grade-02 (0.56/s, all to sb-grade-03)
                                                 → sb-grade-03 → sb-grade-04 → sb-oxide
```

All sb-grade intermediates consumed internally. Zero waste.

**Impact:** −4 buildings, −96% antimonium-ore import, +stone import (1.64/s with ore crushing, 2.0/s without — a basic mined resource). Variant A loses zero-iron-ore property (needs 0.25/s) because iron-oxide from reduced screening drops from 1.05/s to 0.013/s.

**Phantom byproducts:** The antimony recipes still physically produce stone (0.10/s), gravel (0.17/s), and iron-oxide (0.12/s) — these are excluded from the solver but exist in-game. All negligible; box or void.

## Coarse processing

Coarse (0.83/s from soil-separation-2) is processed by 1 classifier (not in solver — causes LP infeasibility when included).

**Recipe:** coarse-classification — 20 coarse → 5 stone + 2 iron-oxide + 4 gravel (1s, classifier)

At 0.83/s coarse input: 0.83/20 = 0.0415 classifiers (4% utilization).

**Products:**
- stone: 0.21/s → supplements stone import or buffers
- iron-oxide: 0.08/s → supplements iron-oxide-smelting (Variant A) or void
- gravel: 0.17/s → can feed stone-to-gravel reverse (4 stone → 3 gravel) or gravel-to-sand if needed

All products are negligible at this scale. The classifier exists to prevent coarse backup, not for meaningful production.

## TODO

- [ ] Validate ore crushing for Variant A (copper/tin/lead — iron uses iron-oxide-smelting)
- [ ] Split into 3 blocks (battery/chemistry, bio/farming, assembly)
- [ ] Block boundary declarations (imports/exports between blocks)
- [ ] Verify self-power buildings don't significantly change total building count
- [ ] Choose Variant A or B based on game state
- [ ] Retrofit flue-gas processing after filtration tech researched
