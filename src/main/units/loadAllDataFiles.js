import parseIscript from "iscript";
import { SoundsDAT } from "./SoundsDAT";
import { SpritesDAT } from "./SpritesDAT";
import { FlingyDAT } from "./FlingyDAT";
import { TechDataDAT } from "./TechDataDAT";
import { UpgradesDAT } from "./UpgradesDAT";
import { OrdersDAT } from "./OrdersDAT";
import { ImagesDAT } from "./ImagesDAT";
import { WeaponsDAT } from "./WeaponsDAT";
import { UnitsDAT } from "./UnitsDAT";
import { openFileBinary, openFileLines, searchFiles } from "../fs";
import { parseLo } from "./parseLo";
import path from "path";
import { range } from "ramda";
import { Grp } from "../../../libs/bw-chk/grp";

export async function loadAllDataFiles(bwDataPath) {
  const iscript = parseIscript(
    await openFileBinary(`${bwDataPath}/scripts/iscript.bin`)
  );

  const loFiles = await searchFiles(`${bwDataPath}/unit/`, ".lo");
  let los = [];
  for (let loFile of loFiles) {
    const key = loFile.replace(path.join(`${bwDataPath}/unit/`), "");
    los[key] = await parseLo(await openFileBinary(loFile));
  }

  const images = await new ImagesDAT(bwDataPath).load();
  const sprites = await new SpritesDAT(bwDataPath, images).load();
  const flingy = await new FlingyDAT(bwDataPath, sprites).load();
  const weapons = await new WeaponsDAT(bwDataPath, flingy).load();
  const units = await new UnitsDAT(bwDataPath, images, flingy, weapons).load();

  const sounds = await new SoundsDAT(bwDataPath).load();
  const tech = await new TechDataDAT(bwDataPath).load();
  const upgrades = await new UpgradesDAT(bwDataPath).load();
  const orders = await new OrdersDAT(bwDataPath).load();

  const bufs = await Promise.all(
    images.map((image) => openFileBinary(`${bwDataPath}/unit/${image.grpFile}`))
  );

  const grps = bufs.map((buf) => {
    const grp = new Grp(buf, Buffer);
    const frames = range(0, grp.frameCount()).map((frame) => {
      const { x, y, w, h } = grp.header(frame);
      return { x, y, w, h };
    });
    const maxFrameH = frames.reduce((max, { h }) => {
      return h > max ? h : max;
    }, 0);
    const maxFramew = frames.reduce((max, { w }) => {
      return w > max ? w : max;
    }, 0);

    return {
      ...grp.maxDimensions(),
      frames,
      maxFrameH,
      maxFramew,
    };
  });

  return {
    los,
    iscript,
    sounds,
    tech,
    upgrades,
    orders,
    units,
    images,
    weapons,
    grps,
  };
}
