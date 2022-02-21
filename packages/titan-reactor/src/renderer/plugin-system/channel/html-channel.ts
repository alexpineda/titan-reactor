import { HTMLPluginChannelConfiguration, InitializedPluginChannelConfiguration } from "../../../common/types";
import PluginChannel from "./plugin-channel";

class PluginHTMLChannel extends PluginChannel {
    config: InitializedPluginChannelConfiguration<HTMLPluginChannelConfiguration>;

    constructor(pluginId: string, config: InitializedPluginChannelConfiguration<HTMLPluginChannelConfiguration>, getUserConfig: () => {}, broadcastMessage: (message: any) => void) {
        super(pluginId, getUserConfig, broadcastMessage);
        this.config = config;
    }

    override postMessage(message: any, transferable?: Transferable[]): void {
        if (this.config["access.read"] && message.type === this.config["access.read"][0]) {
            // TODO: render content from message
        }
    }
}

export default PluginHTMLChannel;