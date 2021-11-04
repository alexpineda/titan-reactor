const BufferList = require("bl/BufferList");
const fs = require("fs");
const { tilesetNames } = require("../common");
const { uint16 } = require("../../util/alloc");
const range = require("../../util/range");
const {
  readCascFile,
  closeCascStorage,
  openCascStorage,
} = require("../../util/casc");

const MAX_VALUE = 65535;

const convert = async (bwPath) => {
  openCascStorage(bwPath);
  for (const tilesetName of tilesetNames) {
    const vx4exBuf = await readCascFile(`TileSet/${tilesetName}.vx4ex`);
    fs.writeFileSync(`./test/vx4.out/${tilesetName}.vx4ex`, vx4exBuf);

    const megatileData = new Uint32Array(vx4exBuf.buffer);
    console.log(tilesetName, megatileData.length);
    const vx4Buf = new BufferList();
    let zeros = false;
    for (const i of range(0, megatileData.length)) {
      const d = megatileData[i] > MAX_VALUE ? 0 : megatileData[i];
      if (megatileData[i] > MAX_VALUE) {
        console.error(`Invalid value ${megatileData[i]} at index ${i}`);
      }
      if (!zeros && megatileData[i]) {
        zeros = true;
      } else if (zeros && megatileData[i] === 0) {
        break;
      }
      vx4Buf.append(uint16(d));
    }
    fs.writeFileSync(`./test/vx4.out/${tilesetName}.vx4`, vx4Buf.slice(0));
    console.log("done");
  }
  closeCascStorage();
};

convert(process.argv[2] || "C:\\Program Files (x86)\\StarCraft");
