# factorio-planner

Node.js CLI tool for Factorio production planning. Computes exact factory counts, material flows, and crafting speeds for arbitrarily complex recipe chains — particularly useful for overhaul mods like [Pyanodon's](https://mods.factorio.com/user/pyanodon) where manual ratio calculation is impractical.

Designed to be driven by [Claude](https://claude.ai/) — you describe what you want to produce, Claude explores the recipe graph, builds the solver input, and iterates on constraints. Works with any Factorio mod set by re-exporting prototype data.

Features a native TypeScript solver (algebraic + LP simplex with cost minimization), [Helmod](https://mods.factorio.com/mod/helmod) export for in-game import, temperature-aware fluid modeling, power computation, and tech-level filtering from save data. The included prototype data is from a Pyanodon modpack save.

## How it works with Claude

The typical workflow loop:

1. **Explore** — query recipes, trace ingredient trees, check what's unlocked at your tech level
2. **Compare** — evaluate alternative recipe chains, identify bottlenecks and byproduct risks
3. **Solve** — build a solver command with recipes, constraints, and module overrides; iterate until the numbers work
4. **Export** — generate a Helmod import string and paste it into Factorio for in-game reference

Claude drives the entire process — you describe what you want to produce ("I need electronic circuits at 1/s using only unlocked recipes"), and Claude explores the recipe graph, selects factories, adds constraints to tame byproduct cascades, and refines the solver input across multiple iterations. The [Pyanodon methodology](docs/pyanodon-methodology.md) documents the heuristics and patterns that emerged from this workflow.

This approach is particularly valuable for overhaul mods like Pyanodon's where recipe chains are too deep and interconnected for manual calculation — a single end product can involve 100+ recipes across petrochemistry, biology, and metallurgy.

## Requirements

- Node.js 22+

## Setup

```bash
npm install
```

## Project Structure

- `src/` — TypeScript CLI source
  - `src/solver/` — Matrix solver (algebraic + simplex), module/beacon effects
  - `src/commands/` — CLI command handlers (solve, recipes, items, factories, techs, recipe-tree)
  - `src/export/` — Helmod import string generator
  - `src/data/` — Prototype data loader
- `tests/` — Vitest test suite (solver validation, data loader tests)
- `data/` — Prototype JSON export (recipes, entities, items, fluids from Factorio + mods)
- `docs/` — [Pyanodon pipeline methodology](docs/pyanodon-methodology.md) (byproduct management, block design, boundary selection, bio modules)
- `export-mod/` — Factorio mod that generates the prototype JSON export (includes force/technology data)

## Usage

Run commands via `npx tsx src/cli.ts <command>`.

### Query commands (explore recipe data)

```bash
# Find recipes that produce an item
npx tsx src/cli.ts recipes --produces "iron-plate"

# Only show unlocked recipes (requires force data in prototype export)
npx tsx src/cli.ts recipes --produces "iron-plate" --unlocked

# Find recipes that consume an item
npx tsx src/cli.ts recipes --consumes "coal"

# Show full recipe details (ingredients, products, temperatures)
npx tsx src/cli.ts recipe-info "iron-plate"

# Detailed item info (stack size, fuel value, producer/consumer counts)
npx tsx src/cli.ts item-info "iron-plate" --unlocked

# Detailed factory info (speed, energy, module slots, categories)
npx tsx src/cli.ts factory-info "automated-factory-mk01"

# List factories for a recipe category
npx tsx src/cli.ts factories --category "smelting"

# Search items/fluids by name
npx tsx src/cli.ts items --search "coal"

# Show which technology unlocks a recipe
npx tsx src/cli.ts techs --unlocks "automation-science-pack"
```

### Recipe tree (trace ingredient/product graphs)

```bash
# What do I need to make this item? (backward traversal)
npx tsx src/cli.ts recipe-tree --needs "electronic-circuit" --unlocked

# What can I make from this item? (forward traversal)
npx tsx src/cli.ts recipe-tree --produces-from "iron-plate" --unlocked

# Limit depth and ignore commodity items to keep output manageable
npx tsx src/cli.ts recipe-tree --needs "acetylene" --unlocked --depth 3 \
  --ignore water steam carbon-dioxide soil ash coke limestone
```

### Solve command (compute production ratios)

```bash
# Target mode: "I want 100 iron-plate per 60s"
npx tsx src/cli.ts solve --recipes "iron-plate" --target "iron-plate:100"

# Input mode: "I have 15 iron-ore per second, maximize output"
npx tsx src/cli.ts solve --recipes "iron-plate" --input "iron-ore:15" --time 1

# Multi-recipe chain with factory overrides
npx tsx src/cli.ts solve \
  --recipes "grade-1-iron-crush,low-grade-smelting-iron,iron-gear-wheel" \
  --target "iron-gear-wheel:10" --time 1 \
  --factory "grade-1-iron-crush:jaw-crusher" \
  --factory "low-grade-smelting-iron:advanced-foundry-mk01"

# Exclude byproducts from solver optimization
npx tsx src/cli.ts solve \
  --recipes "grade-1-iron-crush,low-grade-smelting-iron" \
  --target "iron-plate:1" --time 1 \
  --constraint "grade-1-iron-crush:stone:exclude"

# Modules and beacons
npx tsx src/cli.ts solve --recipes "iron-plate" --target "iron-plate:100" \
  --modules "iron-plate:speed-module-3:4" \
  --beacons "iron-plate:beacon:speed-module-3:2:8"

# Multiple inputs
npx tsx src/cli.ts solve \
  --recipes "iron-plate,copper-plate" \
  --input "iron-ore:15" --input "copper-ore:10" --time 1

# Cap imports — force internal production of intermediates
npx tsx src/cli.ts solve \
  --recipes "iron-gear-wheel,iron-plate" \
  --target "iron-gear-wheel:10" --time 1 \
  --max-import "iron-plate:0"

# Warn if any recipe/factory/module is not unlocked
npx tsx src/cli.ts solve --recipes "iron-plate" --target "iron-plate:100" --unlocked

# Export as Helmod import string
npx tsx src/cli.ts solve --recipes "iron-plate" --target "iron-plate:100" --export helmod

# Raw JSON output
npx tsx src/cli.ts solve --recipes "iron-plate" --target "iron-plate:100" --json
```

## Architecture

```
CLI (commander)
  → PrototypeLoader (reads 16MB JSON, builds recipe/factory/tech indexes)
  → MatrixSolver (native TS: matrix construction, algebraic + simplex solvers)
  → Output (text summary, JSON, or Helmod export string)
```

The solver is a native TypeScript reimplementation. It computes exact factory counts, crafting speeds, fuel consumption, power draw, and material flows.

**Claude is the AI layer** — no interactive prompts. Claude explores recipes via query commands, builds the recipe list, and invokes solve with explicit parameters.

## Solver modes

- **Algebraic** (`--solver algebra`, default for target mode): Multi-pass Gaussian elimination. Fast, works well for simple chains. Breaks on large chains (12+ recipes).
- **Simplex** (`--solver simplex`, default for input mode): Two-phase LP with cost minimization (target mode) and legacy Helmod-style pivot (input mode).

The LP simplex minimizes `sum(recipeCost x recipeRate)` where recipe costs are derived from BFS depth in the ingredient graph. This eliminates cascade blowup on deep chains — a 100-recipe Pyanodon pipeline solves to ~163 buildings vs ~326 without the objective. Comparable to [YAFC](https://github.com/shpaass/yafc-ce)'s OrTools-based LP solver but implemented natively in TypeScript.

Key solver features:
- `--constraint "recipe:product:exclude"` — prevent a byproduct from driving solver scaling
- `--max-import "item:0"` — force full internal production of an intermediate (cascades deficits to raw materials)
- `--modules` / `--beacons` — apply module and beacon effects to factory speed and productivity
- Temperature-aware fluid columns (e.g., `coke-oven-gas@250C` vs `@100C`) for recipes with explicit temperature constraints
- Per-recipe power modeling (`totalPowerMW` in output)
- `--export helmod` — generate a Helmod import string for pasting into Factorio

## Updating Prototype Data

The prototype JSON is generated by the export mod in `export-mod/`. To regenerate after mod updates:

1. Copy/symlink `export-mod/` to your Factorio mods directory
2. Load Factorio with the export mod + desired mod set (e.g., Pyanodon's)
3. Run `/helmod-web-export` in the Factorio console
4. Output lands in `factorio/script-output/helmod-web-prototypes.json`
5. Copy to `data/helmod-web-prototypes.json`

The export includes `force.recipes` (unlock state) and `technologies` (researched techs) from your save, enabling the `--unlocked` flag.

## TODO

- [ ] Recipe cycle detection: pre-solve warning for circular dependencies (ash loops, coal-gas feedback)
- [ ] `--electric` / `--no-burner` flag: auto-select best electric factory per recipe (avoid burnt-result coupling)

## License

MIT
