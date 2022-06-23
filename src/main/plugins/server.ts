import electronIsDev from "electron-is-dev";
import path from "path";
import express from "express";
import fs from "fs"
import transpile, { TransformSyntaxError } from "../transpile";
import browserWindows from "../windows";
import { LOG_MESSAGE } from "common/ipc-handle-names";
import { getEnabledPluginConfigs, replacePluginContent } from "./load-plugins";
import settings from "../settings/singleton"
import fileExists from "common/utils/file-exists";

const _runtimePath = path.resolve(__static, "plugins-runtime");

const app = express();

app.use(function (_, res, next) {
    res.setHeader("Origin-Agent-Cluster", "?1")
    if (electronIsDev) {
        res.setHeader("Access-Control-Allow-Origin", "*");
    }
    next()
})

const transpileErrors: TransformSyntaxError[] = [];

app.get('*', async function (req, res) {
    const filepath = req.path.startsWith("/runtime") ? path.join(_runtimePath, req.path) : path.join(settings.get().directories.plugins, req.path);

    if (!(filepath.startsWith(settings.get().directories.plugins) || filepath.startsWith(_runtimePath))) {
        return res.sendStatus(404);
    }

    if (!(await fileExists(filepath))) {
        return res.sendStatus(404);
    }

    if (filepath.endsWith(".jsx")) {

        let result = await transpile(fs.readFileSync(filepath, "utf8"), transpileErrors);
        let content = "";

        if (result?.code) {
            content = result.code;
        }

        const plugin = getEnabledPluginConfigs().find(p => p.id === req.query["plugin-id"]);
        if (plugin && content) {
            content = replacePluginContent(content, plugin.id);
        }

        res.setHeader("Content-Type", "application/javascript");

        if (transpileErrors.length === 0) {
            res.setHeader("access-control-allow-origin", "*");
            res.send(content);
        } else {
            browserWindows.main?.webContents?.send(LOG_MESSAGE, `@plugin-server: transpile error - ${transpileErrors[0].message} ${transpileErrors[0].snippet}`, "error");
            return res.sendStatus(400);

        }

    } else {
        res.sendFile(filepath);
    }

});


export default app;