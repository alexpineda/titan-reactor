import Janitor from "@utils/janitor";
import { InitializedPluginPackage, ScreenStatus, ScreenType } from "common/types";
import settingsStore from "@stores/settings-store";
import { RELOAD_PLUGINS } from "common/ipc-handle-names";

import { useGameStore, useScreenStore, useWorldStore, ScreenStore, GameStore } from "@stores";

import { UI_PLUGIN_EVENT_DIMENSIONS_CHANGED, SYSTEM_EVENT_READY, SYSTEM_EVENT_ASSETS, UI_PLUGIN_EVENT_ON_FRAME, UI_PLUGIN_EVENT_SCREEN_CHANGED, UI_PLUGIN_EVENT_WORLD_CHANGED, UI_PLUGIN_EVENT_LOG_ENTRY } from "./events";
import waitForAssets from "../bootup/wait-for-assets";
import { ipcRenderer } from "electron";
import { GameStatePosition } from "@core";
import { openBw } from "../openbw";
import { StdVector } from "../buffer-view/std-vector";


const logChanged = (game: GameStore) => {
    return {
        type: UI_PLUGIN_EVENT_LOG_ENTRY,
        payload: game.log
    }
}

const screenChanged = (screen: ScreenStore) => {
    return {
        type: UI_PLUGIN_EVENT_SCREEN_CHANGED,
        payload: {
            screen: `@${ScreenType[screen.type]}/${ScreenStatus[screen.status]}`.toLowerCase(),
            error: screen.error?.message
        }
    }
}

let _lastSend: { [key: string]: any } = {};
const _makeReplayPosition = () => ({
    frame: 0,
    maxFrame: 0,
    time: "",
    playerData: new Int32Array(),
    unitProduction: [new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array],
    research: [new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array],
    upgrades: [new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array],
})

const _replayPosition = {
    type: UI_PLUGIN_EVENT_ON_FRAME,
    payload: _makeReplayPosition()
}


export class PluginSystemUI {
    #_iframe: HTMLIFrameElement = document.createElement("iframe");
    #_janitor = new Janitor();
    reload: () => void;


    constructor(pluginPackages: InitializedPluginPackage[]) {
        this.#_iframe.style.backgroundColor = "transparent";
        this.#_iframe.style.border = "none";
        this.#_iframe.style.left = "0";
        this.#_iframe.style.top = "0";
        this.#_iframe.style.width = "100%";
        this.#_iframe.style.height = "100%";
        this.#_iframe.style.position = "absolute";
        this.#_iframe.style.zIndex = "10";
        this.#_iframe.style.pointerEvents = "none";
        this.#_iframe.style.userSelect = "none";
        this.#_iframe.sandbox.add("allow-scripts");
        this.#_iframe.sandbox.add("allow-downloads");

        const initialStore = () => ({
            [UI_PLUGIN_EVENT_DIMENSIONS_CHANGED]: useGameStore.getState().dimensions,
            [UI_PLUGIN_EVENT_SCREEN_CHANGED]: screenChanged(useScreenStore.getState()).payload,
            [UI_PLUGIN_EVENT_WORLD_CHANGED]: useWorldStore.getState(),
            [UI_PLUGIN_EVENT_ON_FRAME]: _replayPosition.payload,
            [UI_PLUGIN_EVENT_LOG_ENTRY]: logChanged(useGameStore.getState()).payload
        })

        this.#_iframe.onload = async () => {
            this.#_iframe.contentWindow?.postMessage({
                type: SYSTEM_EVENT_READY,
                payload: {
                    plugins: pluginPackages,
                    initialStore: initialStore()
                }
            }, "*")


            const assets = await waitForAssets();

            this.#_iframe.contentWindow?.postMessage({
                type: SYSTEM_EVENT_ASSETS,
                payload: {
                    assets: {
                        ready: true,
                        bwDat: assets.bwDat,
                        gameIcons: assets.gameIcons,
                        cmdIcons: assets.cmdIcons,
                        raceInsetIcons: assets.raceInsetIcons,
                        workerIcons: assets.workerIcons,
                        wireframeIcons: assets.wireframeIcons,
                    }
                }
            }, "*")
        };
        document.body.appendChild(this.#_iframe);
        this.#_janitor.callback(() => document.body.removeChild(this.#_iframe));

        this.reload = () => {
            const settings = settingsStore().data;
            this.#_iframe.src = `http://localhost:${settings.plugins.serverPort}/runtime.html`;
        }
        ipcRenderer.on(RELOAD_PLUGINS, this.reload);
        this.#_janitor.callback(() => ipcRenderer.off(RELOAD_PLUGINS, this.reload));


        this.#_janitor.callback(useGameStore.subscribe((game, prev) => {
            if (game.dimensions !== prev.dimensions) {
                this.sendMessage({
                    type: UI_PLUGIN_EVENT_DIMENSIONS_CHANGED,
                    payload: game.dimensions
                });
            }

            if (game.log !== prev.log) {
                this.sendMessage(logChanged(game));
            }
        }));

        this.#_janitor.callback(useScreenStore.subscribe((screen) => {
            this.sendMessage(screenChanged(screen));
        }));

        this.#_janitor.callback(useWorldStore.subscribe((world) => {
            this.sendMessage({
                type: UI_PLUGIN_EVENT_WORLD_CHANGED,
                payload: world
            });
        }));

        this.reload();

    }

    sendMessage(message: any, transfer?: Transferable[]) {
        this.#_iframe.contentWindow?.postMessage(message, "*", transfer);
    }

    dispose() {
        this.#_janitor.mopUp();
    }

    reset() {
        _lastSend = {}
        _replayPosition.payload = _makeReplayPosition();
    }

    onFrame(gameStatePosition: GameStatePosition, playerDataAddr: number, productionDataAddr: number) {
        const time = gameStatePosition.getSecond();

        if (_lastSend[UI_PLUGIN_EVENT_ON_FRAME] !== time) {
            _lastSend[UI_PLUGIN_EVENT_ON_FRAME] = time;

            const playerData = openBw.wasm!.HEAP32.slice((playerDataAddr >> 2), (playerDataAddr >> 2) + (7 * 8));
            const productionData = new StdVector(openBw.wasm!.HEAP32, productionDataAddr >> 2);

            // production data is a series of 3 vectors (unit, research, upgrades), 
            // each of which are each represented in wasm as 3 ints (addresses)

            for (let player = 0; player < 8; player++) {
                _replayPosition.payload.unitProduction[player] = productionData.copyData();
                productionData.index += 3;
                _replayPosition.payload.upgrades[player] = productionData.copyData();
                productionData.index += 3;
                _replayPosition.payload.research[player] = productionData.copyData();
                productionData.index += 3;
            }

            _replayPosition.payload.frame = gameStatePosition.bwGameFrame;
            _replayPosition.payload.maxFrame = gameStatePosition.maxFrame;
            _replayPosition.payload.time = gameStatePosition.getFriendlyTime();
            _replayPosition.payload.playerData = playerData;

            //TODO: add transferables
            this.sendMessage(_replayPosition);
        }
    }
}