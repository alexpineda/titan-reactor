import { openUrl } from "@ipc/dialogs";
import { useSceneStore } from "@stores/scene-store";
import discordLogo from "@image/assets/discord.png";
import youtubeLogo from "@image/assets/youtube.png";
import githubLogo from "@image/assets/github.png";
import { WrappedCanvas } from "@image/canvas/wrapped-canvas";
import { GlobalErrorState } from "../error-state";
import packageJSON from "../../../../package.json";
import { LoadBar } from "../pre-home-scene/load-bar";
import { useReplayAndMapStore } from "@stores/replay-and-map-store";
import { useProcessStore } from "@stores/process-store";

const iconStyle = {
    width: "var(--size-8)",
    height: "var(--size-8)",
    marginRight: "var(--size-4)",
    cursor: "pointer",
    filter: "grayscale(1)",
};

/**
 * React UI for Home Scene
 */
export const Home = ( { surface }: { surface: HTMLCanvasElement } ) => {
    const error = useSceneStore( ( state ) => state.error );
    const { map, mapImage, replay } = useReplayAndMapStore();

    const progress = useProcessStore( ( state ) => state.getTotalProgress());

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
            {progress && <LoadBar
                color="#64c857"
                thickness={5}
                style={{ marginBottom: "var(--size-10)" }}
            />}
            {!error && progress && (
                <div
                    className="lds-dual-ring"
                    style={{
                        position: "absolute",
                        bottom: "0",
                        right: "0",
                    }}
                />
            )}
            {!error && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "var(--size-6)",
                        marginTop: "var(--size-4)",
                        userSelect: "none",
                        flex: 1
                    }}>
                    <div
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
                                onClick={() => openUrl( "http://youtube.imbateam.gg" )}
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
                                onClick={() => openUrl( "http://discord.imbateam.gg" )}
                                src={discordLogo}
                            />
                        </div>
                    </div>
                    {!error && (
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
                    )}
                </div>
            )}
            <div
                style={{
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    color: "var(--gray-4)",
                }}>
                <p>v{packageJSON.version}</p>
            </div>
        </div>
    );
};
