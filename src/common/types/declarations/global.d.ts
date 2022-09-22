declare const __static: string;

declare module "*!worker" {

    class Worker {
        postMessage(message: {}, transferList?: any[]): void;
        onmessage?: (message: { data: any; }) => void;
        terminate(): void;
    }
    export default Worker;
}

declare module '*.frag' {
    const contents: string;
    export = contents
}

declare module '*.vert' {
    const contents: string;
    export = contents
}

declare module '*.glsl' {
    const contents: string;
    export = contents
}

declare module '!!raw-loader!*' {
    const contents: string;
    export = contents
}

declare module '*.svg' {
    const contents: string;
    export = contents
}

declare module '*.png' {
    const contents: string;
    export = contents
}


interface NodeModule {
    hot?: {
        accept: (dependencies?: string | string[], callback?: () => void, errorHandler?: (error: Error, info: { moduleId: string, dependencyId: string }) => void) => void;
    };
}