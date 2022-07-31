import React from "react";
import { useLocale, updateAvailable, openUrl } from "titan-reactor";

const iconStyle = {
  width: "var(--size-8)",
  height: "var(--size-8)",
  marginRight: "var(--size-4)",
  filter: "sepia(0.5)",
  cursor: "pointer",
};

export const Home = () => {
  const locale = useLocale();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "var(--size-6)",
        marginTop: "var(--size-4)",
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
            alignItems: "center",
            animation: "var(--animation-fade-in)",
            animationDuration: "2s",
          }}
        >
          <h1
            style={{
              fontFamily: "Conthrax",
              color: "var(--orange-5)",
            }}
          >
            Titan Reactor
          </h1>
          <p
            style={{
              marginTop: "var(--size-2)",
              textAlign: "center",
              color: "var(--gray-4)",
            }}
          >
            Menu: ALT, Fullscreen: F11, Plugins: F10
          </p>
          {updateAvailable.version && (
            <div
              style={{
                color: "var(--green-5)",
                textAlign: "center",
                textDecoration: "underline",
                cursor: "pointer",
              }}
              onClick={() =>
                window.parent.postMessage("system:download-update", "*")
              }
            >
              Download New Version {updateAvailable.version} Now!
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "end",
          }}
        >
          <img
            onClick={() =>
              openUrl(
                locale === "ko-KR"
                  ? "http://youtube-kr.imbateam.gg"
                  : "http://youtube.imbateam.gg"
              )
            }
            src="./runtime/assets/youtube.png"
            style={iconStyle}
          />
          <img
            onClick={() => openUrl("https://www.twitch.tv/imbateamgg")}
            src="./runtime/assets/twitch.png"
            style={iconStyle}
          />
          <img
            onClick={() => openUrl("http://discord.imbateam.gg")}
            src="./runtime/assets/discord.png"
            style={iconStyle}
          />
          <img
            onClick={() =>
              openUrl("https://github.com/imbateam-gg/titan-reactor")
            }
            src="./runtime/assets/github.png"
            style={iconStyle}
          />
          <img
            style={{ ...iconStyle, marginLeft: "var(--size-6)" }}
            onClick={() => openUrl("https://www.patreon.com/imbateam")}
            src="./runtime/assets/patreon.png"
          />
          <img
            onClick={() => openUrl("https://ko-fi.com/imbateam")}
            src="./runtime/assets/kofi.png"
            style={iconStyle}
          />
        </div>
      </div>
    </div>
  );
};
