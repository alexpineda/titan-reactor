// import { showFolderDialog } from "@ipc";
import { useProcessStore } from "@stores/process-store";
import { useSceneStore } from "@stores/scene-store";
import { useEffect } from "react";
import { imbateamLogo } from "@image/assets/imbateam";
import titanReactorLogo from "@image/assets/logo.png";
import { LoadBar } from "./load-bar";
import "./styles.css";
import { GlobalErrorState } from "../error-state";
import { showFolderDialog } from "@ipc/dialogs";
import { settingsStore, useSettingsStore } from "@stores/settings-store";

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

    const isStarCraftDirectoryError =
        error && error.message.toLowerCase().includes( "starcraft directory" );

    const action = isStarCraftDirectoryError ? (
        <button
            onClick={async () => {
                const folders = await showFolderDialog();
                if ( folders && folders.length > 0 ) {
                    settingsStore().data.directories.starcraft = folders[0];
                    await settingsStore().save( settingsStore().data );
                }
            }}>
            Select StarCraft Directory
        </button>
    ) : null;

    useEffect( () => {
        return useProcessStore.subscribe( ( store ) => {
            const b = ( 1 - store.getTotalProgress() ) * 0.2;
            //@ts-expect-error
            document.body.style.backdropFilter = `blur(20px) grayscale(0.2) contrast(0.5) brightness(${b})`;
        } );
    }, [] );

    useEffect( () => {
        //@ts-expect-error
        document.body.style.backdropFilter =
            "blur(20px) grayscale(0.2) contrast(0.5) brightness(0.2)";
        document.body.style.background = `url(${titanReactorLogo}) center center / cover`;
        return () => {
            //@ts-expect-error
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
                    <div>{imbateamLogo}</div>
                    <LoadBar
                        color="#ffffff"
                        thickness={20}
                        style={{ marginTop: "20px" }}
                    />
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
