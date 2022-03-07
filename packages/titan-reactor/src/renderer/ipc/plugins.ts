import { ipcRenderer } from "electron";

import { UPDATE_PLUGIN_CONFIG } from "common/ipc-handle-names";

export const updatePluginsConfig = async (pluginId: string, config: any) => {
    return await ipcRenderer.invoke(UPDATE_PLUGIN_CONFIG, pluginId, config);
}