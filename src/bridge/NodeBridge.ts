/**
 * Node.js bridge to the Helmod Lua solver via Fengari.
 * Adapted from helmod-web/test-bridge.mjs for use as a library.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import fengari from 'fengari';

const { lua, lauxlib, lualib, to_luastring, to_jsstring } = fengari;
type LuaState = fengari.LuaState;

export interface SolverBlock {
  id: string;
  name: string;
  children: Record<string, SolverEntry>;
  products: Record<string, unknown>;
  ingredients: Record<string, unknown>;
  time: number;
  count: number;
  by_product: boolean;
  by_factory: boolean;
  solver: boolean;
  isBlock: boolean;
  index: number;
  __target_amount?: number;
}

export interface SolverEntry {
  id: string;
  name: string;
  type: string;
  index: number;
  count: number;
  production: number;
  quality: string;
  base_time: number;
  factory: {
    name: string;
    type: string;
    quality: string;
    modules: unknown[];
  };
  beacons: unknown[];
  isBlock: boolean;
  need_candidat_objective: boolean;
  need_first_candidat_objective: boolean;
}

export interface SolverResult {
  block: Record<string, unknown>;
  children: Record<string, {
    name: string;
    count: number;
    factory: {
      name: string;
      amount: number;
      count: number;
      speed: number;
    };
  }>;
  products: Record<string, unknown>;
  ingredients: Record<string, unknown>;
  power: number;
}

export class NodeBridge {
  private L: LuaState;
  private luaDir: string;
  private initialized = false;

  constructor(luaDir: string) {
    this.luaDir = resolve(luaDir);
    this.L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(this.L);
  }

  private read(relativePath: string): string {
    return readFileSync(resolve(this.luaDir, relativePath), 'utf-8');
  }

  private luaExec(code: string, name: string): void {
    const status = lauxlib.luaL_loadstring(this.L, to_luastring(code));
    if (status !== lua.LUA_OK) {
      const err = to_jsstring(lua.lua_tostring(this.L, -1));
      lua.lua_pop(this.L, 1);
      throw new Error(`Load error (${name}): ${err}`);
    }
    const call = lua.lua_pcall(this.L, 0, -1, 0);
    if (call !== lua.LUA_OK) {
      const err = to_jsstring(lua.lua_tostring(this.L, -1));
      lua.lua_pop(this.L, 1);
      throw new Error(`Exec error (${name}): ${err}`);
    }
  }

  private loadAsGlobal(code: string, globalName: string): void {
    const status = lauxlib.luaL_loadstring(this.L, to_luastring(code));
    if (status !== lua.LUA_OK) {
      const err = to_jsstring(lua.lua_tostring(this.L, -1));
      lua.lua_pop(this.L, 1);
      throw new Error(`Load error (${globalName}): ${err}`);
    }
    const call = lua.lua_pcall(this.L, 0, 1, 0);
    if (call !== lua.LUA_OK) {
      const err = to_jsstring(lua.lua_tostring(this.L, -1));
      lua.lua_pop(this.L, 1);
      throw new Error(`Exec error (${globalName}): ${err}`);
    }
    if (lua.lua_type(this.L, -1) !== lua.LUA_TNIL) {
      lua.lua_setglobal(this.L, to_luastring(globalName));
    } else {
      lua.lua_pop(this.L, 1);
    }
  }

  private registerLoaded(modname: string): void {
    lua.lua_getglobal(this.L, to_luastring('package'));
    lua.lua_getfield(this.L, -1, to_luastring('loaded'));
    lua.lua_pushboolean(this.L, true);
    lua.lua_setfield(this.L, -2, to_luastring(modname));
    lua.lua_pop(this.L, 2);
  }

  /**
   * Initialize the Lua state with all solver modules and prototype data.
   * Must be called before computeBlock().
   */
  init(prototypeJsonPath: string): void {
    if (this.initialized) return;

    // Core globals and class system
    this.luaExec(this.read('shim/globals.lua'), 'globals');
    this.luaExec(this.read('helmod/core/class.lua'), 'class');
    this.luaExec(this.read('helmod/core/tableExtends.lua'), 'tableExtends');

    // Shims
    this.loadAsGlobal(this.read('shim/Cache.lua'), 'Cache');
    this.loadAsGlobal(this.read('shim/User.lua'), 'User');
    this.loadAsGlobal(this.read('shim/Player.lua'), 'Player');
    this.loadAsGlobal(this.read('shim/Model.lua'), 'Model');

    // Load and inject prototype data
    const protoJson = readFileSync(resolve(prototypeJsonPath), 'utf-8');
    lua.lua_pushstring(this.L, to_luastring(protoJson));
    lua.lua_setglobal(this.L, to_luastring('__raw_json'));

    this.luaExec(JSON_PARSER_LUA, 'parse_json');
    this.luaExec(WRAP_PROTOTYPES_LUA, 'wrapPrototypes');

    // Model files
    const models = [
      ['helmod/model/Prototype.lua', 'Prototype', 'model.Prototype'],
      ['helmod/model/Product.lua', 'Product', 'model.Product'],
      ['helmod/model/RecipePrototype.lua', 'RecipePrototype', 'model.RecipePrototype'],
      ['helmod/model/EntityPrototype.lua', 'EntityPrototype', 'model.EntityPrototype'],
      ['helmod/model/ItemPrototype.lua', 'ItemPrototype', 'model.ItemPrototype'],
      ['helmod/model/FluidPrototype.lua', 'FluidPrototype', 'model.FluidPrototype'],
      ['helmod/model/EnergySourcePrototype.lua', 'EnergySourcePrototype', 'model.EnergySourcePrototype'],
      ['helmod/model/FluidboxPrototype.lua', 'FluidboxPrototype', 'model.FluidboxPrototype'],
    ] as const;

    for (const [file, name, mod] of models) {
      this.luaExec(this.read(file), name);
      this.registerLoaded(mod);
    }

    // Math solvers
    const solvers = [
      ['helmod/math/Matrix.lua', 'Matrix', 'math.Matrix'],
      ['helmod/math/SolverMatrix.lua', 'SolverMatrix', 'math.SolverMatrix'],
      ['helmod/math/SolverMatrixAlgebra.lua', 'SolverMatrixAlgebra', 'math.SolverMatrixAlgebra'],
      ['helmod/math/SolverMatrixSimplex.lua', 'SolverMatrixSimplex', 'math.SolverMatrixSimplex'],
      ['helmod/math/SolverLinkedMatrix.lua', 'SolverLinkedMatrix', 'math.SolverLinkedMatrix'],
      ['helmod/math/SolverLinkedMatrixAlgebra.lua', 'SolverLinkedMatrixAlgebra', 'math.SolverLinkedMatrixAlgebra'],
      ['helmod/math/SolverLinkedMatrixSimplex.lua', 'SolverLinkedMatrixSimplex', 'math.SolverLinkedMatrixSimplex'],
    ] as const;

    for (const [file, name, mod] of solvers) {
      this.luaExec(this.read(file), name);
      this.registerLoaded(mod);
    }

    // ModelCompute
    this.loadAsGlobal(this.read('helmod/data/ModelCompute.lua'), 'ModelCompute');
    this.registerLoaded('data.ModelCompute');

    this.initialized = true;
  }

  /**
   * Run the solver on a block. Returns the solved block with factory counts.
   */
  computeBlock(block: SolverBlock): Record<string, unknown> {
    if (!this.initialized) throw new Error('NodeBridge not initialized. Call init() first.');

    // Serialize block to Lua table via JSON
    const blockJson = JSON.stringify(block);
    lua.lua_pushstring(this.L, to_luastring(blockJson));
    lua.lua_setglobal(this.L, to_luastring('__block_json'));

    this.luaExec(COMPUTE_BLOCK_LUA, 'computeBlock');

    // Read result JSON from Lua
    lua.lua_getglobal(this.L, to_luastring('__result_json'));
    const resultStr = to_jsstring(lua.lua_tostring(this.L, -1));
    lua.lua_pop(this.L, 1);

    if (!resultStr) throw new Error('Solver returned no result');
    return JSON.parse(resultStr) as Record<string, unknown>;
  }
}

// Lua code for JSON parsing (embedded from test-bridge.mjs)
const JSON_PARSER_LUA = `
local s = __raw_json
__raw_json = nil

local pos = 1
local function skip_ws()
  while pos <= #s do
    local b = s:byte(pos)
    if b == 32 or b == 9 or b == 10 or b == 13 then pos = pos + 1
    else break end
  end
end

local decode_value

local function decode_string()
  pos = pos + 1
  local parts = {}
  while pos <= #s do
    local c = s:sub(pos, pos)
    if c == '"' then pos = pos + 1; return table.concat(parts) end
    if c == '\\\\' then
      pos = pos + 1
      c = s:sub(pos, pos)
      if c == '"' or c == '\\\\' or c == '/' then parts[#parts+1] = c
      elseif c == 'n' then parts[#parts+1] = '\\n'
      elseif c == 'r' then parts[#parts+1] = '\\r'
      elseif c == 't' then parts[#parts+1] = '\\t'
      elseif c == 'u' then
        local hex = s:sub(pos+1, pos+4)
        parts[#parts+1] = utf8.char(tonumber(hex, 16))
        pos = pos + 4
      end
    else
      parts[#parts+1] = c
    end
    pos = pos + 1
  end
end

local function decode_number()
  local j = pos
  if s:byte(j) == 45 then j = j + 1 end
  while j <= #s and s:byte(j) >= 48 and s:byte(j) <= 57 do j = j + 1 end
  if j <= #s and s:byte(j) == 46 then
    j = j + 1
    while j <= #s and s:byte(j) >= 48 and s:byte(j) <= 57 do j = j + 1 end
  end
  if j <= #s and (s:byte(j) == 101 or s:byte(j) == 69) then
    j = j + 1
    if j <= #s and (s:byte(j) == 43 or s:byte(j) == 45) then j = j + 1 end
    while j <= #s and s:byte(j) >= 48 and s:byte(j) <= 57 do j = j + 1 end
  end
  local num = tonumber(s:sub(pos, j-1))
  pos = j
  return num
end

local function decode_array()
  pos = pos + 1
  local arr = {}
  skip_ws()
  if s:byte(pos) == 93 then pos = pos + 1; return arr end
  while true do
    arr[#arr+1] = decode_value()
    skip_ws()
    if s:byte(pos) == 93 then pos = pos + 1; return arr end
    pos = pos + 1
    skip_ws()
  end
end

local function decode_object()
  pos = pos + 1
  local obj = {}
  skip_ws()
  if s:byte(pos) == 125 then pos = pos + 1; return obj end
  while true do
    skip_ws()
    local key = decode_string()
    skip_ws()
    pos = pos + 1
    skip_ws()
    obj[key] = decode_value()
    skip_ws()
    if s:byte(pos) == 125 then pos = pos + 1; return obj end
    pos = pos + 1
    skip_ws()
  end
end

decode_value = function()
  skip_ws()
  local b = s:byte(pos)
  if b == 34 then return decode_string()
  elseif b == 123 then return decode_object()
  elseif b == 91 then return decode_array()
  elseif b == 116 then pos = pos + 4; return true
  elseif b == 102 then pos = pos + 5; return false
  elseif b == 110 then pos = pos + 4; return nil
  else return decode_number()
  end
end

local data = decode_value()

prototypes.recipe = data.recipes or {}
prototypes.entity = data.entities or {}
prototypes.item = data.items or {}
prototypes.fluid = data.fluids or {}
prototypes.quality = data.qualities or {}

if data.force then
  Player.setForceData(data.force)
end

log("Loaded " .. table_size(prototypes.recipe) .. " recipes")
log("Loaded " .. table_size(prototypes.entity) .. " entities")
log("Loaded " .. table_size(prototypes.item) .. " items")
`;

const WRAP_PROTOTYPES_LUA = `
for name, entity in pairs(prototypes.entity) do
  if entity.electric_energy_source then
    entity.electric_energy_source_prototype = entity.electric_energy_source
  end
  if entity.heat_energy_source then
    entity.heat_energy_source_prototype = entity.heat_energy_source
  end
  if entity.fluid_energy_source then
    entity.fluid_energy_source_prototype = entity.fluid_energy_source
  end
  if entity.void_energy_source then
    entity.void_energy_source_prototype = entity.void_energy_source
  end

  local quality_fields = {
    "crafting_speed", "max_energy_usage", "max_energy_production",
    "max_power_output", "fluid_usage_per_tick", "researching_speed",
    "pumping_speed", "inserter_rotation_speed", "valve_flow_rate"
  }
  for _, field in pairs(quality_fields) do
    local data = entity[field]
    if type(data) == "table" then
      entity["get_" .. field] = function(quality)
        return data[quality or "normal"]
      end
    end
  end
  local inv1 = entity.inventory_size_1
  local inv2 = entity.inventory_size_2
  entity.get_inventory_size = function(index)
    if index == 1 then return inv1
    elseif index == 2 then return inv2 end
    return nil
  end
end
for name, item in pairs(prototypes.item) do
  if item.module_effects and type(item.module_effects) == "table" then
    local effects_data = item.module_effects
    item.get_module_effects = function(quality)
      return effects_data[quality or "normal"]
    end
  end
  local ticks = item.spoil_ticks or 0
  item.get_spoil_ticks = function() return ticks end
end
`;

const COMPUTE_BLOCK_LUA = `
-- Parse block from JSON
local s = __block_json
__block_json = nil

local pos = 1
local function skip_ws()
  while pos <= #s do
    local b = s:byte(pos)
    if b == 32 or b == 9 or b == 10 or b == 13 then pos = pos + 1
    else break end
  end
end

local decode_value

local function decode_string()
  pos = pos + 1
  local parts = {}
  while pos <= #s do
    local c = s:sub(pos, pos)
    if c == '"' then pos = pos + 1; return table.concat(parts) end
    if c == '\\\\' then
      pos = pos + 1
      c = s:sub(pos, pos)
      if c == '"' or c == '\\\\' or c == '/' then parts[#parts+1] = c
      elseif c == 'n' then parts[#parts+1] = '\\n'
      elseif c == 'r' then parts[#parts+1] = '\\r'
      elseif c == 't' then parts[#parts+1] = '\\t'
      elseif c == 'u' then
        local hex = s:sub(pos+1, pos+4)
        parts[#parts+1] = utf8.char(tonumber(hex, 16))
        pos = pos + 4
      end
    else
      parts[#parts+1] = c
    end
    pos = pos + 1
  end
end

local function decode_number()
  local j = pos
  if s:byte(j) == 45 then j = j + 1 end
  while j <= #s and s:byte(j) >= 48 and s:byte(j) <= 57 do j = j + 1 end
  if j <= #s and s:byte(j) == 46 then
    j = j + 1
    while j <= #s and s:byte(j) >= 48 and s:byte(j) <= 57 do j = j + 1 end
  end
  if j <= #s and (s:byte(j) == 101 or s:byte(j) == 69) then
    j = j + 1
    if j <= #s and (s:byte(j) == 43 or s:byte(j) == 45) then j = j + 1 end
    while j <= #s and s:byte(j) >= 48 and s:byte(j) <= 57 do j = j + 1 end
  end
  local num = tonumber(s:sub(pos, j-1))
  pos = j
  return num
end

local function decode_array()
  pos = pos + 1
  local arr = {}
  skip_ws()
  if s:byte(pos) == 93 then pos = pos + 1; return arr end
  while true do
    arr[#arr+1] = decode_value()
    skip_ws()
    if s:byte(pos) == 93 then pos = pos + 1; return arr end
    pos = pos + 1
    skip_ws()
  end
end

local function decode_object()
  pos = pos + 1
  local obj = {}
  skip_ws()
  if s:byte(pos) == 125 then pos = pos + 1; return obj end
  while true do
    skip_ws()
    local key = decode_string()
    skip_ws()
    pos = pos + 1
    skip_ws()
    obj[key] = decode_value()
    skip_ws()
    if s:byte(pos) == 125 then pos = pos + 1; return obj end
    pos = pos + 1
    skip_ws()
  end
end

decode_value = function()
  skip_ws()
  local b = s:byte(pos)
  if b == 34 then return decode_string()
  elseif b == 123 then return decode_object()
  elseif b == 91 then return decode_array()
  elseif b == 116 then pos = pos + 4; return true
  elseif b == 102 then pos = pos + 5; return false
  elseif b == 110 then pos = pos + 4; return nil
  else return decode_number()
  end
end

local block = decode_value()

local parameters = {
  effects = { speed = 0, productivity = 0, consumption = 0, pollution = 0, quality = 0 }
}

-- Pre-initialize factory fields
for _, child in pairs(block.children or {}) do
  if child.factory and child.factory.name ~= "" then
    local factory_prototype = EntityPrototype(child.factory)
    if factory_prototype:native() ~= nil then
      child.factory.speed = factory_prototype:speedFactory()
      child.factory.effects = child.factory.effects or {
        speed = 0, productivity = 0, consumption = 0, pollution = 0, quality = 0
      }
    end
  end
end

ModelCompute.prepareBlockElements(block)
ModelCompute.prepareBlockObjectives(block)

-- Inject target amount into objectives (must happen after prepare, before compute)
local target_amount = block.__target_amount
if target_amount and target_amount > 0 then
  for key, product in pairs(block.products or {}) do
    if product.state == 1 then
      product.input = target_amount
      block.objectives = block.objectives or {}
      local element_key = Product(product):getTableKey()
      block.objectives[element_key] = { key = element_key, value = target_amount }
      break
    end
  end
end

ModelCompute.computeBlock(block, parameters)
ModelCompute.finalizeBlock(block, 1)

-- Serialize result back to JSON
local function encode_value(val)
  if val == nil then return "null" end
  local t = type(val)
  if t == "boolean" then return val and "true" or "false" end
  if t == "number" then return tostring(val) end
  if t == "string" then
    return '"' .. val:gsub('\\\\', '\\\\\\\\'):gsub('"', '\\\\"'):gsub('\\n', '\\\\n'):gsub('\\r', '\\\\r'):gsub('\\t', '\\\\t') .. '"'
  end
  if t == "table" then
    -- Check if array (sequential integer keys starting at 1)
    local is_array = false
    if #val > 0 then
      is_array = true
      for k, _ in pairs(val) do
        if type(k) ~= "number" then is_array = false; break end
      end
    end
    if is_array then
      local parts = {}
      for i = 1, #val do parts[i] = encode_value(val[i]) end
      return "[" .. table.concat(parts, ",") .. "]"
    else
      local parts = {}
      for k, v in pairs(val) do
        if type(v) ~= "function" then
          parts[#parts+1] = encode_value(tostring(k)) .. ":" .. encode_value(v)
        end
      end
      return "{" .. table.concat(parts, ",") .. "}"
    end
  end
  return "null"
end

__result_json = encode_value(block)
`;
