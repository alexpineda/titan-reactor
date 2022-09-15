import path from "path";
import fs from "fs";
import express from "express";
import { transpile } from "../transpile";
import browserWindows from "../windows";
import { LOG_MESSAGE, SERVER_API_FIRE_MACRO } from "common/ipc-handle-names";
import settings from "../settings/singleton"
import fileExists from "common/utils/file-exists";
import { logService } from "../logger/singleton";
import fetch from 'node-fetch';
import { getEnabledPluginPackages } from "./load-plugins";
import * as casclib from "bw-casclib";
import runtimeHTML from "!!raw-loader!./runtime.html";
import runtimeJSX from "!!raw-loader!./runtime.tsx";

let _handle: any = null;
const app = express();

app.use(function (_, res, next) {
    res.setHeader("Origin-Agent-Cluster", "?1")
    res.setHeader("Access-Control-Allow-Origin", "*");
    next()
})

app.get('*', async function (req, res) {
    if (req.url.startsWith("/m_api")) {
        if (req.method === "GET") {
            if (req.query["iconPNG"]) {
                const icon = Number(req.query["iconPNG"]);

                if (_handle === null) {
                    _handle = await casclib.openStorage(settings.get().directories.starcraft);
                }
                const data = await casclib.readFile(_handle, `webui/dist/lib/images/cmdicons.${icon}.png`);

                res.setHeader("Content-Type", "image/png");
                res.send(data);
                res.end();
                return;
                // POST wasn't working
            } else if (req.query["macroId"]) {
                browserWindows.main!.webContents.send(SERVER_API_FIRE_MACRO, req.query["macroId"]);
                return res.status(200).send();
            }

            try {
                req.headers
                const lastRevision = req.headers["X-LastRevision"];
                if (lastRevision === "" + settings.get().macros.revision) {
                    res.status(304).send();
                    return;
                }
            } catch (e) {
            }
            res.setHeader("Content-Type", "application/json");
            res.send(settings.get().macros);

        }
        return;
    }

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


    if (req.path.startsWith("/bundled/")) {

        const filepath = path.join(__static, req.path.replace("/bundled/", ""));

        if (!(filepath.startsWith(__static))) {
            logService.error(`@server/403-forbidden: ${filepath}`);
            return res.sendStatus(403);
        }

        return res.sendFile(filepath);

    }
    else if (req.path.endsWith("runtime.html")) {
        res.setHeader("Content-Type", "text/html");
        return res.send(runtimeHTML);
    }
    else if (req.path.endsWith("runtime.tsx")) {
        const { result } = transpile(runtimeJSX, "runtime.tsx");
        res.setHeader("Content-Type", "application/javascript");
        return res.send(result.outputText);
    }

    const filepath = path.join(settings.get().directories.plugins, req.path);

    if (!(filepath.startsWith(settings.get().directories.plugins))) {
        logService.error(`@server/403-forbidden: ${filepath}`);
        return res.sendStatus(403);
    }

    if (!(await fileExists(filepath))) {
        logService.error(`@server/404-not-exists: ${filepath}`);
        return res.sendStatus(404);
    }

    if (filepath.endsWith(".jsx") || filepath.endsWith(".tsx")) {

        const { result, transpileErrors } = transpile(fs.readFileSync(filepath, "utf8"), filepath);

        let content = result.outputText;
        const plugins = getEnabledPluginPackages();
        let plugin;
        for (const _plugin of plugins) {
            if (filepath.startsWith(path.join(settings.get().directories.plugins, _plugin.path))) {
                plugin = _plugin;
            }
        }

        if (!plugin) {
            return res.sendStatus(404);
        }

        if (plugin && content) {
            content = `
            import { _rc } from "titan-reactor/runtime";
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