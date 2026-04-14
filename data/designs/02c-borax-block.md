# Borax block — 12/s borax output (mining + washing)

Mining block: borax ore → raw-borax → borax. Imports syngas as mining fluid from syngas block (02b). Washing inline — exports borax, not raw-borax.

## Recipe table

| Recipe | Factory | Count |
|---|---|---|
| borax (mining) | borax-mine | 9 |
| borax-washing | washer | 9 |
| **TOTAL** | | **18** |

7.4 MW electric.

## Stations (2)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| syngas | unload | syngas (fluid) | 300 |
| borax | load | borax (item) | 12 |

Water (193/s) piped — build near water or use mk02+ fluid wagon.

## Mining math

- Borax resource: `mining_time=1.5`, `required_fluid=syngas`, `fluid_amount=25`
- borax-mine: `mining_speed=2`
- Per miner: 2 / 1.5 = 1.333/s raw-borax, 25 × 1.333 = 33.33/s syngas consumed
- 9 miners: 12.0/s raw-borax, 300/s syngas

Syngas block (02b) produces 310/s. This block consumes 300/s — 10/s surplus stays in syngas cascade export.

## Washing math

- borax-washing: 10 raw-borax + 150 water → 10 borax + 100 muddy-sludge in 7s
- Per washer (crafting_speed=1): 1.429/s raw-borax → 1.429/s borax
- 9 washers: 12.86/s capacity, consuming 12.0/s raw-borax → 12.0/s borax (93% utilization)
- Water: 9 × 150/7 = 192.9/s
- Muddy sludge: 9 × 100/7 = 128.6/s → sinkhole

## Byproducts

| Byproduct | Rate/s | Disposition |
|---|---|---|
| muddy-sludge | 128.6 | sinkhole |

## Tile footprint

1,053 tiles (9× borax-mine 81 + 9× washer 36). Very compact — fits one city block with ample room for piping and sinkhole.

## Notes

- Must be placed on a borax ore patch with 9+ mining positions.
- 12/s borax supports 2 iron plate blocks (each needs 5.94/s borax) with 0.12/s surplus.
- No Helmod export — miners are not solver recipes. Place miners on ore patch, belt raw-borax to washers, pipe syngas from train station to miners.
- Syngas block (02b) paired 1:1 with this block. Build them together.
- Sinkhole placement: single sinkhole covers 128.6/s muddy-sludge (sinkhole capacity is 240/s).

## Scaling

- Add miners as ore patch allows. Each additional miner needs 33.33/s more syngas and 1 more washer.
- At 310/s syngas (full block output), max 9 miners (300/s used). For 10+ miners, stamp syngas block.
