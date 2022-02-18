export interface PluginConfig {
    url: string;
    name: string;
    src: string;
    author?: string;
    read: string[];
    write: string[];
    contentWindow?: Window | null;
}