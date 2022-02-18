import React, { useEffect, useRef } from "react";
import shallow from "zustand/shallow";

import {
  useGameStore,
  GameStore,
  useSettingsStore,
  SettingsStore,
} from "../stores";
import { PluginConfig, ScreenType, ScreenStatus } from "../../common/types";
import pluginApi from "../plugin-api";

const gameStoreSelector = (state: GameStore) => ({
  dimensions: state.dimensions,
  players: state.players,
});
const pluginSelector = (state: SettingsStore) => state.plugins;

type PluginInstance = {
  element: HTMLIFrameElement;
  plugin: PluginConfig;
};

interface PluginsViewProps {
  screenType: ScreenType;
  screenStatus: ScreenStatus;
}

const _alreadyLoaded: WeakMap<HTMLIFrameElement, boolean> = new WeakMap();

const PluginsView = ({ screenType, screenStatus }: PluginsViewProps) => {
  const { dimensions, players } = useGameStore(gameStoreSelector, shallow);
  const plugins = useSettingsStore(pluginSelector);
  const itemEls: React.MutableRefObject<PluginInstance[]> = useRef([]);

  itemEls.current.length = 0;

  useEffect(() => {
    let cancelled = false;

    if (itemEls.current.length) {
      for (const current of itemEls.current) {
        current.plugin.contentWindow = current.element.contentWindow;
        if (current.element.contentWindow) {
          if (_alreadyLoaded.has(current.element)) {
            pluginApi.registerPlugin(current.plugin, screenType, screenStatus);
          } else {
            current.element.onload = () => {
              if (cancelled) return;
              _alreadyLoaded.set(current.element, true);
              pluginApi.registerPlugin(
                current.plugin,
                screenType,
                screenStatus
              );
            };
          }
        }
      }
    }

    return () => {
      cancelled = true;
      pluginApi.unregisterPlugins();
      if (itemEls.current.length) {
        for (const current of itemEls.current) {
          if (current.element.contentWindow) {
            current.element.onload = null;
            current.plugin.contentWindow = null;
          }
        }
      }
    };
  }, [screenType, screenStatus, plugins]);

  //TODO: positioning
  return (
    <>
      {plugins.map((plugin) => (
        <iframe
          key={plugin.name}
          style={{ border: 0 }}
          ref={(element) => {
            if (element) {
              itemEls.current.push({ element, plugin });
            }
          }}
          src={plugin.src}
        />
      ))}
    </>
  );
};

export default PluginsView;
