# Steel plate block — 0.75/s output

264 consumers — highest consumer count in Pyanodon. Feeds locomotives (30 each), wagons, rail, train-stop, pipes, buildings. Sized to 15/s iron-ore import budget (shared ore train with iron plate block).

## Recipe table

```
┌──────────────┬───────────────────────┬───────┐
│ Recipe       │ Factory               │ Count │
├──────────────┼───────────────────────┼───────┤
│ steel-plate  │ advanced-foundry-mk01 │    12 │
└──────────────┴───────────────────────┴───────┘
```

14.4 MW electric

## Stations (4)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| iron-ore | unload | iron-ore (item) | 15.0 |
| coke | unload | coke (item) | 3.75 |
| limestone | unload | limestone (item) | 3.75 |
| steel-plate | load | steel-plate (item) | 0.75 |

## Sizing rationale

- steel-plate recipe: 20 iron-ore + 5 coke + 5 limestone → 1 steel-plate in 15s
- Per advanced-foundry-mk01 (speed=1): 0.0667/s
- 15/s iron-ore ÷ 20 ore/plate = 0.75/s steel-plate → 12 buildings
- 0.75/s steel = 2.25/s rail (3 per craft) = 135 rail/minute
- A city block rail infrastructure ≈ 400 rails → one block every ~3 minutes of continuous production
- Mall demand is batch (not continuous) — steel buffers between bursts. Rail expansion is the primary consumer.

## Tile footprint

| Component | Size | Count | Tiles |
|---|---|---|---|
| advanced-foundry-mk01 | 6x6 | 12 | 432 |

Single stamp, fits one city block easily.

## Upgrade path (rule 23)

advanced-foundry-mk02 (speed=2) is a drop-in upgrade — same recipe, double throughput. 12 mk02 → 1.5/s steel, or keep 0.75/s with 6 buildings. No layout changes needed.

## Methodology self-review

- Rule 4 (alternatives): steel-plate is the only unlocked steel recipe. steel-from-barrels exists but barrel sourcing adds complexity for no benefit at this scale.
- Rule 8 (power): 12 × 1.2 MW = 14.4 MW electric. No burner fuel.
- Rule 14 (inline vs dedicated): 264 consumers — dedicated block mandatory.
- Rule 20 (space budget): 432 tiles, single stamp. Well within city block.

## Helmod import string

Solver command: `npx tsx src/cli.ts solve --recipes "steel-plate" --target "steel-plate:0.75" --time 1 --unlocked --factory "steel-plate:advanced-foundry-mk01" --export helmod`

```
eJyFkjFPwzAQhff+ilNmiggSYvLCwMbSFaHIta9g1TkH+1KIqvx3nNZxXETFFN939+L3LtEOrFPSQiOOKwBlZQiienEabXUTwQF9MI7E/VSwaVHU02kbRfvGO8cnWRY+TfwkBDBaVOe5OhGSUV8FRrTrzkrGxHnoIk+F+yL0udoOTeed7hUL9j1muJOKnR/ETtqQaHA2ui2J+jBWe6TkEWBT52O2vEFlutnJ7HtTl4A0fou7BVzLsWTxv1+aQkyrrBf62UtreBAVOd9KW8zP+Ra72fDzuVUMz46kPkhSqNc715O2w7rd39UXc9cvBJBtVHGZE6CNri0GcRwzHJf+FqVyVHTPzzSRIoec4fViZW9Ftv8Xahjbi0/S9dHq7ePDXzcbeveoDRInb2P+Z09gXHnk3hM0KyT9AxSAz4g=
```

## Notes

- Previous design was 5/s (75 buildings, 100/s iron-ore). Resized to match 15/s iron-ore import budget — same ore train capacity as iron plate block.
- If steel demand exceeds 0.75/s during heavy expansion, buffer chests absorb spikes. Upgrade to mk02 foundries before adding a second stamp.
