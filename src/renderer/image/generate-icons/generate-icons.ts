import { ReadFile } from "common/types";

import parseDdsGrp from "../formats/parse-dds-grp";
import generateWireframes from "./generate-wireframes";
import { generateCursors, generateCursorsDataURI } from "./generate-cursors";
import generateCmdIcons from "./generate-cmds";
import generateRaceInsetIcons from "./generate-races";
import generateResourceIcons from "./generate-resources";
import { renderComposer } from "@render/render-composer";
import { RepeatWrapping } from "three";

export const generateAllIcons = async (readFile: ReadFile) => {

  renderComposer.preprocessStart();
  const renderer = renderComposer.getWebGLRenderer();

  const palette = new Uint8Array((await readFile("TileSet/jungle.wpe")).buffer).subarray(0, 1024);

  const gameIcons = generateResourceIcons(
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

  const arrowIcons = await generateCursorsDataURI(
    await readFile("cursor/arrow.grp"),
    palette
  );

  const arrowIconsGPU = (await generateCursors(
    await readFile("cursor/arrow.grp"),
    palette
  ));

  arrowIconsGPU.texture.wrapS = arrowIconsGPU.texture.wrapT = RepeatWrapping;

  const hoverIconsGPU = (await generateCursors(
    await readFile("cursor/MagY.grp"),
    palette
  ));

  hoverIconsGPU.texture.wrapS = hoverIconsGPU.texture.wrapT = RepeatWrapping;

  const dragIconsGPU = (await generateCursors(
    await readFile("cursor/Drag.grp"),
    palette
  ));

  dragIconsGPU.texture.wrapS = dragIconsGPU.texture.wrapT = RepeatWrapping;

  const wireframeIcons = await generateWireframes(
    renderer,
    parseDdsGrp(await readFile("HD2/unit/wirefram/wirefram.dds.grp"))
  );

  renderComposer.preprocessEnd();

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
    gameIcons,
    cmdIcons,
    raceInsetIcons,
    workerIcons,
    arrowIcons,
    wireframeIcons,
    arrowIconsGPU,
    hoverIconsGPU,
    dragIconsGPU
  };
};
