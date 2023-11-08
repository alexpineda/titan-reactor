import { ReplayQueueList } from "./replay-queue-list";
import { SingleMatchDisplayLarge } from "./single-match-display-large";
import { useSettingsStore } from "@stores/settings-store";
import shallow from "zustand/shallow";
import { useReplayAndMapStore } from "@stores/replay-and-map-store";
import { InGameMenuButton } from "../game-scene/ingame-menu-button";
import { useSceneStore } from "@stores/scene-store";

export const MatchDisplay = () => {
    const replayQueueSettings = useSettingsStore(
        ( state ) => state.data.replayQueue,
        shallow
    );
    const sceneStatus = useSceneStore( ( state ) => state.status);
    const { map, replay, replayQueue, getNextReplay } = useReplayAndMapStore();
    const showReplayQueue = replayQueueSettings.enabled && replayQueueSettings.show && replayQueue.length > 0;

    const hasNextReplay = !!getNextReplay();

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                padding: "var(--size-4)",
                marginTop: "var(--size-2)",
                userSelect: "none",
                flex: 1,
            }}>
            {!showReplayQueue && !!( replay ?? map ) && <SingleMatchDisplayLarge />}
            {showReplayQueue && <ReplayQueueList />}
            {showReplayQueue && replayQueueSettings.autoplay === false && hasNextReplay && sceneStatus === "idle" && <InGameMenuButton
                        background="var(--green-5)"
                        color="white"
                        onClick={() =>
                            useReplayAndMapStore.getState().loadNextReplay()
                        }
                        style={{ width: "var(--size-12)", marginInline: "auto", marginTop: "16px"  }}
                        >
                        Play Next
                    </InGameMenuButton>}
        </div>

    );
};
