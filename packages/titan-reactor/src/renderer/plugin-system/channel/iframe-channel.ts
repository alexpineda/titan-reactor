
import debounce from "lodash.debounce";
import gameStore from "../..//stores/game-store";
import { InitializedIFramePluginConfig } from "../../../common/types";
import PluginChannel from "./plugin-channel";

class PluginIFrameChannel extends PluginChannel {
    config: InitializedIFramePluginConfig;
    iframe = document.createElement("iframe");
    private _updateContentSize: (width?: string, height?: string) => void;
    private _updatedContentSize = false;

    override postMessage(message: any, transferable?: Transferable[]) {
        if (this.iframe.contentWindow) {
            this.iframe.contentWindow.postMessage(message, "*", transferable);
        }
    }

    constructor(pluginId: string, config: InitializedIFramePluginConfig, getUserConfig: () => {}) {
        super(pluginId, getUserConfig);
        this.config = config;

        const iframe = this.iframe;
        iframe.style.backgroundColor = "transparent";
        iframe.style.border = "none";
        iframe.style.pointerEvents = config.pointerInteraction ? "auto" : "none";
        iframe.style.userSelect = config?.pointerInteraction ? "auto" : "none";

        iframe.src = config.url || "";

        this._updateContentSize = (width?: string, height?: string) => {
            gameStore().setLatestPluginContentSize(this.id, width, height);
        };
    }

    protected override _onMessage(message: any) {
        if (message.type === "content.size" && !this._updatedContentSize) {
            this._updateContentSize(message.width, message.height);
            this._updatedContentSize = true;
        }
    }
}

export default PluginIFrameChannel;