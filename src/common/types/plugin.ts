import { ScreenType } from ".";
import { ScreenStatus } from ".";

export interface PluginPackage {
    name: string;
    id: string;
    version: string;
    author?: string | {
        name?: string;
        email?: string;
        username?: string;
    };
    description?: string;
    repository?: string | { type?: string; url?: string };
    peerDependencies?: {
        [key: string]: string;
    },
    config?: {
        system?: {
            permissions?: string[]
        }
    }
}

export type ScreenData = {
    type: ScreenType;
    status: ScreenStatus;
}

export interface InitializedPluginPackage extends PluginPackage {
    nativeSource?: string | null;
    path: string;
    date?: Date;
    readme?: string;
    hasUI: boolean;
}
