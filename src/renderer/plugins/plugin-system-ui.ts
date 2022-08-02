import Janitor from "@utils/janitor";
import { PluginMetaData, OpenBWAPI, ScreenStatus, ScreenType } from "common/types";
import settingsStore from "@stores/settings-store";
import { useGameStore, useScreenStore, useWorldStore, ScreenStore, WorldStore, useSelectedUnitsStore } from "@stores";

import { UI_STATE_EVENT_DIMENSIONS_CHANGED, UI_SYSTEM_READY, UI_STATE_EVENT_ON_FRAME, UI_STATE_EVENT_SCREEN_CHANGED, UI_STATE_EVENT_WORLD_CHANGED, UI_STATE_EVENT_UNITS_SELECTED, UI_SYSTEM_RUNTIME_READY, UI_SYSTEM_PLUGIN_DISABLED, UI_SYSTEM_PLUGINS_ENABLED, UI_STATE_EVENT_PROGRESS } from "./events";
import { waitForTruthy } from "@utils/wait-for-process";
import { Unit } from "@core";
import { StdVector } from "../buffer-view/std-vector";
import * as enums from "common/enums";
import { downloadUpdate } from "@ipc";
import packageJson from "../../../package.json"
import semver from "semver";
import gameStore from "@stores/game-store";
import { getSecond } from "common/utils/conversions";
import { Assets } from "common/types";
import processStore, { useProcessStore } from "@stores/process-store";
import screenStore from "@stores/screen-store";

// const createMeta = (id: string, url: string) => {
//     const meta = document.createElement("meta");
//     meta.id = id;
//     meta.httpEquiv = "Content-Security-Policy";
//     meta.content = url;

//     const el = document.getElementById(id);
//     if (el) {
//         el.remove();
//     }

//     document.head.appendChild(meta);
// }

const screenChanged = (screen: ScreenStore) => {
    return {
        type: UI_STATE_EVENT_SCREEN_CHANGED,
        payload: {
            screen: `@${ScreenType[screen.type]}/${ScreenStatus[screen.status]}`.toLowerCase(),
            error: screen.error?.message
        }
    }
}

let _lastSend: { [key: string]: any } = {};
const _makeReplayPosition = () => ({
    frame: 0,
    playerData: new Int32Array(),
    unitProduction: [new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array],
    research: [new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array],
    upgrades: [new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array, new Int32Array],
})

const _replayPosition = {
    type: UI_STATE_EVENT_ON_FRAME,
    payload: _makeReplayPosition()
}

const worldPartial = (world: WorldStore) => {
    return {
        map: world.map,
        replay: world.replay?.header
    }
}

const unitsPartial = (units: Unit[]) => {
    if (units.length === 1) {
        return units.map(unitWithDump);
    } else {
        return units;
    }
}
let _dumpUnitCall: (id: number) => {};

const unitWithDump = (unit: Unit) => {
    return {
        ...unit,
        ..._dumpUnitCall(unit.id)
    }
}

export const setDumpUnitCall = (fn: (id: number) => {}) => {
    _dumpUnitCall = fn;
}


const _selectedUnitMessage: {
    type: string;
    payload: Unit[]
} = {
    type: UI_STATE_EVENT_UNITS_SELECTED,
    payload: []
}

const _productionTransferables: ArrayBufferLike[] = [];

export class PluginSystemUI {
    #iframe: HTMLIFrameElement = document.createElement("iframe");
    #janitor = new Janitor();
    #isRunning = false;
    refresh: () => void;

    isRunning() {
        if (this.#isRunning) {
            return Promise.resolve(true);
        }

        return new Promise(resolve => {
            const _listener = (evt: MessageEvent) => {
                if (evt.data?.type === UI_SYSTEM_RUNTIME_READY) {
                    this.#isRunning = true;
                    window.removeEventListener("message", _listener);
                    resolve(true);
                }
            };

            window.addEventListener("message", _listener)
        });
    }

    constructor(pluginPackages: PluginMetaData[]) {
        this.#iframe.style.backgroundColor = "transparent";
        this.#iframe.style.border = "none";
        this.#iframe.style.left = "0";
        this.#iframe.style.top = "0";
        this.#iframe.style.width = "100%";
        this.#iframe.style.height = "100%";
        this.#iframe.style.position = "absolute";
        this.#iframe.style.zIndex = "10";
        this.#iframe.style.userSelect = "none";
        this.#iframe.sandbox.add("allow-scripts");
        this.#iframe.sandbox.add("allow-downloads");

        const initialStore = () => ({
            language: settingsStore().data.language,
            [UI_STATE_EVENT_DIMENSIONS_CHANGED]: useGameStore.getState().dimensions,
            [UI_STATE_EVENT_SCREEN_CHANGED]: screenChanged(useScreenStore.getState()).payload,
            [UI_STATE_EVENT_WORLD_CHANGED]: worldPartial(useWorldStore.getState()),
            [UI_STATE_EVENT_ON_FRAME]: _makeReplayPosition(),
            [UI_STATE_EVENT_PROGRESS]: processStore().getTotalProgress(),
            [UI_STATE_EVENT_UNITS_SELECTED]: _selectedUnitMessage.payload,
        })

        const setInteractivity = (interactive: boolean) => {
            this.#iframe.style.pointerEvents = interactive ? "auto" : "none";
        }
        this.#janitor.add(useScreenStore.subscribe(state => {
            setInteractivity(state.type === ScreenType.Home || state.error !== null)
        }));

        var iframeLoaded = false;
        this.#iframe.onload = async () => {
            if (iframeLoaded) {
                iframeLoaded = false;
                this.refresh();
                return;
            }
            iframeLoaded = true;

            setInteractivity(screenStore().type === ScreenType.Home || screenStore().error !== null)

            let updateAvailable: undefined | { version: string, url: string } = undefined;

            const releases = await fetch(
                "https://api.github.com/repos/imbateam-gg/titan-reactor/releases"
            )
                .then((res) => res.json());

            if (releases.length) {
                const latestRelease = releases.find((p: any) => !p.prerelease); //find first non-pre-release
                if (latestRelease) {
                    if (semver.gt(latestRelease.name.substring(1), packageJson.version)) {
                        updateAvailable = {
                            version: latestRelease.name,
                            url: latestRelease.html_url,
                        };
                    }

                    const _onDownloadUpdate = (event: MessageEvent) => {
                        if (event.data === "system:download-update") {
                            downloadUpdate(latestRelease.html_url)
                        }
                    };
                    window.addEventListener("message", _onDownloadUpdate);
                    this.#janitor.add(() => window.removeEventListener("message", _onDownloadUpdate));
                }
            }

            const assets = await waitForTruthy<Assets>(() => gameStore().assets);

            this.#iframe.contentWindow?.postMessage({
                type: UI_SYSTEM_READY,
                payload: {
                    plugins: pluginPackages,
                    initialStore: initialStore(),
                    updateAvailable,
                    assets: {
                        bwDat: assets.bwDat,
                        gameIcons: assets.gameIcons,
                        cmdIcons: assets.cmdIcons,
                        raceInsetIcons: assets.raceInsetIcons,
                        workerIcons: assets.workerIcons,
                        wireframeIcons: assets.wireframeIcons
                    },
                    enums,
                }
            }, "*");
        };
        document.body.appendChild(this.#iframe);
        this.#janitor.add(() => document.body.removeChild(this.#iframe));

        this.refresh = () => {
            const settings = settingsStore().data;

            // createMeta("localhost-csp", `child-src http://localhost:${settings.plugins.serverPort} http://embed-casts.imbateam.gg http://embed-casts-2.imbateam.gg https://www.youtube.com`);

            this.#iframe.src = `http://localhost:${settings.plugins.serverPort}/runtime.html`;
        }

        this.#janitor.add(useGameStore.subscribe((game, prev) => {
            if (game.dimensions !== prev.dimensions) {
                this.sendMessage({
                    type: UI_STATE_EVENT_DIMENSIONS_CHANGED,
                    payload: game.dimensions
                });
            }
        }));

        this.#janitor.add(useScreenStore.subscribe((screen) => {
            if (screen.type === ScreenType.Home || screen.error) {
                this.#iframe.style.pointerEvents = "auto";
            } else {
                this.#iframe.style.pointerEvents = "none";
            }

            this.sendMessage(screenChanged(screen));
        }));

        this.#janitor.add(useWorldStore.subscribe((world) => {
            this.sendMessage({
                type: UI_STATE_EVENT_WORLD_CHANGED,
                payload: worldPartial(world)
            });
        }));

        this.#janitor.add(useSelectedUnitsStore.subscribe(({ selectedUnits }) => {
            this.sendMessage({
                type: UI_STATE_EVENT_UNITS_SELECTED,
                payload: unitsPartial(selectedUnits)
            });
        }));

        this.#janitor.add(useProcessStore.subscribe((process) => {
            this.sendMessage({
                type: UI_STATE_EVENT_PROGRESS,
                payload: process.getTotalProgress()
            });
        }))

        this.refresh();

    }

    sendMessage(message: any, transfer?: Transferable[]) {
        this.#iframe.contentWindow?.postMessage(message, "*", transfer);
    }

    disablePlugin(id: string) {
        this.sendMessage({
            type: UI_SYSTEM_PLUGIN_DISABLED,
            payload: id
        });
    }

    enablePlugins(plugins: PluginMetaData[]) {
        this.sendMessage({
            type: UI_SYSTEM_PLUGINS_ENABLED,
            payload: plugins
        });
    }

    dispose() {
        this.reset();
        this.#janitor.mopUp();
    }

    reset() {
        _lastSend = {}
        _replayPosition.payload = _makeReplayPosition();
        _selectedUnitMessage.payload = [];
    }

    onFrame(openBW: OpenBWAPI, currentFrame: number, playerDataAddr: number, productionDataAddr: number) {
        const time = getSecond(currentFrame);

        // update the ui every game second
        if (_lastSend[UI_STATE_EVENT_ON_FRAME] !== time) {
            _lastSend[UI_STATE_EVENT_ON_FRAME] = time;

            // minerals, gas, supply, supply_max, worker_supply, army_supply, apm
            const playerData = openBW.HEAP32.slice((playerDataAddr >> 2), (playerDataAddr >> 2) + (7 * 8));

            // production data is 8 arrays (players) of 3 vectors (unit, upgrades, research), 
            // each vector is first stored as 3 ints (addresses)
            // so we first read units via copyData(), then increment to the next vector, and then read the upgrades via copyData() and so on.
            // unit = id, count, progress
            // upgrades = id, level, progress
            // research = id, progress

            const productionData = new StdVector(openBW.HEAP32, productionDataAddr >> 2);

            _productionTransferables.length = 0;
            _productionTransferables.push(playerData.buffer);

            //TODO: perhaps a more readable abstraction would benefit here
            for (let player = 0; player < 8; player++) {
                _replayPosition.payload.unitProduction[player] = productionData.copyData();
                _productionTransferables.push(_replayPosition.payload.unitProduction[player].buffer);
                productionData.addr32 += 3;
                _replayPosition.payload.upgrades[player] = productionData.copyData();
                _productionTransferables.push(_replayPosition.payload.upgrades[player].buffer);
                productionData.addr32 += 3;
                _replayPosition.payload.research[player] = productionData.copyData();
                _productionTransferables.push(_replayPosition.payload.research[player].buffer);
                productionData.addr32 += 3;
            }

            _replayPosition.payload.frame = currentFrame;
            _replayPosition.payload.playerData = playerData;

            this.sendMessage(_replayPosition, _productionTransferables);

            const units = useSelectedUnitsStore.getState().selectedUnits;
            // in this case only change if the empty state has changed
            if (_lastSend[UI_STATE_EVENT_UNITS_SELECTED] > 0 || units.length > 0) {
                //TODO move this out to supply to native as well
                _selectedUnitMessage.payload = unitsPartial(units);
                this.sendMessage(_selectedUnitMessage);
                _lastSend[UI_STATE_EVENT_UNITS_SELECTED] = units.length;
            }

        }
    }
}