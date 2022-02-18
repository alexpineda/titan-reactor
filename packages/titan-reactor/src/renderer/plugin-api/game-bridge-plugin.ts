import { GameBridgePluginConfig, PluginAPI } from "../../common/types";
import { GameStatePosition, Unit } from "../core";
import { Scene } from "../render";
import BaseLayoutPlugin from "./layout-plugin";

export const GB_REPLAY_POSITION = "replay-position";
export const GB_CONNECTED = "connected";
export const GB_DISCONNECTED = "disconnected";

const anyOrigin = "*";

// TODO: userland apis: onshow, onhide, onresize, onfullscreen, onunfullscreen, setvisibility
class GameBridgePlugin extends BaseLayoutPlugin implements PluginAPI {

    private _read: string[] = [];
    private _write: string[] = [];
    private _lastSent: Record<string, any> = {};

    override onInitialized(config: GameBridgePluginConfig, userConfig: any): void {
        super.onInitialized(config, userConfig);
        this._read = config.gameBridge.read;
        this._write = config.gameBridge.write;
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

export default GameBridgePlugin;