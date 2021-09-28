import { uniq } from "ramda";

const calculateImagesFromIScript = (
  bwDat,
  image,
  unit = null,
  preload = new Set()
) => {
  const getAllImages = (imageDef) => {
    // console.log(imageDef);
    preload.add(imageDef.index);

    if (!imageDef.iscript) {
      return;
    }
    const script = bwDat.iscript.iscripts[imageDef.iscript];
    for (let offset of script.offsets) {
      if (offset === 0) continue;
      for (let cmd of bwDat.iscript.animationBlocks[offset]) {
        const args = cmd[1];

        switch (cmd[0]) {
          case "imgul":
          case "imgol":
          case "imgolorig":
          case "imgoluselo":
          case "imguluselo":
          case "imguluselo":
            {
              const img = bwDat.images[args[0]];

              getAllImages(img);
            }
            break;
          case "imgulnextid":
            {
              const img = bwDat.images[imageDef.index + 1];
              getAllImages(img);
            }
            break;
          case "sprol":
          case "highsprol":
          case "lowsprul":
          case "spruluselo":
          case "sprul":
          case "sproluselo":
          case "lowsprul":
            {
              const img = bwDat.sprites[args[0]].image;
              getAllImages(img);
            }
            break;
          case "creategasoverlays":
            {
              [430, 431, 432, 433, 434, 435, 436, 437, 438, 439].forEach((v) =>
                preload.add(v)
              );
            }
            break;
        }
      }
    }
  };

  getAllImages(image);

  if (unit) {
    if (
      unit.groundWeapon !== 130 &&
      bwDat.weapons[unit.groundWeapon].flingy.sprite.image.index > 0
    ) {
      getAllImages(bwDat.weapons[unit.groundWeapon].flingy.sprite.image);
    }

    if (
      unit.airWeapon !== 130 &&
      bwDat.weapons[unit.airWeapon].flingy.sprite.image.index > 0
    ) {
      getAllImages(bwDat.weapons[unit.airWeapon].flingy.sprite.image);
    }

    if (unit.constructionAnimation.index > 0) {
      getAllImages(unit.constructionAnimation);
    }
  }
  return [...preload].filter((v) => v !== undefined);
};

export const calculateImagesFromUnitsIscript = (bwDat, unitIds) => {
  const preload = new Set();

  uniq(unitIds).forEach((id) => {
    const unit = bwDat.units[id];
    calculateImagesFromIScript(
      bwDat,
      bwDat.images[unit.flingy.sprite.image.index],
      unit,
      preload
    );
  });

  return [...preload].filter((v) => v !== undefined);
};

export const calculateImagesFromSpritesIscript = (bwDat, spriteIds) => {
  const preload = new Set();

  uniq(spriteIds).forEach((id) => {
    const sprite = bwDat.sprites[id];
    calculateImagesFromIScript(
      bwDat,
      bwDat.images[sprite.image.index],
      null,
      preload
    );
  });

  return [...preload].filter((v) => v !== undefined);
};

export default calculateImagesFromIScript;
