import readDdsGrp from "titan-reactor-shared/image/ddsGrp";
import {
  generateTileData,
  generateMesh,
} from "titan-reactor-shared/map/generateMap";

class Terrain {
  constructor(readFile, chk, cache, anisotropy) {
    this.readFile = readFile;
    this.chk = chk;
    this.cache = cache;
    this.anisotropy = anisotropy;
  }

  async generate(
    options = {
      elevationLevels: [0, 0.05, 0.25, 0.25, 0.4, 0.4, 0.25],
      ignoreLevels: [0, 1, 0, 1, 0, 0, 1, 0, 0],
      normalizeLevels: true,
      displaceDimensionScale: 3,
      displaceVertexScale: 2,
      blendNonWalkableBase: true,
      firstPass: true,
      secondPass: true,
      processWater: true,
      displacementScale: 5,
      drawMode: { value: 0 },
      detailsMix: 0.05,
      bumpScale: 0.1,
    }
  ) {
    const tilesets = [
      "badlands",
      "platform",
      "install",
      "ashworld",
      "jungle",
      "desert",
      "ice",
      "twilight",
    ];

    const tileset = this.chk.tileset;

    const mapTiles = new Uint16Array(this.chk.section("MTXM"));

    const tilesetName = tilesets[tileset];
    const tilegroupArrayBuffer = await this.readFile(`/${tilesetName}.cv5`);

    const tilegroup = new Uint16Array(tilegroupArrayBuffer);
    const tilegroupBuf = Buffer.from(tilegroupArrayBuffer);
    const megatiles = new Uint32Array(
      await this.readFile(`/${tilesetName}.vx4ex`)
    );
    const minitilesFlags = new Uint16Array(
      await this.readFile(`/${tilesetName}.vf4`)
    );
    const minitiles = new Uint8Array(
      await this.readFile(`/${tilesetName}.vr4`)
    );
    const palette = new Uint8Array(await this.readFile(`/${tilesetName}.wpe`));
    const hdTiles = readDdsGrp(
      await this.readFile(`/${tilesetName}.dds.vr4`),
      true
    );

    const mapData = generateTileData(
      renderer,
      this.chk.size[0],
      this.chk.size[1],
      mapTiles,
      megatiles,
      minitilesFlags,
      minitiles,
      palette,
      tileset,
      hdTiles,
      tilegroup,
      tilegroupBuf,
      options
    );

    return generateMesh(renderer, mapData);
  }
}

export default Terrain;
