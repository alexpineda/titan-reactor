import { useProcessStore } from "@stores/process-store";
import { useSceneStore } from "@stores/scene-store";
import { ON_PLUGINS_INITIAL_INSTALL } from "common/ipc-handle-names";
import { ipcRenderer } from "electron";
import { useEffect } from "react";
import { imbateamLogo } from "./assets/imbateam";
import titanReactorLogo from "./assets/logo.png";
import { LoadBar } from "./load-bar";

const styleCenterText = {
  position: "absolute",
  zIndex: "-999",
  left: "50%",
  top: "50%",
  transform: `translate(-50%, -50%)`,
  cursor: "wait",
  color: "#ffeedd",
  fontFamily: "Conthrax",
  display: "flex",
  flexDirection: "column",
};

let _firstInstall = false;
ipcRenderer.on(ON_PLUGINS_INITIAL_INSTALL, () => {
  _firstInstall = true;
});

export const SceneLoadingUI = () => {
  const error = useSceneStore((state) => state.error);
  const progress = useProcessStore((state) => state.getTotalProgress());

  useEffect(() => {
    const b = (1 - progress) * 0.2;
    //@ts-ignore
    document.body.style.backdropFilter = `blur(20px) grayscale(0.2) contrast(0.5) brightness(${b})`;
  }, [progress]);

  useEffect(() => {
    //@ts-ignore
    document.body.style.backdropFilter = `blur(20px) grayscale(0.2) contrast(0.5) brightness(0.2)`;
    document.body.style.background = `url(${titanReactorLogo}) center center / cover`;
    return () => {
      //@ts-ignore
      document.body.style.backdropFilter = "";
      document.body.style.background = "";
    };
  }, []);

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
      }}
    >
      {!error && !_firstInstall && (
        //@ts-ignore
        <div style={styleCenterText}>
          <div>{imbateamLogo}</div>
          <LoadBar color="white" thickness={20} style={{ marginTop: "20px" }} />
        </div>
      )}
      {_firstInstall && (
        //@ts-ignore
        <div style={styleCenterText}>
          <p style={{ fontSize: "var(--font-size-6)" }}>
            Installing Default Plugins...
          </p>
        </div>
      )}
    </div>
  );
};
