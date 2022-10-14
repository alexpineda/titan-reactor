export const b2ba = (b: Buffer) => {
    if (b instanceof Buffer === false) {
        throw new Error("Not a buffer");
    }
    return new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
}