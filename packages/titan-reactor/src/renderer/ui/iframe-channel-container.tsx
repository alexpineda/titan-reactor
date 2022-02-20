import React, { memo, MutableRefObject, useEffect, useRef } from "react";
import { GameCanvasDimensions } from "../../common/types";
import PluginIFrameChannel from "../plugin-system/channel/iframe-channel";
import { useGameStore } from "../stores";
import screenStore from "../stores/screen-store";

const keepAliveEl = document.createElement("div");
const px = (n: number | string) => (typeof n === "number" ? n + "px" : n);

const dims = ["left", "top", "right", "bottom", "width", "height"];

const IFrameChannelContainer = ({
  channel,
  dimensions,
  visible,
}: {
  channel: PluginIFrameChannel;
  dimensions: GameCanvasDimensions;
  visible: boolean;
}) => {
  const latestUpdateSize = useGameStore(
    (state) => state.latestPluginContentSize
  );
  const divRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

  const formatSize = (size?: string | number) => {
    if (typeof size === "number") {
      return `${size}px`;
    } else if (typeof size === "string") {
      if (size in dimensions) {
        return `${dimensions[size as keyof GameCanvasDimensions]}px`;
      }
      return size; // custom css value
    }
    return "auto"; // not set in config
  };

  if (latestUpdateSize && channel.id === latestUpdateSize.channelId) {
    if (
      latestUpdateSize.width &&
      (!channel.config["layout.width"] ||
        channel.config["layout.width"] === "content")
    ) {
      channel.iframe.style.width = formatSize(latestUpdateSize.width);
    }
    if (
      latestUpdateSize.height &&
      (!channel.config["layout.height"] ||
        channel.config["layout.height"] === "content")
    ) {
      channel.iframe.style.height = formatSize(latestUpdateSize.height);
    }
  }

  const setStyle = (iframe: HTMLIFrameElement) => {
    iframe.style.position = "absolute";
    iframe.style.border = "none";
    iframe.style.zIndex = "10";

    for (const dim of dims) {
      const size = channel.config[
        `layout.${dim}` as keyof typeof channel.config
      ] as string | number | undefined;
      iframe.style.setProperty(dim, formatSize(size));
    }
  };

  useEffect(() => {
    if (!divRef.current) return;

    const screen = screenStore();
    if (!channel.iframe.parentElement) {
      setStyle(channel.iframe);

      divRef.current.appendChild(channel.iframe);
      channel.iframe.onload = () => {
        channel.onConnected(screen.type, screen.status);
      };
    } else if (channel.iframe.parentElement !== divRef.current) {
      setStyle(channel.iframe);
      divRef.current.appendChild(channel.iframe);
      channel.iframe.onload = () => {
        channel.onConnected(screen.type, screen.status);
      };
    } else {
      channel.onConnected(screen.type, screen.status);
    }

    return () => {
      if (channel.iframe.parentElement) {
        channel.iframe.remove();
      }
      channel.iframe.onload = null;
      channel.onDisconnected();
    };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        pointerEvents: "none",
        userSelect: "none",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        visibility: visible ? "visible" : "hidden",
      }}
      ref={divRef}
    ></div>
  );
};

export default memo(IFrameChannelContainer);
