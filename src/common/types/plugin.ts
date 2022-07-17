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

export interface InitializedPluginPackage extends PluginPackage {
    nativeSource?: string | null;
    path: string;
    date?: Date;
    readme?: string;
    hasUI: boolean;
}
