import React from "react";
export default ({ time, styles, config }) => {
  return (
    <div
      style={{
        color: config.textColor.value,
        fontWeight: "bold",
        fontSize: config.fontSize.value,
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
};
