import packageJSON from "../../../package.json";
import gameStore from "@stores/game-store";

import { OpenFileButton } from "./open-file-button";
import { Socials } from "./socials";
import { ConfigButton } from "./config-button";

import { MatchDisplay } from "./match-display";
import { FullScreenButton } from "./full-screen-button";
import { MuteIntroSoundButton } from "./mute-intro-sound-button";

/**
 * React UI for Home Scene
 */
export const HomeSceneUI = (  ) => {

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
            <MatchDisplay />
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
                <OpenFileButton buttonType="icon" />
                <FullScreenButton onClick={() => document.body.requestFullscreen()} />
                <MuteIntroSoundButton />
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
