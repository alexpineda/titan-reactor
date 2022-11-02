import packagejson from "../../../package.json";
import { PluginPackage } from "common/types";

export const getPluginAPIVersion = ( plugin: Partial<PluginPackage> ) => {
    return plugin.peerDependencies?.["titan-reactor-api"] ?? "0.0.0";
};

export const getAppAPIVersion = () => {
    return packagejson.config["titan-reactor-api"];
};

export const getAppVersion = () => {
    return packagejson.version;
};
