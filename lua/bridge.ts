// LuaBridge: Fengari-based bridge to run Helmod's Lua solver in the browser
//
// Loads all shim + helmod Lua files into a Fengari Lua 5.3 state,
// injects prototype data from JSON, and exposes solver functions to JS.

import { lua, lauxlib, lualib, to_luastring, to_jsstring } from 'fengari';

// Shim Lua sources
import globalsLua from './shim/globals.lua?raw';
import cacheLua from './shim/Cache.lua?raw';
import userLua from './shim/User.lua?raw';
import playerLua from './shim/Player.lua?raw';
import modelLua from './shim/Model.lua?raw';

// Helmod core
import classLua from './helmod/core/class.lua?raw';
import tableExtendsLua from './helmod/core/tableExtends.lua?raw';

// Helmod model
import prototypeLua from './helmod/model/Prototype.lua?raw';
import productLua from './helmod/model/Product.lua?raw';
import recipePrototypeLua from './helmod/model/RecipePrototype.lua?raw';
import entityPrototypeLua from './helmod/model/EntityPrototype.lua?raw';
import itemPrototypeLua from './helmod/model/ItemPrototype.lua?raw';
import fluidPrototypeLua from './helmod/model/FluidPrototype.lua?raw';
import energySourcePrototypeLua from './helmod/model/EnergySourcePrototype.lua?raw';
import fluidboxPrototypeLua from './helmod/model/FluidboxPrototype.lua?raw';

// Helmod math
import matrixLua from './helmod/math/Matrix.lua?raw';
import solverMatrixLua from './helmod/math/SolverMatrix.lua?raw';
import solverMatrixAlgebraLua from './helmod/math/SolverMatrixAlgebra.lua?raw';
import solverMatrixSimplexLua from './helmod/math/SolverMatrixSimplex.lua?raw';
import solverLinkedMatrixLua from './helmod/math/SolverLinkedMatrix.lua?raw';
import solverLinkedMatrixAlgebraLua from './helmod/math/SolverLinkedMatrixAlgebra.lua?raw';
import solverLinkedMatrixSimplexLua from './helmod/math/SolverLinkedMatrixSimplex.lua?raw';

// Helmod data
import modelComputeLua from './helmod/data/ModelCompute.lua?raw';

type LuaState = object;

// JSON codec in pure Lua — needed for data exchange
const jsonLua = `
local json = {}

local function encode_value(v, buf)
  local t = type(v)
  if t == "nil" then
    buf[#buf+1] = "null"
  elseif t == "boolean" then
    buf[#buf+1] = v and "true" or "false"
  elseif t == "number" then
    if v ~= v then buf[#buf+1] = "null"
    elseif v == math.huge then buf[#buf+1] = "1e999"
    elseif v == -math.huge then buf[#buf+1] = "-1e999"
    else buf[#buf+1] = string.format("%.17g", v) end
  elseif t == "string" then
    buf[#buf+1] = '"'
    buf[#buf+1] = v:gsub('[\\\\"%c]', function(c)
      if c == '"' then return '\\\\"'
      elseif c == '\\\\' then return '\\\\\\\\'
      elseif c == '\\n' then return '\\\\n'
      elseif c == '\\r' then return '\\\\r'
      elseif c == '\\t' then return '\\\\t'
      else return string.format('\\\\u%04x', string.byte(c)) end
    end)
    buf[#buf+1] = '"'
  elseif t == "table" then
    -- check if array
    local is_array = true
    local max_i = 0
    for k, _ in pairs(v) do
      if type(k) ~= "number" or k ~= math.floor(k) or k < 1 then
        is_array = false
        break
      end
      if k > max_i then max_i = k end
    end
    if is_array and max_i > 0 and max_i == table_size(v) then
      buf[#buf+1] = "["
      for i = 1, max_i do
        if i > 1 then buf[#buf+1] = "," end
        encode_value(v[i], buf)
      end
      buf[#buf+1] = "]"
    else
      buf[#buf+1] = "{"
      local first = true
      for k, val in pairs(v) do
        if not first then buf[#buf+1] = "," end
        first = false
        encode_value(tostring(k), buf)
        buf[#buf+1] = ":"
        encode_value(val, buf)
      end
      buf[#buf+1] = "}"
    end
  else
    buf[#buf+1] = "null"
  end
end

function json.encode(v)
  local buf = {}
  encode_value(v, buf)
  return table.concat(buf)
end

local function skip_ws(s, i)
  while i <= #s do
    local c = s:byte(i)
    if c == 32 or c == 9 or c == 10 or c == 13 then i = i + 1
    else break end
  end
  return i
end

local decode_value

local function decode_string(s, i)
  i = i + 1 -- skip opening quote
  local parts = {}
  while i <= #s do
    local c = s:sub(i, i)
    if c == '"' then return table.concat(parts), i + 1 end
    if c == '\\\\' then
      i = i + 1
      c = s:sub(i, i)
      if c == '"' or c == '\\\\' or c == '/' then parts[#parts+1] = c
      elseif c == 'n' then parts[#parts+1] = '\\n'
      elseif c == 'r' then parts[#parts+1] = '\\r'
      elseif c == 't' then parts[#parts+1] = '\\t'
      elseif c == 'u' then
        local hex = s:sub(i+1, i+4)
        parts[#parts+1] = utf8.char(tonumber(hex, 16))
        i = i + 4
      end
    else
      parts[#parts+1] = c
    end
    i = i + 1
  end
  error("unterminated string")
end

local function decode_number(s, i)
  local j = i
  if s:byte(j) == 45 then j = j + 1 end -- minus
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
  return tonumber(s:sub(i, j-1)), j
end

local function decode_array(s, i)
  i = i + 1 -- skip [
  local arr = {}
  i = skip_ws(s, i)
  if s:byte(i) == 93 then return arr, i + 1 end
  while true do
    local val
    val, i = decode_value(s, i)
    arr[#arr+1] = val
    i = skip_ws(s, i)
    if s:byte(i) == 93 then return arr, i + 1 end
    if s:byte(i) ~= 44 then error("expected comma in array at " .. i) end
    i = skip_ws(s, i + 1)
  end
end

local function decode_object(s, i)
  i = i + 1 -- skip {
  local obj = {}
  i = skip_ws(s, i)
  if s:byte(i) == 125 then return obj, i + 1 end
  while true do
    i = skip_ws(s, i)
    if s:byte(i) ~= 34 then error("expected string key at " .. i) end
    local key
    key, i = decode_string(s, i)
    i = skip_ws(s, i)
    if s:byte(i) ~= 58 then error("expected colon at " .. i) end
    i = skip_ws(s, i + 1)
    local val
    val, i = decode_value(s, i)
    -- convert numeric string keys to numbers for Lua array compat
    local nkey = tonumber(key)
    if nkey and nkey == math.floor(nkey) and nkey >= 1 then
      obj[nkey] = val
    else
      obj[key] = val
    end
    i = skip_ws(s, i)
    if s:byte(i) == 125 then return obj, i + 1 end
    if s:byte(i) ~= 44 then error("expected comma in object at " .. i) end
    i = skip_ws(s, i + 1)
  end
end

decode_value = function(s, i)
  i = skip_ws(s, i)
  local c = s:byte(i)
  if c == 34 then return decode_string(s, i)
  elseif c == 123 then return decode_object(s, i)
  elseif c == 91 then return decode_array(s, i)
  elseif c == 116 then -- true
    return true, i + 4
  elseif c == 102 then -- false
    return false, i + 5
  elseif c == 110 then -- null
    return nil, i + 4
  elseif c == 45 or (c >= 48 and c <= 57) then
    return decode_number(s, i)
  else
    error("unexpected char at " .. i .. ": " .. string.char(c))
  end
end

function json.decode(s)
  local val, _ = decode_value(s, 1)
  return val
end

-- Make globally available
_G.json = json
return json
`;

// Lua code to wrap exported entity/item data with callable methods
const prototypeWrapperLua = `
-- Wrap entity prototypes: convert per-quality tables to callable methods
for name, entity in pairs(prototypes.entity) do
  -- Remap energy source field names to match Helmod expectations
  -- Export uses short names, Helmod expects *_prototype suffix
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
  -- burner_prototype is already correctly named in the export

  -- Per-quality method wrappers
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

  -- Inventory size method
  local inv1 = entity.inventory_size_1
  local inv2 = entity.inventory_size_2
  entity.get_inventory_size = function(index)
    if index == 1 then return inv1
    elseif index == 2 then return inv2
    end
    return nil
  end
end

-- Wrap item prototypes: module effects per quality
for name, item in pairs(prototypes.item) do
  if item.module_effects and type(item.module_effects) == "table" then
    local effects_data = item.module_effects
    item.get_module_effects = function(quality)
      return effects_data[quality or "normal"]
    end
  end
  -- Spoil ticks (always provide, default to 0)
  local ticks = item.spoil_ticks or 0
  item.get_spoil_ticks = function() return ticks end
end
`;

// ---- Helper: execute Lua code and throw on error ----
function luaExec(L: LuaState, code: string, chunkName?: string): void {
  const status = lauxlib.luaL_loadstring(L, to_luastring(code));
  if (status !== lua.LUA_OK) {
    const err = to_jsstring(lua.lua_tostring(L, -1));
    lua.lua_pop(L, 1);
    throw new Error(`Lua load error (${chunkName || 'chunk'}): ${err}`);
  }
  const callStatus = lua.lua_pcall(L, 0, -1, 0); // LUA_MULTRET = -1
  if (callStatus !== lua.LUA_OK) {
    const err = to_jsstring(lua.lua_tostring(L, -1));
    lua.lua_pop(L, 1);
    throw new Error(`Lua exec error (${chunkName || 'chunk'}): ${err}`);
  }
}

// ---- Helper: register a module in package.loaded ----
function registerLoaded(L: LuaState, modname: string): void {
  // package.loaded[modname] = true
  lua.lua_getglobal(L, to_luastring('package'));
  lua.lua_getfield(L, -1, to_luastring('loaded'));
  lua.lua_pushboolean(L, true);
  lua.lua_setfield(L, -2, to_luastring(modname));
  lua.lua_pop(L, 2); // pop loaded, package
}

// ---- Helper: assign return value from dostring to a global ----
function loadAsGlobal(L: LuaState, code: string, globalName: string, chunkName?: string): void {
  const status = lauxlib.luaL_loadstring(L, to_luastring(code));
  if (status !== lua.LUA_OK) {
    const err = to_jsstring(lua.lua_tostring(L, -1));
    lua.lua_pop(L, 1);
    throw new Error(`Lua load error (${chunkName || globalName}): ${err}`);
  }
  const callStatus = lua.lua_pcall(L, 0, 1, 0);
  if (callStatus !== lua.LUA_OK) {
    const err = to_jsstring(lua.lua_tostring(L, -1));
    lua.lua_pop(L, 1);
    throw new Error(`Lua exec error (${chunkName || globalName}): ${err}`);
  }
  // If the module returned a value, set it as global
  if (lua.lua_type(L, -1) !== lua.LUA_TNIL) {
    lua.lua_setglobal(L, to_luastring(globalName));
  } else {
    lua.lua_pop(L, 1);
  }
}

// ---- JS <-> Lua value conversion ----

function pushValue(L: LuaState, value: unknown): void {
  if (value === null || value === undefined) {
    lua.lua_pushnil(L);
  } else if (typeof value === 'boolean') {
    lua.lua_pushboolean(L, value);
  } else if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      lua.lua_pushinteger(L, value);
    } else {
      lua.lua_pushnumber(L, value);
    }
  } else if (typeof value === 'string') {
    lua.lua_pushstring(L, to_luastring(value));
  } else if (Array.isArray(value)) {
    lua.lua_createtable(L, value.length, 0);
    for (let i = 0; i < value.length; i++) {
      pushValue(L, value[i]);
      lua.lua_rawseti(L, -2, i + 1);
    }
  } else if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    lua.lua_createtable(L, 0, entries.length);
    for (const [k, v] of entries) {
      lua.lua_pushstring(L, to_luastring(k));
      pushValue(L, v);
      lua.lua_settable(L, -3);
    }
  }
}

function toJS(L: LuaState, index: number): unknown {
  const t = lua.lua_type(L, index);
  switch (t) {
    case lua.LUA_TNIL:
    case lua.LUA_TNONE:
      return null;
    case lua.LUA_TBOOLEAN:
      return lua.lua_toboolean(L, index);
    case lua.LUA_TNUMBER:
      return lua.lua_tonumber(L, index);
    case lua.LUA_TSTRING:
      return to_jsstring(lua.lua_tostring(L, index));
    case lua.LUA_TTABLE: {
      // Check if array-like (sequential integer keys starting at 1)
      const len = lua.lua_rawlen(L, index);
      const absIdx = index < 0 ? lua.lua_gettop(L) + index + 1 : index;

      // Try as array first if len > 0
      if (len > 0) {
        let isArray = true;
        // Quick check: see if there are non-integer keys
        lua.lua_pushnil(L);
        let count = 0;
        while (lua.lua_next(L, absIdx) !== 0) {
          count++;
          lua.lua_pop(L, 1); // pop value, keep key
          if (count > len) { isArray = false; break; }
        }
        if (isArray && count === len) {
          const arr: unknown[] = [];
          for (let i = 1; i <= len; i++) {
            lua.lua_rawgeti(L, absIdx, i);
            arr.push(toJS(L, -1));
            lua.lua_pop(L, 1);
          }
          return arr;
        }
      }

      // Object
      const obj: Record<string, unknown> = {};
      lua.lua_pushnil(L);
      while (lua.lua_next(L, absIdx) !== 0) {
        const keyType = lua.lua_type(L, -2);
        let key: string;
        if (keyType === lua.LUA_TSTRING) {
          key = to_jsstring(lua.lua_tostring(L, -2));
        } else if (keyType === lua.LUA_TNUMBER) {
          key = String(lua.lua_tonumber(L, -2));
        } else {
          lua.lua_pop(L, 1);
          continue;
        }
        obj[key] = toJS(L, -1);
        lua.lua_pop(L, 1); // pop value, keep key
      }
      return obj;
    }
    default:
      return null;
  }
}

// ---- Main Bridge Class ----

export interface PrototypeData {
  recipes: Record<string, unknown>;
  entities: Record<string, unknown>;
  items: Record<string, unknown>;
  fluids: Record<string, unknown>;
  qualities: Record<string, unknown>;
  force: Record<string, unknown>;
}

export interface BlockResult {
  products: Record<string, unknown>;
  ingredients: Record<string, unknown>;
  children: Record<string, unknown>;
  power: number;
  pollution: number;
  summary: unknown;
  [key: string]: unknown;
}

export class LuaBridge {
  private L: LuaState | null = null;
  private initialized = false;

  /**
   * Initialize the Lua state with all helmod code and prototype data.
   * Call this once with the loaded prototypes.json data.
   */
  async init(prototypeData: PrototypeData): Promise<void> {
    const L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);
    this.L = L;

    // 1. Load JSON codec
    luaExec(L, jsonLua, 'json');

    // 2. Load globals shim (defines, storage, prototypes stub, etc.)
    luaExec(L, globalsLua, 'globals');

    // 3. Load core helmod: class system and table extensions
    luaExec(L, classLua, 'class');
    luaExec(L, tableExtendsLua, 'tableExtends');

    // 4. Load shim modules and assign to globals
    loadAsGlobal(L, cacheLua, 'Cache', 'Cache');
    loadAsGlobal(L, userLua, 'User', 'User');
    loadAsGlobal(L, playerLua, 'Player', 'Player');
    loadAsGlobal(L, modelLua, 'Model', 'Model');

    // 5. Inject prototype data into the Lua prototypes global
    this.injectPrototypes(prototypeData);

    // 6. Run prototype wrapper (adds callable methods to entities/items)
    luaExec(L, prototypeWrapperLua, 'prototypeWrapper');

    // 7. Force data already set by injectPrototypes

    // 8. Load model prototypes (order matters for inheritance)
    //    Pre-register in package.loaded since some files require others
    luaExec(L, prototypeLua, 'model.Prototype');
    registerLoaded(L, 'model.Prototype');

    luaExec(L, productLua, 'model.Product');
    registerLoaded(L, 'model.Product');

    luaExec(L, recipePrototypeLua, 'model.RecipePrototype');
    registerLoaded(L, 'model.RecipePrototype');

    luaExec(L, entityPrototypeLua, 'model.EntityPrototype');
    registerLoaded(L, 'model.EntityPrototype');

    luaExec(L, itemPrototypeLua, 'model.ItemPrototype');
    registerLoaded(L, 'model.ItemPrototype');

    luaExec(L, fluidPrototypeLua, 'model.FluidPrototype');
    registerLoaded(L, 'model.FluidPrototype');

    luaExec(L, energySourcePrototypeLua, 'model.EnergySourcePrototype');
    registerLoaded(L, 'model.EnergySourcePrototype');

    luaExec(L, fluidboxPrototypeLua, 'model.FluidboxPrototype');
    registerLoaded(L, 'model.FluidboxPrototype');

    // 9. Load math solvers
    luaExec(L, matrixLua, 'math.Matrix');
    registerLoaded(L, 'math.Matrix');

    luaExec(L, solverMatrixLua, 'math.SolverMatrix');
    registerLoaded(L, 'math.SolverMatrix');

    luaExec(L, solverMatrixAlgebraLua, 'math.SolverMatrixAlgebra');
    registerLoaded(L, 'math.SolverMatrixAlgebra');

    luaExec(L, solverMatrixSimplexLua, 'math.SolverMatrixSimplex');
    registerLoaded(L, 'math.SolverMatrixSimplex');

    luaExec(L, solverLinkedMatrixLua, 'math.SolverLinkedMatrix');
    registerLoaded(L, 'math.SolverLinkedMatrix');

    luaExec(L, solverLinkedMatrixAlgebraLua, 'math.SolverLinkedMatrixAlgebra');
    registerLoaded(L, 'math.SolverLinkedMatrixAlgebra');

    luaExec(L, solverLinkedMatrixSimplexLua, 'math.SolverLinkedMatrixSimplex');
    registerLoaded(L, 'math.SolverLinkedMatrixSimplex');

    // 10. Load ModelCompute (the main computation engine)
    loadAsGlobal(L, modelComputeLua, 'ModelCompute', 'data.ModelCompute');
    registerLoaded(L, 'data.ModelCompute');

    this.initialized = true;
    console.log('LuaBridge initialized successfully');
  }

  /**
   * Inject prototype data into the Lua `prototypes` global table.
   * Pushes raw JSON string to Lua and parses it there (avoids deep
   * recursive pushValue which is too slow/stack-heavy for 15MB data).
   */
  private injectPrototypes(data: PrototypeData): void {
    const L = this.L!;

    // Serialize back to JSON and push as a Lua string
    const jsonStr = JSON.stringify(data);
    lua.lua_pushstring(L, to_luastring(jsonStr));
    lua.lua_setglobal(L, to_luastring('__raw_json'));

    // Parse in Lua and assign to prototypes
    luaExec(L, `
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
              local ok, ch = pcall(utf8.char, tonumber(hex, 16))
              parts[#parts+1] = ok and ch or '?'
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
      s = nil

      prototypes.recipe = data.recipes or {}
      prototypes.entity = data.entities or {}
      prototypes.item = data.items or {}
      prototypes.fluid = data.fluids or {}
      prototypes.quality = data.qualities or {}

      if data.force then
        Player.setForceData(data.force)
      end
    `, 'injectPrototypes');
  }

  /**
   * Compute a production block using Helmod's solver.
   *
   * @param model - The model data structure containing blocks, time, parameters
   * @returns The updated model with computed values
   */
  computeModel(model: Record<string, unknown>): Record<string, unknown> {
    if (!this.initialized || !this.L) {
      throw new Error('LuaBridge not initialized. Call init() first.');
    }
    const L = this.L;

    // Convert model to JSON, pass to Lua, decode, compute, encode, return
    const modelJson = JSON.stringify(model);

    const luaCode = `
      local model_json = ...
      local model = json.decode(model_json)
      ModelCompute.update(model)
      return json.encode(model)
    `;

    const loadStatus = lauxlib.luaL_loadstring(L, to_luastring(luaCode));
    if (loadStatus !== lua.LUA_OK) {
      const err = to_jsstring(lua.lua_tostring(L, -1));
      lua.lua_pop(L, 1);
      throw new Error(`Lua load error: ${err}`);
    }

    // Push the JSON string as argument
    lua.lua_pushstring(L, to_luastring(modelJson));

    const callStatus = lua.lua_pcall(L, 1, 1, 0);
    if (callStatus !== lua.LUA_OK) {
      const err = to_jsstring(lua.lua_tostring(L, -1));
      lua.lua_pop(L, 1);
      throw new Error(`Solver error: ${err}`);
    }

    const resultJson = to_jsstring(lua.lua_tostring(L, -1));
    lua.lua_pop(L, 1);

    return JSON.parse(resultJson) as Record<string, unknown>;
  }

  /**
   * Compute a single block (lower-level API).
   * Useful when you already have a block structure.
   */
  computeBlock(block: Record<string, unknown>, parameters?: Record<string, unknown>): Record<string, unknown> {
    if (!this.initialized || !this.L) {
      throw new Error('LuaBridge not initialized. Call init() first.');
    }
    const L = this.L;

    const blockJson = JSON.stringify(block);
    const paramsJson = parameters ? JSON.stringify(parameters) : 'nil';

    const luaCode = `
      local block_json, params_json = ...
      local block = json.decode(block_json)
      local parameters = nil
      if params_json ~= "nil" then
        parameters = json.decode(params_json)
      end

      -- Capture any errors from the solver (which uses pcall internally)
      _G.__solver_errors = {}
      local orig_repportError = Player.repportError
      Player.repportError = function(err, trace)
        table.insert(_G.__solver_errors, tostring(err))
        orig_repportError(err, trace)
      end

      -- Step 0: Pre-initialize factory fields for each recipe child
      -- (needed by prepareBlockElements which calls getQualityProducts before solver runs)
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

      -- Step 1: Prepare block elements (products/ingredients) and objectives
      local ok0, err0 = pcall(function()
        ModelCompute.prepareBlockElements(block)
        ModelCompute.prepareBlockObjectives(block)
      end)
      if not ok0 then
        table.insert(_G.__solver_errors, "prepareBlock: " .. tostring(err0))
      end

      -- Step 1b: Inject target amount into objectives
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

      -- Step 2: Run the solver
      local ok, err = pcall(function()
        ModelCompute.computeBlock(block, parameters)
      end)
      if not ok then
        table.insert(_G.__solver_errors, "computeBlock: " .. tostring(err))
      end

      -- Step 3: Finalize block (compute counts, power, pollution)
      local ok2, err2 = pcall(function()
        ModelCompute.finalizeBlock(block, 1)
      end)
      if not ok2 then
        table.insert(_G.__solver_errors, "finalizeBlock: " .. tostring(err2))
      end

      Player.repportError = orig_repportError

      if #_G.__solver_errors > 0 then
        block.__errors = _G.__solver_errors
      end
      _G.__solver_errors = nil

      return json.encode(block)
    `;

    const loadStatus = lauxlib.luaL_loadstring(L, to_luastring(luaCode));
    if (loadStatus !== lua.LUA_OK) {
      const err = to_jsstring(lua.lua_tostring(L, -1));
      lua.lua_pop(L, 1);
      throw new Error(`Lua load error: ${err}`);
    }

    lua.lua_pushstring(L, to_luastring(blockJson));
    lua.lua_pushstring(L, to_luastring(paramsJson));

    const callStatus = lua.lua_pcall(L, 2, 1, 0);
    if (callStatus !== lua.LUA_OK) {
      const err = to_jsstring(lua.lua_tostring(L, -1));
      lua.lua_pop(L, 1);
      throw new Error(`Solver error: ${err}`);
    }

    const resultJson = to_jsstring(lua.lua_tostring(L, -1));
    lua.lua_pop(L, 1);

    return JSON.parse(resultJson) as Record<string, unknown>;
  }

  /**
   * Get a recipe prototype by name.
   */
  getRecipe(name: string): unknown {
    return this.callLuaFunction('Player.getRecipe', name);
  }

  /**
   * Get all recipe names.
   */
  getRecipeNames(): string[] {
    if (!this.initialized || !this.L) return [];
    const L = this.L;

    luaExec(L, `
      local names = {}
      for name, _ in pairs(prototypes.recipe) do
        names[#names+1] = name
      end
      table.sort(names)
      __bridge_result = json.encode(names)
    `, 'getRecipeNames');

    lua.lua_getglobal(L, to_luastring('__bridge_result'));
    const json = to_jsstring(lua.lua_tostring(L, -1));
    lua.lua_pop(L, 1);

    return JSON.parse(json) as string[];
  }

  /**
   * Get all entity names of a given type.
   */
  getEntitiesByType(entityType: string): string[] {
    if (!this.initialized || !this.L) return [];
    const L = this.L;

    const code = `
      local target_type = "${entityType}"
      local names = {}
      for name, entity in pairs(prototypes.entity) do
        if entity.type == target_type then
          names[#names+1] = name
        end
      end
      table.sort(names)
      __bridge_result = json.encode(names)
    `;

    luaExec(L, code, 'getEntitiesByType');
    lua.lua_getglobal(L, to_luastring('__bridge_result'));
    const json = to_jsstring(lua.lua_tostring(L, -1));
    lua.lua_pop(L, 1);

    return JSON.parse(json) as string[];
  }

  /**
   * Update force data (productivity bonuses, etc.).
   */
  setForceData(forceData: Record<string, unknown>): void {
    if (!this.initialized || !this.L) return;
    const L = this.L;

    const forceJson = JSON.stringify(forceData);
    luaExec(L, `
      local data = json.decode('${forceJson.replace(/'/g, "\\'")}')
      Player.setForceData(data)
    `, 'setForceData');
  }

  /**
   * Execute arbitrary Lua code (for debugging/testing).
   */
  exec(code: string): unknown {
    if (!this.initialized || !this.L) {
      throw new Error('LuaBridge not initialized');
    }
    luaExec(this.L, code, 'exec');
    // Return top of stack if anything was pushed
    if (lua.lua_gettop(this.L) > 0) {
      const result = toJS(this.L, -1);
      lua.lua_settop(this.L, 0);
      return result;
    }
    return null;
  }

  /**
   * Call a Lua function by dotted path with a single string argument,
   * returning the result as JSON.
   */
  private callLuaFunction(path: string, arg: string): unknown {
    if (!this.initialized || !this.L) return null;
    const L = this.L;

    const code = `
      local arg = "${arg}"
      local fn = ${path}
      local result = fn(arg)
      if result ~= nil then
        __bridge_result = json.encode(result)
      else
        __bridge_result = "null"
      end
    `;

    luaExec(L, code, path);
    lua.lua_getglobal(L, to_luastring('__bridge_result'));
    const json = to_jsstring(lua.lua_tostring(L, -1));
    lua.lua_pop(L, 1);

    return JSON.parse(json);
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Destroy the Lua state and free resources.
   */
  destroy(): void {
    this.L = null;
    this.initialized = false;
  }
}

// Singleton instance
let bridgeInstance: LuaBridge | null = null;

export function getLuaBridge(): LuaBridge {
  if (!bridgeInstance) {
    bridgeInstance = new LuaBridge();
  }
  return bridgeInstance;
}
