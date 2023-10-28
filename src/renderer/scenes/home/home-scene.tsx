import { useSceneStore } from "@stores/scene-store";
import discordLogo from "@image/assets/discord.png";
import youtubeLogo from "@image/assets/youtube.png";
import githubLogo from "@image/assets/github.png";
import patreonLogo from "@image/assets/patreon.png";
import paypalLogo from "@image/assets/paypal.png";
import { WrappedCanvas } from "@image/canvas/wrapped-canvas";
import { GlobalErrorState } from "../error-state";
import packageJSON from "../../../../package.json";
import { LoadBar, LoadRing } from "../pre-home-scene/load-bar";
import { useReplayAndMapStore } from "@stores/replay-and-map-store";
import { useProcessStore } from "@stores/process-store";
import { SVGProps, useEffect, useRef, useState } from "react";
import gameStore, { useGameStore } from "@stores/game-store";
import { omitCharacters } from "@utils/chk-utils";
import { ValidatedReplay } from "../replay-scene-loader";
import { loadQueuedReplay } from "../../core/titan-reactor";
import { useSettingsStore } from "@stores/settings-store";
import { globalEvents } from "@core/global-events";

const iconStyle = {
    width: "var(--size-8)",
    height: "var(--size-8)",
    cursor: "pointer",
    filter: "grayscale(1)",
};

const buttonIconStyle = {
    width: "48px",
    color: "#ecedad66",
    cursor: "pointer",
};

const OpenFileButton = ( props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement> ) => {
    const inputRef = useRef<HTMLInputElement>( null );
    const append = useRef( true );

    return (
        <>
            <svg
                {...props}
                onClick={( evt ) => {
                    if ( inputRef.current ) {
                        append.current = !evt.shiftKey;
                        inputRef.current.click();
                    }
                }}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
                />
            </svg>

            <input
                ref={inputRef}
                type="file"
                id="theFile"
                style={{ position: "absolute", left: "-10000px" }}
                multiple
                accept=".rep,.scm,.scx"
                onChange={( evt ) => {
                    evt.preventDefault();
                    console.log( evt.target.files );
                    if ( evt.target.files ) {
                        console.log( "emitting queue-files", [ ...evt.target.files ] );
                        globalEvents.emit( "queue-files", {
                            files: [ ...evt.target.files ],
                            append: append.current,
                        } );
                    }
                }}
            />
        </>
    );
};

const ConfigButton = ( props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement> ) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
        {...props}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
    </svg>
);

const IconLink = ( {
    href,
    style = {},
    imageUrl,
}: {
    href: string;
    style: React.CSSProperties;
    imageUrl: string;
} ) => {
    const [ isHovered, setIsHovered ] = useState( false );
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            onMouseEnter={() => setIsHovered( true )}
            onMouseLeave={() => setIsHovered( false )}>
            <img
                src={imageUrl}
                style={{ ...iconStyle, ...style, opacity: isHovered ? "0.4" : "0.2" }}
            />
        </a>
    );
};

const Socials = () => (
    <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
        }}>
        <IconLink
            href="https://github.com/alexpineda/titan-reactor"
            imageUrl={githubLogo}
            style={{ filter: "grayscale(1) invert(1)" }}
        />
        <IconLink
            href="https://www.youtube.com/channel/UCj7TSQvBRYebRDIL0FW1MBQ"
            imageUrl={youtubeLogo}
            style={{ filter: "grayscale(1) invert(1) brightness(1.2)" }}
        />
        <IconLink
            href="https://discord.gg/MKb8E2DFMa"
            imageUrl={discordLogo}
            style={{ filter: "grayscale(1) contrast(2) invert(1) brightness(1.4)" }}
        />
        <IconLink
            href="https://patreon.com/imbateam"
            imageUrl={patreonLogo}
            style={{}}
        />
        <IconLink
            href="https://paypal.me/alexpineda86?country.x=CA&locale.x=en_US"
            imageUrl={paypalLogo}
            style={{ filter: "grayscale(1) contrast(2) invert(1) brightness(1.4)" }}
        />
    </div>
);

const SocialsAndAppVersion = () => (
    <div
        style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            color: "var(--gray-4)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            padding: "8px",
            alignItems: "center",
            width: "var(--size-14)",
        }}>
        <Socials />
        <p>Titan Reactor v{packageJSON.version}</p>
    </div>
);

const SingleMatchDisplayLarge = () => {
    const { map, mapImage, replay } = useReplayAndMapStore();

    return (
        <div
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
                {replay?.header.players.map( ( player ) => (
                    <p key={player.id}>{player.name}</p>
                ) )}
            </div>
        </div>
    );
};

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

const MAX_REPLAYS_SHOWN = 7;

const ReplayQueueList = () => {
    const { replayQueue, nextReplay: upnextReplay, replay } = useReplayAndMapStore();
    const rawIcons = useGameStore( ( state ) => state.assets!.raceInsetIcons! );
    const [ icons ] = useState( {
        protoss: URL.createObjectURL( rawIcons.protoss ),
        terran: URL.createObjectURL( rawIcons.terran ),
        zerg: URL.createObjectURL( rawIcons.zerg ),
    } );
    const progress = useProcessStore( ( state ) => state.getTotalProgress() );
    const isAutoplay = useSettingsStore(
        ( state ) => state.data.utilities.autoPlayReplayQueue
    );

    const idx = replayQueue.findIndex( ( replay ) => replay === upnextReplay );
    let sliceIndexStart = Math.max( 0, idx - 2 );

    // If we're too close to the end of the array, adjust the starting index to show 7 items.
    const remainingItems = replayQueue.length - idx;
    if ( remainingItems < MAX_REPLAYS_SHOWN ) {
        sliceIndexStart = Math.max( 0, replayQueue.length - MAX_REPLAYS_SHOWN );
    }

    const setUpNextReplay = ( replay: ValidatedReplay ) => {
        useReplayAndMapStore.getState().queueUpNextReplay( replay );
    };

    useEffect( () => {
        window.addEventListener( "keydown", ( evt ) => {
            if ( evt.code === "Enter" ) {
                loadQueuedReplay();
            }
        } );
    }, [] );

    return (
        <div
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
                padding: "4rem",
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
                    {replayQueue
                        .slice( sliceIndexStart, sliceIndexStart + MAX_REPLAYS_SHOWN )
                        .map( ( replay ) => {
                            const isUpNext = replay === upnextReplay;
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
                                    : `url(${icons[replay.header.players[0].race]})`;
                            const icon2 =
                                replay.header.players[1].race === "unknown"
                                    ? ""
                                    : `url(${icons[replay.header.players[1].race]})`;
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
                            const trBg =
                                "linear-gradient(90deg, rgba(203,0,0,1) 0%, rgba(157,0,0,1) 23%, rgba(203,0,0,0.2861519607843137) 33%, rgba(155,17,48,0.01724439775910369) 41%, rgba(98,36,105,0) 49%, rgba(52,52,151,0) 61%, rgba(0,69,203,0.2861519607843137) 68%, rgba(0,24,203,1) 80%)";
                            return (
                                <tr
                                    key={replay.uid}
                                    style={{
                                        background: isUpNext ? trBg : "transparent",
                                    }}
                                    onClick={() => {
                                        setUpNextReplay( replay );
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
                                                }}></div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        } )}
                </tbody>
            </table>
            {!!progress && !replay && !isAutoplay && (
                <div
                    style={{ color: "#666", cursor: "pointer" }}
                    onClick={loadQueuedReplay}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        style={{ width: "24px" }}>
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
            )}
        </div>
    );
};

/**
 * React UI for Home Scene
 */
export const Home = ( { surface }: { surface: HTMLCanvasElement } ) => {
    const error = useSceneStore( ( state ) => state.error );
    const { map, mapImage, replay, replayQueue, nextReplay } = useReplayAndMapStore();

    const progress = useProcessStore( ( state ) => state.getTotalProgress() );

    const [ isInterstitial, setIsInterstitial ] = useState(
        !!( map || replay || nextReplay )
    );

    useEffect( () => {
        setTimeout( () => {
            setIsInterstitial( true );
        }, 10000 );
    }, [] );

    if ( mapImage ) {
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
                style={{
                    marginBottom: "var(--size-10)",
                    visibility: progress ? "visible" : "hidden",
                }}
            />
            {!error && !!progress && isInterstitial && ( replay || map ) && <LoadRing />}
            {!error && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "var(--size-4)",
                        marginTop: "var(--size-2)",
                        userSelect: "none",
                        flex: 1,
                    }}>
                    {!error && replayQueue.length <= 1 && replay && (
                        <SingleMatchDisplayLarge />
                    )}
                    {!error && replayQueue.length > 1 && <ReplayQueueList />}
                </div>
            )}
            <div
                style={{
                    margin: "24px",
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    display: "flex",
                    gap: "24px",
                }}>
                <ConfigButton
                    style={buttonIconStyle}
                    onClick={() => gameStore().openConfigurationWindow()}
                />
                <OpenFileButton style={buttonIconStyle} />
            </div>

            <SocialsAndAppVersion />
        </div>
    );
};
