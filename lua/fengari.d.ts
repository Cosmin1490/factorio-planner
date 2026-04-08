// Type declarations for fengari

declare module 'fengari' {
  export type LuaState = object;

  export function to_luastring(str: string, cache?: boolean): Uint8Array;
  export function to_jsstring(str: Uint8Array | null): string;

  interface LuaLib {
    // Type constants
    LUA_TNIL: number;
    LUA_TNUMBER: number;
    LUA_TBOOLEAN: number;
    LUA_TSTRING: number;
    LUA_TTABLE: number;
    LUA_TFUNCTION: number;
    LUA_TUSERDATA: number;
    LUA_TLIGHTUSERDATA: number;
    LUA_TNONE: number;

    // Status
    LUA_OK: number;
    LUA_ERRRUN: number;
    LUA_ERRSYNTAX: number;

    // Stack
    lua_pop(L: LuaState, n: number): void;
    lua_gettop(L: LuaState): number;
    lua_settop(L: LuaState, n: number): void;
    lua_absindex(L: LuaState, idx: number): number;

    // Push values
    lua_pushnil(L: LuaState): void;
    lua_pushnumber(L: LuaState, n: number): void;
    lua_pushinteger(L: LuaState, n: number): void;
    lua_pushboolean(L: LuaState, b: boolean): void;
    lua_pushstring(L: LuaState, s: Uint8Array): Uint8Array;
    lua_pushcclosure(L: LuaState, fn: (L: LuaState) => number, n: number): void;
    lua_createtable(L: LuaState, narr: number, nrec: number): void;

    // Get values
    lua_tonumber(L: LuaState, index: number): number;
    lua_tointeger(L: LuaState, index: number): number;
    lua_toboolean(L: LuaState, index: number): boolean;
    lua_tostring(L: LuaState, index: number): Uint8Array | null;
    lua_tojsstring(L: LuaState, index: number): string;
    lua_type(L: LuaState, index: number): number;

    // Table operations
    lua_settable(L: LuaState, index: number): void;
    lua_gettable(L: LuaState, index: number): number;
    lua_setfield(L: LuaState, index: number, k: Uint8Array): void;
    lua_getfield(L: LuaState, index: number, k: Uint8Array): number;
    lua_rawseti(L: LuaState, index: number, n: number): void;
    lua_rawgeti(L: LuaState, index: number, n: number): number;
    lua_rawlen(L: LuaState, index: number): number;
    lua_next(L: LuaState, index: number): number;

    // Global operations
    lua_setglobal(L: LuaState, name: Uint8Array): void;
    lua_getglobal(L: LuaState, name: Uint8Array): number;

    // Call
    lua_pcall(L: LuaState, nargs: number, nresults: number, errfunc: number): number;
    lua_call(L: LuaState, nargs: number, nresults: number): void;
  }

  interface LuaAuxLib {
    luaL_newstate(): LuaState;
    luaL_loadstring(L: LuaState, s: Uint8Array): number;
    luaL_dostring(L: LuaState, s: Uint8Array): number;
  }

  interface LuaStdLib {
    luaL_openlibs(L: LuaState): void;
  }

  export const lua: LuaLib;
  export const lauxlib: LuaAuxLib;
  export const lualib: LuaStdLib;
}

declare module '*.lua?raw' {
  const content: string;
  export default content;
}
