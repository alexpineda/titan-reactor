import { PluginContentSize, ScreenStatus, ScreenType, InitializedPluginPackage } from "common/types";


class Plugin {
    enabled = true;
    private _config: InitializedPluginPackage;

    protected _contentSize?: PluginContentSize;

    protected _screenType: ScreenType = ScreenType.Home;
    protected _screenStatus: ScreenStatus = ScreenStatus.Loading;

    constructor(config: InitializedPluginPackage) {
        this._config = config;
    }

    /**
     * For native.js plugins
     * @param config 
     */
    onInitialized(config: InitializedPluginPackage): void {
        this._config = config;
    }

    get id() {
        return this._config.id;
    }

    get name() {
        return this._config.name;
    }

    get version() {
        return this._config.version;
    }

    onMessage(message: any) {
        if (message.type === "content.ready") {
            // this._updateContentSize(message.width, message.height);
        }
    }


}

export default Plugin;