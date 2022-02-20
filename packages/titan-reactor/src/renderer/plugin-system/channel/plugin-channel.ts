import { InitializedPluginJSON, ScreenStatus, ScreenType } from "../../../common/types";
import { MathUtils } from "three";
import { GameStatePosition, Unit } from "../../core";
import { Scene } from "../../render";
import Janitor from "../../utils/janitor";


export const MSG_CONNECTED = "connected";
export const MSG_DISCONNECTED = "disconnected";
export const MSG_REPLAY_POSITION = "replay.position";

const _disconnected = { type: MSG_DISCONNECTED }

abstract class PluginChannel {
    id = MathUtils.generateUUID();
    private _pluginId: string;
    protected _janitor = new Janitor();
    protected _lastSend: { [key: string]: any } = {};
    private _getUserConfig: () => any;
    private _broadcastMessage: (message: any) => void;

    constructor(pluginId: string, getUserConfig: () => any, broadcastMessage: (message: any) => void) {
        this._pluginId = pluginId;
        this._getUserConfig = getUserConfig;
        this._broadcastMessage = broadcastMessage;
    }

    postMessage(message: any, transferable?: Transferable[]): void {
    }

    onInitialized(config: InitializedPluginJSON): void {
        throw new Error("Method not implemented.");
    }
    onDisconnected(): void {
        this.postMessage(_disconnected);
    }
    onFrame(gameStatePosition: GameStatePosition, scene: Scene, cmdsThisFrame: any[], units: Map<number, Unit>): void {
        const time = gameStatePosition.getSecond();
        if (this._lastSend[MSG_REPLAY_POSITION] !== time) {
            this.postMessage({
                type: MSG_REPLAY_POSITION,
                frame: gameStatePosition.bwGameFrame,
                maxFrame: gameStatePosition.maxFrame,
                time: gameStatePosition.getFriendlyTime(),
            });
            this._lastSend[MSG_REPLAY_POSITION] = time;
        }
    }

    onConnected(screenType: ScreenType, screenStatus: ScreenStatus) {


        const _onMessage = (event: MessageEvent) => {
            if ((event.data.pluginId === this._pluginId && event.data.channelId !== this.id) || event.data.channelId === this.id) {
                this._onMessage(event.data);
            }
        };
        window.addEventListener('message', _onMessage);
        this._janitor.callback(() => window.removeEventListener('message', _onMessage));

        this.postMessage({
            type: MSG_CONNECTED,
            pluginId: this._pluginId,
            channelId: this.id,
            screen: ScreenType[screenType],
            status: ScreenStatus[screenStatus],
            userConfig: this._getUserConfig(),
        });

    }

    protected _onMessage(message: any) {
        // broadcast message to all channels
        if (message.pluginId === this._pluginId && message.channelId === this.id) {
            this._broadcastMessage(message);
        }
    }
}

export default PluginChannel;