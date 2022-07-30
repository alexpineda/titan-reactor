import { contextBridge } from "electron"
import { sendWindow, SendWindowActionType } from "../renderer/ipc/relay";
import * as log from "../renderer/ipc/log"
import {
    deletePlugin,
    disablePlugin,
    enablePlugins,
    installPlugin,
    updatePluginsConfig
} from "../renderer/ipc/plugins";
import path from "path";

console.log("MAMA")

// require('module').globalPaths.push("D:/dev/titan-reactor/node_modules")
// require("source-map-support/source-map-support.js").install()
if (process.env.NODE_ENV === "development") {
    require('module').globalPaths.push(path.resolve(require.resolve("electron"), "..", ".."))
}
require("source-map-support/source-map-support.js").install()

contextBridge.exposeInMainWorld('ipc', {
    desktop: true,
    sendWindow,
    SendWindowActionType,
    log,
    deletePlugin,
    disablePlugin,
    enablePlugins,
    installPlugin,
    updatePluginsConfig,
    require: () => ({
        install: () => { },
        globalPaths: []
    })
})