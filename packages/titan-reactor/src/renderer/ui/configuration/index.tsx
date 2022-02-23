import "../reset.css";
import { render } from "react-dom";
import { css, styled, theme } from "../stitches";

import settingsStore, { useSettingsStore } from "../../stores/settings-store";
import { useState } from "react";
import { InitializedPluginConfiguration } from "common/types";
import PluginConfigurationUI from "./plugins";
import { Leva } from "leva";

// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept();
}

const PluginTitle = styled("h1", {
  color: "$foreground",
  padding: "$8",
});

const Container = styled("div", {
  width: "100%",
  height: "100%",
  backgroundColor: "$background",
  color: "$foreground",
  position: "absolute",
  fontFamily: "sans-serif",
});

const ListButton = styled("div", {
  marginBottom: "$2",
  padding: "$4",
  border: "1px solid",
  borderRadius: "$md",
  cursor: "pointer",
  userSelect: "none",
  variants: {
    color: {
      default: {
        backgroundColor: "$controlBackground",
        color: "$controlForeground",
        borderColor: "transparent",
        "&:hover": {
          borderColor: "$controlRecessedBorder",
        },
      },
      selected: {
        borderColor: "$controlRecessedBorder",
        color: "$controlRecessedForeground",
      },
    },
  },
});

console.log(theme);
const Configuration = () => {
  const settingsStore = useSettingsStore();
  const [selectedPluginConfig, setSelectedPluginConfig] = useState<
    InitializedPluginConfiguration | undefined
  >(undefined);

  return (
    <Container css={{}}>
      <div style={{ width: "100%", display: "flex" }}>
        <aside
          style={{
            marginRight: "2rem",
            width: "30%",
          }}
        >
          <PluginTitle>Plugin Settings</PluginTitle>
        </aside>
        <section style={{ flexGrow: 1 }}>
          {selectedPluginConfig && (
            <PluginTitle>{selectedPluginConfig.name}</PluginTitle>
          )}
        </section>
      </div>
      <div style={{ width: "100%", display: "flex" }}>
        <aside
          style={{
            display: "flex",
            flexDirection: "column",
            marginRight: "2rem",
            width: "30%",
          }}
        >
          {settingsStore.pluginsConfigs.map((pluginConfig) => (
            <ListButton
              key={pluginConfig.tag}
              color={
                selectedPluginConfig === pluginConfig ? "selected" : "default"
              }
              onClick={() => {
                setSelectedPluginConfig(pluginConfig);
              }}
            >
              {pluginConfig.name}
            </ListButton>
          ))}
        </aside>
        <main style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Leva
            fill
            flat
            hideCopyButton
            titleBar={false}
            theme={{
              colors: {
                elevation1: theme.colors.background.value,
                elevation2: theme.colors.controlBackground.value,
                elevation3: theme.colors.beaver700.value,
                accent1: theme.colors.blue100.value,
                accent2: theme.colors.blue300.value,
                accent3: theme.colors.lemon500.value,
                highlight1: theme.colors.lemon100.value,
                highlight2: theme.colors.lemon200.value,
                highlight3: theme.colors.lemon300.value,
                vivid1: theme.colors.beaver500.value,
                folderWidgetColor: theme.colors.cerise500.value,
                folderTextColor: theme.colors.cerise500.value,
                toolTipBackground: theme.colors.cerise500.value,
                toolTipText: theme.colors.cerise500.value,
              },
              sizes: {
                controlWidth: "40vw",
              },
              fontSizes: {
                root: "14px",
              },
            }}
          />
          {selectedPluginConfig && (
            <>
              <PluginConfigurationUI pluginConfig={selectedPluginConfig} />
              <div>
                <p>
                  <span style={{ fontWeight: "bold" }}>Version:</span>{" "}
                  {selectedPluginConfig.version}
                </p>
                <p>
                  <span style={{ fontWeight: "bold" }}>Author:</span>{" "}
                  {selectedPluginConfig.author ?? "unknown"}
                </p>
                <span>
                  <span style={{ fontWeight: "bold" }}>Warnings:</span>
                </span>
                <ul>
                  {selectedPluginConfig.channels.find(
                    (channel) => channel.type === "iframe"
                  ) && (
                    <li>
                      This plugin uses iframes, which may or may not cause
                      slowdowns, so keep an eye out!
                    </li>
                  )}
                  {selectedPluginConfig.nativeSource && (
                    <li>
                      This plugin uses native.js, which allows advanced features
                      not possible with other plugin types, however it has full
                      application and operating system access.
                    </li>
                  )}
                </ul>
                <p>
                  <span style={{ fontWeight: "bold" }}>
                    Read Permissions Requested:
                  </span>
                  {selectedPluginConfig.channels
                    .flatMap((c) => c["access.read"])
                    .join(", ")}
                </p>
                <p>
                  <span style={{ fontWeight: "bold" }}>
                    Write Permissions Requested:
                  </span>
                  {selectedPluginConfig.channels
                    .flatMap((c) => c["access.write"])
                    .join(", ")}
                </p>
                <p>
                  <span style={{ fontWeight: "bold" }}>Update Status:</span>
                  This is the latest version
                </p>
              </div>
            </>
          )}
        </main>
      </div>
      <div style={{ position: "sticky", bottom: "0" }}>
        <button>Force Reload</button>
        <button>Open Plugins Folder</button>
      </div>
    </Container>
  );
};

settingsStore()
  .load()
  .then(() => {
    render(<Configuration />, document.getElementById("app"));
  });
