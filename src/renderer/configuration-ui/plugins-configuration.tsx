import {
    attachOnChangeAndGroupByFolder,
    groupConfigByFolder,
} from "./leva-plugins/leva-utils";
import { DetailSheet } from "./detail-sheet";
import { PluginConfig, PluginMetaData } from "common/types";
import { debounce } from "lodash";
import { PluginButton } from "./plugin-button";
import { Tab, Tabs } from "./tabs";
import { useState } from "react";
import { sendWindow } from "./send-window";
// import { useStore } from "zustand";
import { useSettingsStore } from "@stores/settings-store";

const onChange = debounce( ( pluginId: string, config: PluginConfig ) => {
    sendWindow( "command-center-plugin-config-changed", {
        pluginId,
        config,
    } );
}, 100 );

const isDeprecated = ( plugin: PluginMetaData | undefined ) =>
    ( plugin?.keywords ?? [] ).includes( "deprecated" );

    declare global {
        interface Window {
            deps: {
                useSettingsStore: typeof useSettingsStore
            }
        }
    }

export const PluginsConfiguration = ( {
    setBanner,
}: {
    setBanner: React.Dispatch<React.SetStateAction<string>>;
} ) => {
    const [ tabIndex, setTabIndex ] = useState( 0 );
    const settings = useSettingsStore(); //useStore( window.deps.useSettingsStore )

    console.log( settings )

    const {
         activatedPlugins,
          deactivatedPlugins,
    } = settings;

    const [ plugin, setSelectedPluginPackage ] = useState<PluginMetaData | undefined>(
        activatedPlugins[0] ?? deactivatedPlugins[0]
    );

    const tryDeactivatePlugin = ( pluginId: string ) => {
        if ( confirm( "Are you sure you want to deactivate this plugin?" ) ) {
            sendWindow( "command-center-plugin-deactivated", pluginId );
        }
    };

    const tryActivatePlugin = async ( pluginId: string ) => {
        if ( confirm( "Do you wish to continue and activate this plugin?" ) ) {
            const plugin = ( await settings.init() ).activatedPlugins.find(
                ( p ) => p.id === pluginId
            );
            if ( plugin ) {
                //todo change this to pluginId
                sendWindow( "command-center-plugins-activated", [ plugin ] );
                setSelectedPluginPackage( plugin );
            } else {
                setBanner( "Failed to activate plugin" );
            }
        }
    };

    const localPluginButton = ( local: PluginMetaData, isDisabled: boolean ) => (
        <PluginButton
            icon={null}
            key={local.id}
            description={local.description}
            isDisabled={isDisabled}
            isSelected={plugin?.id === local.id}
            onClick={() => {
                setSelectedPluginPackage( local );
            }}
        />
    );

    return (
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
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                            }}>
                            {activatedPlugins
                                .sort()
                                .map( ( plugin ) => localPluginButton( plugin, false ) )}
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
                    {plugin?.description ?? plugin?.name} - {plugin?.version}
                </h2>

                {plugin && activatedPlugins.includes( plugin ) && (
                    <>
                        {!isDeprecated( plugin ) && (
                            <DetailSheet
                                key={plugin.id}
                                pluginPackage={plugin}
                                controls={groupConfigByFolder(
                                    attachOnChangeAndGroupByFolder( {
                                        config: plugin.config,
                                        onChange: () => {
                                            onChange( plugin.id, plugin.config );
                                        },
                                    } )
                                )}
                            />
                        )}
                        {isDeprecated( plugin ) && (
                            <div style={{ marginTop: "1rem" }}>
                                🛑 The author of this plugin has marked it as deprecated
                                and this plugin should be disabled/deleted and no longer
                                used.
                            </div>
                        )}
                        <button onClick={() => tryDeactivatePlugin( plugin.id )}>
                            Disable Plugin
                        </button>
                    </>
                )}
                {plugin && deactivatedPlugins.includes( plugin ) && (
                    <>
                        <button onClick={() => tryActivatePlugin( plugin.id )}>
                            Enable Plugin
                        </button>
                        {!isDeprecated( plugin ) && (
                            <DetailSheet
                                key={plugin.id}
                                pluginPackage={plugin}
                                controls={groupConfigByFolder(
                                    attachOnChangeAndGroupByFolder( {
                                        config: plugin.config,
                                        onChange: () => {
                                            onChange( plugin.id, plugin.config );
                                        },
                                    } )
                                )}
                            />
                        )}
                        {isDeprecated( plugin ) && (
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
    );
};
