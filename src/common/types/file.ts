export type ReadFile = ( filename: string ) => Promise<Buffer>;

export type CloseCascStorage = ( bwPath: string ) => void;
export type ReadCascFile = (
    bwPath: string,
    encoding?: BufferEncoding
) => Promise<Buffer>;
export type ReadCascFileBatch = (
    bwPath: string[],
    encoding?: BufferEncoding
) => Promise<Buffer[]>;
export type FindCascFiles = ( bwPath: string ) => Promise<string[]>;
