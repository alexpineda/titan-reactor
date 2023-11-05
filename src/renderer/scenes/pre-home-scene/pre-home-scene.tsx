// import { showFolderDialog } from "@ipc";
import { useProcessStore } from "@stores/process-store";
import { useSceneStore } from "@stores/scene-store";
import { useEffect } from "react";
import titanReactorLogo from "@image/assets/logo.png";
import { LoadBar } from "./load-bar";

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

// const requestLogin = async () => {
//     const res = await supabase.auth.signInWithOtp({
//         email,
//         options: {
//             emailRedirectTo: import.meta.env.BASE_URL
//         }
//     });

//     if (res.error) {
//         alert(res.error.message);
//         return;
//     }

//     if (res.data.session) {
//         alert("Check your email for a login link");
//     }
// }

export const PreHomeScene = ( {  pluginsReady, assetServerReady }: { pluginsReady: boolean, assetServerReady: boolean } ) => {
    const error = useSceneStore( ( state ) => state.error );

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
            {!error && (
                //@ts-expect-error
                <div style={styleCenterText}>
                    {assetServerReady && pluginsReady && (
                        <LoadBar
                            color="#ffffff"
                            thickness={20}
                            style={{ marginTop: "30px" }}
                        />
                    )}
                    {(!assetServerReady || !pluginsReady) && (
                        <>
                            <p>Waiting for: {assetServerReady ? "" : "asset server"} {pluginsReady ? "" : "plugin server"}</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
