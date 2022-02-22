import React, { memo, useEffect } from "react";
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
import PluginHTMLChannel from "../plugin-system/channel/html-channel";
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
  const channels = pluginSystem
    .getHTMLChannels()
    .filter(
      (channel) =>
        channel.config.screenType === screenType &&
        channel.config.screenStatus === screenStatus
    );

  const dimensions = useGameStore((state) => state.dimensions);

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

  useEffect(() => {
    for (const prop of pluginLayoutRectProp) {
      const size = slotConfig[
        `layout.${prop}` as keyof LayoutRect
      ] as LayoutValue;
      //   slotRef.current.style.setProperty(prop, pluginValueToCss(size));
    }

    const screen = screenStore();

    return () => {
      for (const channel of channels) {
        channel.onDisconnected();
      }
    };
  }, [screenType, screenStatus]);

  return (
    <div
      style={{
        position: "absolute",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: "10",
        left: "0",
        top: "0",
        right: "0",
        bottom: "0",
      }}
    >
      {channels.map((channel) => channel.Component)}
    </div>
  );
};

export default memo(PluginsChannelsSlot);
