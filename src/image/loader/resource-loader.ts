import { IndexedDBCache } from "./indexed-db-cache";
import { ResourceLoaderStatus } from "./resource-loader-status";

export class ResourceLoader {
    url = "";
    key = "";
    #status: ResourceLoaderStatus = "idle";
    buffer: Buffer | null = null;
    onStatusChange: (status: ResourceLoaderStatus) => void = () => {};
    #abortController: AbortController | null = null;
    protected cache?: IndexedDBCache;

    constructor(url: string, key = url, cache?: IndexedDBCache) {
        this.url = url;
        this.key = key;
        this.cache = cache;
    }

    get status() {
        return this.#status;
    }

    set status(status: ResourceLoaderStatus) {
        if (status === "cancelled") {
            this.#abortController = null;
        }
        this.#status = status;
        this.onStatusChange(status);
    }

    async fetch() {
        try {   
            this.status = "loading";
            this.buffer = null;
            const buffer = await this.cache?.getValue(this.key);
            if (buffer) {
                this.buffer = buffer;
                this.status = "loaded";
                return this.buffer;
            }
            this.#abortController = new AbortController();
            const arrayBuffer = await fetch(this.url, {
                signal: this.#abortController.signal,
            }).then((res) => res.arrayBuffer());
            this.buffer = Buffer.from(arrayBuffer);
            this.status = "loaded";
            await this.cache?.setValue({ id: this.key, buffer: arrayBuffer });
            return this.buffer;
        } catch (e) {
            if ((e as Error).name === "AbortError") {
                this.status = "cancelled";
            } else {
                console.error(e);
                this.status = "error";
            }
            return null;
        }
    }

    cancel() {
        if (this.#abortController) {
            this.#abortController.abort();
            this.#abortController = null;
        }
    }

}