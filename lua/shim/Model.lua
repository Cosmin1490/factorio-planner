-- Model.lua: Shim for Helmod Model module
-- Only includes functions needed by ModelCompute and the solver path

local Model = {
    classname = "HMModel",
    version = 2
}

local model_id_counter = 0
local recipe_id_counter = 0
local resource_id_counter = 0

-------------------------------------------------------------------------------
---Check if child is a block (has children)
---@param child table
---@return boolean
function Model.isBlock(child)
    if child == nil then return false end
    return child.isBlock == true
end

-------------------------------------------------------------------------------
---Check if block is unlinked
---@param block table
---@return boolean
function Model.isUnlinkedBlock(block)
    if block == nil or block.class ~= "Block" then
        return false
    end
    return block.unlinked and true or false
end

-------------------------------------------------------------------------------
---Append parameters to model
---@param model table
function Model.appendParameters(model)
    if model.parameters == nil then
        model.parameters = {
            effects = {
                speed = 0,
                productivity = 0,
                consumption = 0,
                pollution = 0,
                quality = 0
            }
        }
    end
end

-------------------------------------------------------------------------------
---Get quality element key
---@param element table
---@return string
function Model.getQualityElementKey(element)
    if element == nil then return "unknown" end
    local quality = element.quality or "normal"
    if quality == "normal" then
        return element.name
    end
    return string.format("%s-%s", element.name, quality)
end

-------------------------------------------------------------------------------
---Count modules in a machine/beacon
---@param element table
---@return number
function Model.countModulesModel(element)
    if element == nil or element.modules == nil then return 0 end
    local count = 0
    for _, module in pairs(element.modules) do
        count = count + (module.amount or 0)
    end
    return count
end

-------------------------------------------------------------------------------
---Get first child from a sorted list
---@param list table
---@return any
function Model.firstChild(list)
    if list == nil then return nil end
    local first_element = nil
    local first_index = nil
    for _, element in pairs(list) do
        if first_index == nil or (element.index ~= nil and element.index < first_index) then
            first_element = element
            first_index = element.index
        end
    end
    return first_element
end

-------------------------------------------------------------------------------
---Get rules from storage
---@return table
function Model.getRules()
    if storage.rules == nil then
        storage.rules = {}
    end
    return storage.rules
end

-------------------------------------------------------------------------------
---Create new resource
---@param model table
---@param name string
---@param type string
---@param count number
---@return table
function Model.newResource(model, name, type, count)
    resource_id_counter = resource_id_counter + 1
    local resource = {
        id = "resource_" .. resource_id_counter,
        name = name,
        type = type,
        count = count or 0,
        category = nil,
        blocks = 1,
        wagon = nil,
        storage = nil
    }
    if model.resources == nil then
        model.resources = {}
    end
    model.resources[name] = resource
    return resource
end

-------------------------------------------------------------------------------
---Create a new element reference
---@param type string
---@param name string
---@param quality? string
---@return table
function Model.newElement(type, name, quality)
    return {
        type = type or "item",
        name = name,
        quality = quality or "normal"
    }
end

-------------------------------------------------------------------------------
---Generate unique recipe ID
---@return string
function Model.newRecipeId()
    recipe_id_counter = recipe_id_counter + 1
    return "recipe_" .. recipe_id_counter
end

-------------------------------------------------------------------------------
---Generate unique model ID
---@return string
function Model.newModelId()
    model_id_counter = model_id_counter + 1
    return "model_" .. model_id_counter
end

return Model
