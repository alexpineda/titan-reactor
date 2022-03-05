import electronIsDev from "electron-is-dev";
import path from "path";
import express from "express";
import fs from "fs"
import transpile, { TransformSyntaxError } from "../transpile";
import browserWindows from "../windows";
import { LOG_MESSAGE } from "common/ipc-handle-names";
import { getPluginChannelConfigs, getPluginConfigs, replacePluginContent } from "../settings/load-plugins";
import { InitializedPluginChannelConfiguration } from "common/types";

// TODO: verify it exists
const _p = path.resolve(__static, "plugins");

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
    const filepath = path.join(_p, req.path);

    if (filepath.startsWith(_p)) {
        if (filepath.endsWith(".jsx")) {
            let content = transpile(fs.readFileSync(filepath, "utf8"), transpileErrors);

            // convenience mechanism to populate MACROs in external scripts, requires channel-id query param
            const channel = getPluginChannelConfigs().find(c => c.id === req.query["channel-id"]);
            const plugin = getPluginConfigs().find(({ channels }) => channels.includes(channel as InitializedPluginChannelConfiguration));
            if (plugin && channel) {
                content = replacePluginContent(content, plugin.path, channel.id);
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
    } else {
        res.status(404);
    }
});




export default app;