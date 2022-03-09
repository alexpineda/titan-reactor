import { registerComponent, useStore } from "titan-reactor";
import React, { useState, useEffect } from "react";

const LoadingScreen = () => {
  const world = useStore((store) => store.world);

  return (
    <h1
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
};

registerComponent(
  { pluginId: "_plugin_id_", screen: "@replay/loading", snap: "center" },
  LoadingScreen
);

registerComponent(
  { pluginId: "_plugin_id_", screen: "@map/loading", snap: "center" },
  LoadingScreen
);

registerComponent({ pluginId: "_plugin_id_", screen: "@home/ready" }, () => {
  const [[logoOpacity, logoScale], setLogoVals] = useState([0.1, 3]);

  useEffect(() => {
    setLogoVals([1, 1]);
  }, []);

  console.log("loader", logoOpacity, logoScale);

  return (
    <div
      style={{
        position: "absolute",
        zIndex: "-999",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) scale(${logoScale})`,
        opacity: `${logoOpacity}`,
        transition: "all ease-in 10s",
        color: "#ffeedd",
        fontSize: "130%",
      }}
    >
      <h1 style={{ fontFamily: "Conthrax", fontSize: "4rem" }}>
        Titan Reactor
      </h1>
      <p style={{ marginTop: "2rem", opacity: "0.9", textAlign: "center" }}>
        Menu: ALT, Fullscreen: F11, Plugins: F12
      </p>
    </div>
  );
});
