import "../reset.css";
import "../mui.min.css";
import { useEffect, useState } from "react";
import { render } from "react-dom";
import { Container, Button, Tabs, Tab, Divider } from "muicss/react";
import search from "libnpmsearch";
import semver from "semver";
import { debounce } from "lodash";

import { InitializedPluginPackage } from "common/types";
import settingsStore, { useSettingsStore } from "@stores/settings-store";
import {
  deletePlugin,
  disablePlugin,
  enablePlugins,
  updatePluginsConfig,
} from "@ipc/plugins";
import PluginConfigurationUI from "./plugin-configuration-ui";
import DetailSheet from "./detail-sheet";
import { installPluginLocal } from "../../plugins";

// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept();
}

const onChange = debounce(async (pluginId: string, config: any) => {
  updatePluginsConfig(pluginId, config);
}, 100);

const LIMIT = 1000;
const RESTART_REQUIRED = "Restart required for new settings to take effect";
const SEARCH_KEYWORDS = "keywords:titan-reactor-plugin";
const SEARCH_OFFICIAL = "@titan-reactor-plugins";

const searchPackages = async (cb: (val: search.Result[]) => void) => {
  const officialPackages = await search(SEARCH_OFFICIAL, {
    limit: LIMIT,
  });

  const publicPackages = (
    await search(SEARCH_KEYWORDS, {
      limit: LIMIT,
    })
  ).filter((pkg) => !officialPackages.some((p) => p.name === pkg.name));

  const results = [...officialPackages, ...publicPackages];
  cb(results);
};

type Plugin = {
  plugin?: InitializedPluginPackage;
  onlinePackage?: search.Result;
};

const getUpdateVersion = (remoteVersion: string, localVersion: string) => {
  try {
    return semver.gt(remoteVersion, localVersion) ? remoteVersion : undefined;
  } catch (e) {
    return undefined;
  }
};

const Configuration = () => {
  const settingsStore = useSettingsStore();
  const [selectedPluginPackage, setSelectedPluginPackage] = useState<Plugin>({
    plugin: settingsStore.enabledPlugins[0] ?? settingsStore.disabledPlugins[0],
  });

  const [remotePackages, setRemotePackages] = useState<search.Result[]>([]);
  const [pagination] = useState(0);
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
    searchPackages(setRemotePackages);
  }, [pagination]);

  // Safety precaution: If the plugin is not remotely hosted don't allow deletion on disk
  const matchingRemotePlugin = remotePackages.find(
    (p) => p.name === selectedPluginPackage.plugin?.name
  );

  const canDelete = Boolean(matchingRemotePlugin);

  const updateVersion = getUpdateVersion(
    matchingRemotePlugin?.version ?? "0.0.0",
    selectedPluginPackage.plugin?.version ?? "0.0.0"
  );

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
                  {settingsStore.enabledPlugins.sort().map((plugin) => (
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
                      style={{
                        textAlign: "left",
                      }}
                    >
                      {plugin.description}
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
                      style={{ opacity: "0.8", textAlign: "left" }}
                      onClick={() => {
                        setSelectedPluginPackage({
                          plugin,
                        });
                      }}
                    >
                      {plugin.description}
                    </Button>
                  ))}
                </div>
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

            {selectedPluginPackage.onlinePackage && (
              <>
                <DetailSheet
                  pluginConfig={selectedPluginPackage.onlinePackage}
                  controls={[]}
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
                    key={selectedPluginPackage.plugin.id}
                    pluginPackage={selectedPluginPackage.plugin}
                    onChange={onChange}
                  />
                  {updateVersion && (
                    <Button
                      color="primary"
                      onClick={async () => {
                        if (
                          confirm(
                            "This will update the plugin in your plugins folder. Continue?"
                          )
                        ) {
                          const plugin = await installPluginLocal(
                            selectedPluginPackage.plugin!.name
                          );
                          if (plugin) {
                            console.log(
                              `Succesfully updated ${
                                selectedPluginPackage.plugin!.name
                              }`
                            );
                          } else {
                            setBanner(
                              `Failed to update ${
                                selectedPluginPackage.plugin!.name
                              }`
                            );
                          }
                        }
                      }}
                    >
                      Update to {updateVersion}
                    </Button>
                  )}
                  <Button
                    onClick={async () => {
                      if (
                        confirm("Are you sure you want to disable this plugin?")
                      ) {
                        if (
                          await disablePlugin(selectedPluginPackage.plugin!.id)
                        ) {
                          setBanner(RESTART_REQUIRED);
                          useSettingsStore.setState({
                            disabledPlugins: [
                              ...settingsStore.disabledPlugins,
                              selectedPluginPackage.plugin!,
                            ],
                            enabledPlugins: settingsStore.enabledPlugins.filter(
                              (p) => p.id !== selectedPluginPackage.plugin!.id
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
                          "Do you wish to continue and enable this plugin?"
                        )
                      ) {
                        if (
                          await enablePlugins([
                            selectedPluginPackage.plugin!.id,
                          ])
                        ) {
                          useSettingsStore.setState({
                            enabledPlugins: [
                              ...settingsStore.enabledPlugins,
                              selectedPluginPackage.plugin!,
                            ],
                            disabledPlugins:
                              settingsStore.disabledPlugins.filter(
                                (p) => p.id !== selectedPluginPackage.plugin!.id
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
                  {canDelete && (
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
                  )}
                  <PluginConfigurationUI
                    key={selectedPluginPackage.plugin.id}
                    pluginPackage={selectedPluginPackage.plugin!}
                    onChange={onChange}
                  />
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
