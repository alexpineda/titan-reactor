import Janitor from "@utils/janitor";
import { InitializedPluginPackage, ScreenStatus, ScreenType } from "common/types";
import settingsStore from "@stores/settings-store";

import { useGameStore, useScreenStore, useWorldStore, ScreenStore, WorldStore, useSelectedUnitsStore } from "@stores";

import { UI_PLUGIN_EVENT_DIMENSIONS_CHANGED, SYSTEM_EVENT_READY, SYSTEM_EVENT_ASSETS, UI_PLUGIN_EVENT_ON_FRAME, UI_PLUGIN_EVENT_SCREEN_CHANGED, UI_PLUGIN_EVENT_WORLD_CHANGED, UI_PLUGIN_EVENT_UNITS_SELECTED } from "./events";
import waitForAssets from "../bootup/wait-for-assets";
import { GameStatePosition, Unit } from "@core";
import { openBw } from "../openbw";
import { StdVector } from "../buffer-view/std-vector";
import * as enums from "common/enums";

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
            dat: {
                ...unit.extras.dat,
                ...unit.extras.dat.copyFlags()
            }
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
    #_iframe: HTMLIFrameElement = document.createElement("iframe");
    #_janitor = new Janitor();
    refresh: () => void;


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
            [UI_PLUGIN_EVENT_WORLD_CHANGED]: worldPartial(useWorldStore.getState()),
            [UI_PLUGIN_EVENT_ON_FRAME]: _replayPosition.payload
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
                        wireframeIcons: assets.wireframeIcons
                    },
                    enums
                }
            }, "*")
        };
        document.body.appendChild(this.#_iframe);
        this.#_janitor.callback(() => document.body.removeChild(this.#_iframe));

        this.refresh = () => {
            const settings = settingsStore().data;
            this.#_iframe.src = `http://localhost:${settings.plugins.serverPort}/runtime.html`;
        }

        this.#_janitor.callback(useGameStore.subscribe((game, prev) => {
            if (game.dimensions !== prev.dimensions) {
                this.sendMessage({
                    type: UI_PLUGIN_EVENT_DIMENSIONS_CHANGED,
                    payload: game.dimensions
                });
            }
        }));

        this.#_janitor.callback(useScreenStore.subscribe((screen) => {
            this.sendMessage(screenChanged(screen));
        }));

        this.#_janitor.callback(useWorldStore.subscribe((world) => {
            this.sendMessage({
                type: UI_PLUGIN_EVENT_WORLD_CHANGED,
                payload: worldPartial(world)
            });
        }));

        this.#_janitor.callback(useSelectedUnitsStore.subscribe(({ selectedUnits }) => {
            this.sendMessage({
                type: UI_PLUGIN_EVENT_UNITS_SELECTED,
                payload: unitsPartial(selectedUnits)
            });
        }));

        this.refresh();

    }

    sendMessage(message: any, transfer?: Transferable[]) {
        this.#_iframe.contentWindow?.postMessage(message, "*", transfer);
    }

    dispose() {
        this.reset();
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

            // in case hp changed, etc.
            // TODO: maybe introduce a dirty flag to units and check if any are dirty to send
            const units = useSelectedUnitsStore.getState().selectedUnits;
            // in this case only change if the empty state has changed
            if (_lastSend[UI_PLUGIN_EVENT_UNITS_SELECTED] > 0 || units.length > 0) {
                this.sendMessage({
                    type: UI_PLUGIN_EVENT_UNITS_SELECTED,
                    payload: unitsPartial(units)
                });
                _lastSend[UI_PLUGIN_EVENT_UNITS_SELECTED] = units.length;
            }

        }
    }
}