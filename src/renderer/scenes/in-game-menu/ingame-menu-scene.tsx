import { root } from "@render/root";
import gameStore from "@stores/game-store";
import { useReplayAndMapStore } from "@stores/replay-and-map-store";
import sceneStore from "@stores/scene-store";
import { homeSceneLoader } from "../home/home-scene-loader";
import { InGameMenuButton } from "./ingame-menu-button";


export const InGameMenuScene = () => {
    const queued = useReplayAndMapStore( ( store ) => store.getNextReplay() );
    return (
        <div
            id="in-game-menu"
            onClick={() => root.render( null )}
            style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                userSelect: "none",
            }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {queued && (
                    <InGameMenuButton
                        background="var(--green-5)"
                        color="white"
                        onClick={() =>
                            useReplayAndMapStore.getState().loadNextReplay()
                        }>
                        Play Next
                    </InGameMenuButton>
                )}
                <InGameMenuButton
                    background="var(--gray-5)"
                    color="var(--gray-9)"
                    onClick={() => gameStore().openConfigurationWindow()}>
                    Options
                </InGameMenuButton>
                <InGameMenuButton
                    background="var(--gray-5)"
                    color="var(--gray-9)"
                    onClick={() =>
                        sceneStore().execSceneLoader( homeSceneLoader, "@home" )
                    }>
                    Exit to Home Scene
                </InGameMenuButton>
            </div>
        </div>
    );
};

export const renderIngGameMenuScene = (show: boolean) => {
    root.render( show ? <InGameMenuScene /> : null );
};
