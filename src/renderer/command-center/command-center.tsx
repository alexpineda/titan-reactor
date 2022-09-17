import search from "libnpmsearch";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { savePluginsConfig } from "@ipc/plugins";
import settingsStore, { useSettingsStore } from "@stores/settings-store";
import { PluginMetaData } from "common/types";
import DetailSheet from "./detail-sheet";
import { GlobalSettings } from "./global-settings";
import { Tab, Tabs } from "./tabs";
import { attachOnChangeAndGroupByFolder } from "@utils/leva-utils";
import { MacrosPanel } from "./macros-ui/macros-panel";
import { Helmet } from "react-helmet";
import { sendWindow, SendWindowActionType } from "@ipc/relay";
import { InvokeBrowserTarget } from "common/ipc-handle-names";
import { getUpdateVersion, localPluginRepository } from "./plugin-utils";
import { PluginButton } from "./plugin-button";
import { ReplayQueue } from "./replay-queue";
import semver from "semver";

if (module.hot) {
  module.hot.accept();
}

document.title = "Command Center";

const s = document.createElement("link");
s.rel = "stylesheet";
s.href =
  "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap";
document.head.appendChild(s);

const onChange = debounce(async (pluginId: string, config: any) => {
  savePluginsConfig(pluginId, config);
  sendWindow(InvokeBrowserTarget.Game, {
    type: SendWindowActionType.PluginConfigChanged,
    payload: {
      pluginId,
      config,
    },
  });
}, 100);

type RemotePackage = search.Result;

const LIMIT = 1000;
const SEARCH_KEYWORDS = "keywords:titan-reactor-plugin";
const SEARCH_OFFICIAL = "@titan-reactor-plugins";

const searchPackages = async (cb: (val: RemotePackage[]) => void) => {
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

const isDeprecated = (plugin: PluginMetaData | undefined) =>
  (plugin?.keywords ?? []).includes("deprecated");

type Plugin = {
  local?: PluginMetaData;
  remote?: RemotePackage;
};

const CommandCenter = () => {
  const settings = useSettingsStore();
  const { enabledPlugins, disabledPlugins } = settings;
  const [plugin, setSelectedPluginPackage] = useState<Plugin>({
    local: enabledPlugins[0] ?? disabledPlugins[0],
  });

  const [remotePackages, setRemotePackages] = useState<RemotePackage[]>([]);
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
    if (!plugin.local) {
      setSelectedPluginPackage({ remote: undefined });
    }
    searchPackages(setRemotePackages);
  }, [pagination]);

  // Safety precaution: If the plugin is not remotely hosted don't allow deletion on disk
  const matchingRemotePlugin = remotePackages.find(
    (p) => p.name === plugin.local?.name
  );
  const localVersionGreater = semver.gt(
    plugin.local?.version ?? "0.0.0",
    matchingRemotePlugin?.version ?? "0.0.0"
  );

  const canDelete = Boolean(matchingRemotePlugin && !localVersionGreater);

  const updateVersion = getUpdateVersion(matchingRemotePlugin, plugin.local);

  const nonInstalledRemotePackages = remotePackages
    .filter(
      (p) =>
        !enabledPlugins.find(
          (installedPlugin) => installedPlugin.name === p.name
        )
    )
    .filter(
      (p) =>
        !disabledPlugins.find(
          (installedPlugin) => installedPlugin.name === p.name
        )
    )
    .filter((p) => !(p.keywords ?? []).includes("deprecated"));

  const Icon = ({ icon }: { icon: string }) => (
    <i className="material-icons">{icon}</i>
  );

  const localPluginButton = (local: PluginMetaData, isDisabled: boolean) => (
    <PluginButton
      icon={local.config?.icon ? <Icon icon={local.config!.icon} /> : null}
      key={local.id}
      description={local.description}
      isDisabled={isDisabled}
      isSelected={plugin.local?.id === local.id}
      hasUpdateAvailable={
        !!getUpdateVersion(
          remotePackages.find((p) => p.name === local.name),
          local
        )
      }
      onClick={() => {
        setSelectedPluginPackage({
          local: local,
        });
      }}
    />
  );

  const remotePackageButton = (remote: RemotePackage) => (
    <PluginButton
      icon={null}
      description={remote.name}
      isOnline={true}
      isSelected={plugin.local?.name === remote.name}
      hasUpdateAvailable={false}
      onClick={() => {
        setSelectedPluginPackage({
          remote: remote,
        });
      }}
    />
  );

  const {
    tryDeletePlugin,
    tryDisablePlugin,
    tryEnablePlugin,
    tryInstallPlugin,
    tryUpdatePlugin,
  } = localPluginRepository(
    setSelectedPluginPackage,
    setBanner,
    setTabIndex,
    settings.load
  );

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
                      {enabledPlugins
                        .sort()
                        .map((plugin) => localPluginButton(plugin, false))}
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
                      {disabledPlugins.map((plugin) =>
                        localPluginButton(plugin, true)
                      )}
                    </div>
                  </Tab>
                  <Tab label="Online">
                    <p style={{ padding: "1rem" }}>
                      Online plugins are publicly available plugins anyone can
                      publish for you to install here.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {nonInstalledRemotePackages.map(remotePackageButton)}
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
                {plugin && (
                  <h2>
                    {plugin.local?.description ??
                      plugin.local?.name ??
                      plugin.remote?.name}{" "}
                    - {plugin.local?.version ?? plugin.remote?.version}
                  </h2>
                )}

                {plugin.remote && (
                  <>
                    <DetailSheet
                      key={plugin.remote.name}
                      pluginPackage={plugin.remote}
                      controls={[]}
                    />
                    <button
                      onClick={() => tryInstallPlugin(plugin.remote!.name)}
                    >
                      Install Plugin
                    </button>
                  </>
                )}
                {plugin.local && enabledPlugins.includes(plugin.local) && (
                  <>
                    {!isDeprecated(plugin.local) && (
                      <DetailSheet
                        key={plugin.local.id}
                        pluginPackage={plugin.local}
                        controls={attachOnChangeAndGroupByFolder({
                          config: plugin.local.config,
                          onChange: () => {
                            onChange(plugin.local!.id, plugin.local!.config);
                          },
                        })}
                        updateAvailable={!!updateVersion}
                      />
                    )}
                    {isDeprecated(plugin.local) && (
                      <div style={{ marginTop: "1rem" }}>
                        🛑 The author of this plugin has marked it as deprecated
                        and this plugin should be disabled/deleted and no longer
                        used.
                      </div>
                    )}
                    {updateVersion && (
                      <button
                        style={{ backgroundColor: "var(--yellow-3)" }}
                        onClick={() => tryUpdatePlugin(plugin.local!.name)}
                      >
                        Update to {updateVersion}
                      </button>
                    )}
                    <button onClick={() => tryDisablePlugin(plugin.local!.id)}>
                      Disable Plugin
                    </button>
                  </>
                )}
                {plugin.local && disabledPlugins.includes(plugin.local) && (
                  <>
                    <button onClick={() => tryEnablePlugin(plugin.local!.id)}>
                      Enable Plugin
                    </button>
                    {canDelete && (
                      <button
                        style={{ background: "var(--red-5)", color: "white" }}
                        onClick={() => tryDeletePlugin(plugin.local!.id)}
                      >
                        Delete Plugin
                      </button>
                    )}
                    {!isDeprecated(plugin.local) && (
                      <DetailSheet
                        key={plugin.local.id}
                        pluginPackage={plugin.local}
                        controls={attachOnChangeAndGroupByFolder({
                          config: plugin.local.config,
                          onChange: () => {
                            onChange(plugin.local!.id, plugin.local!.config);
                          },
                        })}
                      />
                    )}
                    {isDeprecated(plugin.local) && (
                      <div style={{ marginTop: "1rem" }}>
                        🛑 The author of this plugin has marked it as deprecated
                        and this plugin should be disabled/deleted and no longer
                        used.
                      </div>
                    )}
                  </>
                )}
              </main>
            </div>
          </Tab>
          <Tab label="Macros">
            <MacrosPanel />
          </Tab>
          <Tab label="Replay Queue">
            <ReplayQueue />
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
