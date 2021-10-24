import invertObj from "../../utils/invertObj";

export const overlayTypes = {
  attackOverlay: 0,
  damageOverlay: 1,
  specialOverlay: 2,
  landingDust: 3,
  liftOffDust: 4,
  shieldOverlay: 5,
};

export const overlayTypesById = invertObj(overlayTypes);
