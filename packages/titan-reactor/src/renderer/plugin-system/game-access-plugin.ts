import { PluginConfig, PluginConfigAccess, PluginContentSize, PluginLifecycle } from "../../common/types";
import { GameStatePosition, Unit } from "../core";
import { Scene } from "../render";
import BasePlugin from "./base-plugin";

export const GB_REPLAY_POSITION = "replay-position";
export const GB_CONNECTED = "connected";
export const GB_DISCONNECTED = "disconnected";

const anyOrigin = "*";

// TODO: userland apis: onshow, onhide, onresize, onfullscreen, onunfullscreen, setvisibility
class GameAccessPlugin extends BasePlugin {

    private _read: string[] = [];
    private _write: string[] = [];
    private _lastSent: Record<string, any> = {};

    constructor(config: PluginConfig) {
        super(config);
        this._read = config.config.access.read;
        this._write = config.config.access.write;
    }

    override onInitialized(config: PluginConfig): void {
        super.onInitialized(config);
        this._read = config.config.access.read;
        this._write = config.config.access.write;
    }

    override onFrame(gameStatePosition: GameStatePosition, scene: Scene, cmdsThisFrame: any[], units: Map<number, Unit>) {
        if (this.iframe.contentWindow) {
            if (this._read.includes(GB_REPLAY_POSITION)) {
                const time = gameStatePosition.getSecond();
                if (this._lastSent[GB_REPLAY_POSITION] !== time) {
                    this.iframe.contentWindow.postMessage({
                        type: GB_REPLAY_POSITION,
                        frame: gameStatePosition.bwGameFrame,
                        maxFrame: gameStatePosition.maxFrame,
                        time: gameStatePosition.getFriendlyTime(),
                    }, anyOrigin);
                    this._lastSent[GB_REPLAY_POSITION] = time;
                }
            }
        }
    }

}

export default GameAccessPlugin;