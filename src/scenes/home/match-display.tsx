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
    const { replayQueue, getNextReplay, getDeltaReplay } = useReplayAndMapStore();
    const showReplayQueue = replayQueueSettings.show && replayQueue.length > 0;

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
            {!showReplayQueue && <SingleMatchDisplayLarge />}
            {showReplayQueue && <ReplayQueueList />}
            {sceneStatus === "idle" && replayQueue.length > 0 && (
                <div
                    style={{
                        marginInline: "auto",
                        display: "flex",
                        gap: "8px",
                        marginTop: "16px",
                    }}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        style={{
                            width: "var(--size-5)",
                            color: getDeltaReplay(0)
                                ? "var(--green-5)"
                                : "var(--gray-7)",
                            cursor: "pointer",
                        }}
                        onClick={() =>
                            getDeltaReplay(0) &&
                            useReplayAndMapStore.setState({
                                replayIndex:
                                    useReplayAndMapStore.getState().replayIndex - 1,
                            })
                        }>
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 19.5L8.25 12l7.5-7.5"
                        />
                    </svg>

                    <InGameMenuButton
                        background={hasNextReplay ? "var(--green-5)" : "var(--gray-7)"}
                        color="white"
                        onClick={() =>
                            hasNextReplay &&
                            useReplayAndMapStore.getState().loadNextReplay()
                        }
                        style={{
                            width: "var(--size-12)",
                            justifyContent: "center",
                        }}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            style={{
                                width: "var(--size-5)",
                            }}>
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                            />
                        </svg>
                        Play
                    </InGameMenuButton>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        style={{
                            width: "var(--size-5)",
                            color: getDeltaReplay(2)
                                ? "var(--green-5)"
                                : "var(--gray-7)",
                            cursor: "pointer",
                        }}
                        onClick={() =>
                            getDeltaReplay(2) &&
                            useReplayAndMapStore.setState({
                                replayIndex:
                                    useReplayAndMapStore.getState().replayIndex + 1,
                            })
                        }>
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
