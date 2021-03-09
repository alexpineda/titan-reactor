import React from "react";
import charColor from "titan-reactor-shared/types/charColor";

const processString = (str, useColors = true) => {
  const defaultColor = "white";
  let currentColor = defaultColor;
  let currentChunk = "";
  const chunks = [];
  const el = (newLine, color, content, i) =>
    newLine ? (
      <div style={{ color }} key={i}>
        {content}
      </div>
    ) : (
      <span style={{ color }} key={i}>
        {content}
      </span>
    );

  for (let i = 0; i <= str.length; i++) {
    const charCode = str.charCodeAt(i);
    const char = str[i];
    const nextColor = charColor.get(charCode);
    const newLine = charCode === 13;
    if (nextColor || newLine || i === str.length) {
      // first character won't have current chunk
      if (currentChunk) {
        chunks.push(el(newLine, currentColor, currentChunk, i));
        currentChunk = "";
        currentColor = useColors ? nextColor || defaultColor : defaultColor;
      }
    } else {
      currentChunk += char;
    }
  }

  return <>{chunks}</>;
};
export const LoadingOverlay = ({ chk, rep }) => {
  let label, description;
  if (chk.loading) {
    label = chk.title || "Loading Map";
    description = chk.description || chk.filename;
  } else if (rep.loading) {
    label = chk.title || "Loading Replay";
    description = "";
  }

  return (
    <div
      id="load-overlay"
      style={{
        position: "absolute",
        left: "0",
        top: "0",
        right: "0",
        bottom: "0",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(0,0,0,0.9)",
        display: "flex",
      }}
    >
      <div id="map-preview">
        <span
          className="graphic"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            filter: "brightness(2) contract(1.2)",
          }}
        >
          {/* {mapPreview} */}
          <p
            id="map-name"
            style={{
              color: "white",
              fontSize: "32px",
              // fontFamily: '"Blizzard Regular", Arial, Helvetica, sans-serif',
            }}
          >
            {processString(label, false)}
          </p>
          <p
            id="map-description"
            style={{
              color: "white",
              fontSize: "12px",
              width: "100%",
              textAlign: "center",
              // fontFamily: '"Blizzard Regular", Arial, Helvetica, sans-serif',
            }}
          >
            {processString(description, false)}
          </p>
          {rep.header && (
            <ul>
              {rep.header.players.map((player, i) => {
                return (
                  <li className="block text-gray-200" key={i}>
                    {player.name} ({player.race})
                  </li>
                );
              })}
            </ul>
          )}
        </span>
      </div>
    </div>
  );
};
