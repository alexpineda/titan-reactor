export default (bwDat, image, unit = null) => {
  const getAllImages = (imageDef) => {
    let s = new Set();
    s.add(imageDef.index);

    if (!imageDef.iscript) {
      return s;
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

              s = new Set([...s, ...getAllImages(img)]);
            }
            break;
          case "imgulnextid":
            {
              const img = bwDat.images[imageDef.index + 1];
              s = new Set([...s, ...getAllImages(img)]);
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
              s = new Set([...s, ...getAllImages(img)]);
            }
            break;
          case "creategasoverlays":
            {
              s = new Set([
                ...s,
                430,
                431,
                432,
                433,
                434,
                435,
                436,
                437,
                438,
                439,
              ]);
            }
            break;
        }
      }
    }
    return s;
  };

  let preload = getAllImages(image);

  if (unit) {
    if (
      unit.groundWeapon !== 130 &&
      bwDat.weapons[unit.groundWeapon].flingy.sprite.image.index > 0
    ) {
      preload = new Set([
        ...preload,
        ...getAllImages(bwDat.weapons[unit.groundWeapon].flingy.sprite.image),
      ]);
    }

    if (
      unit.airWeapon !== 130 &&
      bwDat.weapons[unit.airWeapon].flingy.sprite.image.index > 0
    ) {
      preload = new Set([
        ...preload,
        ...getAllImages(bwDat.weapons[unit.airWeapon].flingy.sprite.image),
      ]);
    }

    if (unit.constructionAnimation.index > 0) {
      preload = new Set([
        ...preload,
        ...getAllImages(unit.constructionAnimation),
      ]);
    }
  }
  return preload;
};
