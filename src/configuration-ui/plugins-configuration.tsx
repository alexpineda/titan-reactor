import {
    attachOnChangeAndGroupByFolder,
    groupConfigByFolder,
} from "./leva-plugins/leva-utils";
import { DetailSheet } from "./detail-sheet";
import { PluginConfig, PluginMetaData } from "common/types";
import debounce from "lodash.debounce";
import { PluginButton } from "./plugin-button";
import { Tab, Tabs } from "./tabs";
import { useRef, useState } from "react";
import { sendWindow } from "./send-window";
import { useStore } from "zustand";
import "./window-dep";

const onChange = debounce( ( pluginId: string, config: PluginConfig ) => {
    const plugins = window.deps.usePluginsStore.getState();
    _updateKey++;
    plugins.savePluginConfig( pluginId, config );

    sendWindow( "command-center-plugin-config-changed", {
        pluginId,
        config,
    } );

}, 100 );

const isDeprecated = ( plugin: PluginMetaData | undefined ) =>
    ( plugin?.keywords ?? [] ).includes( "deprecated" );

    //hack: need to update controls when plugin is changed
let _updateKey = 0;

export const PluginsConfiguration = ({
    setBanner,
}: {
    setBanner: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const [ tabIndex, setTabIndex ] = useState( 0 );
    const { plugins } = useStore( window.deps.usePluginsStore );

    const [ plugin, setSelectedPluginPackage ] = useState<PluginMetaData | undefined>(
        plugins[0]
    );

    const oldConfig = useRef( plugin?.config );
    const prevId = useRef( plugin?.id );

    if ( prevId.current !== plugin?.id ) {
        oldConfig.current = plugin?.config;
        prevId.current = plugin?.id;
    }


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
                    <Tab label="Plugins">
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                            }}>
                            {plugins
                                .sort((a, b) => {
                                    if (a.isSceneController && !b.isSceneController) {
                                        return -1;
                                    } else if (!a.isSceneController && b.isSceneController) {
                                        return 1;
                                    }
                                    return (a.description ?? a.name).localeCompare(b.description ?? b.name);
                                })
                                .map( ( plugin ) => localPluginButton( plugin, !plugin.config?._enabled?.value ) )}
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

                {plugin && plugins.includes( plugin ) && (
                    <>
                        {!isDeprecated( plugin ) && (
                            <DetailSheet
                                key={plugin.id + _updateKey}
                                pluginPackage={plugin}
                                controls={groupConfigByFolder(
                                    attachOnChangeAndGroupByFolder( {
                                        config: plugin.config,
                                        onChange: () => {
                                            if ( oldConfig.current !== plugin.config ) {
                                                if (plugin.config._enabled.value !== oldConfig.current!._enabled.value) {
                                                    setBanner( "Effects will not take place until game restart" );
                                                }
                                            }
                                            onChange( plugin.id, plugin.config );
                                            oldConfig.current = plugin.config;

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
