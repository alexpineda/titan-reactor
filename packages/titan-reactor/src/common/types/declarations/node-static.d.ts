declare module "node-static" {
    export class Server {
        constructor(root: string);
        serve(req: any, res: any, cb?: (error: any, result: any) => void): void;
    }
}