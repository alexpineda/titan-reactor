import { HTMLPluginConfig, InitializedPluginConfig } from "../../../common/types";
import PluginChannel from "./plugin-channel";

class PluginHTMLChannel extends PluginChannel {
    config: InitializedPluginConfig<HTMLPluginConfig>;

    constructor(pluginId: string, config: InitializedPluginConfig<HTMLPluginConfig>, getUserConfig: () => {}, broadcastMessage: (message: any) => void) {
        super(pluginId, getUserConfig, broadcastMessage);
        this.config = config;
    }

    override postMessage(message: any, transferable?: Transferable[]): void {
    }
}

export default PluginHTMLChannel;