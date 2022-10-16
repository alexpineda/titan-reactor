declare module "pkware-wasm" {
    export function explode( buf: Buffer ): Buffer;
    export function implode( buf: Buffer, dictSize?: number ): Buffer;
    export function crc32( buf: Buffer ): number;

    export const ImplodeDictSize1 = 1024;
    export const ImplodeDictSize2 = 2048;
    export const ImplodeDictSize3 = 4096;
}
