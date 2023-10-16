import { openUrl } from "@ipc/dialogs";
import { useSceneStore } from "@stores/scene-store";
import discordLogo from "@image/assets/discord.png";
import youtubeLogo from "@image/assets/youtube.png";
import githubLogo from "@image/assets/github.png";
import { WrappedCanvas } from "@image/canvas/wrapped-canvas";
import { GlobalErrorState } from "../error-state";
import packageJSON from "../../../../package.json";
import { LoadBar, LoadRing } from "../pre-home-scene/load-bar";
import { useReplayAndMapStore } from "@stores/replay-and-map-store";
import { useProcessStore } from "@stores/process-store";
import { useEffect, useState } from "react";
import { useGameStore } from "@stores/game-store";
import { omitCharacters } from "@utils/chk-utils";
import { ValidatedReplay } from "../replay-scene-loader";
import { loadQueuedReplay } from "../../titan-reactor";
import { useSettingsStore } from "@stores/settings-store";

const iconStyle = {
    width: "var(--size-8)",
    height: "var(--size-8)",
    marginRight: "var(--size-4)",
    cursor: "pointer",
    filter: "grayscale(1)",
};

const Header = () => <div
    style={{
        display: "flex",
        justifyContent: "space-between",
    }}>
    <div
        style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            transform: "scale(0.7)",
        }}>
        <h1
            style={{
                fontFamily: "Conthrax",
                color: "rgb(143 201 154)",
                textShadow: "1px 2px 10px var(--green-7)",
                letterSpacing: "var(--font-letterspacing-6)",
                lineHeight: "var(--font-lineheight-6)",
                textTransform: "uppercase",
                fontSize: "var(--font-size-fluid-2)",
            }}>
            Titan Reactor
        </h1>
    </div>
    <div
        style={{
            display: "flex",
            justifyContent: "end",
            opacity: "0.2",
        }}>
        <img
            onClick={() =>
                openUrl(
                    "https://github.com/imbateam-gg/titan-reactor"
                )
            }
            src={githubLogo}
            style={{
                ...iconStyle,
                filter: "grayscale(1) invert(1)",
            }}
        />
        <img
            onClick={() => openUrl("http://youtube.imbateam.gg")}
            src={youtubeLogo}
            style={{
                ...iconStyle,
                filter: "grayscale(1) invert(1) brightness(1.2)",
            }}
        />
        <img
            style={{
                ...iconStyle,
                filter: "grayscale(1) contrast(2) invert(1) brightness(1.4)",
            }}
            onClick={() => openUrl("http://discord.imbateam.gg")}
            src={discordLogo}
        />
    </div>
</div>

const AppVersion = () => <div
    style={{
        position: "absolute",
        right: 0,
        bottom: 0,
        color: "var(--gray-4)",
    }}>
    <p>v{packageJSON.version}</p>
</div>

const SingleMatchDisplayLarge = () => {
    const { map, mapImage, replay } = useReplayAndMapStore();

    return <div
        style={{
            display: "flex",
            flexDirection: "column",
            userSelect: "none",
            color: "rgb(100 200 87)",
            fontFamily: "Conthrax",
            fontSize: "2rem",
            gap: "2rem",
            flexGrow: 1,
            gridTemplateColumns: "auto auto auto",
            paddingInline: "var(--size-10)",
            justifyContent: "center",
            alignItems: "center",
        }}>
        {mapImage && (
            <WrappedCanvas
                canvas={mapImage}
                style={{
                    maxWidth: "400px",
                    opacity: "0.8",
                }}
            />
        )}
        <p>{map?.title}</p>
        <div>
            {replay?.header.players.map((player) => (
                <p key={player.id}>{player.name}</p>
            ))}
        </div>
    </div>
}

const UpNextIcon = () =>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "64px", display: "inline-block" }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
    </svg>

const MAX_REPLAYS_SHOWN = 7;

const ReplayQueueList = () => {
    const { replayQueue, nextReplay: upnextReplay, replay } = useReplayAndMapStore();
    const rawIcons = useGameStore((state) => state.assets!.raceInsetIcons!);
    const [icons] = useState({
        protoss: URL.createObjectURL(rawIcons.protoss),
        terran: URL.createObjectURL(rawIcons.terran),
        zerg: URL.createObjectURL(rawIcons.zerg),
    });
    const progress = useProcessStore((state) => state.getTotalProgress());
    const isAutoplay = useSettingsStore(state => state.data.utilities.autoPlayReplayQueue);

    const idx  = replayQueue.findIndex((replay) => replay === upnextReplay);
    let sliceIndexStart = Math.max(0, idx - 2)

    // If we're too close to the end of the array, adjust the starting index to show 7 items.
    const remainingItems = replayQueue.length - idx;
    if (remainingItems < MAX_REPLAYS_SHOWN) {
        sliceIndexStart = Math.max(0, replayQueue.length - MAX_REPLAYS_SHOWN);
    }
 
    const setUpNextReplay = (replay: ValidatedReplay) => {
        useReplayAndMapStore.getState().queueUpNextReplay(replay);
    }

    useEffect(() => {
        window.addEventListener("keydown", (evt) => {
            if (evt.code === "Enter") {
                loadQueuedReplay();
            }
        });
    }, []);

    return <div
        style={{
            display: "flex",
            flexDirection: "column",
            userSelect: "none",
            color: "rgb(100 200 87)",
            fontSize: "2rem",
            gap: "2rem",
            gridTemplateColumns: "auto auto auto",
            paddingInline: "var(--size-10)",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(0,0,0,0.8)",
            borderRadius: "10px",
            padding: "4rem"
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
            <tbody>
            {replayQueue.slice(sliceIndexStart, sliceIndexStart + MAX_REPLAYS_SHOWN).map((replay) => {
                const isUpNext = replay === upnextReplay;
                const Matchup = () => <div style={{ display: "inline-block" }}>{replay.header.players[0].race[0].toUpperCase()}v{replay.header.players[1].race[0].toUpperCase()}</div>;
                const icon = isUpNext ? <><UpNextIcon /><Matchup /></> : <Matchup />;
                const color = isUpNext ? "black" : "white";
                const icon1 = replay.header.players[0].race === 'unknown' ? "" : `url(${icons[replay.header.players[0].race]})`;
                const icon2 = replay.header.players[1].race === 'unknown' ? "" : `url(${icons[replay.header.players[1].race]})`;
                const playerNameStyle = { fontWeight: "500", opacity: "0.9", borderTopLeftRadius: "10px", borderBottomLeftRadius: "10px" };
                const alignItems = {
                    display: "flex",
                    alignItems: "center"
                };
                const trBg = "linear-gradient(90deg, rgba(203,0,0,1) 0%, rgba(157,0,0,1) 23%, rgba(203,0,0,0.2861519607843137) 33%, rgba(155,17,48,0.01724439775910369) 41%, rgba(98,36,105,0) 49%, rgba(52,52,151,0) 61%, rgba(0,69,203,0.2861519607843137) 68%, rgba(0,24,203,1) 80%)"
                return <tr key={replay.uid} style={{background: isUpNext ? trBg : "transparent"}} onClick={() => {
                    setUpNextReplay(replay);
                }}>
                    <td ><div style={alignItems}>{icon}</div></td>
                    <td>
                        <div style={{ color,  ...playerNameStyle, ...alignItems }}>
                            {replay.header.players[0].name}<div style={{ width: "100px", height: "50px", background: icon1, display: "inline-block", marginLeft: "16px" }}></div>
                        </div>
                    </td>
                    <td style={{ paddingInline: "8rem" }}>{omitCharacters(replay.header.mapName)}</td>
                    <td>
                        <div style={{ color,  ...playerNameStyle, ...alignItems }}>
                            {replay.header.players[1].name}<div style={{ width: "100px", height: "50px", background: icon2, display: "inline-block", marginLeft: "16px"}}></div>
                        </div>
                    </td>
                </tr>
            })}
            </tbody>
        </table>
        {!!progress && !replay && !isAutoplay &&
            <div style={{color:"#666", cursor: "pointer"}} onClick={loadQueuedReplay}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:"24px"}}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            </div>}
    </div>
}

/**
 * React UI for Home Scene
 */
export const Home = ({ surface }: { surface: HTMLCanvasElement }) => {
    const error = useSceneStore((state) => state.error);
    const { map, mapImage, replay, replayQueue, nextReplay } = useReplayAndMapStore();

    const progress = useProcessStore((state) => state.getTotalProgress());

    const [isInterstitial, setIsInterstitial] = useState(!!(map || replay || nextReplay));

    useEffect(() => {
        setTimeout(() => {
            setIsInterstitial(true);
        }, 2000);
    }, []);

    if (mapImage) {
        mapImage.style.borderRadius = "10px";
    }
    return (
        <div
            style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}>
            {error && <GlobalErrorState error={error} action={null} />}

            <WrappedCanvas canvas={surface} style={{ zIndex: "-1" }} />
            <LoadBar
                color="#64c857"
                thickness={5}
                style={{ marginBottom: "var(--size-10)", visibility: progress ? "visible" : "hidden" }}
            />
            {!error && !!progress && isInterstitial && (
                <LoadRing />
            )}
            {!error && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "var(--size-4)",
                        marginTop: "var(--size-2)",
                        userSelect: "none",
                        flex: 1
                    }}>
                    {!isInterstitial && <Header />}
                    {!error && (replayQueue.length <= 1 && replay) && (
                        <SingleMatchDisplayLarge />
                    )}
                    {!error && replayQueue.length > 1 && (
                        <ReplayQueueList />
                    )}
                </div>
            )}
            <AppVersion />
        </div>
    );
};
