import { memo, MutableRefObject, useEffect, useRef } from "react";
import {
  ScreenType,
  ScreenStatus,
  LayoutRect,
  LayoutValue,
  SlotConfig,
  GameCanvasDimensions,
} from "../../common/types";
import PluginWebComponentChannel from "renderer/plugin-system/channel/web-component-channel";
import { useGameStore } from "@stores";

const pluginLayoutRectProp = [
  "left",
  "top",
  "right",
  "bottom",
  "width",
  "height",
];

const PluginHTMLChannelSlot = ({
  screenType,
  screenStatus,
  channel,
  slotConfig,
}: {
  screenType: ScreenType;
  screenStatus: ScreenStatus;
  channel: PluginWebComponentChannel;
  slotConfig: SlotConfig;
}) => {
  const channelRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
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

  const setStyle = (
    domElement: HTMLElement,
    channel: PluginWebComponentChannel
  ) => {
    domElement.style.position = "absolute";
    domElement.style.border = "none";
    domElement.style.zIndex = "10";

    for (const prop of pluginLayoutRectProp) {
      const size = channel.config[
        `layout.${prop}` as keyof LayoutRect
      ] as LayoutValue;
      domElement.style.setProperty(prop, pluginValueToCss(size));
    }
  };

  useEffect(() => {
    if (!channelRef.current || !channel.domElement) return;

    if (!channel.domElement.parentElement) {
      setStyle(channelRef.current, channel);
      channelRef.current.appendChild(channel.domElement);
    } else if (channel.domElement.parentElement !== channelRef.current) {
      setStyle(channelRef.current, channel);
      channelRef.current.appendChild(channel.domElement);
    } else {
      channel.onConnected(screenType, screenStatus);
    }

    return () => {
      channel.domElement?.remove();
      channel.onDisconnected();
    };
  }, [screenType, screenStatus]);

  return <div className="nogo" ref={channelRef}></div>;
};

export default memo(PluginHTMLChannelSlot);
