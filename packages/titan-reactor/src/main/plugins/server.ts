import electronIsDev from "electron-is-dev";
import path from "path";
import express from "express";
import fs from "fs"
import transpile, { TransformSyntaxError } from "../transpile";
import browserWindows from "../windows";
import { LOG_MESSAGE } from "common/ipc-handle-names";
import { getPluginConfigs, replacePluginContent } from "../settings/load-plugins";

// TODO: verify it exists
const _pluginsPath = path.resolve(__static, "plugins");
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

app.get('*', function (req, res) {
    const filepath = req.path.startsWith("/runtime") ? path.join(_runtimePath, req.path) : path.join(_pluginsPath, req.path);

    if (!(filepath.startsWith(_pluginsPath) || filepath.startsWith(_runtimePath))) {
        res.status(404);
        return;
    }

    if (filepath.endsWith(".jsx")) {
        let result = transpile(fs.readFileSync(filepath, "utf8"), transpileErrors);
        let content = "";

        if (result?.code) {
            content = result.code;
            content += `\n//# sourceMappingURL=${result.map.toUrl()}`;
        }

        const plugin = getPluginConfigs().find(p => p.id === req.query["plugin-id"]);
        if (plugin && content) {
            content = replacePluginContent(content, plugin.id);
        }

        res.setHeader("Content-Type", "application/javascript");

        transpileErrors.length = 0;
        if (transpileErrors.length === 0) {
            res.send(content);
        } else {
            browserWindows.main?.webContents?.send(LOG_MESSAGE, `@plugin-server: transpile error - ${transpileErrors[0].message} ${transpileErrors[0].snippet}`, "error");
            res.status(400);
        }

    } else {
        res.sendFile(filepath);
    }

});




export default app;