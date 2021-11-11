import React from "react";
import { ReplayPlayer } from "../../common/types";
import { UIType } from "../stores";
import Initializing from "./home/initializing";

import { charColor } from "../../common/bwdat/enums";

const processString = (str: string, useColors = true) => {
  const defaultColor = "white";
  let currentColor = defaultColor;
  let currentChunk = "";
  const chunks = [];
  const el = (newLine: boolean, color: string, content: string, i: number) =>
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
const PlayerNames = ({ players }: { players: ReplayPlayer[] }) => (
  <ul>
    {players.map((player: ReplayPlayer, i: number) => (
      <li className="block text-gray-200" key={i}>
        {player.name} ({player.race})
      </li>
    ))}
  </ul>
);

const LoadingOverlay = ({ screen }: { screen: UIType }) => {
  let label = "",
    description = "";

  if (screen.type === "home") {
    return <Initializing />;
  } else if (screen.type === "map") {
    label = screen.title || "Loading Map";
    description = screen.description || screen.filename || "";
  } else if (screen.type === "replay") {
    label = screen.chkTitle || "Loading Replay";
    description = "";
  }

  return (
    <div
      id="load-overlay select-none"
      className="z-20 cursor-wait absolute left-0 top-0 right-0 bottom-0 justify-center items-center bg-gray-900 flex"
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
          <p
            id="map-name"
            style={{
              color: "white",
              fontSize: "32px",
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
            }}
          >
            {processString(description, false)}
          </p>
          {screen.type === "replay" && screen.header?.players && (
            <PlayerNames players={screen.header.players} />
          )}
        </span>
      </div>
    </div>
  );
};

export default LoadingOverlay;
