# Oxygen block — 240/s oxygen output (electrolysis + hydrogen power recovery)

Dedicated oxygen production via water electrolysis. Hydrogen byproduct burned in oil-boilers for partial power recovery, with export station for future consumers (ralesia, diborane, sb-oxide). Sized for 2x BOF iron stamps (216/s) plus headroom for fish farming, antimony processing.

## Recipe table

```
┌──────────────────────────────────┬───────────────────┬───────┐
│ Recipe                           │ Factory           │ Count │
├──────────────────────────────────┼───────────────────┼───────┤
│ hydrogen (electrolysis)          │ electrolyzer-mk01 │    24 │
│ oil-boiler-mk01 (hydrogen burn)  │ oil-boiler-mk01   │     4 │
│ steam-engine (power recovery)    │ steam-engine      │    13 │
└──────────────────────────────────┴───────────────────┴───────┘
```

41 buildings, 192 MW net electric

## Stations (3)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| water | unload | water (fluid) | 914.5 |
| oxygen | load | oxygen (fluid) | 240.0 |
| hydrogen | load | hydrogen (fluid) | 0–480 (future export) |

## Electrolysis math

- hydrogen recipe: 300 water → 200 hydrogen + 100 oxygen in 10s
- Per electrolyzer-mk01 (crafting_speed=1): 30/s water → 10/s oxygen + 20/s hydrogen
- 24 electrolyzers: 240/s oxygen + 480/s hydrogen, consuming 720/s water
- Solver-validated at 240/s target

## Hydrogen burn (power recovery)

Oil-boiler-mk01 burns hydrogen for steam, steam-engines convert to electricity.

**Oil-boiler-mk01 specs:**
- max_energy_usage: 493,500 J/tick = 29.61 MW thermal per boiler
- fluid_energy_source effectivity: 2 (doubles hydrogen fuel_value)
- Steam output: 29.61 MW / (2,100 J/unit/C x 235C) = 60.0/s steam per boiler
- Hydrogen consumed: 29.61 MW / (100 kJ x 2) = 148.1/s per boiler

**Steam-engine specs:**
- fluid_usage: 0.25/tick = 15/s steam
- effectivity: 0.5
- Power output: 15/s x 2,100 x 235 x 0.5 = 3.701 MW per engine

**Ratio: 1 oil-boiler feeds 4 steam engines** (60/s steam / 15/s per engine = 4)

**Block totals (burning all 480/s hydrogen):**
- 4 oil-boilers consume 480/s hydrogen (3.25 boilers at full load, 4th partially loaded)
- 4 boilers produce 194.5/s steam
- 13 steam engines consume 194.5/s steam → 48.0 MW electric
- Boiler water input: 194.5/s

## Water budget

| Component | Water/s |
|---|---|
| 24 electrolyzers | 720.0 |
| 4 oil-boilers | 194.5 |
| **Total** | **914.5** |

914.5/s is significant — requires dedicated water supply (offshore pumps or trained water). Fluid transport advantage (rule 19) applies: pumps handle this throughput easily.

## Power budget

| Component | MW |
|---|---|
| 24 electrolyzer-mk01 (gross) | 240.0 |
| 13 steam-engine recovery | -48.0 |
| **Net deficit** | **192.0** |

Electrolyzers dominate. Hydrogen burn recovers 20% of gross power cost.

## Byproduct classification (rule 5)

| Byproduct | Rate/s | Classification | Handling |
|---|---|---|---|
| hydrogen | 480.0 | (b) valuable to other blocks + (d) burn for power | Overflow-to-burn: export via hydrogen station first, excess feeds oil-boilers. When export consumers appear (ralesia 100/s, diborane 250/s), power recovery drops but hydrogen captures more value. |

## Oxygen consumers (current + planned)

| Consumer | Recipe | Oxygen/s | Status |
|---|---|---|---|
| BOF iron (10.8/s plate) | molten-iron-05 | 108.0 | Next to build |
| BOF iron stamp 2 (10.8/s) | molten-iron-05 | 108.0 | Future |
| Antimony oxide | sb-oxide-01 | 5.0/bof | Post-bio |
| Fish farming | breed-fish-1 | 0.4/farm | Post-bio |
| Black liquor (aromatics) | black-liquor | 20.0/gasifier | Has alternatives |

240/s covers 2x iron stamps + misc with headroom.

## Tile footprint

| Component | Size | Count | Tiles |
|---|---|---|---|
| electrolyzer-mk01 | 6x6 | 24 | 864 |
| oil-boiler-mk01 | 5x5 | 4 | 100 |
| steam-engine | 3x5 | 13 | 195 |
| **Total** | | **41** | **1,159** |

Fits one city block. Boiler-engine pairs can line up along a block edge (4 boilers + 13 engines in a compact row).

## Upgrade path (rule 23)

electrolyzer-mk02 is a drop-in upgrade — same recipe, higher crafting_speed. Fewer electrolyzers needed for 240/s, or keep 24 for higher output. Oil-boiler/engine section unchanged.

## Methodology self-review

- Rule 4 (alternatives): only 1 unlocked oxygen recipe. No alternative.
- Rule 5 (byproducts): hydrogen classified as (b) export + (d) burn. Overflow-to-burn pattern.
- Rule 8 (power): 240 MW gross, 192 MW net. Computed correctly.
- Rule 9 (burn block fluids): hydrogen is the only burnable output. Evaluated all outputs.
- Rule 14 (inline vs dedicated): multiple future consumers justify dedicated block at 240/s.
- Rule 19 (fluid transport): oxygen and hydrogen are both fluids — cheap to transport.
- Rule 20 (space budget): 41 buildings, 1,159 tiles. Fits city block.

## Helmod import string

Core electrolysis only (24 electrolyzer-mk01). Boiler/engine power section is manual layout — Helmod doesn't model fluid_energy_source.

Solver command: `npx tsx src/cli.ts solve --recipes "hydrogen" --target "oxygen:240" --time 1 --unlocked --factory "hydrogen:electrolyzer-mk01" --export helmod`

```
eJx1krFywyAMhvc8Bee5vYtzXVk6dOuSF/BhUBIuGLkC2tCc3712jDFp08nok4T+X1ghMyiFYQ2/bhiTRjjHq3dUYKqnEXwCOY2W76bA6w54PZ3asencEKK/teXG14nfGhnTildzXZ2IFWN/dYqK8Ag2QR/7EaYAvyxQjtrY9IQqSM89BcjwIKRHivwgjEvUoRmllkSetFEENglkbF/nY9a7B6l7SOMW0fu6BFbBhW9X8NDEaoR+35gcTEusV/oRhNE+8soidcIU9Yu5VWtW+zaniuJFDhiQntDEb6Dn7ryt72r+H8aY6DBYXxpkrBsVG3D8OmQ4rPkWhERbZOdvqkh2XdaPl3gsXmFRPOM/6zuYoNXd+vvg+e5l+2iWtkcCpcH6pGbI/+YNDBsCH8iyZgNW/QCEmsfr
```

## Notes

- Water demand (914.5/s) is the primary infrastructure constraint. Plan water supply before building.
- Hydrogen export is future-proofing: ralesia farming (100/s H2, bio chain), diborane (250/s H2, borax processing). Each consumer that takes hydrogen reduces power recovery but captures more value.
- This block enables BOF iron casting (rule 21) — the best iron plate ratio (1.4:1) but requires oxygen as input. Without this block, iron uses low-grade smelting (3:1).
