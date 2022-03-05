import { PluginContentSize, ScreenStatus, ScreenType, InitializedPluginConfiguration } from "common/types";

const _sharedContainer = document.createElement("iframe");
_sharedContainer.style.backgroundColor = "transparent";
_sharedContainer.style.border = "none";
_sharedContainer.style.pointerEvents = "none";
_sharedContainer.style.userSelect = "none";
_sharedContainer.style.left = "0";
_sharedContainer.style.top = "0";
_sharedContainer.style.width = "100%";
_sharedContainer.style.height = "100%";
_sharedContainer.style.position = "absolute";

_sharedContainer.sandbox.add("allow-scripts");
_sharedContainer.sandbox.add("allow-downloads");

_sharedContainer.src = "http://localhost:8080/runtime.html"
document.body.appendChild(_sharedContainer)


class Plugin {
    enabled = true;
    private _config: InitializedPluginConfiguration;

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

    constructor(config: InitializedPluginConfiguration) {
        this._config = config;

        if (config.iframe === "isolated") {
            const iframe = document.createElement("iframe");
            iframe.style.backgroundColor = "transparent";
            iframe.style.border = "none";
            iframe.style.pointerEvents = "none";
            iframe.style.userSelect = "none";
            iframe.style.left = "0";
            iframe.style.top = "0";
            iframe.style.width = "100%";
            iframe.style.height = "100%";

            // iframe.src = config.markup || "";

            iframe.sandbox.add("allow-scripts");
            iframe.sandbox.add("allow-downloads");
            this._isolatedContainer = iframe;
        }

    }

    /**
     * For native.js plugins
     * @param config 
     */
    onInitialized(config: InitializedPluginConfiguration): void {
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

    get channels() {
        return this._config.channels;
    }

    onMessage(message: any) {
        if (message.type === "content.ready") {
            // this._updateContentSize(message.width, message.height);
        }
    }


}

export default Plugin;