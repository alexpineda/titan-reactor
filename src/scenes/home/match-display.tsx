import { ReplayQueueList } from "./replay-queue-list";
import { SingleMatchDisplayLarge } from "./single-match-display-large";
import { useSettingsStore } from "@stores/settings-store";
import shallow from "zustand/shallow";
import { useReplayAndMapStore } from "@stores/replay-and-map-store";
import { InGameMenuButton } from "../game-scene/ingame-menu-button";
import { useSceneStore } from "@stores/scene-store";

export const MatchDisplay = () => {
    const replayQueueSettings = useSettingsStore(
        (state) => state.data.replayQueue,
        shallow
    );
    const sceneStatus = useSceneStore((state) => state.status);
    const nextSceneId = useSceneStore((state) => state.nextScene?.id);
    const { replayQueue, getNextReplay, getDeltaReplay } =
        useReplayAndMapStore();
    const showReplayQueue =
        replayQueueSettings.show &&
        replayQueue.length > 0;

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
            {!showReplayQueue && nextSceneId === "@replay" && <SingleMatchDisplayLarge />}
            {showReplayQueue && nextSceneId === "@replay" &&  <ReplayQueueList />}
            {sceneStatus === "idle" && nextSceneId === "@replay" && replayQueue.length > 0 && (
                <div style={{marginInline: "auto", display: "flex", gap: "8px", marginTop: "16px"}}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        style={{width:"var(--size-5)", color: getDeltaReplay(0) ? "var(--green-5)" : "var(--gray-6)", cursor: "pointer"}}
                        onClick={() =>getDeltaReplay(0) && useReplayAndMapStore.setState({replayIndex: useReplayAndMapStore.getState().replayIndex - 1})}
                        >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 19.5L8.25 12l7.5-7.5"
                        />
                    </svg>

                    {hasNextReplay && (
                        <InGameMenuButton
                            background={hasNextReplay ? "var(--green-5)" : "var(--gray-6)"}
                            color="white"
                            onClick={() =>
                                hasNextReplay && useReplayAndMapStore.getState().loadNextReplay()
                            }
                            style={{
                                width: "var(--size-12)",
                                justifyContent: "center"
                            }}>
                            Play Next
                        </InGameMenuButton>
                    )}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        style={{width:"var(--size-5)", color: getDeltaReplay(2) ? "var(--green-5)" : "var(--gray-6)", cursor: "pointer"}} 
                        onClick={() => getDeltaReplay(2) && useReplayAndMapStore.setState({replayIndex: useReplayAndMapStore.getState().replayIndex + 1})}
                        >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                    </svg>
                </div>
            )}
        </div>
    );
};
