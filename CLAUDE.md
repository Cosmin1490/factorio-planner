# factorio-planner

## Running

```bash
npx tsx src/cli.ts <command>
```

No build step needed for dev. The 16MB prototype JSON loads in ~0.6 seconds.

## Key files

- `src/cli.ts` — CLI entry point (commander)
- `src/solver/MatrixSolver.ts` — production solver (matrix construction, Gaussian elimination, state classification)
- `src/solver/ModuleEffects.ts` — module/beacon effect computation
- `src/solver/types.ts` — solver input/output types
- `src/data/PrototypeLoader.ts` — prototype JSON loader + recipe/factory indexes
- `src/commands/solve.ts` — solve command (target/input modes)
- `src/commands/recipes.ts` — recipe query commands
- `data/helmod-web-prototypes.json` — all recipe/entity/item data (16MB, exported from Factorio)
- `export-mod/` — Factorio mod that dumps prototype data to JSON

## Solver notes

- TypeScript reimplementation of Helmod's linear algebra solver
- Items produced by one recipe and consumed by another in the same block are classified as intermediates (state=0) and linked internally
- Multi-pass Gaussian elimination handles any recipe ordering
- Module/beacon effects are computed but not yet exposed via CLI flags
- TODO: Temperature-linked fluid conversion rows (for steam at different temperatures, etc.)
