import { ReadFile } from "common/types";

import parseDdsGrp from "../formats/parse-dds-grp";
import { generateWireframes } from "./generate-wireframes";
import { generateCursors } from "./generate-cursors";
import { generateCommandIcons } from "./generate-cmds";
import { generateRaceIcons } from "./generate-races";
import { generateResourceIcons } from "./generate-resources";
import { renderComposer } from "@render/render-composer";
import { RepeatWrapping } from "three";

export const generateAllIcons = async (readFile: ReadFile) => {

  renderComposer.preprocessStart();
  const renderer = renderComposer.getWebGLRenderer();

  const palette = new Uint8Array((await readFile("TileSet/jungle.wpe")).buffer).subarray(0, 1024);

  const gameIcons = await generateResourceIcons(
    renderer,
    parseDdsGrp(await readFile("game/icons.dds.grp"))
  );

  const cmdIcons = await generateCommandIcons(
    renderer,
    parseDdsGrp(await readFile("HD2/unit/cmdicons/cmdicons.dds.grp"))
  );

  const raceInsetIcons = await generateRaceIcons(
    renderer,
    parseDdsGrp(await readFile("glue/scoretd/iScore.dds.grp"))
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

  const b = async (f: string) => new Blob([(await readFile(f)).buffer], { type: "octet/stream" });

  const workerIcons = {
    apm: await b("webui/dist/lib/images/icon_apm.png"),
    terran: await b("webui/dist/lib/images/icon_worker_terran.png"),
    zerg: await b("webui/dist/lib/images/icon_worker_zerg.png"),
    protoss: await b("webui/dist/lib/images/icon_worker_protoss.png")
  };

  return {
    gameIcons,
    cmdIcons,
    raceInsetIcons,
    workerIcons,
    wireframeIcons,
    arrowIconsGPU,
    hoverIconsGPU,
    dragIconsGPU
  };
};
