import { Plugin, RealtimePluginAPI, ScreenStatus, ScreenType } from "../../common/types";

export const RW_REPLAY_POSITION = "replay-position";
export const RW_CONNECTED = "connected";
export const RW_DISCONNECTED = "disconnected";

const anyOrigin = "*";

class DefaultPluginAPI implements RealtimePluginAPI {

    private _read: string[] = [];
    private _write: string[] = [];
    private _config: any;
    private _userConfig: any;
    private _iframe?: HTMLIFrameElement;

    onInitialized(config: any, userConfig: any): void {
        this._config = config;
        this._userConfig = userConfig;
        this._read = this._config.read || [];
        this._write = this._config.write || [];
    }

    onBeforeConnect(screenType: ScreenType, screenStatus: ScreenStatus): boolean {
        const layout = this._config.layout;
        return layout && layout[ScreenType[screenType!]] && layout[ScreenType[screenType!]][ScreenStatus[screenStatus!]];
    }

    onConnected(iframe: HTMLIFrameElement, screenType: ScreenType, screenStatus: ScreenStatus) {

        // display:
        //       plugin.layout[ScreenType[screenType]][
        //         ScreenStatus[screenStatus]
        //       ] === "hide"
        //         ? "none"
        //         : "block",

        this._iframe = iframe;
        if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: RW_CONNECTED,
                data: {
                    screen: `${ScreenType[screenType]}:${ScreenStatus[screenStatus]}`,
                    userConfig: this._userConfig,
                }
            }, anyOrigin);
        }

        const layout = this._config.layout;
        try {
            iframe.style.display = layout[ScreenType[screenType!]][ScreenStatus[screenStatus!]] === "hide" ? "none" : "block";
        } catch (e) {
        }

    }

    onDisconnected() {
        if (this._iframe?.contentWindow) {
            this._iframe.contentWindow.postMessage({ type: RW_DISCONNECTED }, anyOrigin);
        }
        delete this._iframe;
    }

    execReadReplayPosition(frame: number, endFrame: number, time: string) {
        if (this._read.includes(RW_REPLAY_POSITION)) {
            if (this._iframe?.contentWindow) {
                this._iframe.contentWindow.postMessage({
                    type: RW_REPLAY_POSITION,
                    data: {
                        frame,
                        endFrame,
                        time,
                    },
                }, anyOrigin);
            }
        }
    }
}

export default DefaultPluginAPI;