import "../reset.css";
import "../mui.min.css";
import { useEffect, useState } from "react";
import { render } from "react-dom";
import { Container, Button, Tabs, Tab } from "muicss/react";
import search from "libnpmsearch";
import { Leva } from "leva";
import { debounce } from "lodash";

import { InitializedPluginPackage } from "common/types";
import settingsStore, { useSettingsStore } from "@stores/settings-store";
import { deletePlugin, disablePlugin, updatePluginsConfig } from "@ipc/plugins";
import PluginConfigurationUI from "./plugin-configuration-ui";
import DetailSheet from "./detail-sheet";

// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept();
}

const onChange = debounce(async (pluginId: string, config: any) => {
  updatePluginsConfig(pluginId, config);
}, 1000);

const LIMIT = 100;
const RESTART_REQUIRED = "Restart required for new settings to take effect";

const Configuration = () => {
  const settingsStore = useSettingsStore();
  const [selectedPluginConfig, setSelectedPluginConfig] = useState<
    InitializedPluginPackage | undefined
  >(settingsStore.enabledPlugins[0] ?? settingsStore.disabledPlugins[0]);

  const [selectedOnlinePlugin, setSelectedOnlinePlugin] = useState<
    search.Result | undefined
  >(undefined);

  const [npmPlugins, setNpmPlugins] = useState<search.Result[]>([]);
  const [pagination, setPagination] = useState(0);
  const [banner, setBanner] = useState("");

  useEffect(() => {
    if (banner) {
      const t = setTimeout(() => setBanner(""), 5000);
      return () => clearTimeout(t);
    }
  }, [banner]);

  const searchPackages = async () => {
    const results = await search("keywords:titan-plugin", {
      limit: LIMIT,
      from: pagination * LIMIT,
    });
    console.log(results);
    setNpmPlugins(results);
  };

  useEffect(() => {
    searchPackages();
  }, []);

  return (
    <Container>
      <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
        {banner && <p className="mui--bg-accent mui--text-light">{banner}</p>}
        <div style={{ display: "flex" }}>
          <div
            style={{
              marginRight: "2rem",
              maxWidth: "30%",
            }}
          >
            <h2>Plugin Settings</h2>
          </div>
          <div style={{ flexGrow: 1 }}>
            {selectedPluginConfig && (
              <h2>
                {selectedPluginConfig.description ?? selectedPluginConfig.name}
              </h2>
            )}
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <aside
            style={{
              display: "flex",
              flexDirection: "column",
              marginRight: "2rem",
              width: "30%",
            }}
          >
            <Tabs>
              <Tab value="local" label="Local">
                {settingsStore.enabledPlugins.map((pluginConfig) => (
                  <Button
                    variant="flat"
                    size="small"
                    key={pluginConfig.id}
                    color={
                      selectedPluginConfig?.id === pluginConfig.id
                        ? "primary"
                        : "default"
                    }
                    onClick={() => {
                      setSelectedPluginConfig(pluginConfig);
                    }}
                  >
                    {pluginConfig.name}
                  </Button>
                ))}
                {settingsStore.disabledPlugins.map((pluginConfig) => (
                  <Button
                    variant="flat"
                    size="small"
                    key={pluginConfig.id}
                    color={
                      selectedPluginConfig?.id === pluginConfig.id
                        ? "primary"
                        : "default"
                    }
                    style={{ opacity: "0.8" }}
                    onClick={() => {
                      setSelectedPluginConfig(pluginConfig);
                    }}
                  >
                    {pluginConfig.name}
                  </Button>
                ))}
              </Tab>
              <Tab value="online" label="Online">
                {npmPlugins.map((plugin) => (
                  <Button
                    variant="flat"
                    size="small"
                    key={plugin.name}
                    color={
                      selectedOnlinePlugin?.name === plugin.name
                        ? "primary"
                        : "default"
                    }
                    style={{ opacity: "0.8" }}
                    onClick={() => {
                      setSelectedOnlinePlugin(plugin);
                    }}
                  >
                    {plugin.name}
                  </Button>
                ))}
              </Tab>
            </Tabs>
          </aside>
          <main
            style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
          >
            <Leva
              fill
              flat
              hideCopyButton
              titleBar={false}
              theme={{
                colors: {
                  accent1: "blue",
                  accent2: "red",
                  accent3: "red",
                  elevation1: "red",
                  elevation2: "#f5f5f5",
                  elevation3: "#d9e0f0",
                  highlight1: "black",
                  highlight2: "#222",
                  highlight3: "#333",
                  vivid1: "red",
                  // toolTipBackground: theme.colors.cerise500.value,
                  // toolTipText: theme.colors.cerise500.value,
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
                  <Button
                    onClick={async () => {
                      if (
                        confirm("Are you sure you want to disable this plugin?")
                      ) {
                        if (await disablePlugin(selectedPluginConfig.id)) {
                          setBanner(RESTART_REQUIRED);
                          useSettingsStore.setState({
                            disabledPlugins: [
                              ...settingsStore.disabledPlugins,
                              selectedPluginConfig,
                            ],
                            enabledPlugins: settingsStore.enabledPlugins.filter(
                              (p) => p.id !== selectedPluginConfig.id
                            ),
                          });
                        }
                      }
                    }}
                  >
                    Disable Plugin
                  </Button>
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
                  <Button
                    color="danger"
                    onClick={async () => {
                      if (
                        confirm(
                          "Are you sure you want to DELETE this plugin and all it's FILES?"
                        )
                      ) {
                        if (await deletePlugin(selectedPluginConfig.id)) {
                          setBanner("Plugin files were placed in trash bin");
                          useSettingsStore.setState({
                            disabledPlugins:
                              settingsStore.disabledPlugins.filter(
                                (p) => p.id !== selectedPluginConfig.id
                              ),
                          });
                        }
                      }
                    }}
                  >
                    Delete Plugin
                  </Button>
                  <DetailSheet pluginConfig={selectedPluginConfig} />
                </>
              )}
          </main>
        </div>
      </div>
    </Container>
  );
};

settingsStore()
  .load()
  .then(() => {
    render(<Configuration />, document.getElementById("app"));
  });
