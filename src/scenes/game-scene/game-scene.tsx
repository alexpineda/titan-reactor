import { globalEvents } from "@core/global-events";
import { useEffect, useState } from "react";
import { InGameMenuScene } from "./ingame-menu-scene";
import VRButtonReact from "@render/vr/vr-button-react";
import { renderComposer } from "@render/index";
import { Welcome } from "./welcome";



export const GameScene = () => {
    const [gameMenu, setGameMenu] = useState(false);
    const [showWelcome, setShowWelcome] = useState(
        localStorage.getItem("hideWelcome") !== "true"
    );

    useEffect(() => {
        const off = globalEvents.on("replay-complete", async () => {
            setGameMenu(true);
        });

        const evtListener = (evt: KeyboardEvent) => {
            if (evt.key === "Escape" && document.pointerLockElement === null) {
                setGameMenu(!gameMenu);
            }
        };

        window.addEventListener("keydown", evtListener);

        return () => {
            off();
            window.removeEventListener("keydown", evtListener);
        };
    }, []);

    return (
        <>
            {gameMenu && <InGameMenuScene onClose={() => setGameMenu(false)} />}
            {showWelcome && <Welcome onClose={() => {
                setShowWelcome(false);
                localStorage.setItem("hideWelcome", "true");
            }} />}
            <VRButtonReact renderer={renderComposer.glRenderer} />
        </>
    );
};
