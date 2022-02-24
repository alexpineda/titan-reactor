import PluginIFrameChannel from "../../renderer/plugin-system/channel/iframe-channel";
import { WebComponentPluginChannelConfiguration, IFramePluginChannelConfiguration, WorkerPluginChannelConfiguration } from "../types";

export const isIFrameChannel = (channel: any): channel is PluginIFrameChannel => {
    return channel instanceof PluginIFrameChannel;
};

export const isIFrameChannelConfig = (channel: any): channel is IFramePluginChannelConfiguration => {
    return channel.type === "iframe";
}

export const isWebComponentChannelConfig = (channel: any): channel is WebComponentPluginChannelConfiguration => {
    return channel.type === "web-component";
}

export const isWorkerChannelConfig = (channel: any): channel is WorkerPluginChannelConfiguration => {
    return channel.type === "worker";
}