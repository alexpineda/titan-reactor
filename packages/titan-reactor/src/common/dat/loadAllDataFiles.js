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
import { parseLo } from "./parseLo";
import path from "path";
import { range } from "ramda";
import { Grp } from "bw-chk-modified/grp";

export async function loadAllDataFiles(readFile) {
  const iscript = parseIscript(await readFile("scripts/iscript.bin"));

  const imagesDat = new ImagesDAT(readFile);
  const images = await imagesDat.load();

  const los = [];
  for (let i = 0; i < imagesDat.stats.length; i++) {
    if (imagesDat.stats[i].includes(".lo")) {
      const fpath = path.join("unit/", imagesDat.stats[i].replace(/\\/g, "/"));
      los[i] = await parseLo(await readFile(fpath));
    }
  }
  const sprites = await new SpritesDAT(readFile, images).load();
  const flingy = await new FlingyDAT(readFile, sprites).load();
  const weapons = await new WeaponsDAT(readFile, flingy).load();
  const sounds = await new SoundsDAT(readFile).load();

  const units = await new UnitsDAT(readFile, images, flingy, sounds).load();

  const tech = await new TechDataDAT(readFile).load();
  const upgrades = await new UpgradesDAT(readFile).load();
  const orders = await new OrdersDAT(readFile).load();

  const bufs = await Promise.all(
    images.map((image) => readFile(`unit/${image.grpFile.replace(/\\/g, "/")}`))
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
    iscript,
    sounds,
    tech,
    upgrades,
    orders,
    units,
    images,
    los,
    sprites,
    weapons,
    grps,
  };
}
