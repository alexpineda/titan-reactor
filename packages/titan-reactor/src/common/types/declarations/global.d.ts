declare const __static: string;

declare module "*!worker" {

    class Worker {
        postMessage(message: {}, transferList?: any[]): void;
        onmessage?: (message: { data: any; }) => void;
        terminate(): void;
    }
    export default Worker;
}
