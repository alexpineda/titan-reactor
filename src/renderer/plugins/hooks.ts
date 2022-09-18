export const HOOK_ON_PLUGINS_DISPOSED = "onPluginsDisposed";
export const HOOK_ON_PLUGINS_READY = "onPluginsReady";
export const HOOK_ON_UNIT_CREATED = "onUnitCreated";
export const HOOK_ON_UNIT_KILLED = "onUnitDestroyed";
export const HOOK_ON_FRAME_RESET = "onFrameReset";
export const HOOK_ON_TECH_COMPLETED = "onTechCompleted";
export const HOOK_ON_UPGRADE_COMPLETED = "onUpgradeCompleted";
export const HOOK_ON_UNITS_SELECTED = "onUnitsSelected";


export const createDefaultHooks = () => ({
    [HOOK_ON_PLUGINS_DISPOSED]: new Hook(HOOK_ON_PLUGINS_DISPOSED, []),
    [HOOK_ON_PLUGINS_READY]: new Hook(HOOK_ON_PLUGINS_READY, [], { async: true }),
    [HOOK_ON_UNIT_CREATED]: new Hook(HOOK_ON_UNIT_CREATED, ["unit"]),
    [HOOK_ON_UNIT_KILLED]: new Hook(HOOK_ON_UNIT_KILLED, ["unit"]),
    [HOOK_ON_FRAME_RESET]: new Hook(HOOK_ON_FRAME_RESET, []),
    [HOOK_ON_UPGRADE_COMPLETED]: new Hook(HOOK_ON_UPGRADE_COMPLETED, ["upgrade"]),
    [HOOK_ON_UNITS_SELECTED]: new Hook(HOOK_ON_UNITS_SELECTED, ["units"]),
    [HOOK_ON_TECH_COMPLETED]: new Hook(HOOK_ON_TECH_COMPLETED, ["tech"]),
});


type InternalHookOptions = {
    postFn?: Function;
    async?: boolean;
    hookAuthorPluginId?: string
}

// plugins may register their own custom hooks
export class Hook {
    readonly args: string[];
    readonly name: string;
    #opts: InternalHookOptions;

    constructor(name: string, args: string[], opts: InternalHookOptions = {}) {
        this.name = name;
        this.args = args;
        this.#opts = opts;
    }

    isAsync() {
        return this.#opts.async;
    }

    isAuthor(id: string) {
        return this.#opts.hookAuthorPluginId === id;
    }

}