import { HTMLPluginChannelConfiguration, IFramePluginChannelConfiguration, WorkerPluginChannelConfiguration } from "../types";

export const isIFrameChannelConfig = (channel: any): channel is IFramePluginChannelConfiguration => {
    return channel.type === "iframe";
}

export const isHTMLChannelConfig = (channel: any): channel is HTMLPluginChannelConfiguration => {
    return channel.type === "html";
}

export const isWorkerChannelConfig = (channel: any): channel is WorkerPluginChannelConfiguration => {
    return channel.type === "html";
}