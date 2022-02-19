import React, { useEffect, useRef } from "react";
import shallow from "zustand/shallow";

import {
  useGameStore,
  GameStore,
  usePluginLayoutStore,
  PluginLayoutStore,
} from "../stores";
import { ScreenType, ScreenStatus, PluginInstance } from "../../common/types";

const gameStoreSelector = (state: GameStore) => ({
  dimensions: state.dimensions,
  players: state.players,
});

type Plugin = {
  element: HTMLIFrameElement;
  plugin: PluginInstance;
};

interface PluginsViewProps {
  screenType: ScreenType;
  screenStatus: ScreenStatus;
}

const _alreadyLoaded: WeakMap<HTMLIFrameElement, boolean> = new WeakMap();

const PluginLayoutManager = ({
  screenType,
  screenStatus,
}: PluginsViewProps) => {
  const { dimensions, players } = useGameStore(gameStoreSelector, shallow);
  const plugins = usePluginLayoutStore((state) => state, shallow);
  const itemEls: React.MutableRefObject<Plugin[]> = useRef([]);

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
          zIndex: "10",
        }}
      >
        {plugins.left.map(({ plugin, contentRect }) => {
          return (
            <iframe
              key={plugin.name}
              style={{
                backgroundColor: "transparent",
                pointerEvents: plugin.config.pointerInteraction
                  ? "auto"
                  : "none",
                userSelect: plugin.config.pointerInteraction ? "auto" : "none",
                border: 0,
                flex: "0 1 auto",
                width: contentRect?.width || "auto",
                height: contentRect?.height || "auto",
              }}
              ref={(element) => {
                if (element) {
                  itemEls.current.push({ element, plugin });
                }
              }}
              src={plugin.src}
            />
          );
        })}
      </div>
    </>
  );
};

export default PluginLayoutManager;
