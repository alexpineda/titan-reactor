import invertObj from "../utils/invertObj";
export const shieldSize = {
  none: 0,
  small: 1,
  medium: 2,
  large: 3,
};

export const shieldSizeById = invertObj(shieldSize);
