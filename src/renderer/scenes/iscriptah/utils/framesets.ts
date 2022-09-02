export const interactiveOpCodes = [
  "playfram",
  "playframtile",
  "engframe",
  "engset",
];

export const getDirectionalFrame = (cmd: any, cameraDirection: number) => {
  const frameset = Math.floor(cmd[1] / 17) * 17;

  if (cameraDirection > 16) {
    return [frameset + 32 - cameraDirection, true];
  } else {
    return [frameset + cameraDirection, false];
  }
};

export const areFrameSetsEnabled = (
  cmd: any,
  cmds: any,
  gfxTurns: boolean,
  blockFrameCount: number
) =>
  interactiveOpCodes.includes(cmd[0]) &&
  gfxTurns &&
  blockFrameCount > 17 &&
  //@ts-ignore
  !cmds.find(([op]) => op === "setfldirect");
