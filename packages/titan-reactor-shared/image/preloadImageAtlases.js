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

let palettes;

export default async function preloadImageAtlases(
  bwDat,
  bwDataPath,
  readFile,
  tileset,
  imageIds,
  createAtlas,
  preloadAtlas = {}
) {
  if (imageIds.length === 0) {
    return;
  }

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
  const tilesetName = tnames[tileset];

  if (!palettes) {
    palettes = [
      await readFile(`tileset/${tilesetName}.wpe`),
      await fsPromises.readFile(`${__static}/palettes/ofire.wpe`),
      await fsPromises.readFile(`${__static}/palettes/gfire.wpe`),
      await fsPromises.readFile(`${__static}/palettes/bfire.wpe`),
      await fsPromises.readFile(`${__static}/palettes/bexpl.wpe`),
    ];
    palettes.dark = await fsPromises.readFile(`${__static}/palettes/dark.wpe`);
    palettes.cloak = await readFile(`tileset/${tilesetName}/trans50.pcx`);
  }

  const refId = (id) => (hdRefs[id] !== undefined ? hdRefs[id] : id);

  const readGrp = (id) =>
    readFile(`unit/${bwDat.images[id].grpFile.replace("\\", "/")}`);

  const readAnim = (id) =>
    readFile(`anim/main_${`00${refId(id)}`.slice(-3)}.anim`);

  const readGlb = (id) =>
    fsPromises
      .readFile(`${bwDataPath}/models/${`00${refId(id)}`.slice(-3)}.glb`)
      .then((file) => file)
      .catch(() => null);

  const readNebula = (id) =>
    fsPromises
      .readFile(`${bwDataPath}/models/${`00${refId(id)}`.slice(-3)}.json`)
      .then((file) => file)
      .catch(() => null);

  const imgs = imageIds.map((id) => ({
    imageDef: bwDat.images[id],
    readGrp: () => readGrp(id),
    readAnim: () => readAnim(id),
    readGlb: () => readGlb(id),
    glbFileName: `${bwDataPath}/models/${`00${refId(id)}`.slice(-3)}.glb`,
    readNebula: () => readNebula(id),
    palettes,
  }));

  for (let img of imgs) {
    if (!img || !img.imageDef) {
      debugger;
    }
    if (preloadAtlas[img.imageDef.index]) {
      continue;
    }
    const atlas = createAtlas();
    await atlas.load(img);
    preloadAtlas[img.imageDef.index] = atlas;
  }
  return preloadAtlas;
}
