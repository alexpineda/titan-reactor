import { useSceneStore } from "@stores/scene-store";

import { WrappedCanvas } from "@image/canvas/wrapped-canvas";
import { GlobalErrorState } from "./error-state";
import { LoadBar, LoadRing } from "./pre-home-scene/load-bar";
import { useReplayAndMapStore } from "@stores/replay-and-map-store";
import { useProcessStore } from "@stores/process-store";
import { root } from "@render/root";

export const App = ( { surface, scene, showCursor }: { surface?: HTMLCanvasElement, scene: React.ReactNode, showCursor?: boolean } ) => {
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
                cursor: showCursor ? "default" : "none",
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

type SceneRenderOptions = {
    surface?: HTMLCanvasElement;
    key: string;
    scene: React.ReactNode;
    showCursor?: boolean;
}
export const renderAppUI = ( { surface, key, scene, showCursor }: SceneRenderOptions   ) => {
    root.render( <App scene={scene} surface={surface} key={key} showCursor={showCursor ?? true} /> );
};