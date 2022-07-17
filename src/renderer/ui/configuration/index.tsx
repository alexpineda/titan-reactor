import search from "libnpmsearch";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { render } from "react-dom";
import semver from "semver";
import "./style.css";

import {
  deletePlugin,
  disablePlugin,
  enablePlugins,
  updatePluginsConfig,
} from "@ipc/plugins";
import settingsStore, { useSettingsStore } from "@stores/settings-store";
import { InitializedPluginPackage } from "common/types";
import { installPluginLocal } from "../../plugins";
import DetailSheet from "./detail-sheet";
import { GlobalSettings } from "./global-settings";
import { Tab, Tabs } from "./tabs";
import { mapConfigToLeva } from "./map-config-to-leva";

// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept();
}

// @ts-ignore
window.isTitanReactorConfig = true;

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
  const [mainTabIndex, setMainTabIndex] = useState(0);

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

  const pluginsWithUpdatesAvailable = settingsStore.enabledPlugins.reduce(
    (memo, plugin) => {
      const remote = remotePackages.find((p) => p.name === plugin.name);

      const updateVersion = getUpdateVersion(
        remote?.version ?? "0.0.0",
        plugin.version ?? "0.0.0"
      );

      if (updateVersion) {
        return {
          ...memo,
          [plugin.name]: updateVersion,
        };
      } else {
        return memo;
      }
    },
    {}
  );

  const canDelete = Boolean(matchingRemotePlugin);

  const updateVersion = getUpdateVersion(
    matchingRemotePlugin?.version ?? "0.0.0",
    selectedPluginPackage.plugin?.version ?? "0.0.0"
  );

  interface PluginButtonProps {
    name: string;
    description?: string;
    isSelected: boolean;
    onClick: () => void;
    isDisabled?: boolean;
    isOnline?: boolean;
  }
  const PluginButton = ({
    name,
    description,
    isSelected,
    onClick,
    isDisabled = false,
    isOnline = false,
  }: PluginButtonProps) => (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        color: isDisabled
          ? "var(--gray-5)"
          : isSelected
          ? "var(--gray-9)"
          : "var(--gray-7)",
      }}
    >
      {description}{" "}
      {pluginsWithUpdatesAvailable[
        name as keyof typeof pluginsWithUpdatesAvailable
      ] &&
        !isDisabled &&
        !isOnline && (
          <span
            style={{
              fontSize: "30%",
              position: "absolute",
              top: "-5px",
            }}
          >
            🔴
          </span>
        )}
    </button>
  );

  const nonInstalledRemotePackages = remotePackages
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
    );

  const tryInstallPlugin = async () => {
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
          disabledPlugins: [...settingsStore.disabledPlugins, plugin],
        });
        setSelectedPluginPackage({ plugin });
        setBanner(`${plugin.name} installed!`);
        setTabIndex(0);
      } else {
        setBanner(
          `Failed to install ${selectedPluginPackage.onlinePackage!.name}`
        );
      }
    }
  };

  const tryUpdatePlugin = async () => {
    if (
      confirm("This will update the plugin in your plugins folder. Continue?")
    ) {
      const plugin = await installPluginLocal(
        selectedPluginPackage.plugin!.name
      );
      if (plugin) {
        console.log(
          `Succesfully updated ${selectedPluginPackage.plugin!.name}`
        );
      } else {
        setBanner(`Failed to update ${selectedPluginPackage.plugin!.name}`);
      }
    }
  };

  const tryDisablePlugin = async () => {
    if (confirm("Are you sure you want to disable this plugin?")) {
      if (await disablePlugin(selectedPluginPackage.plugin!.id)) {
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
        setBanner(`Failed to disable ${selectedPluginPackage.plugin!.name}`);
      }
    }
  };

  const tryEnablePlugin = async () => {
    if (confirm("Do you wish to continue and enable this plugin?")) {
      if (await enablePlugins([selectedPluginPackage.plugin!.id])) {
        useSettingsStore.setState({
          enabledPlugins: [
            ...settingsStore.enabledPlugins,
            selectedPluginPackage.plugin!,
          ],
          disabledPlugins: settingsStore.disabledPlugins.filter(
            (p) => p.id !== selectedPluginPackage.plugin!.id
          ),
        });
      } else {
        setBanner("Failed to enable plugin");
      }
    }
  };

  const tryDeletePlugin = async () => {
    if (
      confirm("Are you sure you wish to place this plugin in the trashbin?")
    ) {
      if (await deletePlugin(selectedPluginPackage.plugin!.id)) {
        setBanner("Plugin files were placed in trash bin");
        useSettingsStore.setState({
          disabledPlugins: settingsStore.disabledPlugins.filter(
            (p) => p.id !== selectedPluginPackage.plugin!.id
          ),
        });
        setSelectedPluginPackage({ plugin: undefined });
      } else {
        setBanner("Failed to delete plugin");
      }
    }
  };

  return (
    <>
      <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
        {banner && <p className="mui--bg-accent mui--text-light">{banner}</p>}

        <Tabs
          //@ts-ignore
          onChange={(index: number) => setMainTabIndex(index)}
          selectedIndex={mainTabIndex}
        >
          <Tab label="Global Settings">
            <GlobalSettings />
          </Tab>
          <Tab label="Plugins">
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
                  <Tab label="Local">
                    <p style={{ padding: "1rem" }}>
                      Local plugins are installed in your plugins directory and
                      can be enabled/disabled.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {settingsStore.enabledPlugins.sort().map((plugin) => (
                        <PluginButton
                          key={plugin.id}
                          name={plugin.name}
                          description={plugin.description}
                          isSelected={
                            selectedPluginPackage.plugin?.id === plugin.id
                          }
                          onClick={() => {
                            setSelectedPluginPackage({
                              plugin,
                            });
                          }}
                        />
                      ))}
                      <p
                        style={{
                          margin: "var(--size-8) 0 var(--size-4) 0",
                          textDecoration: "uppercase",
                          fontSize: "var(--font-size-2)",
                          color: "var(--gray-7)",
                          textAlign: "center",
                        }}
                      >
                        Disabled Plugins
                      </p>
                      {settingsStore.disabledPlugins.map((plugin) => (
                        <PluginButton
                          key={plugin.id}
                          name={plugin.name}
                          description={plugin.description}
                          isDisabled={true}
                          isSelected={
                            selectedPluginPackage.plugin?.id === plugin.id
                          }
                          onClick={() => {
                            setSelectedPluginPackage({
                              plugin,
                            });
                          }}
                        />
                      ))}
                    </div>
                  </Tab>
                  <Tab label="Online">
                    <p style={{ padding: "1rem" }}>
                      Online plugins are publicly available plugins anyone can
                      publish for you to install here.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {nonInstalledRemotePackages.map((onlinePackage) => (
                        <PluginButton
                          key={onlinePackage.name}
                          name={onlinePackage.name}
                          description={onlinePackage.name}
                          isOnline={true}
                          isSelected={
                            selectedPluginPackage.onlinePackage?.name ===
                            onlinePackage.name
                          }
                          onClick={() => {
                            setSelectedPluginPackage({
                              onlinePackage,
                            });
                          }}
                        />
                      ))}
                    </div>
                  </Tab>
                </Tabs>
              </aside>
              <main
                style={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {selectedPluginPackage && (
                  <h2>
                    {selectedPluginPackage.plugin?.description ??
                      selectedPluginPackage.plugin?.name ??
                      selectedPluginPackage.onlinePackage?.name}{" "}
                    -{" "}
                    {selectedPluginPackage.plugin?.version ??
                      selectedPluginPackage.onlinePackage?.version}
                  </h2>
                )}

                {selectedPluginPackage.onlinePackage && (
                  <>
                    <DetailSheet
                      key={selectedPluginPackage.onlinePackage.name}
                      pluginPackage={selectedPluginPackage.onlinePackage}
                      controls={[]}
                    />
                    <button onClick={tryInstallPlugin}>Install Plugin</button>
                  </>
                )}
                {selectedPluginPackage.plugin &&
                  settingsStore.enabledPlugins.includes(
                    selectedPluginPackage.plugin
                  ) && (
                    <>
                      <DetailSheet
                        key={selectedPluginPackage.plugin.id}
                        pluginPackage={selectedPluginPackage.plugin}
                        controls={mapConfigToLeva(
                          selectedPluginPackage.plugin.id,
                          selectedPluginPackage.plugin.config,
                          onChange
                        )}
                      />
                      {updateVersion && (
                        <button onClick={tryUpdatePlugin}>
                          Update to {updateVersion}
                        </button>
                      )}
                      <button onClick={tryDisablePlugin}>Disable Plugin</button>
                    </>
                  )}
                {selectedPluginPackage.plugin &&
                  settingsStore.disabledPlugins.includes(
                    selectedPluginPackage.plugin
                  ) && (
                    <>
                      <button onClick={tryEnablePlugin}>Enable Plugin</button>
                      {canDelete && (
                        <button
                          style={{ background: "var(--red-5)", color: "white" }}
                          onClick={tryDeletePlugin}
                        >
                          Delete Plugin
                        </button>
                      )}
                      <DetailSheet
                        key={selectedPluginPackage.plugin.id}
                        pluginPackage={selectedPluginPackage.plugin}
                        controls={mapConfigToLeva(
                          selectedPluginPackage.plugin.id,
                          selectedPluginPackage.plugin.config,
                          onChange
                        )}
                      />
                    </>
                  )}
              </main>
            </div>
          </Tab>
        </Tabs>
      </div>
    </>
  );
};

settingsStore()
  .load()
  .then(() => {
    render(<Configuration />, document.getElementById("app"));
  });
