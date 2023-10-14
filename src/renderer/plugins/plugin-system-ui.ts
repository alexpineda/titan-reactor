import { Janitor } from "three-janitor";
import { OpenBW } from "@openbw/openbw";
import { PluginMetaData, DeepPartial } from "common/types";
import { settingsStore } from "@stores/settings-store";
import {
    useGameStore,
    useSceneStore,
    useReplayAndMapStore,
    SceneStore,
    ReplayAndMapStore,
} from "@stores";

import {
    UI_STATE_EVENT_DIMENSIONS_CHANGED,
    UI_SYSTEM_READY,
    UI_STATE_EVENT_ON_FRAME,
    UI_STATE_EVENT_SCREEN_CHANGED,
    UI_STATE_EVENT_WORLD_CHANGED,
    UI_STATE_EVENT_UNITS_SELECTED,
    UI_SYSTEM_RUNTIME_READY,
    UI_SYSTEM_PLUGIN_DISABLED,
    UI_SYSTEM_PLUGINS_ENABLED,
    UI_STATE_EVENT_PRODUCTION,
} from "./events";
import { waitForTruthy } from "@utils/wait-for";
import { DumpedUnit, Unit } from "@core/unit";
import { StdVector } from "../buffer-view/std-vector";
import * as enums from "common/enums";
import gameStore from "@stores/game-store";
import { getSecond } from "common/utils/conversions";
import { MinimapDimensions } from "@render/minimap-dimensions";
import { normalizePluginConfiguration } from "@utils/function-utils";
import { Timer } from "@utils/timer";
import { Assets } from "@image/assets";
import { SceneStateID } from "../scenes/scene";

const screenChanged = ( screen: SceneStore ) => {
    return {
        type: UI_STATE_EVENT_SCREEN_CHANGED,
        payload: {
            screen: screen.state?.id,
            error: screen.error?.message,
        },
    };
};

let _lastSend: Record<string, any> = {};
const _productionTimer = new Timer();

const _makeOnFrame = () => 0;

const _makeOnProduction = () => ( {
    playerData: new Int32Array(),
    unitProduction: [
        new Int32Array(),
        new Int32Array(),
        new Int32Array(),
        new Int32Array(),
        new Int32Array(),
        new Int32Array(),
        new Int32Array(),
        new Int32Array(),
    ],
    research: [
        new Int32Array(),
        new Int32Array(),
        new Int32Array(),
        new Int32Array(),
        new Int32Array(),
        new Int32Array(),
        new Int32Array(),
        new Int32Array(),
    ],
    upgrades: [
        new Int32Array(),
        new Int32Array(),
        new Int32Array(),
        new Int32Array(),
        new Int32Array(),
        new Int32Array(),
        new Int32Array(),
        new Int32Array(),
    ],
} );

const _onProduction = {
    type: UI_STATE_EVENT_PRODUCTION,
    payload: _makeOnProduction(),
};

const _onFrame = {
    type: UI_STATE_EVENT_ON_FRAME,
    payload: _makeOnFrame(),
};

const _unitsPayload: DeepPartial<Unit>[] = new Array( 12 ).fill( 0 ).map( () => ( {
    extras: {},
} ) );

const worldPartial = ( world: ReplayAndMapStore ) => {
    return {
        map: world.map
            ? {
                  title: world.map.title,
                  description: world.map.description,
                  width: world.map.size[0],
                  height: world.map.size[1],
                  tileset: world.map.tileset,
                  tilesetName: world.map.tilesetName,
              }
            : undefined,
        replay: world.replay?.header,
    };
};

const _selectedUnitMessage: {
    type: string;
    payload: DumpedUnit[] | DeepPartial<Unit>[];
} = {
    type: UI_STATE_EVENT_UNITS_SELECTED,
    payload: [],
};

const _productionTransferables: ArrayBufferLike[] = [];

/**
 * @resolve
 */
export interface PluginStateMessage {
    language: string;
    [UI_STATE_EVENT_DIMENSIONS_CHANGED]: MinimapDimensions;
    [UI_STATE_EVENT_SCREEN_CHANGED]: {
        screen: SceneStateID | undefined;
        error: string | undefined;
    };
    [UI_STATE_EVENT_WORLD_CHANGED]: ReturnType<typeof worldPartial>;
    [UI_STATE_EVENT_ON_FRAME]: number;
    [UI_STATE_EVENT_PRODUCTION]: {
        playerData: Int32Array;
        unitProduction: Int32Array[];
        research: Int32Array[];
        upgrades: Int32Array[];
    };
    [UI_STATE_EVENT_UNITS_SELECTED]: DumpedUnit[] | DeepPartial<Unit>[];
}

export interface SystemReadyMessage {
    initialStore: PluginStateMessage;
    plugins: PluginMetaData[];
    assets: Pick<
        Assets,
        | "bwDat"
        | "gameIcons"
        | "cmdIcons"
        | "raceInsetIcons"
        | "workerIcons"
        | "wireframeIcons"
    >;
    enums: any;
}

export class PluginSystemUI {
    #iframe: HTMLIFrameElement = document.createElement( "iframe" );
    #janitor = new Janitor( "PluginSystemUI" );
    #isRunning = false;
    #openBW: OpenBW;

    refresh: () => void;

    constructor( openBW: OpenBW, pluginPackages: PluginMetaData[] ) {
        this.#openBW = openBW;

        this.#iframe.style.backgroundColor = "transparent";
        this.#iframe.style.border = "none";
        this.#iframe.style.left = "0";
        this.#iframe.style.top = "0";
        this.#iframe.style.width = "100%";
        this.#iframe.style.height = "100%";
        this.#iframe.style.position = "absolute";
        this.#iframe.style.zIndex = "10";
        this.#iframe.style.userSelect = "none";
        this.#iframe.sandbox.add( "allow-scripts" );
        this.#iframe.sandbox.add( "allow-downloads" );

        const initialStore = (): PluginStateMessage => ( {
            language: settingsStore().data.language,
            [UI_STATE_EVENT_DIMENSIONS_CHANGED]: useGameStore.getState().dimensions,
            [UI_STATE_EVENT_SCREEN_CHANGED]: screenChanged( useSceneStore.getState() )
                .payload,
            [UI_STATE_EVENT_WORLD_CHANGED]: worldPartial(
                useReplayAndMapStore.getState()
            ),
            [UI_STATE_EVENT_ON_FRAME]: _makeOnFrame(),
            [UI_STATE_EVENT_PRODUCTION]: _makeOnProduction(),
            [UI_STATE_EVENT_UNITS_SELECTED]: _selectedUnitMessage.payload,
        } );

        const setInteractivity = ( interactive: boolean ) => {
            this.#iframe.style.pointerEvents = interactive ? "auto" : "none";
        };

        let iframeLoaded = false;
        this.#iframe.onload = async () => {
            if ( iframeLoaded ) {
                iframeLoaded = false;
                this.refresh();
                return;
            }
            iframeLoaded = true;

            setInteractivity( false );

            await waitForTruthy( () => gameStore().assets?.remaining === 0 );
            const assets = gameStore().assets!;

            const payload: SystemReadyMessage = {
                plugins: pluginPackages.map( ( plugin ) => ( {
                    ...plugin,
                    config: normalizePluginConfiguration( plugin.config ?? {} ),
                } ) ),
                initialStore: initialStore(),
                assets: {
                    bwDat: assets.bwDat,
                    gameIcons: assets.gameIcons,
                    cmdIcons: assets.cmdIcons,
                    raceInsetIcons: assets.raceInsetIcons,
                    workerIcons: assets.workerIcons,
                    wireframeIcons: assets.wireframeIcons,
                },
                enums: { ...enums },
            };

            this.#iframe.contentWindow?.postMessage(
                {
                    type: UI_SYSTEM_READY,
                    payload,
                },
                "*"
            );
        };

        this.refresh = () => {
            const settings = settingsStore().data;

            // createMeta("localhost-csp", `child-src http://localhost:${settings.plugins.serverPort} http://embed-casts.imbateam.gg http://embed-casts-2.imbateam.gg https://www.youtube.com`);
            this.#iframe.src = `http://localhost:${settings.plugins.serverPort}/runtime.html`;
        };

        this.#janitor.mop(
            useGameStore.subscribe( ( game, prev ) => {
                if ( game.dimensions !== prev.dimensions ) {
                    this.sendMessage( {
                        type: UI_STATE_EVENT_DIMENSIONS_CHANGED,
                        payload: game.dimensions,
                    } );
                }
            } ),
            "dimensions"
        );

        this.#janitor.mop(
            useSceneStore.subscribe( ( screen ) => {
                this.sendMessage( screenChanged( screen ) );
            } ),
            "screen"
        );

        this.#janitor.mop(
            useReplayAndMapStore.subscribe( ( world ) => {
                this.sendMessage( {
                    type: UI_STATE_EVENT_WORLD_CHANGED,
                    payload: worldPartial( world ),
                } );
            } ),
            "world"
        );

        this.refresh();

        document.body.appendChild( this.#iframe );
        this.#janitor.mop( () => document.body.removeChild( this.#iframe ), "iframe" );
    }

    isRunning() {
        if ( this.#isRunning ) {
            return Promise.resolve( true );
        }

        return new Promise( ( resolve ) => {
            const _listener = ( evt: MessageEvent ) => {
                if ( evt.data?.type === UI_SYSTEM_RUNTIME_READY ) {
                    this.#isRunning = true;
                    window.removeEventListener( "message", _listener );
                    resolve( true );
                }
            };

            window.addEventListener( "message", _listener );
        } );
    }

    #unitsToUnitsPayload = ( units: Unit[] ): DeepPartial<Unit>[] | DumpedUnit[] => {
        for ( let i = 0; i < Math.min(12, units.length); i++ ) {
            _unitsPayload[i].id = units[i].id;
            _unitsPayload[i].kills = units[i].kills;
            _unitsPayload[i].energy = units[i].energy;
            _unitsPayload[i].hp = units[i].hp;
            _unitsPayload[i].owner = units[i].owner;
            _unitsPayload[i].resourceAmount = units[i].resourceAmount;
            _unitsPayload[i].shields = units[i].shields;
            _unitsPayload[i].remainingBuildTime = units[i].remainingBuildTime;
            _unitsPayload[i].typeId = units[i].typeId;
        }
        if ( units.length === 1 ) {
            const dumped = this.#openBW.get_util_funcs().dump_unit( units[0].id );
            return [
                {
                    ..._unitsPayload[0],
                    ...dumped,
                } as DumpedUnit,
            ];
        } else {
            return _unitsPayload.slice( 0, units.length );
        }
    };

    onUnitsUpdated( units: Unit[] ) {
        _selectedUnitMessage.payload = this.#unitsToUnitsPayload( units );
        this.sendMessage( _selectedUnitMessage );
        _lastSend[UI_STATE_EVENT_UNITS_SELECTED] = units.length;
    }

    sendMessage( message: object, transfer?: Transferable[] ) {
        this.#iframe.contentWindow?.postMessage( message, "*", transfer );
    }

    deactivatePlugin( id: string ) {
        this.sendMessage( {
            type: UI_SYSTEM_PLUGIN_DISABLED,
            payload: id,
        } );
    }

    activatePlugins( plugins: PluginMetaData[] ) {
        this.sendMessage( {
            type: UI_SYSTEM_PLUGINS_ENABLED,
            payload: plugins,
        } );
    }

    dispose() {
        this.reset();
        this.#janitor.dispose();
    }

    reset() {
        _lastSend = {};
        _onProduction.payload = _makeOnProduction();
        _selectedUnitMessage.payload = [];
    }

    onFrameReset( frame: number ) {
        this.reset();
        _onFrame.payload = frame;
        this.sendMessage( _onFrame );

        this.#onProduction();
    }

    onFrame( currentFrame: number, selectedUnits: Unit[] ) {
        const time = getSecond( currentFrame );

        // update the ui every game second
        if ( _lastSend[UI_STATE_EVENT_ON_FRAME] !== time ) {
            _lastSend[UI_STATE_EVENT_ON_FRAME] = time;

            _onFrame.payload = currentFrame;

            this.sendMessage( _onFrame );
        }

        _productionTimer.update();

        if ( _productionTimer.getElapsed() > 1000 ) {
            _productionTimer.resetElapsed();

            this.#onProduction();

            // in this case only change if the empty state has changed
            if (
                _lastSend[UI_STATE_EVENT_UNITS_SELECTED] > 0 ||
                selectedUnits.length > 0
            ) {
                this.onUnitsUpdated( selectedUnits );
            }
        }
    }

    #onProduction() {
        const playerDataAddr = this.#openBW._get_buffer( 8 );
        const productionDataAddr = this.#openBW._get_buffer( 9 );

        // minerals, gas, supply, supply_max, worker_supply, army_supply, apm
        const playerData = this.#openBW.HEAP32.slice(
            playerDataAddr >> 2,
            ( playerDataAddr >> 2 ) + 7 * 8
        );

        // production data is 8 arrays (players) of 3 vectors (unit, upgrades, research),
        // each vector is first stored as 3 ints (addresses)
        // so we first read units via copyData(), then increment to the next vector, and then read the upgrades via copyData() and so on.
        // unit = id, count, progress
        // upgrades = id, level, progress
        // research = id, progress

        const productionData = new StdVector( this.#openBW.HEAP32, productionDataAddr );

        _productionTransferables.length = 0;
        _productionTransferables.push( playerData.buffer );

        for ( let player = 0; player < 8; player++ ) {
            _onProduction.payload.unitProduction[player] = productionData.copyData();
            _productionTransferables.push(
                _onProduction.payload.unitProduction[player]!.buffer
            );
            productionData.address += 3;
            _onProduction.payload.upgrades[player] = productionData.copyData();
            _productionTransferables.push(
                _onProduction.payload.upgrades[player]!.buffer
            );
            productionData.address += 3;
            _onProduction.payload.research[player] = productionData.copyData();
            _productionTransferables.push(
                _onProduction.payload.research[player]!.buffer
            );
            productionData.address += 3;
        }

        _onProduction.payload.playerData = playerData;

        this.sendMessage( _onProduction, _productionTransferables );
    }
}
