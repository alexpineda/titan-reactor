import search from "libnpmsearch";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { updatePluginsConfig } from "@ipc/plugins";
import settingsStore, { useSettingsStore } from "@stores/settings-store";
import { InitializedPluginPackage } from "common/types";
import DetailSheet from "./detail-sheet";
import { GlobalSettings } from "./global-settings";
import { Tab, Tabs } from "./tabs";
import { mapConfigToLeva } from "@utils/leva-utils";
import { MacrosPanel } from "./macros-ui/macros-panel";
import { Helmet } from "react-helmet";
import { openCascStorage, readCascFileBatch } from "@ipc/casclib";
import { sendWindow, SendWindowActionType } from "@ipc/relay";
import { InvokeBrowserTarget } from "common/ipc-handle-names";
import { getUpdateVersion, localPluginRepository } from "./plugin-utils";
import { PluginButton } from "./plugin-button";

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

type Plugin = {
  local?: InitializedPluginPackage;
  remote?: RemotePackage;
};

const _iconsBase64: Record<number, string> = {};

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
    if (!settings.errors.length) {
      (async () => {
        await openCascStorage(settings.data.directories.starcraft);

        const pluginIcons = [...enabledPlugins, ...disabledPlugins]
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
    if (!plugin.local) {
      setSelectedPluginPackage({ remote: undefined });
    }
    searchPackages(setRemotePackages);
  }, [pagination]);

  // Safety precaution: If the plugin is not remotely hosted don't allow deletion on disk
  const matchingRemotePlugin = remotePackages.find(
    (p) => p.name === plugin.local?.name
  );

  const canDelete = Boolean(matchingRemotePlugin);

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
    );

  const Icon = ({ icon }: { icon: number | string }) => (
    <>
      {typeof icon === "number" && (
        <img style={{ width: "var(--size-8)" }} src={_iconsBase64[icon]} />
      )}
      {typeof icon === "string" && <i className="material-icons">{icon}</i>}
    </>
  );

  const localPluginButton = (local: InitializedPluginPackage) => (
    <PluginButton
      icon={local.config?.icon ? <Icon icon={local.config?.icon} /> : null}
      key={local.id}
      description={local.description}
      isDisabled={true}
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
                      {enabledPlugins.sort().map(localPluginButton)}
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
                      {disabledPlugins.map(localPluginButton)}
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
                    {!plugin.local.config?.system?.deprecated && (
                      <DetailSheet
                        key={plugin.local.id}
                        pluginPackage={plugin.local}
                        controls={mapConfigToLeva(plugin.local.config, () => {
                          onChange(plugin.local!.id, plugin.local!.config);
                        })}
                      />
                    )}
                    {plugin.local.config?.system?.deprecated && (
                      <div style={{ marginTop: "1rem" }}>
                        🛑 The author of this plugin has marked it as deprecated
                        and this plugin should be disabled and no longer used.
                      </div>
                    )}
                    {updateVersion && (
                      <button
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
                    <DetailSheet
                      key={plugin.local.id}
                      pluginPackage={plugin.local}
                      controls={mapConfigToLeva(plugin.local.config, () =>
                        onChange(plugin.local!.id, plugin.local!.config)
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
