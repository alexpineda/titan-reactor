import gameStore from "@stores/game-store";
import { useReplayAndMapStore } from "@stores/replay-and-map-store";
import sceneStore from "@stores/scene-store";
import { HomeScene } from "../../scenes/home-scene";
import { InGameMenuButton } from "./ingame-menu-button";


export const InGameMenuScene = ({ onClose }: { onClose:  () => void }) => {
    const queued = useReplayAndMapStore( ( store ) => store.getNextReplay() );
    return (
        <div
            id="in-game-menu"
            onClick={() => onClose()}
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
                {/* <OpenFileButton /> */}
                <InGameMenuButton
                    background="var(--gray-5)"
                    color="var(--gray-9)"
                    onClick={() => gameStore().openConfigurationWindow()}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: "24px"}}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>
 Control Panel 
                </InGameMenuButton>
                <InGameMenuButton
                    background="var(--gray-5)"
                    color="var(--gray-9)"
                    onClick={() =>
                        sceneStore().loadScene( new HomeScene() )
                    }>
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: "24px"}}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
</svg> Exit to Home Scene 

                </InGameMenuButton>
                
            </div>
        </div>
    );
};