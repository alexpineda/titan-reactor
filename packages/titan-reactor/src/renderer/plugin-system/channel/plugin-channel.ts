import { ScreenStatus, ScreenType } from "../../../common/types";
import { MathUtils } from "three";
import Janitor from "../../utils/janitor";
import { MSG_CONNECTED, MSG_DISCONNECTED } from "../messages";

const _disconnected = { type: MSG_DISCONNECTED }

abstract class PluginChannel {
    id = MathUtils.generateUUID();
    private _pluginId: string;
    protected _janitor = new Janitor();
    private _getUserConfig: () => any;
    private _broadcastMessage: (message: any) => void;

    constructor(pluginId: string,
        getUserConfig: () => any, broadcastMessage: (message: any) => void) {
        this._pluginId = pluginId;
        this._getUserConfig = getUserConfig;
        this._broadcastMessage = broadcastMessage;
    }

    abstract postMessage(message: any, transferable?: Transferable[]): void;

    onDisconnected(): void {
        this.postMessage(_disconnected);
    }

    onConnected(screenType: ScreenType, screenStatus: ScreenStatus) {

        const _onMessage = (event: MessageEvent) => {
            if ((event.data.pluginId === this._pluginId && event.data.channelId !== this.id) || event.data.channelId === this.id) {
                this._onMessage(event.data);
            }
        };
        window.addEventListener('message', _onMessage);
        this._janitor.callback(() => window.removeEventListener('message', _onMessage));

        //FIXME: lift this up to plugin level
        this.postMessage({
            type: MSG_CONNECTED,
            pluginId: this._pluginId,
            channelId: this.id,
            screen: ScreenType[screenType],
            status: ScreenStatus[screenStatus],
            userConfig: this._getUserConfig(),
        });

    }

    /**
     * @param message Message from the channel
     */
    protected _onMessage(message: any) {
        // if the channel assigns pluginId and channelId, 
        // then the intention is to broadcast message to all channels
        if (message.pluginId === this._pluginId && message.channelId === this.id) {
            this._broadcastMessage(message);
        }
    }
}

export default PluginChannel;