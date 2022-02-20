import React, { memo } from "react";
import { ScreenType, ScreenStatus } from "../../common/types";
import IFrameChannelContainer from "./iframe-channel-container";
import * as pluginSystem from "../plugin-system";
import { useGameStore } from "../stores";

const IFrameChannelsLayout = ({
  screenType,
  screenStatus,
}: {
  screenType: ScreenType;
  screenStatus: ScreenStatus;
}) => {
  const channels = pluginSystem
    .getIFrameChannels()
    .filter(
      (channel) =>
        channel.config.screenType === screenType &&
        channel.config.screenStatus === screenStatus
    );

  const dimensions = useGameStore((state) => state.dimensions);

  return (
    <>
      {channels.map((channel) => {
        return (
          <IFrameChannelContainer
            channel={channel}
            dimensions={dimensions}
            key={channel.id}
          />
        );
      })}
    </>
  );
};

export default memo(IFrameChannelsLayout);
