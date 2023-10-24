// import { globalEvents } from "@core/global-events"
import { useSettingsStore } from "@stores/settings-store"

// the main window attaches a deps object to the configuration window
// so that we can share the same store between the two windows and simplify things a bit

declare global {
    interface Window {
        deps: {
            useSettingsStore: typeof useSettingsStore,
            // globalEvents: typeof globalEvents,
        }
    }
}