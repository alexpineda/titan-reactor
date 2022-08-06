import { openUrl } from "@ipc/dialogs";
import { useProcessStore } from "@stores/process-store";
import { useScreenStore } from "@stores/screen-store";
import { ON_PLUGINS_INITIAL_INSTALL } from "common/ipc-handle-names";
import { ScreenStatus, ScreenType } from "common/types";
import { ipcRenderer } from "electron";
import { useEffect, useRef } from "react";
import { imbateamLogo } from "./assets/imbateam";

import titanReactorLogo from "./assets/logo.png";
import discordLogo from "./assets/discord.png";
import youtubeLogo from "./assets/youtube.png";
import githubLogo from "./assets/github.png";
import { createRoot, Root } from "react-dom/client";
import "./home.css";
// import { loadWraithScene } from "./wraith-scene";

let _firstInstall = false;
ipcRenderer.on(ON_PLUGINS_INITIAL_INSTALL, () => {
  _firstInstall = true;
});

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

const iconStyle = {
  width: "var(--size-8)",
  height: "var(--size-8)",
  marginRight: "var(--size-4)",
  cursor: "pointer",
  filter: "grayscale(1)",
};

export const Home = () => {
  const screen = useScreenStore();
  const progress = useProcessStore((state) => state.getTotalProgress());
  const appLoading =
    screen.type === ScreenType.Home && screen.status === ScreenStatus.Loading;
  const appHomeScreen =
    screen.type === ScreenType.Home && screen.status === ScreenStatus.Ready;

  useEffect(() => {
    if (appLoading) {
      const b = (1 - progress) * 0.5;
      //@ts-ignore
      document.body.style.backdropFilter = `blur(20px) grayscale(0.2) contrast(0.5) brightness(${b})`;
    }
  }, [progress, screen]);

  useEffect(() => {
    if (appLoading) {
      //@ts-ignore
      document.body.style.backdropFilter = `blur(20px) grayscale(0.2) contrast(0.5) brightness(0.2)`;
      document.body.style.background = `url(${titanReactorLogo}) center center / cover`;
    } else {
      //@ts-ignore
      document.body.style.backdropFilter = "";
      document.body.style.background = "";
    }
  }, [screen]);

  const containerDiv = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerDiv}
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
      {appLoading && !screen.error && !_firstInstall && (
        //@ts-ignore
        <div style={styleCenterText}>
          <div>{imbateamLogo}</div>
          <div
            style={{
              background: "white",
              transform: `scaleX(${progress})`,
              height: "20px",
              marginTop: "20px",
              width: "100%",
            }}
          >
            &nbsp;
          </div>
        </div>
      )}
      {appLoading && _firstInstall && (
        //@ts-ignore
        <div style={styleCenterText}>
          <p style={{ fontSize: "var(--font-size-6)" }}>
            Installing Default Plugins...
          </p>
        </div>
      )}
      {appHomeScreen && !screen.error && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "var(--size-6)",
            marginTop: "var(--size-4)",
            userSelect: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                transform: "scale(0.7)",
              }}
            >
              <h1
                style={{
                  fontFamily: "Conthrax",
                  color: "rgb(143 201 154)",
                  textShadow: "1px 2px 10px var(--green-7)",
                  letterSpacing: "var(--font-letterspacing-6)",
                  lineHeight: "var(--font-lineheight-6)",
                  textTransform: "uppercase",
                  fontSize: "var(--font-size-fluid-2)",
                }}
              >
                Titan Reactor
              </h1>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "end",
                opacity: "0.2",
              }}
            >
              <img
                onClick={() =>
                  openUrl("https://github.com/imbateam-gg/titan-reactor")
                }
                src={githubLogo}
                style={{ ...iconStyle, filter: "grayscale(1) invert(1)" }}
              />
              <img
                onClick={() => openUrl("http://youtube.imbateam.gg")}
                src={youtubeLogo}
                style={{
                  ...iconStyle,
                  filter: "grayscale(1) invert(1) brightness(1.2)",
                }}
              />
              <img
                style={{
                  ...iconStyle,
                  filter: "grayscale(1) contrast(2) invert(1) brightness(1.4)",
                }}
                onClick={() => openUrl("http://discord.imbateam.gg")}
                src={discordLogo}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

let root: Root | undefined = createRoot(document.getElementById("home")!);
root.render(<Home />);

// let _wraithScene: ScreenState | null = null;

useScreenStore.subscribe(async (screen) => {
  const inGame =
    (screen.type === ScreenType.Replay || screen.type === ScreenType.Map) &&
    screen.status === ScreenStatus.Ready;

  if (inGame) {
    if (root) {
      root.render(null);
      root.unmount();
      root = undefined;
    }
    // if (_wraithScene) {
    //   _wraithScene.dispose();
    //   _wraithScene = null;
    // }
  } else {
    // _wraithScene = _wraithScene ?? (await loadWraithScene());
    root = root ?? createRoot(document.getElementById("home")!);

    // if (screen.status === ScreenStatus.Ready) {
    //   _wraithScene.start();
    // }
    root.render(<Home />);
  }
});
