import { ResourceLoader } from "./resource-loader";

function concatenateArrayBuffers(arrayBuffers: ArrayBuffer[]) {
    // Step 2: Calculate Total Length
    const totalLength = arrayBuffers.reduce(
        (acc, arrayBuffer) => acc + arrayBuffer.byteLength,
        0
    );

    // Step 3: Create a New Uint8Array
    const result = new Uint8Array(totalLength);

    // Step 4: Copy Data
    let offset = 0;
    for (let arrayBuffer of arrayBuffers) {
        result.set(new Uint8Array(arrayBuffer), offset);
        offset += arrayBuffer.byteLength;
    }

    // Step 5: Convert to Buffer
    return Buffer.from(result);
}

export class ResourceIncrementalLoader extends ResourceLoader {
    chunkSize = 512* 1024;
    resourceSize = 0;
    #buffers: ArrayBuffer[] = [];
    start = 0;
    end = 0;
    #abortController: AbortController | null = null;

    override async fetch() {
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
            const headers = await fetch(this.url, {
                method: "HEAD",
                signal: this.#abortController.signal,
            }).then((res) => res.headers);
            if (headers.get("Content-Length") === null) {
                throw new Error("no content length");
            }
            this.resourceSize = Number(headers.get("Content-Length")!);
            this.#buffers.length = 0;
            this.start = 0;
            this.end = Math.min(this.start + this.chunkSize, this.resourceSize);
            return this.#fetchChunk(this.start, this.end);
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

    async #fetchChunk(start: number, end: number): Promise<Buffer | null> {
        try {
            const buffer = await fetch(this.url, {
                headers: {
                    Range: `bytes=${start}-${end}`,
                },
                signal: this.#abortController?.signal,
            }).then((res) => res.arrayBuffer());

            if (buffer.byteLength === 0) {
                throw new Error("empty buffer");
            }

            this.#buffers.push(buffer);

            this.start = end ;
            this.end = Math.min(this.start + this.chunkSize, this.resourceSize);

            if (this.start >= this.resourceSize) {
                this.buffer = concatenateArrayBuffers(this.#buffers);
                this.#buffers.length = 0;
                await this.cache?.setValue({ id: this.key, buffer: this.buffer.buffer });
                this.status = "loaded";
                return this.buffer;
            } else {
                return this.#fetchChunk(this.start, this.end);
            }
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
}
