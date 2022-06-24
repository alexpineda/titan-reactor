import path from "path";
import express from "express";
import fs from "fs";
import transpile, { TransformSyntaxError } from "../transpile";
import browserWindows from "../windows";
import { LOG_MESSAGE } from "common/ipc-handle-names";
import { getEnabledPluginConfigs, replacePluginContent } from "./load-plugins";
import settings from "../settings/singleton"
import fileExists from "common/utils/file-exists";
import logService from "../logger/singleton";

const _runtimePath = path.resolve(__static, "plugins-runtime");

const app = express();

app.use(function (_, res, next) {
    res.setHeader("Origin-Agent-Cluster", "?1")
    res.setHeader("Access-Control-Allow-Origin", "*");
    next()
})

const transpileErrors: TransformSyntaxError[] = [];

app.get('*', async function (req, res) {
    const filepath = req.path.startsWith("/runtime") ? path.join(_runtimePath, req.path) : path.join(settings.get().directories.plugins, req.path);

    if (!(filepath.startsWith(settings.get().directories.plugins) || filepath.startsWith(_runtimePath))) {
        logService.error(`@server/403-forbidden: ${filepath}`);
        return res.sendStatus(403);
    }

    if (!(await fileExists(filepath))) {
        logService.error(`@server/404-not-exists: ${filepath}`);
        return res.sendStatus(404);
    }

    if (filepath.endsWith(".jsx")) {

        let result = await transpile(path.basename(filepath), fs.readFileSync(filepath, "utf8"), transpileErrors);
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
            res.send(content);
        } else {
            const message = `@plugin-server: transpile error - ${transpileErrors[0].message} ${transpileErrors[0].snippet}`;
            browserWindows.main?.webContents?.send(LOG_MESSAGE, message, "error");
            logService.error(`@server/500-transpile-error: ${message}`);
            return res.sendStatus(500);
        }

    } else {
        res.sendFile(filepath);
    }

});


export default app;