-- helmod-web-export: Dumps all Factorio prototype data as JSON
-- Usage: Run /helmod-web-export in the Factorio console
-- Output: Written to script-output/helmod-web-prototypes.json

local function get_quality_names()
    local qualities = {}
    for name, quality in pairs(prototypes.quality) do
        if quality.hidden == false then
            table.insert(qualities, name)
        end
    end
    if #qualities == 0 then
        table.insert(qualities, "normal")
    end
    return qualities
end

local function safe_call(fn, ...)
    local ok, result = pcall(fn, ...)
    if ok then return result end
    return nil
end

local function export_recipes()
    local recipes = {}
    for name, recipe in pairs(prototypes.recipe) do
        local r = {
            name = recipe.name,
            category = recipe.category,
            energy = recipe.energy,
            enabled = recipe.enabled,
            hidden = recipe.hidden,
            hidden_from_player_crafting = recipe.hidden_from_player_crafting,
            emissions_multiplier = recipe.emissions_multiplier,
            maximum_productivity = recipe.maximum_productivity,
            order = recipe.order,
            ingredients = {},
            products = {},
            allowed_effects = recipe.allowed_effects,
            allowed_module_categories = recipe.allowed_module_categories,
            additional_categories = recipe.additional_categories,
            effect_limitation_messages = recipe.effect_limitation_messages,
        }
        -- ingredients
        for _, ing in pairs(recipe.ingredients or {}) do
            table.insert(r.ingredients, {
                name = ing.name,
                type = ing.type,
                amount = ing.amount,
                minimum_temperature = ing.minimum_temperature,
                maximum_temperature = ing.maximum_temperature,
                catalyst_amount = ing.catalyst_amount,
            })
        end
        -- products
        for _, prod in pairs(recipe.products or {}) do
            table.insert(r.products, {
                name = prod.name,
                type = prod.type,
                amount = prod.amount,
                amount_min = prod.amount_min,
                amount_max = prod.amount_max,
                probability = prod.probability,
                temperature = prod.temperature,
                catalyst_amount = prod.catalyst_amount,
                extra_count_fraction = prod.extra_count_fraction,
                ignored_by_productivity = prod.ignored_by_productivity,
                percent_spoiled = prod.percent_spoiled,
            })
        end
        -- group/subgroup
        if recipe.group then
            r.group = { name = recipe.group.name, order = recipe.group.order }
        end
        if recipe.subgroup then
            r.subgroup = { name = recipe.subgroup.name, order = recipe.subgroup.order }
        end
        recipes[name] = r
    end
    return recipes
end

local function export_entities()
    local entities = {}
    local quality_names = get_quality_names()

    for name, entity in pairs(prototypes.entity) do
        if entity.name ~= nil then
            local e = {
                name = entity.name,
                type = entity.type,
                order = entity.order,
                hidden = entity.hidden,
            }

            -- Many properties are type-specific and error on wrong entity type
            -- Use safe_call to read them without crashing
            local function safe_get(prop)
                local ok, val = pcall(function() return entity[prop] end)
                if ok then return val end
                return nil
            end

            e.module_inventory_size = safe_get("module_inventory_size")
            e.ingredient_count = safe_get("ingredient_count")
            e.energy_usage = safe_get("energy_usage")
            e.mining_speed = safe_get("mining_speed")
            e.neighbour_bonus = safe_get("neighbour_bonus")
            e.distribution_effectivity = safe_get("distribution_effectivity")
            e.distribution_effectivity_bonus_per_quality_level = safe_get("distribution_effectivity_bonus_per_quality_level")
            e.resource_category = safe_get("resource_category")
            e.resource_drain_rate_percent = safe_get("resource_drain_rate_percent")
            e.effectivity = safe_get("effectivity")
            e.maximum_temperature = safe_get("maximum_temperature")
            e.target_temperature = safe_get("target_temperature")
            e.fluid_capacity = safe_get("fluid_capacity")
            e.burns_fluid = safe_get("burns_fluid")
            e.fixed_recipe = safe_get("fixed_recipe")
            e.rocket_parts_required = safe_get("rocket_parts_required")
            e.science_pack_drain_rate_percent = safe_get("science_pack_drain_rate_percent")
            e.belt_speed = safe_get("belt_speed")
            e.bulk = safe_get("bulk")
            e.growth_grid_tile_size = safe_get("growth_grid_tile_size")
            e.tile_width = safe_get("tile_width")
            e.tile_height = safe_get("tile_height")
            e.beacon_counter = safe_get("beacon_counter")
            e.quality_affects_module_slots = safe_get("quality_affects_module_slots")

            -- Crafting categories
            local ok_cc, crafting_cats = pcall(function() return entity.crafting_categories end)
            if ok_cc and crafting_cats then
                e.crafting_categories = {}
                for cat, _ in pairs(crafting_cats) do
                    e.crafting_categories[cat] = true
                end
            end

            -- Resource categories
            local ok_rc, resource_cats = pcall(function() return entity.resource_categories end)
            if ok_rc and resource_cats then
                e.resource_categories = {}
                for cat, _ in pairs(resource_cats) do
                    e.resource_categories[cat] = true
                end
            end

            -- Effect receiver
            local ok_er, effect_recv = pcall(function() return entity.effect_receiver end)
            if ok_er and effect_recv then
                e.effect_receiver = {
                    base_effect = effect_recv.base_effect or {},
                    uses_module_effects = effect_recv.uses_module_effects,
                    uses_beacon_effects = effect_recv.uses_beacon_effects,
                    uses_surface_effects = effect_recv.uses_surface_effects,
                }
            end

            -- Allowed effects
            e.allowed_effects = safe_get("allowed_effects")
            e.allowed_module_categories = safe_get("allowed_module_categories")

            -- Profile (for beacons)
            local ok_pr, profile = pcall(function() return entity.profile end)
            if ok_pr and profile then
                e.profile = {}
                for i, v in pairs(profile) do
                    e.profile[i] = v
                end
            end

            -- Per-quality computed values
            e.crafting_speed = {}
            e.max_energy_usage = {}
            e.max_energy_production = {}
            e.max_power_output = {}
            e.fluid_usage_per_tick = {}
            e.researching_speed = {}
            e.pumping_speed = {}
            e.inserter_rotation_speed = {}
            e.valve_flow_rate = {}

            for _, qname in pairs(quality_names) do
                e.crafting_speed[qname] = safe_call(entity.get_crafting_speed, qname)
                e.max_energy_usage[qname] = safe_call(entity.get_max_energy_usage, qname)
                e.max_energy_production[qname] = safe_call(entity.get_max_energy_production, qname)
                e.max_power_output[qname] = safe_call(entity.get_max_power_output, qname)
                e.fluid_usage_per_tick[qname] = safe_call(entity.get_fluid_usage_per_tick, qname)
                e.researching_speed[qname] = safe_call(entity.get_researching_speed, qname)
                e.pumping_speed[qname] = safe_call(entity.get_pumping_speed, qname)
                e.inserter_rotation_speed[qname] = safe_call(entity.get_inserter_rotation_speed, qname)
                e.valve_flow_rate[qname] = safe_call(entity.get_valve_flow_rate, qname)
            end

            -- Inventory size
            e.inventory_size_1 = safe_call(entity.get_inventory_size, 1)
            e.inventory_size_2 = safe_call(entity.get_inventory_size, 2)

            -- Energy sources (all type-specific, wrap each in pcall)
            -- Helper to safely read properties from a prototype object
            local function safe_props(obj, keys)
                local result = {}
                for _, key in pairs(keys) do
                    local ok, val = pcall(function() return obj[key] end)
                    if ok then result[key] = val end
                end
                return result
            end

            local ok_ee, ee_src = pcall(function() return entity.electric_energy_source_prototype end)
            if ok_ee and ee_src then
                local props = safe_props(ee_src, {
                    "buffer_capacity", "drain", "usage_priority",
                    "input_flow_limit", "output_flow_limit",
                    "emissions_per_joule", "effectivity"
                })
                props.type = "electric"
                e.electric_energy_source = props
            end
            local ok_bp, bp_src = pcall(function() return entity.burner_prototype end)
            if ok_bp and bp_src then
                local props = safe_props(bp_src, {
                    "fuel_categories", "effectivity",
                    "emissions_per_joule", "fuel_inventory_size"
                })
                props.type = "burner"
                e.burner_prototype = props
            end
            local ok_he, he_src = pcall(function() return entity.heat_energy_source_prototype end)
            if ok_he and he_src then
                local props = safe_props(he_src, {"emissions_per_joule", "effectivity"})
                props.type = "heat"
                e.heat_energy_source = props
            end
            local ok_fe, fe_src = pcall(function() return entity.fluid_energy_source_prototype end)
            if ok_fe and fe_src then
                local props = safe_props(fe_src, {
                    "burns_fluid", "effectivity", "emissions_per_joule",
                    "fluid_usage_per_tick", "maximum_temperature", "speed_modifier"
                })
                props.type = "fluid"
                e.fluid_energy_source = props
                local ok_fb, fluid_box = pcall(function() return fe_src.fluid_box end)
                if ok_fb and fluid_box then
                    local ok_ff, filter = pcall(function() return fluid_box.filter end)
                    e.fluid_energy_source.fluid_box = {
                        filter = (ok_ff and filter) and { name = filter.name } or nil,
                    }
                end
            end
            local ok_ve, ve_src = pcall(function() return entity.void_energy_source_prototype end)
            if ok_ve and ve_src then
                e.void_energy_source = { type = "void" }
            end

            -- Fluidbox prototypes
            local ok_fbp, fluidboxes = pcall(function() return entity.fluidbox_prototypes end)
            if ok_fbp and fluidboxes and #fluidboxes > 0 then
                e.fluidbox_prototypes = {}
                for _, fb in pairs(fluidboxes) do
                    local fluidbox = {
                        production_type = fb.production_type,
                        minimum_temperature = fb.minimum_temperature,
                        maximum_temperature = fb.maximum_temperature,
                    }
                    if fb.filter then
                        fluidbox.filter = { name = fb.filter.name }
                    end
                    table.insert(e.fluidbox_prototypes, fluidbox)
                end
            end

            -- Mineable properties
            local ok_mp, mine_props = pcall(function() return entity.mineable_properties end)
            if ok_mp and mine_props then
                e.mineable_properties = {
                    hardness = mine_props.hardness,
                    mining_time = mine_props.mining_time,
                    required_fluid = mine_props.required_fluid,
                    fluid_amount = mine_props.fluid_amount,
                    products = mine_props.products,
                }
            end

            -- Group/subgroup
            local ok_gr, group = pcall(function() return entity.group end)
            if ok_gr and group then
                e.group = { name = group.name, order = group.order }
            end
            local ok_sg, subgroup = pcall(function() return entity.subgroup end)
            if ok_sg and subgroup then
                e.subgroup = { name = subgroup.name, order = subgroup.order }
            end

            -- Items to place
            local ok_ip, items_to_place = pcall(function() return entity.items_to_place_this end)
            if ok_ip and items_to_place then
                e.items_to_place_this = {}
                for _, item in pairs(items_to_place) do
                    if type(item) == "string" then
                        table.insert(e.items_to_place_this, { name = item })
                    elseif item.name then
                        table.insert(e.items_to_place_this, { name = item.name })
                    end
                end
            end

            entities[name] = e
        end
    end
    return entities
end

local function export_items()
    local items = {}
    local quality_names = get_quality_names()

    for name, item in pairs(prototypes.item) do
        local function item_get(prop)
            local ok, val = pcall(function() return item[prop] end)
            if ok then return val end
            return nil
        end

        local i = {
            name = item.name,
            type = item.type,
            order = item.order,
            hidden = item.hidden,
            stack_size = item_get("stack_size"),
            fuel_value = item_get("fuel_value"),
            fuel_emissions_multiplier = item_get("fuel_emissions_multiplier"),
            fuel_category = item_get("fuel_category"),
            weight = item_get("weight"),
            category = item_get("module_category"),
            rocket_launch_products = item_get("rocket_launch_products"),
        }

        -- Module effects per quality
        if item.type == "module" then
            i.module_effects = {}
            for _, qname in pairs(quality_names) do
                local effects = safe_call(item.get_module_effects, qname)
                if effects then
                    i.module_effects[qname] = {}
                    for ename, evalue in pairs(effects) do
                        i.module_effects[qname][ename] = evalue
                    end
                end
            end
        end

        -- Burnt result
        local burnt = item_get("burnt_result")
        if burnt then
            i.burnt_result = { name = burnt.name, type = "item" }
        end

        -- Spoil result
        local spoil = item_get("spoil_result")
        if spoil then
            i.spoil_result = { name = spoil.name }
            i.spoil_ticks = safe_call(item.get_spoil_ticks)
        end

        -- Plant result
        if item_get("plant_result") then
            i.has_plant_result = true
        end

        -- Group/subgroup
        local group = item_get("group")
        if group then
            i.group = { name = group.name, order = group.order }
        end
        local subgroup = item_get("subgroup")
        if subgroup then
            i.subgroup = { name = subgroup.name, order = subgroup.order }
        end

        items[name] = i
    end
    return items
end

local function export_fluids()
    local fluids = {}
    for name, fluid in pairs(prototypes.fluid) do
        fluids[name] = {
            name = fluid.name,
            type = "fluid",
            order = fluid.order,
            hidden = fluid.hidden,
            heat_capacity = fluid.heat_capacity,
            default_temperature = fluid.default_temperature,
            max_temperature = fluid.max_temperature,
            fuel_value = fluid.fuel_value,
            emissions_multiplier = fluid.emissions_multiplier,
        }
        if fluid.group then
            fluids[name].group = { name = fluid.group.name }
        end
        if fluid.subgroup then
            fluids[name].subgroup = { name = fluid.subgroup.name }
        end
    end
    return fluids
end

local function export_qualities()
    local qualities = {}
    for name, quality in pairs(prototypes.quality) do
        local q = {
            name = quality.name,
            level = quality.level,
            hidden = quality.hidden,
            order = quality.order,
            next_probability = quality.next_probability,
            mining_drill_resource_drain_multiplier = quality.mining_drill_resource_drain_multiplier,
            lab_module_slots_bonus = quality.lab_module_slots_bonus,
            beacon_module_slots_bonus = quality.beacon_module_slots_bonus,
            mining_drill_module_slots_bonus = quality.mining_drill_module_slots_bonus,
            crafting_machine_module_slots_bonus = quality.crafting_machine_module_slots_bonus,
        }
        if quality.next then
            q.next = { name = quality.next.name }
        end
        qualities[name] = q
    end
    -- Resolve next references to full objects
    for name, q in pairs(qualities) do
        if q.next and q.next.name then
            q.next = qualities[q.next.name]
        end
    end
    return qualities
end

local function export_force(player)
    local force = player.force
    local force_data = {
        mining_drill_productivity_bonus = force.mining_drill_productivity_bonus or 0,
        laboratory_speed_modifier = force.laboratory_speed_modifier or 0,
        laboratory_productivity_bonus = force.laboratory_productivity_bonus or 0,
        belt_stack_size_bonus = force.belt_stack_size_bonus or 0,
        inserter_stack_size_bonus = force.inserter_stack_size_bonus or 0,
        bulk_inserter_capacity_bonus = force.bulk_inserter_capacity_bonus or 0,
        worker_robots_storage_bonus = force.worker_robots_storage_bonus or 0,
        recipes = {},
    }
    for name, recipe in pairs(force.recipes) do
        if recipe.productivity_bonus and recipe.productivity_bonus > 0 then
            force_data.recipes[name] = {
                productivity_bonus = recipe.productivity_bonus,
                enabled = recipe.enabled,
            }
        end
    end
    return force_data
end

-- Chunk the JSON output since helpers.write_file has limits
local function write_json_chunked(filename, json_str)
    local chunk_size = 200000 -- 200KB chunks
    local first = true
    for i = 1, #json_str, chunk_size do
        local chunk = json_str:sub(i, i + chunk_size - 1)
        helpers.write_file(filename, chunk, not first)
        first = false
    end
end

commands.add_command("helmod-web-export", "Export prototype data for Helmod Web", function(command)
    local player = game.player or game.players[1]
    if player == nil then
        log("No player found for export")
        return
    end

    player.print("Starting Helmod Web export...")

    local data = {}

    player.print("Exporting recipes...")
    data.recipes = export_recipes()

    player.print("Exporting entities...")
    data.entities = export_entities()

    player.print("Exporting items...")
    data.items = export_items()

    player.print("Exporting fluids...")
    data.fluids = export_fluids()

    player.print("Exporting qualities...")
    data.qualities = export_qualities()

    player.print("Exporting force data...")
    data.force = export_force(player)

    player.print("Converting to JSON...")
    local json = helpers.table_to_json(data)

    player.print("Writing file...")
    write_json_chunked("helmod-web-prototypes.json", json)

    local recipe_count = table_size(data.recipes)
    local entity_count = table_size(data.entities)
    local item_count = table_size(data.items)
    local fluid_count = table_size(data.fluids)

    player.print(string.format(
        "Export complete! %d recipes, %d entities, %d items, %d fluids",
        recipe_count, entity_count, item_count, fluid_count
    ))
    player.print("File: script-output/helmod-web-prototypes.json")
end)
