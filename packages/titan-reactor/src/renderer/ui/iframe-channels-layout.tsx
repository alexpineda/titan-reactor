import React, { memo, useEffect, useState } from "react";
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

  return (
    <>
      {channels.map((channel) => {
        return (
          <IFrameChannelContainer
            channel={channel}
            dimensions={dimensions}
            visible={readyCount === channels.length}
            key={channel.id}
          />
        );
      })}
    </>
  );
};

export default memo(IFrameChannelsLayout);
