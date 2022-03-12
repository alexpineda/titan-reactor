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
    const contents: { default: string }
    export = contents
}

declare module '*.vert' {
    const contents: { default: string }
    export = contents
}

declare module '*.glsl' {
    const contents: { default: string }
    export = contents
}