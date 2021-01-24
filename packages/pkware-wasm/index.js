const stormlibWasm = require("./dist/stormlib-js");
const crc32 = require("./dist/crc32");

const ImplodeDictSize1 = 1024;
const ImplodeDictSize2 = 2048;
const ImplodeDictSize3 = 4096;

let wasm;

function prepare(inBuffer) {
  return new Uint8Array(
    inBuffer.buffer.slice(
      inBuffer.byteOffset,
      inBuffer.byteOffset + inBuffer.byteLength
    )
  );
}

function implode(inBuffer, dictSize) {
  const srcArray = prepare(inBuffer);
  var inBuff = wasm._malloc(srcArray.byteLength);

  const dstArray = new Uint8Array(0x2000);
  var outBuff = wasm._malloc(dstArray.byteLength);

  const dstSizeArray = new Int32Array([0x2000]);
  var outSizeBuff = wasm._malloc(dstSizeArray.byteLength);

  wasm.HEAPU8.set(srcArray, inBuff);
  wasm.HEAPU8.set(dstArray, outBuff);
  wasm.HEAP32.set(dstSizeArray, outSizeBuff >> 2);

  if (dictSize === undefined) {
    if (srcArray.byteLength < 0x600) {
      dictSize = ImplodeDictSize1;
    } else if (0x600 <= srcArray.byteLength && srcArray.byteLength < 0xc00) {
      dictSize = ImplodeDictSize2;
    } else {
      dictSize = ImplodeDictSize3;
    }
  }
  wasm._Compress_PKLIB(
    outBuff,
    outSizeBuff,
    inBuff,
    srcArray.byteLength,
    dictSize
  );

  const finalSize = wasm.getValue(outSizeBuff, "i32");
  const finalBuffer = new Uint8Array(
    wasm.HEAPU8.subarray(outBuff, outBuff + finalSize)
  );
  wasm._free(inBuff);
  wasm._free(outSizeBuff);
  wasm._free(outBuff);

  return finalBuffer;
}

function explode(inBuffer) {
  const srcArray = prepare(inBuffer);
  var inBuff = wasm._malloc(srcArray.byteLength);

  const dstArray = new Uint8Array(0x2000);
  var outBuff = wasm._malloc(dstArray.byteLength);

  const dstSizeArray = new Int32Array([0x2000]);
  var outSizeBuff = wasm._malloc(dstSizeArray.byteLength);

  wasm.HEAPU8.set(srcArray, inBuff);
  wasm.HEAPU8.set(dstArray, outBuff);
  wasm.HEAP32.set(dstSizeArray, outSizeBuff >> 2);

  const result = wasm._Decompress_PKLIB(
    outBuff,
    outSizeBuff,
    inBuff,
    srcArray.byteLength
  );
  if (result === 0) {
    wasm._free(inBuff);
    wasm._free(outSizeBuff);
    wasm._free(outBuff);
    throw new Error("could not decompress data");
  }

  const finalSize = wasm.getValue(outSizeBuff, "i32");
  const finalBuffer = new Uint8Array(
    wasm.HEAPU8.subarray(outBuff, outBuff + finalSize)
  );
  wasm._free(inBuff);
  wasm._free(outSizeBuff);
  wasm._free(outBuff);

  return finalBuffer;
}

const loaded = new Promise((res, rej) => {
  stormlibWasm()
    .then((loadedModule) => {
      wasm = loadedModule;
      res();
    })
    .catch(rej);
});

module.exports = {
  implode,
  explode,
  loaded,
  ImplodeDictSize1,
  ImplodeDictSize2,
  ImplodeDictSize3,
  crc32,
};
