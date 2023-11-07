import { useSceneStore } from "@stores/scene-store";
import packageJSON from "../../../package.json";
import gameStore from "@stores/game-store";

import { OpenFileButton } from "./open-file-button";
import { Socials } from "./socials";
import { ConfigButton } from "./config-button";

import { MatchDisplay } from "./match-display";
import { FullScreenButton } from "./full-screen-button";

/**
 * React UI for Home Scene
 */
export const Home = (  ) => {
    const error = useSceneStore( ( state ) => state.error );

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
                <FullScreenButton onClick={() => document.body.requestFullscreen()} />

                
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
