import { useSceneStore } from "@stores/scene-store";

import { WrappedCanvas } from "@image/canvas/wrapped-canvas";
import { GlobalErrorState } from "./error-state";
import { LoadBar, LoadRing } from "./pre-home-scene/load-bar";
import { useReplayAndMapStore } from "@stores/replay-and-map-store";
import { useProcessStore } from "@stores/process-store";
import { root } from "@render/root";

export const App = ( { surface, scene }: { surface?: HTMLCanvasElement, scene: React.ReactNode } ) => {
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

            {surface && <WrappedCanvas canvas={surface} style={{ zIndex: "-1" }} />}
            <LoadBar
                color="#64c857"
                thickness={5}
                style={{
                    marginBottom: "var(--size-10)",
                    visibility: progress ? "visible" : "hidden",
                }}
            />
            {!error && !!progress && ( replay || map ) && <LoadRing />}
            {scene}
        </div>
    );
};

export const renderAppUI = ( scene: React.ReactNode, surface?: HTMLCanvasElement  ) => {
    root.render( <App scene={scene} surface={surface} /> );
};