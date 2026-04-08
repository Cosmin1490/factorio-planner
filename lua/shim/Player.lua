-- Player.lua: Shim for Helmod Player module
-- Backed by prototypes global table (loaded from JSON export)

local Player = {
    classname = "HMPlayer"
}

local force_data = {
    recipes = {},
    mining_drill_productivity_bonus = 0,
    laboratory_speed_modifier = 0,
    laboratory_productivity_bonus = 0,
    belt_stack_size_bonus = 0,
    inserter_stack_size_bonus = 0,
    bulk_inserter_capacity_bonus = 0,
    worker_robots_storage_bonus = 0,
}

function Player.print(...)
    -- Bridge to JS console.log if available
end

function Player.load(event)
    return Player
end

function Player.set(player)
    return Player
end

function Player.try_load_by_name(name)
    return Player
end

function Player.native()
    return { name = "player", index = 1, admin = true, valid = true,
             display_resolution = { width = 1920, height = 1080 },
             display_scale = 1,
             force = Player.getForce(),
             gui = {} }
end

function Player.getName()
    return "player"
end

function Player.isAdmin()
    return true
end

function Player.getForce()
    return force_data
end

function Player.setForceData(data)
    for k, v in pairs(data) do
        force_data[k] = v
    end
end

function Player.getBeltStackSizeBonus()
    return force_data.belt_stack_size_bonus or 0
end

-- Prototype lookups
function Player.getRecipe(name)
    if name == nil then return nil end
    return prototypes.recipe[name]
end

function Player.getPlayerRecipe(name)
    if name == nil then return nil end
    local recipe = prototypes.recipe[name]
    if recipe ~= nil then
        -- Simulate force recipe with enabled/productivity
        if recipe._force == nil then
            recipe._force = {
                enabled = recipe.enabled ~= false,
                productivity_bonus = (force_data.recipes[name] and force_data.recipes[name].productivity_bonus) or 0,
                name = name,
                localised_name = recipe.localised_name or name,
                ingredients = recipe.ingredients,
                products = recipe.products
            }
        end
        return recipe._force
    end
    return nil
end

function Player.getPlayerRecipes()
    local result = {}
    for name, recipe in pairs(prototypes.recipe) do
        result[name] = Player.getPlayerRecipe(name)
    end
    return result
end

function Player.findFirstRecipe(name)
    if name == nil then return nil end
    for _, recipe in pairs(prototypes.recipe) do
        if recipe.products then
            for _, product in pairs(recipe.products) do
                if product.name == name then
                    return recipe
                end
            end
        end
    end
    return nil
end

function Player.getRecipes()
    return prototypes.recipe
end

function Player.getRecipeCategories()
    return prototypes.recipe_category or {}
end

function Player.getRecipeProductivityBonus(recipe_name)
    if force_data.recipes[recipe_name] then
        return force_data.recipes[recipe_name].productivity_bonus or 0
    end
    return 0
end

function Player.getEntityPrototype(name)
    if name == nil then return nil end
    return prototypes.entity[name]
end

function Player.getEntityPrototypes(filters)
    if filters ~= nil then
        -- Simple filter implementation for common cases
        local results = {}
        for name, entity in pairs(prototypes.entity) do
            local match = true
            -- TODO: implement filter logic if needed
            if match then results[name] = entity end
        end
        return results
    end
    return prototypes.entity
end

function Player.getItemPrototype(name)
    if name == nil then return nil end
    return prototypes.item[name]
end

function Player.getItemPrototypes(filters)
    if filters ~= nil then
        local results = {}
        for name, item in pairs(prototypes.item) do
            results[name] = item
        end
        return results
    end
    return prototypes.item
end

function Player.getFluidPrototype(name)
    if name == nil then return nil end
    return prototypes.fluid[name]
end

function Player.getFluidPrototypes(filters)
    if filters ~= nil then
        local results = {}
        for name, fluid in pairs(prototypes.fluid) do
            results[name] = fluid
        end
        return results
    end
    return prototypes.fluid
end

function Player.getTilePrototypes(filters)
    return prototypes.tile or {}
end

function Player.getTilePrototype(name)
    if name == nil then return nil end
    return (prototypes.tile or {})[name]
end

function Player.getQualityPrototype(name)
    if name == nil then return nil end
    return (prototypes.quality or {})[name]
end

function Player.getQualityPrototypes()
    return prototypes.quality or {}
end

function Player.getQualityPrototypesWithoutHidden()
    local result = {}
    for name, quality in pairs(prototypes.quality or {}) do
        if quality.hidden == false then
            result[name] = quality
        end
    end
    return result
end

function Player.getNextQualityPrototype(name)
    if name == nil then return nil end
    local quality = Player.getQualityPrototype(name)
    if quality and quality.next then
        return quality.next
    end
    return nil
end

function Player.getPreviousQualityPrototype(name)
    if name == nil then return nil end
    for _, quality in pairs(prototypes.quality or {}) do
        if quality.next ~= nil and quality.next.name == name then
            return quality
        end
    end
    return nil
end

function Player.hasFeatureQuality()
    return script.feature_flags["quality"] == true
end

function Player.getTechnology(name)
    return nil -- not needed for basic solver
end

function Player.getPlayerTechnology(name)
    return nil
end

function Player.getPlayerTechnologies()
    return {}
end

function Player.getTechnologies(filters)
    return {}
end

function Player.getCraftingSpeed()
    return 1
end

function Player.getGameDay()
    -- vanilla defaults: day=25000 ticks, dusk ratio, night ratio, dawn ratio
    local day = 25000
    local dusk = 5000
    local night = 2500
    local dawn = 5000
    return day, day * (dusk/day), day * (night/day), day * (dawn/day)
end

function Player.getDisplaySizes()
    return 1920, 1080, 1
end

-- Module effects
function Player.getModuleEffects(module)
    local module_effects = { speed = 0, productivity = 0, consumption = 0, pollution = 0, quality = 0 }
    if module == nil then return module_effects end
    local item = Player.getItemPrototype(module.name)
    if item == nil then return module_effects end

    local effects = item.module_effects
    if effects == nil then return module_effects end

    -- If quality-specific effects exist, use them
    local quality = module.quality or "normal"
    if type(effects) == "table" and effects[quality] then
        effects = effects[quality]
    end

    for effect_name, effect_value in pairs(effects) do
        local final_value = effect_value
        if final_value >= 0 then
            final_value = math.floor(final_value * 100 + 0.05) / 100
        else
            final_value = math.ceil(final_value * 100 - 0.05) / 100
        end
        if effect_name == "quality" then
            final_value = final_value / 10
        end
        module_effects[effect_name] = final_value
    end
    return module_effects
end

-- Resource/fluid/boiler/rocket recipe builders (simplified)
function Player.getResources()
    return {}
end

function Player.getResourceRecipe(name)
    return nil
end

function Player.getResourceRecipes()
    return {}
end

function Player.getFluidRecipes()
    return {}
end

function Player.getFluidRecipe(name)
    return nil
end

function Player.getBoilers(fluid_name)
    return {}
end

function Player.getBoilerRecipes()
    return {}
end

function Player.getBoilerRecipe(name)
    return nil
end

function Player.getBoilersForRecipe(recipe_prototype)
    return {}
end

function Player.getRocketRecipe(name)
    return nil
end

function Player.getRocketRecipes()
    return {}
end

function Player.getRocketPartRecipe(factory)
    return nil
end

function Player.getBurntRecipe(name)
    return nil
end

function Player.getEnergyRecipe(name)
    return nil
end

function Player.getAgriculturalRecipe(name)
    return nil
end

function Player.getAgriculturalRecipes()
    return {}
end

function Player.getSpoilableRecipe(name)
    return nil
end

function Player.getSpoilableRecipes()
    return {}
end

function Player.getFluidTemperaturePrototypes(fluid)
    return {}
end

function Player.getFluidFuelPrototypes()
    return {}
end

function Player.getCustomizedRecipes()
    return {}
end

function Player.getCustomizedRecipe(name)
    return nil
end

function Player.setCustomizedRecipe(recipe)
end

function Player.removeCustomizedRecipe(recipe)
end

-- Production machines
function Player.getProductionMachines()
    return {}
end

function Player.getCategoriesMachines()
    return {}
end

function Player.getProductionsBeacon()
    return {}
end

function Player.getMiningMachines()
    return {}
end

function Player.getLabMachines()
    return {}
end

function Player.getRocketMachines()
    return {}
end

function Player.getOffshorePumps()
    return {}
end

function Player.getAgriculturalTowers()
    return {}
end

function Player.getEnergyMachines()
    return {}
end

function Player.getModules()
    return {}
end

function Player.getRules(rule_name)
    return {}, {}
end

function Player.checkRules(check, rules, category, lua_entity, included)
    return check
end

function Player.searchRecipe(element_name, by_ingredient)
    return {}
end

-- Stubs for GUI/tool functions (not needed for solver)
function Player.getGui(location) return {} end
function Player.is_valid_sprite_path(path) return true end
function Player.getLocalisedName(element) return element.name or "unknown" end
function Player.getRecipeLocalisedName(prototype) return prototype.name end
function Player.getItemIconType(element) return "item" end
function Player.setShortcutState(state) end
function Player.setPipette(entity) end
function Player.getMainInventory() return nil end
function Player.beginCrafting(item, count) end
function Player.getSmartTool(entities) return nil end
function Player.setSmartTool(recipe, type, index) end
function Player.setSmartToolRecipeConstantCombinator(recipe, type, index) end
function Player.setSmartToolRecipeDisplayPanel(recipe, type, index, always_show) end
function Player.setSmartToolBuildingConstantCombinator(block) end
function Player.getItemsLogistic(type) return {} end
function Player.getFluidsLogistic(type) return {} end
function Player.getDefaultItemLogistic(type) return nil end
function Player.getDefaultFluidLogistic(type) return nil end
function Player.parseNumber(number) return tonumber(number) or 0 end
function Player.open_factoriopedia_gui(element) end
function Player.traceEvent(event) return nil end
function Player.getStorageDebug() return {} end
function Player.repportError(error, trace)
    print("[Helmod Error] " .. tostring(error))
    if trace then print("[Helmod Trace] " .. tostring(trace)) end
end
function Player.getLastError() return nil end

function Player.getSurfaces() return {} end
function Player.getSurfacePrototypes() return {} end
function Player.getSurfacePropertyPrototypes() return {} end
function Player.getSpaceLocationPrototypes() return {} end
function Player.getHMLocations() return {} end
function Player.getEntityPrototypeTypes() return {} end
function Player.getItemPrototypeTypes() return {} end
function Player.getFluidPrototypeTypes() return {} end
function Player.getFluidPrototypeSubgroups() return {} end
function Player.getPlants() return {} end
function Player.getSeeds() return {} end
function Player.ExcludePlacedByHidden(entities) return entities end
function Player.checkFactoryLimitationModule(module, lua_recipe) return true end
function Player.getFactoryLimitationModuleMessage(module, lua_recipe) return nil end
function Player.checkBeaconLimitationModule(beacon, lua_recipe, module) return true end
function Player.getBeaconLimitationModuleMessage(beacon, lua_recipe, module) return nil end
function Player.checkPositiveEffect(name, value)
    local is_positive = {speed=true, productivity=true, quality=true, consumption=false, pollution=false}
    return (value > 0) == is_positive[name]
end
function Player.buildResourceRecipe(entity_prototype) return nil end
function Player.buildFluidRecipe(fluid, ingredients, temperature, product_amount) return nil end
function Player.buildRocketRecipe(prototype) return nil end
function Player.getProductionMachine(lua_prototype)
    return { name = lua_prototype.name, type = lua_prototype.type, crafting_speed = 1 }
end
function Player.getProductionMachineSpeed(lua_prototype) return 1 end
function Player.getAllProductionsCrafting(lua_recipe) return {} end
function Player.getProductionsCrafting(category, lua_recipe) return {} end

return Player
