import invertObj from "../../utils/invert-obj";

export const imageTypes = {
  gasOverlay: 430,
  depletedGasOverlay: 435,
  haloRocketTrail: 960,
};

export const imageTypesById = invertObj(imageTypes);
