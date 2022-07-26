import search from "libnpmsearch";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
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
import { installPluginLocal } from "../plugins";
import DetailSheet from "./detail-sheet";
import { GlobalSettings } from "./global-settings";
import { Tab, Tabs } from "./tabs";
import { mapConfigToLeva } from "./map-config-to-leva";
import { MacrosPanel } from "./macros-ui/macros-panel";
import { Helmet } from "react-helmet";
import { openCascStorage, readCascFileBatch } from "@ipc/casclib";
import { sendWindow, SendWindowActionType } from "@ipc/relay";
import { InvokeBrowserTarget } from "common/ipc-handle-names";

if (module.hot) {
  module.hot.accept();
}

const s = document.createElement("link");
s.rel = "stylesheet";
s.href =
  "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap";
document.head.appendChild(s);

const onChange = debounce(async (pluginId: string, config: any) => {
  updatePluginsConfig(pluginId, config);
  sendWindow(InvokeBrowserTarget.Game, {
    type: SendWindowActionType.PluginConfigChanged,
    payload: {
      pluginId,
      config,
    },
  });
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

const _iconsBase64: Record<number, string> = {};

const CommandCenter = () => {
  const settings = useSettingsStore();
  const [selectedPluginPackage, setSelectedPluginPackage] = useState<Plugin>({
    plugin: settings.enabledPlugins[0] ?? settings.disabledPlugins[0],
  });

  const [remotePackages, setRemotePackages] = useState<search.Result[]>([]);
  const [pagination] = useState(0);
  const [banner, setBanner] = useState("");

  const [tabIndex, setTabIndex] = useState(0);
  const [mainTabIndex, setMainTabIndex] = useState(0);

  useEffect(() => {
    if (!settings.errors.length) {
      (async () => {
        await openCascStorage(settings.data.directories.starcraft);

        const pluginIcons = [
          ...settings.enabledPlugins,
          ...settings.disabledPlugins,
        ]
          .map((p) => p.config?.icon ?? "filter_center_focus")
          .filter((i) => typeof i === "number");
        const icons = [
          ...new Set(
            [...pluginIcons, 230, 389].filter((i) => !_iconsBase64[i])
          ),
        ];

        const buffers = await readCascFileBatch(
          icons.map((i: number) => `webui/dist/lib/images/cmdicons.${i}.png`),
          "base64"
        );

        for (let i = 0; i < icons.length; i++) {
          _iconsBase64[icons[i]] = `data:image/png;base64,${buffers[i]}`;
        }
      })();
    }
  }, [settings.errors.length]);

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

  const pluginsWithUpdatesAvailable = settings.enabledPlugins.reduce(
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
    icon: number | string | null;
    name: string;
    description?: string;
    isSelected: boolean;
    onClick: () => void;
    isDisabled?: boolean;
    isOnline?: boolean;
  }
  const PluginButton = ({
    icon,
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
      {typeof icon === "number" && (
        <img
          style={{ width: "var(--size-8)" }}
          src={_iconsBase64[icon]}
          alt={name}
        />
      )}
      {typeof icon === "string" && <i className="material-icons">{icon}</i>}
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
        !settings.enabledPlugins.find(
          (installedPlugin) => installedPlugin.name === p.name
        )
    )
    .filter(
      (p) =>
        !settings.disabledPlugins.find(
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
          disabledPlugins: [...settings.disabledPlugins, plugin],
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
            ...settings.disabledPlugins,
            selectedPluginPackage.plugin!,
          ],
          enabledPlugins: settings.enabledPlugins.filter(
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
            ...settings.enabledPlugins,
            selectedPluginPackage.plugin!,
          ],
          disabledPlugins: settings.disabledPlugins.filter(
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
          disabledPlugins: settings.disabledPlugins.filter(
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
      <Helmet>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </Helmet>
      <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
        {banner && <p className="mui--bg-accent mui--text-light">{banner}</p>}

        <Tabs
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
                  onChange={(index: number) => setTabIndex(index)}
                  selectedIndex={tabIndex}
                >
                  <Tab label="Local">
                    <p style={{ padding: "1rem" }}>
                      Local plugins are installed in your plugins directory and
                      can be enabled/disabled.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {settings.enabledPlugins.sort().map((plugin) => (
                        <PluginButton
                          icon={plugin.config?.icon}
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
                      {settings.disabledPlugins.map((plugin) => (
                        <PluginButton
                          icon={plugin.config?.icon}
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
                          icon={null}
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
                  settings.enabledPlugins.includes(
                    selectedPluginPackage.plugin
                  ) && (
                    <>
                      {!selectedPluginPackage.plugin.config?.system
                        ?.deprecated && (
                        <DetailSheet
                          key={selectedPluginPackage.plugin.id}
                          pluginPackage={selectedPluginPackage.plugin}
                          controls={mapConfigToLeva(
                            selectedPluginPackage.plugin.config,
                            () => {
                              onChange(
                                selectedPluginPackage.plugin!.id,
                                selectedPluginPackage.plugin!.config
                              );
                            }
                          )}
                        />
                      )}
                      {selectedPluginPackage.plugin.config?.system
                        ?.deprecated && (
                        <div style={{ marginTop: "1rem" }}>
                          🛑 The author of this plugin has marked it as
                          deprecated and this plugin should be disabled and no
                          longer used.
                        </div>
                      )}
                      {updateVersion && (
                        <button onClick={tryUpdatePlugin}>
                          Update to {updateVersion}
                        </button>
                      )}
                      <button onClick={tryDisablePlugin}>Disable Plugin</button>
                    </>
                  )}
                {selectedPluginPackage.plugin &&
                  settings.disabledPlugins.includes(
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
                          selectedPluginPackage.plugin.config,
                          () =>
                            onChange(
                              selectedPluginPackage.plugin!.id,
                              selectedPluginPackage.plugin!.config
                            )
                        )}
                      />
                    </>
                  )}
              </main>
            </div>
          </Tab>
          <Tab label="Macros">
            <MacrosPanel iconCache={_iconsBase64} />
          </Tab>
        </Tabs>
      </div>
    </>
  );
};

const container = document.getElementById("app");
const root = createRoot(container!);

settingsStore()
  .load()
  .then(() => {
    root.render(<CommandCenter />);
  });
