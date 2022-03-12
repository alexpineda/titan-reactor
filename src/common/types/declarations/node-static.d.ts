declare module "node-static" {
    export class Server {
        constructor(root: string, options?: any);
        serve(req: any, res: any, cb?: (error: any, result: any) => void): void;
    }
}