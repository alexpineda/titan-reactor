import React from "react";

export const LoadingOverlay = ({
  label = "",
  description = "",
  mapPreview = null,
  header = null,
}) => {
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
          {mapPreview}
          <p
            id="map-name"
            style={{
              color: "white",
              fontSize: "32px",
              // fontFamily: '"Blizzard Regular", Arial, Helvetica, sans-serif',
            }}
          >
            {label}
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
            {description}
          </p>
          {header && (
            <ul>
              {header.players.map((player) => {
                return (
                  <li className="block text-gray-200" key={player.name}>
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
