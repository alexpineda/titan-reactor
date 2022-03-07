import "../reset.css";
import { render } from "react-dom";
import { styled, theme } from "./stitches";

import settingsStore, { useSettingsStore } from "@stores/settings-store";
import { useState } from "react";
import { InitializedPluginPackage } from "common/types";
import PluginConfigurationUI from "./plugin-configuration-ui";
import { Leva } from "leva";
import { updatePluginsConfig } from "@ipc/plugins";
import { debounce } from "lodash";
import DetailSheet from "./detail-sheet";

// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept();
}

const PluginTitle = styled("h1", {
  color: "$foreground",
  padding: "$8",
});

const Button = styled("button", {
  background: "$buttonBackground",
  color: "$buttonText",
  cursor: "pointer",
  variants: {
    color: {
      danger: {
        background: "$cerise700",
        color: "$cerise200",
      },
      alternate: {
        background: "$gray200",
        color: "$gray700",
      },
    },
  },
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
  paddingLeft: "$4",
  paddingRight: "$4",
  paddingTop: "$1",
  paddingBottom: "$1",
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
      disabled: {
        backgroundColor: "$controlBackground",
        color: "$controlRecessedForeground",
        borderColor: "transparent",
        "&:hover": {
          borderColor: "$controlRecessedBorder",
        },
      },
    },
  },
});

const onChange = debounce(async (pluginId: string, config: any) => {
  updatePluginsConfig(pluginId, config);
}, 1000);

const Configuration = () => {
  const settingsStore = useSettingsStore();
  const [selectedPluginConfig, setSelectedPluginConfig] = useState<
    InitializedPluginPackage | undefined
  >(settingsStore.enabledPlugins[0] ?? settingsStore.disabledPlugins[0]);

  return (
    <Container css={{}}>
      <div style={{ width: "100%", display: "flex" }}>
        <aside
          style={{
            marginRight: "2rem",
            maxWidth: "30%",
          }}
        >
          <PluginTitle>Plugin Settings</PluginTitle>
        </aside>
        <section style={{ flexGrow: 1 }}>
          {selectedPluginConfig && (
            <PluginTitle>
              {selectedPluginConfig.description ?? selectedPluginConfig.name}
            </PluginTitle>
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
          <div
            style={{
              display: "flex",
              justifyItems: "stretch",
              marginBottom: "1rem",
            }}
          >
            <Button css={{ flexGrow: "1" }}>Available</Button>
            <Button color="alternate" css={{ flexGrow: "1" }}>
              Marketplace
            </Button>
          </div>
          {settingsStore.enabledPlugins.map((pluginConfig) => (
            <ListButton
              key={pluginConfig.id}
              color={
                selectedPluginConfig?.id === pluginConfig.id
                  ? "selected"
                  : "default"
              }
              onClick={() => {
                setSelectedPluginConfig(pluginConfig);
              }}
            >
              {pluginConfig.name}
            </ListButton>
          ))}
          {settingsStore.disabledPlugins.map((pluginConfig) => (
            <ListButton
              key={pluginConfig.id}
              color={
                selectedPluginConfig?.id === pluginConfig.id
                  ? "selected"
                  : "disabled"
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
          {selectedPluginConfig &&
            settingsStore.enabledPlugins.includes(selectedPluginConfig) && (
              <>
                <PluginConfigurationUI
                  pluginConfig={selectedPluginConfig}
                  onChange={onChange}
                />
                <Button>Disable Plugin</Button>
                <Button color="danger">Delete Plugin</Button>
                <p>
                  Note: Not all plugins may be smoothly disabled/deleted. If you
                  find the app is not working as it should after
                  disabling/deleting, use the Debug menu to do a full plugin
                  reload, or a full app reload.
                </p>
              </>
            )}
          {selectedPluginConfig &&
            settingsStore.disabledPlugins.includes(selectedPluginConfig) && (
              <>
                <p>
                  Warning: Ensure you trust the authors of this plugin before
                  enabling it.
                </p>
                <Button color="danger">Enable Plugin</Button>
                <DetailSheet pluginConfig={selectedPluginConfig} />
              </>
            )}
        </main>
      </div>
    </Container>
  );
};

settingsStore()
  .load()
  .then(() => {
    render(<Configuration />, document.getElementById("app"));
  });
