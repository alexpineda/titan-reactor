import invertObj from "../../utils/invert-obj";

export const unitSize = {
  Independent: 0,
  small: 1,
  medium: 2,
  large: 3,
};

export const unitSizeById = invertObj(unitSize);
