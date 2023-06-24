export { version as AppVersion } from "../../../package.json";
export { version as HostApiVersion } from "../../../build/api-types/host/package.json";

import { PluginPackage } from "common/types";

export const getPluginAPIVersion = (plugin: Partial<PluginPackage>) => {
    return plugin.peerDependencies?.["titan-reactor-api"] ?? "0.0.0";
};