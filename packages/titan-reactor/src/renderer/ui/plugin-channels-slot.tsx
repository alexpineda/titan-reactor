import { memo, MutableRefObject, useEffect, useRef, useState } from "react";
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
import screenStore from "../stores/screen-store";
import { isIFrameChannel } from "common/utils/plugins";

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
    .getUIChannels()
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
  if (
    latestUpdatedChannel &&
    isIFrameChannel(latestUpdatedChannel) &&
    latestUpdateSize
  ) {
    if (
      latestUpdateSize.width &&
      (!latestUpdatedChannel.config["layout.width"] ||
        latestUpdatedChannel.config["layout.width"] === "content")
    ) {
      latestUpdatedChannel.domElement.style.width = pluginValueToCss(
        latestUpdateSize.width
      );
    }
    if (
      latestUpdateSize.height &&
      (!latestUpdatedChannel.config["layout.height"] ||
        latestUpdatedChannel.config["layout.height"] === "content")
    ) {
      latestUpdatedChannel.domElement.style.height = pluginValueToCss(
        latestUpdateSize.height
      );
    }
  }

  const setStyle = (domElement: HTMLElement, config: LayoutRect) => {
    domElement.style.position = "absolute";
    domElement.style.border = "none";
    domElement.style.zIndex = "10";

    for (const prop of pluginLayoutRectProp) {
      const size = config[`layout.${prop}` as keyof LayoutRect] as LayoutValue;
      domElement.style.setProperty(prop, pluginValueToCss(size));
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
      chunk.appendChild(channel.domElement);
      if (!channel.domElement.parentElement) {
        setStyle(channel.domElement, channel.config);
        chunk.appendChild(channel.domElement);
        channel.domElement.onload = () => {
          channel.onConnected(screen.type, screen.status);
        };
      } else if (channel.domElement.parentElement !== slotRef.current) {
        setStyle(channel.domElement, channel.config);
        chunk.appendChild(channel.domElement);
        channel.domElement.onload = () => {
          channel.onConnected(screen.type, screen.status);
        };
      } else {
        channel.onConnected(screen.type, screen.status);
      }
    }
    slotRef.current.appendChild(chunk);

    return () => {
      for (const channel of channels) {
        if (channel.domElement.parentElement) {
          channel.domElement.remove();
        }
        channel.domElement.onload = null;
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
