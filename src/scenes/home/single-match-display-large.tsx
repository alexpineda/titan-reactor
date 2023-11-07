import { WrappedCanvas } from "@image/canvas/wrapped-canvas";
import { useReplayAndMapStore } from "@stores/replay-and-map-store";

export const SingleMatchDisplayLarge = () => {
    const { map, mapImage, replay } = useReplayAndMapStore();

    if ( mapImage ) {
        mapImage.style.borderRadius = "10px";
    }
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
