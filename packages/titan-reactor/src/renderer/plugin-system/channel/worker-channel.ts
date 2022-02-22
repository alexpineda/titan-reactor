import { InitializedPluginChannelConfiguration, WorkerPluginChannelConfiguration } from "../../../common/types";
import PluginChannel from "./plugin-channel";

class PluginWorkerChannel extends PluginChannel {
    config: InitializedPluginChannelConfiguration<WorkerPluginChannelConfiguration>;
    worker: Worker;

    constructor(pluginId: string,
        _: string,
        config: InitializedPluginChannelConfiguration<WorkerPluginChannelConfiguration>, getUserConfig: () => {}, broadcastMessage: (message: any) => void) {
        super(pluginId, getUserConfig, broadcastMessage);
        this.config = config;
        this.worker = new Worker(config.url);
    }

    override postMessage(message: any, transferable?: Transferable[]): void {
        this.worker.postMessage(message, transferable ?? []);
    }
}

export default PluginWorkerChannel;