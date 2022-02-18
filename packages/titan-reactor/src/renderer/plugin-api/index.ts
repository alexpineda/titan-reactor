import { PluginConfig, ScreenStatus, ScreenType } from "../../common/types";
import readReplayPosition, { REPLAY_POSITION } from "./reads/replay-position";
import readConnected from "./reads/connected";
import readDisconnected from "./reads/disconnected";

const anyOrigin = "*";

//TODO: Allow plugins to pause subscriptions.
class PluginApi {
    private _reads: Record<string, PluginConfig[]> = {};
    private _writes: Record<string, PluginConfig[]> = {};
    private _plugins: PluginConfig[] = [];

    registerPlugin(plugin: PluginConfig, screenType: ScreenType, screenStatus: ScreenStatus) {
        this.unregisterPlugins();

        if (plugin.read) {
            for (const read of plugin.read) {
                this._reads[read] = this._reads[read] ? [...this._reads[read], plugin] : [plugin];
            }
        }
        if (plugin.write) {
            for (const write of plugin.write) {
                this._writes[write] = this._writes[write] ? [...this._writes[write], plugin] : [plugin];
            }
        }

        if (plugin.contentWindow) {
            plugin.contentWindow.postMessage(readConnected(screenType, screenStatus), anyOrigin);
        }

        this._plugins.push(plugin);
    }

    unregisterPlugins() {
        for (const plugin of this._plugins) {
            if (plugin.contentWindow) {
                plugin.contentWindow.postMessage(readDisconnected(), anyOrigin);
            }
        }

        this._reads = {};
        this._writes = {};
        this._plugins = [];
    }

    execReadReplayPosition(frame: number, endFrame: number, time: string) {
        if (this._reads[REPLAY_POSITION]) {
            for (const plugin of this._reads[REPLAY_POSITION]) {
                if (plugin.contentWindow) {
                    plugin.contentWindow.postMessage(readReplayPosition(frame, endFrame, time), anyOrigin);
                }
            }
        }
    }
}

export default new PluginApi();