-- Cache.lua: Simple in-memory cache shim for Helmod
local Cache = {
    classname = "HMCache"
}

local cache_data = {}

function Cache.get()
    return cache_data
end

function Cache.getData(classname, name)
    if cache_data[classname] ~= nil then
        return cache_data[classname][name]
    end
    return nil
end

function Cache.setData(classname, name, value)
    if cache_data[classname] == nil then
        cache_data[classname] = {}
    end
    cache_data[classname][name] = value
end

function Cache.hasData(classname, name)
    return cache_data[classname] ~= nil and cache_data[classname][name] ~= nil
end

function Cache.isEmpty()
    return table_size(cache_data) == 0
end

function Cache.reset()
    cache_data = {}
end

return Cache
