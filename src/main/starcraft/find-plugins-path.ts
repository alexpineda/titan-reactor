import fileExists from "common/utils/file-exists";
import path from "path";
import { promises as fsPromises } from "fs";
import getUserDataPath from "../get-user-data-path";

export async function findPluginsPath() {
    const pluginsPath = path.join(getUserDataPath(), "plugins");

    if (await fileExists(pluginsPath)) {
        return pluginsPath;
    } else {
        try {
            await fsPromises.mkdir(pluginsPath, { recursive: true });
            return pluginsPath;
        } catch (e) {
            //TODO: log error
            console.error(e);
        }
    }
    return getUserDataPath();
}
