import * as log from "@ipc/log";
import * as stores from "@stores";
import Janitor from "@utils/janitor";
import get from "lodash.get";
import { UseStore } from "zustand";

const blacklistStores = ["useSettingsStore"];

const isStore = (store: any): store is UseStore<any> => {
    return 'setState' in store;
}
class SubscribeWebComponent extends HTMLElement {
    private _janitor = new Janitor;

    constructor() {
        super();
    }

    private _getStore(storeKey: string): UseStore<any> | undefined {
        if (blacklistStores.includes(storeKey)) {
            log.error(`@titan-subscribe/web-component: ${storeKey} is not available for use.`);
            return;
        }

        const store = stores[storeKey as keyof typeof stores];

        if (isStore(store)) {
            return store;
        }
    }

    connectedCallback() {
        const storeKey = `use${this.getAttribute("store")}Store`;
        const store = this._getStore(storeKey);

        const valueKey = this.getAttribute("value") || "";

        if (store) {
            const initialState = store.getState();
            this.textContent = get(initialState, valueKey, "");

            const unsub = store.subscribe((values: any) => {
                this.textContent = get(values, valueKey, "");
            });
            this._janitor.callback(unsub);

        } else {
            log.error(`@titan-subscribe/web-component: failed to subscribe to store "${storeKey}"`);
        }
    }

    disconnectedCallback() {
        this._janitor.mopUp();
    }

}

customElements.define("titan-subscribe", SubscribeWebComponent);