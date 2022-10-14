export const OPEN_FILE = "openFile";
export const OPEN_MAP_DIALOG = "OPEN_MAP_DIALOG";
export const OPEN_REPLAY_DIALOG = "OPEN_REPLAY_DIALOG";
export const GET_LOADED_SETTINGS = "GET_SETTINGS";
export const OPEN_ISCRIPTAH = "OPEN_ISCRIPTAH";
export const CLEAR_ASSET_CACHE = "CLEAR_ASSET_CACHE";
export const LOAD_DAT_FILES = "LOAD_DAT_FILES";

export const SAVE_SETTINGS_DATA = "SAVE_SETTINGS";

export const SERVER_API_FIRE_MACRO = "SERVER_API_FIRE_MACRO";

export const SHOW_FOLDER_DIALOG = "SHOW_FOLDER_DIALOG";
export const LOG_MESSAGE = "LOG_MESSAGE";
export const DOWNLOAD_UPDATE = "DOWNLOAD_UPDATE";
export const OPEN_URL = "OPEN_URL";
export const GO_TO_START_PAGE = "GO_TO_START_PAGE";

export const INVOKE_BROWSER_WINDOW = "INVOKE_BROWSER_WINDOW";
export const INVOKE_BROWSER_WINDOW_RESPONSE = "INVOKE_BROWSER_WINDOW_RESPONSE";

export const SEND_BROWSER_WINDOW = "SEND_BROWSER_WINDOW";

export const enum InvokeBrowserTarget {
    Game = "game",
    CommandCenter = "command-center",
};

export const enum BrowserTargetPayloadType {
    PluginMacroMethodCatalog = "pluginMacroMethodCatalog",
    GameTimeApiMethodCatalog = "gameTimeApiMethodCatalog",
}

export const OPEN_CASCLIB = "OPEN_CASCLIB";
export const CLOSE_CASCLIB = "CLOSE_CASCLIB";
export const OPEN_CASCLIB_FILE = "OPEN_CASCLIB_FILE";
export const OPEN_CASCLIB_BATCH = "OPEN_CASCLIB_BATCH";

export const UPDATE_PLUGIN_CONFIG = "UPDATE_PLUGIN_CONFIG";
export const RELOAD_PLUGINS = "RELOAD_PLUGINS";
export const DISABLE_PLUGIN = "DISABLE_PLUGIN";
export const DELETE_PLUGIN = "DELETE_PLUGIN";
export const ENABLE_PLUGINS = "ENABLE_PLUGINS";
export const INSTALL_PLUGIN = "INSTALL_PLUGIN";

export const ON_PLUGIN_CONFIG_UPDATED = "ON_PLUGIN_CONFIG_UPDATED";
export const ON_PLUGINS_ENABLED = "ON_PLUGINS_ENABLED";
export const ON_PLUGINS_INITIAL_INSTALL_ERROR = "ON_PLUGINS_INITIAL_INSTALL_ERROR";
export const ON_PLUGINS_INITIAL_INSTALL = "ON_PLUGINS_INITIAL_INSTALL";