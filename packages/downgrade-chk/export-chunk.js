const BufferList = require("bl");
const iconv = require("iconv-lite");

const Version = {
  Starcraft: 59,
  Hybrid: 63,
  SCR: 64,
  Broodwar: 205,
  BroodwarRemastered: 206,
};

const _chunkTypes = [
  "VER\x20",
  "VCOD",
  "OWNR",
  "ERA\x20",
  "DIM\x20",
  "SIDE",
  "MTXM",
  "PUNI",
  "UPGR",
  "PUPx",
  "PTEC",
  "PTEx",
  "UNIT",
  "TILE",
  "THG2",
  "MASK",
  "STR\x20",
  "STRx",
  "UPRP",
  "UPUS",
  "MRGN",
  "TRIG",
  "MBRF",
  "SPRP",
  "FORC",
  "WAV\x20",
  "UNIS",
  "UNIx",
  "UPGS",
  "UPGx",
  "TECS",
  "TECx",
  "COLR",
  "CRGB",
  "ISOM",
];

/*
ignoring sections:

"TYPE",
"IVER",
"IVE2",
"IOWN",
"ISOM",
"DD2\x20",
"SWNM",
*/

//OWNR, SIDE, FORC <- VCOD verification
const exportChunk = (buf, name) => {
  const bl = new BufferList(buf);
  const chunks = new Map();

  let pos = 0;
  while (pos >= 0 && bl.length - pos >= 8) {
    const chunkName = bl.toString("ascii", pos, pos + 4);
    const chunkDefinition = _chunkTypes.find((cname) => cname === chunkName);
    const chunkSize = bl.readInt32LE(pos + 4);

    if (!chunkDefinition || chunkSize === 0) {
      if (chunkSize === 0) {
        console.log(`zero chunk ${chunkName}`);
      }
      pos += chunkSize + 8;
      continue;
    }

    let buffer = null;
    if (chunkSize < 0) {
      buffer = bl.slice(pos + 8);
    } else {
      buffer = bl.slice(pos + 8, pos + 8 + chunkSize);
    }

    if (chunkName === "MTXM") {
      const previous = chunks.get("MTXM");
      if (previous) {
        if (previous.length > buffer.length) {
          buffer = Buffer.concat([buffer, previous.slice(buffer.length)]);
        }
      }
    }

    chunks.set(chunkName, buffer);
    pos += chunkSize + 8;
  }

  const chunk = chunks.get(name);
  return new Uint8Array(chunk.buffer);
};

module.exports = exportChunk;
