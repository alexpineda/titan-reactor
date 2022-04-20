import BufferList from "bl";
import zlib from "zlib";
import pkware from "pkware-wasm";
import { Writable, Readable } from "stream";
import range from "common/utils/range";

export const MAX_CHUNK_SIZE = 0x2000;

export const inflate = async (buf: Buffer) => {
  if (buf.readUInt8(0) !== 0x78) {
    return pkware.explode(buf);
  }

  return new Promise((res) => {
    new Readable({
      read: function () {
        this.push(buf);
        this.push(null);
      },
    })
      .pipe(zlib.createInflate())
      .pipe(
        new Writable({
          write(inf: any, _: any, done: any) {
            res(inf);
            done();
          },
        })
      );
  });
};

export const deflate = async (buf: Buffer) => {
  return pkware.implode(buf, pkware.ImplodeDictSize1);
};

export const readBlock = async (buf: BufferList, blockSize: number) => {
  if (blockSize === 0) {
    console.warn("block size 0");
    return Buffer.alloc(0);
  }
  const checksum = buf.readUInt32LE(0);
  const chunkCount = buf.readUInt32LE(4);
  buf.consume(8);

  const expectedChunks = Math.ceil(blockSize / MAX_CHUNK_SIZE);
  if (chunkCount !== expectedChunks) {
    throw new Error(`Expected ${expectedChunks} chunks, got ${chunkCount}`);
  }
  const chunks: { buf: Buffer }[] = [];

  const actualBlockSize = range(0, chunkCount).reduce((pos: number) => {
    const chunkSize = buf.readUInt32LE(pos);
    buf.consume(4);

    chunks.push({
      buf: buf.slice(pos, pos + chunkSize),
    });

    return pos + chunkSize;
  }, 0);

  buf.consume(actualBlockSize);

  const isDeflated = actualBlockSize < blockSize;

  let deflated = await Promise.all(
    chunks.map((chunk) => (isDeflated ? inflate(chunk.buf) : chunk.buf))
  );

  const result: BufferList = deflated.reduce(
    (buf, chunk) => buf.append(chunk),
    new BufferList()
  );

  if (result.length != blockSize)
    throw new Error(`read bytes, expected:${blockSize} got:${result.length}`);

  const calcChecksum = pkware.crc32(result.slice(0));
  if (calcChecksum !== checksum) {
    throw new Error(`crc32 mismatch expected:${checksum} got:${calcChecksum}`);
  }

  return result.slice(0);
};

export const getBlockSize = async (data: Buffer) => {
  const numChunks = Math.ceil(data.length / MAX_CHUNK_SIZE);
  let outBlockSize = 0;

  for (let i = 0; i < numChunks; i++) {
    const chunk = data.slice(
      i * MAX_CHUNK_SIZE,
      i * MAX_CHUNK_SIZE + Math.min(MAX_CHUNK_SIZE, data.length)
    );
    const chunkOut = await deflate(chunk);
    outBlockSize = outBlockSize + chunkOut.byteLength;
  }

  return outBlockSize;
};

export const writeBlock = async (out: BufferList, data: Buffer, compress: boolean) => {
  const numChunks = Math.ceil(data.length / MAX_CHUNK_SIZE);
  let checksum = pkware.crc32(data.slice(0));
  let outBlockSize = 0;

  //@ts-ignore
  out.append(new Uint32Array([checksum]));
  //@ts-ignore
  out.append(new Uint32Array([numChunks]));

  for (let i = 0; i < numChunks; i++) {
    const chunk = data.slice(
      i * MAX_CHUNK_SIZE,
      i * MAX_CHUNK_SIZE + Math.min(MAX_CHUNK_SIZE, data.length)
    );
    const chunkOut = compress ? await deflate(chunk) : chunk;
    //@ts-ignore
    out.append(new Uint32Array([chunkOut.byteLength]));
    out.append(chunkOut);
    outBlockSize = outBlockSize + chunkOut.byteLength;
  }

  return outBlockSize;
};
