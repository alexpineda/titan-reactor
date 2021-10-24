import invertObj from "../utils/invertObj";
export const unitSize = {
  Independent: 0,
  small: 1,
  medium: 2,
  large: 3,
};

export const unitSizeById = invertObj(unitSize);
