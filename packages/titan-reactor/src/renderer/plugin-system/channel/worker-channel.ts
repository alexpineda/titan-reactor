import { InitializedWorkerPluginConfig } from "../../../common/types";
import PluginChannel from "./plugin-channel";

class PluginWorkerChannel extends PluginChannel {
    config: InitializedWorkerPluginConfig;

    constructor(pluginId: string, config: InitializedWorkerPluginConfig, getUserConfig: () => {}) {
        super(pluginId, getUserConfig);
        this.config = config;
    }
}

export default PluginWorkerChannel;