import { registerComponent, useStore } from "titan-reactor";
import React from "react";

registerComponent({ channelId: "_channel_id_" }, () => {
  const world = useStore((store) => store.world);

  return (
    <h1
      key="_channel_id_"
      style={{
        color: "white",
      }}
    >
      <p>{world && world.map && world.map.title}</p>
      {world &&
        world.replay &&
        world.replay.header.players.map((player) => (
          <p key={player.id}>{player.name}</p>
        ))}
    </h1>
  );
});
