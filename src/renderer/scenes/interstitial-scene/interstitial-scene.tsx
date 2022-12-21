import { useSceneStore } from "@stores/scene-store";
import { useReplayAndMapStore } from "@stores/replay-and-map-store";
import { WrappedCanvas } from "@image/canvas/wrapped-canvas";
import { LoadBar } from "../pre-home-scene/load-bar";
import { GlobalErrorState } from "../error-state";

export const InterstitialScene = ( { surface }: { surface: HTMLCanvasElement } ) => {
    const error = useSceneStore( ( state ) => state.error );
    const { map, mapImage, replay } = useReplayAndMapStore();

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
                style={{ marginBottom: "var(--size-10)" }}
            />
            {!error && (
                <div
                    className="lds-dual-ring"
                    style={{
                        position: "absolute",
                        top: "0",
                        right: "0",
                    }}
                />
            )}
            {!error && (
                <div
                    style={{
                        display: "grid",
                        userSelect: "none",
                        color: "rgb(100 200 87)",
                        fontFamily: "Conthrax",
                        alignItems: "center",
                        gridTemplateColumns: "auto auto auto",
                        paddingInline: "var(--size-10)",
                    }}>
                    {mapImage && (
                        <WrappedCanvas
                            canvas={mapImage}
                            style={{
                                filter: "sepia(1)",
                                maxWidth: "150px",
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
    );
};
