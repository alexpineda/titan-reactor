// import { globalEvents } from "@core/global-events"
import { usePluginsStore } from "@stores/plugins-store"
import { useMacroStore, useSettingsStore } from "@stores/settings-store"

// the main window attaches a deps object to the configuration window
// so that we can share the same store between the two windows and simplify things a bit

declare global {
    interface Window {
        deps: {
            useSettingsStore: typeof useSettingsStore,
            useMacroStore: typeof useMacroStore,
            usePluginsStore: typeof usePluginsStore,
            // globalEvents: typeof globalEvents,
        }
    }
}