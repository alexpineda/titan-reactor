declare const __static: string;
declare module "postprocessing";
declare module "scm-extractor";


declare module "*!worker" {

    class Worker {
        postMessage(message: {}, transferList?: any[]): void;
        onmessage?: (message: { data: any; }) => void;
        terminate(): void;
    }
    export default Worker;
}

declare module "downgrade-replay" {

    export class CommandsStream {
        generate(): IterableIterator<any>;
    }
}