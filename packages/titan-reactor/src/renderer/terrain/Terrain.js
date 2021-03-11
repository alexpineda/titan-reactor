import { WebGLRenderer } from "three";
import readDdsGrp from "titan-reactor-shared/image/ddsGrp";
import GameIcons from "titan-reactor-shared/map/GameIcons";
import {
  generateTileData,
  generateMesh,
} from "titan-reactor-shared/map/generateMap";
import MouseCursor from "../game/MouseCursor";

const toArrayBuffer = (nodeBuffer) => {
  return new Uint8Array(nodeBuffer).buffer;
};

class Terrain {
  constructor(readFile, chk, cache, anisotropy) {
    this.readFile = async (file, arrayBuffer = true) => {
      const buf = await readFile(file);
      return arrayBuffer ? toArrayBuffer(buf) : buf;
    };

    this.chk = chk;
    this.cache = cache;
    this.anisotropy = anisotropy;
  }

  async generate(options = {}) {
    options = Object.assign(
      {
        elevationLevels: [0, 0.05, 0.25, 0.25, 0.4, 0.4, 0.25],
        ignoreLevels: [0, 1, 0, 1, 0, 1, 0],
        normalizeLevels: true,
        displaceDimensionScale: 16,
        displaceVertexScale: 2,
        blendNonWalkableBase: true,
        firstPass: true,
        secondPass: true,
        processWater: true,
        displacementScale: 4,
        drawMode: { value: 0 },
        detailsMix: 0.05,
        bumpScale: 0.1,
        firstBlur: 4,
      },
      options
    );

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

    let mapTiles;
    //hitchhiker has odd length buffer??
    if (this.chk._tiles.byteLength % 2 === 1) {
      const tiles = Buffer.alloc(this.chk._tiles.byteLength + 1);
      this.chk._tiles.copy(tiles);
      mapTiles = new Uint16Array(toArrayBuffer(tiles));
    } else {
      mapTiles = new Uint16Array(toArrayBuffer(this.chk._tiles));
    }

    const tilesetName = tilesets[tileset];
    const tilegroupArrayBuffer = await this.readFile(
      `TileSet/${tilesetName}.cv5`
    );

    const tilegroupU16 = new Uint16Array(tilegroupArrayBuffer);
    const tilegroupBuf = Buffer.from(tilegroupArrayBuffer);
    const megatiles = new Uint32Array(
      await this.readFile(`TileSet/${tilesetName}.vx4ex`)
    );
    const minitilesFlags = new Uint16Array(
      await this.readFile(`TileSet/${tilesetName}.vf4`)
    );
    const minitiles = new Uint8Array(
      await this.readFile(`TileSet/${tilesetName}.vr4`)
    );
    const palette = new Uint8Array(
      await this.readFile(`TileSet/${tilesetName}.wpe`)
    ).slice(0, 1024);
    const hdTiles = readDdsGrp(
      await this.readFile(`TileSet/${tilesetName}.dds.vr4`, false),
      true
    );
    const creepGrpHD = readDdsGrp(
      await this.readFile(`TileSet/${tilesetName}.dds.grp`, false),
      false
    );
    const creepGrpSD = await this.readFile(`TileSet/${tilesetName}.grp`, false);

    const renderer = new WebGLRenderer({
      depth: false,
      stencil: false,
      alpha: true,
    });
    renderer.autoClear = false;

    const mapData = await generateTileData(
      renderer,
      this.chk.size[0],
      this.chk.size[1],
      {
        mapTiles,
        megatiles,
        minitilesFlags,
        minitiles,
        palette,
        tileset,
        hdTiles,
        tilegroupU16,
        tilegroupBuf,
        creepGrpSD,
        creepGrpHD,
        options,
      }
    );

    // yeah we should probably move this to somewhere but its most convenient here atm
    const gameIcons = new GameIcons();
    gameIcons.renderResourceIcons(
      renderer,
      readDdsGrp(await this.readFile("game/icons.dds.grp", false), true)
    );

    const cmdIcons = new GameIcons();
    cmdIcons.renderCmdIcons(
      renderer,
      readDdsGrp(
        await this.readFile("unit/cmdicons/cmdicons.dds.grp", false),
        true
      )
    );

    const raceInsetIcons = new GameIcons();
    raceInsetIcons.renderRaceInset(
      renderer,
      readDdsGrp(
        await this.readFile("glue/scoretd/iScore.dds.grp", false),
        true
      )
    );

    const arrowIcons = new GameIcons();
    await arrowIcons.renderCursor(
      await this.readFile("cursor/arrow.grp", false),
      palette
    );

    const hoverIcons = new GameIcons();
    await hoverIcons.renderCenteredCursor(
      await this.readFile("cursor/MagY.grp", false),
      palette
    );

    const dragIcons = new GameIcons();
    await dragIcons.renderCenteredCursor(
      await this.readFile("cursor/Drag.grp", false),
      palette
    );

    const workerIcons = {
      apm: `data:image/png;base64,${(
        await this.readFile("webui/dist/lib/images/icon_apm.png", false)
      ).toString("base64")}`,
      terran: `data:image/png;base64,${(
        await this.readFile(
          "webui/dist/lib/images/icon_worker_terran.png",
          false
        )
      ).toString("base64")}`,
      zerg: `data:image/png;base64,${(
        await this.readFile("webui/dist/lib/images/icon_worker_zerg.png", false)
      ).toString("base64")}`,
      protoss: `data:image/png;base64,${(
        await this.readFile(
          "webui/dist/lib/images/icon_worker_protoss.png",
          false
        )
      ).toString("base64")}`,
    };

    const cursor = new MouseCursor(
      arrowIcons.icons,
      hoverIcons.icons,
      dragIcons.icons
    );

    const [sd, hd, d, creep, creepEdges, minimapCanvas] = await generateMesh(
      renderer,
      mapData
    );
    // sd.matrixAutoUpdate = false;
    // sd.updateMatrix();
    // hd.matrixAutoUpdate = false;
    // hd.updateMatrix();

    renderer.dispose();
    return [
      sd,
      hd,
      d,
      creep,
      creepEdges,
      gameIcons,
      cmdIcons.icons,
      raceInsetIcons,
      workerIcons,
      minimapCanvas,
      cursor,
    ];
  }
}

export default Terrain;
