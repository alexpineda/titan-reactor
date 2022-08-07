import { ReadFile } from "common/types";
import { WebGLRenderer } from "three";

import parseDdsGrp from "../formats/parse-dds-grp";
import generateWireframes from "./generate-wireframes";
import generateCenteredCursors from "./generate-centered-cursors";
import generateCursors from "./generate-cursors";
import generateCmdIcons from "./generate-cmds";
import generateRaceInsetIcons from "./generate-races";
import generateResourceIcons from "./generate-resources";

export default async (readFile: ReadFile) => {
  const renderer = new WebGLRenderer({
    depth: false,
    stencil: false,
    alpha: true,
  });
  renderer.autoClear = false;

  const palette = new Uint8Array((await readFile("TileSet/jungle.wpe")).buffer).subarray(0, 1024);

  const resourceIcons = generateResourceIcons(
    renderer,
    parseDdsGrp(await readFile("game/icons.dds.grp"))
  );

  const cmdIcons = generateCmdIcons(
    renderer,
    parseDdsGrp(await readFile("HD2/unit/cmdicons/cmdicons.dds.grp"))
  );

  const raceInsetIcons = generateRaceInsetIcons(
    renderer,
    parseDdsGrp(await readFile("glue/scoretd/iScore.dds.grp"))
  );

  const arrowIcons = await generateCursors(
    await readFile("cursor/arrow.grp"),
    palette
  );

  const hoverIcons = await generateCenteredCursors(
    await readFile("cursor/MagY.grp"),
    palette
  );

  const dragIcons = await generateCenteredCursors(
    await readFile("cursor/Drag.grp"),
    palette
  );

  const wireframeIcons = await generateWireframes(
    renderer,
    parseDdsGrp(await readFile("HD2/unit/wirefram/wirefram.dds.grp"))
  );

  renderer.dispose();


  const workerIcons = {
    apm: `data:image/png;base64,${(
      await readFile("webui/dist/lib/images/icon_apm.png")
    ).toString("base64")}`,
    terran: `data:image/png;base64,${(
      await readFile("webui/dist/lib/images/icon_worker_terran.png")
    ).toString("base64")}`,
    zerg: `data:image/png;base64,${(
      await readFile("webui/dist/lib/images/icon_worker_zerg.png")
    ).toString("base64")}`,
    protoss: `data:image/png;base64,${(
      await readFile("webui/dist/lib/images/icon_worker_protoss.png")
    ).toString("base64")}`,
  };

  return {
    resourceIcons,
    cmdIcons,
    raceInsetIcons,
    workerIcons,
    arrowIcons,
    hoverIcons,
    dragIcons,
    wireframeIcons,
  };
};
