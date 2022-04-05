export interface Downgrader {
    chunkName: string;
    downgrade(buffer: Buffer): readonly [string, Buffer] | null;
}