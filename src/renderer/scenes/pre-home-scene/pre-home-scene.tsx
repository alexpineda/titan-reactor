// import { showFolderDialog } from "@ipc";
import { useProcessStore } from "@stores/process-store";
import { useSceneStore } from "@stores/scene-store";
import { useEffect } from "react";
import titanReactorLogo from "@image/assets/logo.png";
import dmLogo from "@image/assets/dm.png";
import { LoadBar } from "./load-bar";
import { GlobalErrorState } from "../error-state";
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

export const PreHomeScene = ( { assetServerUrl, pluginsReady }: { assetServerUrl: string, pluginsReady: boolean } ) => {
    const error = useSceneStore( ( state ) => state.error );

    const validatedAssertServerUrl = useGameStore( ( state ) => state.assetServerUrl );

    const action = null;

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
            {error  && (
                <GlobalErrorState error={error} action={action} />
            )}
            {!error && (
                //@ts-expect-error
                <div style={styleCenterText}>
                    {/* <div>{imbateamLogo}</div> */}
                    <img src={dmLogo} style={{ width: "200px" }} />
                    {!!validatedAssertServerUrl && (
                        <LoadBar
                            color="#ffffff"
                            thickness={20}
                            style={{ marginTop: "30px" }}
                        />
                    )}
                    {!validatedAssertServerUrl && (
                        <>
                            <p>Waiting for assets</p>
                            <p>{assetServerUrl}</p>
                        </>
                    )}
                    {!pluginsReady && <p>Waiting for plugin server</p>}
                </div>
            )}
        </div>
    );
};
