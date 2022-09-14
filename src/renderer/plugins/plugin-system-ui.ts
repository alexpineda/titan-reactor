import Janitor from "@utils/janitor";
import { PluginMetaData, OpenBW } from "common/types";
import settingsStore from "@stores/settings-store";
import { useGameStore, useSceneStore, useReplayAndMapStore, SceneStore, ReplayAndMapStore } from "@stores";

import { UI_STATE_EVENT_DIMENSIONS_CHANGED, UI_SYSTEM_READY, UI_STATE_EVENT_ON_FRAME, UI_STATE_EVENT_SCREEN_CHANGED, UI_STATE_EVENT_WORLD_CHANGED, UI_STATE_EVENT_UNITS_SELECTED, UI_SYSTEM_RUNTIME_READY, UI_SYSTEM_PLUGIN_DISABLED, UI_SYSTEM_PLUGINS_ENABLED, UI_STATE_EVENT_PROGRESS } from "./events";
import { waitForTruthy } from "@utils/wait-for";
import { DumpedUnit, Unit } from "@core/unit";
import { StdVector } from "../buffer-view/std-vector";
import * as enums from "common/enums";
import gameStore from "@stores/game-store";
import { getSecond } from "common/utils/conversions";
import { Assets } from "common/types";
import processStore, { useProcessStore } from "@stores/process-store";
import { MinimapDimensions } from "@render/minimap-dimensions";
import { normalizePluginConfiguration } from "@utils/function-utils"

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

const screenChanged = (screen: SceneStore) => {
    return {
        type: UI_STATE_EVENT_SCREEN_CHANGED,
        payload: {
            screen: screen.state?.id,
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

const worldPartial = (world: ReplayAndMapStore) => {
    return {
        map: world.map ? {
            title: world.map.title,
            description: world.map.description,
            width: world.map.size[0],
            height: world.map.size[1],
            tileset: world.map.tileset,
            tilesetName: world.map.tilesetName,
        } : undefined,
        replay: world.replay?.header
    }
}
const _selectedUnitMessage: {
    type: string;
    payload: DumpedUnit[]
} = {
    type: UI_STATE_EVENT_UNITS_SELECTED,
    payload: []
}

const _productionTransferables: ArrayBufferLike[] = [];

export type PluginStateMessage = {
    language: string,
    [UI_STATE_EVENT_DIMENSIONS_CHANGED]: MinimapDimensions,
    [UI_STATE_EVENT_SCREEN_CHANGED]: ReturnType<typeof screenChanged>['payload'],
    [UI_STATE_EVENT_WORLD_CHANGED]: ReturnType<typeof worldPartial>,
    [UI_STATE_EVENT_ON_FRAME]: ReturnType<typeof _makeReplayPosition>,
    [UI_STATE_EVENT_PROGRESS]: number,
    [UI_STATE_EVENT_UNITS_SELECTED]: typeof _selectedUnitMessage['payload'],
}

//TODO: use external hooks for access to state changes
export class PluginSystemUI {
    #iframe: HTMLIFrameElement = document.createElement("iframe");
    #janitor = new Janitor();
    #isRunning = false;
    #dumpUnit: (unit: Unit) => DumpedUnit;

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

    constructor(pluginPackages: PluginMetaData[], dumpUnitCall: (id: number) => any) {

        this.#dumpUnit = (unit: Unit) => {
            return {
                ...unit,
                ...dumpUnitCall(unit.id)
            } as DumpedUnit
        }

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

        const initialStore = (): PluginStateMessage => ({
            language: settingsStore().data.language,
            [UI_STATE_EVENT_DIMENSIONS_CHANGED]: useGameStore.getState().dimensions,
            [UI_STATE_EVENT_SCREEN_CHANGED]: screenChanged(useSceneStore.getState()).payload,
            [UI_STATE_EVENT_WORLD_CHANGED]: worldPartial(useReplayAndMapStore.getState()),
            [UI_STATE_EVENT_ON_FRAME]: _makeReplayPosition(),
            [UI_STATE_EVENT_PROGRESS]: processStore().getTotalProgress(),
            [UI_STATE_EVENT_UNITS_SELECTED]: _selectedUnitMessage.payload,
        })

        const setInteractivity = (interactive: boolean) => {
            this.#iframe.style.pointerEvents = interactive ? "auto" : "none";
        }

        var iframeLoaded = false;
        this.#iframe.onload = async () => {
            if (iframeLoaded) {
                iframeLoaded = false;
                this.refresh();
                return;
            }
            iframeLoaded = true;

            setInteractivity(false)

            const assets = await waitForTruthy<Assets>(() => gameStore().assets);

            this.#iframe.contentWindow?.postMessage({
                type: UI_SYSTEM_READY,
                payload: {
                    plugins: pluginPackages.map(plugin => ({ ...plugin, config: normalizePluginConfiguration(plugin.config ?? {}) })),
                    initialStore: initialStore(),
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


        this.refresh = () => {
            const settings = settingsStore().data;

            // createMeta("localhost-csp", `child-src http://localhost:${settings.plugins.serverPort} http://embed-casts.imbateam.gg http://embed-casts-2.imbateam.gg https://www.youtube.com`);
            this.#iframe.src = `http://localhost:${settings.plugins.serverPort}/runtime.html`;
        }

        this.#janitor.mop(useGameStore.subscribe((game, prev) => {
            if (game.dimensions !== prev.dimensions) {
                this.sendMessage({
                    type: UI_STATE_EVENT_DIMENSIONS_CHANGED,
                    payload: game.dimensions
                });
            }
        }));

        this.#janitor.mop(useSceneStore.subscribe((screen) => {
            this.sendMessage(screenChanged(screen));
        }));

        this.#janitor.mop(useReplayAndMapStore.subscribe((world) => {
            this.sendMessage({
                type: UI_STATE_EVENT_WORLD_CHANGED,
                payload: worldPartial(world)
            });
        }));

        this.#janitor.mop(useProcessStore.subscribe((process) => {
            this.sendMessage({
                type: UI_STATE_EVENT_PROGRESS,
                payload: process.getTotalProgress()
            });
        }))

        this.refresh();

        document.body.appendChild(this.#iframe);
        this.#janitor.mop(() => document.body.removeChild(this.#iframe));

    }

    #unitsToUnitsPayload = (units: Unit[]): Unit[] | DumpedUnit[] => {
        if (units.length === 1) {
            return units.map(this.#dumpUnit);
        } else {
            return units;
        }
    }

    onUnitsSelected(units: Unit[]) {
        this.sendMessage({
            type: UI_STATE_EVENT_UNITS_SELECTED,
            payload: this.#unitsToUnitsPayload(units)
        });
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
        this.#janitor.dispose();
    }

    reset() {
        _lastSend = {}
        _replayPosition.payload = _makeReplayPosition();
        _selectedUnitMessage.payload = [];
    }

    onFrame(openBW: OpenBW, currentFrame: number, playerDataAddr: number, productionDataAddr: number, selectedUnits: Unit[]) {

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

            // in this case only change if the empty state has changed
            if (_lastSend[UI_STATE_EVENT_UNITS_SELECTED] > 0 || selectedUnits.length > 0) {
                //TODO move this out to supply to native as well
                _selectedUnitMessage.payload = this.#unitsToUnitsPayload(selectedUnits);
                this.sendMessage(_selectedUnitMessage);
                _lastSend[UI_STATE_EVENT_UNITS_SELECTED] = selectedUnits.length;
            }

        }
    }
}