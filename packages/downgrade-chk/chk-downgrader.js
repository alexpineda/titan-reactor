const BufferList = require("bl");

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

const downgradeStrChunk = (strx) => {
  const numStrings = strx.readUInt32LE(0);
  const inHeaderSize = 4 + numStrings * 4;
  const outHeaderSize = 2 + numStrings * 2;
  const out = Buffer.alloc(outHeaderSize + (strx.byteLength - inHeaderSize), 0);
  out.writeUInt16LE(numStrings, 0);

  for (let i = 1; i < numStrings; i++) {
    const strxIndex = strx.readUInt32LE(i * 4);
    const strxBuf = strx.slice(strxIndex, strx.indexOf(0, strxIndex) + 1);

    if (strxBuf.byteLength === 0) {
      continue;
    }

    const outIndex = strxIndex - inHeaderSize + outHeaderSize;
    out.writeUInt16LE(outIndex, i * 2);
    strxBuf.copy(out, outIndex);
  }

  return out;
};

class ChkDowngrader {
  downgrade(buf) {
    const bl = new BufferList(buf);
    const chunks = [];

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

      chunks.push({ chunkName, chunkSize, pos: pos + 8, buffer });

      pos += chunkSize + 8;
    }

    const verChunk = chunks.find(({ chunkName }) => chunkName === "VER\x20");
    const version = buf.readUInt16LE(verChunk.pos);

    const downgrade =
      version === Version.SCR || version === Version.BroodwarRemastered;

    if (downgrade) {
      const strx = chunks.find(({ chunkName }) => chunkName === "STRx");

      const chunksToReplace = [
        "CRGB",
        "STRx",
        strx ? "STR\x20" : "NONE",
        "VER\x20",
        this.mtxmDowngrader ? "MTXM" : "NONE",
      ];

      const outChunks = chunks.filter(
        ({ chunkName }) => !chunksToReplace.includes(chunkName)
      );

      if (strx) {
        const strBuf = downgradeStrChunk(strx.buffer);
        outChunks.push({
          chunkName: "STR\x20",
          chunkSize: strBuf.byteLength,
          buffer: strBuf,
        });
      }

      const verBuf = Buffer.alloc(2);
      verBuf.writeUInt16LE(
        version === Version.SCR ? Version.Hybrid : Version.Broodwar,
        0
      );

      outChunks.push({
        chunkName: "VER\x20",
        chunkSize: 2,
        buffer: verBuf,
      });

      if (this.mtxmDowngrader) {
        // const mtxmBuf = Buffer.alloc(2);
      }

      const out = new BufferList();
      outChunks.forEach(({ chunkName, chunkSize, buffer }) => {
        const chunkHeader = Buffer.from(`${chunkName}    `);
        chunkHeader.writeUInt32LE(chunkSize, 4);
        out.append(chunkHeader);
        out.append(buffer);
      });

      return out.slice(0);
    } else {
      return buf;
    }
  }
}

module.exports = ChkDowngrader;
