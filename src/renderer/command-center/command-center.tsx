import "./style.css";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { loadRemoteMetaData, savePluginsConfig } from "@ipc/plugins";
import { useSettingsStore, settingsStore } from "@stores/settings-store";
import { PluginConfig, PluginMetaData, RemotePackage } from "common/types";
import { DetailSheet } from "./detail-sheet";
import { GlobalSettings } from "./global-settings";
import { Tab, Tabs } from "./tabs";
import { attachOnChangeAndGroupByFolder, groupConfigByFolder } from "@utils/leva-utils";
import { MacrosPanel } from "./macros-ui/macros-panel";
import { Helmet } from "react-helmet";
import { sendWindow, SendWindowActionType } from "@ipc/relay";
import { InvokeBrowserTarget  } from "common/ipc-handle-names";
import { getUpdateVersion, localPluginRepository } from "./plugin-utils";
import { PluginButton } from "./plugin-button";

import "../../../bundled/assets/normalize.min.css";
import "../../../bundled/assets/open-props.1.4.min.css";
import "../../../bundled/assets/buttons.min.css";
import { searchPackagesRemote } from "@ipc/files";

document.title = "Command Center";

const s = document.createElement( "link" );
s.rel = "stylesheet";
s.href = "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap";
document.head.appendChild( s );

const onChange = debounce( ( pluginId: string, config: PluginConfig ) => {
    savePluginsConfig( pluginId, config );
    sendWindow( InvokeBrowserTarget.Game, {
        type: SendWindowActionType.PluginConfigChanged,
        payload: {
            pluginId,
            config,
        },
    } );
}, 100 );



const isDeprecated = ( plugin: PluginMetaData | undefined ) =>
    ( plugin?.keywords ?? [] ).includes( "deprecated" );

interface Plugin {
    local?: PluginMetaData;
    remote?: RemotePackage;
}

const CommandCenter = () => {
    const settings = useSettingsStore();
    const { activatedPlugins: activatedPlugins, deactivatedPlugins: deactivatedPlugins } = settings;
    const [ plugin, setSelectedPluginPackage ] = useState<Plugin>( {
        local: activatedPlugins[0] ?? deactivatedPlugins[0],
    } );

    const [ remotePackages, setRemotePackages ] = useState<RemotePackage[]>( [] );
    const [ banner, setBanner ] = useState( "" );

    const [ tabIndex, setTabIndex ] = useState( 0 );
    const [ mainTabIndex, setMainTabIndex ] = useState( 0 );

    useEffect( () => {
        if ( banner ) {
            const t = setTimeout( () => setBanner( "" ), 5000 );
            return () => clearTimeout( t );
        }
    }, [ banner ] );

    useEffect( () => {
        if ( !plugin.local ) {
            setSelectedPluginPackage( { remote: undefined } );
        }
        searchPackagesRemote( setRemotePackages );
    }, [ plugin.local ] );

    // populate the readme of a remote plugin
    useEffect( () => {
        if ( plugin.remote && !plugin.remote.readme ) {
            loadRemoteMetaData( plugin.remote.name ).then( ( metadata ) => {
                if ( plugin.remote && metadata?.readme && !plugin.remote.readme ) {
                    plugin.remote.readme = metadata.readme;
                    setSelectedPluginPackage( { ...plugin } );
                }
            } );
        }
    }, [ plugin ] );

    // Safety precaution: If the plugin is not remotely hosted don't allow deletion on disk
    const matchingRemotePlugin = remotePackages.find(
        ( p ) => p.name === plugin.local?.name
    );

    const updateVersion = getUpdateVersion( matchingRemotePlugin, plugin.local );

    const nonInstalledRemotePackages = remotePackages
        .filter(
            ( p ) =>
                !activatedPlugins.find(
                    ( installedPlugin ) => installedPlugin.name === p.name
                )
        )
        .filter(
            ( p ) =>
                !deactivatedPlugins.find(
                    ( installedPlugin ) => installedPlugin.name === p.name
                )
        )
        .filter( ( p ) => !( p.keywords ?? [] ).includes( "deprecated" ) );

    const localPluginButton = ( local: PluginMetaData, isDisabled: boolean ) => (
        <PluginButton
            icon={null}
            key={local.id}
            description={local.description}
            isDisabled={isDisabled}
            isSelected={plugin.local?.id === local.id}
            hasUpdateAvailable={
                !!getUpdateVersion(
                    remotePackages.find( ( p ) => p.name === local.name ),
                    local
                )
            }
            onClick={() => {
                setSelectedPluginPackage( {
                    local: local,
                } );
            }}
        />
    );

    const remotePackageButton = ( remote: RemotePackage ) => (
        <PluginButton
            key={remote.name}
            icon={null}
            description={remote.name}
            isOnline={true}
            isSelected={plugin.local?.name === remote.name}
            hasUpdateAvailable={false}
            onClick={() => {
                setSelectedPluginPackage( {
                    remote: remote,
                } );
            }}
        />
    );

    const {
        tryDeletePlugin,
        tryDeactivatePlugin: tryDisablePlugin,
        tryActivatePlugin: tryEnablePlugin,
        tryDownloadPlugin,
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
                    onChange={( index: number ) => setMainTabIndex( index )}
                    selectedIndex={mainTabIndex}>
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
                                }}>
                                <h3>Manage Plugins</h3>

                                <Tabs
                                    onChange={( index: number ) => setTabIndex( index )}
                                    selectedIndex={tabIndex}>
                                    <Tab label="Local">
                                        <p style={{ padding: "1rem" }}>
                                            Local plugins are installed in your plugins
                                            directory and can be enabled/disabled.
                                        </p>
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                            }}>
                                            {activatedPlugins
                                                .sort()
                                                .map( ( plugin ) =>
                                                    localPluginButton( plugin, false )
                                                )}
                                            <p
                                                style={{
                                                    margin: "var(--size-8) 0 var(--size-4) 0",
                                                    textDecoration: "uppercase",
                                                    fontSize: "var(--font-size-2)",
                                                    color: "var(--gray-7)",
                                                    textAlign: "center",
                                                }}>
                                                Disabled Plugins
                                            </p>
                                            {deactivatedPlugins.map( ( plugin ) =>
                                                localPluginButton( plugin, true )
                                            )}
                                        </div>
                                    </Tab>
                                    <Tab label="Online">
                                        <p style={{ padding: "1rem" }}>
                                            Online plugins are publicly available
                                            plugins anyone can publish for you to
                                            install here.
                                        </p>
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                            }}>
                                            {nonInstalledRemotePackages.map(
                                                remotePackageButton
                                            )}
                                        </div>
                                    </Tab>
                                </Tabs>
                            </aside>
                            <main
                                style={{
                                    flexGrow: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                }}>
                                {/* Plugin Title & Version */}
                                <h2>
                                    {plugin.local?.description ??
                                        plugin.local?.name ??
                                        plugin.remote?.name}{" "}
                                    - {plugin.local?.version ?? plugin.remote?.version}
                                </h2>

                                {plugin.remote && (
                                    <>
                                        <DetailSheet
                                            key={plugin.remote.name}
                                            pluginPackage={plugin.remote}
                                            controls={[]}
                                        />
                                        <button
                                            onClick={() =>
                                                tryDownloadPlugin( plugin.remote!.name )
                                            }>
                                            Download Plugin
                                        </button>
                                    </>
                                )}
                                {plugin.local && activatedPlugins.includes( plugin.local ) && (
                                    <>
                                        {!isDeprecated( plugin.local ) && (
                                            <DetailSheet
                                                key={plugin.local.id}
                                                pluginPackage={plugin.local}
                                                controls={groupConfigByFolder(
                                                    attachOnChangeAndGroupByFolder( {
                                                        config: plugin.local.config,
                                                        onChange: () => {
                                                            onChange(
                                                                plugin.local!.id,
                                                                plugin.local!.config!
                                                            );
                                                        },
                                                    } )
                                                )}
                                                updateAvailable={!!updateVersion}
                                            />
                                        )}
                                        {isDeprecated( plugin.local ) && (
                                            <div style={{ marginTop: "1rem" }}>
                                                🛑 The author of this plugin has marked
                                                it as deprecated and this plugin should
                                                be disabled/deleted and no longer used.
                                            </div>
                                        )}
                                        {updateVersion && (
                                            <button
                                                style={{
                                                    backgroundColor: "var(--yellow-3)",
                                                }}
                                                onClick={() =>
                                                    tryUpdatePlugin( plugin.local!.name )
                                                }>
                                                Update to {updateVersion}
                                            </button>
                                        )}
                                        <button
                                            onClick={() =>
                                                tryDisablePlugin( plugin.local!.id )
                                            }>
                                            Disable Plugin
                                        </button>
                                    </>
                                )}
                                {plugin.local &&
                                    deactivatedPlugins.includes( plugin.local ) && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    tryEnablePlugin( plugin.local!.id )
                                                }>
                                                Enable Plugin
                                            </button>
                                            {(
                                                <button
                                                    style={{
                                                        background: "var(--red-5)",
                                                        color: "white",
                                                    }}
                                                    onClick={() =>
                                                        tryDeletePlugin(
                                                            plugin.local!.id
                                                        )
                                                    }>
                                                    Delete Plugin
                                                </button>
                                            )}
                                            {!isDeprecated( plugin.local ) && (
                                                <DetailSheet
                                                    key={plugin.local.id}
                                                    pluginPackage={plugin.local}
                                                    controls={groupConfigByFolder(
                                                        attachOnChangeAndGroupByFolder( {
                                                            config: plugin.local.config,
                                                            onChange: () => {
                                                                onChange(
                                                                    plugin.local!.id,
                                                                    plugin.local!
                                                                        .config!
                                                                );
                                                            },
                                                        } )
                                                    )}
                                                />
                                            )}
                                            {isDeprecated( plugin.local ) && (
                                                <div style={{ marginTop: "1rem" }}>
                                                    🛑 The author of this plugin has
                                                    marked it as deprecated and this
                                                    plugin should be disabled/deleted
                                                    and no longer used.
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
                </Tabs>
            </div>
        </>
    );
};

const container = document.getElementById( "app" );
const root = createRoot( container! );

settingsStore()
    .load()
    .then( () => {
        root.render( <CommandCenter /> );
    } );
