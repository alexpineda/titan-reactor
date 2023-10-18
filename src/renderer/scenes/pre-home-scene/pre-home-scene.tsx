// import { showFolderDialog } from "@ipc";
import { useProcessStore } from "@stores/process-store";
import { useSceneStore } from "@stores/scene-store";
import { useEffect } from "react";
import titanReactorLogo from "@image/assets/logo.png";
import dmLogo from "@image/assets/dm.png";
import { LoadBar } from "./load-bar";
import "./styles.css";
import { GlobalErrorState } from "../error-state";
import {   useSettingsStore } from "@stores/settings-store";
import { useGameStore } from "@stores/game-store";

const styleCenterText = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    cursor: "wait",
    color: "#ffeedd",
    fontFamily: "Conthrax",
    display: "flex",
    flexDirection: "column",
};

export const PreHomeScene = () => {
    const error = useSceneStore( ( state ) => state.error );
    const initialInstall = useSettingsStore( ( state ) => state.initialInstall );
    const initialInteraction = useGameStore( ( state ) => state.initialInteraction );

    const action =   null;

    useEffect( () => {
        return useProcessStore.subscribe( ( store ) => {
            const b = ( 1 - store.getTotalProgress() ) * 0.2;
            document.body.style.backdropFilter = `blur(20px) grayscale(0.2) contrast(0.5) brightness(${b})`;
        } );
    }, [] );

    useEffect( () => {
        document.body.style.backdropFilter =
            "blur(20px) grayscale(0.2) contrast(0.5) brightness(0.2)";
        document.body.style.background = `url(${titanReactorLogo}) center center / cover`;
        return () => {
            document.body.style.backdropFilter = "";
            document.body.style.background = "";
        };
    }, [] );

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
            {error && !initialInstall && (
                <GlobalErrorState error={error} action={action} />
            )}
            {!error && !initialInstall && (
                //@ts-expect-error
                <div style={styleCenterText}>
                    {/* <div>{imbateamLogo}</div> */}
                    <img src={dmLogo} style={{ width: "200px" }} />
                    {initialInteraction && <LoadBar
                        color="#ffffff"
                        thickness={20}
                        style={{ marginTop: "30px" }}
                    />}
                    {!initialInteraction && <button style={{ marginTop: "20px" }} onClick={() => useGameStore.setState({initialInteraction: true})}>ENTER</button>}
                </div>
            )}
            {initialInstall && (
                //@ts-expect-error
                <div style={styleCenterText}>
                    <p style={{ fontSize: "var(--font-size-6)" }}>
                        Installing Default Plugins...
                    </p>
                </div>
            )}
        </div>
    );
};
