import { useSceneStore } from "@stores/scene-store";

import { WrappedCanvas } from "@image/canvas/wrapped-canvas";
import { GlobalErrorState } from "./error-state";
import { LoadBar, LoadRing } from "./pre-home-scene/load-bar";
import { useProcessStore } from "@stores/process-store";
import { root } from "@render/root";
import { useEffect, useRef } from "react";

export const App = ({
    surface,
    scene,
    hideCursor,
}: {
    surface?: HTMLCanvasElement;
    scene: React.ReactNode;
    hideCursor?: boolean;
}) => {
    const error = useSceneStore((state) => state.error);
    const isLoading = useSceneStore((state) => state.status === "loading");
    const isPreHomeScene = useSceneStore((state) => state.nextScene?.id === "@loading");

    const itemsRef = useRef<HTMLPreElement>(null);

    useEffect(() => {
        return useProcessStore.subscribe((state) => {
            if (itemsRef.current) {
                const items = state.inProgress()
                    .map(
                        (process) =>
                            process.label +
                            " " +
                            Math.floor((process.current / process.max) * 100) +
                            "%"
                    )
                    .join("\n");
                itemsRef.current!.innerText = items;
            }
        });
    }, []);

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
                cursor: hideCursor ? "none" : "default",
            }}>
            {error && <GlobalErrorState error={error} action={null} />}

            {surface && <WrappedCanvas canvas={surface} style={{ zIndex: "-1" }} />}
            <LoadBar
                color="#64c857"
                thickness={10}
                style={{
                    marginBottom: "var(--size-10)",
                    visibility: isLoading ? "visible" : "hidden",
                }}
            />
            <div></div>
            {!error && isLoading && !isPreHomeScene &&(
                <>
                    <LoadRing />
                    <pre
                        style={{
                            color: "white",
                            position: "absolute",
                            bottom: "0",
                            right: "0",
                        }}
                        ref={itemsRef}></pre>
                </>
            )}
            {scene}
        </div>
    );
};

type SceneRenderOptions = {
    surface?: HTMLCanvasElement;
    key: string;
    scene: React.ReactNode;
    hideCursor?: boolean;
};
export const renderAppUI = ({
    surface,
    key,
    scene,
    hideCursor,
}: SceneRenderOptions) => {
    root.render(
        <App
            scene={scene}
            surface={surface}
            key={key}
            hideCursor={hideCursor ?? false}
        />
    );
};
