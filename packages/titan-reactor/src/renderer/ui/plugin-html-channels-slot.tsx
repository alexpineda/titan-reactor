import { memo, useEffect } from "react";
import { ScreenType, ScreenStatus, SlotConfig } from "../../common/types";
import * as pluginSystem from "../plugin-system";

const PluginsHTMLChannelsSlot = ({
  screenType,
  screenStatus,
  slotConfig,
}: {
  screenType: ScreenType;
  screenStatus: ScreenStatus;
  slotConfig: SlotConfig;
}) => {
  const htmlChannels = pluginSystem.getHTMLChannels();

  const channels = htmlChannels.filter(
    (channel) =>
      channel.config.screenType === screenType &&
      channel.config.screenStatus === screenStatus
  );

  useEffect(() => {
    for (const channel of channels) {
      channel.onConnected(screenType, screenStatus);
    }
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

export default memo(PluginsHTMLChannelsSlot);
