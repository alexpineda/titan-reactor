import { ipcMain } from "electron";

import settings from "../settings/singleton"
import { UPDATE_PLUGIN_CONFIG } from "common/ipc-handle-names";
import { savePluginsConfig } from "../settings/load-plugins";

ipcMain.handle(UPDATE_PLUGIN_CONFIG, async (_, pluginId, config: any) => {
    return await savePluginsConfig(settings.get().directories.plugins, pluginId, config);
});