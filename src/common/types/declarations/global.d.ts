declare const __static: string;

declare module "*?worker" {
    class Worker {
        postMessage( message: object, transferList?: unknown[] ): void;
        onmessage?: ( message: { data: unknown } ) => void;
        terminate(): void;
    }
    export default Worker;
}

declare module "*?raw" {
    const contents: string;
    export = contents;
}
declare module "*.svg" {
    const contents: string;
    export = contents;
}

declare module "*.png" {
    const contents: string;
    export = contents;
}
