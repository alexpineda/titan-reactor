export const interactiveOpCodes = [
  "playfram",
  "playframtile",
  "engframe",
  "engset",
];

export const getDirectionalFrame = (cmd, cameraDirection) => {
  const frameset = Math.floor(cmd[1] / 17) * 17;

  if (cameraDirection > 16) {
    return [frameset + 32 - cameraDirection, true];
  } else {
    return [frameset + cameraDirection, false];
  }
};

export const areFrameSetsEnabled = (
  cmd,
  cmds,
  selectedBlock,
  blockFrameCount
) =>
  interactiveOpCodes.includes(cmd[0]) &&
  selectedBlock.image.gfxTurns &&
  blockFrameCount > 17 &&
  !cmds.find(([op]) => op === "setfldirect");