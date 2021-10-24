import invertObj from "../utils/invertObj";
export const drawFunctions = {
  normal: 0,
  overlayOnTarget: 1,
  enemyUnitCloak: 2,
  ownUnitCloak: 3,
  allyUnitCloak: 4,
  ownUnitCloak2: 5,
  ownUnitCloakDrawOnly: 6,
  crash: 7,
  empShockwave: 8,
  useRemapping: 9,
  rleShadow: 10,
  rleHpFloatDraw: 11,
  warpFlash: 12,
  rleOutline: 13,
  rlePlayerSide: 14,
  boundingRect: 15,
  hallucination: 16,
  warpFlash2: 17,
};

export const drawFunctionsById = invertObj(drawFunctions);
