import { useSceneStore } from "@stores/scene-store";
import "./home.css";
import { useWorldStore } from "@stores/world-store";
import { WrappedCanvas } from "../iscriptah/components/wrapped-canvas";
import { LoadBar } from "./load-bar";

export const SceneLoading = ({ surface }: { surface: HTMLCanvasElement }) => {
  const error = useSceneStore((state) => state.error);
  const { map, mapImage, replay } = useWorldStore();

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
      }}
    >
      <WrappedCanvas canvas={surface} style={{ zIndex: "-1" }} />
      <LoadBar
        color="rgb(100 200 87)"
        thickness={5}
        style={{ marginBottom: "var(--size-10)" }}
      />
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
          }}
        >
          {mapImage && (
            <WrappedCanvas
              canvas={mapImage}
              style={{ filter: "sepia(1)", maxWidth: "150px", opacity: "0.8" }}
            />
          )}
          <p>{map?.title}</p>
          <div>
            {replay?.header.players.map((player) => (
              <p key={player.id}>{player.name}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
