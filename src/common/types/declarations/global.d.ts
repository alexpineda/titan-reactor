declare const __static: string;

declare module "*?worker" {
    class Worker {
        postMessage( message: object, transferList?: unknown[] ): void;
        onmessage?: ( message: { data: unknown } ) => void;
        terminate(): void;
    }
    export default Worker;
}

// vite inline import - web
declare module "*?raw" {
    const contents: string;
    export = contents;
}

// esbuild inline import - ui-server

declare module "inline:*" {
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

declare global {
    var THREE: typeof import("three");
    var postprocessing: typeof import("postprocessing");
    // ... other globals
}

declare interface Gtag {
    (command: 'config', targetId: string, config?: object): void;
    (command: 'set', config: object): void;
    (command: 'event', action: string, eventParams?: object): void;
}

declare const gtag: Gtag;