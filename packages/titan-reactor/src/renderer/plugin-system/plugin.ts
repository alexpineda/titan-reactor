import { MathUtils } from "three";
import { PluginContentSize, ScreenStatus, ScreenType, InitializedPluginJSON } from "../../common/types";
import { GameStatePosition, Unit } from "../core";
import { Scene } from "../render";

import PluginWorkerChannel from "./channel/worker-channel";
import PluginIFrameChannel from "./channel/iframe-channel";


// TODO: userland apis: onshow, onhide, onresize, onfullscreen, onunfullscreen, setvisibility
class Plugin {
    channels: (PluginIFrameChannel | PluginWorkerChannel)[];
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
            if (channelConfig.type === "iframe") {
                return new PluginIFrameChannel(this._id, channelConfig, getUserConfig, broadcastMessage);
            } else {
                return new PluginWorkerChannel(this._id, channelConfig, getUserConfig, broadcastMessage);
            }
        })
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