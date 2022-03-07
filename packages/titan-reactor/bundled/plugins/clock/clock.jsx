import React from "react";
import { registerComponent, useStore } from "titan-reactor";
import ModernClock from "./modern.jsx";

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
registerComponent({ channelId: "_channel_id_" }, ({ userConfig }) => {
  const time = useStore(_selector);

  if (userConfig.style.value === "modern") {
    return <ModernClock userConfig={userConfig} time={time} styles={styles} />;
  }

  return (
    <div
      style={{
        color: userConfig.textColor.value,
        fontWeight: "bold",
        fontSize: userConfig.fontSize.value,
        textAlign: "center",
        position: "relative",
        width: "var(--minimap-width)",
        pointerEvents: "auto",
        lineHeight: "1.2rem",
      }}
      onClick={() => alert("hi")}
    >
      <div
        style={{
          background: styles.bevelGray800Reverse,
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "50%",
          zIndex: -1,
        }}
      >
        &nbsp;
      </div>
      <div
        style={{
          background: styles.bevelGray800,
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: "50%",
          zIndex: -1,
        }}
      >
        &nbsp;
      </div>
      <p>{time}</p>
    </div>
  );
});
