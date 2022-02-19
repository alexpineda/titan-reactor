import create from "zustand";
import groupBy from "lodash.groupby";
import { PluginPositioning, PluginInstance, ScreenStatus, ScreenType, PluginPositions, PluginContentSize } from "../../common/types";


export type PluginLayoutStore = PluginPositions & {
    setPlugins(plugins: PluginInstance[], screenType: ScreenType, screenStatus: ScreenStatus): void;
    updatePlugin(plugin: PluginInstance, size: { width: number, height: number }): void;
};

const isDetailedLifecycle = (lifecycle: any): lifecycle is PluginPositioning => {
    return lifecycle.position !== undefined;
}

let _plugins: PluginInstance[], _screenType: ScreenType, _screenStatus: ScreenStatus;

const getPosition = (plugin: PluginInstance, screenType: ScreenType, screenStatus: ScreenStatus) => {
    const screenKey = `${ScreenType[screenType]}:${ScreenStatus[screenStatus]}`;
    if (plugin.config.lifecycle[screenKey]) {
        const lifecycle = plugin.config.lifecycle[screenKey];
        if (isDetailedLifecycle(lifecycle)) {
            return lifecycle.position;
        } else {
            return lifecycle;
        }
    }
    return null;
}

export const usePluginLayoutStore = create<PluginLayoutStore>((set, get) => ({
    topLeft: [],
    topRight: [],
    bottomLeft: [],
    bottomRight: [],
    left: [],
    right: [],
    top: [],
    bottom: [],
    hidden: [],
    setPlugins: (plugins, screenType, screenStatus) => {
        _plugins = plugins;
        _screenType = screenType;
        _screenStatus = screenStatus;

        const grouped = groupBy(plugins.map(plugin => ({ plugin })), ({ plugin }) => getPosition(plugin, screenType, screenStatus));

        set({
            topLeft: grouped["topLeft"] ?? [],
            topRight: grouped["topRight"] ?? [],
            bottomLeft: grouped["bottomLeft"] ?? [],
            bottomRight: grouped["bottomRight"] ?? [],
            left: grouped["left"] ?? [],
            right: grouped["right"] ?? [],
            top: grouped["top"] ?? [],
            bottom: grouped["bottom"] ?? [],
            hidden: grouped["hidden"] ?? [],
        })

    },

    updatePlugin(plugin: PluginInstance, contentRect: PluginContentSize) {
        if (!_plugins || !_screenType || !_screenStatus) {
            return;
        }
        const location = getPosition(plugin, _screenType, _screenStatus);
        if (location !== null) {
            const plugins = get()[location];
            set({
                [location]: plugins.map(p => p.plugin === plugin ? { plugin, contentRect } : p)
            } as Record<typeof location, typeof plugins>);
        }
    }
}));

export default () => usePluginLayoutStore.getState();

