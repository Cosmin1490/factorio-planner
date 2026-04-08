# factorio-planner

## Running

```bash
npx tsx src/cli.ts <command>
```

No build step needed for dev. The 16MB prototype JSON loads in ~3 seconds on first solver call.

## Key files

- `src/cli.ts` — CLI entry point (commander)
- `src/bridge/NodeBridge.ts` — Fengari Lua VM bridge to Helmod solver
- `src/data/PrototypeLoader.ts` — prototype JSON loader + recipe/factory indexes
- `src/commands/solve.ts` — solve command (target/input modes)
- `src/commands/recipes.ts` — recipe query commands
- `lua/helmod/data/ModelCompute.lua` — the actual Helmod solver (Lua, 1200 lines)
- `data/helmod-web-prototypes.json` — all recipe/entity/item data (16MB)

## Solver notes

- Target injection happens after `prepareBlockObjectives()`, before `computeBlock()`
- `solver=false` (algebra) doesn't link intermediate products between recipes
- `solver=true` (simplex) should optimize multi-recipe chains — not yet exposed as CLI flag
- Factory speed must be pre-initialized before `prepareBlockElements()`
