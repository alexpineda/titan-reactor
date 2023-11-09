import { omitCharacters } from "@utils/chk-utils";

import gameStore  from "@stores/game-store";
import { useReplayAndMapStore } from "@stores/replay-and-map-store";
import { useSceneStore } from "@stores/scene-store";
import { ReplayScene } from "scenes/replay-scene";

const MAX_REPLAYS_SHOWN = 8;

const UpNextIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        style={{ width: "64px", display: "inline-block" }}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"
        />
    </svg>
);

export const ReplayQueueList = () => {
    const { replayQueue, getNextReplay } = useReplayAndMapStore();
    const replayScene = useSceneStore( ( state ) => state.nextScene );
    
    const idx = replayQueue.findIndex( ( replay ) => replay === getNextReplay() );
    let sliceIndexStart = Math.max( 0, idx - 2 );

    // If we're too close to the end of the array, adjust the starting index to show 7 items.
    const remainingItems = replayQueue.length - idx;
    if ( remainingItems < MAX_REPLAYS_SHOWN ) {
        sliceIndexStart = Math.max( 0, replayQueue.length - MAX_REPLAYS_SHOWN );
    }

    const upNextReplay = replayScene?.id === "@replay" ? (replayScene as ReplayScene).replay : getNextReplay();

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                userSelect: "none",
                color: "rgb(100 200 87)",
                fontSize: "1.5rem",
                gap: "2rem",
                gridTemplateColumns: "auto auto auto",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "10px",
                padding: "var(--size-6) var(--size-4)",
            }}>
            <h1>Todays Matches</h1>
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Player 1</th>
                        <th>Map Name</th>
                        <th>Player 2</th>
                    </tr>
                </thead>
                <tbody style={{fontSize: "1.5rem"}}>
                    {replayQueue
                        .slice( sliceIndexStart, sliceIndexStart + MAX_REPLAYS_SHOWN )
                        .map( ( replay, i ) => {
                            const isUpNext = replay === upNextReplay;
                            const Matchup = () => (
                                <div style={{ display: "inline-block" }}>
                                    {replay.header.players[0].race[0].toUpperCase()}v
                                    {replay.header.players[1].race[0].toUpperCase()}
                                </div>
                            );
                            const icon = isUpNext ? (
                                <>
                                    <UpNextIcon />
                                    <Matchup />
                                </>
                            ) : (
                                <Matchup />
                            );
                            const color = isUpNext ? "black" : "white";
                            const icon1 =
                                replay.header.players[0].race === "unknown"
                                    ? ""
                                    : `url(${gameStore().assetServerUrl}/webui/dist/lib/images/avatar_neutral_${replay.header.players[0].race}.jpg)`;
                            const icon2 =
                                replay.header.players[1].race === "unknown"
                                    ? ""
                                    : `url(${gameStore().assetServerUrl}/webui/dist/lib/images/avatar_neutral_${replay.header.players[1].race}.jpg)`;
                            const playerNameStyle = {
                                fontWeight: "500",
                                opacity: "0.9",
                                borderTopLeftRadius: "10px",
                                borderBottomLeftRadius: "10px",
                            };
                            const alignItems = {
                                display: "flex",
                                alignItems: "center",
                            };
                            const trBgHighlight =
                                "linear-gradient(90deg, rgba(203,0,0,1) 0%, rgba(157,0,0,1) 23%, rgba(203,0,0,0.2861519607843137) 33%, rgba(155,17,48,0.01724439775910369) 41%, rgba(98,36,105,0) 49%, rgba(52,52,151,0) 61%, rgba(0,69,203,0.2861519607843137) 68%, rgba(0,24,203,1) 80%)";

                            const lastItemFade = i === MAX_REPLAYS_SHOWN - 1 && i + sliceIndexStart !== replayQueue.length - 1;

                            const trBg = lastItemFade ? "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)" : "rgba(0,0,0,0.8)";

                            return (
                                <tr
                                    key={replay.uid}
                                    style={{
                                        background: isUpNext ? trBgHighlight : trBg,
                                        opacity: lastItemFade ? 0.5 : 1,
                                    }}>
                                    <td>
                                        <div style={alignItems}>{icon}</div>
                                    </td>
                                    <td>
                                        <div
                                            style={{
                                                color,
                                                ...playerNameStyle,
                                                ...alignItems,
                                            }}>
                                            {replay.header.players[0].name}
                                            <div
                                                style={{
                                                    width: "100px",
                                                    height: "50px",
                                                    background: icon1,
                                                    display: "inline-block",
                                                    marginLeft: "16px",
                                                    backgroundSize: "contain",
                                                    backgroundRepeat: "no-repeat",
                                                }}></div>
                                        </div>
                                    </td>
                                    <td style={{ paddingInline: "8rem" }}>
                                        {omitCharacters( replay.header.mapName )}
                                    </td>
                                    <td>
                                        <div
                                            style={{
                                                color,
                                                ...playerNameStyle,
                                                ...alignItems,
                                            }}>
                                            {replay.header.players[1].name}
                                            <div
                                                style={{
                                                    width: "100px",
                                                    height: "50px",
                                                    background: icon2,
                                                    display: "inline-block",
                                                    marginLeft: "16px",
                                                    backgroundSize: "contain",
                                                    backgroundRepeat: "no-repeat",
                                                }}></div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        } )}
                </tbody>
            </table>
        </div>
    );
};
