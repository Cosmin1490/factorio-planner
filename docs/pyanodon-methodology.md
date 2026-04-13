# Pyanodon Pipeline Methodology

A framework for designing production pipelines in Factorio with the [Pyanodon modpack](https://mods.factorio.com/user/pyanodon). Developed through iterative play using Claude as a solver copilot — describing what to produce, exploring recipe alternatives, running the solver with constraints, and refining until the numbers work.

Most of these principles apply to any complex Factorio overhaul mod (SeaBlock, Space Exploration, etc.), but the specific examples, numbers, and data quirks are Pyanodon-specific.

---

## Comparing alternatives

1. **Identify the bottleneck** — most expensive input (deep chain, slow buildings, rare ores, animal husbandry). When the target depends on a key intermediate, search for chains that maximize production of that intermediate — don't just compare recipes that directly produce the target. Example: acetylene needs coke; the tar refining chain yields 6x more coke per raw-coal than coke-coal, making it the better fuel path despite not producing fuel directly.
2. **Trace alternatives to the shared bottleneck** — compare per-unit consumption of the limiter. If both paths converge on the same expensive intermediate, the "upgrade" is a trap. **Exception**: if alternative B *consumes* a byproduct that alternative A must void, that's symbiosis, not convergence — explore it. A problematic byproduct becoming a useful input flips the economics.
    
    **Also search demand-side.** When a resource becomes expensive, don't only look for cheaper ways to produce it (supply-side) — check whether each consumer actually needs it. For every consumer of the expensive item, run `recipes --produces <consumer's output> --unlocked` and look for alternative recipes that bypass the expensive intermediate entirely. Example: stopper-2 (rubber) vs stopper (coal+latex) — both produce stoppers for flasks, but stopper avoids the entire rubber→polybutadiene→aromatics chain. This demand-side switch saved 33% aromatics, more than any supply-side tar optimization could. Supply-side asks "what's the cheapest way to make X?" Demand-side asks "does this consumer really need X?"
    
    **Check existing waste streams before new production.** Before building a new raw-material chain, check if any existing block already produces the needed item as a voided or surplus byproduct. Voided outputs are free inputs — zero mining, zero new infrastructure upstream. Example: needing 80/s aromatics, the obvious path was tar-distilation from raw-coal (93/s raw-coal, 24 mining drills). But the existing tar refinery voids 280/s pitch and 60/s middle-oil — pitch-refining + light-oil-aromatics converts that waste into 86/s aromatics with zero mining. Rule 13 (re-audit) identifies surplus outputs; this step turns them into supply sources.
3. **Normalize to same output** — cost per 1 unit of output, not per craft. 4x output at 2 inputs beats 2x at 1.
4. **Rank by:** efficiency (raw materials/output) > complexity (recipes/buildings) > convenience. Watch for "later game" recipes that exist to consume excess byproducts — traps at early tech. **Always run the numbers before eliminating** — two paths sharing an upstream input can have wildly different per-unit consumption. Don't dismiss on structural similarity alone; quantify first.
    
    **Include upstream cost of new imports.** When recipe alternatives differ in imports, check the block inventory: does each import already have a supplier? If yes, it's free — just a train station. If not, the real cost includes the entire upstream block: power, buildings, byproduct handling, and design time. A recipe saving 6 local buildings but requiring a new 10 MW electrolyzer block with chlorine/hydrogen venting is more expensive in total, not less. Imports with many future consumers (NaOH serves electrochemistry broadly) amortize their upstream cost across blocks; single-purpose imports don't — prefer the alternative with an already-available or trivially-produced import. Example: cellulose-02 (2 biofactories, imports NaOH — no supplier, 10 MW electrolyzer, byproduct venting) vs cellulose-00 (8 hpf, imports limestone — trivial mining). The local savings are real but the system cost is higher.

## Byproduct management

### Solver-level

5. **Classify before linking** — (a) recyclable into the same chain -> recycle (reduces input demand, always check first), (b) valuable to another block -> export, (c) convertible to something valuable -> convert then export, (d) pure waste -> void (py-burner for non-fuel solids, sinkhole for liquids, exhaust for gases). Solid fuels (coal, coke, raw-coal, wood) require conversion to fluids before voiding. Prefer (a) > (b) > (c) > (d). Use overflow-to-void to combine: try to export, void only surplus. **Always check recycling before voiding** — if a byproduct converts back to an input of the same chain (even at a poor ratio), run the numbers. One extra building for 5-10% free efficiency is almost always worth it.
6. **Match the limiting reagent** — don't force the abundant byproduct to zero; that over-scales the consumer and imports the scarce one. Let the scarce one set the pace. Use `--constraint "recipe:product:exclude"` + `--max-import "scarce-input:0"`.
7. **Recycle intermediates through every producing step** — when multiple recipes produce the target as byproduct (coal chain: raw-coal -> coal -> coke -> coal-gas all produce tar), force intermediates back with `--max-import item:0`. Coal chain: 3x raw-material reduction (33 -> 11/s for 100 tar/s).

### In-game

Multi-product recipes stall completely when ANY output buffer is full. Every product must have somewhere to go.

- **Voiding buildings**: sinkhole (liquids), exhaust pipe (gases), py-burner (non-fuel solids). The py-burner is a furnace that requires solid fuel (accepts chemical, biomass, jerry, and nuke categories) and uses `*-pyvoid` recipes (category `py-incineration`, crafting_speed 5) to probabilistically destroy items — typically 80% destroyed per cycle (1 in -> 0.2 out at probability). One py-burner handles several items/s. **Solid fuels (coal, coke, raw-coal, wood) have NO pyvoid recipes and cannot be destroyed** — they are consumed as fuel by the burner, producing `burnt_result` (ash for coal/coke/raw-coal). To void a solid fuel, convert it to fluids first (e.g., `coal-gas-from-coke`: coke -> coal-gas + tar + ash), then void the fluids and pyvoid the ash. **Note:** `recipes --consumes` does not show pyvoid recipes (filtered category). Use prototype data to verify: `data.recipes["<item>-pyvoid"]`.
- **Ash loop pattern** — the py-burner's fuel produces ash as `burnt_result`, and ash has a pyvoid recipe. Feed the ash back into the same burner as the item to destroy: the burner consumes fuel (producing ash), destroys 80% of the ash input, and the 20% remainder recirculates. The loop converges to zero — each cycle destroys 80%, so residual ash shrinks exponentially. One py-burner handles both the primary waste item AND its own fuel ash with a single belt loop. Common pattern used in any block that produces non-fuel solid waste (e.g., aluminium block voids iron-oxide this way).
- **Convert before voiding when the intermediate has value** — conversion captures value but has a cost: the conversion recipe must keep pace with production. Always compute the building ratio before committing — when conversion is too expensive, pyvoid directly instead. Viable example: `coal-gas-from-coke` (4 coke/s per distilator). Value-capture example: stone -> saline-water (10 stone + 100 water -> 50 water-saline) creates a useful intermediate; apply overflow-to-void on the saline-water, export what consumers need, sinkhole the rest.
- **Overflow-to-void pattern**: don't void blindly — prioritize real consumption, only void surplus. Wire a pump or overflow valve with circuit condition: fill the load station buffer first, overflow excess to a sinkhole/exhaust. When a consumer eventually connects, trains pull from the station and less goes to void automatically. No block redesign needed. Example: tar refinery produces 280/s pitch with no current consumer — overflow valve after the pitch tank routes excess to sinkhole, block keeps running for creosote/gasoline/coke/middle-oil.
- **Primary products can back up too** — not just byproducts. If the main export has no consumer and isn't voided, the entire block stalls, including internal chains that feed other exports. Example: aluminium block stalls entirely when plates back up — coal chain stops, no coal-gas for mining fluid, drilling halts. Apply overflow-to-void on primary products with intermittent demand, or ensure a consumer exists before building.

## Power & energy

**Steam producer throttling:** all boilers (electric and oil) stop when their steam output buffer is full. No steam draw -> no fuel/electricity consumed. Rated power is peak, not constant — actual cost tracks steam demand. Don't overestimate power budget based on rated values.

8. **Account for power cost, use unlocked tiers** — total MW = count x energy_usage x 60. Electric boilers (25 MW rated) often dominate peak budget. Always `--factory` with unlocked tiers — solver auto-picks mk04 which are usually locked.
9. **Burn byproduct fluids for steam** — oil boiler mk01: effectivity=2, 0 MW electrical. `fuel_rate = (steam_rate x heat_capacity x dT) / (fuel_value x effectivity)`. Pyanodon water heat_capacity=2,100, dT=235. Fluid fuel_value in `data.fluids` not `data.items`. After splitting into sub-factories, check if byproduct fluids (syngas, pitch, gasoline) cover the sub-factory's own boiler needs — often they do (rubber sub-factory: syngas 177/s + pitch 44.8/s covers its 32/s steam at 250C+). **Produce steam locally, never train it** — train in fuel fluids if local byproducts don't cover demand, but always boil on-site.

    **Fuel categories are not interchangeable.** Solid fuels belong to distinct categories: `chemical` (coal, coke, raw-coal), `biomass` (wood), `jerry` (all canisters — acetylene, gasoline, light-oil, etc.), `nexelit`, `quantum`. Each burner entity accepts only specific categories — check `entity.burner_prototype.fuel_categories`. Key examples:
    
    | Entity | chemical | biomass | jerry | nuke | nexelit | quantum |
    |---|---|---|---|---|---|---|
    | locomotive (mk01) | yes | yes | — | yes | — | — |
    | mk02-locomotive | — | — | yes | yes | — | — |
    | ht-locomotive (mk03) | — | — | — | — | yes | — |
    | stone-furnace | yes | yes | — | — | — | — |
    | assembling-machine-1 | yes | yes | — | — | — | — |
    | assembling-machine-2 | yes | yes | yes | — | — | — |
    | assembling-machine-3 | yes | yes | yes | yes | — | — |
    | py-burner | yes | yes | yes | yes | — | — |
    
    All canisters have the same fuel_value (10,000,000 J) regardless of the fluid inside. When planning fuel imports for a block, verify the consumer entity accepts the fuel category. Jerry fuels follow the container pattern (like barrels/cages) — fill at source (`empty-fuel-canister` + fluid → canister), burn at consumer, empty canister returns. No net canister consumption; plan for the return logistics (canister unload at filler, canister load at consumer).

## Block delta planning

When planning a major expansion (new science tier, new end product), the macro-level process determines WHAT blocks to build before the micro-level rules (decomposition, boundaries, block design) determine HOW to design each one.

10. **Derive consolidated demand from targets** — start from end-goal recipes (science packs, building recipes) and trace demand backward through every intermediate. **Consolidate shared intermediates** — when multiple end products need the same item (rubber for both logistic-science stoppers and py-science-1 flasks), sum all consumers before sizing the supplier. Missing this leads to undersized blocks or duplicate chains.
    
    Steps: (1) write down end-goal recipes with **verified output counts** (rule 14) — multi-output recipes change demand by 10x+. (2) Trace each ingredient backward, recursively, until you hit a commodity boundary or existing block output. Watch for **container cycles** (water-barrel→bio recipe→barrel) and **catalyst cycles** (stone-brick→warm-stone-brick→stone-brick for hot-air) — these items appear as ingredients but have zero net consumption. The hand trace counts them; the solver correctly zeros them out. (3) At each intermediate, sum demand from ALL consumers — don't trace per-end-product. (4) Result: a demand table mapping item -> total rate -> source (existing block / new block / inline). (5) **Trace production recipes forward for byproducts** — for every supply source in the demand table, run `recipe-info` on its production recipe. If it has byproducts, immediately check: does any planned block consume this byproduct? Does the byproduct scale proportionally with demand? Is there a natural sink? If not, you need a consumer block or the byproduct will stall the producer. This is rules 5-7 applied at the planning stage, not just block design. Example: planning a COG@250 block without checking that `coke-coal` produces 4 coke per 20 COG — doubling COG demand doubles coke output with no sink. Acetylene production (via calcium-carbide) consumes coke, making it a necessary companion block, not an optional optimization. (6) **Solver-validate rates** — run the solver for each target down to boundary items and compare import rates against the hand-traced demand table. Hand traces are reliable for short chains (3-5 recipes) but systematically wrong for deep chains (10+ recipes): recycling loops zero out items the hand trace counted (barrel/cage cycling eliminated steel-plate demand entirely), shared intermediates get double-counted or misjudged, and byproduct credits flip items from deficit to surplus (logistic science produces 2.26/s coke, doesn't import it). The solver is the source of truth for rates; the hand trace is only for identifying *which* boundaries matter and *approximate* scale. Validation runs need the same rigor as production runs — include temperature-linked fluids, bio modules, and exclude constraints. A sloppy validation produces wrong numbers.

11. **Compute block delta from inventory** — compare consolidated demand against what's already built. The **block delta** is the set of new blocks needed to close the gap.
    
    Steps: (1) read the block inventory — what's built, what rate, what it exports. (1b) **Verify units match** — if demand is in item X but inventory produces item Y, find the conversion recipe and convert before comparing. Example: demand 9.4 wood/s vs inventory 1.47 log/s — `log-wood-fast` converts 4 log → 40 wood (10 wood/log), so actual supply is 14.7 wood/s (surplus, not a deficit). Skipping this step produces false shortfalls. (1c) **Use solver-validated rates** — compare solver import rates from rule 10 step 6 against inventory, never the hand-traced estimates. (2) For each demanded item: if existing supply >= demand, no new block needed; if not, compute shortfall. (3) Classify each shortfall by volume: **bus-scale** (>~0.5/s or Tier A/B consumers) -> dedicated block; **niche** (<~0.5/s, Tier C/D consumers) -> inline into consumer block. (4) Check mining requirements (rule 22) for any new ore — mining inputs may surface additional blocks or bus fluids. (5) Identify **bus fluids** — fluids that multiple new blocks import (e.g., acetylene for lead + titanium mining). These need their own export infrastructure and create ordering dependencies.

12. **Derive build order from dependencies** — topologically sort blocks by their input dependencies to get a phased build order.
    
    Steps: (1) for each new block, list what it imports and which block provides it. (2) A block can't run until all its suppliers exist (or the import is from an existing block). (3) Group into phases: phase 0 = blocks whose imports all come from existing blocks, phase N+1 = blocks whose imports come from phase <= N. (4) Identify the **critical path** — the longest chain of sequential dependencies; this determines minimum calendar time to the end goal. (5) Identify **parallel opportunities** — blocks in the same phase with no mutual dependencies. (6) **Start bio blocks early** regardless of phase — breeding bootstrap takes days of real time to reach full module slots. Even if a bio block's output isn't needed until phase 3, the organisms need time to multiply.

13. **Validate existing capacity against total demand** — after computing the block delta, sum ALL imports from each existing block across every new consumer and verify it can handle the total. This check is easy to skip because each new block's design looks fine in isolation — the failure only appears when you aggregate.
    
    Example: seaweed farm produces 6.4/s. Rubber needs 2/s (sodium-alginate), py-science needs 2.4/s (agar), logistic needs 0.5/s -> total 4.9/s, fits. But a fourth consumer pushing to 7/s means you need a second stamp. Also validate bus fluids: if acetylene serves iron smelting + lead mining + titanium mining, the fuel block must be sized for the total, not just its own iron consumption.
    
    **When capacity falls short, default to stamping.** A second copy of an existing block costs zero design time (rule 25) — paste the blueprint, connect trains, done. Redesigning a block costs human+Claude time to re-derive ratios, evaluate recipes, run the solver, and validate. Stamping is always the cheaper option per-instance, even if the stamp is "wasteful" in building count or uses suboptimal recipes.
    
    **Redesign can be worth it, but treat it as an investment.** Reasons to redesign instead of stamping: (1) better recipes/buildings are now unlocked that significantly improve efficiency (e.g., graded smelting at 2:1 replacing direct at 8:1 — half the ore, half the trains); (2) the existing block has known problems (stalls, belt coupling debt, wrong recipe choice discovered after building); (3) you expect to need many copies — a more efficient design amortizes the one-time design cost across every future stamp. The question isn't "is the new design better?" (it usually is) but "does the improvement justify the design cost?" If you only need 1-2 copies, stamp the existing one. If you'll need 5+, or the existing design wastes a scarce resource (ore deposits, train throughput), the redesign pays for itself.
    
    **Re-audit existing blocks when planning any new expansion.** Don't assume block inventory is static — blocks built for one purpose may now have zero consumers (aluminium block before chemical science), may be stalled due to backed-up outputs (tar refinery with no pitch consumer), or may be oversized (methanal at 8.9/s serving 0.2/s demand). For each existing block, check: (1) does every output still have a consumer? (2) is the block actually running or stalled? (3) do any new consumers change the demand picture? Re-audit is cheap (run consumer queries, check block inventory) and catches drift that's invisible when you only look at new blocks. **Oversized blocks are not problems** — idle buildings cost zero resources. Only flag blocks that are stalled or in deficit. Don't propose changes to working blocks just because they overproduce.

## Pipeline decomposition

14. **Re-derive demand before designing** — when revisiting a sub-factory, trace demand from the current plan, not saved targets. Targets go stale as the overall pipeline evolves (e.g., vrauks sized for 0.2/s rubber turned out to need only 0.117/s for animal-sample-01 after rubber became a commodity import). Wrong demand -> wrong sizing -> wasted buildings or misleading bottleneck analysis. **Start from the recipe's actual output count** — multi-output recipes (e.g., 12 science packs per craft) change demand by an order of magnitude. The math downstream can be internally consistent yet completely wrong if the root output count is assumed rather than checked.
    
    **Verify every recipe attribute against prototype data** before committing it to a block design. Run `recipe-info <recipe>` and confirm: (1) **category** → which building runs it (coal-gas is distilator, NOT gasifier — this error survived 3+ plan versions), (2) **ingredients** → exact item names ("coal" ≠ "raw-coal" — wrong name means a missing supply chain stage), (3) **products** → exact output count and probability, (4) **craft time**. The solver command implicitly assumes all four. Never rely on memory for recipe attributes — memory of recipe details decays and mutates; the prototype JSON is ground truth.
15. **Decompose at commodity boundaries** — split at natural handoff points, optimize each stage independently. When multiple end products share deep infrastructure, split by shared system (auog farm, plasmids, bio commons) not by end product. Map all dependencies first, identify natural service layers, then build bottom-up. Track exports/imports explicitly between sub-factories — surpluses become fuel (rule 9) or feed parallel consumers; deficits identify where to add recipes or accept imports.

## Boundary selection

A good boundary is an item where you'd naturally put a train stop. Score candidates on:

16. **Consumer count** — items consumed by many recipes are natural bus items. Count all recipes (not just currently unlocked) so boundaries hold as you research more techs (via `recipes --consumes <item>`):
    - **Tier A (50+)**: steel-plate (264), small-parts-01 (241), electronic-circuit (219), nexelit-plate (190), iron-plate (183), glass (174), lead-plate (91), native-flora (85), tin-plate (81), copper-plate (64), stone-brick (48)
    - **Tier B (15-49)**: coke (30), rubber (27), battery-mk01 (20), zinc-plate (15)
    - **Tier C (5-14)**: stopper (7)
    - **Tier D (<5)**: pcb1 (4)
    Tier A/B are almost always good boundaries. Tier C/D only if they also have deep chains or cascade risk. **Exception: trivial derivatives of existing boundaries.** If a high-consumer item is crafted in 1 fast step from a higher-tier boundary, the precursor is the boundary — craft the derivative on-site. For trains this is a wagon density argument: iron-stick (23 consumers, 2 per iron-plate, both stack to 100) — shipping plates gives 2x wagon density. For belts it's throughput: copper-cable (27 consumers, 2 per copper-plate) — one belt of plates feeds two belts of cable, and plates also serve 64 direct consumers. Train the plate, not the derivative.

17. **Chain depth & cascade risk** — deep chains (5+ recipes) or chains containing cascade magnifiers (high input:output ratio) justify splitting even at low consumer counts. Battery-mk01 (20 consumers, 30:1 cyanic-acid cascade) and rubber (27 consumers, deep petrochemical chain) are worth splitting. Iron-plate from ore is only 2-3 recipes — not worth splitting on its own. The LP cost minimizer handles cascade reduction automatically (100-recipe chains solve without blowup), but splitting deep chains into separate blocks still helps for physical layout, train logistics, and independent scaling. Exclude byproducts at every cascade link to constrain the solution space — the LP finds better solutions with fewer degrees of freedom.

18. **Context-dependent depth** — the boundary moves based on what you're solving. Making circuits? Iron-plate is a boundary (import it). Making iron-plate itself? Ore is the boundary. Rule: **import from the highest tier below your current target**.

19. **Stable physical properties** — good boundaries have uniform properties across consumers. Iron-plate at X/s is iron-plate regardless of consumer. Temperature-variant fluids (coke-oven-gas at 100C vs 250C) are poor boundaries unless the solver's temperature-linked columns handle them — unconstrained fluids still share one column, verify manually. Steam specifically is never trained (rule 9).

## Block design

20. **City block space budget** — in train-based city block architectures, each block has finite space split between factories and train stations (1 station per item, input or output). Three tools to fit a sub-factory into a block:
    - **Import** — 1 station, 0 buildings locally. Use for high-volume bus items. Caveat: if the import has no existing supplier, the real cost includes a new upstream block — evaluate total system cost per rule 4 before choosing import over inline.
    - **Inline** — 0 stations, N buildings. Use for cheap-to-produce items (1-2 buildings) to save a station. Vacuum (no inputs, 1 pump) should always be inlined.
    - **New boundary** — 1 station, but absorbs multiple imports into a separate block. Use when producing an item inline would require importing 3+ of its own ingredients. Example: pcb1 has only 4 consumers but producing it inline means importing formica, copper-plate, vacuum, plus formica's chain (treated-wood, sap, fiber, methanal, creosote) — 5+ stations vs 1 for pcb1.
    
    When a sub-factory has many buildings, aggressively inline cheap imports to save stations. When it has few buildings, more stations are fine. The balance point depends on block size and station footprint.
    
    **Building count != building space.** Pyanodon building sizes range from 2x2 (stone-furnace, 4 tiles) to 15x15 (fwf-mk01, 225 tiles) — a 56x ratio. Always check tile footprint before concluding a recipe "costs too many buildings": 11 sap-extractors (5x5, 275 tiles total) take less space than 2 research-centers (10x10, 200 tiles). Conversely, 2 distilators (8x8, 128 tiles) take more space than 5 rhe (5x5, 125 tiles). Use `data.entities[name].tile_width/tile_height` to check.

21. **Single-item smelting** — at bus-scale volumes, each plate gets its own city block. Prefer steel-furnace (2x2, speed 4, fluid-burning) over advanced-foundry (6x6, speed 1, electric) — 33x more plates per tile. The solver can use advanced-foundry for simplicity (see checklist); real builds use steel-furnace for density. Steel-furnace burns any fluid fuel — consumption rate scales inversely with fuel value: `fuel_rate = 6 MW / fuel_value`. Higher-value fuels (gasoline 1.2 MJ, COG 1.0 MJ) need less throughput; low-value fuels (coal-gas 0.2 MJ) need 5x more, which has real infrastructure impact (pipe capacity, train trips, station sizing). Choose fuel based on both availability and throughput cost.
    
    **On-site vs centralized:** compare ore:plate ratio across unlocked chains. High ratio (8:1 direct iron) -> smelt on-site at the ore patch, train plates. Low ratio (1.4:1 BOF casting) -> centralize, ore and plates are nearly equal volume. Middle ground (5:1 crush+smelt) -> on-site still wins. Rule of thumb: if ore:plate > 3:1, on-site saves significant belt/train capacity. If the efficient chain needs extra imports (borax, oxygen), centralized makes more sense so you can share that infrastructure.
    
    Smelting chains (Pyanodon, current tech) — ore:plate ratio:
    - **Iron**: direct 8:1 -> crush+smelt 5:1 -> BOF casting 1.4:1 (needs borax/oxygen/sand-casting)
    - **Copper**: direct 8:1 -> screen+crush 4.2:1 (no extra inputs, stone byproduct)
    - **Tin**: direct 10:1 -> screen+crush 3.75:1 (no extra inputs, stone byproduct)
    - **Lead**: direct 6:1 -> screen+smelt 2:1 (5 ore -> 1 grade-1 -> 2.5 plate)
    - **Zinc**: direct 10:1 -> crush+screen+smelt 3.3:1 (5 ore -> 1 g1 -> 1 g2 -> 1.5 plate; needs iron-stick)
    - **Titanium**: direct 10:1 -> screen+recycle+smelt 1.9:1 (5 ore -> 2 g1 -> 1.33 g3 -> 2.67 plate; ti-rejects recycled)
    
    **Volume exception:** at niche volumes (< ~0.5/s plate), dedicating a full city block per metal wastes space. Combine low-volume metals that share the same ore source or mining fluid into one block — e.g., lead + zinc + tin + titanium smelting when each needs only a few furnaces. The "one block per plate" rule applies at bus-scale (Tier A/B consumers, multiple belts of throughput).
    
    **Upgrade path:** see rule 23. Start with the simpler chain to get plates flowing (e.g., stone-furnace before steel-furnace); swap internals when better inputs are available — station layout stays the same.

22. **Ore sourcing: check mining requirements** — mining operations can require any combination of: a **specific fluid** (acetylene, steam, aromatics — piped to fluid-drills), a **specific solid item** (drill heads — consumed by dedicated miners), a **type of fuel** (any burner fuel — for burner-type miners like antimony-drill), or just **electricity**. Basic electric/burner miners only work on `basic-solid` resources (iron, copper, coal, stone). Other ores need fluid-drills, dedicated miners, or ground-borers. Check `required_fluid` on the resource entity, and the miner entity's `energy_source` type and `ingredient` requirements when planning a mining block.
    
    **Mining fluids create hidden block ordering constraints.** If an ore needs acetylene to mine, the fuel chain must be operational first. If it needs aromatics, the tar refinery must export them. These dependencies don't appear in recipe-tree output (which only shows crafting recipes, not mining) and are easy to miss during block planning. Always verify mining fluid requirements before finalizing build order.
    
    **Soot/tailings are supplements, never primary ore sources.** Soot-separation and tailings-classification produce small amounts of ore as byproducts, but mining (even though deposits are finite) is always the primary supply. Design blocks around mining with soot/tailings routed in as a bonus to extend deposit lifetime.

23. **Design for upgrade, build with what you have** — when higher-tier modules/buildings are unlocked but impractical to bootstrap (e.g., bio mk02 at 0.5% drop rate), design with the achievable tier but plan for the upgrade. Check **ratio stability**: (1) all buildings have matching tier upgrades -> ratios hold, just need more I/O; (2) only some upgrade -> ratios break, needs redesign; (3) no matching tier downstream -> bottleneck just moves. When ratios will break, consider **building to upgraded ratios now** — accept underproduction today for a drop-in module swap later with zero redesign.
    
    **Upgrade in place, never tear down** — when modules/buildings upgrade, keep existing buildings running. Swap modules and belts in place; don't demolish and rebuild. Overproduction from surplus buildings is harmless (overflow-to-void handles it). Tearing down costs build time, loses production during transition, and gains nothing — an idle building costs zero resources. Only redesign when the block physically can't accommodate the new layout (rare).
    
    **Design cost vs build cost:** design-for-upgrade avoids paying the redesign cost again (see rule 13 on design cost). This matters most early game when build cost is also high; late game, cheap builds make redesign acceptable.

24. **Size for general use, constrained by input throughput** — Tier A/B bus items (plates, small-parts, glass, electronic-circuit, etc.) serve dozens to hundreds of consumers. Size these sub-factories for the bus, not for one consumer. However, the binding constraint is usually input throughput (belts/pipes), not block space. Each train station can feed **1-2 belts** (check unlocked belt tier: yellow 15/s, red 30/s, blue 45/s). The real tradeoff is **stations vs factories** — a block has finite space for both. A smelting block with 1 input type can dedicate 4-5 stations to ore (4-10 belts), while a crafting block with 8 different inputs gets 1 station each (1-2 belts per input). Size the block to match what you can actually feed it, not how many buildings fit. Only size to a specific consumer when the item is niche (Tier C/D consumers).
    
    **Round up to belt-tier increments** — don't target exact solver demand (e.g., 3.63/s). Round up to the next clean belt boundary: 15/s (1 yellow), 30/s (1 red = 2 yellow), 45/s (1 blue). This saturates belts fully, provides growth headroom, and simplifies logistics. The 2 yellow = 1 red equivalence makes 30/s a natural sweet spot. Example: iron-plate demand 3.63/s needs 18.15/s ore — awkward. Rounding ore to 30/s (1 red belt) gives ~6/s plate with 65% headroom and clean belt math.

25. **Blocks are stamps** — in train city block architecture, each block is a self-contained unit connected only by train. Need more throughput than one block provides? Copy-paste the block. No redesign, no re-optimization — just stamp another copy and the train network absorbs it. Design each block once to maximize its output within the space/input constraints, then scale horizontally by stamping. This eliminates design cost on the second copy (the expensive human+Claude time to derive ratios, plan layout, solve constraints — paid once per block design). Build cost is the same each time. This is the core advantage of the city block pattern. **Belt coupling between adjacent blocks is debt** — it works as a temporary hack but creates spatial dependency (blocks must stay neighbors), prevents stamping, and defeats train-based decoupling. Always plan to replace with a train station.

26. **Block capacity heuristic (bio farms)** — building tile footprint is the dominant factor for bio farm blocks. All bio buildings hit effective speed 1.0 with full modules, so per-farm output is recipe-determined, but how many fit is purely tile footprint vs block area. Actual block size is **~128x128 tiles** (16,384 tile^2), but rail perimeter, stations, belt bus, and pipe routing consume significant space — usable interior is smaller. Empirical data:
    
    | Building | Size | Farms/block | Output/block |
    |---|---|---|---|
    | moss-farm-mk01 | 6x6 | 60 | 12.0 moss/s (Moss-2) |
    | seaweed-crop-mk01 | 13x13 | 32 | 6.4 seaweed/s |
    
    Small buildings (6x6) leave most of the block free — enough to inline supporting recipes (CO2 production, etc.). Large buildings (13x13) fill most of the usable interior, leaving room only for stations and logistics. When a block is space-constrained, stamp a second copy rather than trying to squeeze more in.

27. **Fluid transport threshold** — one fluid wagon per minute defines the practical throughput ceiling for training fluids:
    
    | Wagon | Capacity | @1 wagon/min |
    |---|---|---|
    | fluid-wagon (mk01) | 25,000 | ~400/s |
    | mk02-fluid-wagon | 50,000 | ~830/s |
    | ht-generic (mk03) | 75,000 | ~1,250/s |
    | mk04-fluid-wagon | 150,000 | ~2,500/s |
    
    Below the threshold: train the fluid in, block can go anywhere. Above: **build near a water body** (pipe directly, unlimited throughput, 0 stations) or inline the water consumer. Example: soil extraction needs 50 water per soil — a block making 12/s soil needs 600/s water, over mk01 limit but fine at mk02+. When a water-heavy recipe can be inlined in the consumer's block (e.g., soil extraction inside a ralesia farm at 60/s water), that avoids both the train limit and the placement constraint. Revisit "must build near water" decisions when upgrading wagon tiers.

28. **Block design patterns** — all city blocks follow a standard template:
    
    **Size:** ~128x128 tiles. Rail perimeter loop consumes the outer ring; usable interior is smaller.
    
    **Station naming:**
    - Input (unload): `[icon]Unload` — rich text icon identifies the item/fluid (e.g., `[fluid=water]Unload`, `[item=copper-plate]Unload`)
    - Output (load): `[virtual-signal=signal-item-parameter]Load` — parameterized signal, reusable across blueprints. Actual item set per-instance.
    
    **Station circuit control:** Each station has a constant combinator setting three signals:
    - `signal-L = 1` (train limit enable)
    - `signal-P = 50` (priority)
    - Item/fluid filter `= 1` (identifies what this station handles)
    
    **Multi-threshold train limiting:** A second constant combinator provides signal-2/3/4/5 at staggered thresholds = `N x (wagon_capacity + 1)` for N=1..4. A decider combinator compares current stock against these thresholds — each threshold exceeded emits `signal-L = -1`, reducing the train limit. More stock -> fewer trains dispatched. Threshold values by storage type:
    - **Solid items:** wagon_capacity = `stack_size x 20` (mk1 cargo wagon has 20 slots). E.g., 100-stack items -> 2001/4001/6001/8001; 50-stack items -> 1001/2001/3001/4001.
    - **Fluids:** py-tank-4000 capacity = 25,000 -> 25001/50001/75001/100001.
    
    **Infrastructure:** Rail perimeter loop with chain signals on entry, regular signals on exit. Medium electric poles for power grid. Pipe-to-ground for fluid distribution. Transport belts for item collection to load station.

29. **Tiered byproduct cascade** (optional) — when a block produces a byproduct at significant rate, *consider* a multi-tier disposal chain: (1) **export** via load station (highest value), (2) **convert** to a useful intermediate when export backs up (e.g., stone → saline-water via washer), (3) **void** the converted product when it also backs up (sinkhole/exhaust). Each tier activates only when the previous tier's output buffer is full, using overflow-to-void wiring (rule 7 in-game pattern). This captures maximum value while keeping the block running — but each conversion tier costs stations, buildings, and block space. Evaluate whether the extra tiers fit before committing; a simple export + void is often sufficient.
    
    **Cascade outputs are inventory-dependent.** Tier rates are inversely proportional — exporting all stone means zero saline-water produced; voiding all saline-water means maximum stone-to-saline conversion. You cannot claim the block exports X stone AND Y saline-water simultaneously at their maximum rates. When recording block output in the inventory, pick the **design-intent tier**: if saline-water consumers exist, record the saline-water rate and reduce stone export accordingly. If no consumer exists yet, record full stone export and note saline-water as latent capacity. Re-audit when downstream blocks change (rule 13).
    
    **When to use:** any block with a high-volume byproduct that has both direct consumers (stone → stone-brick block) and conversion consumers (saline-water → electronic circuits). Single-consumer byproducts don't need a cascade — just export or void. Low-volume byproducts (< 1/s) aren't worth the complexity.
    
    **Centralized cascade blocks.** When multiple producer blocks export the same byproduct (e.g., iron and copper blocks both produce stone from crushing), consider a dedicated cascade block that imports from all producers rather than duplicating conversion tiers in each. This keeps producer blocks simple (export only, 1 station per byproduct) and consolidates conversion buildings, voiding infrastructure, and the associated stations in one place. The cascade block is sized to the aggregate byproduct rate across all producers. Trade-off: adds one block and train hops between producers and the cascade, but saves stations and space in every producer block.
    
    **Train priority as tiering mechanism.** When both a direct consumer (stone-brick block) and a cascade block import the same byproduct, use train station priority to implement the tier ordering: direct consumer gets high priority, cascade block gets low priority. Trains deliver to the consumer first; only surplus reaches the cascade. This replaces in-block overflow wiring with train scheduling — simpler, no circuits at the producer, and the consumer and cascade are fully independent blocks. The cascade block still applies overflow-to-void internally for its own conversion products.

## Bio organisms

### Module system

All Pyanodon biological buildings use items (not standard modules) as modules with +100% speed each:

| Building | Slots | Module item | Speed multiplier |
|---|---|---|---|
| `moss-farm-mk01` | 15 | `moss` | 16x |
| `moondrop-greenhouse-mk01` | 16 | `moondrop` | 17x |
| `ralesia-plantation-mk01` | 12 | `ralesia` | 13x |
| `prandium-lab-mk01` (cottongut) | 20 | `cottongut-mk01` | 21x |
| `vrauks-paddock-mk01` | 10 | `vrauks` | 11x |
| `auog-paddock-mk01` | 4 | `auog` | 5x |
| `rc-mk01` (breeding center) | 2 | matching animal | 3x |
| `seaweed-crop-mk01` | 10 | `seaweed` | 11x |
| `sap-extractor-mk01` | 2 | `sap-tree` | 3x |
| `fwf-mk01` (wood farm) | 10 | `tree-mk01` | 11x |

Without modules, bio farms are unusably slow and dominate building count (757 -> 163 buildings for logistic science pack after bio modules + LP cost minimization). mk02/mk03/mk04 tiers exist with 2x/3x/4x speed bonus per slot.

**Effective speed formula:** `effective_speed = base_crafting_speed × (1 + N_modules × module_bonus)`. Example: auog-paddock-mk01 (base 0.4) with 4 auog modules (+100% each): `0.4 × (1 + 4×1.0) = 2.0`. The "5x" in the table means full slots give 5x the base speed, not 5x some other number. Always compute effective craft time as `recipe_time / effective_speed` when sizing buildings.

**Variable-output recipes:** Some bio recipes produce a range (e.g., auog-pooping-1 yields 3-8 manure). Use the **average** `(min+max)/2` for throughput calculations — variance averages out over time. When sizing for a hard minimum guarantee (e.g., a critical-path item with no buffer), use `amount_min` instead and note the conservative assumption.

### Bootstrap + self-sustaining loops

Bio organisms follow a two-phase pattern: (1) **Bootstrap** — a one-time setup to get the first organisms. Two routes: **world harvest** (moss, seaweed, fish — pick up from the map, trivial) or **codex route** (ralesia, vrauks, auog, fawogae, moondrop — creature-chamber/nursery recipe using a codex + earth-sample, yields only 1-2 organisms per run, slow and expensive). (2) **Steady-state** — a self-sustaining loop where output exceeds input, running forever on commodity inputs.

**Bootstrap is gradual, not instant.** Bio buildings use organisms as modules, but you don't need full module slots to start — a single organism works, just very slowly. The codex gives you 1-2, you breed at base speed, load offspring as modules, each module accelerates the next cycle. It snowballs until all slots are filled. Plan build order accordingly: start bio bootstraps early so they're at full speed when needed.

Once you have critical mass, only the steady-state matters for pipeline planning. Don't model the bootstrap in the solver — it's a manual setup step.

| Organism | Bootstrap | Steady-state | Notes |
|---|---|---|---|
| Moss/seaweed | World harvest (trivial) | Farm + commodity inputs | Surplus loads more farms |
| Moondrop | Codex/nursery | 5->7 seeds->4 moondrop | Net positive |
| Ralesia | Codex/nursery or wild | 5->8 seeds->10 ralesia | +5/cycle, needs soil+water+hydrogen |
| Fawogae | Codex (1 needed as module) | Free spores->7 fawogae | Self-sustaining once bootstrapped |
| Vrauks | Codex/creature-chamber | Cocoons (commodity inputs)->vrauks | No vrauks consumed in loop |
| Auog | Codex/creature-chamber | Pups (native-flora+moss)->mature | Permanent building modules |
| Fish | Catch from water | 12->25 eggs->25 fish | Surplus loads more farms |
| Native-flora | Mine (ore-bioreserve) | No loop — treat like ore | Bioreserve-farm locked |

## Solver setup checklist

- **Recipe selection determines solution quality** — the solver finds a feasible solution given the recipes you chose. It does NOT search for better recipe alternatives. Every recipe in the `--recipes` list is a human decision: does this recipe use the cheapest path? Is there an alternative that avoids an expensive intermediate? Are there newer unlocked recipes that obsolete this one? Run `recipes --produces <item> --unlocked` for every non-trivial intermediate before locking in the recipe list. The solver is a calculator, not an optimizer — garbage recipes in, garbage solution out.
- **Use electric factories for crafting** — `automated-factory-mk01` (crafting). For smelting, prefer `steel-furnace` (2x2, speed 4, fluid fuel) in city blocks — solver can use `advanced-foundry-mk01` for simplicity but real builds should use steel-furnace for density.
- **Exclude byproducts that drive scaling** — `--constraint "recipe:product:exclude"` for every byproduct that could cascade. The LP cost minimizer reduces cascade blowup automatically, but excludes still help by removing degrees of freedom the solver would otherwise explore.
- **Force internal production** — `--max-import "item:0"` for intermediates (iron-gear-wheel, iron-plate, grade-1-copper, grade-2-copper). Cascading deficits push to raw materials.
- **Recycle byproducts** — add recycling recipes + `--max-import "item:0"` to force items through the loop.
- **Always use target mode** — target mode uses LP simplex with cost minimization, which handles complex chains (100+ recipes) without cascade blowup. Input mode uses legacy simplex — use it when sizing production to a fixed supply (e.g., resource patch output, existing block export). To cap specific inputs in target mode, use `--max-import "item:amount"`.
- **Ash is free** — treat as readily available input, don't let it drive scaling.
- **Watch for cycle warnings** — the solver detects circular dependencies (Tarjan's SCC) and warns before solving. Common in Pyanodon: burner factories (assembling-machine-1/2/3) produce ash as `burnt_result` from coal, creating ash feedback loops when other recipes consume ash (e.g., log3). Use electric factories to avoid, or `--constraint "recipe:ash:exclude"` to break the cycle.
- **Always add `--modules` for biological recipes** — without modules, bio farms are unusably slow and dominate building count.
- **Use `--time 1` for per-second targets** — `--target "item:N"` means N per time base, which defaults to `--time 60` (60 seconds). For per-second rates, always pass `--time 1`. Without it, `--target "item:0.2"` means 0.2 per 60 seconds (0.003/s), not 0.2/s. Output labels show `/<time>s` (e.g., `0.20/1s` vs `0.20/60s`) — check the denominator.
- **Entity names: no universal suffix rule** — some base-tier entities use bare names (`distilator`, `tar-processing-unit`, `hpf`, `jaw-crusher`, `gasifier`, `washer`), others use `-mk01` (`automated-factory-mk01`, `glassworks-mk01`, `biofactory-mk01`, `pulp-mill-mk01`, `wpu-mk01`, `micro-mine-mk01`). The solver errors with "Factory not found" on wrong names. Always check `data.entities` keys — don't guess.

## Examples

- **Pitch pipeline**: 3 electric boilers = 75 MW / 111.5 MW total. Oil boiler burning gasoline (28.79/s for 140 steam/s) saves 75 MW.
- **Coal chain recycling**: 11 raw-coal/s -> 100 tar/s + 113.65 syngas/s (vs 33/s without). Syngas covers 77% of steam needs.
- **Logistic science pack**: 11,506 -> 163 buildings by importing battery/rubber/creosote at commodity boundaries, excluding byproducts at every cascade link, adding bio modules, and LP cost minimization (11,506 → 110 boundaries+modules → 326 temperature correction → 163 LP). Splitting by shared system (7 pipelines) not by product (4).
