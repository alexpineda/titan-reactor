import { MathUtils } from "three";
import { GameCanvasDimensions, Plugin, RealtimePluginAPI, ScreenStatus, ScreenType } from "../../common/types";
import { GameStatePosition, Unit } from "../core";
import { Scene } from "../render";
import gameStore, { useGameStore } from "../stores/game-store";
import Janitor from "../utils/janitor";

export const RW_REPLAY_POSITION = "replay-position";
export const RW_CONNECTED = "connected";
export const RW_DISCONNECTED = "disconnected";

const anyOrigin = "*";

// TODO: move to a layout manager
// track connected plugins for layout purposes
const _connectedPlugins: Map<string, DefaultPluginAPI> = new Map();
useGameStore.subscribe((newValue, oldValue) => {
    if (newValue.dimensions !== oldValue.dimensions) {
        for (const [, p] of _connectedPlugins) {
            p.onResize();
        }
    }
})

type PluginSizing = {
    width: number;
    height: number;
    mode?: "fit-size" | "set-size";
}
// TODO: userland apis: onshow, onhide, onresize, onfullscreen, onunfullscreen, setvisibility
class DefaultPluginAPI implements RealtimePluginAPI {

    private _read: string[] = [];
    private _write: string[] = [];
    private _lastSent: Record<string, any> = {};
    private _config: any;
    private _userConfig: any;
    private _iframe?: HTMLIFrameElement;
    private _id = MathUtils.generateUUID();
    private _janitor = new Janitor();
    private _sizing: PluginSizing = { width: 0, height: 0 };

    onInitialized(config: any, userConfig: any): void {
        this._config = config;
        this._userConfig = userConfig;
        this._read = this._config.read || [];
        this._write = this._config.write || [];
    }

    onBeforeConnect(screenType: ScreenType, screenStatus: ScreenStatus): boolean {
        const layout = this._config.layout;
        return layout && layout[ScreenType[screenType!]] && layout[ScreenType[screenType!]][ScreenStatus[screenStatus!]];
    }

    onConnected(iframe: HTMLIFrameElement, screenType: ScreenType, screenStatus: ScreenStatus) {

        this._iframe = iframe;
        if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: RW_CONNECTED,
                pluginId: this._id,
                screen: `${ScreenType[screenType]}:${ScreenStatus[screenStatus]}`,
                userConfig: this._userConfig,
            }, anyOrigin);
        }

        const layout = this._config.layout;
        try {
            iframe.style.display = layout[ScreenType[screenType!]][ScreenStatus[screenStatus!]] === "hide" ? "none" : "block";
        } catch (e) {
        }

        _connectedPlugins.set(this._id, this);

        this.onResize();

        const _onMessage = (event: MessageEvent) => {
            if (event.data.pluginId === this._id) {
                if (event.data.type === "fit-size" || event.data.type === "set-size") {
                    this._sizing = { mode: event.data.type, width: event.data.width, height: event.data.height };
                    this.calcSize();
                }
            }
        };
        window.addEventListener('message', _onMessage);
        this._janitor.callback(() => window.removeEventListener('message', _onMessage));
    }

    calcSize() {
        if (this._iframe) {
            const dimensions = gameStore().dimensions;
            let width = dimensions.minimap.width;
            let height = 100;
            if (this._sizing.mode === "set-size") {
                width = this._sizing.width;
            }
            if (this._sizing.mode === "set-size") {
                height = this._sizing.height;
            }
            if (this._sizing.mode === "fit-size") {
                height = this._sizing.height;
            }

            this._iframe.style.left = "0px";
            this._iframe.style.width = `${width}px`;
            this._iframe.style.bottom = `${dimensions.minimap.height}px`;
            this._iframe.style.height = `${height}px`;
        }
    }

    onResize() {
        this.calcSize();
    }

    onDisconnected() {
        if (this._iframe?.contentWindow) {
            this._iframe.contentWindow.postMessage({ type: RW_DISCONNECTED }, anyOrigin);
        }
        delete this._iframe;
        _connectedPlugins.delete(this._id);
        this._janitor.mopUp();
    }

    onFrame(gameStatePosition: GameStatePosition, scene: Scene, cmdsThisFrame: any[], units: Map<number, Unit>) {
        if (this._iframe?.contentWindow) {
            if (this._read.includes(RW_REPLAY_POSITION)) {
                const time = gameStatePosition.getSecond();
                if (this._lastSent[RW_REPLAY_POSITION] !== time) {
                    this._iframe.contentWindow.postMessage({
                        type: RW_REPLAY_POSITION,
                        frame: gameStatePosition.bwGameFrame,
                        maxFrame: gameStatePosition.maxFrame,
                        time: gameStatePosition.getFriendlyTime(),
                    }, anyOrigin);
                    this._lastSent[RW_REPLAY_POSITION] = time;
                }
            }
        }
    }

}

export default DefaultPluginAPI;