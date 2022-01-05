const BufferList = require("bl");
const { chunkTypes } = require("./common");

const PARTIAL_OVERWRITE = 0;

const chunkWrites = {
  MTXM: PARTIAL_OVERWRITE,
  STRx: PARTIAL_OVERWRITE,
  "STR\x20": PARTIAL_OVERWRITE,
  "ERA\x20": PARTIAL_OVERWRITE,
};

const getChkChunks = (buf) => {
  const bl = new BufferList(buf);

  const chunks = [];
  const chunkExists = (name) =>
    chunks.find(([chunkName]) => chunkName === name);

  let pos = 0;
  while (pos >= 0 && bl.length - pos >= 8) {
    const name = bl.toString("ascii", pos, pos + 4);
    const chunkDefinition = chunkTypes.find((cname) => cname === name);
    const size = bl.readInt32LE(pos + 4);

    if (!chunkDefinition || size === 0) {
      if (size === 0) {
        console.log(`zero chunk ${name}`);
      }
      pos += size + 8;
      continue;
    }

    let buffer = null;
    if (size < 0) {
      buffer = bl.slice(pos + 8 - size, size);
    } else {
      buffer = bl.slice(pos + 8, pos + 8 + size);
    }

    const writeType = chunkWrites[name];
    const previous = chunkExists(name);
    if (previous && writeType) {
      if (writeType === PARTIAL_OVERWRITE) {
        if (previous.length > buffer.length) {
          const newBuf = Buffer.concat([buffer, previous.slice(buffer.length)]);
          chunks.splice(chunks.indexOf(previous), 1, [name, newBuf]);
        }
        //@todo else?
      } else {
        chunks.splice(chunks.indexOf(previous), 1, [name, buffer]);
      }
    } else {
      chunks.push([name, buffer]);
    }

    pos += size + 8;
  }
  return chunks;
};

module.exports = { getChkChunks };
