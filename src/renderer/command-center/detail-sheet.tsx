import { PluginMetaData } from "common/types";
import ReactMarkdown from "react-markdown/index";
import { useControls, useCreateStore } from "leva";
import semver from "semver";
import { Tab, Tabs } from "./tabs";
import ErrorBoundary from "./error-boundary";
import { createLevaPanel } from "./create-leva-panel";
import { groupConfigByFolder } from "@utils/leva-utils";
import { Schema } from "leva/plugin";
import { HostApiVersion, getPluginAPIVersion } from "common/utils/api-version";


let _globalLastTab = 0;

export const DetailSheet = ( {
    pluginPackage,
    controls,
    updateAvailable,
}: {
    controls: ReturnType<typeof groupConfigByFolder>;
    pluginPackage: Partial<PluginMetaData>;
    updateAvailable?: boolean;
} ) => {
    const store = useCreateStore();
    for ( const [ folder, data ] of controls ) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useControls( folder, data as unknown as Schema, { store } );
    }

    const pluginApiVersion = getPluginAPIVersion( pluginPackage );

    return (
        <ErrorBoundary message="There was an error with this plugin">
            <Tabs
                defaultSelectedIndex={_globalLastTab}
                onChange={( tab ) => {
                    _globalLastTab = tab;
                }}>
                <Tab label="Info">
                    <div style={{ marginTop: "1rem" }}>
                        {semver.major( HostApiVersion ) <
                            semver.major( pluginApiVersion ) && (
                            <p>
                                ⚠️ This plugin is out of date. Titan Reactor Plugin API
                                is {HostApiVersion} and this plugin API version
                                is {pluginApiVersion}
                            </p>
                        )}
                        {updateAvailable && (
                            <p>⚠️ An update is available for this plugin.</p>
                        )}
                        {pluginPackage.name?.startsWith( "@titan-reactor-plugins/" ) && (
                            <div style={{ marginTop: "1rem" }}>
                                ✅ This is an official plugin.
                            </div>
                        )}
  
                        <p>
                            <span style={{ fontWeight: "bold" }}>Version:</span>{" "}
                            {pluginPackage.version}
                        </p>
                        {pluginPackage.description && (
                            <p>
                                <span style={{ fontWeight: "bold" }}>Description:</span>{" "}
                                {pluginPackage.description}
                            </p>
                        )}
                        {pluginPackage.author && (
                            <p>
                                <span style={{ fontWeight: "bold" }}>Author:</span>{" "}
                                {typeof pluginPackage.author === "string" ? (
                                    pluginPackage.author
                                ) : (
                                    <>
                                        {pluginPackage.author.name}{" "}
                                        {pluginPackage.author.email &&
                                            `<${pluginPackage.author.email}>`}
                                    </>
                                )}
                            </p>
                        )}
                        <p>
                            <span style={{ fontWeight: "bold" }}>Name:</span>{" "}
                            {pluginPackage.name ??
                                "error: name is required in plugin.json"}
                        </p>
                        {pluginPackage.date && (
                            <p>
                                <span style={{ fontWeight: "bold" }}>
                                    Date Published:
                                </span>
                                {new Intl.DateTimeFormat( "en-US" ).format(
                                    pluginPackage.date
                                )}
                            </p>
                        )}
                        {pluginPackage.repository && (
                            <p>
                                <span style={{ fontWeight: "bold" }}>Repository:</span>
                                {typeof pluginPackage.repository === "string" ? (
                                    pluginPackage.repository
                                ) : (
                                    <>
                                        {pluginPackage.repository.type}{" "}
                                        {pluginPackage.repository.url &&
                                            `<${pluginPackage.repository.url}>`}
                                    </>
                                )}
                            </p>
                        )}
                    </div>
                    {pluginPackage.readme && (
                        <div style={{ marginTop: "1rem" }}>
                            <ReactMarkdown>{pluginPackage.readme}</ReactMarkdown>
                        </div>
                    )}
                </Tab>
                <Tab label="Configure">{createLevaPanel( store )}</Tab>
            </Tabs>
        </ErrorBoundary>
    );
};
