// Define an interface for your data
interface SCImageData {
    id: string;
    buffer: ArrayBuffer;
}

const DB_NAME = "titan-reactor";
const DB_VERSION = 1;

export class IndexedDBCache {
    #db: IDBDatabase | null = null;
    #storeName: string;
    enabled = true;

    constructor(storeName: string) {
        this.#storeName = storeName;
    }

    init() {
        return new Promise((resolve, reject) => {
            const openRequest = indexedDB.open(DB_NAME, DB_VERSION);

            // Create the schema
            openRequest.onupgradeneeded = () => {
                let db = openRequest.result;
                if (!db.objectStoreNames.contains(this.#storeName)) {
                    db.createObjectStore(this.#storeName, { keyPath: "id" });
                }
            };

            // Error handler
            openRequest.onerror = reject;

            // Success handler
            openRequest.onsuccess = () => {
                this.#db = openRequest.result;
                resolve(undefined);
            };
        });
    }

    clear() {
        return new Promise((resolve, reject) => {
            if (this.#db === null) {
                reject();
            }
            let tx = this.#db!.transaction(this.#storeName, "readwrite");
            let store = tx.objectStore(this.#storeName);
            let request = store.clear();
            request.onsuccess = resolve;
            request.onerror = reject;
        });
    }
    
    deleteValue(id: string) {
        return new Promise((resolve, reject) => {
            if (this.#db === null) {
                reject();
            }
            let tx = this.#db!.transaction(this.#storeName, "readwrite");
            let store = tx.objectStore(this.#storeName);
            let request = store.delete(id);
            request.onsuccess = resolve;
            request.onerror = reject;
        });
    }

    setValue(value: SCImageData) {
        return new Promise((resolve, reject) => {
            if (this.#db === null) {
                reject();
            }
            let tx = this.#db!.transaction(this.#storeName, "readwrite");
            let store = tx.objectStore(this.#storeName);
            let request = store.add(value);
            request.onsuccess = resolve;
            request.onerror = reject;
        });
    }

    getValue(id: string): Promise<Buffer | null> {
        return new Promise((resolve, reject) => {
            if (this.#db === null) {
                reject();
            }
            let tx = this.#db!.transaction(this.#storeName, "readonly");
            let store = tx.objectStore(this.#storeName);
            let request = store.get(id);
            request.onsuccess = () => {
                if (request.result === undefined) {
                    resolve(null);
                } else {
                    resolve(Buffer.from(request.result.buffer));
                }
            };
            request.onerror = () => {
                console.error(request.error);
                resolve(null);
            };
        });
    }
}