import * as log from "@ipc/log";
import withErrorMessage from "common/utils/with-error-message";
import { testKey } from "../utils/key-utils";

//TODO: merge with camera-keys
export class PluginKeyShortcuts {
    #domElement: HTMLElement;
    #keyDownListenerInstance: (e: KeyboardEvent) => void;
    #listeners: { pluginId: string, key: string, fn: Function }[] = [];

    constructor(domElement: HTMLElement) {
        this.#domElement = domElement;
        this.#keyDownListenerInstance = this.#keyDownListener.bind(this);
        this.#domElement.addEventListener("keydown", this.#keyDownListenerInstance, {
            passive: true,
            capture: true,
        });
    }


    addListener(pluginId: string, key: string, fn: Function) {

        const idx = this.#listeners.findIndex(l => l.key === key && l.pluginId === pluginId);
        if (idx === -1) {
            this.#listeners.push({
                pluginId,
                key,
                fn,
            });
        } else {
            this.#listeners[idx].fn = fn;
        }
    }

    removeListener(fn: Function) {
        this.#listeners = this.#listeners.filter(l => l.fn !== fn);
    }

    clearListeners(pluginId: string) {
        this.#listeners = this.#listeners.filter(l => l.pluginId !== pluginId);
    }

    #keyDownListener(e: KeyboardEvent) {
        // test all registered plugin keys
        for (const listener of this.#listeners) {
            if (testKey(e, listener.key)) {
                try {
                    listener.fn();
                } catch (e) {
                    log.error(withErrorMessage(`Error in keyboard shortcut listener`, e));
                }
                break;
            }
        }
    }

    pressKey(code: string) {
        this.#keyDownListener(new KeyboardEvent("keydown", {
            code
        }))
    }

    dispose() {
        this.#domElement.removeEventListener("keydown", this.#keyDownListenerInstance);
    }
}