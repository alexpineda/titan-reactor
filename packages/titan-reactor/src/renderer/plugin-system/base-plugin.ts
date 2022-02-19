import { MathUtils } from "three";
import { PluginContentSize, Plugin, ScreenStatus, ScreenType, PluginConfig } from "../../common/types";
import { GameStatePosition, Unit } from "../core";
import { Scene } from "../render";
import Janitor from "../utils/janitor";

export const RW_REPLAY_POSITION = "replay-position";
export const RW_CONNECTED = "connected";
export const RW_DISCONNECTED = "disconnected";

const anyOrigin = "*";

// TODO: userland apis: onshow, onhide, onresize, onfullscreen, onunfullscreen, setvisibility
class BasePlugin implements Plugin {
    private _config?: PluginConfig;
    active = null;
    iframe = document.createElement("iframe");

    onFrame(gameStatePosition: GameStatePosition, scene: Scene, cmdsThisFrame: any[], units: Map<number, Unit>): void {
        throw new Error("Method not implemented.");
    }

    protected _id = MathUtils.generateUUID();
    protected _janitor = new Janitor();
    protected _contentSize?: PluginContentSize;

    constructor(config: PluginConfig) {
        this._config = config;
    }

    onInitialized(config: PluginConfig): void {
        this._config = config;
    }

    get config() {
        return this._config!.config;
    }

    get userConfig() {
        return this._config!.userConfig;
    }

    get name() {
        return this._config!.name;
    }

    get src() {
        return this._config!.src;
    }

    onConnected(screenType: ScreenType, screenStatus: ScreenStatus) {


        const _onMessage = (event: MessageEvent) => {
            if (event.data.pluginId === this._id) {
                if (event.data.type === "report-content-size") {
                    console.log("report-content-size", event.data);
                    // TODO: throttle calls
                    // this._iframe.style.width = event.data.width;
                    // this._iframe.style.height = event.data.height;

                    // pluginLayoutStore().updatePlugin(this, { width: event.data.width, height: event.data.height });
                }
            }
        };
        window.addEventListener('message', _onMessage);
        this._janitor.callback(() => window.removeEventListener('message', _onMessage));

        if (this.iframe.contentWindow) {
            this.iframe.contentWindow.postMessage({
                type: RW_CONNECTED,
                pluginId: this._id,
                screen: `${ScreenType[screenType]}:${ScreenStatus[screenStatus]}`,
                userConfig: this.userConfig,
            }, anyOrigin);
        }

    }

    onDisconnected() {
        if (this.iframe.contentWindow) {
            this.iframe.contentWindow.postMessage({ type: RW_DISCONNECTED }, anyOrigin);
        }
        this._janitor.mopUp();
    }

}

export default BasePlugin;