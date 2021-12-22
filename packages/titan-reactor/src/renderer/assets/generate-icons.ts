import { ReadFile } from "../../common/types";
import { WebGLRenderer } from "three";

import parseDdsGrp from "../../common/image/formats/parse-dds-grp";
import generateWireframes from "../../common/image/generate-icons/generate-wireframes";
import generateCenteredCursors from "../../common/image/generate-icons/generate-centered-cursors";
import generateCursors from "../../common/image/generate-icons/generate-cursors";
import generateCmdIcons from "../../common/image/generate-icons/generate-cmds";
import generateRaceInsetIcons from "../../common/image/generate-icons/generate-races";
import generateResourceIcons from "../../common/image/generate-icons/generate-resources";

export default async (readFile: ReadFile) => {
  const renderer = new WebGLRenderer({
    depth: false,
    stencil: false,
    alpha: true,
  });
  renderer.autoClear = false;

  const files = [
    await readFile("TileSet/jungle.wpe"),
    await readFile("game/icons.dds.grp"),
    await readFile("HD2/unit/cmdicons/cmdicons.dds.grp"),
    await readFile("glue/scoretd/iScore.dds.grp"),
    await readFile("cursor/arrow.grp"),
    await readFile("cursor/MagY.grp"),
    await readFile("cursor/Drag.grp"),
    await readFile("HD2/unit/wirefram/wirefram.dds.grp"),
    await readFile("webui/dist/lib/images/icon_apm.png"),
    await readFile("webui/dist/lib/images/icon_worker_terran.png"),
    await readFile("webui/dist/lib/images/icon_worker_zerg.png"),
    await readFile("webui/dist/lib/images/icon_worker_protoss.png")
  ];

  const palette = new Uint8Array(files[0].buffer).subarray(0, 1024);

  const resourceIcons = generateResourceIcons(
    renderer,
    parseDdsGrp(files[1])
  );

  const cmdIcons = generateCmdIcons(
    renderer,
    parseDdsGrp(files[2])
  );

  const raceInsetIcons = generateRaceInsetIcons(
    renderer,
    parseDdsGrp(files[3])
  );

  const arrowIcons = await generateCursors(
    files[4],
    palette
  );

  const hoverIcons = await generateCenteredCursors(
    files[5],
    palette
  );

  const dragIcons = await generateCenteredCursors(
    files[6],
    palette
  );

  const wireframeIcons = await generateWireframes(
    renderer,
    parseDdsGrp(files[7])
  );

  renderer.dispose();


  const workerIcons = {
    apm: `data:image/png;base64,${(
      files[7]
    ).toString("base64")}`,
    terran: `data:image/png;base64,${(
      files[8]
    ).toString("base64")}`,
    zerg: `data:image/png;base64,${(
      files[9]
    ).toString("base64")}`,
    protoss: `data:image/png;base64,${(
      files[10]
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
