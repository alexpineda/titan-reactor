import { globalEvents } from "@core/global-events";
import { useEffect, useState } from "react";
import { InGameMenuScene } from "./ingame-menu-scene";

const IntroHelp = () => {
    const [showHelp, setShowHelp] = useState(
        localStorage.getItem("hideHelp") !== "true"
    );

    return showHelp ? (
        <div
            style={{
                color: "var(--gray-2)",
                position: "absolute",
                width: "50vw",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(0,0,0,0.5)",
                padding: "32px",
                borderRadius: "32px",
            }}>
            <p
                style={{
                    textAlign: "center",
                    fontSize: "24px",
                }}>
                Welcome! 🫶
            </p>
            <div
                style={{
                    fontSize: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                }}>
                <p>Camera mode: press 1, 2, 3 or 4 on your keyboard.</p>
                <p>1 - Default Camera</p>
                <p>2 - Battle Camera</p>
                <p>3 - Overview Camera</p>
                <p>4 - Narrative Camera ( you are here)</p>
                <p>
                    To change which one is loaded by default, open Control Panel and go
                    to the Input - Default Scene Controller section! Use the Macros
                    panel to customize keyboard shortcuts.
                </p>
                <p
                    style={{
                        textAlign: "right",
                        cursor: "pointer",
                        display: "flex",
                        gap: "4px",
                        justifyContent: "end",
                        marginTop: "var(--size-4)",
                        color: "var(--red-5)",
                    }}
                    onClick={() => {
                        setShowHelp(false);
                        localStorage.setItem("hideHelp", "true");
                    }}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        style={{ width: "var(--size-4)" }}>
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    Click here to close this message.
                </p>
            </div>
        </div>
    ) : null;
};

export const GameScene = () => {
    const [gameMenu, setGameMenu] = useState(false);

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
            <IntroHelp />
        </>
    );
};
