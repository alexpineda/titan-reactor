import { promises as fsPromises } from "fs";
import { Anim } from "titan-reactor-shared/image/anim";

const tnames = [
  "badlands",
  "platform",
  "install",
  "ashworld",
  "jungle",
  "desert",
  "ice",
  "twilight",
];

export default class AtlasPreloader {
  constructor(
    bwDat,
    bwDataPath,
    readFile,
    tileset,
    createAtlas,
    preloadAtlas = {}
  ) {
    this.bwDat = bwDat;
    this.bwDataPath = bwDataPath;
    this.readFile = readFile;
    this.tileset = tileset;
    this.tilesetName = tnames[tileset];

    this.createAtlas = createAtlas;
    this.preloadAtlas = preloadAtlas;
    this.palettes = null;

    this.refId = (id) => {
      if (this.sdAnim.sprites[id].refId !== undefined) {
        return this.sdAnim.sprites[id].refId;
      }
      return id;
    };

    this.readGrp = (id) =>
      readFile(`unit/${this.bwDat.images[id].grpFile.replace("\\", "/")}`);

    this.readSDAnim = (id) => ({
      ...this.sdAnim.sprites[this.refId(id)],
      buf: this.sdAnim.buf,
    });

    this.readAnim = (id) =>
      readFile(`anim/main_${`00${this.refId(id)}`.slice(-3)}.anim`);

    this.readAnimHD2 = (id) =>
      readFile(`HD2/anim/main_${`00${this.refId(id)}`.slice(-3)}.anim`);

    this.readGlb = (id) =>
      fsPromises
        .readFile(
          `${this.bwDataPath}/models/${`00${this.refId(id)}`.slice(-3)}.glb`
        )
        .then((file) => file)
        .catch(() => null);

    this.readNebula = (id) =>
      fsPromises
        .readFile(
          `${this.bwDataPath}/models/${`00${this.refId(id)}`.slice(-3)}.json`
        )
        .then((file) => file)
        .catch(() => null);
  }

  async init() {
    const buf = await this.readFile("SD/mainSD.anim");
    this.sdAnim = Anim(buf);
    this.sdAnim.buf = buf;
  }

  async load(imageId) {
    if (this.preloadAtlas[imageId]) {
      return;
    }
    this.preloadAtlas[imageId] = true;

    if (!this.palettes) {
      this.palettes = [
        await this.readFile(`tileset/${this.tilesetName}.wpe`),
        await fsPromises.readFile(`${__static}/palettes/ofire.wpe`),
        await fsPromises.readFile(`${__static}/palettes/gfire.wpe`),
        await fsPromises.readFile(`${__static}/palettes/bfire.wpe`),
        await fsPromises.readFile(`${__static}/palettes/bexpl.wpe`),
      ];
      this.palettes.dark = await fsPromises.readFile(
        `${__static}/palettes/dark.wpe`
      );
      this.palettes.cloak = await this.readFile(
        `tileset/${this.tilesetName}/trans50.pcx`
      );
    }

    const img = {
      imageDef: this.bwDat.images[imageId],
      readGrp: () => this.readGrp(imageId),
      readAnim: () => this.readAnim(imageId),
      readAnimHD2: () => this.readAnimHD2(imageId),
      readGlb: () => this.readGlb(imageId),
      glbFileName: `${this.bwDataPath}/models/${`00${this.refId(
        imageId
      )}`.slice(-3)}.glb`,
      readNebula: () => this.readNebula(imageId),
      palettes: this.palettes,
      sdAnim: this.readSDAnim(imageId),
    };

    const atlas = this.createAtlas();
    await atlas.load(img);
    this.preloadAtlas[imageId] = atlas;
  }
}
