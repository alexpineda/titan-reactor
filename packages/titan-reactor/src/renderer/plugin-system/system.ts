import { PluginConfig, Plugin, ScreenType, ScreenStatus, PluginPositioning, PluginPositions } from "../../common/types";
import * as log from "../ipc/log";
import GameAccessPlugin from "./game-access-plugin";
import { GameStatePosition, Unit } from "../core";
import { Scene } from "../render";
import { useScreenStore, useSettingsStore } from "../stores";
import assert from "assert";
import groupBy from "lodash.groupby";
import gameStore from "../stores/game-store";

const getPosition = (plugin: Plugin, screenType: ScreenType, screenStatus: ScreenStatus) => {
    const screenKey = `${ScreenType[screenType]}:${ScreenStatus[screenStatus]}`;
    if (plugin.config?.lifecycle[screenKey]) {
        const lifecycle = plugin.config.lifecycle[screenKey];
        if (isPluginPositioning(lifecycle)) {
            return lifecycle.position;
        } else {
            return lifecycle;
        }
    }
    return "inactive" as PluginPositions
}

let _plugins: Plugin[] = [], _screenType: ScreenType, _screenStatus: ScreenStatus;
let pluginsInitialized = false;

useSettingsStore.subscribe((settings) => {
    if (_plugins && pluginsInitialized) {
        console.warn("plugins already initialized");
        return;
    }
    pluginsInitialized = true;
    _plugins = createPlugins(settings.pluginConfigs);
});

useScreenStore.subscribe((screen) => {
    if (screen.status === _screenStatus && screen.type === _screenType) {
        return;
    }

    if (screen.status === ScreenStatus.Error) {
        disableAllPlugins();
        return;
    }

    _screenType = screen.type;
    _screenStatus = screen.status;
    calculateLayouts();
});

const _leftRight = ["left", "right"];
const _topBottom = ["top", "bottom"];

const calculateLayouts = () => {
    const dimensions = gameStore().dimensions;

    const grouped = groupBy(_plugins, (plugin) => getPosition(plugin, _screenType, _screenStatus));

    console.log(grouped)

    grouped["inactive"]?.forEach((plugin) => {
        disablePlugin(plugin);
    });

    grouped["hidden"]?.forEach((plugin) => {
        plugin.iframe.style.right = "0px";
        if (!plugin.iframe.parentElement) {
            document.body.appendChild(plugin.iframe);
        }
        console.log("connecting", plugin.name, ScreenType[_screenType], ScreenStatus[_screenStatus]);
        plugin.onConnected(_screenType, _screenStatus);
    });

    // do corners first

    // see if the plugin has already set its desired size
    // if it has, use that size
    // if not, use the default size
    for (const key of _leftRight) {
        grouped[key]?.forEach((plugin) => {
            const position = getPosition(plugin, _screenType, _screenStatus);
            plugin.iframe.style.left = position === "left" ? "0px" : "auto";
            plugin.iframe.style.right = position === "right" ? "0px" : "auto";
            plugin.iframe.style.bottom = position === "left" ? `${dimensions.minimap.height}px` : "0";
            plugin.iframe.style.top = "auto";
            plugin.iframe.style.width = `${dimensions.minimap.width}px`;
            if (!plugin.iframe.parentElement) {
                document.body.appendChild(plugin.iframe);
            }
            console.log("connecting", plugin.name, ScreenType[_screenType], ScreenStatus[_screenStatus]);
            plugin.onConnected(_screenType, _screenStatus);
        });
    }

}

const isPluginPositioning = (lifecycle: any): lifecycle is PluginPositioning => {
    return lifecycle.position !== undefined;
}

// plugin.onConnected(iframeRef.current, screenType, screenStatus);
// plugin.onDisconnected();

const initializeIFrame = (plugin: Plugin) => {
    const iframe = plugin.iframe;
    iframe.style.position = "absolute";
    iframe.style.zIndex = "10";
    iframe.style.backgroundColor = "transparent";
    iframe.style.border = "none";
    iframe.style.pointerEvents = plugin.config?.pointerInteraction ? "auto" : "none";
    iframe.style.userSelect = plugin.config?.pointerInteraction ? "auto" : "none";
    iframe.src = plugin.src;
};

const disablePlugin = (plugin: Plugin) => {
    if (plugin.iframe.parentElement) {
        plugin.iframe.remove();
        plugin.onDisconnected();
    }
}

const disableAllPlugins = () => {
    for (const plugin of _plugins) {
        disablePlugin(plugin);
    }
}

export const createPlugins = (pluginConfigs: PluginConfig[]) => {

    const plugins = pluginConfigs.map(pluginConfig => {
        let plugin;

        try {
            if (pluginConfig.import) {
                plugin = Function(pluginConfig.import)();
                pluginConfig.import = undefined;
                assert(plugin.onInitialized, "onInitialized is required");
                assert(plugin.onFrame, "onFrame is required");
                plugin.iframe = document.createElement("iframe");
                plugin.onInitialized(pluginConfig);
            } else {
                plugin = new GameAccessPlugin(pluginConfig);
            }

            initializeIFrame(plugin);

        } catch (e: unknown) {
            if (e instanceof Error) {
                log.error(`plugin:initialize "${pluginConfig.name}" - ${e.message}`);
            }
        }
        return plugin;
    }).filter(plugin => plugin !== undefined) as Plugin[];

    return plugins;
}

export const disposePlugins = (plugins: Plugin[]) => {
    for (const plugin of plugins) {
        try {
            plugin.onDispose && plugin.onDispose();
        } catch (e: unknown) {
            if (e instanceof Error) {
                log.error(`plugin:dispose "${plugin.name}" - ${e.message}`);
            }
        }
    }
}

export const onFrame = (gameStatePosition: GameStatePosition, scene: Scene, cmdsThisFrame: any[], units: Map<number, Unit>) => {
    for (const plugin of _plugins) {
        plugin.iframe.parentElement && plugin.onFrame(gameStatePosition, scene, cmdsThisFrame, units);
    }
}