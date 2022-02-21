import { MathUtils } from "three";
import { PluginContentSize, ScreenStatus, ScreenType, InitializedPluginJSON } from "../../common/types";
import { GameStatePosition, Unit } from "../core";
import { Scene } from "../render";

import PluginWorkerChannel from "./channel/worker-channel";
import PluginIFrameChannel from "./channel/iframe-channel";
import PluginHTMLChannel from "./channel/html-channel";
import { isHTMLChannelConfig, isIFrameChannelConfig, isWorkerChannelConfig } from ".";


// TODO: userland apis: onshow, onhide, onresize, onfullscreen, onunfullscreen, setvisibility
class Plugin {
    channels: (PluginIFrameChannel | PluginWorkerChannel | PluginHTMLChannel)[];
    private _config: InitializedPluginJSON;
    protected _id = MathUtils.generateUUID();
    protected _contentSize?: PluginContentSize;

    protected _screenType: ScreenType = ScreenType.Home;
    protected _screenStatus: ScreenStatus = ScreenStatus.Loading;

    constructor(config: InitializedPluginJSON) {
        this._config = config;

        const broadcastMessage = (message: any) => {
            for (const channel of this.channels) {
                channel.postMessage(message);
            }
        }

        const getUserConfig = () => this._config.userConfig;

        this.channels = config.channels.map(channelConfig => {
            if (isIFrameChannelConfig(channelConfig)) {
                return new PluginIFrameChannel(this._id, channelConfig, getUserConfig, broadcastMessage);
            } else if (isWorkerChannelConfig(channelConfig)) {
                return new PluginWorkerChannel(this._id, channelConfig, getUserConfig, broadcastMessage);
            } else if (isHTMLChannelConfig(channelConfig)) {
                return new PluginHTMLChannel(this._id, channelConfig, getUserConfig, broadcastMessage);
            }
            throw new Error(`Unknown channel type: ${channelConfig.type}`);
        });
    }

    onInitialized(config: InitializedPluginJSON): void {
        this._config = config;
    }

    get userConfig() {
        return this._config.userConfig;
    }

    get name() {
        return this._config.name;
    }

    onFrame(gameStatePosition: GameStatePosition, scene: Scene, cmdsThisFrame: any[], units: Map<number, Unit>): void {
        for (const channel of this.channels) {
            channel.onFrame(gameStatePosition, scene, cmdsThisFrame, units);
        }
    }

    onDispose() {
    }

}

export default Plugin;