# Water-saline block — 150/s output (stone-voiding, 60 washers)

Dual purpose: produce water-saline for e-circuit Phase 1, and centralized stone voiding (low-priority consumer of stone from ore processing byproducts). Stone is ubiquitous waste from ore crushing — this block turns it into something useful.

## Recipe table

```
┌──────────────┬────────┬───────┐
│ Recipe       │ Factory│ Count │
├──────────────┼────────┼───────┤
│ saline-water │ washer │    60 │
└──────────────┴────────┴───────┘
```

60 buildings, 24 MW electric

## Stations (4)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| stone | unload | stone (item) | 30.0 |
| stone | unload | stone (item) | 30.0 |
| water | unload | water (fluid) | 300.0 |
| water-saline | load | water-saline (fluid) | 150.0 |

2 stone unload stations (split 30/s across two for belt throughput). Water trained in (300/s = 18,000/min).

## Production math

- saline-water: 10 stone + 100 water → 50 water-saline in 20s
- Per washer (speed=1): 2.5/s water-saline, 0.5/s stone, 5/s water
- 60 washers: 150/s water-saline, 30/s stone, 300/s water

## Stone sourcing

Stone is a byproduct of nearly every ore processing chain (12 unlocked recipes produce it): iron, copper, nickel, chromium, zinc, tin, titanium, antimony crushing, coarse classification, quartz crushing. Block acts as centralized stone sink — import from wherever stone accumulates. Low priority: runs when stone is available, idles when it isn't.

## Water-saline consumers

| Consumer | Rate/s | Phase | Permanent? |
|---|---|---|---|
| E-circuit Phase 1 (battery-mk00) | 166.67 | Phase 4 | No — gone after Phase 8 retrofit |
| Fish-oil block (breed-fish) | 4.31 | Built | Yes |
| Gunpowder, creatures | small/batch | Various | Negligible |

Demand is mostly temporary. 150/s covers ~90% of peak e-circuit demand. Block stays useful permanently as stone sink.

## Tile footprint

| Component | Size | Count | Tiles |
|---|---|---|---|
| washer | 6×6 | 60 | 2,160 |

2,160 tiles. Fits in one city block (verified in-game).

## Recipe alternatives (rule 4)

5 unlocked water-saline recipes:
- **saline-water / stone (chosen)**: 60 washers. Stone is free byproduct, dual purpose as voiding.
- **water-saline / salt**: 2 washers for same output. 20× more efficient per washer, but salt mine is far away.
- **gravel-saline-water**: same throughput as stone, extra crushing step. No advantage.
- **tar-quenching**: byproduct recipe, not primary production.
- **sodium-hydroxide-void**: recycling recipe, not primary production.

Salt route is dramatically better per-building but requires remote outpost. Stone route chosen for proximity and dual-purpose voiding. If salt mine becomes accessible later, could replace entire block with 2 washers + miners.

## Upgrade path (rule 23)

- washer-mk02 (speed=2): halves to 30 washers for same output. Drop-in.
- Salt mine outpost: replaces entire block with 2 washers if distance becomes non-issue.

## Methodology self-review

- Rule 4: 5 recipes, saline-water (stone) chosen for dual purpose (production + voiding)
- Rule 5: no byproducts (clean recipe)
- Rule 14: 9 unlocked consumers → dedicated block justified
- Rule 20: 2,160 tiles, 60 buildings — fits one block (verified)
- Rule 24: 150/s covers ~90% of peak e-circuit demand (167/s)

## Helmod import string

Solver command: `npx tsx src/cli.ts solve --recipes "saline-water" --target "water-saline:150" --time 1 --unlocked --factory "saline-water:washer" --export helmod`

```
eJx9krFuwyAQhnc/BWJupLhSR5YO3bpkrSqLwLlBxeAc0NSK/O7FNsYkajuZ+++O+/7D0hJtBdekYdeKEKG5c4y+WgmaPkThC9Apa9jjFHjVAaun0zE2fTZorZ/bcuPzpM+NhCjJ6FJXJ8Xw2E8d18rA7sI9YEr4oY+JFNiLAczRcWh6tDIIzzwGyGLLhbc4sJZrl1RndcQtFXFSWiKYBEnIoc7HzHwAoXpI41bwQ10KRsI322/Cn0Y2M3h/a3IxLbPe1HOIl/iBUWOx47qoXw1uvJn4ZUkVxSvShbvTDcx/EwjhnQ3Gl84I6SKmBseuYxbHLX8ELqwpsss3VSSPLkO/0Xk7u2VV9L1wswIX6fsdtjooefMOffCsftr/NluZDwSpwPhEN+YfdRbGCsEHNKSpwMgfhxrMIw==
```
