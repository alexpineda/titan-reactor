import * as log from "@ipc/log";
import * as stores from "@stores";
import Janitor from "@utils/janitor";

const blacklistStores = ["useSettingsStore"];

class SubscribeWebComponent extends HTMLElement {
    private _janitor = new Janitor;

    constructor() {
        super();
    }

    connectedCallback() {
        const storeKey = `use${this.getAttribute("store")}Store`;
        if (blacklistStores.includes(storeKey)) {
            log.error(`@titan-subscribe/web-component: ${storeKey} is not available for use.`);
            return;
        }

        const valueKey = this.getAttribute("value") || "";
        const store = stores[storeKey as keyof typeof stores];

        if (store) {
            const unsub = store.subscribe((values: any) => {
                if (valueKey in values) {
                    if (typeof valueKey === "number" || typeof valueKey === "string") {
                        this.textContent = values[valueKey];
                    }
                }
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