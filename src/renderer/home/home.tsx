import { openUrl } from "@ipc/dialogs";
import { useSceneStore } from "@stores/scene-store";
import { useEffect, useRef } from "react";
import discordLogo from "./assets/discord.png";
import youtubeLogo from "./assets/youtube.png";
import githubLogo from "./assets/github.png";
import "./home.css";

const iconStyle = {
  width: "var(--size-8)",
  height: "var(--size-8)",
  marginRight: "var(--size-4)",
  cursor: "pointer",
  filter: "grayscale(1)",
};

export const Home = ({ surface }: { surface: HTMLCanvasElement }) => {
  const error = useSceneStore((state) => state.error);
  const surfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (surfaceRef.current) {
      surfaceRef.current.appendChild(surface);
    }
    return () => surface.remove();
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
      <div ref={surfaceRef}></div>
      {!error && (
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
