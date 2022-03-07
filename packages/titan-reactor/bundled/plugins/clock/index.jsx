import React from "react";
import { registerComponent, useStore } from "titan-reactor";
import ModernClock from "./modern-clock.jsx";
import ClassicClock from "./classic-clock.jsx";

const styles = {
  textGray400: "rgb(148 163 184)",
  timeLabel: "white",
  bevelGray800Reverse:
    "linear-gradient(135deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 50%, #2d3748 50%, #2d3748 100%)",
  bevelGray800:
    "linear-gradient(45deg, #2d3748 0%, #2d3748 50%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 100%)",
  bgGray700: "#4a5568",
  bevelGray700:
    "linear-gradient(45deg, #4a5568 0%, #4a5568 50%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 100%)",
};

const _selector = (store) => store.frame.time;
registerComponent(
  { pluginId: "_plugin_id_", screen: "@replay/ready", snap: "left" },
  ({ config }) => {
    const time = useStore(_selector);

    return config.style.value === "modern" ? (
      <ModernClock config={config} time={time} styles={styles} />
    ) : (
      <ClassicClock config={config} time={time} styles={styles} />
    );
  }
);
