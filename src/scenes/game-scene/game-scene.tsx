import { globalEvents } from "@core/global-events";
import { useEffect, useState } from "react";
import { InGameMenuScene } from "./ingame-menu-scene";

export const GameScene = () => {
    const [gameMenu, setGameMenu] = useState(false);

    useEffect(() => {
        const off = globalEvents.on("replay-complete", async () => {
            setGameMenu(true);
        });

        const evtListener = ( evt: KeyboardEvent ) => {
            if ( evt.key === "Escape" && document.pointerLockElement === null ) {
                setGameMenu(!gameMenu);
            }
        };

        window.addEventListener( "keydown", evtListener );

        return () => {
            off();
            window.removeEventListener( "keydown", evtListener );
        }

    }, []);

    return <>{gameMenu && <InGameMenuScene onClose={() => setGameMenu(false)} />}</>;
};
