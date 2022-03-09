import "../reset.css";
import "../mui.min.css";
import { useEffect, useState } from "react";
import { render } from "react-dom";
import { Container, Button, Tabs, Tab, Divider } from "muicss/react";
import search from "libnpmsearch";
import { Leva } from "leva";
import { debounce } from "lodash";

import { InitializedPluginPackage } from "common/types";
import settingsStore, { useSettingsStore } from "@stores/settings-store";
import {
  deletePlugin,
  disablePlugin,
  enablePlugin,
  updatePluginsConfig,
} from "@ipc/plugins";
import PluginConfigurationUI from "./plugin-configuration-ui";
import DetailSheet from "./detail-sheet";
import { installPluginLocal } from "../../plugin-system";
import React from "react";

// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept();
}

const onChange = debounce(async (pluginId: string, config: any) => {
  updatePluginsConfig(pluginId, config);
}, 1000);

const LIMIT = 1000;
const RESTART_REQUIRED = "Restart required for new settings to take effect";
const SEARCH_KEYWORDS = "keywords:chart";
const SEARCH_COMMUNITY = "@titan-reactor-community";
// const SEARCH_ROOT = "keywords:titan-reactor-plugin";

const searchPackages = async (
  pagination: number,
  cb: (val: search.Result[]) => void
) => {
  const results = await search(SEARCH_KEYWORDS, {
    limit: LIMIT,
    from: pagination * LIMIT,
  });
  cb(results);
};

type Plugin = {
  plugin?: InitializedPluginPackage;
  onlinePackage?: search.Result;
};

class ErrorBoundary extends React.Component {
  override state: { error: Error | undefined } = { error: undefined };

  constructor(props: any) {
    super(props);
  }

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  override componentDidCatch(error: any, errorInfo: any) {
    console.error(error, errorInfo);
  }

  override render() {
    if (this.state.error) {
      return (
        <>
          There was an error with this plugin:{" "}
          {this.state.error instanceof Error
            ? this.state.error.message
            : "unknown"}{" "}
        </>
      );
    }

    return this.props.children;
  }
}

const Configuration = () => {
  const settingsStore = useSettingsStore();
  const [selectedPluginPackage, setSelectedPluginPackage] = useState<Plugin>({
    plugin: settingsStore.enabledPlugins[0] ?? settingsStore.disabledPlugins[0],
  });

  const [remotePackages, setRemotePackages] = useState<search.Result[]>([]);
  const [pagination, setPagination] = useState(0);
  const [banner, setBanner] = useState("");

  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (banner) {
      const t = setTimeout(() => setBanner(""), 5000);
      return () => clearTimeout(t);
    }
  }, [banner]);

  useEffect(() => {
    if (!selectedPluginPackage.plugin) {
      setSelectedPluginPackage({ onlinePackage: undefined });
    }
    searchPackages(pagination, setRemotePackages);
  }, [pagination]);

  return (
    <Container fluid>
      <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
        {banner && <p className="mui--bg-accent mui--text-light">{banner}</p>}

        <div style={{ display: "flex" }}>
          <aside
            style={{
              display: "flex",
              flexDirection: "column",
              marginRight: "2rem",
              width: "30%",
              maxHeight: "100vh",
              overflowY: "auto",
            }}
          >
            <h3>Manage Plugins</h3>

            <Tabs
              //@ts-ignore
              onChange={(index: number) => setTabIndex(index)}
              selectedIndex={tabIndex}
            >
              <Tab value="local" label="Local">
                <p style={{ padding: "1rem" }}>
                  Local plugins are installed in your plugins directory and can
                  be enabled/disabled.
                </p>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {settingsStore.enabledPlugins.map((plugin) => (
                    <Button
                      variant="flat"
                      size="small"
                      key={plugin.id}
                      color={
                        selectedPluginPackage.plugin?.id === plugin.id
                          ? "primary"
                          : "default"
                      }
                      onClick={() => {
                        setSelectedPluginPackage({
                          plugin,
                        });
                      }}
                    >
                      {plugin.name}
                    </Button>
                  ))}
                  <Divider />
                  {settingsStore.disabledPlugins.map((plugin) => (
                    <Button
                      variant="flat"
                      size="small"
                      key={plugin.id}
                      color={
                        selectedPluginPackage.plugin?.id === plugin.id
                          ? "primary"
                          : "default"
                      }
                      style={{ opacity: "0.8" }}
                      onClick={() => {
                        setSelectedPluginPackage({
                          plugin,
                        });
                      }}
                    >
                      {plugin.name}
                    </Button>
                  ))}
                </div>
              </Tab>
              <Tab value="community" label="Official Community">
                <p style={{ padding: "1rem" }}>
                  Official Community plugins have been manually reviewed by
                  DarkMatter to ensure a standard of quality.
                </p>
              </Tab>
              <Tab value="online" label="Online">
                <p style={{ padding: "1rem" }}>
                  Online plugins are publicly available plugins anyone can
                  publish for you to install here.
                </p>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {remotePackages
                    .filter(
                      (p) =>
                        !settingsStore.enabledPlugins.find(
                          (installedPlugin) => installedPlugin.name === p.name
                        )
                    )
                    .filter(
                      (p) =>
                        !settingsStore.disabledPlugins.find(
                          (installedPlugin) => installedPlugin.name === p.name
                        )
                    )
                    .map((onlinePackage) => (
                      <Button
                        variant="flat"
                        size="small"
                        key={onlinePackage.name}
                        color={
                          selectedPluginPackage.onlinePackage?.name ===
                          onlinePackage.name
                            ? "primary"
                            : "default"
                        }
                        style={{ opacity: "0.8" }}
                        onClick={() => {
                          setSelectedPluginPackage({
                            onlinePackage,
                          });
                        }}
                      >
                        {onlinePackage.name}
                      </Button>
                    ))}
                </div>
              </Tab>
            </Tabs>
          </aside>
          <main
            style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
          >
            {selectedPluginPackage && (
              <h2>
                {selectedPluginPackage.plugin?.description ??
                  selectedPluginPackage.plugin?.name ??
                  selectedPluginPackage.onlinePackage?.name}
              </h2>
            )}
            <ErrorBoundary>
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
                  },
                  sizes: {
                    controlWidth: "40vw",
                  },
                  fontSizes: {
                    root: "14px",
                  },
                }}
              />
              {selectedPluginPackage.onlinePackage && (
                <>
                  <DetailSheet
                    pluginConfig={selectedPluginPackage.onlinePackage}
                  />
                  <Button
                    color="primary"
                    onClick={async () => {
                      if (
                        confirm(
                          "This will download the plugin into your plugins folder. Continue?"
                        )
                      ) {
                        const plugin = await installPluginLocal(
                          selectedPluginPackage.onlinePackage!.name
                        );
                        if (plugin) {
                          useSettingsStore.setState({
                            disabledPlugins: [
                              ...settingsStore.disabledPlugins,
                              plugin,
                            ],
                          });
                          setSelectedPluginPackage({ plugin });
                          setBanner(`${plugin.name} installed!`);
                          setTabIndex(0);
                        } else {
                          setBanner(
                            `Failed to install ${
                              selectedPluginPackage.onlinePackage!.name
                            }`
                          );
                        }
                      }
                    }}
                  >
                    Install Plugin
                  </Button>
                </>
              )}
              {selectedPluginPackage.plugin &&
                settingsStore.enabledPlugins.includes(
                  selectedPluginPackage.plugin
                ) && (
                  <>
                    <PluginConfigurationUI
                      pluginConfig={selectedPluginPackage.plugin}
                      onChange={onChange}
                    />
                    <Button
                      onClick={async () => {
                        if (
                          confirm(
                            "Are you sure you want to disable this plugin?"
                          )
                        ) {
                          if (
                            await disablePlugin(
                              selectedPluginPackage.plugin!.id
                            )
                          ) {
                            setBanner(RESTART_REQUIRED);
                            useSettingsStore.setState({
                              disabledPlugins: [
                                ...settingsStore.disabledPlugins,
                                selectedPluginPackage.plugin!,
                              ],
                              enabledPlugins:
                                settingsStore.enabledPlugins.filter(
                                  (p) =>
                                    p.id !== selectedPluginPackage.plugin!.id
                                ),
                            });
                          } else {
                            setBanner(
                              `Failed to disable ${
                                selectedPluginPackage.plugin!.name
                              }`
                            );
                          }
                        }
                      }}
                    >
                      Disable Plugin
                    </Button>
                  </>
                )}
              {selectedPluginPackage.plugin &&
                settingsStore.disabledPlugins.includes(
                  selectedPluginPackage.plugin
                ) && (
                  <>
                    <Button
                      color="primary"
                      onClick={async () => {
                        if (
                          confirm(
                            "Make sure you trust the authors of this plugin before enabling it. Do you wish to continue and enable this plugin?"
                          )
                        ) {
                          if (
                            await enablePlugin(selectedPluginPackage.plugin!.id)
                          ) {
                            useSettingsStore.setState({
                              enabledPlugins: [
                                ...settingsStore.enabledPlugins,
                                selectedPluginPackage.plugin!,
                              ],
                              disabledPlugins:
                                settingsStore.disabledPlugins.filter(
                                  (p) =>
                                    p.id !== selectedPluginPackage.plugin!.id
                                ),
                            });
                          } else {
                            setBanner("Failed to enable plugin");
                          }
                        }
                      }}
                    >
                      Enable Plugin
                    </Button>
                    <Button
                      color="danger"
                      onClick={async () => {
                        if (
                          confirm(
                            "Are you sure you wish to place this plugin in the trashbin?"
                          )
                        ) {
                          if (
                            await deletePlugin(selectedPluginPackage.plugin!.id)
                          ) {
                            setBanner("Plugin files were placed in trash bin");
                            useSettingsStore.setState({
                              disabledPlugins:
                                settingsStore.disabledPlugins.filter(
                                  (p) =>
                                    p.id !== selectedPluginPackage.plugin!.id
                                ),
                            });
                            setSelectedPluginPackage({ plugin: undefined });
                          } else {
                            setBanner("Failed to delete plugin");
                          }
                        }
                      }}
                    >
                      Delete Plugin
                    </Button>
                    <PluginConfigurationUI
                      pluginConfig={selectedPluginPackage.plugin!}
                      onChange={onChange}
                    />
                  </>
                )}
            </ErrorBoundary>
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
