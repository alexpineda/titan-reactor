import { PluginConfigAccess, PluginContentSize, PluginLifecycle } from "../../common/types";
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

    override onInitialized(config: PluginConfigAccess, userConfig: any, onContentSize: (size: PluginContentSize) => void): void {
        super.onInitialized(config, userConfig, onContentSize);
        this._read = config.access.read;
        this._write = config.access.write;
    }

    override onFrame(gameStatePosition: GameStatePosition, scene: Scene, cmdsThisFrame: any[], units: Map<number, Unit>) {
        if (this._iframe?.contentWindow) {
            if (this._read.includes(GB_REPLAY_POSITION)) {
                const time = gameStatePosition.getSecond();
                if (this._lastSent[GB_REPLAY_POSITION] !== time) {
                    this._iframe.contentWindow.postMessage({
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