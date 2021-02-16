import { promises as fsPromises } from "fs";

const hdRefs = {
  27: 11,
  90: 89,
  103: 102,
  104: 102,
  105: 102,
  115: 112,
  121: 118,
  125: 122,
  128: 126,
  133: 130,
  139: 137,
  143: 140,
  146: 144,
  150: 148,
  153: 151,
  154: 151,
  156: 155,
  159: 158,
  162: 161,
  165: 164,
  169: 167,
  172: 171,
  175: 174,
  180: 179,
  185: 183,
  187: 186,
  190: 189,
  193: 192,
  197: 195,
  201: 199,
  205: 204,
  209: 208,
  231: 228,
  242: 239,
  246: 239,
  275: 63,
  330: 329,
  345: 344,
  353: 140,
  366: 365,
  369: 368,
  381: 380,
  382: 380,
  398: 397,
  400: 399,
  402: 401,
  404: 403,
  436: 435,
  437: 435,
  438: 435,
  439: 435,
  442: 427,
  453: 452,
  454: 452,
  455: 452,
  456: 452,
  457: 452,
  462: 458,
  463: 459,
  464: 460,
  465: 461,
  469: 466,
  470: 467,
  471: 468,
  472: 450,
  473: 451,
  474: 452,
  475: 452,
  476: 452,
  477: 452,
  478: 452,
  479: 452,
  480: 458,
  481: 459,
  482: 460,
  483: 461,
  484: 458,
  485: 459,
  486: 460,
  487: 461,
  488: 466,
  489: 467,
  490: 468,
  491: 466,
  492: 467,
  493: 468,
  531: 530,
  542: 541,
  548: 547,
  552: 550,
  553: 551,
  554: 529,
  558: 557,
  559: 557,
  560: 445,
  583: 445,
  586: 584,
  587: 585,
  651: 643,
  739: 738,
  741: 740,
  743: 742,
  745: 744,
  751: 750,
  770: 769,
  832: 827,
  836: 823,
  838: 825,
  840: 834,
  842: 841,
  904: 895,
  906: 897,
  907: 898,
  909: 900,
  913: 140,
  921: 920,
  933: 129,
  942: 941,
  966: 532,
  968: 967,
  971: 970,
  985: 354,
  987: 986,
  988: 986,
  989: 986,
  991: 990,
  992: 990,
  993: 990,
  995: 994,
  996: 994,
  997: 994,
};

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

    this.refId = (id) => (hdRefs[id] !== undefined ? hdRefs[id] : id);

    this.readGrp = (id) =>
      readFile(`unit/${this.bwDat.images[id].grpFile.replace("\\", "/")}`);

    this.readAnim = (id) =>
      readFile(`anim/main_${`00${this.refId(id)}`.slice(-3)}.anim`);

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
      readGlb: () => this.readGlb(imageId),
      glbFileName: `${this.bwDataPath}/models/${`00${this.refId(
        imageId
      )}`.slice(-3)}.glb`,
      readNebula: () => this.readNebula(imageId),
      palettes: this.palettes,
    };

    const atlas = this.createAtlas();
    await atlas.load(img);
    this.preloadAtlas[imageId] = atlas;
  }
}
