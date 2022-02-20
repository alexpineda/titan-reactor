
//@ts-ignore its' not recognizing lodash.debounce
import debounce from "lodash.debounce";
import gameStore from "../..//stores/game-store";
import { InitializedIFramePluginConfig } from "../../../common/types";
import PluginChannel from "./plugin-channel";

class PluginIFrameChannel extends PluginChannel {
    config: InitializedIFramePluginConfig;
    iframe = document.createElement("iframe");
    private _updateContentSize: (width?: string, height?: string) => void;
    private _contentReady = false;

    override postMessage(message: any, transferable?: Transferable[]) {
        if (this.iframe.contentWindow) {
            this.iframe.contentWindow.postMessage(message, "*", transferable);
        }
    }

    constructor(pluginId: string, config: InitializedIFramePluginConfig, getUserConfig: () => {}, broadcastMessage: (message: any) => void) {
        super(pluginId, getUserConfig, broadcastMessage);
        this.config = config;

        const iframe = this.iframe;
        iframe.style.backgroundColor = "transparent";
        iframe.style.border = "none";
        iframe.style.pointerEvents = config.pointerInteraction ? "auto" : "none";
        iframe.style.userSelect = config?.pointerInteraction ? "auto" : "none";

        iframe.src = config.url || "";

        this._updateContentSize = debounce((width?: string, height?: string) => {
            gameStore().setLatestPluginContentSize(this.id, width, height);
        }, 1000, { leading: true });
    }

    protected override _onMessage(message: any) {
        super._onMessage(message);
        if (message.type === "content.ready" && !this._contentReady) {
            this._updateContentSize(message.width, message.height);
            this._contentReady = true;
        }
    }
}

export default PluginIFrameChannel;