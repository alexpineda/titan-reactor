import React, {
  memo,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ScreenType,
  ScreenStatus,
  GameCanvasDimensions,
  SlotConfig,
  LayoutRect as LayoutRect,
  LayoutValue,
} from "../../common/types";
import * as pluginSystem from "../plugin-system";
import { useGameStore } from "../stores";
import PluginIFrameChannel from "../plugin-system/channel/iframe-channel";
import screenStore from "../stores/screen-store";

const pluginLayoutRectProp = [
  "left",
  "top",
  "right",
  "bottom",
  "width",
  "height",
];

const PluginsChannelsSlot = ({
  screenType,
  screenStatus,
  slotConfig,
}: {
  screenType: ScreenType;
  screenStatus: ScreenStatus;
  slotConfig: SlotConfig;
}) => {
  const [readyCount, setReadyCount] = useState(0);
  const latestUpdateSize = useGameStore(
    (state) => state.latestPluginContentSize
  );

  useEffect(() => {
    if (latestUpdateSize) {
      setReadyCount(readyCount + 1);
    }
  }, [latestUpdateSize]);

  const channels = pluginSystem
    .getIFrameChannels()
    .filter(
      (channel) =>
        channel.config.screenType === screenType &&
        channel.config.screenStatus === screenStatus
    );

  const dimensions = useGameStore((state) => state.dimensions);

  const slotRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

  const pluginValueToCss = (value?: LayoutValue) => {
    if (typeof value === "number") {
      return `${value}px`;
    } else if (typeof value === "string") {
      if (value in dimensions) {
        return `${dimensions[value as keyof GameCanvasDimensions]}px`;
      }
      return value; // custom css value
    }
    return "auto"; // not set in config
  };

  const latestUpdatedChannel = channels.find(
    (channel) => latestUpdateSize && channel.id === latestUpdateSize.channelId
  );
  if (latestUpdatedChannel && latestUpdateSize) {
    if (
      latestUpdateSize.width &&
      (!latestUpdatedChannel.config["layout.width"] ||
        latestUpdatedChannel.config["layout.width"] === "content")
    ) {
      latestUpdatedChannel.iframe.style.width = pluginValueToCss(
        latestUpdateSize.width
      );
    }
    if (
      latestUpdateSize.height &&
      (!latestUpdatedChannel.config["layout.height"] ||
        latestUpdatedChannel.config["layout.height"] === "content")
    ) {
      latestUpdatedChannel.iframe.style.height = pluginValueToCss(
        latestUpdateSize.height
      );
    }
  }

  const setStyle = (channel: PluginIFrameChannel) => {
    const iframe = channel.iframe;
    iframe.style.position = "absolute";
    iframe.style.border = "none";
    iframe.style.zIndex = "10";

    for (const prop of pluginLayoutRectProp) {
      const size = channel.config[
        `layout.${prop}` as keyof LayoutRect
      ] as LayoutValue;
      iframe.style.setProperty(prop, pluginValueToCss(size));
    }
  };

  useEffect(() => {
    if (!slotRef.current) return;

    for (const prop of pluginLayoutRectProp) {
      const size = slotConfig[
        `layout.${prop}` as keyof LayoutRect
      ] as LayoutValue;
      slotRef.current.style.setProperty(prop, pluginValueToCss(size));
    }

    const screen = screenStore();
    const chunk = document.createDocumentFragment();

    for (const channel of channels) {
      chunk.appendChild(channel.iframe);
      if (!channel.iframe.parentElement) {
        setStyle(channel);
        chunk.appendChild(channel.iframe);
        channel.iframe.onload = () => {
          channel.onConnected(screen.type, screen.status);
        };
      } else if (channel.iframe.parentElement !== slotRef.current) {
        setStyle(channel);
        chunk.appendChild(channel.iframe);
        channel.iframe.onload = () => {
          channel.onConnected(screen.type, screen.status);
        };
      } else {
        channel.onConnected(screen.type, screen.status);
      }
    }
    slotRef.current.appendChild(chunk);

    return () => {
      for (const channel of channels) {
        if (channel.iframe.parentElement) {
          channel.iframe.remove();
        }
        channel.iframe.onload = null;
        channel.onDisconnected();
      }
    };
  }, [screenType, screenStatus]);

  return (
    <div
      ref={slotRef}
      style={{
        position: "absolute",
        pointerEvents: "none",
        userSelect: "none",
      }}
    ></div>
  );
};

export default memo(PluginsChannelsSlot);
