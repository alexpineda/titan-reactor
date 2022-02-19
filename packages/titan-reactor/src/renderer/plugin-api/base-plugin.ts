import { MathUtils } from "three";
import { PluginConfigLifecycle, PluginContentSize, PluginJSON, PluginLifecycle as PluginLifecycle, ScreenStatus, ScreenType } from "../../common/types";
import { GameStatePosition, Unit } from "../core";
import { Scene } from "../render";
import pluginLayoutStore from "../stores/plugin-layout-store";
import Janitor from "../utils/janitor";

export const RW_REPLAY_POSITION = "replay-position";
export const RW_CONNECTED = "connected";
export const RW_DISCONNECTED = "disconnected";

const anyOrigin = "*";

// TODO: userland apis: onshow, onhide, onresize, onfullscreen, onunfullscreen, setvisibility
class BasePlugin implements PluginLifecycle {
    onFrame(gameStatePosition: GameStatePosition, scene: Scene, cmdsThisFrame: any[], units: Map<number, Unit>): void {
        throw new Error("Method not implemented.");
    }

    protected _config?: PluginConfigLifecycle;
    protected _userConfig: any;
    protected _iframe?: HTMLIFrameElement;
    protected _id = MathUtils.generateUUID();
    protected _janitor = new Janitor();
    protected _contentSize?: PluginContentSize;
    private _onContentSize?(size: PluginContentSize): void;

    onInitialized(config: PluginConfigLifecycle, userConfig: any, onContentSize: (size: PluginContentSize) => void): void {
        this._config = config;
        this._userConfig = userConfig;
        this._onContentSize = onContentSize;
    }

    onConnected(iframe: HTMLIFrameElement, screenType: ScreenType, screenStatus: ScreenStatus) {

        this._iframe = iframe;
        if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: RW_CONNECTED,
                pluginId: this._id,
                screen: `${ScreenType[screenType]}:${ScreenStatus[screenStatus]}`,
                userConfig: this._userConfig,
            }, anyOrigin);
        }

        const _onMessage = (event: MessageEvent) => {
            if (event.data.pluginId === this._id) {
                if (event.data.type === "report-content-size") {
                    this._onContentSize && this._onContentSize({ width: event.data.width, height: event.data.height })
                }
            }
        };
        window.addEventListener('message', _onMessage);
        this._janitor.callback(() => window.removeEventListener('message', _onMessage));
    }

    onDisconnected() {
        if (this._iframe?.contentWindow) {
            this._iframe.contentWindow.postMessage({ type: RW_DISCONNECTED }, anyOrigin);
        }
        delete this._iframe;
        this._janitor.mopUp();
    }

}

export default BasePlugin;