import { PluginContentSize, ScreenStatus, ScreenType, InitializedPluginPackage } from "common/types";

const _sharedContainer = document.createElement("iframe");
_sharedContainer.style.backgroundColor = "transparent";
_sharedContainer.style.border = "none";
_sharedContainer.style.left = "0";
_sharedContainer.style.top = "0";
_sharedContainer.style.width = "100%";
_sharedContainer.style.height = "100%";
_sharedContainer.style.position = "absolute";
_sharedContainer.style.zIndex = "10";
_sharedContainer.style.pointerEvents = "none";
_sharedContainer.style.userSelect = "none";

_sharedContainer.sandbox.add("allow-scripts");
_sharedContainer.sandbox.add("allow-downloads");



class Plugin {
    enabled = true;
    private _config: InitializedPluginPackage;

    protected _contentSize?: PluginContentSize;

    protected _screenType: ScreenType = ScreenType.Home;
    protected _screenStatus: ScreenStatus = ScreenStatus.Loading;

    private _isolatedContainer?: HTMLIFrameElement;

    static get sharedContainer() {
        return _sharedContainer;
    }

    get isolatedContainer() {
        return this._isolatedContainer;
    }

    constructor(config: InitializedPluginPackage) {
        this._config = config;
    }

    /**
     * For native.js plugins
     * @param config 
     */
    onInitialized(config: InitializedPluginPackage): void {
        this._config = config;

        if (config.iframe === "isolated") {
            const iframe = document.createElement("iframe");
            iframe.style.backgroundColor = "transparent";
            iframe.style.border = "none";
            iframe.style.left = "0";
            iframe.style.top = "0";
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.zIndex = "10";
            iframe.style.pointerEvents = "none";
            iframe.style.userSelect = "none";

            iframe.sandbox.add("allow-scripts");
            iframe.sandbox.add("allow-downloads");
            this._isolatedContainer = iframe;
        }
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