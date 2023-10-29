import { useSceneStore } from "@stores/scene-store";

import { WrappedCanvas } from "@image/canvas/wrapped-canvas";
import { GlobalErrorState } from "../error-state";
import packageJSON from "../../../../package.json";
import { LoadBar, LoadRing } from "../pre-home-scene/load-bar";
import { useReplayAndMapStore } from "@stores/replay-and-map-store";
import { useProcessStore } from "@stores/process-store";
import gameStore from "@stores/game-store";

import { OpenFileButton } from "./open-file-button";
import { Socials } from "./socials";
import { ConfigButton } from "./config-button";

import { MatchDisplay } from "./match-display";

/**
 * React UI for Home Scene
 */
export const Home = ( { surface }: { surface: HTMLCanvasElement } ) => {
    const error = useSceneStore( ( state ) => state.error );
    const { map, replay } = useReplayAndMapStore();

    const progress = useProcessStore( ( state ) => state.getTotalProgress() );

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
            {!error && !!progress && ( replay || map ) && <LoadRing />}
            {!error && <MatchDisplay />}
            <div
                style={{
                    margin: "24px",
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    display: "flex",
                    gap: "24px",
                }}>
                <ConfigButton onClick={() => gameStore().openConfigurationWindow()} />
                <OpenFileButton />
            </div>

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
        </div>
    );
};
