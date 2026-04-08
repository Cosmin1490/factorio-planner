-- User.lua: Shim for Helmod User module (settings/preferences)
local User = {
    classname = "HMUser",
    prefixe = "helmod",
}

local user_parameters = {}
local user_preferences = {}

function User.name()
    return "player"
end

function User.isAdmin()
    return true
end

function User.get(key)
    if key == "parameter" then
        return user_parameters
    elseif key == "preferences" then
        return user_preferences
    end
    return {}
end

function User.getParameter(property)
    if property ~= nil then
        return user_parameters[property]
    end
    return user_parameters
end

function User.setParameter(property, value)
    user_parameters[property] = value
    return value
end

function User.getPreference(type, name)
    if name ~= nil and name ~= "" then
        local preference_name = string.format("%s_%s", type, name)
        return user_preferences[preference_name]
    end
    return user_preferences[type]
end

function User.getPreferenceSetting(type, name)
    local preference_type = User.getPreference(type)
    if name == nil then
        local preference = defines.constant.preferences[type]
        if preference == nil then return nil end
        if preference_type == nil then
            return preference.default_value
        end
        return preference_type
    end
    if preference_type == nil then return false end
    local preference_name = User.getPreference(type, name)
    if preference_name ~= nil then
        return preference_name
    end
    return false
end

function User.getModGlobalSetting(name)
    local setting = defines.constant.settings_mod[name]
    if setting ~= nil then
        return setting.default_value
    end
    return nil
end

function User.getBeltStackSizeBonus()
    return 0
end

function User.isReader(model)
    return true
end

function User.isWriter(model)
    return true
end

function User.isDeleter(model)
    return true
end

return User
