-- globals.lua: Shim for Factorio globals needed by Helmod solver
-- This must be loaded FIRST before any Helmod files

-- Factorio globals
storage = {}
settings = { global = {} }
prototypes = { recipe = {}, entity = {}, item = {}, fluid = {}, quality = {}, tile = {},
               surface = {}, surface_property = {}, space_location = {},
               recipe_category = {},
               get_recipe_filtered = function() return {} end,
               get_entity_filtered = function() return {} end,
               get_item_filtered = function() return {} end,
               get_fluid_filtered = function() return {} end,
               get_tile_filtered = function() return {} end,
               get_technology_filtered = function() return {} end }
game = { surfaces = {}, players = {},
         create_inventory = function() return {} end,
         table_to_json = function(t) return "{}" end }
script = { active_mods = {}, feature_flags = { quality = true } }
helpers = { is_valid_sprite_path = function() return true end }

-- Logging
function log(...)
    -- no-op in browser, or bridge to console.log
end

-- table_size polyfill (Factorio built-in)
function table_size(t)
    if t == nil then return 0 end
    local count = 0
    for _ in pairs(t) do count = count + 1 end
    return count
end

-- spairs: sorted pairs iterator
function spairs(t, order)
    if t == nil then return function() end end
    local keys = {}
    for k in pairs(t) do keys[#keys+1] = k end
    if order then
        table.sort(keys, function(a,b) return order(t, a, b) end)
    else
        table.sort(keys)
    end
    local i = 0
    return function()
        i = i + 1
        if keys[i] then
            return keys[i], t[keys[i]]
        end
    end
end

-- first: return first element of a table
function first(t)
    if t == nil then return nil end
    for _, v in pairs(t) do
        return v
    end
    return nil
end

-- bit32 compatibility for Lua 5.3+
if not bit32 then
    bit32 = {}
    bit32.band = function(a, b) return a & b end
    bit32.bor = function(a, b) return a | b end
    bit32.bxor = function(a, b) return a ~ b end
    bit32.bnot = function(a) return ~a end
    bit32.lshift = function(a, n) return a << n end
    bit32.rshift = function(a, n) return a >> n end
end

-- defines: Factorio + Helmod constants
defines = defines or {}
defines.inventory = {
    beacon_modules = 1,
    crafter_modules = 4,
    mining_drill_modules = 2,
    lab_modules = 3
}

-- Helmod-specific defines (from core/defines.lua)
defines.mod = defines.mod or {}
defines.mod.recipe_customized_prefix = "helmod_customized"
defines.mod.recipe_customized_category = "crafting"
defines.mod.recipes = {}
defines.mod.recipes.recipe = {name = "recipe", is_customizable = true}
defines.mod.recipes.burnt = {name = "recipe-burnt", category="helmod-burnt"}
defines.mod.recipes.energy = {name = "energy", category="helmod-energy"}
defines.mod.recipes.resource = {name = "resource", category="helmod-mining"}
defines.mod.recipes.fluid = {name = "fluid", category="helmod-pumping"}
defines.mod.recipes.boiler = {name = "boiler"}
defines.mod.recipes.technology = {name = "technology", category="helmod-research"}
defines.mod.recipes.rocket = {name = "rocket", category="helmod-rocket"}
defines.mod.recipes.agricultural = {name = "agricultural", category="helmod-farming"}
defines.mod.recipes.spoiling = {name = "spoiling"}
defines.mod.recipes.constant = {name = "constant", is_customizable = true}

defines.sorters = {}
defines.sorters.block = {}
defines.sorters.block.sort = function(t, a, b) return t[b]["index"] > t[a]["index"] end
defines.sorters.block.reverse = function(t, a, b) return t[b]["index"] < t[a]["index"] end

defines.constant = defines.constant or {}
defines.constant.solvers = {}
defines.constant.solvers.default = "linked matrix"
defines.constant.solvers.matrix = "matrix"
defines.constant.rocket_deploy_delay = 2434 / 60
defines.constant.max_float = 1e300
defines.constant.beacon_combo = 1
defines.constant.beacon_factory = 1/8
defines.constant.beacon_constant = 0

defines.constant.base_times = {
    { value = 1, caption = "1s"},
    { value = 60, caption = "1"},
    { value = 300, caption = "5"},
    { value = 600, caption = "10"},
    { value = 1800, caption = "30"},
    { value = 3600, caption = "1h"},
}

-- Preferences with defaults (from defines_preferences.lua)
defines.constant.preferences = {
    one_block_factor_enable = { default_value = true },
    format_number_factory = { default_value = "0" },
    format_number_element = { default_value = "0.0" },
    display_product_order = { default_value = "natural" },
    display_hidden_products_mode = { default_value = "relative" },
    display_hidden_products = { default_value = 0.01 },
    display_product_cols = { default_value = 5 },
    display_ingredient_cols = { default_value = 5 },
    display_spoilage = { default_value = true },
    display_pollution = { default_value = true },
    display_building = { default_value = true },
    beacon_affecting_one = { default_value = 1 },
    beacon_by_factory = { default_value = 1/8 },
    beacon_constant = { default_value = 0 },
    ui_summary_mode = { default_value = "global" },
    default_factory_level = { default_value = "1" },
}

defines.constant.settings_mod = {
    debug_solver = { default_value = false },
    display_all_sheet = { default_value = false },
    model_filter_factory_module = { default_value = true },
    model_filter_beacon_module = { default_value = true },
    model_filter_factory = { default_value = true },
    model_filter_beacon = { default_value = true },
    filter_translated_string_active = { default_value = true },
    filter_on_text_changed = { default_value = false },
    hidden_panels = { default_value = false },
    display_hidden_column = { default_value = "None" },
    display_ratio_horizontal = { default_value = 0.85 },
    display_ratio_vertical = { default_value = 0.8 },
    display_main_icon = { default_value = true },
    display_cell_mod = { default_value = "default" },
    row_move_step = { default_value = 5 },
    user_cache_step = { default_value = 100 },
}

-- Stub sprites (referenced by defines.lua but not needed for solver)
defines.sprites = setmetatable({}, {
    __index = function(t, k)
        return setmetatable({}, {
            __index = function(t2, k2) return "" end
        })
    end
})

-- Factorio require shimming: make require work with Helmod paths
-- We override require to handle helmod-style requires like "math.Matrix"
local original_require = require
local loaded_modules = {}

-- Factorio util module stub
package.loaded["util"] = {}
package.loaded["mod-gui"] = {}
