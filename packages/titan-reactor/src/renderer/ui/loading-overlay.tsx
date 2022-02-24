import { ReplayPlayer } from "../../common/types";
import { isMapLoadingInformation, ScreenStore } from "../stores";
import { ScreenType } from "../../common/types";
import { processString } from "@utils/map-string-utils";

const PlayerNames = ({ players }: { players: ReplayPlayer[] }) => (
  <ul>
    {players.map((player: ReplayPlayer, i: number) => (
      <li
        style={{
          display: "block",
          color: "gray",
        }}
        key={i}
      >
        {player.name} ({player.race})
      </li>
    ))}
  </ul>
);

const LoadingOverlay = ({ screen }: { screen: ScreenStore }) => {
  let label = "Loading",
    description = "";

  if (
    screen.type === ScreenType.Map &&
    isMapLoadingInformation(screen?.loadingInfo)
  ) {
    label = screen.loadingInfo.title;
    description = screen.loadingInfo.description;
  } else if (
    screen.type === ScreenType.Replay &&
    screen.loadingInfo &&
    !isMapLoadingInformation(screen?.loadingInfo)
  ) {
    label = screen.loadingInfo.chkTitle;
  }

  return (
    <div
      style={{
        zIndex: "20",
        cursor: "wait",
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
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
            filter: "brightness(2) contrast(1.2)",
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: "32px",
            }}
          >
            {processString(label, false)}
          </div>
          <div
            style={{
              color: "white",
              fontSize: "12px",
              width: "100%",
              textAlign: "center",
            }}
          >
            {processString(description, false)}
          </div>
          {screen.type === ScreenType.Replay &&
            screen.loadingInfo &&
            !isMapLoadingInformation(screen.loadingInfo) && (
              <PlayerNames players={screen.loadingInfo.header.players} />
            )}
        </span>
      </div>
    </div>
  );
};

export default LoadingOverlay;
