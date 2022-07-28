import path from "path";
import express from "express";
import fs from "fs";
import transpile, { TransformSyntaxError } from "../transpile";
import browserWindows from "../windows";
import { LOG_MESSAGE } from "common/ipc-handle-names";
import settings from "../settings/singleton"
import fileExists from "common/utils/file-exists";
import logService from "../logger/singleton";
import fetch from 'node-fetch';
import { getEnabledPluginPackages } from "./load-plugins";

const _runtimePath = path.resolve(__static, "plugins-runtime");

const app = express();

app.use(function (_, res, next) {
    res.setHeader("Origin-Agent-Cluster", "?1")
    res.setHeader("Access-Control-Allow-Origin", "*");
    next()
})

const transpileErrors: TransformSyntaxError[] = [];

app.get('*', async function (req, res) {
    if ((req.query["proxy"])) {
        const proxy = req.query["proxy"];
        const response = await fetch(proxy as string);

        res.status(response.status);
        if (response.headers.has("content-type")) {
            res.setHeader("Content-Type", response.headers.get("content-type")!);
        }
        const text = await response.text();
        res.send(text);
        return;
    }

    const isPlugin = !req.path.startsWith("/runtime");
    const filepath = isPlugin ? path.join(settings.get().directories.plugins, req.path) : path.join(_runtimePath, req.path);

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

        const plugins = getEnabledPluginPackages();
        let plugin;
        for (const _plugin of plugins) {
            if (filepath.startsWith(path.join(settings.get().directories.plugins, _plugin.path))) {
                plugin = _plugin;
            }
        }

        if (!plugin && isPlugin) {
            return res.sendStatus(404);
        }
        //.find(p => p.id === req.query["plugin-id"]);
        if (plugin && content) {
            content = `
            import { _rc } from "titan-reactor";
            const registerComponent = (...args) => _rc("${plugin.id}", ...args);
            ${content}
            `
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