import fileExists from "common/utils/file-exists";
import path from "path";
import { app } from "electron";
import { promises as fsPromises } from "fs";

export async function findPluginsPath() {
    const pluginsPath = path.join(app.getPath("documents"), "Titan Reactor", "Plugins");
    if (await fileExists(pluginsPath)) {
        return pluginsPath;
    } else {
        try {
            await fsPromises.mkdir(pluginsPath, { recursive: true });
            return pluginsPath;
        } catch (e) {
            console.error(e);
        }
    }
    return "";
}
