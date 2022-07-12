import Janitor from "@utils/janitor";
import { InitializedPluginPackage, ScreenStatus, ScreenType } from "common/types";
import settingsStore from "@stores/settings-store";

import { useGameStore, useScreenStore, useWorldStore, ScreenStore, WorldStore, useSelectedUnitsStore } from "@stores";

import { UI_PLUGIN_EVENT_DIMENSIONS_CHANGED, SYSTEM_EVENT_READY, SYSTEM_EVENT_ASSETS, UI_PLUGIN_EVENT_ON_FRAME, UI_PLUGIN_EVENT_SCREEN_CHANGED, UI_PLUGIN_EVENT_WORLD_CHANGED, UI_PLUGIN_EVENT_UNITS_SELECTED, SYSTEM_EVENT_UPDATE_AVAILABLE } from "./events";
import waitForAssets from "../utils/wait-for-assets";
import { GameStatePosition, Unit } from "@core";
import { openBw } from "../openbw";
import { StdVector } from "../buffer-view/std-vector";
import * as enums from "common/enums";
import { downloadUpdate } from "@ipc";
import packageJson from "../../../package.json"
import semver from "semver";

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
        return units.map(unitPartial);
    }
}
const unitPartial = (unit: Unit) => {
    return {
        ...unit,
        extras: {
            ...unit.extras,
            player: unit.extras.player?.id,
        }
    }
}

const unitWithDump = (unit: Unit) => {
    return {
        ...unitPartial(unit),
        ...openBw.wasm!.get_util_funcs().dump_unit(unit.id)
    }
}

export class PluginSystemUI {
    #iframe: HTMLIFrameElement = document.createElement("iframe");
    #janitor = new Janitor();
    refresh: () => void;

    constructor(pluginPackages: InitializedPluginPackage[]) {
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
            [UI_PLUGIN_EVENT_DIMENSIONS_CHANGED]: useGameStore.getState().dimensions,
            [UI_PLUGIN_EVENT_SCREEN_CHANGED]: screenChanged(useScreenStore.getState()).payload,
            [UI_PLUGIN_EVENT_WORLD_CHANGED]: worldPartial(useWorldStore.getState()),
            [UI_PLUGIN_EVENT_ON_FRAME]: _replayPosition.payload
        })

        this.#iframe.onload = async () => {
            // for plugin dev reload only
            {
                const screenState = useScreenStore.getState();
                if (screenState.type === ScreenType.Home || screenState.error) {
                    this.#iframe.style.pointerEvents = "auto";
                } else {
                    this.#iframe.style.pointerEvents = "none";
                }
            }

            this.#iframe.contentWindow?.postMessage({
                type: SYSTEM_EVENT_READY,
                payload: {
                    plugins: pluginPackages,
                    initialStore: initialStore()
                }
            }, "*");

            const releases = await fetch(
                "https://api.github.com/repos/imbateam-gg/titan-reactor/releases"
            )
                .then((res) => res.json());

            if (releases.length) {
                const latestRelease = releases.find((p: any) => !p.prerelease); //find first non-pre-release
                if (latestRelease) {
                    if (semver.gt(latestRelease.name.substring(1), packageJson.version)) {
                        this.sendMessage({
                            type: SYSTEM_EVENT_UPDATE_AVAILABLE,
                            payload: {
                                version: latestRelease.name,
                                url: latestRelease.html_url,
                            },
                        });
                    }

                    const _onDownloadUpdate = (event: MessageEvent) => {
                        if (event.data === "system:download-update") {
                            downloadUpdate(latestRelease.html_url)
                        }
                    };
                    window.addEventListener("message", _onDownloadUpdate);
                    this.#janitor.callback(() => window.removeEventListener("message", _onDownloadUpdate));
                }
            }

            const assets = await waitForAssets();

            this.#iframe.contentWindow?.postMessage({
                type: SYSTEM_EVENT_ASSETS,
                payload: {
                    assets: {
                        ready: true,
                        bwDat: assets.bwDat,
                        gameIcons: assets.gameIcons,
                        cmdIcons: assets.cmdIcons,
                        raceInsetIcons: assets.raceInsetIcons,
                        workerIcons: assets.workerIcons,
                        wireframeIcons: assets.wireframeIcons
                    },
                    enums
                }
            }, "*")
        };
        document.body.appendChild(this.#iframe);
        this.#janitor.callback(() => document.body.removeChild(this.#iframe));

        this.refresh = () => {
            const settings = settingsStore().data;
            this.#iframe.src = `http://localhost:${settings.plugins.serverPort}/runtime.html`;
        }

        this.#janitor.callback(useGameStore.subscribe((game, prev) => {
            if (game.dimensions !== prev.dimensions) {
                this.sendMessage({
                    type: UI_PLUGIN_EVENT_DIMENSIONS_CHANGED,
                    payload: game.dimensions
                });
            }
        }));

        this.#janitor.callback(useScreenStore.subscribe((screen) => {
            if (screen.type === ScreenType.Home || screen.error) {
                this.#iframe.style.pointerEvents = "auto";
            } else {
                this.#iframe.style.pointerEvents = "none";
            }

            this.sendMessage(screenChanged(screen));
        }));

        this.#janitor.callback(useWorldStore.subscribe((world) => {
            this.sendMessage({
                type: UI_PLUGIN_EVENT_WORLD_CHANGED,
                payload: worldPartial(world)
            });
        }));

        this.#janitor.callback(useSelectedUnitsStore.subscribe(({ selectedUnits }) => {
            this.sendMessage({
                type: UI_PLUGIN_EVENT_UNITS_SELECTED,
                payload: unitsPartial(selectedUnits)
            });
        }));

        this.refresh();

    }

    sendMessage(message: any, transfer?: Transferable[]) {
        this.#iframe.contentWindow?.postMessage(message, "*", transfer);
    }

    dispose() {
        this.reset();
        this.#janitor.mopUp();
    }

    reset() {
        _lastSend = {}
        _replayPosition.payload = _makeReplayPosition();
    }

    onFrame(gameStatePosition: GameStatePosition, playerDataAddr: number, productionDataAddr: number) {
        const time = gameStatePosition.getSecond();

        // update the ui every game second
        if (_lastSend[UI_PLUGIN_EVENT_ON_FRAME] !== time) {
            _lastSend[UI_PLUGIN_EVENT_ON_FRAME] = time;

            // minerals, gas, supply, supply_max, worker_supply, army_supply, apm
            const playerData = openBw.wasm!.HEAP32.slice((playerDataAddr >> 2), (playerDataAddr >> 2) + (7 * 8));

            // production data is 8 arrays (players) of 3 vectors (unit, upgrades, research), 
            // each vector is first stored as 3 ints (addresses)
            // so we first read units via copyData(), then increment to the next vector, and then read the upgrades via copyData() and so on.
            // unit = id, count, progress
            // upgrades = id, level, progress
            // research = id, progress

            const productionData = new StdVector(openBw.wasm!.HEAP32, productionDataAddr >> 2);


            //TODO: perhaps a more readable abstraction would benefit here
            for (let player = 0; player < 8; player++) {
                _replayPosition.payload.unitProduction[player] = productionData.copyData();
                productionData.addr32 += 3;
                _replayPosition.payload.upgrades[player] = productionData.copyData();
                productionData.addr32 += 3;
                _replayPosition.payload.research[player] = productionData.copyData();
                productionData.addr32 += 3;
            }

            _replayPosition.payload.frame = gameStatePosition.bwGameFrame;
            _replayPosition.payload.maxFrame = gameStatePosition.maxFrame;
            _replayPosition.payload.time = gameStatePosition.getFriendlyTime();
            _replayPosition.payload.playerData = playerData;

            //TODO: add transferables (if applicable) or better yet shared arrays
            this.sendMessage(_replayPosition);

            // in case hp changed, etc.
            // TODO: maybe introduce a dirty flag to units and check if any are dirty to send
            const units = useSelectedUnitsStore.getState().selectedUnits;
            // in this case only change if the empty state has changed
            if (_lastSend[UI_PLUGIN_EVENT_UNITS_SELECTED] > 0 || units.length > 0) {
                const payload = unitsPartial(units);
                this.sendMessage({
                    type: UI_PLUGIN_EVENT_UNITS_SELECTED,
                    payload
                });
                _lastSend[UI_PLUGIN_EVENT_UNITS_SELECTED] = units.length;
            }

        }
    }
}