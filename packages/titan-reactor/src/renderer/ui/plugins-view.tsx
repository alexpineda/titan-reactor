import React, { useEffect, useRef } from "react";
import shallow from "zustand/shallow";

import {
  useGameStore,
  GameStore,
  useSettingsStore,
  SettingsStore,
} from "../stores";
import { Plugin, ScreenType, ScreenStatus } from "../../common/types";

const gameStoreSelector = (state: GameStore) => ({
  dimensions: state.dimensions,
  players: state.players,
});
const pluginSelector = (state: SettingsStore) => state.plugins;

type PluginInstance = {
  element: HTMLIFrameElement;
  plugin: Plugin;
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

  useEffect(() => {
    let cancelled = false;

    if (itemEls.current.length) {
      for (const current of itemEls.current) {
        current.plugin.iframe = current.element;
        if (current.element.contentWindow) {
          if (_alreadyLoaded.has(current.element)) {
            current.plugin.api.onConnected(
              current.plugin.iframe,
              screenType,
              screenStatus
            );
          } else {
            current.element.onload = () => {
              if (cancelled) return;
              _alreadyLoaded.set(current.element, true);
              current.plugin.api.onConnected(
                current.plugin.iframe,
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
      if (itemEls.current.length) {
        for (const current of itemEls.current) {
          current.plugin.api.onDisconnected();
          current.element.onload = null;
          current.plugin.iframe = null;
        }
      }
    };
  }, [screenType, screenStatus, plugins]);

  const enabledPlugins = plugins.filter((plugin) =>
    plugin.api.onBeforeConnect(screenType, screenStatus)
  );

  itemEls.current.length = 0;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: dimensions.minimap.height,
          width: dimensions.minimap.width,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        {enabledPlugins.map((plugin) => (
          <iframe
            key={plugin.name}
            style={{
              backgroundColor: "transparent",
              pointerEvents: "none",
              userSelect: "none",
              border: 0,
              flex: "0 1 auto",
            }}
            ref={(element) => {
              if (element) {
                itemEls.current.push({ element, plugin });
              }
            }}
            src={plugin.src}
          />
        ))}
      </div>
    </>
  );
};

export default PluginsView;
